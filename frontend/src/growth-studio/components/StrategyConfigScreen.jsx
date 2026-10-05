import React from 'react';
import { STRATEGY_CONFIG_OPTIONS, GROWTH_OBJECTIVE_OPTIONS } from '../data/mockStudioData';

/**
 * StrategyConfigScreen - Screen 4 of 10 in AI Growth Strategy Studio
 * The pre-generation configuration screen defining focus, audience, depth, format, modules, and custom directives.
 */
export default function StrategyConfigScreen({
  company,
  objectives,
  primaryObjective,
  config,
  onUpdateConfig,
  onBuildStrategy,
  onBack,
}) {
  const primaryObjTitle =
    GROWTH_OBJECTIVE_OPTIONS.find((o) => o.id === primaryObjective)?.title || primaryObjective;

  const handleIncludeToggle = (id) => {
    const current = config.includes || [];
    const updated = current.includes(id)
      ? current.filter((item) => item !== id)
      : [...current, id];
    onUpdateConfig({ ...config, includes: updated });
  };

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 md:px-6 animate-fade-in">
      {/* Header */}
      <div className="mb-6">
        <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
          Step 3 of 3: Synthesis Parameters
        </span>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mt-1">
          Build your growth strategy
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Configure how analytical signals are synthesized, formatted, and weighted across your organization.
        </p>
      </div>

      {/* Summary Banner of Provided Inputs */}
      <div className="bg-blue-50/70 border border-blue-200/80 rounded-2xl p-4 md:p-5 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700">
            Active Context Summary
          </span>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-sm">
            <span className="font-bold text-slate-900">{company.name || 'Acme Intelligence'}</span>
            <span className="text-slate-400">•</span>
            <span className="text-slate-700">{company.industry || 'Enterprise B2B Software'}</span>
            <span className="text-slate-400">•</span>
            <span className="text-blue-700 font-semibold">Priority: {primaryObjTitle}</span>
          </div>
        </div>

        <button
          type="button"
          onClick={onBack}
          className="self-start md:self-auto text-xs font-semibold text-blue-700 hover:text-blue-900 hover:underline flex items-center gap-1 cursor-pointer"
        >
          <span className="material-symbols-outlined text-sm">edit</span>
          <span>Edit Context</span>
        </button>
      </div>

      {/* Main Configuration Form Cards */}
      <div className="space-y-6 mb-8">
        {/* 1. Primary Focus */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 md:p-6 shadow-2xs">
          <div className="mb-3">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Primary Focus
            </label>
            <p className="text-xs text-slate-500 mt-0.5">
              Select the core anchor metric to optimize your opportunity scoring against.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
            {STRATEGY_CONFIG_OPTIONS.primaryFocus.map((f) => {
              const active = config.primaryFocus === f.id;
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => onUpdateConfig({ ...config, primaryFocus: f.id })}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    active
                      ? 'bg-blue-50 border-blue-600 text-blue-900 ring-2 ring-blue-100 shadow-2xs'
                      : 'bg-slate-50/50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold">{f.label}</span>
                    <span className="material-symbols-outlined text-sm text-blue-600">
                      {active ? 'radio_button_checked' : 'radio_button_unchecked'}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 block leading-tight">{f.desc}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Target Audience & Depth Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Target Audience */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 md:p-6 shadow-2xs">
            <div className="mb-3">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Target Audience Tier
              </label>
              <p className="text-xs text-slate-500 mt-0.5">
                Which customer size segment receives priority treatment?
              </p>
            </div>

            <div className="space-y-2">
              {STRATEGY_CONFIG_OPTIONS.targetAudience.map((a) => {
                const active = config.targetAudience === a.id;
                return (
                  <div
                    key={a.id}
                    onClick={() => onUpdateConfig({ ...config, targetAudience: a.id })}
                    className={`px-3.5 py-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                      active
                        ? 'bg-blue-50/60 border-blue-500 text-blue-900 font-semibold'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <span className="text-xs">{a.label}</span>
                      <span className="text-[11px] text-slate-400 block font-normal">{a.desc}</span>
                    </div>
                    <span className="material-symbols-outlined text-sm text-blue-600">
                      {active ? 'check_circle' : 'radio_button_unchecked'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Strategy Depth & Format */}
          <div className="space-y-6">
            {/* Strategy Depth */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-1">
                Strategy Depth
              </label>
              <div className="grid grid-cols-3 gap-2">
                {STRATEGY_CONFIG_OPTIONS.strategyDepth.map((d) => {
                  const active = config.depth === d.id;
                  return (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => onUpdateConfig({ ...config, depth: d.id })}
                      className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                        active
                          ? 'bg-blue-600 border-blue-600 text-white font-bold'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 text-xs'
                      }`}
                    >
                      <span className="text-xs">{d.id}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Strategy Format */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-1">
                Strategy Format & Lens
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {STRATEGY_CONFIG_OPTIONS.strategyFormat.map((fmt) => {
                  const active = config.format === fmt.id;
                  return (
                    <button
                      key={fmt.id}
                      type="button"
                      onClick={() => onUpdateConfig({ ...config, format: fmt.id })}
                      className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                        active
                          ? 'bg-blue-600 border-blue-600 text-white font-bold'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 text-xs'
                      }`}
                    >
                      <span className="text-xs">{fmt.id}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* 3. Include Strategy Modules */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 md:p-6 shadow-2xs">
          <div className="mb-3">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Strategy Modules to Include
            </label>
            <p className="text-xs text-slate-500 mt-0.5">
              Toggle specific domains to incorporate into the multi-factor synthesis.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {STRATEGY_CONFIG_OPTIONS.includeOptions.map((opt) => {
              const isChecked = (config.includes || []).includes(opt.id);
              return (
                <div
                  key={opt.id}
                  onClick={() => handleIncludeToggle(opt.id)}
                  className={`p-3 rounded-xl border flex items-center gap-2.5 cursor-pointer select-none transition-all ${
                    isChecked
                      ? 'bg-blue-50/60 border-blue-500 text-blue-900 font-semibold'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded flex items-center justify-center border text-[10px] transition-all ${
                      isChecked ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300 bg-white'
                    }`}
                  >
                    {isChecked && <span className="material-symbols-outlined text-xs">check</span>}
                  </div>
                  <span className="text-xs">{opt.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 4. Free-Text Field */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 md:p-6 shadow-2xs">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
            Anything else the strategy should focus on?
          </label>
          <textarea
            rows={2}
            value={config.additionalNotes || ''}
            onChange={(e) => onUpdateConfig({ ...config, additionalNotes: e.target.value })}
            placeholder="Focus heavily on enterprise customers. Prioritize website improvements before content."
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-xs md:text-sm text-slate-800 placeholder-slate-400 outline-none transition-all resize-none"
          />
          <span className="text-[11px] text-slate-400 mt-1 block">
            Inject specific business constraints, technical trade-offs, or executive priorities.
          </span>
        </div>
      </div>

      {/* Primary Action CTA */}
      <div className="flex items-center justify-between pt-2">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-slate-600 hover:text-slate-900 font-medium text-sm transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-base">arrow_back</span>
          <span>Back to Objectives</span>
        </button>

        <button
          type="button"
          onClick={onBuildStrategy}
          className="inline-flex items-center gap-2.5 px-7 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-base shadow-lg shadow-blue-500/25 transition-all cursor-pointer group"
        >
          <span className="material-symbols-outlined text-lg group-hover:rotate-12 transition-transform">
            auto_awesome
          </span>
          <span>Build My Strategy</span>
          <span className="material-symbols-outlined text-lg">arrow_forward</span>
        </button>
      </div>
    </div>
  );
}
