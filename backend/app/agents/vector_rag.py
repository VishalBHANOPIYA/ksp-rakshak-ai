from typing import Dict, Any, List
from app.services.vector_service import vector_engine

class VectorRAGAgent:
    def execute_vector_search(self, query: str, top_k: int = 5) -> Dict[str, Any]:
        """Executes semantic similarity search over indexed FIR narratives and Modus Operandi (MO) notes."""
        similar_cases = vector_engine.search_similar_cases(query=query, top_k=top_k)

        return {
            "query": query,
            "matched_cases_count": len(similar_cases),
            "similar_cases": similar_cases
        }

# Global Instance
vector_rag_agent = VectorRAGAgent()
