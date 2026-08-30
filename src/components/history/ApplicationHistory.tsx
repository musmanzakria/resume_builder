"use client";

import React from "react";
import { useResumeStore } from "@/lib/store";
import { History, ArrowRight, Building2, Calendar, FileText, Sparkles } from "lucide-react";

export const ApplicationHistory: React.FC = () => {
  const { savedApplications, loadApplication, setActiveTab } = useResumeStore();

  return (
    <div className="flex-1 overflow-y-auto p-6 md:p-10 max-w-5xl mx-auto w-full space-y-6 bg-slate-100">
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 text-indigo-700 font-bold text-lg">
            <History className="w-5 h-5" />
            <span>Saved Job Applications & Tailored Snapshots</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Every time you save an application, a full snapshot of your tailored resume and cover letter is stored locally.
          </p>
        </div>

        <button
          onClick={() => setActiveTab("editor")}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold self-start md:self-auto shadow-xs"
        >
          Back to Editor
        </button>
      </div>

      {savedApplications.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-3 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-sm text-slate-800">No Saved Applications Yet</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            When you tailor your resume for companies like autarc, Zalando, or Personio, click "Save Snapshot" in the top bar to save your application history here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {savedApplications.map((app) => (
            <div
              key={app.id}
              className="p-5 bg-white border border-slate-200 rounded-2xl space-y-3 shadow-xs hover:border-indigo-300 transition-all flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                      <Building2 className="w-4 h-4 text-indigo-600 shrink-0" />
                      {app.company || "Untitled Application"}
                    </h4>
                    <p className="text-xs text-slate-600 font-medium mt-0.5">
                      {app.role || "Role unspecified"}
                    </p>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    {new Date(app.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="text-[11px] text-slate-500 line-clamp-2 bg-slate-50 p-2 rounded-lg border border-slate-100">
                  {app.jobDescription || "No JD text saved"}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-500">
                  Active Preset: <strong className="text-indigo-700">{app.selectedPresetKey || "growth_marketing"}</strong>
                </span>

                <button
                  onClick={() => {
                    loadApplication(app.id);
                    setActiveTab("editor");
                  }}
                  className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                >
                  <span>Load Snapshot</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
