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
import { Zap, ArrowRight, TrendingUp, Clock, Trash2, Loader2, Calendar, FileText, Settings2, Info } from 'lucide-react';
import { Scenario, Proposition, PropositionWithDetails, SCENARIO_PRESETS, ApiResponse } from '@/types';
import type { FactorWeights } from '@/components/features/scenario-builder';

const availableYears = ['2026', '2025', '2024', '2022', '2021', '2020', '2018', '2016'];

// Default factor weights
const DEFAULT_WEIGHTS: FactorWeights = {
  campaignFinance: 0.30,
  ballotWording: 0.20,
  demographics: 0.15,
  timing: 0.15,
  historical: 0.10,
  opposition: 0.10,
};

export default function ScenariosPage() {
  const [selectedYear, setSelectedYear] = useState<string>('2025');
  const [propositions, setPropositions] = useState<Proposition[]>([]);
  const [selectedProposition, setSelectedProposition] = useState<string>('');
  const [currentProposition, setCurrentProposition] = useState<PropositionWithDetails | null>(null);
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [activeScenario, setActiveScenario] = useState<Scenario | null>(null);
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Custom weights state
  const [weights, setWeights] = useState<FactorWeights>(DEFAULT_WEIGHTS);
  const [showWeightEditor, setShowWeightEditor] = useState(false);

  const updateWeight = (factor: keyof FactorWeights, value: number) => {
    setWeights(prev => ({ ...prev, [factor]: value }));
  };

  const resetWeights = () => {
    setWeights(DEFAULT_WEIGHTS);
  };

  const totalWeight = Object.values(weights).reduce((sum, w) => sum + w, 0);

  const handlePresetClick = (presetId: string) => {
    setSelectedPreset(presetId);
    // Reset after a short delay so it can be clicked again
    setTimeout(() => setSelectedPreset(null), 100);
  };

  // Fetch propositions when year changes
  useEffect(() => {
    const fetchPropositions = async () => {
      setIsLoading(true);
      setError(null);
      setPropositions([]);
      setSelectedProposition('');
      setCurrentProposition(null);

      try {
        const response = await fetch(`/api/propositions?year=${selectedYear}`);
        const data: ApiResponse<Proposition[]> = await response.json();

        if (data.success && data.data.length > 0) {
          setPropositions(data.data);
          setSelectedProposition(data.data[0].id);
        } else {
          setPropositions([]);
          setError(`No propositions found for ${selectedYear}`);
        }
      } catch {
        setError('Failed to fetch propositions');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPropositions();
  }, [selectedYear]);

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
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 bg-blue-900 rounded-lg flex items-center justify-center">
            <Zap className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="font-display text-3xl font-bold text-gray-900">What-If Scenario Simulator</h1>
            <p className="text-gray-600 font-medium">
              Explore how different factors might affect proposition outcomes
            </p>
          </div>
        </div>
        <div className="h-1 w-24 bg-blue-900 rounded" />
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-900" />
          <span className="ml-3 text-gray-600 font-medium">Loading propositions...</span>
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <Card className="mb-8 border-2 border-red-200 bg-red-50">
          <CardContent className="py-4 text-center text-red-700 font-medium">
            {error}
          </CardContent>
        </Card>
      )}

      {/* Year and Proposition Selector */}
      {!isLoading && (
        <Card className="mb-8 border-2 border-gray-200">
          <CardContent className="pt-6">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col md:flex-row gap-4">
                {/* Year Selection */}
                <div className="md:w-48">
                  <label className="block text-sm font-bold text-gray-900 mb-2">
                    <Calendar className="inline h-4 w-4 mr-1" />
                    Step 1: Select Year
                  </label>
                  <Select value={selectedYear} onValueChange={setSelectedYear}>
                    <SelectTrigger className="w-full border-2 border-gray-200">
                      <SelectValue placeholder="Select year" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableYears.map((year) => (
                        <SelectItem key={year} value={year}>
                          {year}
                          {year === '2026' && ' (Upcoming)'}
                          {year === '2025' && ' (Special)'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Proposition Selection */}
                <div className="flex-1">
                  <label className="block text-sm font-bold text-gray-900 mb-2">
                    <FileText className="inline h-4 w-4 mr-1" />
                    Step 2: Select Proposition
                  </label>
                  <Select
                    value={selectedProposition}
                    onValueChange={setSelectedProposition}
                    disabled={propositions.length === 0}
                  >
                    <SelectTrigger className="w-full border-2 border-gray-200">
                      <SelectValue placeholder={
                        propositions.length === 0
                          ? `No propositions for ${selectedYear}`
                          : "Select a proposition"
                      } />
                    </SelectTrigger>
                    <SelectContent>
                      {propositions.map((prop) => (
                        <SelectItem key={prop.id} value={prop.id}>
                          Prop {prop.number}: {prop.title.length > 60 ? prop.title.substring(0, 60) + '...' : prop.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="md:self-end">
                  <Link href={`/propositions/${selectedProposition}`}>
                    <Button variant="outline" disabled={!selectedProposition} className="border-2 border-blue-900 text-blue-900 hover:bg-blue-50 font-semibold">
                      View Details
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Year stats */}
              {propositions.length > 0 && (
                <div className="text-sm text-gray-600 font-medium pt-3 border-t-2 border-gray-200">
                  {propositions.length} propositions found for {selectedYear}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {!isLoading && (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Scenario Builder */}
        <div className="lg:col-span-2">
          {isLoadingDetails ? (
            <Card className="border-2 border-gray-200">
              <CardContent className="py-12 flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-blue-900" />
                <span className="ml-3 text-gray-600 font-medium">Loading proposition details...</span>
              </CardContent>
            </Card>
          ) : currentProposition ? (
            <ScenarioBuilder
              proposition={currentProposition}
              onScenarioRun={handleScenarioRun}
              presetId={selectedPreset}
              customWeights={weights}
            />
          ) : (
            <Card className="border-2 border-gray-200">
              <CardContent className="py-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Zap className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-gray-700 font-bold">Select a proposition to start building scenarios</p>
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
          <Card className="border-2 border-gray-200">
            <CardHeader className="border-b border-gray-200">
              <CardTitle className="text-lg font-display font-bold text-gray-900">Quick Presets</CardTitle>
              <CardDescription className="text-gray-600">
                Start with a predefined scenario configuration
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-2">
                {SCENARIO_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => handlePresetClick(preset.id)}
                    disabled={!currentProposition}
                    className="w-full text-left p-4 rounded-lg border-2 border-gray-200 hover:bg-blue-50 hover:border-blue-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <p className="font-bold text-sm text-gray-900">{preset.name}</p>
                    <p className="text-xs text-gray-600 mt-1">{preset.description}</p>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-gray-200">
            <CardHeader className="border-b border-gray-200">
              <CardTitle className="text-lg font-display font-bold text-gray-900 flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-900 rounded flex items-center justify-center">
                  <Clock className="h-4 w-4 text-white" />
                </div>
                Recent Scenarios
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              {scenarios.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4 font-medium">
                  No scenarios run yet. Create one to see results here.
                </p>
              ) : (
                <div className="space-y-3">
                  {scenarios.map((scenario) => (
                    <div
                      key={scenario.id}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        activeScenario?.id === scenario.id
                          ? 'border-blue-900 bg-blue-50'
                          : 'border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                      }`}
                      onClick={() => setActiveScenario(scenario)}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-bold text-sm text-gray-900">{scenario.name}</p>
                          {scenario.results && (
                            <div className="flex items-center gap-2 mt-2">
                              <TrendingUp className="h-3 w-3 text-gray-500" />
                              <span className={`text-xs font-bold ${
                                scenario.results.probabilityDelta > 0 ? 'text-green-700' : 'text-red-700'
                              }`}>
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
                          className="p-2 text-gray-400 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
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

          <Card className="border-2 border-gray-200">
            <CardHeader className="pb-2 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-display font-bold text-gray-900 flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-900 rounded flex items-center justify-center">
                    <Settings2 className="h-4 w-4 text-white" />
                  </div>
                  Model Weights
                </CardTitle>
                <button
                  onClick={() => setShowWeightEditor(!showWeightEditor)}
                  className="text-xs text-blue-900 hover:underline font-semibold"
                >
                  {showWeightEditor ? 'Hide' : 'Edit'}
                </button>
              </div>
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <code className="text-xs text-blue-900 font-bold">P = Σ(Factor × Weight)</code>
              </div>

              {/* Weight Total Indicator */}
              <div className={`text-xs p-3 rounded-lg font-bold ${Math.abs(totalWeight - 1) < 0.01 ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
                Total: {(totalWeight * 100).toFixed(0)}%
                {Math.abs(totalWeight - 1) >= 0.01 && ' (should be 100%)'}
              </div>

              {/* Editable Weights */}
              <div className="space-y-3">
                {[
                  { key: 'campaignFinance', label: 'Campaign Finance', hint: 'Money influence' },
                  { key: 'ballotWording', label: 'Ballot Wording', hint: 'Language impact' },
                  { key: 'demographics', label: 'Demographics', hint: 'Voter composition' },
                  { key: 'timing', label: 'Timing/Turnout', hint: 'Election context' },
                  { key: 'historical', label: 'Historical', hint: 'Past patterns' },
                  { key: 'opposition', label: 'Opposition', hint: 'Organized resistance' },
                ].map(({ key, label, hint }) => (
                  <div key={key} className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-700 font-medium">{label}</span>
                      <span className="font-mono font-bold text-gray-900">
                        {(weights[key as keyof FactorWeights] * 100).toFixed(0)}%
                      </span>
                    </div>
                    {showWeightEditor && (
                      <>
                        <input
                          type="range"
                          min="0"
                          max="50"
                          value={weights[key as keyof FactorWeights] * 100}
                          onChange={(e) => updateWeight(key as keyof FactorWeights, parseInt(e.target.value) / 100)}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-900"
                        />
                        <p className="text-[10px] text-gray-500">{hint}</p>
                      </>
                    )}
                  </div>
                ))}
              </div>

              {showWeightEditor && (
                <button
                  onClick={resetWeights}
                  className="w-full text-xs text-gray-600 hover:text-gray-900 py-2 border-2 border-dashed border-gray-300 rounded-lg font-semibold hover:border-gray-400 transition-colors"
                >
                  Reset to Default
                </button>
              )}

              {/* Formula Reference */}
              <div className="border-t-2 border-gray-200 pt-4 space-y-2">
                <p className="text-xs font-bold text-gray-900 flex items-center gap-1">
                  <Info className="h-3 w-3" />
                  Factor Calculations
                </p>
                <div className="text-[10px] text-gray-600 space-y-1 font-mono bg-gray-50 p-3 rounded-lg border border-gray-200">
                  <p>Finance: (Support% - 50%) × 0.8</p>
                  <p>Turnout: (Rate - 1.0) × 0.15</p>
                  <p>Framing: Sentiment × 0.2 + Complexity</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      )}
    </div>
  );
}
