import React, { useState } from 'react';
import { UserProfile } from '../types';
import {
  X,
  User,
  Sliders,
  Sparkles,
  CreditCard,
  Check,
  Moon,
  Sun,
  Shield,
  Zap,
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onUpdateUser: (updated: Partial<UserProfile>) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  user,
  onUpdateUser,
}) => {
  const [activeTab, setActiveTab] = useState<'general' | 'account' | 'capabilities' | 'billing'>('general');
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('light');
  const [autoOpenArtifacts, setAutoOpenArtifacts] = useState(true);
  const [defaultExtendedThinking, setDefaultExtendedThinking] = useState(true);
  const [soundEffects, setSoundEffects] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs select-none">
      <div className="w-full max-w-2xl bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <h2 className="text-base font-bold text-slate-900 font-serif">Vegapunk Settings</h2>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Layout */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Left Navigation Tabs */}
          <div className="w-full md:w-48 border-r border-slate-200 p-2 space-y-1 bg-slate-50/30">
            <button
              onClick={() => setActiveTab('general')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                activeTab === 'general' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>General</span>
            </button>

            <button
              onClick={() => setActiveTab('account')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                activeTab === 'account' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Account</span>
            </button>

            <button
              onClick={() => setActiveTab('capabilities')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                activeTab === 'capabilities' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Capabilities</span>
            </button>

            <button
              onClick={() => setActiveTab('billing')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                activeTab === 'billing' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Plan & Usage</span>
            </button>
          </div>

          {/* Right Panel */}
          <div className="flex-1 p-6 overflow-y-auto space-y-6 text-sm text-slate-700">
            {activeTab === 'general' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
                    Appearance
                  </h3>
                  <div className="grid grid-cols-3 gap-3">
                    {(['light', 'dark', 'system'] as const).map((t) => (
                      <button
                        key={t}
                        onClick={() => setTheme(t)}
                        className={`p-3 rounded-xl border text-center transition-all cursor-pointer capitalize text-xs font-semibold ${
                          theme === t
                            ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-2xs'
                            : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
                    Accessibility & Sound
                  </h3>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-semibold text-slate-800">Sound Feedback</div>
                      <div className="text-[11px] text-slate-500">Play subtle audio chime on message completion</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={soundEffects}
                      onChange={(e) => setSoundEffects(e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'account' && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
                    User Profile
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-medium text-slate-600">Full Name</label>
                      <input
                        type="text"
                        value={user.name}
                        onChange={(e) => onUpdateUser({ name: e.target.value })}
                        className="w-full mt-1 px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-600">Email Address</label>
                      <input
                        type="email"
                        value={user.email}
                        disabled
                        className="w-full mt-1 px-3 py-2 text-xs border border-slate-200 rounded-lg bg-slate-50 text-slate-500 cursor-not-allowed"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-blue-50/80 border border-blue-200 text-xs">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-blue-600" />
                      <span className="font-semibold text-blue-900">Enterprise Security Active</span>
                    </div>
                    <span className="text-blue-700 font-semibold">Compliant</span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'capabilities' && (
              <div className="space-y-4">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
                  Vegapunk Intelligence Engine
                </h3>
                
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <div className="text-xs font-semibold text-slate-800">Auto-open Interactive Artifacts</div>
                    <div className="text-[11px] text-slate-500">Automatically expand side-by-side preview when code or UI is created</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={autoOpenArtifacts}
                    onChange={(e) => setAutoOpenArtifacts(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <div className="text-xs font-semibold text-slate-800">Extended Thinking by Default</div>
                    <div className="text-[11px] text-slate-500">Apply deep reasoning passes before generating structured answers</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={defaultExtendedThinking}
                    onChange={(e) => setDefaultExtendedThinking(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                  />
                </div>
              </div>
            )}

            {activeTab === 'billing' && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 text-white shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-blue-200" />
                      <span className="text-xs font-bold uppercase tracking-wider text-blue-100">Current Subscription</span>
                    </div>
                    <span className="px-2 py-0.5 bg-white/20 rounded-full text-[10px] font-semibold">Active</span>
                  </div>
                  <div className="text-xl font-bold font-serif mb-1">Vegapunk Pro (Data Science Edition)</div>
                  <p className="text-xs text-blue-100">
                    Unlimited Vegapunk DS 3.7 access, fine-tuned on tabular ML, deep learning, statistical inference, and accelerated reasoning queues.
                  </p>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-slate-500">
                    <span>Usage Cycle</span>
                    <span className="font-semibold text-slate-800">18% utilized</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-blue-600 h-full w-[18%] rounded-full"></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 flex justify-end bg-slate-50/50">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs rounded-xl transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
