import React, { useState } from 'react';
import {
  STRATEGY_PERSONAS,
  DASHBOARD_MODES,
  VISUAL_DENSITY_OPTIONS,
  VISUAL_EMPHASIS_OPTIONS,
} from '../data/mockStudioData';

/**
 * PersonalizationToolbar - Persistent controls for:
 * 1. Strategy Persona perspective switcher (Founder, CMO, Growth, SEO, PMM, Analyst)
 * 2. "View as" dashboard modes (Executive, Marketing, Strategy, Analyst, Board)
 * 3. Visual density (Compact, Balanced, Detailed)
 * 4. Visual emphasis (KPIs, Trends, Opportunities, Comparisons, Recommendations)
 * 5. Quick action triggers for "Ask your strategy" and "What-If Scenarios"
 */
export default function PersonalizationToolbar({
  activePersona,
  onChangePersona,
  dashboardMode,
  onChangeMode,
  dashboardDensity,
  onChangeDensity,
  visualEmphasis,
  onChangeEmphasis,
  onOpenAskModal,
  onOpenWhatIfModal,
}) {
  const [showDensityMenu, setShowDensityMenu] = useState(false);
  const [showEmphasisMenu, setShowEmphasisMenu] = useState(false);

  const currentPersonaObj =
    STRATEGY_PERSONAS.find((p) => p.id === activePersona) || STRATEGY_PERSONAS[0];

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-3 shadow-2xs space-y-2.5">
      {/* Top Row: View As Mode + Strategy Persona Selector + Quick Action Tools */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* "View as" Dashboard Mode Switcher (Requirement 3) */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mr-1 flex items-center gap-1">
            <span className="material-symbols-outlined text-xs">visibility</span>
            <span>View as:</span>
          </span>
          <div className="flex flex-wrap items-center gap-1 bg-slate-100 p-0.5 rounded-xl border border-slate-200/80">
            {DASHBOARD_MODES.map((mode) => {
              const isActive = dashboardMode === mode.id;
              return (
                <button
                  key={mode.id}
                  type="button"
                  onClick={() => onChangeMode(mode.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                  title={mode.subtitle}
                >
                  <span className="material-symbols-outlined text-xs">{mode.icon}</span>
                  <span>{mode.title}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Action Triggers: Ask Your Strategy + What-If */}
        <div className="flex items-center gap-2">
          {/* Ask Your Strategy Trigger (Requirement 4) */}
          <button
            type="button"
            onClick={onOpenAskModal}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition-all border border-blue-200 cursor-pointer shadow-2xs"
            title="Ask structured questions about your business telemetry"
          >
            <span className="material-symbols-outlined text-sm text-blue-600">psychology</span>
            <span>Ask Your Strategy</span>
          </button>

          {/* What-If Scenario Trigger (Requirement 6) */}
          <button
            type="button"
            onClick={onOpenWhatIfModal}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition-all border border-indigo-200 cursor-pointer shadow-2xs"
            title="Run Power BI What-If parameter sensitivity scenarios"
          >
            <span className="material-symbols-outlined text-sm text-indigo-600">tune</span>
            <span>What-If Analysis</span>
          </button>
        </div>
      </div>

      {/* Bottom Row: Persona Switcher & Visual Controls */}
      <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Strategy Persona Selector (Requirement 2) */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mr-1 flex items-center gap-1">
            <span className="material-symbols-outlined text-xs">switch_account</span>
            <span>Persona Lens:</span>
          </span>
          <div className="flex flex-wrap items-center gap-1">
            {STRATEGY_PERSONAS.map((p) => {
              const isSelected = activePersona === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => onChangePersona(p.id)}
                  className={`px-2 py-0.5 rounded-md text-[11px] font-medium transition-all cursor-pointer flex items-center gap-1 border ${
                    isSelected
                      ? 'bg-amber-50 border-amber-300 text-amber-900 font-bold shadow-2xs'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                  title={`${p.title}: ${p.tagline}`}
                >
                  <span className="material-symbols-outlined text-[13px]">{p.icon}</span>
                  <span>{p.title}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Visual Customization: Density & Visual Emphasis (Requirement 9) */}
        <div className="flex items-center gap-2">
          {/* Density Selector */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setShowDensityMenu(!showDensityMenu);
                setShowEmphasisMenu(false);
              }}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-[11px] font-semibold cursor-pointer"
            >
              <span className="material-symbols-outlined text-xs">density_medium</span>
              <span>Density: {dashboardDensity}</span>
              <span className="material-symbols-outlined text-xs">expand_more</span>
            </button>

            {showDensityMenu && (
              <div className="absolute right-0 mt-1 w-44 bg-white rounded-xl shadow-lg border border-slate-200 py-1 z-30 animate-fade-in text-xs">
                {VISUAL_DENSITY_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      onChangeDensity(opt.id);
                      setShowDensityMenu(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 hover:bg-slate-50 flex items-center justify-between cursor-pointer ${
                      dashboardDensity === opt.id ? 'font-bold text-blue-600' : 'text-slate-700'
                    }`}
                  >
                    <span>{opt.label}</span>
                    {dashboardDensity === opt.id && (
                      <span className="material-symbols-outlined text-xs">check</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Visual Emphasis Selector */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setShowEmphasisMenu(!showEmphasisMenu);
                setShowDensityMenu(false);
              }}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-[11px] font-semibold cursor-pointer"
            >
              <span className="material-symbols-outlined text-xs">insights</span>
              <span>Emphasis: {visualEmphasis}</span>
              <span className="material-symbols-outlined text-xs">expand_more</span>
            </button>

            {showEmphasisMenu && (
              <div className="absolute right-0 mt-1 w-48 bg-white rounded-xl shadow-lg border border-slate-200 py-1 z-30 animate-fade-in text-xs">
                {VISUAL_EMPHASIS_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      onChangeEmphasis(opt.id);
                      setShowEmphasisMenu(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 hover:bg-slate-50 flex items-center justify-between cursor-pointer ${
                      visualEmphasis === opt.id ? 'font-bold text-blue-600' : 'text-slate-700'
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-xs">{opt.icon}</span>
                      <span>{opt.label}</span>
                    </span>
                    {visualEmphasis === opt.id && (
                      <span className="material-symbols-outlined text-xs">check</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Active Persona & Lens Explanatory Sub-banner */}
      <div className="px-3 py-1.5 rounded-xl bg-amber-50/60 border border-amber-200/70 text-[11px] text-amber-900 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="font-bold flex items-center gap-1">
            <span className="material-symbols-outlined text-xs text-amber-700">
              {currentPersonaObj.icon}
            </span>
            <span>{currentPersonaObj.subtitle}:</span>
          </span>
          <span className="text-amber-800">{currentPersonaObj.perspectiveNotice}</span>
        </div>
        <span className="text-[10px] text-amber-700 uppercase font-semibold hidden md:inline shrink-0">
          Source data unaffected
        </span>
      </div>
    </div>
  );
}
