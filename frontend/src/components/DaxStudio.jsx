import React, { useState, useEffect } from 'react';
import {
  getDaxTemplates,
  generateDaxMeasure,
  validateDaxFormula,
} from '../services/api';

export default function DaxStudio({
  datasetId,
  availableColumns = [],
  dashboardPlan,
  onAddMeasureToPlan,
  onClose,
}) {
  const [prompt, setPrompt] = useState('');
  const [measureName, setMeasureName] = useState('Custom_Measure');
  const [measureFormat, setMeasureFormat] = useState('NUMBER');
  const [daxExpression, setDaxExpression] = useState(
    "AVERAGE('Campaigns'[ROI])"
  );
  const [description, setDescription] = useState('Calculates the average return on investment.');

  const [templates, setTemplates] = useState([]);
  const [validation, setValidation] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [addedSuccess, setAddedSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  // Load curated templates on mount
  useEffect(() => {
    async function loadTemplates() {
      try {
        const tmpls = await getDaxTemplates();
        setTemplates(tmpls);
      } catch (err) {
        console.error('Failed to load DAX templates:', err);
      }
    }
    loadTemplates();
  }, []);

  // Validate current expression
  const handleValidate = async (expr = daxExpression) => {
    setIsValidating(true);
    setErrorMessage(null);
    try {
      const res = await validateDaxFormula({
        expression: expr,
        datasetId: datasetId,
        tableName: 'Campaigns',
        availableColumns: availableColumns.length > 0 ? availableColumns : undefined,
      });
      setValidation(res);
      return res;
    } catch (err) {
      setErrorMessage(err.message || 'Validation request failed');
      return null;
    } finally {
      setIsValidating(false);
    }
  };

  // Run initial validation
  useEffect(() => {
    handleValidate(daxExpression);
  }, []);

  // AI Co-pilot generation
  const handleGenerate = async (queryText = prompt) => {
    if (!queryText.trim()) return;
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await generateDaxMeasure({
        prompt: queryText,
        datasetId: datasetId,
        tableName: 'Campaigns',
        customColumns: availableColumns.length > 0 ? availableColumns : undefined,
      });
      setMeasureName(res.name);
      setDaxExpression(res.expression);
      setDescription(res.description);
      setMeasureFormat(res.format || 'NUMBER');
      setValidation(res.validation);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to generate DAX measure');
    } finally {
      setIsLoading(false);
    }
  };

  // Insert a template
  const handleSelectTemplate = (tmpl) => {
    setMeasureName(tmpl.name.replace(/\s+/g, '_'));
    setDaxExpression(tmpl.expression);
    setDescription(tmpl.description);
    setMeasureFormat(tmpl.format || 'NUMBER');
    handleValidate(tmpl.expression);
  };

  // Add to plan
  const handleAddToModel = () => {
    if (!validation?.is_valid) {
      setErrorMessage('Please fix DAX syntax/schema errors before adding to the model.');
      return;
    }

    const newMeasure = {
      name: measureName,
      column: validation.referenced_columns[0] || 'ROI',
      aggregation: 'AVG',
      dax_expression: daxExpression,
      format: measureFormat,
      description: description,
    };

    if (onAddMeasureToPlan) {
      onAddMeasureToPlan(newMeasure);
      setAddedSuccess(true);
      setTimeout(() => setAddedSuccess(false), 3500);
    }
  };

  const quickPrompts = [
    'Rolling 30D Avg CAC',
    'YoY ROI Growth %',
    'Channel Spend Share %',
    'High ROI Benchmark Flag',
    'Cost Per Conversion Ratio',
  ];

  return (
    <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl shadow-xl overflow-hidden animate-fade-in flex flex-col">
      {/* Top Banner Header */}
      <div className="px-6 py-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between border-b border-indigo-800/40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300">
            <span className="material-symbols-outlined text-2xl">functions</span>
          </div>
          <div>
            <h2 className="text-lg font-bold tracking-tight flex items-center gap-2">
              Advanced DAX Formula Studio
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                AI Co-Pilot & Validator
              </span>
            </h2>
            <p className="text-xs text-slate-300">
              Formulate, validate, and inject custom DAX business logic into Power BI Semantic Model (<code className="text-indigo-200 font-mono">model.bim</code>).
            </p>
          </div>
        </div>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 flex items-center justify-center text-sm transition-all"
            title="Close DAX Studio"
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

        {/* Success Alert */}
        {addedSuccess && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between animate-fade-in">
            <div className="flex items-center gap-2 font-medium">
              <span className="material-symbols-outlined text-emerald-600 text-base">check_circle</span>
              <span>
                Measure <strong>[{measureName}]</strong> successfully added to Semantic Model! It will compile in the next Power BI bundle.
              </span>
            </div>
          </div>
        )}

        {/* AI Co-Pilot Prompt Section */}
        <div className="bg-surface-container-low border border-outline-variant/30 rounded-xl p-4 flex flex-col gap-3">
          <label className="text-xs font-bold text-on-surface flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm text-primary">psychology</span>
              AI DAX Co-pilot
            </span>
            <span className="text-[11px] font-normal text-on-surface-variant">
              Type plain English calculation requirements
            </span>
          </label>

          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
              placeholder="e.g. Calculate rolling 30-day average CAC per channel, or YoY ROI delta %..."
              className="flex-1 px-3.5 py-2 text-xs bg-surface border border-outline-variant/50 rounded-lg text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
            <button
              type="button"
              onClick={() => handleGenerate()}
              disabled={isLoading || !prompt.trim()}
              className="px-4 py-2 bg-primary text-white text-xs font-semibold rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-all flex items-center justify-center gap-1.5 shrink-0 shadow-sm"
            >
              <span className="material-symbols-outlined text-sm">
                {isLoading ? 'progress_activity' : 'auto_awesome'}
              </span>
              {isLoading ? 'Formulating...' : 'Generate DAX'}
            </button>
          </div>

          {/* Quick Prompt Pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] text-on-surface-variant font-medium">Quick Starters:</span>
            {quickPrompts.map((qp, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setPrompt(qp);
                  handleGenerate(qp);
                }}
                className="text-[11px] px-2 py-0.5 rounded-md bg-surface border border-outline-variant/30 text-on-surface-variant hover:border-primary/40 hover:text-primary transition-all"
              >
                {qp}
              </button>
            ))}
          </div>
        </div>

        {/* 2-Column Workspace: Left = Editor & Settings, Right = Live Validator & Templates */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Measure Config & Editor */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider block mb-1">
                  Measure Name
                </label>
                <input
                  type="text"
                  value={measureName}
                  onChange={(e) => setMeasureName(e.target.value.replace(/\s+/g, '_'))}
                  className="w-full px-3 py-2 text-xs font-mono font-bold bg-surface border border-outline-variant/40 rounded-lg text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider block mb-1">
                  Display Format
                </label>
                <select
                  value={measureFormat}
                  onChange={(e) => setMeasureFormat(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-surface border border-outline-variant/40 rounded-lg text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40"
                >
                  <option value="CURRENCY">Currency ($#,0.00)</option>
                  <option value="PERCENTAGE">Percentage (0.0%)</option>
                  <option value="NUMBER">Decimal Number (#,0.00)</option>
                  <option value="INTEGER">Integer (#,0)</option>
                </select>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
                  DAX Expression
                </label>
                <button
                  type="button"
                  onClick={() => handleValidate(daxExpression)}
                  disabled={isValidating}
                  className="text-[11px] text-primary font-semibold hover:underline flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-xs">sync</span>
                  {isValidating ? 'Validating...' : 'Validate Code'}
                </button>
              </div>

              {/* Code Container */}
              <div className="relative rounded-xl border border-slate-700 bg-slate-950 p-3 shadow-inner">
                <textarea
                  rows={7}
                  value={daxExpression}
                  onChange={(e) => {
                    setDaxExpression(e.target.value);
                    handleValidate(e.target.value);
                  }}
                  placeholder="Enter or edit DAX formula here..."
                  className="w-full bg-transparent text-emerald-400 font-mono text-xs focus:outline-none resize-none leading-relaxed tracking-wide selection:bg-indigo-700 selection:text-white"
                  spellCheck={false}
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider block mb-1">
                Business Description & Intent
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Explain what this metric calculates for executive stakeholders..."
                className="w-full px-3 py-2 text-xs bg-surface border border-outline-variant/40 rounded-lg text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>

            {/* Bottom Commit Action */}
            <div className="flex items-center justify-between pt-2 border-t border-outline-variant/20">
              <span className="text-[11px] text-on-surface-variant">
                Target Table: <strong className="font-mono text-on-surface">Campaigns</strong>
              </span>

              <button
                type="button"
                onClick={handleAddToModel}
                disabled={!validation?.is_valid}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-sm">library_add</span>
                Add Measure to Semantic Model
              </button>
            </div>
          </div>

          {/* Right Column: Live Validator & Curated Library */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            {/* Live Validator Card */}
            <div className="bg-surface-container-low border border-outline-variant/30 rounded-xl p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-on-surface flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm text-indigo-600">verified</span>
                  Deterministic DAX Validator
                </h3>

                {validation && (
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                      validation.is_valid
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-rose-50 text-rose-700 border-rose-200'
                    }`}
                  >
                    {validation.is_valid ? 'Valid Syntax & Schema' : 'Syntax / Schema Error'}
                  </span>
                )}
              </div>

              {validation && (
                <div className="flex flex-col gap-2.5 text-xs">
                  {/* Complexity & Tokens */}
                  <div className="flex items-center justify-between py-1.5 border-b border-outline-variant/20 text-[11px]">
                    <span className="text-on-surface-variant">Formula Complexity</span>
                    <span className="font-bold text-on-surface px-2 py-0.5 rounded bg-surface border border-outline-variant/30">
                      {validation.complexity}
                    </span>
                  </div>

                  {/* Referenced Columns */}
                  <div>
                    <span className="text-[10px] uppercase font-bold text-on-surface-variant tracking-wider block mb-1">
                      Referenced Columns
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {validation.referenced_columns?.length > 0 ? (
                        validation.referenced_columns.map((col, idx) => (
                          <span
                            key={idx}
                            className="font-mono text-[10px] px-2 py-0.5 rounded bg-surface border border-outline-variant/40 text-on-surface"
                          >
                            [{col}]
                          </span>
                        ))
                      ) : (
                        <span className="text-[11px] text-on-surface-variant/60 italic">None</span>
                      )}
                    </div>
                  </div>

                  {/* Used DAX Functions */}
                  <div>
                    <span className="text-[10px] uppercase font-bold text-on-surface-variant tracking-wider block mb-1">
                      Used Functions
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {validation.used_functions?.length > 0 ? (
                        validation.used_functions.map((fn, idx) => (
                          <span
                            key={idx}
                            className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-indigo-50 border border-indigo-200 text-indigo-700 font-bold"
                          >
                            {fn}()
                          </span>
                        ))
                      ) : (
                        <span className="text-[11px] text-on-surface-variant/60 italic">None</span>
                      )}
                    </div>
                  </div>

                  {/* Errors */}
                  {validation.errors?.length > 0 && (
                    <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-[11px] flex flex-col gap-1">
                      <span className="font-bold flex items-center gap-1">
                        <span className="material-symbols-outlined text-xs text-rose-600">cancel</span>
                        Errors to resolve:
                      </span>
                      {validation.errors.map((err, idx) => (
                        <div key={idx} className="pl-3 border-l-2 border-rose-300 text-[11px]">
                          {err}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Warnings */}
                  {validation.warnings?.length > 0 && (
                    <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-[11px] flex flex-col gap-1">
                      <span className="font-bold flex items-center gap-1">
                        <span className="material-symbols-outlined text-xs text-amber-600">warning</span>
                        Best practice suggestions:
                      </span>
                      {validation.warnings.map((warn, idx) => (
                        <div key={idx} className="pl-3 border-l-2 border-amber-300 text-[11px]">
                          {warn}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Curated Templates Library */}
            <div className="bg-surface-container-low border border-outline-variant/30 rounded-xl p-4 flex flex-col gap-2">
              <h3 className="text-xs font-bold text-on-surface flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm text-secondary">collections_bookmark</span>
                Curated Marketing Templates ({templates.length})
              </h3>
              <p className="text-[11px] text-on-surface-variant">
                1-click insert pre-tested formulas:
              </p>

              <div className="flex flex-col gap-1.5 max-h-56 overflow-y-auto pr-1">
                {templates.map((tmpl) => (
                  <button
                    key={tmpl.id}
                    type="button"
                    onClick={() => handleSelectTemplate(tmpl)}
                    className="text-left p-2 rounded-lg bg-surface border border-outline-variant/30 hover:border-primary hover:bg-primary/5 transition-all flex items-center justify-between group"
                  >
                    <div>
                      <div className="text-xs font-bold text-on-surface group-hover:text-primary transition-colors">
                        {tmpl.name}
                      </div>
                      <div className="text-[10px] text-on-surface-variant truncate max-w-xs">
                        {tmpl.description}
                      </div>
                    </div>
                    <span className="material-symbols-outlined text-sm text-on-surface-variant group-hover:text-primary shrink-0">
                      arrow_forward
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
