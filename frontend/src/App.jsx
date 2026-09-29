import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import UploadSection from './components/UploadSection';
import DatasetProfiler from './components/DatasetProfiler';
import PipelineStepper from './components/PipelineStepper';
import PlanReviewer from './components/PlanReviewer';
import GenerationResult from './components/GenerationResult';
import AIChat from './components/AIChat';
import DaxStudio from './components/DaxStudio';
import DatasetComparator from './components/DatasetComparator';
import ErrorBoundary from './components/ErrorBoundary';
import {
  checkHealth,
  uploadAndProcessPipeline,
  generateDashboardPlan,
  generatePowerBIProject,
  buildBISolution,
  getAvailableModels,
  switchActiveModel,
} from './services/api';

export default function App() {
  const [currentStage, setCurrentStage] = useState(1);
  const [health, setHealth] = useState(null);

  const [uploadedFile, setUploadedFile] = useState(null);
  const [pipelineData, setPipelineData] = useState(null);
  const [dashboardPlan, setDashboardPlan] = useState(null);
  const [generationResult, setGenerationResult] = useState(null);
  const [datasetRows, setDatasetRows] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Global AI Model Management
  const [availableModels, setAvailableModels] = useState([]);
  const [activeModel, setActiveModel] = useState({ provider: 'ollama', model: 'llama3.2:1b' });
  const [ollamaOnline, setOllamaOnline] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  // Check health and available models on mount
  useEffect(() => {
    async function loadHealthAndModels() {
      try {
        const h = await checkHealth();
        setHealth(h);
      } catch (err) {
        console.error('Health check error:', err);
      }

      try {
        const m = await getAvailableModels();
        if (m?.models) {
          setAvailableModels(m.models);
          setActiveModel({
            provider: m.active_provider || 'ollama',
            model: m.active_model || 'llama3.2:1b',
          });
          setOllamaOnline(Boolean(m.ollama_online));
        }
      } catch (err) {
        console.warn('Could not query AI models:', err);
      }
    }
    loadHealthAndModels();
  }, []);

  const handleSwitchModel = async (provider, model) => {
    try {
      const res = await switchActiveModel(provider, model);
      if (res?.config) {
        setActiveModel(res.config);
      } else {
        setActiveModel({ provider, model });
      }
    } catch (err) {
      console.error('Failed to switch model:', err);
      setErrorMessage(`Failed to switch AI model: ${err.message}`);
    }
  };

  // Step 1: Upload & Analyze Dataset
  const handleUploadComplete = async (file, rows = []) => {
    setUploadedFile(file);
    if (rows && rows.length > 0) {
      setDatasetRows(rows);
    }
    setErrorMessage(null);
    try {
      const data = await uploadAndProcessPipeline(file);
      setPipelineData(data);
      if ((!rows || rows.length === 0) && data?.inspection?.sample_records) {
        setDatasetRows(data.inspection.sample_records);
      }
      setCurrentStage(2); // Step 2: Dataset Analysis
    } catch (err) {
      setErrorMessage(err.message || 'Dataset analysis failed');
      setCurrentStage(1);
      throw err;
    }
  };

  // Step 2 -> Step 3: Continue to AI Planning
  const handleProceedToPlan = async () => {
    if (!uploadedFile) return;
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const plan = await generateDashboardPlan(uploadedFile, false);
      setDashboardPlan(plan);
      setCurrentStage(3); // Step 3: Creating Your Dashboard
    } catch (err) {
      setErrorMessage(err.message || 'Failed to formulate plan');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 4 -> Step 5 -> Step 6: Build BI Solution (Dual Target)
  const handleApproveAndGenerate = async () => {
    if (!pipelineData?.dataset_id) return;
    setIsGenerating(true);
    setCurrentStage(5); // Step 5: Building BI Solution progress
    setErrorMessage(null);

    try {
      let result;
      try {
        result = await buildBISolution({
          datasetId: pipelineData.dataset_id,
          plan: dashboardPlan,
        });
      } catch {
        result = await generatePowerBIProject({
          datasetId: pipelineData.dataset_id,
          plan: dashboardPlan,
        });
      }
      setGenerationResult(result);
      // Brief delay to let user experience dual-target compilation progress
      setTimeout(() => {
        setIsGenerating(false);
        setCurrentStage(6); // Step 6: Interactive BI Solution Canvas
      }, 1200);
    } catch (err) {
      setIsGenerating(false);
      setErrorMessage(`BI Solution build failed: ${err.message}`);
      setCurrentStage(4);
    }
  };

  const handleAskAIFromVisual = ({ visualTitle, metric, dimension, activeFilters, selectedCategory, value }) => {
    const filterDesc = Object.entries(activeFilters || {})
      .filter(([, v]) => v && v !== 'All')
      .map(([k, v]) => `${k}="${v}"`)
      .join(', ');
    const filterText = filterDesc ? ` with active filters (${filterDesc})` : '';
    const categoryText = selectedCategory ? ` specifically for segment "${selectedCategory}"` : '';
    const valueText = value !== undefined ? ` (current metric value: ${value})` : '';
    const query = `Analyze the '${visualTitle}' visual${categoryText}${valueText} focusing on ${metric || 'performance'}${filterText}. Why is this occurring according to the deterministic data, and what optimization should we make?`;

    setChatMessages((prev) => [
      ...prev,
      {
        id: `visual_ask_${Date.now()}`,
        role: 'user',
        text: query,
        visualContext: {
          visualTitle,
          metric,
          dimension,
          activeFilters,
          selectedCategory,
          value,
        },
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);

    setCurrentStage(7); // Switch straight to Grounded Copilot
  };


  const handleReset = () => {
    setUploadedFile(null);
    setPipelineData(null);
    setDashboardPlan(null);
    setGenerationResult(null);
    setDatasetRows([]);
    setChatMessages([]);
    setCurrentStage(1);
    setErrorMessage(null);
  };

  const totalRecords =
    pipelineData?.profiling?.total_records ??
    pipelineData?.cleaning?.cleaned_row_count ??
    pipelineData?.inspection?.row_count ??
    (datasetRows?.length > 0 ? datasetRows.length : 200000);

  const handlePinVisualToPlan = (visual) => {
    setDashboardPlan((prevPlan) => {
      if (!prevPlan) {
        return {
          title: "AI Campaign Performance Dashboard",
          theme: "Executive Blue",
          pages: [
            {
              page_name: "AI Insights",
              visualizations: [
                {
                  id: `pin_${Date.now()}`,
                  title: visual.title,
                  type: visual.type === 'donut' ? 'pie' : visual.type,
                  metric: visual.metric || "ROI",
                  rationale: "Discovered and pinned via AI Chat Agent",
                  x_axis: "Channel / Dimension",
                  y_axis: visual.metric || "ROI",
                },
              ],
            },
          ],
        };
      }
      const pages = [...(prevPlan.pages || [])];
      if (pages.length === 0) {
        pages.push({ page_name: "Overview", visualizations: [] });
      }
      const firstPage = { ...pages[0] };
      firstPage.visualizations = [
        ...(firstPage.visualizations || []),
        {
          id: `pin_${Date.now()}`,
          title: visual.title,
          type: visual.type === 'donut' ? 'pie' : visual.type,
          metric: visual.metric || "ROI",
          rationale: "Discovered and pinned via AI Chat Agent",
          x_axis: "Channel / Dimension",
          y_axis: visual.metric || "ROI",
        },
      ];
      pages[0] = firstPage;
      return { ...prevPlan, pages };
    });
  };

  const handleAddMeasureToPlan = (measure) => {
    setDashboardPlan((prevPlan) => {
      if (!prevPlan) {
        return {
          title: 'AI Campaign Performance Dashboard',
          dataset_name: uploadedFile?.name || 'Campaigns.csv',
          measures: [measure],
          pages: [],
        };
      }
      const existingMeasures = prevPlan.measures || [];
      const updated = existingMeasures.filter((m) => m.name !== measure.name);
      return {
        ...prevPlan,
        measures: [...updated, measure],
      };
    });
  };

  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col font-sans">
      {/* Minimal Header */}
      <Navbar
        health={health}
        isSidebarCollapsed={isSidebarCollapsed}
        onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        activeModel={activeModel}
        availableModels={availableModels}
        ollamaOnline={ollamaOnline}
        onSwitchModel={handleSwitchModel}
      />

      {/* Simplified 5-item Sidebar */}
      <Sidebar
        currentStage={currentStage}
        onSelectStage={(stageId) => {
          if (stageId === 4 && !dashboardPlan) {
            handleProceedToPlan();
          } else {
            setCurrentStage(stageId);
          }
        }}
        hasDataset={Boolean(pipelineData?.dataset_id || uploadedFile || datasetRows.length > 0)}
        hasPlan={Boolean(dashboardPlan)}
        hasArtifacts={Boolean(generationResult)}
        datasetName={uploadedFile?.name}
        isCollapsed={isSidebarCollapsed}
      />

      {/* Main Content View (dynamic padding offset based on sidebar state) */}
      <main
        className={`flex-1 flex flex-col transition-all duration-300 ${
          isSidebarCollapsed ? 'pl-0 md:pl-16' : 'pl-0 md:pl-60'
        } ${
          currentStage === 7
            ? 'h-screen box-border pt-16 pb-3 px-3 md:px-5 overflow-hidden'
            : [2, 4, 6, 8, 9].includes(currentStage)
            ? 'pt-16 min-h-screen p-4 md:p-6'
            : 'pt-16 min-h-screen p-6 md:p-8'
        }`}
      >
        <div
          className={`w-full ${
            currentStage === 7
              ? 'h-full flex-1 flex flex-col overflow-hidden'
              : [2, 4, 6, 8, 9].includes(currentStage)
              ? 'w-full'
              : 'max-w-4xl mx-auto'
          }`}
        >
          <ErrorBoundary onReset={handleReset}>
            {/* Error Notification Alert */}
            {errorMessage && (
              <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center justify-between shadow-sm animate-fade-in">
                <span className="font-semibold">{errorMessage}</span>
                <button
                  type="button"
                  onClick={() => setErrorMessage(null)}
                  className="text-red-600 hover:text-red-900 font-bold ml-4"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Step 1: Home / Upload */}
            {currentStage === 1 && (
              <UploadSection
                onUploadComplete={handleUploadComplete}
                isLoading={isLoading}
                setIsLoading={setIsLoading}
                onError={(msg) => setErrorMessage(msg)}
              />
            )}

            {/* Step 2: Dataset Analysis */}
            {currentStage === 2 && (
              <DatasetProfiler
                pipelineData={pipelineData}
                datasetRows={datasetRows}
                onProceedToPlan={handleProceedToPlan}
                onOpenComparator={() => setCurrentStage(9)}
              />
            )}

            {/* Step 3: Creating Your Dashboard (AI Planning Mode) */}
            {currentStage === 3 && (
              <PipelineStepper
                mode="planning"
                onReviewDashboard={() => setCurrentStage(4)}
              />
            )}

            {/* Step 4: Dashboard Preview / Plan */}
            {currentStage === 4 && (
              <PlanReviewer
                plan={dashboardPlan}
                onApproveAndGenerate={handleApproveAndGenerate}
                isGenerating={isGenerating}
                datasetRows={datasetRows}
                totalRecords={totalRecords}
                onOpenDaxStudio={() => setCurrentStage(8)}
              />
            )}

            {/* Step 5: Generating Power BI Dashboard Progress */}
            {currentStage === 5 && (
              <PipelineStepper
                mode="generating"
                onReviewDashboard={() => setCurrentStage(6)}
              />
            )}

            {/* Step 6: Interactive BI Solution Canvas */}
            {currentStage === 6 && (
              <GenerationResult
                generationResult={
                  generationResult || {
                    artifact_id: 'pbir-bundle-latest',
                    project_name: uploadedFile?.name || 'marketing_campaigns',
                  }
                }
                datasetRows={datasetRows}
                onReset={handleReset}
                totalRecords={totalRecords}
                onAskAI={handleAskAIFromVisual}
                onGoToCopilot={() => setCurrentStage(7)}
              />
            )}


            {/* Step 7: AI Analyst tab */}
            {currentStage === 7 && (
              <AIChat
                datasetId={pipelineData?.dataset_id || 'active-dataset'}
                datasetRows={datasetRows}
                pipelineData={pipelineData}
                datasetName={uploadedFile?.name || 'marketing_campaigns.csv'}
                totalRecords={totalRecords}
                messages={chatMessages}
                setMessages={setChatMessages}
                onPinVisual={handlePinVisualToPlan}
                activeModel={activeModel}
                availableModels={availableModels}
                ollamaOnline={ollamaOnline}
                onSwitchModel={handleSwitchModel}
              />
            )}

            {/* Step 8: DAX Formula Studio */}
            {currentStage === 8 && (
              <DaxStudio
                datasetId={pipelineData?.dataset_id}
                availableColumns={pipelineData?.inspection?.columns || []}
                dashboardPlan={dashboardPlan}
                onAddMeasureToPlan={handleAddMeasureToPlan}
                onClose={() => setCurrentStage(dashboardPlan ? 4 : 2)}
              />
            )}

            {/* Step 9: Multi-Dataset Benchmarking & Comparison */}
            {currentStage === 9 && (
              <DatasetComparator
                activeDatasetFile={uploadedFile}
                activeDatasetName={uploadedFile?.name}
                onClose={() => setCurrentStage(pipelineData ? 2 : 1)}
              />
            )}
          </ErrorBoundary>
        </div>
      </main>
    </div>
  );
}
