import React from 'react';

/**
 * OpportunityDetailModal - Deep-dive analytical modal for an opportunity card.
 * Displays all 9 Phase 2 required fields:
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
export default function OpportunityDetailModal({
  opportunity,
  onClose,
  onAddToPlan,
  isInPlan,
}) {
  if (!opportunity) return null;

  const {
    tags = [],
    currentState,
    evidence,
    businessImpact,
    audienceAffected,
    competitiveContext,
    recommendedAction,
    estimatedEffort,
    expectedValue,
    dependencies = [],
    deepDive = {},
  } = opportunity;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-start justify-between gap-4 bg-slate-50/70">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 uppercase tracking-wider">
                {opportunity.category}
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-xs font-semibold text-slate-500">
                Priority: {opportunity.priority}
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-xs font-mono font-bold text-emerald-700">
                Relevance: {opportunity.relevanceScore}/100
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

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Key Metrics Strip (Estimated Effort, Expected Value, Impact, Confidence) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Estimated Effort</span>
              <span className="text-sm font-bold text-slate-900 font-mono">
                {estimatedEffort || opportunity.effortWeeks}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
              <span className="text-[10px] uppercase font-bold text-emerald-700 block">Expected Value</span>
              <span className="text-sm font-bold text-emerald-950 font-mono">
                {expectedValue || '+$180,000 / qtr'}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Business Impact</span>
              <span className="text-sm font-bold text-slate-900">{opportunity.impact}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Data Confidence</span>
              <span className="text-sm font-bold text-blue-700 font-mono">
                {opportunity.confidence}
              </span>
            </div>
          </div>

          {/* Persona Explanation Note if available */}
          {opportunity.personaExplanation && (
            <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 text-amber-900 text-xs flex items-center gap-2">
              <span className="material-symbols-outlined text-base text-amber-700">stars</span>
              <span className="font-semibold">{opportunity.personaExplanation}</span>
            </div>
          )}

          {/* 1. Current State & 2. Evidence */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block mb-1 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm">history</span>
                <span>1. Current State</span>
              </span>
              <p className="text-xs text-slate-700 leading-relaxed font-normal">
                {currentState || deepDive.currentBottleneck || 'Current operational friction point.'}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200">
              <span className="text-[10px] font-bold text-amber-900 uppercase tracking-wider block mb-1 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm">analytics</span>
                <span>2. Deterministic Evidence</span>
              </span>
              <p className="text-xs text-amber-900 leading-relaxed font-normal">
                {evidence || opportunity.whyThisMatters}
              </p>
            </div>
          </div>

          {/* 3. Business Impact & 4. Audience Affected */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200">
              <span className="text-[10px] font-bold text-emerald-900 uppercase tracking-wider block mb-1 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm">trending_up</span>
                <span>3. Business Impact</span>
              </span>
              <p className="text-xs text-emerald-950 leading-relaxed font-semibold">
                {businessImpact || deepDive.expectedGain || 'Significant pipeline lift.'}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-200">
              <span className="text-[10px] font-bold text-purple-900 uppercase tracking-wider block mb-1 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm">groups</span>
                <span>4. Audience Affected</span>
              </span>
              <p className="text-xs text-purple-950 leading-relaxed font-medium">
                {audienceAffected || 'Enterprise buying committee & technical evaluators'}
              </p>
            </div>
          </div>

          {/* 5. Competitive Context */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block mb-1 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm">compare_arrows</span>
              <span>5. Competitive Context</span>
            </span>
            <p className="text-xs text-slate-700 leading-relaxed">
              {competitiveContext || 'Positions Acme against legacy incumbent technical debt.'}
            </p>
          </div>

          {/* 6. Recommended Action */}
          <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200">
            <span className="text-[10px] font-bold text-blue-900 uppercase tracking-wider block mb-1 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm">rocket_launch</span>
              <span>6. Recommended Action</span>
            </span>
            <p className="text-xs md:text-sm text-blue-950 leading-relaxed font-bold">
              {recommendedAction || opportunity.recommendedAction}
            </p>
          </div>

          {/* 7. Dependencies */}
          {dependencies && dependencies.length > 0 && (
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
              <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm">link</span>
                <span>Dependencies & Requirements</span>
              </span>
              <div className="space-y-1.5">
                {dependencies.map((dep, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs text-slate-600">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                    <span>{dep}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Implementation Milestones */}
          {deepDive.milestones && deepDive.milestones.length > 0 && (
            <div>
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2.5">
                Rollout Milestones
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

          {/* Classification Tags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
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
        <div className="p-5 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
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
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'
            }`}
          >
            <span className="material-symbols-outlined text-sm">
              {isInPlan ? 'check_circle' : 'add_task'}
            </span>
            <span>{isInPlan ? 'Already in 90-Day Plan' : 'Add to 90-Day Plan'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
