import { NextRequest, NextResponse } from 'next/server';
import { PropositionPrediction } from '@/types';

// Mock predictions - in production, these would be calculated dynamically
const mockPredictions: Record<string, PropositionPrediction> = {
  '1': {
    propositionId: '1',
    passageProbability: 0.62,
    confidence: 0.75,
    factors: [
      { name: 'campaignFinance', weight: 0.25, value: 0.68, impact: 'positive', description: 'Strong support funding advantage' },
      { name: 'demographics', weight: 0.2, value: 0.58, impact: 'positive', description: 'Favorable demographic alignment' },
      { name: 'ballotWording', weight: 0.15, value: 0.52, impact: 'neutral', description: 'Neutral ballot framing' },
      { name: 'timing', weight: 0.1, value: 0.55, impact: 'positive', description: 'Presidential year turnout boost' },
      { name: 'opposition', weight: 0.1, value: 0.45, impact: 'negative', description: 'Organized opposition present' },
    ],
    historicalComparison: [
      { propositionId: 'h1', propositionNumber: '1', year: 2018, similarity: 0.82, result: 'passed', yesPercentage: 54.1 },
      { propositionId: 'h2', propositionNumber: '2', year: 2018, similarity: 0.75, result: 'passed', yesPercentage: 53.4 },
    ],
    generatedAt: new Date().toISOString(),
  },
  '2': {
    propositionId: '2',
    passageProbability: 0.58,
    confidence: 0.68,
    factors: [
      { name: 'campaignFinance', weight: 0.25, value: 0.55, impact: 'neutral', description: 'Balanced funding levels' },
      { name: 'demographics', weight: 0.2, value: 0.62, impact: 'positive', description: 'Strong support among parents' },
      { name: 'ballotWording', weight: 0.15, value: 0.48, impact: 'neutral', description: 'Complex language' },
      { name: 'timing', weight: 0.1, value: 0.55, impact: 'positive', description: 'Presidential year' },
      { name: 'opposition', weight: 0.1, value: 0.52, impact: 'neutral', description: 'Moderate opposition' },
    ],
    historicalComparison: [],
    generatedAt: new Date().toISOString(),
  },
  '3': {
    propositionId: '3',
    passageProbability: 0.71,
    confidence: 0.82,
    factors: [
      { name: 'campaignFinance', weight: 0.25, value: 0.78, impact: 'positive', description: 'Strong support funding with minimal opposition' },
      { name: 'demographics', weight: 0.2, value: 0.65, impact: 'positive', description: 'High support among younger voters' },
      { name: 'ballotWording', weight: 0.15, value: 0.58, impact: 'positive', description: 'Clear environmental framing' },
      { name: 'timing', weight: 0.1, value: 0.55, impact: 'positive', description: 'Presidential year turnout' },
      { name: 'opposition', weight: 0.1, value: 0.72, impact: 'positive', description: 'Limited organized opposition' },
    ],
    historicalComparison: [],
    generatedAt: new Date().toISOString(),
  },
};

interface RouteContext {
  params: { id: string };
}

export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = context.params;
    const prediction = mockPredictions[id];

    if (!prediction) {
      return NextResponse.json(
        {
          data: null,
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: `Prediction for proposition ${id} not found`,
          },
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      data: prediction,
      success: true,
    });
  } catch (error) {
    return NextResponse.json(
      {
        data: null,
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch prediction',
        },
      },
      { status: 500 }
    );
  }
}
