import { NextRequest, NextResponse } from 'next/server';
import { censusClient } from '@/lib/external-apis';

export const dynamic = 'force-dynamic'; // Opt out of static rendering
export const revalidate = 86400; // Revalidate daily

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'congressional';

    let districts;

    switch (type) {
      case 'congressional':
        districts = await censusClient.getCongressionalDistricts();
        break;
      case 'state_senate':
        districts = await censusClient.getStateSenateDistricts();
        break;
      case 'state_assembly':
        districts = await censusClient.getStateAssemblyDistricts();
        break;
      default:
        districts = await censusClient.getCongressionalDistricts();
    }

    if (districts.length === 0) {
      return NextResponse.json(
        {
          data: null,
          success: false,
          error: {
            code: 'NO_DATA',
            message: 'No district data available',
          },
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      data: districts,
      success: true,
      meta: {
        total: districts.length,
        type,
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
          message: 'Failed to fetch district demographics',
        },
      },
      { status: 500 }
    );
  }
}
