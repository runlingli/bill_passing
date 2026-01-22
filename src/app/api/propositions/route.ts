import { NextRequest, NextResponse } from 'next/server';
import { Proposition, PropositionQueryParams } from '@/types';

// Mock data - in production, this would come from a database or external API
const mockPropositions: Proposition[] = [
  {
    id: '1',
    number: '1',
    year: 2024,
    electionDate: '2024-11-05',
    title: 'Affordable Housing Bond Act',
    summary: 'Authorizes $10 billion in general obligation bonds for affordable housing programs.',
    status: 'upcoming',
    category: 'housing',
    sponsors: ['CA Housing Coalition'],
    opponents: ['CA Taxpayers Association'],
  },
  {
    id: '2',
    number: '2',
    year: 2024,
    electionDate: '2024-11-05',
    title: 'Education Funding and Accountability',
    summary: 'Requires minimum funding levels for K-12 education and community colleges.',
    status: 'upcoming',
    category: 'education',
    sponsors: ['CA Teachers Association'],
    opponents: ['CA Business Roundtable'],
  },
  {
    id: '3',
    number: '3',
    year: 2024,
    electionDate: '2024-11-05',
    title: 'Climate Resilience and Clean Energy Bond',
    summary: 'Authorizes $15 billion for wildfire prevention and clean energy infrastructure.',
    status: 'upcoming',
    category: 'environment',
    sponsors: ['Sierra Club', 'NRDC'],
    opponents: [],
  },
];

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

    let filtered = [...mockPropositions];

    if (params.year) {
      filtered = filtered.filter((p) => p.year === params.year);
    }

    if (params.category) {
      filtered = filtered.filter((p) => p.category === params.category);
    }

    if (params.status) {
      filtered = filtered.filter((p) => p.status === params.status);
    }

    if (params.searchQuery) {
      const query = params.searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.title.toLowerCase().includes(query) ||
          p.summary.toLowerCase().includes(query) ||
          p.number.includes(query)
      );
    }

    const page = params.page || 1;
    const perPage = params.perPage || 20;
    const start = (page - 1) * perPage;
    const paginated = filtered.slice(start, start + perPage);

    return NextResponse.json({
      data: paginated,
      success: true,
      meta: {
        page,
        perPage,
        total: filtered.length,
        totalPages: Math.ceil(filtered.length / perPage),
      },
    });
  } catch (error) {
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
