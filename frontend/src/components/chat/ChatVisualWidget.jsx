import React, { useState } from 'react';
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
} from 'recharts';

const CHART_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];

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
  if (!visualSpec || !visualSpec.data) return null;

  const {
    type = 'bar',
    title,
    subtitle,
    x_key = 'name',
    available_metrics = [],
    default_metric,
    data = [],
    kpis = [],
  } = visualSpec;

  const [activeMetricKey, setActiveMetricKey] = useState(
    default_metric || (available_metrics.length > 0 ? available_metrics[0].key : 'average_roi')
  );
  const [viewMode, setViewMode] = useState('chart'); // 'chart' | 'table'
  const [isPinned, setIsPinned] = useState(false);

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
        type: type === 'donut' ? 'pie' : type,
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
          <div className="font-bold text-on-surface mb-1">{label || item[x_key]}</div>
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

  return (
    <div className="w-full my-3 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-xs overflow-hidden transition-all">
      {/* Header bar */}
      <div className="px-4 py-3 bg-surface-container-low/50 border-b border-outline-variant/20 flex flex-wrap items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <h2 className="text-xs font-bold text-on-surface">{title || 'Instant In-Chat Analysis'}</h2>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-primary/10 text-primary uppercase">
              {type}
            </span>
          </div>
          {subtitle && <p className="text-[11px] text-secondary mt-0.5">{subtitle}</p>}
        </div>

        {/* Controls: Metric Switcher, View Mode, and Pin */}
        <div className="flex items-center gap-1.5 ml-auto">
          {/* View toggle (Chart vs Table) */}
          {type !== 'kpi' && (
            <div className="flex items-center bg-surface-container border border-outline-variant/30 rounded-lg p-0.5">
              <button
                type="button"
                onClick={() => setViewMode('chart')}
                className={`px-2 py-1 rounded text-[10px] font-semibold transition-colors flex items-center gap-1 ${
                  viewMode === 'chart'
                    ? 'bg-surface-container-lowest text-primary shadow-xs'
                    : 'text-secondary hover:text-on-surface'
                }`}
                title="View interactive chart"
              >
                <span className="material-symbols-outlined text-xs">bar_chart</span>
                <span>Chart</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`px-2 py-1 rounded text-[10px] font-semibold transition-colors flex items-center gap-1 ${
                  viewMode === 'table'
                    ? 'bg-surface-container-lowest text-primary shadow-xs'
                    : 'text-secondary hover:text-on-surface'
                }`}
                title="View data table"
              >
                <span className="material-symbols-outlined text-xs">table_rows</span>
                <span>Table</span>
              </button>
            </div>
          )}

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

      {/* Metric Selector Pills (if multiple available) */}
      {available_metrics.length > 1 && viewMode === 'chart' && (
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
        {type === 'kpi' ? (
          /* KPI Cards Grid */
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
        ) : viewMode === 'table' ? (
          /* Table View */
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
        ) : type === 'donut' ? (
          /* Donut / Pie Chart */
          <div className="w-full h-56 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey={currentMetric.key}
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
        ) : type === 'line' ? (
          /* Line Chart */
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
        ) : (
          /* Default: Bar Chart */
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
