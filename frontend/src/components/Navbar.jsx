import React, { useState, useRef, useEffect } from 'react';

export default function Navbar({
  health,
  isSidebarCollapsed,
  onToggleSidebar,
  activeModel,
  availableModels = [],
  ollamaOnline = false,
  onSwitchModel,
}) {
  const isHealthy = health?.status === 'healthy';
  const [showModelMenu, setShowModelMenu] = useState(false);
  const menuRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowModelMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Format active model label
  const activeModelObj = availableModels.find(
    (m) => m.id === activeModel?.model || m.provider === activeModel?.provider
  );
  const activeLabel = activeModel?.model || 'llama3.2:1b';
  const isLocal = activeModel?.provider === 'ollama' || activeLabel.includes('llama') || activeLabel.includes('mistral');
  const isCloud = activeModel?.provider === 'gemini';

  const getModelIcon = (m) => {
    if (m?.provider === 'ollama' || m?.family === 'llama' || (m?.id && m.id.includes('llama'))) return '🦙';
    if (m?.provider === 'gemini') return '⚡';
    if (m?.provider === 'mock' || m?.id === 'deterministic') return '⚙️';
    return '🤖';
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-14 bg-surface-container-lowest z-50 border-b border-outline-variant/30 flex items-center justify-between px-4 sm:px-6">
      {/* Left: Collapse Button & Brand */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="p-1.5 rounded-lg text-secondary hover:text-on-surface hover:bg-surface-container transition-colors flex items-center justify-center cursor-pointer"
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

      {/* Right Controls: Model Switcher & System Ready */}
      <div className="flex items-center gap-3">
        {/* Global AI Model Switcher Button & Dropdown */}
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setShowModelMenu((prev) => !prev)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-2 border transition-all cursor-pointer shadow-xs select-none ${
              isLocal
                ? 'bg-amber-500/10 text-amber-900 border-amber-500/30 hover:bg-amber-500/20'
                : isCloud
                ? 'bg-indigo-500/10 text-indigo-900 border-indigo-500/30 hover:bg-indigo-500/20'
                : 'bg-slate-100 text-slate-800 border-slate-300 hover:bg-slate-200'
            }`}
            title="Switch active AI model for Chat, Planning, DAX & Insights"
          >
            <span className="text-sm">{isLocal ? '🦙' : isCloud ? '⚡' : '⚙️'}</span>
            <span className="font-medium tracking-tight truncate max-w-[130px] sm:max-w-[160px]">
              {activeLabel}
            </span>
            <span className="px-1.5 py-0.2 rounded text-[10px] uppercase font-bold tracking-wider bg-black/5 text-slate-700">
              {isLocal ? 'Local' : isCloud ? 'Cloud' : 'Tools'}
            </span>
            <span className="material-symbols-outlined text-[15px] text-slate-500">
              {showModelMenu ? 'expand_less' : 'expand_more'}
            </span>
          </button>

          {/* Model Switcher Popover Menu */}
          {showModelMenu && (
            <div className="absolute right-0 top-full mt-2 w-72 rounded-2xl bg-white border border-slate-200 shadow-xl p-2 z-50 animate-fade-in text-left">
              <div className="flex items-center justify-between px-3 py-2 border-b border-slate-100 mb-1">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Active AI Engine
                </span>
                <div className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-600">
                  <span className={`w-2 h-2 rounded-full ${ollamaOnline ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`}></span>
                  <span>{ollamaOnline ? 'Ollama Online' : 'Ollama Offline'}</span>
                </div>
              </div>

              {/* Group: Local Ollama Models (Llama 3.2, Mistral, etc.) */}
              <div className="px-3 pt-2 pb-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Local Models (Ollama)
              </div>
              <div className="space-y-0.5">
                {(availableModels.filter((m) => m.provider === 'ollama').length > 0
                  ? availableModels.filter((m) => m.provider === 'ollama')
                  : [
                      { id: 'llama3.2:1b', name: 'llama3.2:1b (Local)', provider: 'ollama', badge: 'Llama Family' },
                      { id: 'mistral:7b', name: 'mistral:7b (Local)', provider: 'ollama', badge: 'Llama Family' },
                    ]
                ).map((m) => {
                  const isSelected = activeModel?.model === m.id || (activeModel?.provider === 'ollama' && activeModel?.model === m.id);
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => {
                        onSwitchModel?.(m.provider, m.id);
                        setShowModelMenu(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors cursor-pointer ${
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
                        <span className="material-symbols-outlined text-amber-600 text-sm font-bold">
                          check
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Group: Cloud Models (Gemini) */}
              <div className="px-3 pt-3 pb-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-t border-slate-100 mt-1">
                Cloud Models (Gemini)
              </div>
              <div className="space-y-0.5">
                {[
                  { id: 'gemini-3.6-flash', name: 'Gemini 3.6 Flash', provider: 'gemini', badge: 'Fast Reasoning' },
                  { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro', provider: 'gemini', badge: 'Complex Tasks' },
                ].map((m) => {
                  const isSelected = activeModel?.provider === 'gemini' && activeModel?.model === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => {
                        onSwitchModel?.(m.provider, m.id);
                        setShowModelMenu(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors cursor-pointer ${
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
                        <span className="material-symbols-outlined text-indigo-600 text-sm font-bold">
                          check
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Group: Deterministic (No Hallucination) */}
              <div className="px-3 pt-3 pb-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-t border-slate-100 mt-1">
                Ground Truth Engine
              </div>
              <button
                type="button"
                onClick={() => {
                  onSwitchModel?.('mock', 'deterministic');
                  setShowModelMenu(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors cursor-pointer ${
                  activeModel?.provider === 'mock' || activeModel?.model === 'deterministic'
                    ? 'bg-emerald-500/10 text-emerald-900 font-bold border border-emerald-500/30'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-base">⚙️</span>
                  <div>
                    <div className="font-semibold text-slate-900 leading-tight">Deterministic Tools</div>
                    <div className="text-[10px] text-slate-400 font-normal">0% Hallucination • Tool Truth</div>
                  </div>
                </div>
                {(activeModel?.provider === 'mock' || activeModel?.model === 'deterministic') && (
                  <span className="material-symbols-outlined text-emerald-600 text-sm font-bold">
                    check
                  </span>
                )}
              </button>
            </div>
          )}
        </div>

        {/* System Ready Status */}
        <div className="flex items-center gap-2 text-xs font-medium text-on-surface-variant">
          <span className={`w-2 h-2 rounded-full ${isHealthy ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></span>
          <span className="hidden sm:inline">{isHealthy ? 'System Ready' : 'Connecting...'}</span>
        </div>
      </div>
    </header>
  );
}
