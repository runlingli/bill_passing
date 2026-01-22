'use client';

import Link from 'next/link';
import { Proposition, PropositionPrediction } from '@/types';
import { Card, CardHeader, CardTitle, CardContent, Badge, Progress } from '@/components/ui';
import { formatDate, formatPercentage, getProbabilityColor } from '@/lib/utils';
import { Calendar, Users } from 'lucide-react';

interface PropositionCardProps {
  proposition: Proposition;
  prediction?: PropositionPrediction;
  showPrediction?: boolean;
}

const categoryColors: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
  taxation: 'warning',
  education: 'info',
  healthcare: 'success',
  environment: 'success',
  criminal_justice: 'danger',
  labor: 'info',
  housing: 'warning',
  transportation: 'default',
  government: 'default',
  civil_rights: 'info',
  other: 'default',
};

export function PropositionCard({
  proposition,
  prediction,
  showPrediction = true,
}: PropositionCardProps) {
  const statusVariant = {
    upcoming: 'info',
    active: 'warning',
    passed: 'success',
    failed: 'danger',
  } as const;

  return (
    <Link href={`/propositions/${proposition.id}`}>
      <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant={statusVariant[proposition.status]} size="sm">
                  {proposition.status}
                </Badge>
                <Badge
                  variant={categoryColors[proposition.category] || 'default'}
                  size="sm"
                >
                  {proposition.category.replace('_', ' ')}
                </Badge>
              </div>
              <CardTitle className="text-base">
                Prop {proposition.number}: {proposition.title}
              </CardTitle>
            </div>
            <span className="text-2xl font-bold text-primary-600 shrink-0">
              {proposition.number}
            </span>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600 line-clamp-2">{proposition.summary}</p>

          <div className="flex items-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>{formatDate(proposition.electionDate, { month: 'short', year: 'numeric' })}</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>{proposition.sponsors.length} sponsors</span>
            </div>
          </div>

          {showPrediction && prediction && (
            <div className="pt-3 border-t border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Passage Probability
                </span>
                <span className={`text-lg font-bold ${getProbabilityColor(prediction.passageProbability)}`}>
                  {formatPercentage(prediction.passageProbability)}
                </span>
              </div>
              <Progress
                value={prediction.passageProbability * 100}
                variant={
                  prediction.passageProbability >= 0.5 ? 'success' : 'danger'
                }
                size="sm"
              />
              <p className="text-xs text-gray-400 mt-1">
                Confidence: {formatPercentage(prediction.confidence)}
              </p>
            </div>
          )}

          {proposition.result && (
            <div className="pt-3 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Final Result</span>
                <Badge variant={proposition.result.passed ? 'success' : 'danger'}>
                  {proposition.result.passed ? 'Passed' : 'Failed'} - {proposition.result.yesPercentage.toFixed(1)}%
                </Badge>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
