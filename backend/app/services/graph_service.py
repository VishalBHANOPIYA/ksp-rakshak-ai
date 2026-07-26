import networkx as nx
from typing import Dict, List, Any

class KnowledgeGraphEngine:
    def __init__(self):
        self.graph = nx.MultiDiGraph()

    def build_graph_from_dataset(self, data: Dict[str, List[Any]]):
        """Constructs a NetworkX multi-directional graph from dataset relationships."""
        self.graph.clear()

        # Add Police Station Nodes
        for stn in data["stations"]:
            self.graph.add_node(stn["id"], label=stn["name"], type="STATION", details=stn)

        # Add Accused Nodes & Gang Connections
        for acc in data["accused"]:
            self.graph.add_node(acc["id"], label=f"{acc['name']} ({acc['alias']})", type="ACCUSED", details=acc)
            if acc.get("gang_name"):
                gang_id = f"GANG_{acc['gang_name'].replace(' ', '_').upper()}"
                if not self.graph.has_node(gang_id):
                    self.graph.add_node(gang_id, label=acc["gang_name"], type="GANG", details={"name": acc["gang_name"]})
                self.graph.add_edge(acc["id"], gang_id, label="MEMBER_OF", weight=1.0)

        # Add FIR Nodes
        for fir in data["firs"]:
            self.graph.add_node(fir["id"], label=fir["fir_no"], type="FIR", details={
                "fir_no": fir["fir_no"],
                "crime_head": fir["crime_head"],
                "bns": fir["bns_sections"],
                "date": str(fir["registration_date"])
            })
            # Link FIR to Station
            self.graph.add_edge(fir["id"], fir["station_id"], label="REGISTERED_AT", weight=1.0)

        # Link Accused to FIRs
        for link in data["fir_accused_links"]:
            if self.graph.has_node(link["accused_id"]) and self.graph.has_node(link["fir_id"]):
                self.graph.add_edge(link["accused_id"], link["fir_id"], label=link["relationship_type"], weight=1.0)

        # Add Vehicles & Link to FIRs
        for veh in data["vehicles"]:
            veh_id = f"VEH_{veh['registration_no']}"
            if not self.graph.has_node(veh_id):
                self.graph.add_node(veh_id, label=veh["registration_no"], type="VEHICLE", details=veh)
            self.graph.add_edge(veh_id, veh["fir_id"], label="LINKED_TO_CASE", weight=1.0)

        # Add Digital Evidence (Phone, IMEI, UPI) & Link to FIRs
        for dig in data["digital_evidences"]:
            dig_id = f"DIG_{dig['evidence_type']}_{dig['value']}"
            if not self.graph.has_node(dig_id):
                self.graph.add_node(dig_id, label=dig["value"], type="DIGITAL_EVIDENCE", details=dig)
            self.graph.add_edge(dig_id, dig["fir_id"], label=f"EVIDENCE_{dig['evidence_type']}", weight=1.0)

        print(f"[GRAPH] Knowledge Graph constructed with {self.graph.number_of_nodes()} nodes and {self.graph.number_of_edges()} edges.")

    def get_subgraph_around_entity(self, entity_id: str, depth: int = 2) -> Dict[str, Any]:
        """Extracts N-hop sub-graph surrounding a target node for Cytoscape visualization."""
        target_node = entity_id
        if not self.graph.has_node(target_node):
            # Case-insensitive / partial label match
            match = next((n for n in self.graph.nodes() if entity_id.lower() in n.lower() or entity_id.lower() in str(self.graph.nodes[n].get('label', '')).lower()), None)
            if match:
                target_node = match
            elif len(self.graph.nodes()) > 0:
                # Default fallback to first station or accused node
                station_node = next((n for n, d in self.graph.nodes(data=True) if d.get('type') == 'STATION'), list(self.graph.nodes())[0])
                target_node = station_node
            else:
                return {"nodes": [], "edges": []}

        # BFS neighborhood retrieval up to specified depth
        nodes_at_depth = {target_node}
        current_layer = {target_node}
        for _ in range(depth):
            next_layer = set()
            for node in current_layer:
                neighbors = set(self.graph.neighbors(node)).union(set(self.graph.predecessors(node)))
                next_layer.update(neighbors)
            nodes_at_depth.update(next_layer)
            current_layer = next_layer

        subgraph = self.graph.subgraph(nodes_at_depth)

        result_nodes = []
        for n, d in subgraph.nodes(data=True):
            result_nodes.append({
                "id": n,
                "label": d.get("label", n),
                "type": d.get("type", "UNKNOWN"),
                "details": d.get("details", {})
            })

        result_edges = []
        for u, v, k, d in subgraph.edges(keys=True, data=True):
            result_edges.append({
                "source": u,
                "target": v,
                "label": d.get("label", "RELATED"),
                "weight": d.get("weight", 1.0)
            })

        return {"nodes": result_nodes, "edges": result_edges}

# Global Instance
graph_engine = KnowledgeGraphEngine()
