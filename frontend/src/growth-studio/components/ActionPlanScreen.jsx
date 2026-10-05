import React, { useState } from 'react';

/**
 * ActionPlanScreen - Screen 11 in AI Growth Strategy Studio
 * 90-Day Action Plan organized into 3 horizons:
 * - Month 1 — Foundation (Website and structural improvements)
 * - Month 2 — Authority (Content and audience expansion)
 * - Month 3 — Expansion (Optimization and new opportunities)
 * Includes "Why this order?" strategic justification, timeline visuals, and status toggles.
 */
export default function ActionPlanScreen({
  planTasks = [],
  onUpdateTaskStatus,
  onAddTask,
  onNavigateStage,
  company = {},
}) {
  const [activeMonthFilter, setActiveMonthFilter] = useState('all'); // 'all', 1, 2, 3
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskData, setNewTaskData] = useState({
    task: '',
    category: 'Website',
    priority: 'P1 — Critical',
    expectedImpact: '',
    effort: '2 Weeks',
    month: 1,
    strategicRationale: '',
  });

  const monthDefinitions = [
    {
      month: 1,
      title: 'Month 1 — Foundation',
      subtitle: 'Website & Structural Conversion Improvements',
      focus: 'Eliminate conversion bottlenecks, launch trust/security assets, and deploy ROI calculators.',
      icon: 'foundation',
    },
    {
      month: 2,
      title: 'Month 2 — Authority',
      subtitle: 'Content & Audience Footprint Expansion',
      focus: 'Publish comparison pillars, inject AI schema graphs, and consolidate fragmented topics.',
      icon: 'verified',
    },
    {
      month: 3,
      title: 'Month 3 — Expansion',
      subtitle: 'Optimization & New Frontier Opportunities',
      focus: 'Scale reverse-IP account personalization, launch benchmark reports, and activate co-marketing.',
      icon: 'rocket_launch',
    },
  ];

  const handleCreateTask = (e) => {
    e.preventDefault();
    if (!newTaskData.task.trim()) return;

    onAddTask({
      id: `custom-task-${Date.now()}`,
      ...newTaskData,
      status: 'todo',
      monthTitle: `Month ${newTaskData.month} — ${
        newTaskData.month === 1 ? 'Foundation' : newTaskData.month === 2 ? 'Authority' : 'Expansion'
      }`,
    });

    setIsAddingTask(false);
    setNewTaskData({
      task: '',
      category: 'Website',
      priority: 'P1 — Critical',
      expectedImpact: '',
      effort: '2 Weeks',
      month: 1,
      strategicRationale: '',
    });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return { label: 'Done', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: 'check_circle' };
      case 'in-progress':
        return { label: 'In Progress', color: 'bg-blue-50 text-blue-700 border-blue-200', icon: 'pending' };
      default:
        return { label: 'To Do', color: 'bg-slate-100 text-slate-700 border-slate-200', icon: 'radio_button_unchecked' };
    }
  };

  const cycleStatus = (task) => {
    const nextStatus =
      task.status === 'todo'
        ? 'in-progress'
        : task.status === 'in-progress'
        ? 'completed'
        : 'todo';
    onUpdateTaskStatus(task.id, nextStatus);
  };

  const completedCount = planTasks.filter((t) => t.status === 'completed').length;
  const inProgressCount = planTasks.filter((t) => t.status === 'in-progress').length;
  const todoCount = planTasks.filter((t) => t.status === 'todo').length;
  const completionPercent = planTasks.length > 0 ? Math.round((completedCount / planTasks.length) * 100) : 0;

  return (
    <div className="max-w-6xl mx-auto py-6 px-4 md:px-6 animate-fade-in space-y-8">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
              Execution Roadmap
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-xs text-slate-500">{company.name}</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
            90-Day Strategic Action Plan
          </h1>
          <p className="text-sm text-slate-600 mt-0.5">
            A sequenced, chronological roadmap transforming business intelligence into tangible execution.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onNavigateStage('opportunity-center')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">add</span>
            <span>Add from Opportunities</span>
          </button>

          <button
            type="button"
            onClick={() => setIsAddingTask(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">edit_note</span>
            <span>New Custom Task</span>
          </button>
        </div>
      </div>

      {/* Progress & Milestone Overview Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold text-slate-900">Roadmap Progress</h2>
            <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              {completionPercent}% Executed
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {completedCount} completed • {inProgressCount} active • {todoCount} queued tasks
          </p>

          <div className="w-full md:w-80 bg-slate-100 h-2 rounded-full mt-3 overflow-hidden border border-slate-200">
            <div
              className="bg-blue-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${completionPercent}%` }}
            />
          </div>
        </div>

        {/* Filter Month Switcher */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-2xl text-xs font-semibold self-start md:self-auto">
          <button
            type="button"
            onClick={() => setActiveMonthFilter('all')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              activeMonthFilter === 'all'
                ? 'bg-white text-blue-700 font-bold shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All 90 Days
          </button>
          {[1, 2, 3].map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setActiveMonthFilter(m)}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                activeMonthFilter === m
                  ? 'bg-white text-blue-700 font-bold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Month {m}
            </button>
          ))}
        </div>
      </div>

      {/* "Why this order?" Strategic Callout Box */}
      <div className="bg-gradient-to-r from-blue-50/90 via-indigo-50/70 to-slate-50 rounded-3xl border border-blue-200/80 p-6 shadow-2xs">
        <div className="flex items-start gap-3.5">
          <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
            <span className="material-symbols-outlined text-lg">alt_route</span>
          </div>

          <div>
            <h2 className="text-base font-bold text-slate-900">
              Why this order? (Strategic Dependency Sequencing)
            </h2>
            <p className="text-xs md:text-sm text-slate-700 mt-1 leading-relaxed">
              Initiatives are prioritized according to economic return, dependencies, and risk mitigation:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3 text-xs">
              <div className="p-3 rounded-xl bg-white/80 border border-blue-100">
                <span className="font-bold text-blue-900 block mb-0.5">1. Foundation First</span>
                <span className="text-slate-600">
                  Fixing website trust and friction ensures you don't waste budget driving traffic into a leaky conversion funnel.
                </span>
              </div>
              <div className="p-3 rounded-xl bg-white/80 border border-blue-100">
                <span className="font-bold text-blue-900 block mb-0.5">2. Authority Capture</span>
                <span className="text-slate-600">
                  With conversion paths secured, high-intent comparison assets capture buyers who are already in their evaluation window.
                </span>
              </div>
              <div className="p-3 rounded-xl bg-white/80 border border-blue-100">
                <span className="font-bold text-blue-900 block mb-0.5">3. Multiplier Expansion</span>
                <span className="text-slate-600">
                  Account personalization, analyst benchmarks, and ecosystem partnerships amplify a proven foundation.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3 Chronological Month Sections */}
      <div className="space-y-8">
        {monthDefinitions
          .filter((m) => activeMonthFilter === 'all' || activeMonthFilter === m.month)
          .map((mDef) => {
            const tasksForMonth = planTasks.filter((t) => t.month === mDef.month);

            return (
              <div
                key={mDef.month}
                className="bg-white rounded-3xl border border-slate-200/90 p-6 md:p-8 shadow-sm space-y-4"
              >
                {/* Month Section Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                      <span className="material-symbols-outlined text-xl">{mDef.icon}</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">{mDef.title}</h3>
                      <p className="text-xs text-slate-500">{mDef.subtitle}</p>
                    </div>
                  </div>

                  <span className="text-xs font-semibold text-slate-500 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200 self-start sm:self-auto">
                    {tasksForMonth.length} Assigned Tasks
                  </span>
                </div>

                <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-200/60">
                  <strong>Strategic Horizon Focus:</strong> {mDef.focus}
                </div>

                {/* Tasks List */}
                <div className="space-y-3 pt-2">
                  {tasksForMonth.map((task) => {
                    const statusInfo = getStatusBadge(task.status);

                    return (
                      <div
                        key={task.id}
                        className={`p-4 rounded-2xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                          task.status === 'completed'
                            ? 'bg-emerald-50/30 border-emerald-200'
                            : 'bg-white border-slate-200/80 hover:border-slate-300 shadow-2xs'
                        }`}
                      >
                        <div className="flex items-start gap-3 flex-1">
                          {/* Quick Status Toggle Button */}
                          <button
                            type="button"
                            onClick={() => cycleStatus(task)}
                            className="mt-0.5 text-slate-400 hover:text-blue-600 transition-colors cursor-pointer shrink-0"
                            title="Click to toggle status (To Do -> In Progress -> Done)"
                          >
                            <span
                              className={`material-symbols-outlined text-xl ${
                                task.status === 'completed'
                                  ? 'text-emerald-600 font-bold'
                                  : task.status === 'in-progress'
                                  ? 'text-blue-600'
                                  : 'text-slate-300'
                              }`}
                            >
                              {statusInfo.icon}
                            </span>
                          </button>

                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-sm font-bold text-slate-900">
                                {task.task}
                              </span>
                              <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded uppercase tracking-wider">
                                {task.category}
                              </span>
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                                  task.priority?.includes('P1')
                                    ? 'bg-red-50 text-red-700 border border-red-200'
                                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                                }`}
                              >
                                {task.priority}
                              </span>
                            </div>

                            <p className="text-xs text-slate-500 leading-relaxed">
                              <strong>Expected Impact:</strong> {task.expectedImpact}
                            </p>

                            {task.strategicRationale && (
                              <p className="text-[11px] text-blue-800 bg-blue-50/50 px-2 py-1 rounded border border-blue-100/60 inline-block">
                                <strong>Rationale:</strong> {task.strategicRationale}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Right Meta & Status Switcher */}
                        <div className="flex items-center justify-between md:justify-end gap-3 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                          <span className="text-xs font-semibold text-slate-500">
                            Effort: <strong className="text-slate-700">{task.effort}</strong>
                          </span>

                          <button
                            type="button"
                            onClick={() => cycleStatus(task)}
                            className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${statusInfo.color}`}
                          >
                            <span>{statusInfo.label}</span>
                            <span className="material-symbols-outlined text-xs">unfold_more</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}

                  {tasksForMonth.length === 0 && (
                    <div className="py-6 text-center text-xs text-slate-400 italic">
                      No tasks assigned for this month. Add from the Opportunity Center or create a custom task.
                    </div>
                  )}
                </div>
              </div>
            );
          })}
      </div>

      {/* Add Custom Task Modal / Drawer */}
      {isAddingTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Add Custom Action Task</h3>
              <button
                type="button"
                onClick={() => setIsAddingTask(false)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Task Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newTaskData.task}
                  onChange={(e) => setNewTaskData({ ...newTaskData, task: e.target.value })}
                  placeholder="e.g. Conduct customer exit interview survey"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-blue-500 outline-none text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Month Horizon
                  </label>
                  <select
                    value={newTaskData.month}
                    onChange={(e) => setNewTaskData({ ...newTaskData, month: parseInt(e.target.value, 10) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white outline-none text-xs"
                  >
                    <option value={1}>Month 1 — Foundation</option>
                    <option value={2}>Month 2 — Authority</option>
                    <option value={3}>Month 3 — Expansion</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Category
                  </label>
                  <select
                    value={newTaskData.category}
                    onChange={(e) => setNewTaskData({ ...newTaskData, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white outline-none text-xs"
                  >
                    <option value="Website">Website</option>
                    <option value="Content">Content</option>
                    <option value="Audience">Audience</option>
                    <option value="SEO">SEO</option>
                    <option value="AI Visibility">AI Visibility</option>
                    <option value="Conversion">Conversion</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Priority
                  </label>
                  <select
                    value={newTaskData.priority}
                    onChange={(e) => setNewTaskData({ ...newTaskData, priority: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white outline-none text-xs"
                  >
                    <option value="P1 — Critical">P1 — Critical</option>
                    <option value="P2 — High">P2 — High</option>
                    <option value="P3 — Medium">P3 — Medium</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Effort
                  </label>
                  <input
                    type="text"
                    value={newTaskData.effort}
                    onChange={(e) => setNewTaskData({ ...newTaskData, effort: e.target.value })}
                    placeholder="e.g. 2 Weeks"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 outline-none text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Expected Impact
                </label>
                <input
                  type="text"
                  value={newTaskData.expectedImpact}
                  onChange={(e) => setNewTaskData({ ...newTaskData, expectedImpact: e.target.value })}
                  placeholder="e.g. 15% recovery on churned trial users"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 outline-none text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Strategic Rationale
                </label>
                <textarea
                  rows={2}
                  value={newTaskData.strategicRationale}
                  onChange={(e) => setNewTaskData({ ...newTaskData, strategicRationale: e.target.value })}
                  placeholder="Why does this task belong in this sequence?"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 outline-none text-xs resize-none"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddingTask(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold cursor-pointer shadow-xs"
                >
                  Add Task to Roadmap
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
