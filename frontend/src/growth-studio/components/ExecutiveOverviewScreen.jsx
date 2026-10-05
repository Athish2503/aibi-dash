import React, { useState } from 'react';

/**
 * ExecutiveOverviewScreen - Screen 6 & 7 in AI Growth Strategy Studio
 * The primary decision interface: Executive Narrative, Secondary KPIs,
 * Key Findings (Data -> Insight -> Why -> Recommendation), and Business Health scorecards.
 */
export default function ExecutiveOverviewScreen({
  strategyData,
  onNavigateStage,
  onAddFindingToPlan,
}) {
  const [expandedHealthScore, setExpandedHealthScore] = useState(null);
  const [addedActions, setAddedActions] = useState({});

  const {
    company,
    executiveSummary,
    kpis = [],
    keyFindings = [],
    businessHealth = [],
  } = strategyData;

  const toggleHealthExpand = (id) => {
    setExpandedHealthScore((prev) => (prev === id ? null : id));
  };

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

  return (
    <div className="max-w-6xl mx-auto py-6 px-4 md:px-6 animate-fade-in space-y-8">
      {/* 1. Header & Executive Summary Callout */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 md:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                Executive Synthesis
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-xs text-slate-500 font-medium">
                Target: {company.name || 'Acme Intelligence'}
              </span>
            </div>
            <h1 className="text-2xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
              Your Growth Strategy
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onNavigateStage('opportunity-center')}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition-all border border-blue-200/80 cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">rocket_launch</span>
              <span>View Opportunities</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigateStage('action-plan')}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">calendar_month</span>
              <span>90-Day Plan</span>
            </button>
          </div>
        </div>

        {/* Narrative Executive Summary */}
        <div className="mt-5 p-4 md:p-5 rounded-2xl bg-blue-50/50 border border-blue-100">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
              <span className="material-symbols-outlined text-base">psychology</span>
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-900 block mb-1">
                Strategic Summary
              </span>
              <p className="text-sm md:text-base text-slate-800 leading-relaxed font-medium">
                {executiveSummary}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Secondary KPI Cards (Supporting Metrics) */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Digital Foundation & Telemetry (Secondary Indicators)
          </h2>
          <span className="text-[11px] text-slate-400">Baseline 30-Day Metrics</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {kpis.map((kpi) => (
            <div
              key={kpi.id}
              className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs hover:border-slate-300 transition-all flex flex-col justify-between"
            >
              <div>
                <span className="text-[11px] font-semibold text-slate-500 block truncate">
                  {kpi.label}
                </span>
                <div className="flex items-baseline gap-1.5 mt-1.5">
                  <span className="text-lg md:text-xl font-extrabold text-slate-900 tracking-tight">
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
                  {kpi.change}
                </span>
                <span className="text-[10px] text-slate-400 truncate ml-1">{kpi.subtitle}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Key Findings (Data -> Insight -> Why -> Recommendation) */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
          <div>
            <h2 className="text-lg md:text-xl font-bold text-slate-900">
              Key Strategic Findings
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Every finding follows a strict analytical path: Data → Insight → Why it matters → Recommended action.
            </p>
          </div>
          <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md self-start sm:self-auto border border-blue-100">
            {keyFindings.length} High-Impact Insights
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {keyFindings.map((finding) => {
            const isAdded = addedActions[finding.id];

            return (
              <div
                key={finding.id}
                className="bg-white rounded-2xl border border-slate-200/80 p-5 md:p-6 shadow-2xs hover:shadow-sm transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Top Finding Header */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                        finding.priority === 'Critical'
                          ? 'bg-red-50 text-red-700 border border-red-200'
                          : 'bg-blue-50 text-blue-700 border border-blue-200'
                      }`}
                    >
                      {finding.priority} Priority • {finding.category}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 leading-snug mb-3">
                    {finding.title}
                  </h3>

                  {/* 4 Core Pillars: Data -> Insight -> Why -> Action */}
                  <div className="space-y-2.5 text-xs">
                    {/* 1. Evidence */}
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/60">
                      <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px] block mb-0.5">
                        Evidence / Data
                      </span>
                      <p className="text-slate-600 leading-relaxed">{finding.evidence}</p>
                    </div>

                    {/* 2. Insight */}
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/60">
                      <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px] block mb-0.5">
                        Analytical Insight
                      </span>
                      <p className="text-slate-600 leading-relaxed">{finding.insight}</p>
                    </div>

                    {/* 3. Why It Matters */}
                    <div className="p-2.5 rounded-xl bg-amber-50/50 border border-amber-200/60">
                      <span className="font-bold text-amber-900 uppercase tracking-wider text-[10px] block mb-0.5">
                        Why It Matters (Business Impact)
                      </span>
                      <p className="text-amber-800 leading-relaxed">{finding.whyItMatters}</p>
                    </div>

                    {/* 4. Recommendation */}
                    <div className="p-2.5 rounded-xl bg-blue-50/60 border border-blue-200/80">
                      <span className="font-bold text-blue-900 uppercase tracking-wider text-[10px] block mb-0.5">
                        Recommended Action
                      </span>
                      <p className="text-blue-800 font-medium leading-relaxed">{finding.recommendation}</p>
                    </div>
                  </div>
                </div>

                {/* Card Footer Action */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">
                    Actionable Decision
                  </span>

                  <button
                    type="button"
                    onClick={() => handleAddAction(finding)}
                    disabled={isAdded}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      isAdded
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
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

      {/* 4. Business Health Section (0-100 Analytical Scores with disclaimer & expandable drawers) */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 md:p-8 shadow-sm">
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h2 className="text-xl font-bold text-slate-900">
              Business Health Scorecard
            </h2>
            <div className="inline-flex items-center gap-1.5 text-[11px] text-slate-500 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200">
              <span className="material-symbols-outlined text-xs text-blue-600">tune</span>
              <span>Click any card to inspect Evidence, Problem & Recommendations</span>
            </div>
          </div>

          <div className="mt-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px] text-slate-500 flex items-center gap-2">
            <span className="material-symbols-outlined text-sm text-slate-400 shrink-0">info</span>
            <span>
              <strong>Measurement Notice:</strong> Scores are project-defined analytical indices (0–100) calculated from your specific dataset, competitive gap analysis, and conversion telemetry. They are not universal industry benchmarks.
            </span>
          </div>
        </div>

        {/* 6 Category Score Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {businessHealth.map((item) => {
            const isExpanded = expandedHealthScore === item.id;
            const scoreColor =
              item.score >= 75
                ? 'text-emerald-600 bg-emerald-50 border-emerald-200'
                : item.score >= 55
                ? 'text-blue-600 bg-blue-50 border-blue-200'
                : 'text-amber-600 bg-amber-50 border-amber-200';

            return (
              <div
                key={item.id}
                className={`rounded-2xl border transition-all overflow-hidden ${
                  isExpanded
                    ? 'border-blue-500 shadow-md ring-1 ring-blue-200'
                    : 'border-slate-200/80 hover:border-slate-300 shadow-2xs'
                }`}
              >
                <div
                  onClick={() => toggleHealthExpand(item.id)}
                  className="p-4 bg-white cursor-pointer select-none flex items-center justify-between"
                >
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">
                      {item.category}
                    </span>
                    <span className="text-[11px] text-slate-500 font-normal">
                      {item.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div
                      className={`w-11 h-11 rounded-xl flex items-center justify-center font-extrabold text-sm border ${scoreColor}`}
                    >
                      {item.score}
                    </div>
                    <span className="material-symbols-outlined text-slate-400 text-lg">
                      {isExpanded ? 'expand_less' : 'expand_more'}
                    </span>
                  </div>
                </div>

                {/* Expandable Drawer Detail */}
                {isExpanded && (
                  <div className="p-4 bg-slate-50/70 border-t border-slate-200/80 space-y-2.5 text-xs animate-fade-in">
                    <div>
                      <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px] block">
                        Current State
                      </span>
                      <p className="text-slate-600 mt-0.5">{item.currentState}</p>
                    </div>

                    <div>
                      <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px] block">
                        Observed Evidence
                      </span>
                      <p className="text-slate-600 mt-0.5">{item.evidence}</p>
                    </div>

                    <div>
                      <span className="font-bold text-red-700 uppercase tracking-wider text-[10px] block">
                        Identified Problem
                      </span>
                      <p className="text-slate-600 mt-0.5">{item.problem}</p>
                    </div>

                    <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-900">
                      <span className="font-bold text-blue-900 uppercase tracking-wider text-[10px] block">
                        Target Recommendation
                      </span>
                      <p className="mt-0.5">{item.recommendation}</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
