/**
 * API-related types for data fetching and responses
 */

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  error?: ApiError;
  meta?: ApiMeta;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface ApiMeta {
  page?: number;
  perPage?: number;
  total?: number;
  totalPages?: number;
  cached?: boolean;
  cachedAt?: string;
}

export interface PaginationParams {
  page?: number;
  perPage?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface FilterParams {
  year?: number;
  yearFrom?: number;
  yearTo?: number;
  category?: string;
  status?: string;
  searchQuery?: string;
}

export interface PropositionQueryParams extends PaginationParams, FilterParams {
  includeFinance?: boolean;
  includePrediction?: boolean;
  includeDemographics?: boolean;
}

export interface CalAccessFilingResponse {
  filingId: string;
  committeeId: string;
  committeeName: string;
  filingType: string;
  amount: number;
  filingDate: string;
  supportOppose: 'support' | 'oppose';
  measureNumber: string;
}

export interface CensusDataResponse {
  state: string;
  county?: string;
  tract?: string;
  population: number;
  demographics: {
    [key: string]: number | string;
  };
}

export interface CivicInfoResponse {
  kind: string;
  normalizedInput: {
    line1?: string;
    city: string;
    state: string;
    zip: string;
  };
  divisions: Record<string, CivicDivision>;
  offices: CivicOffice[];
  officials: CivicOfficial[];
}

export interface CivicDivision {
  name: string;
  officeIndices?: number[];
}

export interface CivicOffice {
  name: string;
  divisionId: string;
  levels?: string[];
  roles?: string[];
  officialIndices: number[];
}

export interface CivicOfficial {
  name: string;
  party?: string;
  phones?: string[];
  urls?: string[];
  emails?: string[];
  channels?: {
    type: string;
    id: string;
  }[];
}

export interface DataSourceStatus {
  source: DataSource;
  status: 'online' | 'offline' | 'degraded';
  lastChecked: string;
  latency?: number;
  errorMessage?: string;
}

export type DataSource =
  | 'cal-access'
  | 'census'
  | 'google-civic'
  | 'sos-ca'
  | 'ballotpedia';

export interface ExternalLink {
  source: DataSource;
  url: string;
  label: string;
  description?: string;
}

export const DATA_SOURCE_URLS: Record<DataSource, string> = {
  'cal-access': 'https://cal-access.sos.ca.gov/',
  'census': 'https://www.census.gov/programs-surveys/acs.html',
  'google-civic': 'https://developers.google.com/civic-information',
  'sos-ca': 'https://www.sos.ca.gov/elections/ballot-measures',
  'ballotpedia': 'https://ballotpedia.org/California_ballot_propositions',
};
