/**
 * External API clients for data sources
 */

export { calAccessClient } from './cal-access';
export { censusClient, type CountyDemographics, type CongressionalDistrictDemographics } from './census';
export { caSosClient, type ElectionResult, type BallotMeasureInfo } from './ca-sos';
export { ballotpediaClient, type BallotpediaMeasure, type PollData, type Endorsement } from './ballotpedia';
