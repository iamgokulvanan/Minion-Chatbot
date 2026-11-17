import React, { useState, useRef, useEffect } from 'react';
import { 
  Paperclip, 
  Send, 
  Mic, 
  MicOff, 
  Square, 
  X, 
  FileText, 
  Image as ImageIcon,
  Sparkles,
  ChevronUp,
  Cpu
} from 'lucide-react';
import { useChat } from '../../contexts/ChatContext';
import { api } from '../../services/api';

interface ChatInputBarProps {
  onOpenVoiceModal?: () => void;
  externalPrompt?: string;
  onClearExternalPrompt?: () => void;
}

export const ChatInputBar: React.FC<ChatInputBarProps> = ({
  onOpenVoiceModal,
  externalPrompt,
  onClearExternalPrompt,
}) => {
  const {
    sendMessage,
    isGenerating,
    stopGeneration,
    attachedFiles,
    addAttachedFile,
    removeAttachedFile,
    activeMode,
    setActiveMode,
    setMascotState,
  } = useChat();

  const [input, setInput] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [modeMenuOpen, setModeMenuOpen] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (externalPrompt) {
      setInput(externalPrompt);
      if (onClearExternalPrompt) onClearExternalPrompt();
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    }
  }, [externalPrompt]);

  // Adjust textarea height dynamically
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  }, [input]);

  // Initialize Speech Recognition if supported
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        setMascotState('listening');
      };

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = 0; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setInput(transcript);
      };

      recognition.onerror = () => {
        setIsListening(false);
        setMascotState('idle');
      };

      recognition.onend = () => {
        setIsListening(false);
        setMascotState('idle');
      };

      recognitionRef.current = recognition;
    }
  }, [setMascotState]);

  const toggleSpeechRecognition = () => {
    if (!recognitionRef.current) {
      if (onOpenVoiceModal) onOpenVoiceModal();
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (e) {
        if (onOpenVoiceModal) onOpenVoiceModal();
      }
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const uploaded = await api.uploadFile(file);
      addAttachedFile(uploaded);
    } catch (err) {
      console.error('File upload failed', err);
      alert('Failed to upload file. Please try again.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = () => {
    if ((!input.trim() && attachedFiles.length === 0) || isGenerating) return;
    sendMessage(input);
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const modes = [
    { id: 'general', label: 'General AI', desc: 'Balanced reasoning & synthesis' },
    { id: 'image', label: '🎨 Image Gen', desc: 'Flux.1 Ultra-HD AI Visual Art' },
    { id: 'code', label: 'Code Architect', desc: 'Full-stack software engineering' },
    { id: 'research', label: 'Web Research', desc: 'Real-time citations & search' },
    { id: 'document', label: 'Doc Intelligence', desc: 'PDF & text extraction' },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto px-4 pb-6 pt-2">
      {/* Attached Files Strip */}
      {attachedFiles.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2 px-1">
          {attachedFiles.map((f) => (
            <div
              key={f.id}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#171A20] border border-white/10 text-xs text-white shadow-sm animate-in fade-in"
            >
              {f.file_type.includes('image') ? (
                <ImageIcon className="w-3.5 h-3.5 text-[#00D8FF]" />
              ) : (
                <FileText className="w-3.5 h-3.5 text-[#FFD600]" />
              )}
              <span className="truncate max-w-[160px] font-medium">{f.filename}</span>
              <button
                onClick={() => removeAttachedFile(f.id)}
                className="p-0.5 text-[#9297A2] hover:text-white rounded"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Main Glass Floating Command Bar (Matching UI Mockup) */}
      <div className="relative rounded-3xl bg-[#111318]/90 backdrop-blur-xl border border-white/10 shadow-[0_10px_35px_rgba(0,0,0,0.6)] focus-within:border-[#00D8FF]/50 transition-all p-3">
        {/* Inner Top Helpers / Mode Bar */}
        <div className="flex items-center justify-between px-2 pb-1.5 text-xs text-[#9297A2]">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-[#9297A2]">
              Minion Core Intelligence
            </span>
          </div>
          {isGenerating && (
            <div className="flex items-center gap-1.5 text-[#FFD600] text-[11px] font-mono animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FFD600]" />
              Streaming response...
            </div>
          )}
        </div>

        {/* Text Area */}
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask Minion anything... (Enter to send, Shift + Enter for new line)"
          rows={1}
          className="w-full bg-transparent text-[#F5F5F5] placeholder-[#9297A2]/60 px-3 py-1.5 text-sm outline-none resize-none min-h-[44px] max-h-[180px]"
        />

        {/* Bottom Control Bar */}
        <div className="flex items-center justify-between pt-2 border-t border-white/5 mt-1 px-1">
          {/* Left Actions: Attachment + Mode Pill */}
          <div className="flex items-center gap-2">
            {/* File Upload Attachment Button */}
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileUpload}
              className="hidden"
              accept=".pdf,.txt,.md,.json,.csv,.py,.js,.ts,.png,.jpg,.jpeg,.webp"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="w-9 h-9 rounded-full bg-[#171A20] hover:bg-[#20242D] border border-white/10 flex items-center justify-center text-[#9297A2] hover:text-[#FFD600] transition-colors"
              title="Attach PDF, Document, or Image"
            >
              <Paperclip className={`w-4 h-4 ${isUploading ? 'animate-spin' : ''}`} />
            </button>

            {/* Mode / Capability Pill Button */}
            <div className="relative">
              <button
                onClick={() => setModeMenuOpen(!modeMenuOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#171A20] hover:bg-[#20242D] border border-white/10 text-xs text-[#E5E5E5] transition-all"
              >
                <Cpu className="w-3.5 h-3.5 text-[#00D8FF]" />
                <span className="font-medium capitalize">{activeMode} Mode</span>
              </button>

              {modeMenuOpen && (
                <div className="absolute bottom-full left-0 mb-2 w-64 rounded-2xl bg-[#111318] border border-white/10 shadow-2xl p-2 z-50 animate-in fade-in duration-150">
                  <div className="px-3 py-1.5 text-[10px] font-mono uppercase text-[#9297A2]">
                    Operational Modes
                  </div>
                  <div className="space-y-1">
                    {modes.map((m) => (
                      <button
                        key={m.id}
                        onClick={() => {
                          setActiveMode(m.id);
                          setModeMenuOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs transition-colors ${
                          activeMode === m.id
                            ? 'bg-[#FFD600]/15 text-[#FFD600] font-medium'
                            : 'text-[#9297A2] hover:text-white hover:bg-white/5'
                        }`}
                      >
                        <div>{m.label}</div>
                        <div className="text-[10px] opacity-75">{m.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Actions: Voice Mic + Send / Stop Button */}
          <div className="flex items-center gap-2">
            {/* Microphone Button */}
            <button
              onClick={toggleSpeechRecognition}
              className={`w-9 h-9 rounded-full flex items-center justify-center border transition-all ${
                isListening
                  ? 'bg-red-500/20 border-red-500 text-red-400 shadow-[0_0_12px_rgba(239,68,68,0.5)] animate-pulse'
                  : 'bg-[#171A20] hover:bg-[#20242D] border-white/10 text-[#9297A2] hover:text-[#00D8FF]'
              }`}
              title={isListening ? 'Stop Listening' : 'Voice Input'}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            {/* Send or Stop Generation Button (Matching circular blue/yellow send in UI mockup) */}
            {isGenerating ? (
              <button
                onClick={stopGeneration}
                className="w-9 h-9 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center shadow-[0_0_14px_rgba(239,68,68,0.5)] transition-transform active:scale-95"
                title="Stop Response Generation"
              >
                <Square className="w-4 h-4 fill-white" />
              </button>
            ) : (
              <button
                onClick={handleSend}
                disabled={!input.trim() && attachedFiles.length === 0}
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                  input.trim() || attachedFiles.length > 0
                    ? 'bg-gradient-to-tr from-[#0066FF] to-[#00D8FF] hover:from-[#0077FF] hover:to-[#22EEFF] text-white shadow-[0_0_18px_rgba(0,140,255,0.6)] scale-105 active:scale-95'
                    : 'bg-[#171A20] text-[#9297A2]/50 border border-white/5 cursor-not-allowed'
                }`}
                title="Send Message (Enter)"
              >
                <Send className="w-4 h-4 -translate-x-0.5 translate-y-0.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
