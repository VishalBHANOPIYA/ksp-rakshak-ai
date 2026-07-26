import React from 'react';
import { 
  MessageSquare, FileText, Network, BarChart3, ShieldCheck, 
  MapPin, Bookmark, Sparkles, User, ChevronRight, Shield
} from 'lucide-react';

interface SidebarProps {
  activeTab: 'chat' | 'cases' | 'reports' | 'graph' | 'analytics' | 'audit';
  setActiveTab: (tab: 'chat' | 'cases' | 'reports' | 'graph' | 'analytics' | 'audit') => void;
  officerName: string;
  officerRole: string;
  badgeNumber: string;
  stationName: string;
  selectedStation: string;
  setSelectedStation: (stn: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  officerName,
  officerRole,
  badgeNumber,
  stationName,
  selectedStation,
  setSelectedStation
}) => {
  const navItems = [
    { id: 'chat', label: 'AI Intelligence Copilot', icon: MessageSquare, badge: 'Agentic' },
    { id: 'cases', label: 'FIR Case Files Directory', icon: FileText, badge: '600 Records' },
    { id: 'reports', label: 'Investigation Report Briefs', icon: Bookmark, badge: 'PDF Export' },
    { id: 'graph', label: 'Knowledge Link Graph', icon: Network, badge: 'Palantir' },
    { id: 'analytics', label: 'Crime Threat Analytics', icon: BarChart3, badge: 'Radar' },
    { id: 'audit', label: 'SHA-256 Audit Trail', icon: ShieldCheck, badge: 'Verified' },
  ] as const;

  const demoPresets = [
    { title: "Peenya Burglary Gang", query: "Peenya nalli last 6 months burglary MO mathu suspect details thori", tag: "Live MO" },
    { title: "Mysuru Chain Snatching", query: "Show chain snatching cases in Mysuru with suspect network", tag: "Graph" },
    { title: "Cyber UPI Mule Ring", query: "Find cyber UPI fraud mule bank accounts and linked IMEIs", tag: "Cyber" },
  ];

  return (
    <aside className="w-72 bg-police-dark/95 border-r border-police-border flex flex-col justify-between p-3 font-mono text-xs select-none backdrop-blur-xl z-20">
      {/* Top Section: Navigation Items */}
      <div className="space-y-4">
        {/* Navigation Section Title */}
        <div className="px-2 pt-1 flex items-center justify-between text-[10px] font-bold text-police-muted uppercase tracking-wider">
          <span>MISSION NAVIGATION</span>
          <Shield className="w-3 h-3 text-police-highlight" />
        </div>

        {/* Navigation Items List */}
        <nav className="space-y-1">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl border text-xs transition-all duration-200 group ${
                  isActive
                    ? 'bg-police-accent/25 border-police-highlight text-police-text font-bold shadow-lg shadow-police-accent/15'
                    : 'glass-panel-interactive border-police-border/40 text-police-muted hover:text-police-text'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-police-highlight' : 'text-police-muted group-hover:text-police-text'}`} />
                  <span className="truncate">{item.label}</span>
                </div>
                <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono ${
                  isActive ? 'bg-police-highlight text-police-dark font-bold' : 'bg-police-card text-police-muted'
                }`}>
                  {item.badge}
                </span>
              </button>
            );
          })}
        </nav>

        {/* Station Jurisdiction Filter */}
        <div className="pt-2 border-t border-police-border/60 space-y-1.5">
          <div className="px-2 text-[10px] font-bold text-police-muted uppercase tracking-wider flex items-center gap-1.5">
            <MapPin className="w-3 h-3 text-police-gold" />
            <span>JURISDICTION FILTER</span>
          </div>
          <select
            value={selectedStation}
            onChange={(e) => setSelectedStation(e.target.value)}
            className="w-full bg-police-card border border-police-border rounded-xl p-2 text-police-text font-mono text-xs focus:outline-none focus:border-police-highlight"
          >
            <option value="ALL">All Stations (Statewide)</option>
            <option value="STN_PEENYA">Peenya Police Station</option>
            <option value="STN_KAMAKSHIPALYA">Kamakshipalya PS</option>
            <option value="STN_MYS_LASHKAR">Lashkar PS (Mysuru)</option>
            <option value="STN_MANG_CENTRAL">Central PS (Mangaluru)</option>
          </select>
        </div>

        {/* 1-Click Live Demo Preset Section */}
        <div className="pt-2 border-t border-police-border/60 space-y-2">
          <div className="px-2 text-[10px] font-bold text-police-gold uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-police-gold" />
            <span>LIVE DEMO PRESETS</span>
          </div>
          <div className="space-y-1.5">
            {demoPresets.map((preset, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setActiveTab('chat');
                  window.dispatchEvent(new CustomEvent('TRIGGER_DEMO_QUERY', { detail: preset.query }));
                }}
                className="w-full text-left p-2 rounded-lg bg-police-card/60 hover:bg-police-accent/20 border border-police-border/50 hover:border-police-highlight text-[11px] transition flex items-center justify-between group"
              >
                <span className="font-semibold text-police-text truncate">{preset.title}</span>
                <ChevronRight className="w-3 h-3 text-police-muted group-hover:text-police-highlight transition-transform group-hover:translate-x-0.5" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Section: Authenticated Officer Profile Card */}
      <div className="pt-3 border-t border-police-border/80">
        <div className="glass-panel p-3 rounded-xl border border-police-border/80 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-police-accent/30 border border-police-highlight/60 flex items-center justify-center text-police-highlight font-bold">
            <User className="w-5 h-5" />
          </div>
          <div className="overflow-hidden">
            <div className="font-bold text-police-text text-xs truncate">{officerName}</div>
            <div className="text-[10px] text-police-gold font-mono truncate">{officerRole}</div>
            <div className="text-[9px] text-police-muted font-mono truncate">{badgeNumber}</div>
          </div>
        </div>
      </div>
    </aside>
  );
};
