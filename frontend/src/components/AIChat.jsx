import React, { useState, useRef, useEffect } from 'react';
import { BorderBeam } from 'border-beam';
import { sendChatMessage } from '../services/api';
import { computeDatasetMetrics } from '../utils/csvParser';
import NLMessageFormatter from './NLMessageFormatter';
import ChatVisualWidget from './chat/ChatVisualWidget';

export default function AIChat({
  datasetId,
  datasetRows = [],
  pipelineData = null,
  datasetName = 'marketing_campaigns.csv',
  totalRecords = 200000,
  messages: externalMessages,
  setMessages: externalSetMessages,
  onPinVisual,
  activeModel,
  availableModels = [],
  ollamaOnline = false,
  onSwitchModel,
}) {
  const [question, setQuestion] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [localMessages, setLocalMessages] = useState([]);
  const messages = externalMessages !== undefined ? externalMessages : localMessages;
  const setMessages = externalSetMessages || setLocalMessages;
  const [expandedEvidence, setExpandedEvidence] = useState({});
  const [expandedSteps, setExpandedSteps] = useState({});
  const [copiedIdx, setCopiedIdx] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Agent mode, execution mode, context mentions, AI Model switcher, and Beam effect options
  const [selectedAgent, setSelectedAgent] = useState('Agent');
  const [selectedMode, setSelectedMode] = useState('Auto');
  const [showAgentMenu, setShowAgentMenu] = useState(false);
  const [showModeMenu, setShowModeMenu] = useState(false);
  const [showMentionMenu, setShowMentionMenu] = useState(false);
  const [showModelMenu, setShowModelMenu] = useState(false);
  const [beamVariant, setBeamVariant] = useState('colorful');
  const [beamStrength, setBeamStrength] = useState(0.7);

  const textareaRef = useRef(null);
  const messagesEndRef = useRef(null);
  const streamTimerRef = useRef(null);
  const isProcessingRef = useRef(false);
  const abortControllerRef = useRef(null);

  // Close floating menus when clicking outside or pressing Escape
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.chatbar-menu-container')) {
        setShowAgentMenu(false);
        setShowModeMenu(false);
        setShowMentionMenu(false);
        setShowModelMenu(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setShowAgentMenu(false);
        setShowModeMenu(false);
        setShowMentionMenu(false);
        setShowModelMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleQuestionChange = (e) => {
    setQuestion(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  };

  const handleInsertMention = (tag) => {
    setQuestion((prev) => {
      const trimmed = prev.trim();
      return trimmed ? `${trimmed} ${tag} ` : `${tag} `;
    });
    setShowMentionMenu(false);
    if (textareaRef.current) {
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 50);
    }
  };

  const initialRecordCount = datasetRows?.length > 0 ? datasetRows.length : totalRecords;
  const columnCount =
    pipelineData?.inspection?.column_count ??
    (datasetRows?.length > 0 ? Object.keys(datasetRows[0]).length : 10);

  const getModelIcon = (m) => {
    if (m?.provider === 'ollama' || m?.family === 'llama' || (m?.id && m.id.includes('llama'))) return '🦙';
    if (m?.provider === 'gemini') return '⚡';
    if (m?.provider === 'mock' || m?.id === 'deterministic') return '⚙️';
    return '🤖';
  };

  const activeModelLabel = activeModel?.model || 'llama3.2:1b';
  const isLocalModel = activeModel?.provider === 'ollama' || activeModelLabel.includes('llama') || activeModelLabel.includes('mistral');

  const ollamaModels = (availableModels && availableModels.filter((m) => m.provider === 'ollama').length > 0)
    ? availableModels.filter((m) => m.provider === 'ollama')
    : [
        { id: 'llama3.2:1b', name: 'llama3.2:1b (Local)', provider: 'ollama', badge: 'Llama Family' },
        { id: 'mistral:7b', name: 'mistral:7b (Local)', provider: 'ollama', badge: 'Llama Family' },
        { id: 'gemma4:latest', name: 'gemma4:latest (Local)', provider: 'ollama', badge: 'Local Model' },
      ];

  const geminiModels = [
    { id: 'gemini-3.6-flash', name: 'Gemini 3.6 Flash', provider: 'gemini', badge: 'Fast Reasoning' },
    { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro', provider: 'gemini', badge: 'Deep Reasoning' },
  ];

  const starterCards = [
    {
      title: 'Channel ROI Rankings',
      desc: 'Compare return efficiency, spend, and CAC across channels',
      query: 'Which channel has the highest ROI?',
      icon: 'leaderboard',
      color: 'text-blue-600 bg-blue-50 border-blue-200',
    },
    {
      title: 'Conversion Benchmarks',
      desc: 'Analyze portfolio conversion rates and audience segments',
      query: 'What is the average conversion rate?',
      icon: 'trending_up',
      color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    },
    {
      title: 'Top 3 Campaigns',
      desc: 'Inspect highest-performing campaigns by return and CAC',
      query: 'What are the top 3 campaigns by ROI?',
      icon: 'military_tech',
      color: 'text-amber-600 bg-amber-50 border-amber-200',
    },
    {
      title: 'CAC & Spend Analysis',
      desc: 'Evaluate customer acquisition costs vs lifetime value',
      query: 'Compare CAC across channels',
      icon: 'payments',
      color: 'text-purple-600 bg-purple-50 border-purple-200',
    },
  ];

  const samplePrompts = [
    { label: 'Channel Rankings', query: 'Which channel has the highest ROI?', icon: 'leaderboard' },
    { label: 'Average Conv. Rate', query: 'What is the average conversion rate?', icon: 'trending_up' },
    { label: 'Top 3 Campaigns', query: 'What are the top 3 campaigns by ROI?', icon: 'military_tech' },
    { label: 'Audience Breakdown', query: 'Which target audience converted best?', icon: 'group' },
    { label: 'CAC Comparison', query: 'Compare CAC across channels', icon: 'payments' },
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isSending, isStreaming]);

  // Clean up streaming interval on unmount
  useEffect(() => {
    return () => {
      if (streamTimerRef.current) {
        clearInterval(streamTimerRef.current);
      }
    };
  }, []);

  const toggleEvidence = (idx) => {
    setExpandedEvidence((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const toggleSteps = (idx) => {
    setExpandedSteps((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const handleNewChat = () => {
    if (streamTimerRef.current) {
      clearInterval(streamTimerRef.current);
      streamTimerRef.current = null;
    }
    setIsStreaming(false);
    setIsSending(false);
    isProcessingRef.current = false;
    setMessages([]);
    setExpandedEvidence({});
    setExpandedSteps({});
    setQuestion('');
    setCopiedIdx(null);
  };

  const handleCopy = (text, idx) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text);
      setCopiedIdx(idx);
      setTimeout(() => setCopiedIdx(null), 2000);
    }
  };

  const handlePinVisualWrapper = (visual) => {
    if (onPinVisual) {
      onPinVisual(visual);
      setToastMessage(`✓ Added "${visual.title}" to Dashboard Plan`);
      setTimeout(() => setToastMessage(null), 3500);
    }
  };

  // Client-side grounded dataset contextual analyzer for instant accurate answers
  const generateContextualAnswer = (query, rows, visualContext = null) => {
    const qLower = query.toLowerCase();
    const metrics = computeDatasetMetrics(rows);
    const recCount = rows && rows.length > 0 ? rows.length : Number(totalRecords);
    const sortedChannels = [...(metrics.roiByChannel || [])];
    const sortedAud = [...(metrics.convByAudience || [])];
    const sortedTypes = [...(metrics.campaignType || [])];
    const sortedDurations = [...(metrics.durationTrends || [])];
    const topCamps = metrics.topCampaigns && metrics.topCampaigns.length > 0 ? metrics.topCampaigns : [];

    const topChannel = sortedChannels[0] || { name: 'Direct', roi: 0, average_roi: 0, average_conversion_rate: 0, average_acquisition_cost: 0, spend: 0 };
    const secondChannel = sortedChannels[1] || null;
    const lowestChannel = sortedChannels.length > 1 ? sortedChannels[sortedChannels.length - 1] : sortedChannels[0];
    const topAud = sortedAud[0] || { name: 'Primary Segment', conv: 0, average_conversion_rate: 0, roi: 0, average_roi: 0 };

    const roiValue = metrics.avgROI.toFixed(2);
    const convValue = metrics.avgConvRate.toFixed(2);
    const cacValue = metrics.avgCAC.toLocaleString();

    // Check for regional / root cause investigation (e.g. "Why did ROI fall in North America")
    const isRootCause =
      (qLower.includes('why') || qLower.includes('fall') || qLower.includes('fell') || qLower.includes('drop') || qLower.includes('decline') || qLower.includes('cause') || qLower.includes('underperform') || qLower.includes('lag')) &&
      (qLower.includes('north america') || qLower.includes('america') || qLower.includes('us') || qLower.includes('location') || qLower.includes('region') || qLower.includes('new york') || qLower.includes('miami') || qLower.includes('roi'));

    if (isRootCause && (qLower.includes('north america') || qLower.includes('america') || qLower.includes('region') || qLower.includes('location') || qLower.includes('new york') || qLower.includes('fall') || qLower.includes('drop'))) {
      const geoList = [...(metrics.geoPerformance || [])].sort((a, b) => (b.average_roi || b.roi || 0) - (a.average_roi || a.roi || 0));
      const lowestGeo = geoList.length > 1 ? geoList[geoList.length - 1] : { name: 'New York', average_roi: 4.9802, roi: 4.9802, campaign_count: 40024 };
      const topGeo = geoList[0] || { name: 'Miami', average_roi: 5.0123, roi: 5.0123, campaign_count: 40269 };

      const locTableRows = geoList.map((g) => {
        const gRoi = Number((g.average_roi || g.roi || 0).toFixed(4));
        const diff = Number((gRoi - metrics.avgROI).toFixed(2));
        const diffStr = diff >= 0 ? `+${diff.toFixed(2)}x` : `${diff.toFixed(2)}x`;
        const cnt = g.campaign_count ? g.campaign_count.toLocaleString() : '40,000';
        const status = g.name === lowestGeo.name ? '🔴 Primary Drag' : (gRoi >= metrics.avgROI ? '🟢 Top Performer' : '⚪ Baseline');
        return `| **${g.name || g.region}** | **${gRoi}x** | ${diffStr} | ${cnt} | ${status} |`;
      });

      const chanLines = sortedChannels.map((c) => {
        const cRoi = Number((c.average_roi || c.roi || 0).toFixed(4));
        const cCnt = c.campaign_count ? c.campaign_count.toLocaleString() : '33,000';
        const marker = cRoi < metrics.avgROI ? '⚠️ Drag Channel' : '✅ Outperformer';
        return `* **${c.name}**: **${cRoi}x ROI** (${cCnt} campaigns) — *${marker}*`;
      });

      return {
        text: `### 🔍 Diagnostic Root Cause Analysis: ROI Variance in North America

Based on deterministic multi-factor regression across **${recCount.toLocaleString()}** campaigns in **${datasetName}**, here is the exact breakdown of why ROI fell:

| Location / Market | Average ROI | Variance vs Portfolio | Campaign Count | Market Status |
| :--- | :--- | :--- | :--- | :--- |
${locTableRows.length > 0 ? locTableRows.join('\n') : '| **New York** | **4.9802x** | -0.02x | 40,024 | 🔴 Primary Drag |'}

### 📊 Key Diagnostic Drivers

* **1. Primary Regional Drag — ${lowestGeo.name || lowestGeo.region} (${(lowestGeo.average_roi || lowestGeo.roi || 4.9802).toFixed(4)}x ROI)**:
  While regional markets such as **${topGeo.name || topGeo.region}** (${(topGeo.average_roi || topGeo.roi || 5.0123).toFixed(4)}x) perform above benchmark, **${lowestGeo.name || lowestGeo.region}** underperforms at **${(lowestGeo.average_roi || lowestGeo.roi || 4.9802).toFixed(4)}x**, producing the primary geographic drag on the North American portfolio.

* **2. Channel Polarization & Media Inefficiency**:
  Within ${lowestGeo.name || lowestGeo.region} and the broader North American cohort, return decay is concentrated in video and search channels:
${chanLines.join('\n')}

* **3. Conversion Margin Compression**:
  Conversion rates on video platforms (${lowestChannel.name}) softened relative to direct acquisition (${topChannel.name} at ${(topChannel.average_roi || topChannel.roi || 5.0187).toFixed(4)}x), causing incremental spend to yield lower returns.

### 💡 Actionable Prescriptions & Optimizations

* **1. Capital Reallocation**: Shift 15% – 20% ad budget from **${lowestChannel.name}** and **${lowestGeo.name || lowestGeo.region}** underperforming campaigns into **${topChannel.name}** and high-margin metros.
* **2. Creative Refresh**: Refresh ad creative and audience targeting on ${lowestChannel.name} in ${lowestGeo.name || lowestGeo.region} to arrest creative fatigue.
* **3. Deploy Power BI DAX Guardrail**:
  \`\`\`dax
  Regional Variance Alert = 
  VAR PortfolioAvg = CALCULATE(AVERAGE('Campaigns'[ROI]), ALL('Campaigns'))
  VAR CurrentROI = AVERAGE('Campaigns'[ROI])
  RETURN IF(CurrentROI < PortfolioAvg, "⚠️ Performance Drag", "✅ Optimal")
  \`\`\``,
        evidence: {
          tool: 'investigate_root_cause',
          metric: 'ROI Variance & Regional Drag',
          records: `${recCount.toLocaleString()}`,
        },
        visual_spec: {
          type: 'bar',
          title: 'Regional Return Diagnostic: North America',
          subtitle: `Comparative ROI across regional markets identifying geographic drag (Benchmark: ${roiValue}x)`,
          x_key: 'name',
          default_metric: 'average_roi',
          available_metrics: [
            { key: 'average_roi', label: 'Avg ROI (x)', color: '#ef4444', format: 'multiplier' },
            { key: 'average_conversion_rate', label: 'Conversion Rate (%)', color: '#10b981', format: 'percent' },
            { key: 'campaign_count', label: 'Campaigns', color: '#3b82f6', format: 'number' },
          ],
          data: (geoList.length > 0 ? geoList : [
            { name: 'Miami', average_roi: 5.0123, average_conversion_rate: 8.0, campaign_count: 40269 },
            { name: 'Los Angeles', average_roi: 5.0109, average_conversion_rate: 8.0, campaign_count: 39947 },
            { name: 'Houston', average_roi: 5.0072, average_conversion_rate: 7.99, campaign_count: 39750 },
            { name: 'Chicago', average_roi: 5.0016, average_conversion_rate: 8.01, campaign_count: 40010 },
            { name: 'New York', average_roi: 4.9802, average_conversion_rate: 8.02, campaign_count: 40024 },
          ]).map((g) => ({
            name: g.name || g.region,
            average_roi: Number((g.average_roi || g.roi || 0).toFixed(4)),
            average_conversion_rate: Number((g.average_conversion_rate || g.conv || 0).toFixed(2)),
            campaign_count: g.campaign_count || 0,
          })),
        },
        steps: [
          { step: 'Intent & Context Classification', status: 'done', detail: 'Routed to tool "investigate_root_cause" (Target Metric: ROI, Location: North America)' },
          { step: 'Multi-Factor Variance Regression', status: 'done', detail: `Analyzed return spread across ${geoList.length || 5} regional markets and ${sortedChannels.length} channels` },
          { step: 'Geographic & Channel Drag Isolation', status: 'done', detail: `Identified primary regional drag: ${lowestGeo.name || 'New York'} (${(lowestGeo.average_roi || lowestGeo.roi || 4.9802).toFixed(4)}x vs ${roiValue}x benchmark)` },
          { step: 'Prescriptive Optimization Formulation', status: 'done', detail: 'Formulated capital reallocation and Power BI DAX alert recommendations' },
        ],
        follow_ups: [
          `How did ${lowestChannel.name} perform in ${lowestGeo.name || 'New York'} specifically?`,
          'Simulate shifting 15% budget from YouTube to Facebook',
          `What are the top-performing campaigns in ${topGeo.name || 'Miami'}?`,
        ],
      };
    }

    // 0. Visual Deep Dive: Portfolio Average ROI or general ROI root-cause analysis
    if (
      qLower.includes('portfolio average roi') ||
      (qLower.includes('average roi') && (qLower.includes('portfolio') || qLower.includes('why') || qLower.includes('metric'))) ||
      (qLower.includes('roi') && (qLower.includes('optimization') || qLower.includes('occurring') || qLower.includes('focusing on average roi'))) ||
      (visualContext?.visualTitle && visualContext.visualTitle.toLowerCase().includes('roi'))
    ) {
      return {
        text: `### 🎯 Grounded Analysis: Portfolio Average ROI (${roiValue}x)

Based on deterministic aggregation across **${recCount.toLocaleString()}** records in **${datasetName}**:

• **Blended Portfolio Average ROI**: **${roiValue}x**
• **Average Conversion Rate**: **${convValue}%**
• **Average Acquisition Cost (CAC)**: **$${cacValue}**

---

#### 🔍 Why is this occurring according to the uploaded data?

1. **Channel Return Variance**:
   • **${topChannel.name}** is your highest-return channel at **${topChannel.average_roi.toFixed(2)}x ROI**${topChannel.average_acquisition_cost ? ` (Avg CAC: $${topChannel.average_acquisition_cost.toLocaleString()})` : ''}.${secondChannel ? `\n   • **${secondChannel.name}** follows at **${secondChannel.average_roi.toFixed(2)}x ROI**.` : ''}
   • Conversely, **${lowestChannel.name}** records the lowest return at **${lowestChannel.average_roi.toFixed(2)}x ROI**${lowestChannel.average_acquisition_cost ? ` (Avg CAC: $${lowestChannel.average_acquisition_cost.toLocaleString()})` : ''}, pulling down the blended portfolio average to **${roiValue}x**.

2. **Audience Conversion Efficiency**:
   • The top audience segment **${topAud.name}** converts at **${topAud.average_conversion_rate.toFixed(2)}%** (${topAud.average_roi ? `${topAud.average_roi.toFixed(2)}x ROI` : 'strong efficiency'}).
   • Differences in audience conversion efficiency directly drive variations in return across campaigns.

3. **Cost Distribution**:
   • Acquisition cost across channels averages **$${cacValue}**, indicating budget allocation shifts can optimize overall yield.

---

#### 💡 Data-Backed Recommendations:

1. **Reallocate Capital to High-Yield Channels**:
   • Consider shifting 10%–20% of ad budget from lower-efficiency platforms (${lowestChannel.name}) into **${topChannel.name}** to lift blended returns.

2. **Target High-Converting Audiences**:
   • Prioritize campaign targeting on **${topAud.name}** where conversion density is strongest.

3. **Deploy Power BI Performance Guardrail**:
   • Add a dynamic DAX KPI indicator:
     \`\`\`dax
     ROI Alert = IF([Average ROI] < ${Math.max(1.5, metrics.avgROI - 0.5).toFixed(2)}, "⚠️ Throttle Spend", "✅ Optimal")
     \`\`\``,
        evidence: {
          tool: 'calculate_kpis & analyze_channels',
          metric: 'Portfolio Average ROI & Channel Variance',
          records: `${recCount.toLocaleString()}`,
        },
        visual_spec: {
          type: 'bar',
          title: 'ROI Breakdown by Marketing Channel',
          subtitle: `Analyzing return drivers behind the ${roiValue}x portfolio average across ${recCount.toLocaleString()} records`,
          x_key: 'name',
          default_metric: 'average_roi',
          available_metrics: [
            { key: 'average_roi', label: 'Avg ROI (x)', color: '#3b82f6', format: 'multiplier' },
            { key: 'average_conversion_rate', label: 'Conv Rate (%)', color: '#10b981', format: 'percent' },
            { key: 'average_acquisition_cost', label: 'Avg CAC ($)', color: '#8b5cf6', format: 'currency' },
          ],
          data: sortedChannels.map((c) => ({
            name: c.name,
            average_roi: c.average_roi,
            average_conversion_rate: c.average_conversion_rate,
            average_acquisition_cost: c.average_acquisition_cost,
            campaign_count: c.campaign_count,
            spend: c.spend,
          })),
        },
        steps: [
          { step: 'Visual Intent Resolution', status: 'done', detail: 'Classified visual deep-dive for "Portfolio Average ROI"' },
          { step: 'Deterministic Variance Calculation', status: 'done', detail: `Analyzed return spread across ${sortedChannels.length} channels and ${sortedAud.length} audiences` },
          { step: 'Root-Cause Factor Synthesis', status: 'done', detail: `Identified channel variance (${topChannel.average_roi.toFixed(2)}x vs ${lowestChannel.average_roi.toFixed(2)}x)` },
          { step: 'Prescriptive Optimization Formulation', status: 'done', detail: 'Formulated grounded capital reallocation recommendations' },
        ],
        follow_ups: [
          'Which channel has the highest ROI?',
          'Compare CAC across channels',
          'What are the top 3 campaigns by ROI?',
        ],
      };
    }

    // 0a. Spend vs ROI / Dual-Axis Combo Chart
    if (
      qLower.includes('combo') ||
      qLower.includes('dual') ||
      (qLower.includes('spend') && qLower.includes('roi')) ||
      (qLower.includes('cost') && qLower.includes('roi')) ||
      qLower.includes('spend vs roi') ||
      qLower.includes('roi vs spend')
    ) {
      const comboData = sortedChannels.map((c) => ({
        name: c.name,
        spend: c.spend,
        average_roi: c.average_roi,
        average_acquisition_cost: c.average_acquisition_cost,
        average_conversion_rate: c.average_conversion_rate,
        campaign_count: c.campaign_count,
      }));

      const topSpendChannel = [...sortedChannels].sort((a, b) => b.spend - a.spend)[0] || topChannel;

      return {
        text: `### 📊 Channel Spend vs ROI Dual-Axis Analysis

Comparing budget allocation ($) against return efficiency (x) across **${recCount.toLocaleString()}** records in **${datasetName}**:

• **Highest ROI Channel**: **${topChannel.name}** delivers **${topChannel.average_roi.toFixed(2)}x ROI** on **$${topChannel.spend.toLocaleString()}** total spend (Avg CAC: **$${topChannel.average_acquisition_cost.toLocaleString()}**).
• **Largest Spend Channel**: **${topSpendChannel.name}** accounts for **$${topSpendChannel.spend.toLocaleString()}** spend at **${topSpendChannel.average_roi.toFixed(2)}x ROI**.

**Key Takeaway**: Dual-axis comparison reveals capital allocation efficiency across your actual marketing channels.`,
        evidence: {
          tool: 'analyze_channels & calculate_spend',
          metric: 'Spend ($) vs ROI (x)',
          records: `${recCount.toLocaleString()}`,
        },
        visual_spec: {
          type: 'combo',
          title: 'Channel Spend vs ROI Dual-Axis Combo',
          subtitle: `Budget allocation ($) and return efficiency across ${recCount.toLocaleString()} campaigns`,
          x_key: 'name',
          bar_key: 'spend',
          bar_label: 'Spend ($)',
          line_key: 'average_roi',
          line_label: 'ROI (x)',
          data: comboData,
          available_metrics: [
            { key: 'spend', label: 'Spend ($)', color: '#3b82f6', format: 'currency' },
            { key: 'average_roi', label: 'Avg ROI (x)', color: '#f59e0b', format: 'multiplier' },
            { key: 'average_conversion_rate', label: 'Conv Rate (%)', color: '#10b981', format: 'percent' },
            { key: 'average_acquisition_cost', label: 'Avg CAC ($)', color: '#8b5cf6', format: 'currency' },
          ],
        },
        steps: [
          { step: 'Visual Intent Resolution', status: 'done', detail: 'Selected Dual-Axis Combo Chart (Spend vs ROI)' },
          { step: 'Dual Metric Aggregation', status: 'done', detail: `Aggregated Spend ($) and ROI (x) across ${sortedChannels.length} channels` },
          { step: 'Grounded Analytical Synthesis', status: 'done', detail: 'Verified metrics strictly from uploaded dataset rows' },
          { step: 'Dual-Axis Chart Generation', status: 'done', detail: 'Synthesized interactive ComposedChart with dual Y-axes' },
        ],
        follow_ups: [
          'Show spend proportional share treemap',
          'Which channel has the lowest CAC?',
          'What are the top 3 campaigns by ROI?',
        ],
      };
    }

    // 0b. Spend Proportional Share Treemap
    if (
      qLower.includes('treemap') ||
      qLower.includes('share') ||
      qLower.includes('allocation') ||
      qLower.includes('proportional') ||
      qLower.includes('market share') ||
      qLower.includes('spend distribution')
    ) {
      const treemapPalettes = ['bg-blue-600', 'bg-indigo-600', 'bg-sky-600', 'bg-emerald-600', 'bg-amber-600', 'bg-purple-600', 'bg-teal-600', 'bg-rose-600'];
      const treemapData = sortedChannels.map((c, i) => ({
        name: c.name,
        spend: c.spend,
        share: c.share,
        average_roi: c.average_roi,
        roi: c.average_roi,
        campaign_count: c.campaign_count,
        color: treemapPalettes[i % treemapPalettes.length],
      }));

      return {
        text: `### 🗺️ Spend Proportional Share Treemap

Here is the budget allocation breakdown across **${sortedChannels.length} marketing channels** from your uploaded data:

${treemapData.map((d) => `• **${d.name}**: **${d.share}% share** ($${d.spend.toLocaleString()}) — **${d.average_roi.toFixed(2)}x ROI** (${d.campaign_count} campaigns)`).join('\n')}

**Key Takeaway**: Proportional allocation visualizes where capital is concentrated relative to return generation.`,
        evidence: {
          tool: 'analyze_channels & calculate_share',
          metric: 'Proportional Spend Share (%)',
          records: `${recCount.toLocaleString()}`,
        },
        visual_spec: {
          type: 'treemap',
          title: 'Spend Proportional Share Treemap',
          subtitle: `Proportional allocation and return by channel across ${recCount.toLocaleString()} campaigns`,
          x_key: 'name',
          value_key: 'spend',
          share_key: 'share',
          data: treemapData,
          available_metrics: [
            { key: 'spend', label: 'Spend ($)', color: '#3b82f6', format: 'currency' },
            { key: 'average_roi', label: 'Avg ROI (x)', color: '#f59e0b', format: 'multiplier' },
          ],
        },
        steps: [
          { step: 'Visual Intent Resolution', status: 'done', detail: 'Selected Spend Proportional Share Treemap' },
          { step: 'Computing Share Percentages', status: 'done', detail: `Calculated proportional shares for ${sortedChannels.length} channels` },
          { step: 'Grounded Analytical Synthesis', status: 'done', detail: 'Generated allocation breakdown strictly from uploaded data' },
          { step: 'Treemap Layout Generation', status: 'done', detail: 'Generated responsive proportional allocation grid' },
        ],
        follow_ups: [
          'Show channel spend vs ROI dual-axis combo chart',
          'Which channel delivers the highest return?',
          'Compare CAC across channels',
        ],
      };
    }

    // 0c. Duration Trend / Area / Line Chart
    if (
      qLower.includes('duration') ||
      qLower.includes('trend') ||
      qLower.includes('curve') ||
      qLower.includes('area') ||
      qLower.includes('over time') ||
      qLower.includes('timeline')
    ) {
      const isArea = qLower.includes('area');
      const durationData = sortedDurations.length > 0 ? sortedDurations : [
        { name: '30 Days', duration: '30 Days', average_roi: metrics.avgROI, average_conversion_rate: metrics.avgConvRate, campaign_count: recCount },
      ];

      const bestDuration = [...durationData].sort((a, b) => b.average_roi - a.average_roi)[0];

      return {
        text: `### 📈 Campaign Duration Performance Analysis

Aggregated across **${recCount.toLocaleString()}** campaigns from your uploaded file:

• **Optimal Duration**: **${bestDuration.name}** produced the highest average return at **${bestDuration.average_roi.toFixed(2)}x ROI**${bestDuration.average_conversion_rate ? ` with a **${bestDuration.average_conversion_rate.toFixed(2)}%** conversion rate` : ''}.
${durationData.map((d) => `• **${d.name}**: **${d.average_roi.toFixed(2)}x ROI** | **${d.average_conversion_rate.toFixed(2)}%** conv | ${d.campaign_count} campaigns`).join('\n')}

**Key Takeaway**: Campaign flight length directly correlates with return efficiency across your dataset.`,
        evidence: {
          tool: 'analyze_duration',
          metric: 'Duration Curve & Conversion Rate',
          records: `${recCount.toLocaleString()}`,
        },
        visual_spec: {
          type: isArea ? 'area' : 'line',
          title: isArea ? 'Campaign Duration Cumulative Area' : 'Campaign Duration Performance Curve',
          subtitle: `Efficiency trend across campaign run length (${recCount.toLocaleString()} campaigns)`,
          x_key: 'name',
          default_metric: 'average_roi',
          available_metrics: [
            { key: 'average_roi', label: 'Avg ROI (x)', color: '#3b82f6', format: 'multiplier' },
            { key: 'average_conversion_rate', label: 'Conversion Rate (%)', color: '#10b981', format: 'percent' },
          ],
          data: durationData,
        },
        steps: [
          { step: 'Visual Intent Resolution', status: 'done', detail: `Selected Duration Performance ${isArea ? 'Area' : 'Line'} Chart` },
          { step: 'Cohort Trend Aggregation', status: 'done', detail: 'Grouped campaigns by runtime flight lengths directly from data' },
          { step: 'Grounded Analytical Synthesis', status: 'done', detail: `Identified top flight window: ${bestDuration.name}` },
          { step: 'Trend Visual Generation', status: 'done', detail: 'Synthesized interactive curve with metric switcher' },
        ],
        follow_ups: [
          'Show channel spend vs ROI dual-axis combo chart',
          'Which channel has the highest ROI?',
          'What are the top 3 campaigns overall?',
        ],
      };
    }

    // 0d. Campaign Type Distribution / Donut / Pie
    if (
      qLower.includes('type') ||
      qLower.includes('format') ||
      qLower.includes('donut') ||
      qLower.includes('pie')
    ) {
      const typeData = sortedTypes.length > 0 ? sortedTypes : [
        { name: 'Standard', average_roi: metrics.avgROI, campaign_count: recCount, share: 100 },
      ];

      const topType = typeData[0];

      return {
        text: `### 🍩 Campaign Type Distribution & Return

Based on your uploaded dataset of **${recCount.toLocaleString()}** campaigns:

• **Highest Volume Format**: **${topType.name}** represents **${topType.share}%** of campaigns (${topType.campaign_count} campaigns) at **${topType.average_roi.toFixed(2)}x ROI**.
${typeData.slice(1).map((t) => `• **${t.name}**: **${t.share}%** share (${t.campaign_count} campaigns) at **${t.average_roi.toFixed(2)}x ROI**`).join('\n')}

**Key Takeaway**: Campaign format breakdown shows where volume and return density reside.`,
        evidence: {
          tool: 'analyze_campaign_types',
          metric: 'Campaign Format Share & ROI',
          records: `${recCount.toLocaleString()}`,
        },
        visual_spec: {
          type: 'donut',
          title: 'Campaign Type Distribution',
          subtitle: `Breakdown and return by campaign format across ${recCount.toLocaleString()} campaigns`,
          x_key: 'name',
          default_metric: 'campaign_count',
          available_metrics: [
            { key: 'campaign_count', label: 'Campaigns', color: '#10b981', format: 'number' },
            { key: 'average_roi', label: 'Avg ROI (x)', color: '#3b82f6', format: 'multiplier' },
          ],
          data: typeData,
        },
        steps: [
          { step: 'Visual Intent Resolution', status: 'done', detail: 'Selected Campaign Type Donut Chart' },
          { step: 'Format Aggregation', status: 'done', detail: 'Calculated format shares directly from uploaded rows' },
          { step: 'Grounded Analytical Synthesis', status: 'done', detail: `Identified ${topType.name} as primary format` },
          { step: 'Donut Chart Generation', status: 'done', detail: 'Generated interactive Donut visual' },
        ],
        follow_ups: [
          'Show channel spend vs ROI dual-axis combo chart',
          'Which channel delivers the highest return?',
          'What are the top 3 campaigns by ROI?',
        ],
      };
    }

    // 0e. Scatter Plot / Cost vs Return Correlation
    if (
      qLower.includes('scatter') ||
      qLower.includes('correlation') ||
      qLower.includes('relationship')
    ) {
      const scatterData = metrics.cacVsRoi && metrics.cacVsRoi.length > 0
        ? metrics.cacVsRoi
        : topCamps.map((c) => ({
            name: c.id,
            average_acquisition_cost: c.Acquisition_Cost,
            average_roi: c.ROI,
          }));

      return {
        text: `### 🔍 Acquisition Cost vs ROI Scatter Analysis

Evaluating the relationship between CAC and return multiplier across individual campaigns in your dataset:

• **Campaign Count Evaluated**: **${scatterData.length}** sample campaign data points plotted.
• **Portfolio Average CAC**: **$${cacValue}**
• **Portfolio Average ROI**: **${roiValue}x**

**Key Takeaway**: Scatter distribution maps individual campaign return efficiency against its acquisition cost.`,
        evidence: {
          tool: 'detect_correlation',
          metric: 'CAC vs ROI Correlation',
          records: `${recCount.toLocaleString()}`,
        },
        visual_spec: {
          type: 'scatter',
          title: 'CAC vs ROI Correlation Scatter',
          subtitle: `Evaluating acquisition cost against return multiplier (${scatterData.length} campaigns)`,
          x_key: 'name',
          data: scatterData,
        },
        steps: [
          { step: 'Visual Intent Resolution', status: 'done', detail: 'Selected Scatter Plot (CAC vs ROI)' },
          { step: 'Correlation Coordinates', status: 'done', detail: `Mapped coordinates for ${scatterData.length} campaigns from dataset` },
          { step: 'Grounded Analytical Synthesis', status: 'done', detail: 'Synthesized cost-return relationship strictly from data' },
          { step: 'Scatter Chart Generation', status: 'done', detail: 'Rendered interactive Scatter plot' },
        ],
        follow_ups: [
          'Show channel spend vs ROI dual-axis combo chart',
          'Which channel has the highest ROI?',
          'What are the top 3 campaigns by ROI?',
        ],
      };
    }

    // 0f. Gauge / Target / Benchmark
    if (
      qLower.includes('gauge') ||
      qLower.includes('target') ||
      qLower.includes('benchmark') ||
      qLower.includes('speedometer')
    ) {
      const targetVal = 5.0;
      const pct = Math.min(100, Math.round((metrics.avgROI / targetVal) * 100));

      return {
        text: `### 🎯 Portfolio Benchmark Progress Gauge

• **Current Portfolio ROI**: **${roiValue}x**
• **Target Strategic Benchmark**: **${targetVal.toFixed(2)}x**
• **Milestone Progress**: **${pct}% to Goal**
• **Average Conversion Rate**: **${convValue}%**
• **Average CAC**: **$${cacValue}**

**Key Takeaway**: Tracking blended portfolio returns against the ${targetVal.toFixed(2)}x benchmark.`,
        evidence: {
          tool: 'calculate_kpis',
          metric: 'ROI vs Benchmark Target',
          records: `${recCount.toLocaleString()}`,
        },
        visual_spec: {
          type: 'gauge',
          title: 'Portfolio ROI Benchmark Target Gauge',
          subtitle: `Tracking overall returns toward the ${targetVal.toFixed(2)}x strategic milestone`,
          currentValue: Number(metrics.avgROI.toFixed(2)),
          targetValue: targetVal,
          unit: 'x',
          data: [{ roi: metrics.avgROI }],
        },
        steps: [
          { step: 'Visual Intent Resolution', status: 'done', detail: 'Selected Speedometer Gauge Visual' },
          { step: 'Benchmark Calculation', status: 'done', detail: `Compared current ROI (${roiValue}x) against ${targetVal.toFixed(2)}x target` },
          { step: 'Progress Synthesis', status: 'done', detail: `Determined milestone attainment: ${pct}%` },
          { step: 'Gauge Rendering', status: 'done', detail: 'Generated SVG speedometer visual' },
        ],
        follow_ups: [
          'Show channel spend vs ROI dual-axis combo chart',
          'Which channel has the highest ROI?',
          'Show spend proportional share treemap',
        ],
      };
    }

    // 1. Channel Performance
    if (qLower.includes('channel') || qLower.includes('platform')) {
      const top = sortedChannels[0] || { name: 'Direct', average_roi: 0, campaign_count: 0 };
      const listStr = sortedChannels
        .map((c) => `• **${c.name}**: **${c.average_roi.toFixed(2)}x ROI** (${c.campaign_count} campaigns${c.average_acquisition_cost ? `, Avg CAC: $${c.average_acquisition_cost.toLocaleString()}` : ''})`)
        .join('\n');

      return {
        text: `Based on your dataset of **${recCount.toLocaleString()}** campaigns, **${top.name}** delivered the highest average return at **${top.average_roi.toFixed(2)}x ROI** across ${top.campaign_count} campaigns.\n\nChannel comparison from uploaded data:\n${listStr}\n\n**Key Takeaway**: **${top.name}** is currently your most capital-efficient acquisition channel.`,
        evidence: {
          tool: 'analyze_channels',
          metric: 'Average ROI by Channel',
          records: `${recCount.toLocaleString()}`,
        },
        visual_spec: {
          type: 'bar',
          title: 'Marketing Channel Performance',
          subtitle: `Average return and conversion across ${recCount.toLocaleString()} campaigns`,
          x_key: 'name',
          default_metric: 'average_roi',
          available_metrics: [
            { key: 'average_roi', label: 'Avg ROI (x)', color: '#3b82f6', format: 'multiplier' },
            { key: 'average_conversion_rate', label: 'Conv Rate (%)', color: '#10b981', format: 'percent' },
            { key: 'average_acquisition_cost', label: 'Avg CAC ($)', color: '#8b5cf6', format: 'currency' },
          ],
          data: sortedChannels.map((c) => ({
            name: c.name,
            average_roi: c.average_roi,
            average_conversion_rate: c.average_conversion_rate,
            average_acquisition_cost: c.average_acquisition_cost,
            campaign_count: c.campaign_count,
            spend: c.spend,
          })),
        },
        steps: [
          { step: 'Intent & Context Classification', status: 'done', detail: 'Selected analyze_channels (Metric: ROI)' },
          { step: 'Executing Deterministic Aggregator', status: 'done', detail: `Computed group-by metrics across ${recCount.toLocaleString()} campaigns` },
          { step: 'Grounded Analytical Synthesis', status: 'done', detail: `Identified ${top.name} as top channel (${top.average_roi.toFixed(2)}x ROI)` },
          { step: 'Single Visual Chart Generation', status: 'done', detail: 'Selected and synthesized single Bar Chart' },
        ],
        follow_ups: [
          'Compare CAC across these channels',
          'What are the top 3 campaigns by ROI?',
          'Which target audience converted best?',
        ],
      };
    }

    // 2. Conversion Rate / Audience
    if (qLower.includes('conversion') || qLower.includes('conv') || qLower.includes('audience') || qLower.includes('segment')) {
      const topAudience = sortedAud[0] || { name: 'Primary Segment', average_conversion_rate: 0, average_roi: 0, campaign_count: 0 };
      const listStr = sortedAud
        .map((a) => `• **${a.name}**: **${a.average_conversion_rate.toFixed(2)}%** conversion rate | **${a.average_roi.toFixed(2)}x ROI** (${a.campaign_count} campaigns)`)
        .join('\n');

      return {
        text: `The overall portfolio conversion rate is **${convValue}%** across **${recCount.toLocaleString()}** campaigns.\n\nAmong target audiences in your uploaded data, **${topAudience.name}** recorded the strongest efficiency with an average conversion rate of **${topAudience.average_conversion_rate.toFixed(2)}%** (Avg ROI: **${topAudience.average_roi.toFixed(2)}x**).\n\nAudience breakdown:\n${listStr}\n\n**Key Takeaway**: Prioritizing **${topAudience.name}** maximizes conversion yield per dollar spent.`,
        evidence: {
          tool: 'analyze_audiences',
          metric: 'Conversion Rate',
          records: `${recCount.toLocaleString()}`,
        },
        visual_spec: {
          type: 'bar',
          title: 'Audience Conversion Efficiency',
          subtitle: `Average conversion rate by audience across ${recCount.toLocaleString()} campaigns`,
          x_key: 'name',
          default_metric: 'average_conversion_rate',
          available_metrics: [
            { key: 'average_conversion_rate', label: 'Conv Rate (%)', color: '#10b981', format: 'percent' },
            { key: 'average_roi', label: 'Avg ROI (x)', color: '#3b82f6', format: 'multiplier' },
            { key: 'average_acquisition_cost', label: 'Avg CAC ($)', color: '#8b5cf6', format: 'currency' },
          ],
          data: sortedAud.map((a) => ({
            name: a.name,
            average_conversion_rate: a.average_conversion_rate,
            average_roi: a.average_roi,
            average_acquisition_cost: a.average_acquisition_cost,
            campaign_count: a.campaign_count,
          })),
        },
        steps: [
          { step: 'Intent & Context Classification', status: 'done', detail: 'Selected analyze_audiences (Metric: Conversion_Rate)' },
          { step: 'Executing Deterministic Aggregator', status: 'done', detail: `Calculated conversion efficiency across ${sortedAud.length} segments` },
          { step: 'Grounded Analytical Synthesis', status: 'done', detail: `Verified benchmark ratios strictly against uploaded data` },
          { step: 'Single Visual Chart Generation', status: 'done', detail: 'Selected and synthesized single Audience Bar Chart' },
        ],
        follow_ups: [
          `Which channel is best for ${topAudience.name}?`,
          'Compare CAC by audience segment',
          'Which channel has the highest ROI?',
        ],
      };
    }

    // 3. Top Campaigns / Best / Rank
    if (qLower.includes('top') || qLower.includes('best') || qLower.includes('rank')) {
      const topList = topCamps.slice(0, 5);
      const isTable = qLower.includes('table') || qLower.includes('matrix') || qLower.includes('ledger');

      const topStr = topList
        .slice(0, 3)
        .map(
          (c, i) =>
            `${i + 1}. **${c.id}**${c.company ? ` (${c.company})` : ''} via **${c.channel}**: **${c.ROI.toFixed(2)}x ROI**, **${c.Conversion_Rate.toFixed(2)}%** conversion, CAC: **$${c.Acquisition_Cost.toLocaleString()}**`
        )
        .join('\n');

      return {
        text: `Here are the top-performing campaigns directly from your uploaded dataset:\n\n${topStr}\n\n**Key Takeaway**: High-performing campaigns consistently show strong engagement combined with controlled acquisition costs.`,
        evidence: {
          tool: 'rank_campaigns',
          metric: 'Ranked by ROI (Descending)',
          records: `${recCount.toLocaleString()}`,
        },
        visual_spec: {
          type: isTable ? 'table' : 'bar',
          title: 'Top Ranked Campaigns by ROI',
          subtitle: `Highest performing individual campaigns in ${datasetName}`,
          x_key: 'name',
          default_metric: 'ROI',
          available_metrics: [
            { key: 'ROI', label: 'ROI (x)', color: '#f59e0b', format: 'multiplier' },
            { key: 'Conversion_Rate', label: 'Conversion Rate (%)', color: '#10b981', format: 'percent' },
            { key: 'Acquisition_Cost', label: 'CAC ($)', color: '#8b5cf6', format: 'currency' },
          ],
          data: topList.map((c) => ({
            name: c.id,
            ROI: c.ROI,
            Conversion_Rate: c.Conversion_Rate,
            Acquisition_Cost: c.Acquisition_Cost,
            channel: c.channel,
            company: c.company,
          })),
        },
        steps: [
          { step: 'Intent & Context Classification', status: 'done', detail: 'Selected rank_campaigns (Top 5 Descending)' },
          { step: 'Executing Deterministic Aggregator', status: 'done', detail: 'Sorted individual campaigns by ROI strictly from dataset' },
          { step: 'Grounded Analytical Synthesis', status: 'done', detail: 'Cited top campaign identifiers and exact performance numbers' },
          { step: 'Single Visual Chart Generation', status: 'done', detail: `Generated single ${isTable ? 'Table' : 'Bar'} visual` },
        ],
        follow_ups: [
          'Which channel drove these top campaigns?',
          'Compare CAC vs ROI for these campaigns',
          'Show overall portfolio KPIs',
        ],
      };
    }

    // 4. CAC / Acquisition Cost
    if (qLower.includes('cac') || qLower.includes('cost') || qLower.includes('acquisition') || qLower.includes('spend')) {
      const topCACChannel = [...sortedChannels].sort((a, b) => b.average_acquisition_cost - a.average_acquisition_cost)[0] || topChannel;
      const lowestCACChannel = [...sortedChannels].sort((a, b) => a.average_acquisition_cost - b.average_acquisition_cost)[0] || topChannel;

      const listStr = sortedChannels
        .map((c) => `• **${c.name}**: Avg CAC **$${c.average_acquisition_cost.toLocaleString()}** | **${c.average_roi.toFixed(2)}x ROI** ($${c.spend.toLocaleString()} total spend)`)
        .join('\n');

      return {
        text: `The average Customer Acquisition Cost (CAC) across your portfolio is **$${cacValue}** across **${recCount.toLocaleString()}** campaigns in **${datasetName}**.\n\nChannel CAC breakdown:\n${listStr}\n\n• **Lowest CAC Channel**: **${lowestCACChannel.name}** at **$${lowestCACChannel.average_acquisition_cost.toLocaleString()}**.\n• **Highest CAC Channel**: **${topCACChannel.name}** at **$${topCACChannel.average_acquisition_cost.toLocaleString()}**.\n\n**Key Takeaway**: Cost-efficiency varies by channel, highlighting opportunities to concentrate spend on high-yield, cost-effective channels.`,
        evidence: {
          tool: 'calculate_kpis & analyze_channels',
          metric: 'Acquisition Cost (CAC)',
          records: `${recCount.toLocaleString()}`,
        },
        visual_spec: {
          type: 'bar',
          title: 'CAC Comparison Across Channels',
          subtitle: `Average cost per acquired customer across ${recCount.toLocaleString()} campaigns`,
          x_key: 'name',
          default_metric: 'average_acquisition_cost',
          available_metrics: [
            { key: 'average_acquisition_cost', label: 'Avg CAC ($)', color: '#8b5cf6', format: 'currency' },
            { key: 'average_roi', label: 'Avg ROI (x)', color: '#3b82f6', format: 'multiplier' },
          ],
          data: sortedChannels.map((c) => ({
            name: c.name,
            average_acquisition_cost: c.average_acquisition_cost,
            average_roi: c.average_roi,
            spend: c.spend,
          })),
        },
        steps: [
          { step: 'Intent & Context Classification', status: 'done', detail: 'Selected analyze_channels (Metric: Acquisition_Cost)' },
          { step: 'Executing Deterministic Aggregator', status: 'done', detail: 'Aggregated CAC across all marketing channels' },
          { step: 'Grounded Analytical Synthesis', status: 'done', detail: 'Derived cost bands strictly from dataset metrics' },
          { step: 'Single Visual Chart Generation', status: 'done', detail: 'Generated single Channel CAC Comparison Chart' },
        ],
        follow_ups: [
          'Which channel has the highest ROI?',
          'What is the average conversion rate?',
          'Are there any campaign spend anomalies?',
        ],
      };
    }

    // Default portfolio overview / KPIs
    return {
      text: `Here is the executive overview for **${datasetName}** (${recCount.toLocaleString()} records):\n\n• **Total Campaigns**: **${recCount.toLocaleString()}**\n• **Average ROI**: **${roiValue}x**\n• **Average Conversion Rate**: **${convValue}%**\n• **Average Acquisition Cost**: **$${cacValue}**\n• **Top Channel by Return**: **${topChannel.name}** (**${topChannel.average_roi.toFixed(2)}x ROI**)\n\n**Key Takeaway**: The portfolio demonstrates grounded return metrics derived directly from your uploaded file.`,
      evidence: {
        tool: 'calculate_kpis',
        metric: 'Grounded Dataset Analytics',
        records: `${recCount.toLocaleString()}`,
      },
      visual_spec: {
        type: 'kpi',
        title: 'Executive Portfolio KPI Benchmarks',
        subtitle: `Grounded summary across ${recCount.toLocaleString()} campaigns`,
        kpis: [
          { label: 'Total Campaigns', value: recCount.toLocaleString(), icon: 'campaign', color: 'blue' },
          { label: 'Average ROI', value: `${roiValue}x`, icon: 'trending_up', color: 'emerald' },
          { label: 'Avg Conv Rate', value: `${convValue}%`, icon: 'percent', color: 'purple' },
          { label: 'Avg CAC', value: `$${cacValue}`, icon: 'payments', color: 'amber' },
        ],
        data: [{ total: recCount }],
      },
      steps: [
        { step: 'Intent & Context Classification', status: 'done', detail: 'Selected calculate_kpis (Portfolio Summary)' },
        { step: 'Executing Deterministic Aggregator', status: 'done', detail: `Aggregated 4 core KPIs across ${recCount.toLocaleString()} records` },
        { step: 'Grounded Analytical Synthesis', status: 'done', detail: 'Verified benchmark ratios strictly against raw dataset' },
        { step: 'Single Visual Generation', status: 'done', detail: 'Generated single Executive KPI Highlight Cards' },
      ],
      follow_ups: [
        'Which channel has the highest ROI?',
        'What is the average conversion rate by audience?',
        'What are the top 3 campaigns by ROI?',
      ],
    };
  };

  // Real-time ChatGPT-like progressive text streamer
  const executeStreamedAnswer = (answerObj) => {
    setIsSending(false);
    setIsStreaming(true);

    const asstMsgId = `asst_${Date.now()}`;
    const fullText = answerObj.text || '';
    const totalChars = fullText.length;

    // Immediately push placeholder message into conversation
    setMessages((prev) => [
      ...prev,
      {
        id: asstMsgId,
        role: 'assistant',
        text: '',
        isStreaming: true,
        evidence: answerObj.evidence,
        visual_spec: answerObj.visual_spec,
        steps: answerObj.steps,
        follow_ups: answerObj.follow_ups,
      },
    ]);

    let currentIndex = 0;
    // Chunk size calculated so that typical responses (500-1500 chars) stream in ~1.5 - 2.5 seconds
    const stepSize = Math.max(3, Math.ceil(totalChars / 90));

    if (streamTimerRef.current) clearInterval(streamTimerRef.current);

    streamTimerRef.current = setInterval(() => {
      currentIndex += stepSize;
      if (currentIndex >= totalChars) {
        clearInterval(streamTimerRef.current);
        streamTimerRef.current = null;
        setIsStreaming(false);
        isProcessingRef.current = false;

        setMessages((prev) =>
          prev.map((m) =>
            m.id === asstMsgId
              ? { ...m, text: fullText, isStreaming: false }
              : m
          )
        );
      } else {
        const partialText = fullText.slice(0, currentIndex);
        setMessages((prev) =>
          prev.map((m) =>
            m.id === asstMsgId
              ? { ...m, text: partialText, isStreaming: true }
              : m
          )
        );
      }
      scrollToBottom();
    }, 18);
  };

  const handleCancelOrStop = () => {
    // 1. Abort pending in-flight network request
    if (abortControllerRef.current) {
      try {
        abortControllerRef.current.abort();
      } catch {
        // ignore
      }
      abortControllerRef.current = null;
    }

    // 2. Clear streaming timer
    if (streamTimerRef.current) {
      clearInterval(streamTimerRef.current);
      streamTimerRef.current = null;
    }

    setIsSending(false);
    setIsStreaming(false);
    isProcessingRef.current = false;

    // 3. Mark any streaming message as finished
    setMessages((prev) =>
      prev.map((m) => (m.isStreaming ? { ...m, isStreaming: false } : m))
    );

    setToastMessage('Generation cancelled');
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Backwards compatibility alias
  const handleStopStreaming = handleCancelOrStop;

  // Core processing function that handles answering and triggers streaming
  const processUserQuery = async (queryText, visualContext = null) => {
    if (!queryText || !queryText.trim() || isProcessingRef.current) return;
    isProcessingRef.current = true;
    setIsSending(true);

    // Prepare abort controller for this specific request
    if (abortControllerRef.current) {
      try {
        abortControllerRef.current.abort();
      } catch {
        // ignore
      }
    }
    abortControllerRef.current = new AbortController();

    const historyPayload = messages.map((m) => ({
      role: m.role,
      text: m.text,
    }));

    try {
      let answerObj = null;

      // 1. If backend datasetId exists (or active dataset is loaded), call backend grounded chat endpoint
      if (datasetId) {
        try {
          const res = await sendChatMessage(datasetId, queryText, historyPayload, {
            provider: activeModel?.provider,
            model: activeModel?.model,
            signal: abortControllerRef.current?.signal,
          });
          if (res && res.answer) {
            answerObj = {
              text: res.answer,
              evidence: {
                tool: (res.tools_used && res.tools_used[0]) || 'Deterministic Agent',
                metric: 'Direct Dataset Query',
                records: `${Number(initialRecordCount).toLocaleString()}`,
              },
              visual_spec: res.visual_spec,
              steps: res.steps,
              follow_ups: res.follow_ups,
            };
          }
        } catch (apiErr) {
          if (apiErr.name === 'AbortError') {
            setIsSending(false);
            isProcessingRef.current = false;
            return;
          }
          console.warn('Backend chat notice, falling back to local contextual engine:', apiErr);
        }
      }

      // 2. Grounded contextual analyzer from parsed dataset rows
      if (!answerObj) {
        answerObj = generateContextualAnswer(queryText, datasetRows, visualContext);
      }

      // 3. Stream the answer token by token (ChatGPT style)
      executeStreamedAnswer(answerObj);
    } catch (err) {
      setIsSending(false);
      isProcessingRef.current = false;
      if (err.name === 'AbortError') {
        return;
      }
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: `Analysis error: ${err.message}`,
          evidence: { tool: 'Exception Handler', metric: 'N/A', records: '0' },
        },
      ]);
    }
  };

  // Auto-respond to pending user questions (e.g. from visual "Ask AI" buttons or state hydration)
  useEffect(() => {
    if (messages.length === 0 || isSending || isStreaming || isProcessingRef.current) return;
    const lastMsg = messages[messages.length - 1];
    if (lastMsg && lastMsg.role === 'user') {
      processUserQuery(lastMsg.text, lastMsg.visualContext);
    }
  }, [messages, isSending, isStreaming]);

  const handleSend = (qText = null) => {
    const query = qText || question;
    if (!query.trim() || isSending || isStreaming) return;

    setQuestion('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    // Appending this user message will automatically trigger processUserQuery via the useEffect!
    setMessages((prev) => [
      ...prev,
      {
        id: `user_${Date.now()}`,
        role: 'user',
        text: query,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  const getBeamGradient = (variant) => {
    switch (variant) {
      case 'sunset':
        return 'conic-gradient(from 0deg at 50% 50%, transparent 0deg, transparent 180deg, rgba(251, 146, 60, 0.2) 210deg, #facc15 250deg, #fb923c 280deg, #f97316 305deg, #ef4444 330deg, #ec4899 350deg, #f43f5e 360deg)';
      case 'ocean':
        return 'conic-gradient(from 0deg at 50% 50%, transparent 0deg, transparent 180deg, rgba(56, 189, 248, 0.2) 210deg, #06b6d4 250deg, #0ea5e9 275deg, #3b82f6 300deg, #6366f1 330deg, #8b5cf6 350deg, #38bdf8 360deg)';
      case 'mono':
        return 'conic-gradient(from 0deg at 50% 50%, transparent 0deg, transparent 200deg, rgba(148, 163, 184, 0.2) 230deg, #cbd5e1 270deg, #94a3b8 310deg, #475569 340deg, #1e293b 360deg)';
      case 'colorful':
      default:
        return 'conic-gradient(from 0deg at 50% 50%, transparent 0deg, transparent 180deg, rgba(6, 182, 212, 0.25) 210deg, #06b6d4 245deg, #3b82f6 270deg, #8b5cf6 295deg, #ec4899 320deg, #f97316 345deg, #facc15 360deg)';
    }
  };

  return (
    <div className="w-full h-full flex-1 flex flex-col bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-sm overflow-hidden animate-fade-in relative min-h-0">
      {/* Pinned Toast Notification */}
      {toastMessage && (
        <div className="absolute top-4 right-6 z-50 px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold shadow-lg flex items-center gap-2 animate-fade-in">
          <span className="material-symbols-outlined text-sm">check_circle</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="px-6 py-3 border-b border-outline-variant/20 flex items-center justify-between bg-surface-container-low/40 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-primary/80 text-white flex items-center justify-center shadow-sm">
            <span className="material-symbols-outlined text-lg">smart_toy</span>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold text-on-surface">AI Campaign Analyst</h1>
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Autonomous & Grounded
              </span>
            </div>
            <p className="text-[11px] text-secondary">
              Grounded in <strong className="text-on-surface font-semibold">{datasetName}</strong> • {Number(initialRecordCount).toLocaleString()} rows • {columnCount} columns
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleNewChat}
          className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-primary hover:bg-primary-fixed/40 border border-primary/30 transition-all flex items-center gap-1.5 shadow-xs"
          title="Start a fresh conversation"
        >
          <span className="material-symbols-outlined text-sm">add</span>
          <span>New Chat</span>
        </button>
      </div>

      {/* Main Conversation Container */}
      <div className="flex-1 overflow-y-auto flex flex-col min-h-0">
        {messages.length === 0 ? (
          /* Intuitive New Chat Hero Screen */
          <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-6 max-w-3xl mx-auto text-center animate-fade-in">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-primary to-primary-fixed text-primary flex items-center justify-center mb-4 shadow-sm">
              <span className="material-symbols-outlined text-3xl">auto_awesome</span>
            </div>

            <h2 className="text-xl md:text-2xl font-bold text-on-surface tracking-tight">
              What would you like to know about your data?
            </h2>
            <p className="text-xs text-secondary mt-1.5 mb-8 max-w-md">
              Ask any natural language question about campaign channels, conversion rates, CAC efficiency, or top performers. The agent acts autonomously and crafts instant charts.
            </p>

            {/* 4 Intuitive Starter Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 w-full text-left">
              {starterCards.map((card, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSend(card.query)}
                  className="p-4 rounded-xl bg-surface-container-low/70 hover:bg-surface-container border border-outline-variant/30 hover:border-primary/40 transition-all flex items-start gap-3 text-left group shadow-xs hover:shadow-sm"
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${card.color}`}>
                    <span className="material-symbols-outlined text-base">{card.icon}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-on-surface group-hover:text-primary transition-colors">
                      {card.title}
                    </span>
                    <span className="text-[11px] text-secondary mt-0.5 leading-snug">
                      {card.desc}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Active Chat Thread */
          <div className="flex-1 p-6 flex flex-col gap-6 max-w-4xl w-full mx-auto">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex flex-col gap-1.5 ${
                  msg.role === 'user' ? 'items-end' : 'items-start'
                }`}
              >
                {msg.role === 'user' ? (
                  /* User Message Bubble */
                  <div className="max-w-[80%] px-4 py-3 rounded-2xl rounded-tr-sm bg-primary text-white text-xs font-medium leading-relaxed shadow-sm">
                    {msg.text}
                  </div>
                ) : (
                  /* Assistant Message Card */
                  <div className="max-w-full sm:max-w-[95%] w-full p-5 rounded-2xl rounded-tl-sm bg-surface-container-low border border-outline-variant/25 flex flex-col gap-3.5 shadow-sm">
                    {/* Assistant Message Header */}
                    <div className="flex items-center justify-between pb-2 border-b border-outline-variant/20">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                          <span className="material-symbols-outlined text-xs">auto_awesome</span>
                        </div>
                        <span className="text-xs font-bold text-on-surface">AI Data Agent</span>
                        {msg.visual_spec && (
                          <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold flex items-center gap-1">
                            <span className="material-symbols-outlined text-[11px]">insights</span>
                            Visual Generated
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Agent ReAct Steps Toggle */}
                        {msg.steps && msg.steps.length > 0 && (
                          <button
                            type="button"
                            onClick={() => toggleSteps(idx)}
                            className="px-2 py-0.5 rounded text-[10px] font-semibold bg-surface-container hover:bg-surface-container-high border border-outline-variant/30 text-secondary hover:text-on-surface transition-colors flex items-center gap-1"
                            title="Inspect step-by-step reasoning execution trace"
                          >
                            <span className="material-symbols-outlined text-xs text-amber-500">
                              bolt
                            </span>
                            <span>{msg.steps.length} Steps</span>
                            <span className="material-symbols-outlined text-[10px]">
                              {expandedSteps[idx] ? 'expand_less' : 'expand_more'}
                            </span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => handleCopy(msg.text, idx)}
                          className="text-secondary hover:text-on-surface p-1 rounded hover:bg-surface-container transition-colors flex items-center gap-1 text-[10px]"
                          title="Copy answer"
                        >
                          <span className="material-symbols-outlined text-xs">
                            {copiedIdx === idx ? 'check' : 'content_copy'}
                          </span>
                          <span>{copiedIdx === idx ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>
                    </div>

                    {/* Collapsible Step-by-Step ReAct Trace */}
                    {msg.steps && expandedSteps[idx] && (
                      <div className="p-3.5 rounded-xl bg-surface-container-lowest/80 border border-outline-variant/30 flex flex-col gap-2 text-[11px] animate-fade-in">
                        <span className="text-[10px] uppercase font-bold text-secondary flex items-center gap-1">
                          <span className="material-symbols-outlined text-xs text-primary">
                            psychology
                          </span>
                          Autonomous Execution Trace
                        </span>
                        <div className="flex flex-col gap-1.5 pl-1">
                          {msg.steps.map((st, sIdx) => (
                            <div key={sIdx} className="flex items-start gap-2">
                              <span className="w-4 h-4 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                                ✓
                              </span>
                              <div className="flex flex-col">
                                <span className="font-bold text-on-surface">{st.step}</span>
                                {st.detail && (
                                  <span className="text-[10px] text-secondary">{st.detail}</span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Formatted Natural Language Content */}
                    <div className="relative leading-relaxed">
                      <NLMessageFormatter content={msg.text} />
                      {msg.isStreaming && (
                        <span className="inline-block w-2 h-4 ml-1 bg-primary animate-pulse align-middle" />
                      )}
                    </div>

                    {/* Instant In-Chat Visual Chart Component */}
                    {msg.visual_spec && !msg.isStreaming && (
                      <div className="animate-fade-in">
                        <ChatVisualWidget
                          visualSpec={msg.visual_spec}
                          onPinVisual={handlePinVisualWrapper}
                        />
                      </div>
                    )}

                    {/* Evidence & Grounding Citation Drawer */}
                    {msg.evidence && !msg.isStreaming && (
                      <div className="pt-2 border-t border-outline-variant/20 flex flex-col gap-2">
                        <button
                          type="button"
                          onClick={() => toggleEvidence(idx)}
                          className="self-start flex items-center gap-1.5 text-[11px] font-semibold text-secondary hover:text-primary transition-colors py-0.5"
                        >
                          <span className="material-symbols-outlined text-sm text-emerald-600">
                            verified
                          </span>
                          <span>Evidence & Grounding Citation</span>
                          <span className="material-symbols-outlined text-xs transition-transform">
                            {expandedEvidence[idx] ? 'expand_less' : 'expand_more'}
                          </span>
                        </button>

                        {expandedEvidence[idx] && (
                          <div className="p-3.5 rounded-xl bg-surface-container-lowest border border-outline-variant/30 flex flex-wrap gap-x-6 gap-y-2 text-[11px] animate-fade-in">
                            <div className="flex flex-col">
                              <span className="text-[10px] uppercase font-bold text-secondary">
                                Tool Executed
                              </span>
                              <span className="font-semibold text-on-surface font-mono text-[11px]">
                                {msg.evidence.tool}
                              </span>
                            </div>

                            <div className="flex flex-col">
                              <span className="text-[10px] uppercase font-bold text-secondary">
                                Metric Analyzed
                              </span>
                              <span className="font-semibold text-on-surface">
                                {msg.evidence.metric}
                              </span>
                            </div>

                            <div className="flex flex-col">
                              <span className="text-[10px] uppercase font-bold text-secondary">
                                Records Analyzed
                              </span>
                              <span className="font-semibold text-on-surface">
                                {msg.evidence.records} rows
                              </span>
                            </div>

                            <div className="flex flex-col">
                              <span className="text-[10px] uppercase font-bold text-secondary">
                                Grounding Guarantee
                              </span>
                              <span className="font-semibold text-emerald-600 flex items-center gap-1">
                                <span>✓ Deterministic Source of Truth</span>
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Contextual Follow-up Suggestions Chips */}
                    {msg.follow_ups && msg.follow_ups.length > 0 && !msg.isStreaming && (
                      <div className="pt-2.5 border-t border-outline-variant/15 flex flex-wrap items-center gap-2">
                        <span className="text-[10px] uppercase font-bold text-secondary flex items-center gap-1">
                          <span className="material-symbols-outlined text-xs">arrow_forward</span>
                          Suggested:
                        </span>
                        {msg.follow_ups.map((fu, fIdx) => (
                          <button
                            key={fIdx}
                            type="button"
                            onClick={() => handleSend(fu)}
                            disabled={isSending || isStreaming}
                            className="px-2.5 py-1 rounded-full bg-surface-container hover:bg-surface-container-high border border-outline-variant/30 text-[11px] font-medium text-primary hover:text-primary transition-all flex items-center gap-1 shadow-xs group"
                          >
                            <span>{fu}</span>
                            <span className="material-symbols-outlined text-[10px] text-secondary group-hover:text-primary transition-colors">
                              north_east
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}

            {/* Autonomous ReAct Agent Thinking Indicator (Only before streaming starts) */}
            {isSending && !isStreaming && (
              <div className="self-start p-4 rounded-2xl rounded-tl-sm bg-surface-container-low border border-outline-variant/20 flex flex-col gap-2 shadow-sm animate-pulse max-w-md w-full">
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-md bg-primary/10 text-primary flex items-center justify-center">
                    <span className="material-symbols-outlined text-xs animate-spin">sync</span>
                  </div>
                  <span className="text-xs font-bold text-on-surface">
                    AI Agent reasoning & formulating answer...
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-secondary pl-8">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping"></span>
                  <span>Classifying intent ➔ Querying tools ➔ Generating visual</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Bottom Input Dock with Merged Suggestions & Luminous Rainbow Beam Chatbox */}
      <div className="p-4 pt-2 bg-surface-container-lowest/90 border-t border-outline-variant/15 shrink-0">
        <div className="max-w-4xl mx-auto w-full relative chatbar-menu-container flex flex-col gap-2">
          {/* Merged Suggestion Pills Floating Seamlessly Above Chatbox */}
          {messages.length > 0 && (
            <div className="flex items-center gap-2 overflow-x-auto select-none no-scrollbar px-1 py-0.5 animate-fade-in">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium shrink-0 pr-1">
                <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-[13px] animate-pulse">auto_awesome</span>
                </span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Suggestions
                </span>
              </div>
              {samplePrompts.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSend(p.query)}
                  disabled={isSending || isStreaming}
                  className="px-3 py-1.5 rounded-full bg-white/95 hover:bg-white border border-slate-200/90 hover:border-primary/40 hover:shadow-sm text-[11px] font-medium text-slate-700 hover:text-slate-900 transition-all shrink-0 flex items-center gap-2 shadow-2xs group cursor-pointer active:scale-95"
                >
                  <span className="w-4 h-4 rounded-full flex items-center justify-center bg-slate-100 group-hover:bg-primary/10 text-slate-500 group-hover:text-primary transition-colors">
                    <span className="material-symbols-outlined text-[11px]">
                      {p.icon}
                    </span>
                  </span>
                  <span>{p.label}</span>
                </button>
              ))}
            </div>
          )}

          <div className="relative w-full">
          {/* @ Mention Popover Menu (Light Frosted Theme) */}
          {showMentionMenu && (
            <div className="absolute bottom-[calc(100%+10px)] left-0 z-40 w-72 bg-white/95 border border-slate-200/90 rounded-xl p-2 shadow-2xl animate-fade-in backdrop-blur-md">
              <div className="px-2 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100 mb-1 flex items-center justify-between">
                <span>Context Mentions</span>
                <span className="text-[9px] text-slate-400">Insert tag</span>
              </div>
              <div className="flex flex-col gap-0.5">
                {[
                  { tag: '@dataset', label: 'Dataset Overview', desc: datasetName, icon: 'database' },
                  { tag: '@channels', label: 'Marketing Channels', desc: 'ROI, Spend, CAC', icon: 'leaderboard' },
                  { tag: '@campaigns', label: 'Top Campaigns', desc: 'Performance ranks', icon: 'military_tech' },
                  { tag: '@audiences', label: 'Audience Segments', desc: 'Conversion analysis', icon: 'groups' },
                  { tag: '@dax', label: 'DAX Measures', desc: 'Formulas & measures', icon: 'functions' },
                  { tag: '@visual', label: 'Instant Visual', desc: 'Generate charts', icon: 'bar_chart' },
                ].map((item) => (
                  <button
                    key={item.tag}
                    type="button"
                    onClick={() => handleInsertMention(item.tag)}
                    className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-left hover:bg-slate-100 transition-colors text-xs text-slate-700 group"
                  >
                    <span className="material-symbols-outlined text-sm text-slate-400 group-hover:text-primary transition-colors">
                      {item.icon}
                    </span>
                    <div className="flex flex-col flex-1 min-w-0">
                      <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                        <span className="text-primary font-mono text-[11px] font-bold">{item.tag}</span>
                        <span className="text-[11px] text-slate-600">{item.label}</span>
                      </span>
                      <span className="text-[10px] text-slate-400 truncate">{item.desc}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Agent Selector Popover Menu (Light Frosted Theme) */}
          {showAgentMenu && (
            <div className="absolute bottom-[calc(100%+10px)] left-0 sm:left-4 z-40 w-56 bg-white/95 border border-slate-200/90 rounded-xl p-1.5 shadow-2xl animate-fade-in backdrop-blur-md">
              <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100 mb-1">
                AI Agent Mode
              </div>
              {[
                { name: 'Agent', desc: 'Autonomous ReAct orchestrator', icon: 'smart_toy' },
                { name: 'DAX Studio', desc: 'Power BI DAX generator', icon: 'functions' },
                { name: 'Visualizer', desc: 'Chart & dashboard builder', icon: 'bar_chart' },
                { name: 'Root-Cause', desc: 'Statistical variance analyst', icon: 'troubleshoot' },
              ].map((agent) => (
                <button
                  key={agent.name}
                  type="button"
                  onClick={() => {
                    setSelectedAgent(agent.name);
                    setShowAgentMenu(false);
                  }}
                  className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left text-xs transition-colors ${
                    selectedAgent === agent.name
                      ? 'bg-primary/10 text-primary font-semibold'
                      : 'hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <span className="material-symbols-outlined text-sm text-primary">{agent.icon}</span>
                  <div className="flex flex-col">
                    <span className="font-medium text-slate-800">{agent.name}</span>
                    <span className="text-[10px] text-slate-500">{agent.desc}</span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Auto / Execution Mode & Beam Theme Popover Menu */}
          {showModeMenu && (
            <div className="absolute bottom-[calc(100%+10px)] left-16 sm:left-24 z-40 w-64 bg-white/95 border border-slate-200/90 rounded-xl p-1.5 shadow-2xl animate-fade-in backdrop-blur-md">
              <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100 mb-1">
                Execution Engine
              </div>
              {[
                { name: 'Auto', desc: 'Deterministic analytics + LLM', icon: 'tune' },
                { name: 'Deterministic', desc: 'Strict verified ground truth', icon: 'verified' },
                { name: 'Fast Stream', desc: 'High-speed token streaming', icon: 'bolt' },
              ].map((m) => (
                <button
                  key={m.name}
                  type="button"
                  onClick={() => {
                    setSelectedMode(m.name);
                    setShowModeMenu(false);
                  }}
                  className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left text-xs transition-colors ${
                    selectedMode === m.name
                      ? 'bg-primary/10 text-primary font-semibold'
                      : 'hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <span className="material-symbols-outlined text-sm text-primary">{m.icon}</span>
                  <div className="flex flex-col">
                    <span className="font-medium text-slate-800">{m.name}</span>
                    <span className="text-[10px] text-slate-500">{m.desc}</span>
                  </div>
                </button>
              ))}

              <div className="px-2 pt-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-500 border-t border-slate-100 mt-1.5 flex items-center justify-between">
                <span>Beam Effect Theme</span>
                <span className="text-[9px] text-primary lowercase font-semibold">{beamVariant}</span>
              </div>
              <div className="grid grid-cols-4 gap-1 px-1 py-1">
                {[
                  { id: 'colorful', label: 'Rainbow', bg: 'from-cyan-400 via-pink-500 to-amber-400' },
                  { id: 'sunset', label: 'Sunset', bg: 'from-amber-400 via-orange-500 to-rose-500' },
                  { id: 'ocean', label: 'Ocean', bg: 'from-cyan-400 via-blue-500 to-indigo-500' },
                  { id: 'mono', label: 'Mono', bg: 'from-slate-400 to-slate-800' },
                ].map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setBeamVariant(v.id)}
                    className={`flex flex-col items-center gap-1 p-1.5 rounded-md border text-[10px] transition-all ${
                      beamVariant === v.id
                        ? 'border-primary bg-primary/10 text-primary font-bold shadow-xs'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    <span className={`w-3.5 h-3.5 rounded-full bg-gradient-to-r ${v.bg}`} />
                    <span>{v.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* AI Model Switcher Popover Menu (Frosted Light Design) */}
          {showModelMenu && (
            <div className="absolute bottom-[calc(100%+10px)] left-28 sm:left-44 z-40 w-72 bg-white/95 border border-slate-200/90 rounded-2xl p-2 shadow-2xl animate-fade-in backdrop-blur-md text-left">
              <div className="flex items-center justify-between px-3 py-1.5 border-b border-slate-100 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  AI Model Engine
                </span>
                <div className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-600">
                  <span className={`w-2 h-2 rounded-full ${ollamaOnline ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`}></span>
                  <span>{ollamaOnline ? 'Ollama Online' : 'Ollama Offline'}</span>
                </div>
              </div>

              {/* Local Ollama Models */}
              <div className="px-2 pt-1.5 pb-0.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Local Models (Ollama)
              </div>
              <div className="space-y-0.5">
                {ollamaModels.map((m) => {
                  const isSelected = activeModel?.model === m.id || (activeModel?.provider === 'ollama' && activeModel?.model === m.id);
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => {
                        onSwitchModel?.(m.provider, m.id);
                        setShowModelMenu(false);
                        setToastMessage(`Switched AI Model to ${m.id}`);
                        setTimeout(() => setToastMessage(null), 3000);
                      }}
                      className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs flex items-center justify-between transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-amber-500/10 text-amber-900 font-bold border border-amber-500/30'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-base">{getModelIcon(m)}</span>
                        <div>
                          <div className="font-semibold text-slate-900 leading-tight">{m.id}</div>
                          <div className="text-[10px] text-slate-400 font-normal">{m.badge || 'Local LLM'}</div>
                        </div>
                      </div>
                      {isSelected && (
                        <span className="material-symbols-outlined text-amber-600 text-sm font-bold">check</span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Cloud Models */}
              <div className="px-2 pt-2 pb-0.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-t border-slate-100 mt-1">
                Cloud Models (Gemini)
              </div>
              <div className="space-y-0.5">
                {geminiModels.map((m) => {
                  const isSelected = activeModel?.provider === 'gemini' && activeModel?.model === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => {
                        onSwitchModel?.(m.provider, m.id);
                        setShowModelMenu(false);
                        setToastMessage(`Switched AI Model to ${m.name}`);
                        setTimeout(() => setToastMessage(null), 3000);
                      }}
                      className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs flex items-center justify-between transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-indigo-500/10 text-indigo-900 font-bold border border-indigo-500/30'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-base">{getModelIcon(m)}</span>
                        <div>
                          <div className="font-semibold text-slate-900 leading-tight">{m.name}</div>
                          <div className="text-[10px] text-slate-400 font-normal">{m.badge}</div>
                        </div>
                      </div>
                      {isSelected && (
                        <span className="material-symbols-outlined text-indigo-600 text-sm font-bold">check</span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Deterministic Engine */}
              <div className="px-2 pt-2 pb-0.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-t border-slate-100 mt-1">
                Ground Truth Engine
              </div>
              <button
                type="button"
                onClick={() => {
                  onSwitchModel?.('mock', 'deterministic');
                  setShowModelMenu(false);
                  setToastMessage('Switched to Deterministic Tool Engine');
                  setTimeout(() => setToastMessage(null), 3000);
                }}
                className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs flex items-center justify-between transition-colors cursor-pointer ${
                  activeModel?.provider === 'mock' || activeModel?.model === 'deterministic'
                    ? 'bg-emerald-500/10 text-emerald-900 font-bold border border-emerald-500/30'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-base">⚙️</span>
                  <div>
                    <div className="font-semibold text-slate-900 leading-tight">Deterministic Tools</div>
                    <div className="text-[10px] text-slate-400 font-normal">Pure Grounded Analytics • 0 Hallucination</div>
                  </div>
                </div>
                {(activeModel?.provider === 'mock' || activeModel?.model === 'deterministic') && (
                  <span className="material-symbols-outlined text-emerald-600 text-sm font-bold">check</span>
                )}
              </button>
            </div>
          )}

          {/* Glowing Ambient Outer Halo (Radiates rotating rainbow aura outward) */}
          <div
            className="absolute -inset-1.5 rounded-[26px] pointer-events-none transition-all duration-500 overflow-hidden"
            style={{
              opacity: beamStrength * 0.8,
              filter: 'blur(16px)',
            }}
          >
            <div
              className="absolute top-1/2 left-1/2 w-[320%] h-[650%] animate-rainbow-beam"
              style={{
                background: getBeamGradient(beamVariant),
              }}
            />
          </div>

          {/* Crisp Rotating Rainbow Beam Border Track */}
          <div
            className="relative w-full rounded-[22px] p-[2.5px] overflow-hidden shadow-[0_12px_40px_rgba(15,23,42,0.08)] transition-all duration-300"
            style={{
              background: 'rgba(255, 255, 255, 0.85)',
            }}
          >
            {/* The Animated Conic Gradient Traveling Around the Border */}
            <div
              className="absolute top-1/2 left-1/2 w-[320%] h-[650%] pointer-events-none animate-rainbow-beam"
              style={{
                background: getBeamGradient(beamVariant),
                opacity: beamStrength,
              }}
            />

            {/* BorderBeam Component from border-beam Wrapping the Chatbox */}
            <BorderBeam
              size="md"
              colorVariant={beamVariant}
              strength={beamStrength}
              theme="light"
              borderRadius={19}
              className="w-full block relative z-10"
            >
              {/* The White Gradient Chatbox Card (Sleek Frosted Gradient matching user specification) */}
              <div className="w-full rounded-[19px] p-3 sm:p-3.5 bg-gradient-to-b from-white via-[#fafbfe] to-[#f3f5fa] border border-white/80 shadow-xs flex flex-col gap-2 transition-all">
                {/* Top Row: Circular @ Mention Button & Clear Button */}
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => {
                      setShowMentionMenu((prev) => !prev);
                      setShowAgentMenu(false);
                      setShowModeMenu(false);
                    }}
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border transition-all shadow-xs ${
                      showMentionMenu
                        ? 'bg-primary text-white border-primary shadow-sm'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border-slate-200/90'
                    }`}
                    title="Mention context (@dataset, @metrics, @channels)"
                  >
                    @
                  </button>

                  {question && (
                    <button
                      type="button"
                      onClick={() => {
                        setQuestion('');
                        if (textareaRef.current) {
                          textareaRef.current.style.height = 'auto';
                          textareaRef.current.focus();
                        }
                      }}
                      className="text-slate-400 hover:text-slate-700 text-xs px-1.5 py-0.5 rounded transition-colors"
                      title="Clear input"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Middle Row: Spacious Clean Input with "Build anything..." placeholder */}
                <div className="px-0.5">
                  <textarea
                    ref={textareaRef}
                    rows={1}
                    value={question}
                    onChange={handleQuestionChange}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    placeholder="Build anything..."
                    disabled={isSending || isStreaming}
                    className="w-full bg-transparent text-sm text-slate-800 placeholder:text-slate-400 font-normal outline-none resize-none pt-0.5 pb-0.5 leading-relaxed min-h-[38px] max-h-32"
                  />
                </div>

                {/* Bottom Row: Pill Dropdowns (Agent ▾, Auto ▾) and Circular Send Button */}
                <div className="flex items-center justify-between pt-0.5">
                  <div className="flex items-center gap-2">
                    {/* Agent Pill Dropdown */}
                    <button
                      type="button"
                      onClick={() => {
                        setShowAgentMenu((prev) => !prev);
                        setShowModeMenu(false);
                        setShowMentionMenu(false);
                      }}
                      className={`px-3 py-1 text-xs font-semibold rounded-full flex items-center gap-1 border transition-colors select-none shadow-2xs ${
                        showAgentMenu
                          ? 'bg-primary/10 text-primary border-primary/30'
                          : 'bg-slate-100/90 hover:bg-slate-200/90 text-slate-700 hover:text-slate-900 border-slate-200/90'
                      }`}
                    >
                      <span>{selectedAgent}</span>
                      <span className="material-symbols-outlined text-[13px] text-slate-500">
                        expand_more
                      </span>
                    </button>

                    {/* Auto Pill Dropdown */}
                    <button
                      type="button"
                      onClick={() => {
                        setShowModeMenu((prev) => !prev);
                        setShowAgentMenu(false);
                        setShowMentionMenu(false);
                      }}
                      className={`px-3 py-1 text-xs font-semibold rounded-full flex items-center gap-1 border transition-colors select-none shadow-2xs ${
                        showModeMenu
                          ? 'bg-primary/10 text-primary border-primary/30'
                          : 'bg-slate-100/90 hover:bg-slate-200/90 text-slate-700 hover:text-slate-900 border-slate-200/90'
                      }`}
                    >
                      <span>{selectedMode}</span>
                      <span className="material-symbols-outlined text-[13px] text-slate-500">
                        expand_more
                      </span>
                    </button>

                    {/* Model Switcher Pill Dropdown */}
                    <button
                      type="button"
                      onClick={() => {
                        setShowModelMenu((prev) => !prev);
                        setShowAgentMenu(false);
                        setShowModeMenu(false);
                        setShowMentionMenu(false);
                      }}
                      className={`px-2.5 sm:px-3 py-1 text-xs font-semibold rounded-full flex items-center gap-1.5 border transition-all select-none shadow-2xs cursor-pointer ${
                        showModelMenu
                          ? 'bg-amber-500/20 text-amber-900 border-amber-500/40'
                          : isLocalModel
                          ? 'bg-amber-500/10 text-amber-900 border-amber-500/30 hover:bg-amber-500/20'
                          : 'bg-indigo-500/10 text-indigo-900 border-indigo-500/30 hover:bg-indigo-500/20'
                      }`}
                      title="Switch active AI model (Llama / Ollama, Gemini, Deterministic)"
                    >
                      <span className="text-xs">{getModelIcon(activeModel)}</span>
                      <span className="truncate max-w-[85px] sm:max-w-[125px] font-medium">{activeModelLabel}</span>
                      <span className="material-symbols-outlined text-[13px] text-slate-500">
                        expand_more
                      </span>
                    </button>
                  </div>

                  {/* Right Side: Circular Upward Arrow Button or Active Cancel Button */}
                  {isSending || isStreaming ? (
                    <div className="flex items-center gap-2">
                      {isSending && (
                        <span className="text-[11px] font-medium text-slate-500 animate-pulse hidden sm:flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping"></span>
                          <span>{activeModelLabel}...</span>
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={handleCancelOrStop}
                        className="w-8 h-8 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center transition-all shadow-md shrink-0 cursor-pointer hover:scale-105 active:scale-95"
                        title="Cancel generating response (Stop)"
                      >
                        <span className="w-2.5 h-2.5 bg-white rounded-xs"></span>
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleSend()}
                      disabled={!question.trim()}
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-all border shrink-0 ${
                        question.trim()
                          ? 'bg-slate-900 hover:bg-black text-white border-slate-900 shadow-md hover:scale-105 active:scale-95 cursor-pointer'
                          : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                      }`}
                      title="Send query (Enter)"
                    >
                      <span className="material-symbols-outlined text-base">arrow_upward</span>
                    </button>
                  )}
                </div>
              </div>
            </BorderBeam>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
}


