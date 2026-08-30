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
    updateOtherExperience,
    toggleOtherExperienceVisibility,
    addOtherExperience,
    deleteOtherExperience,
    updateProject,
    toggleProjectVisibility,
    addProject,
    deleteProject,
    toggleSkillCategoryVisibility,
    updateSkillCategory,
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

      {/* 4. Professional Experience (Other Experiences) */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <button
          onClick={() => toggleAccordion("experiences")}
          className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50 text-left transition-colors"
        >
          <div className="flex items-center gap-2 font-semibold text-sm text-slate-800">
            <Briefcase className="w-4 h-4 text-indigo-600" />
            <span>Other Experiences ({resume.other_experiences.length})</span>
          </div>
          {expandedSection === "experiences" ? (
            <ChevronUp className="w-4 h-4 text-slate-500" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-500" />
          )}
        </button>

        {expandedSection === "experiences" && (
          <div className="p-4 pt-0 space-y-3 border-t border-slate-100 mt-1">
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
            <p className="text-[11px] text-slate-500">
              Toggle eye icon to show/hide projects on your resume, edit titles/links, or let AI rank and select top projects automatically.
            </p>

            {resume.projects.map((proj, idx) => (
              <div
                key={proj.id}
                className={`p-3 rounded-xl border space-y-2 transition-all ${
                  proj.visible
                    ? "bg-white border-indigo-300 text-slate-900 shadow-xs"
                    : "bg-slate-50/60 border-slate-200 opacity-60 text-slate-500"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-mono text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded font-bold border border-indigo-200">
                    #{idx + 1}
                  </span>
                  <input
                    type="text"
                    value={proj.title}
                    onChange={(e) => updateProject(proj.id, { title: e.target.value })}
                    className="flex-1 px-2.5 py-1 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:outline-none focus:border-indigo-500"
                  />
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => toggleProjectVisibility(proj.id)}
                      className={`p-1 rounded ${proj.visible ? "text-indigo-600" : "text-slate-400"}`}
                      title={proj.visible ? "Active on resume" : "Hidden"}
                    >
                      {proj.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      onClick={() => deleteProject(proj.id)}
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
            ))}
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
            {Object.entries(resume.skills_categories).map(([key, cat]) => (
              <div
                key={cat.id}
                className={`p-3 rounded-xl border text-xs space-y-2 ${
                  cat.visible
                    ? "bg-white border-indigo-300 text-slate-900 shadow-xs"
                    : "bg-slate-50 border-slate-200 text-slate-500 opacity-60"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-indigo-700">
                    {cat.name} {cat.isVariable && <span className="text-[10px] text-slate-500">(Variable)</span>}
                  </span>
                  <button
                    onClick={() => toggleSkillCategoryVisibility(key)}
                    className={`p-1 rounded ${cat.visible ? "text-indigo-600" : "text-slate-400"}`}
                  >
                    {cat.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  </button>
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
