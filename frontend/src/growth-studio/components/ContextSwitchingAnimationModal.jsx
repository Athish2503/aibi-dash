import React, { useState, useEffect } from 'react';

/**
 * ContextSwitchingAnimationModal - Staged AI Reasoning & Data Ingestion Animation
 * 
 * Displayed when switching company context or applying uploaded CSV data.
 * Shows multi-stage synthesis:
 * 1. Connecting to backend & parsing dataset records...
 * 2. Profiling segment-level conversion, CAC & revenue...
 * 3. Detecting channel efficiencies & statistical bottlenecks...
 * 4. Formulating evidence-grounded hypotheses for [Company Name]...
 * 5. Synthesizing executive briefing & 90-day execution roadmap...
 */
export default function ContextSwitchingAnimationModal({
  isOpen,
  companyName = 'Company',
  industry = 'Industry',
  sourceType = 'preset', // 'preset' | 'dataset' | 'custom'
  recordCount = null,
  onComplete,
}) {
  const [currentStepIdx, setCurrentStepIdx] = useState(0);

  const steps = [
    {
      title: 'Connecting to backend & ingesting data...',
      detail: recordCount ? `Parsing ${recordCount} records from uploaded dataset.` : `Loading ${companyName} profile & semantic model.`,
      icon: 'sync_alt',
    },
    {
      title: 'Profiling segment-level unit economics...',
      detail: `Computing conversion rates, average contract/order value, and CAC for ${industry}.`,
      icon: 'query_stats',
    },
    {
      title: 'Auditing channel efficiencies & bottlenecks...',
      detail: 'Analyzing organic search vs paid acquisition and identifying conversion dropoffs.',
      icon: 'troubleshoot',
    },
    {
      title: `Formulating evidence hypotheses for ${companyName}...`,
      detail: 'Structuring strategic hypotheses requiring deterministic BI verification.',
      icon: 'science',
    },
    {
      title: 'Synthesizing executive briefing & 90-day plan...',
      detail: 'Sequencing high-impact opportunities into Month 1, 2, and 3 roadmaps.',
      icon: 'auto_awesome',
    },
  ];

  useEffect(() => {
    if (!isOpen) {
      setCurrentStepIdx(0);
      return;
    }

    const timer = setInterval(() => {
      setCurrentStepIdx((prev) => {
        if (prev < steps.length) {
          return prev + 1;
        }
        clearInterval(timer);
        return prev;
      });
    }, 380);

    return () => clearInterval(timer);
  }, [isOpen, steps.length]);

  const isAllComplete = currentStepIdx >= steps.length;

  useEffect(() => {
    if (isAllComplete && isOpen) {
      const finishTimer = setTimeout(() => {
        onComplete();
      }, 500);
      return () => clearTimeout(finishTimer);
    }
  }, [isAllComplete, isOpen, onComplete]);

  if (!isOpen) return null;

  const progressPercent = Math.min(100, Math.round((currentStepIdx / steps.length) * 100));

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-7 shadow-2xl space-y-6 animate-scaleUp border border-slate-200 text-center">
        {/* Animated Icon Badge */}
        <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-blue-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
          <span className="material-symbols-outlined text-3xl animate-spin">
            neurology
          </span>
        </div>

        {/* Title & Subtitle */}
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
            <span>AI Reasoning Layer Synchronizing</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Adapting Strategy to {companyName}
          </h2>
          <p className="text-xs text-slate-500">
            {sourceType === 'dataset'
              ? `Grounding in ${recordCount || 'uploaded'} CSV rows with backend analytics engine...`
              : `Calibrating deterministic BI telemetry for ${industry}...`}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
          <div
            className="bg-blue-600 h-full rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Steps List */}
        <div className="space-y-2 text-left">
          {steps.map((s, idx) => {
            const isDone = idx < currentStepIdx;
            const isCurrent = idx === currentStepIdx;

            return (
              <div
                key={s.title}
                className={`p-3 rounded-xl border transition-all flex items-center justify-between text-xs ${
                  isDone
                    ? 'bg-emerald-50/50 border-emerald-200 text-slate-800'
                    : isCurrent
                    ? 'bg-blue-50/70 border-blue-300 text-blue-900 shadow-2xs'
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
                  <div>
                    <span className="font-bold text-xs block">{s.title}</span>
                    <span className="text-[10px] text-slate-500 block">{s.detail}</span>
                  </div>
                </div>

                <span className="text-[10px] font-mono text-slate-400 shrink-0 ml-2">
                  {isDone ? 'Done' : isCurrent ? 'Active...' : 'Waiting'}
                </span>
              </div>
            );
          })}
        </div>

        {isAllComplete && (
          <div className="text-xs font-bold text-emerald-700 bg-emerald-50 py-2 px-3 rounded-xl border border-emerald-200 animate-fadeIn">
            ✓ Complete • Loading Tailored Strategy Canvas...
          </div>
        )}
      </div>
    </div>
  );
}
