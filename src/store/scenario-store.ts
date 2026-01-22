/**
 * Zustand store for scenario state management
 */

import { create } from 'zustand';
import { Scenario, ScenarioParameters, ScenarioResults } from '@/types';

interface ScenarioState {
  scenarios: Scenario[];
  activeScenario: Scenario | null;
  isRunning: boolean;
  error: string | null;
}

interface ScenarioActions {
  addScenario: (scenario: Scenario) => void;
  updateScenario: (id: string, updates: Partial<Scenario>) => void;
  removeScenario: (id: string) => void;
  setActiveScenario: (scenario: Scenario | null) => void;
  setScenarioResults: (id: string, results: ScenarioResults) => void;
  setRunning: (isRunning: boolean) => void;
  setError: (error: string | null) => void;
  clearScenarios: () => void;
  getScenariosByProposition: (propositionId: string) => Scenario[];
}

export const useScenarioStore = create<ScenarioState & ScenarioActions>((set, get) => ({
  scenarios: [],
  activeScenario: null,
  isRunning: false,
  error: null,

  addScenario: (scenario) =>
    set((state) => ({
      scenarios: [...state.scenarios, scenario],
    })),

  updateScenario: (id, updates) =>
    set((state) => ({
      scenarios: state.scenarios.map((s) =>
        s.id === id ? { ...s, ...updates, updatedAt: new Date().toISOString() } : s
      ),
    })),

  removeScenario: (id) =>
    set((state) => ({
      scenarios: state.scenarios.filter((s) => s.id !== id),
      activeScenario: state.activeScenario?.id === id ? null : state.activeScenario,
    })),

  setActiveScenario: (scenario) => set({ activeScenario: scenario }),

  setScenarioResults: (id, results) =>
    set((state) => ({
      scenarios: state.scenarios.map((s) =>
        s.id === id ? { ...s, results, updatedAt: new Date().toISOString() } : s
      ),
      activeScenario:
        state.activeScenario?.id === id
          ? { ...state.activeScenario, results, updatedAt: new Date().toISOString() }
          : state.activeScenario,
    })),

  setRunning: (isRunning) => set({ isRunning }),

  setError: (error) => set({ error }),

  clearScenarios: () => set({ scenarios: [], activeScenario: null }),

  getScenariosByProposition: (propositionId) => {
    return get().scenarios.filter((s) => s.basePropositionId === propositionId);
  },
}));
