from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.core.deps import get_current_user, Officer
from app.agents.composer import composer_engine
from app.services.audit_service import AuditLoggerService

router = APIRouter(prefix="/chat", tags=["Conversational AI Intelligence Engine"])

class ChatQueryRequest(BaseModel):
    query: str = Field(..., example="Show chain snatching cases in Mysuru with suspect network")
    station_context: Optional[str] = Field(None, example="STN_PEENYA")

@router.post("", response_model=Dict[str, Any])
def execute_conversational_chat_query(
    request: ChatQueryRequest,
    db: Session = Depends(get_db),
    current_user: Officer = Depends(get_current_user)
):
    if not request.query.strip():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Query prompt cannot be empty.")

    # Process query through multi-agent orchestration pipeline
    result_json = composer_engine.process_conversational_query(
        user_query=request.query,
        db=db,
        user_clearance=current_user.clearance_level
    )

    # Log AI Query in cryptographic audit trail
    AuditLoggerService.log_action(
        db=db,
        user_id=current_user.id,
        user_name=current_user.name,
        role=current_user.role,
        action="AI_CONVERSATIONAL_QUERY",
        query=request.query,
        records_accessed_count=len(result_json.get("citations", []))
    )

    return result_json
