import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Conversation, Message, UploadedFileItem, MascotState } from '../types';
import { api } from '../services/api';
import { useAuth } from './AuthContext';

interface ChatContextType {
  conversations: Conversation[];
  currentConversationId: string | null;
  messages: Message[];
  isGenerating: boolean;
  mascotState: MascotState;
  setMascotState: (s: MascotState) => void;
  selectedModel: string;
  setSelectedModel: (m: string) => void;
  activeMode: string;
  setActiveMode: (m: string) => void;
  attachedFiles: UploadedFileItem[];
  addAttachedFile: (f: UploadedFileItem) => void;
  removeAttachedFile: (id: string) => void;
  clearAttachedFiles: () => void;
  sendMessage: (content: string, modeOverride?: string) => Promise<void>;
  stopGeneration: () => void;
  selectConversation: (id: string) => Promise<void>;
  newChat: () => void;
  deleteConversation: (id: string) => Promise<void>;
  togglePinConversation: (id: string) => Promise<void>;
  renameConversation: (id: string, newTitle: string) => Promise<void>;
  refreshConversations: () => Promise<void>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [mascotState, setMascotState] = useState<MascotState>('idle');
  const [selectedModel, setSelectedModel] = useState<string>('minion-core-v2.5');
  const [activeMode, setActiveMode] = useState<string>('general');
  const [attachedFiles, setAttachedFiles] = useState<UploadedFileItem[]>([]);
  
  const abortControllerRef = useRef<AbortController | null>(null);

  const refreshConversations = async () => {
    if (!user) return;
    try {
      const list = await api.getConversations();
      setConversations(list);
    } catch (e) {
      console.error('Failed to load conversations', e);
    }
  };

  useEffect(() => {
    if (user) {
      refreshConversations();
    }
  }, [user]);

  const selectConversation = async (id: string) => {
    try {
      setCurrentConversationId(id);
      const detail = await api.getConversation(id);
      setMessages(detail.messages || []);
      setMascotState('idle');
    } catch (e) {
      console.error('Failed to load conversation details', e);
    }
  };

  const newChat = () => {
    setCurrentConversationId(null);
    setMessages([]);
    setMascotState('idle');
    setAttachedFiles([]);
  };

  const addAttachedFile = (f: UploadedFileItem) => {
    setAttachedFiles((prev) => [...prev, f]);
  };

  const removeAttachedFile = (id: string) => {
    setAttachedFiles((prev) => prev.filter((item) => item.id !== id));
  };

  const clearAttachedFiles = () => {
    setAttachedFiles([]);
  };

  const stopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsGenerating(false);
    setMascotState('idle');
  };

  const sendMessage = async (content: string, modeOverride?: string) => {
    if (!content.trim() && attachedFiles.length === 0) return;
    if (isGenerating) return;

    const currentMode = modeOverride || activeMode;
    const fileIds = attachedFiles.map((f) => f.id);
    const tempUserId = `user-${Date.now()}`;
    const tempAssistantId = `asst-${Date.now()}`;

    // Optimistically add user message
    const userMsg: Message = {
      id: tempUserId,
      conversation_id: currentConversationId || 'pending',
      role: 'user',
      content: content.trim(),
      attachments_meta: attachedFiles.length ? JSON.stringify(attachedFiles.map(f => ({ id: f.id, name: f.filename }))) : undefined,
      created_at: new Date().toISOString(),
    };

    const assistantMsgPlaceholder: Message = {
      id: tempAssistantId,
      conversation_id: currentConversationId || 'pending',
      role: 'assistant',
      content: '',
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg, assistantMsgPlaceholder]);
    setIsGenerating(true);
    setMascotState('thinking');
    clearAttachedFiles();

    abortControllerRef.current = new AbortController();

    let fullReply = '';

    api.streamChatMessage(
      {
        content: content.trim(),
        conversation_id: currentConversationId || undefined,
        model: selectedModel,
        file_ids: fileIds,
        mode: currentMode,
      },
      {
        onInit: (initData) => {
          if (!currentConversationId && initData.conversation_id) {
            setCurrentConversationId(initData.conversation_id);
          }
        },
        onChunk: (chunk) => {
          setMascotState('responding');
          fullReply += chunk;
          setMessages((prev) => {
            const next = [...prev];
            const lastIndex = next.length - 1;
            if (lastIndex >= 0 && next[lastIndex].id === tempAssistantId) {
              next[lastIndex] = {
                ...next[lastIndex],
                content: fullReply,
              };
            }
            return next;
          });
        },
        onDone: (doneData) => {
          setIsGenerating(false);
          setMascotState('success');
          refreshConversations();
          setTimeout(() => {
            setMascotState('idle');
          }, 3000);
        },
        onError: (err) => {
          setIsGenerating(false);
          setMascotState('error');
          setMessages((prev) => {
            const next = [...prev];
            const lastIndex = next.length - 1;
            if (lastIndex >= 0 && next[lastIndex].id === tempAssistantId) {
              next[lastIndex] = {
                ...next[lastIndex],
                content: fullReply || `Error: ${err.message}. Please check connection or try again.`,
              };
            }
            return next;
          });
          setTimeout(() => {
            setMascotState('idle');
          }, 4000);
        },
      },
      abortControllerRef.current.signal
    );
  };

  const deleteConversation = async (id: string) => {
    try {
      await api.deleteConversation(id);
      if (currentConversationId === id) {
        newChat();
      }
      refreshConversations();
    } catch (e) {
      console.error('Failed to delete chat', e);
    }
  };

  const togglePinConversation = async (id: string) => {
    const target = conversations.find((c) => c.id === id);
    if (!target) return;
    try {
      await api.updateConversation(id, { is_pinned: !target.is_pinned });
      refreshConversations();
    } catch (e) {
      console.error('Failed to pin conversation', e);
    }
  };

  const renameConversation = async (id: string, newTitle: string) => {
    try {
      await api.updateConversation(id, { title: newTitle });
      refreshConversations();
    } catch (e) {
      console.error('Failed to rename conversation', e);
    }
  };

  return (
    <ChatContext.Provider
      value={{
        conversations,
        currentConversationId,
        messages,
        isGenerating,
        mascotState,
        setMascotState,
        selectedModel,
        setSelectedModel,
        activeMode,
        setActiveMode,
        attachedFiles,
        addAttachedFile,
        removeAttachedFile,
        clearAttachedFiles,
        sendMessage,
        stopGeneration,
        selectConversation,
        newChat,
        deleteConversation,
        togglePinConversation,
        renameConversation,
        refreshConversations,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) throw new Error('useChat must be used within ChatProvider');
  return context;
};
