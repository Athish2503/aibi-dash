import React from 'react';

/**
 * StudioNavigation - Ultra-refined executive navigation for Growth Studio & BI Studio
 * 
 * World-class SaaS layout (Linear / Stripe / Vercel caliber):
 * - Seamless glassmorphic header with specular border highlight
 * - Workspace selector with Enterprise badge
 * - Segmented Cupertino-style mode switch [ Growth Studio | BI Studio ]
 * - High-contrast semantic deliverable tabs with micro-indicators
 */
export default function StudioNavigation({
  currentStage,
  onSelectStage,
  companyName = 'Acme Intelligence',
  isClassicMode,
  onToggleClassicMode,
  onOpenAsk,
  onStartDemoTour,
  onOpenCompanySelector,
  growthBetsCount = 3,
}) {
  const navTabs = [
    { id: 'audit', label: 'Audit', icon: 'radar' },
    { id: 'matrix', label: 'Gap Matrix', icon: 'view_column' },
    { id: 'leaks', label: 'Revenue Leaks', icon: 'leak_remove' },
    { id: 'bets', label: 'Growth Bets', icon: 'rocket_launch', count: growthBetsCount },
    { id: 'plan', label: '90-Day Plan', icon: 'calendar_month' },
    { id: 'knowledge', label: 'Saved Context', icon: 'history_edu' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#090D18]/90 backdrop-blur-2xl border-b border-white/[0.08] shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
      {/* Tier 1: Main Workspace Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        {/* Workspace Identity & Switcher */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onOpenCompanySelector}
            className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl hover:bg-white/[0.06] border border-transparent hover:border-white/[0.08] transition-all group cursor-pointer text-left"
            title="Switch workspace / client context"
            aria-label="Switch workspace"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 via-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/25 shrink-0 group-hover:scale-105 transition-transform">
              <span className="material-symbols-outlined text-lg">query_stats</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm text-white group-hover:text-indigo-200 transition-colors tracking-tight">
                {companyName || 'Acme Intelligence'}
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-white/[0.06] text-slate-300 border border-white/[0.08] tracking-wider uppercase">
                Enterprise
              </span>
              <span className="material-symbols-outlined text-base text-slate-400 group-hover:text-white transition-colors">
                expand_more
              </span>
            </div>
          </button>
        </div>

        {/* Center: Segmented Cupertino Mode Control */}
        <div className="flex items-center bg-[#050811] p-1 rounded-xl border border-white/[0.08] shadow-inner">
          <button
            type="button"
            onClick={() => isClassicMode && onToggleClassicMode?.()}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              !isClassicMode
                ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
            <span>Growth Studio</span>
          </button>
          <button
            type="button"
            onClick={() => !isClassicMode && onToggleClassicMode?.()}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              isClassicMode
                ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <span className="material-symbols-outlined text-xs text-slate-400">dashboard</span>
            <span>BI Studio</span>
          </button>
        </div>

        {/* Right: Ask AI & Avatar */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onOpenAsk}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-slate-200 hover:text-white text-xs font-semibold border border-white/[0.08] hover:border-indigo-500/40 transition-all cursor-pointer shadow-xs"
            title="Ask AI Copilot"
          >
            <span className="material-symbols-outlined text-sm text-indigo-400">psychology</span>
            <span>Ask AI</span>
            <kbd className="hidden sm:inline-block ml-1 px-1.5 py-0.2 rounded bg-black/40 text-[10px] text-slate-400 font-mono border border-white/[0.08]">
              ⌘K
            </kbd>
          </button>
          <button
            type="button"
            onClick={onStartDemoTour}
            className="w-8 h-8 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] hover:border-white/[0.2] flex items-center justify-center text-slate-300 hover:text-white text-xs font-bold transition-all cursor-pointer"
            title="Account & Walkthrough"
            aria-label="User account and tour"
          >
            <span className="material-symbols-outlined text-lg">account_circle</span>
          </button>
        </div>
      </div>

      {/* Tier 2: Streamlined Semantic Deliverables Tabs */}
      <div className="border-t border-white/[0.06] bg-[#070A14]/70 overflow-x-auto scrollbar-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center space-x-1 py-1.5">
          {navTabs.map((item) => {
            const isActive = currentStage === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectStage(item.id)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-white/[0.1] text-white border border-white/[0.14] shadow-xs'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
                }`}
              >
                <span className={`material-symbols-outlined text-sm ${isActive ? 'text-indigo-400' : 'text-slate-500'}`}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
                {item.count != null && (
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    {item.count}
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
