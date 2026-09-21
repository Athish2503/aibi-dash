import React, { useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ScatterChart,
  Scatter,
} from 'recharts';
import { computeDatasetMetrics } from '../utils/csvParser';
import {
  GaugeVisual,
  FunnelVisual,
  TreemapVisual,
  ComboChartVisual,
  MatrixDrillDownVisual,
  KeyInfluencersVisual,
  AnomalyDetectionVisual,
  DurationTrendVisual,
} from './visuals/VisualizationCatalog';

const EVALUATION_STEPS = [
  'Dataset analyzed',
  'KPIs identified',
  'Channel performance analyzed',
  'Audience segments identified',
  'Campaign types analyzed',
  'Geographic analysis prepared',
];

const SECTIONS = [
  {
    num: '01',
    id: 1,
    title: 'Executive Overview',
    desc: 'C-Level KPI cards, Target ROI progress gauge, conversion pipeline funnel & AI driver analysis',
    visuals: ['Target Progress Gauge', 'Conversion Pipeline Funnel', 'Key Influencers Driver Analysis', 'Executive KPI Cards'],
  },
  {
    num: '02',
    id: 2,
    title: 'Channel Performance',
    desc: 'Multi-axis spend & ROI combo charts, category treemaps and duration lifecycle trends',
    visuals: ['Dual-Axis Spend & ROI Combo Chart', 'Spend Distribution Treemap', 'Campaign Duration Trend Area', 'Channel ROI Comparison'],
  },
  {
    num: '03',
    id: 3,
    title: 'Audience & Campaign Analysis',
    desc: 'Audience segment conversion rates & multi-level matrix hierarchy with full drill-down controls',
    visuals: ['Audience Conversion Bar', 'Hierarchical Matrix Drill-Down (Channel > Audience > Campaign)', 'Segment Reach Breakdown'],
  },
  {
    num: '04',
    id: 4,
    title: 'Cost & Geographic Performance',
    desc: 'Regional market spend, acquisition cost vs ROI correlation scatter and statistical anomaly detection',
    visuals: ['Geographic Spend Analysis', 'Acquisition Cost vs ROI Scatter Plot', 'Statistical Anomaly Outlier Detection'],
  },
];

export default function PlanReviewer({
  plan: _plan,
  onApproveAndGenerate,
  isGenerating,
  datasetRows = [],
}) {
  const [selectedPreviewSection, setSelectedPreviewSection] = useState(1);
  const metrics = computeDatasetMetrics(datasetRows) || {};
  const spendByChannel = Array.isArray(metrics.spendByChannel) ? metrics.spendByChannel : [];
  const roiByChannel = Array.isArray(metrics.roiByChannel) ? metrics.roiByChannel : [];
  const convByAudience = Array.isArray(metrics.convByAudience) ? metrics.convByAudience : [];
  const spendByLocation = Array.isArray(metrics.spendByLocation) ? metrics.spendByLocation : [];
  const cacVsRoi = Array.isArray(metrics.cacVsRoi) ? metrics.cacVsRoi : [];
  const durationTrends = Array.isArray(metrics.durationTrends) ? metrics.durationTrends : [];
  const totalSpend = metrics.totalSpend || 0;

  return (
    <div className="w-full py-4 animate-fade-in flex flex-col gap-6">
      {/* Top Banner: Creating Your Dashboard / Agent Pipeline */}
      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-outline-variant/20 pb-5">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
              <span className="material-symbols-outlined text-[24px]">auto_awesome</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-on-surface">Creating Your Dashboard</h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-300">
                  Ready to Generate
                </span>
              </div>
              <p className="text-xs text-secondary mt-0.5">
                Agent is evaluating metrics and structuring the report
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onApproveAndGenerate}
            disabled={isGenerating}
            className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Generating Power BI Dashboard...</span>
              </>
            ) : (
              <>
                <span>Generate Power BI Dashboard</span>
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </>
            )}
          </button>
        </div>

        {/* Evaluation Checklist */}
        <div className="mt-5">
          <span className="text-[11px] font-bold text-secondary uppercase tracking-wider block mb-3">
            Evaluation & Structuring Pipeline
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
            {EVALUATION_STEPS.map((step) => (
              <div
                key={step}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-surface-container-low border border-outline-variant/20"
              >
                <span className="material-symbols-outlined text-emerald-600 text-base">check_circle</span>
                <span className="text-xs font-medium text-on-surface truncate" title={step}>
                  {step}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4 Dashboard Sections Architecture */}
      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <span className="text-[11px] font-bold text-secondary uppercase tracking-wider">
              Designing Dashboard
            </span>
            <h2 className="text-base font-bold text-on-surface mt-0.5">
              AI has identified 4 dashboard sections:
            </h2>
          </div>
          <span className="text-xs text-secondary">
            Click any section below to preview its planned visuals
          </span>
        </div>

        {/* Section Selection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3 mb-6">
          {SECTIONS.map((sec) => {
            const isSelected = selectedPreviewSection === sec.id;
            return (
              <button
                key={sec.id}
                type="button"
                onClick={() => setSelectedPreviewSection(sec.id)}
                className={`text-left p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-primary/5 border-primary shadow-sm ring-1 ring-primary'
                    : 'bg-surface-container-low border-outline-variant/20 hover:border-outline-variant/50'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`text-xl font-black font-mono ${
                        isSelected ? 'text-primary' : 'text-secondary/70'
                      }`}
                    >
                      {sec.num}
                    </span>
                    <span
                      className={`material-symbols-outlined text-base ${
                        isSelected ? 'text-primary' : 'text-secondary/50'
                      }`}
                    >
                      {sec.id === 1 ? 'dashboard' : sec.id === 2 ? 'insights' : sec.id === 3 ? 'group' : 'attach_money'}
                    </span>
                  </div>
                  <h3 className="text-xs font-bold text-on-surface mb-1">{sec.title}</h3>
                  <p className="text-[11px] text-secondary leading-relaxed">{sec.desc}</p>
                </div>

                <div className="mt-3 pt-3 border-t border-outline-variant/20 flex items-center justify-between">
                  <span className="text-[10px] text-secondary font-medium">
                    {sec.visuals.length} visuals planned
                  </span>
                  <span
                    className={`text-[10px] font-bold ${
                      isSelected ? 'text-primary' : 'text-secondary'
                    }`}
                  >
                    {isSelected ? 'Viewing Preview' : 'Inspect'}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Interactive Preview Container for Selected Section */}
        <div className="bg-surface-container-low rounded-xl border border-outline-variant/20 p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-primary text-white text-[10px] font-bold font-mono">
                PAGE 0{selectedPreviewSection}
              </span>
              <h3 className="text-sm font-bold text-on-surface">
                {SECTIONS.find((s) => s.id === selectedPreviewSection)?.title} — Section Preview
              </h3>
            </div>
            <span className="text-[11px] text-secondary">
              Includes full drill-down, cross-filtering & refactoring capabilities
            </span>
          </div>

          {/* Render Preview according to selected section */}
          {selectedPreviewSection === 1 && (
            <div className="flex flex-col gap-4">
              {/* Executive KPIs */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-xl bg-surface-container-lowest border border-outline-variant/20">
                  <span className="text-[10px] text-secondary uppercase font-semibold">Total Campaigns</span>
                  <div className="text-xl font-bold text-on-surface mt-1">{Number(metrics.totalCampaigns).toLocaleString()}</div>
                </div>
                <div className="p-3.5 rounded-xl bg-surface-container-lowest border border-outline-variant/20">
                  <span className="text-[10px] text-secondary uppercase font-semibold">Avg ROI Ratio</span>
                  <div className="text-xl font-bold text-primary mt-1">{metrics.avgROI}x</div>
                </div>
                <div className="p-3.5 rounded-xl bg-surface-container-lowest border border-outline-variant/20">
                  <span className="text-[10px] text-secondary uppercase font-semibold">Avg Conversion</span>
                  <div className="text-xl font-bold text-emerald-600 mt-1">{metrics.avgConvRate}%</div>
                </div>
                <div className="p-3.5 rounded-xl bg-surface-container-lowest border border-outline-variant/20">
                  <span className="text-[10px] text-secondary uppercase font-semibold">Total Spend</span>
                  <div className="text-xl font-bold text-on-surface mt-1">${Number(metrics.totalSpend).toLocaleString()}</div>
                </div>
              </div>

              {/* Gauge & Funnel Preview */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <GaugeVisual
                  title="Target Progress: Portfolio ROI"
                  currentValue={metrics.avgROI}
                  targetValue={6.0}
                  unit="x"
                />
                <FunnelVisual
                  title="Pipeline Conversion Stages"
                  impressions={metrics.totalImpressions}
                  clicks={metrics.totalClicks}
                  conversions={metrics.totalConversions}
                />
              </div>

              {/* Key Influencers Driver Preview */}
              <KeyInfluencersVisual
                targetMetric="High ROI (> 5.0x)"
                datasetRows={datasetRows}
              />
            </div>
          )}

          {selectedPreviewSection === 2 && (
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <ComboChartVisual
                  title="Channel Spend vs ROI Dual-Axis Combo"
                  data={spendByChannel.map((ch) => {
                    const r = roiByChannel.find((x) => x.name === ch.name);
                    return {
                      channel: ch.name,
                      name: ch.name,
                      spend: ch.spend || 0,
                      roi: r ? r.roi : ch.roi || 0,
                    };
                  })}
                />
                <TreemapVisual
                  title="Spend Proportional Share Treemap"
                  data={spendByChannel.map((c) => ({
                    name: c.name,
                    spend: c.spend || 0,
                    value: c.spend || 0,
                    roi: c.roi || 0,
                    share: totalSpend > 0 ? ((c.spend / totalSpend) * 100).toFixed(1) : '0.0',
                  }))}
                />
              </div>
              <DurationTrendVisual
                title="Campaign Duration Lifecycle Trend"
                data={durationTrends}
              />
            </div>
          )}

          {selectedPreviewSection === 3 && (
            <div className="flex flex-col gap-4">
              <div className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/20">
                <span className="text-xs font-bold text-on-surface mb-3 block">Conversion Rate by Audience (%)</span>
                <div className="h-44 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={convByAudience} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#c3c6d7" opacity={0.3} />
                      <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#565e74' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 10, fill: '#565e74' }} axisLine={false} tickLine={false} unit="%" />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e5eeff', fontSize: '11px' }}
                        formatter={(value) => [`${value}%`, 'Conversion Rate']}
                      />
                      <Bar dataKey="conv" fill="#10b981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Hierarchical Drill-Down Matrix */}
              <MatrixDrillDownVisual
                title="Hierarchical Drill-Down Matrix (Channel > Audience > Campaign)"
                datasetRows={datasetRows}
              />
            </div>
          )}

          {selectedPreviewSection === 4 && (
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Geographic breakdown */}
                <div className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/20">
                  <span className="text-xs font-bold text-on-surface mb-3 block">Geographic Market Spend</span>
                  <div className="h-48 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={spendByLocation} margin={{ top: 8, right: 8, left: -10, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#c3c6d7" opacity={0.3} />
                        <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#565e74' }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 10, fill: '#565e74' }} axisLine={false} tickLine={false} unit="$" />
                        <Tooltip
                          contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e5eeff', fontSize: '11px' }}
                          formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Spend']}
                        />
                        <Bar dataKey="spend" fill="#004ac6" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* CAC vs ROI Scatter */}
                <div className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/20 flex flex-col">
                  <span className="text-xs font-bold text-on-surface mb-3 block">Acquisition Cost vs ROI Correlation</span>
                  <div className="h-48 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <ScatterChart margin={{ top: 8, right: 16, left: -10, bottom: 8 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#c3c6d7" opacity={0.3} />
                        <XAxis dataKey="cac" name="Acquisition Cost" unit="$" tick={{ fontSize: 10, fill: '#565e74' }} />
                        <YAxis dataKey="roi" name="ROI" unit="x" tick={{ fontSize: 10, fill: '#565e74' }} />
                        <Tooltip
                          contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e5eeff', fontSize: '11px' }}
                          formatter={(val, name) => [name === 'Acquisition Cost' ? `$${val}` : `${val}x`, name]}
                        />
                        <Scatter name="Campaigns" data={cacVsRoi} fill="#004ac6" />
                      </ScatterChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Anomaly Detection Visual */}
              <AnomalyDetectionVisual
                title="Statistical Anomaly & Outlier Detection"
                datasetRows={datasetRows}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
