'use client';

import { useState } from 'react';
import { PropositionCard } from '@/components/features';
import {
  Card,
  CardContent,
  Input,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Badge,
} from '@/components/ui';
import { Search, Filter, Calendar } from 'lucide-react';
import { Proposition, PropositionPrediction, PropositionCategory } from '@/types';

// Mock data for demonstration
const mockPropositions: Proposition[] = [
  {
    id: '1',
    number: '1',
    year: 2024,
    electionDate: '2024-11-05',
    title: 'Affordable Housing Bond Act',
    summary: 'Authorizes $10 billion in general obligation bonds for affordable housing programs, including down payment assistance for first-time homebuyers.',
    status: 'upcoming',
    category: 'housing',
    sponsors: ['CA Housing Coalition', 'Habitat for Humanity'],
    opponents: ['CA Taxpayers Association'],
  },
  {
    id: '2',
    number: '2',
    year: 2024,
    electionDate: '2024-11-05',
    title: 'Education Funding and Accountability',
    summary: 'Requires minimum funding levels for K-12 education and community colleges, establishes new accountability measures.',
    status: 'upcoming',
    category: 'education',
    sponsors: ['CA Teachers Association', 'PTA California'],
    opponents: ['CA Business Roundtable'],
  },
  {
    id: '3',
    number: '3',
    year: 2024,
    electionDate: '2024-11-05',
    title: 'Climate Resilience and Clean Energy Bond',
    summary: 'Authorizes $15 billion for wildfire prevention, clean energy infrastructure, and climate adaptation projects.',
    status: 'upcoming',
    category: 'environment',
    sponsors: ['Sierra Club', 'Natural Resources Defense Council'],
    opponents: [],
  },
  {
    id: '4',
    number: '36',
    year: 2024,
    electionDate: '2024-11-05',
    title: 'Criminal Sentencing Reform',
    summary: 'Increases penalties for certain theft and drug crimes, modifying provisions of Propositions 47 and 57.',
    status: 'upcoming',
    category: 'criminal_justice',
    sponsors: ['CA District Attorneys Association'],
    opponents: ['ACLU California', 'CA Public Defenders Association'],
  },
  {
    id: '5',
    number: '50',
    year: 2024,
    electionDate: '2024-11-05',
    title: 'Local Government Funding Amendment',
    summary: 'Reduces voter approval threshold for local bonds from two-thirds to 55% for affordable housing and infrastructure.',
    status: 'upcoming',
    category: 'government',
    sponsors: ['CA League of Cities', 'CA State Association of Counties'],
    opponents: ['Howard Jarvis Taxpayers Association'],
  },
  {
    id: '6',
    number: '13',
    year: 2022,
    electionDate: '2022-11-08',
    title: 'Stem Cell Research Funding',
    summary: 'Authorized $5.5 billion in general obligation bonds to fund stem cell and other medical research.',
    status: 'passed',
    result: {
      yesVotes: 5834234,
      noVotes: 5012876,
      yesPercentage: 53.8,
      noPercentage: 46.2,
      totalVotes: 10847110,
      turnout: 0.52,
      passed: true,
    },
    category: 'healthcare',
    sponsors: ['CA Institute for Regenerative Medicine'],
    opponents: ['CA Pro-Life Council'],
  },
];

const mockPredictions: Record<string, PropositionPrediction> = {
  '1': {
    propositionId: '1',
    passageProbability: 0.62,
    confidence: 0.75,
    factors: [],
    historicalComparison: [],
    generatedAt: new Date().toISOString(),
  },
  '2': {
    propositionId: '2',
    passageProbability: 0.58,
    confidence: 0.68,
    factors: [],
    historicalComparison: [],
    generatedAt: new Date().toISOString(),
  },
  '3': {
    propositionId: '3',
    passageProbability: 0.71,
    confidence: 0.82,
    factors: [],
    historicalComparison: [],
    generatedAt: new Date().toISOString(),
  },
  '4': {
    propositionId: '4',
    passageProbability: 0.45,
    confidence: 0.65,
    factors: [],
    historicalComparison: [],
    generatedAt: new Date().toISOString(),
  },
  '5': {
    propositionId: '5',
    passageProbability: 0.38,
    confidence: 0.72,
    factors: [],
    historicalComparison: [],
    generatedAt: new Date().toISOString(),
  },
};

const categories: { value: PropositionCategory | 'all'; label: string }[] = [
  { value: 'all', label: 'All Categories' },
  { value: 'taxation', label: 'Taxation' },
  { value: 'education', label: 'Education' },
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'environment', label: 'Environment' },
  { value: 'criminal_justice', label: 'Criminal Justice' },
  { value: 'labor', label: 'Labor' },
  { value: 'housing', label: 'Housing' },
  { value: 'transportation', label: 'Transportation' },
  { value: 'government', label: 'Government' },
  { value: 'civil_rights', label: 'Civil Rights' },
];

const years = ['all', '2024', '2022', '2020', '2018', '2016'];

export default function PropositionsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const filteredPropositions = mockPropositions.filter((prop) => {
    const matchesSearch =
      searchQuery === '' ||
      prop.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prop.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prop.number.includes(searchQuery);

    const matchesCategory =
      selectedCategory === 'all' || prop.category === selectedCategory;

    const matchesYear =
      selectedYear === 'all' || prop.year.toString() === selectedYear;

    const matchesStatus =
      selectedStatus === 'all' || prop.status === selectedStatus;

    return matchesSearch && matchesCategory && matchesYear && matchesStatus;
  });

  const upcomingCount = mockPropositions.filter((p) => p.status === 'upcoming').length;
  const passedCount = mockPropositions.filter((p) => p.status === 'passed').length;
  const failedCount = mockPropositions.filter((p) => p.status === 'failed').length;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          California Propositions
        </h1>
        <p className="text-gray-600">
          Browse and analyze statewide ballot propositions with prediction data
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-primary-600">{mockPropositions.length}</p>
              <p className="text-sm text-gray-500">Total Propositions</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600">{upcomingCount}</p>
              <p className="text-sm text-gray-500">Upcoming</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600">{passedCount}</p>
              <p className="text-sm text-gray-500">Passed</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-red-600">{failedCount}</p>
              <p className="text-sm text-gray-500">Failed</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-8">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search propositions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full md:w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-full md:w-32">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent>
                {years.map((year) => (
                  <SelectItem key={year} value={year}>
                    {year === 'all' ? 'All Years' : year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-full md:w-36">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="upcoming">Upcoming</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="passed">Passed</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-gray-500">
          Showing {filteredPropositions.length} propositions
        </p>
        {filteredPropositions.length > 0 && (
          <div className="flex gap-2">
            <Badge variant="info">{filteredPropositions.filter(p => p.status === 'upcoming').length} upcoming</Badge>
            <Badge variant="success">{filteredPropositions.filter(p => p.status === 'passed').length} passed</Badge>
          </div>
        )}
      </div>

      {filteredPropositions.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500">No propositions found matching your criteria.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPropositions.map((proposition) => (
            <PropositionCard
              key={proposition.id}
              proposition={proposition}
              prediction={mockPredictions[proposition.id]}
              showPrediction={proposition.status === 'upcoming'}
            />
          ))}
        </div>
      )}
    </div>
  );
}
