/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  CheckSquare,
  Heading,
  Quote,
  Code,
  Eye,
  Edit3,
} from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
  disabled?: boolean;
  className?: string;
  label?: string;
  helperText?: string;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = 'Add formatted description or notes...',
  minHeight = '140px',
  disabled = false,
  className = '',
  label,
  helperText,
}) => {
  const [activeTab, setActiveTab] = useState<'write' | 'preview'>('write');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const applyFormat = (prefix: string, suffix: string = '', defaultText: string = '') => {
    if (disabled || !textareaRef.current) return;
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;

    const selectedText = text.substring(start, end) || defaultText;
    const newText =
      text.substring(0, start) + prefix + selectedText + suffix + text.substring(end);

    onChange(newText);

    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + prefix.length + selectedText.length;
      textarea.setSelectionRange(start + prefix.length, newCursorPos);
    }, 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
      e.preventDefault();
      applyFormat('**', '**', 'bold text');
    } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'i') {
      e.preventDefault();
      applyFormat('*', '*', 'italic text');
    }
  };

  // Simple, clean Markdown preview renderer
  const renderPreview = (content: string) => {
    if (!content.trim()) {
      return (
        <p className="text-xs text-[var(--text-3)] italic">Nothing to preview. Switch to Write to add content.</p>
      );
    }

    const lines = content.split('\n');
    return (
      <div className="space-y-1.5 text-xs text-[var(--text)] leading-relaxed">
        {lines.map((line, idx) => {
          const trimmed = line.trim();
          if (trimmed.startsWith('### ')) {
            return (
              <h4 key={idx} className="font-bold text-sm text-[var(--text)] pt-1">
                {trimmed.replace('### ', '')}
              </h4>
            );
          }
          if (trimmed.startsWith('## ')) {
            return (
              <h3 key={idx} className="font-bold text-base text-[var(--text)] pt-1.5">
                {trimmed.replace('## ', '')}
              </h3>
            );
          }
          if (trimmed.startsWith('# ')) {
            return (
              <h2 key={idx} className="font-extrabold text-lg text-[var(--text)] pt-2">
                {trimmed.replace('# ', '')}
              </h2>
            );
          }
          if (trimmed.startsWith('- [ ] ') || trimmed.startsWith('- [x] ')) {
            const isChecked = trimmed.startsWith('- [x] ');
            const taskText = trimmed.replace(/- \[[ x]\] /, '');
            return (
              <div key={idx} className="flex items-center gap-2 pl-1 py-0.5">
                <input
                  type="checkbox"
                  checked={isChecked}
                  readOnly
                  className="rounded text-[var(--brand-600)]"
                />
                <span className={isChecked ? 'line-through text-[var(--text-3)]' : ''}>
                  {taskText}
                </span>
              </div>
            );
          }
          if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
            return (
              <li key={idx} className="ml-4 list-disc">
                {trimmed.replace(/^[-*]\s+/, '')}
              </li>
            );
          }
          if (/^\d+\.\s/.test(trimmed)) {
            return (
              <li key={idx} className="ml-4 list-decimal">
                {trimmed.replace(/^\d+\.\s+/, '')}
              </li>
            );
          }
          if (trimmed.startsWith('> ')) {
            return (
              <blockquote
                key={idx}
                className="border-l-2 border-[var(--brand-600)] pl-2.5 py-0.5 text-[var(--text-2)] italic bg-[var(--surface-2)] rounded-r"
              >
                {trimmed.replace('> ', '')}
              </blockquote>
            );
          }
          if (trimmed === '---') {
            return <hr key={idx} className="border-[var(--border)] my-2" />;
          }
          if (!trimmed) {
            return <div key={idx} className="h-2" />;
          }

          // Inline formatting parse for bold (**text**) and italic (*text*)
          const formatted = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
          return (
            <p
              key={idx}
              dangerouslySetInnerHTML={{ __html: formatted }}
              className="break-words"
            />
          );
        })}
      </div>
    );
  };

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-[var(--text)]">{label}</label>
          <div className="flex items-center gap-1 rounded bg-[var(--surface-2)] p-0.5 border border-[var(--border)]">
            <button
              type="button"
              onClick={() => setActiveTab('write')}
              className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                activeTab === 'write'
                  ? 'bg-[var(--surface)] text-[var(--brand-600)] shadow-2xs font-semibold'
                  : 'text-[var(--text-3)] hover:text-[var(--text)]'
              }`}
            >
              <Edit3 className="h-3 w-3" />
              <span>Write</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('preview')}
              className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                activeTab === 'preview'
                  ? 'bg-[var(--surface)] text-[var(--brand-600)] shadow-2xs font-semibold'
                  : 'text-[var(--text-3)] hover:text-[var(--text)]'
              }`}
            >
              <Eye className="h-3 w-3" />
              <span>Preview</span>
            </button>
          </div>
        </div>
      )}

      <div className="rounded-md border border-[var(--border-strong)] bg-[var(--surface)] overflow-hidden focus-within:border-[var(--brand-600)] transition-colors">
        {/* Formatting Toolbar */}
        {!disabled && activeTab === 'write' && (
          <div className="flex flex-wrap items-center gap-0.5 border-b border-[var(--border)] bg-[var(--surface-2)] px-2 py-1 text-xs">
            <button
              type="button"
              onClick={() => applyFormat('**', '**', 'bold text')}
              className="p-1 rounded hover:bg-[var(--surface-3)] text-[var(--text-2)] hover:text-[var(--text)] cursor-pointer"
              title="Bold (Ctrl+B)"
            >
              <Bold className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => applyFormat('*', '*', 'italic text')}
              className="p-1 rounded hover:bg-[var(--surface-3)] text-[var(--text-2)] hover:text-[var(--text)] cursor-pointer"
              title="Italic (Ctrl+I)"
            >
              <Italic className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => applyFormat('### ', '', 'Heading')}
              className="p-1 rounded hover:bg-[var(--surface-3)] text-[var(--text-2)] hover:text-[var(--text)] cursor-pointer"
              title="Heading"
            >
              <Heading className="h-3.5 w-3.5" />
            </button>

            <div className="h-3.5 w-[1px] bg-[var(--border)] mx-1" />

            <button
              type="button"
              onClick={() => applyFormat('- ', '', 'Bullet item')}
              className="p-1 rounded hover:bg-[var(--surface-3)] text-[var(--text-2)] hover:text-[var(--text)] cursor-pointer"
              title="Bulleted List"
            >
              <List className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => applyFormat('1. ', '', 'Numbered item')}
              className="p-1 rounded hover:bg-[var(--surface-3)] text-[var(--text-2)] hover:text-[var(--text)] cursor-pointer"
              title="Numbered List"
            >
              <ListOrdered className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => applyFormat('- [ ] ', '', 'Task item')}
              className="p-1 rounded hover:bg-[var(--surface-3)] text-[var(--text-2)] hover:text-[var(--text)] cursor-pointer"
              title="Checklist Item"
            >
              <CheckSquare className="h-3.5 w-3.5" />
            </button>

            <div className="h-3.5 w-[1px] bg-[var(--border)] mx-1" />

            <button
              type="button"
              onClick={() => applyFormat('> ', '', 'Quote note')}
              className="p-1 rounded hover:bg-[var(--surface-3)] text-[var(--text-2)] hover:text-[var(--text)] cursor-pointer"
              title="Blockquote"
            >
              <Quote className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => applyFormat('`', '`', 'code')}
              className="p-1 rounded hover:bg-[var(--surface-3)] text-[var(--text-2)] hover:text-[var(--text)] cursor-pointer"
              title="Inline Code"
            >
              <Code className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {/* Content Area */}
        {activeTab === 'write' ? (
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            style={{ minHeight }}
            className="w-full resize-y bg-transparent p-3 text-xs text-[var(--text)] leading-relaxed focus:outline-none placeholder:text-[var(--text-3)]"
          />
        ) : (
          <div
            style={{ minHeight }}
            className="p-3 bg-[var(--surface-2)] overflow-y-auto"
          >
            {renderPreview(value)}
          </div>
        )}

        {/* Status bar */}
        <div className="flex items-center justify-between border-t border-[var(--border)] bg-[var(--surface-2)]/60 px-3 py-1 text-[10px] text-[var(--text-3)]">
          <span>{value.length} characters • {value.trim() ? value.trim().split(/\s+/).length : 0} words</span>
          <span>Markdown supported (Ctrl+B, Ctrl+I)</span>
        </div>
      </div>

      {helperText && <p className="text-[10px] text-[var(--text-3)]">{helperText}</p>}
    </div>
  );
};
