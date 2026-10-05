import React from 'react';

/**
 * OpportunityDetailModal - Deep-dive analytical modal for an opportunity card.
 * Displays current bottleneck, expected commercial gain, and step-by-step rollout milestones.
 */
export default function OpportunityDetailModal({ opportunity, onClose, onAddToPlan, isInPlan }) {
  if (!opportunity) return null;

  const { deepDive = {}, tags = [] } = opportunity;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 uppercase tracking-wider">
                {opportunity.category}
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-xs font-semibold text-slate-500">
                Priority: {opportunity.priority}
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-slate-900 leading-tight">
              {opportunity.title}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Impact</span>
              <span className="text-sm font-bold text-slate-900">{opportunity.impact}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Relevance</span>
              <span className="text-sm font-bold text-blue-700">{opportunity.relevanceScore} / 100</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Estimated Effort</span>
              <span className="text-sm font-bold text-slate-900">{opportunity.effortWeeks}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Confidence</span>
              <span className="text-sm font-bold text-emerald-700">{opportunity.confidence}</span>
            </div>
          </div>

          {/* Evidence & Action */}
          <div className="space-y-3">
            <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80">
              <span className="text-xs font-bold text-amber-900 uppercase tracking-wider block mb-1">
                Why this matters (Deterministic Evidence)
              </span>
              <p className="text-xs md:text-sm text-amber-800 leading-relaxed">
                {opportunity.whyThisMatters}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200/80">
              <span className="text-xs font-bold text-blue-900 uppercase tracking-wider block mb-1">
                Recommended Action
              </span>
              <p className="text-xs md:text-sm text-blue-800 leading-relaxed font-medium">
                {opportunity.recommendedAction}
              </p>
            </div>
          </div>

          {/* Deep Dive: Bottleneck & Gain */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                Observed Bottleneck
              </span>
              <p className="text-xs text-slate-600 leading-relaxed">
                {deepDive.currentBottleneck || 'Friction point detected in customer acquisition analytics.'}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
              <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider block mb-1">
                Projected Pipeline Gain
              </span>
              <p className="text-xs text-emerald-800 leading-relaxed font-medium">
                {deepDive.expectedGain || 'Significant lift in conversion efficiency and qualified revenue.'}
              </p>
            </div>
          </div>

          {/* Implementation Milestones */}
          {deepDive.milestones && deepDive.milestones.length > 0 && (
            <div>
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-3">
                Recommended Rollout Milestones
              </span>
              <div className="space-y-2">
                {deepDive.milestones.map((m, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 flex items-start gap-3 text-xs text-slate-700"
                  >
                    <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0 mt-0.5 text-[11px]">
                      {idx + 1}
                    </div>
                    <span>{m}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 pt-2">
              <span className="text-xs text-slate-400 mr-1">Classification:</span>
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[11px] font-medium"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-6 border-t border-slate-100 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-slate-600 hover:text-slate-900 font-medium text-xs transition-colors cursor-pointer"
          >
            Close Analysis
          </button>

          <button
            type="button"
            onClick={() => {
              onAddToPlan(opportunity);
              onClose();
            }}
            disabled={isInPlan}
            className={`inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              isInPlan
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'
            }`}
          >
            <span className="material-symbols-outlined text-xs">
              {isInPlan ? 'check_circle' : 'add_task'}
            </span>
            <span>{isInPlan ? 'Already in 90-Day Plan' : 'Add to 90-Day Action Plan'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
