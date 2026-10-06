import React, { useState } from 'react';

/**
 * StrategicAdvisoryPrinciple - Embodies Requirement 10: The Intelligent Strategist Core Loop.
 * Explicitly structures answers to:
 * 1. "What happened?"
 * 2. "Why did it happen?"
 * 3. "Why does it matter?"
 * 4. "What should we do?"
 * 5. "What should we do first?"
 * 6. "What could happen if we do it?"
 */
export default function StrategicAdvisoryPrinciple({
  strategyData,
  onNavigateStage,
  onOpenWhatIf,
}) {
  const [activeStep, setActiveStep] = useState(0);

  const advisorySteps = [
    {
      step: 1,
      question: 'What happened?',
      tag: 'Telemetry Baseline',
      icon: 'insights',
      headline: 'Organic traffic is strong (+14.2%), but conversion dipped -0.4% to 3.34%.',
      detail:
        'Acme is acquiring 124,500 monthly visits and 22,410 qualified commercial visitors, generating 748 leads. However, conversion velocity is suppressed by drop-offs on booking forms and missing bottom-of-funnel validation.',
      metric: '3.34% Conversion Rate (vs 5.2% Top B2B Benchmark)',
      actionText: 'Inspect Digital Telemetry',
      actionType: 'none',
    },
    {
      step: 2,
      question: 'Why did it happen?',
      tag: 'Root Cause Diagnostics',
      icon: 'psychology',
      headline: '61.8% calendar drop-off & lack of enterprise compliance verification.',
      detail:
        'Enterprise visitors bounce within 22 seconds without visible SOC2/security proof. Concurrently, 24,600 monthly competitor comparison searches go uncaptured because the site has 0 direct comparison pages.',
      metric: '61.8% Drop-off Rate at Demo Scheduling Step',
      actionText: 'Review Business Health',
      actionType: 'none',
    },
    {
      step: 3,
      question: 'Why does it matter?',
      tag: 'Commercial Consequence',
      icon: 'monetization_on',
      headline: 'Enterprise contracts yield $52k ACV; each 1% conversion lift equals $180k/qtr.',
      detail:
        'Enterprise buyers represent 54% of contract value and $18.9M in total pipeline potential. Security and procurement delays stall deals by an average of 19 days, reducing capital velocity.',
      metric: '+$180,000 / Quarter at Risk per 1% Conversion Gap',
      actionText: 'View Audience Breakdown',
      actionType: 'audience',
    },
    {
      step: 4,
      question: 'What should we do?',
      tag: 'Strategic Initiatives',
      icon: 'architecture',
      headline: 'Deploy Enterprise Trust Hub, ROI Calculator & 4 Competitor Alternative Pillars.',
      detail:
        'Remove enterprise procurement friction with a public Trust Center, give champions self-serve CFO ROI models, and capture high-intent commercial buyers querying Zendesk and Intercom alternatives.',
      metric: '6 High-Impact Ranked Initiatives Identified',
      actionText: 'Explore Opportunities',
      actionType: 'opportunities',
    },
    {
      step: 5,
      question: 'What should we do first?',
      tag: 'Execution Roadmap',
      icon: 'playlist_play',
      headline: 'Month 1 Foundation: Enterprise Trust Hub + Progressive 2-Step Form.',
      detail:
        'Prioritize low-effort, high-leverage friction removal in Month 1 before spending resources on broad acquisition. Move from Month 1 Foundation into Month 2 Authority and Month 3 Expansion.',
      metric: '2-Week Rapid Wins in Month 1 Roadmap',
      actionText: 'Open 90-Day Action Plan',
      actionType: 'plan',
    },
    {
      step: 6,
      question: 'What could happen if we do it?',
      tag: 'What-If Projected Upside',
      icon: 'trending_up',
      headline: '+140 leads/month and +$1.4M in new quarterly enterprise pipeline.',
      detail:
        'Recovering calendar drop-off to 4.5% conversion and lifting enterprise traffic by +35% generates an estimated 320 incremental sales conversations and compresses sales cycles by 14 days.',
      metric: '+$1,450,000 Projected Quarterly Pipeline Growth',
      actionText: 'Launch What-If Simulation',
      actionType: 'whatif',
    },
  ];

  const handleAction = (step) => {
    if (step.actionType === 'opportunities') onNavigateStage('opportunity-center');
    else if (step.actionType === 'audience') onNavigateStage('audience-intelligence');
    else if (step.actionType === 'plan') onNavigateStage('action-plan');
    else if (step.actionType === 'whatif') onOpenWhatIf();
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 p-5 md:p-7 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
            Intelligent Strategist Framework
          </span>
          <h2 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight mt-1">
            The 6 Strategic Questions
          </h2>
        </div>
        <span className="text-xs text-slate-500">
          From Observation to Actionable Impact
        </span>
      </div>

      {/* 6 Step Cards Strip */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-2 mt-4">
        {advisorySteps.map((s, idx) => {
          const isActive = activeStep === idx;
          return (
            <button
              key={s.step}
              type="button"
              onClick={() => setActiveStep(idx)}
              className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between h-28 ${
                isActive
                  ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`w-6 h-6 rounded-lg text-xs font-extrabold flex items-center justify-center ${
                    isActive ? 'bg-white/20 text-white' : 'bg-white text-slate-700 border border-slate-200'
                  }`}
                >
                  {s.step}
                </span>
                <span className={`material-symbols-outlined text-sm ${isActive ? 'text-white' : 'text-slate-400'}`}>
                  {s.icon}
                </span>
              </div>
              <span className={`text-xs font-bold leading-tight ${isActive ? 'text-white' : 'text-slate-800'}`}>
                {s.question}
              </span>
            </button>
          );
        })}
      </div>

      {/* Active Step Deep-Dive Answer Box */}
      <div className="mt-4 p-5 rounded-2xl bg-blue-50/50 border border-blue-200/80 animate-fade-in flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="space-y-1.5 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-800 bg-white px-2 py-0.5 rounded border border-blue-200">
              Step {advisorySteps[activeStep].step}: {advisorySteps[activeStep].tag}
            </span>
            <span className="text-xs font-extrabold text-blue-900">
              "{advisorySteps[activeStep].question}"
            </span>
          </div>

          <h3 className="text-base font-bold text-slate-900">
            {advisorySteps[activeStep].headline}
          </h3>

          <p className="text-xs md:text-sm text-slate-700 leading-relaxed font-normal">
            {advisorySteps[activeStep].detail}
          </p>

          <div className="pt-1 flex items-center gap-2 text-xs font-mono font-bold text-blue-950">
            <span className="material-symbols-outlined text-sm text-blue-600">verified</span>
            <span>{advisorySteps[activeStep].metric}</span>
          </div>
        </div>

        {advisorySteps[activeStep].actionType !== 'none' && (
          <button
            type="button"
            onClick={() => handleAction(advisorySteps[activeStep])}
            className="self-start md:self-auto shrink-0 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
          >
            <span>{advisorySteps[activeStep].actionText}</span>
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </button>
        )}
      </div>
    </div>
  );
}
