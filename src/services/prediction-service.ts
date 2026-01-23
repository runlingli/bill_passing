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
  campaignFinance: 0.30,    // Money is very influential
  historicalSimilarity: 0.10, // Less weight - we don't have good data for this
  demographics: 0.15,        // Demographics matter but hard to change
  ballotWording: 0.20,       // Framing has significant impact
  timing: 0.15,              // Turnout/timing matters
  opposition: 0.10,          // Opposition organization
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
    const spendingAdvantage = supportRatio - 0.5; // -0.5 to +0.5

    // More aggressive scaling - money has big impact
    // A 2:1 spending advantage (67% vs 33%) = +0.17 advantage = ~0.67 probability
    // A 4:1 spending advantage (80% vs 20%) = +0.30 advantage = ~0.80 probability
    let value = 0.5 + spendingAdvantage * 0.8;
    value = clamp(value, 0.2, 0.8);

    const impact = spendingAdvantage > 0.08 ? 'positive' : spendingAdvantage < -0.08 ? 'negative' : 'neutral';

    const formatMoney = (n: number) => {
      if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
      if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
      return `$${n}`;
    };

    return {
      name: 'campaignFinance',
      weight: this.weights.campaignFinance,
      value,
      impact,
      description: `Support ${formatMoney(finance.totalSupport)} vs Opposition ${formatMoney(finance.totalOpposition)} (${(supportRatio * 100).toFixed(0)}% support share)`,
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

    // Sentiment has significant impact (-1 to +1 scale)
    // Positive framing can swing votes by up to 20%
    value += analysis.sentimentScore * 0.20;

    // Readability affects understanding (0-100 scale)
    // Higher readability = more people understand = generally helps passage
    value += (analysis.readabilityScore / 100 - 0.5) * 0.15;

    // Complexity affects voter decision
    if (analysis.complexity === 'simple') {
      value += 0.08; // Simple language helps
    } else if (analysis.complexity === 'complex') {
      value -= 0.08; // Complex language hurts (voters vote no when confused)
    }

    value = clamp(value, 0.25, 0.75);

    const impact =
      analysis.sentimentScore > 0.15
        ? 'positive'
        : analysis.sentimentScore < -0.15
          ? 'negative'
          : 'neutral';

    const sentimentDesc = analysis.sentimentScore > 0.1 ? 'positive' :
                          analysis.sentimentScore < -0.1 ? 'negative' : 'neutral';

    return {
      name: 'ballotWording',
      weight: this.weights.ballotWording,
      value,
      impact,
      description: `${analysis.complexity} language with ${sentimentDesc} framing (readability: ${analysis.readabilityScore.toFixed(0)})`,
    };
  }

  private calculateTimingFactor(proposition: PropositionWithDetails): PredictionFactor {
    const electionDate = new Date(proposition.electionDate);
    const month = electionDate.getMonth();
    const isPresidentialYear = electionDate.getFullYear() % 4 === 0;
    const isNovember = month === 10;

    // Check for turnout multiplier from scenario
    const turnoutMultiplier = (proposition as PropositionWithDetails & { turnoutMultiplier?: number }).turnoutMultiplier || 1.0;

    let value = 0.5;

    // Base timing effects
    if (isNovember && isPresidentialYear) {
      value += 0.1;
    } else if (isNovember) {
      value += 0.05;
    } else if (month === 5) {
      value -= 0.05;
    }

    // High turnout generally helps progressive measures, low turnout helps conservative measures
    // This is a simplified model - in reality it depends on the proposition type
    if (turnoutMultiplier > 1.0) {
      // Higher turnout - slight boost for most measures
      value += (turnoutMultiplier - 1.0) * 0.15;
    } else if (turnoutMultiplier < 1.0) {
      // Lower turnout - slight decrease
      value -= (1.0 - turnoutMultiplier) * 0.1;
    }

    value = clamp(value, 0.3, 0.7);

    const impact = value > 0.55 ? 'positive' : value < 0.45 ? 'negative' : 'neutral';

    let description = `${isNovember ? 'November' : 'Off-cycle'} election ${isPresidentialYear ? 'in presidential year' : ''}`;
    if (turnoutMultiplier !== 1.0) {
      description += ` with ${turnoutMultiplier > 1 ? 'high' : 'low'} turnout (${(turnoutMultiplier * 100).toFixed(0)}%)`;
    }

    return {
      name: 'timing',
      weight: this.weights.timing,
      value,
      impact,
      description,
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
    let confidence = 0.4; // Start lower

    // Check for factors with actual data (not "unavailable" in description)
    const availableFactors = factors.filter((f) => !f.description.toLowerCase().includes('unavailable'));
    confidence += availableFactors.length * 0.05; // 5% per available factor

    // Bonus for having finance data with significant spending
    if (proposition.finance) {
      const totalSpending = proposition.finance.totalSupport + proposition.finance.totalOpposition;
      if (totalSpending > 50_000_000) {
        confidence += 0.15;
      } else if (totalSpending > 10_000_000) {
        confidence += 0.10;
      } else if (totalSpending > 1_000_000) {
        confidence += 0.05;
      }
    }

    // Bonus for having demographic data
    if (proposition.demographics) {
      confidence += 0.05;
    }

    // Bonus for having ballot analysis
    if (proposition.ballotAnalysis) {
      confidence += 0.05;
    }

    // Historical propositions with results have higher confidence
    if (proposition.result) {
      confidence += 0.1;
    }

    return clamp(confidence, 0.3, 0.85);
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

    // Apply funding changes
    if (scenario.parameters.funding && modified.finance) {
      modified.finance = {
        ...modified.finance,
        totalSupport: modified.finance.totalSupport * scenario.parameters.funding.supportMultiplier,
        totalOpposition: modified.finance.totalOpposition * scenario.parameters.funding.oppositionMultiplier,
      };
    }

    // Apply turnout changes - affects demographic projections
    if (scenario.parameters.turnout && scenario.parameters.turnout.overallMultiplier !== 1.0) {
      // Store turnout multiplier for use in factor calculation
      (modified as PropositionWithDetails & { turnoutMultiplier?: number }).turnoutMultiplier =
        scenario.parameters.turnout.overallMultiplier;
    }

    // Apply framing changes - affects ballot wording analysis
    if (scenario.parameters.framing) {
      const currentAnalysis = modified.ballotAnalysis || {
        propositionId: modified.id,
        wordCount: 150,
        readabilityScore: 50,
        sentimentScore: 0,
        complexity: 'moderate' as const,
        keyPhrases: [],
        comparisonToSimilar: {
          avgWordCount: 150,
          avgReadability: 50,
        },
      };

      const newSentiment = currentAnalysis.sentimentScore + scenario.parameters.framing.titleSentiment;
      let newReadability = currentAnalysis.readabilityScore;
      let newComplexity: 'simple' | 'moderate' | 'complex' = currentAnalysis.complexity;

      // Apply complexity changes
      if (scenario.parameters.framing.summaryComplexity === 'simpler') {
        newReadability = Math.min(100, currentAnalysis.readabilityScore + 20);
        newComplexity = 'simple';
      } else if (scenario.parameters.framing.summaryComplexity === 'complex') {
        newReadability = Math.max(0, currentAnalysis.readabilityScore - 20);
        newComplexity = 'complex';
      }

      modified.ballotAnalysis = {
        ...currentAnalysis,
        sentimentScore: clamp(newSentiment, -1, 1),
        readabilityScore: newReadability,
        complexity: newComplexity,
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
