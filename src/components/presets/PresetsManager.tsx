"use client";

import React, { useState } from "react";
import { useResumeStore } from "@/lib/store";
import {
  Layers,
  CheckCircle,
  Plus,
  Trash2,
  Cpu,
  X,
  FileText,
} from "lucide-react";
import { TipTapInput } from "@/components/common/TipTapInput";

export const PresetsManager: React.FC = () => {
  const {
    resume,
    setHashMovePreset,
    addHashMoveBullet,
    removeHashMoveBullet,
    addHashMovePreset,
    deleteHashMovePreset,
  } = useResumeStore();

  const { experience_presets } = resume;
  const hashmove = experience_presets.hashmove;
  const activePresetKey = hashmove.activePreset;

  const [newBulletText, setNewBulletText] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPresetKey, setNewPresetKey] = useState("");
  const [newPresetTitle, setNewPresetTitle] = useState("");

  const handleAddBullet = () => {
    if (!newBulletText.trim()) return;
    addHashMoveBullet(activePresetKey, newBulletText.trim());
    setNewBulletText("");
  };

  const handleCreatePreset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPresetTitle.trim()) return;
    const key = newPresetKey.trim() || newPresetTitle.toLowerCase().replace(/[^a-z0-9]+/g, "_");
    
    addHashMovePreset(key, {
      title: newPresetTitle.trim(),
      label: newPresetTitle.trim(),
      bullets: [
        "Architected strategic initiatives driving key business performance metrics.",
        "Collaborated with cross-functional leadership on go-to-market execution.",
      ],
    });

    setShowCreateModal(false);
    setNewPresetKey("");
    setNewPresetTitle("");
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
      {/* Header Info */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-indigo-700 font-bold text-sm">
            <Layers className="w-4 h-4" />
            <span>HashMove Experience Presets</span>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Preset</span>
          </button>
        </div>
        <p className="text-xs text-slate-500 leading-relaxed">
          Switch between your specialized experience presets (Data Analytics, Growth/Marketing, Product, GDPR/Security) or let AI auto-select the best fit based on the Job Description.
        </p>
      </div>

      {/* Preset Selector Grid (Light Mode) */}
      <div className="space-y-2">
        <label className="text-xs text-slate-700 font-semibold uppercase tracking-wider block">
          Available Presets ({Object.keys(hashmove.presets).length})
        </label>
        <div className="grid grid-cols-1 gap-2">
          {Object.entries(hashmove.presets).map(([key, preset]) => {
            const isActive = activePresetKey === key;
            const displayTitle = preset.title || preset.label || key.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());

            return (
              <div
                key={key}
                onClick={() => setHashMovePreset(key)}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                  isActive
                    ? "bg-indigo-50/60 border-indigo-500 ring-2 ring-indigo-500/20 shadow-xs"
                    : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    {isActive ? (
                      <CheckCircle className="w-4 h-4 text-indigo-600 shrink-0" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border-2 border-slate-300 shrink-0" />
                    )}
                    <span className={`text-xs font-bold ${isActive ? "text-indigo-950" : "text-slate-800"}`}>
                      {displayTitle}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                      {preset.bullets.length} bullets
                    </span>
                    {Object.keys(hashmove.presets).length > 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteHashMovePreset(key);
                        }}
                        className="p-1 text-slate-400 hover:text-red-600 rounded transition-colors"
                        title="Delete Preset"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Active Preset Bullets Editor (Light Mode) */}
      {hashmove.presets[activePresetKey] && (
        <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-indigo-600" />
              <span className="font-bold text-sm text-slate-900">
                {hashmove.presets[activePresetKey].title || hashmove.presets[activePresetKey].label || activePresetKey}
              </span>
            </div>
            <span className="text-[11px] text-indigo-700 font-semibold bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
              Active on Resume
            </span>
          </div>

          {/* Cleanly Structured Bullets List */}
          <div className="space-y-3">
            {hashmove.presets[activePresetKey].bullets.map((bullet, idx) => (
              <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2 hover:border-slate-300 transition-colors">
                <div className="flex items-center justify-between text-xs text-slate-700 font-semibold">
                  <span className="flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px] font-mono font-bold">
                      {idx + 1}
                    </span>
                    Bullet Point #{idx + 1}
                  </span>
                  <button
                    onClick={() => removeHashMoveBullet(activePresetKey, idx)}
                    className="text-slate-400 hover:text-red-600 p-1 rounded hover:bg-red-50 transition-colors"
                    title="Delete bullet"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <TipTapInput
                  value={bullet}
                  onChange={(newVal) => {
                    const newBullets = [...hashmove.presets[activePresetKey].bullets];
                    newBullets[idx] = newVal;
                    useResumeStore.setState((state) => ({
                      resume: {
                        ...state.resume,
                        experience_presets: {
                          ...state.resume.experience_presets,
                          hashmove: {
                            ...state.resume.experience_presets.hashmove,
                            presets: {
                              ...state.resume.experience_presets.hashmove.presets,
                              [activePresetKey]: {
                                ...state.resume.experience_presets.hashmove.presets[activePresetKey],
                                bullets: newBullets,
                              },
                            },
                          },
                        },
                      },
                    }));
                  }}
                  rows={2}
                />
              </div>
            ))}
          </div>

          {/* Add New Bullet */}
          <div className="p-3.5 bg-slate-50/80 border border-dashed border-indigo-200 rounded-xl space-y-2">
            <span className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5 text-indigo-600" />
              Add New Bullet Point
            </span>
            <TipTapInput
              value={newBulletText}
              onChange={setNewBulletText}
              placeholder="Type new bullet with bold metrics and links..."
              rows={2}
            />
            <button
              onClick={handleAddBullet}
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Bullet to Preset
            </button>
          </div>
        </div>
      )}

      {/* Create New Preset Modal */}
      {showCreateModal && (
        <div className="p-4 bg-white border border-slate-300 rounded-xl shadow-2xl space-y-3 animate-in fade-in">
          <div className="flex items-center justify-between text-xs font-bold text-slate-800">
            <span>Create New Experience Preset</span>
            <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          </div>
          <form onSubmit={handleCreatePreset} className="space-y-2">
            <div>
              <label className="text-[10px] text-slate-500 block mb-1">Preset Title</label>
              <input
                type="text"
                value={newPresetTitle}
                onChange={(e) => setNewPresetTitle(e.target.value)}
                placeholder="e.g., AI & Automation Lead"
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
                autoFocus
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold"
              >
                Save Preset
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
