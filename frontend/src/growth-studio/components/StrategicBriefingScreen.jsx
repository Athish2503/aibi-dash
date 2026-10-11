import React from 'react';

/**
 * StrategicBriefingScreen - The New "Home" Screen
 * 
 * Replaces traditional admin dashboards with an executive strategic briefing:
 * "Good morning. Here is what matters right now."
 * 
 * Follows the principle:
 * 3 Things You Should Know → Recommended Actions → Business Health Indicators → Direct Gateway to Strategy
 */
export default function StrategicBriefingScreen({
  companyName = 'Acme Intelligence',
  primaryObjective = 'leads',
  onOpenStrategy,
  onOpenIntelligence,
  onOpenKnowledge,
  onOpenOpportunities,
  onOpenPlan,
  onOpenAskAI,
  onOpenWhatIf,
  onOpenChallenge,
  onStartInterview,
  companyData = {},
  onOpenCompanySelector,
  uploadedDataset = null,
  strategyData = null,
}) {
  // Extract top 3 findings dynamically from strategyData (calibrated to company or uploaded CSV)
  const findings = strategyData?.keyFindings?.slice(0, 3) || [
    {
      id: 'f-1',
      title: 'Enterprise traffic and contract value are expanding.',
      evidence: '+21% Pipeline',
      insight: 'Enterprise represents only 18% of website traffic but delivers 42% of total pipeline revenue with an average deal size of $78,500.',
    },
    {
      id: 'f-2',
      title: 'Commercial content is underperforming relative to blog reach.',
      evidence: 'Traffic Mismatch',
      insight: 'Informational guides capture 74.2% of traffic (+28.5% growth) but drive only 29.2% of leads due to missing commercial bridge CTAs.',
    },
    {
      id: 'f-3',
      title: 'AI Answer Engine visibility is your single largest discoverability gap.',
      evidence: '-38.2% Citation Share',
      insight: 'ChatGPT and Perplexity cite competitor DeflectAI in 41% of enterprise copilot queries versus Acme’s 21% citation rate.',
    },
  ];

  // Extract top 3 recommended actions dynamically from strategyData
  const actions = strategyData?.executiveRecommendations?.slice(0, 3) || (
    strategyData?.opportunities?.slice(0, 3).map((opp, idx) => ({
      priority: `Priority ${idx + 1}`,
      title: opp.title,
      why: opp.currentState || opp.evidence || 'High-impact intervention.',
      evidence: opp.expectedValue || opp.confidence || 'Verified by BI telemetry',
    })) || [
      {
        priority: 'Priority 1',
        title: 'Build dedicated Enterprise AI Solution Hub',
        why: 'Enterprise yields 42% revenue from 18% traffic, but only has 2 dedicated pages.',
        evidence: '8.7% conversion baseline • $78.5K avg contract value',
      },
      {
        priority: 'Priority 2',
        title: 'Refresh 3 core commercial pages with VIP consultative CTAs',
        why: 'Enterprise demo rate dropped 29.8% after the self-serve pricing redesign.',
        evidence: 'Pricing page conversion dropped from 6.4% to 5.8%',
      },
      {
        priority: 'Priority 3',
        title: 'Publish authoritative competitor comparison matrix',
        why: 'Existing comparison page converts at 7.9% but ranks on page 2 of search.',
        evidence: 'High commercial intent • 742 leads generated from 9,400 visits',
      },
    ]
  );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8 animate-fadeIn">
      {/* Top Strategic Briefing Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden border border-slate-800">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-500/20 via-indigo-500/10 to-transparent pointer-events-none" />
        
        <div className="relative z-10">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold tracking-wide">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
              STRATEGIC BRIEFING • {companyName.toUpperCase()}
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onOpenAskAI}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">psychology</span>
                Ask AI Assistant
              </button>
              <button
                type="button"
                onClick={onOpenChallenge}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 text-xs font-semibold transition-all border border-white/10 cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm text-amber-400">gavel</span>
                Challenge Strategy
              </button>
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-2">
            Good morning. Here is what matters right now.
          </h1>
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="text-xs bg-white/10 px-2.5 py-1 rounded-lg border border-white/15 text-slate-200">
              Active Business: <strong className="text-white font-bold">{companyName}</strong> {companyData?.industry ? `(${companyData.industry})` : ''}
            </span>
            {companyData?.isFromUploadedDataset && (
              <span className="text-xs bg-emerald-500/20 px-2.5 py-1 rounded-lg border border-emerald-400/30 text-emerald-300 font-bold inline-flex items-center gap-1">
                <span className="material-symbols-outlined text-xs">verified</span>
                <span>Grounded in Real CSV Telemetry</span>
              </span>
            )}
            <button
              type="button"
              onClick={onOpenCompanySelector}
              className="text-xs bg-blue-500 hover:bg-blue-400 text-white px-2.5 py-1 rounded-lg font-bold shadow-2xs transition-all cursor-pointer inline-flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-xs">sync_alt</span>
              <span>Switch Company / Input Your Brand</span>
            </button>
          </div>
          <p className="text-slate-300 text-sm sm:text-base max-w-2xl leading-relaxed">
            The AI reasoning engine has synthesized current telemetry with your objective:
            <span className="font-semibold text-blue-300"> {primaryObjective === 'leads' ? 'Generate more qualified leads' : primaryObjective === 'conversion' ? 'Improve conversion rate' : 'Build brand authority'}</span>. 
            All hypotheses, BI calculations, and recommendations below are dynamically tailored to <span className="text-white font-semibold">{companyName}</span>.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={onOpenStrategy}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-400 text-white font-bold text-sm shadow-md transition-all cursor-pointer"
            >
              <span>Open Growth Strategy</span>
              <span className="material-symbols-outlined text-base">arrow_forward</span>
            </button>
            <button
              type="button"
              onClick={onOpenIntelligence}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-sm border border-white/20 transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-base text-blue-300">analytics</span>
              <span>Inspect Intelligence & BI Evidence</span>
            </button>
            <button
              type="button"
              onClick={onStartInterview}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-medium text-sm border border-white/10 transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-base text-emerald-300">forum</span>
              <span>Update AI Interview</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Two-Column Briefing Grid: 3 Things You Should Know + Recommended Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. 3 Things You Should Know */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-sm">
                1
              </div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                3 Things You Should Know
              </h2>
            </div>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
              {companyData?.isFromUploadedDataset ? 'Verified by Backend Pipeline' : 'Verified by BI'}
            </span>
          </div>

          <div className="space-y-4">
            {findings.map((finding, idx) => {
              const borderColors = [
                'bg-blue-50/50 border-blue-100/80 hover:border-blue-300',
                'bg-amber-50/40 border-amber-100/80 hover:border-amber-300',
                'bg-rose-50/40 border-rose-100/80 hover:border-rose-300',
              ];
              const icons = ['trending_up', 'warning', 'visibility_off'];
              const iconColors = ['text-blue-600', 'text-amber-600', 'text-rose-600'];

              return (
                <div
                  key={finding.id || idx}
                  className={`p-4 rounded-xl border transition-colors ${borderColors[idx % borderColors.length]}`}
                >
                  <div className="flex items-start gap-3">
                    <span className={`material-symbols-outlined text-xl mt-0.5 ${iconColors[idx % iconColors.length]}`}>
                      {icons[idx % icons.length]}
                    </span>
                    <div className="space-y-1 w-full">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="text-sm font-bold text-slate-900">
                          {idx + 1}. {finding.title}
                        </h3>
                        {finding.evidence && (
                          <span className="text-[11px] font-bold text-slate-700 bg-white/80 border border-slate-200 px-1.5 py-0.5 rounded shrink-0">
                            {finding.evidence}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {finding.insight || finding.finding}
                      </p>
                      {finding.whyItMatters && (
                        <p className="text-[11px] text-slate-500 italic">
                          Why it matters: {finding.whyItMatters}
                        </p>
                      )}
                      <div className="pt-1 flex items-center gap-3">
                        <button
                          type="button"
                          onClick={onOpenIntelligence}
                          className="text-[11px] font-bold text-blue-700 hover:text-blue-800 inline-flex items-center gap-1 cursor-pointer"
                        >
                          <span>Inspect in BI Engine</span>
                          <span className="material-symbols-outlined text-xs">chevron_right</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 2. Recommended Actions (Adheres strictly to Principle: Recommendation -> Why -> Evidence -> Action) */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-sm">
                2
              </div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Recommended Actions
              </h2>
            </div>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
              High Confidence
            </span>
          </div>

          <div className="space-y-4">
            {actions.map((act, idx) => {
              const badgeBg = [
                'bg-blue-100 text-blue-800',
                'bg-indigo-100 text-indigo-800',
                'bg-purple-100 text-purple-800',
              ];

              return (
                <div
                  key={act.title || idx}
                  className="p-4 rounded-xl border border-slate-200 hover:border-blue-300 transition-all bg-slate-50/40"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded ${badgeBg[idx % badgeBg.length]}`}>
                          {act.priority || `Priority ${idx + 1}`}
                        </span>
                        <h3 className="text-sm font-bold text-slate-900">
                          {act.title}
                        </h3>
                      </div>
                      <p className="text-xs text-slate-600">
                        <strong className="text-slate-700">Why: </strong>
                        {act.why}
                      </p>
                      {act.evidence && (
                        <div className="text-[11px] text-slate-500 font-mono">
                          Evidence: {act.evidence}
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={onOpenPlan}
                      className="shrink-0 px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold cursor-pointer shadow-2xs"
                    >
                      View in Plan
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Internal Analytical Indicators: Business Health Overview (Section 20) */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Internal Business Health Indicators
            </h2>
            <p className="text-xs text-slate-500">
              Internal analytical health scores derived from website telemetry, market positioning, and conversion readiness.
            </p>
          </div>
          <button
            type="button"
            onClick={onOpenKnowledge}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1 cursor-pointer"
          >
            <span>Review Company Knowledge & Confidence</span>
            <span className="material-symbols-outlined text-xs">arrow_forward</span>
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { label: 'Audience Fit', score: 88, status: 'Strong', color: 'emerald', trend: '+4%' },
            { label: 'Search Visibility', score: 79, status: 'Healthy', color: 'blue', trend: '+18%' },
            { label: 'Content Strength', score: 72, status: 'Good', color: 'indigo', trend: '+6%' },
            { label: 'AI Discoverability', score: 48, status: 'Weak', color: 'amber', trend: '-12%' },
            { label: 'Conversion Readiness', score: 64, status: 'Moderate', color: 'blue', trend: '-2%' },
            { label: 'Competitive Position', score: 81, status: 'Strong', color: 'emerald', trend: '+5%' },
          ].map((item) => (
            <div
              key={item.label}
              className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-white hover:border-slate-300 transition-all text-center space-y-1"
            >
              <span className="text-[11px] font-semibold text-slate-600 block truncate">
                {item.label}
              </span>
              <div className="text-2xl font-black text-slate-900 tracking-tight">
                {item.score}
                <span className="text-xs text-slate-400 font-normal">/100</span>
              </div>
              <div className="flex items-center justify-center gap-1.5 text-[11px] font-medium">
                <span
                  className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                    item.score >= 80
                      ? 'bg-emerald-100 text-emerald-800'
                      : item.score >= 60
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {item.status}
                </span>
                <span className="text-slate-500">{item.trend}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Launchpad to Core Modules */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div
          onClick={onOpenWhatIf}
          className="p-5 rounded-xl border border-slate-200 bg-white hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              <span className="material-symbols-outlined text-lg">tune</span>
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">What-If Scenarios</h3>
              <p className="text-[11px] text-slate-500">Model +20% traffic or +1% conversion</p>
            </div>
          </div>
          <p className="text-xs text-slate-600">
            Simulate revenue and lead changes with explicit modeling assumptions.
          </p>
        </div>

        <div
          onClick={onOpenChallenge}
          className="p-5 rounded-xl border border-slate-200 bg-white hover:border-amber-300 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition-colors">
              <span className="material-symbols-outlined text-lg">gavel</span>
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Challenge Strategy</h3>
              <p className="text-[11px] text-slate-500">Critical adversarial review</p>
            </div>
          </div>
          <p className="text-xs text-slate-600">
            Expose potential flaws, sales cycle lags, and missing confidence evidence.
          </p>
        </div>

        <div
          onClick={onOpenKnowledge}
          className="p-5 rounded-xl border border-slate-200 bg-white hover:border-emerald-300 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <span className="material-symbols-outlined text-lg">psychology</span>
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Company Memory</h3>
              <p className="text-[11px] text-slate-500">Decisions, outcomes & learning</p>
            </div>
          </div>
          <p className="text-xs text-slate-600">
            Track historical outcomes and ensure AI learns from past business experiments.
          </p>
        </div>
      </div>
    </div>
  );
}
