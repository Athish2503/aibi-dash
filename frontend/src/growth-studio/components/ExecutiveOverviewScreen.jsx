import React, { useState } from 'react';
import PersonalizationToolbar from './PersonalizationToolbar';
import StrategicAdvisoryPrinciple from './StrategicAdvisoryPrinciple';
import BusinessHealthDrilldownModal from './BusinessHealthDrilldownModal';
import AskStrategyModal from './AskStrategyModal';
import WhatIfScenarioModal from './WhatIfScenarioModal';
import { STRATEGY_PERSONAS } from '../data/mockStudioData';

/**
 * ExecutiveOverviewScreen - Screen 6 & 7 in AI Growth Strategy Studio (Phase 2 Enhanced)
 * Integrates:
 * 1. Persona-driven narrative & priority framing
 * 2. "View as" Dashboard Modes (Executive, Marketing, Strategy, Analyst, Board)
 * 3. 6 Strategic Advisory Questions ("What happened?", "Why?", "Why does it matter?", "What should we do?", etc.)
 * 4. Business Health Diagnostic Drilldowns (Audience Fit, Search Visibility, Content Strength, AI Discoverability, Conversion Readiness, Competitive Position)
 * 5. Visual Density & Emphasis customization
 */
export default function ExecutiveOverviewScreen({
  strategyData,
  onNavigateStage,
  onAddFindingToPlan,
  activePersona,
  onChangePersona,
  dashboardMode,
  onChangeMode,
  dashboardDensity,
  onChangeDensity,
  visualEmphasis,
  onChangeEmphasis,
}) {
  const [activeHealthItem, setActiveHealthItem] = useState(null);
  const [isAskModalOpen, setIsAskModalOpen] = useState(false);
  const [isWhatIfModalOpen, setIsWhatIfModalOpen] = useState(false);
  const [addedActions, setAddedActions] = useState({});

  const {
    company,
    executiveSummary,
    kpis = [],
    keyFindings = [],
    businessHealth = [],
    audienceSegments = [],
    opportunities = [],
  } = strategyData;

  const currentPersonaObj =
    STRATEGY_PERSONAS.find((p) => p.id === activePersona) || STRATEGY_PERSONAS[0];

  const handleAddAction = (finding) => {
    onAddFindingToPlan({
      id: `from-${finding.id}`,
      task: finding.recommendation,
      category: finding.category || 'Strategic Initiative',
      priority: finding.priority === 'Critical' ? 'P1 — Critical' : 'P2 — High',
      expectedImpact: finding.whyItMatters,
      effort: '2 Weeks',
      status: 'todo',
      month: 1,
      monthTitle: 'Month 1 — Foundation',
      strategicRationale: `Directly derived from Key Finding: ${finding.title}`,
    });
    setAddedActions((prev) => ({ ...prev, [finding.id]: true }));
  };

  // Density classes
  const isCompact = dashboardDensity === 'Compact';
  const isDetailed = dashboardDensity === 'Detailed';

  return (
    <div className={`max-w-6xl mx-auto py-6 px-4 md:px-6 animate-fade-in ${isCompact ? 'space-y-5' : 'space-y-7'}`}>
      {/* 1. Global Personalization & Perspective Toolbar */}
      <PersonalizationToolbar
        activePersona={activePersona}
        onChangePersona={onChangePersona}
        dashboardMode={dashboardMode}
        onChangeMode={onChangeMode}
        dashboardDensity={dashboardDensity}
        onChangeDensity={onChangeDensity}
        visualEmphasis={visualEmphasis}
        onChangeEmphasis={onChangeEmphasis}
        onOpenAskModal={() => setIsAskModalOpen(true)}
        onOpenWhatIfModal={() => setIsWhatIfModalOpen(true)}
      />

      {/* 2. Mode-Specific Banner & Lens Badge */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-extrabold text-blue-700 uppercase tracking-wider bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-sm">visibility</span>
            <span>Dashboard Mode: {dashboardMode}</span>
          </span>
          <span className="text-slate-300">•</span>
          <span className="text-xs font-semibold text-slate-500">
            {dashboardMode === 'Executive' && 'Business outcomes & enterprise priorities'}
            {dashboardMode === 'Marketing' && 'Audience cohorts, content & campaigns'}
            {dashboardMode === 'Strategy' && 'Market moats, competition & opportunity scoring'}
            {dashboardMode === 'Analyst' && 'Funnel telemetry, drop-off diagnostics & data confidence'}
            {dashboardMode === 'Board' && 'High-level performance, ARR pipeline & macro risks'}
          </span>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs">
          <span className="text-slate-400">Emphasis:</span>
          <span className="font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
            {visualEmphasis}
          </span>
        </div>
      </div>

      {/* 3. Executive Synthesis & Strategic Narrative */}
      <div className={`bg-white rounded-3xl border border-slate-200/90 shadow-sm ${isCompact ? 'p-5' : 'p-6 md:p-8'}`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                Personalized Synthesis
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-xs text-slate-500 font-medium">
                {company.name || 'Acme Intelligence'}
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-[11px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                {currentPersonaObj.title} Lens
              </span>
            </div>
            <h1 className="text-2xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
              {dashboardMode === 'Board' ? 'Board Briefing: Growth & ARR Trajectory' : 'Your Growth Strategy'}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onNavigateStage('opportunity-center')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition-all border border-blue-200/80 cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">rocket_launch</span>
              <span>Opportunities</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigateStage('action-plan')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">calendar_month</span>
              <span>90-Day Plan</span>
            </button>
          </div>
        </div>

        {/* Narrative Executive Summary */}
        <div className="mt-5 p-4 md:p-5 rounded-2xl bg-blue-50/50 border border-blue-100">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
              <span className="material-symbols-outlined text-lg">psychology</span>
            </div>
            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-900 block">
                Executive Narrative ({activePersona} Perspective)
              </span>
              <p className="text-sm md:text-base text-slate-800 leading-relaxed font-medium">
                {executiveSummary}
              </p>
              {isDetailed && (
                <p className="text-xs text-blue-800/80 pt-1 font-mono">
                  Methodology: Multi-channel attribution cross-referenced against 312 search queries and $18.9M addressable enterprise TAM.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 4. Strategic Advisory Principle Section (Requirement 10) */}
      <StrategicAdvisoryPrinciple
        strategyData={strategyData}
        onNavigateStage={onNavigateStage}
        onOpenWhatIf={() => setIsWhatIfModalOpen(true)}
      />

      {/* 5. Telemetry / KPIs Section (Promoted when visualEmphasis === 'KPIs' or 'Trends') */}
      {(dashboardMode !== 'Board' || visualEmphasis === 'KPIs') && (
        <div className={visualEmphasis === 'KPIs' ? 'order-first ring-2 ring-blue-300 rounded-3xl p-1' : ''}>
          <div className="flex items-center justify-between mb-3 px-1">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm text-blue-600">speed</span>
              <span>Digital Telemetry & Secondary Indicators</span>
            </h2>
            <span className="text-[11px] text-slate-400">Baseline 30-Day Audited Telemetry</span>
          </div>

          <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 ${isCompact ? 'gap-2' : 'gap-3'}`}>
            {kpis.map((kpi) => (
              <div
                key={kpi.id}
                className={`rounded-2xl bg-white border border-slate-200/80 shadow-2xs hover:border-slate-300 transition-all flex flex-col justify-between ${
                  isCompact ? 'p-3' : 'p-3.5'
                }`}
              >
                <div>
                  <span className="text-[11px] font-semibold text-slate-500 block truncate">
                    {kpi.label}
                  </span>
                  <div className="flex items-baseline gap-1.5 mt-1">
                    <span className={`font-extrabold text-slate-900 tracking-tight font-mono ${isCompact ? 'text-lg' : 'text-xl'}`}>
                      {kpi.value}
                    </span>
                  </div>
                </div>

                <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <span
                    className={`font-bold flex items-center gap-0.5 ${
                      kpi.trend === 'up'
                        ? 'text-emerald-600'
                        : kpi.trend === 'down'
                        ? 'text-amber-600'
                        : 'text-slate-500'
                    }`}
                  >
                    <span className="material-symbols-outlined text-xs">
                      {kpi.trend === 'up' ? 'arrow_upward' : kpi.trend === 'down' ? 'arrow_downward' : 'horizontal_rule'}
                    </span>
                    <span>{kpi.change}</span>
                  </span>
                  <span className="text-[10px] text-slate-400 truncate max-w-[65px]">
                    {kpi.subtitle}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. Dashboard Mode: Marketing Special View (Audience & Content focus) */}
      {dashboardMode === 'Marketing' && (
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm space-y-4 animate-fade-in">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-purple-700">
                Marketing Mode Highlight
              </span>
              <h3 className="text-lg font-bold text-slate-900">
                Audience Pipeline & Content Opportunity Map
              </h3>
            </div>
            <button
              type="button"
              onClick={() => onNavigateStage('audience-intelligence')}
              className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
            >
              <span>Full Audience View</span>
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {audienceSegments.map((seg) => (
              <div key={seg.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                <span className="text-xs font-bold text-slate-800 block">{seg.name}</span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-base font-extrabold text-blue-700 font-mono">
                    {seg.conversionRate}%
                  </span>
                  <span className="text-[10px] text-slate-400">conversion</span>
                </div>
                <div className="text-[11px] text-slate-600 mt-1">
                  <span>ACV: <strong>{seg.avgDealValue}</strong></span> • <span>CAC: {seg.cac}</span>
                </div>
                <span className="text-[10px] text-slate-500 block mt-2 border-t border-slate-200/60 pt-1.5 leading-tight">
                  {seg.strategicVerdict}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 7. Dashboard Mode: Strategy Special View (Competition & Moats focus) */}
      {dashboardMode === 'Strategy' && (
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm space-y-4 animate-fade-in">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-700">
                Strategy Mode Highlight
              </span>
              <h3 className="text-lg font-bold text-slate-900">
                Competitive Moat & Market Opportunity Landscape
              </h3>
            </div>
            <button
              type="button"
              onClick={() => onNavigateStage('opportunity-center')}
              className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
            >
              <span>Opportunity Center</span>
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200">
              <span className="text-xs font-bold text-amber-900 uppercase tracking-wider block mb-1">
                Moat Advantage
              </span>
              <p className="text-xs text-amber-950 font-medium leading-relaxed">
                Sub-100ms latency architecture and 10x faster deployment time than Competitor A and Competitor B.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-red-50/60 border border-red-200">
              <span className="text-xs font-bold text-red-900 uppercase tracking-wider block mb-1">
                Market Vulnerability
              </span>
              <p className="text-xs text-red-950 font-medium leading-relaxed">
                Zero indexable comparison pages capturing 24,600 monthly commercial alternative searches.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200">
              <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider block mb-1">
                Capital Efficiency
              </span>
              <p className="text-xs text-emerald-950 font-medium leading-relaxed">
                Enterprise LTV:CAC exceeds 14:1 with $52k contract value at $2,400 acquisition cost.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 8. Dashboard Mode: Board View (Condensed high-level priorities & risks) */}
      {dashboardMode === 'Board' && (
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 md:p-8 shadow-sm space-y-6 animate-fade-in">
          <div className="border-b border-slate-100 pb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              C-Suite & Board Governance
            </span>
            <h3 className="text-xl font-bold text-slate-900 mt-1">
              Quarterly Milestones, ARR Pipeline & Risk Mitigations
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Q1 Milestone
              </span>
              <h4 className="text-sm font-bold text-slate-900">
                Enterprise Trust & Security Hub
              </h4>
              <p className="text-xs text-slate-600 mt-1">
                Shorten procurement sales cycle by 14 days and lift enterprise demo conversion +35%.
              </p>
              <span className="inline-block mt-2 font-mono text-xs font-bold text-emerald-700">
                +$180k Pipeline
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Q2 Milestone
              </span>
              <h4 className="text-sm font-bold text-slate-900">
                Competitor Alternative Conquesting
              </h4>
              <p className="text-xs text-slate-600 mt-1">
                Publish 4 transparent comparison pages capturing 720+ commercial evaluations/mo.
              </p>
              <span className="inline-block mt-2 font-mono text-xs font-bold text-emerald-700">
                +$280k Pipeline
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Q3 Milestone
              </span>
              <h4 className="text-sm font-bold text-slate-900">
                Account-Based Personalization (ABM)
              </h4>
              <p className="text-xs text-slate-600 mt-1">
                Reverse-IP enterprise hero routing lifting demo conversion rate from 4.82% to 6.2%.
              </p>
              <span className="inline-block mt-2 font-mono text-xs font-bold text-emerald-700">
                +$120k Pipeline
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 9. Key Findings Section */}
      <div>
        <div className="flex items-center justify-between mb-4 px-1">
          <div>
            <h2 className="text-lg md:text-xl font-bold text-slate-900">
              Audited Findings ({keyFindings.length} Strategic Bottlenecks)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Observation → Telemetry Evidence → Root Cause → Prescription
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigateStage('action-plan')}
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>Review Full 90-Day Plan</span>
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {keyFindings.map((finding) => {
            const isAdded = !!addedActions[finding.id];

            return (
              <div
                key={finding.id}
                className="p-5 md:p-6 rounded-3xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-sm transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      {finding.category}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                        finding.priority === 'Critical'
                          ? 'bg-red-50 text-red-700 border border-red-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {finding.priority}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 leading-snug mb-3">
                    {finding.title}
                  </h3>

                  <div className="space-y-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70">
                      <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px] block mb-0.5">
                        Observed Evidence
                      </span>
                      <p className="text-slate-700 leading-relaxed">{finding.evidence}</p>
                    </div>

                    <div className="p-2.5 rounded-xl bg-amber-50/60 border border-amber-200/70">
                      <span className="font-bold text-amber-800 uppercase tracking-wider text-[10px] block mb-0.5">
                        Why It Matters (Impact)
                      </span>
                      <p className="text-amber-900 leading-relaxed font-medium">
                        {finding.whyItMatters}
                      </p>
                    </div>

                    <div className="p-2.5 rounded-xl bg-blue-50/60 border border-blue-200/70">
                      <span className="font-bold text-blue-800 uppercase tracking-wider text-[10px] block mb-0.5">
                        Target Prescription
                      </span>
                      <p className="text-blue-900 leading-relaxed font-semibold">
                        {finding.recommendation}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end">
                  <button
                    type="button"
                    onClick={() => handleAddAction(finding)}
                    disabled={isAdded}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      isAdded
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-not-allowed'
                        : 'bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 border border-slate-200'
                    }`}
                  >
                    <span className="material-symbols-outlined text-xs">
                      {isAdded ? 'check_circle' : 'add_task'}
                    </span>
                    <span>{isAdded ? 'Added to 90-Day Plan' : 'Add to Plan'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 10. Business Health Section with Modal Drilldowns (Requirement 7) */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 md:p-8 shadow-sm">
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
                Requirement 7 Diagnostic
              </span>
              <h2 className="text-xl font-bold text-slate-900 mt-0.5">
                Business Health Scorecard & Drilldowns
              </h2>
            </div>
            <div className="inline-flex items-center gap-1.5 text-xs text-blue-700 bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-200 font-semibold">
              <span className="material-symbols-outlined text-sm">open_in_new</span>
              <span>Click any card to open detailed Diagnostic Modal</span>
            </div>
          </div>

          <div className="mt-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px] text-slate-500 flex items-center gap-2">
            <span className="material-symbols-outlined text-sm text-slate-400 shrink-0">info</span>
            <span>
              <strong>Diagnostic Notice:</strong> Scores are project-defined analytical indices (0–100) calculated from your specific dataset, competitive gap analysis, and conversion telemetry.
            </span>
          </div>
        </div>

        {/* 6 Category Score Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {businessHealth.map((item) => {
            const scoreColor =
              item.score >= 75
                ? 'text-emerald-600 bg-emerald-50 border-emerald-200'
                : item.score >= 55
                ? 'text-blue-600 bg-blue-50 border-blue-200'
                : 'text-amber-600 bg-amber-50 border-amber-200';

            return (
              <div
                key={item.id}
                onClick={() => setActiveHealthItem(item)}
                className="rounded-2xl border border-slate-200/80 hover:border-blue-400 hover:shadow-md transition-all p-4 bg-white cursor-pointer select-none flex items-center justify-between group"
              >
                <div>
                  <span className="text-xs font-bold text-slate-900 block group-hover:text-blue-600 transition-colors">
                    {item.category}
                  </span>
                  <span className="text-[11px] text-slate-500 font-normal mt-0.5 block">
                    {item.status}
                  </span>
                  <span className="text-[10px] text-blue-600 font-medium mt-1 flex items-center gap-0.5">
                    <span>Inspect Drilldown</span>
                    <span className="material-symbols-outlined text-xs">arrow_forward</span>
                  </span>
                </div>

                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center font-extrabold text-sm border shadow-2xs ${scoreColor}`}
                >
                  {item.score}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Interactive Modals */}
      {/* 1. Business Health Drilldown Modal (Requirement 7) */}
      {activeHealthItem && (
        <BusinessHealthDrilldownModal
          healthItem={activeHealthItem}
          onClose={() => setActiveHealthItem(null)}
          onAddActionToPlan={onAddFindingToPlan}
        />
      )}

      {/* 2. Ask Your Strategy Modal (Requirement 4) */}
      <AskStrategyModal
        isOpen={isAskModalOpen}
        onClose={() => setIsAskModalOpen(false)}
        strategyData={strategyData}
        onAddActionToPlan={onAddFindingToPlan}
      />

      {/* 3. What-If Scenario Modal (Requirement 6) */}
      <WhatIfScenarioModal
        isOpen={isWhatIfModalOpen}
        onClose={() => setIsWhatIfModalOpen(false)}
      />
    </div>
  );
}
