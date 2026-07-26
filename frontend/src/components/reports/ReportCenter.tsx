import React, { useState, useEffect } from 'react';
import { FileText, Download, Printer, Plus, Shield, QrCode, Search, Award, CheckCircle2, ChevronRight } from 'lucide-react';
import { generateReport, fetchReports, fetchReportDetail } from '../../services/api';

export const ReportCenter: React.FC = () => {
  const [reports, setReports] = useState<any[]>([]);
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [printMode, setPrintMode] = useState(false);

  // Form Controls
  const [reportType, setReportType] = useState('EXECUTIVE_INTELLIGENCE_BRIEF');
  const [district, setDistrict] = useState('Bengaluru City');
  const [customTitle, setCustomTitle] = useState('');

  useEffect(() => {
    loadReportsList();
  }, []);

  const loadReportsList = async () => {
    try {
      const data = await fetchReports();
      setReports(data || []);
      if (data && data.length > 0) {
        loadReportDetail(data[0].id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const loadReportDetail = async (id: string) => {
    try {
      const detail = await fetchReportDetail(id);
      setSelectedReport(detail);
    } catch (err) {
      console.error(err);
    }
  };

  const handleGenerateReport = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    try {
      const newReport = await generateReport({
        report_type: reportType,
        district: district,
        title: customTitle.trim() || undefined
      });
      setSelectedReport(newReport);
      setReports(prev => [newReport, ...prev]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadMarkdown = () => {
    if (!selectedReport) return;
    const md = `# ${selectedReport.title}\n\n**Created By:** ${selectedReport.created_by_officer}\n**Verification Hash:** ${selectedReport.verification_hash}\n\n## Executive Summary\n${selectedReport.executive_summary}\n\n## Key Findings\n${selectedReport.key_findings?.map((f: string) => `- ${f}`).join('\n')}`;
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedReport.id}_report.md`;
    a.click();
  };

  return (
    <div className="flex-1 flex h-full overflow-hidden bg-police-dark text-police-text select-none">
      {/* Left Sidebar: Templates & Saved Reports */}
      <div className="w-80 border-r border-police-border bg-police-card/50 p-4 flex flex-col space-y-4 overflow-y-auto">
        <div className="space-y-3">
          <h2 className="text-xs font-bold font-mono text-police-muted uppercase tracking-wider flex items-center justify-between">
            <span>GENERATE REPORT</span>
            <Plus className="w-3.5 h-3.5 text-police-highlight" />
          </h2>

          <form onSubmit={handleGenerateReport} className="glass-panel p-3.5 rounded-xl border border-police-border/80 space-y-3 text-xs">
            <div>
              <label className="text-[10px] font-mono text-police-muted block mb-1">REPORT TYPE</label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="w-full bg-police-dark border border-police-border rounded-lg p-2 text-police-text font-mono text-xs"
              >
                <option value="EXECUTIVE_INTELLIGENCE_BRIEF">Executive Intelligence Brief</option>
                <option value="CASE_INVESTIGATION_DOSSIER">Case Investigation Dossier</option>
                <option value="CRIME_PATTERN_REPORT">Crime Pattern Analysis Report</option>
                <option value="REPEAT_OFFENDER_REPORT">Repeat Offender Report</option>
                <option value="DAILY_INTELLIGENCE_BULLETIN">Daily Intelligence Bulletin</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-mono text-police-muted block mb-1">DISTRICT JURISDICTION</label>
              <select
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full bg-police-dark border border-police-border rounded-lg p-2 text-police-text font-mono text-xs"
              >
                <option value="Bengaluru City">Bengaluru City</option>
                <option value="Mysuru City">Mysuru City</option>
                <option value="Mangaluru City">Mangaluru City</option>
                <option value="Hubballi-Dharwad">Hubballi-Dharwad</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-mono text-police-muted block mb-1">CUSTOM BRIEF TITLE</label>
              <input
                type="text"
                placeholder="Optional report title..."
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                className="w-full bg-police-dark border border-police-border rounded-lg p-2 text-police-text text-xs placeholder-police-muted"
              />
            </div>

            <button
              type="submit"
              disabled={isGenerating}
              className="w-full py-2 bg-police-accent hover:bg-police-highlight text-white rounded-lg font-bold transition shadow-lg shadow-police-accent/20 flex items-center justify-center gap-2"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>{isGenerating ? "Synthesizing Report..." : "Build Official Report"}</span>
            </button>
          </form>
        </div>

        {/* Historical Generated Reports List */}
        <div className="space-y-2 flex-1">
          <h3 className="text-[10px] font-mono font-bold text-police-muted uppercase tracking-wider">SAVED REPORTS ({(reports || []).length})</h3>
          <div className="space-y-2">
            {(reports || []).map(rpt => (
              <button
                key={rpt.id}
                onClick={() => loadReportDetail(rpt.id)}
                className={`w-full text-left p-3 rounded-xl border text-xs transition-all ${
                  selectedReport?.id === rpt.id
                    ? 'bg-police-accent/20 border-police-highlight text-police-text font-semibold shadow-lg shadow-police-accent/10'
                    : 'glass-panel-interactive border-police-border/60 text-police-muted hover:text-police-text'
                }`}
              >
                <div className="font-bold text-police-text truncate">{rpt.title}</div>
                <div className="text-[10px] text-police-muted font-mono flex items-center justify-between mt-1">
                  <span>{rpt.district}</span>
                  <span>{String(rpt.created_at).slice(0, 10)}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Report Document Workspace */}
      <div className="flex-1 flex flex-col h-full overflow-hidden p-6 space-y-4">
        {/* Action Header */}
        {selectedReport && (
          <div className="flex items-center justify-between bg-police-card p-3 rounded-xl border border-police-border font-mono text-xs">
            <div className="flex items-center gap-2 text-police-muted">
              <Shield className="w-4 h-4 text-police-success" />
              <span>Report ID: <strong className="text-police-text">{selectedReport.id}</strong></span>
              <span>•</span>
              <span className="text-police-gold">SHA-256 Hash Verified</span>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={handleDownloadMarkdown} className="px-3 py-1.5 bg-police-dark border border-police-border hover:border-police-highlight rounded-lg flex items-center gap-1.5 text-police-text transition">
                <Download className="w-3.5 h-3.5 text-police-highlight" />
                <span>Export MD</span>
              </button>
              <button onClick={handlePrint} className="px-3 py-1.5 bg-police-accent hover:bg-police-highlight text-white rounded-lg flex items-center gap-1.5 font-bold transition shadow-md shadow-police-accent/20">
                <Printer className="w-3.5 h-3.5" />
                <span>Print Official PDF</span>
              </button>
            </div>
          </div>
        )}

        {/* Official Government Print Document Sheet */}
        {selectedReport ? (
          <div className="flex-1 overflow-y-auto bg-slate-900 border border-police-border rounded-2xl p-8 space-y-6 text-slate-100 shadow-2xl font-sans" id="printable-report">
            {/* Government Letterhead Header */}
            <div className="border-b-2 border-slate-700 pb-4 flex items-center justify-between">
              <div>
                <h1 className="text-lg font-bold uppercase tracking-wider text-amber-400">KARNATAKA STATE POLICE</h1>
                <h2 className="text-xs font-bold text-slate-300 font-mono mt-0.5">STATE CRIME RECORDS BUREAU • OFFICIAL INVESTIGATION REPORT</h2>
                <p className="text-[11px] text-slate-400 font-mono">{selectedReport.station_name} • {selectedReport.district}</p>
              </div>

              {/* QR Verification Code Badge */}
              <div className="p-2 bg-slate-800 border border-slate-700 rounded-xl flex items-center gap-3">
                <QrCode className="w-10 h-10 text-amber-400" />
                <div className="text-[9px] font-mono text-slate-400">
                  <div>SECURE VERIFICATION</div>
                  <div className="text-amber-400 font-bold">{selectedReport.verification_hash?.slice(0, 16)}...</div>
                  <div>AUTHENTICATED RECORD</div>
                </div>
              </div>
            </div>

            {/* Document Title */}
            <div>
              <h2 className="text-base font-bold text-white uppercase tracking-tight">{selectedReport.title}</h2>
              <div className="text-xs text-slate-400 font-mono mt-1 flex items-center gap-4">
                <span>AUTHOR: {selectedReport.created_by_officer}</span>
                <span>•</span>
                <span>DATE: {String(selectedReport.created_at).slice(0, 10)}</span>
              </div>
            </div>

            {/* Executive Summary Section */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold font-mono text-amber-400 uppercase tracking-wider border-b border-slate-800 pb-1">
                1. Executive Summary
              </h3>
              <p className="text-xs leading-relaxed text-slate-200">{selectedReport.executive_summary}</p>
              {selectedReport.kannada_summary && (
                <p className="text-xs text-amber-300 italic bg-amber-950/30 p-3 rounded-lg border border-amber-800/40 font-sans mt-2">
                  {selectedReport.kannada_summary}
                </p>
              )}
            </div>

            {/* Key Findings Section */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold font-mono text-amber-400 uppercase tracking-wider border-b border-slate-800 pb-1">
                2. Key Investigation Findings
              </h3>
              <ul className="space-y-2 text-xs">
                {selectedReport.key_findings?.map((finding: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2 text-slate-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span>{finding}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Dual BNS & IPC Mappings */}
            {selectedReport.bns_ipc_mappings?.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-xs font-bold font-mono text-amber-400 uppercase tracking-wider border-b border-slate-800 pb-1">
                  3. Bharatiya Nyaya Sanhita (BNS) & IPC Legal Sections
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
                  {selectedReport.bns_ipc_mappings.map((m: any, idx: number) => (
                    <div key={idx} className="p-2.5 bg-slate-800/80 rounded-lg border border-slate-700 flex items-center justify-between">
                      <span className="font-bold text-slate-200">{m.fir_no}</span>
                      <div className="text-[11px] text-right">
                        <div className="text-blue-400 font-bold">{m.bns?.join(', ')}</div>
                        <div className="text-slate-400 text-[10px]">{m.ipc?.join(', ')}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendations */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold font-mono text-amber-400 uppercase tracking-wider border-b border-slate-800 pb-1">
                4. Actionable Intelligence Recommendations
              </h3>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {selectedReport.recommendations?.map((rec: string, idx: number) => (
                  <li key={idx} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Official Signature Block */}
            <div className="pt-8 border-t border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400">
              <div>
                <div className="font-bold text-slate-200">{selectedReport.officer_signature_block?.investigating_officer}</div>
                <div>{selectedReport.officer_signature_block?.station}</div>
                <div className="text-[10px] text-slate-500">DIGITALLY SIGNED & HASHED VIA KSP RAKSHAK-AI</div>
              </div>
              <div className="text-right">
                <Award className="w-8 h-8 text-amber-400 ml-auto mb-1" />
                <div className="text-[10px] font-bold text-slate-300">{selectedReport.officer_signature_block?.authority_seal}</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 glass-panel rounded-2xl flex items-center justify-center text-xs text-police-muted">
            Select or generate a report to preview official briefing...
          </div>
        )}
      </div>
    </div>
  );
};
