from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from app.db.database import get_db
from app.models.domain import AccusedPerson, FIRAccusedLink
from app.schemas.api import AccusedResponse
from app.core.deps import get_current_user, Officer
from app.services.audit_service import AuditLoggerService

router = APIRouter(prefix="/accused", tags=["Accused & Criminal Intelligence"])

@router.get("", response_model=List[AccusedResponse])
def list_and_search_accused(
    query: Optional[str] = Query(None, description="Search by name, alias, history sheet no, gang name"),
    gang: Optional[str] = Query(None, description="Filter by Gang Name"),
    db: Session = Depends(get_db),
    current_user: Officer = Depends(get_current_user)
):
    q = db.query(AccusedPerson)

    if gang:
        q = q.filter(AccusedPerson.gang_name == gang)
    if query:
        pattern = f"%{query}%"
        q = q.filter(
            (AccusedPerson.name.ilike(pattern)) |
            (AccusedPerson.alias.ilike(pattern)) |
            (AccusedPerson.history_sheet_no.ilike(pattern)) |
            (AccusedPerson.gang_name.ilike(pattern))
        )

    accused_records = q.limit(50).all()

    results = []
    for acc in accused_records:
        linked_count = db.query(FIRAccusedLink).filter(FIRAccusedLink.accused_id == acc.id).count()
        results.append({
            "id": acc.id,
            "name": acc.name,
            "alias": acc.alias,
            "age": acc.age,
            "gender": acc.gender,
            "phone_number": acc.phone_number,
            "history_sheet_no": acc.history_sheet_no,
            "known_mos": acc.known_mos or [],
            "address": acc.address,
            "district": acc.district,
            "gang_name": acc.gang_name,
            "linked_firs_count": linked_count
        })

    AuditLoggerService.log_action(
        db=db,
        user_id=current_user.id,
        user_name=current_user.name,
        role=current_user.role,
        action="ACCUSED_DIRECTORY_SEARCH",
        query=f"Search Accused: {query or 'ALL'} | Gang: {gang}",
        records_accessed_count=len(results)
    )

    return results
