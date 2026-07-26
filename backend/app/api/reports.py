from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict, Any

from app.db.database import get_db
from app.core.deps import get_current_user, Officer
from app.schemas.report_schemas import ReportGenerateRequest, ReportDetailResponse, ReportSummaryResponse
from app.services.report_service import ReportGeneratorService

router = APIRouter(prefix="/reports", tags=["Investigation Report Center"])

# Temporary in-memory cache of generated reports for prototype demo
GENERATED_REPORTS_CACHE: Dict[str, Any] = {}

@router.post("/generate", response_model=ReportDetailResponse)
def generate_police_report(
    request: ReportGenerateRequest,
    db: Session = Depends(get_db),
    current_user: Officer = Depends(get_current_user)
):
    report = ReportGeneratorService.generate_investigation_report(
        db=db,
        officer=current_user,
        report_type=request.report_type,
        district=request.district,
        station_id=request.station_id,
        crime_head=request.crime_head,
        custom_title=request.title
    )
    GENERATED_REPORTS_CACHE[report["id"]] = report
    return report

@router.get("", response_model=List[ReportSummaryResponse])
def list_reports(
    db: Session = Depends(get_db),
    current_user: Officer = Depends(get_current_user)
):
    # Return cached reports or generate default initial report
    if not GENERATED_REPORTS_CACHE:
        default_rpt = ReportGeneratorService.generate_investigation_report(
            db=db,
            officer=current_user,
            report_type="EXECUTIVE_INTELLIGENCE_BRIEF",
            custom_title="Bengaluru City Serial Crime Review 2025-2026"
        )
        GENERATED_REPORTS_CACHE[default_rpt["id"]] = default_rpt

    return [
        {
            "id": r["id"],
            "report_type": r["report_type"],
            "title": r["title"],
            "created_at": r["created_at"],
            "created_by_officer": r["created_by_officer"],
            "station_name": r["station_name"],
            "district": r["district"],
            "verification_hash": r["verification_hash"],
            "qr_code_payload": r["qr_code_payload"]
        }
        for r in GENERATED_REPORTS_CACHE.values()
    ]

@router.get("/{report_id}", response_model=ReportDetailResponse)
def get_report_by_id(
    report_id: str,
    db: Session = Depends(get_db),
    current_user: Officer = Depends(get_current_user)
):
    if report_id not in GENERATED_REPORTS_CACHE:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report ID not found")
    return GENERATED_REPORTS_CACHE[report_id]
