'use client';

import { useState, useEffect } from 'react';
import { DistrictImpactDisplay } from '@/components/features';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Badge,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@/components/ui';
import { Map, Info, Calendar, FileText, Loader2, MapPin, TrendingUp, BarChart3 } from 'lucide-react';
import { PropositionImpact, CaliforniaRegion, CALIFORNIA_REGIONS, Proposition, ApiResponse } from '@/types';

const availableYears = ['2026', '2025', '2024', '2022', '2021', '2020', '2018', '2016'];

// Mock data for district impact
const mockImpact: PropositionImpact = {
  propositionId: 'prop-50',
  statewide: {
    totalAffectedDistricts: 42,
    averageBalanceShift: 0.8,
    netDirection: 'democratic',
    competitivenessChange: 0.02,
  },
  districts: [
    {
      districtId: 'cd-12',
      districtName: 'Congressional District 12 (San Francisco)',
      districtType: 'congressional',
      currentPartisan: {
        democraticAdvantage: 45.2,
        competitivenessIndex: 0.25,
        swingPotential: 0.15,
        voterEngagement: 0.72,
      },
      projectedPartisan: {
        democraticAdvantage: 46.1,
        competitivenessIndex: 0.24,
        swingPotential: 0.14,
        voterEngagement: 0.73,
      },
      change: {
        balanceShift: 0.9,
        direction: 'democratic',
        significance: 'minimal',
        driverFactors: ['Urban population', 'Young demographics'],
      },
      keyFactors: [
        {
          name: 'Urban concentration',
          description: 'High urban population influences policy reception',
          magnitude: 0.7,
          direction: 'positive',
        },
      ],
      historicalContext: [],
    },
    {
      districtId: 'cd-22',
      districtName: 'Congressional District 22 (Central Valley)',
      districtType: 'congressional',
      currentPartisan: {
        democraticAdvantage: -8.5,
        competitivenessIndex: 0.65,
        swingPotential: 0.45,
        voterEngagement: 0.58,
      },
      projectedPartisan: {
        democraticAdvantage: -7.2,
        competitivenessIndex: 0.68,
        swingPotential: 0.47,
        voterEngagement: 0.59,
      },
      change: {
        balanceShift: 1.3,
        direction: 'democratic',
        significance: 'moderate',
        driverFactors: ['Demographic shifts', 'Housing needs'],
      },
      keyFactors: [],
      historicalContext: [],
    },
    {
      districtId: 'cd-45',
      districtName: 'Congressional District 45 (Orange County)',
      districtType: 'congressional',
      currentPartisan: {
        democraticAdvantage: 2.1,
        competitivenessIndex: 0.82,
        swingPotential: 0.55,
        voterEngagement: 0.65,
      },
      projectedPartisan: {
        democraticAdvantage: 0.8,
        competitivenessIndex: 0.85,
        swingPotential: 0.58,
        voterEngagement: 0.66,
      },
      change: {
        balanceShift: -1.3,
        direction: 'republican',
        significance: 'moderate',
        driverFactors: ['Suburban resistance', 'Tax concerns'],
      },
      keyFactors: [],
      historicalContext: [],
    },
    {
      districtId: 'sd-15',
      districtName: 'State Senate District 15 (East Bay)',
      districtType: 'state_senate',
      currentPartisan: {
        democraticAdvantage: 38.5,
        competitivenessIndex: 0.18,
        swingPotential: 0.12,
        voterEngagement: 0.68,
      },
      projectedPartisan: {
        democraticAdvantage: 39.2,
        competitivenessIndex: 0.17,
        swingPotential: 0.11,
        voterEngagement: 0.69,
      },
      change: {
        balanceShift: 0.7,
        direction: 'democratic',
        significance: 'minimal',
        driverFactors: ['Progressive base'],
      },
      keyFactors: [],
      historicalContext: [],
    },
    {
      districtId: 'ad-36',
      districtName: 'Assembly District 36 (Inland Empire)',
      districtType: 'state_assembly',
      currentPartisan: {
        democraticAdvantage: -12.3,
        competitivenessIndex: 0.52,
        swingPotential: 0.38,
        voterEngagement: 0.52,
      },
      projectedPartisan: {
        democraticAdvantage: -14.1,
        competitivenessIndex: 0.48,
        swingPotential: 0.35,
        voterEngagement: 0.51,
      },
      change: {
        balanceShift: -1.8,
        direction: 'republican',
        significance: 'moderate',
        driverFactors: ['Rural opposition', 'Taxpayer concerns'],
      },
      keyFactors: [],
      historicalContext: [],
    },
  ],
  summary: {
    totalDistricts: 173,
    impactedDistricts: {
      significant: 8,
      moderate: 34,
      minimal: 131,
    },
    shiftDistribution: {
      democratic: 95,
      republican: 42,
      unchanged: 36,
    },
    competitivenessChange: {
      moreCompetitive: 28,
      lessCompetitive: 15,
      unchanged: 130,
    },
    representationImpact:
      'Moderate shifts in 42 districts, with a net direction favoring Democratic representation. Housing-focused districts show stronger support patterns.',
  },
};

export default function DistrictsPage() {
  const [selectedYear, setSelectedYear] = useState<string>('2025');
  const [propositions, setPropositions] = useState<Proposition[]>([]);
  const [selectedProposition, setSelectedProposition] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch propositions when year changes
  useEffect(() => {
    const fetchPropositions = async () => {
      setIsLoading(true);
      setError(null);
      setPropositions([]);
      setSelectedProposition('');

      try {
        const response = await fetch(`/api/propositions?year=${selectedYear}`);
        const data: ApiResponse<Proposition[]> = await response.json();

        if (data.success && data.data.length > 0) {
          setPropositions(data.data);
          setSelectedProposition(data.data[0].id);
        } else {
          setPropositions([]);
          setError(`No propositions found for ${selectedYear}`);
        }
      } catch {
        setError('Failed to fetch propositions');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPropositions();
  }, [selectedYear]);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 bg-blue-900 rounded-lg flex items-center justify-center">
            <Map className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">District Impact Analysis</h1>
            <p className="text-gray-600 font-medium">
              Understand how proposition passage affects partisan balance across California
            </p>
          </div>
        </div>
        <div className="h-1 w-24 bg-blue-900 rounded" />
      </div>

      {/* Year and Proposition Selector */}
      <Card className="mb-8 border-2 border-gray-200">
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Year Selection */}
              <div className="md:w-48">
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  <Calendar className="inline h-4 w-4 mr-1" />
                  Step 1: Select Year
                </label>
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger className="w-full border-2 border-gray-200">
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableYears.map((year) => (
                      <SelectItem key={year} value={year}>
                        {year}
                        {year === '2026' && ' (Upcoming)'}
                        {year === '2025' && ' (Special)'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Proposition Selection */}
              <div className="flex-1">
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  <FileText className="inline h-4 w-4 mr-1" />
                  Step 2: Select Proposition
                </label>
                <Select
                  value={selectedProposition}
                  onValueChange={setSelectedProposition}
                  disabled={isLoading || propositions.length === 0}
                >
                  <SelectTrigger className="w-full border-2 border-gray-200">
                    <SelectValue placeholder={
                      isLoading ? "Loading..." :
                      propositions.length === 0 ? `No propositions for ${selectedYear}` :
                      "Select a proposition"
                    } />
                  </SelectTrigger>
                  <SelectContent>
                    {propositions.map((prop) => (
                      <SelectItem key={prop.id} value={prop.id}>
                        Prop {prop.number}: {prop.title.length > 50 ? prop.title.substring(0, 50) + '...' : prop.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="md:self-end flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-4 py-2 rounded-lg border border-gray-200">
                <Info className="h-4 w-4 text-blue-900" />
                <span className="font-medium">Based on voter registration data</span>
              </div>
            </div>

            {/* Year stats */}
            {propositions.length > 0 && (
              <div className="text-sm text-gray-600 font-medium pt-3 border-t-2 border-gray-200">
                {propositions.length} propositions found for {selectedYear}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-900" />
          <span className="ml-3 text-gray-600 font-medium">Loading propositions...</span>
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <Card className="mb-8 border-2 border-amber-200 bg-amber-50">
          <CardContent className="py-4 text-center text-amber-700 font-medium">
            {error}. Try selecting a different year.
          </CardContent>
        </Card>
      )}

      {!isLoading && propositions.length > 0 && (
      <Tabs defaultValue="impact" className="space-y-6">
        <TabsList className="bg-gray-100 border-2 border-gray-200 p-1 rounded-lg">
          <TabsTrigger value="impact" className="data-[state=active]:bg-blue-900 data-[state=active]:text-white font-semibold">Impact Overview</TabsTrigger>
          <TabsTrigger value="regions" className="data-[state=active]:bg-blue-900 data-[state=active]:text-white font-semibold">By Region</TabsTrigger>
          <TabsTrigger value="methodology" className="data-[state=active]:bg-blue-900 data-[state=active]:text-white font-semibold">Methodology</TabsTrigger>
        </TabsList>

        <TabsContent value="impact">
          <DistrictImpactDisplay impact={mockImpact} />
        </TabsContent>

        <TabsContent value="regions">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(Object.keys(CALIFORNIA_REGIONS) as CaliforniaRegion[]).map((region) => (
              <Card key={region} className="border-2 border-gray-200 hover:border-blue-900 transition-colors">
                <CardHeader className="border-b border-gray-200">
                  <CardTitle className="text-lg font-bold text-gray-900">{region}</CardTitle>
                  <CardDescription className="text-gray-600 font-medium">
                    {CALIFORNIA_REGIONS[region].length} counties
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 font-medium">Net Direction</span>
                      <Badge
                        className={`border-0 font-semibold ${
                          region === 'Bay Area' || region === 'Los Angeles'
                            ? 'bg-blue-900 text-white'
                            : region === 'Central Valley' || region === 'Inland Empire'
                              ? 'bg-red-700 text-white'
                              : 'bg-gray-200 text-gray-700'
                        }`}
                      >
                        {region === 'Bay Area' || region === 'Los Angeles'
                          ? 'Democratic'
                          : region === 'Central Valley' || region === 'Inland Empire'
                            ? 'Republican'
                            : 'Mixed'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 font-medium">Impact Level</span>
                      <span className={`text-sm font-bold ${
                        region === 'Bay Area' || region === 'Central Valley' ? 'text-red-700' : 'text-amber-600'
                      }`}>
                        {region === 'Bay Area' || region === 'Central Valley' ? 'High' : 'Moderate'}
                      </span>
                    </div>
                    <div className="pt-3 border-t border-gray-200">
                      <p className="text-xs text-gray-600">
                        <span className="font-semibold">Counties:</span> {CALIFORNIA_REGIONS[region].slice(0, 3).join(', ')}
                        {CALIFORNIA_REGIONS[region].length > 3 &&
                          ` +${CALIFORNIA_REGIONS[region].length - 3} more`}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="methodology">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-2 border-gray-200">
              <CardHeader className="border-b border-gray-200">
                <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-900 rounded flex items-center justify-center">
                    <BarChart3 className="h-5 w-5 text-white" />
                  </div>
                  How We Calculate Impact
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                <div>
                  <h4 className="font-bold text-gray-900 mb-3">Data Sources</h4>
                  <ul className="space-y-3 text-sm text-gray-600">
                    <li className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-blue-900 rounded-full mt-2 flex-shrink-0" />
                      <span>
                        <strong className="text-gray-900">Voter Registration:</strong> California Secretary of State
                        registration data by county and district
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-blue-900 rounded-full mt-2 flex-shrink-0" />
                      <span>
                        <strong className="text-gray-900">Demographics:</strong> US Census Bureau American Community
                        Survey (ACS) data
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-blue-900 rounded-full mt-2 flex-shrink-0" />
                      <span>
                        <strong className="text-gray-900">Historical Results:</strong> Past proposition results by
                        precinct from CA Elections Data Archive
                      </span>
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-bold text-gray-900 mb-3">Calculation Method</h4>
                  <ol className="space-y-2 text-sm text-gray-600 list-decimal list-inside">
                    <li>Analyze proposition content and identify affected policy areas</li>
                    <li>Map policy areas to demographic and political indicators</li>
                    <li>Calculate expected turnout changes by demographic group</li>
                    <li>Project vote share changes based on historical patterns</li>
                    <li>Aggregate to district level and calculate partisan shifts</li>
                  </ol>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-gray-200">
              <CardHeader className="border-b border-gray-200">
                <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-900 rounded flex items-center justify-center">
                    <Info className="h-5 w-5 text-white" />
                  </div>
                  Understanding the Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <h4 className="font-bold text-gray-900 mb-1">Democratic Advantage</h4>
                  <p className="text-sm text-gray-600">
                    The percentage point difference between Democratic and Republican
                    voter registration. Positive values indicate Democratic lean.
                  </p>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <h4 className="font-bold text-gray-900 mb-1">Competitiveness Index</h4>
                  <p className="text-sm text-gray-600">
                    A 0-1 scale measuring how close the district is to 50/50 partisan
                    balance. Higher values indicate more competitive districts.
                  </p>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <h4 className="font-bold text-gray-900 mb-1">Balance Shift</h4>
                  <p className="text-sm text-gray-600">
                    The projected change in Democratic Advantage after proposition
                    passage. Positive shifts favor Democrats.
                  </p>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <h4 className="font-bold text-gray-900 mb-1">Significance Level</h4>
                  <p className="text-sm text-gray-600">
                    <span className="font-bold text-red-700">Significant:</span> {'>'}2% shift | <span className="font-bold text-amber-600">Moderate:</span>{' '}
                    1-2% shift | <span className="font-bold text-gray-500">Minimal:</span> {'<'}1% shift
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2 border-2 border-gray-200">
              <CardHeader className="border-b border-gray-200">
                <CardTitle className="text-xl font-bold text-gray-900">Disclaimer</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="text-sm text-gray-600 leading-relaxed">
                  This analysis is based on statistical models and historical patterns.
                  Actual impacts may vary based on many factors including campaign
                  dynamics, national political environment, and unforeseen events.
                  District impact projections should be viewed as one of many inputs
                  for understanding potential outcomes, not as definitive predictions.
                  Data sources include publicly available information from the California
                  Secretary of State, US Census Bureau, and academic research archives.
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
      )}
    </div>
  );
}
