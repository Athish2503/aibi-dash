import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { compareUploadedDatasets } from '../services/api';

export default function DatasetComparator({
  activeDatasetFile,
  activeDatasetName,
  onClose,
}) {
  const [fileA, setFileA] = useState(activeDatasetFile || null);
  const [labelA, setLabelA] = useState('Baseline (Period A)');
  const [fileB, setFileB] = useState(null);
  const [labelB, setLabelB] = useState('Comparison (Period B)');

  const [comparisonResult, setComparisonResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [activeMetricView, setActiveMetricView] = useState('roi'); // 'roi' or 'cac'

  const handleRunComparison = async () => {
    if (!fileA || !fileB) {
      setErrorMessage('Please upload or select both Baseline and Comparison datasets.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const result = await compareUploadedDatasets(fileA, fileB, labelA, labelB);
      setComparisonResult(result);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to compare datasets.');
    } finally {
      setIsLoading(false);
    }
  };

  // Prepare Recharts chart data
  const chartData = comparisonResult?.channels?.map((ch) => ({
    channel: ch.channel,
    baselineRoi: ch.roi_baseline,
    comparisonRoi: ch.roi_comparison,
    roiDelta: ch.roi_delta,
    baselineCac: ch.cac_baseline,
    comparisonCac: ch.cac_comparison,
    cacDelta: ch.cac_delta,
  })) || [];

  return (
    <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl shadow-xl overflow-hidden animate-fade-in flex flex-col">
      {/* Header */}
      <div className="px-6 py-5 bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 text-white flex items-center justify-between border-b border-sky-800/40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-500/20 border border-sky-400/30 flex items-center justify-center text-sky-300">
            <span className="material-symbols-outlined text-2xl">compare_arrows</span>
          </div>
          <div>
            <h2 className="text-lg font-bold tracking-tight flex items-center gap-2">
              Cross-Dataset Comparison & Period Benchmarking
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-sky-500/30 text-sky-200 border border-sky-400/30">
                Deterministic Delta Engine
              </span>
            </h2>
            <p className="text-xs text-slate-300">
              Evaluate performance shifts, channel ROI expansion, and CAC efficiencies across two campaign cycles.
            </p>
          </div>
        </div>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 flex items-center justify-center text-sm transition-all"
            title="Close Benchmark"
          >
            ✕
          </button>
        )}
      </div>

      <div className="p-6 flex flex-col gap-6">
        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2 font-medium">
              <span className="material-symbols-outlined text-rose-600 text-base">error</span>
              <span>{errorMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => setErrorMessage(null)}
              className="text-rose-600 hover:text-rose-900 font-bold"
            >
              ✕
            </button>
          </div>
        )}

        {/* Dual Upload Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Baseline Dataset (A) */}
          <div className="bg-surface-container-low border border-outline-variant/40 rounded-xl p-4 flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-on-surface flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-500"></span>
                Baseline Dataset (Period A)
              </span>
              <span className="text-[10px] text-on-surface-variant font-medium">Reference Point</span>
            </div>

            <input
              type="text"
              value={labelA}
              onChange={(e) => setLabelA(e.target.value)}
              placeholder="Label, e.g. Q1 2026 or Brand A"
              className="px-3 py-1.5 text-xs bg-surface border border-outline-variant/40 rounded-lg text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
            />

            <div className="border-2 border-dashed border-outline-variant/60 rounded-lg p-3 text-center bg-surface hover:border-primary/50 transition-colors">
              <input
                type="file"
                id="fileA-input"
                accept=".csv,.xlsx"
                onChange={(e) => e.target.files?.[0] && setFileA(e.target.files[0])}
                className="hidden"
              />
              <label htmlFor="fileA-input" className="cursor-pointer flex flex-col items-center gap-1">
                <span className="material-symbols-outlined text-lg text-primary">upload_file</span>
                <span className="text-xs font-medium text-on-surface truncate max-w-full">
                  {fileA ? fileA.name : activeDatasetName || 'Choose Baseline CSV/XLSX'}
                </span>
                <span className="text-[10px] text-on-surface-variant">Click to browse or replace</span>
              </label>
            </div>
          </div>

          {/* Comparison Dataset (B) */}
          <div className="bg-surface-container-low border border-outline-variant/40 rounded-xl p-4 flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-on-surface flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-500"></span>
                Comparison Dataset (Period B)
              </span>
              <span className="text-[10px] text-on-surface-variant font-medium">Target Period</span>
            </div>

            <input
              type="text"
              value={labelB}
              onChange={(e) => setLabelB(e.target.value)}
              placeholder="Label, e.g. Q2 2026 or Brand B"
              className="px-3 py-1.5 text-xs bg-surface border border-outline-variant/40 rounded-lg text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
            />

            <div className="border-2 border-dashed border-outline-variant/60 rounded-lg p-3 text-center bg-surface hover:border-sky-500/50 transition-colors">
              <input
                type="file"
                id="fileB-input"
                accept=".csv,.xlsx"
                onChange={(e) => e.target.files?.[0] && setFileB(e.target.files[0])}
                className="hidden"
              />
              <label htmlFor="fileB-input" className="cursor-pointer flex flex-col items-center gap-1">
                <span className="material-symbols-outlined text-lg text-sky-600">upload_file</span>
                <span className="text-xs font-medium text-on-surface truncate max-w-full">
                  {fileB ? fileB.name : 'Choose Comparison CSV/XLSX'}
                </span>
                <span className="text-[10px] text-on-surface-variant">Click to browse file</span>
              </label>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-center">
          <button
            type="button"
            onClick={handleRunComparison}
            disabled={isLoading || !fileA || !fileB}
            className="px-6 py-2.5 bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-base">
              {isLoading ? 'progress_activity' : 'insights'}
            </span>
            {isLoading ? 'Computing Variance Engine...' : 'Run Comparative Benchmark'}
          </button>
        </div>

        {/* Results View */}
        {comparisonResult && (
          <div className="flex flex-col gap-6 animate-fade-in">
            {/* Executive Delta Metric Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {/* ROI Delta */}
              <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/30 flex flex-col gap-1">
                <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
                  Average ROI
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-extrabold text-on-surface">
                    {comparisonResult.roi.comparison_value.toFixed(2)}x
                  </span>
                  <span
                    className={`text-xs font-bold px-1.5 py-0.5 rounded ${
                      comparisonResult.roi.sentiment === 'positive'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {comparisonResult.roi.absolute_delta >= 0 ? '+' : ''}
                    {comparisonResult.roi.absolute_delta.toFixed(2)}x (
                    {comparisonResult.roi.percentage_change >= 0 ? '+' : ''}
                    {comparisonResult.roi.percentage_change}%)
                  </span>
                </div>
                <span className="text-[10px] text-on-surface-variant">
                  vs {comparisonResult.roi.baseline_value.toFixed(2)}x in {comparisonResult.baseline_label}
                </span>
              </div>

              {/* CAC Delta */}
              <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/30 flex flex-col gap-1">
                <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
                  Acquisition Cost (CAC)
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-extrabold text-on-surface">
                    ${comparisonResult.cac.comparison_value.toFixed(2)}
                  </span>
                  <span
                    className={`text-xs font-bold px-1.5 py-0.5 rounded ${
                      comparisonResult.cac.sentiment === 'positive'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {comparisonResult.cac.absolute_delta >= 0 ? '+' : ''}$
                    {comparisonResult.cac.absolute_delta.toFixed(2)} (
                    {comparisonResult.cac.percentage_change >= 0 ? '+' : ''}
                    {comparisonResult.cac.percentage_change}%)
                  </span>
                </div>
                <span className="text-[10px] text-on-surface-variant">
                  vs ${comparisonResult.cac.baseline_value.toFixed(2)} in {comparisonResult.baseline_label}
                </span>
              </div>

              {/* Conversion Rate Delta */}
              <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/30 flex flex-col gap-1">
                <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
                  Avg Conversion Rate
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-extrabold text-on-surface">
                    {(comparisonResult.conversion_rate.comparison_value * 100).toFixed(2)}%
                  </span>
                  <span
                    className={`text-xs font-bold px-1.5 py-0.5 rounded ${
                      comparisonResult.conversion_rate.sentiment === 'positive'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {comparisonResult.conversion_rate.absolute_delta >= 0 ? '+' : ''}
                    {(comparisonResult.conversion_rate.absolute_delta * 100).toFixed(2)}% pts
                  </span>
                </div>
                <span className="text-[10px] text-on-surface-variant">
                  vs {(comparisonResult.conversion_rate.baseline_value * 100).toFixed(2)}% in {comparisonResult.baseline_label}
                </span>
              </div>

              {/* Volume Delta */}
              <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/30 flex flex-col gap-1">
                <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
                  Total Campaigns Volume
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-extrabold text-on-surface">
                    {comparisonResult.total_records_comparison.toLocaleString()}
                  </span>
                  <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-surface border border-outline-variant/40 text-on-surface">
                    {comparisonResult.records_delta >= 0 ? '+' : ''}
                    {comparisonResult.records_delta.toLocaleString()}
                  </span>
                </div>
                <span className="text-[10px] text-on-surface-variant">
                  {comparisonResult.total_records_baseline.toLocaleString()} in {comparisonResult.baseline_label}
                </span>
              </div>
            </div>

            {/* Winner & Laggard Highlights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {comparisonResult.top_roi_winner && (
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center gap-3">
                  <span className="material-symbols-outlined text-2xl text-emerald-600">trending_up</span>
                  <div>
                    <div className="text-[10px] uppercase font-bold tracking-wider text-emerald-700">
                      Top ROI Outperformer
                    </div>
                    <div className="text-sm font-extrabold">{comparisonResult.top_roi_winner}</div>
                  </div>
                </div>
              )}

              {comparisonResult.top_cac_reducer && (
                <div className="p-3.5 rounded-xl bg-sky-50 border border-sky-200 text-sky-900 flex items-center gap-3">
                  <span className="material-symbols-outlined text-2xl text-sky-600">savings</span>
                  <div>
                    <div className="text-[10px] uppercase font-bold tracking-wider text-sky-700">
                      Top Cost Efficiency
                    </div>
                    <div className="text-sm font-extrabold">{comparisonResult.top_cac_reducer}</div>
                  </div>
                </div>
              )}

              {comparisonResult.biggest_laggard && (
                <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-center gap-3">
                  <span className="material-symbols-outlined text-2xl text-amber-600">trending_down</span>
                  <div>
                    <div className="text-[10px] uppercase font-bold tracking-wider text-amber-700">
                      Steepest Contraction
                    </div>
                    <div className="text-sm font-extrabold">{comparisonResult.biggest_laggard}</div>
                  </div>
                </div>
              )}
            </div>

            {/* Interactive Variance Chart */}
            <div className="bg-surface-container-low border border-outline-variant/30 rounded-xl p-5 flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-xs font-bold text-on-surface uppercase tracking-wider">
                    Channel-by-Channel Variance Comparison
                  </h3>
                  <p className="text-[11px] text-on-surface-variant">
                    Side-by-side performance contrast between {comparisonResult.baseline_label} and {comparisonResult.comparison_label}
                  </p>
                </div>

                <div className="flex items-center gap-1 bg-surface rounded-lg p-1 border border-outline-variant/30">
                  <button
                    type="button"
                    onClick={() => setActiveMetricView('roi')}
                    className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                      activeMetricView === 'roi'
                        ? 'bg-primary text-white shadow-xs'
                        : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    ROI Comparison (x)
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveMetricView('cac')}
                    className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                      activeMetricView === 'cac'
                        ? 'bg-primary text-white shadow-xs'
                        : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    CAC Comparison ($)
                  </button>
                </div>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="channel" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0F172A',
                        borderRadius: '8px',
                        border: 'none',
                        color: '#F8FAFC',
                        fontSize: '12px',
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                    {activeMetricView === 'roi' ? (
                      <>
                        <Bar
                          dataKey="baselineRoi"
                          name={`${comparisonResult.baseline_label} ROI`}
                          fill="#94A3B8"
                          radius={[4, 4, 0, 0]}
                        />
                        <Bar
                          dataKey="comparisonRoi"
                          name={`${comparisonResult.comparison_label} ROI`}
                          fill="#2563EB"
                          radius={[4, 4, 0, 0]}
                        />
                      </>
                    ) : (
                      <>
                        <Bar
                          dataKey="baselineCac"
                          name={`${comparisonResult.baseline_label} CAC ($)`}
                          fill="#94A3B8"
                          radius={[4, 4, 0, 0]}
                        />
                        <Bar
                          dataKey="comparisonCac"
                          name={`${comparisonResult.comparison_label} CAC ($)`}
                          fill="#F97316"
                          radius={[4, 4, 0, 0]}
                        />
                      </>
                    )}
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Detailed Variance Table */}
            <div className="bg-surface-container-low border border-outline-variant/30 rounded-xl overflow-hidden flex flex-col">
              <div className="px-4 py-3 border-b border-outline-variant/20 bg-surface">
                <h4 className="text-xs font-bold text-on-surface">Detailed Channel Shift Table</h4>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-surface-container-lowest text-[10px] uppercase font-bold text-on-surface-variant border-b border-outline-variant/20">
                    <tr>
                      <th className="px-4 py-2.5">Channel</th>
                      <th className="px-4 py-2.5">{comparisonResult.baseline_label} ROI</th>
                      <th className="px-4 py-2.5">{comparisonResult.comparison_label} ROI</th>
                      <th className="px-4 py-2.5">ROI Delta</th>
                      <th className="px-4 py-2.5">{comparisonResult.baseline_label} CAC</th>
                      <th className="px-4 py-2.5">{comparisonResult.comparison_label} CAC</th>
                      <th className="px-4 py-2.5">CAC Delta</th>
                      <th className="px-4 py-2.5">Verdict</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/20">
                    {comparisonResult.channels?.map((ch, idx) => (
                      <tr key={idx} className="hover:bg-surface-container/40 transition-colors">
                        <td className="px-4 py-2 font-bold text-on-surface">{ch.channel}</td>
                        <td className="px-4 py-2">{ch.roi_baseline.toFixed(2)}x</td>
                        <td className="px-4 py-2 font-bold">{ch.roi_comparison.toFixed(2)}x</td>
                        <td className={`px-4 py-2 font-bold ${ch.roi_delta >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {ch.roi_delta >= 0 ? '+' : ''}
                          {ch.roi_delta.toFixed(2)}x ({ch.roi_pct_change >= 0 ? '+' : ''}{ch.roi_pct_change}%)
                        </td>
                        <td className="px-4 py-2">${ch.cac_baseline.toFixed(2)}</td>
                        <td className="px-4 py-2 font-bold">${ch.cac_comparison.toFixed(2)}</td>
                        <td className={`px-4 py-2 font-bold ${ch.cac_delta <= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {ch.cac_delta >= 0 ? '+' : ''}${ch.cac_delta.toFixed(2)}
                        </td>
                        <td className="px-4 py-2">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              ch.performance_verdict === 'Outperformer'
                                ? 'bg-emerald-100 text-emerald-800'
                                : ch.performance_verdict === 'Laggard'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {ch.performance_verdict}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Executive Synthesis Bullets */}
            {comparisonResult.executive_summary?.length > 0 && (
              <div className="p-4 rounded-xl bg-surface border border-outline-variant/30 flex flex-col gap-2">
                <span className="text-xs font-bold text-on-surface flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm text-primary">summarize</span>
                  Executive Benchmark Synthesis
                </span>
                <ul className="list-disc list-inside text-xs text-on-surface-variant flex flex-col gap-1 pl-1">
                  {comparisonResult.executive_summary.map((bullet, idx) => (
                    <li key={idx} className="leading-relaxed">
                      {bullet}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
