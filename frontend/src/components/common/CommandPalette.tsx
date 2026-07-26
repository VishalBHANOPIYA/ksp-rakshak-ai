import React, { useState, useEffect } from 'react';
import { Search, X, CornerDownLeft } from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCommand: (query: string, category?: string) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onSelectCommand
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        isOpen ? onClose() : null;
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const quickActions = [
    { title: "Peenya Serial Burglary Series", query: "Peenya nalli last 6 months burglary MO mathu suspect details thori", category: "CASE" },
    { title: "Mysuru Chain Snatching Gang", query: "Show chain snatching cases in Mysuru with suspect network", category: "GRAPH" },
    { title: "Cyber UPI Mule Account Ring", query: "Find cyber UPI fraud mule bank accounts and linked IMEIs", category: "CYBER" },
    { title: "Statewide Vehicle Theft Hotspots", query: "Which station has highest vehicle theft in Bengaluru and Mysuru?", category: "GIS" },
    { title: "Verify SHA-256 Audit Chain Integrity", query: "Verify SHA-256 audit chain logs", category: "AUDIT" }
  ];

  const filtered = quickActions.filter(a => 
    a.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    a.query.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-police-dark/80 backdrop-blur-xl z-50 flex items-start justify-center pt-20 p-4 font-mono text-xs select-none">
      <div className="w-full max-w-2xl bg-police-card border border-police-border/90 rounded-2xl shadow-2xl overflow-hidden flex flex-col space-y-3 p-4">
        {/* Header & Search Bar */}
        <div className="flex items-center justify-between border-b border-police-border/60 pb-3">
          <div className="flex items-center gap-2.5 flex-1">
            <Search className="w-4 h-4 text-police-highlight animate-pulse" />
            <input
              type="text"
              placeholder="Search CCTNS FIRs, suspect IMEIs, stations, or type command..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
              className="w-full bg-transparent border-none text-police-text placeholder-police-muted focus:outline-none text-xs font-mono"
            />
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-police-border/40 text-police-muted">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Command List */}
        <div className="space-y-1.5 max-h-80 overflow-y-auto">
          <div className="text-[10px] font-bold text-police-muted uppercase tracking-wider px-2 flex items-center justify-between">
            <span>RECOMMENDED COMMANDS & INVESTIGATIONS</span>
            <span className="text-police-gold">CTRL+K</span>
          </div>

          {filtered.map((item, idx) => (
            <button
              key={idx}
              onClick={() => {
                onSelectCommand(item.query, item.category);
                onClose();
              }}
              className="w-full p-3 rounded-xl bg-police-dark/60 hover:bg-police-accent/20 border border-police-border/40 hover:border-police-highlight text-left flex items-center justify-between transition group"
            >
              <div className="space-y-0.5">
                <div className="font-bold text-police-text group-hover:text-police-highlight flex items-center gap-2">
                  <span>{item.title}</span>
                  <span className="px-1.5 py-0.5 text-[9px] bg-police-accent/20 text-police-highlight rounded font-mono">
                    {item.category}
                  </span>
                </div>
                <div className="text-[10px] text-police-muted font-mono truncate max-w-[450px]">{item.query}</div>
              </div>
              <CornerDownLeft className="w-4 h-4 text-police-muted group-hover:text-police-highlight transition-transform group-hover:translate-x-0.5" />
            </button>
          ))}
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-police-border/40 flex items-center justify-between text-[10px] text-police-muted">
          <span>Use ARROW KEYS or CLICK to select</span>
          <span className="text-police-gold">KSP RAKSHAK-AI COMMAND PALETTE</span>
        </div>
      </div>
    </div>
  );
};
