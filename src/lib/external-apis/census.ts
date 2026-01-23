/**
 * US Census Bureau API Client
 * Fetches demographic data from American Community Survey (ACS)
 * API Documentation: https://www.census.gov/data/developers/data-sets/acs-5year.html
 */

const CENSUS_API_BASE = 'https://api.census.gov/data';
const ACS_YEAR = '2022'; // Latest available 5-year ACS data
const ACS_DATASET = 'acs/acs5';

// California FIPS code
const CA_STATE_FIPS = '06';

// ACS variable codes for demographics
const ACS_VARIABLES = {
  // Total population
  totalPopulation: 'B01001_001E',

  // Age groups
  age18to24: 'B01001_007E',
  age25to34: 'B01001_010E',
  age35to44: 'B01001_012E',
  age45to54: 'B01001_014E',
  age55to64: 'B01001_016E',
  age65plus: 'B01001_020E',

  // Race/Ethnicity
  white: 'B02001_002E',
  black: 'B02001_003E',
  asian: 'B02001_005E',
  hispanic: 'B03003_003E',
  multiracial: 'B02001_008E',

  // Education (25 years and over)
  eduTotal: 'B15003_001E',
  eduHighSchool: 'B15003_017E',
  eduSomeCollege: 'B15003_019E',
  eduBachelors: 'B15003_022E',
  eduGraduate: 'B15003_023E',

  // Income
  medianHouseholdIncome: 'B19013_001E',

  // Housing
  totalHousingUnits: 'B25001_001E',
  ownerOccupied: 'B25003_002E',
  renterOccupied: 'B25003_003E',

  // Urban/Rural (from Decennial Census, approximated)
  urbanPopulation: 'B01001_001E', // Would need decennial data for true urban/rural
};

export interface CountyDemographics {
  countyFips: string;
  countyName: string;
  state: string;
  totalPopulation: number;
  ageDistribution: {
    '18-24': number;
    '25-34': number;
    '35-44': number;
    '45-54': number;
    '55-64': number;
    '65+': number;
  };
  raceEthnicity: {
    white: number;
    black: number;
    asian: number;
    hispanic: number;
    multiracial: number;
    other: number;
  };
  education: {
    highSchool: number;
    someCollege: number;
    bachelors: number;
    graduate: number;
  };
  medianIncome: number;
  housingTenure: {
    ownerOccupied: number;
    renterOccupied: number;
  };
}

export interface CongressionalDistrictDemographics extends CountyDemographics {
  districtNumber: string;
}

class CensusClient {
  private apiKey: string | undefined;

  constructor() {
    this.apiKey = process.env.CENSUS_API_KEY;
  }

  private buildUrl(endpoint: string, variables: string[], geography: string): string {
    const variableList = variables.join(',');
    let url = `${CENSUS_API_BASE}/${ACS_YEAR}/${ACS_DATASET}?get=NAME,${variableList}&${geography}`;

    if (this.apiKey) {
      url += `&key=${this.apiKey}`;
    }

    return url;
  }

  /**
   * Get demographics for all California counties
   */
  async getCaliforniaCounties(): Promise<CountyDemographics[]> {
    const variables = Object.values(ACS_VARIABLES);
    const url = this.buildUrl(
      ACS_DATASET,
      variables,
      `for=county:*&in=state:${CA_STATE_FIPS}`
    );

    console.log(`[Census] Fetching CA counties from: ${url.substring(0, 100)}...`);
    console.log(`[Census] API Key present: ${!!this.apiKey}`);

    try {
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
        },
      });

      console.log(`[Census] Response status: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        const text = await response.text();
        console.error(`[Census] API error response: ${text.substring(0, 500)}`);
        return [];
      }

      const contentType = response.headers.get('content-type');
      console.log(`[Census] Content-Type: ${contentType}`);

      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error(`[Census] Non-JSON response: ${text.substring(0, 500)}`);
        return [];
      }

      const data = await response.json();
      console.log(`[Census] Response rows: ${Array.isArray(data) ? data.length : 'not an array'}`);

      const counties = this.parseCountyData(data);
      console.log(`[Census] Parsed ${counties.length} counties`);

      return counties;
    } catch (error) {
      console.error('[Census] Error fetching data:', error);
      return [];
    }
  }

  /**
   * Get demographics for a specific county
   */
  async getCounty(countyFips: string): Promise<CountyDemographics | null> {
    const variables = Object.values(ACS_VARIABLES);
    const url = this.buildUrl(
      ACS_DATASET,
      variables,
      `for=county:${countyFips}&in=state:${CA_STATE_FIPS}`
    );

    try {
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        console.error(`Census API error: ${response.status} ${response.statusText}`);
        return null;
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.error('Census API returned non-JSON response');
        return null;
      }

      const data = await response.json();
      const counties = this.parseCountyData(data);
      return counties[0] || null;
    } catch (error) {
      console.error('Error fetching county data:', error);
      return null;
    }
  }

  /**
   * Get demographics for California Congressional Districts
   */
  async getCongressionalDistricts(): Promise<CongressionalDistrictDemographics[]> {
    const variables = Object.values(ACS_VARIABLES);
    const url = this.buildUrl(
      ACS_DATASET,
      variables,
      `for=congressional%20district:*&in=state:${CA_STATE_FIPS}`
    );

    try {
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        console.error(`Census API error: ${response.status} ${response.statusText}`);
        return [];
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.error('Census API returned non-JSON response');
        return [];
      }

      const data = await response.json();
      return this.parseCongressionalDistrictData(data);
    } catch (error) {
      console.error('Error fetching Congressional District data:', error);
      return [];
    }
  }

  /**
   * Get demographics for California State Legislative Districts
   */
  async getStateSenateDistricts(): Promise<CongressionalDistrictDemographics[]> {
    const variables = Object.values(ACS_VARIABLES);
    const url = this.buildUrl(
      ACS_DATASET,
      variables,
      `for=state%20legislative%20district%20(upper%20chamber):*&in=state:${CA_STATE_FIPS}`
    );

    try {
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        console.error(`Census API error: ${response.status} ${response.statusText}`);
        return [];
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.error('Census API returned non-JSON response');
        return [];
      }

      const data = await response.json();
      return this.parseCongressionalDistrictData(data);
    } catch (error) {
      console.error('Error fetching State Senate data:', error);
      return [];
    }
  }

  async getStateAssemblyDistricts(): Promise<CongressionalDistrictDemographics[]> {
    const variables = Object.values(ACS_VARIABLES);
    const url = this.buildUrl(
      ACS_DATASET,
      variables,
      `for=state%20legislative%20district%20(lower%20chamber):*&in=state:${CA_STATE_FIPS}`
    );

    try {
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        console.error(`Census API error: ${response.status} ${response.statusText}`);
        return [];
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.error('Census API returned non-JSON response');
        return [];
      }

      const data = await response.json();
      return this.parseCongressionalDistrictData(data);
    } catch (error) {
      console.error('Error fetching State Assembly data:', error);
      return [];
    }
  }

  private parseCountyData(data: (string | number)[][]): CountyDemographics[] {
    if (!data || data.length < 2) return [];

    const headers = data[0] as string[];
    const rows = data.slice(1);

    return rows.map((row) => {
      const getValue = (varName: string): number => {
        const varCode = ACS_VARIABLES[varName as keyof typeof ACS_VARIABLES];
        const index = headers.indexOf(varCode);
        if (index === -1) return 0;
        const value = row[index];
        return typeof value === 'number' ? value : parseInt(String(value)) || 0;
      };

      const totalPop = getValue('totalPopulation');

      return {
        countyFips: String(row[headers.indexOf('county')] || ''),
        countyName: String(row[headers.indexOf('NAME')] || '').replace(', California', ''),
        state: 'California',
        totalPopulation: totalPop,
        ageDistribution: {
          '18-24': getValue('age18to24'),
          '25-34': getValue('age25to34'),
          '35-44': getValue('age35to44'),
          '45-54': getValue('age45to54'),
          '55-64': getValue('age55to64'),
          '65+': getValue('age65plus'),
        },
        raceEthnicity: {
          white: getValue('white'),
          black: getValue('black'),
          asian: getValue('asian'),
          hispanic: getValue('hispanic'),
          multiracial: getValue('multiracial'),
          other: Math.max(0, totalPop - getValue('white') - getValue('black') - getValue('asian') - getValue('hispanic') - getValue('multiracial')),
        },
        education: {
          highSchool: getValue('eduHighSchool'),
          someCollege: getValue('eduSomeCollege'),
          bachelors: getValue('eduBachelors'),
          graduate: getValue('eduGraduate'),
        },
        medianIncome: getValue('medianHouseholdIncome'),
        housingTenure: {
          ownerOccupied: getValue('ownerOccupied'),
          renterOccupied: getValue('renterOccupied'),
        },
      };
    });
  }

  private parseCongressionalDistrictData(data: (string | number)[][]): CongressionalDistrictDemographics[] {
    if (!data || data.length < 2) return [];

    const headers = data[0] as string[];
    const rows = data.slice(1);

    // Find the district column (could be 'congressional district', 'state legislative district...', etc.)
    const districtCol = headers.find(h =>
      h.includes('congressional district') ||
      h.includes('state legislative district')
    ) || 'district';

    return rows.map((row) => {
      const getValue = (varName: string): number => {
        const varCode = ACS_VARIABLES[varName as keyof typeof ACS_VARIABLES];
        const index = headers.indexOf(varCode);
        if (index === -1) return 0;
        const value = row[index];
        return typeof value === 'number' ? value : parseInt(String(value)) || 0;
      };

      const totalPop = getValue('totalPopulation');

      return {
        districtNumber: String(row[headers.indexOf(districtCol)] || ''),
        countyFips: '',
        countyName: String(row[headers.indexOf('NAME')] || ''),
        state: 'California',
        totalPopulation: totalPop,
        ageDistribution: {
          '18-24': getValue('age18to24'),
          '25-34': getValue('age25to34'),
          '35-44': getValue('age35to44'),
          '45-54': getValue('age45to54'),
          '55-64': getValue('age55to64'),
          '65+': getValue('age65plus'),
        },
        raceEthnicity: {
          white: getValue('white'),
          black: getValue('black'),
          asian: getValue('asian'),
          hispanic: getValue('hispanic'),
          multiracial: getValue('multiracial'),
          other: Math.max(0, totalPop - getValue('white') - getValue('black') - getValue('asian') - getValue('hispanic') - getValue('multiracial')),
        },
        education: {
          highSchool: getValue('eduHighSchool'),
          someCollege: getValue('eduSomeCollege'),
          bachelors: getValue('eduBachelors'),
          graduate: getValue('eduGraduate'),
        },
        medianIncome: getValue('medianHouseholdIncome'),
        housingTenure: {
          ownerOccupied: getValue('ownerOccupied'),
          renterOccupied: getValue('renterOccupied'),
        },
      };
    });
  }
}

export const censusClient = new CensusClient();
export default censusClient;
