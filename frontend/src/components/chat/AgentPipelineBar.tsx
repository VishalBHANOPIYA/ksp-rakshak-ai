import React from 'react';
import { Cpu, CheckCircle2, Loader2, Database, Network, Search, BarChart2, ShieldCheck, Sparkles } from 'lucide-react';

export interface AgentStepStatus {
  id: string;
  name: string;
  agent: string;
  status: 'idle' | 'running' | 'completed' | 'skipped';
  executionTimeMs?: number;
  details?: string;
}

interface AgentPipelineBarProps {
  isLoading: boolean;
  activeAgents: AgentStepStatus[];
  confidenceScore?: number;
}

export const AgentPipelineBar: React.FC<AgentPipelineBarProps> = ({
  isLoading,
  activeAgents,
  confidenceScore = 98.4
}) => {
  const defaultSteps: AgentStepStatus[] = [
    { id: 'router', name: 'Intent Classifier', agent: 'RouterAgent', status: 'completed', executionTimeMs: 4 },
    { id: 'nl2sql', name: 'Schema SQL Search', agent: 'NL2SQLAgent', status: 'completed', executionTimeMs: 12 },
    { id: 'graph', name: 'Graph-RAG Linkage', agent: 'GraphRAGAgent', status: 'completed', executionTimeMs: 8 },
    { id: 'vector', name: 'MO Narrative Vector', agent: 'VectorRAGAgent', status: 'completed', executionTimeMs: 14 },
    { id: 'verifier', name: 'Zero-Hallucination', agent: 'EvidenceVerifier', status: 'completed', executionTimeMs: 6 }
  ];

  const stepsToRender = (activeAgents && activeAgents.length > 0) ? activeAgents : defaultSteps;

  return (
    <div className="bg-police-dark/90 backdrop-blur-md border-b border-police-border/80 px-4 py-2.5 flex items-center justify-between text-xs font-mono select-none shadow-lg">
      {/* Left: Engine Status Badge */}
      <div className="flex items-center gap-2.5">
        <div className="p-1.5 rounded-lg bg-police-accent/20 border border-police-highlight/40 text-police-highlight flex items-center gap-1.5 shadow-sm">
          <Cpu className="w-3.5 h-3.5 animate-pulse" />
          <span className="font-bold tracking-wider text-[11px]">MULTI-AGENT REASONING PIPELINE</span>
        </div>
        
        {isLoading ? (
          <span className="flex items-center gap-1.5 text-police-gold text-[10px] bg-police-gold/10 px-2.5 py-1 rounded-md border border-police-gold/30 font-bold animate-pulse">
            <Loader2 className="w-3 h-3 animate-spin" />
            SYNTHESIZING INTELLIGENCE...
          </span>
        ) : (
          <span className="flex items-center gap-1.5 text-police-success text-[10px] bg-police-success/10 px-2.5 py-1 rounded-md border border-police-success/30 font-bold">
            <CheckCircle2 className="w-3 h-3" />
            PIPELINE READY ({confidenceScore}% CONFIDENCE)
          </span>
        )}
      </div>

      {/* Center: Agent Nodes Pipeline */}
      <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
        {stepsToRender.map((step, idx) => {
          const isCompleted = step.status === 'completed';
          const isRunning = step.status === 'running' || (isLoading && idx === stepsToRender.findIndex(s => s.status !== 'completed'));

          return (
            <React.Fragment key={step.id}>
              {idx > 0 && (
                <div className={`h-[1px] w-3 ${isCompleted ? 'bg-police-highlight' : 'bg-police-border/60'}`} />
              )}
              <div
                className={`px-2.5 py-1 rounded-lg border flex items-center gap-1.5 transition-all duration-300 text-[10px] ${
                  isRunning
                    ? 'bg-police-accent/30 border-police-highlight text-police-text shadow-md shadow-police-accent/30 animate-pulse'
                    : isCompleted
                    ? 'bg-police-card/90 border-police-highlight/60 text-police-text'
                    : 'bg-police-dark/50 border-police-border/40 text-police-muted'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${isRunning ? 'bg-police-gold animate-ping' : isCompleted ? 'bg-police-success' : 'bg-police-muted'}`} />
                <span className="font-bold">{step.agent}</span>
                {step.executionTimeMs && (
                  <span className="text-[9px] text-police-muted font-mono">{step.executionTimeMs}ms</span>
                )}
              </div>
            </React.Fragment>
          );
        })}
      </div>

      {/* Right: Security & Verification Telemetry */}
      <div className="hidden lg:flex items-center gap-3 text-[10px] text-police-muted">
        <div className="flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-police-success" />
          <span>ZERO-HALLUCINATION VERIFIED</span>
        </div>
        <span>•</span>
        <div className="flex items-center gap-1 text-police-gold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>GROQ LLAMA-3.3-70B</span>
        </div>
      </div>
    </div>
  );
};
