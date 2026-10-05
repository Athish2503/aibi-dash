import React, { useState } from 'react';
import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from 'recharts';

/**
 * ContentIntelligenceScreen - Screen 9 in AI Growth Strategy Studio
 * Prioritizes business impact over volume:
 * - Impact vs Effort visual matrix (Scatter with search opportunity bubble sizes)
 * - "Create Now" highlighted quadrant list
 * - Content Opportunities table (Topic, Audience, Search Demand, Business Relevance, Coverage, Action)
 */
export default function ContentIntelligenceScreen({
  strategyData,
  onNavigateStage,
  onAddContentToPlan,
}) {
  const [selectedQuadrant, setSelectedQuadrant] = useState('all');
  const [addedItems, setAddedItems] = useState({});

  const {
    impactEffortTopics = [],
    contentOpportunities = [],
    company = {},
  } = strategyData;

  const handleAddTopic = (item) => {
    onAddContentToPlan({
      id: `content-${item.id}`,
      task: `Produce & launch "${item.title || item.topic}"`,
      category: 'Content & SEO',
      priority: 'P1 — Critical',
      expectedImpact: item.recommendedContent || 'High business impact commercial asset',
      effort: `${item.effort ? item.effort * 5 : 10} Days`,
      status: 'todo',
      month: 1,
      monthTitle: 'Month 1 — Foundation',
      strategicRationale: `Impact vs Effort priority (Score: ${item.impact || 9}/10)`,
    });
    setAddedItems((prev) => ({ ...prev, [item.id]: true }));
  };

  const createNowTopics = impactEffortTopics.filter((t) => t.quadrant === 'Create Now');

  // Filter topics for Scatter chart
  const displayedTopics =
    selectedQuadrant === 'all'
      ? impactEffortTopics
      : impactEffortTopics.filter((t) => t.quadrant === selectedQuadrant);

  const getQuadrantColor = (quadrant) => {
    switch (quadrant) {
      case 'Create Now':
        return '#004ac6'; // Deep primary blue
      case 'Strategic Bet':
        return '#8b5cf6'; // Indigo / violet
      case 'Deprioritize':
        return '#94a3b8'; // Muted slate
      default:
        return '#2563eb';
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-6 px-4 md:px-6 animate-fade-in space-y-8">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
              Asset Leverage & Commercial Demand
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-xs text-slate-500">{company.name}</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
            Content Intelligence
          </h1>
          <p className="text-sm text-slate-600 mt-0.5">
            Optimized for <strong className="text-slate-900">business impact</strong> rather than raw editorial volume.
          </p>
        </div>

        <button
          type="button"
          onClick={() => onNavigateStage('opportunity-center')}
          className="self-start md:self-auto inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-50 text-blue-700 text-xs font-bold hover:bg-blue-100 transition-all border border-blue-200/80 cursor-pointer"
        >
          <span className="material-symbols-outlined text-sm">rocket_launch</span>
          <span>View All Opportunities</span>
        </button>
      </div>

      {/* 1. Impact vs Effort Matrix Visual */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 md:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Impact vs Effort Prioritization Matrix
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              X-axis: Effort (1–10) • Y-axis: Business Impact (1–10) • Bubble size: Monthly Search Opportunity
            </p>
          </div>

          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl text-xs font-semibold">
            {['all', 'Create Now', 'Strategic Bet', 'Deprioritize'].map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => setSelectedQuadrant(q)}
                className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                  selectedQuadrant === q
                    ? 'bg-white text-blue-700 font-bold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {q === 'all' ? 'All Quadrants' : q}
              </button>
            ))}
          </div>
        </div>

        {/* Scatter Chart */}
        <div className="h-80 w-full relative">
          {/* Subtle Background Quadrant Guidelines */}
          <div className="absolute inset-0 pointer-events-none grid grid-cols-2 grid-rows-2 p-8 opacity-25">
            <div className="border-r border-b border-dashed border-emerald-500 bg-emerald-50/20 flex items-start justify-start p-2">
              <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">
                Create Now (High Impact / Low Effort)
              </span>
            </div>
            <div className="border-b border-dashed border-purple-500 bg-purple-50/20 flex items-start justify-end p-2">
              <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wider">
                Strategic Bets (High Impact / High Effort)
              </span>
            </div>
            <div className="border-r border-dashed border-slate-300 flex items-end justify-start p-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Quick Wins (Low Effort)
              </span>
            </div>
            <div className="flex items-end justify-end p-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Deprioritize (High Effort / Low Impact)
              </span>
            </div>
          </div>

          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 30, bottom: 20, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis
                type="number"
                dataKey="effort"
                name="Effort"
                domain={[0, 10]}
                unit="/10"
                tick={{ fontSize: 11, fill: '#64748b' }}
                label={{ value: 'Effort Required →', position: 'bottom', offset: 0, fontSize: 11, fill: '#64748b' }}
              />
              <YAxis
                type="number"
                dataKey="impact"
                name="Impact"
                domain={[0, 10]}
                unit="/10"
                tick={{ fontSize: 11, fill: '#64748b' }}
                label={{ value: '↑ Business Impact', angle: -90, position: 'left', offset: 0, fontSize: 11, fill: '#64748b' }}
              />
              <ZAxis
                type="number"
                dataKey="searchOpportunity"
                range={[80, 500]}
                name="Search Demand"
              />
              <Tooltip
                cursor={{ strokeDasharray: '3 3' }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-md text-xs max-w-xs">
                        <div className="font-bold text-slate-900 mb-1">{data.title}</div>
                        <div className="text-slate-600 flex items-center justify-between gap-4">
                          <span>Business Impact:</span>
                          <strong className="text-blue-700">{data.impact} / 10</strong>
                        </div>
                        <div className="text-slate-600 flex items-center justify-between gap-4">
                          <span>Effort Required:</span>
                          <strong>{data.effort} / 10</strong>
                        </div>
                        <div className="text-slate-600 flex items-center justify-between gap-4">
                          <span>Monthly Search Demand:</span>
                          <strong className="text-emerald-700">{data.searchOpportunity.toLocaleString()} / mo</strong>
                        </div>
                        <div className="mt-2 pt-1 border-t border-slate-100 flex items-center justify-between text-[10px]">
                          <span className="font-bold text-slate-500 uppercase">{data.quadrant}</span>
                          <span className="text-blue-600 font-semibold">{data.audience}</span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Scatter name="Content Topics" data={displayedTopics}>
                {displayedTopics.map((entry) => (
                  <Cell key={`cell-${entry.id}`} fill={getQuadrantColor(entry.quadrant)} />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>

        {/* Matrix Legend */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-slate-700 font-medium">
              <span className="w-3 h-3 rounded-full bg-blue-700"></span>
              Create Now (High Impact / Feasible)
            </span>
            <span className="flex items-center gap-1.5 text-slate-700 font-medium">
              <span className="w-3 h-3 rounded-full bg-purple-600"></span>
              Strategic Bets (Longer Horizon)
            </span>
            <span className="flex items-center gap-1.5 text-slate-500">
              <span className="w-3 h-3 rounded-full bg-slate-400"></span>
              Deprioritize
            </span>
          </div>
          <span className="text-[11px] text-slate-400">
            Bubble circumference proportional to search opportunity volume
          </span>
        </div>
      </div>

      {/* 2. "Create Now" High Priority Callout Cards */}
      <div className="bg-gradient-to-br from-blue-50/80 to-indigo-50/50 rounded-3xl border border-blue-200/80 p-6 md:p-8">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-600 text-white text-xs font-bold uppercase tracking-wider mb-2">
              <span className="material-symbols-outlined text-sm">bolt</span>
              Primary Execution Queue
            </div>
            <h2 className="text-xl md:text-2xl font-extrabold text-slate-900">
              Create Now (Highest Return on Effort)
            </h2>
            <p className="text-xs md:text-sm text-slate-600 mt-1">
              Topical assets that deliver high commercial pipeline value with moderate engineering/content effort.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {createNowTopics.map((topic) => {
            const isAdded = addedItems[topic.id];

            return (
              <div
                key={topic.id}
                className="bg-white rounded-2xl border border-blue-100 p-5 shadow-2xs hover:shadow-sm transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100 uppercase tracking-wider">
                      {topic.category}
                    </span>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {topic.searchOpportunity.toLocaleString()} searches/mo
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 leading-snug">
                    {topic.title}
                  </h3>

                  <div className="mt-3 flex items-center gap-3 text-xs text-slate-500">
                    <span>Impact: <strong className="text-slate-800">{topic.impact}/10</strong></span>
                    <span>•</span>
                    <span>Effort: <strong className="text-slate-800">{topic.effort}/10</strong></span>
                    <span>•</span>
                    <span className="truncate">Audience: <strong className="text-slate-800">{topic.audience}</strong></span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-blue-600">
                    Ready to schedule
                  </span>

                  <button
                    type="button"
                    onClick={() => handleAddTopic(topic)}
                    disabled={isAdded}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      isAdded
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs'
                    }`}
                  >
                    <span className="material-symbols-outlined text-xs">
                      {isAdded ? 'check_circle' : 'add_task'}
                    </span>
                    <span>{isAdded ? 'Added to Plan' : 'Add to 90-Day Plan'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Detailed Content Opportunities Section */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 md:p-8 shadow-sm">
        <div className="mb-6">
          <h2 className="text-lg font-bold text-slate-900">
            Content Opportunities & Gap Audit
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Specific asset blueprints detailing target audience, commercial relevance, and recommended asset specifications.
          </p>
        </div>

        <div className="space-y-3.5">
          {contentOpportunities.map((opp) => {
            const isAdded = addedItems[opp.id];

            return (
              <div
                key={opp.id}
                className="p-4 md:p-5 rounded-2xl border border-slate-200/80 hover:border-slate-300 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-2xs"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 uppercase tracking-wider">
                      Target Audience: {opp.audience}
                    </span>
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      Relevance: {opp.businessRelevance}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900">
                    {opp.topic}
                  </h3>

                  <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600">
                    <div>
                      <span className="text-slate-400 font-medium">Search Demand: </span>
                      <strong className="text-slate-800">{opp.searchDemand}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 font-medium">Current Coverage: </span>
                      <span className="text-red-600 font-semibold">{opp.currentCoverage}</span>
                    </div>
                  </div>

                  <div className="mt-2 text-xs text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-200/60">
                    <strong>Recommended Content:</strong> {opp.recommendedContent}
                  </div>
                </div>

                <div className="lg:pl-4 lg:border-l lg:border-slate-100 flex lg:flex-col items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => handleAddTopic(opp)}
                    disabled={isAdded}
                    className={`w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isAdded
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs'
                    }`}
                  >
                    <span className="material-symbols-outlined text-xs">
                      {isAdded ? 'check_circle' : 'add_task'}
                    </span>
                    <span>{isAdded ? 'In 90-Day Plan' : 'Add to Plan'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
