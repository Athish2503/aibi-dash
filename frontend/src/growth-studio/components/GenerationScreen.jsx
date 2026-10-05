import React, { useState, useEffect } from 'react';

/**
 * GenerationScreen - Screen 5 of 10 in AI Growth Strategy Studio
 * Staged, intelligent generation animation showing multi-stage deterministic analysis.
 */
export default function GenerationScreen({ onComplete, companyName = 'Acme Intelligence' }) {
  const [currentStageIdx, setCurrentStageIdx] = useState(0);

  const stages = [
    {
      title: 'Analyzing company...',
      completedLabel: 'Company profile & offering footprint mapped',
      detail: `Synthesized ICP personas, competitive moat and value proposition for ${companyName}.`,
      icon: 'business',
    },
    {
      title: 'Analyzing audience...',
      completedLabel: 'Audience segments & value cohorts evaluated',
      detail: 'Determined Enterprise segment yields 4.82% conversion and $52k avg contract value.',
      icon: 'groups',
    },
    {
      title: 'Analyzing market...',
      completedLabel: 'Market demand & search gaps computed',
      detail: 'Identified 68,000+ monthly high-intent keyword demand across 4 core commercial clusters.',
      icon: 'public',
    },
    {
      title: 'Analyzing content...',
      completedLabel: 'Content gaps & topical authority audited',
      detail: 'Audited 42% topic coverage; flagged zero coverage of competitor comparison paths.',
      icon: 'article',
    },
    {
      title: 'Building recommendations...',
      completedLabel: 'Priority opportunities scored & ranked',
      detail: 'Calculated Impact vs Effort coordinates for 8 strategic initiatives.',
      icon: 'balance',
    },
    {
      title: 'Building strategy...',
      completedLabel: 'Personalized 90-day action roadmap generated',
      detail: 'Sequenced Month 1 Foundation, Month 2 Authority, Month 3 Expansion.',
      icon: 'rocket_launch',
    },
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
    }, 700);

    return () => clearInterval(timer);
  }, [stages.length]);

  const isAllComplete = currentStageIdx >= stages.length;

  useEffect(() => {
    if (isAllComplete) {
      const finishTimer = setTimeout(() => {
        onComplete();
      }, 1200);
      return () => clearTimeout(finishTimer);
    }
  }, [isAllComplete, onComplete]);

  const progressPercent = Math.min(100, Math.round((currentStageIdx / stages.length) * 100));

  return (
    <div className="max-w-2xl mx-auto py-12 px-4 md:px-6 animate-fade-in flex flex-col items-center">
      {/* Header Tag */}
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/80 text-blue-700 text-xs font-semibold mb-6">
        <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping"></span>
        AI Growth Engine Synthesis
      </div>

      <h1 className="text-2xl md:text-3xl font-bold text-slate-900 text-center mb-2">
        Synthesizing Your Growth Strategy
      </h1>
      <p className="text-sm text-slate-500 text-center max-w-md mb-8">
        Correlating multi-dimensional signals across your audience, content, and competitive landscape.
      </p>

      {/* Progress Bar */}
      <div className="w-full bg-slate-100 rounded-full h-2 mb-8 overflow-hidden border border-slate-200">
        <div
          className="bg-blue-600 h-full rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Staged Intelligence Cards */}
      <div className="w-full space-y-3 mb-8">
        {stages.map((stg, idx) => {
          const isDone = currentStageIdx > idx;
          const isCurrent = currentStageIdx === idx;

          return (
            <div
              key={stg.title}
              className={`p-4 rounded-xl border transition-all duration-300 flex items-start gap-3.5 ${
                isDone
                  ? 'bg-white border-emerald-200 shadow-2xs'
                  : isCurrent
                  ? 'bg-blue-50/70 border-blue-500 shadow-xs ring-1 ring-blue-200'
                  : 'bg-slate-50/40 border-slate-200/60 opacity-40'
              }`}
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold transition-colors ${
                  isDone
                    ? 'bg-emerald-100 text-emerald-700'
                    : isCurrent
                    ? 'bg-blue-600 text-white animate-pulse'
                    : 'bg-slate-200 text-slate-500'
                }`}
              >
                {isDone ? (
                  <span className="material-symbols-outlined text-sm">check</span>
                ) : (
                  <span className="material-symbols-outlined text-sm">{stg.icon}</span>
                )}
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3
                    className={`text-sm font-semibold ${
                      isDone
                        ? 'text-slate-800'
                        : isCurrent
                        ? 'text-blue-900 font-bold'
                        : 'text-slate-400'
                    }`}
                  >
                    {isDone ? `✓ ${stg.completedLabel}` : stg.title}
                  </h3>
                  {isCurrent && (
                    <span className="text-[11px] font-semibold text-blue-600 animate-pulse">
                      Processing...
                    </span>
                  )}
                  {isDone && (
                    <span className="text-[11px] font-medium text-emerald-600 flex items-center gap-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      Verified
                    </span>
                  )}
                </div>

                {(isDone || isCurrent) && (
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed animate-fade-in">
                    {stg.detail}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Manual Skip / Transition */}
      {isAllComplete && (
        <button
          type="button"
          onClick={onComplete}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-500/20 transition-all cursor-pointer animate-fade-in"
        >
          <span>View Executive Overview</span>
          <span className="material-symbols-outlined text-base">arrow_forward</span>
        </button>
      )}
    </div>
  );
}
