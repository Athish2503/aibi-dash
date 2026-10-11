import React, { useState, useEffect } from 'react';

/**
 * GenerationScreen - Staged AI Strategy Generation Experience
 * 
 * Mandate:
 * Do NOT use a generic loading spinner.
 * Show the AI reasoning process at a high level:
 * 1. Understanding company ✓
 * 2. Identifying strategic goals ✓
 * 3. Finding knowledge gaps ✓
 * 4. Analyzing audience ✓
 * 5. Analyzing market ✓
 * 6. Testing hypotheses ✓
 * 7. Validating with business data ✓
 * 8. Finding opportunities ✓
 * 9. Prioritizing actions ✓
 * 10. Building strategy ✓
 * 
 * Only show concise, user-safe progress states without exposing private chain-of-thought.
 */
export default function GenerationScreen({ onComplete, companyName = 'Acme Intelligence' }) {
  const [currentStageIdx, setCurrentStageIdx] = useState(0);

  const stages = [
    { title: 'Understanding company', detail: `Extracting commercial model and core offering footprint for ${companyName}.`, icon: 'business' },
    { title: 'Identifying strategic goals', detail: 'Aligning high-intent pipeline growth with revenue targets.', icon: 'flag' },
    { title: 'Finding knowledge gaps', detail: 'Evaluating knowledge confidence across customer motivations and objections.', icon: 'psychology' },
    { title: 'Analyzing audience', detail: 'Evaluating segment revenue contribution vs traffic share.', icon: 'groups' },
    { title: 'Analyzing market', detail: 'Auditing search intent and competitive alternative positioning.', icon: 'public' },
    { title: 'Testing hypotheses', detail: 'Formulating strategic hypotheses on enterprise efficiency and content bridges.', icon: 'science' },
    { title: 'Validating with business data', detail: 'Connecting to semantic BI layer for deterministic metric proof.', icon: 'analytics' },
    { title: 'Finding opportunities', detail: 'Scoring high-leverage growth levers by Impact, Effort, and Relevance.', icon: 'balance' },
    { title: 'Prioritizing actions', detail: 'Applying strategy persona lens and filtering quick wins.', icon: 'tune' },
    { title: 'Building strategy', detail: 'Assembling executive summary, evidence-backed recommendations, and 90-day plan.', icon: 'rocket_launch' },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentStageIdx((prev) => {
        if (prev < stages.length) {
          return prev + 1;
        }
        clearInterval(timer);
        return prev;
      });
    }, 450);

    return () => clearInterval(timer);
  }, [stages.length]);

  const isAllComplete = currentStageIdx >= stages.length;

  useEffect(() => {
    if (isAllComplete) {
      const finishTimer = setTimeout(() => {
        onComplete();
      }, 700);
      return () => clearTimeout(finishTimer);
    }
  }, [isAllComplete, onComplete]);

  const progressPercent = Math.min(100, Math.round((currentStageIdx / stages.length) * 100));

  return (
    <div className="max-w-2xl mx-auto py-10 px-4 md:px-6 animate-fadeIn flex flex-col items-center">
      {/* Header Tag */}
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold mb-4">
        <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
        <span>AI Strategic Reasoning Synthesis</span>
      </div>

      <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 text-center mb-2">
        Synthesizing Your Growth Strategy
      </h1>
      <p className="text-xs sm:text-sm text-slate-500 text-center max-w-md mb-6">
        Formulating evidence-grounded hypotheses, validating with BI, and building your personalized strategic roadmap.
      </p>

      {/* Progress Bar */}
      <div className="w-full bg-slate-100 rounded-full h-2 mb-6 overflow-hidden border border-slate-200">
        <div
          className="bg-blue-600 h-full rounded-full transition-all duration-300 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Staged Intelligence Cards */}
      <div className="w-full space-y-2 mb-6">
        {stages.map((stage, idx) => {
          const isDone = idx < currentStageIdx;
          const isCurrent = idx === currentStageIdx;

          return (
            <div
              key={stage.title}
              className={`p-3 rounded-xl border transition-all flex items-center justify-between text-xs ${
                isDone
                  ? 'bg-emerald-50/40 border-emerald-200 text-slate-800'
                  : isCurrent
                  ? 'bg-blue-50/60 border-blue-300 text-blue-900 shadow-2xs'
                  : 'bg-white border-slate-200/60 text-slate-400 opacity-60'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    isDone
                      ? 'bg-emerald-600 text-white'
                      : isCurrent
                      ? 'bg-blue-600 text-white animate-pulse'
                      : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  {isDone ? '✓' : idx + 1}
                </span>
                <span className="font-bold text-xs">{stage.title}</span>
              </div>

              <div className="text-[11px] font-medium text-slate-500 hidden sm:block max-w-[280px] truncate text-right">
                {isDone ? 'Verified' : isCurrent ? 'Processing...' : 'Queued'}
              </div>
            </div>
          );
        })}
      </div>

      {isAllComplete && (
        <div className="text-xs font-bold text-emerald-700 bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-200 animate-fadeIn">
          Strategy Synthesis Complete • Opening Executive Canvas...
        </div>
      )}
    </div>
  );
}
