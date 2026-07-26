from typing import Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.domain import FIRRecord, PoliceStation, AccusedPerson

class AnalyticsAgent:
    def execute_analytics(self, query: str, db: Session) -> Dict[str, Any]:
        """Calculates structured JSON statistical crime metrics, district summaries, and hotspot clusters."""
        total_firs = db.query(FIRRecord).count()
        active_investigations = db.query(FIRRecord).filter(FIRRecord.status == "UNDER_INVESTIGATION").count()

        district_counts = db.query(
            PoliceStation.district, func.count(FIRRecord.id).label("count")
        ).join(FIRRecord).group_by(PoliceStation.district).all()

        crime_type_counts = db.query(
            FIRRecord.crime_head, func.count(FIRRecord.id).label("count")
        ).group_by(FIRRecord.crime_head).all()

        return {
            "total_firs": total_firs,
            "active_investigations": active_investigations,
            "district_breakdown": [{"district": d[0], "count": d[1]} for d in district_counts],
            "crime_type_breakdown": [{"crime_head": c[0], "count": c[1]} for c in crime_type_counts]
        }

# Global Instance
analytics_agent = AnalyticsAgent()
