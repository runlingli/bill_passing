'use client';

import { PropositionPrediction, PredictionFactor } from '@/types';
import { Card, CardHeader, CardTitle, CardContent, Badge } from '@/components/ui';
import { formatPercentage } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus, Info, AlertTriangle, Database } from 'lucide-react';

interface PredictionDisplayProps {
  prediction: PropositionPrediction;
  showFactors?: boolean;
  showHistorical?: boolean;
}

const DATA_QUALITY_LABELS = {
  strong: { label: 'Strong Data', color: 'bg-green-100 text-green-800 border-green-300' },
  moderate: { label: 'Moderate Data', color: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
  limited: { label: 'Insufficient Data', color: 'bg-red-100 text-red-800 border-red-300' },
};

export function PredictionDisplay({
  prediction,
  showFactors = true,
  showHistorical = true,
}: PredictionDisplayProps) {
  const qualityInfo = DATA_QUALITY_LABELS[prediction.dataQuality];
  const hasRealPrediction = prediction.dataQuality !== 'limited';

  return (
    <div className="space-y-6">
      <Card className="border-2 border-gray-200">
        <CardHeader className="border-b border-gray-200">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-900 rounded flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-display font-bold text-gray-900">Passage Prediction</span>
            </div>
            <Badge className={`${qualityInfo.color} border text-xs font-semibold`}>
              {qualityInfo.label}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          {hasRealPrediction ? (
            <>
              <div className="text-center mb-6">
                <div
                  className={`text-6xl font-display font-bold mb-2 ${prediction.passageProbability >= 0.5 ? 'text-blue-900' : 'text-red-700'}`}
                >
                  {formatPercentage(prediction.passageProbability)}
                </div>
                <p className="text-gray-600 font-medium">Probability of Passage</p>
                <div className="mt-6 max-w-md mx-auto">
                  <div className="h-4 bg-gray-200 rounded overflow-hidden">
                    <div
                      className={`h-full ${prediction.passageProbability >= 0.5 ? 'bg-blue-900' : 'bg-red-700'}`}
                      style={{ width: `${prediction.passageProbability * 100}%` }}
                    />
                  </div>
                  <div className="flex justify-between mt-2 text-xs text-gray-500 font-medium">
                    <span>Fail</span>
                    <span>Pass</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-center border-t-2 border-gray-200 pt-6">
                <div className="p-4 bg-blue-50 rounded border border-blue-200">
                  <p className="text-2xl font-bold text-blue-900">
                    {formatPercentage(prediction.passageProbability)}
                  </p>
                  <p className="text-sm text-gray-600 font-medium">Pass</p>
                </div>
                <div className="p-4 bg-red-50 rounded border border-red-200">
                  <p className="text-2xl font-bold text-red-700">
                    {formatPercentage(1 - prediction.passageProbability)}
                  </p>
                  <p className="text-sm text-gray-600 font-medium">Fail</p>
                </div>
              </div>

              {/* Data sources */}
              {prediction.dataSources.length > 0 && (
                <div className="mt-4 p-3 bg-gray-50 rounded border border-gray-200">
                  <div className="flex items-center gap-2 mb-1">
                    <Database className="h-3.5 w-3.5 text-gray-500" />
                    <span className="text-xs font-bold text-gray-600">Data sources</span>
                  </div>
                  <p className="text-xs text-gray-500">
                    {prediction.dataSources.join(' · ')}
                  </p>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8">
              <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
              <p className="text-lg font-bold text-gray-800 mb-2">Insufficient Data</p>
              <p className="text-sm text-gray-600 max-w-md mx-auto">
                Not enough real data to generate a meaningful prediction.
                No campaign finance records or historical results for similar propositions were found.
              </p>
              <p className="text-xs text-gray-400 mt-4">
                Predictions require at least one of: campaign finance data from Cal-Access
                or historical election results from Ballotpedia for similar measures.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {showFactors && hasRealPrediction && prediction.factors.length > 0 && (
        <Card className="border-2 border-gray-200">
          <CardHeader className="border-b border-gray-200">
            <CardTitle className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-900 rounded flex items-center justify-center">
                <Info className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-display font-bold text-gray-900">Prediction Factors</span>
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
            <CardTitle className="text-xl font-display font-bold text-gray-900">Similar Historical Propositions</CardTitle>
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
    historicalPassRate: 'Historical Pass Rate',
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
          <span className="text-xs text-gray-500 font-medium">
            {factor.source}
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
