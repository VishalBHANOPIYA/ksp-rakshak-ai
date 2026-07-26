import math
from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import Optional, List

from app.db.database import get_db
from app.models.domain import (
    FIRRecord, PoliceStation, Officer, AccusedPerson, FIRAccusedLink,
    VictimPerson, WitnessPerson, Vehicle, DigitalEvidence, EvidenceItem, CaseTimeline
)
from app.schemas.api import FIRSummaryResponse, FIRDetailResponse, PaginatedFIRResponse
from app.core.deps import get_current_user, anonymize_sensitive_record
from app.services.audit_service import AuditLoggerService

router = APIRouter(prefix="/cases", tags=["FIR Cases & Investigation Records"])

@router.get("", response_model=PaginatedFIRResponse)
def list_and_search_firs(
    query: Optional[str] = Query(None, description="Free text keyword search over FIR narrative / location"),
    district: Optional[str] = Query(None, description="Filter by District"),
    station_id: Optional[str] = Query(None, description="Filter by Police Station ID"),
    crime_head: Optional[str] = Query(None, description="Filter by Crime Head (BURGLARY, VEHICLE_THEFT, etc.)"),
    status_filter: Optional[str] = Query(None, alias="status", description="Filter by Status"),
    page: int = Query(1, ge=1),
    page_size: int = Query(15, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: Officer = Depends(get_current_user)
):
    q = db.query(FIRRecord).join(PoliceStation)

    if district:
        q = q.filter(PoliceStation.district == district)
    if station_id:
        q = q.filter(FIRRecord.station_id == station_id)
    if crime_head:
        q = q.filter(FIRRecord.crime_head == crime_head)
    if status_filter:
        q = q.filter(FIRRecord.status == status_filter)

    if query:
        search_pattern = f"%{query}%"
        q = q.filter(
            or_(
                FIRRecord.fir_no.ilike(search_pattern),
                FIRRecord.mo_narrative.ilike(search_pattern),
                FIRRecord.crime_scene_address.ilike(search_pattern)
            )
        )

    total = q.count()
    total_pages = math.ceil(total / page_size) if total > 0 else 1
    offset = (page - 1) * page_size

    firs = q.order_by(FIRRecord.registration_date.desc()).offset(offset).limit(page_size).all()

    items = []
    for f in firs:
        stn = db.query(PoliceStation).filter(PoliceStation.id == f.station_id).first()
        items.append({
            "id": f.id,
            "fir_no": f.fir_no,
            "station_name": stn.name if stn else "Unknown Station",
            "district": stn.district if stn else "Unknown District",
            "registration_date": f.registration_date,
            "crime_head": f.crime_head,
            "ipc_sections": f.ipc_sections or [],
            "bns_sections": f.bns_sections or [],
            "status": f.status,
            "priority": f.priority,
            "is_sensitive": f.is_sensitive,
            "mo_narrative": f.mo_narrative,
            "crime_scene_address": f.crime_scene_address,
            "latitude": f.latitude,
            "longitude": f.longitude
        })

    # Log search in audit trail
    AuditLoggerService.log_action(
        db=db,
        user_id=current_user.id,
        user_name=current_user.name,
        role=current_user.role,
        action="FIR_SEARCH_QUERY",
        query=f"Query: {query or 'ALL'} | District: {district} | Station: {station_id} | Crime: {crime_head}",
        records_accessed_count=len(items)
    )

    return {
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": total_pages,
        "items": items
    }

@router.get("/{fir_id}", response_model=FIRDetailResponse)
def get_fir_case_detail(fir_id: str, db: Session = Depends(get_db), current_user: Officer = Depends(get_current_user)):
    f = db.query(FIRRecord).filter((FIRRecord.id == fir_id) | (FIRRecord.fir_no == fir_id)).first()
    if not f:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="FIR Record not found")

    stn = db.query(PoliceStation).filter(PoliceStation.id == f.station_id).first()
    io = db.query(Officer).filter(Officer.id == f.io_officer_id).first()

    # Fetch child records
    accused_links = db.query(FIRAccusedLink).filter(FIRAccusedLink.fir_id == fir_id).all()
    accused_list = []
    for link in accused_links:
        acc = db.query(AccusedPerson).filter(AccusedPerson.id == link.accused_id).first()
        if acc:
            accused_list.append({
                "accused_id": acc.id,
                "name": acc.name,
                "alias": acc.alias,
                "relationship_type": link.relationship_type,
                "history_sheet_no": acc.history_sheet_no,
                "gang_name": acc.gang_name
            })

    victims = db.query(VictimPerson).filter(VictimPerson.fir_id == fir_id).all()
    victims_list = [{"id": v.id, "name": v.name, "age": v.age, "gender": v.gender, "phone_number": v.phone_number, "address": v.address} for v in victims]

    witnesses = db.query(WitnessPerson).filter(WitnessPerson.fir_id == fir_id).all()
    witnesses_list = [{"name": w.name, "phone_number": w.phone_number, "statement": w.statement_summary} for w in witnesses]

    vehicles = db.query(Vehicle).filter(Vehicle.fir_id == fir_id).all()
    vehicles_list = [{"registration_no": v.registration_no, "make_model": v.make_model, "status": v.status} for v in vehicles]

    digital = db.query(DigitalEvidence).filter(DigitalEvidence.fir_id == fir_id).all()
    digital_list = [{"type": d.evidence_type, "value": d.value, "remarks": d.remarks} for d in digital]

    evidence = db.query(EvidenceItem).filter(EvidenceItem.fir_id == fir_id).all()
    evidence_list = [{"property_id": e.property_id, "description": e.description, "category": e.category} for e in evidence]

    timeline = db.query(CaseTimeline).filter(CaseTimeline.fir_id == fir_id).order_by(CaseTimeline.event_date.asc()).all()
    timeline_list = [{"event_date": t.event_date, "title": t.title, "description": t.description, "officer_name": t.officer_name} for t in timeline]

    result = {
        "id": f.id,
        "fir_no": f.fir_no,
        "station_name": stn.name if stn else "Unknown Station",
        "district": stn.district if stn else "Unknown District",
        "registration_date": f.registration_date,
        "crime_head": f.crime_head,
        "ipc_sections": f.ipc_sections or [],
        "bns_sections": f.bns_sections or [],
        "status": f.status,
        "priority": f.priority,
        "is_sensitive": f.is_sensitive,
        "mo_narrative": f.mo_narrative,
        "spot_mahazar": f.spot_mahazar,
        "crime_scene_address": f.crime_scene_address,
        "latitude": f.latitude,
        "longitude": f.longitude,
        "io_officer_name": io.name if io else "Investigating Officer",
        "accused_list": accused_list,
        "victims_list": victims_list,
        "witnesses_list": witnesses_list,
        "vehicles_list": vehicles_list,
        "digital_evidence_list": digital_list,
        "evidence_items_list": evidence_list,
        "timeline": timeline_list
    }

    # Apply PII anonymization if case is sensitive and user clearance is low
    result = anonymize_sensitive_record(result, current_user.clearance_level)

    # Audit log
    AuditLoggerService.log_action(
        db=db,
        user_id=current_user.id,
        user_name=current_user.name,
        role=current_user.role,
        action="FIR_DETAIL_VIEW",
        query=f"Accessed case detail for {f.fir_no}",
        records_accessed_count=1
    )

    return result
