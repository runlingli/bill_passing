/**
 * Core types for California Proposition data
 */

export interface Proposition {
  id: string;
  number: string;
  year: number;
  electionDate: string;
  title: string;
  summary: string;
  fullText?: string;
  status: PropositionStatus;
  result?: PropositionResult;
  category: PropositionCategory;
  sponsors?: string[];
  opponents?: string[];
}

export type PropositionStatus = 'upcoming' | 'active' | 'passed' | 'failed';

export interface PropositionResult {
  yesVotes: number;
  noVotes: number;
  yesPercentage: number;
  noPercentage: number;
  totalVotes: number;
  turnout: number;
  passed: boolean;
}

export type PropositionCategory =
  | 'taxation'
  | 'education'
  | 'healthcare'
  | 'environment'
  | 'criminal_justice'
  | 'labor'
  | 'housing'
  | 'transportation'
  | 'government'
  | 'civil_rights'
  | 'other';

export interface PropositionFinance {
  propositionId: string;
  totalSupport: number;
  totalOpposition: number;
  supportCommittees: Committee[];
  oppositionCommittees: Committee[];
  topDonors: Donor[];
  lastUpdated: string;
}

export interface Committee {
  id: string;
  name: string;
  position: 'support' | 'opposition';
  totalRaised: number;
  totalSpent: number;
}

export interface Donor {
  name: string;
  amount: number;
  position: 'support' | 'opposition';
  type: 'individual' | 'organization' | 'pac';
}

export type DataQuality = 'strong' | 'moderate' | 'limited';

export interface PropositionPrediction {
  propositionId: string;
  passageProbability: number;
  dataQuality: DataQuality;
  dataSources: string[];
  factors: PredictionFactor[];
  historicalComparison: HistoricalComparison[];
  generatedAt: string;
}

export interface PredictionFactor {
  name: string;
  value: number;
  impact: 'positive' | 'negative' | 'neutral';
  description: string;
  source: string;
  hasRealData: boolean;
}

export interface HistoricalComparison {
  propositionId: string;
  propositionNumber: string;
  year: number;
  similarity: number;
  result: 'passed' | 'failed';
  yesPercentage: number;
}

export interface PropositionWithDetails extends Proposition {
  finance?: PropositionFinance;
  prediction?: PropositionPrediction;
  demographics?: DemographicImpact;
  ballotAnalysis?: BallotWordingAnalysis;
}

export interface BallotWordingAnalysis {
  propositionId: string;
  wordCount: number;
  readabilityScore: number;
  sentimentScore: number;
  complexity: 'simple' | 'moderate' | 'complex';
  keyPhrases: string[];
  comparisonToSimilar: {
    avgWordCount: number;
    avgReadability: number;
  };
}

export interface DemographicImpact {
  propositionId: string;
  statewide: DemographicBreakdown;
  byRegion: RegionalDemographics[];
}

export interface DemographicBreakdown {
  ageGroups: Record<string, VotingPattern>;
  ethnicity: Record<string, VotingPattern>;
  income: Record<string, VotingPattern>;
  education: Record<string, VotingPattern>;
  urbanRural: Record<'urban' | 'suburban' | 'rural', VotingPattern>;
}

export interface VotingPattern {
  population: number;
  estimatedTurnout: number;
  projectedYes: number;
  projectedNo: number;
}

export interface RegionalDemographics {
  region: string;
  counties: string[];
  breakdown: DemographicBreakdown;
}
