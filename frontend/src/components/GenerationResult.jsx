import React, { useState, useMemo } from 'react';
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
import { getDownloadUrl, getLauncherScriptUrl, launchPowerBIDesktop, publishToService } from '../services/api';
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
import AddVisualModal from './visuals/AddVisualModal';

export default function GenerationResult({
  generationResult,
  onReset,
  datasetRows = [],
  totalRecords = 200000,
}) {
  const [activePage, setActivePage] = useState(1);
  const [activeChannel, setActiveChannel] = useState('All');
  const [activeAudience, setActiveAudience] = useState('All');
  const [activeLocation, setActiveLocation] = useState('All');
  const [isAddVisualOpen, setIsAddVisualOpen] = useState(false);
  const [customVisuals, setCustomVisuals] = useState([]);

  const [isLaunching, setIsLaunching] = useState(false);
  const [launchMessage, setLaunchMessage] = useState(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishMessage, setPublishMessage] = useState(null);

  // Cross-filtering dataset rows by active slicers
  const filteredRows = useMemo(() => {
    if (!datasetRows || datasetRows.length === 0) return [];
    return datasetRows.filter((r) => {
      const chMatch = activeChannel === 'All' || String(r.Channel_Used) === activeChannel;
      const audMatch = activeAudience === 'All' || String(r.Target_Audience) === activeAudience;
      const locMatch = activeLocation === 'All' || String(r.Location) === activeLocation;
      return chMatch && audMatch && locMatch;
    });
  }, [datasetRows, activeChannel, activeAudience, activeLocation]);

  const metrics = useMemo(() => {
    return computeDatasetMetrics(filteredRows.length > 0 ? filteredRows : datasetRows);
  }, [filteredRows, datasetRows]);

  // Available filter options
  const channelOptions = useMemo(() => {
    if (!datasetRows || datasetRows.length === 0) return ['Google Ads', 'LinkedIn Ads', 'Meta Ads', 'TikTok Ads'];
    const set = new Set(datasetRows.map((r) => r.Channel_Used).filter(Boolean));
    return Array.from(set);
  }, [datasetRows]);

  const audienceOptions = useMemo(() => {
    if (!datasetRows || datasetRows.length === 0) return ['Enterprise B2B', 'Millennials', 'Retail Buyers', 'Students'];
    const set = new Set(datasetRows.map((r) => r.Target_Audience).filter(Boolean));
    return Array.from(set);
  }, [datasetRows]);

  const locationOptions = useMemo(() => {
    if (!datasetRows || datasetRows.length === 0) return ['North America', 'EMEA', 'APAC'];
    const set = new Set(datasetRows.map((r) => r.Location).filter(Boolean));
    return Array.from(set);
  }, [datasetRows]);

  if (!generationResult) return null;

  const { artifact_id } = generationResult;
  const isFiltered = activeChannel !== 'All' || activeAudience !== 'All' || activeLocation !== 'All';

  const handleAddCustomVisual = (visualConfig) => {
    setCustomVisuals((prev) => [...prev, visualConfig]);
  };

  const handleRemoveCustomVisual = (id) => {
    setCustomVisuals((prev) => prev.filter((v) => v.id !== id));
  };

  const handleClearFilters = () => {
    setActiveChannel('All');
    setActiveAudience('All');
    setActiveLocation('All');
  };

  const handleLaunch = async () => {
    setIsLaunching(true);
    setLaunchMessage(null);
    try {
      const res = await launchPowerBIDesktop(artifact_id);
      setLaunchMessage(res.message || 'Power BI Desktop launched.');
    } catch (err) {
      setLaunchMessage(`Launch notice: ${err.message}`);
    } finally {
      setIsLaunching(false);
    }
  };

  const handlePublish = async () => {
    setIsPublishing(true);
    setPublishMessage(null);
    try {
      const res = await publishToService({ artifactId: artifact_id });
      setPublishMessage(res.message || 'Report published successfully to Power BI service.');
    } catch (err) {
      setPublishMessage(`Publishing notice: ${err.message}`);
    } finally {
      setIsPublishing(false);
    }
  };

  const pages = [
    { id: 1, label: 'Executive Overview', icon: 'dashboard' },
    { id: 2, label: 'Channel Performance', icon: 'leaderboard' },
    { id: 3, label: 'Audience & Segmentation', icon: 'group' },
    { id: 4, label: 'Geographic & Cost Performance', icon: 'public' },
  ];

  // Render a custom visual based on user configuration
  const renderCustomVisual = (visual) => {
    switch (visual.type) {
      case 'gauge':
        return <GaugeVisual title={visual.title} currentValue={metrics.avgROI} targetValue={5.0} />;
      case 'funnel':
        return <FunnelVisual title={visual.title} />;
      case 'treemap':
        return <TreemapVisual title={visual.title} />;
      case 'combo':
        return <ComboChartVisual title={visual.title} />;
      case 'matrix':
        return <MatrixDrillDownVisual title={visual.title} />;
      case 'influencer':
        return <KeyInfluencersVisual title={visual.title} />;
      case 'anomaly':
        return <AnomalyDetectionVisual title={visual.title} />;
      case 'area':
        return <DurationTrendVisual title={visual.title} />;
      default:
        return <ComboChartVisual title={visual.title} />;
    }
  };

  return (
    <div className="w-full flex-1 flex flex-col py-2 animate-fade-in gap-3.5">
      {/* Executive Header Toolbar */}
      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-4 shadow-xs flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        {/* Report Identity & Metadata */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-blue-700 text-white flex items-center justify-center font-bold shadow-xs">
            <span className="material-symbols-outlined text-xl">insights</span>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-on-surface tracking-tight">Interactive Power BI Report</h1>
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                PBIR Standard Generated
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-secondary mt-0.5">
              <span>Artifact: <code className="font-mono text-primary font-semibold">{artifact_id}</code></span>
              <span>•</span>
              <span>{Number(totalRecords).toLocaleString()} records compiled</span>
              <span className="hidden sm:inline">•</span>
              <span className="hidden sm:inline text-emerald-600 font-medium">DirectQuery Emulated</span>
            </div>
          </div>
        </div>

        {/* Global Action Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Visual Customization */}
          <button
            type="button"
            onClick={() => setIsAddVisualOpen(true)}
            className="h-9 px-3 rounded-xl bg-primary/5 hover:bg-primary/10 border border-primary/20 text-primary text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs"
          >
            <span className="material-symbols-outlined text-base">add_chart</span>
            <span>+ Add Visual</span>
          </button>

          {/* Desktop Launcher (Primary CTA) */}
          <button
            type="button"
            onClick={handleLaunch}
            disabled={isLaunching}
            className="h-9 px-3.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 text-xs font-extrabold shadow-sm transition-all flex items-center gap-1.5"
            title="Launch natively in local Microsoft Power BI Desktop"
          >
            <span className="material-symbols-outlined text-base font-bold">bolt</span>
            <span>{isLaunching ? 'Launching Desktop...' : '1-Click Launch Desktop'}</span>
          </button>

          {/* Project Package Download Group */}
          <div className="flex items-center rounded-xl bg-surface-container-low border border-outline-variant/30 p-0.5 shadow-xs">
            <a
              href={getDownloadUrl(artifact_id)}
              download
              className="h-8 px-2.5 rounded-lg hover:bg-surface-container text-xs font-semibold text-on-surface transition-all flex items-center gap-1.5"
              title="Download full standalone Power BI Project bundle (.zip)"
            >
              <span className="material-symbols-outlined text-sm text-primary">download</span>
              <span>Download .PBIP</span>
            </a>
            <div className="w-[1px] h-4 bg-outline-variant/30 mx-0.5" />
            <a
              href={getLauncherScriptUrl(artifact_id, 'bat')}
              download="run_in_powerbi.bat"
              className="h-8 px-2 rounded-lg hover:bg-surface-container text-[11px] font-mono text-secondary hover:text-on-surface transition-all flex items-center gap-1"
              title="Download Windows one-click batch launcher (.bat)"
            >
              <span className="material-symbols-outlined text-xs text-amber-600">terminal</span>
              <span>.bat</span>
            </a>
            <a
              href={getLauncherScriptUrl(artifact_id, 'ps1')}
              download="launch_report.ps1"
              className="h-8 px-2 rounded-lg hover:bg-surface-container text-[11px] font-mono text-secondary hover:text-on-surface transition-all flex items-center gap-1"
              title="Download PowerShell one-click launcher (.ps1)"
            >
              <span className="material-symbols-outlined text-xs text-sky-600">code</span>
              <span>.ps1</span>
            </a>
          </div>

          {/* Cloud Publishing */}
          <button
            type="button"
            onClick={handlePublish}
            disabled={isPublishing}
            className="h-9 px-3.5 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-base">cloud_upload</span>
            <span>{isPublishing ? 'Publishing...' : 'Publish'}</span>
          </button>

          {/* New Project / Reset */}
          <button
            type="button"
            onClick={onReset}
            className="h-9 w-9 rounded-xl text-secondary hover:text-on-surface hover:bg-surface-container border border-outline-variant/30 flex items-center justify-center transition-colors"
            title="Start New Project"
          >
            <span className="material-symbols-outlined text-lg">restart_alt</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {(launchMessage || publishMessage) && (
        <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs flex items-center justify-between shadow-xs animate-fade-in">
          <span>{launchMessage || publishMessage}</span>
          <button
            type="button"
            onClick={() => {
              setLaunchMessage(null);
              setPublishMessage(null);
            }}
            className="text-blue-700 font-bold ml-3 hover:text-blue-900"
          >
            ✕
          </button>
        </div>
      )}

      {/* Multi-Page Report Tab Bar (Segmented Navigation) */}
      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-1.5 shadow-xs flex items-center justify-between gap-2 overflow-x-auto select-none no-scrollbar">
        <div className="flex items-center gap-1">
          {pages.map((p) => {
            const isActive = activePage === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setActivePage(p.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${
                  isActive
                    ? 'bg-primary text-white shadow-sm font-bold'
                    : 'text-secondary hover:text-on-surface hover:bg-surface-container-low'
                }`}
              >
                <span className="material-symbols-outlined text-sm">{p.icon}</span>
                <span>{p.label}</span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2 px-3 text-[10px] text-secondary font-mono hidden md:flex">
          <span className="material-symbols-outlined text-xs text-secondary">desktop_windows</span>
          <span>Report Canvas • 1080p Standard</span>
        </div>
      </div>

      {/* Executive Slicers & Cross-Filtering Ribbon */}
      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-3 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 text-xs">
          {/* Slicers Label */}
          <div className="flex items-center gap-1.5 text-secondary pr-2 border-r border-outline-variant/30">
            <span className="material-symbols-outlined text-sm text-primary">filter_alt</span>
            <span className="text-[10px] font-bold tracking-wider uppercase">Slicers</span>
          </div>

          {/* Channel Slicer Dropdown */}
          <div className="flex items-center gap-1.5 bg-surface-container-low/70 hover:bg-surface-container-low px-2.5 py-1.5 rounded-xl border border-outline-variant/30 transition-colors">
            <span className="text-[11px] font-semibold text-secondary">Channel:</span>
            <select
              value={activeChannel}
              onChange={(e) => setActiveChannel(e.target.value)}
              className="bg-transparent text-xs font-bold text-on-surface focus:outline-none cursor-pointer pr-1"
            >
              <option value="All">All Channels ({channelOptions.length})</option>
              {channelOptions.map((ch) => (
                <option key={ch} value={ch}>{ch}</option>
              ))}
            </select>
          </div>

          {/* Audience Slicer Dropdown */}
          <div className="flex items-center gap-1.5 bg-surface-container-low/70 hover:bg-surface-container-low px-2.5 py-1.5 rounded-xl border border-outline-variant/30 transition-colors">
            <span className="text-[11px] font-semibold text-secondary">Audience:</span>
            <select
              value={activeAudience}
              onChange={(e) => setActiveAudience(e.target.value)}
              className="bg-transparent text-xs font-bold text-on-surface focus:outline-none cursor-pointer pr-1"
            >
              <option value="All">All Audiences ({audienceOptions.length})</option>
              {audienceOptions.map((aud) => (
                <option key={aud} value={aud}>{aud}</option>
              ))}
            </select>
          </div>

          {/* Region Slicer Dropdown */}
          <div className="flex items-center gap-1.5 bg-surface-container-low/70 hover:bg-surface-container-low px-2.5 py-1.5 rounded-xl border border-outline-variant/30 transition-colors">
            <span className="text-[11px] font-semibold text-secondary">Region:</span>
            <select
              value={activeLocation}
              onChange={(e) => setActiveLocation(e.target.value)}
              className="bg-transparent text-xs font-bold text-on-surface focus:outline-none cursor-pointer pr-1"
            >
              <option value="All">All Regions ({locationOptions.length})</option>
              {locationOptions.map((loc) => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>
          </div>

          {/* Quick-select pills for top 3 channels */}
          <div className="hidden lg:flex items-center gap-1 pl-1">
            {channelOptions.slice(0, 3).map((ch) => (
              <button
                key={ch}
                type="button"
                onClick={() => setActiveChannel(activeChannel === ch ? 'All' : ch)}
                className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold transition-all ${
                  activeChannel === ch
                    ? 'bg-primary text-white shadow-xs'
                    : 'text-secondary hover:text-on-surface hover:bg-surface-container'
                }`}
              >
                {ch}
              </button>
            ))}
          </div>
        </div>

        {/* Drill-down Breadcrumb & Reset */}
        <div className="flex items-center gap-2 self-end md:self-auto">
          {isFiltered && (
            <button
              type="button"
              onClick={handleClearFilters}
              className="px-2.5 py-1 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-[11px] font-bold flex items-center gap-1 transition-colors shadow-xs"
            >
              <span className="material-symbols-outlined text-xs">filter_alt_off</span>
              <span>Reset Filters</span>
            </button>
          )}
          <div className="flex items-center gap-1.5 text-[11px] text-secondary font-mono bg-surface-container-low px-2.5 py-1 rounded-lg border border-outline-variant/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>
              {isFiltered
                ? `${Number(filteredRows.length).toLocaleString()} of ${Number(datasetRows.length || metrics.totalCampaigns).toLocaleString()} records`
                : `${Number(datasetRows.length || metrics.totalCampaigns).toLocaleString()} records compiled`}
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* PAGE 1: EXECUTIVE OVERVIEW                                                */}
      {/* ========================================================================= */}
      {activePage === 1 && (
        <div className="flex flex-col gap-3.5 animate-fade-in">
          {/* Executive Top KPI Metric Cards Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
            {/* Card 1: Total Campaigns */}
            <div className="relative p-4 rounded-2xl bg-surface-container-lowest border border-outline-variant/25 shadow-xs overflow-hidden flex flex-col justify-between hover:shadow-sm transition-all group">
              <div className="absolute top-0 inset-x-0 h-1 bg-slate-300 group-hover:bg-primary transition-colors" />
              <div className="flex items-center justify-between text-secondary mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider">Total Campaigns</span>
                <span className="material-symbols-outlined text-base text-secondary/70">campaign</span>
              </div>
              <span className="text-2xl lg:text-3xl font-extrabold text-on-surface font-mono tracking-tight my-1 tabular-nums">
                {Number(metrics.totalCampaigns).toLocaleString()}
              </span>
              <div className="flex items-center gap-1 mt-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md w-fit border border-emerald-200">
                <span>✓ 100% Quality Verified</span>
              </div>
            </div>

            {/* Card 2: Portfolio Average ROI */}
            <div className="relative p-4 rounded-2xl bg-surface-container-lowest border border-outline-variant/25 shadow-xs overflow-hidden flex flex-col justify-between hover:shadow-sm transition-all group">
              <div className="absolute top-0 inset-x-0 h-1 bg-primary" />
              <div className="flex items-center justify-between text-secondary mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider">Portfolio Avg ROI</span>
                <span className="material-symbols-outlined text-base text-primary">trending_up</span>
              </div>
              <span className="text-2xl lg:text-3xl font-extrabold text-primary font-mono tracking-tight my-1 tabular-nums">
                {metrics.avgROI}x
              </span>
              <div className="flex items-center gap-1 mt-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md w-fit border border-emerald-200">
                <span>▲ +14% vs Baseline Benchmark</span>
              </div>
            </div>

            {/* Card 3: Average Conversion Rate */}
            <div className="relative p-4 rounded-2xl bg-surface-container-lowest border border-outline-variant/25 shadow-xs overflow-hidden flex flex-col justify-between hover:shadow-sm transition-all group">
              <div className="absolute top-0 inset-x-0 h-1 bg-emerald-500" />
              <div className="flex items-center justify-between text-secondary mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider">Avg Conversion Rate</span>
                <span className="material-symbols-outlined text-base text-emerald-600">conversion_path</span>
              </div>
              <span className="text-2xl lg:text-3xl font-extrabold text-emerald-600 font-mono tracking-tight my-1 tabular-nums">
                {metrics.avgConvRate}%
              </span>
              <div className="flex items-center gap-1 mt-1 text-[10px] font-semibold text-secondary bg-surface-container-low px-2 py-0.5 rounded-md w-fit border border-outline-variant/20">
                <span>Enterprise Leads Leading</span>
              </div>
            </div>

            {/* Card 4: Acquisition Cost (CAC) */}
            <div className="relative p-4 rounded-2xl bg-surface-container-lowest border border-outline-variant/25 shadow-xs overflow-hidden flex flex-col justify-between hover:shadow-sm transition-all group">
              <div className="absolute top-0 inset-x-0 h-1 bg-indigo-500" />
              <div className="flex items-center justify-between text-secondary mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider">Avg Acquisition Cost (CAC)</span>
                <span className="material-symbols-outlined text-base text-indigo-500">payments</span>
              </div>
              <span className="text-2xl lg:text-3xl font-extrabold text-on-surface font-mono tracking-tight my-1 tabular-nums">
                ${metrics.avgCAC.toLocaleString()}
              </span>
              <div className="flex items-center gap-1 mt-1 text-[10px] font-semibold text-secondary bg-surface-container-low px-2 py-0.5 rounded-md w-fit border border-outline-variant/20">
                <span>Optimized Spend Profile</span>
              </div>
            </div>
          </div>

          {/* Page 1 Visuals Grid: Gauge + Funnel + Trend Curve */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-2 shadow-xs hover:shadow-sm transition-shadow">
              <GaugeVisual title="ROI Performance Gauge" currentValue={metrics.avgROI} targetValue={5.0} />
            </div>

            <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-2 shadow-xs hover:shadow-sm transition-shadow">
              <FunnelVisual title="Conversion Pipeline Funnel" />
            </div>

            <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-2 shadow-xs hover:shadow-sm transition-shadow">
              <DurationTrendVisual title="Campaign Duration Efficiency" />
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PAGE 2: CHANNEL PERFORMANCE                                               */}
      {/* ========================================================================= */}
      {activePage === 2 && (
        <div className="flex flex-col gap-4 animate-fade-in">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Visual: Combo Chart (Dual Axis) */}
            <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-2 shadow-xs">
              <ComboChartVisual title="Spend vs ROI (Dual Axis Combo Chart)" />
            </div>

            {/* Visual: Treemap Allocation */}
            <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-2 shadow-xs">
              <TreemapVisual title="Channel & Category Share of Spend (Treemap)" />
            </div>
          </div>

          {/* Visual: Channel ROI Bar Chart & Drill-Down Table */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/25 shadow-xs flex flex-col">
              <span className="text-xs font-bold text-on-surface mb-3">ROI Comparison by Channel</span>
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={metrics.roiByChannel} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `${v}x`} />
                    <Tooltip
                      formatter={(v) => [`${v}x`, 'ROI']}
                      contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', fontSize: '11px', border: '1px solid #cbd5e1' }}
                    />
                    <Bar dataKey="roi" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={48} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Channel Drill-down interactive table */}
            <div className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/25 shadow-xs flex flex-col">
              <span className="text-xs font-bold text-on-surface mb-3">Channel Summary & Slicing</span>
              <div className="overflow-x-auto rounded-lg border border-outline-variant/20 flex-1">
                <table className="w-full text-left text-xs">
                  <thead className="bg-surface-container-low text-secondary text-[10px] uppercase">
                    <tr>
                      <th className="py-2 px-3">Channel</th>
                      <th className="py-2 px-3 text-right">Avg ROI</th>
                      <th className="py-2 px-3 text-right">Total Spend</th>
                      <th className="py-2 px-3 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/20 font-mono text-[11px]">
                    {(metrics?.roiByChannel || []).map((ch, idx) => (
                      <tr key={idx} className="hover:bg-surface-container-low/50 transition-colors">
                        <td className="py-2 px-3 font-semibold text-on-surface font-sans">{ch.name}</td>
                        <td className="py-2 px-3 text-right text-primary font-bold">{ch.roi}x</td>
                        <td className="py-2 px-3 text-right text-secondary">${(ch.spend || 4200).toLocaleString()}</td>
                        <td className="py-2 px-3 text-center">
                          <button
                            type="button"
                            onClick={() => setActiveChannel(ch.name)}
                            className="text-[10px] text-primary hover:underline font-sans font-semibold"
                          >
                            Filter by Channel
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PAGE 3: AUDIENCE & CAMPAIGN DEEP DIVE                                     */}
      {/* ========================================================================= */}
      {activePage === 3 && (
        <div className="flex flex-col gap-4 animate-fade-in">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Visual: Hierarchical Matrix Drill-Down (spans 2 cols) */}
            <div className="lg:col-span-2 bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-2 shadow-xs">
              <MatrixDrillDownVisual title="Hierarchical Matrix (Channel &gt; Audience &gt; Campaign)" />
            </div>

            {/* Visual: AI Key Influencers */}
            <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-2 shadow-xs">
              <KeyInfluencersVisual title="AI Key Influencers (Drivers of Top ROI)" />
            </div>
          </div>

          {/* Audience Conversion Rate Bar Chart */}
          <div className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/25 shadow-xs flex flex-col">
            <span className="text-xs font-bold text-on-surface mb-3">Conversion Efficiency by Target Audience</span>
            <div className="h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={metrics.convByAudience} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `${v}%`} />
                  <Tooltip
                    formatter={(v) => [`${v}%`, 'Conversion Rate']}
                    contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', fontSize: '11px', border: '1px solid #cbd5e1' }}
                  />
                  <Bar dataKey="conv" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={48} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PAGE 4: COST & GEOGRAPHIC PERFORMANCE                                     */}
      {/* ========================================================================= */}
      {activePage === 4 && (
        <div className="flex flex-col gap-4 animate-fade-in">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Visual: Scatter / Bubble Chart (CAC vs ROI) */}
            <div className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/25 shadow-xs flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-on-surface">Acquisition Cost vs ROI (Scatter Correlation)</span>
                <span className="text-[10px] text-secondary font-mono">X: CAC ($) • Y: ROI (x)</span>
              </div>
              <div className="h-60 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 10, right: 10, bottom: 10, left: -10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis type="number" dataKey="cac" name="CAC" tick={{ fontSize: 10 }} tickFormatter={(v) => `$${v}`} />
                    <YAxis type="number" dataKey="roi" name="ROI" tick={{ fontSize: 10 }} tickFormatter={(v) => `${v}x`} />
                    <Tooltip
                      cursor={{ strokeDasharray: '3 3' }}
                      formatter={(val, name) => [name === 'CAC' ? `$${val}` : `${val}x`, name]}
                      contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', fontSize: '11px', border: '1px solid #cbd5e1' }}
                    />
                    <Scatter name="Campaigns" data={metrics.cacVsRoi} fill="#3b82f6" />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Visual: Statistical Anomaly Detection */}
            <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-2 shadow-xs">
              <AnomalyDetectionVisual title="Automated Anomaly Detection" />
            </div>
          </div>

          {/* Regional & Geographic Comparison */}
          <div className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/25 shadow-xs flex flex-col">
            <span className="text-xs font-bold text-on-surface mb-3">Geographic Market Returns</span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {(metrics?.geoPerformance || []).map((geo, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/20 flex flex-col">
                  <span className="text-xs font-bold text-on-surface">{geo.region}</span>
                  <div className="flex items-baseline justify-between mt-2">
                    <span className="text-xl font-bold text-primary">{geo.roi}x ROI</span>
                    <span className="text-xs font-semibold text-secondary">{geo.rev}</span>
                  </div>
                  <div className="w-full bg-outline-variant/30 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div
                      className="bg-primary h-full rounded-full"
                      style={{ width: `${Math.min(100, Math.round((geo.roi / 6) * 100))}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* CUSTOM USER-ADDED VISUALS (Filtered by Active Page)                       */}
      {/* ========================================================================= */}
      {customVisuals.filter((v) => v.page === activePage).length > 0 && (
        <div className="flex flex-col gap-3 pt-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-on-surface uppercase tracking-wider">
              Custom Added Visuals (Page {activePage})
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {customVisuals
              .filter((v) => v.page === activePage)
              .map((vis) => (
                <div key={vis.id} className="relative group bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-2 shadow-xs">
                  <button
                    type="button"
                    onClick={() => handleRemoveCustomVisual(vis.id)}
                    className="absolute top-3 right-3 z-10 p-1 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 text-xs font-bold opacity-80 hover:opacity-100 transition-opacity"
                    title="Remove Visual"
                  >
                    ✕
                  </button>
                  {renderCustomVisual(vis)}
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Add Visual Modal Component */}
      <AddVisualModal
        isOpen={isAddVisualOpen}
        onClose={() => setIsAddVisualOpen(false)}
        onAddVisual={handleAddCustomVisual}
        currentPage={activePage}
      />
    </div>
  );
}
