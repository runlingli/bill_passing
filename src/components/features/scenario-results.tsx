'use client';

import { Scenario, ScenarioResults } from '@/types';
import { Card, CardHeader, CardTitle, CardContent, Badge, Progress } from '@/components/ui';
import { formatPercentage, getProbabilityColor } from '@/lib/utils';
import { ArrowRight, TrendingUp, TrendingDown, Minus } from 'lucide-react';

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
      <Card>
        <CardContent className="py-8 text-center text-gray-500">
          Run the scenario to see results
        </CardContent>
      </Card>
    );
  }

  const deltaPercent = results.probabilityDelta * 100;
  const isPositive = deltaPercent > 0;
  const DeltaIcon = isPositive ? TrendingUp : deltaPercent < 0 ? TrendingDown : Minus;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Scenario Results: {scenario.name}</CardTitle>
        </CardHeader>
        <CardContent>
          {showComparison && (
            <div className="flex items-center justify-center gap-4 mb-8">
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-1">Original</p>
                <p
                  className={`text-3xl font-bold ${getProbabilityColor(results.originalProbability)}`}
                >
                  {formatPercentage(results.originalProbability)}
                </p>
              </div>

              <div className="flex flex-col items-center">
                <ArrowRight className="h-8 w-8 text-gray-400" />
                <Badge
                  variant={isPositive ? 'success' : deltaPercent < 0 ? 'danger' : 'default'}
                  className="mt-1"
                >
                  <DeltaIcon className="h-3 w-3 mr-1" />
                  {isPositive ? '+' : ''}
                  {deltaPercent.toFixed(1)}%
                </Badge>
              </div>

              <div className="text-center">
                <p className="text-sm text-gray-500 mb-1">Projected</p>
                <p
                  className={`text-3xl font-bold ${getProbabilityColor(results.newProbability)}`}
                >
                  {formatPercentage(results.newProbability)}
                </p>
              </div>
            </div>
          )}

          <div className="space-y-2 mb-6">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Confidence Interval</span>
              <span>
                {formatPercentage(results.confidenceInterval.lower)} -{' '}
                {formatPercentage(results.confidenceInterval.upper)}
              </span>
            </div>
            <div className="relative h-3 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="absolute h-full bg-primary-200"
                style={{
                  left: `${results.confidenceInterval.lower * 100}%`,
                  width: `${(results.confidenceInterval.upper - results.confidenceInterval.lower) * 100}%`,
                }}
              />
              <div
                className="absolute h-full w-1 bg-primary-600"
                style={{ left: `${results.newProbability * 100}%` }}
              />
            </div>
          </div>

          <div className="border-t pt-4">
            <h4 className="font-medium mb-3">Factor Contributions</h4>
            <div className="space-y-3">
              {results.factorContributions.map((contribution) => (
                <div key={contribution.factor} className="flex items-center gap-3">
                  <div className="w-32 text-sm text-gray-600 capitalize">
                    {contribution.factor.replace(/([A-Z])/g, ' $1').trim()}
                  </div>
                  <div className="flex-1">
                    <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
                      {contribution.contribution > 0 ? (
                        <div
                          className="absolute h-full bg-green-500 rounded-full"
                          style={{
                            left: '50%',
                            width: `${Math.min(Math.abs(contribution.contribution) * 500, 50)}%`,
                          }}
                        />
                      ) : (
                        <div
                          className="absolute h-full bg-red-500 rounded-full"
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
                    className={`w-16 text-sm text-right ${
                      contribution.contribution > 0
                        ? 'text-green-600'
                        : contribution.contribution < 0
                          ? 'text-red-600'
                          : 'text-gray-500'
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

      <Card>
        <CardHeader>
          <CardTitle>Scenario Parameters Applied</CardTitle>
        </CardHeader>
        <CardContent>
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
      className={`p-3 rounded-lg ${changed ? 'bg-primary-50 border border-primary-200' : 'bg-gray-50'}`}
    >
      <p className="text-xs text-gray-500">{label}</p>
      <p className={`font-medium ${changed ? 'text-primary-700' : 'text-gray-700'}`}>
        {value}
      </p>
    </div>
  );
}
