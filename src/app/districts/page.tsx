'use client';

import { useState } from 'react';
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
import { Map, Info } from 'lucide-react';
import { PropositionImpact, CaliforniaRegion, CALIFORNIA_REGIONS } from '@/types';

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

const mockPropositions = [
  { id: 'prop-50', number: '50', title: 'Local Government Funding Amendment' },
  { id: 'prop-1', number: '1', title: 'Affordable Housing Bond Act' },
  { id: 'prop-36', number: '36', title: 'Criminal Sentencing Reform' },
];

export default function DistrictsPage() {
  const [selectedProposition, setSelectedProposition] = useState<string>('prop-50');

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Map className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">District Impact Analysis</h1>
            <p className="text-gray-600">
              Understand how proposition passage affects partisan balance across California
            </p>
          </div>
        </div>
      </div>

      {/* Proposition Selector */}
      <Card className="mb-8">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select a Proposition to Analyze
              </label>
              <Select value={selectedProposition} onValueChange={setSelectedProposition}>
                <SelectTrigger className="w-full md:w-96">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {mockPropositions.map((prop) => (
                    <SelectItem key={prop.id} value={prop.id}>
                      Prop {prop.number}: {prop.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Info className="h-4 w-4" />
              Analysis based on voter registration and historical patterns
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="impact" className="space-y-6">
        <TabsList>
          <TabsTrigger value="impact">Impact Overview</TabsTrigger>
          <TabsTrigger value="regions">By Region</TabsTrigger>
          <TabsTrigger value="methodology">Methodology</TabsTrigger>
        </TabsList>

        <TabsContent value="impact">
          <DistrictImpactDisplay impact={mockImpact} />
        </TabsContent>

        <TabsContent value="regions">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(Object.keys(CALIFORNIA_REGIONS) as CaliforniaRegion[]).map((region) => (
              <Card key={region}>
                <CardHeader>
                  <CardTitle className="text-base">{region}</CardTitle>
                  <CardDescription>
                    {CALIFORNIA_REGIONS[region].length} counties
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Net Direction</span>
                      <Badge
                        variant={
                          region === 'Bay Area' || region === 'Los Angeles'
                            ? 'info'
                            : region === 'Central Valley' || region === 'Inland Empire'
                              ? 'danger'
                              : 'default'
                        }
                      >
                        {region === 'Bay Area' || region === 'Los Angeles'
                          ? 'Democratic'
                          : region === 'Central Valley' || region === 'Inland Empire'
                            ? 'Republican'
                            : 'Mixed'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Impact Level</span>
                      <span className="text-sm font-medium">
                        {region === 'Bay Area' || region === 'Central Valley' ? 'High' : 'Moderate'}
                      </span>
                    </div>
                    <div className="pt-2 border-t">
                      <p className="text-xs text-gray-500">
                        Counties: {CALIFORNIA_REGIONS[region].slice(0, 3).join(', ')}
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
            <Card>
              <CardHeader>
                <CardTitle>How We Calculate Impact</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Data Sources</h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-primary-500 rounded-full mt-2" />
                      <span>
                        <strong>Voter Registration:</strong> California Secretary of State
                        registration data by county and district
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-primary-500 rounded-full mt-2" />
                      <span>
                        <strong>Demographics:</strong> US Census Bureau American Community
                        Survey (ACS) data
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-primary-500 rounded-full mt-2" />
                      <span>
                        <strong>Historical Results:</strong> Past proposition results by
                        precinct from CA Elections Data Archive
                      </span>
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Calculation Method</h4>
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

            <Card>
              <CardHeader>
                <CardTitle>Understanding the Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium mb-1">Democratic Advantage</h4>
                  <p className="text-sm text-gray-600">
                    The percentage point difference between Democratic and Republican
                    voter registration. Positive values indicate Democratic lean.
                  </p>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium mb-1">Competitiveness Index</h4>
                  <p className="text-sm text-gray-600">
                    A 0-1 scale measuring how close the district is to 50/50 partisan
                    balance. Higher values indicate more competitive districts.
                  </p>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium mb-1">Balance Shift</h4>
                  <p className="text-sm text-gray-600">
                    The projected change in Democratic Advantage after proposition
                    passage. Positive shifts favor Democrats.
                  </p>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium mb-1">Significance Level</h4>
                  <p className="text-sm text-gray-600">
                    <strong>Significant:</strong> {'>'}2% shift | <strong>Moderate:</strong>{' '}
                    1-2% shift | <strong>Minimal:</strong> {'<'}1% shift
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Disclaimer</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
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
    </div>
  );
}
