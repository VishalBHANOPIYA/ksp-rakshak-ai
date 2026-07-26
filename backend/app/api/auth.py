from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import timedelta

from app.db.database import get_db
from app.models.domain import Officer, PoliceStation
from app.schemas.api import LoginRequest, TokenResponse, UserProfileResponse
from app.core.security import verify_password, create_access_token
from app.core.deps import get_current_user
from app.services.audit_service import AuditLoggerService

router = APIRouter(prefix="/auth", tags=["Authentication & Officers"])

@router.post("/login", response_model=TokenResponse)
def login(request: LoginRequest, db: Session = Depends(get_db)):
    officer = db.query(Officer).filter(Officer.email == request.email).first()
    if not officer or not verify_password(request.password, officer.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    stn = db.query(PoliceStation).filter(PoliceStation.id == officer.station_id).first()
    stn_name = stn.name if stn else "KSP HQ"
    district = stn.district if stn else "Karnataka State"

    access_token = create_access_token(
        subject=officer.id,
        claims={
            "role": officer.role,
            "badge_number": officer.badge_number,
            "clearance_level": officer.clearance_level
        }
    )

    user_info = {
        "id": officer.id,
        "badge_number": officer.badge_number,
        "name": officer.name,
        "rank": officer.rank,
        "role": officer.role,
        "station_id": officer.station_id,
        "station_name": stn_name,
        "district": district,
        "clearance_level": officer.clearance_level,
        "email": officer.email
    }

    # Log login action in audit trail
    AuditLoggerService.log_action(
        db=db,
        user_id=officer.id,
        user_name=officer.name,
        role=officer.role,
        action="USER_LOGIN",
        query=f"Login successful from badge {officer.badge_number}"
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "expires_in_minutes": 480,
        "user": user_info
    }

@router.get("/me", response_model=UserProfileResponse)
def get_current_officer_profile(current_user: Officer = Depends(get_current_user), db: Session = Depends(get_db)):
    stn = db.query(PoliceStation).filter(PoliceStation.id == current_user.station_id).first()
    return {
        "id": current_user.id,
        "badge_number": current_user.badge_number,
        "name": current_user.name,
        "rank": current_user.rank,
        "station_id": current_user.station_id,
        "station_name": stn.name if stn else "KSP HQ",
        "district": stn.district if stn else "Karnataka State",
        "role": current_user.role,
        "clearance_level": current_user.clearance_level,
        "email": current_user.email
    }
