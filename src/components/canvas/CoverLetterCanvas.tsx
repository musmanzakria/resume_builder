"use client";

import React from "react";
import { useResumeStore } from "@/lib/store";
import { RichTextRenderer } from "@/components/common/RichTextRenderer";

export const CoverLetterCanvas: React.FC = () => {
  const { structuredCoverLetter, masterContext, previewZoom } = useResumeStore();

  const cl = structuredCoverLetter;
  const projectsPool = masterContext?.cl_projects_pool || [];

  // Determine active projects based on selected IDs and projectCount (2, 3, or 4)
  const selectedIds = cl.selectedClProjectIds || [];
  const projectLimit = cl.projectCount || 3;
  
  // Find project objects in order
  const activeProjects = selectedIds
    .map((id) => projectsPool.find((p: any) => p.id === id))
    .filter(Boolean)
    .slice(0, projectLimit);

  // Fallback if none selected
  const displayProjects = activeProjects.length > 0 
    ? activeProjects 
    : projectsPool.slice(0, projectLimit);

  const containerZoomStyle: React.CSSProperties = {
    transform: `scale(${previewZoom})`,
    transformOrigin: "top center",
    transition: "transform 0.15s ease-out",
  };

  const a4SerifStyle: React.CSSProperties = {
    fontFamily: "'Times New Roman', Times, Merriweather, Georgia, serif",
    fontSize: "11.5pt",
    lineHeight: "1.45",
    color: "#000000",
    paddingTop: "24mm",
    paddingBottom: "22mm",
    paddingLeft: "24mm",
    paddingRight: "24mm",
    width: "210mm",
    minHeight: "297mm",
    backgroundColor: "#ffffff",
    boxSizing: "border-box",
  };

  return (
    <div className="w-full flex justify-center py-8 px-4 print:p-0 print:m-0 print:block">
      <div style={containerZoomStyle} className="print:!transform-none">
        <div 
          id="cover-letter-a4-sheet"
          className="resume-a4-sheet cover-letter-sheet text-black shadow-2xl relative select-text"
          style={a4SerifStyle}
        >
          {/* 1. Salutation */}
          <div className="mb-4 font-normal">
            {cl.salutation || "Dear Hiring Team,"}
          </div>

          {/* 2. Introduction Paragraph */}
          <div className="mb-4 text-justify leading-relaxed">
            <RichTextRenderer content={cl.intro} defaultShowLinkIcon={false} />
          </div>

          {/* 3. Three Core Body Paragraphs with Bold Headings */}
          {(cl.bodyParagraphs || []).map((para, idx) => (
            <div key={idx} className="mb-3.5">
              <div className="font-bold text-black mb-1">
                {para.heading}
              </div>
              <div className="text-justify leading-relaxed">
                <RichTextRenderer content={para.body} defaultShowLinkIcon={false} />
              </div>
            </div>
          ))}

          {/* 4. Portfolio & Project Bullets */}
          <div className="mb-4">
            <div className="font-bold text-black mb-1.5">
              Portfolio:{" "}
              <a 
                href={cl.portfolioUrl || "https://usmanzakria.com/"} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-700 underline hover:text-blue-900"
              >
                usmanzakria.com
              </a>
            </div>

            <ul className="space-y-1 pl-1">
              {displayProjects.map((proj: any) => (
                <li key={proj.id} className="flex items-start gap-2 text-justify">
                  <span className="text-black shrink-0 font-bold select-none">•</span>
                  <div>
                    {proj.url ? (
                      <a 
                        href={proj.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-700 underline font-semibold hover:text-blue-900"
                      >
                        {proj.title}
                      </a>
                    ) : (
                      <span className="font-semibold text-black">{proj.title}</span>
                    )}
                    : <span className="text-black">{proj.description}</span>
                  </div>
                </li>
              ))}

              {/* Permanent Certification Bullet */}
              <li className="flex items-start gap-2 text-justify">
                <span className="text-black shrink-0 font-bold select-none">•</span>
                <div>
                  <span className="text-blue-700 underline font-semibold">Certifications</span>: Intermediate SQL, Intermediate Python, Customer Analytics (UPenn)
                </div>
              </li>
            </ul>
          </div>

          {/* 5. Position Preference & Availability */}
          <div className="mb-3.5">
            <div className="font-bold text-black mb-1">
              {cl.availabilityHeading || "Position Preference & Availability"}
            </div>
            <div className="text-justify leading-relaxed">
              {cl.availabilityText || "I’m based in Berlin and immediately available. I speak English (C2) and German (learning A2) and thrive in fast-paced, collaborative environments that value growth and experimentation."}
            </div>
          </div>

          {/* 6. Closing Consideration */}
          <div className="mb-3.5">
            {cl.closingLine || "Thank you for your time and consideration."}
          </div>

          {/* 7. Sign-off & Contact Line */}
          <div className="pt-1">
            <div>{cl.signOff || "Warm Regards,"}</div>
            <div className="font-semibold text-black mt-0.5">{cl.senderName || "Usman Zakria"}</div>
            <div className="text-[10pt] text-slate-800 mt-1 italic">
              Berlin | +49 170 695 9515 |{" "}
              <a href="mailto:m.usmanzakria@gmail.com" className="text-blue-700 underline not-italic">
                m.usmanzakria@gmail.com
              </a>{" "}
              |{" "}
              <a 
                href={cl.portfolioUrl || "https://usmanzakria.com/"} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-blue-700 underline font-semibold not-italic"
              >
                Portfolio Link
              </a>{" "}
              | <strong className="font-bold text-black not-italic">8.5 IELTS</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
