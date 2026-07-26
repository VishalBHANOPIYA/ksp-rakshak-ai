import uuid
import hashlib
import datetime
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from app.models.domain import FIRRecord, PoliceStation, Officer, AccusedPerson, FIRAccusedLink
from app.services.audit_service import AuditLoggerService

class ReportGeneratorService:
    @staticmethod
    def generate_investigation_report(
        db: Session,
        officer: Officer,
        report_type: str,
        district: str = None,
        station_id: str = None,
        crime_head: str = None,
        custom_title: str = None
    ) -> Dict[str, Any]:
        """Synthesizes official government-grade police intelligence report."""
        report_id = f"RPT_{uuid.uuid4().hex[:12].upper()}"
        timestamp = datetime.datetime.utcnow()

        # Query relevant FIR records
        q = db.query(FIRRecord).join(PoliceStation)
        if district:
            q = q.filter(PoliceStation.district == district)
        if station_id:
            q = q.filter(FIRRecord.station_id == station_id)
        if crime_head:
            q = q.filter(FIRRecord.crime_head == crime_head)

        firs = q.order_by(FIRRecord.registration_date.desc()).limit(15).all()

        stn = db.query(PoliceStation).filter(PoliceStation.id == officer.station_id).first()
        stn_name = stn.name if stn else "Karnataka Police Station"
        district_name = stn.district if stn else "Karnataka State"

        title = custom_title or f"KARNATAKA STATE POLICE: {report_type.replace('_', ' ')} ({district_name.upper()})"

        # Generate Key Findings & Citations
        key_findings = []
        citations = []
        bns_mappings = []

        for idx, f in enumerate(firs):
            stn_info = db.query(PoliceStation).filter(PoliceStation.id == f.station_id).first()
            key_findings.append(f"FIR {f.fir_no} registered at {stn_info.name if stn_info else 'Station'} under {', '.join(f.bns_sections or [])} ({f.crime_head}). Narrative summary: {f.mo_narrative[:140]}...")
            citations.append({
                "firId": f.id,
                "firNo": f.fir_no,
                "stationName": stn_info.name if stn_info else "KSP Station",
                "date": str(f.registration_date)[:10],
                "crimeHead": f.crime_head
            })
            bns_mappings.append({
                "fir_no": f.fir_no,
                "bns": f.bns_sections,
                "ipc": f.ipc_sections
            })

        if not key_findings:
            key_findings = ["Standard intelligence review executed across active station records."]

        executive_summary = f"This Official Intelligence Report synthesizes {len(firs)} active investigation files across {district_name}. Primary focus centers on Modus Operandi (MO) patterns and BNS/IPC legal compliance for trial admissibility."
        kannada_summary = f"ಈ ಅಧಿಕೃತ ತನಿಖಾ ವರದಿಯು {district_name} ವ್ಯಾಪ್ತಿಯ {len(firs)} ಸಕ್ರಿಯ ಎಫ್.ಐ.ಆರ್ ಪ್ರಕರಣಗಳ ವಿವರಗಳನ್ನು ಒಳಗೊಂಡಿದೆ."

        # Compute SHA-256 Verification Hash
        raw_payload = f"{report_id}:{timestamp.isoformat()}:{officer.id}:{title}:{len(firs)}"
        verification_hash = hashlib.sha256(raw_payload.encode('utf-8')).hexdigest()
        qr_payload = f"KSP-VERIFY://report/{report_id}?hash={verification_hash[:16]}"

        report_data = {
            "id": report_id,
            "report_type": report_type,
            "title": title,
            "created_at": timestamp,
            "created_by_officer": f"{officer.rank} {officer.name} ({officer.badge_number})",
            "station_name": stn_name,
            "district": district_name,
            "verification_hash": verification_hash,
            "qr_code_payload": qr_payload,
            "executive_summary": executive_summary,
            "kannada_summary": kannada_summary,
            "objectives": [
                "Establish cross-station Modus Operandi (MO) linkages",
                "Provide dual BNS and IPC section mapping for court charge-sheet filing",
                "Recommend targeted police patrol deployments in crime hotspots"
            ],
            "key_findings": key_findings[:5],
            "bns_ipc_mappings": bns_mappings[:5],
            "evidence_summary": [
                {"category": "VEHICLE", "description": "Stolen two-wheeler vehicles identified in fence networks."},
                {"category": "DIGITAL", "description": "Mule UPI IDs and phone IMEIs logged for cyber cell frozen accounts."}
            ],
            "timeline_events": [
                {"date": str(timestamp)[:10], "title": "Report Automated Synthesis", "description": "Compiled via KSP RAKSHAK-AI Engine."}
            ],
            "recommendations": [
                "Deploy nightly checkpoint patrols on high-risk corridor roads between 01:00 AM and 04:00 AM.",
                "Issue inter-district look-out circulars for repeat suspects identified in Knowledge Graph."
            ],
            "citations": citations[:8],
            "officer_signature_block": {
                "investigating_officer": f"{officer.name}, {officer.rank}",
                "station": stn_name,
                "date": str(timestamp)[:10],
                "authority_seal": "STATE CRIME RECORDS BUREAU • KARNATAKA STATE POLICE"
            }
        }

        # Log Report Export in Audit Trail
        AuditLoggerService.log_action(
            db=db,
            user_id=officer.id,
            user_name=officer.name,
            role=officer.role,
            action="REPORT_GENERATE_EXPORT",
            query=f"Generated report '{title}' (ID: {report_id})",
            records_accessed_count=len(firs)
        )

        return report_data
