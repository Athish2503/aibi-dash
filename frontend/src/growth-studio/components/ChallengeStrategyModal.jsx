import React from 'react';
import { defaultAIService } from '../services/AIService';

/**
 * ChallengeStrategyModal - Adversarial Strategic Stress-Testing
 * 
 * Mandate: The AI intentionally attempts to find reasons why the current strategy might be wrong.
 * Presents potential counterarguments, failure modes, and specifies:
 * "What evidence would increase confidence?"
 * Prevents the AI from blindly agreeing with itself.
 */
export default function ChallengeStrategyModal({ isOpen, onClose, strategyData }) {
  if (!isOpen) return null;

  const challengeData = defaultAIService.challengeStrategy(strategyData);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5 animate-scaleUp max-h-[90vh] overflow-y-auto border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <span className="material-symbols-outlined text-lg">gavel</span>
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm">
                Challenge Strategy — Adversarial Review
              </h3>
              <p className="text-[11px] text-slate-500">
                Stress-testing current strategy against counterarguments & blind spots
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-lg cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Current Working Strategy Under Review */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1 text-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Strategy Under Scrutiny
          </span>
          <p className="font-bold text-slate-900 text-sm">
            "{challengeData.currentFocus}"
          </p>
        </div>

        {/* Potential Counterarguments & Flaws */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Potential Counterarguments & Vulnerabilities:
            </h4>
            <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded">
              High Scrutiny Mode
            </span>
          </div>

          <div className="space-y-2.5">
            {challengeData.counterarguments.map((ca) => (
              <div
                key={ca.id}
                className="p-3.5 rounded-xl border border-rose-100 bg-rose-50/30 text-xs space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-rose-950">{ca.argument}</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-rose-100 text-rose-800">
                    Risk: {ca.riskLevel}
                  </span>
                </div>
                <p className="text-slate-600 leading-relaxed text-[11px]">
                  {ca.explanation}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Section 11 Requirement: What evidence would increase confidence? */}
        <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 space-y-2 text-xs">
          <div className="flex items-center gap-1.5 font-bold text-blue-900">
            <span className="material-symbols-outlined text-sm">quiz</span>
            <span>What evidence would increase confidence?</span>
          </div>
          <ul className="list-disc pl-5 space-y-1 text-blue-900/90 text-[11px] leading-relaxed">
            {challengeData.whatEvidenceWouldIncreaseConfidence.map((ev, i) => (
              <li key={i}>{ev}</li>
            ))}
          </ul>
        </div>

        {/* Mitigation Suggestion */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
          <span className="font-bold text-slate-800">Recommended Strategic Hedge:</span>
          <p className="text-slate-600 text-[11px] leading-relaxed">
            {challengeData.recommendedMitigation}
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <span className="text-[11px] text-slate-500">
            AI Adversarial Review completed with deterministic BI grounding.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold cursor-pointer"
          >
            Acknowledge & Close
          </button>
        </div>
      </div>
    </div>
  );
}
