from typing import Dict, Any, List
from app.services.graph_service import graph_engine

class GraphRAGAgent:
    def execute_graph_analysis(self, query: str) -> Dict[str, Any]:
        """Extracts sub-networks and entity relationships from KnowledgeGraphEngine."""
        query_lower = query.lower()

        # Find target nodes matching terms in query
        target_node_id = None
        for n, d in graph_engine.graph.nodes(data=True):
            label = str(d.get("label", "")).lower()
            if label and (label in query_lower or query_lower in label):
                target_node_id = n
                break

        if not target_node_id:
            # Fallback to first accused node
            accused_nodes = [n for n, d in graph_engine.graph.nodes(data=True) if d.get("type") == "ACCUSED"]
            target_node_id = accused_nodes[0] if accused_nodes else "STN_PEENYA"

        subgraph = graph_engine.get_subgraph_around_entity(entity_id=target_node_id, depth=2)

        return {
            "root_entity_id": target_node_id,
            "nodes_count": len(subgraph["nodes"]),
            "edges_count": len(subgraph["edges"]),
            "graph_data": subgraph
        }

# Global Instance
graph_rag_agent = GraphRAGAgent()
