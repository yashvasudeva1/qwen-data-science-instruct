import React from 'react';
import { PanelLeft, Database } from 'lucide-react';

interface HeaderProps {
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  conversationTitle?: string;
  onGoToHome?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  isSidebarOpen,
  onToggleSidebar,
  conversationTitle,
  onGoToHome,
}) => {
  return (
    <header className="h-14 border-b border-[#E8E6DF] bg-[#FAF9F5]/90 backdrop-blur-xs flex items-center justify-between px-4 sticky top-0 z-30 select-none">
      {/* Left Area: Sidebar toggle + Fixed Fine-tuned Data Science Model Badge */}
      <div className="flex items-center gap-2">
        {!isSidebarOpen && (
          <button
            onClick={onToggleSidebar}
            className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-200/70 rounded-lg transition-colors cursor-pointer"
            title="Open sidebar (Ctrl+B)"
          >
            <PanelLeft className="w-4 h-4" />
          </button>
        )}

        {/* Fixed Model Indicator */}
        <div 
          className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-blue-50/80 border border-blue-200/90 text-slate-800"
          title="Vegapunk fine-tuned on Data Science, ML & Statistics"
        >
          <div className="flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span className="text-xs font-bold text-slate-900 tracking-tight font-sans">
              Vegapunk DS 3.7
            </span>
          </div>

          <div className="h-3 w-px bg-blue-200 hidden sm:block"></div>

          <div className="flex items-center gap-1 text-[11px] font-semibold text-blue-700">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse"></span>
            <span className="hidden sm:inline">Fine-tuned Data Science</span>
            <span className="sm:hidden">DS Edition</span>
          </div>
        </div>
      </div>

      {/* Middle Area: Conversation Title (if active) */}
      <div className="flex items-center justify-center flex-1 px-4 truncate">
        {conversationTitle && (
          <span className="text-xs text-slate-500 font-medium truncate max-w-md">
            {conversationTitle}
          </span>
        )}
      </div>

      {/* Right Area: Clean spacing and Home button */}
      <div className="flex items-center gap-2">
        {onGoToHome && (
          <button
            onClick={onGoToHome}
            className="text-xs text-slate-500 hover:text-slate-900 px-2.5 py-1 rounded-md hover:bg-slate-200/50 transition-colors cursor-pointer"
            title="View Landing Page & Capabilities"
          >
            Home
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;
