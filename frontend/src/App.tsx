import React, { useState } from 'react';
import { LeftRailDock } from './components/layout/LeftRailDock';
import { TopBar } from './components/layout/TopBar';
import { SidebarDrawer } from './components/layout/SidebarDrawer';
import { WelcomeHero } from './components/chat/WelcomeHero';
import { MessageList } from './components/chat/MessageList';
import { ChatInputBar } from './components/chat/ChatInputBar';
import { VoiceModal } from './components/voice/VoiceModal';
import { WebResearchModal } from './components/research/WebResearchModal';
import { SettingsModal } from './components/settings/SettingsModal';
import { AuthModal } from './components/auth/AuthModal';
import { EmailViewerModal } from './components/auth/EmailViewerModal';
import { useChat } from './contexts/ChatContext';
import { useAuth } from './contexts/AuthContext';
import { Mail, CheckCircle, X } from 'lucide-react';

export const App: React.FC = () => {
  const { currentConversationId, messages, isGenerating, sendMessage } = useChat();
  const { lastEmailNotification, dismissEmailNotification } = useAuth();

  const [activeTab, setActiveTab] = useState<'chat' | 'history' | 'search' | 'research' | 'settings' | 'models'>('chat');
  const [historyOpen, setHistoryOpen] = useState(false);
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [researchOpen, setResearchOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [stagedPrompt, setStagedPrompt] = useState<string>('');

  const handleSelectPrompt = (prompt: string, mode?: string) => {
    sendMessage(prompt, mode);
  };

  const hasMessages = currentConversationId && messages.length > 0;

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#08090B] text-[#F5F5F5] relative select-none">
      {/* Background Ambient Lighting (Matching UI mockup atmospheric glow) */}
      <div className="absolute top-1/4 left-1/3 w-[600px] h-[600px] bg-[#0055ff]/12 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-[#FFD600]/8 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute top-10 right-10 w-[350px] h-[350px] bg-[#00D8FF]/10 rounded-full blur-[120px] pointer-events-none" />

      {/* 1. Left Vertical Rail Dock */}
      <LeftRailDock
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenSettings={() => setSettingsOpen(true)}
        onOpenResearch={() => setResearchOpen(true)}
        onOpenHistory={() => setHistoryOpen(true)}
      />

      {/* 2. Main Stage Glass Card Container (Matching UI Mockup) */}
      <main className="flex-1 flex flex-col p-2 sm:p-4 md:p-6 pl-0 overflow-hidden z-10">
        <div className="flex-1 flex flex-col rounded-3xl bg-[#0D111A]/85 border border-white/10 backdrop-blur-2xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] overflow-hidden relative">
          {/* Top Bar inside Stage */}
          <TopBar
            onOpenVoice={() => setVoiceOpen(true)}
            onOpenSettings={() => setSettingsOpen(true)}
          />

          {/* Email Notification Toast Banner */}
          {lastEmailNotification && (
            <div className="mx-4 mt-2 p-2.5 rounded-2xl bg-gradient-to-r from-[#00D8FF]/20 to-[#FFD600]/20 border border-[#00D8FF]/40 flex items-center justify-between text-xs animate-in slide-in-from-top duration-300 shadow-lg">
              <div className="flex items-center gap-2 text-white">
                <CheckCircle className="w-4 h-4 text-[#00FF88] flex-shrink-0" />
                <span>
                  <strong>Login Verified:</strong> Security alert email sent to{' '}
                  <span className="font-mono text-[#00D8FF]">{lastEmailNotification.to}</span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setEmailModalOpen(true)}
                  className="px-2.5 py-1 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-[11px] flex items-center gap-1 transition-colors"
                >
                  <Mail className="w-3 h-3 text-[#FFD600]" />
                  <span>View Sent Email</span>
                </button>
                <button
                  onClick={dismissEmailNotification}
                  className="p-1 text-[#9297A2] hover:text-white rounded-lg"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Central Workspace Area */}
          <div className="flex-1 flex flex-col overflow-hidden relative">
            {!hasMessages ? (
              <WelcomeHero onSelectPrompt={handleSelectPrompt} />
            ) : (
              <MessageList messages={messages} isGenerating={isGenerating} />
            )}
          </div>

          {/* Bottom Floating Command Input */}
          <ChatInputBar
            onOpenVoiceModal={() => setVoiceOpen(true)}
            externalPrompt={stagedPrompt}
            onClearExternalPrompt={() => setStagedPrompt('')}
          />
        </div>
      </main>

      {/* Modals & Drawers */}
      <SidebarDrawer
        isOpen={historyOpen}
        onClose={() => setHistoryOpen(false)}
      />

      <VoiceModal
        isOpen={voiceOpen}
        onClose={() => setVoiceOpen(false)}
      />

      <WebResearchModal
        isOpen={researchOpen}
        onClose={() => setResearchOpen(false)}
      />

      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onOpenAuth={() => setAuthOpen(true)}
      />

      <AuthModal
        isOpen={authOpen}
        onClose={() => setAuthOpen(false)}
      />

      <EmailViewerModal
        email={lastEmailNotification}
        onClose={() => setEmailModalOpen(false)}
      />
    </div>
  );
};
