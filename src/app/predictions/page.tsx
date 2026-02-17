'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { PredictionDisplay } from '@/components/features';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Badge,
  Button,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui';
import { formatPercentage } from '@/lib/utils';
import { BarChart3, ArrowRight, Info, Filter, Loader2, TrendingUp, TrendingDown, Target } from 'lucide-react';
import { Proposition, PropositionPrediction, ApiResponse } from '@/types';

interface PredictionItem {
  id: string;
  number: string;
  title: string;
  category: string;
  year: number;
  electionDate: string;
  status: string;
  prediction: PropositionPrediction;
}

export default function PredictionsPage() {
  const [predictions, setPredictions] = useState<PredictionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPrediction, setSelectedPrediction] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'probability' | 'dataQuality' | 'number'>('number');

  // Fetch upcoming propositions and their predictions
  useEffect(() => {
    const fetchUpcomingPredictions = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch available years from the API
        const yearsResponse = await fetch('/api/propositions/years');
        const yearsData: ApiResponse<number[]> = await yearsResponse.json();

        if (!yearsData.success || !yearsData.data || yearsData.data.length === 0) {
          setPredictions([]);
          setError('Could not load available years');
          return;
        }

        // Fetch propositions from current and future years
        const now = new Date();
        const currentYear = now.getFullYear();
        const yearsToCheck = yearsData.data.filter(y => y >= currentYear);

        const fetchPromises = yearsToCheck.map(async (year) => {
          const response = await fetch(`/api/propositions?year=${year}`);
          const data: ApiResponse<Proposition[]> = await response.json();
          return data.success ? data.data : [];
        });

        const results = await Promise.all(fetchPromises);
        const allPropositions = results.flat();

        // Filter to only upcoming propositions (election date in the future)
        const upcoming = allPropositions.filter(p => {
          if (p.status === 'upcoming') return true;
          // Double-check by election date in case status wasn't set correctly
          const electionDay = new Date(p.electionDate + 'T23:59:59');
          return electionDay > now;
        });

        if (upcoming.length === 0) {
          setPredictions([]);
          return;
        }

        // Generate predictions for each upcoming proposition (batch in groups of 5)
        const items: PredictionItem[] = [];
        const batchSize = 5;

        for (let i = 0; i < upcoming.length; i += batchSize) {
          const batch = upcoming.slice(i, i + batchSize);
          const batchResults = await Promise.all(
            batch.map(async (prop) => {
              try {
                const predResponse = await fetch(`/api/predictions/${prop.id}`);
                const predData = await predResponse.json();

                if (predData.success && predData.data) {
                  return {
                    id: prop.id,
                    number: prop.number,
                    title: prop.title,
                    category: prop.category,
                    year: prop.year,
                    electionDate: prop.electionDate,
                    status: prop.status,
                    prediction: predData.data as PropositionPrediction,
                  };
                }
              } catch {
                // Skip propositions where prediction fails
              }
              return null;
            })
          );

          items.push(...batchResults.filter((r): r is PredictionItem => r !== null));
        }

        setPredictions(items);
        if (items.length > 0 && !selectedPrediction) {
          setSelectedPrediction(items[0].id);
        }
      } catch (err) {
        setError('Failed to load predictions');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUpcomingPredictions();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const sortedPredictions = [...predictions].sort((a, b) => {
    if (sortBy === 'probability') {
      return b.prediction.passageProbability - a.prediction.passageProbability;
    }
    if (sortBy === 'dataQuality') {
      const qualityOrder = { strong: 3, moderate: 2, limited: 1 };
      return (qualityOrder[b.prediction.dataQuality] || 0) - (qualityOrder[a.prediction.dataQuality] || 0);
    }
    // Sort by number ascending
    return parseInt(a.number) - parseInt(b.number);
  });

  const selectedItem = selectedPrediction
    ? predictions.find((p) => p.id === selectedPrediction)
    : null;

  const withData = predictions.filter(p => p.prediction.dataQuality !== 'limited');

  const avgProbability = withData.length > 0
    ? withData.reduce((sum, p) => sum + p.prediction.passageProbability, 0) / withData.length
    : 0;

  const likelyToPass = withData.filter(
    (p) => p.prediction.passageProbability >= 0.5
  ).length;

  const insufficientData = predictions.length - withData.length;

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-blue-900" />
          <span className="ml-3 text-gray-600 font-medium">Loading predictions...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 bg-blue-900 rounded-lg flex items-center justify-center">
            <BarChart3 className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="font-display text-3xl font-bold text-gray-900">Prediction Dashboard</h1>
            <p className="text-gray-600 font-medium">
              Passage probability analysis for upcoming California propositions
            </p>
          </div>
        </div>
        <div className="h-1 w-24 bg-blue-900 rounded" />
      </div>

      {error && (
        <Card className="mb-8 border-2 border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-700 font-medium">{error}</p>
          </CardContent>
        </Card>
      )}

      {predictions.length === 0 && !error ? (
        <Card className="mb-8 border-2 border-gray-200">
          <CardContent className="py-12 text-center">
            <BarChart3 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-700 font-bold text-lg">No upcoming propositions found</p>
            <p className="text-sm text-gray-500 mt-2">
              Predictions will appear here when upcoming ballot measures are available.
            </p>
            <Link href="/propositions">
              <Button variant="outline" className="mt-4 border-2 border-blue-900 text-blue-900 hover:bg-blue-50 font-semibold">
                Browse All Propositions
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card className="border-2 border-gray-200">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-900 rounded flex items-center justify-center">
                    <Target className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-3xl font-display font-bold text-blue-900">{predictions.length}</p>
                    <p className="text-sm text-gray-600 font-medium">Upcoming</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-2 border-gray-200">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-700 rounded flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-3xl font-display font-bold text-green-700">{likelyToPass}</p>
                    <p className="text-sm text-gray-600 font-medium">Predicted Pass</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-2 border-gray-200">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-700 rounded flex items-center justify-center">
                    <TrendingDown className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-3xl font-display font-bold text-red-700">
                      {withData.length - likelyToPass}
                    </p>
                    <p className="text-sm text-gray-600 font-medium">Predicted Fail</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-2 border-gray-200">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-700 rounded flex items-center justify-center">
                    <BarChart3 className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-3xl font-display font-bold text-gray-700">
                      {insufficientData > 0 ? `${insufficientData}` : formatPercentage(avgProbability)}
                    </p>
                    <p className="text-sm text-gray-600 font-medium">
                      {insufficientData > 0 ? 'Low Data' : 'Avg. Probability'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Predictions List */}
            <div className="lg:col-span-1 space-y-4">
              <Card className="border-2 border-gray-200">
                <CardHeader className="pb-3 border-b border-gray-200">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg font-display font-bold text-gray-900">Predictions</CardTitle>
                      <Select value={sortBy} onValueChange={(v) => setSortBy(v as 'probability' | 'dataQuality' | 'number')}>
                        <SelectTrigger className="w-36 border-2 border-gray-200">
                          <Filter className="h-3 w-3 mr-1" />
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="number">By Number</SelectItem>
                          <SelectItem value="probability">Probability</SelectItem>
                          <SelectItem value="dataQuality">Data Quality</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-4 space-y-2 max-h-[600px] overflow-y-auto">
                  {sortedPredictions.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setSelectedPrediction(item.id)}
                      className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                        selectedPrediction === item.id
                          ? 'border-blue-900 bg-blue-50'
                          : 'border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gray-900">
                            Prop {item.number}
                          </span>
                          <Badge className="bg-gray-100 text-gray-700 border border-gray-300 text-xs">
                            {item.year}
                          </Badge>
                        </div>
                        {item.prediction.dataQuality !== 'limited' ? (
                          <span
                            className={`text-xl font-bold ${
                              item.prediction.passageProbability >= 0.5
                                ? 'text-blue-900'
                                : 'text-red-700'
                            }`}
                          >
                            {formatPercentage(item.prediction.passageProbability)}
                          </span>
                        ) : (
                          <span className="text-sm font-medium text-gray-400">No data</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-600 truncate font-medium">{item.title}</p>
                      {item.prediction.dataQuality !== 'limited' && (
                        <div className="mt-3 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${
                              item.prediction.passageProbability >= 0.5
                                ? 'bg-blue-900'
                                : 'bg-red-700'
                            }`}
                            style={{ width: `${item.prediction.passageProbability * 100}%` }}
                          />
                        </div>
                      )}
                      <p className="mt-2 text-xs text-gray-500 font-medium">
                        Election: {new Date(item.electionDate + 'T00:00:00').toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </p>
                    </button>
                  ))}
                </CardContent>
              </Card>

              <Card className="border-2 border-gray-200">
                <CardHeader className="border-b border-gray-200">
                  <CardTitle className="text-base font-bold text-gray-900 flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-900 rounded flex items-center justify-center">
                      <Info className="h-4 w-4 text-white" />
                    </div>
                    About Predictions
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <p className="text-sm text-gray-600">
                    Predictions are generated using real data only: campaign finance
                    from Cal-Access and historical election results from Ballotpedia.
                    When insufficient data is available, no prediction is shown rather
                    than displaying a fabricated number.
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Selected Prediction Detail */}
            <div className="lg:col-span-2">
              {selectedItem ? (
                <div className="space-y-6">
                  <Card className="border-2 border-gray-200">
                    <CardHeader className="border-b border-gray-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className="bg-blue-900 text-white border-0">
                              {selectedItem.category.replace(/_/g, ' ')}
                            </Badge>
                            <Badge className="bg-gray-100 text-gray-700 border border-gray-300">
                              {selectedItem.year}
                            </Badge>
                          </div>
                          <CardTitle className="text-xl font-display font-bold text-gray-900">
                            Proposition {selectedItem.number}: {selectedItem.title}
                          </CardTitle>
                          <p className="text-sm text-gray-600 mt-2 font-medium">
                            Election: {new Date(selectedItem.electionDate + 'T00:00:00').toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                        <Link href={`/propositions/${selectedItem.id}`}>
                          <Button variant="outline" size="sm" className="border-2 border-blue-900 text-blue-900 hover:bg-blue-50
						  w-40 font-semibold">
                            Full Details
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </CardHeader>
                  </Card>

                  <PredictionDisplay
                    prediction={selectedItem.prediction}
                    showFactors
                    showHistorical
                  />
                </div>
              ) : (
                <Card className="h-full min-h-[400px] flex items-center justify-center border-2 border-gray-200">
                  <CardContent className="text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <BarChart3 className="h-8 w-8 text-gray-400" />
                    </div>
                    <p className="text-gray-700 font-bold text-lg">Select a proposition</p>
                    <p className="text-sm text-gray-500 mt-2">
                      Click on a proposition from the list to view detailed prediction analysis
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
