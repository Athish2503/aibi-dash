import React from 'react';

export default function Navbar({ health, isSidebarCollapsed, onToggleSidebar }) {
  const isHealthy = health?.status === 'healthy';

  return (
    <header className="fixed top-0 left-0 right-0 h-14 bg-surface-container-lowest z-50 border-b border-outline-variant/30 flex items-center justify-between px-4 sm:px-6">
      {/* Left: Collapse Button & Brand */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="p-1.5 rounded-lg text-secondary hover:text-on-surface hover:bg-surface-container transition-colors flex items-center justify-center"
          title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <span className="material-symbols-outlined text-xl">
            {isSidebarCollapsed ? 'menu' : 'menu_open'}
          </span>
        </button>

        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center font-bold text-sm shadow-sm">
            BI
          </div>
          <span className="font-bold text-base text-on-surface tracking-tight hidden sm:inline">
            AI Power BI Studio
          </span>
        </div>
      </div>

      {/* Engine Status */}
      <div className="flex items-center gap-2 text-xs font-medium text-on-surface-variant">
        <span className={`w-2 h-2 rounded-full ${isHealthy ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></span>
        <span>{isHealthy ? 'System Ready' : 'Connecting...'}</span>
      </div>
    </header>
  );
}
