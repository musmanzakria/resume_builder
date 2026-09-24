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
} from "lucide-react";
import {
  ApiProfile,
  AvailableModelItem,
  DEFAULT_BACKOFF_CONFIG,
} from "@/types/ai";

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

  // UI state for showing secret keys
  const [visibleKeyIds, setVisibleKeyIds] = useState<Record<string, boolean>>({});
  const [expandedBackoffIds, setExpandedBackoffIds] = useState<Record<string, boolean>>({});
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
    });

    setNewProfName("");
    setNewProfKey("");
    setNewProfCascade(availableModels.slice(0, 3).map((m) => m.id));
    setShowAddProfileModal(false);
    triggerSaveBanner(`API Profile "${newProfName.trim()}" created successfully!`);
  };

  // Toggle model inclusion in a profile's cascade
  const handleToggleModelInProfile = (profile: ApiProfile, modelId: string) => {
    const current = profile.modelCascade || [];
    let updated: string[];
    if (current.includes(modelId)) {
      updated = current.filter((m) => m !== modelId);
    } else {
      updated = [...current, modelId];
    }
    updateApiProfile(profile.id, { modelCascade: updated });
  };

  // Move model up/down in a profile's cascade
  const handleMoveModelInCascade = (profile: ApiProfile, index: number, direction: "up" | "down") => {
    const list = [...profile.modelCascade];
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= list.length) return;
    const [item] = list.splice(index, 1);
    list.splice(targetIdx, 0, item);
    updateApiProfile(profile.id, { modelCascade: list });
  };

  // Move profile up/down in priority
  const handleMoveProfile = (index: number, direction: "up" | "down") => {
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= apiProfiles.length) return;
    reorderApiProfiles(index, targetIdx);
  };

  const maskKey = (key: string) => {
    if (!key) return "No key configured";
    if (key.length <= 8) return "••••••••";
    return `${key.slice(0, 4)}••••••••${key.slice(-4)}`;
  };

  return (
    <div className="space-y-6">
      {/* Save Notification */}
      {saveBanner && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2 shadow-xs animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-semibold">{saveBanner}</span>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────── */}
      {/* SECTION 1: CONFIGURED API PROFILES & CUSTOM CASCADES       */}
      {/* ──────────────────────────────────────────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
              <KeyRound className="w-5 h-5 text-indigo-600" />
              <span>Multi-API Key Pool & Custom Cascades</span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Configure multiple keys (e.g. Free personal keys, Paid high-tier keys), assign custom model sequences, and set backoff pipelines.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowAddProfileModal(true)}
            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors self-start sm:self-auto shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add API Profile</span>
          </button>
        </div>

        {/* Global Pipeline Execution Flow Preview */}
        {apiProfiles.length > 0 && (
          <div className="bg-gradient-to-r from-indigo-50/60 via-slate-50 to-purple-50/60 border border-indigo-100 rounded-xl p-3.5 space-y-2 text-xs">
            <span className="font-bold text-slate-800 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-indigo-600" />
              Active Failover Execution Pipeline
            </span>
            <div className="flex flex-wrap items-center gap-2 pt-1 font-mono text-[11px]">
              {apiProfiles
                .filter((p) => p.enabled)
                .map((p, idx) => (
                  <React.Fragment key={p.id}>
                    <div className="bg-white px-2.5 py-1.5 rounded-lg border border-indigo-200 shadow-2xs flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded-full bg-indigo-600 text-white text-[9px] flex items-center justify-center font-bold">
                        {idx + 1}
                      </span>
                      <strong className="text-slate-800">{p.name}</strong>
                      <span className="text-slate-400">({p.modelCascade.length} models)</span>
                    </div>
                    {idx < apiProfiles.filter((pr) => pr.enabled).length - 1 && (
                      <span className="text-indigo-400 font-bold text-xs">➔</span>
                    )}
                  </React.Fragment>
                ))}
            </div>
          </div>
        )}

        {/* Profiles List */}
        {apiProfiles.length === 0 ? (
          <div className="text-center py-8 bg-slate-50 border border-dashed border-slate-200 rounded-xl p-6 space-y-2">
            <p className="text-xs text-slate-500 font-medium">No API profiles configured yet.</p>
            <button
              onClick={() => setShowAddProfileModal(true)}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-bold"
            >
              + Create your first API profile
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {apiProfiles.map((prof, pIdx) => {
              const isKeyVisible = visibleKeyIds[prof.id];
              const isBackoffExpanded = expandedBackoffIds[prof.id];
              const backoff = prof.backoffConfig || DEFAULT_BACKOFF_CONFIG;

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
                    <div className="flex items-center gap-2.5">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          disabled={pIdx === 0}
                          onClick={() => handleMoveProfile(pIdx, "up")}
                          className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 rounded hover:bg-slate-100"
                          title="Move Profile Up in Priority"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={pIdx === apiProfiles.length - 1}
                          onClick={() => handleMoveProfile(pIdx, "down")}
                          className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 rounded hover:bg-slate-100"
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
                        className="font-bold text-sm text-slate-900 bg-transparent border-b border-dashed border-slate-300 focus:border-indigo-600 focus:outline-none px-1"
                        placeholder="e.g. Usman's Free API, Paid API"
                      />
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      {/* Enable/Disable Toggle */}
                      <button
                        type="button"
                        onClick={() => toggleApiProfile(prof.id)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors border ${
                          prof.enabled
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                            : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200"
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
                        className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
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
                        className="text-indigo-600 hover:text-indigo-800 flex items-center gap-1 font-normal text-[10px]"
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

                  {/* Custom Model Cascade Pipeline */}
                  <div className="space-y-2 pt-1">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <Cpu className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Custom Model Cascade Sequence</span>
                      </label>
                      <span className="text-[10px] text-slate-500">
                        {prof.modelCascade.length} models configured (cycles from left to right)
                      </span>
                    </div>

                    {/* Ordered Cascade Pipeline Chips */}
                    <div className="flex flex-wrap items-center gap-1.5 p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                      {prof.modelCascade.length === 0 ? (
                        <span className="text-[11px] text-slate-400 italic">
                          No models selected. Choose from available models below.
                        </span>
                      ) : (
                        prof.modelCascade.map((mId, mIdx) => (
                          <div
                            key={mId}
                            className="bg-white border border-indigo-200 px-2.5 py-1 rounded-lg text-xs font-mono flex items-center gap-1.5 shadow-2xs group"
                          >
                            <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-1 rounded">
                              #{mIdx + 1}
                            </span>
                            <span className="font-semibold text-slate-800">{mId}</span>

                            <div className="flex items-center gap-0.5 ml-1 opacity-80 group-hover:opacity-100">
                              <button
                                type="button"
                                disabled={mIdx === 0}
                                onClick={() => handleMoveModelInCascade(prof, mIdx, "up")}
                                className="p-0.5 hover:text-indigo-600 disabled:opacity-20"
                                title="Run earlier in cascade"
                              >
                                <ArrowUp className="w-3 h-3" />
                              </button>
                              <button
                                type="button"
                                disabled={mIdx === prof.modelCascade.length - 1}
                                onClick={() => handleMoveModelInCascade(prof, mIdx, "down")}
                                className="p-0.5 hover:text-indigo-600 disabled:opacity-20"
                                title="Run later in cascade"
                              >
                                <ArrowDown className="w-3 h-3" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleToggleModelInProfile(prof, mId)}
                                className="p-0.5 text-slate-400 hover:text-rose-600"
                                title="Remove from this key's cascade"
                              >
                                ×
                              </button>
                            </div>
                          </div>
                        ))
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
                            className={`text-[10px] font-mono px-2 py-0.5 rounded-md border transition-all ${
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

                  {/* Exponential Backoff Pipeline Drawer */}
                  <div className="pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => toggleBackoffExpanded(prof.id)}
                      className="text-xs text-slate-600 hover:text-indigo-600 font-semibold flex items-center justify-between w-full"
                    >
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-indigo-500" />
                        <span>Configured Exponential Backoff & Retry Pipeline</span>
                        <span className="text-[10px] text-slate-400 font-normal">
                          ({backoff.maxRetries} retries • {backoff.initialDelayMs / 1000}s initial • {backoff.maxDelayMs / 1000}s max delay • {backoff.timeoutMs / 1000}s timeout)
                        </span>
                      </span>
                      {isBackoffExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>

                    {isBackoffExpanded && (
                      <div className="mt-3 p-3.5 bg-slate-50 border border-slate-200 rounded-xl grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs animate-in fade-in">
                        <div>
                          <label className="text-[10px] font-semibold text-slate-600 block mb-1">
                            Max Retries / Model
                          </label>
                          <input
                            type="number"
                            min={0}
                            max={5}
                            value={backoff.maxRetries}
                            onChange={(e) =>
                              updateApiProfile(prof.id, {
                                backoffConfig: { ...backoff, maxRetries: parseInt(e.target.value) || 0 },
                              })
                            }
                            className="w-full px-2.5 py-1 bg-white border border-slate-300 rounded-md font-mono text-xs"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-semibold text-slate-600 block mb-1">
                            Initial Delay (ms)
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
                        </div>

                        <div>
                          <label className="text-[10px] font-semibold text-slate-600 block mb-1">
                            Max Backoff Delay (ms)
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
                        </div>

                        <div>
                          <label className="text-[10px] font-semibold text-slate-600 block mb-1">
                            Timeout / Attempt (s)
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
      {/* SECTION 2: AVAILABLE MODELS REGISTRY CATALOG                */}
      {/* ──────────────────────────────────────────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="border-b border-slate-100 pb-3">
          <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
            <Cpu className="w-4 h-4 text-indigo-600" />
            <span>Available Gemini Models Registry</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage your catalog of models. Remove legacy models (like 2.5 versions) or register brand new Gemini models as soon as Google releases them.
          </p>
        </div>

        {/* Catalog Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
          {availableModels.map((m) => (
            <div
              key={m.id}
              className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-2 shadow-2xs hover:border-slate-300 transition-colors"
            >
              <div className="min-w-0">
                <span className="text-xs font-bold text-slate-900 block truncate">{m.name}</span>
                <span className="text-[10px] font-mono text-slate-500 block truncate">{m.id}</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (confirm(`Remove "${m.name}" (${m.id}) from registry? It will also be removed from any cascades.`)) {
                    deleteAvailableModel(m.id);
                  }
                }}
                className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors shrink-0"
                title="Remove Model from Registry"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>

        {/* Add New Model Form */}
        <form onSubmit={handleAddModel} className="pt-3 border-t border-slate-100 space-y-3">
          <span className="text-xs font-bold text-slate-700 block">Register a New Gemini Model Code:</span>

          {modelAddError && (
            <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{modelAddError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-semibold text-slate-600 block mb-1">
                Model Code / ID (Exact Google API string)
              </label>
              <input
                type="text"
                value={newModelId}
                onChange={(e) => setNewModelId(e.target.value)}
                placeholder="e.g. gemini-3.9-flash"
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono text-slate-900 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="text-[10px] font-semibold text-slate-600 block mb-1">
                Display Name (Label in App)
              </label>
              <input
                type="text"
                value={newModelName}
                onChange={(e) => setNewModelName(e.target.value)}
                placeholder="e.g. Gemini 3.9 Flash (Ultra Low-Latency)"
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <button
            type="submit"
            className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors"
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
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
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
                        className={`text-[10px] font-mono px-2 py-1 rounded-md border transition-all ${
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
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold shadow-xs transition-colors"
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
