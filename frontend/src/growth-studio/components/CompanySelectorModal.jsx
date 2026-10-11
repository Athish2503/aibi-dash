import React, { useState, useRef } from 'react';
import { COMPANY_PRESETS } from '../data/mockStudioData';
import { uploadAndProcessPipeline } from '../../services/api';

/**
 * CompanySelectorModal - Switch or Customize Company Context
 * 
 * Allows users to:
 * 1. Choose from diverse real-world benchmarks (B2B SaaS, FinTech, HealthTech, D2C E-Commerce, Cloud Infrastructure).
 * 2. Enter their own specific company (Name, Industry, Products, Audience, Competitors, Goals).
 * 3. Upload a CSV file or load a sample dataset with backend pipeline execution!
 */
export default function CompanySelectorModal({
  isOpen,
  onClose,
  activeCompany,
  onSelectCompany,
  uploadedDataset = null,
}) {
  const [activeTab, setActiveTab] = useState('presets'); // 'presets' | 'custom' | 'dataset'
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const fileInputRef = useRef(null);

  const [customForm, setCustomForm] = useState({
    name: '',
    industry: 'Enterprise B2B Software / AI',
    description: '',
    products: '',
    targetAudience: '',
    targetGeography: 'Global',
    competitors: '',
  });

  if (!isOpen) return null;

  const handleApplyPreset = (preset) => {
    onSelectCompany(preset);
    onClose();
  };

  const handleApplyCustom = (e) => {
    e.preventDefault();
    if (!customForm.name.trim()) return;
    const customCompany = {
      id: `custom-${Date.now()}`,
      ...customForm,
      isCustom: true,
    };
    onSelectCompany(customCompany);
    onClose();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await processFile(file);
  };

  const processFile = async (file) => {
    setIsUploading(true);
    setUploadError(null);
    try {
      // 1. Send file to real backend pipeline endpoint (/api/v1/dataset/pipeline)
      const pipelineRes = await uploadAndProcessPipeline(file);

      const rows = pipelineRes?.inspection?.sample_records || [];
      const inferredCompanyName = rows[0]?.Company || file.name.replace(/\.(csv|xlsx|xls)$/i, '');

      const datasetCompany = {
        id: `dataset-${pipelineRes.dataset_id || Date.now()}`,
        name: inferredCompanyName,
        industry: 'Multi-Channel Marketing & Sales Telemetry',
        description: `Directly ingested and verified by backend pipeline from ${file.name}.`,
        products: 'Multi-Channel Commercial Campaigns & Lead Attribution',
        targetAudience: 'Enterprise B2B vs Core Market vs High-Volume Buyers',
        targetGeography: 'Global / Multi-Region',
        competitors: 'Industry Market Averages',
        isFromUploadedDataset: true,
        datasetId: pipelineRes.dataset_id,
        pipelineData: pipelineRes,
      };

      onSelectCompany(datasetCompany, rows);
      onClose();
    } catch (err) {
      console.error('Failed to process dataset via backend:', err);
      setUploadError(err.message || 'Dataset processing failed. Please check file format.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleLoadSampleDataset = async () => {
    const sampleCsvContent = `Campaign_ID,Company,Campaign_Type,Target_Audience,Duration_Days,Channel_Used,Acquisition_Cost,ROI,Conversion_Rate,Location
CMP-101,Acme Corp,Search,Enterprise B2B,30,Google Ads,4200,4.82,8.4,North America
CMP-102,TechFlow,Social,Millennials,14,Meta Ads,3100,3.95,7.2,North America
CMP-103,CloudScale,Influencer,Tech Leaders,45,LinkedIn Ads,6400,5.10,9.1,EMEA
CMP-104,FinPrime,Display,Young Adults,21,TikTok Ads,2800,2.15,4.8,APAC
CMP-105,RetailX,Search,Retail Buyers,30,Google Ads,3900,4.60,8.1,North America
CMP-106,BioHealth,Social,Healthcare Execs,60,Meta Ads,5100,4.20,7.9,EMEA
CMP-107,EduGlobal,Search,Students,28,Google Ads,2200,3.40,6.5,APAC
CMP-108,SafeGuard,Webinar,Security Admins,15,LinkedIn Ads,4800,5.40,9.8,North America
CMP-109,LogiMove,Display,Supply Chain,35,Meta Ads,3300,3.10,5.9,Global
CMP-110,PaySwift,Search,SMB Owners,42,Google Ads,4600,4.75,8.3,North America`;

    const blob = new Blob([sampleCsvContent], { type: 'text/csv' });
    const sampleFile = new File([blob], 'marketing_campaigns.csv', { type: 'text/csv' });
    await processFile(sampleFile);
  };

  const handleApplyExistingDataset = () => {
    if (!uploadedDataset) return;
    const datasetCompany = {
      id: `dataset-${Date.now()}`,
      name: uploadedDataset.name?.replace(/\.(csv|xlsx|xls)$/i, '') || 'My Uploaded Dataset',
      industry: 'Multi-Channel Marketing & Sales Telemetry',
      description: `Telemetry and customer acquisition metrics computed directly from ${uploadedDataset.name}.`,
      products: 'Multi-Channel Commercial Campaigns & Lead Attribution',
      targetAudience: 'Top-Tier vs Mid-Market vs Self-Serve Audiences',
      targetGeography: 'North America, EMEA, APAC',
      competitors: 'Industry Benchmarks',
      isFromUploadedDataset: true,
    };
    onSelectCompany(datasetCompany, uploadedDataset.rows || []);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5 animate-scaleUp border border-slate-200 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
              <span className="material-symbols-outlined text-lg">business</span>
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm">
                Select or Customize Company Context
              </h3>
              <p className="text-[11px] text-slate-500">
                Ground the AI reasoning layer and BI calculations in your specific business
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-lg cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 gap-4 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('presets')}
            className={`pb-2 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'presets'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Diverse Industry Presets
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('custom')}
            className={`pb-2 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'custom'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Input My Own Company
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('dataset')}
            className={`pb-2 border-b-2 transition-colors cursor-pointer flex items-center gap-1 ${
              activeTab === 'dataset'
                ? 'border-emerald-600 text-emerald-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>Upload / Use CSV Data</span>
          </button>
        </div>

        {/* Tab 1: Industry Presets */}
        {activeTab === 'presets' && (
          <div className="space-y-3">
            <p className="text-xs text-slate-600">
              Select an industry archetype to observe how the AI Strategy Studio immediately adapts its telemetry, customer segments, hypotheses, and recommendations:
            </p>

            <div className="grid grid-cols-1 gap-2.5">
              {COMPANY_PRESETS.map((p) => {
                const isSelected = activeCompany?.name === p.name;
                return (
                  <div
                    key={p.id}
                    onClick={() => handleApplyPreset(p)}
                    className={`p-3.5 rounded-xl border text-xs cursor-pointer transition-all space-y-1.5 ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50/40 ring-1 ring-blue-500/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-slate-900 text-sm">{p.name}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                          {p.industry}
                        </span>
                      </div>
                      {isSelected ? (
                        <span className="text-xs font-bold text-blue-600">Active ✓</span>
                      ) : (
                        <span className="text-[11px] font-bold text-blue-600 hover:underline">Select →</span>
                      )}
                    </div>
                    <p className="text-slate-600 text-[11px] leading-relaxed line-clamp-2">
                      {p.description}
                    </p>
                    <div className="text-[10px] text-slate-500 font-mono flex flex-wrap gap-x-3 gap-y-1 pt-0.5">
                      <span><strong>Offerings:</strong> {p.products}</span>
                      <span><strong>Audience:</strong> {p.targetAudience}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 2: Custom Company Input */}
        {activeTab === 'custom' && (
          <form onSubmit={handleApplyCustom} className="space-y-3.5 text-xs">
            <p className="text-slate-600">
              Tell the system about your specific business so the AI reasoning layer and BI calculations personalize exclusively to you:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Company / Brand Name *</label>
                <input
                  type="text"
                  required
                  value={customForm.name}
                  onChange={(e) => setCustomForm({ ...customForm, name: e.target.value })}
                  placeholder="e.g. Nike, StrideHealth, ZapFlow"
                  className="w-full p-2.5 rounded-lg border border-slate-300 text-xs text-slate-900 bg-white outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Industry / Category *</label>
                <input
                  type="text"
                  required
                  value={customForm.industry}
                  onChange={(e) => setCustomForm({ ...customForm, industry: e.target.value })}
                  placeholder="e.g. E-Commerce, MedTech, B2B SaaS, Agency"
                  className="w-full p-2.5 rounded-lg border border-slate-300 text-xs text-slate-900 bg-white outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Products / Offerings *</label>
              <input
                type="text"
                required
                value={customForm.products}
                onChange={(e) => setCustomForm({ ...customForm, products: e.target.value })}
                placeholder="e.g. Eco Running Shoes, Restock Club, Training App"
                className="w-full p-2.5 rounded-lg border border-slate-300 text-xs text-slate-900 bg-white outline-none focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Target Customers / Audience *</label>
                <input
                  type="text"
                  required
                  value={customForm.targetAudience}
                  onChange={(e) => setCustomForm({ ...customForm, targetAudience: e.target.value })}
                  placeholder="e.g. Marathon Runners, High-Intent Buyers"
                  className="w-full p-2.5 rounded-lg border border-slate-300 text-xs text-slate-900 bg-white outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Main Competitors</label>
                <input
                  type="text"
                  value={customForm.competitors}
                  onChange={(e) => setCustomForm({ ...customForm, competitors: e.target.value })}
                  placeholder="e.g. Adidas, On Running, Hoka"
                  className="w-full p-2.5 rounded-lg border border-slate-300 text-xs text-slate-900 bg-white outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Brief Description / What You Do</label>
              <textarea
                rows={2}
                value={customForm.description}
                onChange={(e) => setCustomForm({ ...customForm, description: e.target.value })}
                placeholder="Brief summary of your business model and value proposition..."
                className="w-full p-2.5 rounded-lg border border-slate-300 text-xs text-slate-900 bg-white outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
              >
                Apply & Analyze My Business →
              </button>
            </div>
          </form>
        )}

        {/* Tab 3: Upload / Use CSV Data */}
        {activeTab === 'dataset' && (
          <div className="space-y-4 text-xs">
            <p className="text-slate-600">
              Upload a campaign or customer sales CSV file. The backend pipeline will clean and profile the rows, and the AI will build an evidence-backed growth strategy around your actual numbers:
            </p>

            {uploadError && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
                {uploadError}
              </div>
            )}

            {/* Hidden File Input */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx,.xls"
              className="hidden"
              onChange={handleFileChange}
            />

            {/* Drag & Drop Upload Card */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="p-6 rounded-2xl border-2 border-dashed border-slate-300 hover:border-blue-500 hover:bg-blue-50/20 transition-all flex flex-col items-center justify-center cursor-pointer space-y-2 text-center"
            >
              <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                <span className="material-symbols-outlined text-xl">upload_file</span>
              </div>
              <div className="font-bold text-slate-800 text-xs">
                {isUploading ? 'Connecting to backend & processing...' : 'Click or drop a CSV / Excel file here'}
              </div>
              <span className="text-[10px] text-slate-500">Supports multi-channel marketing, revenue, and campaign telemetry</span>
            </div>

            {/* Quick 1-Click Benchmark Button */}
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <div>
                <span className="font-bold text-slate-900 block text-xs">Don't have a file ready?</span>
                <span className="text-[11px] text-slate-500">Test with the 10-campaign multi-channel benchmark dataset ($38.4K spend)</span>
              </div>
              <button
                type="button"
                onClick={handleLoadSampleDataset}
                disabled={isUploading}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-2xs transition-all cursor-pointer inline-flex items-center gap-1 shrink-0 disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-xs">bolt</span>
                <span>{isUploading ? 'Processing...' : 'Load Sample CSV'}</span>
              </button>
            </div>

            {/* Existing Uploaded Dataset if already loaded */}
            {uploadedDataset && (
              <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200 flex items-center justify-between">
                <div>
                  <span className="font-bold text-emerald-900 block text-xs">Currently Uploaded in App:</span>
                  <span className="text-[11px] text-emerald-800 font-mono">{uploadedDataset.name} ({uploadedDataset.rows?.length || 0} records)</span>
                </div>
                <button
                  type="button"
                  onClick={handleApplyExistingDataset}
                  className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs cursor-pointer"
                >
                  Apply Existing →
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
