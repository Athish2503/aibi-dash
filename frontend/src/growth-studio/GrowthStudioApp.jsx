import React, { useState } from 'react';
import StudioNavigation from './components/StudioNavigation';
import StrategicBriefingScreen from './components/StrategicBriefingScreen';
import ExecutiveStrategyScreen from './components/ExecutiveStrategyScreen';
import IntelligenceScreen from './components/IntelligenceScreen';
import CompanyKnowledgeScreen from './components/CompanyKnowledgeScreen';
import AdaptiveInterviewScreen from './components/AdaptiveInterviewScreen';
import AudienceIntelligenceScreen from './components/AudienceIntelligenceScreen';
import ContentIntelligenceScreen from './components/ContentIntelligenceScreen';
import OpportunityCenterScreen from './components/OpportunityCenterScreen';
import ActionPlanScreen from './components/ActionPlanScreen';
import StrategyConfigScreen from './components/StrategyConfigScreen';
import GenerationScreen from './components/GenerationScreen';
import CompetitiveAuditStudio from './components/CompetitiveAuditStudio';

// Modals
import AskStrategyModal from './components/AskStrategyModal';
import WhatIfScenarioModal from './components/WhatIfScenarioModal';
import ChallengeStrategyModal from './components/ChallengeStrategyModal';
import DemoStoryTourModal from './components/DemoStoryTourModal';
import CompanySelectorModal from './components/CompanySelectorModal';
import ContextSwitchingAnimationModal from './components/ContextSwitchingAnimationModal';

import { defaultBIService } from './services/BIService';
import { defaultAIService } from './services/AIService';

import {
  DEFAULT_DEMO_COMPANY,
  generatePersonalizedStrategy,
  rankRecommendations,
} from './data/mockStudioData';

/**
 * GrowthStudioApp - Main Application Orchestrator
 * 
 * Enforces the primary product loop:
 * Understand → Ask → Research → Analyze → Verify → Explain → Recommend → Prioritize → Act → Measure → Learn
 * 
 * Architecture:
 * - STRATEGY Mode: "What should we do?"
 * - INTELLIGENCE Mode: "What is happening and why?"
 * - Navigation: Home, Strategy, Intelligence, Audience, Content, Opportunities, Plan, Company Knowledge
 */
export default function GrowthStudioApp({
  isClassicMode,
  onToggleClassicMode,
  uploadedFile = null,
  pipelineData = null,
  datasetRows = [],
}) {
  // Navigation active screen: default to 'audit' (Competitive Intelligence & Revenue Audit Engine)
  const [currentStage, setCurrentStage] = useState('audit');

  // Company Profile state
  const [companyData, setCompanyData] = useState(DEFAULT_DEMO_COMPANY);

  // Objectives state
  const [selectedObjectives, setSelectedObjectives] = useState(['leads', 'conversion', 'search']);
  const [primaryObjective, setPrimaryObjective] = useState('leads');

  // Strategy Configuration state
  const [strategyConfig, setStrategyConfig] = useState({
    primaryFocus: 'Leads',
    targetAudience: 'Enterprise',
    depth: 'Balanced',
    format: 'Executive',
    persona: 'Founder',
    includes: ['website', 'seo', 'content', 'ai_discoverability', 'competitor_analysis', 'campaign_ideas'],
    additionalNotes: 'Focus heavily on enterprise customers. Prioritize website improvements before content.',
  });

  // Strategy Persona (Requirement 12)
  const [activePersona, setActivePersona] = useState('Founder');

  // Global Dialogs State
  const [isAskModalOpen, setIsAskModalOpen] = useState(false);
  const [isWhatIfModalOpen, setIsWhatIfModalOpen] = useState(false);
  const [isChallengeModalOpen, setIsChallengeModalOpen] = useState(false);
  const [isDemoTourOpen, setIsDemoTourOpen] = useState(false);
  const [isCompanySelectorOpen, setIsCompanySelectorOpen] = useState(false);

  // Context Switching Animation & Notification State
  const [isSwitchingAnimationOpen, setIsSwitchingAnimationOpen] = useState(false);
  const [pendingContextSwitch, setPendingContextSwitch] = useState(null);
  const [contextNotification, setContextNotification] = useState(null);
  const [auditData, setAuditData] = useState(null);

  // Handle Dynamic Company Switching or Custom Dataset Ingestion
  const handleSelectCompany = (newCompany, newDatasetRows = null) => {
    const activeRows = newDatasetRows || (newCompany.isFromUploadedDataset ? (newCompany.pipelineData?.inspection?.sample_records || datasetRows) : datasetRows);
    
    // Trigger staged loading animation modal before committing state
    setPendingContextSwitch({
      newCompany,
      activeRows,
      sourceType: newCompany.isFromUploadedDataset ? 'dataset' : newCompany.isCustom ? 'custom' : 'preset',
      recordCount: activeRows?.length || (newCompany.isFromUploadedDataset ? 10 : null),
    });
    setIsSwitchingAnimationOpen(true);
  };

  // Called when the staged loading animation finishes
  const handleSwitchAnimationComplete = () => {
    if (!pendingContextSwitch) {
      setIsSwitchingAnimationOpen(false);
      return;
    }

    const { newCompany, activeRows, sourceType } = pendingContextSwitch;
    setCompanyData(newCompany);

    const targetObjective = newCompany.defaultObjective || primaryObjective;
    if (newCompany.defaultObjective) {
      setPrimaryObjective(newCompany.defaultObjective);
      setStrategyConfig((prev) => ({ ...prev, primaryFocus: newCompany.defaultObjective }));
    }

    // Synchronize both deterministic BI service and AI reasoning layer
    defaultBIService.setCompany(newCompany, activeRows);
    defaultAIService.setCompany(newCompany);

    // Re-generate tailored strategy grounded in the new company and active rows
    const generated = generatePersonalizedStrategy({
      company: newCompany,
      objectives: selectedObjectives,
      primaryObjective: targetObjective,
      config: {
        ...strategyConfig,
        primaryFocus: targetObjective,
      },
      datasetRows: activeRows,
    });

    setStrategyData(generated);
    setPlanTasks(generated.initialPlanTasks || []);
    setIsSwitchingAnimationOpen(false);
    setPendingContextSwitch(null);

    // Display high-visibility confirmation banner
    setContextNotification({
      type: 'success',
      companyName: newCompany.name,
      message: newCompany.isFromUploadedDataset
        ? `Dataset successfully processed by backend pipeline (${activeRows?.length || 10} records parsed). AI Strategy calibrated to real telemetry.`
        : `AI Strategic Reasoning Layer and Deterministic BI calibrated for ${newCompany.name}.`,
    });

    setTimeout(() => {
      setContextNotification(null);
    }, 6000);
  };

  // Pre-load default strategy so all views are immediately interactive
  const [strategyData, setStrategyData] = useState(() =>
    generatePersonalizedStrategy({
      company: DEFAULT_DEMO_COMPANY,
      objectives: ['leads', 'conversion', 'search', 'ai_visibility'],
      primaryObjective: 'leads',
      config: {
        primaryFocus: 'Leads',
        targetAudience: 'Enterprise',
        depth: 'Balanced',
        format: 'Executive',
        persona: 'Founder',
        includes: ['website', 'seo', 'content', 'ai_discoverability', 'competitor_analysis', 'campaign_ideas'],
        additionalNotes: 'Focus heavily on enterprise customers. Prioritize website improvements before content.',
      },
    })
  );

  // 90-Day Action Plan persistent tasks
  const [planTasks, setPlanTasks] = useState(() => strategyData?.initialPlanTasks || []);

  // Bridge notification / additions from Intelligence to Strategy
  const handleAddInsightToStrategy = (insight) => {
    // Dynamically enrich strategy data with transferred insight
    setStrategyData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        keyFindings: [
          {
            title: insight.title || 'Transferred BI Insight',
            finding: insight.explanation || insight.text || 'Grounded from BI Semantic Canvas',
            metric: insight.evidence || insight.metric || 'Verified',
            impact: 'P1 Strategic Priority',
            strategicAction: insight.recommendedAction || 'Incorporate in 90-day execution roadmap.',
          },
          ...(prev.keyFindings || []),
        ],
      };
    });
  };

  // Dynamic Persona Switcher without mutating source data (Requirement 12)
  const handleChangePersona = (newPersonaId) => {
    setActivePersona(newPersonaId);
    setStrategyConfig((prev) => ({ ...prev, persona: newPersonaId }));

    if (strategyData) {
      const reRanked = rankRecommendations({
        opportunities: strategyData.opportunities,
        primaryObjective: strategyData.primaryObjective,
        targetAudience: strategyData.config?.targetAudience || 'Enterprise',
        persona: newPersonaId,
        businessHealth: strategyData.businessHealth,
        preferences: strategyData.config?.parsedPreferences || {},
      });

      setStrategyData((prev) => ({
        ...prev,
        activePersona: newPersonaId,
        opportunities: reRanked,
      }));
    }
  };

  // Staged Generation Complete
  const handleGenerationComplete = () => {
    const generated = generatePersonalizedStrategy({
      company: companyData.name ? companyData : DEFAULT_DEMO_COMPANY,
      objectives: selectedObjectives,
      primaryObjective,
      config: strategyConfig,
    });

    setActivePersona(strategyConfig.persona || 'Founder');
    setStrategyData(generated);
    setPlanTasks(generated.initialPlanTasks);
    setCurrentStage('strategy');
  };

  // Adaptive Interview Complete
  const handleInterviewComplete = ({ answers, knowledgeGaps, companyContext }) => {
    if (companyContext) {
      setCompanyData((prev) => ({ ...prev, ...companyContext }));
    }
    setCurrentStage('generation');
  };

  // Action Plan Task Management
  const handleAddTaskToPlan = (newTask) => {
    setPlanTasks((prev) => {
      if (prev.some((t) => t.id === newTask.id || t.task === newTask.task)) return prev;
      return [newTask, ...prev];
    });
  };

  const handleUpdateTaskStatus = (taskId, newStatus) => {
    setPlanTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
    );
  };

  return (
    <div className="min-h-screen bg-[#0A0F1E] text-[#E6EAF2] flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Global Studio Navigation Header */}
      <StudioNavigation
        currentStage={currentStage}
        onSelectStage={(stageId) => setCurrentStage(stageId)}
        companyName={companyData.name || strategyData?.company?.name}
        primaryObjective={strategyData?.primaryObjective || primaryObjective}
        isGenerated={Boolean(strategyData)}
        activePersona={activePersona}
        isClassicMode={isClassicMode}
        onToggleClassicMode={onToggleClassicMode}
        onOpenAsk={() => setIsAskModalOpen(true)}
        onOpenWhatIf={() => setIsWhatIfModalOpen(true)}
        onOpenChallenge={() => setIsChallengeModalOpen(true)}
        onStartDemoTour={() => setIsDemoTourOpen(true)}
        onOpenCompanySelector={() => setIsCompanySelectorOpen(true)}
        growthBetsCount={auditData?.growth_bets?.length || 3}
      />

      {/* Context Switch Notification Banner */}
      {contextNotification && (
        <div className="bg-emerald-600 text-white px-4 py-2.5 shadow-md flex items-center justify-between animate-fadeIn z-30">
          <div className="max-w-7xl mx-auto w-full flex items-center justify-between gap-3 text-xs sm:text-sm font-semibold">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-base">check_circle</span>
              <span>{contextNotification.message}</span>
            </div>
            <button
              type="button"
              onClick={() => setContextNotification(null)}
              className="text-white/80 hover:text-white text-xs cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Main View Area */}
      <main className="flex-1 w-full pb-36 sm:pb-44">
        {/* PRIMARY ENGINE: Competitor Audit Engine */}
        {(['audit', 'home', 'matrix', 'leaks', 'bets'].includes(currentStage)) && (
          <CompetitiveAuditStudio
            onSwitchToBI={onToggleClassicMode}
            activeTab={
              currentStage === 'matrix'
                ? 'matrix'
                : currentStage === 'leaks'
                ? 'leaks'
                : currentStage === 'bets'
                ? 'bets'
                : 'all'
            }
            onSelectTab={(tabId) => setCurrentStage(tabId)}
            onAuditCompleted={(res) => setAuditData(res)}
          />
        )}

        {/* SUB-VIEW: Strategic Briefing Screen */}
        {currentStage === 'briefing' && (
          <StrategicBriefingScreen
            companyName={companyData.name || 'Acme Intelligence'}
            primaryObjective={primaryObjective}
            companyData={companyData}
            onOpenCompanySelector={() => setIsCompanySelectorOpen(true)}
            uploadedDataset={uploadedFile ? { name: uploadedFile.name, rows: datasetRows } : null}
            strategyData={strategyData}
            onOpenStrategy={() => setCurrentStage('strategy')}
            onOpenIntelligence={() => setCurrentStage('intelligence')}
            onOpenKnowledge={() => setCurrentStage('knowledge')}
            onOpenOpportunities={() => setCurrentStage('opportunities')}
            onOpenPlan={() => setCurrentStage('plan')}
            onOpenAskAI={() => setIsAskModalOpen(true)}
            onOpenWhatIf={() => setIsWhatIfModalOpen(true)}
            onOpenChallenge={() => setIsChallengeModalOpen(true)}
            onStartInterview={() => setCurrentStage('interview')}
          />
        )}

        {/* VIEW 2: Strategy Canvas ("What should we do?" - Section 1, 2, 6, 15) */}
        {currentStage === 'strategy' && (
          <ExecutiveStrategyScreen
            strategyData={strategyData}
            activePersona={activePersona}
            onChangePersona={handleChangePersona}
            onNavigateToIntelligence={() => setCurrentStage('intelligence')}
            onNavigateToPlan={() => setCurrentStage('plan')}
            onNavigateToOpportunities={() => setCurrentStage('opportunities')}
            onOpenWhatIf={() => setIsWhatIfModalOpen(true)}
            onOpenChallenge={() => setIsChallengeModalOpen(true)}
            onAddTaskToPlan={handleAddTaskToPlan}
          />
        )}

        {/* VIEW 3: Intelligence Canvas ("What is happening and why?" - Section 1, 7, 8, 9, 17, 18) */}
        {currentStage === 'intelligence' && (
          <IntelligenceScreen
            key={companyData.id}
            onNavigateToStrategy={() => setCurrentStage('strategy')}
            onAddInsightToStrategy={handleAddInsightToStrategy}
            onOpenWhatIf={() => setIsWhatIfModalOpen(true)}
          />
        )}

        {/* VIEW 4: Audience Intelligence Screen */}
        {currentStage === 'audience' && strategyData && (
          <AudienceIntelligenceScreen
            strategyData={strategyData}
            onNavigateStage={(targetStage) => setCurrentStage(targetStage)}
            onAddFindingToPlan={handleAddTaskToPlan}
          />
        )}

        {/* VIEW 5: Content Intelligence Screen */}
        {currentStage === 'content' && strategyData && (
          <ContentIntelligenceScreen
            strategyData={strategyData}
            onNavigateStage={(targetStage) => setCurrentStage(targetStage)}
            onAddContentToPlan={handleAddTaskToPlan}
          />
        )}

        {/* VIEW 6: Opportunity Center Screen (Section 16) */}
        {currentStage === 'opportunities' && strategyData && (
          <OpportunityCenterScreen
            strategyData={strategyData}
            onNavigateStage={(targetStage) => setCurrentStage(targetStage)}
            onAddOpportunityToPlan={handleAddTaskToPlan}
            plannedTaskIds={planTasks.map((t) => t.id)}
          />
        )}

        {/* VIEW 7: 90-Day Action Plan Screen (Section 15, 16) */}
        {currentStage === 'plan' && (
          <ActionPlanScreen
            planTasks={planTasks}
            onUpdateTaskStatus={handleUpdateTaskStatus}
            onAddTask={handleAddTaskToPlan}
            onNavigateStage={(targetStage) => setCurrentStage(targetStage)}
            company={companyData.name ? companyData : DEFAULT_DEMO_COMPANY}
          />
        )}

        {/* VIEW 8: Company Knowledge & Memory (Section 5, 19) */}
        {currentStage === 'knowledge' && (
          <CompanyKnowledgeScreen
            onLaunchTargetedQuestion={() => setCurrentStage('interview')}
            onStartInterview={() => setCurrentStage('interview')}
          />
        )}

        {/* SUB-FLOW: Adaptive AI Strategy Interview (Section 3, 4) */}
        {currentStage === 'interview' && (
          <AdaptiveInterviewScreen
            companyData={companyData}
            onCompleteInterview={handleInterviewComplete}
            onCancel={() => setCurrentStage('home')}
          />
        )}

        {/* SUB-FLOW: Strategy Configuration */}
        {currentStage === 'strategy-config' && (
          <StrategyConfigScreen
            company={companyData.name ? companyData : DEFAULT_DEMO_COMPANY}
            objectives={selectedObjectives}
            primaryObjective={primaryObjective}
            config={strategyConfig}
            onUpdateConfig={setStrategyConfig}
            onBuildStrategy={() => setCurrentStage('generation')}
            onBack={() => setCurrentStage('home')}
          />
        )}

        {/* SUB-FLOW: Staged Generation Experience (Section 14) */}
        {currentStage === 'generation' && (
          <GenerationScreen
            onComplete={handleGenerationComplete}
            companyName={companyData.name || 'Acme Intelligence'}
          />
        )}
      </main>

      {/* Global Modals & Interactive Tools */}
      <AskStrategyModal
        isOpen={isAskModalOpen}
        onClose={() => setIsAskModalOpen(false)}
        strategyData={strategyData}
        onAddActionToPlan={handleAddTaskToPlan}
        addedPlanTaskIds={planTasks.map((t) => t.id)}
      />

      <WhatIfScenarioModal
        isOpen={isWhatIfModalOpen}
        onClose={() => setIsWhatIfModalOpen(false)}
      />

      <ChallengeStrategyModal
        isOpen={isChallengeModalOpen}
        onClose={() => setIsChallengeModalOpen(false)}
        strategyData={strategyData}
      />

      <DemoStoryTourModal
        isOpen={isDemoTourOpen}
        onClose={() => setIsDemoTourOpen(false)}
        onNavigateStage={(stage) => setCurrentStage(stage)}
        onOpenWhatIf={() => setIsWhatIfModalOpen(true)}
        onOpenChallenge={() => setIsChallengeModalOpen(true)}
        onOpenAskAI={() => setIsAskModalOpen(true)}
      />

      <CompanySelectorModal
        isOpen={isCompanySelectorOpen}
        onClose={() => setIsCompanySelectorOpen(false)}
        activeCompany={companyData}
        onSelectCompany={handleSelectCompany}
        uploadedDataset={uploadedFile ? { name: uploadedFile.name, rows: datasetRows } : null}
      />

      {/* Staged Context Switching & Backend Telemetry Synthesis Animation Modal */}
      <ContextSwitchingAnimationModal
        isOpen={isSwitchingAnimationOpen}
        companyName={pendingContextSwitch?.newCompany?.name || 'Company'}
        industry={pendingContextSwitch?.newCompany?.industry || 'Industry'}
        sourceType={pendingContextSwitch?.sourceType || 'preset'}
        recordCount={pendingContextSwitch?.recordCount}
        onComplete={handleSwitchAnimationComplete}
      />
    </div>
  );
}
