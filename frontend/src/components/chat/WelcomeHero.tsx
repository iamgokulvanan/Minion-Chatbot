import React from 'react';
import { MinionCore3D } from '../mascot/MinionCore3D';
import { useAuth } from '../../contexts/AuthContext';
import { useChat } from '../../contexts/ChatContext';
import { 
  Code, 
  FileText, 
  Globe, 
  Lightbulb, 
  Cpu, 
  Wrench,
  Sparkles
} from 'lucide-react';

interface WelcomeHeroProps {
  onSelectPrompt: (prompt: string, mode?: string) => void;
}

export const WelcomeHero: React.FC<WelcomeHeroProps> = ({ onSelectPrompt }) => {
  const { user } = useAuth();
  const { mascotState } = useChat();

  const userName = user?.name || 'Rolex';

  const suggestionPills = [
    { label: '🎨 Image Gen', icon: Sparkles, mode: 'image', prompt: 'Generate an image of a futuristic yellow cybernetic AI robot mascot with glowing neon holographic rings in a high-tech obsidian lab.' },
    { label: 'Coding', icon: Code, mode: 'code', prompt: 'Generate a high-performance TypeScript microservice architecture with async queue processing.' },
    { label: 'Document Analysis', icon: FileText, mode: 'document', prompt: 'How do I extract insights and structural summaries from a complex PDF document?' },
    { label: 'Web Research', icon: Globe, mode: 'research', prompt: 'Research the latest breakthrough models in autonomous multi-agent systems and latency reduction.' },
    { label: 'Deep Reasoning', icon: Cpu, mode: 'general', prompt: 'Explain the core principles of quantum error correction and surface code stabilizers.' },
    { label: 'Troubleshoot', icon: Wrench, mode: 'code', prompt: 'Help me debug a memory leak and race condition in a high-concurrency Node.js/Python server.' },
  ];

  return (
    <div className="flex flex-col items-center justify-center flex-1 max-w-4xl mx-auto px-4 py-8 text-center select-none animate-in fade-in duration-300">
      {/* 3D Mascot Centerpiece */}
      <div className="relative mb-4 flex items-center justify-center">
        <div className="absolute inset-0 bg-[#FFD600]/10 blur-3xl rounded-full pointer-events-none" />
        <MinionCore3D state={mascotState} size="lg" />
      </div>

      {/* Hero Greeting (Matching UI mockup style: "Welcome Back Rolex!") */}
      <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white flex items-center justify-center gap-2">
        <span>Welcome Back</span>
        <span className="bg-gradient-to-r from-[#00D8FF] via-[#0099FF] to-[#FFD600] bg-clip-text text-transparent">
          {userName}!
        </span>
      </h1>

      {/* Subtitle */}
      <p className="mt-2 text-sm sm:text-base text-[#9297A2] max-w-lg">
        What intelligence task or design would you like feedback on?
      </p>

      {/* Suggested Prompt Chips (Below Input or in Welcome Area) */}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-2.5 max-w-2xl">
        {suggestionPills.map((p) => {
          const Icon = p.icon;
          return (
            <button
              key={p.label}
              onClick={() => onSelectPrompt(p.prompt, p.mode)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-[#171A20]/80 hover:bg-[#222632] border border-white/10 hover:border-[#FFD600]/40 text-xs text-[#E5E5E5] hover:text-white transition-all transform hover:-translate-y-0.5 active:translate-y-0 shadow-sm"
            >
              <Icon className="w-3.5 h-3.5 text-[#00D8FF]" />
              <span className="font-medium">{p.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
