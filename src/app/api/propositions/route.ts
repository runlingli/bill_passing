import { NextRequest, NextResponse } from 'next/server';
import { propositionService } from '@/services';
import { PropositionQueryParams } from '@/types';

export const dynamic = 'force-dynamic';
export const revalidate = 300; // Revalidate every 5 minutes

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const params: PropositionQueryParams = {
      year: searchParams.get('year') ? parseInt(searchParams.get('year')!) : undefined,
      category: searchParams.get('category') || undefined,
      status: searchParams.get('status') || undefined,
      searchQuery: searchParams.get('q') || undefined,
      page: searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1,
      perPage: searchParams.get('perPage') ? parseInt(searchParams.get('perPage')!) : 20,
    };

    const response = await propositionService.getAll(params);

    if (!response.success) {
      return NextResponse.json(response, { status: 500 });
    }

    // Apply pagination
    const page = params.page || 1;
    const perPage = params.perPage || 20;
    const start = (page - 1) * perPage;
    const paginated = response.data.slice(start, start + perPage);

    return NextResponse.json({
      data: paginated,
      success: true,
      meta: {
        page,
        perPage,
        total: response.data.length,
        totalPages: Math.ceil(response.data.length / perPage),
        cached: response.meta?.cached || false,
      },
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      {
        data: null,
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch propositions',
        },
      },
      { status: 500 }
    );
  }
}
