import React, { useState, useEffect } from 'react';
import { Shield, ShieldAlert, Cpu, Activity, Clock, Globe, UserCheck, AlertTriangle, Search } from 'lucide-react';

interface HeaderProps {
  serverStatus: 'checking' | 'online' | 'offline';
  activeRole: string;
  stationName: string;
  kannadaMode: boolean;
  setKannadaMode: (mode: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({
  serverStatus,
  activeRole,
  stationName,
  kannadaMode,
  setKannadaMode
}) => {
  const [timeString, setTimeString] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeString(now.toLocaleTimeString('en-IN', { hour12: false }) + ' IST');
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="h-14 bg-police-dark/95 border-b border-police-border px-4 flex items-center justify-between font-mono text-xs select-none relative z-30 shadow-2xl backdrop-blur-xl">
      {/* Left: KSP RAKSHAK Brand Emblem & Threat Level */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center">
            <Shield className="w-7 h-7 text-police-highlight animate-pulse" />
            <div className="absolute inset-0 bg-police-highlight/20 blur-md rounded-full -z-10" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-sm tracking-wider text-police-text font-sans">
                KSP RAKSHAK-AI
              </h1>
              <span className="px-1.5 py-0.5 text-[9px] font-bold bg-police-gold/20 text-police-gold rounded border border-police-gold/40">
                v10.0 OS
              </span>
            </div>
            <p className="text-[10px] text-police-muted tracking-tight">
              KARNATAKA STATE POLICE • INTELLIGENCE OPERATING SYSTEM
            </p>
          </div>
        </div>

        <div className="h-6 w-[1px] bg-police-border hidden sm:block" />

        {/* Global Threat Level Gauge */}
        <div className="hidden md:flex items-center gap-2 bg-rose-950/40 border border-rose-800/60 px-3 py-1 rounded-lg text-rose-300">
          <AlertTriangle className="w-3.5 h-3.5 text-rose-400 animate-bounce" />
          <span className="font-bold text-[10px] tracking-wider">DEFCON 2: HIGH THREAT</span>
        </div>

        {/* CTRL+K Command Palette Trigger Button */}
        <button
          onClick={() => window.dispatchEvent(new CustomEvent('TOGGLE_COMMAND_PALETTE'))}
          className="hidden xl:flex items-center gap-2 px-3 py-1 bg-police-card hover:bg-police-border/40 border border-police-border rounded-lg text-police-muted hover:text-police-text transition"
        >
          <Search className="w-3.5 h-3.5 text-police-highlight" />
          <span className="text-[10px] font-mono font-bold">COMMAND PALETTE</span>
          <span className="px-1.5 py-0.5 text-[9px] bg-police-accent/30 text-police-highlight rounded font-mono font-bold">CTRL+K</span>
        </button>
      </div>

      {/* Center: System & CCTNS Network Telemetry Status */}
      <div className="hidden lg:flex items-center gap-4">
        {/* Network Status */}
        <div className="flex items-center gap-2 bg-police-card/90 px-3 py-1 rounded-lg border border-police-border/80">
          <Activity className={`w-3.5 h-3.5 ${serverStatus === 'online' ? 'text-police-success animate-pulse' : 'text-rose-500'}`} />
          <span className="text-police-muted text-[10px]">CCTNS GRID:</span>
          <span className={`font-bold text-[10px] ${serverStatus === 'online' ? 'text-police-success' : 'text-rose-400'}`}>
            {serverStatus === 'online' ? 'ONLINE (10 STATIONS LINKED)' : 'RECONNECTING...'}
          </span>
        </div>

        {/* AI Copilot Status */}
        <div className="flex items-center gap-2 bg-police-card/90 px-3 py-1 rounded-lg border border-police-border/80 text-police-highlight">
          <Cpu className="w-3.5 h-3.5" />
          <span className="text-police-muted text-[10px]">AI ENGINE:</span>
          <span className="font-bold text-[10px]">GROQ LLAMA-3.3 MULTI-AGENT</span>
        </div>
      </div>

      {/* Right: Officer Profile, Kannada Vernacular Toggle & Live Clock */}
      <div className="flex items-center gap-3">
        {/* Kannada Vernacular Mode Switcher */}
        <button
          onClick={() => setKannadaMode(!kannadaMode)}
          className={`px-3 py-1 rounded-lg border text-[11px] font-bold transition-all flex items-center gap-1.5 ${
            kannadaMode
              ? 'bg-police-gold text-police-dark border-police-gold shadow-lg shadow-police-gold/30 font-sans'
              : 'bg-police-card hover:bg-police-border/40 text-police-text border-police-border'
          }`}
        >
          <Globe className="w-3.5 h-3.5" />
          <span>{kannadaMode ? 'ಕನ್ನಡ (KANNADA)' : 'ENGLISH (EN)'}</span>
        </button>

        {/* Authenticated Officer Badge */}
        <div className="hidden sm:flex items-center gap-2 bg-police-card border border-police-border/80 px-2.5 py-1 rounded-lg">
          <UserCheck className="w-3.5 h-3.5 text-police-gold" />
          <div className="text-right">
            <div className="text-[10px] font-bold text-police-text truncate max-w-[130px]">Inspector Vijay Kumar</div>
            <div className="text-[9px] text-police-gold font-mono">{activeRole}</div>
          </div>
        </div>

        {/* Live System Clock */}
        <div className="flex items-center gap-1.5 text-police-muted bg-police-card/80 px-2.5 py-1 rounded-lg border border-police-border/60 text-[11px] font-mono">
          <Clock className="w-3.5 h-3.5 text-police-highlight" />
          <span>{timeString || '12:00:00 IST'}</span>
        </div>
      </div>
    </header>
  );
};
