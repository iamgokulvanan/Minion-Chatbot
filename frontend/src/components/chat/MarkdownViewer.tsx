import React, { useState } from 'react';
import { Copy, Check, Download, Maximize2, X, Sparkles } from 'lucide-react';

interface MarkdownViewerProps {
  content: string;
}

export const MarkdownViewer: React.FC<MarkdownViewerProps> = ({ content }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);

  const handleCopyCode = (code: string, index: number) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleDownloadCode = (code: string, language: string) => {
    const extMap: Record<string, string> = {
      python: 'py',
      javascript: 'js',
      typescript: 'ts',
      html: 'html',
      css: 'css',
      json: 'json',
      sql: 'sql',
      cpp: 'cpp',
      c: 'c',
      rust: 'rs',
      go: 'go',
    };
    const ext = extMap[language.toLowerCase()] || 'txt';
    const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `minion_code_${Date.now()}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Split into code blocks vs regular markdown blocks
  const parts = content.split(/(```[\s\S]*?```)/g);

  return (
    <div className="space-y-2 text-xs sm:text-sm text-[#F5F5F5] leading-relaxed">
      {parts.map((part, pIdx) => {
        if (part.startsWith('```')) {
          // Fenced code block
          const match = part.match(/^```(\w+)?\n([\s\S]*?)```$/);
          const lang = (match && match[1]) ? match[1] : 'code';
          const codeBody = match ? match[2] : part.slice(3, -3);

          return (
            <div key={pIdx} className="my-3 rounded-2xl overflow-hidden border border-white/10 bg-[#08090B] shadow-lg">
              {/* Header */}
              <div className="flex items-center justify-between px-3.5 py-1.5 bg-[#111318] border-b border-white/5 text-[11px] font-mono text-[#9297A2]">
                <span className="uppercase font-semibold text-[#00D8FF]">{lang}</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopyCode(codeBody, pIdx)}
                    className="flex items-center gap-1 hover:text-white transition-colors"
                  >
                    {copiedIndex === pIdx ? <Check className="w-3.5 h-3.5 text-[#00FF88]" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedIndex === pIdx ? 'Copied' : 'Copy'}</span>
                  </button>
                  <button
                    onClick={() => handleDownloadCode(codeBody, lang)}
                    className="flex items-center gap-1 hover:text-[#FFD600] transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </button>
                </div>
              </div>

              {/* Code Pre */}
              <div className="p-3.5 overflow-x-auto font-mono text-xs text-[#E5E5E5] leading-5 bg-[#08090B]/90">
                <pre className="m-0 p-0">
                  <code>{codeBody}</code>
                </pre>
              </div>
            </div>
          );
        }

        // Regular markdown lines
        const lines = part.split('\n');
        return (
          <div key={pIdx} className="space-y-1.5">
            {lines.map((line, lIdx) => {
              const trimmed = line.trim();
              if (!trimmed) return <div key={lIdx} className="h-1" />;

              // Check for Markdown Image: ![alt](url)
              const imgMatch = trimmed.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
              if (imgMatch) {
                const alt = imgMatch[1];
                const src = imgMatch[2];
                return (
                  <div key={lIdx} className="my-4 rounded-3xl overflow-hidden border border-white/10 bg-[#08090B] shadow-2xl group relative max-w-xl">
                    <img
                      src={src}
                      alt={alt || "MINION AI Visual"}
                      className="w-full h-auto max-h-[460px] object-cover cursor-pointer transition-transform duration-300 group-hover:scale-[1.02]"
                      onClick={() => setZoomedImage(src)}
                    />
                    <div className="p-3 bg-[#111318]/90 backdrop-blur-md border-t border-white/5 flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs text-[#E5E5E5] truncate pr-2">
                        <Sparkles className="w-3.5 h-3.5 text-[#FFD600] flex-shrink-0" />
                        <span className="truncate font-medium">{alt || 'Generated AI Visual'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setZoomedImage(src)}
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white transition-colors"
                          title="Zoom In"
                        >
                          <Maximize2 className="w-3.5 h-3.5" />
                        </button>
                        <a
                          href={src}
                          download={`minion_ai_${Date.now()}.jpg`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded-lg bg-[#FFD600] hover:bg-[#FFE033] text-[#08090B] transition-colors"
                          title="Download Image"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  </div>
                );
              }

              // Headings
              if (trimmed.startsWith('### ')) {
                return (
                  <h3 key={lIdx} className="text-base sm:text-lg font-bold font-heading text-white mt-3 mb-1">
                    {parseInline(trimmed.slice(4))}
                  </h3>
                );
              }
              if (trimmed.startsWith('## ')) {
                return (
                  <h2 key={lIdx} className="text-lg sm:text-xl font-bold font-heading text-white mt-4 mb-2">
                    {parseInline(trimmed.slice(3))}
                  </h2>
                );
              }
              if (trimmed.startsWith('# ')) {
                return (
                  <h1 key={lIdx} className="text-xl sm:text-2xl font-bold font-heading text-[#FFD600] mt-4 mb-2">
                    {parseInline(trimmed.slice(2))}
                  </h1>
                );
              }

              // Blockquotes
              if (trimmed.startsWith('> ')) {
                return (
                  <blockquote key={lIdx} className="border-l-2 border-[#FFD600] pl-3 py-1 my-1 text-[#9297A2] italic bg-white/5 rounded-r-lg">
                    {parseInline(trimmed.slice(2))}
                  </blockquote>
                );
              }

              // List items
              if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
                return (
                  <div key={lIdx} className="flex items-start gap-2 pl-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#FFD600] mt-2 flex-shrink-0" />
                    <span className="flex-1">{parseInline(trimmed.slice(2))}</span>
                  </div>
                );
              }

              // Numbered list
              const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
              if (numMatch) {
                return (
                  <div key={lIdx} className="flex items-start gap-2 pl-2">
                    <span className="font-mono text-[#00D8FF] text-xs mt-0.5">{numMatch[1]}.</span>
                    <span className="flex-1">{parseInline(numMatch[2])}</span>
                  </div>
                );
              }

              // Paragraph
              return <p key={lIdx}>{parseInline(trimmed)}</p>;
            })}
          </div>
        );
      })}

      {/* Lightbox Modal for Zoomed Image */}
      {zoomedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-in fade-in"
          onClick={() => setZoomedImage(null)}
        >
          <button
            onClick={() => setZoomedImage(null)}
            className="absolute top-6 right-6 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={zoomedImage}
            alt="Zoomed Visual"
            className="max-w-[90vw] max-h-[90vh] object-contain rounded-2xl shadow-2xl border border-white/10"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
};

// Helper for inline elements: bold, italic, code, links
function parseInline(text: string): React.ReactNode {
  const segments = text.split(/(`[^`]+`|\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g);

  return segments.map((seg, i) => {
    if (seg.startsWith('`') && seg.endsWith('`')) {
      return (
        <code key={i} className="px-1.5 py-0.5 rounded-md bg-[#171A20] text-[#FFD600] font-mono text-xs">
          {seg.slice(1, -1)}
        </code>
      );
    }
    if (seg.startsWith('**') && seg.endsWith('**')) {
      return (
        <strong key={i} className="font-semibold text-white">
          {seg.slice(2, -2)}
        </strong>
      );
    }
    const linkMatch = seg.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (linkMatch) {
      return (
        <a
          key={i}
          href={linkMatch[2]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#00D8FF] hover:underline font-medium inline-flex items-center gap-0.5"
        >
          {linkMatch[1]}
        </a>
      );
    }
    return seg;
  });
}
