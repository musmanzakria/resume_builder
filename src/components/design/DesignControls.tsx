"use client";

import React from "react";
import { useResumeStore } from "@/lib/store";
import {
  Palette,
  Type,
  Layout,
  ArrowUp,
  ArrowDown,
  RotateCcw,
} from "lucide-react";
import { NumberStepper } from "@/components/common/NumberStepper";

export const DesignControls: React.FC = () => {
  const {
    resume,
    updateTypography,
    updateSpacing,
    reorderSections,
    updateSettings,
  } = useResumeStore();

  const { settings } = resume;
  const typography = settings.typography;
  const spacing = settings.spacing;
  const sectionOrder = settings.sectionOrder || [
    "header",
    "summary",
    "education",
    "experience",
    "projects",
    "skills",
    "awards",
    "languages",
  ];

  const fontOptions = [
    { id: "Merriweather", name: "Merriweather (Default Serif — Classic ATS)" },
    { id: "Inter", name: "Inter (Modern Sans-Serif)" },
    { id: "Outfit", name: "Outfit (Modern Geometric)" },
    { id: "Roboto", name: "Roboto (Clean Standard Sans)" },
  ];

  const sectionLabels: Record<string, string> = {
    header: "Header & Contact Details",
    summary: "Profile Summary & Bio",
    education: "Education Section",
    experience: "Professional Experience (HashMove & Others)",
    projects: "Selected Projects Pool",
    skills: "Skills & Certifications",
    awards: "Awards & Honors",
    languages: "Languages & Availability",
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
      {/* 1. Typography Settings */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-4 shadow-xs">
        <div className="flex items-center gap-2 text-indigo-700 font-bold text-sm border-b border-slate-100 pb-2">
          <Type className="w-4 h-4" />
          <span>Typography & Font Sizes</span>
        </div>

        {/* Font Family Dropdown */}
        <div className="space-y-1.5">
          <label className="text-xs text-slate-700 font-semibold block">Font Family</label>
          <select
            value={typography.fontFamily || "Merriweather"}
            onChange={(e) => updateTypography({ fontFamily: e.target.value })}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20"
          >
            {fontOptions.map((font) => (
              <option key={font.id} value={font.id}>
                {font.name}
              </option>
            ))}
          </select>
        </div>

        {/* Numeric Steppers for Font Sizes */}
        <div className="grid grid-cols-1 gap-3 pt-2">
          <NumberStepper
            label="Name Heading Font Size"
            value={typography.headerFontSize || 14}
            onChange={(val) => updateTypography({ headerFontSize: val })}
            min={12}
            max={28}
            step={0.5}
            unit="pt"
            presets={[12, 13, 14, 16, 18, 22]}
          />

          <NumberStepper
            label="Section Headings Font Size"
            value={typography.sectionHeadingSize || 12.5}
            onChange={(val) => updateTypography({ sectionHeadingSize: val })}
            min={10}
            max={18}
            step={0.5}
            unit="pt"
            presets={[11, 12, 12.5, 13, 14]}
          />

          <NumberStepper
            label="Body & Bullets Font Size"
            value={typography.bodyFontSize || 10}
            onChange={(val) => updateTypography({ bodyFontSize: val })}
            min={8}
            max={14}
            step={0.5}
            unit="pt"
            presets={[9, 9.5, 10, 10.5, 11]}
          />

          <NumberStepper
            label="Line Height (Text Spacing)"
            value={typography.lineHeight || 1.35}
            onChange={(val) => updateTypography({ lineHeight: val })}
            min={1.1}
            max={1.8}
            step={0.05}
            presets={[1.2, 1.3, 1.35, 1.4, 1.5]}
          />
        </div>
      </div>

      {/* 2. Spacing & Page Margins (Separated Top & Bottom) */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-4 shadow-xs">
        <div className="flex items-center gap-2 text-indigo-700 font-bold text-sm border-b border-slate-100 pb-2">
          <Layout className="w-4 h-4" />
          <span>Margins & Document Gaps</span>
        </div>

        <div className="grid grid-cols-1 gap-3">
          <NumberStepper
            label="Top Margin (Header Spacing)"
            value={spacing?.pageMarginTop || spacing?.pageMarginY || 24}
            onChange={(val) => updateSpacing({ pageMarginTop: val, pageMarginY: val })}
            min={10}
            max={60}
            step={2}
            unit="px"
            presets={[16, 20, 24, 30, 36]}
          />

          <NumberStepper
            label="Bottom Margin (Page End Spacing)"
            value={spacing?.pageMarginBottom || spacing?.pageMarginY || 24}
            onChange={(val) => updateSpacing({ pageMarginBottom: val })}
            min={10}
            max={60}
            step={2}
            unit="px"
            presets={[16, 20, 24, 30, 36]}
          />

          <NumberStepper
            label="Horizontal Margin (Left & Right)"
            value={spacing?.pageMarginX || 36}
            onChange={(val) => updateSpacing({ pageMarginX: val })}
            min={16}
            max={64}
            step={2}
            unit="px"
            presets={[24, 32, 36, 40, 48]}
          />

          <NumberStepper
            label="Gap Between Major Sections"
            value={spacing?.sectionGap || 12}
            onChange={(val) => updateSpacing({ sectionGap: val })}
            min={4}
            max={28}
            step={1}
            unit="px"
            presets={[8, 10, 12, 14, 16]}
          />

          <NumberStepper
            label="Gap Between Items & Bullets"
            value={spacing?.itemGap || 6}
            onChange={(val) => updateSpacing({ itemGap: val })}
            min={2}
            max={16}
            step={1}
            unit="px"
            presets={[4, 6, 8, 10]}
          />
        </div>
      </div>

      {/* 3. Section Reordering (Live Updates Canvas) */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div className="flex items-center gap-2 text-indigo-700 font-bold text-sm">
            <Palette className="w-4 h-4" />
            <span>Section Hierarchy & Order</span>
          </div>
        </div>

        <p className="text-xs text-slate-500">
          Reorder sections using the up and down arrows. Changes immediately shift sections on the live A4 canvas.
        </p>

        <div className="space-y-1.5">
          {sectionOrder.map((sectionKey, idx) => {
            const label = sectionLabels[sectionKey] || (sectionKey.startsWith("custom-") ? "Custom Section" : sectionKey);
            return (
              <div
                key={sectionKey}
                className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between text-xs hover:border-slate-300 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px] font-mono font-bold">
                    {idx + 1}
                  </span>
                  <span className="font-semibold text-slate-800">{label}</span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => reorderSections(idx, idx - 1)}
                    disabled={idx === 0}
                    className="p-1 rounded text-slate-500 hover:text-indigo-600 hover:bg-slate-200 disabled:opacity-30 transition-colors"
                    title="Move Up"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => reorderSections(idx, idx + 1)}
                    disabled={idx === sectionOrder.length - 1}
                    className="p-1 rounded text-slate-500 hover:text-indigo-600 hover:bg-slate-200 disabled:opacity-30 transition-colors"
                    title="Move Down"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="pt-2 border-t border-slate-100 flex justify-end">
          <button
            onClick={() => {
              updateTypography({
                fontFamily: "Merriweather",
                headerFontSize: 14,
                sectionHeadingSize: 12.5,
                bodyFontSize: 10,
                lineHeight: 1.35,
              });
              updateSpacing({
                pageMarginX: 36,
                pageMarginY: 24,
                pageMarginTop: 24,
                pageMarginBottom: 24,
                sectionGap: 12,
                itemGap: 6,
              });
            }}
            className="px-3 py-1.5 text-xs text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-1.5 transition-colors font-medium"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset All Styles to Defaults
          </button>
        </div>
      </div>
    </div>
  );
};
