"use client";

import React, { useState } from "react";
import { useResumeStore } from "@/lib/store";
import {
  User,
  FileText,
  GraduationCap,
  Briefcase,
  FolderGit2,
  Cpu,
  Trophy,
  Globe,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  Plus,
  Trash2,
  ExternalLink,
  Layers,
  Sparkles,
  X,
} from "lucide-react";
import { TipTapInput } from "@/components/common/TipTapInput";

export const EditorSidebar: React.FC = () => {
  const {
    resume,
    updatePersonalInfo,
    updateSummary,
    updateEducation,
    toggleEducationVisibility,
    addEducation,
    deleteEducation,
    setHashMovePreset,
    updateHashMoveInfo,
    updateHashMoveBullets,
    addHashMoveBullet,
    removeHashMoveBullet,
    updateOtherExperience,
    toggleOtherExperienceVisibility,
    addOtherExperience,
    deleteOtherExperience,
    updateProject,
    toggleProjectVisibility,
    addProject,
    deleteProject,
    moveProject,
    toggleProjectAiInclusion,
    toggleSkillCategoryVisibility,
    updateSkillCategory,
    addSkillCategory,
    deleteSkillCategory,
    updateAwards,
    addAwardItem,
    removeAwardItem,
    updateAwardItem,
    toggleAwardItem,
    updateLanguages,
    addCustomSection,
    updateCustomSection,
    deleteCustomSection,
    toggleCustomSection,
  } = useResumeStore();

  const [expandedSection, setExpandedSection] = useState<string>("summary");

  const [newAwardTitle, setNewAwardTitle] = useState("");
  const [newCustomTitle, setNewCustomTitle] = useState("");
  const [newCustomContent, setNewCustomContent] = useState("");

  const [isAddingSkill, setIsAddingSkill] = useState(false);
  const [newSkillName, setNewSkillName] = useState("");
  const [newSkillContent, setNewSkillContent] = useState("");
  const [newSkillIsVariable, setNewSkillIsVariable] = useState(false);

  const [isAddingProject, setIsAddingProject] = useState(false);
  const [newProjTitle, setNewProjTitle] = useState("");
  const [newProjDesc, setNewProjDesc] = useState("");
  const [newProjUrl, setNewProjUrl] = useState("");
  const [newProjTags, setNewProjTags] = useState("");
  const [newProjShowIcon, setNewProjShowIcon] = useState(true);
  const [newProjEnabledForAi, setNewProjEnabledForAi] = useState(true);

  const toggleAccordion = (section: string) => {
    setExpandedSection(expandedSection === section ? "" : section);
  };

  const handleAddEducation = () => {
    const id = "edu-" + Date.now();
    addEducation({
      id,
      degree: "Degree Title / Specialization",
      institution: "University / Institution Name",
      grade: "Grade / GPA",
      period: "2024 – Present",
      electives: "",
      visible: true,
    });
  };

  const handleAddExperience = () => {
    const id = "exp-" + Date.now();
    addOtherExperience({
      id,
      role: "Job Title",
      company: "Company Name",
      period: "MM/YYYY – MM/YYYY",
      visible: true,
      bullets: [
        "Delivered impactful results by optimizing workflows with **Python and SQL**.",
        "Collaborated with cross-functional teams to drive key performance metrics.",
      ],
    });
  };

  const handleAddAward = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAwardTitle.trim()) return;
    addAwardItem(newAwardTitle.trim());
    setNewAwardTitle("");
  };

  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomTitle.trim()) return;
    addCustomSection({
      id: "sec-" + Date.now(),
      title: newCustomTitle.trim(),
      content: newCustomContent.trim() || "Section content details...",
      visible: true,
    });
    setNewCustomTitle("");
    setNewCustomContent("");
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50">
      {/* 1. Personal Info */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <button
          onClick={() => toggleAccordion("personal")}
          className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50 text-left transition-colors"
        >
          <div className="flex items-center gap-2 font-semibold text-sm text-slate-800">
            <User className="w-4 h-4 text-indigo-600" />
            <span>Header & Contact Details</span>
          </div>
          {expandedSection === "personal" ? (
            <ChevronUp className="w-4 h-4 text-slate-500" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-500" />
          )}
        </button>

        {expandedSection === "personal" && (
          <div className="p-4 pt-0 space-y-3 border-t border-slate-100 mt-1">
            <div>
              <label className="text-xs text-slate-600 font-medium">Full Name</label>
              <input
                type="text"
                value={resume.personal.fullName}
                onChange={(e) => updatePersonalInfo({ fullName: e.target.value })}
                className="w-full mt-1 px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-indigo-500 font-medium"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-slate-600 font-medium">Email</label>
                <input
                  type="email"
                  value={resume.personal.email}
                  onChange={(e) => updatePersonalInfo({ email: e.target.value })}
                  className="w-full mt-1 px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="text-xs text-slate-600 font-medium">Phone</label>
                <input
                  type="text"
                  value={resume.personal.phone}
                  onChange={(e) => updatePersonalInfo({ phone: e.target.value })}
                  className="w-full mt-1 px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-slate-600 font-medium">Location</label>
                <input
                  type="text"
                  value={resume.personal.location}
                  onChange={(e) => updatePersonalInfo({ location: e.target.value })}
                  className="w-full mt-1 px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="text-xs text-slate-600 font-medium">Portfolio Label</label>
                <input
                  type="text"
                  value={resume.personal.portfolioLabel || "Portfolio Link"}
                  onChange={(e) => updatePersonalInfo({ portfolioLabel: e.target.value })}
                  className="w-full mt-1 px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="space-y-1 pt-1">
              <label className="text-xs text-slate-600 font-medium">Portfolio Target URL</label>
              <input
                type="text"
                value={resume.personal.portfolioUrl}
                onChange={(e) => updatePersonalInfo({ portfolioUrl: e.target.value })}
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
              />
              <label className="flex items-center gap-1.5 text-[11px] text-slate-600 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={resume.personal.showPortfolioIcon ?? true}
                  onChange={(e) => updatePersonalInfo({ showPortfolioIcon: e.target.checked })}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-0"
                />
                <span>Show external link icon next to portfolio link</span>
              </label>
            </div>
          </div>
        )}
      </div>

      {/* 2. Profile Summary */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <button
          onClick={() => toggleAccordion("summary")}
          className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50 text-left transition-colors"
        >
          <div className="flex items-center gap-2 font-semibold text-sm text-slate-800">
            <FileText className="w-4 h-4 text-indigo-600" />
            <span>Profile Summary (Editable & AI Target)</span>
          </div>
          {expandedSection === "summary" ? (
            <ChevronUp className="w-4 h-4 text-slate-500" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-500" />
          )}
        </button>

        {expandedSection === "summary" && (
          <div className="p-4 pt-0 space-y-4 border-t border-slate-100 mt-1">
            <TipTapInput
              label="Bio Narrative (Select text and use B/I/Link toolbar)"
              value={resume.summary.content}
              onChange={(val) => updateSummary(val)}
              rows={6}
            />

            <TipTapInput
              label="Mandatory Closing Sentence (Tailored for Target Role & Team)"
              value={resume.summary.closingLine}
              onChange={(val) => updateSummary(resume.summary.content, val)}
              rows={2}
            />
          </div>
        )}
      </div>

      {/* 3. Education */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <button
          onClick={() => toggleAccordion("education")}
          className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50 text-left transition-colors"
        >
          <div className="flex items-center gap-2 font-semibold text-sm text-slate-800">
            <GraduationCap className="w-4 h-4 text-indigo-600" />
            <span>Education ({resume.education.length})</span>
          </div>
          {expandedSection === "education" ? (
            <ChevronUp className="w-4 h-4 text-slate-500" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-500" />
          )}
        </button>

        {expandedSection === "education" && (
          <div className="p-4 pt-0 space-y-3 border-t border-slate-100 mt-1">
            {resume.education.map((edu) => (
              <div key={edu.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <input
                    type="text"
                    value={edu.degree}
                    onChange={(e) => updateEducation(edu.id, { degree: e.target.value })}
                    className="bg-transparent font-semibold text-xs text-slate-900 focus:outline-none focus:border-b border-indigo-500 w-2/3"
                  />
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => toggleEducationVisibility(edu.id)}
                      className={`p-1 rounded ${edu.visible ? "text-indigo-600" : "text-slate-400"}`}
                      title={edu.visible ? "Visible on resume" : "Hidden"}
                    >
                      {edu.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      onClick={() => deleteEducation(edu.id)}
                      className="p-1 text-slate-400 hover:text-red-600"
                      title="Delete education entry"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <input
                    type="text"
                    value={edu.institution}
                    onChange={(e) => updateEducation(edu.id, { institution: e.target.value })}
                    className="px-2 py-1 bg-white border border-slate-300 rounded text-slate-800"
                    placeholder="Institution"
                  />
                  <input
                    type="text"
                    value={edu.period}
                    onChange={(e) => updateEducation(edu.id, { period: e.target.value })}
                    className="px-2 py-1 bg-white border border-slate-300 rounded text-slate-800"
                    placeholder="Period"
                  />
                </div>

                <input
                  type="text"
                  value={edu.grade}
                  onChange={(e) => updateEducation(edu.id, { grade: e.target.value })}
                  className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-xs text-slate-800"
                  placeholder="Grade / Honors (e.g. Dean's List | 3.74/4.00)"
                />

                {edu.electives !== undefined && (
                  <TipTapInput
                    label="Electives"
                    value={edu.electives}
                    onChange={(val) => updateEducation(edu.id, { electives: val })}
                    rows={2}
                    placeholder="Relevant coursework..."
                  />
                )}
              </div>
            ))}

            <button
              onClick={handleAddEducation}
              className="w-full py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Education Entry
            </button>
          </div>
        )}
      </div>

      {/* 4. Professional Experience (HashMove & Other Experiences) */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <button
          onClick={() => toggleAccordion("experiences")}
          className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50 text-left transition-colors"
        >
          <div className="flex items-center gap-2 font-semibold text-sm text-slate-800">
            <Briefcase className="w-4 h-4 text-indigo-600" />
            <span>Experience ({1 + resume.other_experiences.length})</span>
          </div>
          {expandedSection === "experiences" ? (
            <ChevronUp className="w-4 h-4 text-slate-500" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-500" />
          )}
        </button>

        {expandedSection === "experiences" && (
          <div className="p-4 pt-0 space-y-4 border-t border-slate-100 mt-1">
            {/* HashMove (Primary Role) */}
            {resume.experience_presets?.hashmove && (() => {
              const hm = resume.experience_presets.hashmove;
              const activeKey = hm.activePreset;
              const activePreset = hm.presets?.[activeKey] || (hm.presets ? Object.values(hm.presets)[0] : null);

              return (
                <div className="p-3.5 bg-gradient-to-br from-indigo-50/50 via-white to-slate-50 border-2 border-indigo-200/80 rounded-xl space-y-3 shadow-xs">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-indigo-100/80 pb-2">
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="px-1.5 py-0.5 bg-indigo-600 text-white font-bold text-[9px] rounded uppercase tracking-wider">
                        Primary
                      </span>
                      <span className="font-bold text-xs text-indigo-950">HashMove</span>
                    </div>
                    <div className="flex items-center gap-1.5 min-w-0 flex-1 justify-end">
                      <span className="text-[11px] font-medium text-slate-500 shrink-0">Preset:</span>
                      <select
                        value={activeKey}
                        onChange={(e) => setHashMovePreset(e.target.value)}
                        className="text-xs bg-white border border-indigo-200 rounded-md px-2 py-1 font-semibold text-indigo-700 focus:outline-none focus:border-indigo-500 shadow-2xs max-w-[190px] sm:max-w-[220px] truncate"
                        title={activePreset?.title || activeKey}
                      >
                        {Object.entries(hm.presets || {}).map(([key, p]) => (
                          <option key={key} value={key} title={p.title || p.label || key}>
                            {p.title || p.label || key}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <label className="text-[10px] font-semibold text-slate-600 block mb-0.5">Role / Title</label>
                      <input
                        type="text"
                        value={hm.title || ""}
                        onChange={(e) => updateHashMoveInfo({ title: e.target.value })}
                        className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-slate-900 font-medium"
                        placeholder="Product Marketing Analyst"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-semibold text-slate-600 block mb-0.5">Company</label>
                      <input
                        type="text"
                        value={hm.company || ""}
                        onChange={(e) => updateHashMoveInfo({ company: e.target.value })}
                        className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-slate-900 font-medium"
                        placeholder="HashMove"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <label className="text-[10px] font-semibold text-slate-600 block mb-0.5">Period</label>
                      <input
                        type="text"
                        value={hm.period || ""}
                        onChange={(e) => updateHashMoveInfo({ period: e.target.value })}
                        className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-slate-800"
                        placeholder="10/2023 – 04/2025"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-semibold text-slate-600 block mb-0.5">Industry / Subtitle</label>
                      <input
                        type="text"
                        value={hm.business_type || ""}
                        onChange={(e) => updateHashMoveInfo({ business_type: e.target.value })}
                        className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-slate-800"
                        placeholder="B2B SaaS Logistics ERP"
                      />
                    </div>
                  </div>

                  {activePreset && (
                    <div className="space-y-2 pt-1 border-t border-indigo-100/60">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-bold text-slate-700">
                          Preset Bullets ({activePreset.bullets?.length || 0})
                        </label>
                        <button
                          type="button"
                          onClick={() => addHashMoveBullet(activeKey, "Accelerated key initiatives driving business growth and efficiency.")}
                          className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                        >
                          <Plus className="w-3 h-3" /> Add Bullet
                        </button>
                      </div>

                      {activePreset.bullets?.map((bullet, bIdx) => (
                        <div key={bIdx} className="space-y-1 bg-white p-2 rounded-lg border border-slate-200 shadow-2xs">
                          <div className="flex items-center justify-between pb-1">
                            <span className="text-[10px] font-mono font-medium text-slate-600">Bullet #{bIdx + 1}</span>
                            <button
                              type="button"
                              onClick={() => removeHashMoveBullet(activeKey, bIdx)}
                              className="text-slate-400 hover:text-red-600 p-0.5"
                              title="Remove bullet"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                          <TipTapInput
                            value={bullet}
                            onChange={(newVal) => {
                              const newB = [...activePreset.bullets];
                              newB[bIdx] = newVal;
                              updateHashMoveBullets(activeKey, newB);
                            }}
                            rows={2}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Other Experiences */}
            <div className="pt-1 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">
                  Other Experiences ({resume.other_experiences.length})
                </span>
              </div>

              {resume.other_experiences.map((exp) => (
                <div key={exp.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <input
                      type="text"
                      value={exp.role}
                      onChange={(e) => updateOtherExperience(exp.id, { role: e.target.value })}
                      className="bg-transparent font-semibold text-xs text-slate-900 focus:outline-none focus:border-b border-indigo-500 w-1/2"
                    />
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => toggleOtherExperienceVisibility(exp.id)}
                        className={`p-1 rounded ${exp.visible ? "text-indigo-600" : "text-slate-400"}`}
                        title={exp.visible ? "Visible on resume" : "Hidden"}
                      >
                        {exp.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        onClick={() => deleteOtherExperience(exp.id)}
                        className="p-1 text-slate-400 hover:text-red-600"
                        title="Delete experience entry"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <input
                      type="text"
                      value={exp.company}
                      onChange={(e) => updateOtherExperience(exp.id, { company: e.target.value })}
                      className="px-2 py-1 bg-white border border-slate-300 rounded text-slate-800"
                      placeholder="Company"
                    />
                    <input
                      type="text"
                      value={exp.period}
                      onChange={(e) => updateOtherExperience(exp.id, { period: e.target.value })}
                      className="px-2 py-1 bg-white border border-slate-300 rounded text-slate-800"
                      placeholder="Period"
                    />
                  </div>

                  <div className="space-y-2 pt-1">
                    <label className="text-[11px] text-slate-600 font-medium">Bullet Points</label>
                    {exp.bullets.map((b, bIdx) => (
                      <div key={bIdx} className="space-y-1">
                        <TipTapInput
                          value={b}
                          onChange={(newVal) => {
                            const newB = [...exp.bullets];
                            newB[bIdx] = newVal;
                            updateOtherExperience(exp.id, { bullets: newB });
                          }}
                          rows={2}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              <button
                onClick={handleAddExperience}
                className="w-full py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Other Experience Entry
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 5. Projects Pool Selection */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <button
          onClick={() => toggleAccordion("projects")}
          className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50 text-left transition-colors"
        >
          <div className="flex items-center gap-2 font-semibold text-sm text-slate-800">
            <FolderGit2 className="w-4 h-4 text-indigo-600" />
            <span>
              Active Projects ({resume.projects.filter((p) => p.visible).length}/{resume.projects.length})
            </span>
          </div>
          {expandedSection === "projects" ? (
            <ChevronUp className="w-4 h-4 text-slate-500" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-500" />
          )}
        </button>

        {expandedSection === "projects" && (
          <div className="p-4 pt-0 space-y-3 border-t border-slate-100 mt-1">
            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] font-medium text-slate-500">
                Active in AI ({resume.projects.filter((p) => p.enabledForAi !== false && p.enabled !== false).length}/{resume.projects.length})
              </span>
              <button
                type="button"
                onClick={() => setIsAddingProject(!isAddingProject)}
                className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-lg transition-colors shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Project</span>
              </button>
            </div>

            {/* Add New Project Form */}
            {isAddingProject && (
              <div className="p-3 bg-gradient-to-br from-indigo-50/50 via-white to-slate-50 border-2 border-indigo-200 rounded-xl space-y-2.5 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-950">New Project Entry</span>
                  <button
                    type="button"
                    onClick={() => setIsAddingProject(false)}
                    className="text-slate-400 hover:text-slate-600 p-0.5"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div>
                  <label className="text-[10px] font-semibold text-slate-600 block mb-0.5">Project Title</label>
                  <input
                    type="text"
                    value={newProjTitle}
                    onChange={(e) => setNewProjTitle(e.target.value)}
                    placeholder="e.g. Are Songs Shrinking? (Spotify)"
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-900 text-xs focus:outline-none focus:border-indigo-500"
                    autoFocus
                  />
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <label className="text-[10px] font-semibold text-slate-600 block mb-0.5">Project Showcase URL</label>
                    <input
                      type="text"
                      value={newProjUrl}
                      onChange={(e) => setNewProjUrl(e.target.value)}
                      placeholder="https://..."
                      className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-slate-800 text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-slate-600 block mb-0.5">Tags (comma separated)</label>
                    <input
                      type="text"
                      value={newProjTags}
                      onChange={(e) => setNewProjTags(e.target.value)}
                      placeholder="Python, Regression, Spotify"
                      className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-slate-800 text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-semibold text-slate-600 block mb-0.5">Description & Highlights</label>
                  <TipTapInput
                    value={newProjDesc}
                    onChange={(val) => setNewProjDesc(val)}
                    placeholder="Regression analysis of 3,600 songs, how Spotify shortened songs by 17%..."
                    minHeight="48px"
                  />
                </div>

                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    onClick={() => setNewProjEnabledForAi(!newProjEnabledForAi)}
                    className={`px-2 py-1 text-[10px] font-semibold rounded-lg border transition-all flex items-center gap-1.5 ${
                      newProjEnabledForAi
                        ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                        : "bg-amber-50 border-amber-200 text-amber-800"
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${newProjEnabledForAi ? "bg-emerald-500" : "bg-amber-500"}`} />
                    <span>{newProjEnabledForAi ? "AI Pool: Included" : "AI Pool: Excluded"}</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsAddingProject(false)}
                      className="px-2.5 py-1 text-xs text-slate-600 hover:text-slate-800"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={!newProjTitle.trim()}
                      onClick={() => {
                        if (!newProjTitle.trim()) return;
                        const id = "proj-" + Date.now();
                        const tagsArray = newProjTags
                          ? newProjTags.split(",").map((t) => t.trim()).filter(Boolean)
                          : ["Portfolio"];
                        addProject({
                          id,
                          title: newProjTitle.trim(),
                          description: newProjDesc.trim() || "Project overview details...",
                          url: newProjUrl.trim() || "https://usmanzakria.com",
                          showIcon: newProjShowIcon,
                          visible: true,
                          defaultOrder: resume.projects.length + 1,
                          tags: tagsArray,
                          enabledForAi: newProjEnabledForAi,
                          enabled: newProjEnabledForAi,
                        });
                        setNewProjTitle("");
                        setNewProjDesc("");
                        setNewProjUrl("");
                        setNewProjTags("");
                        setNewProjEnabledForAi(true);
                        setIsAddingProject(false);
                      }}
                      className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg text-xs font-semibold shadow-xs"
                    >
                      Save Project
                    </button>
                  </div>
                </div>
              </div>
            )}

            {resume.projects.map((proj, idx) => {
              const isAiActive = proj.enabledForAi !== false && proj.enabled !== false;

              return (
                <div
                  key={proj.id}
                  className={`p-3 rounded-xl border space-y-2.5 transition-all ${
                    !isAiActive
                      ? "bg-amber-50/40 border-amber-200/80 text-slate-700 opacity-80"
                      : proj.visible
                      ? "bg-white border-indigo-300 text-slate-900 shadow-xs"
                      : "bg-slate-50/60 border-slate-200 opacity-60 text-slate-500"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-mono text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded font-bold border border-indigo-200">
                      #{idx + 1}
                    </span>
                    <div className="flex items-center gap-0.5">
                      <button
                        onClick={() => moveProject(proj.id, "up")}
                        disabled={idx === 0}
                        className="p-1 text-slate-400 hover:text-indigo-600 disabled:opacity-30 disabled:hover:text-slate-400"
                        title="Move Up"
                      >
                        <ChevronUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => moveProject(proj.id, "down")}
                        disabled={idx === resume.projects.length - 1}
                        className="p-1 text-slate-400 hover:text-indigo-600 disabled:opacity-30 disabled:hover:text-slate-400"
                        title="Move Down"
                      >
                        <ChevronDown className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <input
                      type="text"
                      value={proj.title}
                      onChange={(e) => updateProject(proj.id, { title: e.target.value })}
                      className="flex-1 px-2.5 py-1 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:outline-none focus:border-indigo-500"
                    />

                    {/* AI Consideration Set Toggle */}
                    <button
                      type="button"
                      onClick={() => toggleProjectAiInclusion(proj.id)}
                      className={`px-2 py-0.5 text-[10px] font-semibold rounded-full border transition-all flex items-center gap-1 shrink-0 ${
                        isAiActive
                          ? "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100"
                          : "bg-amber-100 border-amber-300 text-amber-800 hover:bg-amber-200"
                      }`}
                      title={
                        isAiActive
                          ? "Active in AI consideration set. Click to disable from AI consideration."
                          : "Excluded from AI consideration (kept for history). Click to re-enable for AI."
                      }
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${isAiActive ? "bg-emerald-500" : "bg-amber-500"}`} />
                      <span>{isAiActive ? "AI: Active" : "AI: Excluded"}</span>
                    </button>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => toggleProjectVisibility(proj.id)}
                        className={`p-1 rounded ${proj.visible ? "text-indigo-600" : "text-slate-400"}`}
                        title={proj.visible ? "Active on resume canvas" : "Hidden from canvas"}
                      >
                        {proj.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Delete project "${proj.title}"?`)) {
                            deleteProject(proj.id);
                          }
                        }}
                        className="p-1 text-slate-400 hover:text-red-600"
                        title="Delete Project"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <input
                      type="text"
                      value={proj.url || ""}
                      onChange={(e) => updateProject(proj.id, { url: e.target.value })}
                      placeholder="Project URL..."
                      className="px-2 py-1 bg-white border border-slate-300 rounded text-slate-800"
                    />
                    <label className="flex items-center gap-1.5 text-slate-600 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={proj.showIcon ?? true}
                        onChange={(e) => updateProject(proj.id, { showIcon: e.target.checked })}
                        className="rounded border-slate-300 text-indigo-600 focus:ring-0"
                      />
                      <span>Show Link Icon</span>
                    </label>
                  </div>

                  <TipTapInput
                    value={proj.description}
                    onChange={(val) => updateProject(proj.id, { description: val })}
                    rows={2}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 6. Skills & Certifications */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <button
          onClick={() => toggleAccordion("skills")}
          className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50 text-left transition-colors"
        >
          <div className="flex items-center gap-2 font-semibold text-sm text-slate-800">
            <Cpu className="w-4 h-4 text-indigo-600" />
            <span>Skills & Certifications</span>
          </div>
          {expandedSection === "skills" ? (
            <ChevronUp className="w-4 h-4 text-slate-500" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-500" />
          )}
        </button>

        {expandedSection === "skills" && (
          <div className="p-4 pt-0 space-y-3 border-t border-slate-100 mt-1">
            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] font-medium text-slate-500">
                Categories ({Object.keys(resume.skills_categories || {}).length})
              </span>
              <button
                type="button"
                onClick={() => setIsAddingSkill(!isAddingSkill)}
                className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-lg transition-colors shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Category</span>
              </button>
            </div>

            {/* Add New Skill Category Form */}
            {isAddingSkill && (
              <div className="p-3 bg-gradient-to-br from-indigo-50/50 via-white to-slate-50 border-2 border-indigo-200 rounded-xl space-y-2.5 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-950">New Skill Category</span>
                  <button
                    type="button"
                    onClick={() => setIsAddingSkill(false)}
                    className="text-slate-400 hover:text-slate-600 p-0.5"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div>
                  <label className="text-[10px] font-semibold text-slate-600 block mb-0.5">Category Name</label>
                  <input
                    type="text"
                    value={newSkillName}
                    onChange={(e) => setNewSkillName(e.target.value)}
                    placeholder="e.g. Cloud & Infrastructure"
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-900 text-xs focus:outline-none focus:border-indigo-500"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="text-[10px] font-semibold text-slate-600 block mb-1">Category Role / Mode</label>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      type="button"
                      onClick={() => setNewSkillIsVariable(false)}
                      className={`px-2 py-1.5 rounded-lg border text-left text-[11px] transition-all ${
                        !newSkillIsVariable
                          ? "bg-white border-indigo-600 text-indigo-950 font-semibold shadow-xs"
                          : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-white"
                      }`}
                    >
                      <div className="flex items-center gap-1">
                        <span className={`w-1.5 h-1.5 rounded-full ${!newSkillIsVariable ? "bg-indigo-600" : "bg-slate-400"}`} />
                        <span>Standard</span>
                      </div>
                      <p className="text-[9px] text-slate-500 mt-0.5 font-normal">Always included on resume</p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setNewSkillIsVariable(true)}
                      className={`px-2 py-1.5 rounded-lg border text-left text-[11px] transition-all ${
                        newSkillIsVariable
                          ? "bg-white border-purple-600 text-purple-950 font-semibold shadow-xs"
                          : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-white"
                      }`}
                    >
                      <div className="flex items-center gap-1">
                        <span className={`w-1.5 h-1.5 rounded-full ${newSkillIsVariable ? "bg-purple-600" : "bg-slate-400"}`} />
                        <span>Variable (AI)</span>
                      </div>
                      <p className="text-[9px] text-slate-500 mt-0.5 font-normal">Swapped per target JD</p>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-semibold text-slate-600 block mb-0.5">Skills Content</label>
                  <TipTapInput
                    value={newSkillContent}
                    onChange={(val) => setNewSkillContent(val)}
                    placeholder="Enter skills separated by commas, or use markdown links..."
                    minHeight="48px"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsAddingSkill(false)}
                    className="px-2.5 py-1 text-xs text-slate-600 hover:text-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={!newSkillName.trim()}
                    onClick={() => {
                      if (!newSkillName.trim()) return;
                      const key = newSkillName.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "") || `skill_${Date.now()}`;
                      addSkillCategory(key, {
                        id: `skill-${Date.now()}`,
                        name: newSkillName.trim(),
                        content: newSkillContent.trim(),
                        visible: true,
                        isVariable: newSkillIsVariable,
                      });
                      setNewSkillName("");
                      setNewSkillContent("");
                      setNewSkillIsVariable(false);
                      setIsAddingSkill(false);
                    }}
                    className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg text-xs font-semibold shadow-xs"
                  >
                    Save Category
                  </button>
                </div>
              </div>
            )}

            {Object.entries(resume.skills_categories || {}).map(([key, cat]) => (
              <div
                key={cat.id || key}
                className={`p-3 rounded-xl border text-xs space-y-2.5 transition-all ${
                  cat.visible
                    ? "bg-white border-indigo-300 text-slate-900 shadow-xs"
                    : "bg-slate-50 border-slate-200 text-slate-500 opacity-70"
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-1.5 border-b border-slate-100 pb-1.5">
                  <input
                    type="text"
                    value={cat.name}
                    onChange={(e) => updateSkillCategory(key, { name: e.target.value })}
                    className="font-semibold text-xs text-indigo-950 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-indigo-500 focus:bg-white px-1 py-0.5 rounded focus:outline-none flex-1 min-w-[120px]"
                    title="Edit category name"
                  />

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => updateSkillCategory(key, { isVariable: !cat.isVariable })}
                      className={`px-2 py-0.5 text-[10px] font-semibold rounded-full border transition-all flex items-center gap-1 ${
                        cat.isVariable
                          ? "bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100"
                          : "bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200"
                      }`}
                      title={cat.isVariable ? "Variable (AI chooses dynamically per target JD). Click to make Standard." : "Standard (Always included on resume). Click to make Variable."}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${cat.isVariable ? "bg-purple-500" : "bg-slate-400"}`} />
                      <span>{cat.isVariable ? "Variable (AI)" : "Standard"}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => toggleSkillCategoryVisibility(key)}
                      className={`p-1 rounded transition-colors ${cat.visible ? "text-indigo-600 hover:bg-indigo-50" : "text-slate-400 hover:bg-slate-100"}`}
                      title={cat.visible ? "Hide from resume" : "Show on resume"}
                    >
                      {cat.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`Are you sure you want to delete "${cat.name}"?`)) {
                          deleteSkillCategory(key);
                        }
                      }}
                      className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                      title="Delete category"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <TipTapInput
                  value={cat.content}
                  onChange={(val) => updateSkillCategory(key, { content: val })}
                  rows={2}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 7. Awards Items */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <button
          onClick={() => toggleAccordion("awards")}
          className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50 text-left transition-colors"
        >
          <div className="flex items-center gap-2 font-semibold text-sm text-slate-800">
            <Trophy className="w-4 h-4 text-indigo-600" />
            <span>Awards & Accolades ({resume.awards.items?.length || 0})</span>
          </div>
          {expandedSection === "awards" ? (
            <ChevronUp className="w-4 h-4 text-slate-500" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-500" />
          )}
        </button>

        {expandedSection === "awards" && (
          <div className="p-4 pt-0 space-y-3 border-t border-slate-100 mt-1">
            <div className="space-y-2">
              {(resume.awards.items || []).map((award) => (
                <div
                  key={award.id}
                  className="flex items-center justify-between gap-2 p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                >
                  <input
                    type="text"
                    value={award.title}
                    onChange={(e) => updateAwardItem(award.id, e.target.value)}
                    className="flex-1 bg-transparent text-slate-800 focus:outline-none font-medium"
                  />
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => toggleAwardItem(award.id)}
                      className={`p-1 rounded ${award.visible ? "text-indigo-600" : "text-slate-400"}`}
                    >
                      {award.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      onClick={() => removeAwardItem(award.id)}
                      className="p-1 text-slate-400 hover:text-red-600"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Add Award Item */}
            <form onSubmit={handleAddAward} className="flex gap-2 pt-1">
              <input
                type="text"
                placeholder="Add new award or achievement..."
                value={newAwardTitle}
                onChange={(e) => setNewAwardTitle(e.target.value)}
                className="flex-1 px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
              />
              <button
                type="submit"
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                Add
              </button>
            </form>
          </div>
        )}
      </div>

      {/* 8. Languages & Availability */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <button
          onClick={() => toggleAccordion("languages")}
          className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50 text-left transition-colors"
        >
          <div className="flex items-center gap-2 font-semibold text-sm text-slate-800">
            <Globe className="w-4 h-4 text-indigo-600" />
            <span>Languages & Availability</span>
          </div>
          {expandedSection === "languages" ? (
            <ChevronUp className="w-4 h-4 text-slate-500" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-500" />
          )}
        </button>

        {expandedSection === "languages" && (
          <div className="p-4 pt-0 space-y-3 border-t border-slate-100 mt-1">
            <TipTapInput
              label="Languages & Visa Status (Use bullet dividers •)"
              value={resume.languages_availability.content}
              onChange={(val) => updateLanguages({ content: val })}
              rows={2}
            />
          </div>
        )}
      </div>

      {/* 9. Custom Sections */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <button
          onClick={() => toggleAccordion("custom")}
          className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50 text-left transition-colors"
        >
          <div className="flex items-center gap-2 font-semibold text-sm text-slate-800">
            <Layers className="w-4 h-4 text-indigo-600" />
            <span>Custom Sections ({(resume.custom_sections || []).length})</span>
          </div>
          {expandedSection === "custom" ? (
            <ChevronUp className="w-4 h-4 text-slate-500" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-500" />
          )}
        </button>

        {expandedSection === "custom" && (
          <div className="p-4 pt-0 space-y-3 border-t border-slate-100 mt-1">
            {(resume.custom_sections || []).map((sec) => (
              <div key={sec.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <input
                    type="text"
                    value={sec.title}
                    onChange={(e) => updateCustomSection(sec.id, { title: e.target.value })}
                    className="font-bold text-xs text-slate-900 bg-transparent focus:outline-none focus:border-b border-indigo-500"
                  />
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => toggleCustomSection(sec.id)}
                      className={`p-1 rounded ${sec.visible ? "text-indigo-600" : "text-slate-400"}`}
                    >
                      {sec.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      onClick={() => deleteCustomSection(sec.id)}
                      className="p-1 text-slate-400 hover:text-red-600"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <TipTapInput
                  value={sec.content}
                  onChange={(val) => updateCustomSection(sec.id, { content: val })}
                  rows={3}
                />
              </div>
            ))}

            {/* Add Custom Section Form */}
            <form onSubmit={handleAddCustom} className="p-3 bg-white border border-slate-200 rounded-xl space-y-2 shadow-xs">
              <span className="text-[11px] font-semibold text-slate-700">Create Custom Section</span>
              <input
                type="text"
                placeholder="Section Heading (e.g., Publications / Volunteer Work)"
                value={newCustomTitle}
                onChange={(e) => setNewCustomTitle(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
              />
              <TipTapInput
                value={newCustomContent}
                onChange={setNewCustomContent}
                placeholder="Section text or bullets..."
                rows={2}
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Custom Section
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
