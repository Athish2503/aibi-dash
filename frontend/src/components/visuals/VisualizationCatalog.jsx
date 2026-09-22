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
 * Shows progress toward a target metric in a modern semi-circular speedometer gauge.
 */
export function GaugeVisual({
  title = 'ROI Performance Gauge',
  currentValue = 5.04,
  targetValue = 5.0,
  unit = 'x',
  min = 0,
  max = 6,
}) {
  const percentage = Math.min(100, Math.max(0, Math.round(((currentValue - min) / (max - min)) * 100)));
  const isAchieved = currentValue >= targetValue;

  // Semi-circular arc parameters (radius 54, arc length = PI * 54 = 169.6)
  const radius = 54;
  const arcLength = Math.PI * radius;
  const strokeDashoffset = arcLength - (percentage / 100) * arcLength;

  return (
    <div className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/30 flex flex-col justify-between h-full shadow-xs">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-outline-variant/15">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-primary"></span>
          <span className="text-xs font-bold text-on-surface">{title}</span>
        </div>
        <span className="text-[11px] font-mono text-secondary px-2 py-0.5 rounded bg-surface-container-low border border-outline-variant/30">
          Target: {targetValue}{unit}
        </span>
      </div>

      {/* Semi-Circular SVG Speedometer */}
      <div className="relative flex flex-col items-center justify-center my-2">
        <svg viewBox="0 0 140 85" className="w-44 h-28 overflow-visible">
          <defs>
            <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#2563eb" />
              <stop offset="70%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>
          </defs>

          {/* Background Track */}
          <path
            d="M 16 75 A 54 54 0 0 1 124 75"
            fill="none"
            stroke="#e2e8f0"
            strokeWidth="10"
            strokeLinecap="round"
          />

          {/* Progress Arc */}
          <path
            d="M 16 75 A 54 54 0 0 1 124 75"
            fill="none"
            stroke="url(#gaugeGradient)"
            strokeWidth="10"
            strokeDasharray={arcLength}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-700 ease-out"
          />

          {/* Target Benchmark Tick Mark */}
          <circle cx="112" cy="38" r="3.5" fill="#0f172a" stroke="#ffffff" strokeWidth="1.5" />
        </svg>

        {/* Value Overlay */}
        <div className="absolute bottom-1 flex flex-col items-center">
          <div className="text-2xl font-extrabold text-on-surface tracking-tight tabular-nums">
            {currentValue}{unit}
          </div>
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
              isAchieved
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-primary-fixed/40 text-primary border border-primary/20'
            }`}
          >
            <span className="material-symbols-outlined text-[11px]">
              {isAchieved ? 'verified' : 'trending_up'}
            </span>
            <span>{percentage}% to Benchmark</span>
          </span>
        </div>
      </div>

      {/* Min/Max Footer */}
      <div className="flex items-center justify-between text-[10px] text-secondary border-t border-outline-variant/15 pt-2">
        <span className="font-mono">Min {min}{unit}</span>
        <span className="font-bold text-emerald-600">
          {isAchieved ? 'Goal Exceeded (+0.04x)' : 'On Track'}
        </span>
        <span className="font-mono">Max {max}{unit}</span>
      </div>
    </div>
  );
}

/**
 * 2. Conversion Funnel Visual
 * Visualizes sequential campaign workflow stages with drop-off rates and step efficiency.
 */
export function FunnelVisual({
  title = 'Conversion Pipeline Funnel',
  stages = [
    { name: 'Impressions', value: 1250000, rate: '100%', drop: null },
    { name: 'Ad Clicks', value: 98000, rate: '7.8% CTR', drop: '-92.2%' },
    { name: 'Engaged Leads', value: 14200, rate: '14.5% Lead Rate', drop: '-85.5%' },
    { name: 'Conversions', value: 2150, rate: '15.1% Close Rate', drop: '-84.9%' },
  ],
}) {
  const maxVal = stages[0]?.value || 1;

  return (
    <div className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/30 flex flex-col justify-between h-full shadow-xs">
      <div className="flex items-center justify-between pb-2 border-b border-outline-variant/15">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
          <span className="text-xs font-bold text-on-surface">{title}</span>
        </div>
        <span className="text-[11px] font-mono text-secondary px-2 py-0.5 rounded bg-surface-container-low border border-outline-variant/30">
          Stage Efficiency
        </span>
      </div>

      <div className="flex flex-col gap-2 my-auto py-1">
        {stages.map((stage, idx) => {
          const widthPct = Math.max(18, Math.round((stage.value / maxVal) * 100));
          return (
            <div key={idx} className="flex flex-col gap-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-semibold text-on-surface flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                  {stage.name}
                </span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-on-surface font-bold">
                    {stage.value.toLocaleString()}
                  </span>
                  <span className="text-[10px] font-semibold text-primary px-1.5 py-0.2 rounded bg-primary-fixed/30 border border-primary/20">
                    {stage.rate}
                  </span>
                </div>
              </div>

              <div className="w-full h-3.5 bg-surface-container-low rounded-md overflow-hidden flex items-center p-0.5 border border-outline-variant/20">
                <div
                  className="h-full rounded-sm bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500 transition-all duration-500 shadow-xs"
                  style={{ width: `${widthPct}%` }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between text-[10px] text-secondary border-t border-outline-variant/15 pt-2">
        <span>Total Visitors: <strong>1.25M</strong></span>
        <span className="font-bold text-primary">End-to-End: 0.17% Conversion</span>
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
/**
 * 8. Area Chart for Duration Trends
 */
export function DurationTrendVisual({
  title = 'Campaign Duration Efficiency',
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
    <div className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/30 flex flex-col justify-between h-full shadow-xs">
      <div className="flex items-center justify-between pb-2 border-b border-outline-variant/15">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-sky-500"></span>
          <span className="text-xs font-bold text-on-surface">{title}</span>
        </div>
        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
          Peak: 15–21 Days
        </span>
      </div>

      <div className="h-44 w-full my-1">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 12, right: 12, left: -22, bottom: 0 }}>
            <defs>
              <linearGradient id="roiGradientExecutive" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2563eb" stopOpacity={0.45} />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="duration" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: '#64748b' }} tickFormatter={(v) => `${v}x`} axisLine={false} tickLine={false} />
            <Tooltip
              formatter={(value) => [`${value}x ROI`, 'Average Return']}
              contentStyle={{
                backgroundColor: '#0f172a',
                borderRadius: '8px',
                fontSize: '11px',
                border: 'none',
                color: '#f8fafc',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              }}
            />
            <Area
              type="monotone"
              dataKey="roi"
              stroke="#2563eb"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#roiGradientExecutive)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-between text-[10px] text-secondary border-t border-outline-variant/15 pt-2">
        <span>Lifecycle Horizon: 14 to 45 Days</span>
        <span className="font-bold text-primary">Benchmark: 4.8x ROI Target</span>
      </div>
    </div>
  );
}
