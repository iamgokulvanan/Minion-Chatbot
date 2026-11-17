import React from 'react';
import { 
  Search, 
  Clock, 
  LayoutGrid, 
  Sparkles, 
  Settings, 
  Plus, 
  MessageSquare,
  Globe,
  FileText
} from 'lucide-react';
import { useChat } from '../../contexts/ChatContext';
import { useAuth } from '../../contexts/AuthContext';

interface LeftRailDockProps {
  activeTab: 'chat' | 'history' | 'search' | 'research' | 'settings' | 'models';
  setActiveTab: (tab: 'chat' | 'history' | 'search' | 'research' | 'settings' | 'models') => void;
  onOpenSettings: () => void;
  onOpenResearch: () => void;
  onOpenHistory: () => void;
}

export const LeftRailDock: React.FC<LeftRailDockProps> = ({
  activeTab,
  setActiveTab,
  onOpenSettings,
  onOpenResearch,
  onOpenHistory,
}) => {
  const { newChat, currentConversationId } = useChat();
  const { user } = useAuth();

  return (
    <aside className="w-16 md:w-20 h-full flex flex-col items-center justify-between py-6 px-2 z-30 select-none">
      {/* Top: Brand AI Mascot Logo Badge */}
      <div className="flex flex-col items-center gap-6">
        <button
          onClick={newChat}
          className="group relative w-11 h-11 md:w-12 md:h-12 rounded-2xl bg-[#111318] border border-[#FFD600]/40 flex items-center justify-center p-1.5 shadow-[0_0_20px_rgba(255,214,0,0.25)] transition-all duration-300 hover:scale-110 active:scale-95"
          title="MINION AI – New Chat"
        >
          {/* Futuristic Mascot Mini SVG */}
          <svg viewBox="0 0 40 40" className="w-full h-full">
            <defs>
              <linearGradient id="minionGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFD600" />
                <stop offset="100%" stopColor="#00D8FF" />
              </linearGradient>
            </defs>
            <circle cx="20" cy="20" r="17" fill="#171A20" stroke="url(#minionGlow)" strokeWidth="2.5" />
            <rect x="10" y="14" width="20" height="12" rx="6" fill="#08090B" />
            <circle cx="16" cy="20" r="2.5" fill="#FFD600" className="animate-pulse" />
            <circle cx="24" cy="20" r="2.5" fill="#FFD600" className="animate-pulse" />
          </svg>
          <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-[#FFD600] rounded-full border-2 border-[#08090B] flex items-center justify-center">
            <Plus className="w-2.5 h-2.5 text-[#08090B] stroke-[3]" />
          </div>
        </button>

        {/* Action Dock Rail Icons */}
        <div className="flex flex-col items-center gap-3.5">
          {/* New Chat / Workspace */}
          <button
            onClick={() => setActiveTab('chat')}
            className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-300 ${
              activeTab === 'chat' && !currentConversationId
                ? 'bg-[#FFD600] text-[#08090B] shadow-[0_0_18px_rgba(255,214,0,0.5)] scale-105'
                : 'text-[#9297A2] hover:text-[#F5F5F5] hover:bg-[#171A20] border border-white/5'
            }`}
            title="Chat Workspace"
          >
            <MessageSquare className="w-5 h-5" />
          </button>

          {/* Search Conversations */}
          <button
            onClick={() => {
              setActiveTab('search');
              onOpenHistory();
            }}
            className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-300 ${
              activeTab === 'search'
                ? 'bg-[#00D8FF] text-[#08090B] shadow-[0_0_18px_rgba(0,216,255,0.4)]'
                : 'text-[#9297A2] hover:text-[#F5F5F5] hover:bg-[#171A20] border border-white/5'
            }`}
            title="Search History"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* History / Clock */}
          <button
            onClick={() => {
              setActiveTab('history');
              onOpenHistory();
            }}
            className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-300 ${
              activeTab === 'history'
                ? 'bg-[#FFD600] text-[#08090B] shadow-[0_0_18px_rgba(255,214,0,0.4)]'
                : 'text-[#9297A2] hover:text-[#F5F5F5] hover:bg-[#171A20] border border-white/5'
            }`}
            title="Conversation History"
          >
            <Clock className="w-5 h-5" />
          </button>

          {/* Web Research Agent */}
          <button
            onClick={onOpenResearch}
            className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-300 ${
              activeTab === 'research'
                ? 'bg-[#00D8FF] text-[#08090B] shadow-[0_0_18px_rgba(0,216,255,0.4)]'
                : 'text-[#9297A2] hover:text-[#F5F5F5] hover:bg-[#171A20] border border-white/5'
            }`}
            title="Web Research"
          >
            <Globe className="w-5 h-5" />
          </button>

          {/* AI Tools / Explore */}
          <button
            onClick={() => {
              setActiveTab('models');
              onOpenSettings();
            }}
            className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-300 ${
              activeTab === 'models'
                ? 'bg-[#FFD600] text-[#08090B] shadow-[0_0_18px_rgba(255,214,0,0.4)]'
                : 'text-[#9297A2] hover:text-[#F5F5F5] hover:bg-[#171A20] border border-white/5'
            }`}
            title="AI Models & Capabilities"
          >
            <Sparkles className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Bottom: Settings & User Profile Avatar */}
      <div className="flex flex-col items-center gap-4">
        {/* Settings Gear Button */}
        <button
          onClick={onOpenSettings}
          className="w-11 h-11 rounded-2xl flex items-center justify-center text-[#9297A2] hover:text-[#FFD600] hover:bg-[#171A20] border border-white/5 transition-all duration-200 hover:rotate-45"
          title="Settings & Preferences"
        >
          <Settings className="w-5 h-5" />
        </button>

        {/* User Avatar */}
        <button
          onClick={onOpenSettings}
          className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-[#FFD600]/40 p-0.5 hover:scale-105 transition-transform"
          title={user?.name || 'User Profile'}
        >
          <img
            src={user?.profile_image || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"}
            alt={user?.name || "Profile"}
            className="w-full h-full object-cover rounded-full"
          />
          <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border border-[#08090B]" />
        </button>
      </div>
    </aside>
  );
};
