'use client';

import { Scenario } from '@/types';
import { Card, CardHeader, CardTitle, CardContent, Badge } from '@/components/ui';
import { formatPercentage } from '@/lib/utils';
import { ArrowRight, TrendingUp, TrendingDown, Minus, BarChart3 } from 'lucide-react';

interface ScenarioResultsDisplayProps {
  scenario: Scenario;
  showComparison?: boolean;
}

export function ScenarioResultsDisplay({
  scenario,
  showComparison = true,
}: ScenarioResultsDisplayProps) {
  const results = scenario.results;

  if (!results) {
    return (
      <Card className="border-2 border-gray-200">
        <CardContent className="py-12 text-center">
          <BarChart3 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Run the scenario to see results</p>
        </CardContent>
      </Card>
    );
  }

  const deltaPercent = results.probabilityDelta * 100;
  const isPositive = deltaPercent > 0;
  const DeltaIcon = isPositive ? TrendingUp : deltaPercent < 0 ? TrendingDown : Minus;

  return (
    <div className="space-y-6">
      <Card className="border-2 border-gray-200">
        <CardHeader className="border-b border-gray-200">
          <CardTitle className="text-xl font-display font-bold text-gray-900">Scenario Results: {scenario.name}</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          {showComparison && (
            <div className="flex items-center justify-center gap-6 mb-8">
              <div className="text-center p-4 bg-gray-50 rounded border border-gray-200">
                <p className="text-sm text-gray-600 font-medium mb-2">Original</p>
                <p
                  className={`text-4xl font-display font-bold ${results.originalProbability >= 0.5 ? 'text-blue-900' : 'text-red-700'}`}
                >
                  {formatPercentage(results.originalProbability)}
                </p>
              </div>

              <div className="flex flex-col items-center">
                <ArrowRight className="h-8 w-8 text-blue-900" />
                <Badge
                  className={`mt-2 ${isPositive ? 'bg-green-700' : deltaPercent < 0 ? 'bg-red-700' : 'bg-gray-600'} text-white border-0`}
                >
                  <DeltaIcon className="h-3 w-3 mr-1" />
                  {isPositive ? '+' : ''}
                  {deltaPercent.toFixed(1)}%
                </Badge>
              </div>

              <div className="text-center p-4 bg-blue-50 rounded border border-blue-200">
                <p className="text-sm text-gray-600 font-medium mb-2">Projected</p>
                <p
                  className={`text-4xl font-display font-bold ${results.newProbability >= 0.5 ? 'text-blue-900' : 'text-red-700'}`}
                >
                  {formatPercentage(results.newProbability)}
                </p>
              </div>
            </div>
          )}

          <div className="space-y-2 mb-6">
            <div className="flex justify-between text-sm">
              <span className="text-gray-700 font-medium">Confidence Interval</span>
              <span className="text-gray-900 font-bold">
                {formatPercentage(results.confidenceInterval.lower)} -{' '}
                {formatPercentage(results.confidenceInterval.upper)}
              </span>
            </div>
            <div className="relative h-4 bg-gray-200 rounded overflow-hidden">
              <div
                className="absolute h-full bg-blue-200"
                style={{
                  left: `${results.confidenceInterval.lower * 100}%`,
                  width: `${(results.confidenceInterval.upper - results.confidenceInterval.lower) * 100}%`,
                }}
              />
              <div
                className="absolute h-full w-1 bg-blue-900"
                style={{ left: `${results.newProbability * 100}%` }}
              />
            </div>
          </div>

          <div className="border-t-2 border-gray-200 pt-6">
            <h4 className="font-bold text-gray-900 mb-4">Factor Contributions</h4>
            <div className="space-y-4">
              {results.factorContributions.map((contribution) => (
                <div key={contribution.factor} className="flex items-center gap-4 p-3 bg-gray-50 rounded border border-gray-200">
                  <div className="w-32 text-sm text-gray-900 font-medium capitalize">
                    {contribution.factor.replace(/([A-Z])/g, ' $1').trim()}
                  </div>
                  <div className="flex-1">
                    <div className="relative h-3 bg-gray-200 rounded overflow-hidden">
                      {contribution.contribution > 0 ? (
                        <div
                          className="absolute h-full bg-green-600 rounded"
                          style={{
                            left: '50%',
                            width: `${Math.min(Math.abs(contribution.contribution) * 500, 50)}%`,
                          }}
                        />
                      ) : (
                        <div
                          className="absolute h-full bg-red-600 rounded"
                          style={{
                            right: '50%',
                            width: `${Math.min(Math.abs(contribution.contribution) * 500, 50)}%`,
                          }}
                        />
                      )}
                      <div className="absolute h-full w-0.5 bg-gray-400 left-1/2 -translate-x-1/2" />
                    </div>
                  </div>
                  <div
                    className={`w-20 text-sm text-right font-bold ${
                      contribution.contribution > 0
                        ? 'text-green-700'
                        : contribution.contribution < 0
                          ? 'text-red-700'
                          : 'text-gray-600'
                    }`}
                  >
                    {contribution.contribution > 0 ? '+' : ''}
                    {(contribution.contribution * 100).toFixed(2)}%
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-2 border-gray-200">
        <CardHeader className="border-b border-gray-200">
          <CardTitle className="text-lg font-display font-bold text-gray-900">Scenario Parameters Applied</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <ParameterCard
              label="Support Funding"
              value={`${scenario.parameters.funding.supportMultiplier}x`}
              changed={scenario.parameters.funding.supportMultiplier !== 1}
            />
            <ParameterCard
              label="Opposition Funding"
              value={`${scenario.parameters.funding.oppositionMultiplier}x`}
              changed={scenario.parameters.funding.oppositionMultiplier !== 1}
            />
            <ParameterCard
              label="Turnout"
              value={`${(scenario.parameters.turnout.overallMultiplier * 100).toFixed(0)}%`}
              changed={scenario.parameters.turnout.overallMultiplier !== 1}
            />
            <ParameterCard
              label="Title Sentiment"
              value={scenario.parameters.framing.titleSentiment.toFixed(1)}
              changed={scenario.parameters.framing.titleSentiment !== 0}
            />
            <ParameterCard
              label="Complexity"
              value={scenario.parameters.framing.summaryComplexity}
              changed={scenario.parameters.framing.summaryComplexity !== 'unchanged'}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ParameterCard({
  label,
  value,
  changed,
}: {
  label: string;
  value: string;
  changed: boolean;
}) {
  return (
    <div
      className={`p-4 rounded border ${changed ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'}`}
    >
      <p className="text-xs text-gray-600 font-medium">{label}</p>
      <p className={`font-bold ${changed ? 'text-blue-900' : 'text-gray-700'}`}>
        {value}
      </p>
    </div>
  );
}
