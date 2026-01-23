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
  Progress,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui';
import { formatPercentage, getProbabilityColor } from '@/lib/utils';
import { BarChart3, ArrowRight, Info, Filter, Loader2 } from 'lucide-react';
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
  const [sortBy, setSortBy] = useState<'probability' | 'confidence'>('probability');

  useEffect(() => {
    const fetchPredictions = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch upcoming propositions from 2025 and 2026
        const currentYear = new Date().getFullYear();
        const yearsToFetch = [currentYear, currentYear + 1];

        const allPropositions: Proposition[] = [];

        for (const year of yearsToFetch) {
          const response = await fetch(`/api/propositions?year=${year}`);
          const data: ApiResponse<Proposition[]> = await response.json();

          if (data.success && data.data) {
            // Only include upcoming propositions
            const upcoming = data.data.filter(p => p.status === 'upcoming');
            allPropositions.push(...upcoming);
          }
        }

        if (allPropositions.length === 0) {
          setPredictions([]);
          return;
        }

        // Generate predictions for each proposition
        const predictionsWithData: PredictionItem[] = await Promise.all(
          allPropositions.map(async (prop) => {
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
                  prediction: predData.data,
                };
              }
            } catch {
              // If prediction fails, generate a basic one
            }

            // Fallback prediction
            return {
              id: prop.id,
              number: prop.number,
              title: prop.title,
              category: prop.category,
              year: prop.year,
              electionDate: prop.electionDate,
              status: prop.status,
              prediction: {
                propositionId: prop.id,
                passageProbability: 0.5,
                confidence: 0.5,
                factors: [],
                historicalComparison: [],
                generatedAt: new Date().toISOString(),
              },
            };
          })
        );

        setPredictions(predictionsWithData);
      } catch (err) {
        setError('Failed to load predictions');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPredictions();
  }, []);

  const sortedPredictions = [...predictions].sort((a, b) => {
    if (sortBy === 'probability') {
      return b.prediction.passageProbability - a.prediction.passageProbability;
    }
    return b.prediction.confidence - a.prediction.confidence;
  });

  const selectedItem = selectedPrediction
    ? predictions.find((p) => p.id === selectedPrediction)
    : null;

  const avgProbability = predictions.length > 0
    ? predictions.reduce((sum, p) => sum + p.prediction.passageProbability, 0) / predictions.length
    : 0;

  const likelyToPass = predictions.filter(
    (p) => p.prediction.passageProbability >= 0.5
  ).length;

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
          <span className="ml-2 text-gray-600">Loading predictions...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-100 rounded-lg">
            <BarChart3 className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Prediction Dashboard</h1>
            <p className="text-gray-600">
              View passage probabilities for upcoming propositions
            </p>
          </div>
        </div>
      </div>

      {error && (
        <Card className="mb-8 border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-600">{error}</p>
          </CardContent>
        </Card>
      )}

      {predictions.length === 0 && !error ? (
        <Card className="mb-8">
          <CardContent className="pt-6 text-center">
            <BarChart3 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">No upcoming propositions found</p>
            <p className="text-sm text-gray-400">
              Check back closer to election dates for 2025 and 2026 propositions.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-primary-600">{predictions.length}</p>
                  <p className="text-sm text-gray-500">Upcoming Propositions</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-green-600">{likelyToPass}</p>
                  <p className="text-sm text-gray-500">Likely to Pass</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-red-600">
                    {predictions.length - likelyToPass}
                  </p>
                  <p className="text-sm text-gray-500">Likely to Fail</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-gray-700">
                    {formatPercentage(avgProbability)}
                  </p>
                  <p className="text-sm text-gray-500">Avg. Probability</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Predictions List */}
            <div className="lg:col-span-1 space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">All Predictions</CardTitle>
                    <Select value={sortBy} onValueChange={(v) => setSortBy(v as 'probability' | 'confidence')}>
                      <SelectTrigger className="w-32">
                        <Filter className="h-3 w-3 mr-1" />
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="probability">Probability</SelectItem>
                        <SelectItem value="confidence">Confidence</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  {sortedPredictions.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setSelectedPrediction(item.id)}
                      className={`w-full text-left p-3 rounded-lg border transition-colors ${
                        selectedPrediction === item.id
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">
                            Prop {item.number}
                          </span>
                          <Badge variant="default" className="text-xs">
                            {item.year}
                          </Badge>
                        </div>
                        <span
                          className={`text-lg font-bold ${getProbabilityColor(
                            item.prediction.passageProbability
                          )}`}
                        >
                          {formatPercentage(item.prediction.passageProbability)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 truncate">{item.title}</p>
                      <Progress
                        value={item.prediction.passageProbability * 100}
                        variant={item.prediction.passageProbability >= 0.5 ? 'success' : 'danger'}
                        size="sm"
                        className="mt-2"
                      />
                    </button>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Info className="h-4 w-4" />
                    About Predictions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    Predictions are generated using a weighted model that considers
                    campaign finance, demographics, ballot wording, timing, and
                    opposition strength. Confidence scores indicate the reliability
                    of each prediction based on available data.
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Selected Prediction Detail */}
            <div className="lg:col-span-2">
              {selectedItem ? (
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="default">
                              {selectedItem.category.replace('_', ' ')}
                            </Badge>
                            <Badge variant="secondary">
                              {selectedItem.year}
                            </Badge>
                          </div>
                          <CardTitle>
                            Proposition {selectedItem.number}: {selectedItem.title}
                          </CardTitle>
                          <p className="text-sm text-gray-500 mt-1">
                            Election: {new Date(selectedItem.electionDate).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                        <Link href={`/propositions/${selectedItem.id}`}>
                          <Button variant="outline" size="sm">
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
                <Card className="h-full min-h-[400px] flex items-center justify-center">
                  <CardContent className="text-center">
                    <BarChart3 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 font-medium">Select a proposition</p>
                    <p className="text-sm text-gray-400">
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
