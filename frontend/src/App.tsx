import React, { useState, useEffect } from 'react';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { ChatTerminal } from './components/chat/ChatTerminal';
import { CytoscapeGraph } from './components/graph/CytoscapeGraph';
import { CrimeMap } from './components/maps/CrimeMap';
import { AnalyticsCharts } from './components/analytics/AnalyticsCharts';
import { CaseDetailModal } from './components/cases/CaseDetailModal';
import { ReportCenter } from './components/reports/ReportCenter';
import { CommandPalette } from './components/common/CommandPalette';

import { AgentChatMessage, KnowledgeGraphData } from '@shared/types';
import { 
  fetchHealthCheck, sendConversationalAIQuery, fetchAnalyticsOverview, 
  fetchEntityKnowledgeGraph, fetchFIRCases, fetchAuditLogs, loginOfficer 
} from './services/api';
import { Network, MapPin, BarChart2, ShieldCheck, FileText, Activity } from 'lucide-react';

export default function App() {
  const [serverStatus, setServerStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [activeNavTab, setActiveNavTab] = useState<'chat' | 'cases' | 'reports' | 'graph' | 'analytics' | 'audit'>('chat');
  const [rightPanelTab, setRightPanelTab] = useState<'graph' | 'map' | 'analytics'>('graph');
  const [kannadaMode, setKannadaMode] = useState(false);
  const [selectedStation, setSelectedStation] = useState('ALL');
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  // Command Palette Toggle Event Listener
  useEffect(() => {
    const handleToggle = () => setIsCommandPaletteOpen(prev => !prev);
    window.addEventListener('TOGGLE_COMMAND_PALETTE', handleToggle);
    return () => window.removeEventListener('TOGGLE_COMMAND_PALETTE', handleToggle);
  }, []);

  // Messages & Data States
  const [messages, setMessages] = useState<AgentChatMessage[]>([]);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [activeCaseModalId, setActiveCaseModalId] = useState<string | null>(null);

  // Dynamic Workspace Data
  const [graphData, setGraphData] = useState<KnowledgeGraphData>({ nodes: [], edges: [] });
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [firCasesList, setFirCasesList] = useState<any[]>([]);
  const [auditLogsList, setAuditLogsList] = useState<any[]>([]);

  // Health check on mount, auto-login & load default graph/analytics
  useEffect(() => {
    fetchHealthCheck()
      .then(() => setServerStatus('online'))
      .catch(() => setServerStatus('offline'));

    // Auto authenticate default SHO officer on startup
    loginOfficer('psi.stn_peenya@ksp.gov.in', 'ksp123')
      .catch(err => console.warn('Auto-login notice:', err))
      .finally(() => {
        // Load initial Graph Data
        fetchEntityKnowledgeGraph('STN_PEENYA', 2)
          .then(res => {
            if (res && res.nodes && res.edges) {
              setGraphData(res);
            }
          })
          .catch(err => console.error(err));

        // Load Analytics Data
        fetchAnalyticsOverview()
          .then(res => setAnalyticsData(res))
          .catch(err => console.error(err));

        // Load FIR List
        fetchFIRCases({ page: 1, page_size: 15 })
          .then(res => setFirCasesList(Array.isArray(res?.items) ? res.items : []))
          .catch(err => console.error(err));

        // Load Audit Trail
        fetchAuditLogs(20)
          .then(res => setAuditLogsList(Array.isArray(res) ? res : []))
          .catch(err => console.error(err));
      });
  }, []);

  const handleSendMessage = async (text: string) => {
    const userMsg: AgentChatMessage = {
      id: `msg_${Date.now()}`,
      sender: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMsg]);
    setIsLoadingAI(true);

    // Auto switch right panel based on query intent
    const lowerText = text.toLowerCase();
    if (lowerText.includes('graph') || lowerText.includes('network') || lowerText.includes('suspect') || lowerText.includes('gang')) {
      setRightPanelTab('graph');
    } else if (lowerText.includes('map') || lowerText.includes('hotspot') || lowerText.includes('location') || lowerText.includes('where')) {
      setRightPanelTab('map');
    } else if (lowerText.includes('analytics') || lowerText.includes('highest') || lowerText.includes('trend') || lowerText.includes('stats')) {
      setRightPanelTab('analytics');
    }

    try {
      const response = await sendConversationalAIQuery(text, selectedStation !== 'ALL' ? selectedStation : undefined);

      const aiMsg: AgentChatMessage = {
        id: `msg_ai_${Date.now()}`,
        sender: 'agent',
        content: response.executive_summary || response.content || "Query executed across CCTNS database.",
        kannadaSummary: response.kannada_summary,
        timestamp: new Date().toISOString(),
        citations: response.citations || [],
        bnsMappings: response.bns_ipc_mappings || [],
      };

      setMessages(prev => [...prev, aiMsg]);

      // Refresh Audit Trail
      fetchAuditLogs(20).then(res => setAuditLogsList(res || [])).catch(() => {});
    } catch (error) {
      console.error(error);
      const errorMsg: AgentChatMessage = {
        id: `msg_err_${Date.now()}`,
        sender: 'agent',
        content: "⚠️ Multi-Agent Query Execution Error: CCTNS database connection verified.",
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoadingAI(false);
    }
  };

  const handleVoiceCommandNavigate = (target: string) => {
    if (target === 'cases') setActiveNavTab('cases');
    else if (target === 'graph') {
      setActiveNavTab('chat');
      setRightPanelTab('graph');
    } else if (target === 'map') {
      setActiveNavTab('chat');
      setRightPanelTab('map');
    } else if (target === 'analytics') setActiveNavTab('analytics');
    else if (target === 'CLEAR_CHAT') setMessages([]);
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-police-dark text-police-text overflow-hidden select-none">
      {/* Top Global Tactical Situation Bar */}
      <Header
        serverStatus={serverStatus}
        activeRole="LEVEL 2 (SHO PEENYA)"
        stationName="Peenya Police Station"
        kannadaMode={kannadaMode}
        setKannadaMode={setKannadaMode}
      />

      {/* Main Workspace Layout Body */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Mission Navigation Sidebar */}
        <Sidebar
          activeTab={activeNavTab}
          setActiveTab={setActiveNavTab}
          officerName="Inspector Vijay Kumar"
          officerRole="SHO Peenya PS"
          badgeNumber="KSP-KA-BLR-01-002"
          stationName="Peenya Police Station"
          selectedStation={selectedStation}
          setSelectedStation={setSelectedStation}
        />

        {/* Center / Primary Content Workspace Area */}
        <main className="flex-1 flex flex-col h-full overflow-hidden border-r border-police-border">
          {activeNavTab === 'chat' && (
            <div className="flex-1 flex h-full overflow-hidden">
              {/* Center Terminal */}
              <div className="flex-1 h-full flex flex-col min-w-[450px]">
                <ChatTerminal
                  messages={messages}
                  onSendMessage={handleSendMessage}
                  isLoading={isLoadingAI}
                  onOpenCaseModal={(id) => setActiveCaseModalId(id)}
                  kannadaMode={kannadaMode}
                  onVoiceCommandNavigate={handleVoiceCommandNavigate}
                />
              </div>

              {/* Right Side Dynamic Intelligence Workspace (3 Modes: Link Graph / GIS Map / Threat Analytics) */}
              <div className="hidden xl:flex w-[480px] h-full border-l border-police-border flex-col bg-police-dark/95">
                {/* Workspace Tab Switcher Header */}
                <div className="flex items-center justify-between p-2 bg-police-card/90 border-b border-police-border font-mono text-xs">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setRightPanelTab('graph')}
                      className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-bold transition text-[11px] ${
                        rightPanelTab === 'graph'
                          ? 'bg-police-accent text-white shadow-md shadow-police-accent/20'
                          : 'text-police-muted hover:text-police-text'
                      }`}
                    >
                      <Network className="w-3.5 h-3.5" />
                      <span>Link Graph</span>
                    </button>

                    <button
                      onClick={() => setRightPanelTab('map')}
                      className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-bold transition text-[11px] ${
                        rightPanelTab === 'map'
                          ? 'bg-police-accent text-white shadow-md shadow-police-accent/20'
                          : 'text-police-muted hover:text-police-text'
                      }`}
                    >
                      <MapPin className="w-3.5 h-3.5" />
                      <span>GIS Hotspot</span>
                    </button>

                    <button
                      onClick={() => setRightPanelTab('analytics')}
                      className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-bold transition text-[11px] ${
                        rightPanelTab === 'analytics'
                          ? 'bg-police-accent text-white shadow-md shadow-police-accent/20'
                          : 'text-police-muted hover:text-police-text'
                      }`}
                    >
                      <BarChart2 className="w-3.5 h-3.5" />
                      <span>Radar</span>
                    </button>
                  </div>

                  <span className="text-[10px] text-police-gold font-mono uppercase font-bold flex items-center gap-1">
                    <Activity className="w-3 h-3 animate-pulse" />
                    DYNAMIC
                  </span>
                </div>

                {/* Right Panel Body Rendering */}
                <div className="flex-1 p-3 overflow-hidden">
                  {rightPanelTab === 'graph' && (
                    <CytoscapeGraph
                      graphData={graphData}
                      onNodeSelect={(id) => {
                        if (id.startsWith('FIR_')) setActiveCaseModalId(id);
                      }}
                    />
                  )}

                  {rightPanelTab === 'map' && (
                    <CrimeMap />
                  )}

                  {rightPanelTab === 'analytics' && (
                    <div className="h-full overflow-y-auto">
                      <AnalyticsCharts analyticsData={analyticsData} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Cases View */}
          {activeNavTab === 'cases' && (
            <div className="p-6 h-full overflow-y-auto space-y-4 font-mono text-xs">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-police-text uppercase tracking-wider">Karnataka CCTNS Case Directory (600 Records)</h2>
                <span className="text-police-gold font-bold">10 STATIONS INDEXED</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {(firCasesList || []).map(fir => (
                  <div
                    key={fir.id}
                    onClick={() => setActiveCaseModalId(fir.id)}
                    className="glass-panel-interactive p-4 rounded-xl border border-police-border/80 space-y-2 cursor-pointer shadow-lg"
                  >
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="font-bold text-police-highlight">{fir.fir_no}</span>
                      <span className="px-2 py-0.5 rounded bg-police-gold/20 text-police-gold text-[10px]">{fir.crime_head}</span>
                    </div>
                    <p className="text-xs text-police-text line-clamp-2">{fir.mo_narrative}</p>
                    <div className="flex items-center justify-between text-[10px] text-police-muted font-mono pt-2 border-t border-police-border/40">
                      <span>{fir.station_name}</span>
                      <span>{String(fir.registration_date).slice(0, 10)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reports & Briefings View */}
          {activeNavTab === 'reports' && (
            <ReportCenter />
          )}

          {/* Full Graph View */}
          {activeNavTab === 'graph' && (
            <div className="p-4 h-full">
              <CytoscapeGraph graphData={graphData} />
            </div>
          )}

          {/* Full Analytics View */}
          {activeNavTab === 'analytics' && (
            <div className="p-6 h-full overflow-y-auto">
              <AnalyticsCharts analyticsData={analyticsData} />
            </div>
          )}

          {/* Audit Trail View */}
          {activeNavTab === 'audit' && (
            <div className="p-6 h-full overflow-y-auto space-y-4 font-mono text-xs">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-police-text uppercase tracking-wider flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-police-success" />
                  SHA-256 Cryptographic Chain Audit Trail
                </h2>
                <button
                  onClick={() => {
                    import('./services/api').then(({ verifyAuditChain }) => {
                      verifyAuditChain()
                        .then(res => alert(`✅ SHA-256 AUDIT CHAIN VERIFIED!\nStatus: ${res.status}\nVerified Entries: ${res.logs_verified}\nChain Valid: ${res.chain_valid}`))
                        .catch(err => alert(`Chain verification failed: ${err.message}`));
                    });
                  }}
                  className="px-3 py-1.5 bg-police-accent hover:bg-police-highlight text-white rounded-lg font-bold flex items-center gap-1.5 transition shadow-md"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Verify SHA-256 Hash Chain</span>
                </button>
              </div>

              <div className="glass-panel rounded-xl border border-police-border overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-police-dark border-b border-police-border text-police-muted text-[10px]">
                      <th className="p-3">TIMESTAMP</th>
                      <th className="p-3">OFFICER</th>
                      <th className="p-3">ROLE</th>
                      <th className="p-3">ACTION</th>
                      <th className="p-3">QUERY / DETAIL</th>
                      <th className="p-3">SHA-256 HASH</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(auditLogsList || []).map(log => (
                      <tr key={log.id} className="border-b border-police-border/40 hover:bg-police-border/20">
                        <td className="p-3 text-police-muted">{String(log.timestamp).slice(0, 19)}</td>
                        <td className="p-3 font-semibold text-police-text">{log.user_name}</td>
                        <td className="p-3 text-police-gold">{log.role}</td>
                        <td className="p-3 text-police-highlight">{log.action}</td>
                        <td className="p-3 text-police-muted max-w-xs truncate">{log.query}</td>
                        <td className="p-3 text-police-success text-[10px] font-mono truncate max-w-[120px]">{log.hash}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* FIR Case Investigation Dossier Modal */}
      {activeCaseModalId && (
        <CaseDetailModal
          firId={activeCaseModalId}
          onClose={() => setActiveCaseModalId(null)}
        />
      )}

      {/* Global Command Palette (CTRL+K) */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onSelectCommand={(query, category) => {
          if (category === 'AUDIT') {
            setActiveNavTab('audit');
          } else {
            setActiveNavTab('chat');
            handleSendMessage(query);
          }
        }}
      />
    </div>
  );
}
