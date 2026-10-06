import React, { useState } from 'react';
import OpportunityDetailModal from './OpportunityDetailModal';

/**
 * OpportunityCenterScreen - Screen 10 in AI Growth Strategy Studio (Phase 2 Enhanced)
 * Ranks initiatives using the multi-factor recommendation engine.
 * Supports inline expandable details showing:
 * 1. Current state
 * 2. Evidence
 * 3. Business impact
 * 4. Audience affected
 * 5. Competitive context
 * 6. Recommended action
 * 7. Estimated effort
 * 8. Expected value
 * 9. Dependencies
 * Plus direct "Add to 90-Day Plan" execution.
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
  const [expandedCardIds, setExpandedCardIds] = useState({});

  const { opportunities = [], company = {}, activePersona = 'Founder' } = strategyData;

  const categories = ['All', 'Website', 'Content', 'Audience', 'SEO', 'AI Visibility', 'Conversion'];
  const priorities = ['All', 'P1 — Critical', 'P2 — High', 'P3 — Medium'];
  const impactLevels = ['All', 'High', 'Medium'];

  const toggleCardExpand = (id) => {
    setExpandedCardIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const filteredOpportunities = opportunities.filter((opp) => {
    if (selectedCategory !== 'All' && opp.category !== selectedCategory) return false;
    if (selectedPriority !== 'All' && !opp.priority.startsWith(selectedPriority.split(' — ')[0])) return false;
    if (selectedImpact !== 'All' && opp.impact !== selectedImpact) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = opp.title.toLowerCase().includes(q);
      const matchWhy = (opp.whyThisMatters || '').toLowerCase().includes(q);
      const matchAction = (opp.recommendedAction || '').toLowerCase().includes(q);
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
      expectedImpact: opp.businessImpact || opp.whyThisMatters,
      effort: opp.effortWeeks || opp.estimatedEffort,
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
            <span className="text-slate-300">•</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
              Perspective: {activePersona}
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
            Opportunity Center
          </h1>
          <p className="text-sm text-slate-600 mt-0.5">
            Ranked initiatives synthesized across primary objective, persona lens, and verified business health.
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
          Ranked by multi-factor score (Impact × Relevance ÷ Effort + Persona Lens)
        </span>
      </div>

      {/* Opportunity Cards Grid (Expandable Inline & Modal Deep-Dive) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredOpportunities.map((opp, idx) => {
          const isPlanned =
            plannedTaskIds.includes(`opp-${opp.id}`) ||
            plannedTaskIds.includes(opp.id);
          const isExpanded = !!expandedCardIds[opp.id];

          return (
            <div
              key={opp.id}
              className={`bg-white rounded-3xl border transition-all flex flex-col justify-between overflow-hidden ${
                isExpanded
                  ? 'border-blue-400 shadow-md ring-1 ring-blue-100'
                  : 'border-slate-200/90 shadow-2xs hover:shadow-sm'
              }`}
            >
              <div className="p-6">
                {/* Header row */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2 flex-wrap">
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
                    {idx === 0 && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 uppercase">
                        ★ #1 Top Recommendation
                      </span>
                    )}
                  </div>

                  <span className="text-xs font-extrabold text-blue-700 bg-blue-50/80 px-2.5 py-1 rounded-lg border border-blue-100 font-mono">
                    Score: {opp.dynamicScore || opp.relevanceScore}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-lg font-bold text-slate-900 leading-snug mb-2">
                  {opp.title}
                </h3>

                {/* Persona Ranking Reason / Explanations */}
                {opp.personaExplanation && (
                  <div className="mb-3 px-2.5 py-1 rounded-lg bg-amber-50/70 border border-amber-200/80 text-[11px] text-amber-900 flex items-center gap-1.5 font-medium">
                    <span className="material-symbols-outlined text-xs text-amber-700">stars</span>
                    <span>{opp.personaExplanation}</span>
                  </div>
                )}

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

                {/* Summary View (Collapsed State) */}
                {!isExpanded && (
                  <div className="space-y-3">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
                        Why this matters
                      </span>
                      <p className="text-xs text-slate-600 leading-relaxed bg-amber-50/40 p-2.5 rounded-xl border border-amber-100/80">
                        {opp.whyThisMatters}
                      </p>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
                        Recommended Action
                      </span>
                      <p className="text-xs text-blue-900 font-medium leading-relaxed bg-blue-50/40 p-2.5 rounded-xl border border-blue-100/80">
                        {opp.recommendedAction}
                      </p>
                    </div>
                  </div>
                )}

                {/* Expanded Inline Details (Requirement 5: All 9 Fields) */}
                {isExpanded && (
                  <div className="space-y-3 pt-2 border-t border-slate-100 text-xs animate-fade-in">
                    {/* 1. Current State */}
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-0.5">
                        1. Current State
                      </span>
                      <p className="text-slate-700">{opp.currentState}</p>
                    </div>

                    {/* 2. Evidence */}
                    <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-200">
                      <span className="text-[10px] font-bold text-amber-900 uppercase tracking-wider block mb-0.5">
                        2. Audited Evidence
                      </span>
                      <p className="text-amber-900">{opp.evidence || opp.whyThisMatters}</p>
                    </div>

                    {/* 3. Business Impact & 4. Audience Affected */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200">
                        <span className="text-[10px] font-bold text-emerald-900 uppercase tracking-wider block mb-0.5">
                          3. Business Impact
                        </span>
                        <p className="text-emerald-950 font-semibold">{opp.businessImpact}</p>
                      </div>
                      <div className="p-3 rounded-xl bg-purple-50/70 border border-purple-200">
                        <span className="text-[10px] font-bold text-purple-900 uppercase tracking-wider block mb-0.5">
                          4. Audience Affected
                        </span>
                        <p className="text-purple-950 font-medium">{opp.audienceAffected}</p>
                      </div>
                    </div>

                    {/* 5. Competitive Context */}
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-0.5">
                        5. Competitive Context
                      </span>
                      <p className="text-slate-700">{opp.competitiveContext}</p>
                    </div>

                    {/* 6. Recommended Action */}
                    <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200">
                      <span className="text-[10px] font-bold text-blue-900 uppercase tracking-wider block mb-0.5">
                        6. Recommended Action
                      </span>
                      <p className="text-blue-950 font-bold">{opp.recommendedAction}</p>
                    </div>

                    {/* 7. Estimated Effort & 8. Expected Value */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-0.5">
                          7. Estimated Effort
                        </span>
                        <p className="text-slate-800 font-mono font-bold">{opp.estimatedEffort || opp.effortWeeks}</p>
                      </div>
                      <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                        <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block mb-0.5">
                          8. Expected Value
                        </span>
                        <p className="text-emerald-950 font-mono font-bold">{opp.expectedValue}</p>
                      </div>
                    </div>

                    {/* 9. Dependencies */}
                    {opp.dependencies && (
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                          9. Key Dependencies
                        </span>
                        <ul className="space-y-1">
                          {opp.dependencies.map((dep, dIdx) => (
                            <li key={dIdx} className="text-slate-600 flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                              <span>{dep}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Action Buttons & Expand Toggle */}
              <div className="px-6 py-4 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  {/* Inline Expand Toggle (Requirement 5) */}
                  <button
                    type="button"
                    onClick={() => toggleCardExpand(opp.id)}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-sm">
                      {isExpanded ? 'expand_less' : 'expand_more'}
                    </span>
                    <span>{isExpanded ? 'Collapse' : 'Details'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveModalOpp(opp)}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 cursor-pointer ml-1"
                  >
                    <span className="material-symbols-outlined text-sm">open_in_new</span>
                    <span>Full Modal</span>
                  </button>
                </div>

                {/* Add to 90-Day Plan (Requirement 5) */}
                <button
                  type="button"
                  onClick={() => handleAddCardToPlan(opp)}
                  disabled={isPlanned}
                  className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isPlanned
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs'
                  }`}
                >
                  <span className="material-symbols-outlined text-xs">
                    {isPlanned ? 'check_circle' : 'add_task'}
                  </span>
                  <span>{isPlanned ? 'Added to Plan' : 'Add to 90-Day Plan'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Deep-Dive Modal View */}
      {activeModalOpp && (
        <OpportunityDetailModal
          opportunity={activeModalOpp}
          onClose={() => setActiveModalOpp(null)}
          onAddToPlan={handleAddCardToPlan}
          isInPlan={
            plannedTaskIds.includes(`opp-${activeModalOpp.id}`) ||
            plannedTaskIds.includes(activeModalOpp.id)
          }
        />
      )}
    </div>
  );
}
