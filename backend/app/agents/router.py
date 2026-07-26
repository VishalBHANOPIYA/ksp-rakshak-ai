from typing import Dict, Any
try:
    from groq import Groq
except ImportError:
    Groq = None

from app.core.config import settings

class RouterAgent:
    def __init__(self):
        self.client = Groq(api_key=settings.GROQ_API_KEY) if (Groq and settings.GROQ_API_KEY) else None

    def route_query_intent(self, user_query: str) -> Dict[str, Any]:
        """Classifies input query intent across NL2SQL, GRAPH_RAG, VECTOR_RAG, or HYBRID search engines."""
        q_lower = user_query.lower()

        # Rule-based intent detection heuristics
        if any(term in q_lower for term in ["how many", "count", "stat", "district", "trend", "highest", "total"]):
            primary_intent = "NL2SQL"
        elif any(term in q_lower for term in ["link", "gang", "phone", "imei", "vehicle", "accused", "network", "connected", "relationship"]):
            primary_intent = "GRAPH_RAG"
        elif any(term in q_lower for term in ["mo", "modus", "similar", "narrative", "pattern", "method", "window", "rod"]):
            primary_intent = "VECTOR_RAG"
        else:
            primary_intent = "HYBRID"

        return {
            "query": user_query,
            "primary_intent": primary_intent,
            "requires_sql": primary_intent in ["NL2SQL", "HYBRID"],
            "requires_graph": primary_intent in ["GRAPH_RAG", "HYBRID"],
            "requires_vector": primary_intent in ["VECTOR_RAG", "HYBRID"]
        }

# Global Instance
router_agent = RouterAgent()
