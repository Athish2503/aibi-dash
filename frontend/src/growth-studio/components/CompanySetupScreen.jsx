import React, { useState } from 'react';
import { DEFAULT_DEMO_COMPANY } from '../data/mockStudioData';

/**
 * CompanySetupScreen - Screen 2 of 10 in AI Growth Strategy Studio
 * Multi-step progressive disclosure form with clean cards, grouping, and progress indicator.
 */
export default function CompanySetupScreen({ companyData, onUpdateCompany, onNext, onBack }) {
  const [subStep, setSubStep] = useState(1); // 1: Identity & Web, 2: Offerings, 3: Target Reach

  const industries = [
    'Enterprise B2B Software / AI',
    'Financial Services & FinTech',
    'Healthcare & HealthTech',
    'E-Commerce & Retail Tech',
    'Cybersecurity & Infrastructure',
    'Manufacturing & Supply Chain Tech',
    'Professional Services & Consulting',
    'Other Technology / SaaS',
  ];

  const audiencePresets = [
    'Enterprise (1,000+ employees)',
    'Mid-Market (100–999 employees)',
    'SMB & Startups (<100 employees)',
    'Developers & Technical Practitioners',
    'C-Suite & Business Decision Makers',
  ];

  const geographyPresets = [
    'North America',
    'North America & Europe',
    'Global / Worldwide',
    'Europe (EMEA)',
    'Asia-Pacific (APAC)',
    'Latin America',
  ];

  const handleFieldChange = (field, value) => {
    onUpdateCompany({ ...companyData, [field]: value });
  };

  const handleLoadDemo = () => {
    onUpdateCompany(DEFAULT_DEMO_COMPANY);
  };

  const isStep1Valid = Boolean(companyData.name?.trim() && companyData.industry?.trim());
  const isStep2Valid = Boolean(companyData.description?.trim() && companyData.products?.trim());
  const isStep3Valid = Boolean(companyData.targetAudience?.trim() && companyData.targetGeography?.trim());

  return (
    <div className="max-w-3xl mx-auto py-6 px-4 md:px-6 animate-fade-in">
      {/* Top Header & Context */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
            Step 1 of 3: Discovery
          </span>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mt-1">
            Company Profile & Context
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Provide foundational information about your business to anchor analytical scoring.
          </p>
        </div>

        <button
          type="button"
          onClick={handleLoadDemo}
          className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-colors border border-slate-200 cursor-pointer"
          title="Autofill with high-growth B2B enterprise benchmark data"
        >
          <span className="material-symbols-outlined text-sm text-blue-600">bolt</span>
          <span>Fill with Sample</span>
        </button>
      </div>

      {/* Progressive Disclosure Stepper Indicator */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-3 mb-6 shadow-2xs">
        <div className="flex items-center justify-between">
          {[
            { num: 1, title: 'Identity & Web', valid: isStep1Valid },
            { num: 2, title: 'What You Offer', valid: isStep2Valid },
            { num: 3, title: 'Target Reach', valid: isStep3Valid },
          ].map((s, idx) => (
            <React.Fragment key={s.num}>
              <button
                type="button"
                onClick={() => setSubStep(s.num)}
                className={`flex items-center gap-2 text-left cursor-pointer transition-all ${
                  subStep === s.num
                    ? 'text-blue-600 font-bold'
                    : s.valid
                    ? 'text-slate-800 font-medium'
                    : 'text-slate-400 font-normal'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full text-xs flex items-center justify-center font-bold transition-all ${
                    subStep === s.num
                      ? 'bg-blue-600 text-white shadow-xs'
                      : s.valid
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {s.valid && subStep !== s.num ? (
                    <span className="material-symbols-outlined text-xs">check</span>
                  ) : (
                    s.num
                  )}
                </div>
                <span className="text-xs hidden sm:inline">{s.title}</span>
              </button>

              {idx < 2 && (
                <div
                  className={`flex-1 h-0.5 mx-2 rounded-full transition-colors ${
                    s.valid ? 'bg-emerald-300' : 'bg-slate-200'
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Step Content Cards */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 md:p-8 shadow-sm mb-6">
        {/* Sub-step 1: Identity & Web */}
        {subStep === 1 && (
          <div className="space-y-5 animate-fade-in">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-base font-semibold text-slate-900">
                1. Company Identity & Online Presence
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                How your organization is recognized in commercial search indices.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Company Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={companyData.name || ''}
                onChange={(e) => handleFieldChange('name', e.target.value)}
                placeholder="e.g. Acme Intelligence"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm text-slate-800 placeholder-slate-400 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Industry & Market Category <span className="text-red-500">*</span>
              </label>
              <select
                value={companyData.industry || ''}
                onChange={(e) => handleFieldChange('industry', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm text-slate-800 bg-white outline-none transition-all"
              >
                <option value="">Select an industry...</option>
                {industries.map((ind) => (
                  <option key={ind} value={ind}>
                    {ind}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Website URL <span className="text-slate-400 font-normal">(Domain to evaluate)</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-slate-400 material-symbols-outlined text-lg">
                  language
                </span>
                <input
                  type="url"
                  value={companyData.websiteUrl || ''}
                  onChange={(e) => handleFieldChange('websiteUrl', e.target.value)}
                  placeholder="https://yourcompany.com"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm text-slate-800 placeholder-slate-400 outline-none transition-all"
                />
              </div>
            </div>
          </div>
        )}

        {/* Sub-step 2: What You Offer */}
        {subStep === 2 && (
          <div className="space-y-5 animate-fade-in">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-base font-semibold text-slate-900">
                2. Products, Services & Core Value
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Define the core propositions to match against customer search intent and content gaps.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Company Description <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={3}
                value={companyData.description || ''}
                onChange={(e) => handleFieldChange('description', e.target.value)}
                placeholder="Briefly describe what your company does, your unique advantage, and the problems you solve..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm text-slate-800 placeholder-slate-400 outline-none transition-all resize-none"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">
                Used to evaluate topical relevance and search positioning against category competitors.
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Key Products / Services <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={companyData.products || ''}
                onChange={(e) => handleFieldChange('products', e.target.value)}
                placeholder="e.g. Autonomous Support Copilot, Ticket Deflector, Voice AI Agent"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm text-slate-800 placeholder-slate-400 outline-none transition-all"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">
                Comma-separated list of your primary product lines or service modules.
              </span>
            </div>
          </div>
        )}

        {/* Sub-step 3: Target Reach */}
        {subStep === 3 && (
          <div className="space-y-5 animate-fade-in">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-base font-semibold text-slate-900">
                3. Target Audience & Geographic Footprint
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Pinpoint who you sell to so the system can calculate economic segment value.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Target Audience / Ideal Customer Profile <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={companyData.targetAudience || ''}
                onChange={(e) => handleFieldChange('targetAudience', e.target.value)}
                placeholder="e.g. Enterprise CX Leaders, VP Customer Support, IT Operations"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm text-slate-800 placeholder-slate-400 outline-none transition-all mb-2"
              />

              <div className="flex flex-wrap gap-1.5">
                <span className="text-[11px] text-slate-500 mr-1 self-center">Suggestions:</span>
                {audiencePresets.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => handleFieldChange('targetAudience', preset)}
                    className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-[11px] text-slate-600 transition-colors border border-slate-200/80 cursor-pointer"
                  >
                    + {preset}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Target Geography <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={companyData.targetGeography || ''}
                onChange={(e) => handleFieldChange('targetGeography', e.target.value)}
                placeholder="e.g. North America & Europe"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm text-slate-800 placeholder-slate-400 outline-none transition-all mb-2"
              />

              <div className="flex flex-wrap gap-1.5">
                <span className="text-[11px] text-slate-500 mr-1 self-center">Quick pick:</span>
                {geographyPresets.map((geo) => (
                  <button
                    key={geo}
                    type="button"
                    onClick={() => handleFieldChange('targetGeography', geo)}
                    className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-[11px] text-slate-600 transition-colors border border-slate-200/80 cursor-pointer"
                  >
                    {geo}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Navigation Buttons */}
      <div className="flex items-center justify-between pt-2">
        <button
          type="button"
          onClick={() => {
            if (subStep > 1) {
              setSubStep(subStep - 1);
            } else {
              onBack();
            }
          }}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-slate-600 hover:text-slate-900 font-medium text-sm transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-base">arrow_back</span>
          <span>{subStep > 1 ? 'Previous Card' : 'Back to Welcome'}</span>
        </button>

        {subStep < 3 ? (
          <button
            type="button"
            onClick={() => setSubStep(subStep + 1)}
            disabled={subStep === 1 ? !isStep1Valid : !isStep2Valid}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none text-white font-semibold text-sm shadow-sm transition-all cursor-pointer"
          >
            <span>Next Card</span>
            <span className="material-symbols-outlined text-base">arrow_forward</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={onNext}
            disabled={!isStep3Valid}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none text-white font-semibold text-sm shadow-md shadow-blue-500/20 transition-all cursor-pointer"
          >
            <span>Continue to Objectives</span>
            <span className="material-symbols-outlined text-base">arrow_forward</span>
          </button>
        )}
      </div>
    </div>
  );
}
