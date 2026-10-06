import React, { useState } from 'react';
import {
  ASK_STRATEGY_KNOWLEDGE_BASE,
  queryAskStrategy,
} from '../data/mockStudioData';

/**
 * AskStrategyModal - Interactive "Ask about your business" interface.
 * Backed by deterministic structured data. Answers contain:
 * 1. Direct answer
 * 2. Supporting evidence
 * 3. Relevant metric
 * 4. Recommended action (with "Add to 90-Day Plan")
 */
export default function AskStrategyModal({
  isOpen,
  onClose,
  strategyData,
  onAddActionToPlan,
  addedPlanTaskIds = [],
}) {
  const [selectedQuestionId, setSelectedQuestionId] = useState(
    ASK_STRATEGY_KNOWLEDGE_BASE[0].id
  );
  const [customQuery, setCustomQuery] = useState('');
  const [activeAnswer, setActiveAnswer] = useState(ASK_STRATEGY_KNOWLEDGE_BASE[0]);
  const [addedTasks, setAddedTasks] = useState({});

  if (!isOpen) return null;

  const handleSelectPredefined = (item) => {
    setSelectedQuestionId(item.id);
    setCustomQuery('');
    setActiveAnswer(item);
  };

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    if (!customQuery.trim()) return;
    const resolved = queryAskStrategy(customQuery, strategyData);
    setActiveAnswer(resolved);
    setSelectedQuestionId(resolved.id || 'custom');
  };

  const handleAddToPlan = (task) => {
    if (!task) return;
    onAddActionToPlan(task);
    setAddedTasks((prev) => ({ ...prev, [task.id]: true }));
  };

  const isCurrentTaskAdded =
    activeAnswer?.planTask &&
    (addedTasks[activeAnswer.planTask.id] ||
      addedPlanTaskIds.includes(activeAnswer.planTask.id));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-5 md:p-6 border-b border-slate-100 flex items-start justify-between gap-4 bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
              <span className="material-symbols-outlined text-xl">psychology</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 uppercase tracking-wider">
                  Ground Truth AI Strategist
                </span>
                <span className="text-slate-300">•</span>
                <span className="text-xs font-semibold text-slate-500">
                  {strategyData?.company?.name || 'Acme Intelligence'}
                </span>
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight mt-0.5">
                Ask about your business
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
          {/* Custom Search/Query Bar */}
          <form onSubmit={handleCustomSubmit} className="relative">
            <div className="relative flex items-center">
              <span className="material-symbols-outlined absolute left-3.5 text-slate-400 text-lg">
                search
              </span>
              <input
                type="text"
                value={customQuery}
                onChange={(e) => setCustomQuery(e.target.value)}
                placeholder="Ask any strategic question (e.g. Why are conversions falling? What to fix first?)..."
                className="w-full pl-10 pr-24 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-xs md:text-sm text-slate-800 placeholder-slate-400 outline-none transition-all"
              />
              <button
                type="submit"
                className="absolute right-2 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                Ask
              </button>
            </div>
          </form>

          {/* Quick Predefined Questions */}
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Strategic Questions (Structured Telemetry)
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {ASK_STRATEGY_KNOWLEDGE_BASE.map((item) => {
                const isSelected = selectedQuestionId === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelectPredefined(item)}
                    className={`p-2.5 rounded-xl border text-left text-xs transition-all flex items-center justify-between gap-2 cursor-pointer ${
                      isSelected
                        ? 'bg-blue-50 border-blue-500 text-blue-900 font-semibold ring-1 ring-blue-200 shadow-2xs'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span className="truncate">{item.question}</span>
                    <span className="material-symbols-outlined text-sm text-slate-400 shrink-0">
                      {isSelected ? 'check_circle' : 'arrow_forward'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Structured Answer Box */}
          {activeAnswer && (
            <div className="bg-white rounded-2xl border border-blue-200/80 p-5 md:p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                  <span className="text-xs font-bold text-slate-900">
                    Query: "{activeAnswer.question}"
                  </span>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                  {activeAnswer.category || 'Strategic Insight'}
                </span>
              </div>

              {/* 1. Direct Answer */}
              <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-100">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-800 flex items-center gap-1 mb-1">
                  <span className="material-symbols-outlined text-xs">forum</span>
                  <span>1. Direct Answer</span>
                </span>
                <p className="text-xs md:text-sm font-semibold text-slate-900 leading-relaxed">
                  {activeAnswer.directAnswer}
                </p>
              </div>

              {/* 2. Supporting Evidence */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1 mb-1">
                  <span className="material-symbols-outlined text-xs">verified</span>
                  <span>2. Supporting Evidence (Audited Telemetry)</span>
                </span>
                <p className="text-xs text-slate-700 leading-relaxed">
                  {activeAnswer.supportingEvidence}
                </p>
              </div>

              {/* 3. Relevant Metric */}
              <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/80">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1 mb-1">
                  <span className="material-symbols-outlined text-xs">analytics</span>
                  <span>3. Relevant Metric</span>
                </span>
                <p className="text-xs md:text-sm font-mono font-bold text-amber-950">
                  {activeAnswer.relevantMetric}
                </p>
              </div>

              {/* 4. Recommended Action */}
              <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-900 flex items-center gap-1 mb-0.5">
                    <span className="material-symbols-outlined text-xs">rocket_launch</span>
                    <span>4. Recommended Action</span>
                  </span>
                  <p className="text-xs md:text-sm font-semibold text-emerald-950">
                    {activeAnswer.recommendedAction}
                  </p>
                </div>

                {activeAnswer.planTask && (
                  <button
                    type="button"
                    onClick={() => handleAddToPlan(activeAnswer.planTask)}
                    disabled={isCurrentTaskAdded}
                    className={`shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isCurrentTaskAdded
                        ? 'bg-emerald-200 text-emerald-800 cursor-not-allowed'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                    }`}
                  >
                    <span className="material-symbols-outlined text-xs">
                      {isCurrentTaskAdded ? 'check_circle' : 'add_task'}
                    </span>
                    <span>{isCurrentTaskAdded ? 'Added to Plan' : 'Add to 90-Day Plan'}</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            Deterministic reasoning grounded in active telemetry & competitive audit.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
