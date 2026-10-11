import React, { useState } from 'react';
import { defaultAIService } from '../services/AIService';

/**
 * ExecutiveStrategyScreen - The Strategic Reasoning Layer
 * 
 * Answers: "What should we do?"
 * 
 * Features:
 * - Clear STRATEGY Mode Header
 * - Persona Switcher (Founder, CMO, Growth Strategist, SEO Strategist, Product Marketer, Analyst)
 * - AI Hypotheses with interactive "Verify with BI" trigger
 * - Strategic Recommendations strictly following:
 *   Recommendation → Why → Evidence → Confidence → Recommended Action
 * - "Challenge Strategy" adversarial review drawer / modal
 * - Strategic Risks & 90-Day Execution Plan integration
 */
export default function ExecutiveStrategyScreen({
  strategyData,
  activePersona = 'Founder',
  onChangePersona,
  onNavigateToIntelligence,
  onNavigateToPlan,
  onNavigateToOpportunities,
  onOpenWhatIf,
  onOpenChallenge,
  onAddTaskToPlan,
}) {
  const [hypotheses, setHypotheses] = useState(() => defaultAIService.generateHypotheses());
  const [verifyingHypothesisId, setVerifyingHypothesisId] = useState(null);
  const [verifiedDetailModal, setVerifiedDetailModal] = useState(null);
  const [addedRecommendationIds, setAddedRecommendationIds] = useState([]);

  // Personas from Requirement 12
  const personas = [
    { id: 'Founder', label: 'Founder', desc: 'Business impact, contract valuation & capital efficiency' },
    { id: 'CMO', label: 'CMO', desc: 'Market reach, brand positioning & customer acquisition' },
    { id: 'Growth Strategist', label: 'Growth Strategist', desc: 'High-leverage conversion funnels & experiments' },
    { id: 'SEO Strategist', label: 'SEO Strategist', desc: 'Search indexation, AEO & topical authority' },
    { id: 'Product Marketer', label: 'Product Marketer', desc: 'Feature adoption, buyer personas & packaging' },
    { id: 'Analyst', label: 'Analyst', desc: 'Evidence verification, statistical rigor & cohort metrics' },
  ];

  // Recommendations adhering strictly to Requirement 2
  const recommendations = [
    defaultAIService.generateRecommendation('enterprise'),
    defaultAIService.generateRecommendation('content_bridge'),
    defaultAIService.generateRecommendation('geo'),
  ];

  const handleVerifyWithBI = (hypId) => {
    setVerifyingHypothesisId(hypId);
    setTimeout(() => {
      const result = defaultAIService.verifyHypothesis(hypId);
      setHypotheses((prev) =>
        prev.map((h) => (h.id === hypId ? { ...h, verified: true, verifiedResult: result } : h))
      );
      setVerifyingHypothesisId(null);
      setVerifiedDetailModal(result);
    }, 700);
  };

  const handleAddActionToPlan = (rec, index) => {
    const task = {
      id: `task-rec-${index}`,
      month: 1,
      monthTitle: 'Month 1 — Foundation',
      task: rec.recommendedAction,
      category: 'Strategic Priority',
      priority: 'P1 — Critical',
      expectedImpact: rec.why,
      effort: '2-3 Weeks',
      status: 'todo',
      strategicRationale: rec.recommendation,
    };
    if (onAddTaskToPlan) {
      onAddTaskToPlan(task);
    }
    setAddedRecommendationIds((prev) => [...prev, index]);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8 animate-fadeIn">
      {/* Top Strategy Mode Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 uppercase tracking-wide">
              STRATEGY LAYER
            </span>
            <span className="text-xs text-slate-500">• Answers: "What should we do?"</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            AI Growth Strategy & Reasoning Canvas
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
            Every recommendation is grounded in verified BI evidence, explicit confidence scores, and structured hypotheses.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenChallenge}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold border border-amber-300 shadow-2xs transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm text-amber-600">gavel</span>
            <span>Challenge Strategy</span>
          </button>
          <button
            type="button"
            onClick={onNavigateToIntelligence}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm text-blue-600">analytics</span>
            <span>Inspect BI Layer</span>
          </button>
        </div>
      </div>

      {/* Persona Lens Switcher (Section 12) */}
      <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Strategy Persona Perspective (Data remains identical; lens & emphasis adapt):
          </span>
          <span className="text-xs text-slate-500">Active: <strong>{activePersona}</strong></span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {personas.map((p) => {
            const isActive = activePersona === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => onChangePersona && onChangePersona(p.id)}
                className={`p-2.5 rounded-xl text-left transition-all cursor-pointer border ${
                  isActive
                    ? 'bg-white border-blue-500 shadow-xs ring-1 ring-blue-500/30'
                    : 'bg-white/60 hover:bg-white border-slate-200/70'
                }`}
              >
                <div className="text-xs font-bold text-slate-900">{p.label}</div>
                <div className="text-[10px] text-slate-500 leading-tight mt-0.5 line-clamp-2">
                  {p.desc}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Executive Summary & Current State (Section 15) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <span className="material-symbols-outlined text-blue-600">description</span>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">Executive Summary</h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
            {strategyData?.executiveSummary?.summaryText ||
              'Acme Intelligence has established strong product-market validation in the enterprise AI customer resolution space. However, marketing resources are currently over-allocated toward top-of-funnel informational blog traffic rather than converting high-intent enterprise buyers. Prioritizing dedicated enterprise solution pages and consultative funnels represents the single fastest lever to unlock $4.8M+ in incremental pipeline over the next 90 days.'}
          </p>

          <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-200 space-y-1.5 text-xs text-blue-900">
            <span className="font-bold text-blue-800">Persona Lens Context ({activePersona}):</span>
            <p className="text-[11px] leading-relaxed">
              {activePersona === 'Founder'
                ? 'Emphasizes capital efficiency and average contract valuation ($78.5K enterprise vs $12.8K SMB).'
                : activePersona === 'CMO'
                ? 'Emphasizes market share, brand citations in AI answer engines, and pipeline quality.'
                : activePersona === 'Analyst'
                ? 'Highlights statistical confidence, cohort retention, and verified BI metrics.'
                : 'Focuses on actionable experiment velocity and high-impact landing page optimization.'}
            </p>
          </div>
        </div>

        {/* Current State Snapshot */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <span className="material-symbols-outlined text-emerald-600">domain</span>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">Current State</h2>
          </div>
          <ul className="space-y-3 text-xs text-slate-600">
            <li className="flex items-start gap-2">
              <span className="material-symbols-outlined text-emerald-500 text-sm mt-0.5">check_circle</span>
              <span><strong>Total Monthly Visits:</strong> 128,450 (86.2K Organic)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="material-symbols-outlined text-emerald-500 text-sm mt-0.5">check_circle</span>
              <span><strong>Active Pipeline Value:</strong> $14.85M across 6,191 leads</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="material-symbols-outlined text-amber-500 text-sm mt-0.5">warning</span>
              <span><strong>Conversion Softening:</strong> Enterprise demo rate fell from 8.7% to 6.1%</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="material-symbols-outlined text-rose-500 text-sm mt-0.5">cancel</span>
              <span><strong>Discoverability Deficit:</strong> Competitors hold 41% citation share in ChatGPT/Perplexity</span>
            </li>
          </ul>
        </div>
      </div>

      {/* SECTION 6 MANDATE: AI Hypotheses with "Verify with BI" */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-indigo-600 text-xl">science</span>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                AI Strategic Hypotheses (Awaiting or Grounded in BI Verification)
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              The AI formulates hypotheses before converting observations into recommendations. Click "Verify with BI" to query the analytical layer.
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700">
            Core Scientific Loop
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {hypotheses.map((hyp) => {
            const isVerifying = verifyingHypothesisId === hyp.id;
            return (
              <div
                key={hyp.id}
                className={`p-5 rounded-2xl border transition-all space-y-3.5 ${
                  hyp.verified
                    ? 'border-emerald-300 bg-emerald-50/20'
                    : 'border-slate-200 bg-slate-50/40 hover:border-indigo-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Hypothesis
                  </span>
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      hyp.verified
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-indigo-100 text-indigo-800'
                    }`}
                  >
                    {hyp.verified ? 'Verified with BI ✓' : `${hyp.confidence}% Confidence`}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 leading-snug">
                  "{hyp.statement}"
                </h3>

                <div className="space-y-1.5 text-xs text-slate-600">
                  <span className="font-bold text-slate-700 block">Available Evidence:</span>
                  <ul className="list-disc pl-4 space-y-1 text-[11px] text-slate-600">
                    {hyp.availableEvidence.map((ev, i) => (
                      <li key={i}>{ev}</li>
                    ))}
                  </ul>
                </div>

                <div className="pt-2 border-t border-slate-200/70 flex items-center justify-between">
                  {hyp.verified ? (
                    <button
                      type="button"
                      onClick={() => setVerifiedDetailModal(hyp.verifiedResult)}
                      className="text-xs font-bold text-emerald-700 hover:text-emerald-800 inline-flex items-center gap-1 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-xs">verified</span>
                      <span>Inspect BI Evidence</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleVerifyWithBI(hyp.id)}
                      disabled={isVerifying}
                      className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer disabled:opacity-50"
                    >
                      {isVerifying ? (
                        <>
                          <span className="w-3 h-3 rounded-full border-2 border-white border-t-transparent animate-spin" />
                          <span>Querying BI...</span>
                        </>
                      ) : (
                        <>
                          <span className="material-symbols-outlined text-xs">analytics</span>
                          <span>Verify with BI</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 2 MANDATE: Strategic Recommendations (Recommendation -> Why -> Evidence -> Confidence -> Action) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Strategic Recommendations
            </h2>
            <p className="text-xs text-slate-500">
              Strict Principle: Every recommendation must show Why, Evidence, Confidence, and Action.
            </p>
          </div>
          <span className="text-xs text-slate-500">
            {recommendations.length} Active Recommendations
          </span>
        </div>

        <div className="space-y-4">
          {recommendations.map((rec, idx) => {
            const isAdded = addedRecommendationIds.includes(idx);
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4 hover:border-blue-300 transition-all"
              >
                {/* 1. Recommendation Title & Confidence */}
                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-3">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">
                      Strategic Recommendation #{idx + 1}
                    </span>
                    <h3 className="text-base font-extrabold text-slate-900">
                      {rec.recommendation}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                      {rec.confidence}% Confidence
                    </span>
                    <button
                      type="button"
                      onClick={() => handleAddActionToPlan(rec, idx)}
                      disabled={isAdded}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        isAdded
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default'
                          : 'bg-blue-600 hover:bg-blue-700 text-white shadow-2xs'
                      }`}
                    >
                      {isAdded ? 'Added to Plan ✓' : 'Add Action to Plan'}
                    </button>
                  </div>
                </div>

                {/* 2. Why & 3. Evidence */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 text-xs">
                  <div className="lg:col-span-5 p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                    <span className="font-bold text-slate-900 block">Why this matters:</span>
                    <p className="text-slate-600 leading-relaxed">{rec.why}</p>
                  </div>

                  <div className="lg:col-span-7 p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                    <span className="font-bold text-slate-900 block">Supporting BI Evidence:</span>
                    <ul className="list-disc pl-4 space-y-1 text-slate-600 text-[11px]">
                      {rec.evidence.map((ev, i) => (
                        <li key={i}>{ev}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* 4. Recommended Action */}
                <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200 text-xs flex flex-wrap items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <span className="font-bold text-blue-900 block">Recommended Action:</span>
                    <p className="text-blue-950 font-medium">{rec.recommendedAction}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Strategic Risks & 90-Day Execution Plan Banner */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risks */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
            <span className="material-symbols-outlined text-rose-600">gpp_maybe</span>
            <h3 className="text-sm font-bold text-slate-900">Strategic Risks & Failure Modes</h3>
          </div>
          <ul className="space-y-2 text-xs text-slate-600">
            <li className="p-2.5 rounded-lg bg-rose-50/50 border border-rose-100">
              <strong className="text-rose-900">Sales Cycle Lag:</strong> Enterprise contracts take 74 days to close; near-term cashflow requires maintaining self-serve SMB baseline.
            </li>
            <li className="p-2.5 rounded-lg bg-amber-50/50 border border-amber-100">
              <strong className="text-amber-900">Content Cannibalization:</strong> Transitioning top blog posts to commercial CTAs must avoid triggering search ranking drops.
            </li>
          </ul>
        </div>

        {/* 90-Day Roadmap Link */}
        <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white rounded-2xl p-6 shadow-sm flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider">
              Execution Roadmap
            </span>
            <h3 className="text-lg font-black text-white">90-Day Strategic Action Plan</h3>
            <p className="text-xs text-indigo-200 leading-relaxed">
              Every approved recommendation is sequenced into Phase 1 (Foundation), Phase 2 (Acceleration), and Phase 3 (Expansion).
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onNavigateToPlan}
              className="px-4 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-400 text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
            >
              Open 90-Day Plan →
            </button>
            <button
              type="button"
              onClick={onNavigateToOpportunities}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-xs border border-white/20 transition-all cursor-pointer"
            >
              Explore Opportunities
            </button>
          </div>
        </div>
      </div>

      {/* MODAL: Verified BI Detail Modal */}
      {verifiedDetailModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-600">verified</span>
                <h3 className="font-extrabold text-slate-900 text-sm">
                  BI Evidence Verification Confirmed
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setVerifiedDetailModal(null)}
                className="text-slate-400 hover:text-slate-600 text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-950 font-medium leading-relaxed">
                {verifiedDetailModal.strategicReasoning}
              </div>

              <div className="space-y-2">
                <span className="font-bold text-slate-800">Verified Evidence Metrics:</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {verifiedDetailModal.evidence?.map((ev, i) => (
                    <div key={i} className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                      <div className="text-[11px] text-slate-500 font-medium">{ev.label}</div>
                      <div className="text-sm font-bold text-slate-900">{ev.value}</div>
                      <div className="text-[10px] text-slate-500">{ev.comparison}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setVerifiedDetailModal(null)}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
