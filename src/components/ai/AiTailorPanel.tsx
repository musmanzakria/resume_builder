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
  Copy,
  CheckCheck,
  FileQuestion,
  Square,
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
    screeningQuestions,
    setScreeningQuestions,
    screeningAnswers,
    setScreeningAnswers,
    saveCurrentApplication,
  } = useResumeStore();

  const [jd, setJd] = useState(targetJobDescription || "");
  const [company, setCompany] = useState(targetCompany || "");
  const [role, setRole] = useState(targetRole || "");
  const [additionalContext, setAdditionalContext] = useState("");
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedQuestionIndex, setCopiedQuestionIndex] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState(geminiApiKey || "");
  const [modelInput, setModelInput] = useState(selectedAiModel || "gemini-3.8-flash");
  const [customModel, setCustomModel] = useState("");
  const [apiKeySaved, setApiKeySaved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMode, setLoadingMode] = useState<"all" | "resume_only">("all");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [lastModelMeta, setLastModelMeta] = useState<{
    modelRequested: string;
    modelUsed: string;
    isRealAi: boolean;
    fallbackNotice?: string | null;
    durationMs?: number;
  } | null>(null);

  // Live Console State
  const [consoleLogs, setConsoleLogs] = useState<string[]>([]);
  const [showConsole, setShowConsole] = useState(false);
  const consoleContainerRef = useRef<HTMLDivElement | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (consoleContainerRef.current) {
      consoleContainerRef.current.scrollTop = consoleContainerRef.current.scrollHeight;
    }
  }, [consoleLogs]);

  const availableModels = [
    { id: "gemini-3.8-flash", name: "Gemini 3.8 Flash (Latest Workhorse)" },
    { id: "gemini-3.7-flash", name: "Gemini 3.7 Flash (Hybrid Reasoning)" },
    { id: "gemini-3.6-flash", name: "Gemini 3.6 Flash (Fast & Stable)" },
    { id: "gemini-3.5-flash", name: "Gemini 3.5 Flash" },
    { id: "gemini-2.5-pro", name: "Gemini 2.5 Pro (Deep Reasoning)" },
    { id: "gemini-2.5-flash", name: "Gemini 2.5 Flash" },
    { id: "gemini-1.5-pro", name: "Gemini 1.5 Pro" },
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

  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsLoading(false);
    addLog("🛑 Generation cancelled by user.");
  };

  const handleTailor = async (mode: "all" | "resume_only" = "all") => {
    if (!jd.trim()) {
      setErrorMsg("Please paste a Job Description first.");
      return;
    }

    setTargetInfo(role, company, jd);
    setIsLoading(true);
    setLoadingMode(mode);
    setErrorMsg(null);
    setSuccessMsg(null);
    setShowConsole(true);
    setConsoleLogs([]);

    const activeModel = modelInput === "custom" && customModel.trim() ? customModel.trim() : modelInput;

    addLog(`🚀 Starting AI Tailoring Engine for ${company || "Target Company"} [Mode: ${mode === "resume_only" ? "Resume Only" : "Resume + Cover Letter"}]...`);
    addLog(`⚡ Selected model: ${activeModel}`);
    addLog(`📄 Parsing Job Description (${jd.length} chars) & Master Career Knowledge Base...`);
    if (additionalContext.trim()) {
      addLog(`📝 Incorporating custom additional context (${additionalContext.trim().length} chars)...`);
    }

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    try {
      const res = await fetch("/api/tailor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: abortController.signal,
        body: JSON.stringify({
          jobDescription: jd,
          targetCompany: company,
          targetRole: role,
          additionalContext: additionalContext.trim(),
          screeningQuestions: screeningQuestions.trim(),
          apiKey: apiKeyInput.trim(),
          modelName: activeModel,
          masterResumeData: resume,
          masterContext,
          topN: resume.settings.aiProjectCount || 5,
          mode,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Request failed with status ${res.status}`);
      }

      let resJson: any = null;

      if (res.body) {
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";
          for (const line of lines) {
            if (!line.trim()) continue;
            try {
              const item = JSON.parse(line);
              if (item.type === "status") {
                addLog(item.message);
              } else if (item.type === "result") {
                resJson = item;
              } else if (item.type === "error") {
                throw new Error(item.error || "Failed to tailor resume with AI.");
              }
            } catch (pErr: any) {
              if (pErr.message && !pErr.message.includes("JSON")) {
                throw pErr;
              }
            }
          }
        }
      } else {
        resJson = await res.json();
      }

      if (!resJson) {
        throw new Error("No response received from AI tailoring engine.");
      }

      const tailoredData = resJson.data || resJson;
      const isRealAi = resJson.isRealAi !== false && resJson.modelUsed !== "rulebook-heuristic";
      const actualModel = resJson.modelUsed || activeModel;

      setLastModelMeta({
        modelRequested: resJson.modelRequested || activeModel,
        modelUsed: actualModel,
        isRealAi,
        fallbackNotice: resJson.fallbackNotice,
        durationMs: resJson.durationMs,
      });

      addLog(`✨ Applying tailored selections to resume canvas...`);
      if (tailoredData.selectedPresetKey) {
        addLog(`   • Active Preset: ${tailoredData.selectedPresetKey}`);
      }
      if (tailoredData.selectedProjectIds) {
        addLog(`   • Selected Projects: ${tailoredData.selectedProjectIds.length} projects`);
      }

      if (tailoredData.screeningAnswers && Array.isArray(tailoredData.screeningAnswers)) {
        setScreeningAnswers(tailoredData.screeningAnswers);
        addLog(`📝 Synthesized answers for ${tailoredData.screeningAnswers.length} application screening questions`);
      }

      applyAiTailoringResult({
        selectedPresetKey: tailoredData.selectedPresetKey || tailoredData.classification?.experience_preset,
        selectedSkillKey: tailoredData.selectedSkillKey || tailoredData.classification?.variable_skill,
        selectedProjectIds: tailoredData.selectedProjectIds || tailoredData.project_ranking?.slice(0, resume.settings.aiProjectCount || 5),
        tailoredSummary: tailoredData.tailoredSummary || tailoredData.tailored_summary,
        closingLine: tailoredData.closingLine || tailoredData.closing_line,
        coverLetter: mode === "resume_only" ? undefined : (tailoredData.coverLetter || tailoredData.cover_letter),
        structuredCoverLetter: mode === "resume_only" ? undefined : tailoredData.structuredCoverLetter,
        company: company || tailoredData.company,
      });

      // Automatically take a snapshot after AI generation succeeds
      try {
        saveCurrentApplication();
        addLog(`💾 Automatically saved snapshot to Application History.`);
      } catch (saveErr) {
        console.warn("Auto-save failed:", saveErr);
      }

      addLog(`✅ Complete! ${mode === "resume_only" ? "Resume canvas tailored" : "Live Resume Canvas and Cover Letter updated"} successfully.`);
      if (isRealAi) {
        addLog(`🤖 Confirmed Model: ${actualModel} (Live Google Gemini API)`);
        if (resJson.fallbackNotice) {
          addLog(`ℹ️ ${resJson.fallbackNotice}`);
        }
      } else {
        addLog(`⚠️ Notice: Google API high demand (503). Gold-standard rulebook heuristics applied.`);
      }
      setSuccessMsg(
        mode === "resume_only"
          ? `Resume tailored successfully for ${company || "Target Role"}! (Snapshot auto-saved)`
          : `Resume & Cover Letter tailored successfully for ${company || "Target Role"}! (Snapshot auto-saved)`
      );
    } catch (err: any) {
      if (err.name === "AbortError") {
        addLog(`🛑 Generation cancelled by user.`);
        return;
      }
      console.error(err);
      addLog(`❌ Error: ${err.message || "Failed to run AI tailoring"}`);
      setErrorMsg(err.message || "An unexpected error occurred during AI tailoring.");
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const stripMarkdown = (str: string) => str.replace(/\*\*(.*?)\*\*/g, "$1");

  const handleCopyAnswer = (text: string, index: number, clean: boolean = true) => {
    const toCopy = clean ? stripMarkdown(text) : text;
    navigator.clipboard.writeText(toCopy);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleCopyQuestion = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedQuestionIndex(index);
    setTimeout(() => setCopiedQuestionIndex(null), 2000);
  };

  const handleCopyAllAnswers = (cleanOrEvent?: boolean | React.MouseEvent) => {
    const clean = typeof cleanOrEvent === "boolean" ? cleanOrEvent : true;
    const formatted = screeningAnswers
      .map((item, idx) => `Question ${idx + 1}: ${item.question}\n\nAnswer:\n${clean ? stripMarkdown(item.answer) : item.answer}`)
      .join("\n\n" + "═".repeat(40) + "\n\n");
    navigator.clipboard.writeText(formatted);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
      {/* Header Banner (Light Mode) */}
      <div className="bg-gradient-to-br from-indigo-50 via-white to-purple-50 border border-indigo-100 rounded-xl p-4 space-y-2 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-indigo-700 font-bold text-sm">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span>AI Tailoring</span>
          </div>
          <button
            onClick={() => setShowApiKeyInput(!showApiKeyInput)}
            className="text-[11px] text-slate-600 hover:text-indigo-600 font-medium flex items-center gap-1 bg-white px-2 py-0.5 rounded-lg border border-slate-200 shadow-xs"
          >
            <KeyRound className="w-3 h-3 text-indigo-500" />
            <span>{geminiApiKey ? "API Key & Model" : "Configure AI"}</span>
          </button>
        </div>
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
            <div className="flex items-center justify-between">
              <label className="font-semibold text-slate-700 block">Gemini API Key(s)</label>
              {(() => {
                const detectedCount = apiKeyInput
                  .split(/[\n,;\s]+/)
                  .map((k) => k.trim())
                  .filter((k) => k.length > 5).length;
                return detectedCount > 0 ? (
                  <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                    {detectedCount} {detectedCount === 1 ? "Key Configured" : "Keys in Failover Pool"}
                  </span>
                ) : null;
              })()}
            </div>
            <div className="space-y-2">
              <textarea
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                rows={2}
                placeholder="Paste 1 or more Gemini API keys (separated by newline or comma) to automatically cycle if rate-limited..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-indigo-500 font-mono text-xs leading-relaxed"
              />
              <div className="flex items-center justify-between gap-2">
                <p className="text-[10px] text-slate-500">
                  Multiple keys will automatically failover if one hits quota/rate limits (429/503).
                </p>
                <button
                  type="button"
                  onClick={handleSaveApiKey}
                  className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 shadow-xs transition-colors shrink-0"
                >
                  {apiKeySaved ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-white" />
                      <span>Saved</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" />
                      <span>Save Key Pool</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TOP ACTION BUTTONS: Resume Only & Resume + Cover Letter + Stop Abort Button */}
      <div className="flex items-center gap-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 flex-1">
          <button
            onClick={() => handleTailor("resume_only")}
            disabled={isLoading}
            className="py-3 px-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-blue-500/20 transition-all active:scale-[0.99] disabled:opacity-60"
            title="Fast tailoring for Resume only (skips cover letter generation)"
          >
            {isLoading && loadingMode === "resume_only" ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Tailoring Resume...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-blue-200" />
                <span>Tailor Resume Only</span>
              </>
            )}
          </button>

          <button
            onClick={() => handleTailor("all")}
            disabled={isLoading}
            className="py-3 px-3 bg-gradient-to-r from-indigo-600 via-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-indigo-500/25 transition-all active:scale-[0.99] disabled:opacity-60"
            title="Tailors both Resume and German/English Cover Letter"
          >
            {isLoading && loadingMode === "all" ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Tailoring Everything...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Resume + Cover Letter</span>
              </>
            )}
          </button>
        </div>

        {isLoading && (
          <button
            type="button"
            onClick={handleStop}
            className="py-3 px-3.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-all animate-in fade-in shrink-0"
            title="Stop / Abort in-flight AI generation"
          >
            <Square className="w-3.5 h-3.5 fill-current" />
            <span>Stop</span>
          </button>
        )}
      </div>

      {/* Error & Success Alerts */}
      {errorMsg && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2 text-xs text-red-700">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-500 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Model Confirmation Badge */}
      {lastModelMeta && (
        <div
          className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 shadow-xs transition-all ${
            lastModelMeta.isRealAi
              ? "bg-emerald-50/90 border-emerald-200 text-emerald-900"
              : "bg-amber-50/90 border-amber-200 text-amber-900"
          }`}
        >
          {lastModelMeta.isRealAi ? (
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-1">
              <span className="font-bold">
                {lastModelMeta.isRealAi
                  ? `Live AI Confirmed: ${lastModelMeta.modelUsed}`
                  : "Rulebook Heuristics Applied"}
              </span>
              {lastModelMeta.durationMs && (
                <span className="text-[10px] font-mono text-emerald-700 bg-emerald-100/70 px-1.5 py-0.5 rounded">
                  {(lastModelMeta.durationMs / 1000).toFixed(1)}s
                </span>
              )}
            </div>
            <p className="text-[11px] mt-1 opacity-90 leading-relaxed">
              {lastModelMeta.fallbackNotice ||
                (lastModelMeta.isRealAi
                  ? `Live tailored by Google Gemini (${lastModelMeta.modelUsed}) with comprehensive 1-2 blow paragraphs and full KPI phrase bolding.`
                  : "Google Gemini API was experiencing temporary 503 high demand; gold-standard rulebook heuristics were applied.")}
            </p>
          </div>
        </div>
      )}

      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-2 text-xs text-emerald-800">
          <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
          <span>{successMsg}</span>
        </div>
      )}

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

          <div
            ref={consoleContainerRef}
            className="p-3.5 font-mono text-[11px] text-emerald-400/90 max-h-48 overflow-y-auto space-y-1.5 leading-relaxed"
          >
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
              placeholder="e.g. Trench Group, Siemens, Zalando"
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
              placeholder="e.g. Corporate Communications Working Student"
              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* AI Top Projects Setting */}
        <div className="pt-2 border-t border-slate-100">
          <NumberStepper
            label="How Many Top Projects Should AI Select for Resume?"
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
          rows={7}
          placeholder="Paste the full job posting requirements, responsibilities, and about company here..."
          className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-indigo-500 leading-relaxed font-sans"
        />
      </div>

      {/* Application Screening Questions (Optional) */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3 shadow-xs">
        <div className="flex items-center justify-between">
          <label className="text-xs text-slate-700 font-semibold flex items-center gap-1.5">
            <FileQuestion className="w-3.5 h-3.5 text-indigo-600" />
            Application Screening Questions <span className="text-[11px] font-normal text-slate-400">(Optional)</span>
          </label>
          {screeningAnswers.length > 0 && (
            <button
              onClick={handleCopyAllAnswers}
              className="text-[11px] text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1 bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-200 transition-colors"
            >
              {copiedAll ? (
                <>
                  <CheckCheck className="w-3 h-3 text-emerald-600" />
                  <span className="text-emerald-700 font-bold">Copied All!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>Copy All Answers</span>
                </>
              )}
            </button>
          )}
        </div>
        <p className="text-[11px] text-slate-500 leading-relaxed">
          Some applications do not ask for a cover letter, but instead require explicit screening questions in text fields. Paste them below (e.g. <em>"Why do you want to work here?"</em> or <em>"Describe a project where you used data automation"</em>).
        </p>
        <textarea
          value={screeningQuestions}
          onChange={(e) => setScreeningQuestions(e.target.value)}
          rows={4}
          placeholder="Paste portal questions here (one per line or numbered)..."
          className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-indigo-500 leading-relaxed font-sans"
        />

        {/* Display Answered Screening Questions with 1-Click Copy */}
        {screeningAnswers.length > 0 && (
          <div className="mt-3 space-y-3 pt-3 border-t border-slate-200">
            <div className="text-xs font-bold text-slate-800 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <FileQuestion className="w-3.5 h-3.5 text-indigo-600" />
                Tailored Application Answers ({screeningAnswers.length})
              </span>
              <button
                onClick={handleCopyAllAnswers}
                className="text-[11px] text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1 bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-200 transition-colors"
              >
                {copiedAll ? (
                  <>
                    <CheckCheck className="w-3 h-3 text-emerald-600" />
                    <span className="text-emerald-700 font-bold">Copied All!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy All (Q&A)</span>
                  </>
                )}
              </button>
            </div>
            {screeningAnswers.map((item, idx) => (
              <div
                key={idx}
                className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2.5 text-xs shadow-xs"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <span className="inline-block px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-indigo-100 text-indigo-800 rounded mr-2">
                      Q{idx + 1}
                    </span>
                    <span className="font-semibold text-slate-900 leading-snug">
                      {item.question}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => handleCopyQuestion(item.question, idx)}
                      className="text-[10px] font-medium text-slate-600 hover:text-indigo-600 flex items-center gap-1 bg-white px-2 py-1 rounded-md border border-slate-200 shadow-xs transition-colors"
                      title="Copy Question Text"
                    >
                      {copiedQuestionIndex === idx ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span className="text-emerald-700 font-bold">Copied Q!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3 text-slate-400" />
                          <span>Copy Q</span>
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleCopyAnswer(item.answer, idx)}
                      className="text-[11px] font-bold text-white bg-indigo-600 hover:bg-indigo-700 flex items-center gap-1 px-2.5 py-1 rounded-md shadow-xs transition-colors"
                      title="Copy Tailored Answer for pasting into portal"
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
                <div className="text-slate-800 leading-relaxed whitespace-pre-wrap bg-white p-3 rounded-lg border border-slate-200 font-sans text-xs">
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
        )}
      </div>

      {/* Optional Additional Context / Special Instructions */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2 shadow-xs">
        <label className="text-xs text-slate-700 font-semibold block">
          Additional Context or Custom Instructions <span className="text-[11px] font-normal text-slate-400">(Optional)</span>
        </label>
        <textarea
          value={additionalContext}
          onChange={(e) => setAdditionalContext(e.target.value)}
          rows={3}
          placeholder="e.g. Focus heavily on my SEO and Python analytics experience, or mention that I spoke with the hiring manager on LinkedIn..."
          className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-indigo-500 leading-relaxed font-sans"
        />
      </div>
    </div>
  );
};
