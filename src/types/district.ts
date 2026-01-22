/**
 * Types for District Impact Analysis
 */

export interface District {
  id: string;
  name: string;
  type: DistrictType;
  code: string;
  counties: string[];
  population: number;
  registeredVoters: number;
  demographics: DistrictDemographics;
}

export type DistrictType =
  | 'congressional'
  | 'state_senate'
  | 'state_assembly'
  | 'county'
  | 'city';

export interface DistrictDemographics {
  medianIncome: number;
  medianAge: number;
  ethnicBreakdown: Record<string, number>;
  educationLevels: Record<string, number>;
  urbanRuralSplit: {
    urban: number;
    suburban: number;
    rural: number;
  };
  voterRegistration: {
    democratic: number;
    republican: number;
    independent: number;
    other: number;
  };
}

export interface DistrictResult {
  districtId: string;
  propositionId: string;
  yesVotes: number;
  noVotes: number;
  yesPercentage: number;
  turnout: number;
}

export interface PartisanBalance {
  districtId: string;
  currentBalance: PartisanMetrics;
  projectedBalance?: PartisanMetrics;
  change?: PartisanChange;
}

export interface PartisanMetrics {
  democraticAdvantage: number;
  competitivenessIndex: number;
  swingPotential: number;
  voterEngagement: number;
}

export interface PartisanChange {
  balanceShift: number;
  direction: 'democratic' | 'republican' | 'neutral';
  significance: 'minimal' | 'moderate' | 'significant';
  driverFactors: string[];
}

export interface PropositionImpact {
  propositionId: string;
  statewide: StatewideImpact;
  districts: DistrictImpactDetail[];
  summary: ImpactSummary;
}

export interface StatewideImpact {
  totalAffectedDistricts: number;
  averageBalanceShift: number;
  netDirection: 'democratic' | 'republican' | 'mixed';
  competitivenessChange: number;
}

export interface DistrictImpactDetail {
  districtId: string;
  districtName: string;
  districtType: DistrictType;
  currentPartisan: PartisanMetrics;
  projectedPartisan: PartisanMetrics;
  change: PartisanChange;
  keyFactors: ImpactFactor[];
  historicalContext: HistoricalDistrictData[];
}

export interface ImpactFactor {
  name: string;
  description: string;
  magnitude: number;
  direction: 'positive' | 'negative';
}

export interface HistoricalDistrictData {
  year: number;
  propositionNumber: string;
  voteShare: number;
  turnout: number;
  partisanBalance: number;
}

export interface ImpactSummary {
  totalDistricts: number;
  impactedDistricts: {
    significant: number;
    moderate: number;
    minimal: number;
  };
  shiftDistribution: {
    democratic: number;
    republican: number;
    unchanged: number;
  };
  competitivenessChange: {
    moreCompetitive: number;
    lessCompetitive: number;
    unchanged: number;
  };
  representationImpact: string;
}

export interface DistrictComparison {
  districts: DistrictImpactDetail[];
  sortBy: 'impact' | 'population' | 'competitiveness' | 'name';
  filterBy?: {
    type?: DistrictType;
    minImpact?: number;
    direction?: 'democratic' | 'republican';
  };
}

export interface DistrictMapData {
  districtId: string;
  coordinates: GeoJSON.Geometry;
  metrics: {
    partisanBalance: number;
    turnout: number;
    impactMagnitude: number;
  };
  displayProperties: {
    fillColor: string;
    strokeColor: string;
    opacity: number;
  };
}

export interface RegionAggregate {
  regionName: string;
  districts: string[];
  totalPopulation: number;
  aggregateMetrics: {
    avgPartisanBalance: number;
    avgTurnout: number;
    totalImpact: number;
  };
}

export type CaliforniaRegion =
  | 'Bay Area'
  | 'Los Angeles'
  | 'San Diego'
  | 'Central Valley'
  | 'Central Coast'
  | 'Inland Empire'
  | 'Sacramento'
  | 'North Coast'
  | 'Sierra Nevada';

export const CALIFORNIA_REGIONS: Record<CaliforniaRegion, string[]> = {
  'Bay Area': ['San Francisco', 'San Mateo', 'Santa Clara', 'Alameda', 'Contra Costa', 'Marin', 'Sonoma', 'Napa', 'Solano'],
  'Los Angeles': ['Los Angeles', 'Ventura'],
  'San Diego': ['San Diego', 'Imperial'],
  'Central Valley': ['Fresno', 'Kern', 'Tulare', 'Stanislaus', 'San Joaquin', 'Merced', 'Madera', 'Kings'],
  'Central Coast': ['Santa Barbara', 'San Luis Obispo', 'Monterey', 'Santa Cruz'],
  'Inland Empire': ['Riverside', 'San Bernardino'],
  'Sacramento': ['Sacramento', 'Placer', 'El Dorado', 'Yolo'],
  'North Coast': ['Humboldt', 'Mendocino', 'Del Norte', 'Lake'],
  'Sierra Nevada': ['Nevada', 'Tuolumne', 'Calaveras', 'Amador', 'Alpine', 'Mono', 'Inyo'],
};
