from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
try:
    from jose import jwt, JWTError
except ImportError:
    import jwt
    JWTError = Exception

from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.database import get_db
from app.models.domain import Officer

oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/login", auto_error=False)

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> Officer:
    if token:
        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
            user_id: str = payload.get("sub")
            if user_id:
                user = db.query(Officer).filter(Officer.id == user_id).first()
                if user and user.is_active:
                    return user
        except JWTError:
            pass

    # Demo Fallback: Default SHO Officer (Inspector Vijay Kumar, Peenya PS)
    default_officer = db.query(Officer).first()
    if default_officer:
        return default_officer
    
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

def require_clearance(min_level: int):
    """Enforces minimum RBAC clearance level on endpoints."""
    def clearance_checker(current_user: Officer = Depends(get_current_user)):
        if current_user.clearance_level < min_level:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Insufficient clearance. Minimum clearance level {min_level} required."
            )
        return current_user
    return clearance_checker

def anonymize_sensitive_record(data_dict: dict, user_clearance: int) -> dict:
    """Anonymizes victim PII for sensitive cases (POCSO/Sexual Assault) if clearance level < 3."""
    if data_dict.get("is_sensitive") and user_clearance < 3:
        if "victims_list" in data_dict:
            for v in data_dict["victims_list"]:
                v["name"] = "PROTECTED_VICTIM_IDENTITY (POCSO/SENSITIVE)"
                v["phone_number"] = "XXXXXXXXXX"
                v["address"] = "PROTECTED_ADDRESS"
    return data_dict
