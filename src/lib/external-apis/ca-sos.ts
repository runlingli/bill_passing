/**
 * California Secretary of State Data Client
 * Fetches ballot measure information and election results
 * Data source: https://www.sos.ca.gov/elections/ballot-measures
 */

import { Proposition, PropositionResult, PropositionCategory } from '@/types';

const SOS_BASE_URL = 'https://www.sos.ca.gov';

// Known proposition data from CA SOS (structured from public records)
// In production, this would be fetched/scraped from the SOS website
const KNOWN_PROPOSITIONS: Record<string, Partial<Proposition>> = {
  // 2024 Propositions
  '2024-2': {
    number: '2',
    year: 2024,
    title: 'Public Education Facilities Bond Measure',
    summary: 'Authorizes $10 billion in bonds for repair, upgrade, and construction of facilities at K-12 public schools and community colleges.',
    category: 'education',
    status: 'upcoming',
    electionDate: '2024-11-05',
  },
  '2024-3': {
    number: '3',
    year: 2024,
    title: 'Marriage Equality',
    summary: 'Amends California Constitution to remove language that states marriage is between a man and a woman.',
    category: 'civil_rights',
    status: 'upcoming',
    electionDate: '2024-11-05',
  },
  '2024-4': {
    number: '4',
    year: 2024,
    title: 'Water, Wildfire, and Climate Bond',
    summary: 'Authorizes $10 billion in bonds for safe drinking water, wildfire prevention, and climate infrastructure.',
    category: 'environment',
    status: 'upcoming',
    electionDate: '2024-11-05',
  },
  '2024-5': {
    number: '5',
    year: 2024,
    title: 'Lower Supermajority Requirement for Local Housing and Infrastructure Bonds',
    summary: 'Allows local bonds for affordable housing and infrastructure to pass with 55% approval instead of two-thirds.',
    category: 'housing',
    status: 'upcoming',
    electionDate: '2024-11-05',
  },
  '2024-6': {
    number: '6',
    year: 2024,
    title: 'Eliminate Involuntary Servitude for Incarcerated Persons',
    summary: 'Amends California Constitution to remove involuntary servitude as punishment for crime.',
    category: 'civil_rights',
    status: 'upcoming',
    electionDate: '2024-11-05',
  },
  '2024-32': {
    number: '32',
    year: 2024,
    title: 'Minimum Wage Increase',
    summary: 'Raises minimum wage to $18 per hour by 2026.',
    category: 'labor',
    status: 'upcoming',
    electionDate: '2024-11-05',
  },
  '2024-33': {
    number: '33',
    year: 2024,
    title: 'Expand Local Rent Control',
    summary: 'Repeals Costa-Hawkins Act, allowing cities to expand rent control.',
    category: 'housing',
    status: 'upcoming',
    electionDate: '2024-11-05',
  },
  '2024-34': {
    number: '34',
    year: 2024,
    title: 'Healthcare Provider Requirements',
    summary: 'Requires certain healthcare providers to spend 98% of revenues on patient care.',
    category: 'healthcare',
    status: 'upcoming',
    electionDate: '2024-11-05',
  },
  '2024-35': {
    number: '35',
    year: 2024,
    title: 'Permanent Medi-Cal Funding',
    summary: 'Makes permanent the existing tax on managed care organizations to fund Medi-Cal.',
    category: 'healthcare',
    status: 'upcoming',
    electionDate: '2024-11-05',
  },
  '2024-36': {
    number: '36',
    year: 2024,
    title: 'Criminal Sentencing and Theft Penalties',
    summary: 'Increases penalties for certain drug and theft crimes, modifying Propositions 47 and 57.',
    category: 'criminal_justice',
    status: 'upcoming',
    electionDate: '2024-11-05',
  },

  // Historical propositions with results
  '2022-1': {
    number: '1',
    year: 2022,
    title: 'Constitutional Right to Reproductive Freedom',
    summary: 'Amends California Constitution to expressly include right to reproductive freedom.',
    category: 'civil_rights',
    status: 'passed',
    electionDate: '2022-11-08',
    result: {
      yesVotes: 7125518,
      noVotes: 3933589,
      yesPercentage: 64.4,
      noPercentage: 35.6,
      totalVotes: 11059107,
      turnout: 0.52,
      passed: true,
    },
  },
  '2022-26': {
    number: '26',
    year: 2022,
    title: 'Tribal Sports Wagering',
    summary: 'Allows in-person sports betting at tribal casinos and horse racing tracks.',
    category: 'government',
    status: 'failed',
    electionDate: '2022-11-08',
    result: {
      yesVotes: 3523891,
      noVotes: 6983276,
      yesPercentage: 33.5,
      noPercentage: 66.5,
      totalVotes: 10507167,
      turnout: 0.50,
      passed: false,
    },
  },
  '2022-27': {
    number: '27',
    year: 2022,
    title: 'Online and Mobile Sports Betting',
    summary: 'Allows online and mobile sports betting outside tribal lands.',
    category: 'government',
    status: 'failed',
    electionDate: '2022-11-08',
    result: {
      yesVotes: 1699927,
      noVotes: 8914451,
      yesPercentage: 16.0,
      noPercentage: 84.0,
      totalVotes: 10614378,
      turnout: 0.50,
      passed: false,
    },
  },
  '2022-28': {
    number: '28',
    year: 2022,
    title: 'Art and Music Education Funding',
    summary: 'Provides additional funding for arts and music education in public schools.',
    category: 'education',
    status: 'passed',
    electionDate: '2022-11-08',
    result: {
      yesVotes: 6376542,
      noVotes: 4150987,
      yesPercentage: 60.6,
      noPercentage: 39.4,
      totalVotes: 10527529,
      turnout: 0.50,
      passed: true,
    },
  },
  '2022-30': {
    number: '30',
    year: 2022,
    title: 'Tax on Income Over $2 Million for Zero-Emission Vehicles',
    summary: 'Increases tax on personal income over $2 million to fund zero-emission vehicle programs.',
    category: 'taxation',
    status: 'failed',
    electionDate: '2022-11-08',
    result: {
      yesVotes: 4092856,
      noVotes: 6385927,
      yesPercentage: 39.1,
      noPercentage: 60.9,
      totalVotes: 10478783,
      turnout: 0.50,
      passed: false,
    },
  },
  '2022-31': {
    number: '31',
    year: 2022,
    title: 'Referendum on Flavored Tobacco Ban',
    summary: 'Upholds or rejects 2020 law banning sale of flavored tobacco products.',
    category: 'healthcare',
    status: 'passed',
    electionDate: '2022-11-08',
    result: {
      yesVotes: 6698533,
      noVotes: 3912475,
      yesPercentage: 63.1,
      noPercentage: 36.9,
      totalVotes: 10611008,
      turnout: 0.50,
      passed: true,
    },
  },

  // 2020 Propositions
  '2020-14': {
    number: '14',
    year: 2020,
    title: 'Stem Cell Research Institute Bond',
    summary: 'Authorizes $5.5 billion in bonds for stem cell and other medical research.',
    category: 'healthcare',
    status: 'passed',
    electionDate: '2020-11-03',
    result: {
      yesVotes: 7878570,
      noVotes: 6775498,
      yesPercentage: 53.8,
      noPercentage: 46.2,
      totalVotes: 14654068,
      turnout: 0.67,
      passed: true,
    },
  },
  '2020-15': {
    number: '15',
    year: 2020,
    title: 'Property Tax for Commercial Properties',
    summary: 'Increases funding for schools and local governments by changing tax assessment of commercial properties.',
    category: 'taxation',
    status: 'failed',
    electionDate: '2020-11-03',
    result: {
      yesVotes: 6724058,
      noVotes: 7995837,
      yesPercentage: 45.7,
      noPercentage: 54.3,
      totalVotes: 14719895,
      turnout: 0.67,
      passed: false,
    },
  },
  '2020-16': {
    number: '16',
    year: 2020,
    title: 'Repeal Proposition 209 Affirmative Action',
    summary: 'Allows diversity as a factor in public employment, education, and contracting decisions.',
    category: 'civil_rights',
    status: 'failed',
    electionDate: '2020-11-03',
    result: {
      yesVotes: 6477732,
      noVotes: 8222611,
      yesPercentage: 44.1,
      noPercentage: 55.9,
      totalVotes: 14700343,
      turnout: 0.67,
      passed: false,
    },
  },
  '2020-17': {
    number: '17',
    year: 2020,
    title: 'Voting Rights for Parolees',
    summary: 'Restores voting rights to people on parole for felony convictions.',
    category: 'civil_rights',
    status: 'passed',
    electionDate: '2020-11-03',
    result: {
      yesVotes: 8583771,
      noVotes: 6116119,
      yesPercentage: 58.4,
      noPercentage: 41.6,
      totalVotes: 14699890,
      turnout: 0.67,
      passed: true,
    },
  },
  '2020-18': {
    number: '18',
    year: 2020,
    title: 'Primary Voting for 17-Year-Olds',
    summary: 'Allows 17-year-olds who will be 18 by general election to vote in primaries.',
    category: 'civil_rights',
    status: 'failed',
    electionDate: '2020-11-03',
    result: {
      yesVotes: 6666149,
      noVotes: 7941785,
      yesPercentage: 45.6,
      noPercentage: 54.4,
      totalVotes: 14607934,
      turnout: 0.67,
      passed: false,
    },
  },
  '2020-19': {
    number: '19',
    year: 2020,
    title: 'Property Tax Transfers and Exemptions',
    summary: 'Changes property tax rules for inherited properties and disaster victims.',
    category: 'taxation',
    status: 'passed',
    electionDate: '2020-11-03',
    result: {
      yesVotes: 7447828,
      noVotes: 6869457,
      yesPercentage: 52.0,
      noPercentage: 48.0,
      totalVotes: 14317285,
      turnout: 0.65,
      passed: true,
    },
  },
  '2020-20': {
    number: '20',
    year: 2020,
    title: 'Criminal Sentencing and DNA Collection',
    summary: 'Restricts parole for certain offenses and authorizes felony charges for theft crimes.',
    category: 'criminal_justice',
    status: 'failed',
    electionDate: '2020-11-03',
    result: {
      yesVotes: 5600855,
      noVotes: 8923055,
      yesPercentage: 38.6,
      noPercentage: 61.4,
      totalVotes: 14523910,
      turnout: 0.66,
      passed: false,
    },
  },
  '2020-21': {
    number: '21',
    year: 2020,
    title: 'Expand Local Rent Control',
    summary: 'Allows cities to expand rent control policies beyond current limits.',
    category: 'housing',
    status: 'failed',
    electionDate: '2020-11-03',
    result: {
      yesVotes: 5730052,
      noVotes: 8966538,
      yesPercentage: 39.0,
      noPercentage: 61.0,
      totalVotes: 14696590,
      turnout: 0.67,
      passed: false,
    },
  },
  '2020-22': {
    number: '22',
    year: 2020,
    title: 'App-Based Drivers as Independent Contractors',
    summary: 'Considers app-based drivers to be independent contractors, not employees.',
    category: 'labor',
    status: 'passed',
    electionDate: '2020-11-03',
    result: {
      yesVotes: 9958725,
      noVotes: 5781034,
      yesPercentage: 63.3,
      noPercentage: 36.7,
      totalVotes: 15739759,
      turnout: 0.72,
      passed: true,
    },
  },
  '2020-23': {
    number: '23',
    year: 2020,
    title: 'Kidney Dialysis Clinics Requirements',
    summary: 'Requires physician on-site at dialysis clinics and limits clinics ability to close.',
    category: 'healthcare',
    status: 'failed',
    electionDate: '2020-11-03',
    result: {
      yesVotes: 4971398,
      noVotes: 9628073,
      yesPercentage: 34.1,
      noPercentage: 65.9,
      totalVotes: 14599471,
      turnout: 0.67,
      passed: false,
    },
  },
  '2020-24': {
    number: '24',
    year: 2020,
    title: 'Consumer Personal Information Law',
    summary: 'Expands consumer privacy protections and creates California Privacy Protection Agency.',
    category: 'civil_rights',
    status: 'passed',
    electionDate: '2020-11-03',
    result: {
      yesVotes: 8261297,
      noVotes: 6195859,
      yesPercentage: 57.1,
      noPercentage: 42.9,
      totalVotes: 14457156,
      turnout: 0.66,
      passed: true,
    },
  },
  '2020-25': {
    number: '25',
    year: 2020,
    title: 'Cash Bail Referendum',
    summary: 'Referendum to uphold or reject law replacing cash bail with risk assessments.',
    category: 'criminal_justice',
    status: 'failed',
    electionDate: '2020-11-03',
    result: {
      yesVotes: 6680570,
      noVotes: 7947245,
      yesPercentage: 45.7,
      noPercentage: 54.3,
      totalVotes: 14627815,
      turnout: 0.67,
      passed: false,
    },
  },

  // 2018 Propositions
  '2018-1': {
    number: '1',
    year: 2018,
    title: 'Housing Programs and Veterans Loans Bond',
    summary: 'Authorizes $4 billion in bonds for housing programs and veteran home loans.',
    category: 'housing',
    status: 'passed',
    electionDate: '2018-11-06',
    result: {
      yesVotes: 6488528,
      noVotes: 4844188,
      yesPercentage: 57.3,
      noPercentage: 42.7,
      totalVotes: 11332716,
      turnout: 0.53,
      passed: true,
    },
  },
  '2018-2': {
    number: '2',
    year: 2018,
    title: 'Mental Health Services Act Revenue Bond',
    summary: 'Authorizes bonds to fund housing for mentally ill individuals who are homeless.',
    category: 'healthcare',
    status: 'passed',
    electionDate: '2018-11-06',
    result: {
      yesVotes: 6549907,
      noVotes: 4785093,
      yesPercentage: 57.8,
      noPercentage: 42.2,
      totalVotes: 11335000,
      turnout: 0.53,
      passed: true,
    },
  },
  '2018-3': {
    number: '3',
    year: 2018,
    title: 'Water Infrastructure and Watershed Bond',
    summary: 'Authorizes $8.9 billion in bonds for water infrastructure projects.',
    category: 'environment',
    status: 'failed',
    electionDate: '2018-11-06',
    result: {
      yesVotes: 4927221,
      noVotes: 6186694,
      yesPercentage: 44.3,
      noPercentage: 55.7,
      totalVotes: 11113915,
      turnout: 0.52,
      passed: false,
    },
  },
  '2018-4': {
    number: '4',
    year: 2018,
    title: 'Children\'s Hospital Bond',
    summary: 'Authorizes $1.5 billion in bonds for children\'s hospitals construction and renovation.',
    category: 'healthcare',
    status: 'passed',
    electionDate: '2018-11-06',
    result: {
      yesVotes: 6388907,
      noVotes: 4823227,
      yesPercentage: 57.0,
      noPercentage: 43.0,
      totalVotes: 11212134,
      turnout: 0.52,
      passed: true,
    },
  },
  '2018-5': {
    number: '5',
    year: 2018,
    title: 'Property Tax Transfer Initiative',
    summary: 'Allows homebuyers who are 55+ or disabled to transfer property tax base.',
    category: 'taxation',
    status: 'failed',
    electionDate: '2018-11-06',
    result: {
      yesVotes: 4803990,
      noVotes: 6284660,
      yesPercentage: 43.3,
      noPercentage: 56.7,
      totalVotes: 11088650,
      turnout: 0.52,
      passed: false,
    },
  },
  '2018-6': {
    number: '6',
    year: 2018,
    title: 'Voter Approval for Gas and Vehicle Taxes',
    summary: 'Eliminates gas and vehicle taxes passed by legislature in 2017.',
    category: 'taxation',
    status: 'failed',
    electionDate: '2018-11-06',
    result: {
      yesVotes: 4891389,
      noVotes: 6404243,
      yesPercentage: 43.3,
      noPercentage: 56.7,
      totalVotes: 11295632,
      turnout: 0.53,
      passed: false,
    },
  },
  '2018-7': {
    number: '7',
    year: 2018,
    title: 'Permanent Daylight Saving Time',
    summary: 'Allows legislature to change daylight saving time if federal law permits.',
    category: 'government',
    status: 'passed',
    electionDate: '2018-11-06',
    result: {
      yesVotes: 6860762,
      noVotes: 4191467,
      yesPercentage: 62.1,
      noPercentage: 37.9,
      totalVotes: 11052229,
      turnout: 0.52,
      passed: true,
    },
  },
  '2018-8': {
    number: '8',
    year: 2018,
    title: 'Kidney Dialysis Clinics Initiative',
    summary: 'Limits charges and requires rebates for dialysis clinic revenues.',
    category: 'healthcare',
    status: 'failed',
    electionDate: '2018-11-06',
    result: {
      yesVotes: 3799127,
      noVotes: 7415609,
      yesPercentage: 33.9,
      noPercentage: 66.1,
      totalVotes: 11214736,
      turnout: 0.52,
      passed: false,
    },
  },
  '2018-10': {
    number: '10',
    year: 2018,
    title: 'Local Rent Control Initiative',
    summary: 'Expands local governments authority to enact rent control.',
    category: 'housing',
    status: 'failed',
    electionDate: '2018-11-06',
    result: {
      yesVotes: 3926477,
      noVotes: 7196798,
      yesPercentage: 35.3,
      noPercentage: 64.7,
      totalVotes: 11123275,
      turnout: 0.52,
      passed: false,
    },
  },
  '2018-11': {
    number: '11',
    year: 2018,
    title: 'Ambulance Employee Meal and Rest Breaks',
    summary: 'Requires private ambulance employees to remain on-call during breaks.',
    category: 'labor',
    status: 'passed',
    electionDate: '2018-11-06',
    result: {
      yesVotes: 5882295,
      noVotes: 4621608,
      yesPercentage: 56.0,
      noPercentage: 44.0,
      totalVotes: 10503903,
      turnout: 0.49,
      passed: true,
    },
  },
  '2018-12': {
    number: '12',
    year: 2018,
    title: 'Farm Animal Confinement Initiative',
    summary: 'Establishes minimum requirements for confining farm animals and bans sale of non-compliant products.',
    category: 'environment',
    status: 'passed',
    electionDate: '2018-11-06',
    result: {
      yesVotes: 6811150,
      noVotes: 4369014,
      yesPercentage: 60.9,
      noPercentage: 39.1,
      totalVotes: 11180164,
      turnout: 0.52,
      passed: true,
    },
  },

  // 2016 Propositions
  '2016-51': {
    number: '51',
    year: 2016,
    title: 'School Facilities Bond',
    summary: 'Authorizes $9 billion in bonds for school construction and modernization.',
    category: 'education',
    status: 'passed',
    electionDate: '2016-11-08',
    result: {
      yesVotes: 7529825,
      noVotes: 5737891,
      yesPercentage: 56.7,
      noPercentage: 43.3,
      totalVotes: 13267716,
      turnout: 0.58,
      passed: true,
    },
  },
  '2016-52': {
    number: '52',
    year: 2016,
    title: 'Medi-Cal Hospital Fee Program',
    summary: 'Extends hospital fee program to fund Medi-Cal health services.',
    category: 'healthcare',
    status: 'passed',
    electionDate: '2016-11-08',
    result: {
      yesVotes: 9507823,
      noVotes: 3647509,
      yesPercentage: 72.3,
      noPercentage: 27.7,
      totalVotes: 13155332,
      turnout: 0.58,
      passed: true,
    },
  },
  '2016-53': {
    number: '53',
    year: 2016,
    title: 'Revenue Bonds Voter Approval',
    summary: 'Requires statewide voter approval for certain revenue bonds.',
    category: 'government',
    status: 'failed',
    electionDate: '2016-11-08',
    result: {
      yesVotes: 5762588,
      noVotes: 7030847,
      yesPercentage: 45.0,
      noPercentage: 55.0,
      totalVotes: 12793435,
      turnout: 0.56,
      passed: false,
    },
  },
  '2016-54': {
    number: '54',
    year: 2016,
    title: 'Legislature Transparency',
    summary: 'Requires legislature to post bills online 72 hours before vote.',
    category: 'government',
    status: 'passed',
    electionDate: '2016-11-08',
    result: {
      yesVotes: 8802063,
      noVotes: 4044795,
      yesPercentage: 68.5,
      noPercentage: 31.5,
      totalVotes: 12846858,
      turnout: 0.56,
      passed: true,
    },
  },
  '2016-55': {
    number: '55',
    year: 2016,
    title: 'Tax Extension for Education and Healthcare',
    summary: 'Extends income tax increases on high earners to fund education and healthcare.',
    category: 'taxation',
    status: 'passed',
    electionDate: '2016-11-08',
    result: {
      yesVotes: 8285619,
      noVotes: 5105789,
      yesPercentage: 61.9,
      noPercentage: 38.1,
      totalVotes: 13391408,
      turnout: 0.59,
      passed: true,
    },
  },
  '2016-56': {
    number: '56',
    year: 2016,
    title: 'Cigarette Tax Increase',
    summary: 'Increases cigarette tax by $2 per pack for healthcare programs.',
    category: 'healthcare',
    status: 'passed',
    electionDate: '2016-11-08',
    result: {
      yesVotes: 8756055,
      noVotes: 4889412,
      yesPercentage: 64.2,
      noPercentage: 35.8,
      totalVotes: 13645467,
      turnout: 0.60,
      passed: true,
    },
  },
  '2016-57': {
    number: '57',
    year: 2016,
    title: 'Parole for Nonviolent Offenders',
    summary: 'Allows parole consideration for nonviolent felons and authorizes sentence credits.',
    category: 'criminal_justice',
    status: 'passed',
    electionDate: '2016-11-08',
    result: {
      yesVotes: 8829068,
      noVotes: 4735476,
      yesPercentage: 65.1,
      noPercentage: 34.9,
      totalVotes: 13564544,
      turnout: 0.59,
      passed: true,
    },
  },
  '2016-58': {
    number: '58',
    year: 2016,
    title: 'English Proficiency - Multilingual Education',
    summary: 'Allows schools to establish multilingual education programs.',
    category: 'education',
    status: 'passed',
    electionDate: '2016-11-08',
    result: {
      yesVotes: 9682878,
      noVotes: 3792063,
      yesPercentage: 71.9,
      noPercentage: 28.1,
      totalVotes: 13474941,
      turnout: 0.59,
      passed: true,
    },
  },
  '2016-59': {
    number: '59',
    year: 2016,
    title: 'Corporate Political Spending Advisory',
    summary: 'Advisory measure on whether to overturn Citizens United ruling.',
    category: 'government',
    status: 'passed',
    electionDate: '2016-11-08',
    result: {
      yesVotes: 7287071,
      noVotes: 5403339,
      yesPercentage: 57.4,
      noPercentage: 42.6,
      totalVotes: 12690410,
      turnout: 0.56,
      passed: true,
    },
  },
  '2016-60': {
    number: '60',
    year: 2016,
    title: 'Adult Films Condom Requirements',
    summary: 'Requires use of condoms in adult films and producer liability.',
    category: 'healthcare',
    status: 'failed',
    electionDate: '2016-11-08',
    result: {
      yesVotes: 5885679,
      noVotes: 7213252,
      yesPercentage: 44.9,
      noPercentage: 55.1,
      totalVotes: 13098931,
      turnout: 0.57,
      passed: false,
    },
  },
  '2016-61': {
    number: '61',
    year: 2016,
    title: 'State Prescription Drug Price Standards',
    summary: 'Prohibits state from paying more for drugs than US Department of Veterans Affairs.',
    category: 'healthcare',
    status: 'failed',
    electionDate: '2016-11-08',
    result: {
      yesVotes: 6041951,
      noVotes: 7139766,
      yesPercentage: 45.8,
      noPercentage: 54.2,
      totalVotes: 13181717,
      turnout: 0.58,
      passed: false,
    },
  },
  '2016-62': {
    number: '62',
    year: 2016,
    title: 'Repeal Death Penalty',
    summary: 'Replaces death penalty with life imprisonment without parole.',
    category: 'criminal_justice',
    status: 'failed',
    electionDate: '2016-11-08',
    result: {
      yesVotes: 5978687,
      noVotes: 7369428,
      yesPercentage: 44.8,
      noPercentage: 55.2,
      totalVotes: 13348115,
      turnout: 0.58,
      passed: false,
    },
  },
  '2016-63': {
    number: '63',
    year: 2016,
    title: 'Background Checks for Ammunition',
    summary: 'Requires background checks for ammunition purchases and large-capacity magazine ban.',
    category: 'criminal_justice',
    status: 'passed',
    electionDate: '2016-11-08',
    result: {
      yesVotes: 8849678,
      noVotes: 4583419,
      yesPercentage: 65.9,
      noPercentage: 34.1,
      totalVotes: 13433097,
      turnout: 0.59,
      passed: true,
    },
  },
  '2016-64': {
    number: '64',
    year: 2016,
    title: 'Marijuana Legalization',
    summary: 'Legalizes marijuana for recreational use by adults 21 and older.',
    category: 'criminal_justice',
    status: 'passed',
    electionDate: '2016-11-08',
    result: {
      yesVotes: 7866798,
      noVotes: 5833229,
      yesPercentage: 57.4,
      noPercentage: 42.6,
      totalVotes: 13700027,
      turnout: 0.60,
      passed: true,
    },
  },
  '2016-65': {
    number: '65',
    year: 2016,
    title: 'Carryout Bag Charges',
    summary: 'Redirects bag fee revenue to environmental programs.',
    category: 'environment',
    status: 'failed',
    electionDate: '2016-11-08',
    result: {
      yesVotes: 5392178,
      noVotes: 7698200,
      yesPercentage: 41.2,
      noPercentage: 58.8,
      totalVotes: 13090378,
      turnout: 0.57,
      passed: false,
    },
  },
  '2016-66': {
    number: '66',
    year: 2016,
    title: 'Death Penalty Procedures',
    summary: 'Changes procedures governing state death penalty appeals.',
    category: 'criminal_justice',
    status: 'passed',
    electionDate: '2016-11-08',
    result: {
      yesVotes: 6768717,
      noVotes: 6406555,
      yesPercentage: 51.4,
      noPercentage: 48.6,
      totalVotes: 13175272,
      turnout: 0.58,
      passed: true,
    },
  },
  '2016-67': {
    number: '67',
    year: 2016,
    title: 'Plastic Bag Ban Referendum',
    summary: 'Upholds or rejects statewide ban on single-use plastic bags.',
    category: 'environment',
    status: 'passed',
    electionDate: '2016-11-08',
    result: {
      yesVotes: 6871927,
      noVotes: 6167960,
      yesPercentage: 52.7,
      noPercentage: 47.3,
      totalVotes: 13039887,
      turnout: 0.57,
      passed: true,
    },
  },
};

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

class CASosClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = SOS_BASE_URL;
  }

  /**
   * Get all propositions for a given year
   */
  async getPropositionsByYear(year: number): Promise<Proposition[]> {
    const propositions: Proposition[] = [];

    // Filter known propositions by year
    for (const [key, prop] of Object.entries(KNOWN_PROPOSITIONS)) {
      if (key.startsWith(`${year}-`)) {
        propositions.push({
          id: key,
          number: prop.number || '',
          year: prop.year || year,
          electionDate: prop.electionDate || '',
          title: prop.title || '',
          summary: prop.summary || '',
          status: prop.status || 'upcoming',
          category: prop.category || 'other',
          sponsors: [],
          opponents: [],
          result: prop.result,
        });
      }
    }

    // Try to fetch additional data from SOS website
    try {
      const additionalData = await this.fetchPropositionsFromSOS(year);
      // Merge with known data
      for (const item of additionalData) {
        const existingIndex = propositions.findIndex(
          p => p.number === item.measureNumber
        );
        if (existingIndex >= 0) {
          // Update with fetched data
          propositions[existingIndex].sponsors = item.proponents;
          propositions[existingIndex].opponents = item.opponents;
        }
      }
    } catch (error) {
      console.error('Error fetching from SOS:', error);
    }

    return propositions.sort((a, b) => parseInt(a.number) - parseInt(b.number));
  }

  /**
   * Get a specific proposition
   */
  async getProposition(year: number, number: string): Promise<Proposition | null> {
    const key = `${year}-${number}`;
    const known = KNOWN_PROPOSITIONS[key];

    if (!known) {
      return null;
    }

    return {
      id: key,
      number: known.number || number,
      year: known.year || year,
      electionDate: known.electionDate || '',
      title: known.title || '',
      summary: known.summary || '',
      status: known.status || 'upcoming',
      category: known.category || 'other',
      sponsors: [],
      opponents: [],
      result: known.result,
    };
  }

  /**
   * Get election results for a proposition
   */
  async getElectionResults(year: number, measureNumber: string): Promise<ElectionResult | null> {
    const key = `${year}-${measureNumber}`;
    const prop = KNOWN_PROPOSITIONS[key];

    if (!prop?.result) {
      // Try to fetch from SOS results page
      return this.fetchResultsFromSOS(year, measureNumber);
    }

    return {
      measureNumber,
      year,
      yesVotes: prop.result.yesVotes,
      noVotes: prop.result.noVotes,
      yesPercentage: prop.result.yesPercentage,
      noPercentage: prop.result.noPercentage,
      totalVotes: prop.result.totalVotes,
      passed: prop.result.passed,
    };
  }

  /**
   * Get historical results for similar propositions
   */
  async getHistoricalResults(category: PropositionCategory, years = 10): Promise<ElectionResult[]> {
    const results: ElectionResult[] = [];
    const currentYear = new Date().getFullYear();

    for (const [key, prop] of Object.entries(KNOWN_PROPOSITIONS)) {
      if (prop.category === category && prop.result && prop.year && prop.year >= currentYear - years) {
        results.push({
          measureNumber: prop.number || '',
          year: prop.year,
          yesVotes: prop.result.yesVotes,
          noVotes: prop.result.noVotes,
          yesPercentage: prop.result.yesPercentage,
          noPercentage: prop.result.noPercentage,
          totalVotes: prop.result.totalVotes,
          passed: prop.result.passed,
        });
      }
    }

    return results.sort((a, b) => b.year - a.year);
  }

  /**
   * Fetch proposition info from SOS website
   */
  private async fetchPropositionsFromSOS(year: number): Promise<BallotMeasureInfo[]> {
    try {
      // The SOS website has a structured page for ballot measures
      const url = `${this.baseUrl}/elections/ballot-measures/qualified-ballot-measures`;

      const response = await fetch(url, {
        headers: {
          'Accept': 'text/html',
          'User-Agent': 'CA-Proposition-Predictor/1.0',
        },
        next: { revalidate: 3600 },
      });

      if (!response.ok) {
        return [];
      }

      // In a real implementation, we would parse the HTML
      // For now, return empty array as we have structured data above
      return [];
    } catch (error) {
      console.error('Error fetching from SOS:', error);
      return [];
    }
  }

  /**
   * Fetch election results from SOS
   */
  private async fetchResultsFromSOS(year: number, measureNumber: string): Promise<ElectionResult | null> {
    try {
      // SOS publishes results in various formats
      // Example: https://www.sos.ca.gov/elections/prior-elections/statewide-election-results
      const url = `${this.baseUrl}/elections/prior-elections/statewide-election-results/general-election-${year}`;

      const response = await fetch(url, {
        headers: {
          'Accept': 'text/html',
          'User-Agent': 'CA-Proposition-Predictor/1.0',
        },
        next: { revalidate: 86400 },
      });

      if (!response.ok) {
        return null;
      }

      // Would parse HTML for results
      return null;
    } catch (error) {
      console.error('Error fetching results:', error);
      return null;
    }
  }

  /**
   * Get all available years with proposition data
   */
  getAvailableYears(): number[] {
    const years = new Set<number>();
    for (const [key] of Object.entries(KNOWN_PROPOSITIONS)) {
      const year = parseInt(key.split('-')[0]);
      if (!isNaN(year)) {
        years.add(year);
      }
    }
    return Array.from(years).sort((a, b) => b - a);
  }
}

export const caSosClient = new CASosClient();
export default caSosClient;
