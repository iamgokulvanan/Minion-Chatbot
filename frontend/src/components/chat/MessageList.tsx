import React, { useEffect, useRef } from 'react';
import { MessageItem } from './MessageItem';
import { Message } from '../../types';

interface MessageListProps {
  messages: Message[];
  isGenerating: boolean;
}

export const MessageList: React.FC<MessageListProps> = ({ messages, isGenerating }) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isGenerating]);

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6 max-w-4xl w-full mx-auto space-y-4">
      {messages.map((m, idx) => {
        const isLast = idx === messages.length - 1;
        const isStreamingThis = isLast && isGenerating && m.role === 'assistant';

        // Skip rendering empty placeholder assistant bubble until content starts streaming
        if (m.role === 'assistant' && !m.content && !isGenerating) {
          return null;
        }

        return (
          <MessageItem
            key={m.id || idx}
            message={m}
            isStreaming={isStreamingThis}
          />
        );
      })}

      {/* Thinking state before first chunk */}
      {isGenerating && messages[messages.length - 1]?.role === 'user' && (
        <div className="flex items-center gap-3 p-4 rounded-3xl bg-[#111318]/60 border border-white/5 animate-pulse">
          <div className="w-8 h-8 rounded-2xl bg-[#171A20] border border-[#FFD600]/40 flex items-center justify-center">
            <span className="w-2 h-2 rounded-full bg-[#FFD600] animate-ping" />
          </div>
          <div className="text-xs text-[#9297A2] font-mono">
            Minion Core is analyzing and synthesizing response...
          </div>
        </div>
      )}

      <div ref={bottomRef} className="h-4" />
    </div>
  );
};
