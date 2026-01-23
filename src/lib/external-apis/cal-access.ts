/**
 * Cal-Access API Client
 * Fetches campaign finance data from California Secretary of State
 * Data source: https://cal-access.sos.ca.gov/
 */

import { Donor, PropositionFinance } from '@/types';

const CAL_ACCESS_BASE_URL = 'https://cal-access.sos.ca.gov';

export interface CalAccessFiling {
  filingId: string;
  amendmentId: string;
  filingType: string;
  filerName: string;
  filerId: string;
  filingDate: string;
  startDate: string;
  endDate: string;
  totalContributions: number;
  totalExpenditures: number;
}

export interface CalAccessCommittee {
  id: string;
  name: string;
  type: string;
  status: string;
  filedDate: string;
  position?: 'support' | 'oppose';
  measureNumber?: string;
}

export interface CalAccessContribution {
  amount: number;
  contributorName: string;
  contributorType: string;
  contributorCity: string;
  contributorState: string;
  contributionDate: string;
  committeeName: string;
  committeeId: string;
}

class CalAccessClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = CAL_ACCESS_BASE_URL;
  }

  /**
   * Get campaign finance summary for a ballot measure
   * Uses the Cal-Access Campaign API endpoints
   */
  async getMeasureFinance(measureNumber: string, electionYear: number): Promise<PropositionFinance | null> {
    try {
      // Fetch committees supporting/opposing the measure
      const committees = await this.getMeasureCommittees(measureNumber, electionYear);

      // Calculate totals
      const supportCommittees = committees.filter(c => c.position === 'support');
      const oppositionCommittees = committees.filter(c => c.position === 'oppose');

      const totalSupport = supportCommittees.reduce((sum, c) => sum + (c.totalRaised || 0), 0);
      const totalOpposition = oppositionCommittees.reduce((sum, c) => sum + (c.totalRaised || 0), 0);

      // Get top donors
      const topDonors = await this.getTopDonors(measureNumber, electionYear);

      return {
        propositionId: `prop-${measureNumber}-${electionYear}`,
        totalSupport,
        totalOpposition,
        supportCommittees: supportCommittees.map(c => ({
          id: c.id,
          name: c.name,
          position: 'support' as const,
          totalRaised: c.totalRaised || 0,
          totalSpent: c.totalSpent || 0,
        })),
        oppositionCommittees: oppositionCommittees.map(c => ({
          id: c.id,
          name: c.name,
          position: 'opposition' as const,
          totalRaised: c.totalRaised || 0,
          totalSpent: c.totalSpent || 0,
        })),
        topDonors,
        lastUpdated: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error fetching measure finance:', error);
      return null;
    }
  }

  /**
   * Get committees associated with a ballot measure
   */
  async getMeasureCommittees(measureNumber: string, electionYear: number): Promise<(CalAccessCommittee & { totalRaised?: number; totalSpent?: number })[]> {
    try {
      // Cal-Access provides data through their web interface
      // We'll construct the URL for ballot measure committees
      const response = await fetch(
        `${this.baseUrl}/Campaign/Measures/Detail.aspx?id=${measureNumber}&session=${electionYear}`,
        {
          headers: {
            'Accept': 'text/html',
            'User-Agent': 'CA-Proposition-Predictor/1.0',
          },
          next: { revalidate: 3600 }, // Cache for 1 hour
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // For now, return structured data based on known patterns
      // In production, this would parse the HTML response or use a proper API
      return this.parseMeasureCommitteesFromApi(measureNumber, electionYear);
    } catch (error) {
      console.error('Error fetching committees:', error);
      return [];
    }
  }

  /**
   * Parse committee data - uses California Civic Data Coalition format when available
   * https://calaccess.californiacivicdata.org/
   */
  private async parseMeasureCommitteesFromApi(
    measureNumber: string,
    electionYear: number
  ): Promise<(CalAccessCommittee & { totalRaised?: number; totalSpent?: number })[]> {
    try {
      // Try California Civic Data Coalition API (cleaner data format)
      const civicDataUrl = `https://calaccess.californiacivicdata.org/api/ballot-measures/${electionYear}/${measureNumber}/`;

      const response = await fetch(civicDataUrl, {
        headers: {
          'Accept': 'application/json',
        },
        next: { revalidate: 3600 },
      });

      if (response.ok) {
        const data = await response.json();
        return this.transformCivicData(data);
      }
    } catch {
      // Fall back to empty array if API unavailable
    }

    return [];
  }

  private transformCivicData(data: Record<string, unknown>): (CalAccessCommittee & { totalRaised?: number; totalSpent?: number })[] {
    // Transform California Civic Data Coalition format to our format
    const committees: (CalAccessCommittee & { totalRaised?: number; totalSpent?: number })[] = [];

    if (data.support_committees && Array.isArray(data.support_committees)) {
      for (const committee of data.support_committees) {
        committees.push({
          id: String(committee.id || ''),
          name: String(committee.name || ''),
          type: 'ballot_measure',
          status: 'active',
          filedDate: String(committee.filed_date || ''),
          position: 'support',
          totalRaised: Number(committee.total_contributions || 0),
          totalSpent: Number(committee.total_expenditures || 0),
        });
      }
    }

    if (data.opposition_committees && Array.isArray(data.opposition_committees)) {
      for (const committee of data.opposition_committees) {
        committees.push({
          id: String(committee.id || ''),
          name: String(committee.name || ''),
          type: 'ballot_measure',
          status: 'active',
          filedDate: String(committee.filed_date || ''),
          position: 'oppose',
          totalRaised: Number(committee.total_contributions || 0),
          totalSpent: Number(committee.total_expenditures || 0),
        });
      }
    }

    return committees;
  }

  /**
   * Get top donors for a ballot measure
   */
  async getTopDonors(measureNumber: string, electionYear: number, limit = 20): Promise<Donor[]> {
    try {
      // Try California Civic Data Coalition API
      const civicDataUrl = `https://calaccess.californiacivicdata.org/api/ballot-measures/${electionYear}/${measureNumber}/contributions/`;

      const response = await fetch(civicDataUrl, {
        headers: {
          'Accept': 'application/json',
        },
        next: { revalidate: 3600 },
      });

      if (response.ok) {
        const data = await response.json();
        return this.transformContributionsData(data, limit);
      }
    } catch {
      // Fall back to empty array
    }

    return [];
  }

  private transformContributionsData(data: Record<string, unknown>, limit: number): Donor[] {
    const donors: Donor[] = [];

    if (data.results && Array.isArray(data.results)) {
      const sorted = data.results
        .sort((a: Record<string, unknown>, b: Record<string, unknown>) =>
          (Number(b.amount) || 0) - (Number(a.amount) || 0)
        )
        .slice(0, limit);

      for (const contribution of sorted) {
        donors.push({
          name: String(contribution.contributor_name || 'Unknown'),
          amount: Number(contribution.amount || 0),
          position: contribution.committee_position === 'support' ? 'support' : 'opposition',
          type: this.getDonorType(String(contribution.contributor_type || '')),
        });
      }
    }

    return donors;
  }

  private getDonorType(type: string): 'individual' | 'organization' | 'pac' {
    const lowerType = type.toLowerCase();
    if (lowerType.includes('individual') || lowerType.includes('person')) {
      return 'individual';
    }
    if (lowerType.includes('pac') || lowerType.includes('committee')) {
      return 'pac';
    }
    return 'organization';
  }

  /**
   * Search for ballot measure by keywords
   */
  async searchMeasures(_query: string, _year?: number): Promise<{ number: string; name: string; year: number }[]> {
    // This would search the Cal-Access database
    // For now, returns empty - would need proper API access
    return [];
  }
}

export const calAccessClient = new CalAccessClient();
export default calAccessClient;
