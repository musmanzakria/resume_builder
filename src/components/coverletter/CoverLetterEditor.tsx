"use client";

import React, { useState } from "react";
import { useResumeStore } from "@/lib/store";
import {
  Mail,
  Copy,
  Check,
  Download,
  Building2,
  Sparkles,
  ExternalLink,
  Layers,
  ChevronDown,
  ChevronUp,
  FileDown,
  RefreshCw,
  FolderGit2
} from "lucide-react";
import { TipTapInput } from "@/components/common/TipTapInput";
import { exportCoverLetterToPdf } from "@/lib/pdfExport";

export const CoverLetterEditor: React.FC = () => {
  const {
    structuredCoverLetter,
    setStructuredCoverLetter,
    updateCoverLetterBodyParagraph,
    toggleClProjectSelection,
    setCoverLetterProjectCount,
    masterContext,
    targetCompany,
    targetRole,
    setTargetInfo
  } = useResumeStore();

  const cl = structuredCoverLetter;

  const fallbackProjects = [
    { id: "cl-video-onboarding", title: "Video Onboarding Tutorial", description: "for the Arab British Chamber of Commerce.", url: "https://drive.google.com/file/d/1cGCwr_uMH9M9Q9UhLWiNDZ84CcDQqav4/view?usp=drive_link" },
    { id: "cl-agentic-ai-finance", title: "Agentic AI in Finance", description: "Exploring Agentic AI players and use cases in Finance.", url: "https://usmanzakria.com/agentic_ai_finance_showcase.html" },
    { id: "cl-figma-agile", title: "Figma Article Illustrations", description: "Simplifying Agile SDLC concepts for diverse audiences.", url: "https://drive.google.com/file/d/1K-0Giu770y-g7NXkeyFq5JnECW3cbUId/view?usp=drive_link" },
    { id: "cl-ai-logistics", title: "AI-Powered Logistics", description: "Architected an AI-powered logistics platform, including Conversational AI.", url: "https://www.hashmove.com/solutions/ai" },
    { id: "cl-songs-shrinking", title: "Are Songs Shrinking?", description: "Regression analysis of 3600 songs, how Spotify shortened songs by 17%.", url: "https://usmanzakria.com/spotify_showcase.html" },
    { id: "cl-consumer-insights", title: "Consumer Insights Research", description: "studies on TikTok, optimizing Dawlance’s e-commerce strategy.", url: "https://drive.google.com/file/d/1erTLrO6XSKsLK10Hos-etKS03nUBfZvi/view?usp=drive_link" },
    { id: "cl-ai-saliency", title: "AI Saliency for Marketing", description: "Explored deep learning and neuroscience-based saliency models.", url: "https://usmanzakria.com/marketing_analytics_showcase.html" },
    { id: "cl-ai-digital-twin", title: "AI Digital Twin", description: "Synthesized 11 psychographics into a functional AI clone of myself.", url: "https://usmanzakria.com/ai_persona_showcase.html" },
    { id: "cl-signavio-celonis", title: "Signavio vs Celonis", description: "competitive analysis of leading BPM solutions.", url: "https://usmanzakria.com/" },
    { id: "cl-property-price", title: "Property Price Prediction", description: "Identify key property value drivers for Airbnb in NYC.", url: "https://usmanzakria.com/" },
    { id: "cl-salon-booking", title: "Salon Booking Application", description: "Business case, high-fidelity prototype, and GTM strategy for L’Oreal.", url: "https://usmanzakria.com/loreal_savoir_showcase.html" },
    { id: "cl-change-management", title: "Change Management @ Ford", description: "Analyzed Ford’s change strategy using Kotter’s 8-step change model.", url: "https://usmanzakria.com/change_management_showcase.html" },
    { id: "cl-brandstorm", title: "Brandstorm National Finalist", description: "Business case, prototype, and GTM strategy for L'Oreal Brandstorm.", url: "https://usmanzakria.com/loreal_brandstorm_showcase.html" },
    { id: "cl-loreal-finance", title: "L’Oreal Financial Analysis", description: "Comprehensive ESG and financial analysis, including WACC model.", url: "https://drive.google.com/file/d/1qFMm8NDClL0NqRSvXktpE87le6_2s8RF/view?usp=drive_link" }
  ];

  const projectsPool = (masterContext?.cl_projects_pool?.length ? masterContext.cl_projects_pool : fallbackProjects) || fallbackProjects;

  const [copied, setCopied] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Synchronize filename reactively
  const companyClean = (targetCompany || "Company").replace(/[^a-zA-Z0-9_-]/g, "");
  const defaultFilename = cl.documentTitle 
    ? (cl.documentTitle.endsWith(".pdf") ? cl.documentTitle : `${cl.documentTitle}.pdf`)
    : `CoverLetter_UsmanZakria_${companyClean || "Company"}.pdf`;

  const [docFilename, setDocFilename] = useState(defaultFilename);

  // Sync if targetCompany changes
  React.useEffect(() => {
    if (targetCompany) {
      const clean = targetCompany.replace(/[^a-zA-Z0-9_-]/g, "");
      const generatedName = `CoverLetter_UsmanZakria_${clean || "Company"}.pdf`;
      setDocFilename(generatedName);
    }
  }, [targetCompany]);

  const handleDownloadPdf = async () => {
    setIsExporting(true);
    const finalFilename = docFilename.endsWith(".pdf") ? docFilename : `${docFilename}.pdf`;
    await exportCoverLetterToPdf(finalFilename);
    setIsExporting(false);
  };

  const handleCopyFullText = () => {
    // Generate clean plain text representation
    const paras = (cl.bodyParagraphs || [])
      .map((p) => `${p.heading}\n${p.body.replace(/\*\*\*/g, "").replace(/\*\*/g, "").replace(/\*/g, "").replace(/\[(.*?)\]\(.*?\)/g, "$1")}`)
      .join("\n\n");

    const activeProjects = (cl.selectedClProjectIds || [])
      .map((id) => projectsPool.find((p: any) => p.id === id))
      .filter(Boolean)
      .slice(0, cl.projectCount || 3);

    const projectBullets = activeProjects
      .map((p: any) => `● ${p.title}: ${p.description}`)
      .join("\n");

    const fullText = `${cl.salutation}\n\n${cl.intro.replace(/\*\*\*/g, "").replace(/\*\*/g, "").replace(/\*/g, "")}\n\n${paras}\n\nPortfolio: https://usmanzakria.com/\n${projectBullets}\n● Certifications: Intermediate SQL, Intermediate Python, Customer Analytics (UPenn)\n\n${cl.availabilityHeading}\n${cl.availabilityText}\n\n${cl.closingLine}\n\n${cl.signOff}\n${cl.senderName}\n${cl.contactLine}`;

    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCompanyChange = (newCompany: string) => {
    setTargetInfo(targetRole, newCompany, "");
    const clean = newCompany.replace(/[^a-zA-Z0-9_-]/g, "");
    setStructuredCoverLetter({
      salutation: newCompany.trim() ? `Dear ${newCompany.trim()} Team,` : "Dear Hiring Team,",
      documentTitle: `CoverLetter_UsmanZakria_${clean || "Company"}`
    });
    setDocFilename(`CoverLetter_UsmanZakria_${clean || "Company"}.pdf`);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/60 text-slate-800">
      {/* Top Banner with Action Controls */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-indigo-700 font-bold text-sm">
            <Mail className="w-4 h-4 text-indigo-600" />
            <span>Cover Letter Editor</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyFullText}
              className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-500" />
                  <span>Copy Text</span>
                </>
              )}
            </button>

            <button
              onClick={handleDownloadPdf}
              disabled={isExporting}
              className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span>{isExporting ? "Generating PDF..." : "Download PDF"}</span>
            </button>
          </div>
        </div>

        {/* Company & PDF Filename bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-slate-100 text-xs">
          <div>
            <label className="text-[11px] font-semibold text-slate-600 block mb-1">
              Target Company Name
            </label>
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl">
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                value={targetCompany}
                onChange={(e) => handleCompanyChange(e.target.value)}
                placeholder="e.g. eBay, SAP, Parloa"
                className="bg-transparent border-none text-xs text-slate-900 focus:outline-none w-full font-semibold"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-600 block mb-1">
              PDF Export Filename
            </label>
            <input
              type="text"
              value={docFilename}
              onChange={(e) => setDocFilename(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 font-mono focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Spacing & Margin Stepper Controls (NO RADIO BUTTONS) */}
        <div className="pt-2 border-t border-slate-100 space-y-2">
          <span className="text-[11px] font-bold text-slate-700 block">
            Layout, Typography & Margin Controls
          </span>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            {/* 1. Line Spacing Stepper */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 space-y-1">
              <label className="text-[11px] font-semibold text-slate-600 block">
                Line Spacing
              </label>
              <div className="flex items-center justify-between bg-white border border-slate-300 rounded-lg p-0.5">
                <button
                  type="button"
                  onClick={() => {
                    const current = Number(cl.lineSpacing || 1.18);
                    const updated = Math.max(1.0, parseFloat((current - 0.02).toFixed(2)));
                    setStructuredCoverLetter({ lineSpacing: updated });
                  }}
                  className="w-7 h-7 flex items-center justify-center rounded text-slate-700 hover:text-indigo-600 hover:bg-slate-100 font-bold text-sm"
                >
                  -
                </button>
                <input
                  type="number"
                  step="0.02"
                  min="1.0"
                  max="2.0"
                  value={Number(cl.lineSpacing || 1.18).toFixed(2)}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    if (!isNaN(val)) setStructuredCoverLetter({ lineSpacing: val });
                  }}
                  className="w-12 text-center text-xs font-bold text-indigo-700 font-mono bg-transparent focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => {
                    const current = Number(cl.lineSpacing || 1.18);
                    const updated = Math.min(2.0, parseFloat((current + 0.02).toFixed(2)));
                    setStructuredCoverLetter({ lineSpacing: updated });
                  }}
                  className="w-7 h-7 flex items-center justify-center rounded text-slate-700 hover:text-indigo-600 hover:bg-slate-100 font-bold text-sm"
                >
                  +
                </button>
              </div>
            </div>

            {/* 2. Paragraph Spacing Stepper */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 space-y-1">
              <label className="text-[11px] font-semibold text-slate-600 block">
                Paragraph Gap (px)
              </label>
              <div className="flex items-center justify-between bg-white border border-slate-300 rounded-lg p-0.5">
                <button
                  type="button"
                  onClick={() => {
                    const current = cl.paragraphSpacing !== undefined ? cl.paragraphSpacing : 8;
                    const updated = Math.max(0, current - 1);
                    setStructuredCoverLetter({ paragraphSpacing: updated });
                  }}
                  className="w-7 h-7 flex items-center justify-center rounded text-slate-700 hover:text-indigo-600 hover:bg-slate-100 font-bold text-sm"
                >
                  -
                </button>
                <input
                  type="number"
                  step="1"
                  min="0"
                  max="30"
                  value={cl.paragraphSpacing !== undefined ? cl.paragraphSpacing : 8}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    if (!isNaN(val)) setStructuredCoverLetter({ paragraphSpacing: val });
                  }}
                  className="w-12 text-center text-xs font-bold text-indigo-700 font-mono bg-transparent focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => {
                    const current = cl.paragraphSpacing !== undefined ? cl.paragraphSpacing : 8;
                    const updated = Math.min(30, current + 1);
                    setStructuredCoverLetter({ paragraphSpacing: updated });
                  }}
                  className="w-7 h-7 flex items-center justify-center rounded text-slate-700 hover:text-indigo-600 hover:bg-slate-100 font-bold text-sm"
                >
                  +
                </button>
              </div>
            </div>

            {/* 3. Bullet Spacing Stepper */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 space-y-1">
              <label className="text-[11px] font-semibold text-slate-600 block">
                Bullet Gap (px)
              </label>
              <div className="flex items-center justify-between bg-white border border-slate-300 rounded-lg p-0.5">
                <button
                  type="button"
                  onClick={() => {
                    const current = cl.bulletSpacing !== undefined ? cl.bulletSpacing : 4;
                    const updated = Math.max(0, current - 1);
                    setStructuredCoverLetter({ bulletSpacing: updated });
                  }}
                  className="w-7 h-7 flex items-center justify-center rounded text-slate-700 hover:text-indigo-600 hover:bg-slate-100 font-bold text-sm"
                >
                  -
                </button>
                <input
                  type="number"
                  step="1"
                  min="0"
                  max="20"
                  value={cl.bulletSpacing !== undefined ? cl.bulletSpacing : 4}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    if (!isNaN(val)) setStructuredCoverLetter({ bulletSpacing: val });
                  }}
                  className="w-12 text-center text-xs font-bold text-indigo-700 font-mono bg-transparent focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => {
                    const current = cl.bulletSpacing !== undefined ? cl.bulletSpacing : 4;
                    const updated = Math.min(20, current + 1);
                    setStructuredCoverLetter({ bulletSpacing: updated });
                  }}
                  className="w-7 h-7 flex items-center justify-center rounded text-slate-700 hover:text-indigo-600 hover:bg-slate-100 font-bold text-sm"
                >
                  +
                </button>
              </div>
            </div>

            {/* 4. Left/Right Margin Stepper */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 space-y-1">
              <label className="text-[11px] font-semibold text-slate-600 block">
                Sides Margin (mm)
              </label>
              <div className="flex items-center justify-between bg-white border border-slate-300 rounded-lg p-0.5">
                <button
                  type="button"
                  onClick={() => {
                    const current = cl.horizontalMargin !== undefined ? cl.horizontalMargin : 20;
                    const updated = Math.max(10, current - 1);
                    setStructuredCoverLetter({ horizontalMargin: updated });
                  }}
                  className="w-7 h-7 flex items-center justify-center rounded text-slate-700 hover:text-indigo-600 hover:bg-slate-100 font-bold text-sm"
                >
                  -
                </button>
                <input
                  type="number"
                  step="1"
                  min="10"
                  max="35"
                  value={cl.horizontalMargin !== undefined ? cl.horizontalMargin : 20}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    if (!isNaN(val)) setStructuredCoverLetter({ horizontalMargin: val });
                  }}
                  className="w-12 text-center text-xs font-bold text-indigo-700 font-mono bg-transparent focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => {
                    const current = cl.horizontalMargin !== undefined ? cl.horizontalMargin : 20;
                    const updated = Math.min(35, current + 1);
                    setStructuredCoverLetter({ horizontalMargin: updated });
                  }}
                  className="w-7 h-7 flex items-center justify-center rounded text-slate-700 hover:text-indigo-600 hover:bg-slate-100 font-bold text-sm"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 1. Salutation & Introduction */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
            <span className="w-4 h-4 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px]">1</span>
            Salutation & Opening Hook
          </span>
          <input
            type="text"
            value={cl.salutation}
            onChange={(e) => setStructuredCoverLetter({ salutation: e.target.value })}
            className="text-xs font-semibold text-indigo-700 bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1 focus:outline-none"
            placeholder="Dear Team,"
          />
        </div>

        <TipTapInput
          label="Introduction Paragraph (Fuses domain authority & targeted role)"
          value={cl.intro}
          onChange={(val) => setStructuredCoverLetter({ intro: val })}
          rows={3}
        />
      </div>

      {/* 2. Three Core Body Paragraphs */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <div>
            <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px]">2</span>
              Three Key Competency Paragraphs (Mapped to JD)
            </span>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Each paragraph begins with a bold heading. Embolden key metrics (**362%**, **8.5 IELTS**) and tools (**Excel**, **n8n**).
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {(cl.bodyParagraphs || []).map((para, idx) => (
            <div key={idx} className="p-4 bg-slate-50/80 border border-slate-200 rounded-xl space-y-2.5">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                  Area #{idx + 1}
                </span>
                <input
                  type="text"
                  value={para.heading}
                  onChange={(e) => updateCoverLetterBodyParagraph(idx, { heading: e.target.value })}
                  placeholder={`Heading ${idx + 1} (e.g. Internal Enablement and Content Creation)`}
                  className="flex-1 px-3 py-1 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-900 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <TipTapInput
                value={para.body}
                onChange={(val) => updateCoverLetterBodyParagraph(idx, { body: val })}
                rows={3}
                placeholder="Detail your practical accomplishments matching this requirement..."
              />
            </div>
          ))}
        </div>
      </div>

      {/* 3. Portfolio & Projects Section */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
          <div>
            <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px]">3</span>
              Projects & Portfolio Section
            </span>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Select how many concise projects to feature. The certifications line is permanently appended.
            </p>
          </div>

          {/* Project Count Stepper: 1 to 6 */}
          <div className="flex items-center gap-2 bg-slate-100 px-3 py-1 rounded-xl border border-slate-200 self-start sm:self-auto">
            <span className="text-[11px] font-semibold text-slate-700">Project Count:</span>
            <div className="flex items-center bg-white border border-slate-300 rounded-lg p-0.5 shadow-xs">
              <button
                type="button"
                onClick={() => setCoverLetterProjectCount(Math.max(1, (cl.projectCount || 5) - 1))}
                disabled={(cl.projectCount || 5) <= 1}
                className="w-6 h-6 flex items-center justify-center rounded text-slate-700 hover:text-indigo-600 hover:bg-slate-100 disabled:opacity-25 font-bold text-sm"
              >
                -
              </button>
              <input
                type="number"
                min="1"
                max="6"
                value={cl.projectCount || 5}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  if (!isNaN(val) && val >= 1 && val <= 6) setCoverLetterProjectCount(val);
                }}
                className="w-7 text-center text-xs font-bold text-indigo-700 font-mono bg-transparent focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setCoverLetterProjectCount(Math.min(6, (cl.projectCount || 5) + 1))}
                disabled={(cl.projectCount || 5) >= 6}
                className="w-6 h-6 flex items-center justify-center rounded text-slate-700 hover:text-indigo-600 hover:bg-slate-100 disabled:opacity-25 font-bold text-sm"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* Customizable Section Header Text and Portfolio Link */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-50/80 border border-slate-200 rounded-xl text-xs">
          <div>
            <label className="text-[11px] font-semibold text-slate-700 block mb-1">
              Section Header Text
            </label>
            <input
              type="text"
              value={cl.portfolioHeading || "Projects and Portfolio: usmanzakria.com"}
              onChange={(e) => setStructuredCoverLetter({ portfolioHeading: e.target.value })}
              className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-900 focus:outline-none"
            />
          </div>
          <div>
            <label className="text-[11px] font-semibold text-slate-700 block mb-1">
              Portfolio URL
            </label>
            <input
              type="text"
              value={cl.portfolioUrl || "https://usmanzakria.com/"}
              onChange={(e) => setStructuredCoverLetter({ portfolioUrl: e.target.value })}
              className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-blue-600 font-mono focus:outline-none"
            />
          </div>
        </div>

        {/* Selected Project List & Pool Selection */}
        <div className="space-y-2">
          <label className="text-[11px] font-semibold text-slate-700 block">
            Choose Projects from Pool (Top {cl.projectCount || 3} will appear on Cover Letter):
          </label>

          <div className="max-h-60 overflow-y-auto space-y-1.5 pr-1 border border-slate-200 rounded-xl p-2 bg-slate-50/50">
            {projectsPool.map((proj: any) => {
              const isSelected = (cl.selectedClProjectIds || []).includes(proj.id);

              return (
                <div
                  key={proj.id}
                  onClick={() => toggleClProjectSelection(proj.id)}
                  className={`p-2.5 rounded-lg border text-xs cursor-pointer flex items-start gap-2.5 transition-all ${
                    isSelected
                      ? "bg-indigo-50/80 border-indigo-200 text-indigo-950 font-medium"
                      : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => {}} // handled by parent div onClick
                    className="mt-0.5 rounded text-indigo-600 focus:ring-0 cursor-pointer"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-slate-900">{proj.title}</span>
                      {proj.url && (
                        <a
                          href={proj.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <ExternalLink className="w-3 h-3 inline" />
                        </a>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">{proj.description}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-2.5 bg-slate-100 border border-slate-200 rounded-xl text-[11px] text-slate-600 flex items-center gap-2">
            <span className="font-bold text-slate-800">• Permanent:</span>
            <span>Certifications: Intermediate SQL, Intermediate Python, Customer Analytics (UPenn)</span>
          </div>
        </div>
      </div>

      {/* 4. Position Preference & Availability */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
        <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5 border-b border-slate-100 pb-2.5">
          <span className="w-4 h-4 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px]">4</span>
          Position Preference, Availability & Sign-Off
        </span>

        <div>
          <label className="text-[11px] font-semibold text-slate-600 block mb-1">
            Availability Statement
          </label>
          <textarea
            value={cl.availabilityText}
            onChange={(e) => setStructuredCoverLetter({ availabilityText: e.target.value })}
            rows={2}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-indigo-500 leading-relaxed"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
          <div>
            <label className="text-[11px] font-semibold text-slate-600 block mb-1">
              Closing Sign-off
            </label>
            <input
              type="text"
              value={cl.signOff}
              onChange={(e) => setStructuredCoverLetter({ signOff: e.target.value })}
              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-600 block mb-1">
              Sender Name
            </label>
            <input
              type="text"
              value={cl.senderName}
              onChange={(e) => setStructuredCoverLetter({ senderName: e.target.value })}
              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none font-semibold"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
