"use client";

import React, { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { ResumeCanvas } from "@/components/canvas/ResumeCanvas";
import { EditorSidebar } from "@/components/editor/EditorSidebar";
import { PresetsManager } from "@/components/presets/PresetsManager";
import { AiTailorPanel } from "@/components/ai/AiTailorPanel";
import { DesignControls } from "@/components/design/DesignControls";
import { CoverLetterEditor } from "@/components/coverletter/CoverLetterEditor";
import { ApplicationHistory } from "@/components/history/ApplicationHistory";
import { MasterSettingsView } from "@/components/settings/MasterSettingsView";
import { useResumeStore } from "@/lib/store";

export default function Home() {
  const { activeTab } = useResumeStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col">
        <Header />
        <main className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          <section className="w-full lg:w-[480px] xl:w-[520px] h-[50vh] lg:h-[calc(100vh-4rem)] border-b lg:border-b-0 lg:border-r border-slate-200 bg-white flex flex-col shrink-0">
            <div className="p-6 text-xs text-slate-500">Loading controls...</div>
          </section>
          <section className="flex-1 h-[50vh] lg:h-[calc(100vh-4rem)] overflow-y-auto bg-slate-200/50 flex items-start justify-center">
            <ResumeCanvas />
          </section>
        </main>
      </div>
    );
  }

  // Full-width views for Settings and History
  if (activeTab === "settings") {
    return (
      <div className="min-h-screen flex flex-col bg-slate-100">
        <Header />
        <MasterSettingsView />
      </div>
    );
  }

  if (activeTab === "history") {
    return (
      <div className="min-h-screen flex flex-col bg-slate-100">
        <Header />
        <ApplicationHistory />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-100">
      <Header />

      {/* Main Split-Pane Layout in Light Mode */}
      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden print:overflow-visible print:bg-white print:p-0 print:m-0">
        {/* Left Side: Interactive Controls & Form Editors */}
        <section className="w-full lg:w-[480px] xl:w-[520px] h-[50vh] lg:h-[calc(100vh-4rem)] border-b lg:border-b-0 lg:border-r border-slate-200 bg-white flex flex-col shrink-0 no-print shadow-sm">
          {activeTab === "editor" && <EditorSidebar />}
          {activeTab === "presets" && <PresetsManager />}
          {activeTab === "ai" && <AiTailorPanel />}
          {activeTab === "cover-letter" && <CoverLetterEditor />}
          {activeTab === "design" && <DesignControls />}
        </section>

        {/* Right Side: Live 1:1 A4 FlowCV Document Preview Canvas */}
        <section className="flex-1 h-[50vh] lg:h-[calc(100vh-4rem)] overflow-y-auto bg-slate-200/60 flex items-start justify-center print:bg-white print:overflow-visible print:h-auto print:p-0 print:m-0">
          <ResumeCanvas />
        </section>
      </main>
    </div>
  );
}
