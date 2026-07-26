from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from app.db.database import get_db
from app.models.domain import PoliceStation
from app.schemas.api import PoliceStationResponse
from app.core.deps import get_current_user, Officer

router = APIRouter(prefix="/stations", tags=["Police Stations"])

@router.get("", response_model=List[PoliceStationResponse])
def list_police_stations(db: Session = Depends(get_db), current_user: Officer = Depends(get_current_user)):
    stations = db.query(PoliceStation).all()
    return [
        {
            "id": s.id,
            "code": s.code,
            "name": s.name,
            "district": s.district,
            "range_zone": s.range_zone,
            "subdivision": s.subdivision,
            "circle": s.circle,
            "latitude": s.latitude,
            "longitude": s.longitude,
            "contact_number": s.contact_number
        }
        for s in stations
    ]
