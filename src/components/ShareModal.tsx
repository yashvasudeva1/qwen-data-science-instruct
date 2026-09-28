import React, { useState } from 'react';
import { X, Copy, Check, Globe, Lock, Share2 } from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  conversationTitle?: string;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  conversationTitle = 'Vegapunk Intelligence Chat',
}) => {
  const [copied, setCopied] = useState(false);
  const shareUrl = `https://vegapunk.ai/share/${Math.random().toString(36).substring(2, 9)}`;

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs select-none">
      <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-xl p-6 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Share Conversation</h2>
              <p className="text-[11px] text-slate-500 truncate max-w-[240px]">{conversationTitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-slate-600 mb-4 leading-relaxed">
          Anyone with this link will be able to view this conversation snapshot and its generated interactive artifacts.
        </p>

        <div className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-200 rounded-xl mb-4">
          <input
            type="text"
            readOnly
            value={shareUrl}
            className="flex-1 bg-transparent text-xs text-slate-700 font-mono focus:outline-none truncate select-all"
          />
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium transition-colors shrink-0 cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100">
          <span className="flex items-center gap-1">
            <Globe className="w-3 h-3 text-emerald-600" />
            <span>Public snapshot</span>
          </span>
          <button onClick={onClose} className="hover:text-slate-700 underline">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
