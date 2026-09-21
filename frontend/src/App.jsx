import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import UploadSection from './components/UploadSection';
import DatasetProfiler from './components/DatasetProfiler';
import PipelineStepper from './components/PipelineStepper';
import PlanReviewer from './components/PlanReviewer';
import GenerationResult from './components/GenerationResult';
import AIChat from './components/AIChat';
import ErrorBoundary from './components/ErrorBoundary';
import {
  checkHealth,
  uploadAndProcessPipeline,
  generateDashboardPlan,
  generatePowerBIProject,
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

  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  // Check health on mount
  useEffect(() => {
    async function loadHealth() {
      try {
        const h = await checkHealth();
        setHealth(h);
      } catch (err) {
        console.error('Health check error:', err);
      }
    }
    loadHealth();
  }, []);

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

  // Step 4 -> Step 5 -> Step 6: Generate Power BI Dashboard
  const handleApproveAndGenerate = async () => {
    if (!pipelineData?.dataset_id) return;
    setIsGenerating(true);
    setCurrentStage(5); // Step 5: Generating Power BI Dashboard progress
    setErrorMessage(null);

    try {
      const result = await generatePowerBIProject({
        datasetId: pipelineData.dataset_id,
        plan: dashboardPlan,
      });
      setGenerationResult(result);
      // Brief delay to let the user see the completed generation progress
      setTimeout(() => {
        setIsGenerating(false);
        setCurrentStage(6); // Step 6: Final Dashboard Page
      }, 1200);
    } catch (err) {
      setIsGenerating(false);
      setErrorMessage(`Generation failed: ${err.message}`);
      setCurrentStage(4);
    }
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

  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col font-sans">
      {/* Minimal Header */}
      <Navbar
        health={health}
        isSidebarCollapsed={isSidebarCollapsed}
        onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
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
            : currentStage === 2 || currentStage === 6 || currentStage === 4
            ? 'pt-16 min-h-screen p-4 md:p-6'
            : 'pt-16 min-h-screen p-6 md:p-8'
        }`}
      >
        <div
          className={`w-full ${
            currentStage === 7
              ? 'h-full flex-1 flex flex-col overflow-hidden'
              : currentStage === 2 || currentStage === 6 || currentStage === 4
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
              />
            )}

            {/* Step 5: Generating Power BI Dashboard Progress */}
            {currentStage === 5 && (
              <PipelineStepper
                mode="generating"
                onReviewDashboard={() => setCurrentStage(6)}
              />
            )}

            {/* Step 6: Final Dashboard Page */}
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
              />
            )}

            {/* Step 7 (AI Analyst tab) */}
            {currentStage === 7 && (
              <AIChat
                datasetId={pipelineData?.dataset_id || 'active-dataset'}
                datasetRows={datasetRows}
                pipelineData={pipelineData}
                datasetName={uploadedFile?.name || 'marketing_campaigns.csv'}
                totalRecords={totalRecords}
                messages={chatMessages}
                setMessages={setChatMessages}
              />
            )}
          </ErrorBoundary>
        </div>
      </main>
    </div>
  );
}
