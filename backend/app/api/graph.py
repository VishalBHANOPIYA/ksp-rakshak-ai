from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.schemas.api import GraphResponse
from app.core.deps import get_current_user, Officer
from app.services.graph_service import graph_engine
from app.services.audit_service import AuditLoggerService

router = APIRouter(prefix="/graph", tags=["Knowledge Graph Entity Linkage"])

@router.get("/{entity_id}", response_model=GraphResponse)
def get_entity_knowledge_graph(
    entity_id: str,
    depth: int = Query(2, ge=1, le=4, description="Graph traversal hop depth (1 to 4 hops)"),
    db: Session = Depends(get_db),
    current_user: Officer = Depends(get_current_user)
):
    subgraph_data = graph_engine.get_subgraph_around_entity(entity_id=entity_id, depth=depth)

    AuditLoggerService.log_action(
        db=db,
        user_id=current_user.id,
        user_name=current_user.name,
        role=current_user.role,
        action="KNOWLEDGE_GRAPH_TRAVERSAL",
        query=f"Traversed {depth}-hop network around entity {entity_id}",
        records_accessed_count=len(subgraph_data["nodes"])
    )

    return subgraph_data
