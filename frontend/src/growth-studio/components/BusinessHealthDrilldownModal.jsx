import React, { useState } from 'react';

/**
 * BusinessHealthDrilldownModal - Deep-dive modal for the 6 core business health dimensions:
 * 1. Audience Fit
 * 2. Search Visibility
 * 3. Content Strength
 * 4. AI Discoverability
 * 5. Conversion Readiness
 * 6. Competitive Position
 * 
 * Strict Structure:
 * - Score (0-100)
 * - Why
 * - Evidence
 * - Problem
 * - Opportunity
 * - Recommended action
 */
export default function BusinessHealthDrilldownModal({
  healthItem,
  onClose,
  onAddActionToPlan,
  isInPlan,
}) {
  const [isAddedLocally, setIsAddedLocally] = useState(false);

  if (!healthItem) return null;

  const scoreColor =
    healthItem.score >= 75
      ? 'text-emerald-700 bg-emerald-50 border-emerald-300'
      : healthItem.score >= 55
      ? 'text-blue-700 bg-blue-50 border-blue-300'
      : 'text-amber-700 bg-amber-50 border-amber-300';

  const handleAdd = () => {
    onAddActionToPlan({
      id: `health-action-${healthItem.id}`,
      task: healthItem.recommendedAction,
      category: healthItem.category,
      priority: healthItem.score < 55 ? 'P1 — Critical' : 'P2 — High',
      expectedImpact: healthItem.opportunity || healthItem.why,
      effort: '2 Weeks',
      status: 'todo',
      month: healthItem.score < 55 ? 1 : 2,
      monthTitle: healthItem.score < 55 ? 'Month 1 — Foundation' : 'Month 2 — Authority',
      strategicRationale: `Derived from Business Health Diagnostic for ${healthItem.category}: ${healthItem.problem}`,
    });
    setIsAddedLocally(true);
  };

  const isAlreadyAdded = isInPlan || isAddedLocally;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-start justify-between gap-4 bg-slate-50/70">
          <div className="flex items-center gap-3.5">
            <div
              className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center border font-extrabold shadow-sm ${scoreColor}`}
            >
              <span className="text-xl leading-none">{healthItem.score}</span>
              <span className="text-[9px] uppercase tracking-wider font-bold mt-0.5 opacity-80">
                / 100
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Diagnostic Dimension
                </span>
                <span className="text-slate-300">•</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                  {healthItem.status}
                </span>
              </div>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight mt-0.5">
                {healthItem.category}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        {/* Modal Scrollable Body (Strictly structured per Requirement 7) */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {/* Why Section */}
          <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100">
            <span className="text-[10px] font-bold text-blue-900 uppercase tracking-wider block mb-1 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm">help</span>
              <span>Why This Score Was Assessed</span>
            </span>
            <p className="text-xs md:text-sm text-slate-800 leading-relaxed font-medium">
              {healthItem.why || healthItem.currentState}
            </p>
          </div>

          {/* Evidence Section */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block mb-1 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm">fact_check</span>
              <span>Observed Telemetry Evidence</span>
            </span>
            <p className="text-xs md:text-sm text-slate-700 leading-relaxed">
              {healthItem.evidence}
            </p>
          </div>

          {/* Problem Section */}
          <div className="p-4 rounded-2xl bg-red-50/60 border border-red-200">
            <span className="text-[10px] font-bold text-red-900 uppercase tracking-wider block mb-1 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm">warning</span>
              <span>Root Cause Problem</span>
            </span>
            <p className="text-xs md:text-sm text-red-950 leading-relaxed font-medium">
              {healthItem.problem}
            </p>
          </div>

          {/* Opportunity Section */}
          <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200">
            <span className="text-[10px] font-bold text-emerald-900 uppercase tracking-wider block mb-1 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm">trending_up</span>
              <span>Commercial Opportunity</span>
            </span>
            <p className="text-xs md:text-sm text-emerald-950 leading-relaxed font-medium">
              {healthItem.opportunity || 'Significant lift in conversion efficiency and qualified revenue.'}
            </p>
          </div>

          {/* Recommended Action Section */}
          <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200">
            <span className="text-[10px] font-bold text-indigo-900 uppercase tracking-wider block mb-1 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm">rocket_launch</span>
              <span>Prescribed Recommended Action</span>
            </span>
            <p className="text-xs md:text-sm text-indigo-950 leading-relaxed font-bold">
              {healthItem.recommendedAction || healthItem.recommendation}
            </p>
          </div>
        </div>

        {/* Footer with Add to 90-Day Plan Action */}
        <div className="p-4 md:p-5 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
          >
            Close
          </button>

          <button
            type="button"
            onClick={handleAdd}
            disabled={isAlreadyAdded}
            className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              isAlreadyAdded
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'
            }`}
          >
            <span className="material-symbols-outlined text-sm">
              {isAlreadyAdded ? 'check_circle' : 'add_task'}
            </span>
            <span>{isAlreadyAdded ? 'Added to 90-Day Plan' : 'Add Action to 90-Day Plan'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
