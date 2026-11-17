import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Pin, 
  Trash2, 
  Edit3, 
  X, 
  MessageSquare,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { useChat } from '../../contexts/ChatContext';
import { Conversation } from '../../types';

interface SidebarDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SidebarDrawer: React.FC<SidebarDrawerProps> = ({ isOpen, onClose }) => {
  const {
    conversations,
    currentConversationId,
    selectConversation,
    newChat,
    deleteConversation,
    togglePinConversation,
    renameConversation,
  } = useChat();

  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  if (!isOpen) return null;

  const filtered = conversations.filter((c) =>
    c.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const pinned = filtered.filter((c) => c.is_pinned);
  const unpinned = filtered.filter((c) => !c.is_pinned);

  const handleStartRename = (c: Conversation, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(c.id);
    setEditTitle(c.title);
  };

  const handleSaveRename = (id: string) => {
    if (editTitle.trim()) {
      renameConversation(id, editTitle.trim());
    }
    setEditingId(null);
  };

  const renderConversationItem = (c: Conversation) => {
    const isSelected = currentConversationId === c.id;
    const isEditing = editingId === c.id;

    return (
      <div
        key={c.id}
        onClick={() => {
          selectConversation(c.id);
          onClose();
        }}
        className={`group relative flex items-center justify-between p-2.5 rounded-xl text-xs cursor-pointer transition-all ${
          isSelected
            ? 'bg-[#FFD600]/15 text-[#FFD600] border border-[#FFD600]/30 shadow-sm'
            : 'text-[#9297A2] hover:text-[#F5F5F5] hover:bg-white/5 border border-transparent'
        }`}
      >
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <MessageSquare className={`w-3.5 h-3.5 flex-shrink-0 ${isSelected ? 'text-[#FFD600]' : 'text-[#9297A2]'}`} />
          {isEditing ? (
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSaveRename(c.id);
                if (e.key === 'Escape') setEditingId(null);
              }}
              onBlur={() => handleSaveRename(c.id)}
              autoFocus
              className="bg-[#08090B] border border-[#FFD600] text-white px-2 py-0.5 rounded text-xs w-full outline-none"
            />
          ) : (
            <span className="truncate font-medium">{c.title}</span>
          )}
        </div>

        {/* Action icons on hover */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              togglePinConversation(c.id);
            }}
            className="p-1 hover:text-[#FFD600]"
            title={c.is_pinned ? 'Unpin' : 'Pin'}
          >
            <Pin className={`w-3 h-3 ${c.is_pinned ? 'fill-[#FFD600] text-[#FFD600]' : ''}`} />
          </button>
          <button
            onClick={(e) => handleStartRename(c, e)}
            className="p-1 hover:text-white"
            title="Rename"
          >
            <Edit3 className="w-3 h-3" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              deleteConversation(c.id);
            }}
            className="p-1 hover:text-red-400"
            title="Delete"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-40 flex">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Drawer */}
      <div className="relative w-80 max-w-[85vw] h-full bg-[#111318] border-r border-white/10 flex flex-col p-4 shadow-2xl z-50">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/5">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#FFD600]" />
            <h3 className="font-heading font-semibold text-sm text-white">Conversation History</h3>
          </div>
          <button onClick={onClose} className="p-1 text-[#9297A2] hover:text-white rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* New Chat Button */}
        <button
          onClick={() => {
            newChat();
            onClose();
          }}
          className="mt-4 w-full py-2.5 px-3 rounded-xl bg-[#171A20] hover:bg-[#20242D] border border-white/10 text-xs font-semibold text-white flex items-center justify-center gap-2 shadow-sm transition-all hover:border-[#FFD600]/40"
        >
          <Plus className="w-4 h-4 text-[#FFD600]" />
          <span>New Conversation</span>
        </button>

        {/* Search Input */}
        <div className="mt-3 relative">
          <Search className="w-3.5 h-3.5 text-[#9297A2] absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#08090B] border border-white/10 focus:border-[#FFD600]/50 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-[#9297A2] outline-none"
          />
        </div>

        {/* Conversations List */}
        <div className="mt-4 flex-1 overflow-y-auto space-y-4 pr-1">
          {pinned.length > 0 && (
            <div>
              <div className="text-[10px] uppercase font-mono tracking-wider text-[#9297A2] px-2 mb-1.5 flex items-center gap-1">
                <Pin className="w-2.5 h-2.5 text-[#FFD600]" /> Pinned
              </div>
              <div className="space-y-1">{pinned.map(renderConversationItem)}</div>
            </div>
          )}

          <div>
            <div className="text-[10px] uppercase font-mono tracking-wider text-[#9297A2] px-2 mb-1.5">
              Recent Chats
            </div>
            {unpinned.length === 0 && pinned.length === 0 ? (
              <div className="text-center py-8 text-xs text-[#9297A2]">
                No conversations yet. Start a new one!
              </div>
            ) : (
              <div className="space-y-1">{unpinned.map(renderConversationItem)}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
