import { NextRequest, NextResponse } from 'next/server';
import { caSosClient } from '@/lib/external-apis';
import { HistoricalComparison, Proposition } from '@/types';

export const dynamic = 'force-dynamic';

interface RouteContext {
  params: { id: string };
}

/**
 * Find historically similar propositions by category.
 * Uses Ballotpedia-enriched results from past elections.
 */
export async function GET(
  _request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = context.params;
    const [yearStr, number] = id.split('-');
    const targetYear = parseInt(yearStr);

    if (isNaN(targetYear) || !number) {
      return NextResponse.json(
        { data: [], success: false, error: { code: 'INVALID_ID', message: 'Invalid proposition ID' } },
        { status: 400 }
      );
    }

    // Get the target proposition to know its category
    const targetProps = await caSosClient.getPropositionsByYear(targetYear);
    const target = targetProps.find(p => p.number === number);
    if (!target) {
      return NextResponse.json({ data: [], success: true });
    }

    // Fetch propositions from past election years and find similar ones
    const currentYear = new Date().getFullYear();
    const yearsToSearch = [];
    for (let y = currentYear; y >= currentYear - 10; y--) {
      if (y !== targetYear && (y % 2 === 0 || y >= currentYear - 1)) {
        yearsToSearch.push(y);
      }
    }

    // Fetch in parallel (limit to 4 years to avoid too many requests)
    const yearResults = await Promise.all(
      yearsToSearch.slice(0, 4).map(y => caSosClient.getPropositionsByYear(y).catch(() => []))
    );

    const allProps = yearResults.flat();

    // Score and rank by similarity
    const comparisons: HistoricalComparison[] = [];
    for (const prop of allProps) {
      if (!prop.result) continue; // Only include props with actual results

      const similarity = calculateSimilarity(target, prop);
      if (similarity < 0.2) continue;

      comparisons.push({
        propositionId: prop.id,
        propositionNumber: prop.number,
        year: prop.year,
        similarity,
        result: prop.result.passed ? 'passed' : 'failed',
        yesPercentage: prop.result.yesPercentage,
      });
    }

    // Sort by similarity descending, take top 5
    comparisons.sort((a, b) => b.similarity - a.similarity);

    return NextResponse.json({
      data: comparisons.slice(0, 5),
      success: true,
    });
  } catch (error) {
    console.error('Similar propositions API error:', error);
    return NextResponse.json(
      { data: [], success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to find similar propositions' } },
      { status: 500 }
    );
  }
}

/**
 * Calculate similarity between two propositions.
 * Factors: category match (primary), title keyword overlap (secondary).
 */
function calculateSimilarity(target: Proposition, candidate: Proposition): number {
  let score = 0;

  // Same category is the primary signal (0.6 base)
  if (target.category === candidate.category) {
    score += 0.6;
  } else {
    return 0; // Different category = not similar
  }

  // Title keyword overlap (up to 0.3)
  const targetWords = extractKeywords(target.title);
  const candidateWords = extractKeywords(candidate.title);
  const overlap = targetWords.filter(w => candidateWords.includes(w)).length;
  const maxPossible = Math.max(targetWords.length, candidateWords.length, 1);
  score += (overlap / maxPossible) * 0.3;

  // Recency bonus — more recent comparisons are more relevant (up to 0.1)
  const yearDiff = Math.abs(target.year - candidate.year);
  score += Math.max(0, 0.1 - yearDiff * 0.02);

  return Math.min(score, 1);
}

function extractKeywords(title: string): string[] {
  const stopWords = new Set([
    'a', 'an', 'the', 'and', 'or', 'but', 'for', 'to', 'of', 'in', 'on', 'at',
    'by', 'from', 'with', 'as', 'is', 'was', 'are', 'be', 'been', 'being',
    'that', 'this', 'it', 'its', 'not', 'no', 'all', 'any', 'each', 'which',
  ]);

  return title
    .toLowerCase()
    .replace(/[^a-z\s]/g, '')
    .split(/\s+/)
    .filter(w => w.length > 2 && !stopWords.has(w));
}
