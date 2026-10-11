import React from 'react';

/**
 * StudioNavigation - Navigation header for AI Growth Strategy Studio & AI BI
 * 
 * Mandate (Section 22):
 * Primary Views:
 * - Home (Strategic Briefing)
 * - Strategy ("What should we do?")
 * - Intelligence ("What is happening and why?")
 * - Audience
 * - Content
 * - Opportunities
 * - Plan (90-Day Action Plan)
 * - Company Knowledge (Understanding & Memory)
 * 
 * Global Actions:
 * - Ask AI
 * - What-If Scenario Analysis
 * - Challenge Strategy
 * - Connected Mode Indicators
 */
export default function StudioNavigation({
  currentStage,
  onSelectStage,
  companyName = 'Acme Intelligence',
  primaryObjective = 'leads',
  isGenerated = true,
  activePersona = 'Founder',
  isClassicMode,
  onToggleClassicMode,
  onOpenAsk,
  onOpenWhatIf,
  onOpenChallenge,
  onStartDemoTour,
  onOpenCompanySelector,
}) {
  const mainNavItems = [
    { id: 'home', label: 'Home', icon: 'home', badge: null },
    { id: 'strategy', label: 'Strategy', icon: 'psychology', badge: 'What to do' },
    { id: 'intelligence', label: 'Intelligence', icon: 'analytics', badge: 'What & why' },
    { id: 'audience', label: 'Audience', icon: 'groups', badge: null },
    { id: 'content', label: 'Content', icon: 'article', badge: null },
    { id: 'opportunities', label: 'Opportunities', icon: 'rocket_launch', badge: 'P1' },
    { id: 'plan', label: '90-Day Plan', icon: 'calendar_month', badge: null },
    { id: 'knowledge', label: 'Company Knowledge', icon: 'model_training', badge: 'Memory' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-2xs">
      {/* Top Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        {/* Brand & Context */}
        <div className="flex items-center gap-3">
          <div
            onClick={() => onSelectStage('home')}
            className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-2xs cursor-pointer"
          >
            <span className="material-symbols-outlined text-lg">trending_up</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span
                onClick={() => onSelectStage('home')}
                className="font-extrabold text-sm tracking-tight text-slate-900 cursor-pointer"
              >
                AI Growth Strategy Studio
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 uppercase">
                AI + BI
              </span>
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[11px] font-semibold text-slate-700 truncate max-w-[140px] sm:max-w-xs leading-none">
                {companyName}
              </span>
              <button
                type="button"
                onClick={onOpenCompanySelector}
                className="text-[10px] font-bold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-1.5 py-0.5 rounded border border-blue-200 cursor-pointer inline-flex items-center gap-0.5"
                title="Switch company archetype or input your own company"
              >
                <span>Switch</span>
                <span className="material-symbols-outlined text-[10px]">arrow_drop_down</span>
              </button>
            </div>
          </div>
        </div>

        {/* Global Action Tools (Ask AI, What-If, Challenge Strategy, Demo Tour) */}
        <div className="flex items-center gap-2">
          {/* Demo Tour Button for seamless verification of Section 29 */}
          {onStartDemoTour && (
            <button
              type="button"
              onClick={onStartDemoTour}
              className="hidden md:inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-300 transition-colors cursor-pointer"
              title="Launch 19-Step Demo Walkthrough"
            >
              <span className="material-symbols-outlined text-xs text-emerald-600">play_circle</span>
              <span>Demo Tour</span>
            </button>
          )}

          {/* Ask AI Global Tool */}
          <button
            type="button"
            onClick={onOpenAsk}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold border border-blue-200 transition-colors cursor-pointer"
            title="Open Contextual AI Assistant"
          >
            <span className="material-symbols-outlined text-xs">psychology</span>
            <span className="hidden sm:inline">Ask AI</span>
          </button>

          {/* What-If Scenario Analysis */}
          <button
            type="button"
            onClick={onOpenWhatIf}
            className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold border border-indigo-200 transition-colors cursor-pointer"
            title="Launch What-If Scenario Simulations"
          >
            <span className="material-symbols-outlined text-xs">tune</span>
            <span>What-If</span>
          </button>

          {/* Challenge Strategy */}
          <button
            type="button"
            onClick={onOpenChallenge}
            className="hidden lg:inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold border border-amber-300 transition-colors cursor-pointer"
            title="Adversarial Strategic Stress-Testing"
          >
            <span className="material-symbols-outlined text-xs text-amber-600">gavel</span>
            <span>Challenge</span>
          </button>

          {/* Classic Mode Switch */}
          <button
            type="button"
            onClick={onToggleClassicMode}
            className="px-2.5 py-1 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 text-xs font-medium border border-slate-200 transition-colors cursor-pointer"
            title="Switch to Classic Power BI Canvas"
          >
            Classic BI
          </button>
        </div>
      </div>

      {/* Navigation Tabs Bar (Section 22) */}
      <div className="border-t border-slate-200/80 bg-slate-50/80 overflow-x-auto scrollbar-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center space-x-1 sm:space-x-2 py-1">
          {mainNavItems.map((item) => {
            const isActive = currentStage === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectStage(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-white text-blue-700 shadow-2xs border border-slate-200/90'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                <span
                  className={`material-symbols-outlined text-sm ${
                    isActive ? 'text-blue-600' : 'text-slate-400'
                  }`}
                >
                  {item.icon}
                </span>
                <span>{item.label}</span>
                {item.badge && (
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full leading-none ${
                      item.id === 'strategy'
                        ? 'bg-indigo-100 text-indigo-800'
                        : item.id === 'intelligence'
                        ? 'bg-blue-100 text-blue-800'
                        : item.id === 'opportunities'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
