import hashlib
import uuid
import datetime
from typing import Dict, Any
from sqlalchemy.orm import Session
from app.models.domain import AuditLogEntry
from app.core.config import settings

class AuditLoggerService:
    @staticmethod
    def get_last_log_hash(db: Session) -> str:
        """Retrieves SHA-256 hash of the most recent audit entry for chain building."""
        last_entry = db.query(AuditLogEntry).order_by(AuditLogEntry.timestamp.desc()).first()
        if last_entry:
            return last_entry.hash
        return "GENESIS_KSP_AUDIT_HASH_2026_DATATHON"

    @staticmethod
    def log_action(
        db: Session,
        user_id: str,
        user_name: str,
        role: str,
        action: str,
        query: str,
        records_accessed_count: int = 0
    ) -> AuditLogEntry:
        """Logs action with cryptographic SHA-256 hash chaining."""
        prev_hash = AuditLoggerService.get_last_log_hash(db)
        log_id = f"AUD_{uuid.uuid4().hex[:12].upper()}"
        timestamp = datetime.datetime.utcnow()

        # Compute SHA-256 payload hash
        raw_payload = f"{log_id}:{timestamp.isoformat()}:{user_id}:{action}:{query}:{records_accessed_count}:{prev_hash}:{settings.AUDIT_SALT}"
        entry_hash = hashlib.sha256(raw_payload.encode('utf-8')).hexdigest()

        audit_entry = AuditLogEntry(
            id=log_id,
            timestamp=timestamp,
            user_id=user_id,
            user_name=user_name,
            role=role,
            action=action,
            query=query,
            records_accessed_count=records_accessed_count,
            hash=entry_hash,
            previous_hash=prev_hash
        )

        db.add(audit_entry)
        db.commit()
        db.refresh(audit_entry)
        return audit_entry

    @staticmethod
    def verify_chain_integrity(db: Session) -> Dict[str, Any]:
        """Verifies full cryptographic chain integrity."""
        logs = db.query(AuditLogEntry).order_by(AuditLogEntry.timestamp.asc()).all()
        if not logs:
            return {"valid": True, "total_logs": 0, "status": "No audit records"}

        prev_hash = "GENESIS_KSP_AUDIT_HASH_2026_DATATHON"
        for idx, log in enumerate(logs):
            raw_payload = f"{log.id}:{log.timestamp.isoformat()}:{log.user_id}:{log.action}:{log.query}:{log.records_accessed_count}:{prev_hash}:{settings.AUDIT_SALT}"
            expected_hash = hashlib.sha256(raw_payload.encode('utf-8')).hexdigest()

            if log.hash != expected_hash or log.previous_hash != prev_hash:
                return {
                    "valid": False,
                    "tampered_at_index": idx,
                    "tampered_log_id": log.id,
                    "status": "TAMPERING_DETECTED"
                }
            prev_hash = log.hash

        return {"valid": True, "total_logs": len(logs), "status": "CHAIN_INTEGRITY_VERIFIED_100_PERCENT"}
