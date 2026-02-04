'use client';

import { PropositionPrediction, PredictionFactor } from '@/types';
import { Card, CardHeader, CardTitle, CardContent, Badge } from '@/components/ui';
import { formatPercentage } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus, Info } from 'lucide-react';

interface PredictionDisplayProps {
  prediction: PropositionPrediction;
  showFactors?: boolean;
  showHistorical?: boolean;
}

export function PredictionDisplay({
  prediction,
  showFactors = true,
  showHistorical = true,
}: PredictionDisplayProps) {
  const probabilityPercent = prediction.passageProbability * 100;

  return (
    <div className="space-y-6">
      <Card className="border-2 border-gray-200">
        <CardHeader className="border-b border-gray-200">
          <CardTitle className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-900 rounded flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">Passage Prediction</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="text-center mb-6">
            <div
              className={`text-6xl font-bold mb-2 ${prediction.passageProbability >= 0.5 ? 'text-blue-900' : 'text-red-700'}`}
            >
              {formatPercentage(prediction.passageProbability)}
            </div>
            <p className="text-gray-600 font-medium">Probability of Passage</p>
            <div className="mt-6 max-w-md mx-auto">
              <div className="h-4 bg-gray-200 rounded overflow-hidden">
                <div
                  className={`h-full ${probabilityPercent >= 50 ? 'bg-blue-900' : 'bg-red-700'}`}
                  style={{ width: `${probabilityPercent}%` }}
                />
              </div>
              <div className="flex justify-between mt-2 text-xs text-gray-500 font-medium">
                <span>Fail</span>
                <span>Pass</span>
              </div>
            </div>
            <div className="flex items-center justify-center gap-2 mt-4">
              <Badge className="bg-gray-100 text-gray-700 border border-gray-300 font-semibold">
                Confidence: {formatPercentage(prediction.confidence)}
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 text-center border-t-2 border-gray-200 pt-6">
            <div className="p-4 bg-blue-50 rounded border border-blue-200">
              <p className="text-2xl font-bold text-blue-900">
                {formatPercentage(prediction.passageProbability)}
              </p>
              <p className="text-sm text-gray-600 font-medium">Likely Pass</p>
            </div>
            <div className="p-4 bg-gray-50 rounded border border-gray-200">
              <p className="text-2xl font-bold text-gray-500">
                {formatPercentage(0.5 - Math.abs(prediction.passageProbability - 0.5))}
              </p>
              <p className="text-sm text-gray-600 font-medium">Uncertain</p>
            </div>
            <div className="p-4 bg-red-50 rounded border border-red-200">
              <p className="text-2xl font-bold text-red-700">
                {formatPercentage(1 - prediction.passageProbability)}
              </p>
              <p className="text-sm text-gray-600 font-medium">Likely Fail</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {showFactors && prediction.factors.length > 0 && (
        <Card className="border-2 border-gray-200">
          <CardHeader className="border-b border-gray-200">
            <CardTitle className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-900 rounded flex items-center justify-center">
                <Info className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">Prediction Factors</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {prediction.factors.map((factor) => (
                <FactorRow key={factor.name} factor={factor} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {showHistorical && prediction.historicalComparison.length > 0 && (
        <Card className="border-2 border-gray-200">
          <CardHeader className="border-b border-gray-200">
            <CardTitle className="text-xl font-bold text-gray-900">Similar Historical Propositions</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-3">
              {prediction.historicalComparison.map((comparison) => (
                <div
                  key={comparison.propositionId}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded border border-gray-200"
                >
                  <div>
                    <p className="font-bold text-gray-900">
                      Prop {comparison.propositionNumber} ({comparison.year})
                    </p>
                    <p className="text-sm text-gray-600">
                      {formatPercentage(comparison.similarity)} similar
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge className={`${comparison.result === 'passed' ? 'bg-green-700' : 'bg-red-700'} text-white border-0`}>
                      {comparison.result === 'passed' ? 'Passed' : 'Failed'}
                    </Badge>
                    <p className="text-sm text-gray-600 mt-1 font-medium">
                      {comparison.yesPercentage.toFixed(1)}% Yes
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function FactorRow({ factor }: { factor: PredictionFactor }) {
  const ImpactIcon = factor.impact === 'positive' ? TrendingUp : factor.impact === 'negative' ? TrendingDown : Minus;

  const factorLabels: Record<string, string> = {
    campaignFinance: 'Campaign Finance',
    historicalSimilarity: 'Historical Similarity',
    demographics: 'Demographics',
    ballotWording: 'Ballot Wording',
    timing: 'Election Timing',
    opposition: 'Opposition Strength',
  };

  const impactStyles = {
    positive: 'bg-green-100 text-green-700 border-green-200',
    negative: 'bg-red-100 text-red-700 border-red-200',
    neutral: 'bg-gray-100 text-gray-700 border-gray-200',
  };

  return (
    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded border border-gray-200">
      <div
        className={`p-2 rounded border ${impactStyles[factor.impact]}`}
      >
        <ImpactIcon className="h-5 w-5" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-2">
          <span className="font-bold text-gray-900">
            {factorLabels[factor.name] || factor.name}
          </span>
          <span className="text-sm text-gray-600 font-medium">
            Weight: {(factor.weight * 100).toFixed(0)}%
          </span>
        </div>
        <div className="h-2 bg-gray-200 rounded overflow-hidden mb-2">
          <div
            className={`h-full ${factor.impact === 'positive' ? 'bg-green-600' : factor.impact === 'negative' ? 'bg-red-600' : 'bg-blue-900'}`}
            style={{ width: `${factor.value * 100}%` }}
          />
        </div>
        <p className="text-sm text-gray-600">{factor.description}</p>
      </div>
    </div>
  );
}
