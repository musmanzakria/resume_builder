"use client";

import React, { useState } from "react";
import { useResumeStore } from "@/lib/store";
import { 
  Database, 
  Plus, 
  Trash2, 
  FolderGit2, 
  Sparkles, 
  Check, 
  BookOpen, 
  Save, 
  Code2, 
  KeyRound, 
  BookmarkCheck,
  Building2,
  Wand2,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Edit3,
  Sliders,
  Flame
} from "lucide-react";
import { TipTapInput } from "@/components/common/TipTapInput";

export const MasterSettingsView: React.FC = () => {
  const { 
    resume, 
    masterContext, 
    updateMasterContext, 
    geminiApiKey, 
    setGeminiApiKey, 
    selectedAiModel, 
    setSelectedAiModel, 
    addProject, 
    deleteProject, 
    updateProject, 
    updateSettings, 
    setActiveTab 
  } = useResumeStore();

  const [activeSubTab, setActiveSubTab] = useState<"rulebook" | "projects" | "context" | "ai">("rulebook");

  // Project Form States
  const [newTitle, setNewTitle] = useState("");
  const [newUrl, setNewUrl] = useState("https://usmanzakria.com");
  const [newDesc, setNewDesc] = useState("");
  const [newTags, setNewTags] = useState("");
  const [newShowIcon, setNewShowIcon] = useState(true);

  // Master Context State
  const [contextJsonStr, setContextJsonStr] = useState(
    JSON.stringify(masterContext, null, 2)
  );
  const [contextSaved, setContextSaved] = useState(false);
  const [jsonError, setJsonError] = useState<string | null>(null);

  // Rulebook Editable States
  const initialRulebook = masterContext?.professional_bio?.profile_summary_rulebook || {};
  const [rulebookObjective, setRulebookObjective] = useState<string>(
    initialRulebook.objective ||
      "Generate high-converting, authentic, ATS-optimized 3-4 sentence professional summaries that seamlessly fuse Usman's authentic track record with the target Job Description (JD), balancing disciplined structure with creative leeway and out-of-the-box contextual thinking."
  );
  const [goldStandardClause, setGoldStandardClause] = useState<string>(
    initialRulebook.gold_standard_clause ||
      "The benchmark samples represent Usman's authentic gold standard—the exact cadence, keyword density, confidence, and visual bolding aesthetics desired. Use the 4-stage framework as an architectural guide, but look to the active samples as the benchmark of excellence. Do not rigidly restrict yourself only to the words in the samples; think out of the box and pull dynamically from Usman's entire background to tailor to novel roles."
  );

  // Stage 1
  const [stage1Title, setStage1Title] = useState<string>(
    initialRulebook.architectural_framework?.stage_1_persona_hook?.title || "Stage 1: The Contextual Persona Hook"
  );
  const [stage1Desc, setStage1Desc] = useState<string>(
    initialRulebook.architectural_framework?.stage_1_persona_hook?.description ||
      "Synthesize a tailored professional identity matching the employer's core industry and team charter (e.g., SaaS, eCommerce, AI/Workflow Automation, Logistics ERP, Startup Strategy, BioTech/MedTech)."
  );

  // Stage 2
  const [stage2Title, setStage2Title] = useState<string>(
    initialRulebook.architectural_framework?.stage_2_skill_synthesis?.title || "Stage 2: Generalized Skill & Competency Bridge"
  );
  const [stage2Desc, setStage2Desc] = useState<string>(
    initialRulebook.architectural_framework?.stage_2_skill_synthesis?.description ||
      "Dynamically bridge hard tools, domain methodologies, and interpersonal fluency to the JD without artificial restrictions."
  );
  const [stage2Guideline, setStage2Guideline] = useState<string>(
    initialRulebook.architectural_framework?.stage_2_skill_synthesis?.guideline ||
      "Draw freely across Usman's full spectrum: software tools (Excel/Sheets, SQL, Python, n8n, Figma, Tableau, CRM), domain methodologies (SEO/AEO/GEO, CRO, GTM, Agile/Scrum, Process Mapping), and interpersonal strengths (8.5 IELTS / C2 English, German A2, cross-functional bridge between Engineering and GTM, teaching 250+ students)."
  );

  // Stage 3
  const [stage3Title, setStage3Title] = useState<string>(
    initialRulebook.architectural_framework?.stage_3_execution_value?.title || "Stage 3: Commercial Impact & Execution Value"
  );
  const [stage3Desc, setStage3Desc] = useState<string>(
    initialRulebook.architectural_framework?.stage_3_execution_value?.description ||
      "Articulate cross-functional execution and concrete business impact tailored to the hiring team's pain points."
  );

  // Stage 4
  const [stage4Formula, setStage4Formula] = useState<string>(
    initialRulebook.architectural_framework?.stage_4_closing_commitment?.formula ||
      "I am eager to be an integral part of [Company]'s [Team] team, [Value 1], [Value 2], and help [Company Impact] as a **[Cleaned Target Role] in [City/Berlin]**."
  );

  // Style & ATS Constraints List
  const [styleConstraints, setStyleConstraints] = useState<string[]>(
    initialRulebook.style_and_ats_constraints || [
      "CREATIVE AUTONOMY: Adapt vocabulary, sentence cadence, and emphasis to match the employer's industry culture while preserving factual ground truth.",
      "STRICT ZERO EM-DASHES: Never use em-dashes (—) or en-dashes (–) within narrative sentences. Use natural commas, parentheses, or smooth connective syntax.",
      "STRATEGIC MARKDOWN BOLDING: Boldly highlight 3–5 high-impact keywords, core tools, and metrics using double asterisks (e.g., **SEO, Social Media, and Content**, **8.5 IELTS / C2**, **Excel and SQL**, **n8n workflow automation**).",
      "CLEAN ROLE STANDARDIZATION: Strip administrative noise like (m/f/d), (m/w/d), m/w/x, or dangling hyphens from the target role.",
      "HUMAN & AUTHENTIC VOICE: Maintain a confident, articulate, and proactive first-person narrative—never robotic, clichéd, or generic."
    ]
  );

  // Benchmark Samples State
  const [benchmarkSamples, setBenchmarkSamples] = useState<any[]>(
    initialRulebook.few_shot_benchmark_samples || []
  );
  const [rulebookSaved, setRulebookSaved] = useState(false);

  // API Key State
  const [apiKeyVal, setApiKeyVal] = useState(geminiApiKey || "");
  const [apiKeySaved, setApiKeySaved] = useState(false);

  const activeSamplesCount = benchmarkSamples.filter((s) => s.enabled !== false).length;

  const handleToggleSample = (index: number) => {
    const updated = [...benchmarkSamples];
    updated[index] = {
      ...updated[index],
      enabled: updated[index].enabled === false ? true : false,
    };
    setBenchmarkSamples(updated);
  };

  const handleToggleAllSamples = (enable: boolean) => {
    const updated = benchmarkSamples.map((s) => ({
      ...s,
      enabled: enable,
    }));
    setBenchmarkSamples(updated);
  };

  const handleSaveFullRulebook = () => {
    const updatedRulebook = {
      objective: rulebookObjective,
      gold_standard_clause: goldStandardClause,
      architectural_framework: {
        stage_1_persona_hook: {
          title: stage1Title,
          description: stage1Desc,
          archetypes: initialRulebook.architectural_framework?.stage_1_persona_hook?.archetypes || []
        },
        stage_2_skill_synthesis: {
          title: stage2Title,
          description: stage2Desc,
          guideline: stage2Guideline,
          competency_domains: initialRulebook.architectural_framework?.stage_2_skill_synthesis?.competency_domains || []
        },
        stage_3_execution_value: {
          title: stage3Title,
          description: stage3Desc,
          themes: initialRulebook.architectural_framework?.stage_3_execution_value?.themes || []
        },
        stage_4_closing_commitment: {
          title: "Stage 4: Closing Commitment Anchor",
          formula: stage4Formula,
          description: "Dedicated forward-looking commitment customized to the team's mission with cleaned role & location."
        }
      },
      style_and_ats_constraints: styleConstraints,
      few_shot_benchmark_samples: benchmarkSamples
    };

    const updatedContext = {
      ...masterContext,
      professional_bio: {
        ...(masterContext.professional_bio || {}),
        profile_summary_rulebook: updatedRulebook
      }
    };

    updateMasterContext(updatedContext);
    setContextJsonStr(JSON.stringify(updatedContext, null, 2));
    setRulebookSaved(true);
    setTimeout(() => setRulebookSaved(false), 2500);
  };

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const id = "proj-" + Date.now();
    const tagsArray = newTags
      ? newTags.split(",").map((t) => t.trim()).filter(Boolean)
      : ["Portfolio"];

    addProject({
      id,
      title: newTitle.trim(),
      description: newDesc.trim() || "Project overview details...",
      url: newUrl.trim() || "https://usmanzakria.com",
      showIcon: newShowIcon,
      visible: true,
      defaultOrder: resume.projects.length + 1,
      tags: tagsArray,
    });

    setNewTitle("");
    setNewDesc("");
    setNewTags("");
  };

  const handleSaveContext = () => {
    try {
      const parsed = JSON.parse(contextJsonStr);
      updateMasterContext(parsed);
      setJsonError(null);
      setContextSaved(true);
      setTimeout(() => setContextSaved(false), 2000);
    } catch (err: any) {
      setJsonError("Invalid JSON syntax: " + err.message);
    }
  };

  const handleSaveApiKey = () => {
    setGeminiApiKey(apiKeyVal.trim());
    setApiKeySaved(true);
    setTimeout(() => setApiKeySaved(false), 2000);
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 md:p-10 max-w-5xl mx-auto w-full space-y-6 bg-slate-100">
      {/* Header Banner (Light Mode) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 text-indigo-700 font-bold text-lg">
            <Database className="w-5 h-5" />
            <span>Master Career Assets & AI Knowledge Base</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Configure your Profile Summary Rulebook, customize the 4 architectural stages, manage few-shot samples, and projects.
          </p>
        </div>

        <button
          onClick={() => setActiveTab("editor")}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold self-start md:self-auto shadow-xs transition-colors"
        >
          Return to Resume Editor
        </button>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3 overflow-x-auto">
        <button
          onClick={() => setActiveSubTab("rulebook")}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shrink-0 ${
            activeSubTab === "rulebook"
              ? "bg-white text-indigo-700 shadow-xs border border-slate-200"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
          }`}
        >
          <BookmarkCheck className="w-4 h-4 text-indigo-600" />
          <span>Profile Summary Rulebook & Prompt Editor ({activeSamplesCount}/{benchmarkSamples.length} Active)</span>
        </button>

        <button
          onClick={() => setActiveSubTab("projects")}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shrink-0 ${
            activeSubTab === "projects"
              ? "bg-white text-indigo-700 shadow-xs border border-slate-200"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
          }`}
        >
          <FolderGit2 className="w-4 h-4" />
          <span>Projects Pool ({resume.projects.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab("context")}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shrink-0 ${
            activeSubTab === "context"
              ? "bg-white text-indigo-700 shadow-xs border border-slate-200"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Master Context (Career Narrative)</span>
        </button>

        <button
          onClick={() => setActiveSubTab("ai")}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shrink-0 ${
            activeSubTab === "ai"
              ? "bg-white text-indigo-700 shadow-xs border border-slate-200"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
          }`}
        >
          <KeyRound className="w-4 h-4" />
          <span>API Key & Model Settings</span>
        </button>
      </div>

      {/* ── TAB 1: EDITABLE PROFILE SUMMARY RULEBOOK & BENCHMARKS ── */}
      {activeSubTab === "rulebook" && (
        <div className="space-y-6">
          {/* Main Save Bar */}
          <div className="bg-white border border-indigo-200 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3 bg-gradient-to-r from-indigo-50/50 via-white to-purple-50/50">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              <div>
                <span className="font-bold text-xs text-slate-800 block">
                  Interactive Profile Summary Prompt & Rules Configuration
                </span>
                <span className="text-[11px] text-slate-500">
                  Edit prompt instructions, 4 architectural stages, and few-shot samples live.
                </span>
              </div>
            </div>

            <button
              onClick={handleSaveFullRulebook}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-all shrink-0"
            >
              {rulebookSaved ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Rulebook & Prompt Saved!</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save All Rulebook Settings</span>
                </>
              )}
            </button>
          </div>

          {/* 1. Core Objective & Gold Standard Benchmark Clause */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-indigo-700 font-bold text-sm border-b border-slate-100 pb-2">
              <Flame className="w-4 h-4 text-amber-500" />
              <span>Core Objective & Gold-Standard Benchmark Clause</span>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Master Summary Objective & Creative Leeway Directive
                </label>
                <textarea
                  value={rulebookObjective}
                  onChange={(e) => setRulebookObjective(e.target.value)}
                  rows={2}
                  className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-indigo-500 font-sans leading-relaxed"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Gold-Standard Benchmark Principle (Instructions on how AI should treat samples)
                </label>
                <textarea
                  value={goldStandardClause}
                  onChange={(e) => setGoldStandardClause(e.target.value)}
                  rows={3}
                  className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-indigo-500 font-sans leading-relaxed"
                />
              </div>
            </div>
          </div>

          {/* 2. Editable 4-Stage Architecture */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-indigo-700 font-bold text-sm border-b border-slate-100 pb-2">
              <Wand2 className="w-4 h-4 text-indigo-600" />
              <span>Editable 4-Stage Architecture Prompt Guidelines</span>
            </div>

            <div className="space-y-4">
              {/* Stage 1 */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-indigo-200 text-indigo-800 flex items-center justify-center text-[10px]">1</span>
                    Stage 1: Contextual Persona Hook
                  </span>
                </div>
                <textarea
                  value={stage1Desc}
                  onChange={(e) => setStage1Desc(e.target.value)}
                  rows={2}
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Stage 2 */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-indigo-200 text-indigo-800 flex items-center justify-center text-[10px]">2</span>
                    Stage 2: Generalized Skill & Competency Bridge (No rigid lock-in)
                  </span>
                </div>
                <textarea
                  value={stage2Desc}
                  onChange={(e) => setStage2Desc(e.target.value)}
                  rows={2}
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                />
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-0.5">
                    Skill Synthesis Guideline (Hard Tools + Methodologies + Communication & Languages)
                  </label>
                  <textarea
                    value={stage2Guideline}
                    onChange={(e) => setStage2Guideline(e.target.value)}
                    rows={3}
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Stage 3 */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-indigo-200 text-indigo-800 flex items-center justify-center text-[10px]">3</span>
                    Stage 3: Commercial Impact & Execution Value
                  </span>
                </div>
                <textarea
                  value={stage3Desc}
                  onChange={(e) => setStage3Desc(e.target.value)}
                  rows={2}
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Stage 4 */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-indigo-200 text-indigo-800 flex items-center justify-center text-[10px]">4</span>
                    Stage 4: Closing Commitment Anchor Formula
                  </span>
                </div>
                <input
                  type="text"
                  value={stage4Formula}
                  onChange={(e) => setStage4Formula(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 font-mono focus:outline-none focus:border-indigo-500 font-semibold"
                />
              </div>
            </div>
          </div>

          {/* 3. Style & ATS Constraints Editor */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2 text-indigo-700 font-bold text-sm">
                <Sliders className="w-4 h-4" />
                <span>Style & ATS Negative Constraints</span>
              </div>
              <button
                type="button"
                onClick={() => setStyleConstraints([...styleConstraints, "NEW_CONSTRAINT: Enter rule description..."])}
                className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 bg-indigo-50 px-2 py-1 rounded-lg"
              >
                <Plus className="w-3 h-3" />
                Add Rule
              </button>
            </div>

            <div className="space-y-2">
              {styleConstraints.map((rule, rIdx) => (
                <div key={rIdx} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={rule}
                    onChange={(e) => {
                      const updated = [...styleConstraints];
                      updated[rIdx] = e.target.value;
                      setStyleConstraints(updated);
                    }}
                    className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => setStyleConstraints(styleConstraints.filter((_, i) => i !== rIdx))}
                    className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* 4. Benchmark Few-Shot Samples Manager with Toggles */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                  <BookmarkCheck className="w-4 h-4 text-indigo-600" />
                  Benchmark Few-Shot Samples ({benchmarkSamples.length} Total)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Toggle samples ON to include them in the live AI prompt pool. Deactivated samples stay stored safely in your library.
                </p>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                <button
                  type="button"
                  onClick={() => handleToggleAllSamples(true)}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-semibold transition-colors"
                >
                  Enable All
                </button>
                <button
                  type="button"
                  onClick={() => handleToggleAllSamples(false)}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-semibold transition-colors"
                >
                  Disable All
                </button>
              </div>
            </div>

            {/* Active Status Badge */}
            <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs">
              <span className="text-slate-600 font-medium">
                Active Few-Shot Reference Prompts: <strong className="text-indigo-700 font-bold">{activeSamplesCount} of {benchmarkSamples.length} samples</strong>
              </span>
              <span className="text-[11px] font-mono text-slate-500">
                {activeSamplesCount === 0 ? "⚠️ AI using base rules only" : "✅ Dynamic in-context few-shot learning active"}
              </span>
            </div>

            {/* Samples List */}
            <div className="space-y-4">
              {benchmarkSamples.map((sample, idx) => {
                const isEnabled = sample.enabled !== false;

                return (
                  <div
                    key={idx}
                    className={`p-5 rounded-2xl border transition-all space-y-3 ${
                      isEnabled
                        ? "bg-white border-slate-200 shadow-xs hover:border-indigo-300"
                        : "bg-slate-50/70 border-slate-200 opacity-60 hover:opacity-90"
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Building2 className="w-4 h-4 text-indigo-600 shrink-0" />
                        <input
                          type="text"
                          value={sample.company}
                          onChange={(e) => {
                            const updated = [...benchmarkSamples];
                            updated[idx].company = e.target.value;
                            setBenchmarkSamples(updated);
                          }}
                          className="font-bold text-xs text-slate-900 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-500"
                          placeholder="Company"
                        />
                        <span className="text-slate-400">•</span>
                        <input
                          type="text"
                          value={sample.target_role}
                          onChange={(e) => {
                            const updated = [...benchmarkSamples];
                            updated[idx].target_role = e.target.value;
                            setBenchmarkSamples(updated);
                          }}
                          className="font-semibold text-xs text-indigo-700 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-500 min-w-[220px]"
                          placeholder="Target Role"
                        />
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-auto">
                        {/* Sample Active Toggle Switch */}
                        <button
                          type="button"
                          onClick={() => handleToggleSample(idx)}
                          className={`px-3 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 transition-all border ${
                            isEnabled
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200 shadow-xs"
                              : "bg-slate-200/60 text-slate-600 border-slate-300"
                          }`}
                        >
                          {isEnabled ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Active for AI</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3.5 h-3.5 text-slate-400" />
                              <span>Deactivated</span>
                            </>
                          )}
                        </button>

                        <button
                          onClick={() => {
                            const updated = benchmarkSamples.filter((_, i) => i !== idx);
                            setBenchmarkSamples(updated);
                          }}
                          className="p-1 text-slate-400 hover:text-red-600 rounded-lg transition-colors"
                          title="Delete Sample"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <TipTapInput
                      label="Profile Summary Bio (Markdown **bold** rendered visually)"
                      value={sample.summary}
                      onChange={(val) => {
                        const updated = [...benchmarkSamples];
                        updated[idx].summary = val;
                        setBenchmarkSamples(updated);
                      }}
                      rows={3}
                    />

                    <TipTapInput
                      label="Mandatory Closing Statement"
                      value={sample.closing_line}
                      onChange={(val) => {
                        const updated = [...benchmarkSamples];
                        updated[idx].closing_line = val;
                        setBenchmarkSamples(updated);
                      }}
                      rows={2}
                    />
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => {
                setBenchmarkSamples([
                  ...benchmarkSamples,
                  {
                    id: "sample-" + Date.now(),
                    enabled: true,
                    company: "New Company",
                    target_role: "Target Working Student Role",
                    summary: "Product Marketing professional with expertise in **growth, analytics, and content**...",
                    closing_line: "I am eager to be an integral part of the team as a **Working Student in Berlin**.",
                  },
                ]);
              }}
              className="w-full py-3 bg-slate-50 hover:bg-slate-100 text-indigo-700 border border-dashed border-indigo-300 rounded-2xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Benchmark Sample to Library</span>
            </button>
          </div>
        </div>
      )}

      {/* ── TAB 2: PROJECTS POOL ── */}
      {activeSubTab === "projects" && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              AI Matching Configuration
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <label className="text-xs text-slate-700 font-semibold block">
                  Default Projects Count on Resume
                </label>
                <p className="text-[11px] text-slate-500">
                  Dictates how many top-ranked projects the AI selects for each job:
                </p>
                <div className="flex items-center gap-2 pt-1">
                  {[3, 4, 5, 6, 8].map((count) => (
                    <button
                      key={count}
                      onClick={() => updateSettings({ aiProjectCount: count })}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition-all ${
                        (resume.settings?.aiProjectCount || 5) === count
                          ? "bg-indigo-600 text-white shadow-xs"
                          : "bg-white border border-slate-300 text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      Top {count}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <label className="text-xs text-slate-700 font-semibold block">
                  Total Projects in Master Pool
                </label>
                <div className="text-2xl font-bold font-mono text-indigo-700">
                  {resume.projects.length} Available
                </div>
                <p className="text-[11px] text-slate-500">
                  You can add an unlimited number of projects below.
                </p>
              </div>
            </div>
          </div>

          {/* Add New Master Project Form */}
          <form onSubmit={handleCreateProject} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
              <Plus className="w-4 h-4 text-indigo-600" />
              Add New Project to Master Pool
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-700 font-semibold block mb-1">Project Title</label>
                <input
                  type="text"
                  placeholder="e.g. Agentic AI Logistics Architecture"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-indigo-500 font-semibold"
                  required
                />
              </div>

              <div>
                <label className="text-xs text-slate-700 font-semibold block mb-1">Project / Case Study Link</label>
                <input
                  type="text"
                  placeholder="https://usmanzakria.com/..."
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <TipTapInput
              label="Resume Bullet Description (Select text for bolding)"
              placeholder="1-2 line description to appear on resume..."
              rows={2}
              value={newDesc}
              onChange={setNewDesc}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
              <div>
                <label className="text-xs text-slate-700 font-semibold block mb-1">
                  AI Relevance Tags (comma separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Machine Learning, Python, Logistics, SEO"
                  value={newTags}
                  onChange={(e) => setNewTags(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-between pt-5">
                <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newShowIcon}
                    onChange={(e) => setNewShowIcon(e.target.checked)}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-0"
                  />
                  <span>Show external link icon ↗</span>
                </label>

                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  Save to Master Pool
                </button>
              </div>
            </div>
          </form>

          {/* All Master Projects List */}
          <div className="space-y-4">
            <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
              <FolderGit2 className="w-4 h-4 text-indigo-600" />
              All Available Projects ({resume.projects.length})
            </h3>

            <div className="grid grid-cols-1 gap-3">
              {resume.projects.map((proj, idx) => (
                <div
                  key={proj.id}
                  className="p-5 bg-white border border-slate-200 rounded-2xl space-y-3 shadow-xs hover:border-slate-300 transition-all"
                >
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-1 rounded-lg border border-indigo-200 self-start">
                      #{idx + 1}
                    </span>

                    <div className="flex-1">
                      <input
                        type="text"
                        value={proj.title}
                        onChange={(e) => updateProject(proj.id, { title: e.target.value })}
                        className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-indigo-500"
                        placeholder="Project Title"
                      />
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      <span className={`text-[10px] px-2 py-1 rounded-lg font-semibold border ${
                        proj.visible 
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                          : "bg-slate-100 text-slate-500 border-slate-200"
                      }`}>
                        {proj.visible ? "Active on Resume" : "Pool Asset (Inactive)"}
                      </span>

                      <button
                        onClick={() => deleteProject(proj.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                        title="Delete Project"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <TipTapInput
                    value={proj.description}
                    onChange={(val) => updateProject(proj.id, { description: val })}
                    rows={2}
                  />

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={proj.url || ""}
                        onChange={(e) => updateProject(proj.id, { url: e.target.value })}
                        placeholder="URL: https://..."
                        className="px-2.5 py-1 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 text-[11px] w-64"
                      />
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5">
                      {(proj.tags || []).map((tag, tIdx) => (
                        <span
                          key={tIdx}
                          className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200 font-mono"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 3: MASTER CONTEXT KNOWLEDGE BASE ── */}
      {activeSubTab === "context" && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-indigo-600" />
                Master Career Context (Deep Career Narrative)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                This comprehensive career context is passed to the Gemini AI during every tailoring run. You can edit any section below and save changes live.
              </p>
            </div>

            <button
              onClick={handleSaveContext}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
            >
              {contextSaved ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Context Saved!</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Context Changes</span>
                </>
              )}
            </button>
          </div>

          {jsonError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
              {jsonError}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <Code2 className="w-3.5 h-3.5 text-indigo-600" />
              JSON Knowledge Base Editor
            </label>
            <textarea
              value={contextJsonStr}
              onChange={(e) => setContextJsonStr(e.target.value)}
              rows={24}
              className="w-full p-4 bg-slate-950 text-emerald-400 font-mono text-xs rounded-xl border border-slate-800 focus:outline-none focus:border-indigo-500 leading-relaxed shadow-inner"
              spellCheck={false}
            />
          </div>
        </div>
      )}

      {/* ── TAB 4: API KEY & MODEL SETTINGS ── */}
      {activeSubTab === "ai" && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
          <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
            <KeyRound className="w-4 h-4 text-indigo-600" />
            Gemini AI Model & API Key Configuration
          </h3>

          <div className="max-w-xl space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Gemini API Key
              </label>
              <div className="flex gap-2">
                <input
                  type="password"
                  value={apiKeyVal}
                  onChange={(e) => setApiKeyVal(e.target.value)}
                  placeholder="AQ.Ab8RN6K..."
                  className="flex-1 px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-indigo-500 font-mono"
                />
                <button
                  type="button"
                  onClick={handleSaveApiKey}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
                >
                  {apiKeySaved ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Saved!</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" />
                      <span>Save Key</span>
                    </>
                  )}
                </button>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Stored securely in your browser's persistent state.
              </p>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Default AI Model
              </label>
              <select
                value={selectedAiModel}
                onChange={(e) => setSelectedAiModel(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-indigo-500"
              >
                <option value="gemini-3.6-flash">Gemini 3.6 Flash (Fastest & Stable)</option>
                <option value="gemini-3.7-flash">Gemini 3.7 Flash (High Demand)</option>
                <option value="gemini-1.5-pro">Gemini 1.5 Pro (Deep Context)</option>
                <option value="gemini-1.5-flash">Gemini 1.5 Flash (Lightweight)</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
