'use client';

import { useState, useEffect, useCallback } from 'react';
import { Proposition, PropositionWithDetails, PropositionPrediction, ApiResponse } from '@/types';

interface UsePropositionsOptions {
  year?: number;
  category?: string;
  status?: string;
  searchQuery?: string;
}

interface UsePropositionsReturn {
  propositions: Proposition[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function usePropositions(options: UsePropositionsOptions = {}): UsePropositionsReturn {
  const [propositions, setPropositions] = useState<Proposition[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPropositions = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (options.year) params.set('year', options.year.toString());
      if (options.category) params.set('category', options.category);
      if (options.status) params.set('status', options.status);
      if (options.searchQuery) params.set('q', options.searchQuery);

      const response = await fetch(`/api/propositions?${params.toString()}`);
      const data: ApiResponse<Proposition[]> = await response.json();

      if (data.success) {
        setPropositions(data.data);
      } else {
        setError(data.error?.message || 'Failed to fetch propositions');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [options.year, options.category, options.status, options.searchQuery]);

  useEffect(() => {
    fetchPropositions();
  }, [fetchPropositions]);

  return {
    propositions,
    isLoading,
    error,
    refetch: fetchPropositions,
  };
}

interface UsePropositionReturn {
  proposition: PropositionWithDetails | null;
  prediction: PropositionPrediction | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useProposition(id: string): UsePropositionReturn {
  const [proposition, setProposition] = useState<PropositionWithDetails | null>(null);
  const [prediction, setPrediction] = useState<PropositionPrediction | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!id) return;

    setIsLoading(true);
    setError(null);

    try {
      // Fetch proposition and prediction in parallel
      const [propResponse, predResponse] = await Promise.all([
        fetch(`/api/propositions/${id}`),
        fetch(`/api/predictions/${id}`),
      ]);

      const propData: ApiResponse<PropositionWithDetails> = await propResponse.json();
      const predData: ApiResponse<PropositionPrediction> = await predResponse.json();

      if (propData.success) {
        setProposition(propData.data);
      } else {
        setError(propData.error?.message || 'Proposition not found');
      }

      if (predData.success) {
        setPrediction(predData.data);
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    proposition,
    prediction,
    isLoading,
    error,
    refetch: fetchData,
  };
}

export function useFinance(propositionId: string) {
  const [finance, setFinance] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!propositionId) return;

    const fetchFinance = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/propositions/${propositionId}/finance`);
        const data = await response.json();

        if (data.success) {
          setFinance(data.data);
        }
      } catch (err) {
        setError('Failed to fetch finance data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchFinance();
  }, [propositionId]);

  return { finance, isLoading, error };
}
