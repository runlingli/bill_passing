/**
 * Types for What-If Scenario Simulator
 */

export interface Scenario {
  id: string;
  name: string;
  description?: string;
  basePropositionId: string;
  parameters: ScenarioParameters;
  results?: ScenarioResults;
  createdAt: string;
  updatedAt: string;
}

export interface ScenarioParameters {
  funding: FundingScenario;
  turnout: TurnoutScenario;
  framing: FramingScenario;
  timing?: TimingScenario;
  opposition?: OppositionScenario;
}

export interface FundingScenario {
  supportMultiplier: number;
  oppositionMultiplier: number;
  customSupportAmount?: number;
  customOppositionAmount?: number;
}

export interface TurnoutScenario {
  overallMultiplier: number;
  demographicAdjustments?: DemographicTurnoutAdjustment[];
  regionalAdjustments?: RegionalTurnoutAdjustment[];
}

export interface DemographicTurnoutAdjustment {
  demographic: string;
  category: 'age' | 'ethnicity' | 'income' | 'education';
  multiplier: number;
}

export interface RegionalTurnoutAdjustment {
  region: string;
  multiplier: number;
}

export interface FramingScenario {
  titleSentiment: number;
  summaryComplexity: 'simpler' | 'unchanged' | 'complex';
  emphasisShift?: 'economic' | 'social' | 'environmental' | 'none';
  customTitle?: string;
  customSummary?: string;
}

export interface TimingScenario {
  electionType: 'primary' | 'general' | 'special';
  monthOffset: number;
  competingMeasures: number;
}

export interface OppositionScenario {
  organizationLevel: 'minimal' | 'moderate' | 'strong' | 'intense';
  mediaSpendRatio: number;
  endorsements: EndorsementChange[];
}

export interface EndorsementChange {
  entity: string;
  type: 'political' | 'organization' | 'media' | 'celebrity';
  originalPosition: 'support' | 'opposition' | 'neutral';
  newPosition: 'support' | 'opposition' | 'neutral';
  influence: number;
}

export interface ScenarioResults {
  originalProbability: number;
  newProbability: number;
  probabilityDelta: number;
  confidenceInterval: {
    lower: number;
    upper: number;
  };
  factorContributions: FactorContribution[];
  sensitivityAnalysis: SensitivityPoint[];
}

export interface FactorContribution {
  factor: string;
  originalImpact: number;
  adjustedImpact: number;
  contribution: number;
}

export interface SensitivityPoint {
  parameter: string;
  value: number;
  probability: number;
}

export interface ScenarioComparison {
  scenarios: Scenario[];
  baselineProposition: string;
  comparisonMetrics: ComparisonMetric[];
}

export interface ComparisonMetric {
  name: string;
  values: {
    scenarioId: string;
    value: number;
  }[];
}

export type ScenarioPreset = {
  id: string;
  name: string;
  description: string;
  parameters: Partial<ScenarioParameters>;
};

export const SCENARIO_PRESETS: ScenarioPreset[] = [
  {
    id: 'high-turnout',
    name: 'High Turnout Election',
    description: 'Presidential election year with above-average turnout',
    parameters: {
      turnout: { overallMultiplier: 1.3 },
      timing: { electionType: 'general', monthOffset: 0, competingMeasures: 5 },
    },
  },
  {
    id: 'low-turnout',
    name: 'Low Turnout Election',
    description: 'Off-year or special election with reduced turnout',
    parameters: {
      turnout: { overallMultiplier: 0.6 },
      timing: { electionType: 'special', monthOffset: 0, competingMeasures: 1 },
    },
  },
  {
    id: 'well-funded-support',
    name: 'Well-Funded Support Campaign',
    description: 'Support campaign with 2x funding',
    parameters: {
      funding: { supportMultiplier: 2.0, oppositionMultiplier: 1.0 },
    },
  },
  {
    id: 'contested',
    name: 'Highly Contested',
    description: 'Both sides heavily funded with strong opposition',
    parameters: {
      funding: { supportMultiplier: 2.0, oppositionMultiplier: 2.5 },
      opposition: { organizationLevel: 'intense', mediaSpendRatio: 1.2, endorsements: [] },
    },
  },
  {
    id: 'simplified-framing',
    name: 'Simplified Ballot Language',
    description: 'Clearer, simpler ballot wording',
    parameters: {
      framing: { titleSentiment: 0.2, summaryComplexity: 'simpler' },
    },
  },
];
