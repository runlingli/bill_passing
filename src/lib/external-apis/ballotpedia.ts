/**
 * Ballotpedia Data Client
 * Fetches ballot measure analysis and polling data
 * Data source: https://ballotpedia.org/California_ballot_propositions
 */

import { BallotWordingAnalysis } from '@/types';

const BALLOTPEDIA_BASE = 'https://ballotpedia.org';

export interface BallotpediaMeasure {
  title: string;
  number: string;
  year: number;
  type: 'initiative' | 'referendum' | 'legislative';
  status: string;
  subject: string;
  description: string;
  ballotTitle: string;
  ballotSummary: string;
  supporters: string[];
  opponents: string[];
  supportArguments: string[];
  oppositionArguments: string[];
  polls?: PollData[];
  endorsements?: Endorsement[];
}

export interface PollData {
  pollster: string;
  date: string;
  sampleSize: number;
  margin: number;
  support: number;
  oppose: number;
  undecided: number;
}

export interface Endorsement {
  name: string;
  type: 'political' | 'organization' | 'newspaper' | 'individual';
  position: 'support' | 'oppose';
  date?: string;
}

class BallotpediaClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = BALLOTPEDIA_BASE;
  }

  /**
   * Get measure information from Ballotpedia
   */
  async getMeasure(year: number, number: string): Promise<BallotpediaMeasure | null> {
    try {
      // Ballotpedia uses a specific URL format
      // Example: https://ballotpedia.org/California_Proposition_36_(2024)
      const url = `${this.baseUrl}/California_Proposition_${number}_(${year})`;

      const response = await fetch(url, {
        headers: {
          'Accept': 'text/html',
          'User-Agent': 'CA-Proposition-Predictor/1.0',
        },
        next: { revalidate: 3600 },
      });

      if (!response.ok) {
        return null;
      }

      // In production, we would parse the HTML response
      // For now, return null as we'd need proper HTML parsing
      return null;
    } catch (error) {
      console.error('Error fetching from Ballotpedia:', error);
      return null;
    }
  }

  /**
   * Analyze ballot wording for readability and sentiment
   */
  analyzeBallotWording(
    title: string,
    summary: string,
    fullText?: string
  ): BallotWordingAnalysis {
    const text = fullText || summary;
    const wordCount = text.split(/\s+/).length;

    // Calculate Flesch-Kincaid readability
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const words = text.split(/\s+/);
    const syllables = this.countSyllables(text);

    const avgSentenceLength = words.length / Math.max(sentences.length, 1);
    const avgSyllablesPerWord = syllables / Math.max(words.length, 1);

    // Flesch Reading Ease score (0-100, higher = easier)
    const readabilityScore = Math.max(0, Math.min(100,
      206.835 - (1.015 * avgSentenceLength) - (84.6 * avgSyllablesPerWord)
    ));

    // Simple sentiment analysis
    const sentimentScore = this.analyzeSentiment(title + ' ' + summary);

    // Determine complexity
    let complexity: 'simple' | 'moderate' | 'complex' = 'moderate';
    if (readabilityScore >= 60) complexity = 'simple';
    else if (readabilityScore < 40) complexity = 'complex';

    // Extract key phrases (simple implementation)
    const keyPhrases = this.extractKeyPhrases(text);

    return {
      propositionId: '',
      wordCount,
      readabilityScore: Math.round(readabilityScore),
      sentimentScore: Math.round(sentimentScore * 100) / 100,
      complexity,
      keyPhrases,
      comparisonToSimilar: {
        avgWordCount: 300, // Historical average
        avgReadability: 45,
      },
    };
  }

  private countSyllables(text: string): number {
    const words = text.toLowerCase().split(/\s+/);
    let total = 0;

    for (const word of words) {
      // Simple syllable counting heuristic
      const cleaned = word.replace(/[^a-z]/g, '');
      if (cleaned.length === 0) continue;

      // Count vowel groups
      const vowelGroups = cleaned.match(/[aeiouy]+/g) || [];
      let syllables = vowelGroups.length;

      // Adjust for silent e
      if (cleaned.endsWith('e') && syllables > 1) {
        syllables--;
      }

      // Minimum 1 syllable per word
      total += Math.max(1, syllables);
    }

    return total;
  }

  private analyzeSentiment(text: string): number {
    // Simple sentiment analysis based on word lists
    const positiveWords = [
      'protect', 'improve', 'benefit', 'support', 'help', 'ensure',
      'provide', 'fund', 'create', 'invest', 'strengthen', 'safe',
      'clean', 'affordable', 'fair', 'equal', 'right', 'freedom'
    ];

    const negativeWords = [
      'tax', 'fee', 'cost', 'burden', 'restrict', 'limit', 'ban',
      'eliminate', 'reduce', 'cut', 'penalty', 'fine', 'mandate',
      'require', 'force', 'risk', 'danger', 'threat'
    ];

    const neutralWords = [
      'amend', 'change', 'modify', 'establish', 'authorize', 'allow',
      'permit', 'regulate', 'determine', 'define'
    ];

    const lowerText = text.toLowerCase();
    const words = lowerText.split(/\s+/);

    let positiveCount = 0;
    let negativeCount = 0;
    let neutralCount = 0;

    for (const word of words) {
      if (positiveWords.some(pw => word.includes(pw))) positiveCount++;
      if (negativeWords.some(nw => word.includes(nw))) negativeCount++;
      if (neutralWords.some(nw => word.includes(nw))) neutralCount++;
    }

    const total = positiveCount + negativeCount + neutralCount;
    if (total === 0) return 0;

    // Score from -1 (very negative) to 1 (very positive)
    return (positiveCount - negativeCount) / total;
  }

  private extractKeyPhrases(text: string): string[] {
    // Common ballot measure phrases to look for
    const patterns = [
      /authoriz\w* \$?[\d,.]+ (?:billion|million)/gi,
      /\d+(?:\.\d+)?%/g,
      /constitutional amendment/gi,
      /bond (?:measure|act)/gi,
      /tax (?:increase|decrease|on)/gi,
      /minimum wage/gi,
      /voter approval/gi,
      /state legislature/gi,
      /local government/gi,
      /general fund/gi,
    ];

    const phrases: string[] = [];

    for (const pattern of patterns) {
      const matches = text.match(pattern);
      if (matches) {
        phrases.push(...matches.map(m => m.toLowerCase()));
      }
    }

    // Also extract capitalized phrases (likely proper nouns/titles)
    const capitalizedPhrases = text.match(/[A-Z][a-z]+(?: [A-Z][a-z]+)+/g);
    if (capitalizedPhrases) {
      phrases.push(...capitalizedPhrases.slice(0, 3));
    }

    // Remove duplicates and limit
    return [...new Set(phrases)].slice(0, 10);
  }

  /**
   * Get polling data for a measure
   */
  async getPolling(_year: number, _number: string): Promise<PollData[]> {
    // Ballotpedia aggregates polling data
    // Would need to scrape their polling sections
    // For now, return empty array
    return [];
  }

  /**
   * Get endorsements for a measure
   */
  async getEndorsements(_year: number, _number: string): Promise<Endorsement[]> {
    // Would scrape endorsement sections from Ballotpedia
    return [];
  }
}

export const ballotpediaClient = new BallotpediaClient();
export default ballotpediaClient;
