import React from "react";
import { ExternalLink } from "lucide-react";

interface RichTextRendererProps {
  content: string;
  className?: string;
  defaultShowLinkIcon?: boolean;
}

/**
 * Parses markdown-style links ([label](url)), combined bold+italics (***text***, **_text_**),
 * bold (**text**), and italics (*text* or _text_)
 * and renders clean, standard inline elements without breaking paragraphs.
 */
export const RichTextRenderer: React.FC<RichTextRendererProps> = ({
  content,
  className = "",
  defaultShowLinkIcon = true,
}) => {
  if (!content) return null;

  // Convert any HTML strong/em to markdown first to standardize
  let normalized = content
    .replace(/<strong>\s*<em>(.*?)<\/em>\s*<\/strong>/gi, "***$1***")
    .replace(/<em>\s*<strong>(.*?)<\/strong>\s*<\/em>/gi, "***$1***")
    .replace(/<b>\s*<i>(.*?)<\/i>\s*<\/b>/gi, "***$1***")
    .replace(/<i>\s*<b>(.*?)<\/b>\s*<\/i>/gi, "***$1***")
    .replace(/<strong>(.*?)<\/strong>/gi, "**$1**")
    .replace(/<b>(.*?)<\/b>/gi, "**$1**")
    .replace(/<em>(.*?)<\/em>/gi, "*$1*")
    .replace(/<i>(.*?)<\/i>/gi, "*$1*")
    .replace(/<a\s+(?:[^>]*?\s+)?href="([^"]*)"[^>]*>(.*?)<\/a>/gi, "[$2]($1)");

  // Regex matches [label](url) OR ***bold_italic*** OR **_bold_italic_** OR **bold** OR *italic*
  const tokenRegex = /(\[.*?\]\(.*?\)|\*\*\*.*?\*\*\*|\*\*_(?:.*?)_\*\*|_\*\*(?:.*?)\*\*_|\*\*.*?\*\*|\*(?!\*).*?\*(?!\*)|_(?!_).*?_(?!_))/g;
  const rawTokens = normalized.split(tokenRegex);

  const renderedNodes: React.ReactNode[] = [];

  rawTokens.forEach((segment, idx) => {
    if (!segment) return;

    // 1. Link: [label](url)
    const linkMatch = segment.match(/^\[(.*?)\]\((.*?)\)$/);
    if (linkMatch) {
      const label = linkMatch[1];
      let url = linkMatch[2];
      let hasIcon = defaultShowLinkIcon;

      if (url.endsWith("#no-icon")) {
        hasIcon = false;
        url = url.replace("#no-icon", "");
      } else if (url.endsWith("#icon")) {
        hasIcon = true;
        url = url.replace("#icon", "");
      }

      renderedNodes.push(
        <a
          key={idx}
          href={url}
          target="_blank"
          rel="noreferrer"
          className="text-black font-semibold hover:text-indigo-600 underline underline-offset-2 inline transition-colors"
          onClick={(e) => e.stopPropagation()}
        >
          {label}
          {hasIcon && (
            <ExternalLink className="w-2.5 h-2.5 inline-block ml-0.5 align-baseline text-slate-700" />
          )}
        </a>
      );
      return;
    }

    // 2. Bold AND Italic: ***text***, **_text_**, _**text**_
    const boldItalicMatch =
      segment.match(/^\*\*\*(.*?)\*\*\*$/) ||
      segment.match(/^\*\*_(.*?)_\*\*$/) ||
      segment.match(/^_\*\*(.*?)\*\*_$/);
    if (boldItalicMatch) {
      renderedNodes.push(
        <strong key={idx} className="font-bold italic text-black">
          {boldItalicMatch[1]}
        </strong>
      );
      return;
    }

    // 3. Bold: **text**
    const boldMatch = segment.match(/^\*\*(.*?)\*\*$/);
    if (boldMatch) {
      renderedNodes.push(
        <strong key={idx} className="font-bold text-black">
          {boldMatch[1]}
        </strong>
      );
      return;
    }

    // 4. Italic: *text* or _text_
    const italicMatch = segment.match(/^\*(.*?)\*$/) || segment.match(/^_(.*?)_$/);
    if (italicMatch) {
      renderedNodes.push(
        <em key={idx} className="italic text-slate-900">
          {italicMatch[1]}
        </em>
      );
      return;
    }

    // 5. Standard text
    renderedNodes.push(<span key={idx}>{segment}</span>);
  });

  return <span className={className}>{renderedNodes}</span>;
};
