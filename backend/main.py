from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings

# Import API Routers
from app.api.auth import router as auth_router
from app.api.stations import router as stations_router
from app.api.cases import router as cases_router
from app.api.accused import router as accused_router
from app.api.graph import router as graph_router
from app.api.analytics import router as analytics_router
from app.api.audit import router as audit_router
from app.api.chat import router as chat_router
from app.api.reports import router as reports_router

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    description="Intelligent Conversational AI & Graph-RAG Platform for Karnataka State Police Datathon 2026"
)

@app.on_event("startup")
def auto_seed_on_startup():
    from app.db.database import SessionLocal
    from app.models.domain import PoliceStation
    db = SessionLocal()
    try:
        if db.query(PoliceStation).count() == 0:
            from seed import seed_database
            seed_database()
    finally:
        db.close()

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API v1 Routers
app.include_router(auth_router, prefix=settings.API_V1_STR)
app.include_router(stations_router, prefix=settings.API_V1_STR)
app.include_router(cases_router, prefix=settings.API_V1_STR)
app.include_router(accused_router, prefix=settings.API_V1_STR)
app.include_router(graph_router, prefix=settings.API_V1_STR)
app.include_router(analytics_router, prefix=settings.API_V1_STR)
app.include_router(audit_router, prefix=settings.API_V1_STR)
app.include_router(chat_router, prefix=settings.API_V1_STR)
app.include_router(reports_router, prefix=settings.API_V1_STR)

# Global Exception Handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "status": "error",
            "message": "An unexpected error occurred in the KSP RAKSHAK-AI backend server.",
            "detail": str(exc)
        }
    )

@app.get("/")
def root():
    return {
        "status": "online",
        "service": "KSP RAKSHAK-AI Core Engine",
        "version": "1.0.0",
        "organization": "Karnataka State Police"
    }

@app.get(f"{settings.API_V1_STR}/health")
def health_check():
    return {
        "status": "healthy",
        "database": "connected",
        "ai_engine": "groq_llama3_ready",
        "graph_engine": "networkx_active"
    }

if __name__ == "__main__":
    import os
    import uvicorn
    listen_port = int(os.getenv("X_ZOHO_CATALYST_LISTEN_PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=listen_port)
