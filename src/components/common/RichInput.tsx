"use client";

import React, { useRef, useState } from "react";
import { Bold, Italic, Link as LinkIcon, ExternalLink, X, Check } from "lucide-react";

interface RichInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  isSingleLine?: boolean;
  className?: string;
  label?: string;
}

export const RichInput: React.FC<RichInputProps> = ({
  value,
  onChange,
  placeholder = "",
  rows = 3,
  isSingleLine = false,
  className = "",
  label,
}) => {
  const inputRef = useRef<HTMLTextAreaElement | HTMLInputElement | null>(null);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkUrl, setLinkUrl] = useState("https://");
  const [linkText, setLinkText] = useState("");
  const [showExternalIcon, setShowExternalIcon] = useState(true);

  // Apply bold (**text**)
  const handleBold = () => {
    if (!inputRef.current) return;
    const start = inputRef.current.selectionStart || 0;
    const end = inputRef.current.selectionEnd || 0;
    const selected = value.substring(start, end) || "bold text";

    const updated = value.substring(0, start) + `**${selected}**` + value.substring(end);
    onChange(updated);

    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        inputRef.current.setSelectionRange(start + 2, start + 2 + selected.length);
      }
    }, 50);
  };

  // Apply italic (*text*)
  const handleItalic = () => {
    if (!inputRef.current) return;
    const start = inputRef.current.selectionStart || 0;
    const end = inputRef.current.selectionEnd || 0;
    const selected = value.substring(start, end) || "italic text";

    const updated = value.substring(0, start) + `*${selected}*` + value.substring(end);
    onChange(updated);

    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        inputRef.current.setSelectionRange(start + 1, start + 1 + selected.length);
      }
    }, 50);
  };

  // Open Link modal
  const handleOpenLinkModal = () => {
    if (!inputRef.current) return;
    const start = inputRef.current.selectionStart || 0;
    const end = inputRef.current.selectionEnd || 0;
    const selected = value.substring(start, end);
    setLinkText(selected || "Link");
    setShowLinkModal(true);
  };

  // Insert Link
  const handleInsertLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputRef.current) return;
    const start = inputRef.current.selectionStart || 0;
    const end = inputRef.current.selectionEnd || 0;

    const iconSuffix = showExternalIcon ? "#icon" : "#no-icon";
    const formattedLink = `[${linkText || "Link"}](${linkUrl}${iconSuffix})`;

    const updated = value.substring(0, start) + formattedLink + value.substring(end);
    onChange(updated);
    setShowLinkModal(false);
  };

  // Handle keyboard shortcuts (Ctrl+B, Ctrl+I, Ctrl+K)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.ctrlKey || e.metaKey) {
      if (e.key.toLowerCase() === "b") {
        e.preventDefault();
        handleBold();
      } else if (e.key.toLowerCase() === "i") {
        e.preventDefault();
        handleItalic();
      } else if (e.key.toLowerCase() === "k") {
        e.preventDefault();
        handleOpenLinkModal();
      }
    }
  };

  return (
    <div className={`space-y-1.5 ${className}`}>
      <div className="flex items-center justify-between">
        {label && <label className="text-xs text-slate-400 font-medium">{label}</label>}
        
        {/* Formatting Mini-Toolbar */}
        <div className="flex items-center gap-1 bg-slate-900/90 border border-slate-800 rounded-md px-1.5 py-0.5 ml-auto">
          <button
            type="button"
            onClick={handleBold}
            className="p-1 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded text-xs font-bold transition-all"
            title="Bold (Ctrl+B)"
          >
            <Bold className="w-3 h-3" />
          </button>
          <button
            type="button"
            onClick={handleItalic}
            className="p-1 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded text-xs italic transition-all"
            title="Italic (Ctrl+I)"
          >
            <Italic className="w-3 h-3" />
          </button>
          <button
            type="button"
            onClick={handleOpenLinkModal}
            className="p-1 text-slate-400 hover:text-indigo-400 hover:bg-slate-800 rounded text-xs transition-all"
            title="Insert Link (Ctrl+K)"
          >
            <LinkIcon className="w-3 h-3" />
          </button>
        </div>
      </div>

      {isSingleLine ? (
        <input
          ref={inputRef as React.RefObject<HTMLInputElement>}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-sans"
        />
      ) : (
        <textarea
          ref={inputRef as React.RefObject<HTMLTextAreaElement>}
          rows={rows}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-indigo-500 leading-relaxed font-sans"
        />
      )}

      {/* Insert Link Modal */}
      {showLinkModal && (
        <div className="p-3 bg-slate-900 border border-slate-700 rounded-xl space-y-2.5 mt-2 animate-in fade-in shadow-xl">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-200">
            <span className="flex items-center gap-1.5">
              <LinkIcon className="w-3.5 h-3.5 text-indigo-400" />
              Add Hyperlink
            </span>
            <button
              onClick={() => setShowLinkModal(false)}
              className="text-slate-400 hover:text-slate-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <label className="text-[10px] text-slate-400 block mb-1">Display Text</label>
              <input
                type="text"
                value={linkText}
                onChange={(e) => setLinkText(e.target.value)}
                className="w-full px-2 py-1 bg-slate-950 border border-slate-800 rounded text-slate-200 text-xs focus:outline-none focus:border-indigo-500"
                placeholder="Link text"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 block mb-1">Target URL</label>
              <input
                type="text"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                className="w-full px-2 py-1 bg-slate-950 border border-slate-800 rounded text-slate-200 text-xs focus:outline-none focus:border-indigo-500"
                placeholder="https://..."
              />
            </div>
          </div>

          {/* Toggle for external link icon */}
          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-1.5 text-[11px] text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={showExternalIcon}
                onChange={(e) => setShowExternalIcon(e.target.checked)}
                className="rounded border-slate-700 text-indigo-600 focus:ring-0"
              />
              <span className="flex items-center gap-1">
                Show external link icon <ExternalLink className="w-2.5 h-2.5 text-slate-400" />
              </span>
            </label>

            <button
              type="button"
              onClick={handleInsertLink}
              className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs font-semibold flex items-center gap-1 transition-all"
            >
              <Check className="w-3 h-3" />
              Insert
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
