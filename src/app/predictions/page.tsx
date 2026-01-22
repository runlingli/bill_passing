'use client';

import { useState } from 'react';
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
import { BarChart3, ArrowRight, Info, Filter } from 'lucide-react';
import { PropositionPrediction } from '@/types';

// Mock predictions data
const mockPredictions: Array<{
  id: string;
  number: string;
  title: string;
  category: string;
  prediction: PropositionPrediction;
}> = [
  {
    id: '1',
    number: '1',
    title: 'Affordable Housing Bond Act',
    category: 'housing',
    prediction: {
      propositionId: '1',
      passageProbability: 0.62,
      confidence: 0.75,
      factors: [
        {
          name: 'campaignFinance',
          weight: 0.25,
          value: 0.68,
          impact: 'positive',
          description: 'Strong support funding advantage',
        },
        {
          name: 'demographics',
          weight: 0.2,
          value: 0.58,
          impact: 'positive',
          description: 'Favorable demographic alignment',
        },
        {
          name: 'ballotWording',
          weight: 0.15,
          value: 0.52,
          impact: 'neutral',
          description: 'Neutral ballot framing',
        },
        {
          name: 'timing',
          weight: 0.1,
          value: 0.55,
          impact: 'positive',
          description: 'Presidential year turnout boost',
        },
        {
          name: 'opposition',
          weight: 0.1,
          value: 0.45,
          impact: 'negative',
          description: 'Organized opposition present',
        },
      ],
      historicalComparison: [
        { propositionId: 'h1', propositionNumber: '1', year: 2018, similarity: 0.82, result: 'passed', yesPercentage: 54.1 },
        { propositionId: 'h2', propositionNumber: '2', year: 2018, similarity: 0.75, result: 'passed', yesPercentage: 53.4 },
      ],
      generatedAt: new Date().toISOString(),
    },
  },
  {
    id: '2',
    number: '2',
    title: 'Education Funding Reform',
    category: 'education',
    prediction: {
      propositionId: '2',
      passageProbability: 0.58,
      confidence: 0.68,
      factors: [
        {
          name: 'campaignFinance',
          weight: 0.25,
          value: 0.55,
          impact: 'neutral',
          description: 'Balanced funding levels',
        },
        {
          name: 'demographics',
          weight: 0.2,
          value: 0.62,
          impact: 'positive',
          description: 'Strong support among parents',
        },
        {
          name: 'ballotWording',
          weight: 0.15,
          value: 0.48,
          impact: 'neutral',
          description: 'Complex language may reduce support',
        },
        {
          name: 'timing',
          weight: 0.1,
          value: 0.55,
          impact: 'positive',
          description: 'Presidential year turnout',
        },
        {
          name: 'opposition',
          weight: 0.1,
          value: 0.52,
          impact: 'neutral',
          description: 'Moderate organized opposition',
        },
      ],
      historicalComparison: [],
      generatedAt: new Date().toISOString(),
    },
  },
  {
    id: '3',
    number: '3',
    title: 'Climate Resilience Bond',
    category: 'environment',
    prediction: {
      propositionId: '3',
      passageProbability: 0.71,
      confidence: 0.82,
      factors: [
        {
          name: 'campaignFinance',
          weight: 0.25,
          value: 0.78,
          impact: 'positive',
          description: 'Strong support funding with minimal opposition',
        },
        {
          name: 'demographics',
          weight: 0.2,
          value: 0.65,
          impact: 'positive',
          description: 'High support among younger voters',
        },
        {
          name: 'ballotWording',
          weight: 0.15,
          value: 0.58,
          impact: 'positive',
          description: 'Clear environmental framing',
        },
        {
          name: 'timing',
          weight: 0.1,
          value: 0.55,
          impact: 'positive',
          description: 'Presidential year turnout',
        },
        {
          name: 'opposition',
          weight: 0.1,
          value: 0.72,
          impact: 'positive',
          description: 'Limited organized opposition',
        },
      ],
      historicalComparison: [],
      generatedAt: new Date().toISOString(),
    },
  },
  {
    id: '4',
    number: '36',
    title: 'Criminal Sentencing Reform',
    category: 'criminal_justice',
    prediction: {
      propositionId: '4',
      passageProbability: 0.45,
      confidence: 0.65,
      factors: [
        {
          name: 'campaignFinance',
          weight: 0.25,
          value: 0.52,
          impact: 'neutral',
          description: 'Evenly matched funding',
        },
        {
          name: 'demographics',
          weight: 0.2,
          value: 0.42,
          impact: 'negative',
          description: 'Divided support across demographics',
        },
        {
          name: 'ballotWording',
          weight: 0.15,
          value: 0.38,
          impact: 'negative',
          description: 'Controversial framing around crime',
        },
        {
          name: 'timing',
          weight: 0.1,
          value: 0.55,
          impact: 'positive',
          description: 'Presidential year turnout',
        },
        {
          name: 'opposition',
          weight: 0.1,
          value: 0.32,
          impact: 'negative',
          description: 'Strong organized opposition',
        },
      ],
      historicalComparison: [],
      generatedAt: new Date().toISOString(),
    },
  },
  {
    id: '5',
    number: '50',
    title: 'Local Government Funding',
    category: 'government',
    prediction: {
      propositionId: '5',
      passageProbability: 0.38,
      confidence: 0.72,
      factors: [
        {
          name: 'campaignFinance',
          weight: 0.25,
          value: 0.64,
          impact: 'positive',
          description: 'Support outpaces opposition',
        },
        {
          name: 'demographics',
          weight: 0.2,
          value: 0.48,
          impact: 'neutral',
          description: 'Mixed demographic support',
        },
        {
          name: 'ballotWording',
          weight: 0.15,
          value: 0.35,
          impact: 'negative',
          description: 'Tax-related framing may reduce support',
        },
        {
          name: 'timing',
          weight: 0.1,
          value: 0.55,
          impact: 'positive',
          description: 'Presidential year turnout',
        },
        {
          name: 'opposition',
          weight: 0.1,
          value: 0.28,
          impact: 'negative',
          description: 'Strong taxpayer group opposition',
        },
      ],
      historicalComparison: [],
      generatedAt: new Date().toISOString(),
    },
  },
];

export default function PredictionsPage() {
  const [selectedPrediction, setSelectedPrediction] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'probability' | 'confidence'>('probability');

  const sortedPredictions = [...mockPredictions].sort((a, b) => {
    if (sortBy === 'probability') {
      return b.prediction.passageProbability - a.prediction.passageProbability;
    }
    return b.prediction.confidence - a.prediction.confidence;
  });

  const selectedItem = selectedPrediction
    ? mockPredictions.find((p) => p.id === selectedPrediction)
    : null;

  const avgProbability =
    mockPredictions.reduce((sum, p) => sum + p.prediction.passageProbability, 0) /
    mockPredictions.length;

  const likelyToPass = mockPredictions.filter(
    (p) => p.prediction.passageProbability >= 0.5
  ).length;

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
              View and compare passage probabilities for all upcoming propositions
            </p>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-primary-600">{mockPredictions.length}</p>
              <p className="text-sm text-gray-500">Propositions Analyzed</p>
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
                {mockPredictions.length - likelyToPass}
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
                    <span className="font-medium text-sm">
                      Prop {item.number}
                    </span>
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
                      <Badge variant="default" className="mb-2">
                        {selectedItem.category.replace('_', ' ')}
                      </Badge>
                      <CardTitle>
                        Proposition {selectedItem.number}: {selectedItem.title}
                      </CardTitle>
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
    </div>
  );
}
