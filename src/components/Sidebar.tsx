import React, { useState } from 'react';
import VegapunkLogo from './VegapunkLogo';
import { Conversation, UserProfile } from '../types';
import {
  Plus,
  Search,
  MessageSquare,
  FolderKanban,
  Star,
  MoreHorizontal,
  Trash2,
  Edit3,
  Settings,
  LogOut,
  ChevronDown,
  PanelLeftClose,
  PanelLeft,
  Sparkles,
  ExternalLink,
  Shield,
} from 'lucide-react';

interface SidebarProps {
  conversations: Conversation[];
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onNewChat: () => void;
  onDeleteConversation: (id: string) => void;
  onRenameConversation: (id: string, newTitle: string) => void;
  onToggleStarConversation: (id: string) => void;
  user: UserProfile;
  isOpen: boolean;
  onToggleOpen: () => void;
  onOpenSettings: () => void;
  onOpenProjects: () => void;
  onLogout: () => void;
  onGoToHome?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewChat,
  onDeleteConversation,
  onRenameConversation,
  onToggleStarConversation,
  user,
  isOpen,
  onToggleOpen,
  onOpenSettings,
  onOpenProjects,
  onLogout,
  onGoToHome,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const filteredConversations = conversations.filter((c) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const starredConversations = filteredConversations.filter((c) => c.isStarred);
  const unstarredConversations = filteredConversations.filter((c) => !c.isStarred);

  const handleStartRename = (c: Conversation, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(c.id);
    setEditTitle(c.title);
    setMenuOpenId(null);
  };

  const handleFinishRename = (id: string) => {
    if (editTitle.trim()) {
      onRenameConversation(id, editTitle.trim());
    }
    setEditingId(null);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 md:hidden"
          onClick={onToggleOpen}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 flex flex-col w-[280px] bg-[#F7F6F1] border-r border-[#E8E6DF] transition-all duration-300 ease-in-out select-none ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:-translate-x-[280px] md:w-0 md:border-r-0 md:overflow-hidden'
        }`}
      >
        {/* Top Workspace Header */}
        <div className="p-3.5 flex items-center justify-between border-b border-[#E8E6DF]">
          <div
            className="flex items-center gap-2.5 cursor-pointer px-1.5 py-1 rounded-lg hover:bg-slate-200/50 transition-colors"
            onClick={onNewChat}
          >
            <VegapunkLogo variant="full" size={26} />
          </div>

          <button
            onClick={onToggleOpen}
            className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-200/70 rounded-lg transition-colors cursor-pointer"
            title="Collapse sidebar (Ctrl+B)"
          >
            <PanelLeftClose className="w-4 h-4" />
          </button>
        </div>

        {/* Primary Action Button: Start New Chat */}
        <div className="p-3">
          <button
            onClick={onNewChat}
            className="w-full flex items-center justify-between px-3.5 py-2.5 bg-white border border-[#DDD9CE] hover:border-blue-300 hover:bg-blue-50/40 text-slate-900 rounded-xl font-medium text-sm transition-all shadow-xs group cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <span className="w-5 h-5 rounded-md bg-blue-600 text-white flex items-center justify-center transition-transform group-hover:scale-105">
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              </span>
              <span className="font-semibold text-slate-800 text-sm">Start new chat</span>
            </div>
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-slate-100 rounded border border-slate-200">
              Ctrl+K
            </kbd>
          </button>
        </div>

        {/* Quick Nav Links */}
        <div className="px-3 space-y-0.5 mb-2">
          <button
            onClick={onOpenProjects}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer text-left"
          >
            <FolderKanban className="w-4 h-4 text-blue-600 shrink-0" />
            <span className="flex-1">Punk Records Projects</span>
            <span className="text-[10px] bg-blue-100 text-blue-800 font-semibold px-1.5 py-0.2 rounded">
              Lab
            </span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="px-3 mb-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
            <input
              type="text"
              placeholder="Search chats..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-white/70 border border-[#E0DDD2] rounded-lg text-xs placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white transition-all"
            />
          </div>
        </div>

        {/* Conversations List Scroll Area */}
        <div className="flex-1 overflow-y-auto px-2 space-y-4 text-xs">
          {/* Starred Conversations */}
          {starredConversations.length > 0 && (
            <div>
              <div className="px-2 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                <span>Starred</span>
              </div>
              <div className="space-y-0.5 mt-0.5">
                {starredConversations.map((c) => renderConversationItem(c))}
              </div>
            </div>
          )}

          {/* Recent Conversations */}
          <div>
            <div className="px-2 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Recents
            </div>
            <div className="space-y-0.5 mt-0.5">
              {unstarredConversations.length === 0 && starredConversations.length === 0 ? (
                <div className="px-3 py-6 text-center text-slate-400">
                  <MessageSquare className="w-6 h-6 mx-auto mb-2 opacity-40 text-blue-600" />
                  <p className="text-xs">No conversations yet</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Start chatting with Vegapunk</p>
                </div>
              ) : (
                unstarredConversations.map((c) => renderConversationItem(c))
              )}
            </div>
          </div>
        </div>

        {/* Bottom User Profile Section */}
        <div className="p-3 border-t border-[#E8E6DF] relative">
          <div
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-200/60 transition-colors cursor-pointer group"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-semibold text-xs flex items-center justify-center shrink-0 shadow-xs">
                {user.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .toUpperCase() || 'VP'}
              </div>
              <div className="min-w-0 text-left">
                <p className="text-xs font-semibold text-slate-900 truncate">{user.name}</p>
                <div className="flex items-center gap-1 text-[11px] text-blue-700 font-medium">
                  <Sparkles className="w-3 h-3 shrink-0" />
                  <span>Vegapunk Pro</span>
                </div>
              </div>
            </div>
            <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
          </div>

          {/* User Popover Menu */}
          {userMenuOpen && (
            <div
              className="absolute bottom-16 left-3 right-3 bg-white rounded-xl shadow-lg border border-slate-200 p-1.5 z-50 animate-in fade-in slide-in-from-bottom-2 duration-150"
              onMouseLeave={() => setUserMenuOpen(false)}
            >
              <div className="px-3 py-2 border-b border-slate-100">
                <p className="text-xs font-semibold text-slate-800 truncate">{user.name}</p>
                <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
              </div>

              <div className="py-1">
                <button
                  onClick={() => {
                    setUserMenuOpen(false);
                    onOpenSettings();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                >
                  <Settings className="w-4 h-4 text-slate-500" />
                  <span>Settings</span>
                </button>

                <button
                  onClick={() => {
                    setUserMenuOpen(false);
                    onOpenProjects();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                >
                  <FolderKanban className="w-4 h-4 text-slate-500" />
                  <span>Custom Instructions & Projects</span>
                </button>

                {onGoToHome && (
                  <button
                    onClick={() => {
                      setUserMenuOpen(false);
                      onGoToHome();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                  >
                    <ExternalLink className="w-4 h-4 text-slate-500" />
                    <span>Landing Page & Specs</span>
                  </button>
                )}
              </div>

              <div className="pt-1 border-t border-slate-100">
                <button
                  onClick={() => {
                    setUserMenuOpen(false);
                    onLogout();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );

  function renderConversationItem(c: Conversation) {
    const isActive = activeConversationId === c.id;
    const isEditing = editingId === c.id;

    return (
      <div
        key={c.id}
        onClick={() => onSelectConversation(c.id)}
        className={`group relative flex items-center justify-between px-2.5 py-2 rounded-lg cursor-pointer transition-all ${
          isActive ? 'bg-[#EAE8E0] text-slate-900 font-medium' : 'text-slate-700 hover:bg-[#EFECE3]'
        }`}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1 pr-1">
          <MessageSquare className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
          {isEditing ? (
            <input
              type="text"
              value={editTitle}
              autoFocus
              onChange={(e) => setEditTitle(e.target.value)}
              onBlur={() => handleFinishRename(c.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleFinishRename(c.id);
                if (e.key === 'Escape') setEditingId(null);
              }}
              onClick={(e) => e.stopPropagation()}
              className="w-full bg-white px-1.5 py-0.5 rounded border border-blue-400 text-xs focus:outline-none"
            />
          ) : (
            <span className="truncate text-xs">{c.title}</span>
          )}
        </div>

        {/* Action icons on hover */}
        {!isEditing && (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleStarConversation(c.id);
              }}
              className="p-1 text-slate-400 hover:text-amber-500 transition-colors"
              title={c.isStarred ? 'Unstar chat' : 'Star chat'}
            >
              <Star className={`w-3 h-3 ${c.isStarred ? 'text-amber-500 fill-amber-500' : ''}`} />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpenId(menuOpenId === c.id ? null : c.id);
              }}
              className="p-1 text-slate-400 hover:text-slate-700 transition-colors"
            >
              <MoreHorizontal className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* Dropdown Options */}
        {menuOpenId === c.id && (
          <div
            className="absolute right-2 top-8 w-32 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-30 animate-in fade-in duration-100"
            onClick={(e) => e.stopPropagation()}
            onMouseLeave={() => setMenuOpenId(null)}
          >
            <button
              onClick={(e) => handleStartRename(c, e)}
              className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-100"
            >
              <Edit3 className="w-3.5 h-3.5 text-slate-400" />
              <span>Rename</span>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDeleteConversation(c.id);
                setMenuOpenId(null);
              }}
              className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>
          </div>
        )}
      </div>
    );
  }
};

export default Sidebar;
