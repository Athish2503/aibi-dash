import React from 'react';

export default function Sidebar({
  currentStage,
  onSelectStage,
  hasDataset = false,
  hasPlan = false,
  hasArtifacts = false,
  datasetName = null,
  isCollapsed = false,
}) {
  const navItems = [
    { id: 1, label: 'Overview', icon: 'home', unlocked: true },
    { id: 2, label: 'Dataset', icon: 'folder', unlocked: hasDataset },
    { id: 4, label: 'Generate', icon: 'settings', unlocked: hasDataset },
    { id: 6, label: 'Dashboard', icon: 'bar_chart', unlocked: hasArtifacts || hasPlan },
    { id: 7, label: 'AI Analyst', icon: 'smart_toy', unlocked: hasDataset },
    { id: 8, label: 'DAX Studio', icon: 'functions', unlocked: hasDataset },
    { id: 9, label: 'Benchmark', icon: 'compare_arrows', unlocked: true },
  ];

  return (
    <aside
      className={`fixed left-0 top-14 bottom-0 bg-surface-container-lowest border-r border-outline-variant/30 flex flex-col justify-between p-3 select-none z-40 transition-all duration-300 ${
        isCollapsed ? 'w-16' : 'w-60'
      }`}
    >
      <div className="flex flex-col gap-6">
        {!isCollapsed && (
          <div className="px-2 font-bold text-sm text-primary tracking-wider uppercase animate-fade-in">
            AI BI
          </div>
        )}

        {/* Navigation items */}
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive =
              currentStage === item.id ||
              (item.id === 4 && currentStage === 3) ||
              (item.id === 6 && currentStage === 5);
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => item.unlocked && onSelectStage(item.id)}
                disabled={!item.unlocked}
                title={isCollapsed ? item.label : undefined}
                className={`w-full flex items-center rounded-xl text-xs font-semibold transition-all ${
                  isCollapsed ? 'justify-center p-2.5' : 'gap-3 px-3 py-2.5 text-left'
                } ${
                  isActive
                    ? 'bg-primary text-white shadow-sm'
                    : item.unlocked
                    ? 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
                    : 'text-on-surface-variant/40 cursor-not-allowed'
                }`}
              >
                <span className="material-symbols-outlined text-base shrink-0">
                  {item.icon}
                </span>
                {!isCollapsed && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Current Dataset Status */}
      <div className={`pt-4 border-t border-outline-variant/20 flex flex-col gap-1.5 ${isCollapsed ? 'items-center px-0' : 'px-2'}`}>
        {!isCollapsed ? (
          <>
            <span className="text-[10px] font-bold uppercase tracking-wider text-secondary">
              Current Dataset
            </span>
            <div className="text-xs font-semibold text-on-surface truncate">
              {datasetName || 'No dataset loaded'}
            </div>
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-600">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>{datasetName ? 'Ready' : 'Awaiting upload'}</span>
            </div>
          </>
        ) : (
          <div
            className="w-8 h-8 rounded-lg bg-surface-container-low flex items-center justify-center text-emerald-600 cursor-pointer"
            title={`Dataset: ${datasetName || 'None'}`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          </div>
        )}
      </div>
    </aside>
  );
}
