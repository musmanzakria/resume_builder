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
  ExternalLink,
  Tag,
  BookOpen,
  Save,
  Code2,
  KeyRound,
  FileText
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

  const [activeSubTab, setActiveSubTab] = useState<"projects" | "context" | "ai">("projects");

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

  // API Key State
  const [apiKeyVal, setApiKeyVal] = useState(geminiApiKey || "");
  const [apiKeySaved, setApiKeySaved] = useState(false);

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
            Manage your master pool of projects, candidate career context, and AI settings.
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
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveSubTab("projects")}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
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
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
            activeSubTab === "context"
              ? "bg-white text-indigo-700 shadow-xs border border-slate-200"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Master Context (Career Knowledge Base)</span>
        </button>

        <button
          onClick={() => setActiveSubTab("ai")}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
            activeSubTab === "ai"
              ? "bg-white text-indigo-700 shadow-xs border border-slate-200"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
          }`}
        >
          <KeyRound className="w-4 h-4" />
          <span>API Key & Model Settings</span>
        </button>
      </div>

      {/* ── TAB 1: PROJECTS POOL ── */}
      {activeSubTab === "projects" && (
        <div className="space-y-6">
          {/* Global AI Matching Settings */}
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

      {/* ── TAB 2: MASTER CONTEXT KNOWLEDGE BASE ── */}
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

      {/* ── TAB 3: API KEY & MODEL SETTINGS ── */}
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
                <option value="gemini-2.0-flash">Gemini 2.0 Flash (Fastest / Recommended)</option>
                <option value="gemini-3.7-flash">Gemini 3.7 Flash</option>
                <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
                <option value="gemini-1.5-flash">Gemini 1.5 Flash</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
