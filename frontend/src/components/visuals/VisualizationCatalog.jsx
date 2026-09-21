import React, { useState } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  AreaChart,
  Area,
} from 'recharts';

/**
 * 1. Target Progress Gauge
 * Shows progress toward a target metric in a circular arc.
 */
export function GaugeVisual({
  title = 'ROI Target Progress',
  currentValue = 4.82,
  targetValue = 5.0,
  unit = 'x',
  min = 0,
  max = 6,
}) {
  const percentage = Math.min(100, Math.max(0, Math.round(((currentValue - min) / (max - min)) * 100)));
  const circumference = 2 * Math.PI * 40;
  const strokeDashoffset = circumference - (percentage / 100) * (circumference * 0.75);

  return (
    <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/25 flex flex-col items-center justify-between h-full">
      <div className="w-full flex items-center justify-between">
        <span className="text-xs font-bold text-on-surface">{title}</span>
        <span className="text-[10px] text-secondary font-mono">Target: {targetValue}{unit}</span>
      </div>

      <div className="relative flex items-center justify-center my-3">
        <svg className="w-32 h-32 transform -rotate-135">
          {/* Background Track */}
          <circle
            cx="64"
            cy="64"
            r="40"
            stroke="currentColor"
            strokeWidth="10"
            fill="transparent"
            strokeDasharray={`${circumference * 0.75} ${circumference * 0.25}`}
            className="text-outline-variant/30"
          />
          {/* Progress Indicator */}
          <circle
            cx="64"
            cy="64"
            r="40"
            stroke="currentColor"
            strokeWidth="10"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="text-primary transition-all duration-700"
          />
        </svg>

        <div className="absolute flex flex-col items-center">
          <span className="text-2xl font-bold text-on-surface tracking-tight">
            {currentValue}{unit}
          </span>
          <span className="text-[10px] text-emerald-600 font-semibold">
            {percentage}% to Goal
          </span>
        </div>
      </div>

      <div className="w-full flex items-center justify-between text-[10px] text-secondary border-t border-outline-variant/20 pt-2">
        <span>Min: {min}{unit}</span>
        <span className="font-semibold text-primary">{currentValue >= targetValue ? 'Goal Achieved' : 'On Track'}</span>
        <span>Max: {max}{unit}</span>
      </div>
    </div>
  );
}

/**
 * 2. Conversion Funnel Visual
 * Visualizes sequential campaign workflow stages with drop-off rates.
 */
export function FunnelVisual({
  title = 'Campaign Conversion Funnel',
  stages = [
    { name: 'Impressions', value: 1250000, rate: '100%' },
    { name: 'Ad Clicks', value: 98000, rate: '7.8%' },
    { name: 'Engaged Leads', value: 14200, rate: '14.5%' },
    { name: 'Conversions', value: 2150, rate: '15.1%' },
  ],
}) {
  const maxVal = stages[0]?.value || 1;

  return (
    <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/25 flex flex-col h-full">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-bold text-on-surface">{title}</span>
        <span className="text-[10px] text-secondary font-mono">Stage Efficiency</span>
      </div>

      <div className="flex flex-col gap-2.5 flex-1 justify-center">
        {stages.map((stage, idx) => {
          const widthPct = Math.max(20, Math.round((stage.value / maxVal) * 100));
          return (
            <div key={idx} className="flex flex-col gap-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-medium text-on-surface flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary/70"></span>
                  {stage.name}
                </span>
                <span className="text-secondary font-mono">
                  {stage.value.toLocaleString()} ({stage.rate})
                </span>
              </div>

              <div className="w-full h-4 bg-surface-container rounded-md overflow-hidden flex items-center">
                <div
                  className="h-full bg-gradient-to-r from-primary to-primary-fixed rounded-md transition-all duration-500"
                  style={{ width: `${widthPct}%` }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * 3. Proportional Treemap Visual
 * Shows market share and category spend allocation.
 */
const PALETTE = [
  'bg-blue-600',
  'bg-indigo-600',
  'bg-sky-600',
  'bg-emerald-600',
  'bg-amber-600',
  'bg-purple-600',
];

export function TreemapVisual({
  title = 'Category & Channel Spend Treemap',
  data = [
    { name: 'Google Search B2B', spend: 8100, roi: 4.71, share: 34, color: 'bg-blue-500/90' },
    { name: 'LinkedIn Enterprise', spend: 11200, roi: 5.25, share: 46, color: 'bg-indigo-600/90' },
    { name: 'Meta Social', spend: 3100, roi: 3.95, share: 13, color: 'bg-sky-500/90' },
    { name: 'TikTok Display', spend: 2800, roi: 2.15, share: 7, color: 'bg-emerald-500/90' },
  ],
}) {
  const safeData = Array.isArray(data) && data.length > 0 ? data : [];

  return (
    <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/25 flex flex-col h-full">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-bold text-on-surface">{title}</span>
        <span className="text-[10px] text-secondary">Proportional Allocation</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 flex-1 min-h-[140px]">
        {safeData.map((item, idx) => {
          const spend = item?.spend ?? item?.value ?? 0;
          const share = item?.share ?? '0';
          const roi = item?.roi ?? 0;
          const colorClass = item?.color || PALETTE[idx % PALETTE.length];

          return (
            <div
              key={idx}
              className={`p-3 rounded-xl text-white flex flex-col justify-between shadow-xs transition-transform hover:scale-[1.02] ${colorClass}`}
            >
              <div className="flex flex-col">
                <span className="text-[11px] font-bold truncate">{item?.name || 'Category'}</span>
                <span className="text-[10px] opacity-80">{share}% Spend Share</span>
              </div>
              <div className="flex items-end justify-between mt-2 pt-1 border-t border-white/20">
                <span className="text-xs font-mono font-bold">${Number(spend).toLocaleString()}</span>
                <span className="text-[10px] font-semibold bg-black/25 px-1.5 py-0.5 rounded">
                  {roi}x
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * 4. Combo Chart (Dual-Axis)
 * Combines Column/Bar (Spend on left Y-axis) with Line (ROI on right Y-axis).
 */
export function ComboChartVisual({
  title = 'Spend vs ROI Performance (Dual Axis)',
  data = [
    { channel: 'Google Ads', spend: 8100, roi: 4.71 },
    { channel: 'LinkedIn Ads', spend: 11200, roi: 5.25 },
    { channel: 'Meta Ads', spend: 3100, roi: 3.95 },
    { channel: 'TikTok Ads', spend: 2800, roi: 2.15 },
  ],
}) {
  return (
    <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/25 flex flex-col h-full">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-bold text-on-surface">{title}</span>
        <div className="flex items-center gap-3 text-[10px]">
          <span className="flex items-center gap-1 text-primary">
            <span className="w-2 h-2 rounded bg-primary"></span>
            Spend ($)
          </span>
          <span className="flex items-center gap-1 text-amber-600">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            ROI (x)
          </span>
        </div>
      </div>

      <div className="h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis dataKey="channel" tick={{ fontSize: 11 }} />
            <YAxis yAxisId="left" tick={{ fontSize: 10 }} tickFormatter={(v) => `$${v}`} />
            <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10 }} tickFormatter={(v) => `${v}x`} />
            <Tooltip
              formatter={(value, name) => [
                name === 'Spend' ? `$${Number(value).toLocaleString()}` : `${value}x`,
                name,
              ]}
              contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', fontSize: '11px', border: '1px solid #cbd5e1' }}
            />
            <Bar yAxisId="left" dataKey="spend" name="Spend" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={40} />
            <Line yAxisId="right" type="monotone" dataKey="roi" name="ROI" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4 }} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

/**
 * 5. Hierarchical Matrix Drill-Down Table
 * Supports pivoting rows and expandable hierarchies (Channel -> Audience -> Campaign).
 */
export function MatrixDrillDownVisual({
  title = 'Multi-Dimensional Matrix Drill-Down',
  matrixData = [
    {
      channel: 'Google Ads',
      spend: 8100,
      roi: 4.71,
      conv: 8.2,
      children: [
        { audience: 'Enterprise B2B', id: 'CMP-101', cost: 4200, roi: 4.82, conv: 8.4 },
        { audience: 'Retail Buyers', id: 'CMP-105', cost: 3900, roi: 4.60, conv: 8.1 },
      ],
    },
    {
      channel: 'LinkedIn Ads',
      spend: 11200,
      roi: 5.25,
      conv: 9.4,
      children: [
        { audience: 'Tech Leaders', id: 'CMP-103', cost: 6400, roi: 5.10, conv: 9.1 },
        { audience: 'Security Admins', id: 'CMP-108', cost: 4800, roi: 5.40, conv: 9.8 },
      ],
    },
    {
      channel: 'Meta Ads',
      spend: 3100,
      roi: 3.95,
      conv: 7.2,
      children: [
        { audience: 'Millennials', id: 'CMP-102', cost: 3100, roi: 3.95, conv: 7.2 },
      ],
    },
    {
      channel: 'TikTok Ads',
      spend: 2800,
      roi: 2.15,
      conv: 4.8,
      children: [
        { audience: 'Young Adults', id: 'CMP-104', cost: 2800, roi: 2.15, conv: 4.8 },
      ],
    },
  ],
}) {
  const [expanded, setExpanded] = useState({ 'Google Ads': true, 'LinkedIn Ads': true });

  const toggleRow = (ch) => {
    setExpanded((prev) => ({ ...prev, [ch]: !prev[ch] }));
  };

  return (
    <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/25 flex flex-col h-full">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-bold text-on-surface">{title}</span>
        <span className="text-[10px] text-secondary font-mono">Drill-Down: Channel &gt; Audience</span>
      </div>

      <div className="overflow-x-auto rounded-lg border border-outline-variant/20 flex-1">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-surface-container text-secondary text-[10px] uppercase tracking-wider border-b border-outline-variant/30">
              <th className="py-2 px-3 font-semibold">Hierarchy (Channel / Segment)</th>
              <th className="py-2 px-3 font-semibold text-right">Total Spend</th>
              <th className="py-2 px-3 font-semibold text-right">Average ROI</th>
              <th className="py-2 px-3 font-semibold text-right">Conv. Rate</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/20 bg-surface-container-lowest font-mono text-[11px]">
            {matrixData.map((row) => (
              <React.Fragment key={row.channel}>
                {/* Level 1: Channel */}
                <tr className="bg-surface-container-low/60 font-bold hover:bg-surface-container-low transition-colors">
                  <td className="py-2 px-3 text-on-surface">
                    <button
                      type="button"
                      onClick={() => toggleRow(row.channel)}
                      className="flex items-center gap-1.5 text-primary hover:underline font-sans"
                    >
                      <span className="material-symbols-outlined text-sm">
                        {expanded[row.channel] ? 'expand_more' : 'chevron_right'}
                      </span>
                      <span>{row.channel}</span>
                    </button>
                  </td>
                  <td className="py-2 px-3 text-right">${row.spend.toLocaleString()}</td>
                  <td className="py-2 px-3 text-right text-primary">{row.roi}x</td>
                  <td className="py-2 px-3 text-right text-emerald-600">{row.conv}%</td>
                </tr>

                {/* Level 2: Children (Audience & Campaign) */}
                {expanded[row.channel] &&
                  row.children.map((child, cIdx) => (
                    <tr key={cIdx} className="hover:bg-surface-container-low/30 transition-colors">
                      <td className="py-1.5 pl-8 pr-3 text-secondary font-sans flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-outline-variant"></span>
                        <span>{child.audience}</span>
                        <span className="text-[10px] text-secondary/70 font-mono">({child.id})</span>
                      </td>
                      <td className="py-1.5 px-3 text-right text-secondary">${child.cost.toLocaleString()}</td>
                      <td className="py-1.5 px-3 text-right text-on-surface">{child.roi}x</td>
                      <td className="py-1.5 px-3 text-right text-on-surface">{child.conv}%</td>
                    </tr>
                  ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/**
 * 6. AI Key Influencers Visual
 * Analyzes dimensions that most impact ROI.
 */
export function KeyInfluencersVisual({
  title = 'AI Key Influencers (ROI Drivers)',
  metric = 'High ROI (>= 4.5x)',
}) {
  const influencers = [
    { factor: 'Channel is LinkedIn Ads', impact: '+1.15x', confidence: '98%', badge: 'Primary Driver' },
    { factor: 'Audience is Enterprise B2B', impact: '+0.85x', confidence: '94%', badge: 'High Impact' },
    { factor: 'Duration is 30-45 Days', impact: '+0.45x', confidence: '88%', badge: 'Optimal Duration' },
    { factor: 'Region is North America', impact: '+0.38x', confidence: '82%', badge: 'Market Factor' },
  ];

  return (
    <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/25 flex flex-col h-full">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-bold text-on-surface flex items-center gap-1.5">
          <span className="material-symbols-outlined text-primary text-sm">psychology</span>
          {title}
        </span>
        <span className="text-[10px] text-primary font-semibold bg-primary-fixed/40 px-2 py-0.5 rounded-full">
          {metric}
        </span>
      </div>

      <p className="text-[11px] text-secondary mb-3">
        Statistical analysis showing factors with highest correlation to positive campaign returns:
      </p>

      <div className="flex flex-col gap-2 flex-1">
        {influencers.map((item, idx) => (
          <div
            key={idx}
            className="p-2.5 rounded-lg bg-surface-container-lowest border border-outline-variant/20 flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-primary/10 text-primary font-bold text-[10px] flex items-center justify-center">
                {idx + 1}
              </span>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-on-surface">{item.factor}</span>
                <span className="text-[10px] text-secondary font-mono">Confidence: {item.confidence}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-bold text-xs">
                {item.impact} ROI
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * 7. Anomaly Detection Visual
 * Flags statistical outliers in campaign spend or conversion variance.
 */
export function AnomalyDetectionVisual({
  title = 'Anomaly Detection & Risk Flags',
  anomalies = [
    { id: 'CMP-104', channel: 'TikTok Ads', issue: 'Unusually Low ROI (2.15x)', delta: '-55% vs Mean', severity: 'High' },
    { id: 'CMP-103', channel: 'LinkedIn Ads', issue: 'High Acquisition Cost ($6,400)', delta: '+51% vs Avg CAC', severity: 'Medium' },
    { id: 'CMP-108', channel: 'LinkedIn Ads', issue: 'Outlier Conversion Rate (9.8%)', delta: '+17% vs Norm', severity: 'Positive' },
  ],
}) {
  return (
    <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/25 flex flex-col h-full">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-bold text-on-surface flex items-center gap-1.5">
          <span className="material-symbols-outlined text-amber-500 text-sm">warning</span>
          {title}
        </span>
        <span className="text-[10px] text-secondary font-mono">{anomalies.length} Flags Detected</span>
      </div>

      <div className="flex flex-col gap-2 flex-1 justify-center">
        {anomalies.map((item, idx) => (
          <div
            key={idx}
            className="p-3 rounded-lg bg-surface-container-lowest border border-outline-variant/20 flex items-center justify-between"
          >
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs text-on-surface font-mono">{item.id}</span>
                <span className="text-[10px] text-secondary">({item.channel})</span>
              </div>
              <span className="text-[11px] text-on-surface font-medium mt-0.5">{item.issue}</span>
            </div>

            <div className="flex flex-col items-end">
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  item.severity === 'High'
                    ? 'bg-red-50 text-red-700 border border-red-200'
                    : item.severity === 'Medium'
                    ? 'bg-amber-50 text-amber-700 border border-amber-200'
                    : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                }`}
              >
                {item.delta}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * 8. Area Chart for Duration Trends
 */
export function DurationTrendVisual({
  title = 'ROI & Conversion Efficiency by Duration',
  data = [
    { duration: '14 Days', roi: 3.95, conv: 7.2 },
    { duration: '15 Days', roi: 5.40, conv: 9.8 },
    { duration: '21 Days', roi: 2.15, conv: 4.8 },
    { duration: '28 Days', roi: 3.40, conv: 6.5 },
    { duration: '30 Days', roi: 4.71, conv: 8.2 },
    { duration: '45 Days', roi: 5.10, conv: 9.1 },
  ],
}) {
  return (
    <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/25 flex flex-col h-full">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-bold text-on-surface">{title}</span>
        <span className="text-[10px] text-secondary font-mono">Duration Curve</span>
      </div>

      <div className="h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="roiGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis dataKey="duration" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `${v}x`} />
            <Tooltip
              formatter={(value) => [`${value}x ROI`, 'ROI']}
              contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', fontSize: '11px', border: '1px solid #cbd5e1' }}
            />
            <Area type="monotone" dataKey="roi" stroke="#3b82f6" strokeWidth={2.5} fillOpacity={1} fill="url(#roiGradient)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
