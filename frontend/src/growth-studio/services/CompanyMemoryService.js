/**
 * CompanyMemoryService - Persistent Strategic Memory Model
 * 
 * Stores company facts, goals, audience assumptions, recorded decisions, 
 * hypotheses (tested, validated, rejected), validated findings, completed actions, 
 * historical outcomes, and feedback loops.
 */

const STORAGE_KEY = 'aibi_growth_company_memory_v1';

export const DEFAULT_INITIAL_MEMORY = {
  facts: {
    companyName: 'Acme Intelligence',
    industry: 'Enterprise B2B Software / AI',
    coreOfferings: ['Autonomous Support Copilot', 'Omnichannel Ticket Deflector', 'Voice AI Agent'],
    businessModel: 'B2B Enterprise SaaS (Annual Subscriptions + Usage Tiers)',
    primaryAudience: 'Enterprise CX Leaders, VP Customer Support, CIOs',
    coreDifferentiator: 'Sub-second real-time enterprise knowledge graph grounding with zero hallucination guarantee',
  },
  goals: [
    { id: 'g-1', text: 'Generate more qualified enterprise pipeline (ACV > $75k)', status: 'Active', targetDate: 'Q4 2026' },
    { id: 'g-2', text: 'Accelerate organic search & AI engine discoverability', status: 'Active', targetDate: 'Q3 2026' },
  ],
  assumptions: [
    { id: 'asm-1', statement: 'Enterprise buyers require deep compliance and SOC-2 data before booking demos.', status: 'Validated' },
    { id: 'asm-2', statement: 'SMB self-serve can scale profitably without dedicated sales engineering support.', status: 'Refuted by Churn Data' },
    { id: 'asm-3', statement: 'Informational blog traffic will naturally convert to commercial pipeline without dedicated bridge content.', status: 'Refuted by BI Evidence' },
  ],
  decisions: [
    {
      id: 'dec-101',
      date: '3 months ago',
      decision: 'Prioritize Enterprise Customers over SMB Expansion',
      rationale: 'Enterprise delivers 42% of revenue from 18% of traffic with 8.7% baseline conversion.',
      champion: 'Founder / CEO',
      status: 'Active',
      linkedOutcomeId: 'out-101',
    },
    {
      id: 'dec-102',
      date: '6 weeks ago',
      decision: 'Relaunch pricing page CTA for self-serve signups',
      rationale: 'Hypothesized friction on pricing page contact form was lowering conversions.',
      champion: 'Product Growth',
      status: 'Evaluated',
      linkedOutcomeId: 'out-102',
    },
  ],
  outcomes: [
    {
      id: 'out-101',
      decisionId: 'dec-101',
      title: 'Enterprise Traffic vs Conversion Shift',
      observedMetricChange: 'Enterprise traffic increased +27%, but conversion rate declined from 8.7% to 6.1%.',
      resultSynthesis: 'Acquisition messaging succeeded, but landing pages lacked deep enterprise security proof points, creating top-of-funnel leaks.',
      strategicTakeaway: 'Focus on enterprise conversion rate optimization & dedicated solution pages rather than acquiring more untargeted traffic.',
      appliedToCurrentStrategy: true,
    },
    {
      id: 'out-102',
      decisionId: 'dec-102',
      title: 'Pricing Page CTA Impact',
      observedMetricChange: 'SMB signups increased +14%, but enterprise demo requests dropped -29%.',
      resultSynthesis: 'Self-serve CTA de-prioritized enterprise consultative contact for high-value contracts.',
      strategicTakeaway: 'Split pricing experience between SMB Self-Serve and Enterprise Custom Deployment.',
      appliedToCurrentStrategy: true,
    },
  ],
  hypothesesLog: [
    {
      id: 'hyp-1',
      hypothesis: 'Enterprise customers may be the company’s highest-growth opportunity.',
      confidence: 82,
      status: 'Validated with BI',
      evidenceSummary: 'Enterprise accounts for 42% revenue from only 18% traffic; ACV is 6.1x SMB.',
      validatedAt: '2026-10-01',
    },
    {
      id: 'hyp-2',
      hypothesis: 'High-traffic informational blog posts are driving vanity visitors rather than enterprise buyers.',
      confidence: 88,
      status: 'Validated with BI',
      evidenceSummary: '74.2% traffic share generates only 29.2% of pipeline leads due to missing solution bridges.',
      validatedAt: '2026-10-03',
    },
    {
      id: 'hyp-3',
      hypothesis: 'Competitor comparison pages will out-convert general features pages by at least 2x.',
      confidence: 76,
      status: 'Active / Under Verification',
      evidenceSummary: 'Comparison page /compare/zendesk-alternative currently achieves 7.9% conversion.',
      validatedAt: null,
    },
  ],
  completedActions: [
    { id: 'act-1', title: 'Audit organic keyword rankings for Enterprise AI queries', completedDate: '2 weeks ago', impact: 'Identified 14 high-volume zero-click terms' },
    { id: 'act-2', title: 'Instrument segment-level event tracking across pricing page', completedDate: '1 month ago', impact: 'Unlocked granular cohort attribution' },
  ],
};

export class CompanyMemoryService {
  constructor() {
    this.memory = this.loadMemory();
  }

  loadMemory() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // Fallback
    }
    return JSON.parse(JSON.stringify(DEFAULT_INITIAL_MEMORY));
  }

  saveMemory() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.memory));
    } catch {
      // ignore in test / SSR
    }
  }

  getMemory() {
    return this.memory;
  }

  addDecision({ decision, rationale, champion = 'Strategy Team', outcome = null }) {
    const id = `dec-${Date.now()}`;
    const newDecision = {
      id,
      date: 'Just now',
      decision,
      rationale,
      champion,
      status: 'Active',
      linkedOutcomeId: outcome ? `out-${Date.now()}` : null,
    };
    this.memory.decisions.unshift(newDecision);

    if (outcome) {
      this.memory.outcomes.unshift({
        id: newDecision.linkedOutcomeId,
        decisionId: id,
        ...outcome,
        appliedToCurrentStrategy: true,
      });
    }

    this.saveMemory();
    return newDecision;
  }

  recordOutcome(decisionId, outcomeData) {
    const id = `out-${Date.now()}`;
    const record = {
      id,
      decisionId,
      ...outcomeData,
      appliedToCurrentStrategy: true,
    };
    this.memory.outcomes.unshift(record);

    // Update decision status
    const dec = this.memory.decisions.find((d) => d.id === decisionId);
    if (dec) {
      dec.status = 'Evaluated';
      dec.linkedOutcomeId = id;
    }

    this.saveMemory();
    return record;
  }

  addHypothesis(hypothesis) {
    const existing = this.memory.hypothesesLog.find((h) => h.hypothesis === hypothesis.hypothesis);
    if (!existing) {
      this.memory.hypothesesLog.unshift({
        id: `hyp-${Date.now()}`,
        status: 'Active / Under Verification',
        ...hypothesis,
      });
      this.saveMemory();
    }
  }

  updateHypothesisStatus(hypothesisId, status, evidenceSummary) {
    const hyp = this.memory.hypothesesLog.find((h) => h.id === hypothesisId || h.hypothesis.includes(hypothesisId));
    if (hyp) {
      hyp.status = status;
      if (evidenceSummary) hyp.evidenceSummary = evidenceSummary;
      hyp.validatedAt = new Date().toISOString().split('T')[0];
      this.saveMemory();
    }
  }

  resetMemory() {
    this.memory = JSON.parse(JSON.stringify(DEFAULT_INITIAL_MEMORY));
    this.saveMemory();
    return this.memory;
  }
}

export const defaultCompanyMemory = new CompanyMemoryService();
