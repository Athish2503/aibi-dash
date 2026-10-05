/**
 * AI Growth Strategy Studio - Deterministic Mock Analytical Engine & Data Model
 * 
 * Provides internally consistent, realistic data modeling company audience, 
 * search visibility, content intelligence, growth opportunities, and 90-day action roadmaps.
 * Personalizes outputs dynamically according to user objectives and configuration.
 */

export const DEFAULT_DEMO_COMPANY = {
  name: 'Acme Intelligence',
  industry: 'Enterprise B2B Software / AI',
  description: 'AI-powered customer service automation and workforce resolution platform for mid-market and enterprise organizations.',
  products: 'Autonomous Support Copilot, Omnichannel Ticket Deflector, Voice AI Agent, Enterprise Knowledge Graph',
  targetAudience: 'Enterprise Customer Experience & IT Operations Leaders',
  targetGeography: 'North America & Europe',
  websiteUrl: 'https://acmeintel.io',
};

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
    includes: ['website', 'seo', 'content', 'ai_discoverability', 'competitor_analysis', 'campaign_ideas'],
    additionalNotes: 'Focus heavily on enterprise customers. Prioritize website improvements before content.',
  },
}) {
  const companyName = company.name || 'Your Company';
  const industry = company.industry || 'Technology';
  const isEnterpriseFocus = config.targetAudience === 'Enterprise' || config.targetAudience === 'All';
  const isLeadsFocus = primaryObjective === 'leads' || config.primaryFocus === 'Leads';
  const isAuthorityFocus = primaryObjective === 'authority' || config.primaryFocus === 'Authority';
  const isSearchFocus = primaryObjective === 'search' || config.primaryFocus === 'Search';
  const isAIFocus = primaryObjective === 'ai_visibility' || config.primaryFocus === 'AI Visibility';

  // 1. Personalized Executive Summary
  let executiveSummary = '';
  if (isLeadsFocus) {
    executiveSummary = `Your strongest growth opportunity is currently enterprise-focused customer support content and high-intent comparison architecture. Enterprise visitors convert at 4.8% (3.4x higher than SMB), yet your website currently dedicates less than 20% of high-intent page real estate to enterprise procurement, security, and ROI validation.`;
  } else if (isAuthorityFocus) {
    executiveSummary = `Your primary inflection point lies in technical thought leadership and benchmark research. While ${companyName} has strong product capabilities, brand authority score lags category incumbents by 28 points because original benchmark data and third-party validation are currently absent from indexable assets.`;
  } else if (isSearchFocus) {
    executiveSummary = `Your organic search acquisition is bottlenecked by topical fragmentation. High-intent commercial queries around automated customer resolution have 68,000 monthly search demand where ${companyName} ranks on page 2–3. Consolidating into 3 core pillar hubs will yield an estimated +140% organic qualified visitor growth.`;
  } else if (isAIFocus) {
    executiveSummary = `AI answer engines (Perplexity, ChatGPT, Claude) currently reference competitor benchmarks in 74% of queries regarding '${industry}', while ${companyName} is cited in only 11% of answers due to missing structured schema and entity co-citations.`;
  } else {
    executiveSummary = `Your digital performance demonstrates significant latent demand across core product categories. Aligning website conversion paths with verified high-intent buyer personas will accelerate customer acquisition while reducing overall blended acquisition cost by 32%.`;
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

  // 3. Key Findings (Data -> Insight -> Why -> Recommendation)
  const keyFindings = [
    {
      id: 'finding-1',
      title: 'Enterprise audience is under-served on core web paths',
      evidence: 'Enterprise traffic represents 18.2% of total web sessions, but generates 31.4% of total pipeline conversions and 54% of contract value.',
      insight: 'Enterprise buyers are discovering the brand via generic search, but bounce due to lack of dedicated security, compliance, and enterprise deployment specifications.',
      whyItMatters: 'Enterprise contracts yield 6.2x higher Annual Contract Value ($48k vs $7.7k SMB). Every 1% improvement in enterprise conversion unlocks $180k+ in quarterly pipeline.',
      recommendation: 'Deploy dedicated Enterprise Solution hub with SOC2 compliance verification, ROI calculator, and tailored sales-assisted demo flows.',
      priority: 'Critical',
      category: 'Audience & Conversion',
    },
    {
      id: 'finding-2',
      title: 'High-intent "Alternative / Competitor" search has zero coverage',
      evidence: 'Over 14,200 monthly commercial searches query "[Top Competitor] alternatives" and "AI support platform comparison", with zero dedicated indexable assets on your domain.',
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
      recommendation: 'Switch to a 2-step progressive form with instant interactive interactive product tour preview while capturing email first.',
      priority: 'Medium',
      category: 'Website & UX',
    },
  ];

  // 4. Business Health Scores (0-100 Analytical Scores with clear disclaimers)
  const businessHealth = [
    {
      id: 'audience_fit',
      category: 'Audience Fit',
      score: 78,
      status: 'Strong',
      currentState: 'Strong alignment with technical practitioners, moderate alignment with executive buyers.',
      evidence: '38% of visits match developer / architect persona; 18% match VP/C-level decision makers.',
      problem: 'Technical buyers evaluate the product enthusiastically, but lack executive-ready business cases to secure internal budget approval.',
      recommendation: 'Produce downloadable Executive Value Briefs and TCO (Total Cost of Ownership) calculators tailored for VP/C-level sponsors.',
    },
    {
      id: 'search_visibility',
      category: 'Search Visibility',
      score: 64,
      status: 'Moderate',
      currentState: 'Ranks on page 1 for brand terms and niche technical queries, page 2-3 for high-volume commercial keywords.',
      evidence: 'Domain has 312 ranked keywords in Top 10, but only 14 keywords with >1,000 monthly search volume in Top 3.',
      problem: 'Top-ranking pages are scattered blog posts rather than structured, authoritative topic clusters with internal link equity.',
      recommendation: 'Consolidate 18 disparate blog posts into 3 authoritative Cornerstone Pillar Guides with structured topical interlinking.',
    },
    {
      id: 'content_strength',
      category: 'Content Strength',
      score: 58,
      status: 'Needs Attention',
      currentState: 'Good educational top-of-funnel content, critical gaps in middle-and-bottom-of-funnel decision enablement.',
      evidence: '42% overall topic coverage. 81% coverage of "What is AI Support", but only 19% coverage of "Implementation & Migration".',
      problem: 'Prospective customers who finish reading informational articles have no clear logical bridge to commercial evaluation.',
      recommendation: 'Build 5 in-depth Migration Playbooks and ROI case studies directly linked from top-performing educational posts.',
    },
    {
      id: 'ai_discoverability',
      category: 'AI Discoverability',
      score: 36,
      status: 'Needs Attention',
      currentState: 'Minimal entity grounding across generative AI search models (ChatGPT, Perplexity, Google AI Overviews).',
      evidence: 'Presence in 11% of AI answer outputs; zero citations on technical feature comparison queries.',
      problem: 'Site architecture relies on client-rendered widgets and unindexed marketing brochures that LLM web crawlers cannot parse effectively.',
      recommendation: 'Deploy clean markdown-friendly documentation, FAQ JSON-LD schemas, and press releases establishing verifiable corporate entities.',
    },
    {
      id: 'conversion_readiness',
      category: 'Conversion Readiness',
      score: 61,
      status: 'Moderate',
      currentState: 'Adequate static forms, limited interactive demonstration or self-serve value exploration.',
      evidence: 'Blended conversion rate of 3.34% vs top-quartile B2B benchmark of 5.2%.',
      problem: 'High barrier to entry: requires a live 30-minute sales call before the user can see any aspect of the software in action.',
      recommendation: 'Embed an interactive 90-second sandbox walkthrough on the homepage and core product pages with embedded lead capture.',
    },
    {
      id: 'competitive_position',
      category: 'Competitive Position',
      score: 71,
      status: 'Strong',
      currentState: 'Differentiated product capabilities around speed and accuracy, but out-marketed by legacy incumbents in share of voice.',
      evidence: 'Competitor A maintains 4.2x organic search volume; Competitor B dominates review platform sponsorship badges.',
      problem: 'Market perception assumes legacy players have better enterprise readiness despite Acme having modern architecture.',
      recommendation: 'Position against legacy technical debt: highlight latency, API-first architecture, and 10x faster deployment time.',
    },
  ];

  // 5. Audience Intelligence (Who should the company focus on?)
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

  // 6. Content Intelligence: Topics, Matrix (Effort vs Impact), Opportunities
  const impactEffortTopics = [
    {
      id: 'topic-1',
      title: 'Enterprise AI Support SLA & Compliance Guide',
      effort: 3, // 1 to 10
      impact: 9, // 1 to 10
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

  // 7. Opportunity Center Cards (Not a plain table)
  const opportunities = [
    {
      id: 'opp-1',
      title: 'Enterprise Trust & Security Architecture Hub',
      category: 'Website',
      priority: 'P1 — Critical',
      impact: 'High',
      relevanceScore: 98,
      effortWeeks: '2 Weeks',
      confidence: '95%',
      whyThisMatters: 'Enterprise conversion is 4.8% but drops to 0.6% on visits without security validation. 72% of stalled enterprise deals cite security documentation delay.',
      recommendedAction: 'Build a public-facing Trust Center detailing SOC2 Type II, ISO 27001, GDPR, encryption keys, and sub-processor lists with downloadable security packet.',
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
      whyThisMatters: 'Over 24,000 high-intent monthly searches query competitors. Capturing just 3% of this organic traffic equals 720 high-intent evaluation visits per month.',
      recommendedAction: 'Publish 4 transparent comparison pages: Acme vs Zendesk, Acme vs Intercom, Acme vs Freshdesk, and Acme vs Salesforce Service Cloud with objective evaluation criteria.',
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
      whyThisMatters: 'Executive sponsors require economic justification before authorizing pilot budgets. Self-serve calculation increases lead capture velocity by 2.4x.',
      recommendedAction: 'Deploy an interactive ROI calculator allowing prospective clients to input their ticket volume and agent count, instantly calculating deflection savings.',
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
      whyThisMatters: 'Generative search engines (Perplexity, ChatGPT Search, Gemini) synthesize answers from structured entity graphs. Acme is currently missing from 89% of industry prompts.',
      recommendedAction: 'Embed JSON-LD Organization, Product, and FAQPage schemas across all product documentation and establish citations in trusted industry directories.',
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
      whyThisMatters: 'Enterprise visitors who see generic startup copy bounce within 22 seconds. Showing role-relevant messaging increases time on site by 180%.',
      recommendedAction: 'Implement reverse IP company lookup (Clearbit/6sense) to customize homepage hero copy and case study logos for Fortune 1000 visitors.',
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
      whyThisMatters: '18 short blog posts compete against each other for the same primary keywords, causing keyword cannibalization and suppressing rankings to page 2.',
      recommendedAction: 'Merge thin content into 3 comprehensive, canonical Pillar Hubs: (1) AI Ticket Deflection, (2) Autonomous Support Architecture, and (3) Omnichannel Resolution.',
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

  // 8. 90-Day Action Plan (Month 1 Foundation -> Month 2 Authority -> Month 3 Expansion)
  const initialPlanTasks = [
    // Month 1: Foundation (Website and structural improvements)
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

    // Month 2: Authority (Content and audience expansion)
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
      strategicRationale: 'Builds lasting domain equity and topical topical cluster authority.',
    },

    // Month 3: Expansion (Optimization and new opportunities)
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
    config,
    executiveSummary,
    kpis,
    keyFindings,
    businessHealth,
    audienceSegments,
    impactEffortTopics,
    contentOpportunities,
    opportunities,
    initialPlanTasks,
  };
}
