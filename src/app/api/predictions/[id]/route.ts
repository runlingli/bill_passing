import { NextRequest, NextResponse } from 'next/server';
import { propositionService, predictionService } from '@/services';

export const revalidate = 300; // Revalidate every 5 minutes

interface RouteContext {
  params: { id: string };
}

export async function GET(
  _request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = context.params;

    // First get the proposition details
    const propResponse = await propositionService.getById(id);

    if (!propResponse.success || !propResponse.data) {
      return NextResponse.json(
        {
          data: null,
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: `Proposition ${id} not found`,
          },
        },
        { status: 404 }
      );
    }

    // Generate prediction using real data
    const prediction = await predictionService.generatePrediction({
      proposition: propResponse.data,
      includeHistorical: true,
    });

    return NextResponse.json({
      data: prediction,
      success: true,
    });
  } catch (error) {
    console.error('Prediction API Error:', error);
    return NextResponse.json(
      {
        data: null,
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to generate prediction',
        },
      },
      { status: 500 }
    );
  }
}
