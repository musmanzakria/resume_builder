"use client";

import React from "react";
import { useResumeStore } from "@/lib/store";
import { ExternalLink, Mail, Phone, MapPin, Globe, FileText } from "lucide-react";
import { RichTextRenderer } from "@/components/common/RichTextRenderer";

export const ResumeCanvas: React.FC = () => {
  const { resume, previewZoom } = useResumeStore();
  const { 
    settings, 
    personal, 
    summary, 
    education, 
    experience_presets, 
    other_experiences, 
    projects, 
    skills_categories, 
    awards, 
    languages_availability,
    custom_sections = [] 
  } = resume;

  const activeHashMove = experience_presets.hashmove;
  const currentHashMovePreset = activeHashMove.presets[activeHashMove.activePreset] || Object.values(activeHashMove.presets)[0];

  const typographyStyle: React.CSSProperties = {
    fontFamily: settings?.typography?.fontFamily || "Merriweather",
    fontSize: `${settings?.typography?.bodyFontSize || 10}pt`,
    lineHeight: settings?.typography?.lineHeight || 1.35,
    color: "#111827",
  };

  const marginStyle: React.CSSProperties = {
    paddingLeft: `${settings?.spacing?.pageMarginX || 36}px`,
    paddingRight: `${settings?.spacing?.pageMarginX || 36}px`,
    paddingTop: `${settings?.spacing?.pageMarginTop || settings?.spacing?.pageMarginY || 24}px`,
    paddingBottom: `${settings?.spacing?.pageMarginBottom || settings?.spacing?.pageMarginY || 24}px`,
  };

  const sectionGap = `${settings?.spacing?.sectionGap || 12}px`;
  const itemGap = `${settings?.spacing?.itemGap || 6}px`;

  // Render individual sections dynamically
  const renderSection = (sectionKey: string) => {
    switch (sectionKey) {
      case "header":
        return (
          <div key="header" className="text-center section-block" style={{ marginBottom: sectionGap }}>
            <h1
              className="font-bold text-black tracking-tight"
              style={{ fontSize: `${settings?.typography?.headerFontSize || 14}pt` }}
            >
              {personal.fullName}
            </h1>

            {/* Clean Single-Row Contact Bar */}
            <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-slate-800 text-[9.5pt] mt-1 font-normal">
              <a
                href={`mailto:${personal.email}`}
                className="inline-flex items-center gap-1 hover:text-indigo-600 transition-colors"
              >
                <Mail className="w-3 h-3 text-slate-700 shrink-0" />
                <span>{personal.email}</span>
              </a>

              <a
                href={`tel:${personal.phone.replace(/\s+/g, "")}`}
                className="inline-flex items-center gap-1 hover:text-indigo-600 transition-colors"
              >
                <Phone className="w-3 h-3 text-slate-700 shrink-0" />
                <span>{personal.phone}</span>
              </a>

              <span className="inline-flex items-center gap-1">
                <MapPin className="w-3 h-3 text-slate-700 shrink-0" />
                <span>{personal.location}</span>
              </span>

              <a
                href={personal.portfolioUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-black font-semibold hover:text-indigo-600 underline underline-offset-2 transition-colors"
              >
                <Globe className="w-3 h-3 text-slate-700 shrink-0" />
                <span>{personal.portfolioLabel || "Portfolio Link"}</span>
                {(personal.showPortfolioIcon ?? true) && (
                  <ExternalLink className="w-2.5 h-2.5 ml-0.5 shrink-0" />
                )}
              </a>
            </div>
          </div>
        );

      case "summary":
        if (!summary.content) return null;
        return (
          <div key="summary" className="section-block" style={{ marginBottom: sectionGap }}>
            <p className="text-slate-900 leading-relaxed text-justify">
              <RichTextRenderer content={summary.content} />
            </p>
            {summary.closingLine && (
              <p className="text-black font-medium mt-1 leading-relaxed text-justify">
                <RichTextRenderer content={summary.closingLine} />
              </p>
            )}
          </div>
        );

      case "education":
        const activeEdu = education.filter((e) => e.visible);
        if (activeEdu.length === 0) return null;
        return (
          <div key="education" className="section-block" style={{ marginBottom: sectionGap }}>
            <div className="border-b border-black pb-0.5 mb-1.5">
              <h2
                className="font-bold text-black tracking-wide"
                style={{ fontSize: `${settings?.typography?.sectionHeadingSize || 12.5}pt` }}
              >
                Education
              </h2>
            </div>

            <div className="space-y-2">
              {activeEdu.map((edu) => (
                <div key={edu.id} className="item-block" style={{ marginBottom: itemGap }}>
                  <div className="flex justify-between items-baseline w-full">
                    <span className="font-bold text-black">
                      <RichTextRenderer content={edu.degree} />
                    </span>
                    <span className="text-slate-800 font-normal text-[9.5pt] shrink-0 ml-2">
                      {edu.period}
                    </span>
                  </div>
                  <div className="text-slate-800 italic text-[9.5pt]">
                    <span>{edu.institution}</span>
                    {edu.grade && <span className="not-italic"> | {edu.grade}</span>}
                  </div>
                  {edu.electives && (
                    <div className="text-slate-800 text-[9pt] mt-0.5 leading-snug">
                      <span className="font-semibold text-black">Electives: </span>
                      <span>
                        <RichTextRenderer content={edu.electives} />
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );

      case "experience":
        return (
          <div key="experience" className="section-block" style={{ marginBottom: sectionGap }}>
            <div className="border-b border-black pb-0.5 mb-1.5">
              <h2
                className="font-bold text-black tracking-wide"
                style={{ fontSize: `${settings?.typography?.sectionHeadingSize || 12.5}pt` }}
              >
                Professional Experience
              </h2>
            </div>

            {/* HashMove Active Preset */}
            <div className="item-block" style={{ marginBottom: itemGap }}>
              <div className="flex justify-between items-baseline w-full">
                <div>
                  <span className="font-bold text-black">{activeHashMove.title}</span>
                  <span className="text-slate-900">, {activeHashMove.company}</span>
                  <span className="text-slate-700 italic text-[9pt]"> ({activeHashMove.business_type})</span>
                </div>
                <span className="text-slate-800 text-[9.5pt] shrink-0 ml-2">{activeHashMove.period}</span>
              </div>

              <ul className="list-disc pl-5 mt-1 space-y-1 text-slate-900 leading-snug">
                {currentHashMovePreset?.bullets.map((bullet, bIdx) => (
                  <li key={bIdx} className="pl-0.5">
                    <RichTextRenderer content={bullet} />
                  </li>
                ))}
              </ul>
            </div>

            {/* Other Experiences */}
            {other_experiences
              .filter((exp) => exp.visible)
              .map((exp) => (
                <div key={exp.id} className="item-block" style={{ marginTop: itemGap }}>
                  <div className="flex justify-between items-baseline w-full">
                    <div>
                      <span className="font-bold text-black">{exp.role}</span>
                      <span className="text-slate-900">, {exp.company}</span>
                    </div>
                    <span className="text-slate-800 text-[9.5pt] shrink-0 ml-2">{exp.period}</span>
                  </div>

                  <ul className="list-disc pl-5 mt-0.5 space-y-1 text-slate-900 leading-snug">
                    {exp.bullets.map((bullet, bIdx) => (
                      <li key={bIdx} className="pl-0.5">
                        <RichTextRenderer content={bullet} />
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
          </div>
        );

      case "projects":
        const activeProjects = projects.filter((proj) => proj.visible);
        if (activeProjects.length === 0) return null;
        return (
          <div key="projects" className="section-block" style={{ marginBottom: sectionGap }}>
            <div className="border-b border-black pb-0.5 mb-1.5">
              <h2
                className="font-bold text-black tracking-wide"
                style={{ fontSize: `${settings?.typography?.sectionHeadingSize || 12.5}pt` }}
              >
                Projects
              </h2>
            </div>

            <div className="space-y-2">
              {activeProjects.map((proj) => (
                <div key={proj.id} className="item-block">
                  <div className="flex items-center gap-1 font-bold text-black leading-snug">
                    <a
                      href={proj.url || personal.portfolioUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="hover:text-indigo-600 inline-flex items-center gap-1 text-black font-bold"
                    >
                      <span>
                        <RichTextRenderer content={proj.title} defaultShowLinkIcon={false} />
                      </span>
                      {(proj.showIcon ?? true) && (
                        <ExternalLink className="w-2.5 h-2.5 text-slate-600 inline ml-0.5" />
                      )}
                    </a>
                  </div>
                  <p className="text-slate-900 leading-snug mt-0.5">
                    <RichTextRenderer content={proj.description} />
                  </p>
                </div>
              ))}
            </div>
          </div>
        );

      case "skills":
        const activeSkills = Object.values(skills_categories).filter((skill) => skill.visible);
        if (activeSkills.length === 0) return null;
        return (
          <div key="skills" className="section-block" style={{ marginBottom: sectionGap }}>
            <div className="border-b border-black pb-0.5 mb-1.5">
              <h2
                className="font-bold text-black tracking-wide"
                style={{ fontSize: `${settings?.typography?.sectionHeadingSize || 12.5}pt` }}
              >
                Skills and Certifications
              </h2>
            </div>

            <div className="space-y-1.5 text-slate-900">
              {activeSkills.map((skill) => (
                <div key={skill.id} className="leading-snug item-block">
                  <span className="font-bold text-black block mb-0.5">{skill.name}</span>
                  <p className="text-slate-900">
                    <RichTextRenderer content={skill.content} />
                  </p>
                </div>
              ))}
            </div>
          </div>
        );

      case "awards":
        if (!awards.visible) return null;
        const awardItems = awards.items && awards.items.length > 0
          ? awards.items.filter((a) => a.visible).map((a) => a.title).join(" | ")
          : awards.content || "";
        return (
          <div key="awards" className="section-block" style={{ marginBottom: sectionGap }}>
            <div className="border-b border-black pb-0.5 mb-1">
              <h2
                className="font-bold text-black tracking-wide"
                style={{ fontSize: `${settings?.typography?.sectionHeadingSize || 12.5}pt` }}
              >
                {awards.title || "Awards"}
              </h2>
            </div>
            <p className="text-slate-900 leading-snug">
              <RichTextRenderer content={awardItems} />
            </p>
          </div>
        );

      case "languages":
        if (!languages_availability.visible) return null;
        return (
          <div key="languages" className="section-block">
            <div className="border-b border-black pb-0.5 mb-1">
              <h2
                className="font-bold text-black tracking-wide"
                style={{ fontSize: `${settings?.typography?.sectionHeadingSize || 12.5}pt` }}
              >
                {languages_availability.title || "Languages & Availability"}
              </h2>
            </div>
            <p className="text-slate-900 leading-snug font-normal">
              <RichTextRenderer content={languages_availability.content} />
            </p>
          </div>
        );

      default:
        if (sectionKey.startsWith("custom-")) {
          const customId = sectionKey.replace("custom-", "");
          const customSec = custom_sections.find((s) => s.id === customId);
          if (!customSec || !customSec.visible) return null;

          return (
            <div key={customSec.id} className="section-block" style={{ marginBottom: sectionGap }}>
              <div className="border-b border-black pb-0.5 mb-1">
                <h2
                  className="font-bold text-black tracking-wide"
                  style={{ fontSize: `${settings?.typography?.sectionHeadingSize || 12.5}pt` }}
                >
                  {customSec.title}
                </h2>
              </div>
              <p className="text-slate-900 leading-snug">
                <RichTextRenderer content={customSec.content} />
              </p>
            </div>
          );
        }
        return null;
    }
  };

  // Dynamically divide sections across Page 1 and Page 2 according to configured sectionOrder
  const fullOrder = settings?.sectionOrder || [
    "header",
    "summary",
    "education",
    "experience",
    "projects",
    "skills",
    "awards",
    "languages",
  ];

  // Include custom sections if not in list
  const activeOrder = [...fullOrder];
  custom_sections.forEach((cs) => {
    const key = `custom-${cs.id}`;
    if (!activeOrder.includes(key)) {
      activeOrder.push(key);
    }
  });

  // Dynamic split point based on section hierarchy (first 4 in Page 1, rest in Page 2)
  const splitIndex = Math.min(4, Math.ceil(activeOrder.length / 2));
  const page1Sections = activeOrder.slice(0, splitIndex);
  const page2Sections = activeOrder.slice(splitIndex);

  return (
    <div
      className="resume-canvas-container flex flex-col items-center w-full min-h-full p-4 lg:p-8 overflow-auto transition-transform origin-top space-y-8 print:space-y-0 print:p-0 print:m-0 print:bg-white"
      style={{ transform: `scale(${previewZoom})`, transformOrigin: "top center" }}
    >
      {/* ── FLOWCV PAGE 1 SHEET (210mm x 297mm) ── */}
      <div className="resume-sheet-wrapper relative group print:m-0 print:p-0">
        <div className="absolute -top-6 left-2 text-[11px] font-mono font-semibold text-slate-500 flex items-center gap-1.5 no-print">
          <FileText className="w-3.5 h-3.5 text-indigo-600" />
          <span>Page 1 of 2 (A4 Standard)</span>
        </div>

        <div
          id="resume-page-1"
          className="resume-a4-sheet resume-page-sheet text-slate-900 shadow-xl transition-all relative print:shadow-none"
          style={{ ...typographyStyle, ...marginStyle }}
        >
          {page1Sections.map((secKey) => renderSection(secKey))}
        </div>
      </div>

      {/* ── FLOWCV PAGE 2 SHEET (210mm x 297mm) ── */}
      <div className="resume-sheet-wrapper relative group print:m-0 print:p-0">
        <div className="absolute -top-6 left-2 text-[11px] font-mono font-semibold text-slate-500 flex items-center gap-1.5 no-print">
          <FileText className="w-3.5 h-3.5 text-indigo-600" />
          <span>Page 2 of 2 (A4 Standard)</span>
        </div>

        <div
          id="resume-page-2"
          className="resume-a4-sheet resume-page-sheet text-slate-900 shadow-xl transition-all relative print:shadow-none"
          style={{ ...typographyStyle, ...marginStyle }}
        >
          {page2Sections.map((secKey) => renderSection(secKey))}
        </div>
      </div>
    </div>
  );
};
