/**
 * District Impact Analysis Service
 * Analyzes how proposition passage affects district-level partisan balance
 */

import { apiClient } from '@/lib/api-client';
import {
  District,
  DistrictType,
  DistrictResult,
  PartisanBalance,
  PartisanChange,
  PropositionImpact,
  DistrictImpactDetail,
  ImpactSummary,
  CaliforniaRegion,
  CALIFORNIA_REGIONS,
  RegionAggregate,
  ApiResponse,
} from '@/types';
import { clamp } from '@/lib/utils';

class DistrictService {
  private basePath = '/districts';

  async getAll(type?: DistrictType): Promise<ApiResponse<District[]>> {
    const query = type ? `?type=${type}` : '';
    return apiClient.get<District[]>(`${this.basePath}${query}`);
  }

  async getById(id: string): Promise<ApiResponse<District>> {
    return apiClient.get<District>(`${this.basePath}/${id}`);
  }

  async getByCounty(county: string): Promise<ApiResponse<District[]>> {
    return apiClient.get<District[]>(`${this.basePath}?county=${encodeURIComponent(county)}`);
  }

  async getDistrictResults(
    districtId: string,
    propositionId: string
  ): Promise<ApiResponse<DistrictResult>> {
    return apiClient.get<DistrictResult>(
      `${this.basePath}/${districtId}/results/${propositionId}`
    );
  }

  async getPartisanBalance(districtId: string): Promise<ApiResponse<PartisanBalance>> {
    return apiClient.get<PartisanBalance>(`${this.basePath}/${districtId}/partisan-balance`);
  }

  async analyzePropositionImpact(propositionId: string): Promise<PropositionImpact> {
    const districtsResponse = await this.getAll();
    if (!districtsResponse.success) {
      throw new Error('Failed to fetch districts');
    }

    const districts = districtsResponse.data;
    const districtImpacts: DistrictImpactDetail[] = [];

    for (const district of districts) {
      const impact = await this.calculateDistrictImpact(district, propositionId);
      districtImpacts.push(impact);
    }

    const statewideImpact = this.calculateStatewideImpact(districtImpacts);
    const summary = this.generateImpactSummary(districtImpacts);

    return {
      propositionId,
      statewide: statewideImpact,
      districts: districtImpacts,
      summary,
    };
  }

  private async calculateDistrictImpact(
    district: District,
    _propositionId: string
  ): Promise<DistrictImpactDetail> {
    const currentPartisan = this.calculatePartisanMetrics(district);

    const projectedPartisan = this.projectPostPassageMetrics(currentPartisan, district);

    const change = this.calculateChange(currentPartisan, projectedPartisan);

    return {
      districtId: district.id,
      districtName: district.name,
      districtType: district.type,
      currentPartisan,
      projectedPartisan,
      change,
      keyFactors: this.identifyKeyFactors(district, change),
      historicalContext: [],
    };
  }

  private calculatePartisanMetrics(district: District): PartisanBalance['currentBalance'] {
    const { voterRegistration } = district.demographics;
    const totalRegistered = Object.values(voterRegistration).reduce((sum, v) => sum + v, 0);

    const democraticAdvantage =
      ((voterRegistration.democratic - voterRegistration.republican) / totalRegistered) * 100;

    const marginOfDifference =
      Math.abs(voterRegistration.democratic - voterRegistration.republican) / totalRegistered;
    const competitivenessIndex = 1 - marginOfDifference;

    const independentShare = voterRegistration.independent / totalRegistered;
    const swingPotential = independentShare + competitivenessIndex * 0.3;

    const estimatedTurnout = this.estimateTurnout(district);

    return {
      democraticAdvantage,
      competitivenessIndex: clamp(competitivenessIndex, 0, 1),
      swingPotential: clamp(swingPotential, 0, 1),
      voterEngagement: estimatedTurnout,
    };
  }

  private estimateTurnout(district: District): number {
    const { medianIncome, educationLevels, urbanRuralSplit } = district.demographics;

    let baseTurnout = 0.55;

    if (medianIncome > 100000) baseTurnout += 0.1;
    else if (medianIncome > 75000) baseTurnout += 0.05;
    else if (medianIncome < 40000) baseTurnout -= 0.05;

    const collegeEducated =
      (educationLevels['bachelors'] || 0) + (educationLevels['graduate'] || 0);
    if (collegeEducated > 0.4) baseTurnout += 0.08;
    else if (collegeEducated > 0.25) baseTurnout += 0.04;

    if (urbanRuralSplit.urban > 0.7) baseTurnout += 0.03;
    if (urbanRuralSplit.rural > 0.5) baseTurnout -= 0.02;

    return clamp(baseTurnout, 0.3, 0.85);
  }

  private projectPostPassageMetrics(
    current: PartisanBalance['currentBalance'],
    district: District
  ): PartisanBalance['currentBalance'] {
    const registrationShift = this.estimateRegistrationShift(district);

    return {
      democraticAdvantage: current.democraticAdvantage + registrationShift,
      competitivenessIndex: clamp(
        current.competitivenessIndex + Math.abs(registrationShift) * 0.01,
        0,
        1
      ),
      swingPotential: clamp(current.swingPotential - Math.abs(registrationShift) * 0.02, 0, 1),
      voterEngagement: clamp(current.voterEngagement + registrationShift * 0.01, 0.3, 0.9),
    };
  }

  private estimateRegistrationShift(district: District): number {
    const { medianAge, urbanRuralSplit, medianIncome } = district.demographics;

    let shift = 0;

    if (medianAge < 35) shift += 0.5;
    else if (medianAge > 55) shift -= 0.3;

    if (urbanRuralSplit.urban > 0.6) shift += 0.3;
    else if (urbanRuralSplit.rural > 0.5) shift -= 0.2;

    if (medianIncome < 50000) shift += 0.2;
    else if (medianIncome > 150000) shift -= 0.1;

    return clamp(shift, -2, 2);
  }

  private calculateChange(
    current: PartisanBalance['currentBalance'],
    projected: PartisanBalance['currentBalance']
  ): PartisanChange {
    const balanceShift = projected.democraticAdvantage - current.democraticAdvantage;

    let direction: PartisanChange['direction'] = 'neutral';
    if (balanceShift > 0.5) direction = 'democratic';
    else if (balanceShift < -0.5) direction = 'republican';

    let significance: PartisanChange['significance'] = 'minimal';
    if (Math.abs(balanceShift) > 2) significance = 'significant';
    else if (Math.abs(balanceShift) > 1) significance = 'moderate';

    return {
      balanceShift,
      direction,
      significance,
      driverFactors: this.identifyDriverFactors(balanceShift),
    };
  }

  private identifyDriverFactors(balanceShift: number): string[] {
    const factors: string[] = [];

    if (balanceShift > 0) {
      factors.push('Urban population growth');
      factors.push('Younger voter demographics');
    } else if (balanceShift < 0) {
      factors.push('Suburban shift patterns');
      factors.push('Economic policy alignment');
    }

    return factors;
  }

  private identifyKeyFactors(
    district: District,
    change: PartisanChange
  ): DistrictImpactDetail['keyFactors'] {
    const factors: DistrictImpactDetail['keyFactors'] = [];

    if (district.demographics.urbanRuralSplit.urban > 0.6) {
      factors.push({
        name: 'Urban concentration',
        description: 'High urban population influences policy reception',
        magnitude: 0.7,
        direction: change.direction === 'democratic' ? 'positive' : 'negative',
      });
    }

    if (district.demographics.medianAge < 40) {
      factors.push({
        name: 'Young electorate',
        description: 'Younger voters more likely to support progressive measures',
        magnitude: 0.5,
        direction: 'positive',
      });
    }

    return factors;
  }

  private calculateStatewideImpact(districts: DistrictImpactDetail[]): PropositionImpact['statewide'] {
    const totalAffected = districts.filter((d) => d.change.significance !== 'minimal').length;

    const avgShift =
      districts.reduce((sum, d) => sum + d.change.balanceShift, 0) / districts.length;

    const democraticShifts = districts.filter((d) => d.change.direction === 'democratic').length;
    const republicanShifts = districts.filter((d) => d.change.direction === 'republican').length;

    let netDirection: 'democratic' | 'republican' | 'mixed' = 'mixed';
    if (democraticShifts > republicanShifts * 1.5) netDirection = 'democratic';
    else if (republicanShifts > democraticShifts * 1.5) netDirection = 'republican';

    const avgCompetitivenessChange =
      districts.reduce(
        (sum, d) => sum + (d.projectedPartisan.competitivenessIndex - d.currentPartisan.competitivenessIndex),
        0
      ) / districts.length;

    return {
      totalAffectedDistricts: totalAffected,
      averageBalanceShift: avgShift,
      netDirection,
      competitivenessChange: avgCompetitivenessChange,
    };
  }

  private generateImpactSummary(districts: DistrictImpactDetail[]): ImpactSummary {
    const impacted = {
      significant: districts.filter((d) => d.change.significance === 'significant').length,
      moderate: districts.filter((d) => d.change.significance === 'moderate').length,
      minimal: districts.filter((d) => d.change.significance === 'minimal').length,
    };

    const shiftDistribution = {
      democratic: districts.filter((d) => d.change.direction === 'democratic').length,
      republican: districts.filter((d) => d.change.direction === 'republican').length,
      unchanged: districts.filter((d) => d.change.direction === 'neutral').length,
    };

    const moreCompetitive = districts.filter(
      (d) => d.projectedPartisan.competitivenessIndex > d.currentPartisan.competitivenessIndex
    ).length;
    const lessCompetitive = districts.filter(
      (d) => d.projectedPartisan.competitivenessIndex < d.currentPartisan.competitivenessIndex
    ).length;

    return {
      totalDistricts: districts.length,
      impactedDistricts: impacted,
      shiftDistribution,
      competitivenessChange: {
        moreCompetitive,
        lessCompetitive,
        unchanged: districts.length - moreCompetitive - lessCompetitive,
      },
      representationImpact: this.generateRepresentationSummary(impacted, shiftDistribution),
    };
  }

  private generateRepresentationSummary(
    impacted: ImpactSummary['impactedDistricts'],
    shifts: ImpactSummary['shiftDistribution']
  ): string {
    const totalImpacted = impacted.significant + impacted.moderate;

    if (totalImpacted === 0) {
      return 'Minimal impact on district-level representation expected.';
    }

    const dominantShift = shifts.democratic > shifts.republican ? 'Democratic' : 'Republican';
    const magnitude = impacted.significant > 5 ? 'substantial' : 'moderate';

    return `${magnitude.charAt(0).toUpperCase() + magnitude.slice(1)} shifts in ${totalImpacted} districts, favoring ${dominantShift} representation.`;
  }

  getRegionAggregates(
    districts: DistrictImpactDetail[]
  ): Record<CaliforniaRegion, RegionAggregate> {
    const aggregates: Partial<Record<CaliforniaRegion, RegionAggregate>> = {};

    for (const [region, counties] of Object.entries(CALIFORNIA_REGIONS)) {
      const regionDistricts = districts.filter((d) =>
        counties.some((county) => d.districtName.includes(county))
      );

      if (regionDistricts.length === 0) continue;

      aggregates[region as CaliforniaRegion] = {
        regionName: region,
        districts: regionDistricts.map((d) => d.districtId),
        totalPopulation: 0,
        aggregateMetrics: {
          avgPartisanBalance:
            regionDistricts.reduce((sum, d) => sum + d.currentPartisan.democraticAdvantage, 0) /
            regionDistricts.length,
          avgTurnout:
            regionDistricts.reduce((sum, d) => sum + d.currentPartisan.voterEngagement, 0) /
            regionDistricts.length,
          totalImpact:
            regionDistricts.reduce((sum, d) => sum + Math.abs(d.change.balanceShift), 0),
        },
      };
    }

    return aggregates as Record<CaliforniaRegion, RegionAggregate>;
  }
}

export const districtService = new DistrictService();
export default districtService;
