/**
 * What-If Scenario Service
 * Manages scenario creation, storage, and execution
 */

import { apiClient } from '@/lib/api-client';
import {
  Scenario,
  ScenarioParameters,
  ScenarioResults,
  ScenarioPreset,
  SCENARIO_PRESETS,
  ApiResponse,
  PropositionWithDetails,
} from '@/types';
import { generateId } from '@/lib/utils';
import { predictionService } from './prediction-service';

class ScenarioService {
  private basePath = '/scenarios';
  private localScenarios: Map<string, Scenario> = new Map();

  async create(
    basePropositionId: string,
    parameters: ScenarioParameters,
    name?: string
  ): Promise<Scenario> {
    const scenario: Scenario = {
      id: generateId(),
      name: name || `Scenario ${this.localScenarios.size + 1}`,
      basePropositionId,
      parameters,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.localScenarios.set(scenario.id, scenario);
    return scenario;
  }

  async createFromPreset(
    basePropositionId: string,
    presetId: string,
    customOverrides?: Partial<ScenarioParameters>
  ): Promise<Scenario | null> {
    const preset = SCENARIO_PRESETS.find((p) => p.id === presetId);
    if (!preset) {
      return null;
    }

    const parameters = this.mergeParameters(
      this.getDefaultParameters(),
      preset.parameters,
      customOverrides
    );

    return this.create(basePropositionId, parameters, preset.name);
  }

  async run(
    scenario: Scenario,
    proposition: PropositionWithDetails
  ): Promise<ScenarioResults> {
    const results = await predictionService.runScenario(proposition, scenario);

    const updatedScenario: Scenario = {
      ...scenario,
      results,
      updatedAt: new Date().toISOString(),
    };
    this.localScenarios.set(scenario.id, updatedScenario);

    return results;
  }

  async save(scenario: Scenario): Promise<ApiResponse<Scenario>> {
    return apiClient.post<Scenario>(this.basePath, scenario);
  }

  async getById(id: string): Promise<Scenario | undefined> {
    return this.localScenarios.get(id);
  }

  async getByProposition(propositionId: string): Promise<Scenario[]> {
    return Array.from(this.localScenarios.values()).filter(
      (s) => s.basePropositionId === propositionId
    );
  }

  async delete(id: string): Promise<boolean> {
    return this.localScenarios.delete(id);
  }

  async duplicate(id: string, newName?: string): Promise<Scenario | null> {
    const original = this.localScenarios.get(id);
    if (!original) {
      return null;
    }

    const duplicate: Scenario = {
      ...original,
      id: generateId(),
      name: newName || `${original.name} (Copy)`,
      results: undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.localScenarios.set(duplicate.id, duplicate);
    return duplicate;
  }

  async updateParameters(
    id: string,
    parameters: Partial<ScenarioParameters>
  ): Promise<Scenario | null> {
    const scenario = this.localScenarios.get(id);
    if (!scenario) {
      return null;
    }

    const updated: Scenario = {
      ...scenario,
      parameters: this.mergeParameters(scenario.parameters, parameters),
      results: undefined,
      updatedAt: new Date().toISOString(),
    };

    this.localScenarios.set(id, updated);
    return updated;
  }

  getPresets(): ScenarioPreset[] {
    return SCENARIO_PRESETS;
  }

  getDefaultParameters(): ScenarioParameters {
    return {
      funding: {
        supportMultiplier: 1.0,
        oppositionMultiplier: 1.0,
      },
      turnout: {
        overallMultiplier: 1.0,
      },
      framing: {
        titleSentiment: 0,
        summaryComplexity: 'unchanged',
      },
    };
  }

  private mergeParameters(
    ...parameterSets: (Partial<ScenarioParameters> | undefined)[]
  ): ScenarioParameters {
    const base = this.getDefaultParameters();

    for (const params of parameterSets) {
      if (!params) continue;

      if (params.funding) {
        base.funding = { ...base.funding, ...params.funding };
      }
      if (params.turnout) {
        base.turnout = { ...base.turnout, ...params.turnout };
      }
      if (params.framing) {
        base.framing = { ...base.framing, ...params.framing };
      }
      if (params.timing) {
        base.timing = params.timing;
      }
      if (params.opposition) {
        base.opposition = params.opposition;
      }
    }

    return base;
  }

  compareScenarios(scenarios: Scenario[]): ComparisonResult {
    const withResults = scenarios.filter((s) => s.results);

    if (withResults.length === 0) {
      return {
        scenarios: [],
        bestCase: null,
        worstCase: null,
        averageProbability: 0,
        probabilityRange: { min: 0, max: 0 },
      };
    }

    const probabilities = withResults.map((s) => s.results!.newProbability);

    return {
      scenarios: withResults,
      bestCase: withResults.reduce((best, s) =>
        s.results!.newProbability > (best.results?.newProbability || 0) ? s : best
      ),
      worstCase: withResults.reduce((worst, s) =>
        s.results!.newProbability < (worst.results?.newProbability || 1) ? s : worst
      ),
      averageProbability: probabilities.reduce((sum, p) => sum + p, 0) / probabilities.length,
      probabilityRange: {
        min: Math.min(...probabilities),
        max: Math.max(...probabilities),
      },
    };
  }

  clearLocalScenarios(): void {
    this.localScenarios.clear();
  }
}

interface ComparisonResult {
  scenarios: Scenario[];
  bestCase: Scenario | null;
  worstCase: Scenario | null;
  averageProbability: number;
  probabilityRange: {
    min: number;
    max: number;
  };
}

export const scenarioService = new ScenarioService();
export default scenarioService;
