/**
 * Zustand store for proposition state management
 */

import { create } from 'zustand';
import { Proposition, PropositionWithDetails, PropositionPrediction } from '@/types';

interface PropositionState {
  propositions: Proposition[];
  selectedProposition: PropositionWithDetails | null;
  predictions: Record<string, PropositionPrediction>;
  filters: {
    year: number | null;
    category: string | null;
    status: string | null;
    searchQuery: string;
  };
  isLoading: boolean;
  error: string | null;
}

interface PropositionActions {
  setPropositions: (propositions: Proposition[]) => void;
  setSelectedProposition: (proposition: PropositionWithDetails | null) => void;
  setPrediction: (propositionId: string, prediction: PropositionPrediction) => void;
  setFilters: (filters: Partial<PropositionState['filters']>) => void;
  resetFilters: () => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  getFilteredPropositions: () => Proposition[];
}

const initialFilters = {
  year: null,
  category: null,
  status: null,
  searchQuery: '',
};

export const usePropositionStore = create<PropositionState & PropositionActions>((set, get) => ({
  propositions: [],
  selectedProposition: null,
  predictions: {},
  filters: initialFilters,
  isLoading: false,
  error: null,

  setPropositions: (propositions) => set({ propositions }),

  setSelectedProposition: (proposition) => set({ selectedProposition: proposition }),

  setPrediction: (propositionId, prediction) =>
    set((state) => ({
      predictions: {
        ...state.predictions,
        [propositionId]: prediction,
      },
    })),

  setFilters: (filters) =>
    set((state) => ({
      filters: {
        ...state.filters,
        ...filters,
      },
    })),

  resetFilters: () => set({ filters: initialFilters }),

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error }),

  getFilteredPropositions: () => {
    const { propositions, filters } = get();

    return propositions.filter((prop) => {
      const matchesYear = !filters.year || prop.year === filters.year;
      const matchesCategory = !filters.category || prop.category === filters.category;
      const matchesStatus = !filters.status || prop.status === filters.status;
      const matchesSearch =
        !filters.searchQuery ||
        prop.title.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
        prop.summary.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
        prop.number.includes(filters.searchQuery);

      return matchesYear && matchesCategory && matchesStatus && matchesSearch;
    });
  },
}));
