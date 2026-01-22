import { NextRequest, NextResponse } from 'next/server';
import { propositionService } from '@/services';

export const revalidate = 3600; // Revalidate every hour (finance data doesn't change frequently)

interface RouteContext {
  params: { id: string };
}

export async function GET(
  _request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = context.params;

    const response = await propositionService.getFinance(id);

    if (!response.success) {
      const status = response.error?.code === 'NOT_FOUND' ? 404 : 500;
      return NextResponse.json(response, { status });
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      {
        data: null,
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch finance data',
        },
      },
      { status: 500 }
    );
  }
}
