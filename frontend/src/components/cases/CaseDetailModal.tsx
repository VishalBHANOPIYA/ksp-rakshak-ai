import React, { useEffect, useState } from 'react';
import { X, FileText, Calendar, MapPin, User, Shield, Phone, Car, Smartphone, Award, Clock } from 'lucide-react';
import { fetchCaseDetail } from '../../services/api';

interface CaseDetailModalProps {
  firId: string | null;
  onClose: () => void;
}

export const CaseDetailModal: React.FC<CaseDetailModalProps> = ({ firId, onClose }) => {
  const [caseData, setCaseData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!firId) return;
    setIsLoading(true);
    fetchCaseDetail(firId)
      .then(data => setCaseData(data))
      .catch(err => console.error(err))
      .finally(() => setIsLoading(false));
  }, [firId]);

  if (!firId) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 select-none">
      <div className="glass-panel w-full max-w-4xl max-h-[90vh] rounded-2xl border border-police-border flex flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-4 border-b border-police-border bg-police-card flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-police-accent/20 border border-police-highlight/40 rounded-lg text-police-highlight">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-sm text-police-text flex items-center gap-2">
                OFFICIAL CASE DOSSIER: {caseData?.fir_no || firId}
                {caseData?.is_sensitive && (
                  <span className="px-2 py-0.5 text-[10px] bg-police-danger/20 text-police-danger border border-police-danger/40 rounded font-mono">
                    POCSO / SENSITIVE PII PROTECTED
                  </span>
                )}
              </h2>
              <p className="text-[11px] text-police-muted">
                {caseData?.station_name} • {caseData?.district}
              </p>
            </div>
          </div>

          <button onClick={onClose} className="p-2 rounded-lg hover:bg-police-border text-police-muted hover:text-police-text transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        {isLoading || !caseData ? (
          <div className="p-12 text-center text-xs font-mono text-police-muted">Fetching Case Dossier...</div>
        ) : (
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Top Key Info Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
              <div className="p-3 bg-police-dark/60 rounded-xl border border-police-border/60">
                <div className="text-police-muted text-[10px]">CRIME HEAD</div>
                <div className="font-bold text-police-gold mt-0.5">{caseData.crime_head}</div>
              </div>
              <div className="p-3 bg-police-dark/60 rounded-xl border border-police-border/60">
                <div className="text-police-muted text-[10px]">BNS SECTIONS</div>
                <div className="font-bold text-police-highlight mt-0.5">{caseData.bns_sections?.join(', ')}</div>
              </div>
              <div className="p-3 bg-police-dark/60 rounded-xl border border-police-border/60">
                <div className="text-police-muted text-[10px]">IPC HISTORICAL</div>
                <div className="font-bold text-police-muted mt-0.5">{caseData.ipc_sections?.join(', ')}</div>
              </div>
              <div className="p-3 bg-police-dark/60 rounded-xl border border-police-border/60">
                <div className="text-police-muted text-[10px]">INVESTIGATION STATUS</div>
                <div className="font-bold text-police-success mt-0.5">{caseData.status}</div>
              </div>
            </div>

            {/* Modus Operandi Narrative */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold font-mono text-police-muted uppercase tracking-wider">Modus Operandi (MO) & Incident Details</h3>
              <div className="p-4 bg-police-dark/80 rounded-xl border border-police-border text-xs leading-relaxed text-police-text">
                {caseData.mo_narrative}
              </div>
            </div>

            {/* Accused List */}
            {caseData.accused_list?.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-xs font-bold font-mono text-police-muted uppercase tracking-wider">Accused Individuals ({(caseData.accused_list || []).length})</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {caseData.accused_list.map((acc: any) => (
                    <div key={acc.accused_id} className="p-3 bg-police-dark/60 rounded-xl border border-police-border text-xs flex items-center justify-between">
                      <div>
                        <div className="font-bold text-police-danger">{acc.name} ({acc.alias})</div>
                        <div className="text-[10px] text-police-muted font-mono">{acc.history_sheet_no || 'No History Sheet'} • Gang: {acc.gang_name || 'Independent'}</div>
                      </div>
                      <span className="px-2 py-0.5 text-[10px] bg-police-danger/20 text-police-danger rounded font-mono">
                        {acc.relationship_type}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Timeline */}
            {caseData.timeline?.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-xs font-bold font-mono text-police-muted uppercase tracking-wider">Investigation Timeline</h3>
                <div className="space-y-2 border-l-2 border-police-border pl-4">
                  {caseData.timeline.map((t: any, idx: number) => (
                    <div key={idx} className="text-xs relative">
                      <div className="w-2 h-2 rounded-full bg-police-highlight absolute -left-[21px] top-1" />
                      <div className="font-bold text-police-text">{t.title} <span className="text-[10px] text-police-muted font-mono font-normal">({str(t.event_date).slice(0,10)})</span></div>
                      <div className="text-police-muted text-[11px] mt-0.5">{t.description}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

function str(val: any): string {
  return String(val || '');
}
