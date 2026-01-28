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
  Loader2,
} from 'lucide-react';
import {
  PropositionWithDetails,
  PropositionPrediction,
  Scenario,
  ApiResponse,
} from '@/types';
import { useState, useEffect } from 'react';

interface PageProps {
  params: { id: string };
}

export default function PropositionDetailPage({ params }: PageProps) {
  const { id } = params;
  const [proposition, setProposition] = useState<PropositionWithDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scenarioResults, setScenarioResults] = useState<Scenario | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Fetch proposition details and prediction in parallel
        const [propResponse, predResponse] = await Promise.all([
          fetch(`/api/propositions/${id}`),
          fetch(`/api/predictions/${id}`),
        ]);

        const propData: ApiResponse<PropositionWithDetails> = await propResponse.json();
        if (!propData.success) {
          setError(propData.error?.message || 'Failed to fetch proposition');
          return;
        }

        const prop = propData.data;

        // Attach prediction if available
        try {
          const predData: ApiResponse<PropositionPrediction> = await predResponse.json();
          if (predData.success) {
            prop.prediction = predData.data;
          }
        } catch {
          // Prediction fetch failed, continue without it
        }

        setProposition(prop);
      } catch {
        setError('Network error. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleScenarioRun = (scenario: Scenario) => {
    setScenarioResults(scenario);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
        <span className="ml-2 text-gray-600">Loading proposition...</span>
      </div>
    );
  }

  if (error || !proposition) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Link
          href="/propositions"
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Propositions
        </Link>
        <Card>
          <CardContent className="py-12 text-center text-red-600">
            {error || 'Proposition not found.'}
          </CardContent>
        </Card>
      </div>
    );
  }

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
        {proposition.sponsors && proposition.sponsors.length > 0 && (
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
        )}
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
                  {proposition.sponsors && proposition.sponsors.length > 0 ? (
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
                  ) : (
                    <p className="text-sm text-gray-500">No sponsor data available</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Opponents</CardTitle>
                </CardHeader>
                <CardContent>
                  {proposition.opponents && proposition.opponents.length > 0 ? (
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
                    <p className="text-sm text-gray-500">No opponent data available</p>
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
