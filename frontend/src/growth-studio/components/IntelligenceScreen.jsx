import React, { useState } from 'react';
import { defaultBIService } from '../services/BIService';
import { defaultAIService } from '../services/AIService';

/**
 * IntelligenceScreen - Dedicated AI BI & Semantic Intelligence Experience
 * 
 * Answers: "What is happening and why?"
 * 
 * Features:
 * - Deterministic BI calculations separated from AI interpretation
 * - Contextual AI actions on every KPI: [Explain], [Dig Deeper], [Add to Strategy]
 * - Granular 6-dimension "Dig Deeper" investigation flow
 * - Structured Segment Comparison (Enterprise vs Mid-Market vs SMB)
 * - Intelligent Query Bar ("What changed?", "Which audience drives growth?", etc.)
 * - Direct AI BI + Strategy Bridge: "Add Insight to Strategy"
 */
export default function IntelligenceScreen({
  onNavigateToStrategy,
  onAddInsightToStrategy,
  onOpenWhatIf,
}) {
  const [selectedSegmentFilter, setSelectedSegmentFilter] = useState('all');
  const [activeQuestion, setActiveQuestion] = useState(null);
  const [customQuestionInput, setCustomQuestionInput] = useState('');
  const [aiAnswerResult, setAiAnswerResult] = useState(null);

  // Modal / Drawer states
  const [explainingMetric, setExplainingMetric] = useState(null);
  const [digDeeperData, setDigDeeperData] = useState(null);
  const [bridgeNotice, setBridgeNotice] = useState(null);

  // Raw BI Semantic data
  const biSummary = defaultBIService.getMetric('totalTraffic');
  const organicBi = defaultBIService.getMetric('organicTraffic');
  const convBi = defaultBIService.getMetric('conversionRate');
  const leadsBi = defaultBIService.getMetric('totalLeads');
  const pipeBi = defaultBIService.getMetric('pipelineValue');
  const dealBi = defaultBIService.getMetric('averageDealSize');

  const segmentComparison = defaultBIService.compareSegments();
  const anomalies = defaultBIService.findAnomalies();
  const contentBreakdown = defaultBIService.getContentPerformance();

  const handleExplain = (metricKey) => {
    const explanation = defaultAIService.explainMetric(metricKey);
    setExplainingMetric(explanation);
  };

  const handleDigDeeper = (metricKey) => {
    const deepDive = defaultAIService.digDeeper(metricKey);
    setDigDeeperData(deepDive);
  };

  const handleRunPresetQuestion = (qText) => {
    setActiveQuestion(qText);
    const ans = defaultAIService.answerBusinessQuestion(qText);
    setAiAnswerResult(ans);
  };

  const handleCustomQuestionSubmit = (e) => {
    e.preventDefault();
    if (!customQuestionInput.trim()) return;
    const ans = defaultAIService.answerBusinessQuestion(customQuestionInput);
    setActiveQuestion(customQuestionInput);
    setAiAnswerResult(ans);
  };

  const handleSendToStrategy = (insight) => {
    if (onAddInsightToStrategy) {
      onAddInsightToStrategy(insight);
    }
    setBridgeNotice(`"${insight.title || insight.text || 'BI Insight'}" has been transferred to the Strategy Reasoning Layer!`);
    setTimeout(() => setBridgeNotice(null), 4000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8 animate-fadeIn">
      {/* Top Intelligence Mode Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 uppercase tracking-wide">
              INTELLIGENCE LAYER
            </span>
            <span className="text-xs text-slate-500">• Answers: "What is happening and why?"</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            AI Business Intelligence & Semantic Evidence Canvas
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
            Deterministic data calculations verified by analytical models. AI interprets cause, effect, and strategic significance.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onNavigateToStrategy}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
          >
            <span>Switch to Strategy Mode</span>
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </button>
        </div>
      </div>

      {/* Bridge Success Notification Banner */}
      {bridgeNotice && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center justify-between shadow-sm animate-fadeIn">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-emerald-600">check_circle</span>
            <span>{bridgeNotice}</span>
          </div>
          <button
            type="button"
            onClick={onNavigateToStrategy}
            className="underline font-bold text-emerald-800 hover:text-emerald-950 cursor-pointer"
          >
            View in Strategy →
          </button>
        </div>
      )}

      {/* Section 17 Mandate: Dedicated AI BI Question Interface */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-950 text-white rounded-2xl p-6 shadow-md space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-500/30 flex items-center justify-center text-blue-300">
              <span className="material-symbols-outlined text-lg">psychology</span>
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight text-white">Ask Business Intelligence</h2>
              <p className="text-xs text-blue-200">Query deterministic performance data and receive structured strategic reasoning.</p>
            </div>
          </div>
        </div>

        {/* Preset Core Questions from Requirement 17 */}
        <div className="flex flex-wrap gap-2 pt-1">
          {[
            'What changed in the last 30 days?',
            'Which audience is driving growth?',
            'Which channel performs best?',
            'What is our biggest weakness?',
          ].map((presetQ) => (
            <button
              key={presetQ}
              type="button"
              onClick={() => handleRunPresetQuestion(presetQ)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                activeQuestion === presetQ
                  ? 'bg-blue-500 text-white font-bold shadow-2xs'
                  : 'bg-white/10 hover:bg-white/20 text-blue-100 border border-white/10'
              }`}
            >
              {presetQ}
            </button>
          ))}
        </div>

        {/* Custom Input Query */}
        <form onSubmit={handleCustomQuestionSubmit} className="flex gap-2 pt-1">
          <input
            type="text"
            value={customQuestionInput}
            onChange={(e) => setCustomQuestionInput(e.target.value)}
            placeholder="Ask anything: e.g. 'Why did enterprise conversion drop?' or 'Compare commercial vs informational content'"
            className="flex-1 px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white text-xs placeholder:text-blue-300/60 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <button
            type="submit"
            className="px-4 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-400 text-white text-xs font-bold transition-colors cursor-pointer shrink-0"
          >
            Analyze
          </button>
        </form>

        {/* Answer Card adhering strictly to Requirement 17 (1. Answer, 2. Supporting metric, 3. Relevant comparison, 4. Explanation, 5. Recommended action) */}
        {aiAnswerResult && (
          <div className="bg-white text-slate-900 rounded-xl p-5 border border-slate-200 shadow-lg space-y-4 animate-fadeIn">
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">
                  BI Evidence & AI Interpretation
                </span>
                <h3 className="text-base font-extrabold text-slate-900 mt-0.5">
                  {aiAnswerResult.answer}
                </h3>
              </div>
              {aiAnswerResult.canAddToStrategy && (
                <button
                  type="button"
                  onClick={() =>
                    handleSendToStrategy({
                      title: aiAnswerResult.answer,
                      evidence: aiAnswerResult.supportingMetric,
                      explanation: aiAnswerResult.explanation,
                      recommendedAction: aiAnswerResult.recommendedNextAction,
                    })
                  }
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold border border-blue-200 transition-colors cursor-pointer shrink-0"
                >
                  <span className="material-symbols-outlined text-xs">add_task</span>
                  <span>Add Insight to Strategy</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80 space-y-1">
                <span className="font-bold text-slate-700 block">Supporting BI Metric:</span>
                <p className="font-mono text-slate-900 font-semibold">{aiAnswerResult.supportingMetric}</p>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80 space-y-1">
                <span className="font-bold text-slate-700 block">Relevant Comparison:</span>
                <p className="text-slate-900 font-medium">{aiAnswerResult.relevantComparison}</p>
              </div>
            </div>

            <div className="space-y-1 text-xs">
              <span className="font-bold text-slate-800">Analytical Explanation:</span>
              <p className="text-slate-600 leading-relaxed">{aiAnswerResult.explanation}</p>
            </div>

            <div className="p-3 rounded-lg bg-blue-50/70 border border-blue-200 text-xs flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-600 text-base">lightbulb</span>
                <span className="text-blue-900 font-semibold">
                  <strong>Recommended Next Action:</strong> {aiAnswerResult.recommendedNextAction}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* KPI Canvas with "Ask AI Everywhere" Actions on Every Card (Section 8) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 tracking-tight">
            Core Business Telemetry & Contextual AI Actions
          </h2>
          <span className="text-xs text-slate-500">Every metric has AI reasoning actions attached</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            {
              id: 'organicTraffic',
              label: 'Organic Traffic',
              value: '86,200',
              trend: '+18.4%',
              isPositive: true,
              detail: 'Primarily informational search volume',
            },
            {
              id: 'conversionRate',
              label: 'Blended Conversion Rate',
              value: '4.82%',
              trend: '-0.8%',
              isPositive: false,
              detail: 'Enterprise demo requests down 29.8%',
              alert: true,
            },
            {
              id: 'totalLeads',
              label: 'Total Qualified Leads',
              value: '6,191',
              trend: '+8.1%',
              isPositive: true,
              detail: 'Enterprise leads: 2,011 (32.5% of total)',
            },
            {
              id: 'pipelineValue',
              label: 'Pipeline Valuation',
              value: '$14.85M',
              trend: '+21.0%',
              isPositive: true,
              detail: 'Enterprise accounts deliver $6.24M',
            },
            {
              id: 'averageDealSize',
              label: 'Average Deal Size',
              value: '$48,500',
              trend: '+12.5%',
              isPositive: true,
              detail: 'Enterprise average: $78,500',
            },
            {
              id: 'blendedCAC',
              label: 'Blended CAC',
              value: '$1,420',
              trend: '-4.3%',
              isPositive: true,
              detail: 'Enterprise payback period: 11.2 months',
            },
          ].map((kpi) => (
            <div
              key={kpi.id}
              className={`p-5 rounded-2xl bg-white border transition-all ${
                kpi.alert ? 'border-amber-300 shadow-sm' : 'border-slate-200 hover:border-slate-300'
              } space-y-3`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {kpi.label}
                </span>
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    kpi.isPositive ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                  }`}
                >
                  {kpi.trend}
                </span>
              </div>

              <div>
                <div className="text-2xl font-black text-slate-900 tracking-tight">{kpi.value}</div>
                <div className="text-[11px] text-slate-500 mt-0.5">{kpi.detail}</div>
              </div>

              {/* Contextual AI Buttons (Section 8) */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-1">
                <button
                  type="button"
                  onClick={() => handleExplain(kpi.id)}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold inline-flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-xs text-blue-600">help</span>
                  <span>Explain</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDigDeeper(kpi.id)}
                  className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold inline-flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-xs">troubleshoot</span>
                  <span>Dig Deeper</span>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleSendToStrategy({
                      title: `${kpi.label} Trend Analysis`,
                      metric: kpi.value,
                      trend: kpi.trend,
                      detail: kpi.detail,
                    })
                  }
                  className="px-2 py-1 rounded-lg hover:bg-indigo-50 text-indigo-700 text-xs font-semibold inline-flex items-center gap-0.5 transition-colors cursor-pointer"
                  title="Bridge to Strategy Engine"
                >
                  <span className="material-symbols-outlined text-xs">add_box</span>
                  <span>Add to Strategy</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Structured Segment Comparison: Enterprise vs Mid-Market vs SMB (Section 7) */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 uppercase tracking-wide">
              <span className="material-symbols-outlined text-sm">groups</span>
              <span>Audience Segment Comparison (Calculated by BIService)</span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 mt-0.5">
              Enterprise vs Mid-Market vs SMB Performance Cohorts
            </h2>
          </div>

          <button
            type="button"
            onClick={() =>
              handleSendToStrategy({
                title: 'Enterprise Segment Efficiency Advantage',
                text: 'Enterprise delivers 42% revenue from only 18% of traffic with 3.0x SMB conversion rate.',
                evidence: '8.7% conversion vs 2.9% SMB • $78.5K avg deal vs $12.8K SMB',
              })
            }
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold border border-indigo-200 cursor-pointer"
          >
            <span className="material-symbols-outlined text-xs">send</span>
            <span>Send Comparison to Strategy</span>
          </button>
        </div>

        {/* Structured Segment Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Segment</th>
                <th className="py-3 px-3">Traffic Share</th>
                <th className="py-3 px-3">Conversion Rate</th>
                <th className="py-3 px-3">Pipeline Revenue</th>
                <th className="py-3 px-3">Average Deal Value</th>
                <th className="py-3 px-3">Sales Cycle</th>
                <th className="py-3 px-3">Website Coverage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              <tr className="bg-blue-50/40 hover:bg-blue-50/70">
                <td className="py-3 px-4 font-bold text-blue-900 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                  Enterprise (1,000+ emp)
                </td>
                <td className="py-3 px-3 font-semibold text-slate-900">
                  {segmentComparison.comparison.enterprise.shareOfTraffic}% (23,120)
                </td>
                <td className="py-3 px-3 font-bold text-emerald-700">
                  {segmentComparison.comparison.enterprise.conversionRate}%
                </td>
                <td className="py-3 px-3 font-bold text-slate-900">
                  $6,237,000 (42.0%)
                </td>
                <td className="py-3 px-3 font-mono text-slate-900">
                  ${segmentComparison.comparison.enterprise.averageDealValue.toLocaleString()}
                </td>
                <td className="py-3 px-3 text-slate-600">74 Days</td>
                <td className="py-3 px-3 text-amber-700 font-semibold">
                  Low (2 pages)
                </td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="py-3 px-4 font-bold text-slate-800 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                  Mid-Market (100–999 emp)
                </td>
                <td className="py-3 px-3 text-slate-700">
                  {segmentComparison.comparison.midMarket.shareOfTraffic}% (51,380)
                </td>
                <td className="py-3 px-3 font-semibold text-slate-800">
                  {segmentComparison.comparison.midMarket.conversionRate}%
                </td>
                <td className="py-3 px-3 text-slate-800">
                  $5,346,000 (36.0%)
                </td>
                <td className="py-3 px-3 font-mono text-slate-700">
                  ${segmentComparison.comparison.midMarket.averageDealValue.toLocaleString()}
                </td>
                <td className="py-3 px-3 text-slate-600">42 Days</td>
                <td className="py-3 px-3 text-slate-600">Medium</td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="py-3 px-4 font-bold text-slate-800 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                  SMB (&lt;100 emp)
                </td>
                <td className="py-3 px-3 text-slate-700">
                  {segmentComparison.comparison.smb.shareOfTraffic}% (53,950)
                </td>
                <td className="py-3 px-3 text-slate-700">
                  {segmentComparison.comparison.smb.conversionRate}%
                </td>
                <td className="py-3 px-3 text-slate-800">
                  $3,267,000 (22.0%)
                </td>
                <td className="py-3 px-3 font-mono text-slate-700">
                  ${segmentComparison.comparison.smb.averageDealValue.toLocaleString()}
                </td>
                <td className="py-3 px-3 text-slate-600">14 Days</td>
                <td className="py-3 px-3 text-emerald-700 font-semibold">High</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* AI Synthesis Callout below Table */}
        <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-200 text-xs text-blue-900 space-y-1">
          <span className="font-bold text-blue-800">Deterministic BI Takeaway:</span>
          <p className="leading-relaxed">
            Enterprise visitors deliver <strong>1.9x more total revenue</strong> than SMB visitors despite representing less than half the web traffic. Converting one enterprise visitor generates 6.1x the revenue of an SMB visitor.
          </p>
        </div>
      </div>

      {/* Anomalies & What-If Launchpad */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Anomaly Detection Hub */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-amber-600">crisis_alert</span>
              <h3 className="text-sm font-bold text-slate-900">Statistical Anomalies Detected</h3>
            </div>
            <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
              {anomalies.length} Flagged
            </span>
          </div>

          <div className="space-y-3">
            {anomalies.map((anom) => (
              <div
                key={anom.id}
                className="p-3.5 rounded-xl border border-slate-200 hover:border-amber-300 transition-colors bg-slate-50/50 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">{anom.metric}</span>
                  <span className="font-mono font-bold text-rose-700">{anom.changePercent}%</span>
                </div>
                <p className="text-slate-600 leading-relaxed text-[11px]">{anom.summary}</p>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] text-slate-400">{anom.detectedAt}</span>
                  <button
                    type="button"
                    onClick={() => handleDigDeeper(anom.metric)}
                    className="text-[11px] font-bold text-blue-700 hover:text-blue-800 inline-flex items-center gap-1 cursor-pointer"
                  >
                    <span>Launch Investigation</span>
                    <span className="material-symbols-outlined text-xs">arrow_forward</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Content Efficiency Summary (Commercial vs Informational) */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-indigo-600">article</span>
              <h3 className="text-sm font-bold text-slate-900">Content Performance Cohorts</h3>
            </div>
            <span className="text-xs text-slate-500">Commercial vs Informational</span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex justify-between font-bold">
                <span className="text-slate-700">Commercial Pages (18 URLs)</span>
                <span className="text-emerald-700">6.4% Conv Rate • 70.8% of Leads</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Captures high-intent buyers, but traffic growth was flat (-1.4%) over the quarter.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex justify-between font-bold">
                <span className="text-slate-700">Informational Blog (68 URLs)</span>
                <span className="text-amber-700">1.9% Conv Rate • 29.2% of Leads</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Traffic surged +28.5%, but 68% of visitors bounce without interacting with commercial offerings.
              </p>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={onOpenWhatIf}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold border border-indigo-200 cursor-pointer"
              >
                <span className="material-symbols-outlined text-xs">tune</span>
                <span>Model What-If Scenarios on Content Conversion</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL 1: Explain Metric Modal */}
      {explainingMetric && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-600">psychology</span>
                <h3 className="font-extrabold text-slate-900 text-sm">
                  AI Metric Explanation
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setExplainingMetric(null)}
                className="text-slate-400 hover:text-slate-600 text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div>
              <h4 className="text-base font-black text-slate-900 mb-2">
                {explainingMetric.metric}
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                {explainingMetric.explanation}
              </p>
            </div>

            {explainingMetric.drivers && (
              <div className="p-3 bg-slate-50 rounded-xl space-y-1.5 text-xs">
                <span className="font-bold text-slate-700">Underlying Drivers:</span>
                <ul className="list-disc pl-4 space-y-1 text-slate-600 text-[11px]">
                  {explainingMetric.drivers.map((d, i) => (
                    <li key={i}>{d}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="p-3 bg-blue-50/70 rounded-xl text-xs space-y-1">
              <span className="font-bold text-blue-900">Recommended Action:</span>
              <p className="text-blue-900/90 text-[11px]">{explainingMetric.recommendedAction}</p>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => {
                  handleSendToStrategy({
                    title: explainingMetric.metric,
                    explanation: explainingMetric.explanation,
                    recommendedAction: explainingMetric.recommendedAction,
                  });
                  setExplainingMetric(null);
                }}
                className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold cursor-pointer"
              >
                Add Insight to Strategy
              </button>
              <button
                type="button"
                onClick={() => setExplainingMetric(null)}
                className="px-3 py-1.5 rounded-lg text-slate-600 hover:bg-slate-100 text-xs font-semibold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: "Dig Deeper" Investigation Flow (Section 9) */}
      {digDeeperData && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5 animate-scaleUp max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-600">troubleshoot</span>
                <h3 className="font-black text-slate-900 text-sm">
                  Deep Root-Cause Investigation (6 Dimensions)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setDigDeeperData(null)}
                className="text-slate-400 hover:text-slate-600 text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div>
              <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">
                Investigated Anomaly
              </span>
              <h4 className="text-lg font-black text-slate-900 mt-0.5">
                {digDeeperData.metric}
              </h4>
            </div>

            {/* 6 Dimensions Breakdown */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-700">6-Dimension Audit:</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {digDeeperData.investigationDimensions?.map((dim, i) => (
                  <div key={i} className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 text-xs space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-800">{dim.dimension}</span>
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-blue-100 text-blue-800">
                        {dim.severity}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-normal">{dim.finding}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Likely Cause + Evidence + Recommended Action */}
            <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 text-xs space-y-2">
              <span className="font-bold text-amber-900 block">Likely Cause:</span>
              <p className="text-amber-950 text-xs leading-relaxed">{digDeeperData.likelyCause}</p>
              <div className="text-[11px] text-amber-800 font-mono">
                Evidence: {digDeeperData.evidence?.metricBefore} → {digDeeperData.evidence?.metricAfter} ({digDeeperData.evidence?.trafficVolume})
              </div>
            </div>

            <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 text-xs space-y-1">
              <span className="font-bold text-blue-900 block">Recommended Action:</span>
              <p className="text-blue-950 leading-relaxed">{digDeeperData.recommendedAction}</p>
              <span className="text-[10px] font-bold text-blue-700 block mt-1">
                Confidence: {digDeeperData.confidence}
              </span>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  handleSendToStrategy({
                    title: `Root Cause: ${digDeeperData.metric}`,
                    likelyCause: digDeeperData.likelyCause,
                    evidence: `${digDeeperData.evidence?.metricBefore} → ${digDeeperData.evidence?.metricAfter}`,
                    recommendedAction: digDeeperData.recommendedAction,
                  });
                  setDigDeeperData(null);
                }}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold cursor-pointer"
              >
                Add Root Cause to Strategy
              </button>
              <button
                type="button"
                onClick={() => setDigDeeperData(null)}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-semibold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
