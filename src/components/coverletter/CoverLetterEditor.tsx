"use client";

import React, { useState } from "react";
import { useResumeStore } from "@/lib/store";
import {
  Mail,
  Copy,
  Check,
  Printer,
} from "lucide-react";
import { TipTapInput } from "@/components/common/TipTapInput";

export const CoverLetterEditor: React.FC = () => {
  const {
    activeCoverLetter,
    setCoverLetter,
    targetCompany,
    targetRole,
    resume,
  } = useResumeStore();

  const [copied, setCopied] = useState(false);

  const handleCopyText = () => {
    navigator.clipboard.writeText(activeCoverLetter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrintCoverLetter = () => {
    window.print();
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
      {/* Cover Letter Header Controls (Light Mode) */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-indigo-700 font-bold text-sm">
            <Mail className="w-4 h-4" />
            <span>AI Tailored Cover Letter</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyText}
              className="px-2.5 py-1 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold flex items-center gap-1 shadow-xs transition-colors"
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
              onClick={handlePrintCoverLetter}
              className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 shadow-xs transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Letter</span>
            </button>
          </div>
        </div>

        <p className="text-xs text-slate-500">
          Generated in German/English professional standard for <strong className="text-slate-800">{targetCompany || "Target Role"}</strong>. You can edit the text directly using the rich text tools below.
        </p>
      </div>

      {/* Cover Letter Body (TipTap Editor) */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3 shadow-xs">
        <label className="text-xs text-slate-700 font-semibold block">Cover Letter Content</label>
        <TipTapInput
          value={activeCoverLetter}
          onChange={(val) => setCoverLetter(val)}
          minHeight="340px"
        />
      </div>
    </div>
  );
};
