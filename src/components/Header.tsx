"use client";

import React, { useState } from "react";
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
  } = useResumeStore();

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

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
            <h1 className="font-bold text-slate-900 text-sm tracking-tight">FlowCV Pro</h1>
            <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
              AI Tailor
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
    </header>
  );
};
