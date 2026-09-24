"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Terminal,
  FileDown,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  X,
  Maximize2,
  Minimize2,
  Trash2,
  Clock,
  Sparkles,
  AlertTriangle,
  RotateCcw,
} from "lucide-react";
import { APP_VERSION } from "@/lib/version";

interface AiExecutionTerminalProps {
  logs: string[];
  isLoading: boolean;
  isOpen: boolean;
  onToggleOpen: () => void;
  onClearLogs?: () => void;
  title?: string;
  className?: string;
  contextInfo?: {
    company?: string;
    role?: string;
    mode?: string;
  };
}

export const AiExecutionTerminal: React.FC<AiExecutionTerminalProps> = ({
  logs,
  isLoading,
  isOpen,
  onToggleOpen,
  onClearLogs,
  title = "Live AI Execution Console",
  className = "",
  contextInfo,
}) => {
  const [isCopied, setIsCopied] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const [isExpandedFull, setIsExpandedFull] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll strictly inside container
  useEffect(() => {
    if (isOpen && autoScroll && scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [logs, isOpen, autoScroll]);

  // Export logs to a downloadable .txt file
  const handleExportLogs = () => {
    if (logs.length === 0) return;

    const now = new Date();
    const dateStr = now.toISOString().replace(/[:.]/g, "-").slice(0, 19);
    const filename = `ai_execution_log_${dateStr}.txt`;

    const header = [
      "=================================================================",
      `APPLIANT AI EXECUTION PIPELINE LOG`,
      `Exported: ${now.toLocaleString()}`,
      `App Version: ${APP_VERSION}`,
      contextInfo?.company ? `Target Company: ${contextInfo.company}` : null,
      contextInfo?.role ? `Target Role: ${contextInfo.role}` : null,
      contextInfo?.mode ? `Execution Mode: ${contextInfo.mode}` : null,
      `Total Log Entries: ${logs.length}`,
      "=================================================================",
      "",
    ]
      .filter(Boolean)
      .join("\n");

    const content = header + logs.join("\n") + "\n\n==================== END OF LOG ====================\n";

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Copy all logs to clipboard
  const handleCopyLogs = async () => {
    if (logs.length === 0) return;
    try {
      await navigator.clipboard.writeText(logs.join("\n"));
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch {}
  };

  // Format individual log line with intelligent syntax highlighting
  const formatLogLine = (rawLine: string, index: number) => {
    // Extract timestamp [HH:MM:SS] if present
    const timeMatch = rawLine.match(/^\[(\d{2}:\d{2}:\d{2})\]\s*(.*)$/);
    const timestamp = timeMatch ? timeMatch[1] : null;
    const text = timeMatch ? timeMatch[2] : rawLine;

    const isSuccess = text.includes("✨") || text.toLowerCase().includes("success") || text.includes("complete response");
    const isBackoff = text.includes("⏳") || text.toLowerCase().includes("backoff") || text.toLowerCase().includes("waiting");
    const isWarning = text.includes("⚠️") || text.includes("503") || text.includes("429") || text.includes("overloaded");
    const isError = text.includes("❌") || text.includes("🛑") || text.toLowerCase().includes("error") || text.toLowerCase().includes("failed");
    const isProfile = text.includes("🔑") || text.includes("Profile");
    const isStage = text.includes("⚡") || text.includes("Target model") || text.includes("Stage");

    let lineClass = "text-slate-300";
    let badgeClass = "";

    if (isSuccess) {
      lineClass = "text-emerald-300 font-semibold";
      badgeClass = "bg-emerald-950/60 text-emerald-400 border border-emerald-800/60";
    } else if (isBackoff) {
      lineClass = "text-amber-300";
      badgeClass = "bg-amber-950/60 text-amber-300 border border-amber-800/60";
    } else if (isWarning) {
      lineClass = "text-orange-300";
      badgeClass = "bg-orange-950/60 text-orange-400 border border-orange-800/60";
    } else if (isError) {
      lineClass = "text-rose-400 font-bold";
      badgeClass = "bg-rose-950/60 text-rose-300 border border-rose-800/60";
    } else if (isProfile) {
      lineClass = "text-cyan-300 font-bold";
      badgeClass = "bg-cyan-950/60 text-cyan-300 border border-cyan-800/60";
    } else if (isStage) {
      lineClass = "text-sky-300 font-medium";
      badgeClass = "bg-sky-950/60 text-sky-300 border border-sky-800/60";
    }

    return (
      <div
        key={index}
        className={`flex items-start gap-2 py-0.5 hover:bg-slate-900/60 px-1.5 rounded transition-colors ${lineClass}`}
      >
        <span className="text-[10px] text-slate-500 font-mono select-none w-6 text-right shrink-0">
          {index + 1}
        </span>

        {timestamp && (
          <span className="text-[10px] font-mono text-slate-400 select-none shrink-0 bg-slate-900 px-1 rounded border border-slate-800">
            {timestamp}
          </span>
        )}

        <span className="font-mono text-xs leading-relaxed break-words flex-1">
          {text}
        </span>
      </div>
    );
  };

  // If there are no logs and not loading, don't show an empty bar
  if (logs.length === 0 && !isLoading) {
    return null;
  }

  const latestLog = logs.length > 0 ? logs[logs.length - 1] : "Initializing...";

  return (
    <div
      className={`bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-xl transition-all duration-200 ${
        isExpandedFull ? "fixed inset-4 z-50 flex flex-col" : "relative"
      } ${className}`}
    >
      {/* ──────────────────────────────────────────────────────────── */}
      {/* HEADER / DOCKED STATUS BAR (Always visible when minimized!)  */}
      {/* ──────────────────────────────────────────────────────────── */}
      <div
        className="bg-slate-900/95 px-3 py-2 border-b border-slate-800/80 flex items-center justify-between gap-2 select-none cursor-pointer hover:bg-slate-900 transition-colors"
        onClick={onToggleOpen}
      >
        {/* Left: Terminal status indicator + latest activity summary */}
        <div className="flex items-center gap-2 min-w-0">
          <div className="p-1 rounded bg-slate-800 text-emerald-400 shrink-0">
            <Terminal className="w-3.5 h-3.5" />
          </div>

          <div className="flex items-center gap-2 truncate">
            <span className="font-mono font-bold text-xs text-slate-200 shrink-0">
              {title}
            </span>

            {isLoading ? (
              <span className="flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-800/60 px-1.5 py-0.5 rounded-full shrink-0 animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>Running</span>
              </span>
            ) : (
              <span className="text-[10px] font-mono text-slate-400 bg-slate-800/80 px-1.5 py-0.5 rounded shrink-0">
                {logs.length} events
              </span>
            )}

            {/* When minimized: display the latest log line right in the bar! */}
            {!isOpen && (
              <span className="text-[11px] font-mono text-slate-400 truncate opacity-85 ml-1">
                Latest: {latestLog.replace(/^\[\d{2}:\d{2}:\d{2}\]\s*/, "")}
              </span>
            )}
          </div>
        </div>

        {/* Right: Actions (Copy, Export, Fullscreen, Collapse/Expand) */}
        <div
          className="flex items-center gap-1 shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Copy Logs */}
          <button
            type="button"
            onClick={handleCopyLogs}
            disabled={logs.length === 0}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg text-xs font-mono flex items-center gap-1 transition-colors disabled:opacity-30 cursor-pointer"
            title="Copy all logs to clipboard"
          >
            {isCopied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-[10px] text-emerald-400 font-bold hidden sm:inline">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span className="text-[10px] hidden sm:inline">Copy</span>
              </>
            )}
          </button>

          {/* Export / Download Logs */}
          <button
            type="button"
            onClick={handleExportLogs}
            disabled={logs.length === 0}
            className="p-1.5 text-slate-400 hover:text-indigo-300 hover:bg-slate-800 rounded-lg text-xs font-mono flex items-center gap-1 transition-colors disabled:opacity-30 cursor-pointer"
            title="Download full execution log as .txt"
          >
            <FileDown className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-[10px] hidden sm:inline">Export Log</span>
          </button>

          {/* Expand Fullscreen / Restore */}
          {isOpen && (
            <button
              type="button"
              onClick={() => setIsExpandedFull(!isExpandedFull)}
              className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              title={isExpandedFull ? "Restore compact view" : "Maximize terminal"}
            >
              {isExpandedFull ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>
          )}

          {/* Toggle Expand / Minimize */}
          <button
            type="button"
            onClick={onToggleOpen}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            title={isOpen ? "Minimize terminal" : "Expand terminal"}
          >
            {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────── */}
      {/* EXPANDED TERMINAL BODY                                       */}
      {/* ──────────────────────────────────────────────────────────── */}
      {isOpen && (
        <div className="flex flex-col flex-1 min-h-0">
          {/* Scrollable Log Output */}
          <div
            ref={scrollContainerRef}
            className={`p-3 font-mono text-[11px] overflow-y-auto space-y-0.5 leading-relaxed bg-slate-950 select-text ${
              isExpandedFull ? "flex-1" : "max-h-60"
            }`}
          >
            {logs.map((line, idx) => formatLogLine(line, idx))}

            {isLoading && (
              <div className="flex items-center gap-2 text-slate-400 pt-1 px-1.5 animate-pulse font-mono text-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>[Processing next step in pipeline...]</span>
                <span className="inline-block w-1.5 h-3.5 bg-emerald-400 ml-0.5 animate-pulse" />
              </div>
            )}
          </div>

          {/* Bottom Bar: Auto-scroll indicator & quick summary */}
          <div className="px-3 py-1.5 bg-slate-900/60 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-400 select-none">
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-1.5 cursor-pointer hover:text-slate-200">
                <input
                  type="checkbox"
                  checked={autoScroll}
                  onChange={(e) => setAutoScroll(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-800 text-indigo-600 w-3 h-3 focus:ring-0 cursor-pointer"
                />
                <span>Auto-scroll to bottom</span>
              </label>

              {onClearLogs && !isLoading && logs.length > 0 && (
                <button
                  type="button"
                  onClick={onClearLogs}
                  className="hover:text-red-400 flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Clear</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 text-slate-500">
              <span>Appliant {APP_VERSION}</span>
              <span>•</span>
              <span>Gemini Developer API</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
