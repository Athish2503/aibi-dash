import React from 'react';

export default function PipelineStepper({
  mode = 'planning', // 'planning' or 'generating'
  onReviewDashboard,
}) {
  if (mode === 'generating') {
    return (
      <div className="max-w-2xl mx-auto py-8 animate-fade-in">
        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-8 shadow-sm flex flex-col gap-6">
          <div>
            <h1 className="text-xl font-bold text-on-surface">Generating Power BI Dashboard</h1>
            <p className="text-xs text-secondary mt-1">Compiling verified PBIR model artifacts and measures</p>
          </div>

          {/* Steps */}
          <div className="flex flex-col gap-2.5 text-xs font-medium text-on-surface">
            <div className="flex items-center gap-2 text-emerald-600">
              <span className="material-symbols-outlined text-base">check_circle</span>
              <span>Dataset prepared</span>
            </div>
            <div className="flex items-center gap-2 text-emerald-600">
              <span className="material-symbols-outlined text-base">check_circle</span>
              <span>Semantic model created</span>
            </div>
            <div className="flex items-center gap-2 text-emerald-600">
              <span className="material-symbols-outlined text-base">check_circle</span>
              <span>Measures generated</span>
            </div>
            <div className="flex items-center gap-2 text-emerald-600">
              <span className="material-symbols-outlined text-base">check_circle</span>
              <span>Dashboard pages created</span>
            </div>
            <div className="flex items-center gap-2 text-emerald-600">
              <span className="material-symbols-outlined text-base">check_circle</span>
              <span>Visuals configured</span>
            </div>
            <div className="flex items-center gap-2 text-primary">
              <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse ml-0.5 mr-1"></span>
              <span>Publishing dashboard</span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="flex flex-col gap-2 py-4">
            <div className="w-full bg-surface-container-high h-2.5 rounded-full overflow-hidden">
              <div className="bg-primary h-full rounded-full transition-all duration-500" style={{ width: '85%' }}></div>
            </div>
            <div className="flex items-center justify-between text-xs text-secondary font-mono">
              <span>This may take a moment...</span>
              <span className="font-bold text-primary">85%</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Default: Planning Mode
  return (
    <div className="max-w-2xl mx-auto py-8 animate-fade-in">
      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-8 shadow-sm flex flex-col gap-6">
        <div>
          <h1 className="text-xl font-bold text-on-surface">Creating Your Dashboard</h1>
          <p className="text-xs text-secondary mt-1">Agent is evaluating metrics and structuring the report</p>
        </div>

        {/* Agent Activity Checklist */}
        <div className="flex flex-col gap-2.5 text-xs font-medium text-on-surface">
          <div className="flex items-center gap-2 text-emerald-600">
            <span className="material-symbols-outlined text-base">check_circle</span>
            <span>Dataset analyzed</span>
          </div>
          <div className="flex items-center gap-2 text-emerald-600">
            <span className="material-symbols-outlined text-base">check_circle</span>
            <span>KPIs identified</span>
          </div>
          <div className="flex items-center gap-2 text-emerald-600">
            <span className="material-symbols-outlined text-base">check_circle</span>
            <span>Channel performance analyzed</span>
          </div>
          <div className="flex items-center gap-2 text-emerald-600">
            <span className="material-symbols-outlined text-base">check_circle</span>
            <span>Audience segments identified</span>
          </div>
          <div className="flex items-center gap-2 text-emerald-600">
            <span className="material-symbols-outlined text-base">check_circle</span>
            <span>Campaign types analyzed</span>
          </div>
          <div className="flex items-center gap-2 text-emerald-600">
            <span className="material-symbols-outlined text-base">check_circle</span>
            <span>Geographic analysis prepared</span>
          </div>
          <div className="flex items-center gap-2 text-primary font-bold">
            <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse ml-0.5 mr-1"></span>
            <span>Designing dashboard</span>
          </div>
        </div>

        {/* Identified Sections */}
        <div className="flex flex-col gap-2 pt-4 border-t border-outline-variant/20">
          <span className="text-xs font-bold text-secondary uppercase tracking-wider">
            AI has identified 4 dashboard sections:
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
            {[
              { num: '01', title: 'Executive Overview' },
              { num: '02', title: 'Channel Performance' },
              { num: '03', title: 'Audience & Campaign Analysis' },
              { num: '04', title: 'Cost & Geographic Performance' },
            ].map((sec) => (
              <div
                key={sec.num}
                className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/20 flex items-center gap-3"
              >
                <span className="font-mono text-xs font-bold text-primary">{sec.num}</span>
                <span className="text-xs font-semibold text-on-surface">{sec.title}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Primary Action Button */}
        <div className="pt-2 flex justify-end">
          <button
            type="button"
            onClick={onReviewDashboard}
            className="w-full sm:w-auto px-8 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-2"
          >
            <span>Review Dashboard</span>
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </button>
        </div>
      </div>
    </div>
  );
}
