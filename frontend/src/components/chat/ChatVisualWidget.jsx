import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ComposedChart,
  AreaChart,
  Area,
  ScatterChart,
  Scatter,
} from 'recharts';

const CHART_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#6366f1', '#14b8a6'];

const TREEMAP_PALETTES = [
  'bg-blue-600',
  'bg-indigo-600',
  'bg-sky-600',
  'bg-emerald-600',
  'bg-amber-600',
  'bg-purple-600',
  'bg-teal-600',
  'bg-rose-600',
];

/**
 * Formats metric values based on type: multiplier (x), percent (%), currency ($), or standard number.
 */
function formatMetricValue(val, format) {
  if (val === null || val === undefined) return 'N/A';
  const num = Number(val);
  if (isNaN(num)) return String(val);

  switch (format) {
    case 'multiplier':
      return `${num.toFixed(2)}x`;
    case 'percent':
      return `${num.toFixed(2)}%`;
    case 'currency':
      return `$${num.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
    default:
      return num.toLocaleString();
  }
}

export default function ChatVisualWidget({ visualSpec, onPinVisual }) {
  const {
    type = 'bar',
    title,
    subtitle,
    x_key = 'name',
    available_metrics = [],
    default_metric,
    data = [],
    kpis = [],
    stages = [],
    currentValue,
    targetValue = 5.0,
    unit = 'x',
  } = visualSpec || {};

  const activeVisualType = type;
  const [activeMetricKey, setActiveMetricKey] = useState(
    default_metric || (available_metrics.length > 0 ? available_metrics[0].key : 'average_roi')
  );
  const [isPinned, setIsPinned] = useState(false);

  if (!visualSpec || (!visualSpec.data && !visualSpec.kpis && !visualSpec.stages && !visualSpec.currentValue)) {
    return null;
  }

  const currentMetric =
    available_metrics.find((m) => m.key === activeMetricKey) ||
    available_metrics[0] || {
      key: activeMetricKey,
      label: 'Value',
      color: '#3b82f6',
      format: 'multiplier',
    };

  const handlePin = () => {
    setIsPinned(true);
    if (onPinVisual) {
      onPinVisual({
        title: title || 'Chat Generated Visual',
        type: activeVisualType === 'donut' ? 'pie' : activeVisualType,
        metric: currentMetric.label,
        data,
      });
    }
    setTimeout(() => setIsPinned(false), 3000);
  };

  // Custom Chart Tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="p-3 bg-surface-container-highest/95 backdrop-blur-md border border-outline-variant/40 rounded-xl shadow-lg text-xs z-50">
          <div className="font-bold text-on-surface mb-1">{label || item[x_key] || item.name}</div>
          <div className="flex items-center gap-2">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: currentMetric.color || '#3b82f6' }}
            />
            <span className="text-secondary font-medium">{currentMetric.label}:</span>
            <span className="font-bold text-on-surface">
              {formatMetricValue(item[currentMetric.key], currentMetric.format)}
            </span>
          </div>
          {item.campaign_count !== undefined && (
            <div className="text-[10px] text-secondary mt-1">
              Sample: {Number(item.campaign_count).toLocaleString()} campaigns
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  // Dual-Axis Combo Tooltip
  const CustomComboTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      const spendVal = item.spend ?? item.average_acquisition_cost ?? item.Acquisition_Cost ?? 0;
      const roiVal = item.average_roi ?? item.ROI ?? 0;
      return (
        <div className="p-3 bg-surface-container-highest/95 backdrop-blur-md border border-outline-variant/40 rounded-xl shadow-lg text-xs z-50">
          <div className="font-bold text-on-surface mb-1">{label || item[x_key] || item.name}</div>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-xs bg-primary" />
              <span className="text-secondary font-medium">Spend:</span>
              <span className="font-bold text-on-surface">${Number(spendVal).toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span className="text-secondary font-medium">ROI:</span>
              <span className="font-bold text-amber-500">{Number(roiVal).toFixed(2)}x</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  // Scatter Tooltip
  const CustomScatterTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="p-3 bg-surface-container-highest/95 backdrop-blur-md border border-outline-variant/40 rounded-xl shadow-lg text-xs z-50">
          <div className="font-bold text-on-surface mb-1">{item.name || item[x_key] || 'Data Point'}</div>
          <div className="text-secondary text-[11px]">
            CAC: <span className="font-bold text-on-surface">${Number(item.average_acquisition_cost ?? item.Acquisition_Cost ?? 0).toLocaleString()}</span>
          </div>
          <div className="text-secondary text-[11px]">
            ROI: <span className="font-bold text-amber-500">{Number(item.average_roi ?? item.ROI ?? 0).toFixed(2)}x</span>
          </div>
        </div>
      );
    }
    return null;
  };

  const isExecutiveType = activeVisualType === 'kpi' || activeVisualType === 'gauge' || activeVisualType === 'funnel';

  return (
    <div className="w-full my-3 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-xs overflow-hidden transition-all">
      {/* Header bar */}
      <div className="px-4 py-3 bg-surface-container-low/50 border-b border-outline-variant/20 flex flex-wrap items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <h2 className="text-xs font-bold text-on-surface">{title || 'Instant In-Chat Analysis'}</h2>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-primary/10 text-primary uppercase">
              {activeVisualType}
            </span>
          </div>
          {subtitle && <p className="text-[11px] text-secondary mt-0.5">{subtitle}</p>}
        </div>

        {/* Action: Pin Button */}
        <div className="flex items-center gap-2 ml-auto">
          {/* Pin to Dashboard Button */}
          <button
            type="button"
            onClick={handlePin}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all flex items-center gap-1 ${
              isPinned
                ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                : 'bg-surface-container hover:bg-surface-container-high text-secondary hover:text-on-surface border-outline-variant/30'
            }`}
            title="Pin this visual directly to your Power BI dashboard plan"
          >
            <span className="material-symbols-outlined text-xs">
              {isPinned ? 'check' : 'push_pin'}
            </span>
            <span>{isPinned ? 'Pinned!' : 'Pin to Dashboard'}</span>
          </button>
        </div>
      </div>

      {/* Metric Selector Pills (for Bar, Line, Area, Donut) */}
      {available_metrics.length > 1 && (activeVisualType === 'bar' || activeVisualType === 'line' || activeVisualType === 'area') && (
        <div className="px-4 pt-2.5 pb-1 flex items-center gap-1.5 overflow-x-auto select-none no-scrollbar">
          <span className="text-[10px] font-semibold text-secondary uppercase tracking-wider mr-1">
            Metric:
          </span>
          {available_metrics.map((m) => (
            <button
              key={m.key}
              type="button"
              onClick={() => setActiveMetricKey(m.key)}
              className={`px-2.5 py-1 rounded-full text-[10px] font-semibold transition-all flex items-center gap-1.5 border ${
                activeMetricKey === m.key
                  ? 'bg-primary text-white border-primary shadow-xs font-bold'
                  : 'bg-surface-container-low text-secondary hover:text-on-surface border-outline-variant/30 hover:border-outline-variant'
              }`}
            >
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: activeMetricKey === m.key ? '#ffffff' : m.color || '#3b82f6' }}
              />
              <span>{m.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Main Visual Content */}
      <div className="p-4">
        {/* 1. KPI Cards Grid */}
        {activeVisualType === 'kpi' ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {kpis.map((kpi, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-surface-container-low/60 border border-outline-variant/25 flex flex-col gap-1 shadow-xs"
              >
                <div className="flex items-center justify-between text-secondary">
                  <span className="text-[10px] uppercase font-bold tracking-wider">{kpi.label}</span>
                  <span className="material-symbols-outlined text-sm text-primary">
                    {kpi.icon || 'trending_up'}
                  </span>
                </div>
                <div className="text-base font-extrabold text-on-surface tracking-tight mt-0.5">
                  {kpi.value}
                </div>
              </div>
            ))}
          </div>
        ) : activeVisualType === 'combo' ? (
          /* 2. Dual-Axis Combo Chart (Spend on Left Y-Axis, ROI on Right Y-Axis) */
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-[11px] px-1">
              <span className="text-secondary font-medium">Dual-Axis Comparison:</span>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1 text-primary font-semibold">
                  <span className="w-2.5 h-2.5 rounded-xs bg-primary" />
                  Spend ($)
                </span>
                <span className="flex items-center gap-1 text-amber-600 font-semibold">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  ROI (x)
                </span>
              </div>
            </div>
            <div className="w-full h-60">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={data} margin={{ top: 10, right: 15, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} opacity={0.6} />
                  <XAxis dataKey={x_key} tick={{ fontSize: 10 }} />
                  <YAxis
                    yAxisId="left"
                    tick={{ fontSize: 10 }}
                    tickFormatter={(v) => `$${Number(v).toLocaleString()}`}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    tick={{ fontSize: 10 }}
                    tickFormatter={(v) => `${v}x`}
                  />
                  <Tooltip content={<CustomComboTooltip />} />
                  <Bar
                    yAxisId="left"
                    dataKey={(d) => d.spend ?? d.average_acquisition_cost ?? d.Acquisition_Cost ?? 0}
                    name="Spend"
                    fill="#3b82f6"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={44}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey={(d) => d.average_roi ?? d.ROI ?? 0}
                    name="ROI"
                    stroke="#f59e0b"
                    strokeWidth={3}
                    dot={{ r: 4, fill: '#f59e0b' }}
                    activeDot={{ r: 6 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : activeVisualType === 'treemap' ? (
          /* 3. Proportional Treemap (Proportional Allocation Grid) */
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-[11px] text-secondary pb-1 border-b border-outline-variant/15">
              <span>Category Allocation</span>
              <span>Proportional Allocation & Returns</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 min-h-[160px]">
              {data.map((item, idx) => {
                const spend = item.spend ?? item.average_acquisition_cost ?? item.Acquisition_Cost ?? 0;
                const roi = item.average_roi ?? item.ROI ?? 0;
                const share = item.share ?? Math.round(100 / Math.max(1, data.length));
                const colorClass = item.color || TREEMAP_PALETTES[idx % TREEMAP_PALETTES.length];

                return (
                  <div
                    key={idx}
                    className={`p-3 rounded-xl text-white flex flex-col justify-between shadow-xs transition-transform hover:scale-[1.02] ${colorClass}`}
                  >
                    <div className="flex flex-col">
                      <span className="text-xs font-bold truncate">{item[x_key] || item.name || 'Category'}</span>
                      <span className="text-[10px] opacity-85 mt-0.5">{share}% Spend Share</span>
                    </div>
                    <div className="flex items-end justify-between mt-3 pt-1.5 border-t border-white/20">
                      <span className="text-xs font-mono font-bold">${Number(spend).toLocaleString()}</span>
                      <span className="text-[10px] font-bold bg-black/25 px-1.5 py-0.5 rounded">
                        {Number(roi).toFixed(2)}x
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : activeVisualType === 'area' ? (
          /* 4. Area Chart */
          <div className="w-full h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="chatAreaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={currentMetric.color || '#3b82f6'} stopOpacity={0.35} />
                    <stop offset="95%" stopColor={currentMetric.color || '#3b82f6'} stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.6} />
                <XAxis dataKey={x_key} tick={{ fontSize: 10 }} tickLine={false} />
                <YAxis
                  tick={{ fontSize: 10 }}
                  tickLine={false}
                  tickFormatter={(v) => formatMetricValue(v, currentMetric.format)}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey={currentMetric.key}
                  stroke={currentMetric.color || '#3b82f6'}
                  strokeWidth={2.5}
                  fill="url(#chatAreaGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : activeVisualType === 'scatter' ? (
          /* 5. Scatter Plot */
          <div className="w-full h-56">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.6} />
                <XAxis
                  type="number"
                  dataKey={(d) => d.average_acquisition_cost ?? d.Acquisition_Cost ?? 0}
                  name="CAC ($)"
                  tick={{ fontSize: 10 }}
                  tickFormatter={(v) => `$${v}`}
                />
                <YAxis
                  type="number"
                  dataKey={(d) => d.average_roi ?? d.ROI ?? 0}
                  name="ROI (x)"
                  tick={{ fontSize: 10 }}
                  tickFormatter={(v) => `${v}x`}
                />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} content={<CustomScatterTooltip />} />
                <Scatter name="Campaigns" data={data} fill="#3b82f6" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        ) : activeVisualType === 'donut' ? (
          /* 6. Donut / Pie Chart */
          <div className="w-full h-56 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey={(d) => d[currentMetric.key] ?? d.campaign_count ?? d.average_roi ?? 1}
                  nameKey={x_key}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={3}
                >
                  {data.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={CHART_COLORS[index % CHART_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : activeVisualType === 'line' ? (
          /* 7. Line Chart */
          <div className="w-full h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.6} />
                <XAxis dataKey={x_key} tick={{ fontSize: 10 }} tickLine={false} />
                <YAxis
                  tick={{ fontSize: 10 }}
                  tickLine={false}
                  tickFormatter={(v) => formatMetricValue(v, currentMetric.format)}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey={currentMetric.key}
                  stroke={currentMetric.color || '#3b82f6'}
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: currentMetric.color || '#3b82f6' }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : activeVisualType === 'gauge' ? (
          /* 8. Target Progress Speedometer Gauge */
          <div className="flex flex-col items-center justify-center p-3">
            <div className="relative flex flex-col items-center justify-center my-2">
              <svg viewBox="0 0 140 85" className="w-48 h-28 overflow-visible">
                <defs>
                  <linearGradient id="chatGaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#2563eb" />
                    <stop offset="70%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#10b981" />
                  </linearGradient>
                </defs>
                <path
                  d="M 16 75 A 54 54 0 0 1 124 75"
                  fill="none"
                  stroke="#e2e8f0"
                  strokeWidth="10"
                  strokeLinecap="round"
                />
                <path
                  d="M 16 75 A 54 54 0 0 1 124 75"
                  fill="none"
                  stroke="url(#chatGaugeGrad)"
                  strokeWidth="10"
                  strokeDasharray={169.6}
                  strokeDashoffset={169.6 - (Math.min(100, Math.max(0, ((currentValue || 4.8) / targetValue) * 100)) / 100) * 169.6}
                  strokeLinecap="round"
                  className="transition-all duration-700 ease-out"
                />
              </svg>
              <div className="absolute bottom-1 flex flex-col items-center">
                <div className="text-2xl font-extrabold text-on-surface tracking-tight tabular-nums">
                  {currentValue || 4.8}{unit}
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 mt-1">
                  Target: {targetValue}{unit}
                </span>
              </div>
            </div>
          </div>
        ) : activeVisualType === 'funnel' ? (
          /* 9. Conversion Pipeline Funnel */
          <div className="flex flex-col gap-2.5 py-1">
            {stages.map((stage, idx) => {
              const maxVal = stages[0]?.value || 1;
              const widthPct = Math.max(18, Math.round((stage.value / maxVal) * 100));
              return (
                <div key={idx} className="flex flex-col gap-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-on-surface flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                      {stage.name}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-on-surface font-bold">
                        {Number(stage.value).toLocaleString()}
                      </span>
                      <span className="text-[10px] font-semibold text-primary px-1.5 py-0.2 rounded bg-primary/10 border border-primary/20">
                        {stage.rate}
                      </span>
                    </div>
                  </div>
                  <div className="w-full h-3.5 bg-surface-container-low rounded-md overflow-hidden flex items-center p-0.5 border border-outline-variant/20">
                    <div
                      className="h-full rounded-xs bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500 transition-all duration-500 shadow-xs"
                      style={{ width: `${widthPct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        ) : activeVisualType === 'table' ? (
          /* 10. Table View */
          <div className="overflow-x-auto max-h-60 rounded-xl border border-outline-variant/20">
            <table className="w-full text-[11px] text-left">
              <thead className="bg-surface-container-low text-secondary font-bold sticky top-0">
                <tr>
                  <th className="px-3 py-2">{x_key}</th>
                  {available_metrics.map((m) => (
                    <th key={m.key} className="px-3 py-2 text-right">
                      {m.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/15 text-on-surface font-medium">
                {data.map((row, rIdx) => (
                  <tr key={rIdx} className="hover:bg-surface-container-low/40 transition-colors">
                    <td className="px-3 py-2 font-bold">{row[x_key] || row.name || `Row ${rIdx + 1}`}</td>
                    {available_metrics.map((m) => (
                      <td key={m.key} className="px-3 py-2 text-right font-mono">
                        {formatMetricValue(row[m.key], m.format)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          /* 11. Default: High-Polish Bar Chart */
          <div className="w-full h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.6} />
                <XAxis dataKey={x_key} tick={{ fontSize: 10 }} tickLine={false} />
                <YAxis
                  tick={{ fontSize: 10 }}
                  tickLine={false}
                  tickFormatter={(v) => formatMetricValue(v, currentMetric.format)}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey={currentMetric.key}
                  fill={currentMetric.color || '#3b82f6'}
                  radius={[6, 6, 0, 0]}
                >
                  {data.map((entry, index) => (
                    <Cell
                      key={`bar-cell-${index}`}
                      fill={CHART_COLORS[index % CHART_COLORS.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
