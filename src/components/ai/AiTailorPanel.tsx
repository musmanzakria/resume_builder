"use client";

import React, { useState, useEffect, useRef } from "react";
import { useResumeStore } from "@/lib/store";
import {
  Sparkles,
  Building2,
  Briefcase,
  CheckCircle,
  Loader2,
  AlertCircle,
  KeyRound,
  Cpu,
  Save,
  Check,
  Terminal,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { NumberStepper } from "@/components/common/NumberStepper";

export const AiTailorPanel: React.FC = () => {
  const {
    targetJobDescription,
    targetCompany,
    targetRole,
    geminiApiKey,
    selectedAiModel,
    setTargetInfo,
    setGeminiApiKey,
    setSelectedAiModel,
    applyAiTailoringResult,
    resume,
    masterContext,
    updateSettings,
  } = useResumeStore();

  const [jd, setJd] = useState(targetJobDescription || "");
  const [company, setCompany] = useState(targetCompany || "");
  const [role, setRole] = useState(targetRole || "");
  const [apiKeyInput, setApiKeyInput] = useState(geminiApiKey || "");
  const [modelInput, setModelInput] = useState(selectedAiModel || "gemini-2.0-flash");
  const [customModel, setCustomModel] = useState("");
  const [apiKeySaved, setApiKeySaved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);

  // Live Console State
  const [consoleLogs, setConsoleLogs] = useState<string[]>([]);
  const [showConsole, setShowConsole] = useState(false);
  const consoleBottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (consoleBottomRef.current) {
      consoleBottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [consoleLogs]);

  const availableModels = [
    { id: "gemini-3.6-flash", name: "Gemini 3.6 Flash (Fastest & Stable)" },
    { id: "gemini-3.7-flash", name: "Gemini 3.7 Flash (High Demand)" },
    { id: "gemini-1.5-pro", name: "Gemini 1.5 Pro (Deep Context)" },
    { id: "gemini-1.5-flash", name: "Gemini 1.5 Flash (Lightweight)" },
    { id: "custom", name: "Custom Model..." },
  ];

  const handleSaveApiKey = () => {
    setGeminiApiKey(apiKeyInput.trim());
    setApiKeySaved(true);
    setTimeout(() => setApiKeySaved(false), 2000);
  };

  const addLog = (msg: string) => {
    const time = new Date().toLocaleTimeString("en-US", { hour12: false });
    setConsoleLogs((prev) => [...prev, `[${time}] ${msg}`]);
  };

  const handleTailor = async () => {
    if (!jd.trim()) {
      setErrorMsg("Please paste a Job Description first.");
      return;
    }

    setTargetInfo(role, company, jd);
    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    setShowConsole(true);
    setConsoleLogs([]);

    const activeModel = modelInput === "custom" && customModel.trim() ? customModel.trim() : modelInput;

    addLog(`🚀 Starting AI Tailoring Engine for ${company || "Target Company"}...`);
    addLog(`⚡ Initializing model: ${activeModel}`);
    addLog(`📄 Parsing Job Description (${jd.length} chars) & Master Career Knowledge Base...`);

    try {
      const logTimer1 = setTimeout(() => {
        addLog(`🎯 Matching HashMove Experience Preset against role requirements...`);
      }, 600);

      const logTimer2 = setTimeout(() => {
        addLog(`📊 Scoring and ranking Top ${resume.settings.aiProjectCount || 5} projects from master pool...`);
      }, 1200);

      const logTimer3 = setTimeout(() => {
        addLog(`✍️ Synthesizing tailored 3-4 line bio & closing sentence...`);
        addLog(`💌 Generating German/English structured cover letter...`);
      }, 1800);

      const res = await fetch("/api/tailor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobDescription: jd,
          targetCompany: company,
          targetRole: role,
          apiKey: apiKeyInput.trim(),
          modelName: activeModel,
          masterResumeData: resume,
          masterContext,
          topN: resume.settings.aiProjectCount || 5,
        }),
      });

      clearTimeout(logTimer1);
      clearTimeout(logTimer2);
      clearTimeout(logTimer3);

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to tailor resume with AI.");
      }

      const resJson = await res.json();
      const tailoredData = resJson.data || resJson;

      addLog(`✨ Applying tailored selections to resume canvas...`);
      if (tailoredData.selectedPresetKey) {
        addLog(`   • Active Preset: ${tailoredData.selectedPresetKey}`);
      }
      if (tailoredData.selectedProjectIds) {
        addLog(`   • Selected Projects: ${tailoredData.selectedProjectIds.length} projects`);
      }

      applyAiTailoringResult({
        selectedPresetKey: tailoredData.selectedPresetKey || tailoredData.classification?.experience_preset,
        selectedSkillKey: tailoredData.selectedSkillKey || tailoredData.classification?.variable_skill,
        selectedProjectIds: tailoredData.selectedProjectIds || tailoredData.project_ranking?.slice(0, resume.settings.aiProjectCount || 5),
        tailoredSummary: tailoredData.tailoredSummary || tailoredData.tailored_summary,
        closingLine: tailoredData.closingLine || tailoredData.closing_line,
        coverLetter: tailoredData.coverLetter || tailoredData.cover_letter,
      });

      addLog(`✅ Complete! Live Resume Canvas and Cover Letter updated successfully.`);
      setSuccessMsg(`Resume successfully tailored for ${company || "Target Role"}!`);
    } catch (err: any) {
      console.error(err);
      addLog(`❌ Error: ${err.message || "Failed to run AI tailoring"}`);
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
            className="text-[11px] text-slate-600 hover:text-indigo-600 font-medium flex items-center gap-1 bg-white px-2 py-0.5 rounded-lg border border-slate-200 shadow-xs"
          >
            <KeyRound className="w-3 h-3 text-indigo-500" />
            <span>{geminiApiKey ? "API Key & Model" : "Configure AI"}</span>
          </button>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed">
          Paste the job description. Gemini AI analyzes the role, selects your optimal HashMove experience preset, ranks and picks the top projects, tailor-writes the profile summary & closing sentence, and drafts a custom cover letter.
        </p>
      </div>

      {/* Model & API Key Configuration Drawer */}
      {showApiKeyInput && (
        <div className="p-4 bg-white border border-indigo-200 rounded-xl space-y-3 text-xs shadow-sm animate-in fade-in">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <span className="font-bold text-slate-800 flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-indigo-600" />
              Gemini Model & API Key Configuration
            </span>
          </div>

          {/* Model Selector Dropdown */}
          <div className="space-y-1">
            <label className="font-semibold text-slate-700 block">Select AI Model</label>
            <select
              value={modelInput}
              onChange={(e) => {
                setModelInput(e.target.value);
                setSelectedAiModel(e.target.value);
              }}
              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium focus:outline-none focus:border-indigo-500"
            >
              {availableModels.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>

            {modelInput === "custom" && (
              <input
                type="text"
                value={customModel}
                onChange={(e) => setCustomModel(e.target.value)}
                placeholder="Enter model string, e.g. gemini-3.7-flash"
                className="w-full mt-1.5 px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-mono text-xs focus:outline-none focus:border-indigo-500"
              />
            )}
          </div>

          {/* API Key Input & Persistent Save */}
          <div className="space-y-1 pt-1">
            <label className="font-semibold text-slate-700 block">Gemini API Key</label>
            <div className="flex gap-2">
              <input
                type="password"
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                placeholder="AQ.Ab8RN6K..."
                className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-indigo-500 font-mono text-xs"
              />
              <button
                type="button"
                onClick={handleSaveApiKey}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 shadow-xs transition-colors shrink-0"
              >
                {apiKeySaved ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-white" />
                    <span>Saved</span>
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Key</span>
                  </>
                )}
              </button>
            </div>
            <p className="text-[10px] text-slate-500 pt-0.5">
              Key is securely saved to your browser local storage.
            </p>
          </div>
        </div>
      )}

      {/* Target Company & Role Inputs */}
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

      {/* Job Description Textarea */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2 shadow-xs">
        <label className="text-xs text-slate-700 font-semibold block">
          Paste Target Job Description (JD)
        </label>
        <textarea
          value={jd}
          onChange={(e) => setJd(e.target.value)}
          rows={8}
          placeholder="Paste the full job posting requirements, responsibilities, and about company here..."
          className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-indigo-500 leading-relaxed font-sans"
        />
      </div>

      {/* Tailor Resume Action Button */}
      <button
        onClick={handleTailor}
        disabled={isLoading}
        className="w-full py-3 bg-gradient-to-r from-indigo-600 via-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-indigo-500/20 transition-all disabled:opacity-60"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Tailoring Resume & Cover Letter ({modelInput})...</span>
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4" />
            <span>Run AI Tailoring (Resume + Cover Letter)</span>
          </>
        )}
      </button>

      {/* Live AI Execution Console */}
      {showConsole && (
        <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-lg animate-in fade-in">
          <div className="bg-slate-900/90 px-3.5 py-2 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-mono font-semibold text-slate-300">
              <Terminal className="w-3.5 h-3.5 text-emerald-400" />
              <span>Live AI Execution Console</span>
              {isLoading && (
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              )}
            </div>
            <button
              onClick={() => setShowConsole(!showConsole)}
              className="text-slate-400 hover:text-slate-200"
            >
              <ChevronUp className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="p-3.5 font-mono text-[11px] text-emerald-400/90 max-h-48 overflow-y-auto space-y-1.5 leading-relaxed">
            {consoleLogs.map((log, index) => (
              <div key={index} className="flex items-start gap-1.5">
                <span>{log}</span>
              </div>
            ))}
            {isLoading && (
              <div className="flex items-center gap-1 text-slate-400 animate-pulse">
                <span>[Processing step...]</span>
                <span className="inline-block w-1.5 h-3 bg-emerald-400 ml-1" />
              </div>
            )}
            <div ref={consoleBottomRef} />
          </div>
        </div>
      )}

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
    </div>
  );
};
