import React from 'react';
import { Mic, Activity, CheckCircle2 } from 'lucide-react';

interface VoiceWaveformProps {
  stage: 'LISTENING' | 'TRANSCRIBING' | 'SEARCHING' | 'VERIFYING' | 'READY';
  isListening: boolean;
  transcriptPreview?: string;
}

export const VoiceWaveform: React.FC<VoiceWaveformProps> = ({ stage, isListening, transcriptPreview }) => {
  if (!isListening && stage === 'READY') return null;

  const stageLabels = {
    LISTENING: "Listening to Officer Speech (Kannada/English)...",
    TRANSCRIBING: "Transcribing Vernacular Audio Stream...",
    SEARCHING: "Orchestrator Agent Executing Multi-Agent Pipeline...",
    VERIFYING: "Verifying Source Evidence & Legal Codes...",
    READY: "Tactical Intelligence Ready"
  };

  return (
    <div className="glass-panel p-3.5 rounded-xl border border-police-highlight/40 flex items-center justify-between shadow-xl bg-police-card/90">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-police-danger/20 border border-police-danger flex items-center justify-center text-police-danger animate-pulse">
          <Mic className="w-4 h-4" />
        </div>
        <div>
          <div className="text-xs font-bold font-mono text-police-highlight flex items-center gap-2">
            <span>{stageLabels[stage]}</span>
          </div>
          {transcriptPreview && (
            <p className="text-[11px] text-police-gold font-mono italic mt-0.5 max-w-md truncate">
              "{transcriptPreview}"
            </p>
          )}
        </div>
      </div>

      {/* Visual Audio Equalizer Bars Animation */}
      <div className="flex items-center gap-1">
        <span className="w-1 h-4 bg-police-highlight rounded-full animate-bounce [animation-delay:-0.3s]" />
        <span className="w-1 h-6 bg-police-gold rounded-full animate-bounce [animation-delay:-0.15s]" />
        <span className="w-1 h-8 bg-police-danger rounded-full animate-bounce" />
        <span className="w-1 h-5 bg-police-success rounded-full animate-bounce [animation-delay:-0.2s]" />
      </div>
    </div>
  );
};
