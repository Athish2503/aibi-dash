import React from 'react';
import { GROWTH_OBJECTIVE_OPTIONS } from '../data/mockStudioData';

/**
 * GrowthObjectiveScreen - Screen 3 of 10 in AI Growth Strategy Studio
 * Multi-objective selection + decisive primary objective ("What matters most?")
 */
export default function GrowthObjectiveScreen({
  selectedObjectives = ['leads', 'conversion'],
  primaryObjective = 'leads',
  onToggleObjective,
  onSetPrimaryObjective,
  onNext,
  onBack,
}) {
  const handleToggle = (id) => {
    onToggleObjective(id);
  };

  const handleSelectPrimary = (id) => {
    // If not already in selected list, toggle it in
    if (!selectedObjectives.includes(id)) {
      onToggleObjective(id);
    }
    onSetPrimaryObjective(id);
  };

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 md:px-6 animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
          Step 2 of 3: Strategic Intent
        </span>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mt-1">
          What are you trying to achieve?
        </h1>
        <p className="text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
          Select all applicable business goals. Your choices will calibrate the opportunity ranking model, content scoring, and roadmap priorities.
        </p>
      </div>

      {/* Part 1: Multi-Select Objectives */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs uppercase tracking-wider font-semibold text-slate-500">
            Target Objectives <span className="font-normal text-slate-400">({selectedObjectives.length} selected)</span>
          </h2>
          <span className="text-xs text-slate-500">Multiple selections permitted</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {GROWTH_OBJECTIVE_OPTIONS.map((opt) => {
            const isSelected = selectedObjectives.includes(opt.id);
            const isPrimary = primaryObjective === opt.id;

            return (
              <div
                key={opt.id}
                onClick={() => handleToggle(opt.id)}
                className={`relative p-4 rounded-xl border transition-all cursor-pointer select-none flex flex-col justify-between ${
                  isSelected
                    ? 'bg-blue-50/50 border-blue-500 shadow-xs'
                    : 'bg-white border-slate-200/80 hover:border-slate-300 hover:bg-slate-50/50'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                        isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      <span className="material-symbols-outlined text-lg">{opt.icon}</span>
                    </div>

                    <div
                      className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all ${
                        isSelected
                          ? 'bg-blue-600 border-blue-600 text-white'
                          : 'border-slate-300 bg-white'
                      }`}
                    >
                      {isSelected && <span className="material-symbols-outlined text-xs">check</span>}
                    </div>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900">{opt.title}</h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    {opt.description}
                  </p>
                </div>

                {isPrimary && (
                  <div className="mt-3 pt-2 border-t border-blue-200 flex items-center gap-1 text-[11px] font-bold text-blue-700">
                    <span className="material-symbols-outlined text-sm">star</span>
                    <span>Primary Strategic Focus</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Part 2: What matters most? (Primary selection) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm mb-8">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 mt-0.5">
            <span className="material-symbols-outlined text-lg">flag</span>
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">
              What matters most?
            </h2>
            <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
              When trade-offs occur between quick wins, brand authority, or traffic volume, which single objective takes absolute precedence?
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
          {GROWTH_OBJECTIVE_OPTIONS.filter((opt) => selectedObjectives.includes(opt.id)).map((opt) => {
            const isPrimary = primaryObjective === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => handleSelectPrimary(opt.id)}
                className={`px-3.5 py-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  isPrimary
                    ? 'bg-blue-600 border-blue-600 text-white shadow-sm ring-2 ring-blue-200'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span className="material-symbols-outlined text-sm">
                  {isPrimary ? 'check_circle' : 'radio_button_unchecked'}
                </span>
                <span className="truncate">{opt.title}</span>
              </button>
            );
          })}

          {selectedObjectives.length === 0 && (
            <div className="col-span-full py-3 text-center text-xs text-slate-400 italic">
              Select at least one objective above to designate what matters most.
            </div>
          )}
        </div>

        <div className="mt-4 p-3 rounded-xl bg-blue-50/60 border border-blue-100 flex items-center gap-2 text-xs text-blue-800">
          <span className="material-symbols-outlined text-base text-blue-600 shrink-0">info</span>
          <span>
            <strong>Impact:</strong> Designating <em>"{GROWTH_OBJECTIVE_OPTIONS.find(o => o.id === primaryObjective)?.title || 'Selected objective'}"</em> as primary directly weights your Opportunity Center scoring and Month 1 action sequencing.
          </span>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-2">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-slate-600 hover:text-slate-900 font-medium text-sm transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-base">arrow_back</span>
          <span>Back to Company Setup</span>
        </button>

        <button
          type="button"
          onClick={onNext}
          disabled={selectedObjectives.length === 0}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none text-white font-semibold text-sm shadow-md shadow-blue-500/20 transition-all cursor-pointer"
        >
          <span>Continue to Configuration</span>
          <span className="material-symbols-outlined text-base">arrow_forward</span>
        </button>
      </div>
    </div>
  );
}
