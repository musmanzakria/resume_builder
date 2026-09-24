"use client";

import React, { useState } from "react";
import { useResumeStore } from "@/lib/store";
import {
  KeyRound,
  Plus,
  Trash2,
  Check,
  Cpu,
  Layers,
  Clock,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Sparkles,
  ShieldCheck,
  Save,
  HelpCircle,
  ToggleLeft,
  ToggleRight,
  Calculator,
  Zap,
  Info,
  Minus,
  Timer,
  Activity,
} from "lucide-react";
import {
  ApiProfile,
  AvailableModelItem,
  DEFAULT_BACKOFF_CONFIG,
} from "@/types/ai";

// ─────────────────────────────────────────────────────────────────────────────
// TIMELINE CALCULATOR HELPER
// ─────────────────────────────────────────────────────────────────────────────
interface CascadeTimelineMetrics {
  totalCalls: number;
  totalBackoffDelaySeconds: number;
  typicalFastFailoverSeconds: number;
  maxWorstCaseTimeoutSeconds: number;
  modelSteps: {
    modelId: string;
    attempts: number;
    backoffDelaysSeconds: number[];
    stepFastFailoverSec: number;
    stepWorstCaseSec: number;
  }[];
}

const calculateTimelineMetrics = (profile: ApiProfile): CascadeTimelineMetrics => {
  const backoff = profile.backoffConfig || DEFAULT_BACKOFF_CONFIG;
  const timeoutSec = Math.round((backoff.timeoutMs || 65000) / 1000);
  const initialDelaySec = (backoff.initialDelayMs || 1500) / 1000;
  const maxDelaySec = (backoff.maxDelayMs || 8000) / 1000;

  let totalCalls = 0;
  let totalBackoffDelaySeconds = 0;

  const modelSteps = (profile.modelCascade || []).map((mId) => {
    const attempts = Math.max(1, profile.modelAttempts?.[mId] ?? 1);
    totalCalls += attempts;

    const backoffDelaysSeconds: number[] = [];
    let stepBackoffTotal = 0;

    for (let i = 0; i < attempts - 1; i++) {
      const delay = Math.min(maxDelaySec, initialDelaySec * Math.pow(2, i));
      backoffDelaysSeconds.push(delay);
      stepBackoffTotal += delay;
    }
    totalBackoffDelaySeconds += stepBackoffTotal;

    // Typical rejection on 503 from Google is ~1.2s per call
    const stepFastFailoverSec = attempts * 1.2 + stepBackoffTotal;
    // Worst case timeout cap if Google completely freezes
    const stepWorstCaseSec = attempts * timeoutSec + stepBackoffTotal;

    return {
      modelId: mId,
      attempts,
      backoffDelaysSeconds,
      stepFastFailoverSec,
      stepWorstCaseSec,
    };
  });

  const typicalFastFailoverSeconds = modelSteps.reduce(
    (acc, s) => acc + s.stepFastFailoverSec,
    0
  );
  const maxWorstCaseTimeoutSeconds = modelSteps.reduce(
    (acc, s) => acc + s.stepWorstCaseSec,
    0
  );

  return {
    totalCalls,
    totalBackoffDelaySeconds,
    typicalFastFailoverSeconds,
    maxWorstCaseTimeoutSeconds,
    modelSteps,
  };
};

export const ApiProfilesManager: React.FC = () => {
  const {
    apiProfiles,
    availableModels,
    addApiProfile,
    updateApiProfile,
    deleteApiProfile,
    toggleApiProfile,
    reorderApiProfiles,
    addAvailableModel,
    deleteAvailableModel,
  } = useResumeStore();

  // Model Registry Form
  const [newModelName, setNewModelName] = useState("");
  const [newModelId, setNewModelId] = useState("");
  const [modelAddError, setModelAddError] = useState<string | null>(null);

  // New Profile Form
  const [showAddProfileModal, setShowAddProfileModal] = useState(false);
  const [newProfName, setNewProfName] = useState("");
  const [newProfKey, setNewProfKey] = useState("");
  const [newProfCascade, setNewProfCascade] = useState<string[]>([
    "gemini-3.8-flash",
    "gemini-3.7-flash",
    "gemini-3.6-flash",
  ]);

  // UI state for showing secret keys & expanders
  const [visibleKeyIds, setVisibleKeyIds] = useState<Record<string, boolean>>({});
  const [expandedBackoffIds, setExpandedBackoffIds] = useState<Record<string, boolean>>({});
  const [expandedCalculatorIds, setExpandedCalculatorIds] = useState<Record<string, boolean>>({});
  const [showGlossary, setShowGlossary] = useState(false);
  const [saveBanner, setSaveBanner] = useState<string | null>(null);

  const triggerSaveBanner = (msg: string) => {
    setSaveBanner(msg);
    setTimeout(() => setSaveBanner(null), 3000);
  };

  const toggleKeyVisibility = (id: string) => {
    setVisibleKeyIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleBackoffExpanded = (id: string) => {
    setExpandedBackoffIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleCalculatorExpanded = (id: string) => {
    setExpandedCalculatorIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Add Model to Registry
  const handleAddModel = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = newModelId.trim().toLowerCase();
    const cleanName = newModelName.trim();

    if (!cleanId || !cleanName) {
      setModelAddError("Both Model Code / ID and Display Name are required.");
      return;
    }

    if (availableModels.some((m) => m.id.toLowerCase() === cleanId)) {
      setModelAddError(`Model ID "${cleanId}" already exists in registry.`);
      return;
    }

    addAvailableModel({
      id: cleanId,
      name: cleanName,
      isCustom: true,
    });

    setNewModelId("");
    setNewModelName("");
    setModelAddError(null);
    triggerSaveBanner(`Added "${cleanName}" to Available Models registry.`);
  };

  // Add Profile
  const handleCreateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProfName.trim()) return;

    addApiProfile({
      name: newProfName.trim(),
      apiKey: newProfKey.trim(),
      enabled: true,
      modelCascade: newProfCascade.length > 0 ? newProfCascade : availableModels.map((m) => m.id),
      backoffConfig: { ...DEFAULT_BACKOFF_CONFIG },
      modelAttempts: {},
    });

    setNewProfName("");
    setNewProfKey("");
    setNewProfCascade(["gemini-3.8-flash", "gemini-3.7-flash", "gemini-3.6-flash"]);
    setShowAddProfileModal(false);
    triggerSaveBanner(`Created API Profile "${newProfName.trim()}".`);
  };

  // Toggle model inclusion in a profile's cascade
  const handleToggleModelInProfile = (profile: ApiProfile, modelId: string) => {
    const exists = profile.modelCascade.includes(modelId);
    let nextCascade: string[];
    if (exists) {
      nextCascade = profile.modelCascade.filter((id) => id !== modelId);
    } else {
      nextCascade = [...profile.modelCascade, modelId];
    }
    updateApiProfile(profile.id, { modelCascade: nextCascade });
  };

  // Move model up/down inside a profile's cascade
  const handleMoveModelInCascade = (
    profile: ApiProfile,
    index: number,
    direction: "up" | "down"
  ) => {
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= profile.modelCascade.length) return;
    const list = [...profile.modelCascade];
    const [item] = list.splice(index, 1);
    list.splice(targetIdx, 0, item);
    updateApiProfile(profile.id, { modelCascade: list });
  };

  // Set individual model attempts (e.g. 1 attempt for 3.8, 2 attempts for 3.6, 4 for 3.5)
  const handleSetModelAttempts = (profile: ApiProfile, modelId: string, attempts: number) => {
    const current = profile.modelAttempts || {};
    const clamped = Math.max(1, Math.min(6, attempts));
    updateApiProfile(profile.id, {
      modelAttempts: {
        ...current,
        [modelId]: clamped,
      },
    });
  };

  // Apply quick presets to a profile
  const handleApplyPreset = (profile: ApiProfile, preset: "balanced" | "fastest" | "persistent") => {
    const updatedAttempts: Record<string, number> = {};
    if (preset === "fastest") {
      profile.modelCascade.forEach((m) => {
        updatedAttempts[m] = 1;
      });
      triggerSaveBanner(`Set ${profile.name} to 1 Attempt Each (Fastest single-pass failover).`);
    } else if (preset === "persistent") {
      profile.modelCascade.forEach((m) => {
        updatedAttempts[m] = 3;
      });
      triggerSaveBanner(`Set ${profile.name} to 3 Attempts Each (Persistent retry pipeline).`);
    } else if (preset === "balanced") {
      profile.modelCascade.forEach((m) => {
        if (m.includes("3.8") || m.includes("3.7")) {
          updatedAttempts[m] = 1;
        } else if (m.includes("3.6")) {
          updatedAttempts[m] = 2;
        } else if (m.includes("3.5")) {
          updatedAttempts[m] = 4;
        } else {
          updatedAttempts[m] = 2;
        }
      });
      triggerSaveBanner(`Applied Balanced Strategy (1x for 3.8/3.7, 2x for 3.6, 4x for 3.5).`);
    }
    updateApiProfile(profile.id, { modelAttempts: updatedAttempts });
  };

  // Move profile up/down in priority
  const handleMoveProfile = (index: number, direction: "up" | "down") => {
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= apiProfiles.length) return;
    reorderApiProfiles(index, targetIdx);
  };

  return (
    <div className="space-y-6">
      {/* Save Notification */}
      {saveBanner && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-xs animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{saveBanner}</span>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────── */}
      {/* SECTION 1: EDUCATIONAL GLOSSARY & ARCHITECTURE CLARITY      */}
      {/* ──────────────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-indigo-50 via-slate-50 to-blue-50 border border-indigo-200/80 rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-indigo-600 text-white rounded-lg">
              <HelpCircle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-xs text-slate-900">
                Understanding Cascades, Attempts & Execution Timelines
              </h3>
              <p className="text-[11px] text-slate-500">
                How profiles, models, retries, and failovers work together without confusion.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowGlossary(!showGlossary)}
            className="text-xs font-semibold text-indigo-700 hover:text-indigo-900 flex items-center gap-1 bg-white px-2.5 py-1 rounded-lg border border-indigo-200 shadow-2xs cursor-pointer"
          >
            <span>{showGlossary ? "Hide Explainer" : "Read Architecture Explainer"}</span>
            {showGlossary ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {showGlossary && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 text-xs border-t border-indigo-100 text-slate-700 leading-relaxed animate-in fade-in">
            <div className="p-3 bg-white rounded-xl border border-indigo-100/80 space-y-1.5">
              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-indigo-600" />
                <span>What is an "Attempt"? (Model Level)</span>
              </div>
              <p className="text-[11px] text-slate-600">
                An <strong>Attempt</strong> is one individual HTTP request sent to Google for that specific model.
              </p>
              <ul className="list-disc list-inside text-[11px] text-slate-600 space-y-1">
                <li>
                  <strong>1 Attempt:</strong> <em>"Try once. If Google is busy (503/429), don't waste time waiting—cascade immediately to the next model."</em>
                </li>
                <li>
                  <strong>2–4 Attempts:</strong> <em>"If Google is busy, pause (backoff delay) and retry up to N times before giving up on this model."</em>
                </li>
              </ul>
            </div>

            <div className="p-3 bg-white rounded-xl border border-indigo-100/80 space-y-1.5">
              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-600" />
                <span>Why did the cascade take ~20 seconds before?</span>
              </div>
              <p className="text-[11px] text-slate-600">
                When Google servers are overloaded, they return an HTTP 503 error almost instantaneously (~1.2 seconds).
              </p>
              <p className="text-[11px] text-slate-600">
                If 4 models are configured with only 1 attempt and minimal backoff, cycling through all 4 takes: <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-[10px]">4 × 1.2s + backoff = ~15–20 seconds</code>.
                With per-model attempts and backoffs, you can now configure exactly how patient each model should be.
              </p>
            </div>

            <div className="p-3 bg-white rounded-xl border border-indigo-100/80 space-y-1.5">
              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-purple-600" />
                <span>Hierarchy: Profile ➔ Model ➔ Attempt</span>
              </div>
              <p className="text-[11px] text-slate-600">
                <strong>Profile (API Key):</strong> Your account (e.g. Free API vs Paid API).
                <br />
                <strong>Model Step:</strong> The candidate (e.g. 3.8 Flash, 3.6 Flash).
                <br />
                <strong>Attempt:</strong> Number of network tries for that model before moving to the next model in the pipeline.
              </p>
            </div>

            <div className="p-3 bg-white rounded-xl border border-indigo-100/80 space-y-1.5">
              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-600" />
                <span>Backoff Delay vs. Timeout</span>
              </div>
              <p className="text-[11px] text-slate-600">
                <strong>Backoff Delay:</strong> The pause (e.g. 1.5s, 3s) we intentionally wait <em>between retries</em> on the same model to let Google recover.
                <br />
                <strong>Timeout:</strong> The maximum seconds (e.g. 30s) we allow an unresponsive Google request to hang before aborting it.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ──────────────────────────────────────────────────────────── */}
      {/* SECTION 2: MULTI-API KEY PROFILES POOL                       */}
      {/* ──────────────────────────────────────────────────────────── */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-indigo-600" />
              <span>Multi-API Key Pool & Custom Cascades</span>
            </h2>
            <p className="text-xs text-slate-500">
              Configure multiple keys (e.g. Free personal keys, Paid keys), custom cascades, and per-model attempt counts.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowAddProfileModal(true)}
            className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors self-start sm:self-auto cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add API Profile</span>
          </button>
        </div>

        {/* Profiles List */}
        {apiProfiles.length === 0 ? (
          <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-2xl space-y-3">
            <KeyRound className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-xs text-slate-500">No API Profiles configured yet.</p>
            <button
              type="button"
              onClick={() => setShowAddProfileModal(true)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold cursor-pointer"
            >
              Create Your First Profile
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            {apiProfiles.map((prof, pIdx) => {
              const isKeyVisible = visibleKeyIds[prof.id];
              const isBackoffExpanded = expandedBackoffIds[prof.id];
              const isCalculatorExpanded = expandedCalculatorIds[prof.id] !== false; // open by default
              const backoff = prof.backoffConfig || DEFAULT_BACKOFF_CONFIG;
              const metrics = calculateTimelineMetrics(prof);

              return (
                <div
                  key={prof.id}
                  className={`border rounded-2xl p-5 transition-all space-y-4 shadow-2xs ${
                    prof.enabled
                      ? "bg-white border-slate-200 hover:border-indigo-300"
                      : "bg-slate-50/70 border-slate-200 opacity-60"
                  }`}
                >
                  {/* Top Bar: Name, Priority, Enable Toggle, Delete */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          disabled={pIdx === 0}
                          onClick={() => handleMoveProfile(pIdx, "up")}
                          className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 rounded hover:bg-slate-100 cursor-pointer"
                          title="Move Profile Up in Priority"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={pIdx === apiProfiles.length - 1}
                          onClick={() => handleMoveProfile(pIdx, "down")}
                          className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 rounded hover:bg-slate-100 cursor-pointer"
                          title="Move Profile Down in Priority"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
                        Priority #{pIdx + 1}
                      </span>

                      <input
                        type="text"
                        value={prof.name}
                        onChange={(e) => updateApiProfile(prof.id, { name: e.target.value })}
                        placeholder="e.g. Usman's API, Man Spider API, Paid API"
                        className="text-sm font-bold text-slate-900 border-b border-transparent hover:border-slate-300 focus:border-indigo-500 focus:outline-none px-1 py-0.5 bg-transparent"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Active Toggle */}
                      <button
                        type="button"
                        onClick={() => toggleApiProfile(prof.id)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                          prof.enabled
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-slate-100 text-slate-500 border border-slate-200"
                        }`}
                      >
                        <span className={`w-2 h-2 rounded-full ${prof.enabled ? "bg-emerald-500" : "bg-slate-400"}`} />
                        <span>{prof.enabled ? "Active in Pool" : "Disabled"}</span>
                      </button>

                      {/* Delete Profile */}
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`Delete API Profile "${prof.name}"?`)) {
                            deleteApiProfile(prof.id);
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                        title="Delete Profile"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* API Key Input */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-600 flex items-center justify-between">
                      <span>Gemini API Key (AIzaSy...)</span>
                      <button
                        type="button"
                        onClick={() => toggleKeyVisibility(prof.id)}
                        className="text-indigo-600 hover:text-indigo-800 flex items-center gap-1 font-normal text-[10px] cursor-pointer"
                      >
                        {isKeyVisible ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                        <span>{isKeyVisible ? "Hide Key" : "Reveal Key"}</span>
                      </button>
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type={isKeyVisible ? "text" : "password"}
                        value={prof.apiKey}
                        onChange={(e) => updateApiProfile(prof.id, { apiKey: e.target.value.trim() })}
                        placeholder="Paste Gemini API Key (e.g. AIzaSy...)"
                        className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono text-slate-900 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  {/* ──────────────────────────────────────────────────────────── */}
                  {/* CASCADE SEQUENCE & PER-MODEL ATTEMPTS                       */}
                  {/* ──────────────────────────────────────────────────────────── */}
                  <div className="space-y-2.5 pt-1">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                      <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <Cpu className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Custom Model Cascade & Attempts Pipeline</span>
                      </label>

                      {/* Quick Presets */}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] text-slate-400 font-medium">Quick Presets:</span>
                        <button
                          type="button"
                          onClick={() => handleApplyPreset(prof, "balanced")}
                          className="text-[10px] font-semibold px-2 py-0.5 rounded bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 transition-colors cursor-pointer"
                          title="1 attempt on 3.8/3.7, 2 attempts on 3.6, 4 attempts on 3.5"
                        >
                          Balanced (1x/1x/2x/4x)
                        </button>
                        <button
                          type="button"
                          onClick={() => handleApplyPreset(prof, "fastest")}
                          className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors cursor-pointer"
                          title="1 attempt on every model (fastest cascade)"
                        >
                          1x Each (Fast)
                        </button>
                        <button
                          type="button"
                          onClick={() => handleApplyPreset(prof, "persistent")}
                          className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors cursor-pointer"
                          title="3 attempts on every model"
                        >
                          3x Each (Robust)
                        </button>
                      </div>
                    </div>

                    {/* Model Cascade List with Individual Attempt Controls */}
                    <div className="space-y-2 p-3 bg-slate-50/80 rounded-xl border border-slate-200">
                      {prof.modelCascade.length === 0 ? (
                        <span className="text-[11px] text-slate-400 italic">
                          No models selected. Choose from available models below.
                        </span>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {prof.modelCascade.map((mId, mIdx) => {
                            const attempts = Math.max(1, prof.modelAttempts?.[mId] ?? 1);

                            return (
                              <div
                                key={mId}
                                className="bg-white border border-indigo-100 p-2.5 rounded-xl shadow-2xs flex items-center justify-between gap-2"
                              >
                                <div className="flex items-center gap-2 truncate">
                                  <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-200 px-1.5 py-0.5 rounded font-mono shrink-0">
                                    #{mIdx + 1}
                                  </span>
                                  <div className="truncate">
                                    <div className="font-mono font-bold text-xs text-slate-800 truncate">
                                      {mId}
                                    </div>
                                    <div className="text-[10px] text-slate-400">
                                      {attempts === 1
                                        ? "Single try (failover immediately)"
                                        : `${attempts} tries (with backoff pauses)`}
                                    </div>
                                  </div>
                                </div>

                                <div className="flex items-center gap-1.5 shrink-0">
                                  {/* Attempts Stepper */}
                                  <div className="flex items-center border border-slate-200 rounded-lg bg-slate-50 overflow-hidden shadow-2xs">
                                    <button
                                      type="button"
                                      disabled={attempts <= 1}
                                      onClick={() => handleSetModelAttempts(prof, mId, attempts - 1)}
                                      className="px-1.5 py-0.5 text-slate-500 hover:text-indigo-600 hover:bg-white disabled:opacity-30 transition-colors cursor-pointer"
                                      title="Decrease attempts"
                                    >
                                      <Minus className="w-3 h-3" />
                                    </button>
                                    <span className="px-2 py-0.5 text-[11px] font-mono font-bold text-indigo-700 bg-white">
                                      {attempts}x
                                    </span>
                                    <button
                                      type="button"
                                      disabled={attempts >= 6}
                                      onClick={() => handleSetModelAttempts(prof, mId, attempts + 1)}
                                      className="px-1.5 py-0.5 text-slate-500 hover:text-indigo-600 hover:bg-white disabled:opacity-30 transition-colors cursor-pointer"
                                      title="Increase attempts"
                                    >
                                      <Plus className="w-3 h-3" />
                                    </button>
                                  </div>

                                  {/* Reorder & Remove */}
                                  <div className="flex items-center gap-0.5 border-l border-slate-200 pl-1">
                                    <button
                                      type="button"
                                      disabled={mIdx === 0}
                                      onClick={() => handleMoveModelInCascade(prof, mIdx, "up")}
                                      className="p-1 text-slate-400 hover:text-indigo-600 disabled:opacity-20 rounded cursor-pointer"
                                      title="Run earlier in cascade"
                                    >
                                      <ArrowUp className="w-3 h-3" />
                                    </button>
                                    <button
                                      type="button"
                                      disabled={mIdx === prof.modelCascade.length - 1}
                                      onClick={() => handleMoveModelInCascade(prof, mIdx, "down")}
                                      className="p-1 text-slate-400 hover:text-indigo-600 disabled:opacity-20 rounded cursor-pointer"
                                      title="Run later in cascade"
                                    >
                                      <ArrowDown className="w-3 h-3" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleToggleModelInProfile(prof, mId)}
                                      className="p-1 text-slate-400 hover:text-rose-600 rounded cursor-pointer"
                                      title="Remove from cascade"
                                    >
                                      ✕
                                    </button>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Click-to-Add Chips from Available Models */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="text-[10px] text-slate-400 font-medium mr-1">Available Models:</span>
                      {availableModels.map((m) => {
                        const isInCascade = prof.modelCascade.includes(m.id);
                        return (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => handleToggleModelInProfile(prof, m.id)}
                            className={`text-[10px] font-mono px-2 py-0.5 rounded-md border transition-all cursor-pointer ${
                              isInCascade
                                ? "bg-indigo-600 text-white border-indigo-600 font-bold shadow-2xs"
                                : "bg-white text-slate-600 border-slate-200 hover:border-indigo-300"
                            }`}
                            title={isInCascade ? "Click to remove from cascade" : "Click to add to cascade"}
                          >
                            {isInCascade ? "✓ " : "+ "}
                            {m.id}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* ──────────────────────────────────────────────────────────── */}
                  {/* TIMELINE BREAKDOWN & DURATION CALCULATOR                     */}
                  {/* ──────────────────────────────────────────────────────────── */}
                  <div className="pt-2 border-t border-slate-100 space-y-2">
                    <button
                      type="button"
                      onClick={() => toggleCalculatorExpanded(prof.id)}
                      className="text-xs text-slate-700 hover:text-indigo-600 font-bold flex items-center justify-between w-full cursor-pointer"
                    >
                      <span className="flex items-center gap-1.5">
                        <Calculator className="w-4 h-4 text-indigo-600" />
                        <span>Visual Timeline & Duration Calculator</span>
                        <span className="text-[10px] font-normal text-slate-400">
                          (Calculates real expected execution and failover timings)
                        </span>
                      </span>
                      {isCalculatorExpanded ? (
                        <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                      )}
                    </button>

                    {isCalculatorExpanded && (
                      <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3 animate-in fade-in">
                        {/* 4 Summary Stat Cards */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                          <div className="p-2.5 bg-white border border-slate-200 rounded-xl shadow-2xs space-y-0.5">
                            <span className="text-[10px] text-slate-400 font-medium block">
                              Total Calls Scheduled
                            </span>
                            <div className="text-base font-bold text-slate-900 font-mono">
                              {metrics.totalCalls} <span className="text-xs font-normal text-slate-500">calls</span>
                            </div>
                            <span className="text-[9px] text-slate-400 block">
                              Sum of attempts in cascade
                            </span>
                          </div>

                          <div className="p-2.5 bg-white border border-slate-200 rounded-xl shadow-2xs space-y-0.5">
                            <span className="text-[10px] text-slate-400 font-medium block">
                              Total Backoff Pauses
                            </span>
                            <div className="text-base font-bold text-amber-700 font-mono">
                              {metrics.totalBackoffDelaySeconds.toFixed(1)} <span className="text-xs font-normal text-slate-500">sec</span>
                            </div>
                            <span className="text-[9px] text-slate-400 block">
                              Breathing room between retries
                            </span>
                          </div>

                          <div className="p-2.5 bg-white border border-indigo-200 rounded-xl shadow-2xs space-y-0.5 bg-gradient-to-br from-white to-indigo-50/40">
                            <span className="text-[10px] text-indigo-700 font-semibold block flex items-center gap-1">
                              <Zap className="w-3 h-3 text-indigo-500" />
                              <span>Typical 503 Failover</span>
                            </span>
                            <div className="text-base font-bold text-indigo-900 font-mono">
                              ~{metrics.typicalFastFailoverSeconds.toFixed(0)} <span className="text-xs font-normal text-slate-500">sec</span>
                            </div>
                            <span className="text-[9px] text-indigo-600/80 block">
                              If Google servers reject instantly
                            </span>
                          </div>

                          <div className="p-2.5 bg-white border border-slate-200 rounded-xl shadow-2xs space-y-0.5">
                            <span className="text-[10px] text-slate-400 font-medium block">
                              Max Timeout Cap
                            </span>
                            <div className="text-base font-bold text-slate-700 font-mono">
                              ~{metrics.maxWorstCaseTimeoutSeconds.toFixed(0)} <span className="text-xs font-normal text-slate-500">sec</span>
                            </div>
                            <span className="text-[9px] text-slate-400 block">
                              Only if Google completely freezes
                            </span>
                          </div>
                        </div>

                        {/* Visual Waterfall Timeline */}
                        <div className="space-y-1.5 pt-1">
                          <span className="text-[10px] font-bold text-slate-600 block uppercase tracking-wider">
                            Pipeline Execution Flow (Left to Right):
                          </span>

                          <div className="space-y-2">
                            {metrics.modelSteps.map((step, sIdx) => (
                              <div
                                key={step.modelId}
                                className="p-2 bg-white rounded-lg border border-slate-200 text-xs font-mono space-y-1"
                              >
                                <div className="flex items-center justify-between text-[11px]">
                                  <span className="font-bold text-slate-800">
                                    Step #{sIdx + 1}: {step.modelId}
                                  </span>
                                  <span className="text-[10px] text-slate-500">
                                    {step.attempts} attempt{step.attempts > 1 ? "s" : ""} • Est: ~{step.stepFastFailoverSec.toFixed(1)}s
                                  </span>
                                </div>

                                <div className="flex items-center gap-1.5 flex-wrap">
                                  {Array.from({ length: step.attempts }).map((_, aIdx) => (
                                    <React.Fragment key={aIdx}>
                                      <span className="px-2 py-0.5 rounded bg-indigo-50 border border-indigo-200 text-indigo-700 text-[10px] font-semibold flex items-center gap-1">
                                        <span>Try #{aIdx + 1}</span>
                                        <span className="text-[9px] text-indigo-400">(~1.2s)</span>
                                      </span>

                                      {aIdx < step.attempts - 1 && (
                                        <span className="px-1.5 py-0.5 rounded bg-amber-50 border border-amber-200 text-amber-800 text-[10px] font-bold flex items-center gap-0.5">
                                          <Clock className="w-2.5 h-2.5" />
                                          <span>Pause {step.backoffDelaysSeconds[aIdx]?.toFixed(1)}s</span>
                                        </span>
                                      )}
                                    </React.Fragment>
                                  ))}

                                  {sIdx < metrics.modelSteps.length - 1 ? (
                                    <span className="text-[10px] text-slate-400 font-bold ml-1">
                                      ➔ Failover to next
                                    </span>
                                  ) : (
                                    <span className="text-[10px] text-emerald-600 font-bold ml-1">
                                      ➔ Exhausted (failover to next profile)
                                    </span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* ──────────────────────────────────────────────────────────── */}
                  {/* EXPONENTIAL BACKOFF TIMING CONFIGURATION DRAWER              */}
                  {/* ──────────────────────────────────────────────────────────── */}
                  <div className="pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => toggleBackoffExpanded(prof.id)}
                      className="text-xs text-slate-600 hover:text-indigo-600 font-semibold flex items-center justify-between w-full cursor-pointer"
                    >
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-indigo-500" />
                        <span>Advanced Timing & Timeout Parameters</span>
                        <span className="text-[10px] text-slate-400 font-normal">
                          ({backoff.initialDelayMs / 1000}s initial pause • {backoff.maxDelayMs / 1000}s max pause • {backoff.timeoutMs / 1000}s timeout)
                        </span>
                      </span>
                      {isBackoffExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>

                    {isBackoffExpanded && (
                      <div className="mt-3 p-3.5 bg-slate-50 border border-slate-200 rounded-xl grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs animate-in fade-in">
                        <div>
                          <label className="text-[10px] font-semibold text-slate-600 block mb-1">
                            Initial Delay Between Retries (ms)
                          </label>
                          <input
                            type="number"
                            step={100}
                            min={500}
                            max={10000}
                            value={backoff.initialDelayMs}
                            onChange={(e) =>
                              updateApiProfile(prof.id, {
                                backoffConfig: { ...backoff, initialDelayMs: parseInt(e.target.value) || 1000 },
                              })
                            }
                            className="w-full px-2.5 py-1 bg-white border border-slate-300 rounded-md font-mono text-xs"
                          />
                          <p className="text-[9px] text-slate-400 mt-0.5">
                            Delay before retry 1 (e.g. 1500ms = 1.5s).
                          </p>
                        </div>

                        <div>
                          <label className="text-[10px] font-semibold text-slate-600 block mb-1">
                            Max Delay Cap (ms)
                          </label>
                          <input
                            type="number"
                            step={500}
                            min={2000}
                            max={30000}
                            value={backoff.maxDelayMs}
                            onChange={(e) =>
                              updateApiProfile(prof.id, {
                                backoffConfig: { ...backoff, maxDelayMs: parseInt(e.target.value) || 5000 },
                              })
                            }
                            className="w-full px-2.5 py-1 bg-white border border-slate-300 rounded-md font-mono text-xs"
                          />
                          <p className="text-[9px] text-slate-400 mt-0.5">
                            Upper limit for exponential backoff (e.g. 8000ms = 8s).
                          </p>
                        </div>

                        <div>
                          <label className="text-[10px] font-semibold text-slate-600 block mb-1">
                            Timeout per Attempt (seconds)
                          </label>
                          <input
                            type="number"
                            min={10}
                            max={180}
                            value={Math.round((backoff.timeoutMs || 65000) / 1000)}
                            onChange={(e) =>
                              updateApiProfile(prof.id, {
                                backoffConfig: {
                                  ...backoff,
                                  timeoutMs: (parseInt(e.target.value) || 60) * 1000,
                                },
                              })
                            }
                            className="w-full px-2.5 py-1 bg-white border border-slate-300 rounded-md font-mono text-xs"
                          />
                          <p className="text-[9px] text-slate-400 mt-0.5">
                            Aborts an individual hanging request after N seconds.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ──────────────────────────────────────────────────────────── */}
      {/* SECTION 3: MODEL REGISTRY (ADD & DELETE MODELS)              */}
      {/* ──────────────────────────────────────────────────────────── */}
      <div className="space-y-4 pt-4 border-t border-slate-200">
        <div>
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Cpu className="w-4 h-4 text-indigo-600" />
            <span>Available Models Registry</span>
          </h2>
          <p className="text-xs text-slate-500">
            View, delete obsolete models (e.g. Remove all 2.5 versions), or register new Gemini models as they are released.
          </p>
        </div>

        {/* Models Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {availableModels.map((m) => (
            <div
              key={m.id}
              className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between gap-2 shadow-2xs hover:border-slate-300"
            >
              <div className="truncate">
                <div className="font-semibold text-xs text-slate-900 truncate">
                  {m.name}
                </div>
                <div className="text-[11px] font-mono text-slate-500 truncate">
                  {m.id}
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (confirm(`Remove "${m.name}" (${m.id}) from available models?`)) {
                    deleteAvailableModel(m.id);
                    triggerSaveBanner(`Removed model "${m.id}".`);
                  }
                }}
                className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors shrink-0 cursor-pointer"
                title="Delete Model from Registry"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>

        {/* Add New Model Form */}
        <form
          onSubmit={handleAddModel}
          className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3"
        >
          <div className="font-semibold text-xs text-slate-800 flex items-center gap-1.5">
            <Plus className="w-3.5 h-3.5 text-indigo-600" />
            <span>Register New Model Code</span>
          </div>

          {modelAddError && (
            <div className="text-[11px] text-red-600 bg-red-50 p-2 rounded-lg border border-red-200">
              {modelAddError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                Display Name
              </label>
              <input
                type="text"
                value={newModelName}
                onChange={(e) => setNewModelName(e.target.value)}
                placeholder="e.g. Gemini 3.9 Flash (Ultra Fast)"
                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                Exact Model Code / ID
              </label>
              <input
                type="text"
                value={newModelId}
                onChange={(e) => setNewModelId(e.target.value)}
                placeholder="e.g. gemini-3.9-flash"
                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-mono text-slate-900 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <button
            type="submit"
            className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Model to Catalog</span>
          </button>
        </form>
      </div>

      {/* ──────────────────────────────────────────────────────────── */}
      {/* MODAL: ADD NEW API PROFILE                                  */}
      {/* ──────────────────────────────────────────────────────────── */}
      {showAddProfileModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-indigo-600" />
                <span>Create New API Profile</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowAddProfileModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateProfile} className="space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Profile Name / Account Label
                </label>
                <input
                  type="text"
                  required
                  value={newProfName}
                  onChange={(e) => setNewProfName(e.target.value)}
                  placeholder="e.g. Usman's API, Man Spider API, Paid Tier API"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Gemini API Key (AIzaSy...)
                </label>
                <input
                  type="password"
                  value={newProfKey}
                  onChange={(e) => setNewProfKey(e.target.value)}
                  placeholder="Paste AIzaSy... API key"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono text-slate-900 focus:outline-none focus:border-indigo-500"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Only your Gemini API Key is needed. No secret key required.
                </p>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Select Models for this Key's Cascade Pipeline:
                </label>
                <div className="flex flex-wrap gap-1.5 p-2 bg-slate-50 rounded-lg border border-slate-200">
                  {availableModels.map((m) => {
                    const isSelected = newProfCascade.includes(m.id);
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => {
                          if (isSelected) {
                            setNewProfCascade(newProfCascade.filter((id) => id !== m.id));
                          } else {
                            setNewProfCascade([...newProfCascade, m.id]);
                          }
                        }}
                        className={`text-[10px] font-mono px-2 py-1 rounded-md border transition-all cursor-pointer ${
                          isSelected
                            ? "bg-indigo-600 text-white border-indigo-600 font-bold"
                            : "bg-white text-slate-600 border-slate-200"
                        }`}
                      >
                        {isSelected ? "✓ " : "+ "}
                        {m.id}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddProfileModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold shadow-xs transition-colors cursor-pointer"
                >
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
