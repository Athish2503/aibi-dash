import React from 'react';

/**
 * StudioNavigation - Global header & journey progress tracker for AI Growth Strategy Studio (Phase 2 Enhanced).
 * Organizes the 10-step flow into Discovery, Intelligence, and Execution phases.
 */
export default function StudioNavigation({
  currentStage,
  onSelectStage,
  companyName,
  primaryObjective,
  isGenerated,
  activePersona,
  onResetStrategy,
  onLoadDemo,
  isClassicMode,
  onToggleClassicMode,
  onOpenAsk,
  onOpenWhatIf,
}) {
  const stages = [
    // Phase 1: Setup & Discovery
    { id: 'welcome', stepNumber: 1, label: 'Welcome', icon: 'home', phase: 'Discovery' },
    { id: 'company-setup', stepNumber: 2, label: 'Company Setup', icon: 'business', phase: 'Discovery' },
    { id: 'growth-objective', stepNumber: 3, label: 'Growth Objective', icon: 'flag', phase: 'Discovery' },
    { id: 'strategy-config', stepNumber: 4, label: 'Strategy Config', icon: 'tune', phase: 'Discovery' },

    // Phase 2: Synthesis & Intelligence
    { id: 'generation', stepNumber: 5, label: 'Generate', icon: 'auto_awesome', phase: 'Intelligence' },
    { id: 'executive-overview', stepNumber: 6, label: 'Executive Overview', icon: 'dashboard', phase: 'Intelligence' },
    { id: 'audience-intelligence', stepNumber: 7, label: 'Audience Intel', icon: 'groups', phase: 'Intelligence' },
    { id: 'content-intelligence', stepNumber: 8, label: 'Content Intel', icon: 'article', phase: 'Intelligence' },

    // Phase 3: Action & Roadmap
    { id: 'opportunity-center', stepNumber: 9, label: 'Opportunities', icon: 'rocket_launch', phase: 'Execution' },
    { id: 'action-plan', stepNumber: 10, label: '90-Day Plan', icon: 'calendar_month', phase: 'Execution' },
  ];

  const currentStageIndex = stages.findIndex((s) => s.id === currentStage);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-2xs">
      {/* Top Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        {/* Logo and Product Title */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-2xs">
            <span className="material-symbols-outlined text-lg">trending_up</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm tracking-tight text-slate-900">
                AI Growth Strategy Studio
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 uppercase">
                Phase 2
              </span>
            </div>
            {companyName && (
              <span className="text-[11px] text-slate-500 block truncate max-w-[200px] sm:max-w-xs leading-none mt-0.5">
                {companyName} {primaryObjective ? `• Focus: ${primaryObjective}` : ''}
              </span>
            )}
          </div>
        </div>

        {/* Right Action Tools */}
        <div className="flex items-center gap-2">
          {/* Quick Shortcuts for Ask & What-If when strategy is generated */}
          {isGenerated && (
            <div className="hidden lg:flex items-center gap-1.5 mr-2">
              <button
                type="button"
                onClick={onOpenAsk}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold border border-blue-200 cursor-pointer"
                title="Ask about your business"
              >
                <span className="material-symbols-outlined text-xs">psychology</span>
                <span>Ask Strategy</span>
              </button>
              <button
                type="button"
                onClick={onOpenWhatIf}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold border border-indigo-200 cursor-pointer"
                title="Launch What-If Scenario Analysis"
              >
                <span className="material-symbols-outlined text-xs">tune</span>
                <span>What-If</span>
              </button>
            </div>
          )}

          {/* Quick Demo Loader */}
          <button
            type="button"
            onClick={onLoadDemo}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
            title="Load Acme AI Enterprise benchmark data"
          >
            <span className="material-symbols-outlined text-sm text-blue-600">bolt</span>
            <span>Demo Data</span>
          </button>

          {/* Reset / New Strategy */}
          <button
            type="button"
            onClick={onResetStrategy}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Start new strategy"
          >
            <span className="material-symbols-outlined text-lg">restart_alt</span>
          </button>

          {/* Classic Power BI Pipeline Switcher */}
          <div className="pl-2 border-l border-slate-200">
            <button
              type="button"
              onClick={onToggleClassicMode}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                isClassicMode
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
              title="Toggle between Growth Studio & Classic Power BI Report Builder"
            >
              <span className="material-symbols-outlined text-sm">
                {isClassicMode ? 'hub' : 'view_kanban'}
              </span>
              <span className="hidden md:inline">
                {isClassicMode ? 'Return to Growth Studio' : 'Power BI Pipeline'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* 10-Step Journey Navigation Ribbon (when not in classic mode) */}
      {!isClassicMode && (
        <div className="bg-slate-50/80 border-t border-slate-200/60 overflow-x-auto scrollbar-none">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-1.5 flex items-center gap-1 min-w-max">
            {stages.map((stg, idx) => {
              const isActive = currentStage === stg.id;
              const isPassed = currentStageIndex > idx || (isGenerated && idx >= 4);

              return (
                <button
                  key={stg.id}
                  type="button"
                  onClick={() => onSelectStage(stg.id)}
                  disabled={!isGenerated && idx >= 4 && currentStageIndex < idx}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs transition-all cursor-pointer disabled:opacity-35 disabled:cursor-not-allowed select-none ${
                    isActive
                      ? 'bg-blue-600 text-white font-bold shadow-2xs'
                      : isPassed
                      ? 'text-slate-700 hover:bg-slate-200/70 font-medium'
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <span
                    className={`w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-bold ${
                      isActive
                        ? 'bg-white text-blue-600'
                        : isPassed
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-slate-200 text-slate-500'
                    }`}
                  >
                    {isPassed && !isActive ? (
                      <span className="material-symbols-outlined text-[10px]">check</span>
                    ) : (
                      stg.stepNumber
                    )}
                  </span>
                  <span>{stg.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
}
