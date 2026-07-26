from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

class ReportGenerateRequest(BaseModel):
    report_type: str = Field(..., example="EXECUTIVE_INTELLIGENCE_BRIEF")
    district: Optional[str] = Field(None, example="Bengaluru City")
    station_id: Optional[str] = Field(None, example="STN_PEENYA")
    crime_head: Optional[str] = Field(None, example="BURGLARY")
    title: Optional[str] = Field(None, example="Peenya & Kamakshipalya Serial Burglary Intelligence Brief")

class ReportSummaryResponse(BaseModel):
    id: str
    report_type: str
    title: str
    created_at: datetime
    created_by_officer: str
    station_name: str
    district: str
    verification_hash: str
    qr_code_payload: str

class ReportDetailResponse(ReportSummaryResponse):
    executive_summary: str
    kannada_summary: Optional[str]
    objectives: List[str]
    key_findings: List[str]
    bns_ipc_mappings: List[Dict[str, Any]]
    evidence_summary: List[Dict[str, Any]]
    timeline_events: List[Dict[str, Any]]
    recommendations: List[str]
    citations: List[Dict[str, Any]]
    officer_signature_block: Dict[str, Any]
