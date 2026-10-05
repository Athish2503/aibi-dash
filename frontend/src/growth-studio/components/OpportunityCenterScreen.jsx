import React, { useState } from 'react';
import OpportunityDetailModal from './OpportunityDetailModal';

/**
 * OpportunityCenterScreen - Screen 10 in AI Growth Strategy Studio
 * The central decision engine displaying visual opportunity cards with multi-faceted filtering,
 * deep-dive modal analysis, and direct "Add to Plan" execution.
 */
export default function OpportunityCenterScreen({
  strategyData,
  onNavigateStage,
  onAddOpportunityToPlan,
  plannedTaskIds = [],
}) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedPriority, setSelectedPriority] = useState('All');
  const [selectedImpact, setSelectedImpact] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeModalOpp, setActiveModalOpp] = useState(null);

  const { opportunities = [], company = {} } = strategyData;

  const categories = ['All', 'Website', 'Content', 'Audience', 'SEO', 'AI Visibility', 'Conversion'];
  const priorities = ['All', 'P1 — Critical', 'P2 — High', 'P3 — Medium'];
  const impactLevels = ['All', 'High', 'Medium'];

  const filteredOpportunities = opportunities.filter((opp) => {
    if (selectedCategory !== 'All' && opp.category !== selectedCategory) return false;
    if (selectedPriority !== 'All' && !opp.priority.startsWith(selectedPriority.split(' — ')[0])) return false;
    if (selectedImpact !== 'All' && opp.impact !== selectedImpact) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = opp.title.toLowerCase().includes(q);
      const matchWhy = opp.whyThisMatters.toLowerCase().includes(q);
      const matchAction = opp.recommendedAction.toLowerCase().includes(q);
      if (!matchTitle && !matchWhy && !matchAction) return false;
    }
    return true;
  });

  const handleAddCardToPlan = (opp) => {
    onAddOpportunityToPlan({
      id: `opp-${opp.id}`,
      task: opp.title,
      category: opp.category,
      priority: opp.priority,
      expectedImpact: opp.whyThisMatters,
      effort: opp.effortWeeks,
      status: 'todo',
      month: opp.priority.includes('P1') ? 1 : opp.priority.includes('P2') ? 2 : 3,
      monthTitle: opp.priority.includes('P1')
        ? 'Month 1 — Foundation'
        : opp.priority.includes('P2')
        ? 'Month 2 — Authority'
        : 'Month 3 — Expansion',
      strategicRationale: opp.recommendedAction,
    });
  };

  return (
    <div className="max-w-6xl mx-auto py-6 px-4 md:px-6 animate-fade-in space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
              Strategic Decision Engine
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-xs text-slate-500">{company.name}</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
            Opportunity Center
          </h1>
          <p className="text-sm text-slate-600 mt-0.5">
            Prioritized business growth initiatives ranked by impact, relevance, and execution effort.
          </p>
        </div>

        <button
          type="button"
          onClick={() => onNavigateStage('action-plan')}
          className="self-start md:self-auto inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
        >
          <span className="material-symbols-outlined text-sm">calendar_month</span>
          <span>View 90-Day Action Plan</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs space-y-3">
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-2 text-[10px]">
            Category:
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Secondary Filters (Priority, Impact, Search) */}
        <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3 text-xs">
            {/* Priority Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 font-medium">Priority:</span>
              <select
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value)}
                className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white text-slate-700 text-xs outline-none"
              >
                {priorities.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            {/* Impact Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 font-medium">Impact:</span>
              <select
                value={selectedImpact}
                onChange={(e) => setSelectedImpact(e.target.value)}
                className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white text-slate-700 text-xs outline-none"
              >
                {impactLevels.map((imp) => (
                  <option key={imp} value={imp}>
                    {imp}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <span className="absolute left-2.5 top-2 text-slate-400 material-symbols-outlined text-base">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search initiatives..."
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-100 outline-none"
            />
          </div>
        </div>
      </div>

      {/* Results Count & Quick Stats */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <span>
          Showing <strong>{filteredOpportunities.length}</strong> of {opportunities.length} Growth Opportunities
        </span>
        <span className="text-[11px] text-slate-400">
          Ranked by multi-factor score (Impact × Relevance ÷ Effort)
        </span>
      </div>

      {/* Opportunity Cards Grid (Visual, NOT plain table) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredOpportunities.map((opp) => {
          const isPlanned = plannedTaskIds.includes(`opp-${opp.id}`);

          return (
            <div
              key={opp.id}
              className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                {/* Header row */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 uppercase tracking-wider">
                      {opp.category}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                        opp.priority.includes('P1')
                          ? 'bg-red-50 text-red-700 border border-red-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {opp.priority}
                    </span>
                  </div>

                  <span className="text-xs font-extrabold text-blue-700 bg-blue-50/80 px-2.5 py-1 rounded-lg border border-blue-100">
                    {opp.relevanceScore} / 100 Relevance
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-lg font-bold text-slate-900 leading-snug mb-3">
                  {opp.title}
                </h3>

                {/* 4-Metric Grid */}
                <div className="grid grid-cols-4 gap-2 mb-4 p-2.5 rounded-2xl bg-slate-50 border border-slate-200/70 text-center">
                  <div>
                    <span className="text-[9px] uppercase font-bold text-slate-400 block">Impact</span>
                    <span className="text-xs font-bold text-slate-800">{opp.impact}</span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase font-bold text-slate-400 block">Relevance</span>
                    <span className="text-xs font-bold text-blue-700">{opp.relevanceScore}</span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase font-bold text-slate-400 block">Effort</span>
                    <span className="text-xs font-bold text-slate-800">{opp.effortWeeks}</span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase font-bold text-slate-400 block">Confidence</span>
                    <span className="text-xs font-bold text-emerald-700">{opp.confidence}</span>
                  </div>
                </div>

                {/* Why this matters */}
                <div className="mb-3">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
                    Why this matters
                  </span>
                  <p className="text-xs text-slate-600 leading-relaxed bg-amber-50/40 p-2.5 rounded-xl border border-amber-100/80">
                    {opp.whyThisMatters}
                  </p>
                </div>

                {/* Recommended action */}
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
                    Recommended Action
                  </span>
                  <p className="text-xs text-blue-900 font-medium leading-relaxed bg-blue-50/40 p-2.5 rounded-xl border border-blue-100/80">
                    {opp.recommendedAction}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setActiveModalOpp(opp)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-slate-700 hover:text-slate-900 hover:bg-slate-100 font-semibold text-xs transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm">visibility</span>
                  <span>View Analysis</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleAddCardToPlan(opp)}
                  disabled={isPlanned}
                  className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isPlanned
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs'
                  }`}
                >
                  <span className="material-symbols-outlined text-xs">
                    {isPlanned ? 'check_circle' : 'add_task'}
                  </span>
                  <span>{isPlanned ? 'Added to Plan' : 'Add to Plan'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredOpportunities.length === 0 && (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center">
          <span className="material-symbols-outlined text-4xl text-slate-300 mb-2">filter_list_off</span>
          <h3 className="text-base font-bold text-slate-800">No opportunities match your filter</h3>
          <p className="text-xs text-slate-500 mt-1">Try resetting the category or priority filters.</p>
          <button
            type="button"
            onClick={() => {
              setSelectedCategory('All');
              setSelectedPriority('All');
              setSelectedImpact('All');
              setSearchQuery('');
            }}
            className="mt-4 px-4 py-2 rounded-xl bg-blue-50 text-blue-700 font-semibold text-xs hover:bg-blue-100"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* Deep Dive Analysis Modal */}
      {activeModalOpp && (
        <OpportunityDetailModal
          opportunity={activeModalOpp}
          onClose={() => setActiveModalOpp(null)}
          onAddToPlan={handleAddCardToPlan}
          isInPlan={plannedTaskIds.includes(`opp-${activeModalOpp.id}`)}
        />
      )}
    </div>
  );
}
