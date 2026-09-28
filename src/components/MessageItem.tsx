import React, { useState } from 'react';
import { Message, Artifact } from '../types';
import VegapunkLogo from './VegapunkLogo';
import katex from 'katex';
import {
  Copy,
  Check,
  RotateCw,
  ThumbsUp,
  ThumbsDown,
  Edit2,
  FileText,
  Sparkles,
} from 'lucide-react';

interface MessageItemProps {
  message: Message;
  onOpenArtifact?: (artifact: Artifact) => void;
  onRegenerate?: () => void;
  onEditUserMessage?: (text: string) => void;
}

export const MessageItem: React.FC<MessageItemProps> = ({
  message,
  onOpenArtifact,
  onRegenerate,
  onEditUserMessage,
}) => {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);
  const [copiedCodeIndex, setCopiedCodeIndex] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyCode = (code: string, index: number) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeIndex(index);
    setTimeout(() => setCopiedCodeIndex(null), 2000);
  };

  const handleFeedback = (type: 'up' | 'down') => {
    if (feedback === type) {
      setFeedback(null);
      setFeedbackToast(null);
    } else {
      setFeedback(type);
      setFeedbackToast(type === 'up' ? 'Thanks for the feedback!' : 'Feedback recorded');
      setTimeout(() => setFeedbackToast(null), 2200);
    }
  };

  if (isUser) {
    return (
      <div className="max-w-3xl mx-auto w-full px-4 my-4 flex justify-end group">
        <div className="max-w-[85%] sm:max-w-xl bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs text-slate-800 transition-all hover:border-slate-300">
          {/* Attachments preview if any */}
          {message.attachments && message.attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2.5 pb-2 border-b border-slate-100">
              {message.attachments.map((att) => (
                <div
                  key={att.id}
                  className="flex items-center gap-1.5 p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                >
                  {att.dataUrl ? (
                    <img src={att.dataUrl} alt={att.name} className="w-8 h-8 rounded object-cover" />
                  ) : (
                    <FileText className="w-4 h-4 text-blue-600" />
                  )}
                  <span className="font-medium text-slate-700 truncate max-w-[120px]">{att.name}</span>
                </div>
              ))}
            </div>
          )}

          {/* Formatted user text */}
          <div
            className="leading-relaxed text-sm selection:bg-blue-100 break-words"
            dangerouslySetInnerHTML={{ __html: formatInlineMarkdownAndMath(message.content) }}
          />

          {/* User message action footer on hover */}
          <div className="flex items-center justify-end gap-1 mt-2 pt-1 border-t border-slate-100/60 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400">
            <button
              onClick={handleCopy}
              className="p-1 hover:text-slate-700 hover:bg-slate-100 rounded text-[11px] flex items-center gap-1 transition-colors cursor-pointer"
              title="Copy message"
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3 text-emerald-600" />
                  <span className="text-emerald-600 font-medium">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>Copy</span>
                </>
              )}
            </button>

            {onEditUserMessage && (
              <button
                onClick={() => onEditUserMessage(message.content)}
                className="p-1 hover:text-blue-600 hover:bg-blue-50 rounded text-[11px] flex items-center gap-1 transition-colors cursor-pointer"
                title="Edit and re-run query"
              >
                <Edit2 className="w-3 h-3" />
                <span>Edit</span>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Assistant Message
  const renderedContent = parseMessageContent(
    message.content,
    handleCopyCode,
    copiedCodeIndex
  );

  return (
    <div className="flex gap-3.5 my-6 px-4 max-w-3xl mx-auto w-full group">
      {/* Vegapunk Avatar */}
      <div className="shrink-0 mt-0.5">
        <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center shadow-2xs">
          <VegapunkLogo size={18} variant="mark" />
        </div>
      </div>

      <div className="flex-1 min-w-0">
        {/* Model Badge */}
        <div className="flex items-center gap-2 mb-1.5 text-xs text-slate-400 select-none">
          <span className="font-semibold text-slate-800">Vegapunk DS</span>
          <span>·</span>
          <span>{message.modelUsed || 'Vegapunk DS 3.7'}</span>
        </div>

        {/* Formatted Markdown & Math Content */}
        <div className="text-slate-800 text-sm leading-relaxed space-y-3 font-sans">
          {renderedContent}
        </div>

        {/* Bottom Actions Bar */}
        <div className="flex items-center gap-1.5 mt-3 pt-2 text-slate-400 select-none">
          <button
            onClick={handleCopy}
            className="p-1.5 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            title="Copy response"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          {onRegenerate && (
            <button
              onClick={onRegenerate}
              className="p-1.5 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer group/reg"
              title="Regenerate response"
            >
              <RotateCw className="w-3.5 h-3.5 group-active/reg:rotate-180 transition-transform duration-300" />
            </button>
          )}

          <div className="h-3 w-px bg-slate-200 mx-1"></div>

          <button
            onClick={() => handleFeedback('up')}
            className={`p-1.5 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer ${
              feedback === 'up' ? 'text-blue-600 bg-blue-50' : 'hover:text-slate-700'
            }`}
            title="Good response"
          >
            <ThumbsUp className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => handleFeedback('down')}
            className={`p-1.5 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer ${
              feedback === 'down' ? 'text-rose-600 bg-rose-50' : 'hover:text-slate-700'
            }`}
            title="Bad response"
          >
            <ThumbsDown className="w-3.5 h-3.5" />
          </button>

          {feedbackToast && (
            <span className="text-[11px] text-blue-600 font-medium ml-1.5 animate-in fade-in duration-200">
              {feedbackToast}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

// Helper to parse Markdown code blocks and formulas
function parseMessageContent(
  text: string,
  handleCopyCode: (code: string, index: number) => void,
  copiedCodeIndex: number | null
) {
  let codeIndexCounter = 0;

  // Convert any <antArtifact ...> into clean Markdown code blocks so the full code is displayed inline
  const normalizedText = text.replace(
    /<antArtifact\s+identifier="([^"]+)"\s+type="([^"]+)"(?:\s+language="([^"]+)")?\s+title="([^"]+)">([\s\S]*?)<\/antArtifact>/g,
    (_, _id, type, language, _title, content) => {
      const lang = language || (type.includes('html') ? 'html' : 'python');
      return `\n\`\`\`${lang}\n${content.trim()}\n\`\`\`\n`;
    }
  );

  // Render sections split by triple backticks
  const sections = normalizedText.split(/(```[\s\S]*?```)/g);

  const renderedContent = sections.map((section, sIndex) => {
    // Check if it's a code block
    if (section.startsWith('```') && section.endsWith('```')) {
      const firstLineBreak = section.indexOf('\n');
      const lang = section.slice(3, firstLineBreak).trim() || 'code';
      const code = section.slice(firstLineBreak + 1, -3);
      const currentIndex = codeIndexCounter++;

      return (
        <div key={sIndex} className="my-3 rounded-xl overflow-hidden border border-slate-700/80 bg-[#1E2430] text-slate-100 font-mono text-xs shadow-xs">
          <div className="flex items-center justify-between px-3.5 py-2 bg-[#181D27] border-b border-slate-700/60 select-none">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              {lang}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleCopyCode(code, currentIndex)}
                className="flex items-center gap-1 px-2 py-1 text-[11px] text-slate-300 hover:text-white hover:bg-slate-700/60 rounded transition-colors cursor-pointer"
                title="Copy code"
              >
                {copiedCodeIndex === currentIndex ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span className="text-emerald-400">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>
          <pre className="p-4 overflow-x-auto text-xs leading-relaxed text-slate-200">
            <code>{code}</code>
          </pre>
        </div>
      );
    }

    // Parse prose, lists, headings, math blocks, and tables
    return (
      <React.Fragment key={sIndex}>
        {renderMarkdownBlocks(section)}
      </React.Fragment>
    );
  });

  return renderedContent;
}

// Block-Level Markdown & Math Parser
function renderMarkdownBlocks(text: string) {
  if (!text) return null;

  // Split into raw lines and group into structured blocks
  const lines = text.replace(/\r\n/g, '\n').split('\n');
  const elements: React.ReactNode[] = [];
  let i = 0;
  let blockKey = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    // 1. Blank line -> skip
    if (!trimmed) {
      i++;
      continue;
    }

    // 2. Display Math Blocks: $$...$$ or \[...\]
    if (trimmed.startsWith('$$')) {
      let mathContent = '';
      if (trimmed.endsWith('$$') && trimmed.length > 2) {
        mathContent = trimmed.slice(2, -2).trim();
        i++;
      } else {
        mathContent = trimmed.slice(2);
        i++;
        while (i < lines.length && !lines[i].includes('$$')) {
          mathContent += '\n' + lines[i];
          i++;
        }
        if (i < lines.length) {
          mathContent += '\n' + lines[i].replace('$$', '');
          i++;
        }
      }
      elements.push(
        <div
          key={`math_${blockKey++}`}
          className="my-3 py-3 px-4 overflow-x-auto bg-blue-50/40 border border-blue-100 rounded-xl text-center select-text shadow-2xs"
          dangerouslySetInnerHTML={{ __html: renderKaTeX(mathContent, true) }}
        />
      );
      continue;
    }

    if (trimmed.startsWith('\\[')) {
      let mathContent = '';
      if (trimmed.endsWith('\\]') && trimmed.length > 2) {
        mathContent = trimmed.slice(2, -2).trim();
        i++;
      } else {
        mathContent = trimmed.slice(2);
        i++;
        while (i < lines.length && !lines[i].includes('\\]')) {
          mathContent += '\n' + lines[i];
          i++;
        }
        if (i < lines.length) {
          mathContent += '\n' + lines[i].replace('\\]', '');
          i++;
        }
      }
      elements.push(
        <div
          key={`math_${blockKey++}`}
          className="my-3 py-3 px-4 overflow-x-auto bg-blue-50/40 border border-blue-100 rounded-xl text-center select-text shadow-2xs"
          dangerouslySetInnerHTML={{ __html: renderKaTeX(mathContent, true) }}
        />
      );
      continue;
    }

    // 3. Headings
    if (trimmed.startsWith('#### ')) {
      elements.push(
        <h4
          key={`h4_${blockKey++}`}
          className="text-sm font-bold text-slate-900 mt-4 mb-1.5 font-sans"
          dangerouslySetInnerHTML={{ __html: formatInlineMarkdownAndMath(trimmed.replace('#### ', '')) }}
        />
      );
      i++;
      continue;
    }

    if (trimmed.startsWith('### ')) {
      elements.push(
        <h3
          key={`h3_${blockKey++}`}
          className="text-base font-bold text-slate-900 mt-5 mb-2 font-sans tracking-tight"
          dangerouslySetInnerHTML={{ __html: formatInlineMarkdownAndMath(trimmed.replace('### ', '')) }}
        />
      );
      i++;
      continue;
    }

    if (trimmed.startsWith('## ')) {
      elements.push(
        <h2
          key={`h2_${blockKey++}`}
          className="text-lg font-bold text-slate-900 mt-6 mb-2.5 font-serif"
          dangerouslySetInnerHTML={{ __html: formatInlineMarkdownAndMath(trimmed.replace('## ', '')) }}
        />
      );
      i++;
      continue;
    }

    if (trimmed.startsWith('# ')) {
      elements.push(
        <h1
          key={`h1_${blockKey++}`}
          className="text-xl font-bold text-slate-900 mt-6 mb-3 font-serif"
          dangerouslySetInnerHTML={{ __html: formatInlineMarkdownAndMath(trimmed.replace('# ', '')) }}
        />
      );
      i++;
      continue;
    }

    // 4. Blockquotes
    if (trimmed.startsWith('>')) {
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith('>')) {
        quoteLines.push(lines[i].trim().replace(/^>\s?/, ''));
        i++;
      }
      elements.push(
        <blockquote
          key={`quote_${blockKey++}`}
          className="border-l-4 border-blue-500 bg-blue-50/30 pl-3.5 py-2 my-2.5 rounded-r-lg text-slate-700 italic text-sm leading-relaxed"
          dangerouslySetInnerHTML={{ __html: formatInlineMarkdownAndMath(quoteLines.join('\n')) }}
        />
      );
      continue;
    }

    // 5. Horizontal Rules: --- or ***
    if (trimmed === '---' || trimmed === '***' || trimmed === '___') {
      elements.push(<hr key={`hr_${blockKey++}`} className="my-4 border-slate-200" />);
      i++;
      continue;
    }

    // 6. Tables: header line containing '|' followed by line with '| --- |'
    if (trimmed.includes('|') && i + 1 < lines.length && lines[i + 1].includes('|') && lines[i + 1].includes('---')) {
      const headerLine = lines[i];
      i += 2; // skip header and separator
      const bodyLines: string[] = [];
      while (i < lines.length && lines[i].trim().includes('|')) {
        bodyLines.push(lines[i]);
        i++;
      }

      const parseCells = (rowStr: string) =>
        rowStr
          .split('|')
          .map((c) => c.trim())
          .filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);

      const headers = parseCells(headerLine);
      const rows = bodyLines.map(parseCells);

      elements.push(
        <div key={`table_${blockKey++}`} className="my-3 overflow-x-auto border border-slate-200/90 rounded-xl shadow-2xs">
          <table className="min-w-full text-xs divide-y divide-slate-200 text-left">
            <thead className="bg-slate-50/90 font-semibold text-slate-800">
              <tr>
                {headers.map((h, hIdx) => (
                  <th
                    key={hIdx}
                    className="px-3.5 py-2.5"
                    dangerouslySetInnerHTML={{ __html: formatInlineMarkdownAndMath(h) }}
                  />
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white text-slate-700">
              {rows.map((r, rIdx) => (
                <tr key={rIdx} className="hover:bg-blue-50/20 transition-colors">
                  {r.map((cell, cIdx) => (
                    <td
                      key={cIdx}
                      className="px-3.5 py-2 font-mono"
                      dangerouslySetInnerHTML={{ __html: formatInlineMarkdownAndMath(cell) }}
                    />
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      continue;
    }

    // 7. Unordered Lists: lines starting with '- ' or '* ' or '+ '
    if (/^[\-\*\+]\s/.test(trimmed)) {
      const listItems: string[] = [];
      while (i < lines.length && /^[\-\*\+]\s/.test(lines[i].trim())) {
        listItems.push(lines[i].trim().replace(/^[\-\*\+]\s+/, ''));
        i++;
      }
      elements.push(
        <ul key={`ul_${blockKey++}`} className="list-disc pl-5 space-y-1.5 my-2.5">
          {listItems.map((item, itemIdx) => (
            <li
              key={itemIdx}
              className="leading-relaxed"
              dangerouslySetInnerHTML={{ __html: formatInlineMarkdownAndMath(item) }}
            />
          ))}
        </ul>
      );
      continue;
    }

    // 8. Ordered Lists: lines starting with '\d+\.\s'
    if (/^\d+\.\s/.test(trimmed)) {
      const listItems: string[] = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i].trim())) {
        listItems.push(lines[i].trim().replace(/^\d+\.\s+/, ''));
        i++;
      }
      elements.push(
        <ol key={`ol_${blockKey++}`} className="list-decimal pl-5 space-y-1.5 my-2.5">
          {listItems.map((item, itemIdx) => (
            <li
              key={itemIdx}
              className="leading-relaxed"
              dangerouslySetInnerHTML={{ __html: formatInlineMarkdownAndMath(item) }}
            />
          ))}
        </ol>
      );
      continue;
    }

    // 9. Standard Prose Paragraph
    const paragraphLines: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() &&
      !lines[i].trim().startsWith('$$') &&
      !lines[i].trim().startsWith('\\[') &&
      !/^#{1,4}\s/.test(lines[i].trim()) &&
      !lines[i].trim().startsWith('>') &&
      !/^[\-\*\+]\s/.test(lines[i].trim()) &&
      !/^\d+\.\s/.test(lines[i].trim()) &&
      !(lines[i].trim().includes('|') && i + 1 < lines.length && lines[i + 1].includes('---'))
    ) {
      paragraphLines.push(lines[i]);
      i++;
    }

    if (paragraphLines.length > 0) {
      elements.push(
        <p
          key={`p_${blockKey++}`}
          className="leading-relaxed my-2"
          dangerouslySetInnerHTML={{ __html: formatInlineMarkdownAndMath(paragraphLines.join('\n')) }}
        />
      );
    }
  }

  return elements;
}

// KaTeX Helper
function renderKaTeX(formula: string, isDisplay: boolean): string {
  try {
    return katex.renderToString(formula.trim(), {
      displayMode: isDisplay,
      throwOnError: false,
    });
  } catch (err) {
    console.error('KaTeX rendering error:', err);
    return formula;
  }
}

// Precision Markdown & Math Formatter
// Stashes math and code tokens BEFORE regex operations so KaTeX output is never corrupted
export function formatInlineMarkdownAndMath(text: string): string {
  if (!text) return '';

  const codeSlots: string[] = [];
  const mathSlots: string[] = [];

  // Step 1: Stash inline code blocks `code`
  let processed = text.replace(/`([^`]+)`/g, (_, code) => {
    const slotId = `__VP_CODE_SLOT_${codeSlots.length}__`;
    codeSlots.push(code);
    return slotId;
  });

  // Step 2: Stash Display Math $$ ... $$
  processed = processed.replace(/\$\$([\s\S]+?)\$\$/g, (_, math) => {
    const slotId = `__VP_MATH_SLOT_${mathSlots.length}__`;
    const rendered = `<span class="block my-2.5 py-2.5 px-3 overflow-x-auto bg-blue-50/40 border border-blue-100/80 rounded-xl text-center select-text">${renderKaTeX(math, true)}</span>`;
    mathSlots.push(rendered);
    return slotId;
  });

  // Step 3: Stash Display Math \[ ... \]
  processed = processed.replace(/\\\[([\s\S]+?)\\\]/g, (_, math) => {
    const slotId = `__VP_MATH_SLOT_${mathSlots.length}__`;
    const rendered = `<span class="block my-2.5 py-2.5 px-3 overflow-x-auto bg-blue-50/40 border border-blue-100/80 rounded-xl text-center select-text">${renderKaTeX(math, true)}</span>`;
    mathSlots.push(rendered);
    return slotId;
  });

  // Step 4: Stash Inline Math \( ... \)
  processed = processed.replace(/\\\(([\s\S]+?)\\\)/g, (_, math) => {
    const slotId = `__VP_MATH_SLOT_${mathSlots.length}__`;
    mathSlots.push(renderKaTeX(math, false));
    return slotId;
  });

  // Step 5: Stash Inline Math $ ... $
  // Matches dollar signs with content, while avoiding currency like $50 or $100.99
  processed = processed.replace(/(?<!\\)\$([^\$\s](?:[^\$\n]*?[^\$\s])?)\$/g, (match, math) => {
    if (/^\d+(?:\.\d{1,2})?$/.test(math.trim())) {
      return match; // Keep currency as is
    }
    const slotId = `__VP_MATH_SLOT_${mathSlots.length}__`;
    mathSlots.push(renderKaTeX(math, false));
    return slotId;
  });

  // Also support single character math: $x$, $Y$, $0$
  processed = processed.replace(/(?<!\\)\$([a-zA-Z0-9])\$/g, (match, math) => {
    const slotId = `__VP_MATH_SLOT_${mathSlots.length}__`;
    mathSlots.push(renderKaTeX(math, false));
    return slotId;
  });

  // Step 6: Markdown Links [text](url)
  processed = processed.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:text-blue-700 underline font-medium">$1</a>'
  );

  // Step 7: Bold & Italic
  // ***bold italic***
  processed = processed.replace(
    /\*\*\*(.+?)\*\*\*/g,
    '<strong class="font-semibold italic text-slate-900">$1</strong>'
  );

  // **bold** or __bold__
  processed = processed
    .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-slate-900">$1</strong>')
    .replace(/__(.+?)__/g, '<strong class="font-semibold text-slate-900">$1</strong>');

  // *italic* or _italic_
  processed = processed
    .replace(/(?<!\*)\*([^\*\s](?:[^\*\n]*?[^\*\s])?)\*(?!\*)/g, '<em class="italic text-slate-800">$1</em>')
    .replace(/(?<!_)_([^_\s](?:[^_\n]*?[^_\s])?)_(?!_)/g, '<em class="italic text-slate-800">$1</em>');

  // Strikethrough ~~text~~
  processed = processed.replace(/~~(.+?)~~/g, '<del class="line-through text-slate-400">$1</del>');

  // Step 8: Preserve line breaks inside multiline paragraphs
  processed = processed.replace(/\n/g, '<br />');

  // Step 9: Restore code blocks
  codeSlots.forEach((code, idx) => {
    const slotId = `__VP_CODE_SLOT_${idx}__`;
    processed = processed.replace(
      slotId,
      `<code class="px-1.5 py-0.5 rounded bg-slate-100 text-blue-700 font-mono text-[12px] border border-slate-200/80 font-medium">${escapeHtml(code)}</code>`
    );
  });

  // Step 10: Restore math slots (KaTeX HTML is preserved untouched!)
  mathSlots.forEach((mathHtml, idx) => {
    const slotId = `__VP_MATH_SLOT_${idx}__`;
    processed = processed.replace(slotId, mathHtml);
  });

  return processed;
}

function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export default MessageItem;
