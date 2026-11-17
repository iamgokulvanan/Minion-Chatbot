import React, { useState } from 'react';
import { 
  ChevronDown, 
  Sparkles, 
  Crown, 
  Mic, 
  SunMedium, 
  Moon, 
  Palette,
  ShieldCheck,
  Check
} from 'lucide-react';
import { useChat } from '../../contexts/ChatContext';
import { useTheme } from '../../contexts/ThemeContext';
import { AppTheme } from '../../types';

interface TopBarProps {
  onOpenVoice: () => void;
  onOpenSettings: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ onOpenVoice, onOpenSettings }) => {
  const { selectedModel, setSelectedModel, mascotState } = useChat();
  const { theme, setTheme } = useTheme();
  const [modelDropdownOpen, setModelDropdownOpen] = useState(false);
  const [themeDropdownOpen, setThemeDropdownOpen] = useState(false);

  const models = [
    { id: 'minion-core-v2.5', name: 'Minion Core v2.5', badge: 'Active', desc: 'Autonomous High-Speed Engine' },
    { id: 'gpt-4o', name: 'GPT-4o Multimodal', badge: 'Cloud API', desc: 'Complex reasoning & vision' },
    { id: 'claude-3-5-sonnet', name: 'Claude 3.5 Sonnet', badge: 'Cloud API', desc: 'Premier code architecture' },
    { id: 'deepseek-r1', name: 'DeepSeek R1', badge: 'Cloud API', desc: 'Mathematical reasoning' },
  ];

  const themes: { id: AppTheme; label: string; color: string }[] = [
    { id: 'midnight', label: 'Midnight Black', color: '#FFD600' },
    { id: 'electric_yellow', label: 'Electric Yellow', color: '#FFEA00' },
    { id: 'pure_dark', label: 'Pure Dark (OLED)', color: '#FFFFFF' },
    { id: 'cyber_glass', label: 'Cyber Glass (Cyan)', color: '#00D8FF' },
  ];

  return (
    <header className="h-16 px-6 flex items-center justify-between border-b border-white/5 relative z-20">
      {/* Left: Brand Pill Badge */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#111318] border border-white/10 shadow-sm">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-heading font-semibold text-xs tracking-wider text-white">
            MINION AI
          </span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#FFD600]/15 text-[#FFD600] font-mono font-medium">
            v2.5
          </span>
        </div>

        {/* Model Selector Dropdown */}
        <div className="relative">
          <button
            onClick={() => setModelDropdownOpen(!modelDropdownOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#171A20] hover:bg-[#20242D] border border-white/10 text-xs text-[#F5F5F5] transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#FFD600]" />
            <span className="font-medium hidden sm:inline">
              {models.find((m) => m.id === selectedModel)?.name || 'Minion Core'}
            </span>
            <ChevronDown className="w-3 h-3 text-[#9297A2]" />
          </button>

          {modelDropdownOpen && (
            <div className="absolute left-0 mt-2 w-72 rounded-2xl bg-[#111318] border border-white/10 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3 py-2 text-[11px] font-mono uppercase tracking-wider text-[#9297A2] border-b border-white/5">
                Select Intelligence Engine
              </div>
              <div className="space-y-1 mt-1">
                {models.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => {
                      setSelectedModel(m.id);
                      setModelDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors ${
                      selectedModel === m.id
                        ? 'bg-[#FFD600]/15 text-[#FFD600] border border-[#FFD600]/30'
                        : 'text-[#F5F5F5] hover:bg-white/5'
                    }`}
                  >
                    <div>
                      <div className="font-medium flex items-center gap-2">
                        {m.name}
                        {selectedModel === m.id && <Check className="w-3 h-3" />}
                      </div>
                      <div className="text-[10px] text-[#9297A2] mt-0.5">{m.desc}</div>
                    </div>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-[#9297A2] font-mono">
                      {m.badge}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right: Voice button, Theme selector, and Upgrade Button */}
      <div className="flex items-center gap-3">
        {/* Voice Assistant Button */}
        <button
          onClick={onOpenVoice}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#171A20] hover:bg-[#222630] border border-white/10 text-xs text-[#F5F5F5] transition-all hover:border-[#FFD600]/30"
          title="Open Voice Assistant"
        >
          <Mic className="w-3.5 h-3.5 text-[#00D8FF]" />
          <span className="hidden md:inline text-xs">Voice Mode</span>
        </button>

        {/* Theme Picker */}
        <div className="relative">
          <button
            onClick={() => setThemeDropdownOpen(!themeDropdownOpen)}
            className="w-8 h-8 rounded-full bg-[#171A20] hover:bg-[#20242D] border border-white/10 flex items-center justify-center text-[#9297A2] hover:text-white transition-colors"
            title="Appearance Themes"
          >
            <Palette className="w-3.5 h-3.5" />
          </button>

          {themeDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 rounded-2xl bg-[#111318] border border-white/10 shadow-2xl p-2 z-50">
              <div className="px-3 py-1.5 text-[11px] font-mono text-[#9297A2] uppercase">
                Theme Styles
              </div>
              <div className="space-y-1">
                {themes.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => {
                      setTheme(t.id);
                      setThemeDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 rounded-xl text-xs flex items-center justify-between transition-colors ${
                      theme === t.id ? 'bg-white/10 text-white font-medium' : 'text-[#9297A2] hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: t.color }} />
                      <span>{t.label}</span>
                    </div>
                    {theme === t.id && <Check className="w-3 h-3 text-[#FFD600]" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Upgrade / Pro Pill Button (Matching UI mockup) */}
        <button
          onClick={onOpenSettings}
          className="px-4 py-1.5 rounded-full bg-gradient-to-r from-[#0055ff] to-[#0099ff] hover:from-[#0066ff] hover:to-[#00bbff] text-white text-xs font-semibold shadow-[0_0_15px_rgba(0,140,255,0.4)] transition-all transform hover:scale-105 active:scale-95 flex items-center gap-1.5"
        >
          <Crown className="w-3.5 h-3.5 text-yellow-300" />
          <span>Upgrade</span>
        </button>
      </div>
    </header>
  );
};
