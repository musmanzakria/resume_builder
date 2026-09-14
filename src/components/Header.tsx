"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useResumeStore } from "@/lib/store";
import {
  FileText,
  Sliders,
  Sparkles,
  Palette,
  Mail,
  History,
  Database,
  Printer,
  Save,
  ZoomIn,
  ZoomOut,
  Maximize2,
  CheckCircle,
  Download,
  Loader2,
  Cloud,
  Check,
  FileQuestion,
  Copy,
  CheckCheck,
  X,
} from "lucide-react";
import { exportResumeToPdf, exportCoverLetterToPdf } from "@/lib/pdfExport";

export const Header: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    previewZoom,
    setPreviewZoom,
    saveCurrentApplication,
    targetCompany,
    targetRole,
    resume,
    structuredCoverLetter,
    cloudSyncStatus,
    screeningAnswers,
  } = useResumeStore();

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [showScreeningModal, setShowScreeningModal] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedQuestionIndex, setCopiedQuestionIndex] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const stripMarkdown = (str: string) => str.replace(/\*\*(.*?)\*\*/g, "$1");

  const handleSave = () => {
    saveCurrentApplication();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleDownloadPdf = async () => {
    setIsExporting(true);
    if (activeTab === "cover-letter") {
      const companyClean = (targetCompany || "Company").replace(/[^a-zA-Z0-9_-]/g, "");
      const filename = structuredCoverLetter?.documentTitle 
        ? (structuredCoverLetter.documentTitle.endsWith(".pdf") ? structuredCoverLetter.documentTitle : `${structuredCoverLetter.documentTitle}.pdf`)
        : `CoverLetter_UsmanZakria_${companyClean}.pdf`;
      await exportCoverLetterToPdf(filename);
    } else {
      const filename = `${resume.personal.fullName.replace(/\s+/g, "_")}_Resume_${targetCompany || "Master"}.pdf`;
      await exportResumeToPdf(filename);
    }
    setIsExporting(false);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <header className="h-16 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 md:px-6 flex items-center justify-between z-30 sticky top-0 shadow-sm no-print">
      {/* Brand & Title */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 flex items-center justify-center shadow-md shadow-indigo-500/20">
          <FileText className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-bold text-slate-900 text-sm tracking-tight">Appliant</h1>
            <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
              AI Tailor
            </span>
            <span
              className={`hidden sm:inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-medium transition-colors ${
                cloudSyncStatus === "saving"
                  ? "bg-amber-50 text-amber-700 border border-amber-200"
                  : "bg-emerald-50 text-emerald-700 border border-emerald-200"
              }`}
              title={cloudSyncStatus === "saving" ? "Syncing changes to Supabase..." : "Synced with Supabase Cloud"}
            >
              {cloudSyncStatus === "saving" ? (
                <>
                  <Cloud className="w-3 h-3 animate-pulse text-amber-500" />
                  <span>Syncing...</span>
                </>
              ) : (
                <>
                  <Check className="w-3 h-3 text-emerald-600" />
                  <span>Cloud Synced</span>
                </>
              )}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 hidden sm:block">
            {targetCompany ? `${targetCompany} — ${targetRole}` : "Muhammad Usman • Master Resume"}
          </p>
        </div>
      </div>

      {/* Main Mode Tabs */}
      <nav className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
        <button
          onClick={() => setActiveTab("editor")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            activeTab === "editor"
              ? "bg-white text-indigo-700 shadow-sm border border-slate-200/80 font-semibold"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Content</span>
        </button>

        <button
          onClick={() => setActiveTab("presets")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            activeTab === "presets"
              ? "bg-white text-indigo-700 shadow-sm border border-slate-200/80 font-semibold"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Presets</span>
        </button>

        <button
          onClick={() => setActiveTab("ai")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            activeTab === "ai"
              ? "bg-indigo-600 text-white shadow-sm font-semibold"
              : "text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 animate-pulse text-indigo-500" />
          <span>AI Tailor</span>
        </button>

        <button
          onClick={() => setActiveTab("cover-letter")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            activeTab === "cover-letter"
              ? "bg-white text-indigo-700 shadow-sm border border-slate-200/80 font-semibold"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
          }`}
        >
          <Mail className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Cover Letter</span>
        </button>

        <button
          onClick={() => setActiveTab("design")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            activeTab === "design"
              ? "bg-white text-indigo-700 shadow-sm border border-slate-200/80 font-semibold"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
          }`}
        >
          <Palette className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Styling</span>
        </button>

        <button
          onClick={() => setActiveTab("history")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            activeTab === "history"
              ? "bg-white text-indigo-700 shadow-sm border border-slate-200/80 font-semibold"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Saved Jobs</span>
        </button>

        <button
          onClick={() => setActiveTab("settings")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            activeTab === "settings"
              ? "bg-white text-indigo-700 shadow-sm border border-slate-200/80 font-semibold"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          <span className="hidden lg:inline">Master Assets</span>
        </button>
      </nav>

      {/* Right Controls: Zoom, Save, Download PDF, Print */}
      <div className="flex items-center gap-2">
        {/* Zoom Controls */}
        <div className="hidden xl:flex items-center bg-slate-100 border border-slate-200 rounded-lg p-0.5 text-slate-600">
          <button
            onClick={() => setPreviewZoom(Math.max(0.5, previewZoom - 0.1))}
            className="p-1 hover:text-slate-900 hover:bg-slate-200/80 rounded"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="text-[11px] px-2 font-mono font-medium">{Math.round(previewZoom * 100)}%</span>
          <button
            onClick={() => setPreviewZoom(Math.min(1.5, previewZoom + 0.1))}
            className="p-1 hover:text-slate-900 hover:bg-slate-200/80 rounded"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setPreviewZoom(1.0)}
            className="p-1 hover:text-slate-900 hover:bg-slate-200/80 rounded"
            title="Reset Zoom (100%)"
          >
            <Maximize2 className="w-3 h-3" />
          </button>
        </div>

        {/* Screening Answers Portal Button (Shows when questions exist) */}
        {screeningAnswers && screeningAnswers.length > 0 && (
          <button
            onClick={() => setShowScreeningModal(true)}
            className="px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 shadow-xs transition-colors"
            title="Open Screening Answers copy/paste drawer"
          >
            <FileQuestion className="w-3.5 h-3.5 text-amber-600" />
            <span className="hidden sm:inline">Screening Answers</span>
            <span className="w-4 h-4 rounded-full bg-amber-600 text-white text-[10px] flex items-center justify-center font-bold">
              {screeningAnswers.length}
            </span>
          </button>
        )}

        {/* Save Application Button */}
        <button
          onClick={handleSave}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
            savedSuccess
              ? "bg-emerald-600 text-white"
              : "bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 shadow-sm"
          }`}
        >
          {savedSuccess ? (
            <>
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Saved!</span>
            </>
          ) : (
            <>
              <Save className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">Save Snapshot</span>
            </>
          )}
        </button>

        {/* Direct Download 1:1 Vector PDF */}
        <button
          onClick={handleDownloadPdf}
          disabled={isExporting}
          className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all disabled:opacity-60"
          title="Download exact 100% Vector ATS-Compliant PDF"
        >
          {isExporting ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Exporting PDF...</span>
            </>
          ) : (
            <>
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF</span>
            </>
          )}
        </button>
      </div>

      {/* Quick Screening Answers Modal (Mounted directly to document.body to avoid header stacking context) */}
      {showScreeningModal && isMounted && typeof document !== "undefined" && createPortal(
        <div 
          className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
          onClick={() => setShowScreeningModal(false)}
        >
          <div 
            className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150 relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-700 shrink-0">
                  <FileQuestion className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Application Screening Answers ({screeningAnswers.length})
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Copy and paste directly into job portal screening question fields
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const formatted = screeningAnswers
                      .map((item, idx) => `Question ${idx + 1}: ${item.question}\n\nAnswer:\n${stripMarkdown(item.answer)}`)
                      .join("\n\n" + "═".repeat(40) + "\n\n");
                    navigator.clipboard.writeText(formatted);
                    setCopiedAll(true);
                    setTimeout(() => setCopiedAll(false), 2000);
                  }}
                  className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-1 bg-white px-2.5 py-1.5 rounded-lg border border-slate-200 shadow-xs transition-colors"
                >
                  {copiedAll ? (
                    <>
                      <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700">Copied All!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy All Q&A</span>
                    </>
                  )}
                </button>
                <button
                  onClick={() => setShowScreeningModal(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60 transition-colors"
                  title="Close (Esc)"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-4 overflow-y-auto space-y-3.5 flex-1 bg-slate-50/50">
              {screeningAnswers.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-white border border-slate-200 rounded-xl p-4 space-y-2.5 shadow-xs"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <span className="inline-block px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-indigo-100 text-indigo-800 rounded mr-2">
                        Q{idx + 1}
                      </span>
                      <span className="text-xs font-bold text-slate-900 leading-snug">
                        {item.question}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(item.question);
                          setCopiedQuestionIndex(idx);
                          setTimeout(() => setCopiedQuestionIndex(null), 2000);
                        }}
                        className="text-[11px] font-medium text-slate-600 hover:text-indigo-600 flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-md border border-slate-200 transition-colors"
                        title="Copy Question"
                      >
                        {copiedQuestionIndex === idx ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-emerald-700 font-bold">Copied Q</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-slate-400" />
                            <span>Copy Q</span>
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(stripMarkdown(item.answer));
                          setCopiedIndex(idx);
                          setTimeout(() => setCopiedIndex(null), 2000);
                        }}
                        className="text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 flex items-center gap-1 px-3 py-1 rounded-md shadow-xs transition-colors"
                        title="Copy Answer to Clipboard"
                      >
                        {copiedIndex === idx ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-white" />
                            <span>Copied Answer!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy Answer</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="text-slate-800 leading-relaxed whitespace-pre-wrap bg-slate-50/70 p-3 rounded-lg border border-slate-200 font-sans text-xs">
                    {item.answer.split(/(\*\*[^*]+\*\*)/g).map((part, pIdx) => {
                      if (part.startsWith("**") && part.endsWith("**")) {
                        return (
                          <strong key={pIdx} className="font-bold text-slate-900">
                            {part.slice(2, -2)}
                          </strong>
                        );
                      }
                      return <span key={pIdx}>{part}</span>;
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>,
        document.body
      )}
    </header>
  );
};
