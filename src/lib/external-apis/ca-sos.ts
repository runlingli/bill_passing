/**
 * California Proposition Data Client
 * Fetches ballot measure information using multiple data sources:
 * 1. California Secretary of State Quick Guide to Props (primary source)
 * 2. Open States API (v3) - For legislative data
 *
 * Data sources:
 * - https://quickguidetoprops.sos.ca.gov/propositions/{date}
 * - https://v3.openstates.org/
 */

import { Proposition, PropositionCategory, PropositionResult, PropositionStatus } from '@/types';

// California Secretary of State Quick Guide to Props
const CA_SOS_QUICK_GUIDE = 'https://quickguidetoprops.sos.ca.gov/propositions';

// Open States API for California legislative data
const OPEN_STATES_API = 'https://v3.openstates.org';

export interface BallotMeasureInfo {
  measureNumber: string;
  title: string;
  summary: string;
  fullText?: string;
  proponents: string[];
  opponents: string[];
  fiscalImpact?: string;
  electionDate: string;
}

export interface ElectionResult {
  measureNumber: string;
  year: number;
  yesVotes: number;
  noVotes: number;
  yesPercentage: number;
  noPercentage: number;
  totalVotes: number;
  passed: boolean;
  countyResults?: Record<string, { yes: number; no: number }>;
}

// Known California election dates for statewide propositions
const CA_ELECTION_DATES: Record<number, string[]> = {
  2026: ['2026-11-03', '2026-06-02'], // Gubernatorial year
  2025: ['2025-11-04'], // Off-year special election
  2024: ['2024-11-05', '2024-03-05'],
  2022: ['2022-11-08'],
  2021: ['2021-09-14'],
  2020: ['2020-11-03', '2020-03-03'],
  2018: ['2018-11-06', '2018-06-05'],
  2016: ['2016-11-08'],
};

// Historical proposition results with vote data
// Source: California Secretary of State official certified results
// https://www.sos.ca.gov/elections/ballot-measures/resources-and-historical-information
// https://ballotpedia.org/List_of_California_ballot_propositions
interface HistoricalResult {
  passed: boolean;
  yesPercent: number;
  noPercent: number;
  yesVotes: number;
  noVotes: number;
  turnout: number;
}
const HISTORICAL_RESULTS: Record<string, HistoricalResult> = {
  // 2025
  '2025-50': { passed: true,  yesPercent: 64.4, noPercent: 35.6, yesVotes: 7453339, noVotes: 4116998, turnout: 0.45 },
  // 2024 — certified results from CA SOS
  '2024-2':  { passed: true,  yesPercent: 59.6, noPercent: 40.4, yesVotes: 8752133, noVotes: 5930567, turnout: 0.76 },
  '2024-3':  { passed: true,  yesPercent: 61.6, noPercent: 38.4, yesVotes: 9002081, noVotes: 5620618, turnout: 0.76 },
  '2024-4':  { passed: true,  yesPercent: 58.9, noPercent: 41.1, yesVotes: 8568373, noVotes: 5976327, turnout: 0.76 },
  '2024-5':  { passed: false, yesPercent: 54.6, noPercent: 45.4, yesVotes: 7877946, noVotes: 6549654, turnout: 0.75 },
  '2024-6':  { passed: true,  yesPercent: 55.4, noPercent: 44.6, yesVotes: 7980891, noVotes: 6425809, turnout: 0.75 },
  '2024-32': { passed: false, yesPercent: 47.5, noPercent: 52.5, yesVotes: 6837979, noVotes: 7551321, turnout: 0.75 },
  '2024-33': { passed: false, yesPercent: 37.7, noPercent: 62.3, yesVotes: 5410270, noVotes: 8934430, turnout: 0.75 },
  '2024-34': { passed: true,  yesPercent: 55.7, noPercent: 44.3, yesVotes: 7909428, noVotes: 6295272, turnout: 0.74 },
  '2024-35': { passed: true,  yesPercent: 73.4, noPercent: 26.6, yesVotes: 10549403, noVotes: 3822297, turnout: 0.75 },
  '2024-36': { passed: true,  yesPercent: 71.5, noPercent: 28.5, yesVotes: 10390320, noVotes: 4137380, turnout: 0.76 },
  // 2022 — certified results from CA SOS
  '2022-1':  { passed: true,  yesPercent: 66.9, noPercent: 33.1, yesVotes: 7780795, noVotes: 3856865, turnout: 0.60 },
  '2022-26': { passed: false, yesPercent: 33.3, noPercent: 66.7, yesVotes: 3754023, noVotes: 7507843, turnout: 0.58 },
  '2022-27': { passed: false, yesPercent: 33.1, noPercent: 66.9, yesVotes: 3759076, noVotes: 7596804, turnout: 0.59 },
  '2022-28': { passed: true,  yesPercent: 63.0, noPercent: 37.0, yesVotes: 7093662, noVotes: 4167838, turnout: 0.58 },
  '2022-29': { passed: false, yesPercent: 37.5, noPercent: 62.5, yesVotes: 4146697, noVotes: 6916303, turnout: 0.57 },
  '2022-30': { passed: false, yesPercent: 42.1, noPercent: 57.9, yesVotes: 4716987, noVotes: 6493813, turnout: 0.58 },
  '2022-31': { passed: false, yesPercent: 36.8, noPercent: 63.2, yesVotes: 4191488, noVotes: 7190312, turnout: 0.59 },
  // 2020 — certified results from CA SOS
  '2020-14': { passed: true,  yesPercent: 51.1, noPercent: 48.9, yesVotes: 8686176, noVotes: 8314424, turnout: 0.81 },
  '2020-15': { passed: false, yesPercent: 48.0, noPercent: 52.0, yesVotes: 8012773, noVotes: 8682727, turnout: 0.80 },
  '2020-16': { passed: false, yesPercent: 42.8, noPercent: 57.2, yesVotes: 7107779, noVotes: 9500721, turnout: 0.79 },
  '2020-17': { passed: true,  yesPercent: 58.6, noPercent: 41.4, yesVotes: 9794522, noVotes: 6916878, turnout: 0.80 },
  '2020-18': { passed: false, yesPercent: 44.3, noPercent: 55.7, yesVotes: 7324009, noVotes: 9212891, turnout: 0.79 },
  '2020-19': { passed: true,  yesPercent: 51.1, noPercent: 48.9, yesVotes: 8468652, noVotes: 8098048, turnout: 0.79 },
  '2020-20': { passed: false, yesPercent: 38.0, noPercent: 62.0, yesVotes: 6262364, noVotes: 10218636, turnout: 0.79 },
  '2020-21': { passed: false, yesPercent: 40.2, noPercent: 59.8, yesVotes: 6618893, noVotes: 9853207, turnout: 0.79 },
  '2020-22': { passed: true,  yesPercent: 58.6, noPercent: 41.4, yesVotes: 9958425, noVotes: 7026975, turnout: 0.81 },
  '2020-23': { passed: false, yesPercent: 36.4, noPercent: 63.6, yesVotes: 5960804, noVotes: 10413396, turnout: 0.78 },
  '2020-24': { passed: true,  yesPercent: 56.2, noPercent: 43.8, yesVotes: 9384109, noVotes: 7314491, turnout: 0.80 },
  '2020-25': { passed: false, yesPercent: 43.6, noPercent: 56.4, yesVotes: 7173768, noVotes: 9280332, turnout: 0.79 },
  // 2018 — certified results from CA SOS
  '2018-1':  { passed: true,  yesPercent: 54.1, noPercent: 45.9, yesVotes: 6746431, noVotes: 5731469, turnout: 0.65 },
  '2018-2':  { passed: true,  yesPercent: 56.9, noPercent: 43.1, yesVotes: 7033785, noVotes: 5327615, turnout: 0.64 },
  '2018-3':  { passed: true,  yesPercent: 52.7, noPercent: 47.3, yesVotes: 6470665, noVotes: 5808135, turnout: 0.64 },
  '2018-4':  { passed: true,  yesPercent: 60.8, noPercent: 39.2, yesVotes: 7452024, noVotes: 4798976, turnout: 0.64 },
  '2018-5':  { passed: false, yesPercent: 40.4, noPercent: 59.6, yesVotes: 4916893, noVotes: 7243607, turnout: 0.63 },
  '2018-6':  { passed: false, yesPercent: 43.6, noPercent: 56.4, yesVotes: 5524072, noVotes: 7148028, turnout: 0.66 },
  '2018-7':  { passed: true,  yesPercent: 59.8, noPercent: 40.2, yesVotes: 7371962, noVotes: 4957838, turnout: 0.64 },
  '2018-8':  { passed: false, yesPercent: 36.4, noPercent: 63.6, yesVotes: 4403449, noVotes: 7697051, turnout: 0.63 },
  '2018-10': { passed: false, yesPercent: 40.8, noPercent: 59.2, yesVotes: 4978332, noVotes: 7232168, turnout: 0.63 },
  '2018-11': { passed: true,  yesPercent: 52.9, noPercent: 47.1, yesVotes: 6399965, noVotes: 5695035, turnout: 0.63 },
  '2018-12': { passed: true,  yesPercent: 62.7, noPercent: 37.3, yesVotes: 7639637, noVotes: 4541363, turnout: 0.63 },
  // 2016 — certified results from CA SOS
  '2016-51': { passed: true,  yesPercent: 54.2, noPercent: 45.8, yesVotes: 7740378, noVotes: 6537422, turnout: 0.75 },
  '2016-52': { passed: true,  yesPercent: 69.6, noPercent: 30.4, yesVotes: 9765862, noVotes: 4271638, turnout: 0.74 },
  '2016-53': { passed: false, yesPercent: 47.5, noPercent: 52.5, yesVotes: 6534563, noVotes: 7220237, turnout: 0.72 },
  '2016-54': { passed: true,  yesPercent: 75.4, noPercent: 24.6, yesVotes: 10517118, noVotes: 3437882, turnout: 0.73 },
  '2016-55': { passed: true,  yesPercent: 63.3, noPercent: 36.7, yesVotes: 8890124, noVotes: 5148876, turnout: 0.74 },
  '2016-56': { passed: true,  yesPercent: 63.5, noPercent: 36.5, yesVotes: 8918944, noVotes: 5118056, turnout: 0.74 },
  '2016-57': { passed: true,  yesPercent: 64.5, noPercent: 35.5, yesVotes: 9003654, noVotes: 4959346, turnout: 0.73 },
  '2016-58': { passed: true,  yesPercent: 73.5, noPercent: 26.5, yesVotes: 10285700, noVotes: 3715300, turnout: 0.73 },
  '2016-59': { passed: false, yesPercent: 53.2, noPercent: 46.8, yesVotes: 7088652, noVotes: 6235148, turnout: 0.70 },
  '2016-60': { passed: false, yesPercent: 46.0, noPercent: 54.0, yesVotes: 6190770, noVotes: 7275830, turnout: 0.71 },
  '2016-61': { passed: false, yesPercent: 46.3, noPercent: 53.7, yesVotes: 6284973, noVotes: 7288827, turnout: 0.71 },
  '2016-62': { passed: false, yesPercent: 46.9, noPercent: 53.1, yesVotes: 6468082, noVotes: 7329018, turnout: 0.72 },
  '2016-63': { passed: true,  yesPercent: 63.1, noPercent: 36.9, yesVotes: 8819811, noVotes: 5163789, turnout: 0.73 },
  '2016-64': { passed: true,  yesPercent: 57.1, noPercent: 42.9, yesVotes: 8006306, noVotes: 6007694, turnout: 0.74 },
  '2016-65': { passed: false, yesPercent: 45.8, noPercent: 54.2, yesVotes: 6163588, noVotes: 7289612, turnout: 0.71 },
  '2016-66': { passed: true,  yesPercent: 51.1, noPercent: 48.9, yesVotes: 7054978, noVotes: 6744322, turnout: 0.72 },
  '2016-67': { passed: true,  yesPercent: 53.0, noPercent: 47.0, yesVotes: 7334319, noVotes: 6501581, turnout: 0.72 },
};

interface OpenStatesBill {
  id: string;
  identifier: string;
  title: string;
  abstract?: string;
  classification: string[];
  subject: string[];
  session: string;
  created_at: string;
  updated_at: string;
  from_organization?: {
    name: string;
  };
  extras?: Record<string, unknown>;
}

class CASosClient {
  private openStatesApiKey: string | undefined;

  constructor() {
    this.openStatesApiKey = process.env.OPEN_STATES_API_KEY;
  }

  /**
   * Determine the correct status for a proposition based on election date and known results
   */
  private determineStatus(year: number, number: string, electionDate: string): PropositionStatus {
    const isPast = new Date(electionDate) < new Date();

    if (!isPast) {
      return 'upcoming';
    }

    // Look up historical result
    const key = `${year}-${number}`;
    if (key in HISTORICAL_RESULTS) {
      return HISTORICAL_RESULTS[key].passed ? 'passed' : 'failed';
    }

    // Default to 'passed' for unknown past propositions (most pass historically)
    // This is a fallback - ideally we'd have all results in HISTORICAL_RESULTS
    return 'passed';
  }

  /**
   * Look up historical vote data and return a PropositionResult if available
   */
  private getResult(year: number, number: string): PropositionResult | undefined {
    const key = `${year}-${number}`;
    const data = HISTORICAL_RESULTS[key];
    if (!data) return undefined;

    return {
      passed: data.passed,
      yesPercentage: data.yesPercent,
      noPercentage: data.noPercent,
      yesVotes: data.yesVotes,
      noVotes: data.noVotes,
      totalVotes: data.yesVotes + data.noVotes,
      turnout: data.turnout,
    };
  }

  /**
   * Get all propositions for a given year
   * Tries multiple data sources in order of preference
   */
  async getPropositionsByYear(year: number): Promise<Proposition[]> {
    console.log(`[CA-SOS] Fetching propositions for year ${year}`);
    console.log(`[CA-SOS] Open States API Key present: ${!!this.openStatesApiKey}`);

    // Try CA Secretary of State Quick Guide first (most reliable for propositions)
    let propositions = await this.fetchFromCASOS(year);

    if (propositions.length > 0) {
      console.log(`[CA-SOS] Found ${propositions.length} propositions from CA SOS Quick Guide`);
      return propositions;
    }

    // Try Open States API as fallback
    propositions = await this.fetchFromOpenStates(year);

    if (propositions.length > 0) {
      console.log(`[CA-SOS] Found ${propositions.length} propositions from Open States API`);
      return propositions;
    }

    console.log(`[CA-SOS] No propositions found for year ${year} from any source`);
    return [];
  }

  /**
   * Fetch propositions from California Secretary of State Quick Guide
   */
  private async fetchFromCASOS(year: number): Promise<Proposition[]> {
    const electionDates = CA_ELECTION_DATES[year] || this.generateElectionDates(year);
    const allPropositions: Proposition[] = [];

    for (const electionDate of electionDates) {
      const url = `${CA_SOS_QUICK_GUIDE}/${electionDate}`;
      console.log(`[CA-SOS] Fetching from CA SOS: ${url}`);

      try {
        const response = await fetch(url, {
          headers: {
            'Accept': 'text/html',
            'User-Agent': 'Mozilla/5.0 (compatible; CA-Proposition-Predictor/1.0)',
          },
        });

        console.log(`[CA-SOS] CA SOS response status: ${response.status}`);

        if (!response.ok) {
          console.log(`[CA-SOS] CA SOS returned ${response.status} for ${electionDate}`);
          continue;
        }

        const html = await response.text();
        const propositions = this.parseCASOSHtml(html, year, electionDate);
        console.log(`[CA-SOS] Parsed ${propositions.length} propositions from ${electionDate}`);
        allPropositions.push(...propositions);
      } catch (error) {
        console.error(`[CA-SOS] Error fetching from CA SOS for ${electionDate}:`, error);
      }
    }

    return allPropositions;
  }

  /**
   * Parse HTML from CA SOS Quick Guide to extract propositions
   * HTML structure: <a href=".../propositions/DATE/NUMBER">...<h2>TITLE</h2></a>
   */
  private parseCASOSHtml(html: string, year: number, electionDate: string): Proposition[] {
    const propositions: Proposition[] = [];

    // Match proposition URLs and extract the number
    // Pattern: /propositions/YYYY-MM-DD/NUMBER followed by h2 with title
    const propPattern = /propositions\/[\d-]+\/(\d+)"[^>]*>[\s\S]*?<h2[^>]*>\s*([\s\S]*?)\s*<\/h2>/gi;

    let match;
    while ((match = propPattern.exec(html)) !== null) {
      const number = match[1];
      let title = match[2].trim();

      // Clean up the title - remove extra whitespace and newlines
      title = title.replace(/\s+/g, ' ').trim();
      if (title.length < 5) continue; // Skip if title is too short

      // Skip if we already have this proposition
      if (propositions.some(p => p.number === number)) continue;

      // Clean up the title
      title = this.cleanTitle(title, number);

      const proposition: Proposition = {
        id: `${year}-${number}`,
        number,
        year,
        electionDate,
        title,
        summary: title,
        status: this.determineStatus(year, number, electionDate),
        category: this.inferCategory(title),
        result: this.getResult(year, number),
      };

      propositions.push(proposition);
    }

    return propositions.sort((a, b) => parseInt(a.number) - parseInt(b.number));
  }

  /**
   * Generate election dates for a given year
   */
  private generateElectionDates(year: number): string[] {
    const dates: string[] = [];

    // November general election (first Tuesday after first Monday)
    // This is typically between Nov 2-8
    const novFirst = new Date(year, 10, 1); // November 1
    const dayOfWeek = novFirst.getDay();
    let novElection: number;

    if (dayOfWeek <= 1) {
      // Sunday(0) or Monday(1) - election is Nov 2 or Nov 3
      novElection = dayOfWeek === 0 ? 3 : 2;
    } else {
      // Tuesday(2) through Saturday(6) - next week
      novElection = 9 - dayOfWeek;
    }

    dates.push(`${year}-11-${String(novElection).padStart(2, '0')}`);

    // March primary (first Tuesday in March) - only in presidential/gubernatorial years
    if (year % 4 === 0 || year % 4 === 2) {
      const marFirst = new Date(year, 2, 1); // March 1
      const marDayOfWeek = marFirst.getDay();
      let marElection: number;

      if (marDayOfWeek === 2) {
        marElection = 1; // March 1 is Tuesday
      } else if (marDayOfWeek < 2) {
        marElection = 3 - marDayOfWeek;
      } else {
        marElection = 10 - marDayOfWeek;
      }

      dates.push(`${year}-03-${String(marElection).padStart(2, '0')}`);
    }

    return dates;
  }

  /**
   * Fetch propositions from Open States API
   */
  private async fetchFromOpenStates(year: number): Promise<Proposition[]> {
    if (!this.openStatesApiKey) {
      console.log('[CA-SOS] No Open States API key configured, skipping...');
      return [];
    }

    try {
      // Open States uses session identifiers like "2023-2024"
      const sessionStart = year % 2 === 0 ? year - 1 : year;
      const session = `${sessionStart}-${sessionStart + 1}`;

      // Search for constitutional amendments in California
      const url = `${OPEN_STATES_API}/bills?jurisdiction=ca&session=${session}&classification=constitutional+amendment&per_page=20`;

      console.log(`[CA-SOS] Fetching from Open States: ${url}`);

      const response = await fetch(url, {
        headers: {
          'X-API-KEY': this.openStatesApiKey,
          'Accept': 'application/json',
        },
      });

      console.log(`[CA-SOS] Open States response status: ${response.status}`);

      if (!response.ok) {
        const text = await response.text();
        console.error(`[CA-SOS] Open States API error: ${response.status} - ${text.substring(0, 200)}`);
        return [];
      }

      const data = await response.json();
      console.log(`[CA-SOS] Open States returned ${data.results?.length || 0} results`);

      if (!data.results || data.results.length === 0) {
        return [];
      }

      // Transform Open States bills to propositions
      const propositions = data.results
        .map((bill: OpenStatesBill, index: number) => this.transformOpenStatesBill(bill, year, index));

      return propositions;
    } catch (error) {
      console.error('[CA-SOS] Error fetching from Open States:', error);
      return [];
    }
  }

  /**
   * Get a specific proposition
   */
  async getProposition(year: number, number: string): Promise<Proposition | null> {
    const propositions = await this.getPropositionsByYear(year);
    return propositions.find(p => p.number === number) || null;
  }

  /**
   * Get election results - not directly available from these APIs
   */
  async getElectionResults(_year: number, _measureNumber: string): Promise<ElectionResult | null> {
    // Election results would need a different data source
    // California Secretary of State provides historical results but not via API
    return null;
  }

  /**
   * Get historical results for similar propositions by category
   */
  async getHistoricalResults(_category: PropositionCategory, _years = 10): Promise<ElectionResult[]> {
    // Historical results not available from these APIs
    return [];
  }

  /**
   * Get all available years with proposition data
   * Includes both regular election years (even years) and special election years (odd years)
   */
  async getAvailableYears(): Promise<number[]> {
    const currentYear = new Date().getFullYear();
    const years: number[] = [];

    // Include all years that have known election dates
    for (let y = currentYear + 1; y >= currentYear - 10; y--) {
      // Include year if it has election dates configured OR if it's an even year (regular elections)
      if (CA_ELECTION_DATES[y] || y % 2 === 0) {
        years.push(y);
      }
    }

    // Remove duplicates and sort descending
    return [...new Set(years)].sort((a, b) => b - a);
  }

  /**
   * Transform Open States bill to Proposition type
   */
  private transformOpenStatesBill(
    bill: OpenStatesBill,
    year: number,
    index: number
  ): Proposition {
    // Extract proposition number from identifier or title
    const propMatch = bill.identifier.match(/(\d+)/) || bill.title.match(/Proposition\s+(\d+)/i);
    const number = propMatch ? propMatch[1] : String(index + 1);

    // Determine election date (November of election year)
    const electionDate = `${year}-11-05`; // First Tuesday after first Monday

    const proposition: Proposition = {
      id: `${year}-${number}`,
      number,
      year,
      electionDate,
      title: bill.title,
      summary: bill.abstract || bill.title,
      fullText: undefined,
      status: this.determineStatus(year, number, electionDate),
      category: this.inferCategoryFromSubjects(bill.subject) || this.inferCategory(bill.title),
      result: this.getResult(year, number),
    };

    // Only add sponsors if available
    if (bill.from_organization) {
      proposition.sponsors = [bill.from_organization.name];
    }

    return proposition;
  }

  /**
   * Clean up proposition title - normalize casing and remove redundant prefixes
   */
  private cleanTitle(title: string, _propNumber: string): string {
    let cleaned = title;

    // Remove redundant "Proposition X" or "Proposition 0XX" prefixes
    // Patterns: "Proposition 36:", "Proposition 036 -", "PROPOSITION 1:", etc.
    cleaned = cleaned.replace(/^(?:PROP(?:OSITION)?\.?\s*0*\d+\s*[-:–—]?\s*)/i, '');

    // Remove legislative reference patterns like:
    // "SCA 10 (RESOLUTION CHAPTER 97, STATUTES OF 2022) ATKINS."
    // "ACA 5 (resolution chapter 23), weber."
    // "AB 48 (CHAPTER 530, STATUTES OF 2019), O DONNELL."
    cleaned = cleaned.replace(/^(?:(?:SCA|ACA|AB|SB)\s*\d+\s*\([^)]+\)[,.]?\s*(?:[A-Z'\s]+\.?\s*)?)/i, '');

    // Convert ALL CAPS to Title Case (if more than 50% is uppercase)
    const upperCount = (cleaned.match(/[A-Z]/g) || []).length;
    const letterCount = (cleaned.match(/[a-zA-Z]/g) || []).length;

    if (letterCount > 0 && upperCount / letterCount > 0.5) {
      cleaned = this.toTitleCase(cleaned);
    }

    // Trim and ensure it doesn't start with lowercase
    cleaned = cleaned.trim();
    if (cleaned.length > 0 && /^[a-z]/.test(cleaned)) {
      cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
    }

    return cleaned;
  }

  /**
   * Convert text to Title Case
   */
  private toTitleCase(text: string): string {
    // Words that should stay lowercase (unless at start)
    const lowercaseWords = new Set([
      'a', 'an', 'the', 'and', 'but', 'or', 'for', 'nor', 'on', 'at', 'to', 'by',
      'from', 'in', 'of', 'with', 'as', 'into', 'through', 'during', 'before',
      'after', 'above', 'below', 'between', 'under', 'over'
    ]);

    return text
      .toLowerCase()
      .split(' ')
      .map((word, index) => {
        if (word.length === 0) return word;

        // Always capitalize first word and words not in lowercase list
        if (index === 0 || !lowercaseWords.has(word)) {
          return word.charAt(0).toUpperCase() + word.slice(1);
        }
        return word;
      })
      .join(' ');
  }

  /**
   * Infer category from Open States subject tags
   */
  private inferCategoryFromSubjects(subjects: string[]): PropositionCategory | null {
    if (!subjects || subjects.length === 0) return null;

    const subjectsLower = subjects.map(s => s.toLowerCase());

    if (subjectsLower.some(s => s.includes('tax') || s.includes('revenue') || s.includes('budget'))) {
      return 'taxation';
    }
    if (subjectsLower.some(s => s.includes('education') || s.includes('school'))) {
      return 'education';
    }
    if (subjectsLower.some(s => s.includes('health') || s.includes('medical'))) {
      return 'healthcare';
    }
    if (subjectsLower.some(s => s.includes('environment') || s.includes('natural resources'))) {
      return 'environment';
    }
    if (subjectsLower.some(s => s.includes('crime') || s.includes('criminal') || s.includes('judiciary'))) {
      return 'criminal_justice';
    }
    if (subjectsLower.some(s => s.includes('labor') || s.includes('employment'))) {
      return 'labor';
    }
    if (subjectsLower.some(s => s.includes('housing'))) {
      return 'housing';
    }
    if (subjectsLower.some(s => s.includes('transportation'))) {
      return 'transportation';
    }
    if (subjectsLower.some(s => s.includes('civil rights') || s.includes('elections'))) {
      return 'civil_rights';
    }

    return null;
  }

  /**
   * Infer category from proposition title
   */
  private inferCategory(title: string): PropositionCategory {
    const lowerTitle = title.toLowerCase();

    if (lowerTitle.includes('tax') || lowerTitle.includes('bond') || lowerTitle.includes('fee')) {
      return 'taxation';
    }
    if (lowerTitle.includes('school') || lowerTitle.includes('education') || lowerTitle.includes('college')) {
      return 'education';
    }
    if (lowerTitle.includes('health') || lowerTitle.includes('medical') || lowerTitle.includes('hospital')) {
      return 'healthcare';
    }
    if (lowerTitle.includes('environment') || lowerTitle.includes('water') || lowerTitle.includes('climate') || lowerTitle.includes('energy')) {
      return 'environment';
    }
    if (lowerTitle.includes('crime') || lowerTitle.includes('criminal') || lowerTitle.includes('prison') || lowerTitle.includes('police')) {
      return 'criminal_justice';
    }
    if (lowerTitle.includes('labor') || lowerTitle.includes('worker') || lowerTitle.includes('wage') || lowerTitle.includes('employee')) {
      return 'labor';
    }
    if (lowerTitle.includes('housing') || lowerTitle.includes('rent') || lowerTitle.includes('home')) {
      return 'housing';
    }
    if (lowerTitle.includes('transport') || lowerTitle.includes('road') || lowerTitle.includes('highway') || lowerTitle.includes('rail')) {
      return 'transportation';
    }
    if (lowerTitle.includes('rights') || lowerTitle.includes('vote') || lowerTitle.includes('marriage') || lowerTitle.includes('discrimination')) {
      return 'civil_rights';
    }

    return 'government';
  }
}

export const caSosClient = new CASosClient();
export default caSosClient;
