import React, { useState, useMemo } from 'react';
import { calculateScenarioProjection } from '../data/mockStudioData';

/**
 * WhatIfScenarioModal - Interactive Scenario Planning & Sensitivity Analysis.
 * Answers: "What could happen if we improve this metric?"
 * Demonstrates Power BI What-If parameter integration with live recalculation.
 */
export default function WhatIfScenarioModal({ isOpen, onClose }) {
  // Scenario sliders state
  const [trafficGrowthPct, setTrafficGrowthPct] = useState(25);
  const [conversionRatePct, setConversionRatePct] = useState(4.5);
  const [enterpriseAudienceGrowthPct, setEnterpriseAudienceGrowthPct] = useState(35);
  const [contentProductionIncreasePct, setContentProductionIncreasePct] = useState(50);

  // Preset Configurations
  const presets = [
    {
      name: 'Balanced Roadmap',
      desc: 'Moderate improvements across all 4 levers',
      values: { traffic: 25, conv: 4.5, ent: 35, content: 50 },
    },
    {
      name: 'Enterprise Pivot',
      desc: 'Heavy push on high-ACV enterprise conversion & trust',
      values: { traffic: 10, conv: 5.2, ent: 65, content: 30 },
    },
    {
      name: 'Conversion Blitz',
      desc: 'Focus 100% on removing demo calendar drop-off',
      values: { traffic: 0, conv: 6.0, ent: 20, content: 15 },
    },
    {
      name: 'SEO & Content Scale',
      desc: 'High-volume topic pillar consolidation & reach',
      values: { traffic: 60, conv: 3.8, ent: 15, content: 120 },
    },
  ];

  const handleApplyPreset = (preset) => {
    setTrafficGrowthPct(preset.values.traffic);
    setConversionRatePct(preset.values.conv);
    setEnterpriseAudienceGrowthPct(preset.values.ent);
    setContentProductionIncreasePct(preset.values.content);
  };

  const handleReset = () => {
    setTrafficGrowthPct(0);
    setConversionRatePct(3.34);
    setEnterpriseAudienceGrowthPct(0);
    setContentProductionIncreasePct(0);
  };

  const projection = useMemo(() => {
    return calculateScenarioProjection(undefined, {
      trafficGrowthPct,
      conversionRatePct,
      enterpriseAudienceGrowthPct,
      contentProductionIncreasePct,
    });
  }, [
    trafficGrowthPct,
    conversionRatePct,
    enterpriseAudienceGrowthPct,
    contentProductionIncreasePct,
  ]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-5 md:p-6 border-b border-slate-100 flex items-start justify-between gap-4 bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20">
              <span className="material-symbols-outlined text-xl">tune</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200 uppercase tracking-wider">
                  Power BI What-If Engine
                </span>
                <span className="text-slate-300">•</span>
                <span className="text-xs font-semibold text-slate-500">
                  Deterministic Sensitivity Model
                </span>
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight mt-0.5">
                What-If Scenario Analysis
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

        {/* Modal Scrollable Body */}
        <div className="p-5 md:p-6 overflow-y-auto space-y-6 flex-1">
          {/* Preset Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">
                Presets:
              </span>
              {presets.map((p) => (
                <button
                  key={p.name}
                  type="button"
                  onClick={() => handleApplyPreset(p)}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 text-xs font-medium border border-slate-200 transition-colors cursor-pointer"
                  title={p.desc}
                >
                  {p.name}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={handleReset}
              className="text-xs text-slate-500 hover:text-slate-800 underline cursor-pointer"
            >
              Reset to Baseline
            </button>
          </div>

          {/* Interactive Sliders Grid (Power BI What-If Parameters) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50/70 p-4 rounded-2xl border border-slate-200">
            {/* Slider 1: Traffic Growth */}
            <div className="space-y-1.5 bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800">
                  Organic Traffic Growth %
                </label>
                <span className="text-xs font-bold font-mono px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                  +{trafficGrowthPct}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={trafficGrowthPct}
                onChange={(e) => setTrafficGrowthPct(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>0% (124.5k)</span>
                <span>+50% (186.7k)</span>
                <span>+100% (249k)</span>
              </div>
            </div>

            {/* Slider 2: Conversion Rate */}
            <div className="space-y-1.5 bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800">
                  Funnel Conversion Rate %
                </label>
                <span className="text-xs font-bold font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {conversionRatePct.toFixed(2)}%
                </span>
              </div>
              <input
                type="range"
                min="1.0"
                max="8.0"
                step="0.25"
                value={conversionRatePct}
                onChange={(e) => setConversionRatePct(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>Baseline: 3.34%</span>
                <span>Top B2B: 5.20%</span>
                <span>Max: 8.00%</span>
              </div>
            </div>

            {/* Slider 3: Enterprise Audience Growth */}
            <div className="space-y-1.5 bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800">
                  Enterprise Audience Expansion %
                </label>
                <span className="text-xs font-bold font-mono px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200">
                  +{enterpriseAudienceGrowthPct}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={enterpriseAudienceGrowthPct}
                onChange={(e) => setEnterpriseAudienceGrowthPct(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>0% (18.2% share)</span>
                <span>+50% (27.3% share)</span>
                <span>+100% (36.4% share)</span>
              </div>
            </div>

            {/* Slider 4: Content Production Increase */}
            <div className="space-y-1.5 bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800">
                  Content Output & Coverage Increase %
                </label>
                <span className="text-xs font-bold font-mono px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                  +{contentProductionIncreasePct}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="200"
                step="10"
                value={contentProductionIncreasePct}
                onChange={(e) => setContentProductionIncreasePct(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>0% (42% cover)</span>
                <span>+100% (61% cover)</span>
                <span>+200% (80% cover)</span>
              </div>
            </div>
          </div>

          {/* Dynamic Impact Narrative Banner */}
          <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-start gap-3">
            <span className="material-symbols-outlined text-indigo-600 text-xl shrink-0 mt-0.5">
              auto_awesome
            </span>
            <div>
              <span className="text-[11px] font-bold text-indigo-900 uppercase tracking-wider block mb-0.5">
                Executive Scenario Synthesis
              </span>
              <p className="text-xs md:text-sm text-indigo-950 font-medium leading-relaxed">
                {projection.narrative}
              </p>
            </div>
          </div>

          {/* Full Scenario Comparison Table */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
            <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Scenario Sensitivity Ledger
              </span>
              <span className="text-[11px] text-slate-500">
                Comparing Current State vs Scenario State
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50/50 text-slate-400 text-[10px] uppercase font-bold border-b border-slate-200">
                    <th className="py-2.5 px-4">Metric</th>
                    <th className="py-2.5 px-3">Current State</th>
                    <th className="py-2.5 px-3">Scenario State</th>
                    <th className="py-2.5 px-3">Difference</th>
                    <th className="py-2.5 px-4">Potential Impact</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {projection.comparison.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4 font-semibold text-slate-900">
                        {row.metric}
                      </td>
                      <td className="py-3 px-3 text-slate-600 font-mono">
                        {row.currentState}
                      </td>
                      <td className="py-3 px-3 font-bold font-mono text-slate-900">
                        {row.scenarioState}
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`inline-flex items-center gap-1 font-mono font-bold px-2 py-0.5 rounded text-[11px] ${
                            row.positive
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {row.difference}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600 text-[11px] max-w-xs leading-normal">
                        {row.potentialImpact}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Power BI What-If Parameter DAX Specification */}
          <div className="bg-slate-900 rounded-2xl p-4 text-slate-300 font-mono text-xs space-y-2 border border-slate-800">
            <div className="flex items-center justify-between text-[11px] text-slate-400 border-b border-slate-800 pb-2">
              <span className="font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm">code</span>
                Power BI DAX What-If Implementation
              </span>
              <span>Supported in PBIR / Direct Lake</span>
            </div>
            <pre className="text-[11px] text-emerald-400 overflow-x-auto leading-relaxed">
              {projection.powerBiDax.measureDefinition}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            Simulates dynamic conversion recovery and pipeline velocity with deterministic equations.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
