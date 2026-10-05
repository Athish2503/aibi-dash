import React from 'react';

/**
 * WelcomeScreen - Screen 1 of 10 in AI Growth Strategy Studio
 * Introduces the product value, analytical dimensions, and 6-stage product loop.
 */
export default function WelcomeScreen({ onStartStrategy, onExploreDemo }) {
  const analyzedDimensions = [
    { title: 'Company', desc: 'Core offerings, value proposition & ICP definition', icon: 'business' },
    { title: 'Audience', desc: 'Segment economics, conversion behaviors & high-value cohorts', icon: 'groups' },
    { title: 'Market', desc: 'Demand distribution & category expansion opportunities', icon: 'public' },
    { title: 'Competitors', desc: 'Moat comparison, alternative queries & market positioning', icon: 'compare_arrows' },
    { title: 'Website', desc: 'Conversion path friction, user journeys & technical readiness', icon: 'web' },
    { title: 'Content', desc: 'Topical authority, commercial search gaps & asset effectiveness', icon: 'article' },
    { title: 'Search visibility', desc: 'Organic keyword dominance & emerging AI answer engine citations', icon: 'travel_explore' },
  ];

  const productLoop = [
    { step: 'Understand', desc: 'Context & ICP', icon: 'psychology' },
    { step: 'Analyze', desc: 'Multi-Signal Audit', icon: 'analytics' },
    { step: 'Generate', desc: 'Strategy Synthesis', icon: 'auto_awesome' },
    { step: 'Prioritize', desc: 'Impact vs Effort', icon: 'balance' },
    { step: 'Act', desc: '90-Day Roadmap', icon: 'rocket_launch' },
    { step: 'Measure', desc: 'Health & Scorecard', icon: 'monitoring' },
  ];

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 md:px-6 animate-fade-in">
      {/* Top Banner Tag */}
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200/80 text-blue-700 text-xs font-semibold uppercase tracking-wider mb-6">
        <span className="material-symbols-outlined text-sm">hub</span>
        AI Growth Strategy Studio • Phase 1
      </div>

      {/* Hero Section */}
      <div className="mb-12">
        <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-slate-900 leading-tight mb-4">
          Build a smarter growth strategy.
        </h1>
        <p className="text-lg md:text-xl text-slate-600 max-w-3xl leading-relaxed mb-8">
          Turn your company, audience and digital data into clear priorities, opportunities and actions.
        </p>

        {/* Primary and Secondary Action CTAs */}
        <div className="flex flex-wrap items-center gap-4">
          <button
            type="button"
            onClick={onStartStrategy}
            className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/25 transition-all text-sm md:text-base cursor-pointer"
          >
            <span>Start Strategy</span>
            <span className="material-symbols-outlined text-lg">arrow_forward</span>
          </button>

          <button
            type="button"
            onClick={onExploreDemo}
            className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-700 font-semibold border border-slate-300 shadow-sm transition-all text-sm md:text-base cursor-pointer"
          >
            <span className="material-symbols-outlined text-blue-600 text-lg">preview</span>
            <span>Explore Demo</span>
          </button>

          <span className="text-xs text-slate-500 ml-1">
            Pre-loaded with enterprise AI support benchmark data
          </span>
        </div>
      </div>

      {/* Central Product Loop Visual */}
      <div className="mb-12 bg-white rounded-2xl border border-slate-200/80 p-6 md:p-8 shadow-sm">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-sm uppercase tracking-wider font-semibold text-slate-500">
              The Product Operating Loop
            </h2>
            <p className="text-base font-medium text-slate-800">
              From raw telemetry to executive action and continuous validation
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 text-xs font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Deterministic Intelligence
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          {productLoop.map((item, idx) => (
            <div
              key={item.step}
              className="relative p-3.5 rounded-xl bg-slate-50 border border-slate-200/60 hover:border-blue-300 hover:bg-blue-50/40 transition-all flex flex-col items-center text-center group"
            >
              <div className="w-9 h-9 rounded-lg bg-white border border-slate-200/80 flex items-center justify-center text-blue-600 mb-2.5 shadow-2xs group-hover:scale-105 transition-transform">
                <span className="material-symbols-outlined text-lg">{item.icon}</span>
              </div>
              <span className="text-xs font-bold text-slate-800">{idx + 1}. {item.step}</span>
              <span className="text-[11px] text-slate-500 mt-0.5">{item.desc}</span>
            </div>
          ))}
        </div>
      </div>

      {/* What the system analyzes */}
      <div className="mb-6">
        <h2 className="text-lg font-bold text-slate-900 mb-1">
          What the system analyzes
        </h2>
        <p className="text-sm text-slate-500 mb-5">
          Comprehensive multi-vector intelligence synthesized into concrete business decisions:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {analyzedDimensions.map((dim) => (
            <div
              key={dim.title}
              className="p-4 rounded-xl bg-white border border-slate-200/80 hover:border-slate-300 shadow-2xs transition-all flex items-start gap-3.5"
            >
              <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                <span className="material-symbols-outlined text-lg">{dim.icon}</span>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-900">{dim.title}</h3>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{dim.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
