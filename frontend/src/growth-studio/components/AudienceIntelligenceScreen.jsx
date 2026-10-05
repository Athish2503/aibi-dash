import React, { useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
  PieChart,
  Pie,
} from 'recharts';

/**
 * AudienceIntelligenceScreen - Screen 8 in AI Growth Strategy Studio
 * Dedicated page answering: "Who should the company focus on?"
 * Features: Most Valuable Audience spotlight, Segment comparison table, Recharts bar charts, device breakdown, and interactive slicers.
 */
export default function AudienceIntelligenceScreen({
  strategyData,
  onNavigateStage,
  onAddFindingToPlan,
}) {
  const [selectedSegmentFilter, setSelectedSegmentFilter] = useState('all');
  const [activeMetric, setActiveMetric] = useState('conversion'); // 'conversion' or 'revenue'

  const { audienceSegments = [], company = {} } = strategyData;

  const filteredSegments =
    selectedSegmentFilter === 'all'
      ? audienceSegments
      : audienceSegments.filter((seg) => seg.id === selectedSegmentFilter);

  // Highest-value audience is Enterprise
  const topAudience = audienceSegments.find((s) => s.priorityRank === 1) || audienceSegments[0];

  const chartData = audienceSegments.map((s) => ({
    name: s.name.split(' (')[0],
    fullName: s.name,
    conversionRate: s.conversionRate,
    avgDeal: parseInt(s.avgDealValue.replace(/[^0-9]/g, ''), 10),
    trafficShare: s.trafficShare,
    leads: s.leads,
  }));

  const deviceShareData = [
    { name: 'Desktop (Enterprise & Mid-Market)', value: 84, fill: '#004ac6' },
    { name: 'Mobile / Tablet (SMB & Research)', value: 16, fill: '#60a5fa' },
  ];

  const COLORS = ['#004ac6', '#2563eb', '#60a5fa', '#93c5fd'];

  return (
    <div className="max-w-6xl mx-auto py-6 px-4 md:px-6 animate-fade-in space-y-8">
      {/* Top Header & Strategic Mission Question */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
              Audience Economics & Segment Value
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-xs text-slate-500">{company.name}</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
            Audience Intelligence
          </h1>
          <p className="text-sm text-slate-600 mt-0.5">
            Core question answered: <strong className="text-slate-900">"Who should the company focus on?"</strong>
          </p>
        </div>

        {/* Interactive Segment Slicer */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-white border border-slate-200/80 rounded-xl shadow-2xs">
          <button
            type="button"
            onClick={() => setSelectedSegmentFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              selectedSegmentFilter === 'all'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Segments
          </button>
          {audienceSegments.map((seg) => (
            <button
              key={seg.id}
              type="button"
              onClick={() => setSelectedSegmentFilter(seg.id)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                selectedSegmentFilter === seg.id
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {seg.name.split(' (')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* 1. Most Valuable Audience Spotlight Card */}
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 rounded-3xl p-6 md:p-8 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-700/60 border border-blue-400/30 text-blue-200 text-xs font-bold uppercase tracking-wider mb-3">
            <span className="material-symbols-outlined text-sm">stars</span>
            Primary Strategic Answer
          </div>

          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Most Valuable Audience: <span className="text-blue-200 underline decoration-blue-400 underline-offset-4">{topAudience.name}</span>
          </h2>

          <p className="mt-3 text-sm md:text-base text-blue-100/90 leading-relaxed">
            Enterprise buyers deliver the highest economic leverage by an overwhelming margin: converting at <strong className="text-white">{topAudience.conversionRate}%</strong> with an average contract value of <strong className="text-white">{topAudience.avgDealValue}</strong>. Although they comprise only 18.2% of web visits, they generate over 75% of your net annualized customer value.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-4 text-xs font-semibold">
            <div className="px-3.5 py-2 rounded-xl bg-white/10 backdrop-blur-xs border border-white/15">
              <span className="text-blue-200 text-[10px] block uppercase">Avg ACV</span>
              <span className="text-base font-bold text-white">{topAudience.avgDealValue}</span>
            </div>
            <div className="px-3.5 py-2 rounded-xl bg-white/10 backdrop-blur-xs border border-white/15">
              <span className="text-blue-200 text-[10px] block uppercase">Conversion Rate</span>
              <span className="text-base font-bold text-white">{topAudience.conversionRate}%</span>
            </div>
            <div className="px-3.5 py-2 rounded-xl bg-white/10 backdrop-blur-xs border border-white/15">
              <span className="text-blue-200 text-[10px] block uppercase">Customer Acquisition Cost</span>
              <span className="text-base font-bold text-white">{topAudience.cac}</span>
            </div>
            <div className="flex items-center gap-2 ml-auto">
              <button
                type="button"
                onClick={() => {
                  onAddFindingToPlan?.({
                    id: 'audience-enterprise-hub',
                    task: 'Build dedicated Enterprise Procurement & Trust Hub',
                    category: 'Audience & Conversion',
                    priority: 'P1 — Critical',
                    expectedImpact: 'Shorten enterprise deal cycle by 14 days and lift conversion by +35%',
                    effort: '2 Weeks',
                    status: 'todo',
                    month: 1,
                    monthTitle: 'Month 1 — Foundation',
                    strategicRationale: 'Direct recommendation from Audience Intelligence: Enterprise is #1 most valuable segment.',
                  });
                }}
                className="px-3.5 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-600 text-white font-bold transition-all cursor-pointer flex items-center gap-1.5 border border-blue-500/40"
              >
                <span className="material-symbols-outlined text-sm">add_task</span>
                <span>Add Enterprise Focus to Plan</span>
              </button>
              <button
                type="button"
                onClick={() => onNavigateStage('opportunity-center')}
                className="px-4 py-2.5 rounded-xl bg-white text-blue-900 font-bold hover:bg-blue-50 transition-all cursor-pointer"
              >
                View Opportunities →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Visualizations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Bar Chart: Segment Economics (Conversion vs ACV) */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200/90 p-5 md:p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Segment Conversion Rate & Economic Value
              </h2>
              <p className="text-xs text-slate-500">
                Compare conversion rates (%) across target customer tiers.
              </p>
            </div>

            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs font-semibold">
              <button
                type="button"
                onClick={() => setActiveMetric('conversion')}
                className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                  activeMetric === 'conversion' ? 'bg-white shadow-2xs text-blue-700 font-bold' : 'text-slate-600'
                }`}
              >
                Conversion %
              </button>
              <button
                type="button"
                onClick={() => setActiveMetric('revenue')}
                className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                  activeMetric === 'revenue' ? 'bg-white shadow-2xs text-blue-700 font-bold' : 'text-slate-600'
                }`}
              >
                Avg Deal ($)
              </button>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  axisLine={false}
                  tickLine={false}
                  unit={activeMetric === 'conversion' ? '%' : ''}
                />
                <Tooltip
                  formatter={(val) => [
                    activeMetric === 'conversion' ? `${val}%` : `$${val.toLocaleString()}`,
                    activeMetric === 'conversion' ? 'Conversion Rate' : 'Avg Contract Value',
                  ]}
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderRadius: '12px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                    border: '1px solid #e2e8f0',
                    fontSize: '12px',
                  }}
                />
                <Bar
                  dataKey={activeMetric === 'conversion' ? 'conversionRate' : 'avgDeal'}
                  radius={[6, 6, 0, 0]}
                  fill="#004ac6"
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${entry.name}`}
                      fill={index === 0 ? '#004ac6' : index === 1 ? '#2563eb' : '#94a3b8'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-3 p-2.5 rounded-xl bg-slate-50 border border-slate-200/60 text-xs text-slate-600 flex items-center gap-2">
            <span className="material-symbols-outlined text-sm text-blue-600 shrink-0">insights</span>
            <span>
              <strong>Insight:</strong> Enterprise conversion rate (4.82%) is 3.4x higher than SMB (1.42%), proving that marketing allocation must prioritize enterprise procurement readiness.
            </span>
          </div>
        </div>

        {/* Secondary Donut: Device & Source Context */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-5 md:p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Session Device Distribution
            </h2>
            <p className="text-xs text-slate-500">
              Enterprise evaluation occurs predominantly on desktop.
            </p>

            <div className="h-44 w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={deviceShareData}
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {deviceShareData.map((entry, index) => (
                      <Cell key={`cell-${entry.name}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val) => [`${val}%`, 'Traffic Share']}
                    contentStyle={{ borderRadius: '8px', fontSize: '11px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between text-slate-700">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-700"></span>
                  Desktop Sessions
                </span>
                <span className="font-bold">84%</span>
              </div>
              <div className="flex items-center justify-between text-slate-700">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-400"></span>
                  Mobile / Tablet
                </span>
                <span className="font-bold">16%</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500">
            <strong>Strategic takeaway:</strong> High-ticket enterprise leads conduct technical due diligence almost exclusively on desktop workstations.
          </div>
        </div>
      </div>

      {/* 3. Comprehensive Comparison Table */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 md:p-8 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Segment Economics & Strategic Directives
            </h2>
            <p className="text-xs text-slate-500">
              Evaluating traffic volume, conversion efficiency, deal sizes, and strategic verdict.
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-500">
            Showing {filteredSegments.length} of {audienceSegments.length} Segments
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-3">Segment Name</th>
                <th className="py-3 px-3">Traffic Share</th>
                <th className="py-3 px-3">Conversion %</th>
                <th className="py-3 px-3">Leads Captured</th>
                <th className="py-3 px-3">Avg ACV</th>
                <th className="py-3 px-3">Primary Channel</th>
                <th className="py-3 px-3">Strategic Verdict</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSegments.map((seg) => (
                <tr
                  key={seg.id}
                  className={`hover:bg-slate-50/70 transition-colors ${
                    seg.priorityRank === 1 ? 'bg-blue-50/30 font-medium' : ''
                  }`}
                >
                  <td className="py-3.5 px-3">
                    <div className="font-bold text-slate-900">{seg.name}</div>
                    <span className="text-[10px] text-slate-400">Rank #{seg.priorityRank} Priority</span>
                  </td>
                  <td className="py-3.5 px-3 text-slate-700 font-semibold">
                    {seg.trafficShare}% <span className="text-slate-400 font-normal">({seg.trafficSessions.toLocaleString()})</span>
                  </td>
                  <td className="py-3.5 px-3">
                    <span className={`px-2 py-0.5 rounded font-bold ${seg.conversionRate >= 4.0 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-700'}`}>
                      {seg.conversionRate}%
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-slate-700 font-bold">{seg.leads}</td>
                  <td className="py-3.5 px-3 text-slate-900 font-bold">{seg.avgDealValue}</td>
                  <td className="py-3.5 px-3 text-slate-600">{seg.primaryChannel}</td>
                  <td className="py-3.5 px-3">
                    <span className="text-[11px] text-slate-800 font-medium block max-w-xs leading-relaxed">
                      {seg.strategicVerdict}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
