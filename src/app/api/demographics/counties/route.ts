import { NextResponse } from 'next/server';
import { censusClient } from '@/lib/external-apis';

export const revalidate = 86400; // Revalidate daily (census data is static)

export async function GET() {
  try {
    const counties = await censusClient.getCaliforniaCounties();

    if (counties.length === 0) {
      return NextResponse.json(
        {
          data: null,
          success: false,
          error: {
            code: 'NO_DATA',
            message: 'No county data available',
          },
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      data: counties,
      success: true,
      meta: {
        total: counties.length,
        source: 'US Census Bureau ACS 5-Year Estimates',
      },
    });
  } catch (error) {
    console.error('Census API Error:', error);
    return NextResponse.json(
      {
        data: null,
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch demographics data',
        },
      },
      { status: 500 }
    );
  }
}
