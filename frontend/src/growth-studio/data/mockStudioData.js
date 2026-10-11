/**
 * AI Growth Strategy Studio - Deterministic Analytical Engine & Data Model (Phase 2 Enhanced)
 * 
 * Provides internally consistent, realistic data modeling company audience, 
 * search visibility, content intelligence, growth opportunities, and 90-day action roadmaps.
 * Personalizes outputs dynamically according to user objectives, strategy personas, 
 * natural-language directives, and interactive scenario parameters.
 */

export const COMPANY_PRESETS = [
  {
    id: 'acme',
    name: 'Acme Intelligence',
    industry: 'Enterprise B2B Software / AI',
    description: 'AI-powered customer service automation and workforce resolution platform for mid-market and enterprise organizations.',
    products: 'Autonomous Support Copilot, Omnichannel Ticket Deflector, Voice AI Agent, Enterprise Knowledge Graph',
    targetAudience: 'Enterprise Customer Experience & IT Operations Leaders (1,000+ employees)',
    targetGeography: 'North America & Europe',
    websiteUrl: 'https://acmeintel.io',
    competitors: 'Zendesk, Freshdesk, Decagon, Ada',
    defaultObjective: 'leads',
  },
  {
    id: 'novapay',
    name: 'NovaPay Global',
    industry: 'Financial Services & FinTech',
    description: 'Developer-first unified cross-border payment gateway, recurring subscription billing, and automated fraud prevention platform.',
    products: 'Nova Checkout API, Global Merchant Virtual Accounts, Shield AI Fraud Engine, Smart Routing Payouts',
    targetAudience: 'Fintech CTOs, CFOs, High-Growth SaaS & Marketplace Operators',
    targetGeography: 'Global / US, UK & Southeast Asia',
    websiteUrl: 'https://novapay.io',
    competitors: 'Stripe, Adyen, Checkout.com, Paddle',
    defaultObjective: 'conversion',
  },
  {
    id: 'lumina',
    name: 'Lumina HealthTech',
    industry: 'Healthcare & HealthTech',
    description: 'HIPAA-compliant clinical AI documentation scribe, patient triage scheduling, and hospital telemetry integration suite.',
    products: 'Lumina Ambient Scribe, Omnichannel Patient Portal, Clinical Workflow Optimizer, EHR Fast-Connector',
    targetAudience: 'Chief Medical Officers, Hospital Health System Administrators & Large Specialty Clinics',
    targetGeography: 'North America (US & Canada)',
    websiteUrl: 'https://luminahealth.ai',
    competitors: 'Epic Systems, Cerner, Nuance DAX, Abridge',
    defaultObjective: 'authority',
  },
  {
    id: 'aurawear',
    name: 'Aura Wear Active',
    industry: 'E-Commerce & Retail Tech',
    description: 'Direct-to-consumer sustainable high-performance technical activewear brand with carbon-neutral circular recycling subscription.',
    products: 'Aura Eco-Compression Leggings, Seamless Hydro-Vent Tops, EcoRestock Club Subscription',
    targetAudience: 'Gen Z & Millennial Fitness Enthusiasts, Urban Athletes & Eco-Conscious Consumers',
    targetGeography: 'Direct-to-Consumer (US, UK, Australia, EU)',
    websiteUrl: 'https://aurawearactive.com',
    competitors: 'Lululemon, Gymshark, Alo Yoga, Vuori',
    defaultObjective: 'conversion',
  },
  {
    id: 'hyperscale',
    name: 'HyperScale Cloud',
    industry: 'Cybersecurity & Infrastructure',
    description: 'Next-generation automated Kubernetes cost optimization and zero-trust cloud infrastructure compliance platform.',
    products: 'HyperKube Autoscaler, CloudSpend FinOps Engine, ZeroTrust IAM Mesh, Real-Time Drift Sentinel',
    targetAudience: 'VP of Platform Engineering, DevOps Leads, Enterprise Site Reliability Engineers (SREs)',
    targetGeography: 'Global Enterprise DevOps',
    websiteUrl: 'https://hyperscalecloud.dev',
    competitors: 'Datadog, AWS CloudWatch, Kubecost, Cast AI',
    defaultObjective: 'reach',
  },
];

export const DEFAULT_DEMO_COMPANY = COMPANY_PRESETS[0];

export const GROWTH_OBJECTIVE_OPTIONS = [
  {
    id: 'reach',
    title: 'Increase reach',
    description: 'Expand total digital footprint, organic brand impressions, and discoverability.',
    icon: 'travel_explore',
  },
  {
    id: 'leads',
    title: 'Generate more leads',
    description: 'Capture high-intent enterprise buyers and accelerate marketing-qualified pipeline.',
    icon: 'groups_3',
  },
  {
    id: 'conversion',
    title: 'Improve conversion',
    description: 'Turn existing web visitors into product demos, trials, and contract evaluations.',
    icon: 'troubleshoot',
  },
  {
    id: 'authority',
    title: 'Build brand authority',
    description: 'Establish recognized industry leadership, expert research citations, and trust.',
    icon: 'verified',
  },
  {
    id: 'search',
    title: 'Improve search visibility',
    description: 'Dominate organic commercial keyword clusters and high-value search demand.',
    icon: 'search_check',
  },
  {
    id: 'ai_visibility',
    title: 'Improve AI discoverability',
    description: 'Win brand citations in AI answer engines (ChatGPT, Perplexity, Gemini, Claude).',
    icon: 'neurology',
  },
  {
    id: 'new_market',
    title: 'Enter a new market',
    description: 'Position offerings for new industry verticals, buyer personas, or geographies.',
    icon: 'public',
  },
];

export const STRATEGY_CONFIG_OPTIONS = {
  primaryFocus: [
    { id: 'Growth', label: 'Growth', desc: 'Holistic revenue & user acquisition scale' },
    { id: 'Leads', label: 'Leads', desc: 'Maximized pipeline capture & sales qualification' },
    { id: 'Authority', label: 'Authority', desc: 'Top-of-mind brand reputation & citations' },
    { id: 'Search', label: 'Search', desc: 'High-intent organic ranking dominance' },
    { id: 'AI Visibility', label: 'AI Visibility', desc: 'LLM knowledge graph & answer presence' },
  ],
  targetAudience: [
    { id: 'All', label: 'All audiences', desc: 'Full spectrum market coverage' },
    { id: 'SMB', label: 'SMB', desc: '1-99 employees / self-serve velocity' },
    { id: 'Mid-Market', label: 'Mid-Market', desc: '100-999 employees / sales-assisted' },
    { id: 'Enterprise', label: 'Enterprise', desc: '1,000+ employees / high contract value' },
    { id: 'Custom', label: 'Custom', desc: 'Tailored segment specific to company niche' },
  ],
  strategyDepth: [
    { id: 'Quick', label: 'Quick (30-day focus)', desc: 'Rapid wins and immediate high-leverage fixes' },
    { id: 'Balanced', label: 'Balanced (90-day roadmap)', desc: 'Comprehensive mix of quick wins and sustainable growth' },
    { id: 'Deep', label: 'Deep (Full Strategy)', desc: 'Rigorous cross-discipline transformation plan' },
  ],
  strategyFormat: [
    { id: 'Executive', label: 'Executive', desc: 'High-level synthesis for C-suite & board members' },
    { id: 'Marketing', label: 'Marketing', desc: 'Actionable campaign & channel execution playbooks' },
    { id: 'Strategy', label: 'Strategy', desc: 'Business model, competitive moat & positioning focus' },
    { id: 'Analyst', label: 'Analyst', desc: 'Data-heavy metrics, cohort breakdowns & attribution' },
  ],
  includeOptions: [
    { id: 'website', label: 'Website strategy', default: true },
    { id: 'seo', label: 'SEO strategy', default: true },
    { id: 'content', label: 'Content strategy', default: true },
    { id: 'ai_discoverability', label: 'AI discoverability', default: true },
    { id: 'competitor_analysis', label: 'Competitor analysis', default: true },
    { id: 'campaign_ideas', label: 'Campaign ideas', default: true },
  ],
};

// ==========================================
// PHASE 2: STRATEGY PERSONAS
// ==========================================
export const STRATEGY_PERSONAS = [
  {
    id: 'Founder',
    title: 'Founder',
    subtitle: 'CEO & Founder Lens',
    tagline: 'Capital efficiency, enterprise valuation & speed-to-market',
    icon: 'crown',
    tone: 'Strategic, valuation-centric, and executive',
    primaryMetrics: ['Annual Contract Value', 'Payback Period', 'Pipeline Valuation'],
    focusArea: 'High-ACV enterprise accounts, accelerated sales cycles, low friction',
    recommendationPriority: ['opp-1', 'opp-3', 'opp-5', 'opp-2', 'opp-4', 'opp-6'],
    perspectiveNotice: 'Prioritizes high-leverage enterprise initiatives that compress sales cycle duration and unlock high-margin recurring contract value.',
  },
  {
    id: 'CMO',
    title: 'CMO',
    subtitle: 'Chief Marketing Officer Lens',
    tagline: 'Brand pipeline, CAC/LTV velocity & full-funnel attribution',
    icon: 'campaign',
    tone: 'Commercial, omnichannel, and growth-oriented',
    primaryMetrics: ['Marketing Qualified Leads', 'Blended CAC', 'Multi-Touch Pipeline'],
    focusArea: 'Commercial comparison capture, messaging alignment, brand defense',
    recommendationPriority: ['opp-2', 'opp-1', 'opp-3', 'opp-5', 'opp-4', 'opp-6'],
    perspectiveNotice: 'Emphasizes market share conquesting against legacy competitors, lowering blended acquisition cost, and multi-channel attribution.',
  },
  {
    id: 'Growth Strategist',
    title: 'Growth Strategist',
    subtitle: 'Growth & Experimentation Lens',
    tagline: 'Funnel conversion, viral loops & rapid experimentation',
    icon: 'trending_up',
    tone: 'Experimental, conversion-obsessed, and agile',
    primaryMetrics: ['Conversion Rate %', 'Drop-off Reduction', 'Deflection Efficiency'],
    focusArea: 'Self-serve calculators, progressive signup, high-velocity UX wins',
    recommendationPriority: ['opp-3', 'opp-1', 'opp-2', 'opp-5', 'opp-4', 'opp-6'],
    perspectiveNotice: 'Spots micro-friction in user journeys, optimizes funnel drop-off points, and prioritizes rapid-payback interactive conversion loops.',
  },
  {
    id: 'SEO Strategist',
    title: 'SEO Strategist',
    subtitle: 'Search Authority & Intent Lens',
    tagline: 'Topical cluster dominance, search intent & entity schemas',
    icon: 'search_check',
    tone: 'Technical, topical-authority focused, and structural',
    primaryMetrics: ['Top 10 Keyword Share', 'Topical Authority Index', 'Crawl Equity'],
    focusArea: 'Pillar consolidation, competitor alternative queries, JSON-LD schema',
    recommendationPriority: ['opp-2', 'opp-6', 'opp-4', 'opp-1', 'opp-3', 'opp-5'],
    perspectiveNotice: 'Focuses on dominating commercial keyword clusters, resolving cannibalization across thin blog posts, and earning AI answer engine citations.',
  },
  {
    id: 'Product Marketer',
    title: 'Product Marketer',
    subtitle: 'PMM & Positioning Lens',
    tagline: 'ICP positioning, competitor battlecards & buyer validation',
    icon: 'psychology_alt',
    tone: 'Positioning-first, competitive, and feature-clarifying',
    primaryMetrics: ['Win/Loss vs Incumbents', 'ICP Engagement', 'Security Validation'],
    focusArea: 'Enterprise Trust Hub, transparent product comparisons, ROI calculators',
    recommendationPriority: ['opp-1', 'opp-2', 'opp-5', 'opp-3', 'opp-4', 'opp-6'],
    perspectiveNotice: 'Sharpens ICP differentiation, arms sales teams with competitive battlecards, and validates economic value for buyer committee consensus.',
  },
  {
    id: 'Analyst',
    title: 'Analyst',
    subtitle: 'Data & Telemetry Lens',
    tagline: 'Telemetry integrity, cohort variance & econometric modeling',
    icon: 'analytics',
    tone: 'Quantitative, variance-focused, and evidence-rigorous',
    primaryMetrics: ['Attribution Variance', 'Funnel Drop-off %', 'Statistical Confidence'],
    focusArea: 'Calendar form drop-off analytics, data-grounded What-If sensitivity',
    recommendationPriority: ['opp-3', 'opp-1', 'opp-5', 'opp-2', 'opp-4', 'opp-6'],
    perspectiveNotice: 'Audits statistical confidence, decomposes conversion drop-offs by device/cohort, and validates econometric upside before allocating budget.',
  },
];

// ==========================================
// PHASE 2: DASHBOARD MODES ("View as")
// ==========================================
export const DASHBOARD_MODES = [
  {
    id: 'Executive',
    title: 'Executive',
    subtitle: 'Business outcomes and priorities',
    icon: 'verified_user',
    description: 'Emphasizes quarterly enterprise pipeline, top 3 strategic levers, and business health overview.',
    badges: ['Board Ready', 'High Level'],
  },
  {
    id: 'Marketing',
    title: 'Marketing',
    subtitle: 'Audience, content and campaigns',
    icon: 'campaign',
    description: 'Emphasizes high-intent buyer topics, audience segment ROI, campaign concepts, and content opportunities.',
    badges: ['Demand Gen', 'Content Ops'],
  },
  {
    id: 'Strategy',
    title: 'Strategy',
    subtitle: 'Market, competition and opportunities',
    icon: 'explore',
    description: 'Emphasizes competitive moats, market share gaps, opportunity scoring matrix, and positioning.',
    badges: ['Competitive Moats', 'Horizon 1-3'],
  },
  {
    id: 'Analyst',
    title: 'Analyst',
    subtitle: 'Detailed metrics and supporting data',
    icon: 'query_stats',
    description: 'Emphasizes funnel telemetry, statistical confidence intervals, cohort unit economics, and data lineage.',
    badges: ['Telemetry Depth', 'Confidence 95%'],
  },
  {
    id: 'Board',
    title: 'Board',
    subtitle: 'Minimal high-level performance and priorities',
    icon: 'meeting_room',
    description: 'Condensed 1-page perspective on quarterly milestones, macro risk factors, and ARR impact.',
    badges: ['Quarterly ARR', 'Macro Risks'],
  },
];

// ==========================================
// PHASE 2: VISUAL PERSONALIZATION OPTIONS
// ==========================================
export const VISUAL_DENSITY_OPTIONS = [
  { id: 'Compact', label: 'Compact', desc: 'Tight spacing, streamlined tables, condensed telemetry' },
  { id: 'Balanced', label: 'Balanced', desc: 'Default comfortable spacing with clear hierarchy' },
  { id: 'Detailed', label: 'Detailed', desc: 'Expanded explanatory annotations and granular evidence' },
];

export const VISUAL_EMPHASIS_OPTIONS = [
  { id: 'KPIs', label: 'KPIs', icon: 'speed', desc: 'Spotlight baseline telemetry and top-level performance' },
  { id: 'Trends', label: 'Trends', icon: 'trending_up', desc: 'Spotlight velocity, trajectory and delta indicators' },
  { id: 'Opportunities', label: 'Opportunities', icon: 'rocket_launch', desc: 'Spotlight ranked initiatives and expected pipeline gain' },
  { id: 'Comparisons', label: 'Comparisons', icon: 'compare_arrows', desc: 'Spotlight competitor benchmarks and segment contrast' },
  { id: 'Recommendations', label: 'Recommendations', icon: 'fact_check', desc: 'Spotlight prioritized prescriptive execution playbooks' },
];

export const NATURAL_LANGUAGE_PRESETS = [
  {
    label: 'Focus primarily on enterprise customers.',
    tag: 'Enterprise Focus',
    instruction: 'Focus primarily on enterprise customers.',
  },
  {
    label: 'Prioritize lead generation over traffic.',
    tag: 'Pipeline First',
    instruction: 'Prioritize lead generation over traffic.',
  },
  {
    label: 'Ignore social media.',
    tag: 'Zero Social',
    instruction: 'Ignore social media.',
  },
  {
    label: 'Give me website recommendations first.',
    tag: 'Website First',
    instruction: 'Give me website recommendations first.',
  },
];

/**
 * Natural Language Directive Parser
 * Extracts structured strategy preferences from free-form user instructions.
 */
export function parseNaturalLanguageDirectives(notes = '') {
  const text = (notes || '').toLowerCase();
  return {
    rawNotes: notes,
    enterpriseFocus: text.includes('enterprise'),
    leadOverTraffic: text.includes('lead') || text.includes('conversion') || text.includes('pipeline'),
    ignoreSocial: text.includes('ignore social') || text.includes('no social') || text.includes('without social') || text.includes('exclude social'),
    websiteFirst: text.includes('website') || text.includes('site') || text.includes('ux'),
    seoFocus: text.includes('seo') || text.includes('search') || text.includes('ranking'),
    contentFocus: text.includes('content') || text.includes('publish') || text.includes('blog'),
    speedPriority: text.includes('quick') || text.includes('fast') || text.includes('immediate'),
  };
}

/**
 * Multi-Factor Personalized Recommendation Engine
 * Dynamically ranks business opportunities according to:
 * - User's primary objective
 * - Selected audience tier
 * - Strategy persona lens
 * - Current business health scores
 * - Opportunity impact & effort
 * - Natural-language instruction preferences
 */
export function rankRecommendations({
  opportunities = [],
  primaryObjective = 'leads',
  targetAudience = 'Enterprise',
  persona = 'Founder',
  businessHealth = [],
  preferences = {},
}) {
  const personaObj = STRATEGY_PERSONAS.find((p) => p.id === persona) || STRATEGY_PERSONAS[0];

  return opportunities
    .map((opp) => {
      let score = opp.relevanceScore || 80;
      let reasons = [];

      // 1. Objective Alignment
      if (primaryObjective === 'leads' && (opp.category === 'Conversion' || opp.category === 'Website')) {
        score += 8;
        reasons.push('Directly aligns with Lead Generation objective');
      } else if (primaryObjective === 'search' && (opp.category === 'SEO' || opp.category === 'Content')) {
        score += 8;
        reasons.push('Directly targets Organic Search visibility');
      } else if (primaryObjective === 'ai_visibility' && opp.category === 'AI Visibility') {
        score += 10;
        reasons.push('Critical initiative for AI answer engine citations');
      } else if (primaryObjective === 'authority' && (opp.category === 'SEO' || opp.category === 'Content')) {
        score += 7;
        reasons.push('Builds durable industry brand authority');
      }

      // 2. Audience Alignment
      if (targetAudience === 'Enterprise' && (opp.tags.includes('Enterprise') || opp.audienceAffected.includes('Enterprise'))) {
        score += 7;
        reasons.push('High-leverage for Enterprise buyer segment ($52k ACV)');
      }

      // 3. Persona Alignment
      const personaRankIndex = personaObj.recommendationPriority.indexOf(opp.id);
      if (personaRankIndex !== -1) {
        const bonus = Math.max(0, 10 - personaRankIndex * 2);
        score += bonus;
        if (personaRankIndex === 0) {
          reasons.push(`Top Priority for ${personaObj.title} perspective`);
        }
      }

      // 4. Natural Language Directive Alignment
      if (preferences.enterpriseFocus && opp.tags.includes('Enterprise')) {
        score += 6;
        reasons.push('Promoted via natural-language directive: Enterprise focus');
      }
      if (preferences.leadOverTraffic && (opp.category === 'Conversion' || opp.category === 'Website')) {
        score += 6;
        reasons.push('Promoted via natural-language directive: Lead gen over traffic');
      }
      if (preferences.websiteFirst && opp.category === 'Website') {
        score += 8;
        reasons.push('Promoted via natural-language directive: Website recommendations first');
      }

      // 5. Business Health urgency
      const healthItem = businessHealth.find((h) => h.category.toLowerCase().includes(opp.category.toLowerCase()));
      if (healthItem && healthItem.score < 55) {
        score += 5;
        reasons.push(`Addresses critical health deficit in ${healthItem.category} (Score: ${healthItem.score})`);
      }

      return {
        ...opp,
        dynamicScore: score,
        rankingReasons: reasons,
        personaExplanation: `${personaObj.title} emphasis: ${reasons[0] || 'High return on investment'}`,
      };
    })
    .sort((a, b) => b.dynamicScore - a.dynamicScore);
}

/**
 * What-If Scenario Calculation Engine
 * Simulates commercial and operational outcomes under adjustable parameter assumptions.
 * Answers: "What could happen if we improve this metric?"
 */
export function calculateScenarioProjection(
  baseline = {
    monthlyTraffic: 124500,
    qualifiedRatio: 0.18,
    conversionRate: 0.0334,
    enterpriseShare: 0.182,
    enterpriseACV: 52000,
    midMarketACV: 18500,
    contentCoverage: 0.42,
  },
  params = {
    trafficGrowthPct: 25,
    conversionRatePct: 4.5,
    enterpriseAudienceGrowthPct: 35,
    contentProductionIncreasePct: 50,
  }
) {
  // Scenario state calculations
  const scenarioTraffic = Math.round(baseline.monthlyTraffic * (1 + params.trafficGrowthPct / 100));
  const scenarioQualified = Math.round(scenarioTraffic * baseline.qualifiedRatio);
  const scenarioConvRate = params.conversionRatePct / 100;
  const scenarioTotalLeads = Math.round(scenarioQualified * scenarioConvRate);

  // Enterprise audience share adjustment
  const scenarioEntShare = Math.min(0.60, baseline.enterpriseShare * (1 + params.enterpriseAudienceGrowthPct / 100));
  const scenarioEntLeads = Math.round(scenarioTotalLeads * scenarioEntShare);
  const scenarioMidLeads = scenarioTotalLeads - scenarioEntLeads;

  // Pipeline calculations (Quarterly value = 25% of annual contract pipeline created)
  const scenarioQuarterlyPipeline = Math.round(
    (scenarioEntLeads * baseline.enterpriseACV + scenarioMidLeads * baseline.midMarketACV) * 0.25
  );

  // Baseline equivalents
  const baselineQualified = Math.round(baseline.monthlyTraffic * baseline.qualifiedRatio);
  const baselineTotalLeads = Math.round(baselineQualified * baseline.conversionRate);
  const baselineEntLeads = Math.round(baselineTotalLeads * baseline.enterpriseShare);
  const baselineMidLeads = baselineTotalLeads - baselineEntLeads;
  const baselineQuarterlyPipeline = Math.round(
    (baselineEntLeads * baseline.enterpriseACV + baselineMidLeads * baseline.midMarketACV) * 0.25
  );

  // Content coverage estimate
  const scenarioCoverage = Math.min(0.95, baseline.contentCoverage * (1 + (params.contentProductionIncreasePct / 100) * 0.45));

  // Blended CAC model
  const baselineBlendedCAC = 1450;
  const cacReductionPct = Math.min(45, Math.round(((params.conversionRatePct - 3.34) / 3.34) * 22 + (params.trafficGrowthPct * 0.15)));
  const scenarioBlendedCAC = Math.round(baselineBlendedCAC * (1 - cacReductionPct / 100));

  return {
    params,
    comparison: [
      {
        metric: 'Monthly Organic Traffic',
        currentState: baseline.monthlyTraffic.toLocaleString() + ' visits',
        scenarioState: scenarioTraffic.toLocaleString() + ' visits',
        difference: `+${(scenarioTraffic - baseline.monthlyTraffic).toLocaleString()} (+${params.trafficGrowthPct}%)`,
        positive: params.trafficGrowthPct > 0,
        potentialImpact: 'Expands market reach and top-of-funnel consideration volume.',
      },
      {
        metric: 'Qualified Commercial Visitors',
        currentState: baselineQualified.toLocaleString() + ' visits',
        scenarioState: scenarioQualified.toLocaleString() + ' visits',
        difference: `+${(scenarioQualified - baselineQualified).toLocaleString()}`,
        positive: scenarioQualified > baselineQualified,
        potentialImpact: 'High-intent buying committee members arriving on site.',
      },
      {
        metric: 'Funnel Conversion Rate',
        currentState: (baseline.conversionRate * 100).toFixed(2) + '%',
        scenarioState: params.conversionRatePct.toFixed(2) + '%',
        difference: `+${(params.conversionRatePct - baseline.conversionRate * 100).toFixed(2)} pts`,
        positive: params.conversionRatePct > baseline.conversionRate * 100,
        potentialImpact: 'Recovers 61.8% drop-off at demo calendar step.',
      },
      {
        metric: 'Monthly Qualified Inquiries / Leads',
        currentState: baselineTotalLeads.toLocaleString() + ' leads',
        scenarioState: scenarioTotalLeads.toLocaleString() + ' leads',
        difference: `+${(scenarioTotalLeads - baselineTotalLeads).toLocaleString()} leads/mo`,
        positive: scenarioTotalLeads > baselineTotalLeads,
        potentialImpact: 'Direct sales pipeline velocity feeding enterprise account executives.',
      },
      {
        metric: 'Projected Quarterly Pipeline Value',
        currentState: '$' + (baselineQuarterlyPipeline / 1000).toFixed(0) + ',000',
        scenarioState: '$' + (scenarioQuarterlyPipeline / 1000).toFixed(0) + ',000',
        difference: `+$${((scenarioQuarterlyPipeline - baselineQuarterlyPipeline) / 1000).toFixed(0)},000 / qtr`,
        positive: scenarioQuarterlyPipeline > baselineQuarterlyPipeline,
        potentialImpact: 'Incremental new ARR pipeline at verified contract values.',
      },
      {
        metric: 'Blended Cost Per Acquisition (CAC)',
        currentState: '$' + baselineBlendedCAC.toLocaleString(),
        scenarioState: '$' + scenarioBlendedCAC.toLocaleString(),
        difference: `-$${(baselineBlendedCAC - scenarioBlendedCAC).toLocaleString()} (-${cacReductionPct}%)`,
        positive: true,
        potentialImpact: 'Improved organic and on-site efficiency reduces paid media dependency.',
      },
      {
        metric: 'High-Intent Topic Coverage',
        currentState: (baseline.contentCoverage * 100).toFixed(0) + '%',
        scenarioState: (scenarioCoverage * 100).toFixed(0) + '%',
        difference: `+${((scenarioCoverage - baseline.contentCoverage) * 100).toFixed(0)} pts`,
        positive: scenarioCoverage > baseline.contentCoverage,
        potentialImpact: 'Closes gap against competitors on commercial migration terms.',
      },
    ],
    powerBiDax: {
      parameterDefinition: `// Power BI What-If Parameter
'Traffic Growth'[Traffic %] = GENERATESERIES(-0.20, 1.00, 0.05)
'Conversion Rate'[Conversion %] = GENERATESERIES(0.01, 0.10, 0.0025)`,
      measureDefinition: `Projected Leads = 
    [Base Traffic] * (1 + SELECTEDVALUE('Traffic Growth'[Traffic %], 0.25)) 
    * [Qualified Ratio] 
    * SELECTEDVALUE('Conversion Rate'[Conversion %], 0.045)`,
    },
    narrative: `If you lift conversion rate from 3.34% to ${params.conversionRatePct}% while scaling enterprise traffic by +${params.enterpriseAudienceGrowthPct}%, your organization will capture approximately ${scenarioTotalLeads - baselineTotalLeads} incremental leads per month, generating +$${((scenarioQuarterlyPipeline - baselineQuarterlyPipeline) / 1000).toFixed(0)}k in new quarterly pipeline.`,
  };
}

// ==========================================
// PHASE 2: ASK YOUR STRATEGY KNOWLEDGE BASE
// ==========================================
export const ASK_STRATEGY_KNOWLEDGE_BASE = [
  {
    id: 'conversions_falling',
    question: 'Why are conversions falling?',
    category: 'Conversion',
    directAnswer: 'Conversions dropped -0.4% this quarter primarily due to severe friction at the demo request stage and a lack of self-serve validation for enterprise buyers.',
    supportingEvidence: '61.8% drop-off occurs on the 7-field calendar booking form (mandatory phone/budget fields). Additionally, enterprise visitors bounce within 22 seconds without visible SOC2/security proof.',
    relevantMetric: 'Conversion rate: 3.34% (vs top-quartile B2B benchmark of 5.2%). 1,212 demo drop-offs per month.',
    recommendedAction: 'Switch to a 2-step progressive form capturing email first, and deploy the Enterprise Trust Hub + Interactive ROI calculator.',
    planTask: {
      id: 'ask-task-conversions',
      task: 'Simplify Demo Request form to 2-stage progressive capture',
      category: 'Conversion',
      priority: 'P1 — Critical',
      expectedImpact: 'Cut 62% funnel drop-off down to ~30%, recovering 300+ inquiries/mo',
      effort: '1 Week',
      status: 'todo',
      month: 1,
      monthTitle: 'Month 1 — Foundation',
      strategicRationale: 'Removes unnecessary phone/budget fields that block high-intent prospects.',
    },
  },
  {
    id: 'prioritize_audience',
    question: 'Which audience should we prioritize?',
    category: 'Audience',
    directAnswer: 'Prioritize Enterprise (1,000+ employees). They yield 6.2x higher Annual Contract Value ($52,000 vs $7,700) and convert at 4.82%.',
    supportingEvidence: 'Enterprise represents only 18.2% of sessions but generates 54% of total contract value and $18.9M in potential pipeline revenue.',
    relevantMetric: 'CAC: $2,400 with $52,000 ACV (LTV:CAC ratio exceeding 14:1). Direct desktop conversion at 4.82%.',
    recommendedAction: 'Deploy dedicated Enterprise Solution hub with SOC2 compliance verification and reverse-IP personalized demo routing.',
    planTask: {
      id: 'ask-task-audience',
      task: 'Build public Enterprise Trust & Security Hub for Enterprise ICP',
      category: 'Website',
      priority: 'P1 — Critical',
      expectedImpact: 'Shorten enterprise sales cycles by 14 days and lift enterprise demo conversion by +35%',
      effort: '2 Weeks',
      status: 'todo',
      month: 1,
      monthTitle: 'Month 1 — Foundation',
      strategicRationale: 'Directly addresses enterprise procurement and security validation hurdles.',
    },
  },
  {
    id: 'publish_next',
    question: 'What should we publish next?',
    category: 'Content',
    directAnswer: 'Publish the 4 Competitor Alternative & Comparison Pillars immediately (Acme vs Zendesk, Intercom, Freshdesk, Salesforce Service Cloud).',
    supportingEvidence: 'Over 24,600 monthly commercial searches query competitor alternatives, where Acme currently has zero indexable assets.',
    relevantMetric: 'High commercial intent conversion rate of 8.4% (3x higher than informational blog posts). Impact score: 9.5/10 with only 3 weeks effort.',
    recommendedAction: 'Publish objective technical comparison matrix detailing latency, deflection rate, and enterprise migration timelines.',
    planTask: {
      id: 'ask-task-publish',
      task: 'Publish 4 Competitor Alternative & Comparison Pillars',
      category: 'SEO & Content',
      priority: 'P1 — Critical',
      expectedImpact: 'Capture 720+ high-intent monthly comparison evaluations from Zendesk & Intercom',
      effort: '3 Weeks',
      status: 'todo',
      month: 2,
      monthTitle: 'Month 2 — Authority',
      strategicRationale: 'Captures buyers in final vendor selection stage.',
    },
  },
  {
    id: 'strongest_competitor',
    question: 'Which competitor is strongest?',
    category: 'Competition',
    directAnswer: 'Competitor A (Legacy Incumbent) is strongest in organic search footprint and perceived brand authority, while Competitor B leads in third-party review sponsorships.',
    supportingEvidence: 'Competitor A captures 4.2x your organic search volume and ranks #1 for "automated customer support". However, their platform suffers from legacy architecture and 90-day deployment cycles.',
    relevantMetric: 'Acme Competitive Position score: 71 / 100. Acme deployment speed is 10x faster (2 weeks vs 90 days).',
    recommendedAction: 'Position aggressively against legacy technical debt: launch "Modern Architecture vs Legacy" battlecard and side-by-side latency benchmarks.',
    planTask: {
      id: 'ask-task-competitor',
      task: 'Deploy Competitor Battlecards & Modern Architecture Benchmark',
      category: 'Strategy',
      priority: 'P2 — High',
      expectedImpact: 'Position against 90-day legacy deployment and win 35% more head-to-head evals',
      effort: '2 Weeks',
      status: 'todo',
      month: 2,
      monthTitle: 'Month 2 — Authority',
      strategicRationale: 'Highlights Acme architectural agility against competitor technical debt.',
    },
  },
  {
    id: 'content_gaps',
    question: 'What are our biggest content gaps?',
    category: 'Content',
    directAnswer: 'The single largest gap is in middle-and-bottom-of-funnel decision enablement (Migration, Implementation, and Security guides).',
    supportingEvidence: 'While top-of-funnel "What is AI Support" has 81% topic coverage, "Migration Playbooks" has 0% coverage and "Security/Compliance" has only 19% coverage.',
    relevantMetric: 'Overall content topic coverage: 42.0% (58% market gap remaining across 68,000 monthly search demand).',
    recommendedAction: 'Consolidate 18 thin blog posts into 3 authoritative Topical Pillars and produce 5 in-depth Migration Playbooks.',
    planTask: {
      id: 'ask-task-content-gaps',
      task: 'Consolidate 18 thin blog posts into 3 authoritative Topical Pillars',
      category: 'Content',
      priority: 'P2 — High',
      expectedImpact: 'Eliminate keyword cannibalization and lift target keywords into Top 5 rankings',
      effort: '3 Weeks',
      status: 'todo',
      month: 2,
      monthTitle: 'Month 2 — Authority',
      strategicRationale: 'Cements topical authority across core product pillars.',
    },
  },
  {
    id: 'fix_first',
    question: 'What should we fix first?',
    category: 'Strategy',
    directAnswer: 'Fix the Enterprise Trust & Security Hub first, followed immediately by simplifying the Demo Request booking flow.',
    supportingEvidence: '72% of stalled enterprise deals cite security documentation delays (averaging 19 days). Enterprise Trust Hub takes only 2 weeks to build and unlocks +35% demo conversion.',
    relevantMetric: 'Relevance score: 98 / 100. Effort: 2 weeks. Confidence: 95%. Projected impact: +$180k/quarter in pipeline.',
    recommendedAction: 'Build public Enterprise Trust & Security Hub with downloadable SOC2 Type II packet and ISO 27001 certifications.',
    planTask: {
      id: 'ask-task-fix-first',
      task: 'Build public Enterprise Trust & Security Architecture Hub',
      category: 'Website',
      priority: 'P1 — Critical',
      expectedImpact: 'Shorten sales cycles by 14 days and lift enterprise demo conversion by +35%',
      effort: '2 Weeks',
      status: 'todo',
      month: 1,
      monthTitle: 'Month 1 — Foundation',
      strategicRationale: 'Solves the #1 blocker in high-value enterprise sales velocity.',
    },
  },
];

/**
 * Ask Your Strategy Query Resolver
 * Evaluates user questions against deterministic structured business data.
 */
export function queryAskStrategy(userQuery = '', strategyData = null) {
  const clean = userQuery.trim().toLowerCase();
  if (!clean) return ASK_STRATEGY_KNOWLEDGE_BASE[0];

  // Direct match in knowledge base
  const directMatch = ASK_STRATEGY_KNOWLEDGE_BASE.find(
    (item) =>
      clean.includes(item.question.toLowerCase().replace('?', '')) ||
      item.question.toLowerCase().includes(clean)
  );
  if (directMatch) return directMatch;

  // Keyword match
  if (clean.includes('convert') || clean.includes('drop') || clean.includes('friction') || clean.includes('fall')) {
    return ASK_STRATEGY_KNOWLEDGE_BASE[0];
  }
  if (clean.includes('audience') || clean.includes('who') || clean.includes('customer') || clean.includes('enterprise') || clean.includes('smb')) {
    return ASK_STRATEGY_KNOWLEDGE_BASE[1];
  }
  if (clean.includes('publish') || clean.includes('write') || clean.includes('blog') || clean.includes('seo') || clean.includes('topic')) {
    return ASK_STRATEGY_KNOWLEDGE_BASE[2];
  }
  if (clean.includes('compet') || clean.includes('rival') || clean.includes('zendesk') || clean.includes('intercom') || clean.includes('market share')) {
    return ASK_STRATEGY_KNOWLEDGE_BASE[3];
  }
  if (clean.includes('gap') || clean.includes('miss') || clean.includes('coverage') || clean.includes('pillar')) {
    return ASK_STRATEGY_KNOWLEDGE_BASE[4];
  }
  if (clean.includes('first') || clean.includes('priority') || clean.includes('start') || clean.includes('now') || clean.includes('quick')) {
    return ASK_STRATEGY_KNOWLEDGE_BASE[5];
  }

  // Fallback synthesis from actual strategy data
  return {
    id: 'custom-answer',
    question: userQuery,
    category: 'General Strategy',
    directAnswer: `Based on your telemetry, Acme Intelligence should focus on enterprise conversion architecture and competitor comparison coverage. Your enterprise conversion rate is 4.82% (highest of all cohorts), but overall site conversion has dropped -0.4% due to demo form drop-off.`,
    supportingEvidence: `Current organic traffic of 124,500 generates 748 monthly leads. 61.8% of visitors drop off during calendar scheduling, while 24,600 monthly competitor comparison searches remain unaddressed.`,
    relevantMetric: `Pipeline opportunity: +$180,000 / quarter by removing security friction; 720+ qualified visits/mo via competitor pillars.`,
    recommendedAction: `Deploy the Enterprise Trust & Security Hub in Month 1, followed by 4 Competitor Comparison Pillars in Month 2.`,
    planTask: {
      id: 'ask-task-custom',
      task: 'Deploy Enterprise Trust Hub & Competitor Comparison Pillars',
      category: 'Website & SEO',
      priority: 'P1 — Critical',
      expectedImpact: 'Recover 300+ inquiries/mo and shorten enterprise sales cycles by 14 days',
      effort: '2 Weeks',
      status: 'todo',
      month: 1,
      monthTitle: 'Month 1 — Foundation',
      strategicRationale: 'Directly addresses highest commercial intent opportunities.',
    },
  };
}

/**
 * Deterministically generates a personalized growth strategy based on user profile and inputs.
 */
export function generatePersonalizedStrategy({
  company = DEFAULT_DEMO_COMPANY,
  objectives = ['leads', 'conversion', 'search'],
  primaryObjective = 'leads',
  config = {
    primaryFocus: 'Leads',
    targetAudience: 'Enterprise',
    depth: 'Balanced',
    format: 'Executive',
    persona: 'Founder',
    includes: ['website', 'seo', 'content', 'ai_discoverability', 'competitor_analysis', 'campaign_ideas'],
    additionalNotes: 'Focus heavily on enterprise customers. Prioritize website improvements before content.',
  },
  datasetRows = null,
}) {
  const companyName = company.name || 'Your Company';
  const industry = company.industry || 'Technology';
  const activePersona = config.persona || 'Founder';
  const parsedPreferences = parseNaturalLanguageDirectives(config.additionalNotes || '');

  const isEnterpriseFocus = config.targetAudience === 'Enterprise' || config.targetAudience === 'All' || parsedPreferences.enterpriseFocus;
  const isLeadsFocus = primaryObjective === 'leads' || config.primaryFocus === 'Leads' || parsedPreferences.leadOverTraffic;
  const isAuthorityFocus = primaryObjective === 'authority' || config.primaryFocus === 'Authority';
  const isSearchFocus = primaryObjective === 'search' || config.primaryFocus === 'Search' || parsedPreferences.seoFocus;
  const isAIFocus = primaryObjective === 'ai_visibility' || config.primaryFocus === 'AI Visibility';

  // 1. Personalized Executive Summary (with persona & preference reflections)
  let executiveSummary = '';
  if (isLeadsFocus) {
    executiveSummary = `Your strongest growth opportunity is currently enterprise-focused customer support content and high-intent comparison architecture. Enterprise visitors convert at 4.82% (3.4x higher than SMB), yet your website currently dedicates less than 20% of high-intent page real estate to enterprise procurement, security, and ROI validation. Resolving this will yield an estimated +$180k in quarterly sales pipeline.`;
  } else if (isAuthorityFocus) {
    executiveSummary = `Your primary inflection point lies in technical thought leadership and benchmark research. While ${companyName} has strong product capabilities, brand authority score lags category incumbents by 28 points because original benchmark data and third-party validation are currently absent from indexable assets.`;
  } else if (isSearchFocus) {
    executiveSummary = `Your organic search acquisition is bottlenecked by topical fragmentation. High-intent commercial queries around automated customer resolution have 68,000 monthly search demand where ${companyName} ranks on page 2–3. Consolidating into 3 core pillar hubs will yield an estimated +140% organic qualified visitor growth.`;
  } else if (isAIFocus) {
    executiveSummary = `AI answer engines (Perplexity, ChatGPT, Claude) currently reference competitor benchmarks in 74% of queries regarding '${industry}', while ${companyName} is cited in only 11% of answers due to missing structured schema and entity co-citations.`;
  } else {
    executiveSummary = `Your digital performance demonstrates significant latent demand across core product categories. Aligning website conversion paths with verified high-intent buyer personas will accelerate customer acquisition while reducing overall blended acquisition cost by 32%.`;
  }

  // Inject persona-specific framing
  if (activePersona === 'Founder') {
    executiveSummary += ` [Founder Lens: Emphasizing fast time-to-value, cash payback efficiency, and enterprise contract size.]`;
  } else if (activePersona === 'CMO') {
    executiveSummary += ` [CMO Lens: Prioritizing commercial pipeline generation, brand share-of-voice defense, and blended CAC compression.]`;
  } else if (activePersona === 'Growth Strategist') {
    executiveSummary += ` [Growth Lens: Focusing on high-velocity friction removal at the demo scheduling step and interactive ROI calculators.]`;
  } else if (activePersona === 'SEO Strategist') {
    executiveSummary += ` [SEO Lens: Targeting 24.6k monthly commercial competitor alternative searches and topical pillar consolidation.]`;
  } else if (activePersona === 'Product Marketer') {
    executiveSummary += ` [PMM Lens: Highlighting ICP messaging alignment, competitive feature differentiation, and buyer security proofs.]`;
  } else if (activePersona === 'Analyst') {
    executiveSummary += ` [Analyst Lens: Decomposing the 61.8% demo booking drop-off and grounding ROI forecasts in verified telemetry.]`;
  }

  // 2. Coherent Supporting KPIs
  const kpis = [
    {
      id: 'traffic',
      label: 'Organic Traffic',
      value: '124,500',
      change: '+14.2%',
      trend: 'up',
      subtitle: 'Monthly unique visits',
      context: 'Healthy top-of-funnel volume',
    },
    {
      id: 'qualified_visitors',
      label: 'Qualified Visitors',
      value: '22,410',
      change: '+21.5%',
      trend: 'up',
      subtitle: '18.0% of total traffic',
      context: 'High commercial intent',
    },
    {
      id: 'leads',
      label: 'Leads / Inquiries',
      value: '748',
      change: '+8.3%',
      trend: 'up',
      subtitle: 'Sales-ready contacts',
      context: 'Pipeline velocity indicator',
    },
    {
      id: 'conversion_rate',
      label: 'Conversion Rate',
      value: '3.34%',
      change: '-0.4%',
      trend: 'down',
      subtitle: 'Qualified to Lead',
      context: 'Key conversion friction point',
    },
    {
      id: 'content_coverage',
      label: 'Content Coverage',
      value: '42.0%',
      change: '+6.0%',
      trend: 'up',
      subtitle: 'Of high-demand buyer topics',
      context: '58% market gap remains',
    },
    {
      id: 'ai_visibility',
      label: 'AI Visibility',
      value: '24 / 100',
      change: '+5 pts',
      trend: 'neutral',
      subtitle: 'LLM recommendation index',
      context: 'Untapped frontier opportunity',
    },
  ];

  // 3. Dynamic Key Findings Grounded in Company Archetype, Uploaded Dataset, or Custom Inputs
  let keyFindings = [];

  const isFromDataset = company.isFromUploadedDataset || (datasetRows && Array.isArray(datasetRows) && datasetRows.length > 0);

  if (isFromDataset) {
    // Ground directly in uploaded dataset telemetry
    let topChannel = 'Google Ads';
    let topRoi = 4.82;
    let highCostChannel = 'LinkedIn Ads';
    let highCost = 6400;
    let avgRoi = 4.2;
    let avgConv = 7.4;
    let avgCost = 3800;
    let totalRows = (datasetRows && datasetRows.length) ? datasetRows.length : 10;

    if (datasetRows && Array.isArray(datasetRows) && datasetRows.length > 0) {
      const valid = datasetRows.filter((r) => r && typeof r === 'object');
      if (valid.length > 0) {
        totalRows = valid.length;
        let sRoi = 0, sConv = 0, sCost = 0;
        let maxRoi = -1, maxRoiCh = '';
        let maxCost = -1, maxCostCh = '';

        valid.forEach((r) => {
          const roi = parseFloat(r.ROI || r.roi || 0);
          const conv = parseFloat(r.Conversion_Rate || r.conversion_rate || r.ConvRate || 0);
          const cost = parseFloat(r.Acquisition_Cost || r.acquisition_cost || r.CAC || 0);
          const ch = r.Channel_Used || r.channel || 'Direct';

          if (!isNaN(roi)) {
            sRoi += roi;
            if (roi > maxRoi) { maxRoi = roi; maxRoiCh = ch; }
          }
          if (!isNaN(conv)) sConv += conv;
          if (!isNaN(cost)) {
            sCost += cost;
            if (cost > maxCost) { maxCost = cost; maxCostCh = ch; }
          }
        });

        avgRoi = Number((sRoi / valid.length).toFixed(2));
        avgConv = Number((sConv / valid.length).toFixed(2));
        avgCost = Math.round(sCost / valid.length);
        if (maxRoiCh) { topChannel = maxRoiCh; topRoi = maxRoi; }
        if (maxCostCh) { highCostChannel = maxCostCh; highCost = maxCost; }
      }
    }

    keyFindings = [
      {
        id: 'finding-dataset-1',
        title: `${topChannel} is your highest-efficiency acquisition channel (${topRoi}x ROI)`,
        evidence: `${topChannel} delivers ${topRoi}x ROI and leads conversion rates across ${totalRows} analyzed campaign cohorts.`,
        insight: `High intent targeting in ${topChannel} consistently converts at premium economics compared to broad display campaigns.`,
        whyItMatters: `Every dollar allocated to ${topChannel} yields ${topRoi}x gross pipeline return, making it your highest-leverage acquisition driver.`,
        recommendation: `Reallocate 25% of lower-performing media budget into ${topChannel} and build dedicated post-click landing pages.`,
        priority: 'Critical',
        category: 'Channel Efficiency',
      },
      {
        id: 'finding-dataset-2',
        title: `${highCostChannel} acquisition cost ($${highCost.toLocaleString()}) creates a capital efficiency drag`,
        evidence: `Average acquisition cost spikes to $${highCost.toLocaleString()} per cohort, compressing portfolio unit economics.`,
        insight: `High bidding competition and mid-funnel conversion leakage are eroding campaign profitability.`,
        whyItMatters: `Unchecked CAC expansion extends payback periods and depresses blended marketing contribution margins.`,
        recommendation: `Implement tighter audience exclusions, refresh ad hooks, and shorten the qualification flow to reduce CAC by 28%.`,
        priority: 'High',
        category: 'Unit Economics',
      },
      {
        id: 'finding-dataset-3',
        title: `Multi-channel attribution reveals strong audience conversion variance`,
        evidence: `Top audience cohorts convert at ${Number((avgConv * 1.35).toFixed(1))}%, while secondary cohorts convert at only ${Number((avgConv * 0.55).toFixed(1))}%.`,
        insight: `Broad audience targeting delivers unqualified clicks that drop off before reaching commercial evaluation.`,
        whyItMatters: `Concentrating spend on high-propensity buyer cohorts will lift net pipeline without requiring additional budget.`,
        recommendation: `Deploy segmented landing pages tailored specifically to high-intent buyer cohorts identified in your telemetry.`,
        priority: 'High',
        category: 'Audience & Conversion',
      },
      {
        id: 'finding-dataset-4',
        title: `Blended telemetry indicates strong expansion runway (${avgRoi}x Portfolio ROI)`,
        evidence: `Verified across ${totalRows} records: Blended CAC of $${avgCost.toLocaleString()} with ${avgConv}% overall conversion rate.`,
        insight: `The core commercial engine is fundamentally sound, with upside concentrated in friction removal and channel reallocation.`,
        whyItMatters: `Systematic optimization of underperforming cohorts will compound topline sales pipeline by +34%.`,
        recommendation: `Execute 90-day multi-channel optimization plan prioritizing top-performing cohorts.`,
        priority: 'Medium',
        category: 'Strategic Opportunity',
      },
    ];
  } else if (company.id === 'company-aurawear') {
    keyFindings = [
      {
        id: 'finding-aura-1',
        title: 'Mobile checkout abandonment is capping direct-to-consumer revenue',
        evidence: 'Mobile represents 68.4% of website sessions, but converts at only 1.82% compared to 4.25% on desktop devices.',
        insight: 'Mobile shoppers abandon at the multi-screen address entry and shipping calculation step on smartphones.',
        whyItMatters: 'With an average order value of $148, closing half the mobile conversion gap unlocks an estimated +$94,000 monthly.',
        recommendation: 'Deploy instant 1-click Express Checkout (Apple Pay, Shop Pay, Google Pay) above the fold on mobile product pages.',
        priority: 'Critical',
        category: 'Mobile UX & Conversion',
      },
      {
        id: 'finding-aura-2',
        title: 'Repeat purchase VIP Restock Club drives 44% of gross margin',
        evidence: 'Club members order 3.8x per year with a 60-day repurchase cycle, but only 12% of first-time buyers are enrolled.',
        insight: 'First-time buyers receive generic promotional newsletters rather than automated replenishment reminders when apparel wears.',
        whyItMatters: 'Retained VIP customers have zero marginal acquisition cost and 3.2x higher lifetime value than cold ad traffic.',
        recommendation: 'Introduce post-purchase 1-click Restock Club enrollment and automated SMS replenishment journeys at Day 45.',
        priority: 'High',
        category: 'Retention & LTV',
      },
      {
        id: 'finding-aura-3',
        title: 'Paid social CAC on Meta/TikTok rose +28%; Influencer organic gifting has 3.8x higher ROAS',
        evidence: 'Blended paid social CAC reached $48 per customer, while micro-influencer creator seeding delivers $12.50 effective CAC.',
        insight: 'Creative fatigue on paid ad assets is elevating ad CPMs, while authentic athlete UGC generates higher conversion.',
        whyItMatters: 'Reallocating 20% of paid ad budget into creator whitelisting protects gross margins against ad inflation.',
        recommendation: 'Launch structured Creator Seeding Engine and whitelist top-performing athlete UGC into TikTok Spark Ads.',
        priority: 'High',
        category: 'Paid Media & CAC',
      },
      {
        id: 'finding-aura-4',
        title: 'Seasonal high-volume search queries lack dedicated landing page hubs',
        evidence: 'Search queries for "breathable running gear" and "moisture-wicking gym apparel" lack dedicated indexable collection hubs.',
        insight: 'Organic search traffic lands on general catalog pages with high bounce rates.',
        whyItMatters: 'Organic search visitors convert 2.1x higher than cold social clicks when directed to curated gear collections.',
        recommendation: 'Launch 4 high-intent collection hubs with fabric technology breakdowns and athlete reviews.',
        priority: 'Medium',
        category: 'Organic Search',
      },
    ];
  } else if (company.id === 'company-novapay') {
    keyFindings = [
      {
        id: 'finding-nova-1',
        title: 'Developer sandbox drop-off: Only 14% of API signups deploy to production',
        evidence: 'Over 1,420 developers generated test sandbox API keys last month, but only 204 successfully initiated live payment webhooks.',
        insight: 'Developers encounter authentication errors and webhook verification friction in the sandbox without interactive testing tools.',
        whyItMatters: 'Each production-deployed merchant generates an average of $2,850 in monthly interchange and processing revenue.',
        recommendation: 'Build interactive browser API playground, live webhook simulator, and 1-click Postman collection in developer docs.',
        priority: 'Critical',
        category: 'Product-Led Onboarding',
      },
      {
        id: 'finding-nova-2',
        title: 'High-volume marketplace accounts drive 72% of payment volume ($3.2M GMV)',
        evidence: 'Platforms with split-payout requirements represent only 16% of accounts but 72% of total transaction processing volume.',
        insight: 'Marketplace platforms evaluate multi-party payouts, escrow capabilities, and automated 1099 compliance before signing.',
        whyItMatters: 'Capturing 15 additional marketplace platforms per quarter will increase annualized gross payment volume by $42M.',
        recommendation: 'Launch dedicated Marketplace Multi-Party Payouts solution hub with interactive revenue-share calculator.',
        priority: 'High',
        category: 'Audience & ACV',
      },
      {
        id: 'finding-nova-3',
        title: 'PCI-DSS Level 1 and SOC2 compliance pages have 84% dwell time among enterprise leads',
        evidence: 'Enterprise finance and security evaluators spend an average of 4 minutes on security docs before requesting sales calls.',
        insight: 'Security and regulatory compliance are the primary gating factors for enterprise procurement approval.',
        whyItMatters: 'Delivering instant, self-serve compliance packets eliminates 3 weeks of enterprise procurement security review.',
        recommendation: 'Deploy Self-Serve Enterprise Trust Vault with automated NDA-gated PCI-DSS, SOC2 Type II, and banking letters.',
        priority: 'High',
        category: 'Enterprise Enablement',
      },
      {
        id: 'finding-nova-4',
        title: 'Payment gateway alternative queries are dominated by legacy processors (Stripe/Adyen)',
        evidence: 'Commercial comparison searches query "Stripe marketplace alternative" and "low-fee B2B payment gateway" with zero NovaPay ranking.',
        insight: 'Disillusioned merchants seeking transparent fee tiers and better developer support are captured by review aggregators.',
        whyItMatters: 'Comparison queries convert at 7.8%—more than double generic payment processing keyword traffic.',
        recommendation: 'Publish objective comparison matrices highlighting NovaPay’s lower interchange take rates and dedicated support.',
        priority: 'Medium',
        category: 'SEO & Commercial Capture',
      },
    ];
  } else if (company.id === 'company-stridehealth') {
    keyFindings = [
      {
        id: 'finding-stride-1',
        title: 'Enterprise health system sales cycles average 9 months; Clinical trials convert 2.8x faster',
        evidence: 'Hospital networks require 270 days to close ($120k ACV), while decentralized clinical trials close in 95 days ($48k ACV).',
        insight: 'Decentralized clinical trial coordinators have urgent grant deadlines and pre-allocated telehealth software budgets.',
        whyItMatters: 'Balancing sales pipeline between health systems and clinical trial sponsors provides predictable near-term cashflow.',
        recommendation: 'Launch dedicated Clinical Trial Remote Monitoring solution page with tailored HIPAA protocols and fast pilot setups.',
        priority: 'Critical',
        category: 'Sales Velocity & ICP',
      },
      {
        id: 'finding-stride-2',
        title: 'HIPAA & BAA compliance searches have 32k search volume with zero competitors offering self-serve kits',
        evidence: 'Clinical directors search "telehealth BAA requirements" and "EHR integration HIPAA guide" with high buying intent.',
        insight: 'Healthcare providers require ironclad compliance documentation before initiating any technical vendor evaluation.',
        whyItMatters: 'Providing instant compliance verification positions StrideHealth as the most trusted clinical telehealth infrastructure.',
        recommendation: 'Publish open HIPAA Compliance & EHR Integration Guide with downloadable Business Associate Agreement (BAA) kit.',
        priority: 'High',
        category: 'AEO & Inbound Trust',
      },
      {
        id: 'finding-stride-3',
        title: 'Patient intake drop-off rate reaches 38% on mobile patient intake forms',
        evidence: 'Patients scheduled for telehealth appointments abandon at mandatory insurance pre-authorization upload on mobile.',
        insight: 'Mobile camera card capture and insurance verification take too long, causing appointment cancellation.',
        whyItMatters: 'Every 5% reduction in intake drop-off preserves approximately $68,000 in monthly clinical provider billings.',
        recommendation: 'Integrate automated OCR insurance card scanning and 2-step SMS appointment confirmation reminders.',
        priority: 'High',
        category: 'Patient UX & Retention',
      },
      {
        id: 'finding-stride-4',
        title: 'EHR integration directory queries (Epic, Cerner) are high-intent entry points',
        evidence: 'Prospective hospital clients evaluate whether StrideHealth integrates with their existing electronic medical records.',
        insight: 'Lack of visible Epic FHIR and Cerner marketplace compatibility badges delays sales inquiries.',
        whyItMatters: 'EHR-compatible telehealth solutions command a 35% pricing premium over standalone video tools.',
        recommendation: 'Deploy Interactive EHR Integration Directory showcasing validated Epic App Orchard and Cerner connectors.',
        priority: 'Medium',
        category: 'Product Positioning',
      },
    ];
  } else if (company.id === 'company-cloudscale') {
    keyFindings = [
      {
        id: 'finding-cloud-1',
        title: 'Multi-cloud Kubernetes cost optimization represents 46,000 monthly search demand',
        evidence: 'Cloud engineers search "EKS cost reduction", "GKE cluster autoscaling", and "Kubernetes egress optimization" with zero CloudScale presence.',
        insight: 'DevOps engineers seeking architectural cost reduction land on open-source GitHub scripts and legacy cloud monitoring tools.',
        whyItMatters: 'DevOps practitioners evaluate tools via self-serve command-line installs before recommending enterprise contracts.',
        recommendation: 'Publish open-source CLI Kubernetes Cost Auditor tool on GitHub with 1-click Helm chart deployment.',
        priority: 'Critical',
        category: 'Product-Led Growth',
      },
      {
        id: 'finding-cloud-2',
        title: 'Self-serve CLI installs yield 4.2x higher expansion revenue than sales-led outbound leads',
        evidence: 'Engineers who deploy the agent via CLI expand to multi-cluster monitoring in 42 days with 138% net revenue retention.',
        insight: 'Technical practitioners resist sales calls until they verify sub-1% CPU daemonset overhead in staging clusters.',
        whyItMatters: 'Product-led adoption shortens sales cycle duration from 85 days to 28 days with zero outbound SDR costs.',
        recommendation: 'Place 1-line curl/brew install command prominently above the fold with interactive demo terminal.',
        priority: 'High',
        category: 'Developer Onboarding',
      },
      {
        id: 'finding-cloud-3',
        title: 'Enterprise security architects require automated SOC2 and Terraform modules for PoC approval',
        evidence: 'Fortune 500 security reviews require Infrastructure-as-Code Terraform modules and least-privilege IAM policies.',
        insight: 'Enterprise security teams block deployment when permissions require broad root access to cloud accounts.',
        whyItMatters: 'Publishing verified Terraform Registry modules unblocks 6 enterprise PoCs currently stalled in procurement.',
        recommendation: 'Publish official Terraform Registry Provider with pre-audited read-only IAM permission templates.',
        priority: 'High',
        category: 'Enterprise Security',
      },
      {
        id: 'finding-cloud-4',
        title: 'Datadog and New Relic comparison queries convert at 9.4% intent',
        evidence: 'Commercial evaluators search "Datadog alternative for Kubernetes" and "open-source APM cost comparison".',
        insight: 'Companies facing massive unexpected monthly Datadog bills seek predictable, node-based pricing alternatives.',
        whyItMatters: 'Cost-conscious engineering teams can be acquired at 65% lower CAC by positioning against legacy bill shock.',
        recommendation: 'Deploy transparent Datadog vs CloudScale Pricing Calculator with real-time bill comparison modeling.',
        priority: 'Medium',
        category: 'SEO & Commercial Positioning',
      },
    ];
  } else if (company.isCustom) {
    keyFindings = [
      {
        id: 'finding-custom-1',
        title: `Core positioning opportunity for ${companyName} in ${industry}`,
        evidence: `Directly tailored to offerings: ${company.products || 'Core products'} targeting ${company.targetAudience || 'Core audience'}.`,
        insight: `Buyers in ${industry} demand verified proof of business value before committing to commercial contracts.`,
        whyItMatters: `Aligning web messaging with ${company.targetAudience || 'target buyers'} directly accelerates conversion velocity.`,
        recommendation: `Deploy high-intent solution landing pages highlighting unique advantages against ${company.competitors || 'industry competitors'}.`,
        priority: 'Critical',
        category: 'Positioning & Audience',
      },
      {
        id: 'finding-custom-2',
        title: `Conversion path friction across top digital touchpoints`,
        evidence: `Telemetry indicates qualification friction before prospects experience core product value.`,
        insight: `Lengthy inquiry forms and missing interactive calculators delay prospective buyer progression.`,
        whyItMatters: `Streamlining the initial conversion step lifts inbound inquiries by 2.4x with zero incremental media spend.`,
        recommendation: `Deploy 2-step progressive conversion capture with interactive value demonstration.`,
        priority: 'High',
        category: 'Conversion Readiness',
      },
      {
        id: 'finding-custom-3',
        title: `Search authority and competitive differentiation gap vs ${company.competitors || 'incumbents'}`,
        evidence: `Commercial comparison and alternative search queries are currently captured by third-party review sites.`,
        insight: `Prospective clients in final evaluation stages lack direct, transparent comparison collateral.`,
        whyItMatters: `Comparison queries convert at up to 8.4%—more than double generic informational query conversion.`,
        recommendation: `Publish transparent comparison matrix and customer success case studies.`,
        priority: 'High',
        category: 'Competitive Moats',
      },
      {
        id: 'finding-custom-4',
        title: `AI Answer Engine visibility gap across conversational LLMs`,
        evidence: `Perplexity and ChatGPT favor competitors due to missing structured schema markup and verifiable entity citations.`,
        insight: `Modern evaluators use conversational AI tools to research vendor shortlists before visiting websites.`,
        whyItMatters: `Capturing conversational AI citations unlocks the fastest-growing organic discovery channel.`,
        recommendation: `Implement JSON-LD structured schemas, open product specs, and technical documentation.`,
        priority: 'Medium',
        category: 'AI Discoverability',
      },
    ];
  } else {
    // Default Acme Intelligence B2B SaaS
    keyFindings = [
      {
        id: 'finding-1',
        title: 'Enterprise audience is under-served on core web paths',
        evidence: 'Enterprise traffic represents 18.2% of total web sessions, but generates 31.4% of total pipeline conversions and 54% of contract value.',
        insight: 'Enterprise buyers are discovering the brand via generic search, but bounce due to lack of dedicated security, compliance, and enterprise deployment specifications.',
        whyItMatters: 'Enterprise contracts yield 6.2x higher Annual Contract Value ($52k vs $7.7k SMB). Every 1% improvement in enterprise conversion unlocks $180k+ in quarterly pipeline.',
        recommendation: 'Deploy dedicated Enterprise Solution hub with SOC2 compliance verification, ROI calculator, and tailored sales-assisted demo flows.',
        priority: 'Critical',
        category: 'Audience & Conversion',
      },
      {
        id: 'finding-2',
        title: 'High-intent "Alternative / Competitor" search has zero coverage',
        evidence: 'Over 24,600 monthly commercial searches query "[Top Competitor] alternatives" and "AI support platform comparison", with zero dedicated indexable assets on your domain.',
        insight: 'High-intent buyers in the final decision stage are being captured directly by 2 legacy competitors and third-party review aggregators.',
        whyItMatters: 'Comparison queries convert at 8.4%—nearly triple the baseline conversion rate of generic informational queries.',
        recommendation: 'Publish 4 objective, transparent comparison guides detailing architecture, latency, and enterprise migration timelines.',
        priority: 'High',
        category: 'SEO & Content',
      },
      {
        id: 'finding-3',
        title: 'AI Answer Engines lack verified pricing & entity citation hooks',
        evidence: 'Audit of 50 common B2B prompts across Perplexity and ChatGPT reveals your product is mentioned in 11% of outputs, with 60% of citations misstating pricing tiers.',
        insight: 'Answer engines pull outdated forum data and partner directories because the primary site lacks JSON-LD schema, direct FAQs, and tabular product feature breakdowns.',
        whyItMatters: 'Over 22% of B2B technology evaluators now begin product research via LLM conversational search rather than traditional Google search.',
        recommendation: 'Implement structured schema markup, publish an open Product Spec Sheet, and secure co-citations across verified technical publications.',
        priority: 'High',
        category: 'AI Discoverability',
      },
      {
        id: 'finding-4',
        title: 'Demo request flow exhibits 62% drop-off at calendar step',
        evidence: 'Analytics funnel tracking reveals 1,960 users clicked "Request Demo", but only 748 completed the form (61.8% drop-off on the 7-field qualification form).',
        insight: 'Mandatory phone number and budget qualification fields create unnecessary friction before demonstrating product value.',
        whyItMatters: 'Streamlining the initial booking step will capture approximately 320 additional sales inquiries per month at zero incremental ad spend.',
        recommendation: 'Switch to a 2-step progressive form with instant interactive product tour preview while capturing email first.',
        priority: 'Medium',
        category: 'Website & UX',
      },
    ];
  }

  // 4. Business Health Scores (Enriched with Score, Why, Evidence, Problem, Opportunity, Recommended Action)
  const businessHealth = [
    {
      id: 'audience_fit',
      category: 'Audience Fit',
      score: 78,
      status: 'Strong',
      why: 'Assessed at 78 based on strong developer engagement (38% of sessions) but moderate executive conversion alignment (18%).',
      evidence: '38% of visits match developer / architect persona; 18% match VP/C-level decision makers; 4.82% enterprise conversion rate.',
      problem: 'Technical buyers evaluate the product enthusiastically, but lack executive-ready business cases to secure internal budget approval.',
      opportunity: 'Unlock $18.9M in addressable pipeline by equipping champion buyers with executive ROI briefcases.',
      recommendedAction: 'Produce downloadable Executive Value Briefs and TCO (Total Cost of Ownership) calculators tailored for VP/C-level sponsors.',
      currentState: 'Strong alignment with technical practitioners, moderate alignment with executive buyers.',
    },
    {
      id: 'search_visibility',
      category: 'Search Visibility',
      score: 64,
      status: 'Moderate',
      why: 'Assessed at 64 due to strong brand rank but page 2-3 placement for 68,000 monthly search volume in high-intent commercial queries.',
      evidence: 'Domain has 312 ranked keywords in Top 10, but only 14 keywords with >1,000 monthly search volume in Top 3.',
      problem: 'Top-ranking pages are scattered blog posts rather than structured, authoritative topic clusters with internal link equity.',
      opportunity: 'Capture 720+ qualified visits monthly by moving from page 2 to top 3 for competitor migration queries.',
      recommendedAction: 'Consolidate 18 disparate blog posts into 3 authoritative Cornerstone Pillar Guides with structured topical interlinking.',
      currentState: 'Ranks on page 1 for brand terms and niche technical queries, page 2-3 for high-volume commercial keywords.',
    },
    {
      id: 'content_strength',
      category: 'Content Strength',
      score: 58,
      status: 'Needs Attention',
      why: 'Assessed at 58 because educational top-of-funnel is well populated (81%), but middle/bottom-funnel migration collateral is missing (0%).',
      evidence: '42% overall topic coverage. 81% coverage of "What is AI Support", but only 19% coverage of "Implementation & Migration".',
      problem: 'Prospective customers who finish reading informational articles have no clear logical bridge to commercial evaluation.',
      opportunity: 'Lift buyer progression by 3.2x by linking informational traffic into pragmatic migration blueprints.',
      recommendedAction: 'Build 5 in-depth Migration Playbooks and ROI case studies directly linked from top-performing educational posts.',
      currentState: 'Good educational top-of-funnel content, critical gaps in middle-and-bottom-of-funnel decision enablement.',
    },
    {
      id: 'ai_discoverability',
      category: 'AI Discoverability',
      score: 36,
      status: 'Needs Attention',
      why: 'Assessed at 36 due to zero entity presence on Perplexity/ChatGPT technical prompts and lack of schema markup.',
      evidence: 'Presence in 11% of AI answer outputs; zero citations on technical feature comparison queries; 60% of pricing quotes incorrect in LLM answers.',
      problem: 'Site architecture relies on client-rendered widgets and unindexed marketing brochures that LLM web crawlers cannot parse effectively.',
      opportunity: 'Capture 22% of B2B evaluators who now begin vendor research via conversational answer engines.',
      recommendedAction: 'Deploy clean markdown-friendly documentation, FAQ JSON-LD schemas, and press releases establishing verifiable corporate entities.',
      currentState: 'Minimal entity grounding across generative AI search models (ChatGPT, Perplexity, Google AI Overviews).',
    },
    {
      id: 'conversion_readiness',
      category: 'Conversion Readiness',
      score: 61,
      status: 'Moderate',
      why: 'Assessed at 61 caused by 61.8% drop-off at demo calendar step and lack of interactive self-serve product previews.',
      evidence: 'Blended conversion rate of 3.34% vs top-quartile B2B benchmark of 5.2%. 1,212 drop-offs per month on qualification forms.',
      problem: 'High barrier to entry: requires a live 30-minute sales call before the user can see any aspect of the software in action.',
      opportunity: 'Recover 300+ inquiries per month with zero incremental ad spend through progressive 2-step capture.',
      recommendedAction: 'Embed an interactive 90-second sandbox walkthrough on the homepage and core product pages with progressive lead capture.',
      currentState: 'Adequate static forms, limited interactive demonstration or self-serve value exploration.',
    },
    {
      id: 'competitive_position',
      category: 'Competitive Position',
      score: 71,
      status: 'Strong',
      why: 'Assessed at 71: superior technical architecture (sub-100ms latency, 10x faster deployment) offset by lower legacy share-of-voice.',
      evidence: 'Competitor A maintains 4.2x organic search volume; Competitor B dominates review platform sponsorship badges.',
      problem: 'Market perception assumes legacy players have better enterprise readiness despite Acme having modern architecture.',
      opportunity: 'Win head-to-head evaluation deals by calling out legacy platform technical debt and 90-day deployment overhead.',
      recommendedAction: 'Position against legacy technical debt: highlight latency, API-first architecture, and 10x faster deployment time.',
      currentState: 'Differentiated product capabilities around speed and accuracy, but out-marketed by legacy incumbents in share of voice.',
    },
  ];

  // 5. Audience Intelligence
  const audienceSegments = [
    {
      id: 'enterprise',
      name: 'Enterprise (1,000+ employees)',
      trafficShare: 18.2,
      trafficSessions: 22660,
      conversionRate: 4.82,
      leads: 364,
      avgDealValue: '$52,000',
      revenueValue: '$18,928,000',
      cac: '$2,400',
      primaryChannel: 'Organic Search & Direct',
      topDevice: 'Desktop (91%)',
      priorityRank: 1,
      strategicVerdict: 'HIGHEST VALUE TARGET — Triple down on dedicated procurement and compliance content.',
    },
    {
      id: 'mid_market',
      name: 'Mid-Market (100–999 employees)',
      trafficShare: 34.6,
      trafficSessions: 43077,
      conversionRate: 3.45,
      leads: 246,
      avgDealValue: '$18,500',
      revenueValue: '$4,551,000',
      cac: '$1,250',
      primaryChannel: 'Paid Search & Organic',
      topDevice: 'Desktop (84%)',
      priorityRank: 2,
      strategicVerdict: 'STEADY GROWTH ENGINE — Streamline sales qualification and fast-track proof-of-concept setups.',
    },
    {
      id: 'smb',
      name: 'SMB & Growth Teams (<100 employees)',
      trafficShare: 31.4,
      trafficSessions: 39093,
      conversionRate: 1.42,
      leads: 110,
      avgDealValue: '$4,200',
      revenueValue: '$462,000',
      cac: '$680',
      primaryChannel: 'Social & Referral',
      topDevice: 'Mobile (42%) / Desktop (58%)',
      priorityRank: 3,
      strategicVerdict: 'HIGH VOLUME, LOWER MARGIN — Route to automated self-service onboarding or product tours.',
    },
    {
      id: 'agencies_partners',
      name: 'Consultants & System Integrators',
      trafficShare: 15.8,
      trafficSessions: 19670,
      conversionRate: 2.12,
      leads: 28,
      avgDealValue: '$36,000',
      revenueValue: '$1,008,000',
      cac: '$1,900',
      primaryChannel: 'Organic Search & Tech Docs',
      topDevice: 'Desktop (88%)',
      priorityRank: 4,
      strategicVerdict: 'MULTIPLIER CHANNEL — Develop certification badges, agency revenue share, and co-marketing playbooks.',
    },
  ];

  // 6. Content Intelligence
  const impactEffortTopics = [
    {
      id: 'topic-1',
      title: 'Enterprise AI Support SLA & Compliance Guide',
      effort: 3,
      impact: 9,
      searchOpportunity: 18400,
      category: 'Enterprise / Compliance',
      quadrant: 'Create Now',
      audience: 'Enterprise CX Leaders',
      status: 'Recommended',
    },
    {
      id: 'topic-2',
      title: 'Migration Playbook: Switching from Zendesk/Intercom',
      effort: 4,
      impact: 9.5,
      searchOpportunity: 24600,
      category: 'Commercial Comparison',
      quadrant: 'Create Now',
      audience: 'Mid-Market & Enterprise VP Support',
      status: 'Recommended',
    },
    {
      id: 'topic-3',
      title: 'Interactive Support ROI & Agent Hours Saved Calculator',
      effort: 5,
      impact: 8.8,
      searchOpportunity: 12200,
      category: 'Conversion Asset',
      quadrant: 'Create Now',
      audience: 'CFOs & CX Directors',
      status: 'Recommended',
    },
    {
      id: 'topic-4',
      title: 'AI Hallucination Guardrails in Customer Conversations',
      effort: 4,
      impact: 8.2,
      searchOpportunity: 15800,
      category: 'Thought Leadership',
      quadrant: 'Create Now',
      audience: 'Technical Architects & Product Heads',
      status: 'Recommended',
    },
    {
      id: 'topic-5',
      title: 'Annual State of Enterprise AI Resolution Benchmark (2026)',
      effort: 8,
      impact: 9.6,
      searchOpportunity: 38000,
      category: 'Strategic Bet',
      quadrant: 'Strategic Bet',
      audience: 'Industry Analysts & C-Suite',
      status: 'Planned',
    },
    {
      id: 'topic-6',
      title: 'Detailed API Docs & Webhook Integration Specs',
      effort: 6,
      impact: 7.2,
      searchOpportunity: 9400,
      category: 'Technical Enablement',
      quadrant: 'Strategic Bet',
      audience: 'Engineering Teams',
      status: 'Planned',
    },
    {
      id: 'topic-7',
      title: 'Glossary of 100 AI Customer Service Terms',
      effort: 7,
      impact: 2.8,
      searchOpportunity: 4200,
      category: 'Generic SEO',
      quadrant: 'Deprioritize',
      audience: 'General Informational',
      status: 'Avoid',
    },
    {
      id: 'topic-8',
      title: 'Weekly Company Product Release Notes Blog',
      effort: 5,
      impact: 3.2,
      searchOpportunity: 1600,
      category: 'Internal Updates',
      quadrant: 'Deprioritize',
      audience: 'Existing Users',
      status: 'Maintain Minimal',
    },
  ];

  const contentOpportunities = [
    {
      id: 'co-1',
      topic: 'Enterprise AI SLA, Security & Data Privacy Architecture',
      audience: 'Enterprise IT, CISOs, VP of CX',
      searchDemand: '18,400 / mo',
      businessRelevance: '98 / 100',
      currentCoverage: 'Very Low (1 generic privacy page)',
      recommendedContent: 'Whitepaper + dedicated security trust center + SOC2 / HIPAA architectural breakdown.',
      actionLabel: 'Add to Plan',
      impactLevel: 'High',
    },
    {
      id: 'co-2',
      topic: 'Zendesk & Salesforce Service Cloud Replacement Analysis',
      audience: 'Mid-Market & Enterprise Heads of Support',
      searchDemand: '24,600 / mo',
      businessRelevance: '95 / 100',
      currentCoverage: 'Zero (No direct comparison pages)',
      recommendedContent: 'Side-by-side feature matrix, latency benchmarks, migration timelines, and customer savings case study.',
      actionLabel: 'Add to Plan',
      impactLevel: 'High',
    },
    {
      id: 'co-3',
      topic: 'Customer Service AI ROI & Payback Model Calculator',
      audience: 'Finance Directors, Operations Heads',
      searchDemand: '12,200 / mo',
      businessRelevance: '92 / 100',
      currentCoverage: 'Zero (Static pricing page only)',
      recommendedContent: 'Dynamic web calculator with sliders for ticket volume, agent hourly rate, and deflection rate.',
      actionLabel: 'Add to Plan',
      impactLevel: 'High',
    },
    {
      id: 'co-4',
      topic: 'How to Prevent AI Hallucinations in Live Customer Chats',
      audience: 'AI Product Managers, Support Leaders',
      searchDemand: '15,800 / mo',
      businessRelevance: '89 / 100',
      currentCoverage: 'Medium (1 short blog post)',
      recommendedContent: 'Technical guide explaining retrieval-augmented generation (RAG) guardrails, confidence scoring, and human handoff thresholds.',
      actionLabel: 'Add to Plan',
      impactLevel: 'High',
    },
    {
      id: 'co-5',
      topic: 'Omnichannel Voice AI vs Chatbot Unified Workflows',
      audience: 'Contact Center Directors',
      searchDemand: '11,400 / mo',
      businessRelevance: '84 / 100',
      currentCoverage: 'Low (Voice mentions buried in product features)',
      recommendedContent: 'Comprehensive guide showcasing synchronized voice transcriptions directly feeding ticket queues.',
      actionLabel: 'Add to Plan',
      impactLevel: 'Medium',
    },
  ];

  // 7. Opportunity Center Cards (Fully populated with all 9 Phase 2 required fields)
  const baseOpportunities = [
    {
      id: 'opp-1',
      title: 'Enterprise Trust & Security Architecture Hub',
      category: 'Website',
      priority: 'P1 — Critical',
      impact: 'High',
      relevanceScore: 98,
      effortWeeks: '2 Weeks',
      confidence: '95%',
      currentState: 'Procurement teams must request PDF security certifications over email, leading to an average deal stagnation of 19 days.',
      evidence: 'Enterprise conversion is 4.82% on visits with verified trust documents, but drops to 0.6% on visits without security validation. 72% of stalled enterprise deals cite security documentation delay.',
      businessImpact: 'Shorten enterprise sales cycles by 14 days and lift enterprise lead-to-opportunity demo conversion by +35%.',
      audienceAffected: 'Enterprise CISOs, IT Security Directors, Procurement Evaluators (1,000+ employees)',
      competitiveContext: 'Competitor A lacks public SOC2 compliance documentation; Acme can establish early trust leadership and out-position legacy players.',
      recommendedAction: 'Build a public-facing Trust Center detailing SOC2 Type II, ISO 27001, GDPR, encryption keys, and sub-processor lists with downloadable security packet.',
      estimatedEffort: '2 Weeks (Design template, compliance packet integration, and NDA gated download)',
      expectedValue: '+$180,000 / quarter in incremental enterprise pipeline; 14-day faster closing cycle.',
      dependencies: ['Legal signoff on public compliance statement', 'Current SOC2 Type II audit PDF upload'],
      tags: ['Security', 'Enterprise', 'Conversion', 'Website'],
      deepDive: {
        currentBottleneck: 'Procurement teams request PDF security packets over email, delaying sales cycles by an average of 19 days.',
        expectedGain: 'Shorten sales cycle by 14 days and increase enterprise lead-to-opportunity conversion by +35%.',
        milestones: [
          'Audit current compliance certificates and subprocessor list (Week 1)',
          'Design and build responsive Trust Center template on domain (Week 1.5)',
          'Integrate NDA gated instant download for enterprise audit reports (Week 2)',
        ],
      },
    },
    {
      id: 'opp-2',
      title: 'Competitor Alternative & Migration Pillar Pages',
      category: 'SEO',
      priority: 'P1 — Critical',
      impact: 'High',
      relevanceScore: 95,
      effortWeeks: '3 Weeks',
      confidence: '92%',
      currentState: 'Acme domain has 0 ranked comparison pages; third-party review sites capture all organic commercial alternative queries with biased rankings.',
      evidence: 'Over 24,600 high-intent monthly searches query competitors. Capturing just 3% of this organic traffic equals 720 high-intent evaluation visits per month converting at 8.4%.',
      businessImpact: 'Capture 60–80 high-intent qualified enterprise demos per month at $0 incremental media spend.',
      audienceAffected: 'Mid-Market & Enterprise Heads of Support evaluating Zendesk, Intercom, Freshdesk, and Salesforce.',
      competitiveContext: 'Legacy competitors rely on expensive sponsorships on G2/Capterra; transparent technical comparisons allow Acme to win on sub-100ms latency and faster deployment.',
      recommendedAction: 'Publish 4 transparent comparison pages: Acme vs Zendesk, Acme vs Intercom, Acme vs Freshdesk, and Acme vs Salesforce Service Cloud with objective evaluation criteria.',
      estimatedEffort: '3 Weeks (Technical benchmarking, comparison matrix copy, customer quotes, schema setup)',
      expectedValue: '720+ high-intent monthly visits; 60-80 sales demos/mo; ~$280,000 in quarterly pipeline.',
      dependencies: ['Customer migration case study approvals', 'Technical latency comparison benchmarks verified'],
      tags: ['SEO', 'Commercial Intent', 'Comparison', 'Content'],
      deepDive: {
        currentBottleneck: 'Competitors rank on page 1 with biased reviews; third-party review sites take all referral traffic without brand messaging control.',
        expectedGain: 'Direct capture of 60–80 high-intent qualified enterprise demos per month at $0 media spend.',
        milestones: [
          'Conduct objective technical benchmarking on latency and resolution rates (Week 1)',
          'Draft transparent comparison matrix with customer migration quotes (Week 2)',
          'Optimize on-page schemas, metadata, and reciprocal internal links (Week 3)',
        ],
      },
    },
    {
      id: 'opp-3',
      title: 'Interactive Support ROI & Capacity Calculator',
      category: 'Conversion',
      priority: 'P1 — Critical',
      impact: 'High',
      relevanceScore: 92,
      effortWeeks: '2 Weeks',
      confidence: '90%',
      currentState: 'Prospective buyers cannot quantify their potential savings until step 3 of the sales process, delaying budget approval from CFOs.',
      evidence: 'Analytics tracking reveals static pricing pages have a 78% bounce rate. Prospective clients need economic justification before authorizing pilot evaluations.',
      businessImpact: 'Increase qualified demo capture velocity by 2.4x and generate 140+ additional qualified leads per month with custom budget inputs attached to CRM records.',
      audienceAffected: 'CFOs, VP of Operations, Contact Center Directors seeking defensible headcount and cost deflection ROI.',
      competitiveContext: 'Competitors gate all pricing and calculators behind phone calls; self-serve transparency accelerates initial consideration.',
      recommendedAction: 'Deploy an interactive ROI calculator allowing prospective clients to input their ticket volume and agent count, instantly calculating deflection savings.',
      estimatedEffort: '2 Weeks (Deflection model formulas, reactive widget frontend, CRM webhook integration)',
      expectedValue: '+140 new qualified leads/mo; +$150,000 in quarterly pipeline; 2.4x faster lead capture.',
      dependencies: ['Finance-verified deflection formulas', 'HubSpot/Salesforce webhook mapping for custom calculator fields'],
      tags: ['Conversion', 'Interactive', 'Leads', 'Website'],
      deepDive: {
        currentBottleneck: 'Prospective buyers cannot quantify their potential savings until step 3 of the sales process.',
        expectedGain: 'Generate an estimated 140+ new qualified leads monthly with custom budget inputs attached to CRM records.',
        milestones: [
          'Model deterministic deflection equations based on verified customer case studies (Week 1)',
          'Develop lightweight, responsive interactive widget with chart visualizer (Week 1.5)',
          'Connect outputs directly to HubSpot/Salesforce lead scoring (Week 2)',
        ],
      },
    },
    {
      id: 'opp-4',
      title: 'AI Answer Engine Knowledge Graph & Schema Injection',
      category: 'AI Visibility',
      priority: 'P2 — High',
      impact: 'High',
      relevanceScore: 88,
      effortWeeks: '2 Weeks',
      confidence: '85%',
      currentState: 'LLM web scrapers encounter unstructured client-rendered React tags without machine-readable entity metadata; Acme cited in only 11% of answers.',
      evidence: 'Audit of 50 enterprise B2B prompts across Perplexity and ChatGPT reveals your product is missing from 89% of answers, and 60% of citations misstate pricing tiers.',
      businessImpact: 'Increase citation frequency in Perplexity and ChatGPT enterprise queries from 11% to 45%+, capturing early LLM searchers.',
      audienceAffected: 'Technology evaluators, research architects, and innovation teams utilizing conversational AI engines for software discovery.',
      competitiveContext: 'Legacy competitors have existing brand entity presence; structured schema injection allows Acme to leapfrog on AI recommendation engines.',
      recommendedAction: 'Embed JSON-LD Organization, Product, and FAQPage schemas across all product documentation and establish citations in trusted industry directories.',
      estimatedEffort: '2 Weeks (JSON-LD template injection, public FAQ markdown generation, Wikidata/Crunchbase sync)',
      expectedValue: 'Lift AI answer share from 11% to 45%+; capture 180+ monthly high-intent AI referral visits.',
      dependencies: ['Engineering deployment of server-rendered JSON-LD schema', 'Verified FAQ question approval'],
      tags: ['AI Search', 'Knowledge Graph', 'JSON-LD', 'Brand Authority'],
      deepDive: {
        currentBottleneck: 'LLM web scrapers encounter unstructured client-rendered React tags without machine-readable entity metadata.',
        expectedGain: 'Increase citation frequency in Perplexity and ChatGPT enterprise queries from 11% to 45%+.',
        milestones: [
          'Generate comprehensive JSON-LD schemas for all core products and pricing (Week 1)',
          'Publish machine-parsable FAQ repository with direct answers (Week 1.5)',
          'Submit company entity graph updates to Wikidata, Crunchbase, and G2 (Week 2)',
        ],
      },
    },
    {
      id: 'opp-5',
      title: 'Targeted Enterprise ICP Persona Routing & Personalization',
      category: 'Audience',
      priority: 'P2 — High',
      impact: 'Medium',
      relevanceScore: 86,
      effortWeeks: '3 Weeks',
      confidence: '88%',
      currentState: 'All site visitors see the exact same generic hero headline and SMB case study logos regardless of company size.',
      evidence: 'Enterprise visitors who see generic startup copy bounce within 22 seconds. Showing role-relevant messaging increases time on site by 180%.',
      businessImpact: 'Lift enterprise demo conversion rate from 4.82% to 6.2%, unlocking +$120k in quarterly pipeline.',
      audienceAffected: 'Fortune 1000 visitors, Enterprise CX decision makers, IT Operations executives.',
      competitiveContext: 'Incumbents use expensive 6sense personalization; Acme can execute targeted reverse-IP hero routing at 1/5th the operational complexity.',
      recommendedAction: 'Implement reverse IP company lookup (Clearbit/6sense) to customize homepage hero copy and case study logos for Fortune 1000 visitors.',
      estimatedEffort: '3 Weeks (IP enrichment setup, headline variants, dynamic logo component)',
      expectedValue: '+1.38% enterprise demo conversion lift; +$120,000 / quarter in enterprise pipeline.',
      dependencies: ['IP lookup API key and data privacy compliance check', 'Enterprise customer logo usage permissions'],
      tags: ['Audience', 'ABM', 'Personalization', 'Enterprise'],
      deepDive: {
        currentBottleneck: 'One-size-fits-all homepage fails to address complex enterprise procurement and scalability needs.',
        expectedGain: 'Lift enterprise demo conversion rate from 4.8% to 6.2%.',
        milestones: [
          'Configure IP enrichment API and define 3 persona segments: Enterprise, Mid-Market, SMB (Week 1)',
          'Draft tailored headline variants and customer proof cards (Week 2)',
          'A/B test personalized hero sections against static control (Week 3)',
        ],
      },
    },
    {
      id: 'opp-6',
      title: 'Consolidate Fragmented Blog Posts into 3 Topical Pillars',
      category: 'Content',
      priority: 'P3 — Medium',
      impact: 'Medium',
      relevanceScore: 82,
      effortWeeks: '4 Weeks',
      confidence: '89%',
      currentState: '18 short blog posts compete against each other for the same primary keywords, causing keyword cannibalization and suppressing rankings to page 2.',
      evidence: 'Domain has 312 ranked keywords in Top 10, but only 14 keywords with >1,000 monthly search volume in Top 3. Diluted URL equity prevents breaking into top positions.',
      businessImpact: 'Elevate primary keyword rankings from ranks #14-22 into Top 5 positions, driving +140% organic qualified visitor growth.',
      audienceAffected: 'Technical practitioners, support managers, and operations leaders researching AI resolution architectures.',
      competitiveContext: 'Competitor A dominates page 1 through consolidated pillar hubs; merging Acme posts mirrors modern authoritative information architecture.',
      recommendedAction: 'Merge thin content into 3 comprehensive, canonical Pillar Hubs: (1) AI Ticket Deflection, (2) Autonomous Support Architecture, and (3) Omnichannel Resolution.',
      estimatedEffort: '4 Weeks (Content audit, 3 consolidated long-form pillar guides, 301 redirect map)',
      expectedValue: '+140% organic qualified visitor growth; 3 core keyword clusters entering Top 5 rank.',
      dependencies: ['Content audit spreadsheet completed', 'CMS 301 redirect permissions'],
      tags: ['Content Strategy', 'Topical Authority', 'SEO', 'Consolidation'],
      deepDive: {
        currentBottleneck: 'Google algorithm divides page authority across 18 diluted URLs rather than one authoritative resource.',
        expectedGain: 'Elevate primary keyword rankings from ranks #14-22 into Top 5 positions.',
        milestones: [
          'Audit and map 18 existing URLs to 3 core pillar topics (Week 1)',
          'Write cohesive, comprehensive long-form pillar guides (Week 2-3)',
          'Execute 301 redirects and update internal link structure (Week 4)',
        ],
      },
    },
  ];

  // Apply Multi-Factor Personalized Recommendation Engine
  const rankedOpportunities = rankRecommendations({
    opportunities: baseOpportunities,
    primaryObjective,
    targetAudience: config.targetAudience,
    persona: activePersona,
    businessHealth,
    preferences: parsedPreferences,
  });

  // 8. 90-Day Action Plan
  const initialPlanTasks = [
    {
      id: 'task-m1-1',
      month: 1,
      monthTitle: 'Month 1 — Foundation',
      task: 'Build public Enterprise Trust & Security Hub',
      category: 'Website',
      priority: 'P1 — Critical',
      expectedImpact: 'Shorten sales cycles by 14 days and lift enterprise demo conversion by +35%',
      effort: '2 Weeks',
      status: 'in-progress',
      strategicRationale: 'Removes immediate enterprise procurement friction before spending more resources on acquisition.',
    },
    {
      id: 'task-m1-2',
      month: 1,
      monthTitle: 'Month 1 — Foundation',
      task: 'Deploy Interactive Support ROI & Savings Calculator',
      category: 'Conversion',
      priority: 'P1 — Critical',
      expectedImpact: '+140 new qualified leads/mo with attached economic justification data',
      effort: '2 Weeks',
      status: 'todo',
      strategicRationale: 'Arm buyers with CFO-ready quantitative ROI proof right on the website.',
    },
    {
      id: 'task-m1-3',
      month: 1,
      monthTitle: 'Month 1 — Foundation',
      task: 'Simplify Demo Request form to 2-stage progressive capture',
      category: 'Conversion',
      priority: 'P2 — High',
      expectedImpact: 'Cut 62% funnel drop-off down to ~30%, recovering 300+ inquiries/mo',
      effort: '1 Week',
      status: 'todo',
      strategicRationale: 'Immediate conversion rate optimization win requiring minimal engineering overhead.',
    },
    {
      id: 'task-m2-1',
      month: 2,
      monthTitle: 'Month 2 — Authority',
      task: 'Publish 4 Competitor Alternative & Comparison Pillars',
      category: 'SEO & Content',
      priority: 'P1 — Critical',
      expectedImpact: 'Capture 720+ high-intent monthly comparison evaluations from Zendesk & Intercom',
      effort: '3 Weeks',
      status: 'todo',
      strategicRationale: 'Interprets organic search demand where buyers have already decided to purchase and are picking a vendor.',
    },
    {
      id: 'task-m2-2',
      month: 2,
      monthTitle: 'Month 2 — Authority',
      task: 'Implement JSON-LD Schema & AI Search Answer Optimization',
      category: 'AI Visibility',
      priority: 'P2 — High',
      expectedImpact: 'Increase citation rate in Perplexity & ChatGPT B2B evaluations to 45%+',
      effort: '2 Weeks',
      status: 'todo',
      strategicRationale: 'Future-proofs discoverability against conversational search engine disruption.',
    },
    {
      id: 'task-m2-3',
      month: 2,
      monthTitle: 'Month 2 — Authority',
      task: 'Consolidate 18 thin blog posts into 3 authoritative Topical Pillars',
      category: 'Content',
      priority: 'P3 — Medium',
      expectedImpact: 'Eliminate keyword cannibalization and lift target keywords into Top 5 rankings',
      effort: '3 Weeks',
      status: 'todo',
      strategicRationale: 'Builds lasting domain equity and topical cluster authority.',
    },
    {
      id: 'task-m3-1',
      month: 3,
      monthTitle: 'Month 3 — Expansion',
      task: 'Launch Reverse-IP Enterprise Account Personalization (ABM)',
      category: 'Audience',
      priority: 'P2 — High',
      expectedImpact: 'Lift enterprise landing page engagement by +180% and demo rate from 4.8% to 6.2%',
      effort: '3 Weeks',
      status: 'todo',
      strategicRationale: 'Tailors site experience specifically for highest-margin Fortune 1000 visitors.',
    },
    {
      id: 'task-m3-2',
      month: 3,
      monthTitle: 'Month 3 — Expansion',
      task: 'Publish 2026 Enterprise AI Resolution Benchmark Report',
      category: 'Thought Leadership',
      priority: 'P2 — High',
      expectedImpact: 'Generate 1,200+ gated enterprise downloads and high-authority editorial backlinks',
      effort: '4 Weeks',
      status: 'todo',
      strategicRationale: 'Cements permanent category leadership and earns top-tier media references.',
    },
    {
      id: 'task-m3-3',
      month: 3,
      monthTitle: 'Month 3 — Expansion',
      task: 'Partner & System Integrator Ecosystem Co-Marketing Launch',
      category: 'Partnership',
      priority: 'P3 — Medium',
      expectedImpact: 'Establish 12 certified implementation partners bringing qualified pipeline',
      effort: '3 Weeks',
      status: 'todo',
      strategicRationale: 'Expands market distribution through trusted enterprise advisory firms.',
    },
  ];

  return {
    company: {
      name: companyName,
      industry,
      description: company.description || 'Enterprise Technology Provider',
      products: company.products || 'Core Product Suite',
      targetAudience: company.targetAudience || 'Enterprise & Mid-Market Decision Makers',
      targetGeography: company.targetGeography || 'North America & Europe',
      websiteUrl: company.websiteUrl || 'https://example.com',
    },
    objectives,
    primaryObjective,
    config: {
      ...config,
      persona: activePersona,
      parsedPreferences,
    },
    activePersona,
    executiveSummary,
    kpis,
    keyFindings,
    businessHealth,
    audienceSegments,
    impactEffortTopics,
    contentOpportunities,
    opportunities: rankedOpportunities,
    initialPlanTasks,
    executiveRecommendations: [
      {
        priority: 'Priority 1',
        title: keyFindings[0]?.recommendation || rankedOpportunities[0]?.title || 'Deploy Core Growth Lever',
        why: keyFindings[0]?.whyItMatters || 'Highest ROI strategic intervention.',
        evidence: keyFindings[0]?.evidence || 'Verified by BI telemetry.',
        badgeColor: 'blue',
      },
      {
        priority: 'Priority 2',
        title: keyFindings[1]?.recommendation || rankedOpportunities[1]?.title || 'Optimize Conversion Friction',
        why: keyFindings[1]?.whyItMatters || 'Directly resolves unit economics drag.',
        evidence: keyFindings[1]?.evidence || 'Verified by BI telemetry.',
        badgeColor: 'indigo',
      },
      {
        priority: 'Priority 3',
        title: keyFindings[2]?.recommendation || rankedOpportunities[2]?.title || 'Scale High-Intent Acquisition',
        why: keyFindings[2]?.whyItMatters || 'Captures high-intent buyer shortlists.',
        evidence: keyFindings[2]?.evidence || 'Verified by BI telemetry.',
        badgeColor: 'purple',
      },
    ],
  };
}
