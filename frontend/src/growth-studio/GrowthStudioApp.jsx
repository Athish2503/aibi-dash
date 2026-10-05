import React, { useState } from 'react';
import StudioNavigation from './components/StudioNavigation';
import WelcomeScreen from './components/WelcomeScreen';
import CompanySetupScreen from './components/CompanySetupScreen';
import GrowthObjectiveScreen from './components/GrowthObjectiveScreen';
import StrategyConfigScreen from './components/StrategyConfigScreen';
import GenerationScreen from './components/GenerationScreen';
import ExecutiveOverviewScreen from './components/ExecutiveOverviewScreen';
import AudienceIntelligenceScreen from './components/AudienceIntelligenceScreen';
import ContentIntelligenceScreen from './components/ContentIntelligenceScreen';
import OpportunityCenterScreen from './components/OpportunityCenterScreen';
import ActionPlanScreen from './components/ActionPlanScreen';

import {
  DEFAULT_DEMO_COMPANY,
  generatePersonalizedStrategy,
} from './data/mockStudioData';

/**
 * GrowthStudioApp - Main application orchestrator for AI Growth Strategy Studio.
 * Enforces the core loop: Understand → Analyze → Generate → Prioritize → Act → Measure
 * Coordinates the 10-step journey, cross-stage filtering, and persistent 90-day plan state.
 */
export default function GrowthStudioApp({ isClassicMode, onToggleClassicMode }) {
  // Current active screen in the 10-step flow
  const [currentStage, setCurrentStage] = useState('welcome');

  // Company Profile state
  const [companyData, setCompanyData] = useState({
    name: '',
    industry: '',
    description: '',
    products: '',
    targetAudience: '',
    targetGeography: '',
    websiteUrl: '',
  });

  // Objectives state
  const [selectedObjectives, setSelectedObjectives] = useState(['leads', 'conversion', 'search']);
  const [primaryObjective, setPrimaryObjective] = useState('leads');

  // Strategy Configuration state
  const [strategyConfig, setStrategyConfig] = useState({
    primaryFocus: 'Leads',
    targetAudience: 'Enterprise',
    depth: 'Balanced',
    format: 'Executive',
    includes: ['website', 'seo', 'content', 'ai_discoverability', 'competitor_analysis', 'campaign_ideas'],
    additionalNotes: 'Focus heavily on enterprise customers. Prioritize website improvements before content.',
  });

  // Generated Strategy analytical model
  const [strategyData, setStrategyData] = useState(null);
  const [isGenerated, setIsGenerated] = useState(false);

  // 90-Day Action Plan persistent tasks
  const [planTasks, setPlanTasks] = useState([]);

  // 1. Actions from Welcome Screen
  const handleStartStrategy = () => {
    setCurrentStage('company-setup');
  };

  const handleExploreDemo = () => {
    const demoCompany = DEFAULT_DEMO_COMPANY;
    setCompanyData(demoCompany);
    setSelectedObjectives(['leads', 'conversion', 'search', 'ai_visibility']);
    setPrimaryObjective('leads');
    setStrategyConfig({
      primaryFocus: 'Leads',
      targetAudience: 'Enterprise',
      depth: 'Balanced',
      format: 'Executive',
      includes: ['website', 'seo', 'content', 'ai_discoverability', 'competitor_analysis', 'campaign_ideas'],
      additionalNotes: 'Focus heavily on enterprise customers. Prioritize website improvements before content.',
    });

    const generated = generatePersonalizedStrategy({
      company: demoCompany,
      objectives: ['leads', 'conversion', 'search', 'ai_visibility'],
      primaryObjective: 'leads',
      config: {
        primaryFocus: 'Leads',
        targetAudience: 'Enterprise',
        depth: 'Balanced',
        format: 'Executive',
        includes: ['website', 'seo', 'content', 'ai_discoverability', 'competitor_analysis', 'campaign_ideas'],
        additionalNotes: 'Focus heavily on enterprise customers. Prioritize website improvements before content.',
      },
    });

    setStrategyData(generated);
    setPlanTasks(generated.initialPlanTasks);
    setIsGenerated(true);
    setCurrentStage('executive-overview');
  };

  // 2. Actions from Company Setup
  const handleCompanyNext = () => {
    setCurrentStage('growth-objective');
  };

  // 3. Actions from Objectives
  const handleToggleObjective = (id) => {
    setSelectedObjectives((prev) => {
      const exists = prev.includes(id);
      const updated = exists ? prev.filter((o) => o !== id) : [...prev, id];
      // If we removed the primary objective, reset primary to first remaining or default
      if (exists && primaryObjective === id && updated.length > 0) {
        setPrimaryObjective(updated[0]);
      }
      return updated;
    });
  };

  const handleObjectivesNext = () => {
    setCurrentStage('strategy-config');
  };

  // 4. Actions from Strategy Config
  const handleBuildStrategy = () => {
    setCurrentStage('generation');
  };

  // 5. Completion of Staged Generation
  const handleGenerationComplete = () => {
    const generated = generatePersonalizedStrategy({
      company: companyData.name ? companyData : DEFAULT_DEMO_COMPANY,
      objectives: selectedObjectives,
      primaryObjective,
      config: strategyConfig,
    });

    setStrategyData(generated);
    setPlanTasks(generated.initialPlanTasks);
    setIsGenerated(true);
    setCurrentStage('executive-overview');
  };

  // 6. Action Plan Task Management
  const handleAddTaskToPlan = (newTask) => {
    setPlanTasks((prev) => {
      // Don't add duplicate IDs
      if (prev.some((t) => t.id === newTask.id)) return prev;
      return [newTask, ...prev];
    });
  };

  const handleUpdateTaskStatus = (taskId, newStatus) => {
    setPlanTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
    );
  };

  // Reset entire studio flow
  const handleResetStrategy = () => {
    setCurrentStage('welcome');
    setCompanyData({
      name: '',
      industry: '',
      description: '',
      products: '',
      targetAudience: '',
      targetGeography: '',
      websiteUrl: '',
    });
    setStrategyData(null);
    setIsGenerated(false);
    setPlanTasks([]);
  };

  return (
    <div className="min-h-screen bg-[#f8f9ff] text-slate-900 flex flex-col font-sans">
      {/* Global Studio Navigation Header */}
      <StudioNavigation
        currentStage={currentStage}
        onSelectStage={(stageId) => setCurrentStage(stageId)}
        companyName={companyData.name || strategyData?.company?.name}
        primaryObjective={strategyData?.primaryObjective || primaryObjective}
        isGenerated={isGenerated}
        onResetStrategy={handleResetStrategy}
        onLoadDemo={handleExploreDemo}
        isClassicMode={isClassicMode}
        onToggleClassicMode={onToggleClassicMode}
      />

      {/* Main View Area */}
      <main className="flex-1 w-full pb-16">
        {/* Screen 1: Welcome */}
        {currentStage === 'welcome' && (
          <WelcomeScreen
            onStartStrategy={handleStartStrategy}
            onExploreDemo={handleExploreDemo}
          />
        )}

        {/* Screen 2: Company Setup */}
        {currentStage === 'company-setup' && (
          <CompanySetupScreen
            companyData={companyData}
            onUpdateCompany={setCompanyData}
            onNext={handleCompanyNext}
            onBack={() => setCurrentStage('welcome')}
          />
        )}

        {/* Screen 3: Growth Objective */}
        {currentStage === 'growth-objective' && (
          <GrowthObjectiveScreen
            selectedObjectives={selectedObjectives}
            primaryObjective={primaryObjective}
            onToggleObjective={handleToggleObjective}
            onSetPrimaryObjective={setPrimaryObjective}
            onNext={handleObjectivesNext}
            onBack={() => setCurrentStage('company-setup')}
          />
        )}

        {/* Screen 4: Strategy Configuration */}
        {currentStage === 'strategy-config' && (
          <StrategyConfigScreen
            company={companyData.name ? companyData : DEFAULT_DEMO_COMPANY}
            objectives={selectedObjectives}
            primaryObjective={primaryObjective}
            config={strategyConfig}
            onUpdateConfig={setStrategyConfig}
            onBuildStrategy={handleBuildStrategy}
            onBack={() => setCurrentStage('growth-objective')}
          />
        )}

        {/* Screen 5: Generation Experience */}
        {currentStage === 'generation' && (
          <GenerationScreen
            onComplete={handleGenerationComplete}
            companyName={companyData.name || 'Acme Intelligence'}
          />
        )}

        {/* Screen 6: Executive Overview */}
        {currentStage === 'executive-overview' && strategyData && (
          <ExecutiveOverviewScreen
            strategyData={strategyData}
            onNavigateStage={(targetStage) => setCurrentStage(targetStage)}
            onAddFindingToPlan={handleAddTaskToPlan}
          />
        )}

        {/* Screen 7: Audience Intelligence */}
        {currentStage === 'audience-intelligence' && strategyData && (
          <AudienceIntelligenceScreen
            strategyData={strategyData}
            onNavigateStage={(targetStage) => setCurrentStage(targetStage)}
            onAddFindingToPlan={handleAddTaskToPlan}
          />
        )}

        {/* Screen 8: Content Intelligence */}
        {currentStage === 'content-intelligence' && strategyData && (
          <ContentIntelligenceScreen
            strategyData={strategyData}
            onNavigateStage={(targetStage) => setCurrentStage(targetStage)}
            onAddContentToPlan={handleAddTaskToPlan}
          />
        )}

        {/* Screen 9: Opportunity Center */}
        {currentStage === 'opportunity-center' && strategyData && (
          <OpportunityCenterScreen
            strategyData={strategyData}
            onNavigateStage={(targetStage) => setCurrentStage(targetStage)}
            onAddOpportunityToPlan={handleAddTaskToPlan}
            plannedTaskIds={planTasks.map((t) => t.id)}
          />
        )}

        {/* Screen 10: 90-Day Action Plan */}
        {currentStage === 'action-plan' && (
          <ActionPlanScreen
            planTasks={planTasks}
            onUpdateTaskStatus={handleUpdateTaskStatus}
            onAddTask={handleAddTaskToPlan}
            onNavigateStage={(targetStage) => setCurrentStage(targetStage)}
            company={companyData.name ? companyData : (strategyData?.company || DEFAULT_DEMO_COMPANY)}
          />
        )}
      </main>
    </div>
  );
}
