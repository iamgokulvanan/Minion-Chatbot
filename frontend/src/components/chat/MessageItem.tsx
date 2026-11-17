import React, { useState } from 'react';
import { MarkdownViewer } from './MarkdownViewer';
import { 
  Copy, 
  Check, 
  Volume2, 
  VolumeX, 
  ThumbsUp, 
  ThumbsDown
} from 'lucide-react';
import { Message } from '../../types';
import { useAuth } from '../../contexts/AuthContext';

interface MessageItemProps {
  message: Message;
  isStreaming?: boolean;
}

export const MessageItem: React.FC<MessageItemProps> = ({ message, isStreaming = false }) => {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);

  const isAssistant = message.role === 'assistant';

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSpeak = () => {
    if (!('speechSynthesis' in window)) return;

    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(message.content.replace(/[#*`_]/g, ''));
    utterance.rate = 1.05;
    utterance.pitch = 1.05;
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);

    setSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div
      className={`flex gap-3 sm:gap-4 p-4 rounded-3xl transition-all ${
        isAssistant
          ? 'bg-[#111318]/70 border border-white/5 backdrop-blur-md'
          : 'bg-[#171A20]/40 border border-white/5'
      }`}
    >
      {/* Avatar */}
      <div className="flex-shrink-0 mt-0.5">
        {isAssistant ? (
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-2xl bg-[#08090B] border border-[#FFD600]/40 p-1 flex items-center justify-center shadow-[0_0_15px_rgba(255,214,0,0.25)]">
            <svg viewBox="0 0 32 32" className="w-full h-full">
              <circle cx="16" cy="16" r="14" fill="#171A20" stroke="#FFD600" strokeWidth="2" />
              <rect x="8" y="11" width="16" height="10" rx="5" fill="#08090B" />
              <circle cx="12" cy="16" r="2" fill="#FFD600" className="animate-pulse" />
              <circle cx="20" cy="16" r="2" fill="#FFD600" className="animate-pulse" />
            </svg>
          </div>
        ) : (
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-2xl overflow-hidden border border-white/10 bg-[#171A20]">
            <img
              src={user?.profile_image || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"}
              alt={user?.name || "User"}
              className="w-full h-full object-cover"
            />
          </div>
        )}
      </div>

      {/* Message Content Body */}
      <div className="flex-1 min-w-0">
        {/* Name and Timestamp */}
        <div className="flex items-center gap-2 mb-1.5">
          <span className="font-heading font-semibold text-xs text-white">
            {isAssistant ? 'MINION CORE' : (user?.name || 'You')}
          </span>
          <span className="text-[10px] font-mono text-[#9297A2]">
            {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>

        {/* Content Render with Markdown & Code Highlighting */}
        <div className="max-w-none text-xs sm:text-sm text-[#F5F5F5] leading-relaxed break-words">
          <MarkdownViewer content={message.content} />

          {isStreaming && (
            <span className="inline-block w-2 h-4 bg-[#FFD600] ml-1 animate-pulse align-middle" />
          )}
        </div>

        {/* Action bar for Assistant messages */}
        {isAssistant && message.content && (
          <div className="flex items-center gap-3 mt-3 pt-2 border-t border-white/5 text-xs text-[#9297A2]">
            <button
              onClick={handleCopyMessage}
              className="flex items-center gap-1 hover:text-white transition-colors"
              title="Copy Message"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-[#00FF88]" /> : <Copy className="w-3.5 h-3.5" />}
              <span className="text-[11px]">{copied ? 'Copied' : 'Copy'}</span>
            </button>

            <button
              onClick={handleSpeak}
              className={`flex items-center gap-1 transition-colors ${speaking ? 'text-[#00D8FF] animate-pulse' : 'hover:text-white'}`}
              title={speaking ? 'Stop Speaking' : 'Read Aloud'}
            >
              {speaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              <span className="text-[11px]">{speaking ? 'Mute' : 'Listen'}</span>
            </button>

            <button
              onClick={() => setFeedback(feedback === 'up' ? null : 'up')}
              className={`p-1 rounded transition-colors ${feedback === 'up' ? 'text-[#00FF88]' : 'hover:text-white'}`}
              title="Helpful"
            >
              <ThumbsUp className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => setFeedback(feedback === 'down' ? null : 'down')}
              className={`p-1 rounded transition-colors ${feedback === 'down' ? 'text-red-400' : 'hover:text-white'}`}
              title="Not Helpful"
            >
              <ThumbsDown className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
