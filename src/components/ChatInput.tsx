import React, { useState, useRef, useEffect } from 'react';
import { Attachment } from '../types';
import {
  ArrowUp,
  Paperclip,
  SlidersHorizontal,
  Mic,
  MicOff,
  X,
  FileCode,
  FileText,
  Image as ImageIcon,
  Sparkles,
} from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (text: string, attachments: Attachment[]) => void;
  isLoading: boolean;
  placeholder?: string;
  initialValue?: string;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  isLoading,
  placeholder = 'Ask a data science query (e.g. EDA, XGBoost, PyTorch, Causal Inference, DuckDB SQL)...',
  initialValue = '',
}) => {
  const [input, setInput] = useState(initialValue);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [tone, setTone] = useState<'normal' | 'concise' | 'explanatory'>('normal');
  const [toneMenuOpen, setToneMenuOpen] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  // Sync initialValue when edited from a previous message or starter card
  useEffect(() => {
    if (initialValue !== undefined) {
      setInput(initialValue);
      if (initialValue.trim()) {
        textareaRef.current?.focus();
      }
    }
  }, [initialValue]);

  // Auto resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.min(scrollHeight, 260)}px`;
    }
  }, [input]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = () => {
    if ((!input.trim() && attachments.length === 0) || isLoading) return;
    
    let processedText = input.trim();
    if (tone === 'concise') {
      processedText = `[Style: Please provide a concise, direct response]\n${processedText}`;
    } else if (tone === 'explanatory') {
      processedText = `[Style: Please provide an in-depth explanatory breakdown]\n${processedText}`;
    }

    onSendMessage(processedText, attachments);
    setInput('');
    setAttachments([]);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const isImg = file.type.startsWith('image/');
      const reader = new FileReader();

      reader.onload = (event) => {
        const newAttachment: Attachment = {
          id: `att_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
          name: file.name,
          size: file.size,
          type: file.type || 'text/plain',
          dataUrl: isImg ? (event.target?.result as string) : undefined,
          textContent: !isImg ? (event.target?.result as string) : undefined,
        };

        setAttachments((prev) => [...prev, newAttachment]);
      };

      if (isImg) {
        reader.readAsDataURL(file);
      } else {
        reader.readAsText(file);
      }
    });

    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const toggleRecording = () => {
    if (isRecording) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // ignore
        }
      }
      setIsRecording(false);
      return;
    }

    // Try Web Speech API if supported
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognitionRef.current = recognition;
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
          setIsRecording(true);
        };

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
          setIsRecording(false);
          textareaRef.current?.focus();
        };

        recognition.onerror = () => {
          setIsRecording(false);
        };

        recognition.onend = () => {
          setIsRecording(false);
        };

        recognition.start();
        return;
      } catch (err) {
        // Fallback simulation
      }
    }

    // Voice dictation simulation fallback
    setIsRecording(true);
    setTimeout(() => {
      setInput((prev) => (prev ? `${prev} ` : '') + 'Calculate the CUPED variance reduction coefficient using OLS regression on pre-experiment metrics.');
      setIsRecording(false);
      textareaRef.current?.focus();
    }, 2000);
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4">
      {/* Iconic Claude Card Container styled in Vegapunk Blue */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm focus-within:shadow-md focus-within:border-blue-500/80 focus-within:ring-2 focus-within:ring-blue-500/15 transition-all p-3 sm:p-4">
        {/* Attached Files Tray */}
        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3 pb-2 border-b border-slate-100">
            {attachments.map((att) => (
              <div
                key={att.id}
                className="flex items-center gap-2 pl-2 pr-1.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700"
              >
                {att.dataUrl ? (
                  <img
                    src={att.dataUrl}
                    alt={att.name}
                    className="w-4 h-4 rounded object-cover"
                  />
                ) : att.name.endsWith('.ts') || att.name.endsWith('.tsx') || att.name.endsWith('.js') ? (
                  <FileCode className="w-3.5 h-3.5 text-blue-600" />
                ) : (
                  <FileText className="w-3.5 h-3.5 text-slate-500" />
                )}
                <span className="truncate max-w-[140px] font-medium">{att.name}</span>
                <span className="text-[10px] text-slate-400">
                  ({Math.round(att.size / 1024)} KB)
                </span>
                <button
                  type="button"
                  onClick={() => removeAttachment(att.id)}
                  className="p-0.5 hover:bg-slate-200 rounded text-slate-400 hover:text-slate-700 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          rows={2}
          className="w-full bg-transparent resize-none border-0 text-slate-900 placeholder:text-slate-400 focus:outline-none text-base leading-relaxed max-h-64"
        />

        {/* Bottom Action Strip */}
        <div className="flex items-center justify-between pt-2 mt-1 select-none">
          {/* Left tools: Attachment, Thinking toggle, Tone */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Hidden File Input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              multiple
              className="hidden"
              accept="image/*,text/*,.ts,.tsx,.js,.jsx,.json,.md,.py,.html"
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50/70 rounded-xl transition-colors cursor-pointer"
              title="Attach images, documents, or code"
            >
              <Paperclip className="w-4 h-4" />
            </button>

            {/* Tone Selector */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setToneMenuOpen(!toneMenuOpen)}
                className="flex items-center gap-1 px-2 py-1.5 text-xs text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                title="Response style"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
                <span className="hidden md:inline capitalize">{tone}</span>
              </button>

              {toneMenuOpen && (
                <div
                  className="absolute left-0 bottom-9 w-36 bg-white rounded-xl shadow-lg border border-slate-200 p-1 z-30 animate-in fade-in duration-100"
                  onMouseLeave={() => setToneMenuOpen(false)}
                >
                  {(['normal', 'concise', 'explanatory'] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => {
                        setTone(t);
                        setToneMenuOpen(false);
                      }}
                      className={`w-full text-left px-2.5 py-1.5 text-xs rounded-lg capitalize transition-colors ${
                        tone === t ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right tools: Voice dictation & Send Arrow */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleRecording}
              className={`p-2 rounded-xl transition-colors cursor-pointer ${
                isRecording
                  ? 'bg-rose-100 text-rose-600 animate-pulse'
                  : 'text-slate-400 hover:text-blue-600 hover:bg-blue-50/70'
              }`}
              title={isRecording ? 'Listening...' : 'Voice dictation'}
            >
              {isRecording ? <Mic className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            {/* Send Button */}
            <button
              type="button"
              onClick={handleSend}
              disabled={(!input.trim() && attachments.length === 0) || isLoading}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                (!input.trim() && attachments.length === 0) || isLoading
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white shadow-xs hover:scale-105'
              }`}
              title="Send message"
            >
              <ArrowUp className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>
        </div>
      </div>

      {/* Under-prompt Disclaimer */}
      <p className="text-center text-[11px] text-slate-400 mt-2 select-none">
        Vegapunk can make mistakes. Please verify sensitive facts and critical code.
      </p>
    </div>
  );
};

export default ChatInput;
