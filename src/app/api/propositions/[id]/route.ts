import { NextRequest, NextResponse } from 'next/server';
import { PropositionWithDetails } from '@/types';

// Mock data - in production, this would come from a database
const getMockProposition = (id: string): PropositionWithDetails | null => {
  const propositions: Record<string, PropositionWithDetails> = {
    '1': {
      id: '1',
      number: '1',
      year: 2024,
      electionDate: '2024-11-05',
      title: 'Affordable Housing Bond Act',
      summary: 'Authorizes $10 billion in general obligation bonds for affordable housing programs.',
      status: 'upcoming',
      category: 'housing',
      sponsors: ['CA Housing Coalition', 'Habitat for Humanity'],
      opponents: ['CA Taxpayers Association'],
      finance: {
        propositionId: '1',
        totalSupport: 25_000_000,
        totalOpposition: 8_500_000,
        supportCommittees: [
          { id: 'c1', name: 'Yes on 1 Committee', position: 'support', totalRaised: 20_000_000, totalSpent: 18_000_000 },
        ],
        oppositionCommittees: [
          { id: 'c2', name: 'No on 1 Committee', position: 'opposition', totalRaised: 8_500_000, totalSpent: 7_200_000 },
        ],
        topDonors: [
          { name: 'CA Realtors Association', amount: 10_000_000, position: 'support', type: 'organization' },
        ],
        lastUpdated: new Date().toISOString(),
      },
      prediction: {
        propositionId: '1',
        passageProbability: 0.62,
        confidence: 0.75,
        factors: [
          { name: 'campaignFinance', weight: 0.25, value: 0.68, impact: 'positive', description: 'Strong support funding advantage' },
          { name: 'demographics', weight: 0.2, value: 0.58, impact: 'positive', description: 'Favorable demographic alignment' },
        ],
        historicalComparison: [],
        generatedAt: new Date().toISOString(),
      },
    },
  };

  return propositions[id] || null;
};

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;
    const proposition = getMockProposition(id);

    if (!proposition) {
      return NextResponse.json(
        {
          data: null,
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: `Proposition with id ${id} not found`,
          },
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      data: proposition,
      success: true,
    });
  } catch (error) {
    return NextResponse.json(
      {
        data: null,
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch proposition',
        },
      },
      { status: 500 }
    );
  }
}
