import React, { useState } from 'react';

export default function AddVisualModal({
  isOpen,
  onClose,
  onAddVisual,
  currentPage = 1,
}) {
  const [visualType, setVisualType] = useState('combo');
  const [title, setTitle] = useState('');
  const [targetPage, setTargetPage] = useState(currentPage);

  if (!isOpen) return null;

  const visualTypes = [
    { id: 'combo', label: 'Combo Chart (Dual Axis)', icon: 'insert_chart', desc: 'Bar for spend + line for ROI on dual axes' },
    { id: 'gauge', label: 'Target Progress Gauge', icon: 'speed', desc: 'Circular meter tracking metric against goal' },
    { id: 'funnel', label: 'Conversion Funnel', icon: 'filter_alt', desc: 'Sequential drop-off conversion pipeline' },
    { id: 'treemap', label: 'Treemap Distribution', icon: 'grid_view', desc: 'Proportional hierarchical spend boxes' },
    { id: 'matrix', label: 'Hierarchical Matrix', icon: 'table_chart', desc: 'Pivoting expandable multi-level table' },
    { id: 'influencer', label: 'AI Key Influencers', icon: 'psychology', desc: 'Factor driver analysis for top returns' },
    { id: 'anomaly', label: 'Anomaly Detection', icon: 'warning', desc: 'Statistical outlier and variance flags' },
    { id: 'area', label: 'Duration Trend Area', icon: 'area_chart', desc: 'Continuous curve across durations' },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    const selectedMeta = visualTypes.find((v) => v.id === visualType);
    const finalTitle = title.trim() || selectedMeta?.label || 'Custom Visual';

    onAddVisual({
      id: `custom-visual-${Date.now()}`,
      type: visualType,
      title: finalTitle,
      page: Number(targetPage),
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-fade-in">
      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6 max-w-xl w-full shadow-lg flex flex-col gap-5 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-outline-variant/20">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-base">add_chart</span>
            </div>
            <div>
              <h2 className="text-sm font-bold text-on-surface">Add Visual to Report</h2>
              <p className="text-[11px] text-secondary">Select from native Power BI visualizations</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-surface-container text-secondary hover:text-on-surface text-sm"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Visual Type Picker Grid */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-on-surface">Visualization Type</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {visualTypes.map((vt) => {
                const isSelected = visualType === vt.id;
                return (
                  <button
                    key={vt.id}
                    type="button"
                    onClick={() => {
                      setVisualType(vt.id);
                      if (!title) setTitle(vt.label);
                    }}
                    className={`p-3 rounded-xl border text-left transition-all flex items-start gap-2.5 ${
                      isSelected
                        ? 'border-primary bg-primary-fixed/20 shadow-xs'
                        : 'border-outline-variant/30 bg-surface-container-low hover:bg-surface-container'
                    }`}
                  >
                    <span className={`material-symbols-outlined text-lg ${isSelected ? 'text-primary' : 'text-secondary'}`}>
                      {vt.icon}
                    </span>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-on-surface">{vt.label}</span>
                      <span className="text-[10px] text-secondary mt-0.5 leading-tight">{vt.desc}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Title input */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-on-surface">Visual Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Campaign ROI & Cost Performance"
              className="px-3.5 py-2.5 rounded-xl bg-surface-container-low border border-outline-variant/30 text-xs text-on-surface placeholder:text-secondary focus:outline-none focus:border-primary"
            />
          </div>

          {/* Target Page Selector */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-on-surface">Target Dashboard Page</label>
            <select
              value={targetPage}
              onChange={(e) => setTargetPage(Number(e.target.value))}
              className="px-3.5 py-2.5 rounded-xl bg-surface-container-low border border-outline-variant/30 text-xs text-on-surface focus:outline-none focus:border-primary"
            >
              <option value={1}>Page 1: Executive Overview</option>
              <option value={2}>Page 2: Channel Performance</option>
              <option value={3}>Page 3: Audience & Campaign Deep Dive</option>
              <option value={4}>Page 4: Cost & Geographic Performance</option>
            </select>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-outline-variant/20 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-secondary hover:text-on-surface"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-sm">add</span>
              <span>Add to Dashboard</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
