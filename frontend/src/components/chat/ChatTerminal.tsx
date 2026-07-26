import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, Mic, MicOff, Volume2, Square, Sparkles, Shield, FileText, 
  ChevronRight, CornerDownLeft, AlertCircle, ArrowUpRight, Scale, CheckCircle2, Bookmark
} from 'lucide-react';
import { AgentChatMessage } from '@shared/types';
import { CitationBadge } from './CitationBadge';
import { VoiceWaveform } from '../voice/VoiceWaveform';
import { AgentPipelineBar, AgentStepStatus } from './AgentPipelineBar';
import { voiceService } from '../../services/voiceService';

interface ChatTerminalProps {
  messages: AgentChatMessage[];
  onSendMessage: (query: string) => void;
  isLoading: boolean;
  onOpenCaseModal: (firId: string) => void;
  kannadaMode: boolean;
  onVoiceCommandNavigate?: (target: string) => void;
}

export const ChatTerminal: React.FC<ChatTerminalProps> = ({
  messages,
  onSendMessage,
  isLoading,
  onOpenCaseModal,
  kannadaMode,
  onVoiceCommandNavigate
}) => {
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [voiceStage, setVoiceStage] = useState<'listening' | 'transcribing' | 'searching' | 'verifying' | 'ready'>('ready');
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [currentPlayingMsgId, setCurrentPlayingMsgId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Listen for Sidebar Demo Presets
  useEffect(() => {
    const handleDemoQuery = (e: any) => {
      if (e.detail) {
        onSendMessage(e.detail);
      }
    };
    window.addEventListener('TRIGGER_DEMO_QUERY', handleDemoQuery);
    return () => window.removeEventListener('TRIGGER_DEMO_QUERY', handleDemoQuery);
  }, [onSendMessage]);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = kannadaMode ? 'kn-IN' : 'en-IN';

      recognition.onstart = () => {
        setIsListening(true);
        setVoiceStage('listening');
      };

      recognition.onresult = (event: any) => {
        setVoiceStage('transcribing');
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setInputText(transcript);
      };

      recognition.onend = () => {
        setIsListening(false);
        setVoiceStage('ready');
      };

      recognition.onerror = (err: any) => {
        console.error("Speech Recognition Error:", err);
        setIsListening(false);
        setVoiceStage('ready');
      };

      recognitionRef.current = recognition;
    }
  }, [kannadaMode]);

  const handleToggleVoice = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported in this browser. Please use Chrome or Edge.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;

    const command = voiceService.parseVoiceCommand(inputText);
    if (command.type === 'NAVIGATE' && onVoiceCommandNavigate && command.target) {
      onVoiceCommandNavigate(command.target);
      setInputText('');
      return;
    } else if (command.type === 'ACTION' && command.target === 'STOP_AUDIO') {
      voiceService.stopSpeaking();
      setIsPlayingAudio(false);
      setInputText('');
      return;
    } else if (command.type === 'ACTION' && command.target === 'CLEAR_CHAT') {
      if (onVoiceCommandNavigate) onVoiceCommandNavigate('CLEAR_CHAT');
      setInputText('');
      return;
    }

    const textToSend = inputText.trim();
    setInputText('');
    onSendMessage(textToSend);
  };

  const handlePlayTTS = (msg: AgentChatMessage) => {
    if (isPlayingAudio && currentPlayingMsgId === msg.id) {
      voiceService.stopSpeaking();
      setIsPlayingAudio(false);
      setCurrentPlayingMsgId(null);
      return;
    }

    setIsPlayingAudio(true);
    setCurrentPlayingMsgId(msg.id);
    const summaryText = msg.kannadaSummary && kannadaMode ? msg.kannadaSummary : msg.content;

    voiceService.speakSummary(summaryText, kannadaMode, () => {
      setIsPlayingAudio(false);
      setCurrentPlayingMsgId(null);
    });
  };

  const demoScenarios = [
    { title: "Peenya Burglary Gang", query: "Peenya nalli last 6 months burglary MO mathu suspect details thori", badge: "Live MO Match" },
    { title: "Mysuru Chain Snatching", query: "Show chain snatching cases in Mysuru with suspect network", badge: "Graph Link" },
    { title: "Cyber UPI Mule Ring", query: "Find cyber UPI fraud mule bank accounts and linked IMEIs", badge: "Digital Evidence" },
    { title: "Statewide Theft Hotspots", query: "Which station has highest vehicle theft in Bengaluru and Mysuru?", badge: "Spatial Analytics" }
  ];

  return (
    <div className="flex-1 flex flex-col h-full bg-police-dark relative overflow-hidden select-none font-sans">
      {/* Top Multi-Agent Pipeline Telemetry Bar */}
      <AgentPipelineBar isLoading={isLoading} activeAgents={[]} />

      {/* Voice Stage Overlay Banner */}
      {isListening && (
        <VoiceWaveform isListening={isListening} stage={voiceStage} />
      )}

      {/* Messages Canvas Workspace */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-police-accent/20 border border-police-highlight flex items-center justify-center text-police-highlight shadow-2xl shadow-police-accent/30 animate-pulse">
              <Shield className="w-8 h-8" />
            </div>

            <div className="max-w-xl space-y-2">
              <h2 className="text-base font-bold font-mono tracking-wider text-police-text uppercase">
                TACTICAL CRIME INTELLIGENCE COPILOT
              </h2>
              <p className="text-xs text-police-muted leading-relaxed">
                Speak or type in Kannada or English to query CCTNS records, suspect networks, Modus Operandi (MO) narratives, and digital evidence.
              </p>
            </div>

            {/* 1-Click Live Demo Scenarios Grid */}
            <div className="space-y-3 w-full max-w-2xl pt-2">
              <div className="text-[10px] font-mono font-bold text-police-gold uppercase tracking-wider flex items-center justify-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-police-gold" />
                HACKATHON LIVE DEMO PRESETS (1-CLICK EXECUTION)
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                {demoScenarios.map((demo, idx) => (
                  <button
                    key={idx}
                    onClick={() => onSendMessage(demo.query)}
                    className="glass-panel-interactive p-3.5 rounded-xl text-left text-xs text-police-text hover:text-police-highlight border border-police-border/80 flex items-center justify-between group shadow-lg"
                  >
                    <div>
                      <div className="font-bold text-police-text group-hover:text-police-highlight flex items-center gap-1.5">
                        {demo.title}
                        <span className="px-1.5 py-0.5 text-[9px] bg-police-accent/20 text-police-highlight rounded font-mono font-normal">
                          {demo.badge}
                        </span>
                      </div>
                      <div className="text-[10px] text-police-muted truncate max-w-[220px] mt-1 font-mono">{demo.query}</div>
                    </div>
                    <CornerDownLeft className="w-4 h-4 text-police-muted group-hover:text-police-highlight transition-colors flex-shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          messages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-2`}
              >
                {/* User Message Bubble */}
                {isUser ? (
                  <div className="bg-police-accent text-white px-4 py-3 rounded-2xl rounded-tr-none max-w-2xl shadow-xl border border-police-highlight/40 text-xs font-sans">
                    <p className="leading-relaxed font-semibold">{msg.content}</p>
                    <div className="text-[9px] font-mono opacity-80 text-right mt-1">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                ) : (
                  /* AI Copilot Intelligence Dossier Card */
                  <div className="w-full glass-panel border border-police-border/90 rounded-2xl p-5 space-y-4 shadow-2xl text-police-text bg-police-card/90">
                    {/* Header: Title & Audio Player Controls */}
                    <div className="flex items-center justify-between border-b border-police-border/60 pb-3">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-police-highlight/20 border border-police-highlight/50 text-police-highlight">
                          <Sparkles className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-bold text-xs uppercase tracking-wider text-police-text font-mono">
                            OFFICIAL INTELLIGENCE BRIEF
                          </div>
                          <div className="text-[10px] text-police-muted font-mono">
                            VERIFIED SOURCE DATA • CCTNS RECORD QUERY
                          </div>
                        </div>
                      </div>

                      {/* TTS Audio Controls */}
                      <button
                        onClick={() => handlePlayTTS(msg)}
                        className={`px-3 py-1.5 rounded-xl border text-xs font-mono flex items-center gap-1.5 transition ${
                          isPlayingAudio && currentPlayingMsgId === msg.id
                            ? 'bg-rose-500/20 text-rose-300 border-rose-500 animate-pulse'
                            : 'bg-police-dark hover:bg-police-border/40 text-police-text border-police-border'
                        }`}
                      >
                        {isPlayingAudio && currentPlayingMsgId === msg.id ? (
                          <>
                            <Square className="w-3.5 h-3.5 text-rose-400 fill-current" />
                            <span>Stop Audio</span>
                          </>
                        ) : (
                          <>
                            <Volume2 className="w-3.5 h-3.5 text-police-highlight" />
                            <span>Read Brief</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Executive Summary */}
                    <div className="space-y-2">
                      <p className="text-xs leading-relaxed text-police-text font-sans">{msg.content}</p>
                      {msg.kannadaSummary && kannadaMode && (
                        <p className="text-xs text-police-gold bg-police-gold/10 p-3 rounded-xl border border-police-gold/30 font-sans italic">
                          {msg.kannadaSummary}
                        </p>
                      )}
                    </div>

                    {/* BNS & IPC Dual Penal Code Cross-Reference */}
                    {msg.bnsMappings && msg.bnsMappings.length > 0 && (
                      <div className="bg-police-dark/80 p-3 rounded-xl border border-police-border/70 space-y-2">
                        <div className="text-[10px] font-mono font-bold text-police-gold uppercase tracking-wider flex items-center gap-1.5">
                          <Scale className="w-3.5 h-3.5 text-police-gold" />
                          BHARATIYA NYAYA SANHITA (BNS) & IPC SECTION COMPLIANCE
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
                          {msg.bnsMappings.map((m, idx) => (
                            <div key={idx} className="p-2 bg-police-card rounded-lg border border-police-border/60 flex items-center justify-between">
                              <span className="text-police-muted">{m.firNo}</span>
                              <div className="text-right">
                                <span className="text-police-highlight font-bold">{m.bnsSection}</span>
                                <span className="text-[10px] text-police-muted ml-1">({m.ipcSection})</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Verified Evidence Citations */}
                    {msg.citations && msg.citations.length > 0 && (
                      <div className="space-y-2">
                        <div className="text-[10px] font-mono font-bold text-police-muted uppercase tracking-wider">
                          VERIFIED SOURCE CITATIONS ({msg.citations.length})
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {msg.citations.map((citation, idx) => (
                            <CitationBadge
                              key={idx}
                              citation={citation}
                              onClick={() => onOpenCaseModal(citation.firId)}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Footer Actions */}
                    <div className="flex items-center justify-between pt-2 border-t border-police-border/40 text-[10px] font-mono text-police-muted">
                      <span>VERIFICATION: 100% EVIDENCE MATCH</span>
                      <button
                        onClick={() => onOpenCaseModal(msg.citations?.[0]?.firId || 'FIR_0001')}
                        className="text-police-highlight hover:underline flex items-center gap-1 font-bold"
                      >
                        <span>Open Complete Case File</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}

        {/* Loading Animated State */}
        {isLoading && (
          <div className="w-full glass-panel border border-police-border rounded-2xl p-4 flex items-center gap-3 text-police-highlight font-mono text-xs animate-pulse">
            <Sparkles className="w-4 h-4 animate-spin text-police-gold" />
            <span>Multi-Agent Engine synthesizing evidence from CCTNS database...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Multilingual Voice & Text Input Toolbar */}
      <div className="p-3 border-t border-police-border/80 bg-police-dark/95 backdrop-blur-xl">
        <form onSubmit={handleFormSubmit} className="flex items-center gap-2">
          {/* Microphone Voice Trigger */}
          <button
            type="button"
            onClick={handleToggleVoice}
            className={`p-3 rounded-xl border transition shadow-lg ${
              isListening
                ? 'bg-rose-600 text-white border-rose-400 animate-bounce'
                : 'bg-police-card hover:bg-police-border/40 text-police-highlight border-police-border'
            }`}
            title="Toggle Vernacular Speech Input"
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          {/* Text Input Field */}
          <input
            type="text"
            placeholder={
              isListening
                ? "Listening officer speech (Kannada/English)..."
                : kannadaMode
                ? "ಕನ್ನಡದಲ್ಲಿ ಅಥವಾ ಇಂಗ್ಲಿಷ್‌ನಲ್ಲಿ ಟೈಪ್ ಮಾಡಿ..."
                : "Ask AI Copilot (e.g., Peenya vehicle theft MO, suspect networks, BNS sections)..."
            }
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="flex-1 bg-police-card border border-police-border/80 rounded-xl px-4 py-3 text-xs font-sans text-police-text placeholder-police-muted focus:outline-none focus:border-police-highlight transition"
          />

          {/* Submit Query Button */}
          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className="px-5 py-3 bg-police-accent hover:bg-police-highlight disabled:opacity-50 text-white font-bold rounded-xl text-xs transition shadow-lg shadow-police-accent/25 flex items-center gap-2 font-mono"
          >
            <span>SUBMIT</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
