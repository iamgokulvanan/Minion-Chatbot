import React, { useState } from 'react';
import { X, Search, Globe, ExternalLink, ArrowRight, Loader2, BookOpen } from 'lucide-react';
import { api } from '../../services/api';
import { ResearchResponse } from '../../types';
import { useChat } from '../../contexts/ChatContext';

interface WebResearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WebResearchModal: React.FC<WebResearchModalProps> = ({ isOpen, onClose }) => {
  const { sendMessage } = useChat();
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ResearchResponse | null>(null);

  if (!isOpen) return null;

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim() || isLoading) return;

    setIsLoading(true);
    try {
      const res = await api.performResearch(query);
      setResult(res);
    } catch (err) {
      console.error('Research failed', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendToChat = () => {
    if (!result) return;
    const text = `Please analyze this web research brief on "${result.query}":\n\n${result.summary}\n\nKey Takeaways:\n${result.key_takeaways.map(t => `- ${t}`).join('\n')}`;
    sendMessage(text, 'research');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-2xl max-h-[85vh] rounded-3xl bg-[#111318] border border-white/10 p-6 flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#00D8FF]/15 border border-[#00D8FF]/30 flex items-center justify-center text-[#00D8FF]">
              <Globe className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-base text-white">Autonomous Web Research</h3>
              <p className="text-[11px] text-[#9297A2]">Real-time multi-source exploration with authentic citations</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-[#9297A2] hover:text-white rounded-lg bg-white/5">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search Input Bar */}
        <form onSubmit={handleSearch} className="mt-4 flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#9297A2] absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Enter research topic (e.g., Quantum ML, Agentic Workflows)..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-[#08090B] border border-white/10 focus:border-[#00D8FF]/60 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-[#9297A2] outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading || !query.trim()}
            className="px-5 py-2.5 rounded-2xl bg-[#00D8FF] hover:bg-[#22EEFF] text-[#08090B] font-semibold text-xs transition-all shadow-[0_0_15px_rgba(0,216,255,0.4)] disabled:opacity-50 flex items-center gap-1.5"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            <span>Research</span>
          </button>
        </form>

        {/* Results Body */}
        <div className="mt-4 flex-1 overflow-y-auto space-y-4 pr-1">
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-12 text-[#9297A2] space-y-3">
              <Loader2 className="w-8 h-8 text-[#00D8FF] animate-spin" />
              <p className="text-xs font-mono">Minion is scraping verified indexes and synthesizing citations...</p>
            </div>
          )}

          {!isLoading && !result && (
            <div className="text-center py-12 text-[#9297A2] text-xs">
              Enter a search query above to gather verified citations and research briefs.
            </div>
          )}

          {!isLoading && result && (
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* Executive Summary */}
              <div className="p-4 rounded-2xl bg-[#171A20] border border-white/5">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#00D8FF] mb-2">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Executive Synthesis</span>
                </div>
                <p className="text-xs text-[#F5F5F5] leading-relaxed">{result.summary}</p>
              </div>

              {/* Key Takeaways */}
              <div className="p-4 rounded-2xl bg-[#171A20] border border-white/5">
                <div className="text-xs font-semibold text-[#FFD600] mb-2">Key Takeaways</div>
                <ul className="space-y-1.5 text-xs text-[#E5E5E5]">
                  {result.key_takeaways.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#FFD600] mt-1.5 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Verified Sources */}
              <div>
                <div className="text-xs font-semibold text-white mb-2">Verified Citations</div>
                <div className="space-y-2">
                  {result.sources.map((s, idx) => (
                    <a
                      key={idx}
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group block p-3 rounded-xl bg-[#08090B] hover:bg-[#171A20] border border-white/5 hover:border-[#00D8FF]/30 transition-all text-xs"
                    >
                      <div className="flex items-center justify-between text-[#00D8FF] font-medium mb-1">
                        <span className="truncate pr-2">{s.title}</span>
                        <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                      </div>
                      <p className="text-[11px] text-[#9297A2] line-clamp-2">{s.snippet}</p>
                      <span className="inline-block mt-1 text-[10px] font-mono text-[#FFD600]">
                        {s.domain}
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {result && (
          <div className="pt-4 border-t border-white/5 flex justify-end">
            <button
              onClick={handleSendToChat}
              className="px-4 py-2 rounded-xl bg-[#FFD600] hover:bg-[#FFE033] text-[#08090B] text-xs font-semibold flex items-center gap-2 shadow-md hover:scale-105 transition-transform"
            >
              <span>Discuss in Workspace</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
