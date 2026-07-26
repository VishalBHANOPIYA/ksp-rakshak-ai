import React from 'react';
import { FileText, Shield, ExternalLink } from 'lucide-react';
import { CitationBadge as CitationType } from '@shared/types';

interface CitationBadgeProps {
  citation: CitationType;
  onClick: (firId: string) => void;
}

export const CitationBadge: React.FC<CitationBadgeProps> = ({ citation, onClick }) => {
  return (
    <button
      onClick={() => onClick(citation.firId)}
      className="glass-panel-interactive px-3 py-1.5 rounded-lg border border-police-highlight/30 hover:border-police-highlight flex items-center gap-2 text-left group transition-all"
    >
      <div className="p-1 bg-police-accent/20 rounded text-police-highlight group-hover:bg-police-accent group-hover:text-white transition">
        <FileText className="w-3.5 h-3.5" />
      </div>
      <div>
        <div className="text-[11px] font-bold font-mono text-police-text group-hover:text-police-highlight flex items-center gap-1">
          {citation.firNo}
          <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
        <div className="text-[10px] text-police-muted flex items-center gap-1.5">
          <span>{citation.stationName}</span>
          <span>•</span>
          <span className="text-police-gold">{citation.crimeHead}</span>
        </div>
      </div>
    </button>
  );
};
