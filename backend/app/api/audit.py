from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Dict, Any

from app.db.database import get_db
from app.models.domain import AuditLogEntry
from app.schemas.api import AuditLogResponse
from app.core.deps import get_current_user, require_clearance, Officer
from app.services.audit_service import AuditLoggerService

router = APIRouter(prefix="/audit", tags=["Cryptographic Audit Logs"])

@router.get("", response_model=List[AuditLogResponse])
def get_audit_logs(
    limit: int = Query(50, ge=1, le=500),
    db: Session = Depends(get_db),
    current_user: Officer = Depends(require_clearance(2))
):
    logs = db.query(AuditLogEntry).order_by(AuditLogEntry.timestamp.desc()).limit(limit).all()
    return [
        {
            "id": l.id,
            "timestamp": l.timestamp,
            "user_name": l.user_name,
            "role": l.role,
            "action": l.action,
            "query": l.query,
            "records_accessed_count": l.records_accessed_count,
            "hash": l.hash,
            "previous_hash": l.previous_hash
        }
        for l in logs
    ]

@router.get("/verify-chain")
def verify_audit_chain_integrity(
    db: Session = Depends(get_db),
    current_user: Officer = Depends(require_clearance(3))
):
    """Verifies SHA-256 hash chain tamper-evident integrity across all audit logs."""
    return AuditLoggerService.verify_chain_integrity(db)
