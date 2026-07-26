from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

# --- AUTH SCHEMAS ---
class LoginRequest(BaseModel):
    email: str = Field(..., example="psi.stn_peenya@ksp.gov.in")
    password: str = Field(..., example="ksp123")

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in_minutes: int
    user: Dict[str, Any]

class UserProfileResponse(BaseModel):
    id: str
    badge_number: str
    name: str
    rank: str
    station_id: str
    station_name: str
    district: str
    role: str
    clearance_level: int
    email: str

# --- POLICE STATION SCHEMAS ---
class PoliceStationResponse(BaseModel):
    id: str
    code: str
    name: str
    district: str
    range_zone: str
    subdivision: str
    circle: str
    latitude: float
    longitude: float
    contact_number: Optional[str]

# --- FIR & CASE SCHEMAS ---
class FIRSummaryResponse(BaseModel):
    id: str
    fir_no: str
    station_name: str
    district: str
    registration_date: datetime
    crime_head: str
    ipc_sections: List[str]
    bns_sections: List[str]
    status: str
    priority: str
    is_sensitive: bool
    mo_narrative: str
    crime_scene_address: Optional[str]
    latitude: float
    longitude: float

class FIRDetailResponse(FIRSummaryResponse):
    io_officer_name: str
    spot_mahazar: Optional[str]
    accused_list: List[Dict[str, Any]]
    victims_list: List[Dict[str, Any]]
    witnesses_list: List[Dict[str, Any]]
    vehicles_list: List[Dict[str, Any]]
    digital_evidence_list: List[Dict[str, Any]]
    evidence_items_list: List[Dict[str, Any]]
    timeline: List[Dict[str, Any]]

class PaginatedFIRResponse(BaseModel):
    total: int
    page: int
    page_size: int
    total_pages: int
    items: List[FIRSummaryResponse]

# --- ACCUSED SCHEMAS ---
class AccusedResponse(BaseModel):
    id: str
    name: str
    alias: Optional[str]
    age: Optional[int]
    gender: Optional[str]
    phone_number: Optional[str]
    history_sheet_no: Optional[str]
    known_mos: Optional[List[str]]
    address: Optional[str]
    district: Optional[str]
    gang_name: Optional[str]
    linked_firs_count: int

# --- KNOWLEDGE GRAPH SCHEMAS ---
class GraphNodeSchema(BaseModel):
    id: str
    label: str
    type: str
    details: Dict[str, Any]

class GraphEdgeSchema(BaseModel):
    source: str
    target: str
    label: str
    weight: Optional[float] = 1.0

class GraphResponse(BaseModel):
    nodes: List[GraphNodeSchema]
    edges: List[GraphEdgeSchema]

# --- ANALYTICS SCHEMAS ---
class CrimeAnalyticsOverview(BaseModel):
    total_firs: int
    total_accused: int
    active_investigations: int
    chargesheeted_count: int
    top_crime_heads: List[Dict[str, Any]]
    district_summary: List[Dict[str, Any]]
    monthly_trends: List[Dict[str, Any]]
    hotspot_clusters: List[Dict[str, Any]]

# --- AUDIT SCHEMAS ---
class AuditLogResponse(BaseModel):
    id: str
    timestamp: datetime
    user_name: str
    role: str
    action: str
    query: str
    records_accessed_count: int
    hash: str
    previous_hash: str
