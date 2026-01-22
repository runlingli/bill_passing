'use client';

import { PropositionPrediction, PredictionFactor } from '@/types';
import { Card, CardHeader, CardTitle, CardContent, Progress, Badge } from '@/components/ui';
import { formatPercentage, getProbabilityColor, getImpactColor } from '@/lib/utils';
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary-600" />
            Passage Prediction
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center mb-6">
            <div
              className={`text-5xl font-bold mb-2 ${getProbabilityColor(prediction.passageProbability)}`}
            >
              {formatPercentage(prediction.passageProbability)}
            </div>
            <p className="text-gray-500">Probability of Passage</p>
            <div className="mt-4 max-w-md mx-auto">
              <Progress
                value={probabilityPercent}
                variant={probabilityPercent >= 50 ? 'success' : 'danger'}
                size="lg"
              />
            </div>
            <div className="flex items-center justify-center gap-2 mt-3">
              <Badge variant="default" size="sm">
                Confidence: {formatPercentage(prediction.confidence)}
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 text-center border-t border-gray-100 pt-4">
            <div>
              <p className="text-2xl font-semibold text-green-600">
                {formatPercentage(prediction.passageProbability)}
              </p>
              <p className="text-sm text-gray-500">Likely Pass</p>
            </div>
            <div>
              <p className="text-2xl font-semibold text-gray-400">
                {formatPercentage(0.5 - Math.abs(prediction.passageProbability - 0.5))}
              </p>
              <p className="text-sm text-gray-500">Uncertain</p>
            </div>
            <div>
              <p className="text-2xl font-semibold text-red-600">
                {formatPercentage(1 - prediction.passageProbability)}
              </p>
              <p className="text-sm text-gray-500">Likely Fail</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {showFactors && prediction.factors.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5 text-primary-600" />
              Prediction Factors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {prediction.factors.map((factor) => (
                <FactorRow key={factor.name} factor={factor} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {showHistorical && prediction.historicalComparison.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Similar Historical Propositions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {prediction.historicalComparison.map((comparison) => (
                <div
                  key={comparison.propositionId}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium">
                      Prop {comparison.propositionNumber} ({comparison.year})
                    </p>
                    <p className="text-sm text-gray-500">
                      {formatPercentage(comparison.similarity)} similar
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge variant={comparison.result === 'passed' ? 'success' : 'danger'}>
                      {comparison.result === 'passed' ? 'Passed' : 'Failed'}
                    </Badge>
                    <p className="text-sm text-gray-500 mt-1">
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

  return (
    <div className="flex items-center gap-4">
      <div
        className={`p-2 rounded-lg ${getImpactColor(factor.impact)}`}
      >
        <ImpactIcon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="font-medium text-sm">
            {factorLabels[factor.name] || factor.name}
          </span>
          <span className="text-sm text-gray-500">
            Weight: {(factor.weight * 100).toFixed(0)}%
          </span>
        </div>
        <Progress value={factor.value * 100} size="sm" />
        <p className="text-xs text-gray-500 mt-1">{factor.description}</p>
      </div>
    </div>
  );
}
