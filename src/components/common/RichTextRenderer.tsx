import React from "react";
import { ExternalLink } from "lucide-react";

interface RichTextRendererProps {
  content: string;
  className?: string;
  defaultShowLinkIcon?: boolean;
}

/**
 * Parses markdown-style bold (**text**), italics (*text*), and links ([label](url))
 * and renders clean, standard inline elements without breaking paragraphs.
 */
export const RichTextRenderer: React.FC<RichTextRendererProps> = ({
  content,
  className = "",
  defaultShowLinkIcon = true,
}) => {
  if (!content) return null;

  // Regex matches [label](url) OR **bold** OR *italic*
  const tokenRegex = /(\[.*?\]\(.*?\)|\*\*.*?\*\*|\*.*?\*)/g;
  const rawTokens = content.split(tokenRegex);

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

    // 2. Bold: **text**
    const boldMatch = segment.match(/^\*\*(.*?)\*\*$/);
    if (boldMatch) {
      renderedNodes.push(
        <strong key={idx} className="font-bold text-black">
          {boldMatch[1]}
        </strong>
      );
      return;
    }

    // 3. Italic: *text*
    const italicMatch = segment.match(/^\*(.*?)\*$/);
    if (italicMatch) {
      renderedNodes.push(
        <em key={idx} className="italic text-slate-900">
          {italicMatch[1]}
        </em>
      );
      return;
    }

    // 4. Standard text
    renderedNodes.push(<span key={idx}>{segment}</span>);
  });

  return <span className={className}>{renderedNodes}</span>;
};
