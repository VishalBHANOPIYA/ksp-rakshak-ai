import os
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

try:
    from pydantic_settings import BaseSettings
except ImportError:
    from pydantic import BaseModel as BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = os.getenv("PROJECT_NAME", "KSP RAKSHAK-AI")
    API_V1_STR: str = os.getenv("API_V1_STR", "/api/v1")
    SECRET_KEY: str = os.getenv("SECRET_KEY", "ksp_datathon_2026_super_secret_rakshak_key_change_in_production")
    ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "480"))
    
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
    DEFAULT_MODEL: str = os.getenv("DEFAULT_MODEL", "llama-3.3-70b-versatile")
    FAST_MODEL: str = os.getenv("FAST_MODEL", "llama-3.1-8b-instant")
    
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./ksp_rakshak.db")
    AUDIT_SALT: str = os.getenv("AUDIT_SALT", "ksp_audit_sha256_salt_2026")

    class Config:
        case_sensitive = True
        env_file = ".env"

settings = Settings()

