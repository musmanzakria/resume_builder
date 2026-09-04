"use client";

import React, { useState, useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import { Bold, Italic, Link as LinkIcon, Unlink, ExternalLink, X, Check } from "lucide-react";

interface TipTapInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  label?: string;
  minHeight?: string;
  rows?: number;
}

function markdownToHtml(md: string): string {
  if (!md) return "";
  let html = md;
  // Bold + Italic combinations
  html = html.replace(/\*\*\*(.*?)\*\*\*/g, "<strong><em>$1</em></strong>");
  html = html.replace(/\*\*_(.*?)_\*\*/g, "<strong><em>$1</em></strong>");
  html = html.replace(/_\*\*(.*?)\*\*_/g, "<strong><em>$1</em></strong>");
  // Bold
  html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
  // Italic
  html = html.replace(/(?<!\*)\*(?!\*)(.*?)(?<!\*)\*(?!\*)/g, "<em>$1</em>");
  html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>');
  if (!html.includes("<p>") && !html.includes("<div>")) {
    html = `<p>${html.replace(/\n/g, "</p><p>")}</p>`;
  }
  return html;
}

function htmlToMarkdown(html: string): string {
  if (!html) return "";
  let md = html;
  // Combined bold + italic
  md = md.replace(/<strong>\s*<em>(.*?)<\/em>\s*<\/strong>/gi, "***$1***");
  md = md.replace(/<em>\s*<strong>(.*?)<\/strong>\s*<\/em>/gi, "***$1***");
  md = md.replace(/<b>\s*<i>(.*?)<\/i>\s*<\/b>/gi, "***$1***");
  md = md.replace(/<i>\s*<b>(.*?)<\/b>\s*<\/i>/gi, "***$1***");
  // Standalone bold
  md = md.replace(/<strong>(.*?)<\/strong>/gi, "**$1**");
  md = md.replace(/<b>(.*?)<\/b>/gi, "**$1**");
  // Standalone italic
  md = md.replace(/<em>(.*?)<\/em>/gi, "*$1*");
  md = md.replace(/<i>(.*?)<\/i>/gi, "*$1*");
  md = md.replace(/<a\s+(?:[^>]*?\s+)?href="([^"]*)"[^>]*>(.*?)<\/a>/gi, "[$2]($1)");
  md = md.replace(/<\/p><p>/gi, "\n");
  md = md.replace(/<p>/gi, "");
  md = md.replace(/<\/p>/gi, "");
  md = md.replace(/<br\s*[\/]?>/gi, "\n");
  md = md.replace(/<[^>]+>/g, "");
  return md.trim();
}

export const TipTapInput: React.FC<TipTapInputProps> = ({
  value,
  onChange,
  placeholder = "Type here...",
  className = "",
  label,
  minHeight = "54px",
}) => {
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkUrl, setLinkUrl] = useState("https://");
  const [showExternalIcon, setShowExternalIcon] = useState(true);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        strike: false,
        heading: false,
        blockquote: false,
        codeBlock: false,
        bulletList: false,
        orderedList: false,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-indigo-600 underline underline-offset-2 font-medium",
        },
      }),
    ],
    content: markdownToHtml(value),
    editorProps: {
      attributes: {
        class: `prose max-w-none text-xs text-slate-800 focus:outline-none p-2.5 font-sans leading-relaxed`,
        style: `min-height: ${minHeight}`,
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      const md = htmlToMarkdown(html);
      onChange(md);
    },
  });

  useEffect(() => {
    if (editor && value !== undefined) {
      const currentMd = htmlToMarkdown(editor.getHTML());
      if (currentMd !== value.trim()) {
        editor.commands.setContent(markdownToHtml(value));
      }
    }
  }, [value, editor]);

  if (!editor) {
    return null;
  }

  const handleSetLink = () => {
    if (!linkUrl) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      setShowLinkModal(false);
      return;
    }

    const finalUrl = showExternalIcon ? `${linkUrl}#icon` : `${linkUrl}#no-icon`;
    editor.chain().focus().extendMarkRange("link").setLink({ href: finalUrl }).run();
    setShowLinkModal(false);
    setLinkUrl("https://");
  };

  return (
    <div className={`space-y-1.5 ${className}`}>
      <div className="flex items-center justify-between">
        {label && <label className="text-xs text-slate-600 font-medium">{label}</label>}

        {/* TipTap WYSIWYG Toolbar (Light Mode) */}
        <div className="flex items-center gap-1 bg-slate-100 border border-slate-200 rounded-lg p-0.5 ml-auto">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-1.5 rounded text-xs font-bold transition-all ${
              editor.isActive("bold")
                ? "bg-white text-indigo-700 shadow-sm border border-slate-200"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/70"
            }`}
            title="Bold (Ctrl+B)"
          >
            <Bold className="w-3 h-3" />
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-1.5 rounded text-xs italic transition-all ${
              editor.isActive("italic")
                ? "bg-white text-indigo-700 shadow-sm border border-slate-200"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/70"
            }`}
            title="Italic (Ctrl+I)"
          >
            <Italic className="w-3 h-3" />
          </button>

          <button
            type="button"
            onClick={() => {
              const previousUrl = editor.getAttributes("link").href;
              if (previousUrl) {
                setLinkUrl(previousUrl.replace(/#icon|#no-icon/g, ""));
              }
              setShowLinkModal(true);
            }}
            className={`p-1.5 rounded text-xs transition-all ${
              editor.isActive("link")
                ? "bg-white text-indigo-700 shadow-sm border border-slate-200"
                : "text-slate-600 hover:text-indigo-600 hover:bg-slate-200/70"
            }`}
            title="Insert / Edit Link"
          >
            <LinkIcon className="w-3 h-3" />
          </button>

          {editor.isActive("link") && (
            <button
              type="button"
              onClick={() => editor.chain().focus().unsetLink().run()}
              className="p-1.5 text-slate-500 hover:text-red-500 hover:bg-slate-200/70 rounded text-xs"
              title="Remove Link"
            >
              <Unlink className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* TipTap Visual Editor Surface (Light Mode) */}
      <div className="bg-white border border-slate-300 rounded-xl overflow-hidden focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500/20 transition-all shadow-sm">
        <EditorContent editor={editor} />
      </div>

      {/* Link Insertion Modal (Light Mode) */}
      {showLinkModal && (
        <div className="p-3 bg-white border border-slate-300 rounded-xl space-y-2.5 mt-2 animate-in fade-in shadow-xl">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-800">
            <span className="flex items-center gap-1.5">
              <LinkIcon className="w-3.5 h-3.5 text-indigo-600" />
              Add Hyperlink
            </span>
            <button
              type="button"
              onClick={() => setShowLinkModal(false)}
              className="text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div>
            <label className="text-[10px] text-slate-500 block mb-1">Target URL</label>
            <input
              type="text"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 text-xs focus:outline-none focus:border-indigo-500"
              placeholder="https://..."
              autoFocus
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-1.5 text-[11px] text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={showExternalIcon}
                onChange={(e) => setShowExternalIcon(e.target.checked)}
                className="rounded border-slate-300 text-indigo-600 focus:ring-0"
              />
              <span className="flex items-center gap-1">
                Show external link icon <ExternalLink className="w-2.5 h-2.5 text-slate-500" />
              </span>
            </label>

            <button
              type="button"
              onClick={handleSetLink}
              className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 shadow-sm"
            >
              <Check className="w-3 h-3" />
              Apply Link
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
