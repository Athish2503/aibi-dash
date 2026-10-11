import React, { useState } from 'react';
import { defaultCompanyMemory } from '../services/CompanyMemoryService';
import { defaultAIService } from '../services/AIService';

/**
 * CompanyKnowledgeScreen - Company Understanding & Persistent Strategic Memory
 * 
 * Features:
 * - Section 5: Company Understanding model with visual confidence overview
 *   (Business Model 94%, Products 91%, Audience 74%, Competition 61%, Customer Motivation 48%)
 *   with "Help AI understand this" targeted question trigger.
 * - Section 19: Persistent Company Memory tracking previous strategic decisions,
 *   outcomes, results, hypotheses, and new learnings.
 */
export default function CompanyKnowledgeScreen({
  onLaunchTargetedQuestion,
  onStartInterview,
}) {
  const [memory, setMemory] = useState(() => defaultCompanyMemory.getMemory());
  const [newDecisionText, setNewDecisionText] = useState('');
  const [newRationaleText, setNewRationaleText] = useState('');
  const [isAddingDecision, setIsAddingDecision] = useState(false);

  const knowledgeAnalysis = defaultAIService.analyzeKnowledgeGaps();

  const handleRecordNewDecision = (e) => {
    e.preventDefault();
    if (!newDecisionText.trim()) return;
    const added = defaultCompanyMemory.addDecision({
      decision: newDecisionText,
      rationale: newRationaleText,
      champion: 'Executive Team',
    });
    setMemory({ ...defaultCompanyMemory.getMemory() });
    setNewDecisionText('');
    setNewRationaleText('');
    setIsAddingDecision(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8 animate-fadeIn">
      {/* Top Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase tracking-wide">
              KNOWLEDGE & MEMORY ENGINE
            </span>
            <span className="text-xs text-slate-500">• Section 5 & 19</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Company Understanding & Strategic Memory
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
            The AI continuously learns from past decisions and measures historical outcomes rather than treating every session as day zero.
          </p>
        </div>

        <button
          type="button"
          onClick={onStartInterview}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
        >
          <span className="material-symbols-outlined text-sm">forum</span>
          <span>Open Adaptive Interview</span>
        </button>
      </div>

      {/* Grid: Left = Section 5 Company Understanding, Right = Quick Facts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Section 5: Company Understanding Visual Confidence Overview */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-blue-600">psychology</span>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Company Understanding Model
              </h2>
            </div>
            <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full">
              Overall: {knowledgeAnalysis.overallConfidence}% Confidence
            </span>
          </div>

          <p className="text-xs text-slate-600">
            Visual confidence breakdown across key strategic dimensions. Weak areas restrict recommendation confidence until targeted information is provided.
          </p>

          <div className="space-y-4">
            {knowledgeAnalysis.areas.map((area) => (
              <div key={area.id} className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/40 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{area.title}</span>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                        area.confidence >= 80
                          ? 'bg-emerald-100 text-emerald-800'
                          : area.confidence >= 60
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {area.status}
                    </span>
                  </div>
                  <span className="font-mono font-bold text-slate-900">{area.confidence}%</span>
                </div>

                {/* Visual Progress Bar */}
                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      area.confidence >= 80
                        ? 'bg-emerald-500'
                        : area.confidence >= 60
                        ? 'bg-blue-500'
                        : 'bg-amber-500'
                    }`}
                    style={{ width: `${area.confidence}%` }}
                  />
                </div>

                <p className="text-[11px] text-slate-600">{area.summary}</p>

                {/* Section 5 Requirement: "We need more information about X" + "Help AI understand this" */}
                {area.gapNotice && (
                  <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-amber-200/60 text-xs text-amber-900 bg-amber-50/80 p-2.5 rounded-lg">
                    <span className="font-medium">{area.gapNotice}</span>
                    <button
                      type="button"
                      onClick={() => onLaunchTargetedQuestion && onLaunchTargetedQuestion(area)}
                      className="px-2.5 py-1 rounded-md bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-bold shadow-2xs transition-colors cursor-pointer"
                    >
                      Help AI understand this
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Company Facts & Assumptions */}
        <div className="lg:col-span-5 space-y-6">
          {/* Core Facts */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <span className="material-symbols-outlined text-indigo-600">business</span>
              <h3 className="text-sm font-bold text-slate-900">Stored Company Profile</h3>
            </div>
            <div className="space-y-2.5 text-xs">
              <div>
                <span className="text-slate-500 font-semibold block">Company Name:</span>
                <span className="font-bold text-slate-900">{memory.facts.companyName}</span>
              </div>
              <div>
                <span className="text-slate-500 font-semibold block">Business Model:</span>
                <span className="font-bold text-slate-900">{memory.facts.businessModel}</span>
              </div>
              <div>
                <span className="text-slate-500 font-semibold block">Primary Audience:</span>
                <span className="font-bold text-slate-900">{memory.facts.primaryAudience}</span>
              </div>
              <div>
                <span className="text-slate-500 font-semibold block">Core Differentiator:</span>
                <span className="font-bold text-slate-900">{memory.facts.coreDifferentiator}</span>
              </div>
            </div>
          </div>

          {/* Audience Assumptions */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
              <span className="material-symbols-outlined text-purple-600">fact_check</span>
              <h3 className="text-sm font-bold text-slate-900">Audience & Market Assumptions</h3>
            </div>
            <div className="space-y-2">
              {memory.assumptions.map((asm) => (
                <div key={asm.id} className="p-2.5 rounded-lg border border-slate-200 bg-slate-50/50 text-xs space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-800 font-medium">"{asm.statement}"</span>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.2 rounded inline-block ${
                      asm.status.includes('Validated')
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    Status: {asm.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 19 MANDATE: Company Strategic Memory & Decision-Outcome Feedback Loop */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-emerald-600 text-xl">history_edu</span>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Strategic Decisions & Observed Outcomes Log (Learning Loop)
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              The system retains previous decisions and evaluates subsequent metric changes to refine recommendations.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsAddingDecision(!isAddingDecision)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-xs">add</span>
            <span>Record New Decision</span>
          </button>
        </div>

        {/* Optional Add Decision Form */}
        {isAddingDecision && (
          <form onSubmit={handleRecordNewDecision} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <h4 className="text-xs font-bold text-slate-800">Record Strategic Decision in Company Memory</h4>
            <input
              type="text"
              value={newDecisionText}
              onChange={(e) => setNewDecisionText(e.target.value)}
              placeholder="e.g. Split pricing page into Self-Serve and Enterprise paths"
              className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white"
            />
            <input
              type="text"
              value={newRationaleText}
              onChange={(e) => setNewRationaleText(e.target.value)}
              placeholder="Rationale / Context"
              className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAddingDecision(false)}
                className="px-3 py-1.5 text-xs text-slate-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-bold cursor-pointer"
              >
                Save Decision
              </button>
            </div>
          </form>
        )}

        {/* Section 19 Concrete Example Display: Decision -> Outcome -> Result -> New Recommendation */}
        <div className="space-y-4">
          {memory.outcomes.map((outcome) => {
            const linkedDecision = memory.decisions.find((d) => d.id === outcome.decisionId) || {
              decision: 'Prioritize enterprise customers',
              date: '3 months ago',
            };

            return (
              <div
                key={outcome.id}
                className="p-5 rounded-2xl border border-slate-200 bg-slate-50/30 hover:border-emerald-300 transition-all space-y-3 text-xs"
              >
                {/* Previous Decision */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/60 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800 uppercase">
                      Previous Decision
                    </span>
                    <span className="font-extrabold text-slate-900 text-sm">
                      "{linkedDecision.decision}"
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500">{linkedDecision.date}</span>
                </div>

                {/* Outcome & Result */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-1">
                    <span className="font-bold text-slate-700 block">Observed Metric Outcome:</span>
                    <p className="text-slate-800 font-medium">{outcome.observedMetricChange}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-1">
                    <span className="font-bold text-slate-700 block">Synthesized Result:</span>
                    <p className="text-slate-600">{outcome.resultSynthesis}</p>
                  </div>
                </div>

                {/* New Learned Recommendation */}
                <div className="p-3.5 rounded-xl bg-emerald-50/80 border border-emerald-200 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-emerald-900">
                    <span className="material-symbols-outlined text-sm">psychology</span>
                    <span>Learned Strategic Takeaway:</span>
                  </div>
                  <p className="text-emerald-950 font-medium pl-5 leading-relaxed">
                    {outcome.strategicTakeaway}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
