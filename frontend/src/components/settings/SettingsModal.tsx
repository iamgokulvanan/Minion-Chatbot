import React, { useState } from 'react';
import { 
  X, 
  Settings as SettingsIcon, 
  Palette, 
  Cpu, 
  Volume2, 
  Database, 
  User as UserIcon, 
  Check,
  Shield,
  Key,
  Save,
  LogOut
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useChat } from '../../contexts/ChatContext';
import { AppTheme } from '../../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAuth: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, onOpenAuth }) => {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const { selectedModel, setSelectedModel } = useChat();

  const [activeTab, setActiveTab] = useState<'appearance' | 'models' | 'voice' | 'memory' | 'account'>('appearance');
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [systemPrompt, setSystemPrompt] = useState('You are MINION AI — brilliant, concise, futuristic, and helpful.');
  const [voiceRate, setVoiceRate] = useState(1.0);
  const [memoryEnabled, setMemoryEnabled] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const themes: { id: AppTheme; label: string; desc: string; bg: string; accent: string }[] = [
    { id: 'midnight', label: 'Midnight Black', desc: 'Deep graphite with electric yellow accents', bg: '#08090B', accent: '#FFD600' },
    { id: 'electric_yellow', label: 'Electric Yellow', desc: 'Vibrant neon cyber-robotic theme', bg: '#0B0B07', accent: '#FFEA00' },
    { id: 'pure_dark', label: 'Pure Dark OLED', desc: 'True zero-light black with silver border', bg: '#000000', accent: '#FFFFFF' },
    { id: 'cyber_glass', label: 'Cyber Glass (Cyan)', desc: 'Inspired by the holographic UI mockup', bg: '#050B14', accent: '#00D8FF' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-2xl max-h-[85vh] rounded-3xl bg-[#111318] border border-white/10 flex flex-col shadow-2xl overflow-hidden">
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <div className="flex items-center gap-2">
            <SettingsIcon className="w-5 h-5 text-[#FFD600]" />
            <h3 className="font-heading font-bold text-base text-white">Minion Preferences & Settings</h3>
          </div>
          <button onClick={onClose} className="p-1.5 text-[#9297A2] hover:text-white rounded-lg bg-white/5">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Layout */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left Tab Navigation */}
          <div className="w-48 border-r border-white/5 p-3 space-y-1 bg-[#08090B]/50">
            <button
              onClick={() => setActiveTab('appearance')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                activeTab === 'appearance' ? 'bg-[#FFD600]/15 text-[#FFD600]' : 'text-[#9297A2] hover:text-white hover:bg-white/5'
              }`}
            >
              <Palette className="w-4 h-4" /> Appearance
            </button>

            <button
              onClick={() => setActiveTab('models')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                activeTab === 'models' ? 'bg-[#FFD600]/15 text-[#FFD600]' : 'text-[#9297A2] hover:text-white hover:bg-white/5'
              }`}
            >
              <Cpu className="w-4 h-4" /> AI Models & Keys
            </button>

            <button
              onClick={() => setActiveTab('voice')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                activeTab === 'voice' ? 'bg-[#FFD600]/15 text-[#FFD600]' : 'text-[#9297A2] hover:text-white hover:bg-white/5'
              }`}
            >
              <Volume2 className="w-4 h-4" /> Voice & Speech
            </button>

            <button
              onClick={() => setActiveTab('memory')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                activeTab === 'memory' ? 'bg-[#FFD600]/15 text-[#FFD600]' : 'text-[#9297A2] hover:text-white hover:bg-white/5'
              }`}
            >
              <Database className="w-4 h-4" /> Memory & Privacy
            </button>

            <button
              onClick={() => setActiveTab('account')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                activeTab === 'account' ? 'bg-[#FFD600]/15 text-[#FFD600]' : 'text-[#9297A2] hover:text-white hover:bg-white/5'
              }`}
            >
              <UserIcon className="w-4 h-4" /> Account & Profile
            </button>
          </div>

          {/* Right Tab Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            {/* Appearance Tab */}
            {activeTab === 'appearance' && (
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-white">Visual Theme</h4>
                <p className="text-xs text-[#9297A2]">Select your preferred atmosphere and accent lighting.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                  {themes.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setTheme(t.id)}
                      className={`text-left p-3.5 rounded-2xl border transition-all ${
                        theme === t.id
                          ? 'border-[#FFD600] bg-[#171A20] shadow-[0_0_15px_rgba(255,214,0,0.2)]'
                          : 'border-white/10 bg-[#08090B] hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-semibold text-xs text-white">{t.label}</span>
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: t.accent }} />
                      </div>
                      <p className="text-[11px] text-[#9297A2]">{t.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* AI Models Tab */}
            {activeTab === 'models' && (
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-white">AI Engine & Provider Keys</h4>
                <p className="text-xs text-[#9297A2]">Configure custom OpenAI-compatible API key or base URL.</p>

                <div>
                  <label className="block text-xs font-medium text-white mb-1.5">OpenAI-Compatible API Key</label>
                  <div className="relative">
                    <Key className="w-4 h-4 text-[#9297A2] absolute left-3 top-2.5" />
                    <input
                      type="password"
                      placeholder="sk-..."
                      value={apiKeyInput}
                      onChange={(e) => setApiKeyInput(e.target.value)}
                      className="w-full bg-[#08090B] border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-[#9297A2] outline-none focus:border-[#FFD600]"
                    />
                  </div>
                  <span className="text-[10px] text-[#9297A2] mt-1 block">
                    Works with OpenAI, Groq, OpenRouter, DeepSeek, or local Ollama endpoints.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-medium text-white mb-1.5">Custom System Instruction</label>
                  <textarea
                    rows={3}
                    value={systemPrompt}
                    onChange={(e) => setSystemPrompt(e.target.value)}
                    className="w-full bg-[#08090B] border border-white/10 rounded-xl p-3 text-xs text-white outline-none focus:border-[#FFD600]"
                  />
                </div>
              </div>
            )}

            {/* Voice Tab */}
            {activeTab === 'voice' && (
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-white">Voice Assistant Settings</h4>
                <p className="text-xs text-[#9297A2]">Fine-tune speech synthesis rate and microphone reactivity.</p>

                <div>
                  <div className="flex justify-between text-xs text-white mb-1.5">
                    <span>Speech Rate</span>
                    <span className="font-mono text-[#FFD600]">{voiceRate}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.7"
                    max="1.4"
                    step="0.05"
                    value={voiceRate}
                    onChange={(e) => setVoiceRate(parseFloat(e.target.value))}
                    className="w-full accent-[#FFD600]"
                  />
                </div>
              </div>
            )}

            {/* Memory Tab */}
            {activeTab === 'memory' && (
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-white">Conversation Memory & Privacy</h4>
                <p className="text-xs text-[#9297A2]">Control how Minion retains past context within sessions.</p>

                <div className="flex items-center justify-between p-3 rounded-2xl bg-[#08090B] border border-white/5">
                  <div>
                    <div className="text-xs font-semibold text-white">Enable Multi-Turn Memory</div>
                    <div className="text-[11px] text-[#9297A2]">Remembers prior messages in the active chat session.</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={memoryEnabled}
                    onChange={(e) => setMemoryEnabled(e.target.checked)}
                    className="w-4 h-4 accent-[#FFD600] rounded"
                  />
                </div>
              </div>
            )}

            {/* Account Tab */}
            {activeTab === 'account' && (
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-white">User Profile</h4>
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-[#08090B] border border-white/5">
                  <img
                    src={user?.profile_image || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"}
                    alt={user?.name || "Profile"}
                    className="w-12 h-12 rounded-full object-cover border-2 border-[#FFD600]/40"
                  />
                  <div>
                    <div className="text-sm font-bold text-white">{user?.name || 'Rolex'}</div>
                    <div className="text-xs text-[#9297A2]">{user?.email || 'rolex@minion.ai'}</div>
                    <span className="inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full bg-[#00D8FF]/20 text-[#00D8FF] font-medium">
                      Active Session
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      onClose();
                      onOpenAuth();
                    }}
                    className="px-4 py-2 rounded-xl bg-[#171A20] hover:bg-[#20242D] border border-white/10 text-xs text-white"
                  >
                    Switch User / Login
                  </button>
                  <button
                    onClick={logout}
                    className="px-4 py-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 text-xs flex items-center gap-1.5"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Reset / Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-white/5 bg-[#08090B]">
          <span className="text-[11px] text-[#00FF88]">
            {savedSuccess ? 'Preferences saved successfully!' : ''}
          </span>
          <div className="flex gap-2">
            <button onClick={onClose} className="px-4 py-1.5 text-xs text-[#9297A2] hover:text-white">
              Close
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-1.5 rounded-xl bg-[#FFD600] text-[#08090B] font-semibold text-xs flex items-center gap-1.5 shadow-md"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Changes</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
