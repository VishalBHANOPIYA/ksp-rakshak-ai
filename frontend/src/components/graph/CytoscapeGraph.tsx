import React, { useEffect, useRef, useState } from 'react';
import cytoscape, { Core } from 'cytoscape';
import { KnowledgeGraphData } from '@shared/types';
import { Network, Search, RefreshCw, ZoomIn, ZoomOut, Info, Shield, Layers } from 'lucide-react';

interface CytoscapeGraphProps {
  graphData: KnowledgeGraphData;
  onNodeSelect?: (nodeId: string, nodeType: string) => void;
}

export const CytoscapeGraph: React.FC<CytoscapeGraphProps> = ({
  graphData,
  onNodeSelect
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<Core | null>(null);
  const [selectedNode, setSelectedNode] = useState<any | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [layoutName, setLayoutName] = useState<'cose' | 'concentric' | 'breadthfirst'>('cose');

  useEffect(() => {
    if (!containerRef.current) return;

    const elements: cytoscape.ElementDefinition[] = [];

    // Convert graph nodes
    graphData.nodes.forEach(n => {
      elements.push({
        data: {
          id: n.id,
          label: n.label,
          nodeType: n.type,
          details: n.details || {}
        }
      });
    });

    // Convert graph edges
    graphData.edges.forEach((e, idx) => {
      elements.push({
        data: {
          id: `e_${idx}_${e.source}_${e.target}`,
          source: e.source,
          target: e.target,
          label: e.label || 'LINKED'
        }
      });
    });

    // Initialize Cytoscape with Palantir Gotham Theme Styles
    const cy = cytoscape({
      container: containerRef.current,
      elements: elements,
      style: [
        {
          selector: 'node',
          style: {
            'label': 'data(label)',
            'color': '#E2E8F0',
            'font-family': 'JetBrains Mono, monospace',
            'font-size': '10px',
            'text-valign': 'bottom',
            'text-margin-y': 4,
            'background-color': '#3B82F6',
            'border-width': 2,
            'border-color': '#60A5FA',
            'width': 28,
            'height': 28,
            'transition-property': 'background-color, border-color, bounds',
            'transition-duration': 0.2
          }
        },
        {
          selector: 'node[nodeType = "ACCUSED"]',
          style: {
            'background-color': '#EF4444',
            'border-color': '#F87171',
            'shape': 'ellipse',
            'width': 34,
            'height': 34
          }
        },
        {
          selector: 'node[nodeType = "GANG"]',
          style: {
            'background-color': '#7F1D1D',
            'border-color': '#EF4444',
            'border-width': 3,
            'shape': 'pentagon',
            'width': 40,
            'height': 40
          }
        },
        {
          selector: 'node[nodeType = "STATION"]',
          style: {
            'background-color': '#F59E0B',
            'border-color': '#FBBF24',
            'shape': 'hexagon',
            'width': 38,
            'height': 38
          }
        },
        {
          selector: 'node[nodeType = "VEHICLE"]',
          style: {
            'background-color': '#10B981',
            'border-color': '#34D399',
            'shape': 'rectangle',
            'width': 26,
            'height': 26
          }
        },
        {
          selector: 'node[nodeType = "DIGITAL_EVIDENCE"]',
          style: {
            'background-color': '#8B5CF6',
            'border-color': '#A78BFA',
            'shape': 'diamond',
            'width': 30,
            'height': 30
          }
        },
        {
          selector: 'edge',
          style: {
            'width': 1.5,
            'line-color': 'rgba(148, 163, 184, 0.4)',
            'curve-style': 'bezier',
            'target-arrow-shape': 'triangle',
            'target-arrow-color': 'rgba(148, 163, 184, 0.6)',
            'arrow-scale': 0.8,
            'label': 'data(label)',
            'color': '#94A3B8',
            'font-size': '8px',
            'font-family': 'JetBrains Mono, monospace',
            'text-rotation': 'autorotate'
          }
        },
        {
          selector: ':selected',
          style: {
            'border-color': '#F59E0B',
            'border-width': 4,
            'shadow-blur': 12,
            'shadow-color': '#F59E0B'
          }
        }
      ],
      layout: {
        name: layoutName,
        animate: true,
        animationDuration: 500
      }
    });

    cy.on('tap', 'node', (evt) => {
      const node = evt.target;
      const data = node.data();
      setSelectedNode(data);
      if (onNodeSelect) {
        onNodeSelect(data.id, data.nodeType);
      }
    });

    cyRef.current = cy;

    return () => {
      cy.destroy();
    };
  }, [graphData, layoutName]);

  const handleZoomIn = () => cyRef.current?.zoom(cyRef.current.zoom() * 1.2);
  const handleZoomOut = () => cyRef.current?.zoom(cyRef.current.zoom() * 0.8);
  const handleResetLayout = () => cyRef.current?.layout({ name: layoutName, animate: true }).run();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim() || !cyRef.current) return;
    const matched = cyRef.current.nodes().filter(n => 
      n.data('label').toLowerCase().includes(searchTerm.toLowerCase()) ||
      n.data('id').toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (matched.length > 0) {
      cyRef.current.nodes().unselect();
      matched.select();
      cyRef.current.center(matched);
      setSelectedNode(matched[0].data());
    }
  };

  return (
    <div className="w-full h-full flex flex-col glass-panel border border-police-border/80 rounded-2xl overflow-hidden relative select-none font-mono text-xs shadow-2xl">
      {/* Top Toolbar */}
      <div className="p-3 bg-police-dark/95 border-b border-police-border flex items-center justify-between z-10">
        <div className="flex items-center gap-2 text-police-highlight">
          <Network className="w-4 h-4" />
          <span className="font-bold uppercase tracking-wider text-xs">PALANTIR GOTHAM LINK ANALYSIS</span>
          <span className="text-[10px] text-police-muted">({graphData.nodes.length} Nodes • {graphData.edges.length} Edges)</span>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="flex items-center gap-2">
          <div className="relative">
            <input
              type="text"
              placeholder="Search suspect, IMEI, FIR..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-police-card border border-police-border rounded-lg pl-8 pr-3 py-1 text-xs font-mono text-police-text placeholder-police-muted focus:outline-none focus:border-police-highlight"
            />
            <Search className="w-3.5 h-3.5 text-police-muted absolute left-2.5 top-2" />
          </div>

          <button
            type="button"
            onClick={handleResetLayout}
            className="p-1.5 bg-police-card hover:bg-police-border/40 border border-police-border rounded-lg text-police-text transition"
            title="Reset Layout"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>

      {/* Main Cytoscape Canvas */}
      <div ref={containerRef} className="flex-1 w-full bg-[#030712] relative">
        {/* Floating Zoom & Controls */}
        <div className="absolute top-3 left-3 flex flex-col space-y-1.5 z-10">
          <button onClick={handleZoomIn} className="p-2 bg-police-card/90 border border-police-border rounded-lg text-police-text hover:bg-police-border/50 shadow-lg">
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button onClick={handleZoomOut} className="p-2 bg-police-card/90 border border-police-border rounded-lg text-police-text hover:bg-police-border/50 shadow-lg">
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Node Hover Inspector Card */}
        {selectedNode && (
          <div className="absolute top-3 right-3 w-64 bg-police-card/95 border border-police-border rounded-xl p-3 shadow-2xl z-20 space-y-2 backdrop-blur-md">
            <div className="flex items-center justify-between border-b border-police-border pb-1.5">
              <div className="font-bold text-police-highlight truncate">{selectedNode.label}</div>
              <span className="text-[9px] px-1.5 py-0.5 bg-police-accent/20 text-police-gold rounded font-bold">{selectedNode.nodeType}</span>
            </div>
            <div className="text-[10px] space-y-1 text-police-muted font-mono">
              <div>ID: <strong className="text-police-text">{selectedNode.id}</strong></div>
              {selectedNode.details?.history_sheet_no && (
                <div>History Sheet: <strong className="text-police-gold">{selectedNode.details.history_sheet_no}</strong></div>
              )}
              {selectedNode.details?.gang_name && (
                <div>Gang Network: <strong className="text-rose-400">{selectedNode.details.gang_name}</strong></div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Graph Legend */}
      <div className="p-2 bg-police-dark/95 border-t border-police-border flex items-center justify-between text-[10px] text-police-muted">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Accused</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Station</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> FIR</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Vehicle</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-purple-500" /> Digital/IMEI</span>
        </div>
        <div>PHYSICS ENGINE: COSE FORCE-DIRECTED</div>
      </div>
    </div>
  );
};
