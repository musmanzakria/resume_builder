"use client";

import React, { useState } from "react";
import { useResumeStore } from "@/lib/store";
import {
  Sparkles,
  Building2,
  Briefcase,
  Layers,
  FolderGit2,
  CheckCircle,
  Loader2,
  AlertCircle,
  KeyRound,
} from "lucide-react";
import { NumberStepper } from "@/components/common/NumberStepper";

export const AiTailorPanel: React.FC = () => {
  const {
    targetJobDescription,
    targetCompany,
    targetRole,
    setTargetInfo,
    applyAiTailoringResult,
    resume,
    updateSettings,
  } = useResumeStore();

  const [jd, setJd] = useState(targetJobDescription || "");
  const [company, setCompany] = useState(targetCompany || "");
  const [role, setRole] = useState(targetRole || "");
  const [apiKey, setApiKey] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);

  const handleTailor = async () => {
    if (!jd.trim()) {
      setErrorMsg("Please paste a Job Description first.");
      return;
    }

    setTargetInfo(role, company, jd);
    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch("/api/tailor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobDescription: jd,
          targetCompany: company,
          targetRole: role,
          apiKey,
          masterResumeData: resume,
          topN: resume.settings.aiProjectCount || 5,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to tailor resume with AI.");
      }

      const resJson = await res.json();
      const tailoredData = resJson.data || resJson;

      applyAiTailoringResult({
        selectedPresetKey: tailoredData.selectedPresetKey || tailoredData.classification?.experience_preset,
        selectedSkillKey: tailoredData.selectedSkillKey || tailoredData.classification?.variable_skill,
        selectedProjectIds: tailoredData.selectedProjectIds || tailoredData.project_ranking?.slice(0, resume.settings.aiProjectCount || 5),
        tailoredSummary: tailoredData.tailoredSummary || tailoredData.tailored_summary,
        closingLine: tailoredData.closingLine || tailoredData.closing_line,
        coverLetter: tailoredData.coverLetter || tailoredData.cover_letter,
      });

      setSuccessMsg(
        `Resume successfully tailored for ${company || "Target Role"}!`
      );
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "An unexpected error occurred during AI tailoring.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
      {/* Header Banner (Light Mode) */}
      <div className="bg-gradient-to-br from-indigo-50 via-white to-purple-50 border border-indigo-100 rounded-xl p-4 space-y-2 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-indigo-700 font-bold text-sm">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span>AI Resume & Cover Letter Tailoring Engine</span>
          </div>
          <button
            onClick={() => setShowApiKeyInput(!showApiKeyInput)}
            className="text-[11px] text-slate-500 hover:text-indigo-600 flex items-center gap-1"
          >
            <KeyRound className="w-3 h-3" />
            <span>{apiKey ? "Custom Key Set" : "Gemini API Key"}</span>
          </button>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed">
          Paste the job description. The AI analyzes the role, selects your optimal HashMove experience preset, ranks and picks the top projects, tailor-writes the profile summary & closing sentence, and drafts a custom cover letter.
        </p>
      </div>

      {/* API Key Modal / Dropdown */}
      {showApiKeyInput && (
        <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-2 text-xs shadow-sm">
          <label className="font-semibold text-slate-700 block">Gemini 3.1 Pro API Key (Optional)</label>
          <p className="text-[11px] text-slate-500">
            Leave blank to use the system default server key, or provide your personal Gemini key:
          </p>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="AIzaSy..."
            className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-indigo-500 font-mono"
          />
        </div>
      )}

      {/* Target Company & Role Inputs (Light Mode) */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3 shadow-xs">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-slate-700 font-semibold flex items-center gap-1.5 mb-1">
              <Building2 className="w-3.5 h-3.5 text-indigo-600" />
              Target Company
            </label>
            <input
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="e.g. autarc, Zalando, Personio"
              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="text-xs text-slate-700 font-semibold flex items-center gap-1.5 mb-1">
              <Briefcase className="w-3.5 h-3.5 text-indigo-600" />
              Target Role
            </label>
            <input
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="e.g. Marketing Working Student"
              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* AI Top Projects Setting */}
        <div className="pt-2 border-t border-slate-100">
          <NumberStepper
            label="How Many Top Projects Should AI Select?"
            value={resume.settings.aiProjectCount || 5}
            onChange={(val) => updateSettings({ aiProjectCount: val })}
            min={1}
            max={resume.projects.length || 10}
            step={1}
            presets={[3, 4, 5, 6]}
          />
        </div>
      </div>

      {/* Job Description Textarea (Light Mode) */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2 shadow-xs">
        <label className="text-xs text-slate-700 font-semibold block">
          Paste Target Job Description (JD)
        </label>
        <textarea
          value={jd}
          onChange={(e) => setJd(e.target.value)}
          rows={10}
          placeholder="Paste the full job posting requirements, responsibilities, and about company here..."
          className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-indigo-500 leading-relaxed font-sans"
        />
      </div>

      {/* Error & Success Alerts */}
      {errorMsg && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2 text-xs text-red-700">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-500 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-2 text-xs text-emerald-800">
          <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Tailor Resume Action Button */}
      <button
        onClick={handleTailor}
        disabled={isLoading}
        className="w-full py-3 bg-gradient-to-r from-indigo-600 via-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-indigo-500/20 transition-all disabled:opacity-60"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Analyzing JD & Tailoring Resume with Gemini AI...</span>
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4" />
            <span>Run AI Tailoring (Resume + Cover Letter)</span>
          </>
        )}
      </button>
    </div>
  );
};
