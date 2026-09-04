"use client";

import React from "react";
import { useResumeStore } from "@/lib/store";
import { RichTextRenderer } from "@/components/common/RichTextRenderer";

export const CoverLetterCanvas: React.FC = () => {
  const { structuredCoverLetter, masterContext, previewZoom } = useResumeStore();

  const cl = structuredCoverLetter;
  // Robust fallback to guarantee projects pool is always loaded
  const fallbackProjects = [
    { id: "cl-video-onboarding", title: "Video Onboarding Tutorial", description: "for the Arab British Chamber of Commerce.", url: "https://drive.google.com/file/d/1cGCwr_uMH9M9Q9UhLWiNDZ84CcDQqav4/view?usp=drive_link" },
    { id: "cl-agentic-ai-finance", title: "Agentic AI in Finance", description: "Exploring Agentic AI players and use cases in Finance, creating n8n PoC.", url: "https://usmanzakria.com/agentic_ai_finance_showcase.html" },
    { id: "cl-figma-agile", title: "Figma Article Illustrations", description: "Simplifying Agile SDLC concepts for diverse audiences.", url: "https://drive.google.com/file/d/1K-0Giu770y-g7NXkeyFq5JnECW3cbUId/view?usp=drive_link" },
    { id: "cl-ai-logistics", title: "AI-Powered Logistics", description: "Architected an AI-powered logistics platform, including Conversational AI.", url: "https://www.hashmove.com/solutions/ai" },
    { id: "cl-songs-shrinking", title: "Are Songs Shrinking?", description: "Regression analysis of 3600 songs, how Spotify shortened songs by 17%.", url: "https://usmanzakria.com/spotify_showcase.html" }
  ];

  const projectsPool = (masterContext?.cl_projects_pool?.length ? masterContext.cl_projects_pool : fallbackProjects) || fallbackProjects;

  // Determine active projects based on selected IDs and projectCount (2, 3, 4, or 5)
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

  const lineSpacingVal = cl.lineSpacing || 1.18;
  const paraGap = cl.paragraphSpacing !== undefined ? cl.paragraphSpacing : 8;

  const a4SerifStyle: React.CSSProperties = {
    fontFamily: '"Times New Roman", Times, Merriweather, Georgia, serif',
    fontSize: "11.5pt",
    lineHeight: lineSpacingVal,
    color: "#000000",
    paddingTop: "20mm",
    paddingBottom: "18mm",
    paddingLeft: "22mm",
    paddingRight: "22mm",
    width: "210mm",
    height: "297mm",
    minHeight: "297mm",
    maxHeight: "297mm",
    backgroundColor: "#ffffff",
    boxSizing: "border-box",
    overflow: "hidden",
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
          <div style={{ marginBottom: `${paraGap}px` }} className="font-normal">
            {cl.salutation || "Dear Hiring Team,"}
          </div>

          {/* 2. Introduction Paragraph */}
          <div style={{ marginBottom: `${paraGap}px` }} className="text-justify">
            <RichTextRenderer content={cl.intro} defaultShowLinkIcon={false} />
          </div>

          {/* 3. Three Core Body Paragraphs with Bold Headings */}
          {(cl.bodyParagraphs || []).map((para, idx) => (
            <div key={idx} style={{ marginBottom: `${paraGap}px` }}>
              <div className="font-bold text-black mb-0.5">
                {para.heading}
              </div>
              <div className="text-justify">
                <RichTextRenderer content={para.body} defaultShowLinkIcon={false} />
              </div>
            </div>
          ))}

          {/* 4. Portfolio & Project Bullets */}
          <div style={{ marginBottom: `${paraGap}px` }}>
            <div className="font-bold text-black mb-1">
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

            <ul className="space-y-1.5 pl-4 ml-1">
              {displayProjects.map((proj: any) => (
                <li key={proj.id} className="flex items-start gap-2.5 text-justify">
                  <span className="inline-block w-[6px] h-[6px] rounded-full bg-black shrink-0 mt-[6px] select-none" />
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
              <li className="flex items-start gap-2.5 text-justify">
                <span className="inline-block w-[6px] h-[6px] rounded-full bg-black shrink-0 mt-[6px] select-none" />
                <div>
                  <span className="text-blue-700 underline font-semibold">Certifications</span>: Intermediate SQL, Intermediate Python, Customer Analytics (UPenn)
                </div>
              </li>
            </ul>
          </div>

          {/* 5. Position Preference & Availability */}
          <div style={{ marginBottom: `${paraGap}px` }}>
            <div className="font-bold text-black mb-0.5">
              {cl.availabilityHeading || "Position Preference & Availability"}
            </div>
            <div className="text-justify">
              {cl.availabilityText || "I’m based in Berlin and immediately available. I speak English (C2) and German (learning A2) and thrive in fast-paced, collaborative environments that value growth and experimentation."}
            </div>
          </div>

          {/* 6. Closing Consideration */}
          <div style={{ marginBottom: `${paraGap}px` }}>
            {cl.closingLine || "Thank you for your time and consideration."}
          </div>

          {/* 7. Sign-off & Contact Line */}
          <div className="pt-0.5">
            <div>{cl.signOff || "Warm Regards,"}</div>
            <div className="font-bold italic text-black mt-0.5">{cl.senderName || "Usman Zakria"}</div>
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
