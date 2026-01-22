/**
 * Prediction Engine Service
 * Calculates probability of proposition passage based on multiple factors
 */

import { apiClient } from '@/lib/api-client';
import {
  PropositionPrediction,
  PredictionFactor,
  HistoricalComparison,
  PropositionWithDetails,
  ApiResponse,
  Scenario,
  ScenarioResults,
} from '@/types';
import { weightedAverage, clamp } from '@/lib/utils';

interface PredictionInput {
  proposition: PropositionWithDetails;
  includeHistorical?: boolean;
  customWeights?: Partial<FactorWeights>;
}

interface FactorWeights {
  campaignFinance: number;
  historicalSimilarity: number;
  demographics: number;
  ballotWording: number;
  timing: number;
  opposition: number;
}

const DEFAULT_WEIGHTS: FactorWeights = {
  campaignFinance: 0.25,
  historicalSimilarity: 0.20,
  demographics: 0.20,
  ballotWording: 0.15,
  timing: 0.10,
  opposition: 0.10,
};

class PredictionService {
  private basePath = '/predictions';
  private weights: FactorWeights = DEFAULT_WEIGHTS;

  async getPrediction(propositionId: string): Promise<ApiResponse<PropositionPrediction>> {
    return apiClient.get<PropositionPrediction>(`${this.basePath}/${propositionId}`);
  }

  async generatePrediction(input: PredictionInput): Promise<PropositionPrediction> {
    const factors = this.calculateFactors(input.proposition);
    const weights = { ...this.weights, ...input.customWeights };

    const factorValues = factors.map((f) => f.value);
    const factorWeights = factors.map((f) => weights[f.name as keyof FactorWeights] || 0.1);

    const baseProbability = weightedAverage(factorValues, factorWeights);
    const confidence = this.calculateConfidence(factors, input.proposition);

    const historicalComparison = input.includeHistorical
      ? await this.findSimilarPropositions(input.proposition)
      : [];

    return {
      propositionId: input.proposition.id,
      passageProbability: clamp(baseProbability, 0, 1),
      confidence,
      factors,
      historicalComparison,
      generatedAt: new Date().toISOString(),
    };
  }

  calculateFactors(proposition: PropositionWithDetails): PredictionFactor[] {
    const factors: PredictionFactor[] = [];

    factors.push(this.calculateFinanceFactor(proposition));
    factors.push(this.calculateDemographicFactor(proposition));
    factors.push(this.calculateBallotWordingFactor(proposition));
    factors.push(this.calculateTimingFactor(proposition));
    factors.push(this.calculateOppositionFactor(proposition));

    return factors;
  }

  private calculateFinanceFactor(proposition: PropositionWithDetails): PredictionFactor {
    const finance = proposition.finance;
    if (!finance) {
      return {
        name: 'campaignFinance',
        weight: this.weights.campaignFinance,
        value: 0.5,
        impact: 'neutral',
        description: 'Campaign finance data unavailable',
      };
    }

    const total = finance.totalSupport + finance.totalOpposition;
    if (total === 0) {
      return {
        name: 'campaignFinance',
        weight: this.weights.campaignFinance,
        value: 0.5,
        impact: 'neutral',
        description: 'No campaign spending recorded',
      };
    }

    const supportRatio = finance.totalSupport / total;
    const spendingAdvantage = supportRatio - 0.5;

    let value = 0.5 + spendingAdvantage * 0.6;
    value = clamp(value, 0.2, 0.8);

    const impact = spendingAdvantage > 0.1 ? 'positive' : spendingAdvantage < -0.1 ? 'negative' : 'neutral';

    return {
      name: 'campaignFinance',
      weight: this.weights.campaignFinance,
      value,
      impact,
      description: `Support spending ${supportRatio > 0.5 ? 'outpaces' : 'trails'} opposition by ${Math.abs(spendingAdvantage * 100).toFixed(1)}%`,
    };
  }

  private calculateDemographicFactor(proposition: PropositionWithDetails): PredictionFactor {
    const demographics = proposition.demographics;
    if (!demographics) {
      return {
        name: 'demographics',
        weight: this.weights.demographics,
        value: 0.5,
        impact: 'neutral',
        description: 'Demographic analysis unavailable',
      };
    }

    const statewide = demographics.statewide;
    let totalProjectedYes = 0;
    let totalProjectedNo = 0;

    Object.values(statewide.urbanRural).forEach((pattern) => {
      totalProjectedYes += pattern.projectedYes * pattern.estimatedTurnout;
      totalProjectedNo += pattern.projectedNo * pattern.estimatedTurnout;
    });

    const total = totalProjectedYes + totalProjectedNo;
    const value = total > 0 ? totalProjectedYes / total : 0.5;

    const impact = value > 0.55 ? 'positive' : value < 0.45 ? 'negative' : 'neutral';

    return {
      name: 'demographics',
      weight: this.weights.demographics,
      value,
      impact,
      description: `Demographic projections show ${(value * 100).toFixed(1)}% support`,
    };
  }

  private calculateBallotWordingFactor(proposition: PropositionWithDetails): PredictionFactor {
    const analysis = proposition.ballotAnalysis;
    if (!analysis) {
      return {
        name: 'ballotWording',
        weight: this.weights.ballotWording,
        value: 0.5,
        impact: 'neutral',
        description: 'Ballot wording analysis unavailable',
      };
    }

    let value = 0.5;
    value += analysis.sentimentScore * 0.15;
    value += (analysis.readabilityScore / 100 - 0.5) * 0.1;

    if (analysis.complexity === 'simple') {
      value += 0.05;
    } else if (analysis.complexity === 'complex') {
      value -= 0.05;
    }

    value = clamp(value, 0.3, 0.7);

    const impact =
      analysis.sentimentScore > 0.2
        ? 'positive'
        : analysis.sentimentScore < -0.2
          ? 'negative'
          : 'neutral';

    return {
      name: 'ballotWording',
      weight: this.weights.ballotWording,
      value,
      impact,
      description: `Ballot language is ${analysis.complexity} with ${analysis.sentimentScore > 0 ? 'positive' : 'neutral'} framing`,
    };
  }

  private calculateTimingFactor(proposition: PropositionWithDetails): PredictionFactor {
    const electionDate = new Date(proposition.electionDate);
    const month = electionDate.getMonth();
    const isPresidentialYear = electionDate.getFullYear() % 4 === 0;
    const isNovember = month === 10;

    let value = 0.5;

    if (isNovember && isPresidentialYear) {
      value += 0.1;
    } else if (isNovember) {
      value += 0.05;
    } else if (month === 5) {
      value -= 0.05;
    }

    const impact = value > 0.55 ? 'positive' : value < 0.45 ? 'negative' : 'neutral';

    return {
      name: 'timing',
      weight: this.weights.timing,
      value,
      impact,
      description: `${isNovember ? 'November' : 'Off-cycle'} election ${isPresidentialYear ? 'in presidential year' : ''}`,
    };
  }

  private calculateOppositionFactor(proposition: PropositionWithDetails): PredictionFactor {
    const opponents = proposition.opponents || [];
    const finance = proposition.finance;

    let value = 0.5;

    if (opponents.length === 0) {
      value = 0.7;
    } else if (opponents.length > 5) {
      value = 0.35;
    } else {
      value = 0.5 - opponents.length * 0.03;
    }

    if (finance && finance.oppositionCommittees.length > 3) {
      value -= 0.1;
    }

    value = clamp(value, 0.2, 0.8);

    const impact = opponents.length <= 1 ? 'positive' : opponents.length >= 4 ? 'negative' : 'neutral';

    return {
      name: 'opposition',
      weight: this.weights.opposition,
      value,
      impact,
      description: `${opponents.length} organized opposition ${opponents.length === 1 ? 'group' : 'groups'}`,
    };
  }

  private calculateConfidence(factors: PredictionFactor[], proposition: PropositionWithDetails): number {
    let confidence = 0.5;

    const availableData = factors.filter((f) => f.description !== 'unavailable').length;
    confidence += availableData * 0.08;

    if (proposition.finance) {
      const totalSpending = proposition.finance.totalSupport + proposition.finance.totalOpposition;
      if (totalSpending > 10_000_000) {
        confidence += 0.1;
      } else if (totalSpending > 1_000_000) {
        confidence += 0.05;
      }
    }

    return clamp(confidence, 0.3, 0.9);
  }

  private async findSimilarPropositions(
    proposition: PropositionWithDetails
  ): Promise<HistoricalComparison[]> {
    const response = await apiClient.get<HistoricalComparison[]>(
      `/propositions/${proposition.id}/similar`
    );
    return response.success ? response.data : [];
  }

  async runScenario(
    proposition: PropositionWithDetails,
    scenario: Scenario
  ): Promise<ScenarioResults> {
    const originalPrediction = await this.generatePrediction({ proposition });

    const modifiedProposition = this.applyScenarioParameters(proposition, scenario);
    const scenarioPrediction = await this.generatePrediction({ proposition: modifiedProposition });

    const probabilityDelta = scenarioPrediction.passageProbability - originalPrediction.passageProbability;

    return {
      originalProbability: originalPrediction.passageProbability,
      newProbability: scenarioPrediction.passageProbability,
      probabilityDelta,
      confidenceInterval: {
        lower: scenarioPrediction.passageProbability - 0.1,
        upper: scenarioPrediction.passageProbability + 0.1,
      },
      factorContributions: this.calculateFactorContributions(
        originalPrediction.factors,
        scenarioPrediction.factors
      ),
      sensitivityAnalysis: this.runSensitivityAnalysis(proposition, scenario),
    };
  }

  private applyScenarioParameters(
    proposition: PropositionWithDetails,
    scenario: Scenario
  ): PropositionWithDetails {
    const modified = { ...proposition };

    if (scenario.parameters.funding && modified.finance) {
      modified.finance = {
        ...modified.finance,
        totalSupport: modified.finance.totalSupport * scenario.parameters.funding.supportMultiplier,
        totalOpposition: modified.finance.totalOpposition * scenario.parameters.funding.oppositionMultiplier,
      };
    }

    return modified;
  }

  private calculateFactorContributions(
    originalFactors: PredictionFactor[],
    newFactors: PredictionFactor[]
  ): { factor: string; originalImpact: number; adjustedImpact: number; contribution: number }[] {
    return originalFactors.map((original, i) => {
      const adjusted = newFactors[i];
      return {
        factor: original.name,
        originalImpact: original.value * original.weight,
        adjustedImpact: adjusted.value * adjusted.weight,
        contribution: (adjusted.value - original.value) * original.weight,
      };
    });
  }

  private runSensitivityAnalysis(
    _proposition: PropositionWithDetails,
    _scenario: Scenario
  ): { parameter: string; value: number; probability: number }[] {
    return [];
  }

  setWeights(weights: Partial<FactorWeights>): void {
    this.weights = { ...this.weights, ...weights };
  }

  resetWeights(): void {
    this.weights = DEFAULT_WEIGHTS;
  }
}

export const predictionService = new PredictionService();
export default predictionService;
