import { NextResponse } from 'next/server';
import { propositionService } from '@/services';

export const dynamic = 'force-dynamic';
export const revalidate = 300; // 5 minutes

export async function GET() {
  try {
    const years = await propositionService.getAvailableYears();

    return NextResponse.json({
      data: years,
      success: true,
      meta: {
        total: years.length,
      },
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      {
        data: [],
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch available years',
        },
      },
      { status: 500 }
    );
  }
}
