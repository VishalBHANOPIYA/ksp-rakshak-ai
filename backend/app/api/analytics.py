from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.db.database import get_db
from app.models.domain import FIRRecord, AccusedPerson, PoliceStation, FIRAccusedLink
from app.schemas.api import CrimeAnalyticsOverview
from app.core.deps import get_current_user, Officer

router = APIRouter(prefix="/analytics", tags=["Crime Analytics & Hotspots"])

@router.get("/overview", response_model=CrimeAnalyticsOverview)
def get_crime_analytics_overview(db: Session = Depends(get_db), current_user: Officer = Depends(get_current_user)):
    total_firs = db.query(FIRRecord).count()
    total_accused = db.query(AccusedPerson).count()
    active_investigations = db.query(FIRRecord).filter(FIRRecord.status == "UNDER_INVESTIGATION").count()
    chargesheeted = db.query(FIRRecord).filter(FIRRecord.status == "CHARGESHEETED").count()

    # Top Crime Heads
    crime_counts = db.query(
        FIRRecord.crime_head, func.count(FIRRecord.id).label("count")
    ).group_by(FIRRecord.crime_head).order_by(func.count(FIRRecord.id).desc()).all()
    top_crime_heads = [{"crime_head": c[0], "count": c[1]} for c in crime_counts]

    # District Summary
    district_counts = db.query(
        PoliceStation.district, func.count(FIRRecord.id).label("count")
    ).join(FIRRecord).group_by(PoliceStation.district).order_by(func.count(FIRRecord.id).desc()).all()
    district_summary = [{"district": d[0], "count": d[1]} for d in district_counts]

    # Monthly Trends (Sampled by year-month)
    monthly_counts = db.query(
        func.strftime('%Y-%m', FIRRecord.registration_date).label("month"),
        func.count(FIRRecord.id).label("count")
    ).group_by("month").order_by("month").limit(12).all()
    monthly_trends = [{"month": m[0], "count": m[1]} for m in monthly_counts if m[0]]

    # Hotspot Clusters (Latitude, Longitude, Crime Head for Leaflet map)
    hotspots = db.query(
        FIRRecord.id, FIRRecord.fir_no, FIRRecord.crime_head, FIRRecord.latitude, FIRRecord.longitude
    ).limit(200).all()
    hotspot_clusters = [
        {"id": h[0], "fir_no": h[1], "crime_head": h[2], "latitude": h[3], "longitude": h[4]}
        for h in hotspots
    ]

    return {
        "total_firs": total_firs,
        "total_accused": total_accused,
        "active_investigations": active_investigations,
        "chargesheeted_count": chargesheeted,
        "top_crime_heads": top_crime_heads,
        "district_summary": district_summary,
        "monthly_trends": monthly_trends,
        "hotspot_clusters": hotspot_clusters
    }
