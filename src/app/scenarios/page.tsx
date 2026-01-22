'use client';

import { useState, useEffect } from 'react';
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
  Button,
} from '@/components/ui';
import { Zap, ArrowRight, TrendingUp, Clock, Trash2, Loader2 } from 'lucide-react';
import { Scenario, Proposition, PropositionWithDetails, SCENARIO_PRESETS, ApiResponse } from '@/types';

export default function ScenariosPage() {
  const [propositions, setPropositions] = useState<Proposition[]>([]);
  const [selectedProposition, setSelectedProposition] = useState<string>('');
  const [currentProposition, setCurrentProposition] = useState<PropositionWithDetails | null>(null);
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [activeScenario, setActiveScenario] = useState<Scenario | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch propositions from API
  useEffect(() => {
    const fetchPropositions = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/propositions?year=2024');
        const data: ApiResponse<Proposition[]> = await response.json();

        if (data.success && data.data.length > 0) {
          setPropositions(data.data);
          setSelectedProposition(data.data[0].id);
        } else {
          setError('No propositions available');
        }
      } catch {
        setError('Failed to fetch propositions');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPropositions();
  }, []);

  // Fetch proposition details when selection changes
  useEffect(() => {
    if (!selectedProposition) return;

    const fetchPropositionDetails = async () => {
      setIsLoadingDetails(true);
      try {
        const response = await fetch(`/api/propositions/${selectedProposition}`);
        const data: ApiResponse<PropositionWithDetails> = await response.json();

        if (data.success) {
          setCurrentProposition(data.data);
        } else {
          setError('Failed to load proposition details');
        }
      } catch {
        setError('Failed to load proposition details');
      } finally {
        setIsLoadingDetails(false);
      }
    };

    fetchPropositionDetails();
  }, [selectedProposition]);

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

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
          <span className="ml-2 text-gray-600">Loading propositions...</span>
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <Card className="mb-8 border-red-200 bg-red-50">
          <CardContent className="py-4 text-center text-red-600">
            {error}
          </CardContent>
        </Card>
      )}

      {/* Proposition Selector */}
      {!isLoading && propositions.length > 0 && (
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select a Proposition to Analyze
                </label>
                <Select value={selectedProposition} onValueChange={setSelectedProposition}>
                  <SelectTrigger className="w-full md:w-96">
                    <SelectValue placeholder="Select a proposition" />
                  </SelectTrigger>
                  <SelectContent>
                    {propositions.map((prop) => (
                      <SelectItem key={prop.id} value={prop.id}>
                        Prop {prop.number}: {prop.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Link href={`/propositions/${selectedProposition}`}>
                <Button variant="outline" disabled={!selectedProposition}>
                  View Proposition Details
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {!isLoading && propositions.length > 0 && (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Scenario Builder */}
        <div className="lg:col-span-2">
          {isLoadingDetails ? (
            <Card>
              <CardContent className="py-12 flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-primary-600" />
                <span className="ml-2 text-gray-600">Loading proposition details...</span>
              </CardContent>
            </Card>
          ) : currentProposition ? (
            <ScenarioBuilder
              proposition={currentProposition}
              onScenarioRun={handleScenarioRun}
            />
          ) : (
            <Card>
              <CardContent className="py-12 text-center text-gray-500">
                Select a proposition to start building scenarios
              </CardContent>
            </Card>
          )}

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
      )}
    </div>
  );
}
