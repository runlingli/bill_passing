/**
 * Service for managing proposition data
 */

import { apiClient } from '@/lib/api-client';
import {
  Proposition,
  PropositionWithDetails,
  PropositionFinance,
  PropositionPrediction,
  PropositionQueryParams,
  ApiResponse,
  PropositionCategory,
} from '@/types';

class PropositionService {
  private basePath = '/propositions';

  async getAll(params?: PropositionQueryParams): Promise<ApiResponse<Proposition[]>> {
    const queryString = params ? this.buildQueryString(params) : '';
    return apiClient.get<Proposition[]>(`${this.basePath}${queryString}`);
  }

  async getById(id: string): Promise<ApiResponse<PropositionWithDetails>> {
    return apiClient.get<PropositionWithDetails>(`${this.basePath}/${id}`);
  }

  async getByYear(year: number): Promise<ApiResponse<Proposition[]>> {
    return apiClient.get<Proposition[]>(`${this.basePath}?year=${year}`);
  }

  async getByCategory(category: PropositionCategory): Promise<ApiResponse<Proposition[]>> {
    return apiClient.get<Proposition[]>(`${this.basePath}?category=${category}`);
  }

  async getUpcoming(): Promise<ApiResponse<Proposition[]>> {
    return apiClient.get<Proposition[]>(`${this.basePath}?status=upcoming`);
  }

  async getHistorical(yearFrom: number, yearTo: number): Promise<ApiResponse<Proposition[]>> {
    return apiClient.get<Proposition[]>(
      `${this.basePath}?yearFrom=${yearFrom}&yearTo=${yearTo}`
    );
  }

  async getFinance(propositionId: string): Promise<ApiResponse<PropositionFinance>> {
    return apiClient.get<PropositionFinance>(`${this.basePath}/${propositionId}/finance`);
  }

  async getPrediction(propositionId: string): Promise<ApiResponse<PropositionPrediction>> {
    return apiClient.get<PropositionPrediction>(`${this.basePath}/${propositionId}/prediction`);
  }

  async search(query: string): Promise<ApiResponse<Proposition[]>> {
    return apiClient.get<Proposition[]>(`${this.basePath}/search?q=${encodeURIComponent(query)}`);
  }

  async getSimilar(propositionId: string, limit = 5): Promise<ApiResponse<Proposition[]>> {
    return apiClient.get<Proposition[]>(
      `${this.basePath}/${propositionId}/similar?limit=${limit}`
    );
  }

  async getCategories(): Promise<ApiResponse<{ category: PropositionCategory; count: number }[]>> {
    return apiClient.get<{ category: PropositionCategory; count: number }[]>(
      `${this.basePath}/categories`
    );
  }

  async getYearSummary(year: number): Promise<ApiResponse<YearSummary>> {
    return apiClient.get<YearSummary>(`${this.basePath}/summary/${year}`);
  }

  private buildQueryString(params: PropositionQueryParams): string {
    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });

    const queryString = searchParams.toString();
    return queryString ? `?${queryString}` : '';
  }
}

interface YearSummary {
  year: number;
  totalPropositions: number;
  passed: number;
  failed: number;
  totalVotes: number;
  avgTurnout: number;
  categoryBreakdown: Record<PropositionCategory, number>;
  totalCampaignSpending: number;
}

export const propositionService = new PropositionService();
export default propositionService;
