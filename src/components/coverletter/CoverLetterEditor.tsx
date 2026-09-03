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
  const projectsPool = masterContext?.cl_projects_pool || [];

  const [copied, setCopied] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [activeSection, setActiveSection] = useState<"content" | "projects" | "meta">("content");

  // Format filename as requested: CoverLetter_UsmanZakria_[CompanyName].pdf
  const companyClean = (targetCompany || "Company").replace(/[^a-zA-Z0-9_-]/g, "");
  const defaultFilename = cl.documentTitle 
    ? `${cl.documentTitle}.pdf` 
    : `CoverLetter_UsmanZakria_${companyClean}.pdf`;

  const [docFilename, setDocFilename] = useState(defaultFilename);

  const handleDownloadPdf = async () => {
    setIsExporting(true);
    const finalFilename = docFilename.endsWith(".pdf") ? docFilename : `${docFilename}.pdf`;
    await exportCoverLetterToPdf(finalFilename);
    setIsExporting(false);
  };

  const handleCopyFullText = () => {
    // Generate clean plain text representation
    const paras = (cl.bodyParagraphs || [])
      .map((p) => `${p.heading}\n${p.body.replace(/\*\*/g, "").replace(/\[(.*?)\]\(.*?\)/g, "$1")}`)
      .join("\n\n");

    const activeProjects = (cl.selectedClProjectIds || [])
      .map((id) => projectsPool.find((p: any) => p.id === id))
      .filter(Boolean)
      .slice(0, cl.projectCount || 3);

    const projectBullets = activeProjects
      .map((p: any) => `● ${p.title}: ${p.description}`)
      .join("\n");

    const fullText = `${cl.salutation}\n\n${cl.intro.replace(/\*\*/g, "")}\n\n${paras}\n\nPortfolio: https://usmanzakria.com/\n${projectBullets}\n● Certifications: Intermediate SQL, Intermediate Python, Customer Analytics (UPenn)\n\n${cl.availabilityHeading}\n${cl.availabilityText}\n\n${cl.closingLine}\n\n${cl.signOff}\n${cl.senderName}\n${cl.contactLine}`;

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
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700">
              11.5pt Serif Live
            </span>
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
                <span className="text-[11px] font-mono font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200">
                  Pillar #{idx + 1}
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
              Portfolio & Project Bullets (Portfolio: usmanzakria.com)
            </span>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Select how many concise projects to feature. The certifications line is permanently appended.
            </p>
          </div>

          {/* Project Count Toggle: 2, 3, or 4 */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200 self-start sm:self-auto">
            <span className="text-[10px] font-semibold text-slate-500 px-1.5">Show:</span>
            {[2, 3, 4].map((count) => (
              <button
                key={count}
                onClick={() => setCoverLetterProjectCount(count)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  (cl.projectCount || 3) === count
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white"
                }`}
              >
                {count} Projects
              </button>
            ))}
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
