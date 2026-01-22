'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ScenarioBuilder, ScenarioResultsDisplay } from '@/components/features';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Badge,
  Button,
} from '@/components/ui';
import { Zap, ArrowRight, TrendingUp, Clock, Trash2 } from 'lucide-react';
import { Scenario, PropositionWithDetails, SCENARIO_PRESETS } from '@/types';

// Mock proposition for scenario builder
const mockProposition: PropositionWithDetails = {
  id: 'prop-50',
  number: '50',
  year: 2024,
  electionDate: '2024-11-05',
  title: 'Local Government Funding Amendment',
  summary: 'Reduces the voter approval threshold for local bonds from two-thirds to 55%.',
  status: 'upcoming',
  category: 'government',
  sponsors: ['CA League of Cities'],
  opponents: ['Howard Jarvis Taxpayers Association'],
  finance: {
    propositionId: 'prop-50',
    totalSupport: 15_234_567,
    totalOpposition: 8_765_432,
    supportCommittees: [],
    oppositionCommittees: [],
    topDonors: [],
    lastUpdated: new Date().toISOString(),
  },
  prediction: {
    propositionId: 'prop-50',
    passageProbability: 0.38,
    confidence: 0.72,
    factors: [],
    historicalComparison: [],
    generatedAt: new Date().toISOString(),
  },
};

const mockPropositions = [
  { id: 'prop-50', number: '50', title: 'Local Government Funding Amendment' },
  { id: 'prop-1', number: '1', title: 'Affordable Housing Bond Act' },
  { id: 'prop-2', number: '2', title: 'Education Funding Reform' },
  { id: 'prop-3', number: '3', title: 'Climate Resilience Bond' },
];

export default function ScenariosPage() {
  const [selectedProposition, setSelectedProposition] = useState<string>('prop-50');
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [activeScenario, setActiveScenario] = useState<Scenario | null>(null);

  const handleScenarioRun = (scenario: Scenario) => {
    setScenarios((prev) => {
      const existingIndex = prev.findIndex((s) => s.id === scenario.id);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = scenario;
        return updated;
      }
      return [...prev, scenario];
    });
    setActiveScenario(scenario);
  };

  const handleDeleteScenario = (id: string) => {
    setScenarios((prev) => prev.filter((s) => s.id !== id));
    if (activeScenario?.id === id) {
      setActiveScenario(null);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-california-gold/20 rounded-lg">
            <Zap className="h-6 w-6 text-california-gold" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">What-If Scenario Simulator</h1>
            <p className="text-gray-600">
              Explore how different factors might affect proposition outcomes
            </p>
          </div>
        </div>
      </div>

      {/* Proposition Selector */}
      <Card className="mb-8">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select a Proposition to Analyze
              </label>
              <Select value={selectedProposition} onValueChange={setSelectedProposition}>
                <SelectTrigger className="w-full md:w-96">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {mockPropositions.map((prop) => (
                    <SelectItem key={prop.id} value={prop.id}>
                      Prop {prop.number}: {prop.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Link href={`/propositions/${selectedProposition}`}>
              <Button variant="outline">
                View Proposition Details
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Scenario Builder */}
        <div className="lg:col-span-2">
          <ScenarioBuilder
            proposition={mockProposition}
            onScenarioRun={handleScenarioRun}
          />

          {activeScenario?.results && (
            <div className="mt-6">
              <ScenarioResultsDisplay scenario={activeScenario} />
            </div>
          )}
        </div>

        {/* Saved Scenarios Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Quick Presets</CardTitle>
              <CardDescription>
                Start with a predefined scenario configuration
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {SCENARIO_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                  >
                    <p className="font-medium text-sm">{preset.name}</p>
                    <p className="text-xs text-gray-500 mt-1">{preset.description}</p>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Recent Scenarios
              </CardTitle>
            </CardHeader>
            <CardContent>
              {scenarios.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">
                  No scenarios run yet. Create one to see results here.
                </p>
              ) : (
                <div className="space-y-3">
                  {scenarios.map((scenario) => (
                    <div
                      key={scenario.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        activeScenario?.id === scenario.id
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                      onClick={() => setActiveScenario(scenario)}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium text-sm">{scenario.name}</p>
                          {scenario.results && (
                            <div className="flex items-center gap-2 mt-1">
                              <TrendingUp className="h-3 w-3 text-gray-400" />
                              <span className="text-xs text-gray-600">
                                {(scenario.results.newProbability * 100).toFixed(0)}% (
                                {scenario.results.probabilityDelta > 0 ? '+' : ''}
                                {(scenario.results.probabilityDelta * 100).toFixed(1)}%)
                              </span>
                            </div>
                          )}
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteScenario(scenario.id);
                          }}
                          className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">How It Works</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-3 text-sm text-gray-600">
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-xs font-medium">
                    1
                  </span>
                  <span>Select a proposition to analyze</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-xs font-medium">
                    2
                  </span>
                  <span>Adjust parameters like funding, turnout, or ballot framing</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-xs font-medium">
                    3
                  </span>
                  <span>Run the scenario to see projected outcomes</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-xs font-medium">
                    4
                  </span>
                  <span>Compare multiple scenarios to understand key drivers</span>
                </li>
              </ol>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
