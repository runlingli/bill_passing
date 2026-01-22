'use client';

import Link from 'next/link';
import { PredictionDisplay, FinanceChart, ScenarioBuilder, ScenarioResultsDisplay } from '@/components/features';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Badge,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@/components/ui';
import { formatDate, formatCurrency } from '@/lib/utils';
import {
  ArrowLeft,
  Calendar,
  Users,
  FileText,
  ExternalLink,
  TrendingUp,
  DollarSign,
  Zap,
} from 'lucide-react';
import {
  PropositionWithDetails,
  Scenario,
} from '@/types';
import { useState } from 'react';

// Mock data
const getMockProposition = (id: string): PropositionWithDetails => ({
  id,
  number: '50',
  year: 2024,
  electionDate: '2024-11-05',
  title: 'Local Government Funding Amendment',
  summary:
    'Reduces the voter approval threshold for local bonds and special taxes from two-thirds to 55% for affordable housing, public infrastructure, and public hospitals.',
  fullText:
    'This proposition amends the California Constitution to lower the voter approval requirement for local government general obligation bonds and special taxes from two-thirds (66.67%) to 55% for projects related to affordable housing construction, public infrastructure improvements, and public hospital facilities. The measure would also require additional reporting and accountability measures for projects funded under this reduced threshold.',
  status: 'upcoming',
  category: 'government',
  sponsors: [
    'California League of Cities',
    'California State Association of Counties',
    'California Housing Consortium',
  ],
  opponents: [
    'Howard Jarvis Taxpayers Association',
    'California Business Properties Association',
  ],
  finance: {
    propositionId: id,
    totalSupport: 15_234_567,
    totalOpposition: 8_765_432,
    supportCommittees: [
      {
        id: 'c1',
        name: 'Yes on 50 - Californians for Local Control',
        position: 'support',
        totalRaised: 12_500_000,
        totalSpent: 9_800_000,
      },
      {
        id: 'c2',
        name: 'Housing Now Coalition',
        position: 'support',
        totalRaised: 2_734_567,
        totalSpent: 2_100_000,
      },
    ],
    oppositionCommittees: [
      {
        id: 'c3',
        name: 'No on 50 - Protect Taxpayer Rights',
        position: 'opposition',
        totalRaised: 7_500_000,
        totalSpent: 6_200_000,
      },
      {
        id: 'c4',
        name: 'California Taxpayers United',
        position: 'opposition',
        totalRaised: 1_265_432,
        totalSpent: 980_000,
      },
    ],
    topDonors: [
      { name: 'CA Realtors Association', amount: 5_000_000, position: 'support', type: 'organization' },
      { name: 'Building Industry Association', amount: 3_200_000, position: 'support', type: 'organization' },
      { name: 'Howard Jarvis Taxpayers Assn', amount: 2_500_000, position: 'opposition', type: 'organization' },
      { name: 'Service Employees International Union', amount: 1_800_000, position: 'support', type: 'organization' },
      { name: 'CA Chamber of Commerce', amount: 1_500_000, position: 'opposition', type: 'organization' },
      { name: 'Individual: John Smith', amount: 500_000, position: 'support', type: 'individual' },
      { name: 'CA Hospital Association', amount: 450_000, position: 'support', type: 'organization' },
    ],
    lastUpdated: new Date().toISOString(),
  },
  prediction: {
    propositionId: id,
    passageProbability: 0.38,
    confidence: 0.72,
    factors: [
      {
        name: 'campaignFinance',
        weight: 0.25,
        value: 0.64,
        impact: 'positive',
        description: 'Support spending outpaces opposition by 42.5%',
      },
      {
        name: 'demographics',
        weight: 0.2,
        value: 0.52,
        impact: 'neutral',
        description: 'Demographic projections show 52.0% support',
      },
      {
        name: 'ballotWording',
        weight: 0.15,
        value: 0.45,
        impact: 'negative',
        description: 'Ballot language is moderate with neutral framing',
      },
      {
        name: 'timing',
        weight: 0.1,
        value: 0.55,
        impact: 'positive',
        description: 'November election in presidential year',
      },
      {
        name: 'opposition',
        weight: 0.1,
        value: 0.35,
        impact: 'negative',
        description: '2 organized opposition groups',
      },
    ],
    historicalComparison: [
      {
        propositionId: 'h1',
        propositionNumber: '39',
        year: 2012,
        similarity: 0.78,
        result: 'passed',
        yesPercentage: 55.1,
      },
      {
        propositionId: 'h2',
        propositionNumber: '30',
        year: 2012,
        similarity: 0.72,
        result: 'passed',
        yesPercentage: 55.4,
      },
      {
        propositionId: 'h3',
        propositionNumber: '13',
        year: 2020,
        similarity: 0.65,
        result: 'failed',
        yesPercentage: 48.4,
      },
    ],
    generatedAt: new Date().toISOString(),
  },
  ballotAnalysis: {
    propositionId: id,
    wordCount: 342,
    readabilityScore: 45,
    sentimentScore: 0.1,
    complexity: 'moderate',
    keyPhrases: [
      'voter approval threshold',
      'two-thirds',
      'affordable housing',
      'public infrastructure',
      'general obligation bonds',
    ],
    comparisonToSimilar: {
      avgWordCount: 298,
      avgReadability: 52,
    },
  },
});

interface PageProps {
  params: { id: string };
}

export default function PropositionDetailPage({ params }: PageProps) {
  const { id } = params;
  const proposition = getMockProposition(id);
  const [scenarioResults, setScenarioResults] = useState<Scenario | null>(null);

  const handleScenarioRun = (scenario: Scenario) => {
    setScenarioResults(scenario);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Link
        href="/propositions"
        className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        Back to Propositions
      </Link>

      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <Badge variant="info">{proposition.status}</Badge>
          <Badge variant="default">{proposition.category.replace('_', ' ')}</Badge>
          <Badge variant="default">{proposition.year}</Badge>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Proposition {proposition.number}: {proposition.title}
        </h1>
        <p className="text-lg text-gray-600">{proposition.summary}</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Election Date</p>
                <p className="font-semibold">{formatDate(proposition.electionDate)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Prediction</p>
                <p className="font-semibold">
                  {proposition.prediction
                    ? `${(proposition.prediction.passageProbability * 100).toFixed(0)}% likely to pass`
                    : 'N/A'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <DollarSign className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Total Funding</p>
                <p className="font-semibold">
                  {proposition.finance
                    ? formatCurrency(
                        proposition.finance.totalSupport + proposition.finance.totalOpposition,
                        true
                      )
                    : 'N/A'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Sponsors</p>
                <p className="font-semibold">{proposition.sponsors.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="prediction" className="space-y-6">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="prediction" className="gap-2">
            <TrendingUp className="h-4 w-4" />
            Prediction
          </TabsTrigger>
          <TabsTrigger value="finance" className="gap-2">
            <DollarSign className="h-4 w-4" />
            Campaign Finance
          </TabsTrigger>
          <TabsTrigger value="scenarios" className="gap-2">
            <Zap className="h-4 w-4" />
            What-If Scenarios
          </TabsTrigger>
          <TabsTrigger value="details" className="gap-2">
            <FileText className="h-4 w-4" />
            Full Details
          </TabsTrigger>
        </TabsList>

        <TabsContent value="prediction">
          {proposition.prediction ? (
            <PredictionDisplay
              prediction={proposition.prediction}
              showFactors
              showHistorical
            />
          ) : (
            <Card>
              <CardContent className="py-12 text-center text-gray-500">
                Prediction data is not available for this proposition.
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="finance">
          {proposition.finance ? (
            <FinanceChart finance={proposition.finance} />
          ) : (
            <Card>
              <CardContent className="py-12 text-center text-gray-500">
                Campaign finance data is not yet available.
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="scenarios">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ScenarioBuilder
              proposition={proposition}
              onScenarioRun={handleScenarioRun}
            />
            {scenarioResults ? (
              <ScenarioResultsDisplay scenario={scenarioResults} />
            ) : (
              <Card>
                <CardContent className="py-12 text-center text-gray-500">
                  <Zap className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="font-medium mb-2">No scenario results yet</p>
                  <p className="text-sm">
                    Configure and run a scenario to see how different factors
                    might affect the outcome.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="details">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Full Text Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed">{proposition.fullText}</p>
                </CardContent>
              </Card>

              {proposition.ballotAnalysis && (
                <Card>
                  <CardHeader>
                    <CardTitle>Ballot Language Analysis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <p className="text-2xl font-bold text-gray-900">
                          {proposition.ballotAnalysis.wordCount}
                        </p>
                        <p className="text-sm text-gray-500">Words</p>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <p className="text-2xl font-bold text-gray-900">
                          {proposition.ballotAnalysis.readabilityScore}
                        </p>
                        <p className="text-sm text-gray-500">Readability</p>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <p className="text-2xl font-bold text-gray-900 capitalize">
                          {proposition.ballotAnalysis.complexity}
                        </p>
                        <p className="text-sm text-gray-500">Complexity</p>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <p className="text-2xl font-bold text-gray-900">
                          {proposition.ballotAnalysis.sentimentScore > 0 ? '+' : ''}
                          {proposition.ballotAnalysis.sentimentScore.toFixed(1)}
                        </p>
                        <p className="text-sm text-gray-500">Sentiment</p>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Key Phrases</h4>
                      <div className="flex flex-wrap gap-2">
                        {proposition.ballotAnalysis.keyPhrases.map((phrase) => (
                          <Badge key={phrase} variant="default">
                            {phrase}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Sponsors</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {proposition.sponsors.map((sponsor) => (
                      <li
                        key={sponsor}
                        className="flex items-center gap-2 p-2 bg-green-50 rounded-lg"
                      >
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                        <span className="text-sm">{sponsor}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Opponents</CardTitle>
                </CardHeader>
                <CardContent>
                  {proposition.opponents.length > 0 ? (
                    <ul className="space-y-2">
                      {proposition.opponents.map((opponent) => (
                        <li
                          key={opponent}
                          className="flex items-center gap-2 p-2 bg-red-50 rounded-lg"
                        >
                          <div className="w-2 h-2 bg-red-500 rounded-full" />
                          <span className="text-sm">{opponent}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-gray-500">No official opposition recorded</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>External Resources</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    <li>
                      <a
                        href="https://www.sos.ca.gov/elections/ballot-measures"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-primary-600 hover:underline"
                      >
                        CA Secretary of State
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </li>
                    <li>
                      <a
                        href="https://cal-access.sos.ca.gov/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-primary-600 hover:underline"
                      >
                        Cal-Access Campaign Finance
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </li>
                    <li>
                      <a
                        href="https://ballotpedia.org/California_ballot_propositions"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-primary-600 hover:underline"
                      >
                        Ballotpedia
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
