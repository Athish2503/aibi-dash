import React, { useState } from 'react';
import { runCompetitiveGrowthAudit, previewSiteIntel } from '../../services/api';

const PRESETS = [
  {
    name: 'Linear vs Jira',
    badge: 'Productivity & Dev',
    company_name: 'Linear',
    company_url: 'linear.app',
    value_proposition: "The issue tracking tool you'll actually enjoy using. Built for high-velocity software teams.",
    competitor_urls: ['jira.atlassian.com', 'clickup.com'],
    primary_objective: 'Accelerate Qualified Enterprise Pipeline',
  },
  {
    name: 'Snowflake vs Databricks',
    badge: 'Data Infrastructure',
    company_name: 'Snowflake',
    company_url: 'snowflake.com',
    value_proposition: 'The AI Data Cloud — Mobilize data, build AI applications, and scale analytics with zero management.',
    competitor_urls: ['databricks.com', 'google.com/bigquery'],
    primary_objective: 'Eliminate Self-Serve to Sales-Assist Drop-Off',
  },
  {
    name: 'Supabase vs Firebase',
    badge: 'Backend as a Service',
    company_name: 'Supabase',
    company_url: 'supabase.com',
    value_proposition: 'The open source Firebase alternative with Postgres database, Authentication, and Edge Functions.',
    competitor_urls: ['firebase.google.com'],
    primary_objective: 'Capture High-Intent Competitor Displacements',
  },
  {
    name: 'PostHog vs Amplitude',
    badge: 'Product Analytics',
    company_name: 'PostHog',
    company_url: 'posthog.com',
    value_proposition: 'The single platform for product analytics, session replay, feature flags, and A/B testing.',
    competitor_urls: ['amplitude.com', 'mixpanel.com'],
    primary_objective: 'Establish AEO & AI Discoverability Moat',
  },
];

const GOAL_OPTIONS = [
  {
    id: 'Accelerate Qualified Enterprise Pipeline',
    title: 'Enterprise Pipeline',
    subtitle: 'Close bigger accounts',
    desc: 'Prioritize enterprise proof, security badges & procurement signals.',
    icon: 'domain',
    accent: 'from-blue-500/20 to-indigo-500/20 text-blue-400 border-blue-500/30',
  },
  {
    id: 'Eliminate Self-Serve to Sales-Assist Drop-Off',
    title: 'Self-Serve Conversion',
    subtitle: 'Streamline signup flow',
    desc: 'Eliminate pricing transparency friction & self-serve signup drop-off.',
    icon: 'bolt',
    accent: 'from-amber-500/20 to-orange-500/20 text-amber-400 border-amber-500/30',
  },
  {
    id: 'Establish AEO & AI Discoverability Moat',
    title: 'AI Search & AEO',
    subtitle: 'Answer engine moat',
    desc: 'Boost visibility and direct answers in ChatGPT, Perplexity & Claude.',
    icon: 'neurology',
    accent: 'from-cyan-500/20 to-teal-500/20 text-cyan-400 border-cyan-500/30',
  },
  {
    id: 'Capture High-Intent Competitor Displacements',
    title: 'Competitor Switchers',
    subtitle: 'Win competitor replacements',
    desc: 'Target comparison pages & switcher-ready migration messaging.',
    icon: 'swap_horiz',
    accent: 'from-emerald-500/20 to-teal-500/20 text-emerald-400 border-emerald-500/30',
  },
];

function normalizeDomain(input) {
  if (!input) return '';
  let cleaned = input.trim();
  cleaned = cleaned.replace(/^https?:\/\//i, '');
  cleaned = cleaned.replace(/^www\./i, '');
  cleaned = cleaned.split('/')[0]; // Host only
  cleaned = cleaned.split('?')[0];
  return cleaned.toLowerCase();
}

function renderStreamlinedBullets(text, bulletColor = 'bg-slate-400') {
  if (!text) return null;
  const items = text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  if (items.length <= 1) {
    return <p className="text-xs sm:text-[13px] text-slate-200 leading-relaxed font-normal">{text}</p>;
  }

  return (
    <ul className="space-y-1.5 text-xs sm:text-[13px] text-slate-200 leading-relaxed font-normal">
      {items.map((item, idx) => (
        <li key={idx} className="flex items-start gap-2">
          <span className={`w-1.5 h-1.5 rounded-full ${bulletColor} mt-2 shrink-0 opacity-70`} />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export default function CompetitiveAuditStudio({
  _onSwitchToBI,
  activeTab: externalTab = 'all',
  onSelectTab,
  onAuditCompleted,
}) {
  // Input Form State
  const [companyName, setCompanyName] = useState('Linear');
  const [companyUrl, setCompanyUrl] = useState('linear.app');
  const [valueProposition, setValueProposition] = useState(
    "The issue tracking tool you'll actually enjoy using. Built for high-velocity software teams."
  );
  const [competitorUrls, setCompetitorUrls] = useState(['jira.atlassian.com', 'clickup.com']);
  const [newCompetitorInput, setNewCompetitorInput] = useState('');
  const [primaryObjective, setPrimaryObjective] = useState('Accelerate Qualified Enterprise Pipeline');
  const [selectedPresetName, setSelectedPresetName] = useState('Linear vs Jira');

  // Autofill and Execution State
  const [isAutofilling, setIsAutofilling] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [auditStep, setAuditStep] = useState(0); // 0: Idle, 1: Scraping, 2: Reasoning, 3: Completed
  const [errorMessage, setErrorMessage] = useState(null);
  const [auditResult, setAuditResult] = useState(null);

  // Active Deliverable Tab
  const [internalTab, setInternalTab] = useState('all');
  const activeTab = (externalTab && externalTab !== 'audit') ? externalTab : internalTab;
  const [completedTasks, setCompletedTasks] = useState(new Set());
  const [showSignalsModal, setShowSignalsModal] = useState(false);
  const [expandedLeaks, setExpandedLeaks] = useState(new Set());

  const toggleLeakExpand = (idx) => {
    setExpandedLeaks((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  const handleTabChange = (tabId) => {
    setInternalTab(tabId);
    if (onSelectTab) {
      onSelectTab(tabId);
    }
  };

  // Apply an Example Preset
  const handleApplyPreset = (preset) => {
    setSelectedPresetName(preset.name);
    setCompanyName(preset.company_name);
    setCompanyUrl(preset.company_url);
    setValueProposition(preset.value_proposition);
    setCompetitorUrls([...preset.competitor_urls]);
    setPrimaryObjective(preset.primary_objective);
    setErrorMessage(null);
  };

  const handleClearForm = () => {
    setSelectedPresetName('');
    setCompanyName('');
    setCompanyUrl('');
    setValueProposition('');
    setCompetitorUrls([]);
    setErrorMessage(null);
  };

  // Add Competitor
  const handleAddCompetitor = () => {
    const raw = newCompetitorInput.trim();
    if (!raw) return;
    const cleanDomain = normalizeDomain(raw);
    if (!cleanDomain) return;

    if (competitorUrls.length >= 4) {
      setErrorMessage('A maximum of 4 competitor domains is supported.');
      return;
    }
    if (competitorUrls.includes(cleanDomain)) {
      setErrorMessage('This competitor domain is already in your list.');
      return;
    }
    setCompetitorUrls([...competitorUrls, cleanDomain]);
    setNewCompetitorInput('');
    setErrorMessage(null);
  };

  // Remove Competitor
  const handleRemoveCompetitor = (index) => {
    setCompetitorUrls(competitorUrls.filter((_, i) => i !== index));
    setErrorMessage(null);
  };

  // Suggest default competitors if list empty
  const handleSuggestCompetitors = () => {
    setCompetitorUrls(['jira.atlassian.com', 'clickup.com']);
    setErrorMessage(null);
  };

  // Auto-fill Value Proposition from live site scraping
  const handleAutofillFromSite = async () => {
    if (!companyUrl) {
      setErrorMessage('Please enter your website URL first.');
      return;
    }
    setIsAutofilling(true);
    setErrorMessage(null);
    try {
      const intel = await previewSiteIntel(companyUrl);
      if (intel?.meta_description) {
        setValueProposition(intel.meta_description);
      } else if (intel?.title) {
        setValueProposition(intel.title);
      } else {
        setValueProposition(`${companyName || 'Our product'} empowers high-velocity teams with streamlined workflow and intelligence.`);
      }
    } catch {
      setValueProposition("The issue tracking tool you'll actually enjoy using. Built for high-velocity software teams.");
    } finally {
      setIsAutofilling(false);
    }
  };

  // Run Competitive Audit
  const handleRunAudit = async () => {
    if (!companyName.trim() || !companyUrl.trim()) {
      setErrorMessage('Please provide your company name and website URL.');
      return;
    }
    if (competitorUrls.length < 1) {
      setErrorMessage('Add at least one competitor to benchmark against.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setAuditStep(1); // Scraping

    const stepInterval = setInterval(() => {
      setAuditStep((prev) => (prev < 2 ? prev + 1 : prev));
    }, 1400);

    try {
      const response = await runCompetitiveGrowthAudit({
        company_name: companyName.trim(),
        company_url: companyUrl.trim(),
        value_proposition: valueProposition.trim() || 'Software solution tailored for modern high-performance teams.',
        competitor_urls: competitorUrls.map((u) => u.trim()),
        primary_objective: primaryObjective,
      });

      clearInterval(stepInterval);
      setAuditResult(response);
      setAuditStep(3);
      if (onAuditCompleted) {
        onAuditCompleted(response);
      }
    } catch (err) {
      clearInterval(stepInterval);
      setErrorMessage(err.message || 'Audit execution failed. Please verify domain names.');
      setAuditStep(0);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTaskCompletion = (taskKey) => {
    setCompletedTasks((prev) => {
      const next = new Set(prev);
      if (next.has(taskKey)) next.delete(taskKey);
      else next.add(taskKey);
      return next;
    });
  };

  const handleExportBrief = () => {
    if (!auditResult) return;
    const jsonStr = JSON.stringify(auditResult, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${companyName.toLowerCase().replace(/\s+/g, '_')}_growth_audit.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="relative bg-[#070B16] text-[#E6EAF2] min-h-screen flex flex-col font-sans selection:bg-indigo-500 selection:text-white bg-dot-pattern">
      {/* Ambient Lighting Gradient */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1100px] h-[340px] bg-gradient-to-b from-indigo-500/12 via-purple-500/5 to-transparent blur-3xl pointer-events-none" />

      {/* Main Container */}
      <main className="relative z-10 flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 pt-8 pb-36 sm:pb-44 space-y-8">
        {/* Page Hero Header */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
              <span>REAL-TIME COMPETITIVE DOM SIGNALS · REVENUE AUDIT</span>
            </div>

            {/* Clear example reset */}
            {selectedPresetName && (
              <button
                type="button"
                onClick={handleClearForm}
                className="text-xs font-medium text-slate-400 hover:text-white underline cursor-pointer transition-colors"
                title="Reset form"
              >
                Clear form
              </button>
            )}
          </div>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                Competitor & Revenue Audit
              </h1>
              <p className="text-sm sm:text-base text-slate-300 mt-1 max-w-3xl leading-relaxed">
                Scan what competitors show enterprise buyers that you don't. Automatically uncover pricing models, proof points, and commercial revenue leaks in ~45 seconds.
              </p>
            </div>
          </div>

          {/* Instant Scenario Presets Bar */}
          <div className="pt-2 flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-slate-400 mr-1 flex items-center gap-1">
              <span className="material-symbols-outlined text-sm text-indigo-400">bolt</span>
              <span>Instant scenario:</span>
            </span>
            {PRESETS.map((p) => {
              const isSelected = selectedPresetName === p.name;
              return (
                <button
                  key={p.name}
                  type="button"
                  onClick={() => handleApplyPreset(p)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer flex items-center gap-2 shadow-xs ${
                    isSelected
                      ? 'bg-gradient-to-r from-indigo-600/30 to-violet-600/30 text-white border-indigo-500/60 shadow-indigo-500/20 ring-1 ring-indigo-500/30'
                      : 'bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white border-white/[0.08]'
                  }`}
                >
                  <img
                    src={`https://www.google.com/s2/favicons?domain=${p.company_url}&sz=32`}
                    alt=""
                    className="w-3.5 h-3.5 rounded-xs"
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                  <span>{p.name}</span>
                  <span className="text-[10px] text-slate-400 font-normal">({p.badge})</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Global Error Notification */}
        {errorMessage && (
          <div
            role="alert"
            className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-200 text-xs flex items-center justify-between gap-3 animate-fade-in shadow-lg"
          >
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-base text-rose-400">error</span>
              <span className="font-semibold">{errorMessage}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleRunAudit}
                className="px-2.5 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-100 text-xs font-semibold cursor-pointer transition-colors"
              >
                Retry
              </button>
              <button
                type="button"
                onClick={() => setErrorMessage(null)}
                className="text-rose-300 hover:text-white cursor-pointer px-1 text-sm"
                aria-label="Dismiss error"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* 2-Column Desktop Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] gap-6 items-start">
          {/* Left Column: Form Card */}
          <section className="executive-glass rounded-2xl p-6 sm:p-7 space-y-6">
            {/* Step 1: Your company */}
            <div className="space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-indigo-500/30 to-violet-500/30 text-indigo-300 border border-indigo-500/40 font-bold text-xs flex items-center justify-center shadow-xs">
                  1
                </div>
                <h2 className="text-base font-bold text-white tracking-tight">Your company</h2>
              </div>

              {/* Name & Website row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[13px] font-semibold text-slate-200 mb-1.5">
                    Company name
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined text-sm text-slate-400 absolute left-3 top-3 pointer-events-none">
                      apartment
                    </span>
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="e.g. Linear"
                      className="executive-input w-full h-11 rounded-xl pl-9 pr-3 text-sm text-white placeholder-slate-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[13px] font-semibold text-slate-200 mb-1.5">
                    Website domain
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined text-sm text-slate-400 absolute left-3 top-3 pointer-events-none">
                      language
                    </span>
                    <input
                      type="text"
                      value={companyUrl}
                      onChange={(e) => setCompanyUrl(normalizeDomain(e.target.value))}
                      placeholder="e.g. linear.app"
                      className="executive-input w-full h-11 rounded-xl pl-9 pr-3 text-sm font-mono text-white placeholder-slate-500"
                    />
                  </div>
                </div>
              </div>

              {/* Value Proposition with Auto-fill */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[13px] font-semibold text-slate-200">
                    What you sell, in one sentence
                  </label>
                  <button
                    type="button"
                    onClick={handleAutofillFromSite}
                    disabled={isAutofilling || !companyUrl}
                    className="text-xs font-semibold text-indigo-300 hover:text-indigo-200 disabled:opacity-40 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 cursor-pointer transition-all shadow-2xs"
                    title="Inspect site and extract value proposition"
                  >
                    <span className={`material-symbols-outlined text-xs ${isAutofilling ? 'animate-spin' : ''}`}>
                      {isAutofilling ? 'progress_activity' : 'auto_awesome'}
                    </span>
                    <span>{isAutofilling ? 'Scanning site...' : 'Auto-fill from site'}</span>
                  </button>
                </div>
                <textarea
                  rows={2}
                  value={valueProposition}
                  onChange={(e) => setValueProposition(e.target.value)}
                  placeholder="e.g. The issue tracking tool you'll actually enjoy using. Built for high-velocity software teams."
                  className="executive-input w-full rounded-xl p-3 text-sm text-white placeholder-slate-500 resize-none leading-relaxed"
                />
              </div>
            </div>

            <div className="border-t border-white/[0.06]" />

            {/* Step 2: Competitors */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-indigo-500/30 to-violet-500/30 text-indigo-300 border border-indigo-500/40 font-bold text-xs flex items-center justify-center shadow-xs">
                    2
                  </div>
                  <h2 className="text-base font-bold text-white tracking-tight">Competitors to benchmark</h2>
                </div>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-white/[0.06] text-slate-300 border border-white/[0.08]">
                  {competitorUrls.length} of 4 domains
                </span>
              </div>

              {/* Competitor Chips */}
              <div className="flex flex-wrap items-center gap-2 min-h-[36px]">
                {competitorUrls.map((url, idx) => (
                  <div
                    key={url}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#090D18] border border-white/[0.1] text-white text-xs font-mono shadow-xs hover:border-indigo-500/40 transition-colors"
                  >
                    <img
                      src={`https://www.google.com/s2/favicons?domain=${url}&sz=32`}
                      alt=""
                      className="w-4 h-4 rounded-xs shrink-0"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                    <span>{url}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveCompetitor(idx)}
                      className="text-slate-400 hover:text-rose-400 ml-1 cursor-pointer font-sans text-sm p-0.5 rounded hover:bg-white/[0.08]"
                      title={`Remove ${url}`}
                      aria-label={`Remove ${url}`}
                    >
                      ×
                    </button>
                  </div>
                ))}

                {competitorUrls.length === 0 && (
                  <div className="text-xs text-slate-400 flex items-center gap-2">
                    <span>No competitors added yet.</span>
                    <button
                      type="button"
                      onClick={handleSuggestCompetitors}
                      className="text-indigo-400 hover:text-indigo-300 font-semibold underline cursor-pointer"
                    >
                      Suggest top competitors
                    </button>
                  </div>
                )}
              </div>

              {/* Add Competitor Input Row */}
              {competitorUrls.length < 4 && (
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <span className="material-symbols-outlined text-sm text-slate-400 absolute left-3 top-3 pointer-events-none">
                      add_link
                    </span>
                    <input
                      type="text"
                      value={newCompetitorInput}
                      onChange={(e) => setNewCompetitorInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddCompetitor();
                        } else if (e.key === 'Backspace' && !newCompetitorInput && competitorUrls.length > 0) {
                          handleRemoveCompetitor(competitorUrls.length - 1);
                        }
                      }}
                      placeholder="Add competitor domain (e.g. clickup.com) + ↵ Enter"
                      className="executive-input w-full h-11 rounded-xl pl-9 pr-3 text-sm font-mono text-white placeholder-slate-500"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleAddCompetitor}
                    disabled={!newCompetitorInput.trim()}
                    className="h-11 px-4 rounded-xl border border-white/[0.1] hover:bg-white/[0.08] text-sm font-semibold text-white disabled:opacity-40 transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <span>+ Add</span>
                    <kbd className="text-[10px] text-slate-400 font-mono px-1 py-0.2 rounded bg-black/30 border border-white/[0.08]">
                      ↵
                    </kbd>
                  </button>
                </div>
              )}
            </div>

            <div className="border-t border-white/[0.06]" />

            {/* Step 3: Strategic focus */}
            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-2.5 mb-1">
                  <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-indigo-500/30 to-violet-500/30 text-indigo-300 border border-indigo-500/40 font-bold text-xs flex items-center justify-center shadow-xs">
                    3
                  </div>
                  <h2 className="text-base font-bold text-white tracking-tight">Strategic focus & objective</h2>
                </div>
                <p className="text-xs text-slate-300 ml-8.5">
                  Directs which revenue leaks and tactical gaps we prioritize in the audit.
                </p>
              </div>

              {/* 4 Selectable Goal Cards (2x2 Grid) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {GOAL_OPTIONS.map((goal) => {
                  const isSelected = primaryObjective === goal.id;
                  return (
                    <button
                      key={goal.id}
                      type="button"
                      onClick={() => setPrimaryObjective(goal.id)}
                      className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between group ${
                        isSelected
                          ? 'bg-gradient-to-br from-indigo-950/40 to-slate-900 border-indigo-500 shadow-md shadow-indigo-500/10 ring-1 ring-indigo-500/50'
                          : 'bg-[#090D18]/90 border-white/[0.06] hover:border-white/[0.15] hover:bg-[#0B1020]'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2.5">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-8 h-8 rounded-xl border flex items-center justify-center ${goal.accent}`}>
                            <span className="material-symbols-outlined text-base">
                              {goal.icon}
                            </span>
                          </div>
                          <div>
                            <div className="text-sm font-bold text-white">{goal.title}</div>
                            <div className="text-[11px] text-slate-400 font-medium">{goal.subtitle}</div>
                          </div>
                        </div>
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                            isSelected ? 'border-indigo-400 bg-indigo-500' : 'border-white/[0.2] group-hover:border-white/[0.4]'
                          }`}
                        >
                          {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed font-normal">{goal.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Right Column: Executive Deliverables Showcase */}
          <aside className="executive-glass rounded-2xl p-6 space-y-6 lg:sticky lg:top-24">
            <div className="flex items-center justify-between pb-3.5 border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-indigo-400 text-lg">verified</span>
                <h3 className="text-base font-bold text-white tracking-tight">Audit deliverables</h3>
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                4 Core Deliverables
              </span>
            </div>

            <div className="space-y-4">
              {/* Deliverable 1 */}
              <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-start gap-3 hover:border-white/[0.1] transition-colors">
                <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-base">view_column</span>
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">1. Competitor Gap Matrix</div>
                  <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                    Side-by-side benchmarking of pricing tiers, proof badges, feature gating, and positioning.
                  </p>
                </div>
              </div>

              {/* Deliverable 2 */}
              <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-start gap-3 hover:border-white/[0.1] transition-colors">
                <div className="w-7 h-7 rounded-lg bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-base">leak_remove</span>
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">2. Revenue Leak Diagnostics</div>
                  <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                    Uncovers exact friction points causing buyer bounce, abandoned trials, or lost RFPs.
                  </p>
                </div>
              </div>

              {/* Deliverable 3 */}
              <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-start gap-3 hover:border-white/[0.1] transition-colors">
                <div className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-base">rocket_launch</span>
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">3. Prioritized Growth Bets</div>
                  <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                    Ranked P1/P2 strategic initiatives with projected ARR impact and tactical action steps.
                  </p>
                </div>
              </div>

              {/* Deliverable 4 */}
              <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-start gap-3 hover:border-white/[0.1] transition-colors">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-base">calendar_month</span>
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">4. 90-Day Tactical Sprint</div>
                  <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                    Sequenced sprint roadmap across Month 1, Month 2, and Month 3 with interactive task checks.
                  </p>
                </div>
              </div>
            </div>

            {/* Live Intel Sample Teaser Box */}
            <div className="p-3.5 rounded-xl bg-indigo-950/30 border border-indigo-500/20 space-y-1.5">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-indigo-300 uppercase tracking-wider">
                <span className="material-symbols-outlined text-sm">visibility</span>
                <span>Sample Live Signal Extraction</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-mono">
                "Linear pricing lacks visible SOC2 compliance badge. Jira displays this prominently above the fold, yielding 38% higher enterprise capture."
              </p>
            </div>

            <div className="pt-2 text-xs text-slate-400 flex items-center gap-2">
              <span className="material-symbols-outlined text-base text-emerald-400">offline_bolt</span>
              <span>Scans {competitorUrls.length + 1} domains concurrently in ~45 seconds.</span>
            </div>
          </aside>
        </div>

        {/* Live Scanning Progress Overlay / Block */}
        {isLoading && (
          <div
            aria-live="polite"
            className="executive-glass rounded-2xl p-6 sm:p-7 space-y-5 animate-fade-in border-indigo-500/40 shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-indigo-500 animate-ping" />
                <h3 className="text-sm font-bold text-white tracking-tight">
                  Running Concurrent Audit Pipeline...
                </h3>
              </div>
              <span className="text-xs text-indigo-300 font-mono px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/30">
                Phase {auditStep} of 2 Active
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-[#050812] rounded-full h-2.5 overflow-hidden border border-white/[0.08] shadow-inner">
              <div
                className="bg-gradient-to-r from-indigo-500 via-blue-500 to-emerald-400 h-full transition-all duration-700 shadow-md shadow-indigo-500/50"
                style={{ width: auditStep === 1 ? '55%' : '90%' }}
              />
            </div>

            {/* Live Domain Status Chips */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-1">
              {/* Target Company */}
              <div className="p-3 rounded-xl bg-[#090D18] border border-white/[0.08] flex items-center justify-between">
                <div className="flex items-center gap-2.5 truncate">
                  <span className="material-symbols-outlined text-base text-emerald-400">
                    check_circle
                  </span>
                  <span className="text-xs font-mono text-white truncate">
                    {companyUrl || 'your company'}
                  </span>
                </div>
                <span className="text-[11px] font-bold text-emerald-400 ml-2">done</span>
              </div>

              {/* Competitors */}
              {competitorUrls.map((url, idx) => {
                const isScanning = auditStep === 1 && idx === 0;
                const isDone = auditStep >= 2;
                return (
                  <div
                    key={url}
                    className="p-3 rounded-xl bg-[#090D18] border border-white/[0.08] flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <span
                        className={`material-symbols-outlined text-base ${
                          isDone
                            ? 'text-emerald-400'
                            : isScanning
                            ? 'text-indigo-400 animate-spin'
                            : 'text-slate-500'
                        }`}
                      >
                        {isDone
                          ? 'check_circle'
                          : isScanning
                          ? 'progress_activity'
                          : 'hourglass_empty'}
                      </span>
                      <span className="text-xs font-mono text-white truncate">{url}</span>
                    </div>
                    <span
                      className={`text-[11px] font-bold ml-2 ${
                        isDone
                          ? 'text-emerald-400'
                          : isScanning
                          ? 'text-indigo-400'
                          : 'text-slate-500'
                      }`}
                    >
                      {isDone ? 'done' : isScanning ? 'scanning...' : 'waiting'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Deliverables Results Dashboard */}
        {auditResult && (
          <div className="space-y-6 pt-4 animate-fade-in">
            {/* Executive Certified Banner */}
            <div className="executive-glass rounded-2xl p-6 sm:p-7 space-y-4 shadow-2xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
                <div className="flex items-center gap-2.5">
                  <span className="px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5 shadow-xs">
                    <span className="material-symbols-outlined text-xs">verified</span>
                    <span>Audit Certified & Complete</span>
                  </span>
                  <span className="text-xs text-slate-300 font-mono">
                    {competitorUrls.length} Competitors · Goal: {primaryObjective}
                  </span>
                </div>

                <div className="flex items-center gap-2.5">
                  {auditResult.scraped_signals && (
                    <button
                      type="button"
                      onClick={() => setShowSignalsModal(true)}
                      className="px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-slate-200 text-xs font-semibold border border-white/[0.08] transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-sm text-cyan-400">
                        data_object
                      </span>
                      <span>Diagnostic Signals</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleExportBrief}
                    className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-sm">download</span>
                    <span>Export Brief (JSON)</span>
                  </button>
                </div>
              </div>

              {/* Executive Summary Paragraph */}
              <div className="text-sm sm:text-base text-slate-200 leading-relaxed font-normal">
                <p>{auditResult.executive_summary}</p>
              </div>

              {/* KPI Metrics Highlight Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-white/[0.08]">
                <div className="p-3.5 rounded-xl bg-[#090D18] border border-white/[0.08]">
                  <div className="text-xs font-medium text-slate-400">Gap Matrix Levers</div>
                  <div className="text-xl font-bold text-white mt-0.5">
                    {auditResult.gap_matrix?.length || 0} Levers
                  </div>
                </div>
                <div className="p-3.5 rounded-xl bg-[#090D18] border border-white/[0.08]">
                  <div className="text-xs font-medium text-rose-400">Revenue Leaks</div>
                  <div className="text-xl font-bold text-rose-300 mt-0.5">
                    {auditResult.revenue_leaks?.length || 0} Bottlenecks
                  </div>
                </div>
                <div className="p-3.5 rounded-xl bg-[#090D18] border border-white/[0.08]">
                  <div className="text-xs font-medium text-indigo-400">Prioritized Bets</div>
                  <div className="text-xl font-bold text-indigo-300 mt-0.5">
                    {auditResult.growth_bets?.length || 0} Bets
                  </div>
                </div>
                <div className="p-3.5 rounded-xl bg-[#090D18] border border-white/[0.08]">
                  <div className="text-xs font-medium text-emerald-400">Roadmap Sprints</div>
                  <div className="text-xl font-bold text-emerald-300 mt-0.5">90-Day Plan</div>
                </div>
              </div>
            </div>

            {/* Deliverables Internal Segmented Tab Strip */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-white/[0.08]">
              {[
                { id: 'all', label: 'All 4 Deliverables', icon: 'dashboard' },
                { id: 'matrix', label: '1. Competitor Gap Matrix', icon: 'view_column' },
                { id: 'leaks', label: '2. Revenue Leaks', icon: 'leak_remove' },
                { id: 'bets', label: '3. Prioritized Growth Bets', icon: 'rocket_launch' },
                { id: 'sprint', label: '4. 90-Day Tactical Plan', icon: 'calendar_month' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleTabChange(tab.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md shadow-indigo-600/30'
                      : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
                  }`}
                >
                  <span className="material-symbols-outlined text-sm">{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* DELIVERABLE 1: Competitor Gap Matrix */}
            {(activeTab === 'all' || activeTab === 'matrix') && (
              <section className="executive-glass rounded-2xl p-6 sm:p-7 space-y-4 shadow-xl">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold text-xs">
                    1
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white tracking-tight">
                      Competitor Gap Matrix
                    </h3>
                    <p className="text-xs text-slate-300">
                      What competitors show buyers that you don't across pricing, proof, and messaging.
                    </p>
                  </div>
                </div>

                <div className="overflow-x-auto rounded-xl border border-white/[0.08]">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-[#090D18] text-white font-semibold text-[12px] border-b border-white/[0.08]">
                      <tr>
                        <th className="p-3.5 w-1/4">Growth Lever</th>
                        <th className="p-3.5 w-1/4 text-rose-300">Your Current Execution</th>
                        <th className="p-3.5 w-1/4 text-emerald-300">Competitor Benchmark</th>
                        <th className="p-3.5 w-1/4 text-amber-300">Commercial Impact & Risk</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.06]">
                      {auditResult.gap_matrix?.map((row, idx) => (
                        <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                          <td className="p-3.5 font-semibold text-white">
                            <div className="flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                              <span>{row.capability}</span>
                            </div>
                          </td>
                          <td className="p-3.5 text-slate-200">
                            <div className="p-2.5 rounded-xl bg-[#090D18] border border-rose-500/20 text-rose-200">
                              {row.user_state}
                            </div>
                          </td>
                          <td className="p-3.5 text-slate-200">
                            <div className="p-2.5 rounded-xl bg-[#090D18] border border-emerald-500/20 text-emerald-200">
                              {row.competitor_state}
                            </div>
                          </td>
                          <td className="p-3.5 text-slate-200 leading-relaxed">
                            <div className="p-2.5 rounded-xl bg-[#090D18] border border-amber-500/20 text-amber-200 font-medium">
                              {row.business_impact}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            {/* DELIVERABLE 2: Revenue Leaks & Friction */}
            {(activeTab === 'all' || activeTab === 'leaks') && (
              <section className="executive-glass rounded-2xl p-6 sm:p-7 space-y-6 shadow-xl">
                {/* Section Header with Expand / Collapse All Toggle */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/[0.06]">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center font-bold text-sm shadow-xs">
                      2
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                          Revenue Leaks & Commercial Friction
                        </h3>
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/30">
                          {auditResult.revenue_leaks?.length || 0} Bottlenecks Identified
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 mt-0.5">
                        Friction points causing buyer bounce, prolonged sales cycles, or lost enterprise deals.
                      </p>
                    </div>
                  </div>

                  {/* Expand All / Collapse All Toggle */}
                  {auditResult.revenue_leaks && auditResult.revenue_leaks.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        if (expandedLeaks.size === auditResult.revenue_leaks.length) {
                          setExpandedLeaks(new Set());
                        } else {
                          setExpandedLeaks(new Set(auditResult.revenue_leaks.map((_, i) => i)));
                        }
                      }}
                      className="self-start sm:self-auto text-xs font-semibold text-indigo-300 hover:text-white px-3 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.1] transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <span className="material-symbols-outlined text-sm">
                        {expandedLeaks.size === auditResult.revenue_leaks.length ? 'unfold_less' : 'unfold_more'}
                      </span>
                      <span>
                        {expandedLeaks.size === auditResult.revenue_leaks.length ? 'Collapse All' : 'Expand All Details'}
                      </span>
                    </button>
                  )}
                </div>

                {/* Cards Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6 pt-1">
                  {auditResult.revenue_leaks?.map((leak, idx) => {
                    const isExpanded = expandedLeaks.has(idx);
                    const isHigh = leak.estimated_revenue_risk?.toLowerCase().includes('high');
                    const isMedium = leak.estimated_revenue_risk?.toLowerCase().includes('medium');
                    return (
                      <div
                        key={idx}
                        className={`rounded-2xl border transition-all duration-200 flex flex-col justify-between ${
                          isExpanded
                            ? 'bg-[#090D18] border-indigo-500/40 shadow-xl shadow-indigo-500/5'
                            : 'bg-[#090D18]/90 border-white/[0.08] hover:border-white/[0.16] hover:bg-[#0B1020]'
                        } p-6 sm:p-7 space-y-4`}
                      >
                        {/* Card Top Row: Badges & View Details toggle */}
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-bold border tracking-wide uppercase flex items-center gap-1.5 ${
                                isHigh
                                  ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                                  : isMedium
                                  ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                                  : 'bg-slate-700/30 text-slate-300 border-slate-600/30'
                              }`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${isHigh ? 'bg-rose-400' : isMedium ? 'bg-amber-400' : 'bg-slate-400'}`} />
                              <span>Risk: {leak.estimated_revenue_risk}</span>
                            </span>
                            <span className="text-xs font-mono text-slate-400 font-medium">
                              Leak #{idx + 1}
                            </span>
                          </div>

                          {/* Progressive Disclosure Toggle */}
                          <button
                            type="button"
                            onClick={() => toggleLeakExpand(idx)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold text-indigo-300 hover:text-white bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 transition-all cursor-pointer shadow-2xs"
                            aria-expanded={isExpanded}
                          >
                            <span>{isExpanded ? 'Hide Details' : 'View Details & Fix'}</span>
                            <span className="material-symbols-outlined text-sm">
                              {isExpanded ? 'expand_less' : 'expand_more'}
                            </span>
                          </button>
                        </div>

                        {/* Main Leak Title (Enhanced Visual Hierarchy) */}
                        <div>
                          <h4 className="text-base sm:text-[17px] font-bold text-white tracking-tight leading-snug">
                            {leak.friction_point}
                          </h4>
                          {!isExpanded && (
                            <p className="text-xs text-slate-400 mt-2 line-clamp-1 flex items-center gap-1.5">
                              <span className="material-symbols-outlined text-xs text-slate-500">compare_arrows</span>
                              <span><strong className="text-slate-300">Competitor benchmark:</strong> {leak.competitor_benchmark}</span>
                            </p>
                          )}
                        </div>

                        {/* Progressive Disclosure Content (Problem vs Solution Distinct Backgrounds) */}
                        {isExpanded && (
                          <div className="space-y-4 pt-2 animate-fade-in">
                            {/* 1. Problem: Competitor Benchmark */}
                            <div className="p-4 sm:p-5 rounded-xl bg-rose-950/20 border border-rose-500/25 space-y-2">
                              <div className="flex items-center gap-1.5 text-xs font-bold text-rose-300 uppercase tracking-wider">
                                <span className="material-symbols-outlined text-sm text-rose-400">warning</span>
                                <span>Problem: Competitor Benchmark</span>
                              </div>
                              {renderStreamlinedBullets(leak.competitor_benchmark, 'bg-rose-400')}
                            </div>

                            {/* 2. Solution: Recommended Fix */}
                            <div className="p-4 sm:p-5 rounded-xl bg-emerald-950/20 border border-emerald-500/25 space-y-2">
                              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-300 uppercase tracking-wider">
                                <span className="material-symbols-outlined text-sm text-emerald-400">task_alt</span>
                                <span>Solution: Actionable Recommended Fix</span>
                              </div>
                              {renderStreamlinedBullets(leak.recommended_fix, 'bg-emerald-400')}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* DELIVERABLE 3: Prioritized Growth Bets */}
            {(activeTab === 'all' || activeTab === 'bets') && (
              <section className="executive-glass rounded-2xl p-6 sm:p-7 space-y-4 shadow-xl">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-bold text-xs">
                    3
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white tracking-tight">
                      Prioritized Growth Bets
                    </h3>
                    <p className="text-xs text-slate-300">
                      Ranked tactical moves prioritized by expected commercial business lift.
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  {auditResult.growth_bets?.map((bet, idx) => {
                    const isP1 = bet.priority?.includes('P1');
                    return (
                      <div
                        key={idx}
                        className={`p-5 rounded-2xl border transition-all ${
                          isP1
                            ? 'bg-[#090D18] border-indigo-500/50 shadow-md shadow-indigo-500/10'
                            : 'bg-[#090D18] border-white/[0.08]'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-white/[0.08]">
                          <div className="flex items-center gap-2.5">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-bold ${
                                isP1
                                  ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-xs'
                                  : 'bg-white/[0.08] text-slate-200'
                              }`}
                            >
                              {bet.priority}
                            </span>
                            <h4 className="text-sm font-bold text-white">{bet.title}</h4>
                          </div>

                          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold">
                            <span className="material-symbols-outlined text-sm">trending_up</span>
                            <span>{bet.expected_business_lift}</span>
                          </div>
                        </div>

                        <div className="mt-3 text-xs text-slate-200 leading-relaxed">
                          <span className="font-semibold text-slate-400">Strategic Rationale: </span>
                          {bet.strategic_rationale}
                        </div>

                        {bet.action_steps && bet.action_steps.length > 0 && (
                          <div className="mt-4 pt-3 border-t border-white/[0.06]">
                            <div className="text-xs font-bold text-slate-400 mb-2">
                              Tactical Implementation Checklist
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                              {bet.action_steps.map((step, sIdx) => {
                                const stepKey = `bet_${idx}_step_${sIdx}`;
                                const isChecked = completedTasks.has(stepKey);
                                return (
                                  <label
                                    key={sIdx}
                                    onClick={() => toggleTaskCompletion(stepKey)}
                                    className={`p-2.5 rounded-xl border flex items-start gap-2.5 cursor-pointer transition-colors ${
                                      isChecked
                                        ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-200 line-through'
                                        : 'bg-white/[0.03] border-white/[0.06] text-slate-200 hover:border-white/[0.15]'
                                    }`}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={isChecked}
                                      readOnly
                                      className="mt-0.5 rounded text-indigo-600 focus:ring-0"
                                    />
                                    <span className="text-xs">{step}</span>
                                  </label>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* DELIVERABLE 4: 90-Day Tactical Sprint Plan */}
            {(activeTab === 'all' || activeTab === 'sprint' || activeTab === 'plan') && (
              <section className="executive-glass rounded-2xl p-6 sm:p-7 space-y-4 shadow-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold text-xs">
                      4
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white tracking-tight">
                        90-Day Tactical Plan
                      </h3>
                      <p className="text-xs text-slate-300">
                        Sequential execution roadmap across Month 1, Month 2, and Month 3.
                      </p>
                    </div>
                  </div>

                  <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                    {completedTasks.size} Tasks Completed
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {auditResult.sprint_plan?.map((phase, pIdx) => (
                    <div
                      key={pIdx}
                      className="p-4 rounded-xl bg-[#090D18] border border-white/[0.08] flex flex-col justify-between space-y-4"
                    >
                      <div>
                        <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                          <span className="text-xs font-bold text-white uppercase tracking-wider">
                            {phase.phase_name}
                          </span>
                          <span className="text-xs font-mono px-2 py-0.5 rounded bg-white/[0.06] text-slate-300">
                            Month {pIdx + 1}
                          </span>
                        </div>

                        <div className="space-y-2 mt-3">
                          {phase.tasks?.map((task, tIdx) => {
                            const taskKey = `phase_${pIdx}_task_${tIdx}`;
                            const isDone = completedTasks.has(taskKey);
                            return (
                              <div
                                key={tIdx}
                                onClick={() => toggleTaskCompletion(taskKey)}
                                className={`p-3 rounded-xl border text-xs cursor-pointer transition-all flex items-start gap-2.5 ${
                                  isDone
                                    ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
                                    : 'bg-white/[0.03] border-white/[0.06] text-slate-200 hover:border-white/[0.15]'
                                }`}
                              >
                                <span
                                  className={`material-symbols-outlined text-sm mt-0.5 ${
                                    isDone ? 'text-emerald-400' : 'text-slate-500'
                                  }`}
                                >
                                  {isDone ? 'check_circle' : 'radio_button_unchecked'}
                                </span>
                                <span className={isDone ? 'line-through opacity-80' : ''}>
                                  {task}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <div className="pt-2 border-t border-white/[0.06] text-xs text-slate-400 flex items-center justify-between">
                        <span>Sprint Phase {pIdx + 1}</span>
                        <span>{phase.tasks?.length || 0} Action Items</span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}

        {/* Diagnostic Modal for Scraped Signals */}
        {showSignalsModal && auditResult?.scraped_signals && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="executive-glass rounded-2xl max-w-4xl w-full max-h-[85vh] overflow-y-auto p-6 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-cyan-400">data_object</span>
                  <h3 className="text-base font-bold text-white">Diagnostic Scraped Signals</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowSignalsModal(false)}
                  className="p-1 rounded-lg hover:bg-white/[0.08] text-slate-400 hover:text-white cursor-pointer"
                  aria-label="Close modal"
                >
                  <span className="material-symbols-outlined text-lg">close</span>
                </button>
              </div>

              {/* Target Company Intel */}
              <div className="p-4 rounded-xl bg-[#090D18] border border-white/[0.08] space-y-2">
                <div className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Target Company Intel</div>
                <div className="text-xs text-white font-mono">
                  {auditResult.scraped_signals.target_company?.url}
                </div>
                <div className="text-xs text-slate-200">
                  <strong>Title:</strong> {auditResult.scraped_signals.target_company?.title || 'None'}
                </div>
                <div className="text-xs text-slate-400">
                  <strong>Meta:</strong> {auditResult.scraped_signals.target_company?.meta_description || 'None'}
                </div>
              </div>

              {/* Competitors Intel */}
              <div className="space-y-3">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Competitor Intel Records</div>
                {auditResult.scraped_signals.competitors?.map((comp, cIdx) => (
                  <div
                    key={cIdx}
                    className="p-4 rounded-xl bg-[#090D18] border border-white/[0.08] space-y-2"
                  >
                    <div className="text-xs text-emerald-400 font-mono font-bold">{comp.url}</div>
                    <div className="text-xs text-slate-200">
                      <strong>Title:</strong> {comp.title || 'None'}
                    </div>
                    <div className="text-xs text-slate-400">
                      <strong>Meta:</strong> {comp.meta_description || 'None'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Floating Executive Action Dock */}
      <aside aria-label="Audit execution controls" className="sticky bottom-4 z-30 max-w-7xl mx-auto w-full px-4 sm:px-6 pointer-events-none">
        <div className="pointer-events-auto bg-[#0A0F1F]/95 backdrop-blur-xl border border-white/[0.12] rounded-2xl py-3 px-5 sm:px-6 shadow-[0_20px_50px_rgba(0,0,0,0.8)] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="relative flex h-2.5 w-2.5">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${auditResult ? 'bg-indigo-400' : 'bg-emerald-400'} opacity-75`} />
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${auditResult ? 'bg-indigo-500' : 'bg-emerald-500'}`} />
            </span>
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-2">
                <span>{auditResult ? 'Audit Certified & Verified' : `Scans ${competitorUrls.length + (companyUrl ? 1 : 0)} domains concurrently`}</span>
                <span className="text-[11px] text-indigo-300 font-mono font-normal">
                  {auditResult ? `${auditResult.revenue_leaks?.length || 0} Leaks · ${auditResult.growth_bets?.length || 0} Bets` : '~45 seconds'}
                </span>
              </div>
              <div className="text-[11px] text-slate-400 truncate max-w-xs sm:max-w-md">
                {companyUrl || 'Your domain'} vs {competitorUrls.join(', ') || 'Select competitors'}
              </div>
            </div>
          </div>

          {auditResult ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleExportBrief}
                className="h-11 px-4.5 rounded-xl font-semibold text-xs transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer bg-white/[0.08] hover:bg-white/[0.14] text-white border border-white/[0.1]"
              >
                <span className="material-symbols-outlined text-sm text-cyan-400">download</span>
                <span>Export Brief</span>
              </button>
              <button
                type="button"
                onClick={handleRunAudit}
                disabled={isLoading}
                className="h-11 px-5 rounded-xl font-bold text-xs transition-all shadow-lg flex items-center justify-center gap-1.5 cursor-pointer bg-gradient-to-r from-indigo-500 via-indigo-600 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white shadow-indigo-600/30 hover:shadow-indigo-600/50 hover:-translate-y-0.5 active:translate-y-0"
              >
                <span className="material-symbols-outlined text-sm">refresh</span>
                <span>Re-run Audit</span>
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleRunAudit}
              disabled={
                isLoading || !companyName.trim() || !companyUrl.trim() || competitorUrls.length === 0
              }
              className={`h-12 px-7 rounded-xl font-bold text-sm tracking-wide transition-all shadow-xl flex items-center justify-center gap-2.5 cursor-pointer whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-[#070B16] ${
                isLoading ||
                !companyName.trim() ||
                !companyUrl.trim() ||
                competitorUrls.length === 0
                  ? 'bg-white/[0.08] text-slate-500 cursor-not-allowed opacity-50 border border-white/[0.06]'
                  : 'bg-gradient-to-r from-indigo-500 via-indigo-600 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white shadow-indigo-600/30 hover:shadow-indigo-600/50 hover:-translate-y-0.5 active:translate-y-0'
              }`}
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  <span>Running Audit Pipeline...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-lg">bolt</span>
                  <span>Run Competitive Audit</span>
                </>
              )}
            </button>
          )}
        </div>
      </aside>
    </div>
  );
}
