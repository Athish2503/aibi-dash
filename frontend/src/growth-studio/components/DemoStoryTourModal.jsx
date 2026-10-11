import React, { useState } from 'react';

/**
 * DemoStoryTourModal - Guided 19-Step Interactive Demonstration
 * 
 * Directly models and navigates the 19 steps defined in Section 29 of the specification:
 * 1. User enters company information.
 * 2. User selects "Generate Leads".
 * 3. AI asks intelligent follow-up questions.
 * 4. User answers them.
 * 5. AI identifies a knowledge gap.
 * 6. AI generates a hypothesis.
 * 7. User clicks "Verify with BI".
 * 8. BI provides supporting evidence.
 * 9. AI explains the evidence.
 * 10. AI identifies an opportunity.
 * 11. User clicks "Add to Strategy".
 * 12. AI updates the strategy.
 * 13. User opens the 90-day plan.
 * 14. User changes a scenario.
 * 15. AI explains the potential impact.
 * 16. User asks "Why?"
 * 17. AI answers using the BI evidence.
 * 18. User clicks "Challenge Strategy".
 * 19. AI presents counterarguments and missing evidence.
 */
export default function DemoStoryTourModal({
  isOpen,
  onClose,
  onNavigateStage,
  onOpenWhatIf,
  onOpenChallenge,
  onOpenAskAI,
}) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  if (!isOpen) return null;

  const demoSteps = [
    {
      step: 1,
      title: 'Enter Company Information',
      actionText: 'Review Company Knowledge & Context',
      targetStage: 'knowledge',
      description: 'The user enters Acme Intelligence: enterprise customer service automation platform.',
      aiObservation: 'Company context loaded: B2B Enterprise SaaS offering Autonomous Support Copilot.',
    },
    {
      step: 2,
      title: 'Select "Generate Leads"',
      actionText: 'Set Objective to Enterprise Leads',
      targetStage: 'home',
      description: 'The user establishes primary business objective: Generate qualified enterprise pipeline.',
      aiObservation: 'Primary anchor objective locked. Directing focus toward high-ACV buyer journeys.',
    },
    {
      step: 3,
      title: 'AI Asks Intelligent Follow-up Questions',
      actionText: 'Open Adaptive Interview',
      targetStage: 'interview',
      description: 'AI recognizes enterprise priority and asks: "Do enterprise customers purchase a dedicated offering?"',
      aiObservation: 'Adaptive questioning triggered to prevent generic, untargeted recommendations.',
    },
    {
      step: 4,
      title: 'User Answers Questions',
      actionText: 'Inspect Contextual Responses',
      targetStage: 'interview',
      description: 'User details enterprise security objections, sales cycle timelines, and dedicated VPC offerings.',
      aiObservation: 'Answers incorporated. High-touch enterprise compliance identified as key friction.',
    },
    {
      step: 5,
      title: 'AI Identifies a Knowledge Gap',
      actionText: 'View Knowledge Confidence Model',
      targetStage: 'knowledge',
      description: 'AI flags Customer Motivation at 48% confidence: "We need more information on enterprise objections."',
      aiObservation: 'Knowledge gap isolated and highlighted with targeted prompt.',
    },
    {
      step: 6,
      title: 'AI Generates a Hypothesis',
      actionText: 'Inspect Hypothesis in Strategy',
      targetStage: 'strategy',
      description: 'AI forms hypothesis: "Enterprise customers may be the company’s highest-growth opportunity."',
      aiObservation: 'Observation held as hypothesis; not converted to recommendation until verified.',
    },
    {
      step: 7,
      title: 'User Clicks "Verify with BI"',
      actionText: 'Trigger BI Analytical Request',
      targetStage: 'strategy',
      description: 'The strategy layer queries the semantic BI layer for segment revenue and conversion metrics.',
      aiObservation: 'Sending structured analytical request to BIService.compareSegments().',
    },
    {
      step: 8,
      title: 'BI Provides Supporting Evidence',
      actionText: 'Inspect BI Segment Evidence',
      targetStage: 'intelligence',
      description: 'BI returns: Enterprise delivers 42% of revenue from 18% of traffic with 8.7% conversion.',
      aiObservation: 'Structured mathematical proof received: 3.0x conversion efficiency over SMB.',
    },
    {
      step: 9,
      title: 'AI Explains the Evidence',
      actionText: 'Read Evidence Narrative',
      targetStage: 'intelligence',
      description: 'AI explains: Enterprise converts at 3x SMB, but site severely under-indexes on dedicated pages.',
      aiObservation: 'Translating mathematical variance into actionable business strategy.',
    },
    {
      step: 10,
      title: 'AI Identifies an Opportunity',
      actionText: 'Open Opportunity Center',
      targetStage: 'opportunities',
      description: 'Opportunity created: "Build Dedicated Enterprise AI Solution Hub & ABM Experience" (Impact 94).',
      aiObservation: 'Opportunity scored by Impact, Effort, Relevance, and grounded evidence.',
    },
    {
      step: 11,
      title: 'User Clicks "Add to Strategy"',
      actionText: 'Add Opportunity to Active Strategy',
      targetStage: 'strategy',
      description: 'The verified opportunity is promoted into active strategic priorities.',
      aiObservation: 'Strategy synthesis updated with explicit recommendation structure.',
    },
    {
      step: 12,
      title: 'AI Updates the Strategy',
      actionText: 'Inspect Updated Recommendations',
      targetStage: 'strategy',
      description: 'Recommendation formulated: Focus on Enterprise (Why, Evidence, Confidence: 88%, Action).',
      aiObservation: 'Strict recommendation principle enforced: Recommendation → Why → Evidence → Confidence → Action.',
    },
    {
      step: 13,
      title: 'User Opens the 90-Day Plan',
      actionText: 'Open 90-Day Execution Plan',
      targetStage: 'plan',
      description: 'User reviews Month 1 Foundation, Month 2 Authority, Month 3 Expansion execution roadmap.',
      aiObservation: 'Initiatives sequenced by dependencies and organizational capacity.',
    },
    {
      step: 14,
      title: 'User Changes a Scenario',
      actionText: 'Launch What-If Simulation',
      customAction: 'what-if',
      description: 'User asks: "What if enterprise traffic increases by 20% and conversion improves to 4.0%?"',
      aiObservation: 'Executing deterministic financial model across baseline traffic and deal values.',
    },
    {
      step: 15,
      title: 'AI Explains the Potential Impact',
      actionText: 'Inspect Scenario Projections',
      customAction: 'what-if',
      description: 'AI projects: +649 additional enterprise leads and +$2.6M incremental pipeline with assumptions.',
      aiObservation: 'Explicit assumptions displayed: estimates never presented as guaranteed facts.',
    },
    {
      step: 16,
      title: 'User Asks "Why?"',
      actionText: 'Ask AI Contextual Query',
      customAction: 'ask-ai',
      description: 'User queries: "Why did enterprise demo conversions drop last month?"',
      aiObservation: 'AI invokes 6-dimension root-cause investigation across pricing page changes.',
    },
    {
      step: 17,
      title: 'AI Answers Using BI Evidence',
      actionText: 'Inspect Root-Cause Evidence',
      targetStage: 'intelligence',
      description: 'AI returns: Enterprise drop (-29.8%) concentrated on /pricing following self-serve CTA redesign.',
      aiObservation: 'Structured root cause returned with High Confidence (92%).',
    },
    {
      step: 18,
      title: 'User Clicks "Challenge Strategy"',
      actionText: 'Launch Adversarial Stress-Test',
      customAction: 'challenge',
      description: 'User clicks Challenge Strategy to test whether prioritizing enterprise could be wrong.',
      aiObservation: 'AI switches to adversarial mode; intentionally finding flaws in its own proposal.',
    },
    {
      step: 19,
      title: 'AI Presents Counterarguments & Missing Evidence',
      actionText: 'Review Counterarguments & Mitigations',
      customAction: 'challenge',
      description: 'AI highlights: 74-day sales cycle lag, contract concentration risk, and missing cohort retention data.',
      aiObservation: 'Completed continuous 19-step product loop: Understand → Verify → Challenge.',
    },
  ];

  const currentStep = demoSteps[currentStepIndex];

  const handleExecuteStep = () => {
    if (currentStep.customAction === 'what-if') {
      onOpenWhatIf && onOpenWhatIf();
    } else if (currentStep.customAction === 'challenge') {
      onOpenChallenge && onOpenChallenge();
    } else if (currentStep.customAction === 'ask-ai') {
      onOpenAskAI && onOpenAskAI();
    } else if (currentStep.targetStage) {
      onNavigateStage(currentStep.targetStage);
    }
  };

  const handleNextStep = () => {
    if (currentStepIndex < demoSteps.length - 1) {
      const nextIdx = currentStepIndex + 1;
      setCurrentStepIndex(nextIdx);
      const nextStep = demoSteps[nextIdx];
      if (nextStep.targetStage && !nextStep.customAction) {
        onNavigateStage(nextStep.targetStage);
      }
    }
  };

  const handlePrevStep = () => {
    if (currentStepIndex > 0) {
      const prevIdx = currentStepIndex - 1;
      setCurrentStepIndex(prevIdx);
      const prevStep = demoSteps[prevIdx];
      if (prevStep.targetStage && !prevStep.customAction) {
        onNavigateStage(prevStep.targetStage);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-5 animate-scaleUp border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <h3 className="font-extrabold text-slate-900 text-sm">
              Section 29 Demo Story Walkthrough ({currentStepIndex + 1} of 19)
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-lg cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Step Progress Pill */}
        <div className="flex items-center justify-between text-xs font-bold text-slate-500">
          <span>STEP {currentStep.step} OF 19</span>
          <span className="text-emerald-700 font-mono">
            {Math.round(((currentStepIndex + 1) / 19) * 100)}% Complete
          </span>
        </div>
        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
          <div
            className="bg-emerald-600 h-full rounded-full transition-all duration-300"
            style={{ width: `${((currentStepIndex + 1) / 19) * 100}%` }}
          />
        </div>

        {/* Current Step Content */}
        <div className="space-y-3">
          <h4 className="text-base font-extrabold text-slate-900">
            {currentStep.title}
          </h4>
          <p className="text-xs text-slate-600 leading-relaxed">
            {currentStep.description}
          </p>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs space-y-1">
            <span className="font-bold text-blue-800 flex items-center gap-1">
              <span className="material-symbols-outlined text-xs">psychology</span>
              AI Reasoning State:
            </span>
            <p className="text-slate-700 text-[11px] leading-relaxed">
              {currentStep.aiObservation}
            </p>
          </div>
        </div>

        {/* Trigger Interactive Action in the UI */}
        <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100">
          <button
            type="button"
            onClick={handleExecuteStep}
            className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-2xs inline-flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-xs">touch_app</span>
            <span>Jump to UI: {currentStep.actionText}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrevStep}
              disabled={currentStepIndex === 0}
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer disabled:opacity-40"
            >
              Previous
            </button>
            <button
              type="button"
              onClick={handleNextStep}
              disabled={currentStepIndex === demoSteps.length - 1}
              className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold cursor-pointer disabled:opacity-40"
            >
              Next Step
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
