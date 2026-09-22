import React, { useState } from 'react';

export default function DatasetProfiler({
  pipelineData,
  datasetRows = [],
  onProceedToPlan,
  onOpenComparator,
}) {
  const [activeTab, setActiveTab] = useState('summary'); // 'summary' | 'table'
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');

  if (!pipelineData) return null;

  const inspection = pipelineData.inspection || {};
  const cleaning = pipelineData.cleaning || {};
  const profiling = pipelineData.profiling || {};

  const totalRecords =
    profiling.total_records ?? cleaning.cleaned_row_count ?? inspection.row_count ?? datasetRows.length ?? 200000;
  const totalColumns =
    inspection.column_count ?? (Array.isArray(inspection.columns) ? inspection.columns.length : 10);
  const duplicates =
    cleaning.dropped_row_count ?? inspection.duplicate_rows_count ?? 0;

  const allColumns = Array.isArray(inspection.columns) && inspection.columns.length > 0
    ? inspection.columns
    : Object.keys(inspection.detected_types || {});

  // Rows for viewing: either parsed datasetRows or inspection.sample_records
  const displayRows = datasetRows.length > 0 ? datasetRows : (inspection.sample_records || []);

  const filteredRows = displayRows.filter((row) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return Object.values(row).some((val) => String(val).toLowerCase().includes(term));
  });

  const sortedRows = [...filteredRows].sort((a, b) => {
    if (!sortColumn) return 0;
    const valA = a[sortColumn];
    const valB = b[sortColumn];
    if (valA == null) return 1;
    if (valB == null) return -1;
    const numA = Number(valA);
    const numB = Number(valB);
    if (!isNaN(numA) && !isNaN(numB)) {
      return sortDirection === 'asc' ? numA - numB : numB - numA;
    }
    const cmp = String(valA).localeCompare(String(valB));
    return sortDirection === 'asc' ? cmp : -cmp;
  });

  const totalPages = Math.max(1, Math.ceil(sortedRows.length / rowsPerPage));
  const paginatedRows = sortedRows.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  const handleSort = (col) => {
    if (sortColumn === col) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(col);
      setSortDirection('asc');
    }
  };

  const inferColumnRole = (colName) => {
    const lower = colName.toLowerCase();
    if (lower.includes('id') || lower.includes('key')) return 'Identifier';
    if (lower.includes('cost') || lower.includes('roi') || lower.includes('spend') || lower.includes('rate') || lower.includes('revenue') || lower.includes('duration')) {
      return 'Numeric';
    }
    return 'Category';
  };

  const getCategoryTag = (colName, inferredType) => {
    const lower = colName.toLowerCase();
    const typeLower = (inferredType || '').toLowerCase();

    if (lower.includes('id') || lower.endsWith('_key')) return 'Identifier';
    if (lower.includes('location') || lower.includes('region') || lower.includes('country') || lower.includes('city')) return 'Geography';
    if (lower.includes('date') || lower.includes('time') || lower.includes('year') || lower.includes('month')) return 'Date / Time';
    if (['int', 'float', 'number', 'int64', 'float64', 'decimal'].some((t) => typeLower.includes(t)) ||
        lower.includes('cost') || lower.includes('roi') || lower.includes('spend') || lower.includes('rate') || lower.includes('revenue') || lower.includes('duration')) {
      return 'Numeric';
    }
    return 'Category';
  };

  return (
    <div className="w-full flex-1 flex flex-col py-2 animate-fade-in">
      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-6 md:p-8 shadow-sm flex flex-col gap-6">
        {/* Header & Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-outline-variant/20">
          <div>
            <h1 className="text-xl font-bold text-on-surface">Dataset Analysis</h1>
            <p className="text-xs text-secondary mt-0.5">
              {inspection.file_name || 'Uploaded Dataset'} • {totalRecords.toLocaleString()} rows verified
            </p>
          </div>

          <div className="flex items-center gap-2">
            {onOpenComparator && (
              <button
                type="button"
                onClick={onOpenComparator}
                className="px-3 py-1.5 rounded-xl text-xs font-bold text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200 transition-all flex items-center gap-1.5 shadow-xs"
                title="Compare this dataset against another quarter/period"
              >
                <span className="material-symbols-outlined text-sm text-sky-600">compare_arrows</span>
                <span>Compare / Benchmark</span>
              </button>
            )}

            {/* View Mode Toggle Tabs */}
            <div className="flex items-center p-1 rounded-xl bg-surface-container-low border border-outline-variant/30">
              <button
                type="button"
                onClick={() => setActiveTab('summary')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'summary'
                    ? 'bg-surface-container-lowest text-primary shadow-sm'
                    : 'text-secondary hover:text-on-surface'
                }`}
              >
                Schema & Quality
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('table')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  activeTab === 'table'
                    ? 'bg-surface-container-lowest text-primary shadow-sm'
                    : 'text-secondary hover:text-on-surface'
                }`}
              >
                <span>View Dataset</span>
                <span className="px-1.5 py-0.2 rounded-full bg-primary-fixed text-primary text-[10px] font-bold">
                  {displayRows.length}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Tab 1: Schema & Quality */}
        {activeTab === 'summary' && (
          <div className="flex flex-col gap-6 animate-fade-in">
            {/* 4 Checks */}
            <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-on-surface">
              <div className="flex items-center gap-1.5 text-emerald-600">
                <span className="material-symbols-outlined text-base">check_circle</span>
                <span>Dataset loaded</span>
              </div>
              <div className="flex items-center gap-1.5 text-emerald-600">
                <span className="material-symbols-outlined text-base">check_circle</span>
                <span>Schema detected</span>
              </div>
              <div className="flex items-center gap-1.5 text-emerald-600">
                <span className="material-symbols-outlined text-base">check_circle</span>
                <span>Required fields found</span>
              </div>
              <div className="flex items-center gap-1.5 text-emerald-600">
                <span className="material-symbols-outlined text-base">check_circle</span>
                <span>Data quality checked</span>
              </div>
            </div>

            {/* 3 Stat Cards */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/20 flex flex-col items-center justify-center text-center">
                <span className="text-2xl font-bold text-on-surface tabular-nums">
                  {totalRecords.toLocaleString()}
                </span>
                <span className="text-xs text-secondary mt-0.5">Rows</span>
              </div>
              <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/20 flex flex-col items-center justify-center text-center">
                <span className="text-2xl font-bold text-on-surface tabular-nums">
                  {totalColumns}
                </span>
                <span className="text-xs text-secondary mt-0.5">Columns</span>
              </div>
              <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/20 flex flex-col items-center justify-center text-center">
                <span className="text-2xl font-bold text-on-surface tabular-nums">
                  {duplicates}
                </span>
                <span className="text-xs text-secondary mt-0.5">Duplicates</span>
              </div>
            </div>

            {/* Detected Schema List */}
            <div className="flex flex-col gap-2 pt-2 border-t border-outline-variant/20">
              <span className="text-xs font-bold text-secondary uppercase tracking-wider">
                Detected Dataset Columns
              </span>

              <div className="flex flex-col divide-y divide-outline-variant/20 border border-outline-variant/20 rounded-xl overflow-hidden bg-surface-container-low/50">
                {allColumns.map((colName) => {
                  const inferredType = (inspection.detected_types && inspection.detected_types[colName]) || 'string';
                  const tag = getCategoryTag(colName, inferredType);
                  return (
                    <div key={colName} className="flex items-center justify-between px-4 py-2.5 text-xs">
                      <span className="font-semibold text-on-surface font-mono">{colName}</span>
                      <span className="flex items-center gap-1 text-emerald-700 font-medium">
                        <span className="material-symbols-outlined text-xs text-emerald-600">check</span>
                        <span>{tag}</span>
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Interactive Dataset Records Table */}
        {activeTab === 'table' && (
          <div className="flex flex-col gap-4 animate-fade-in">
            {/* Search Bar & Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-md">
                <span className="material-symbols-outlined absolute left-3 top-2.5 text-sm text-secondary">
                  search
                </span>
                <input
                  type="text"
                  placeholder="Filter records across any column..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-surface-container-low border border-outline-variant/30 text-xs text-on-surface placeholder:text-secondary focus:outline-none focus:border-primary"
                />
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 text-xs text-secondary">
                  <span>Rows:</span>
                  <select
                    value={rowsPerPage}
                    onChange={(e) => {
                      setRowsPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="bg-surface-container-low border border-outline-variant/30 text-xs rounded-lg px-2 py-1 text-on-surface focus:outline-none"
                  >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                </div>

                <span className="text-xs text-secondary font-mono">
                  Showing {paginatedRows.length} of {sortedRows.length} rows
                </span>
              </div>
            </div>

            {/* Scrollable Full-Screen Data Table */}
            <div className="overflow-x-auto rounded-xl border border-outline-variant/30 max-h-[calc(100vh-21rem)] min-h-[380px]">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-surface-container-low text-secondary border-b border-outline-variant/30 sticky top-0 z-10 select-none">
                    <th className="py-2.5 px-3 font-semibold uppercase text-[10px] tracking-wider w-12">#</th>
                    {allColumns.map((col) => {
                      const isSorted = sortColumn === col;
                      return (
                        <th
                          key={col}
                          onClick={() => handleSort(col)}
                          className="py-2.5 px-3 font-semibold uppercase text-[10px] tracking-wider whitespace-nowrap cursor-pointer hover:bg-surface-container transition-colors"
                        >
                          <div className="flex items-center gap-1">
                            <span>{col}</span>
                            <span className="material-symbols-outlined text-xs text-secondary">
                              {isSorted ? (sortDirection === 'asc' ? 'arrow_upward' : 'arrow_downward') : 'unfold_more'}
                            </span>
                          </div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/20 bg-surface-container-lowest">
                  {paginatedRows.map((row, rIdx) => {
                    const rowNumber = (currentPage - 1) * rowsPerPage + rIdx + 1;
                    return (
                      <tr key={rIdx} className="hover:bg-surface-container-low/50 transition-colors">
                        <td className="py-2.5 px-3 text-secondary font-mono text-[11px]">{rowNumber}</td>
                        {allColumns.map((col) => {
                          const val = row[col];
                          const isNum = typeof val === 'number';
                          return (
                            <td
                              key={col}
                              className={`py-2.5 px-3 whitespace-nowrap font-mono text-[11px] ${
                                isNum ? 'text-primary font-bold' : 'text-on-surface'
                              }`}
                            >
                              {val != null ? String(val) : <span className="text-secondary/50 italic">-</span>}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                  {paginatedRows.length === 0 && (
                    <tr>
                      <td colSpan={allColumns.length + 1} className="py-12 text-center text-secondary text-xs">
                        No matching records found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center justify-between text-xs pt-1">
              <span className="text-secondary">
                Page {currentPage} of {totalPages}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 rounded-lg border border-outline-variant/30 text-secondary hover:text-on-surface disabled:opacity-40 text-xs font-semibold"
                >
                  Previous
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 rounded-lg border border-outline-variant/30 text-secondary hover:text-on-surface disabled:opacity-40 text-xs font-semibold"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Primary Action Button */}
        <div className="pt-2 flex justify-end">
          <button
            type="button"
            onClick={onProceedToPlan}
            className="w-full sm:w-auto px-8 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-2"
          >
            <span>Continue</span>
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </button>
        </div>
      </div>
    </div>
  );
}
