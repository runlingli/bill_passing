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

import { Proposition, PropositionCategory, PropositionStatus } from '@/types';

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

// Historical proposition results (passed = true, failed = false)
// Source: https://ballotpedia.org/List_of_California_ballot_propositions
const HISTORICAL_RESULTS: Record<string, boolean> = {
  // 2024 propositions
  '2024-2': true,   // Borrowing for public school and college facilities
  '2024-3': true,   // Constitutional right to marriage
  '2024-4': true,   // Bonds for safe drinking water, wildfire prevention
  '2024-5': false,  // Lower supermajority vote requirement for housing bonds
  '2024-6': true,   // Eliminates involuntary servitude for incarcerated persons
  '2024-32': false, // Raises minimum wage to $18
  '2024-33': false, // Expands local rent control
  '2024-34': true,  // Restricts health care spending by certain providers
  '2024-35': true,  // Permanent tax on managed health care plans
  '2024-36': true,  // Allows felony charges for drug/theft crimes
  // 2022 propositions
  '2022-1': true,   // Constitutional right to reproductive freedom
  '2022-26': false, // Allows sports betting on tribal lands
  '2022-27': false, // Allows online sports betting
  '2022-28': true,  // Arts and music education funding
  '2022-29': false, // Dialysis clinic requirements
  '2022-30': false, // Tax on income over $2M for EVs and wildfire prevention
  '2022-31': false, // Referendum on flavored tobacco ban
  // 2020 propositions
  '2020-14': true,  // Stem cell research bonds
  '2020-15': false, // Commercial property tax increase
  '2020-16': false, // Repeal Prop 209 (affirmative action)
  '2020-17': true,  // Voting rights for parolees
  '2020-18': false, // Primary voting age to 17
  '2020-19': true,  // Property tax transfers for seniors/disabled
  '2020-20': false, // Criminal sentencing changes
  '2020-21': false, // Rent control expansion
  '2020-22': true,  // App-based drivers as contractors
  '2020-23': false, // Dialysis clinic requirements
  '2020-24': true,  // Consumer privacy rights
  '2020-25': false, // Cash bail elimination
  // 2025 proposition
  '2025-50': true,  // Redistricting map amendment
  // 2018 propositions
  '2018-1': true,   // Housing programs and veterans' loans bond
  '2018-2': true,   // Mental health services funding
  '2018-3': true,   // Water infrastructure bond
  '2018-4': true,   // Children's hospital bond
  '2018-5': false,  // Property tax transfer for seniors
  '2018-6': false,  // Repeal gas tax increase
  '2018-7': true,   // Daylight saving time
  '2018-8': false,  // Dialysis clinic regulation
  '2018-10': false, // Rent control expansion
  '2018-11': true,  // Ambulance workers break time
  '2018-12': true,  // Farm animal confinement standards
  // 2016 propositions
  '2016-51': true,  // School bonds
  '2016-52': true,  // Medi-Cal hospital fee
  '2016-53': false, // Revenue bonds voter approval
  '2016-54': true,  // Legislature bills online
  '2016-55': true,  // Tax extension for education
  '2016-56': true,  // Cigarette tax increase
  '2016-57': true,  // Criminal sentences and parole
  '2016-58': true,  // Bilingual education
  '2016-59': false, // Corporate political spending advisory
  '2016-60': false, // Adult film condoms
  '2016-61': false, // State prescription drug purchases
  '2016-62': false, // Repeal death penalty
  '2016-63': true,  // Ammunition sales background checks
  '2016-64': true,  // Marijuana legalization
  '2016-65': false, // Carryout bags charges
  '2016-66': true,  // Death penalty procedures
  '2016-67': true,  // Plastic bag ban referendum
};

// Real proposition data from CA Secretary of State and Ballotpedia
// Source: https://www.sos.ca.gov/elections/ballot-measures/qualified-ballot-measures
// Source: https://ballotpedia.org/California_2026_ballot_propositions
const KNOWN_PROPOSITIONS: Record<number, Proposition[]> = {
  2026: [
    {
      id: '2026-1',
      number: '1',
      year: 2026,
      electionDate: '2026-11-03',
      title: 'Allow Public Financing of Election Campaigns',
      summary: 'Allow the state and local governments to create programs that provide candidates with public funds under spending limits and eligibility rules. Also known as the California Fair Elections Act of 2026.',
      status: 'upcoming',
      category: 'government',
    },
    {
      id: '2026-2',
      number: '2',
      year: 2026,
      electionDate: '2026-11-03',
      title: 'Eliminate Successor Election at State Officer Recall',
      summary: 'Eliminate the successor election when a state officer is recalled, thereby leaving the office vacant until it is filled according to state law.',
      status: 'upcoming',
      category: 'government',
    },
    {
      id: '2026-3',
      number: '3',
      year: 2026,
      electionDate: '2026-11-03',
      title: 'Vote Requirements for Initiatives Requiring Supermajority Votes',
      summary: 'Require initiatives that change vote thresholds to supermajority votes to pass by the same vote requirement as is being proposed.',
      status: 'upcoming',
      category: 'government',
    },
  ],
  2025: [
    {
      id: '2025-50',
      number: '50',
      year: 2025,
      electionDate: '2025-11-04',
      title: 'Use of Legislative Congressional Redistricting Map Amendment',
      summary: 'Allow the state to use a new, legislature-drawn congressional district map for 2026 through 2030.',
      status: 'passed',
      category: 'government',
      result: {
        passed: true,
        yesVotes: 7453339,
        noVotes: 4116998,
        yesPercentage: 64,
        noPercentage: 36,
        totalVotes: 11570337,
        turnout: 0.45,
      },
    },
  ],
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
      return HISTORICAL_RESULTS[key] ? 'passed' : 'failed';
    }

    // Default to 'passed' for unknown past propositions (most pass historically)
    // This is a fallback - ideally we'd have all results in HISTORICAL_RESULTS
    return 'passed';
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

    // Use known propositions data as final fallback (real data from CA SOS/Ballotpedia)
    if (KNOWN_PROPOSITIONS[year]) {
      console.log(`[CA-SOS] Using known propositions data for year ${year}`);
      return KNOWN_PROPOSITIONS[year];
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
