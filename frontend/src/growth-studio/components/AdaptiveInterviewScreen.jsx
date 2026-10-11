import React, { useState, useEffect } from 'react';
import { defaultAIService } from '../services/AIService';

/**
 * AdaptiveInterviewScreen - Adaptive AI Strategy Interview & Question Engine
 * 
 * Replaces static onboarding with an intelligent, conversational question engine.
 * Dynamically detects knowledge gaps and triggers contextual follow-up questions.
 * Includes "Why we're asking" rationale, skip capabilities, and real-time knowledge confidence tracking.
 */
export default function AdaptiveInterviewScreen({
  initialAnswers = {},
  companyData = {},
  onCompleteInterview,
  onCancel,
}) {
  const [answers, setAnswers] = useState(() => ({
    'q-1': companyData.description || 'AI-powered customer service automation and workforce resolution platform.',
    'q-2': companyData.products || 'Autonomous Support Copilot, Ticket Deflector, Voice AI Agent.',
    'q-3': companyData.targetAudience || 'Enterprise Customer Experience & IT Operations Leaders.',
    'q-4': 'Generate more qualified enterprise pipeline while optimizing commercial page conversion.',
    'q-5': companyData.targetGeography || 'North America & Western Europe Enterprise buyers.',
    'q-6': 'Sub-second real-time enterprise knowledge graph grounding with zero hallucination guarantee.',
    ...initialAnswers,
  }));

  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [knowledgeGaps, setKnowledgeGaps] = useState(null);
  const [isAiReasoning, setIsAiReasoning] = useState(false);

  // Re-generate question set whenever answers change to enable adaptive follow-ups
  useEffect(() => {
    const generated = defaultAIService.generateQuestions(answers, companyData);
    setQuestions(generated);

    const gaps = defaultAIService.analyzeKnowledgeGaps(answers);
    setKnowledgeGaps(gaps);
  }, [answers, companyData]);

  const currentQ = questions[activeQuestionIndex] || questions[0];

  const handleAnswerChange = (val) => {
    if (!currentQ) return;
    setAnswers((prev) => ({
      ...prev,
      [currentQ.id]: val,
    }));
  };

  const handleNextQuestion = () => {
    setIsAiReasoning(true);
    setTimeout(() => {
      setIsAiReasoning(false);
      if (activeQuestionIndex < questions.length - 1) {
        setActiveQuestionIndex((prev) => prev + 1);
      } else {
        // Complete interview
        if (onCompleteInterview) {
          onCompleteInterview({
            answers,
            knowledgeGaps,
            companyContext: {
              ...companyData,
              description: answers['q-1'] || companyData.description,
              products: answers['q-2'] || companyData.products,
              targetAudience: answers['q-3'] || companyData.targetAudience,
              targetGeography: answers['q-5'] || companyData.targetGeography,
            },
          });
        }
      }
    }, 350);
  };

  const handleSkipQuestion = () => {
    if (activeQuestionIndex < questions.length - 1) {
      setActiveQuestionIndex((prev) => prev + 1);
    } else if (onCompleteInterview) {
      onCompleteInterview({ answers, knowledgeGaps, companyContext: companyData });
    }
  };

  const handleSelectQuestion = (idx) => {
    setActiveQuestionIndex(idx);
  };

  const answeredCount = questions.filter((q) => answers[q.id]?.trim()).length;
  const progressPercent = Math.round((answeredCount / (questions.length || 1)) * 100);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8 animate-fadeIn">
      {/* Header with Adaptive Interview Context */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold uppercase tracking-wider mb-2">
            <span className="material-symbols-outlined text-xs">forum</span>
            Adaptive AI Strategy Interview
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Help AI Understand Your Business
          </h1>
          <p className="text-sm text-slate-600">
            The AI asks targeted questions, identifies knowledge gaps, and dynamically adapts based on your answers.
          </p>
        </div>

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="text-xs font-semibold text-slate-500 hover:text-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 bg-white cursor-pointer"
          >
            Exit Interview
          </button>
        )}
      </div>

      {/* Main Grid: Left = Active Question & Reason, Right = Real-time Knowledge Confidence Model */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Current Question Card */}
        <div className="lg:col-span-7 space-y-6">
          {currentQ && (
            <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-6 relative">
              {/* Question Meta Pills */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                    Category: {currentQ.category}
                  </span>
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                      currentQ.importance === 'Critical'
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    {currentQ.importance}
                  </span>
                </div>
                <span className="text-xs font-medium text-slate-500">
                  Question {activeQuestionIndex + 1} of {questions.length}
                </span>
              </div>

              {/* The Question Itself */}
              <div>
                <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 leading-snug">
                  {currentQ.question}
                </h2>
              </div>

              {/* Section 4 Mandate: "Why we're asking" */}
              <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-100/90 text-xs text-blue-900 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-blue-800">
                  <span className="material-symbols-outlined text-sm">info</span>
                  <span>Why we're asking this:</span>
                </div>
                <p className="leading-relaxed pl-5 text-blue-900/90">
                  {currentQ.reason}
                </p>
              </div>

              {/* Answer Input Area */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Your Response
                </label>
                <textarea
                  rows={4}
                  value={answers[currentQ.id] || ''}
                  onChange={(e) => handleAnswerChange(e.target.value)}
                  placeholder="Provide your company context..."
                  className="w-full text-sm p-3.5 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all leading-relaxed text-slate-900 bg-white"
                />
              </div>

              {/* Action Buttons: Next / Skip / Finish */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleSkipQuestion}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-800 px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Skip for now
                </button>

                <div className="flex items-center gap-2">
                  {activeQuestionIndex > 0 && (
                    <button
                      type="button"
                      onClick={() => setActiveQuestionIndex((prev) => prev - 1)}
                      className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                    >
                      Back
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleNextQuestion}
                    disabled={isAiReasoning}
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isAiReasoning ? (
                      <>
                        <span className="w-3 h-3 rounded-full border-2 border-white border-t-transparent animate-spin" />
                        <span>Reasoning...</span>
                      </>
                    ) : activeQuestionIndex < questions.length - 1 ? (
                      <>
                        <span>Save & Next Question</span>
                        <span className="material-symbols-outlined text-xs">arrow_forward</span>
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-sm">auto_awesome</span>
                        <span>Complete & Generate Strategy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Quick Question Navigator List */}
          <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-2xs space-y-2">
            <div className="text-xs font-bold text-slate-600 px-1">
              Interview Questions ({answeredCount}/{questions.length} answered)
            </div>
            <div className="space-y-1.5">
              {questions.map((q, idx) => {
                const isAnswered = Boolean(answers[q.id]?.trim());
                const isActive = idx === activeQuestionIndex;
                return (
                  <div
                    key={q.id}
                    onClick={() => handleSelectQuestion(idx)}
                    className={`p-2.5 rounded-lg flex items-center justify-between text-xs cursor-pointer transition-colors ${
                      isActive
                        ? 'bg-blue-50 border border-blue-200 text-blue-900 font-semibold'
                        : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span
                        className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                          isAnswered ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {isAnswered ? '✓' : idx + 1}
                      </span>
                      <span className="truncate">{q.question}</span>
                    </div>
                    <span className="text-[10px] text-slate-500 shrink-0 ml-2 uppercase font-mono">
                      {q.category}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Company Understanding Model & Knowledge Confidence (Section 5) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-600 text-lg">psychology</span>
                <h3 className="text-sm font-bold text-slate-900">
                  Company Understanding Model
                </h3>
              </div>
              <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
                {knowledgeGaps?.overallConfidence || 75}% Confidence
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              As you answer questions, the AI models your business dimensions. High confidence unlocks sharper hypotheses and eliminates blind spots.
            </p>

            {/* Visual Confidence Bars (Section 5 Requirement) */}
            <div className="space-y-3.5">
              {knowledgeGaps?.areas?.map((area) => (
                <div key={area.id} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800">{area.title}</span>
                    <span
                      className={`font-mono font-bold ${
                        area.confidence >= 80
                          ? 'text-emerald-700'
                          : area.confidence >= 60
                          ? 'text-blue-700'
                          : 'text-amber-700'
                      }`}
                    >
                      {area.confidence}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
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
                  {area.gapNotice && (
                    <div className="pt-1 flex items-center justify-between text-[11px] text-amber-800 bg-amber-50/80 p-2 rounded-lg border border-amber-200">
                      <span>{area.gapNotice}</span>
                      <button
                        type="button"
                        onClick={() => {
                          const idx = questions.findIndex((q) => q.category === 'Conversion' || q.category === 'Sales');
                          if (idx >= 0) setActiveQuestionIndex(idx);
                        }}
                        className="text-[11px] font-bold text-amber-900 underline hover:text-amber-950 cursor-pointer shrink-0 ml-2"
                      >
                        Help AI understand this
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* AI Reasoning Live Stream Note */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5 text-xs text-slate-600">
              <div className="flex items-center gap-1.5 font-bold text-slate-800">
                <span className="material-symbols-outlined text-sm text-blue-600">bolt</span>
                <span>Active Hypotheses Formulating:</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-normal">
                Detecting strong enterprise signal. Once complete, AI will generate hypotheses requiring BI verification before recommendations are finalized.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
