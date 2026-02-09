'use client';

import { useState, useCallback, useEffect } from 'react';
import {
  Scenario,
  ScenarioParameters,
  SCENARIO_PRESETS,
  PropositionWithDetails,
} from '@/types';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  Input,
  Slider,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Badge,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@/components/ui';
import { scenarioService, predictionService } from '@/services';
import { Play, Save, RotateCcw, Zap } from 'lucide-react';

export interface FactorWeights {
  campaignFinance: number;
  ballotWording: number;
  demographics: number;
  timing: number;
  historical: number;
  opposition: number;
}

interface ScenarioBuilderProps {
  proposition: PropositionWithDetails;
  onScenarioRun: (scenario: Scenario) => void;
  initialScenario?: Scenario;
  presetId?: string | null;
  customWeights?: FactorWeights;
}

export function ScenarioBuilder({
  proposition,
  onScenarioRun,
  initialScenario,
  presetId,
  customWeights,
}: ScenarioBuilderProps) {
  const [scenarioName, setScenarioName] = useState(initialScenario?.name || '');
  const [parameters, setParameters] = useState<ScenarioParameters>(
    initialScenario?.parameters || scenarioService.getDefaultParameters()
  );
  const [isRunning, setIsRunning] = useState(false);

  const handlePresetSelect = useCallback((presetId: string) => {
    const preset = SCENARIO_PRESETS.find((p) => p.id === presetId);
    if (preset) {
      setParameters({
        ...scenarioService.getDefaultParameters(),
        ...preset.parameters,
      } as ScenarioParameters);
      setScenarioName(preset.name);
    }
  }, []);

  // React to external preset selection
  useEffect(() => {
    if (presetId) {
      handlePresetSelect(presetId);
    }
  }, [presetId, handlePresetSelect]);

  const handleReset = useCallback(() => {
    setParameters(scenarioService.getDefaultParameters());
    setScenarioName('');
  }, []);

  const handleRunScenario = useCallback(async () => {
    setIsRunning(true);
    try {
      // Apply custom weights if provided
      if (customWeights) {
        predictionService.setWeights({
          campaignFinance: customWeights.campaignFinance,
          historicalSimilarity: customWeights.historical,
          demographics: customWeights.demographics,
          ballotWording: customWeights.ballotWording,
          timing: customWeights.timing,
          opposition: customWeights.opposition,
        });
      }

      const scenario = await scenarioService.create(
        proposition.id,
        parameters,
        scenarioName || undefined
      );
      const results = await scenarioService.run(scenario, proposition);

      // Reset weights to default after running
      if (customWeights) {
        predictionService.resetWeights();
      }

      // Attach results to scenario before passing to callback
      const scenarioWithResults = {
        ...scenario,
        results,
        updatedAt: new Date().toISOString(),
      };
      onScenarioRun(scenarioWithResults);
    } finally {
      setIsRunning(false);
    }
  }, [proposition, parameters, scenarioName, onScenarioRun, customWeights]);

  const updateFunding = useCallback(
    (key: 'supportMultiplier' | 'oppositionMultiplier', value: number) => {
      setParameters((prev) => ({
        ...prev,
        funding: { ...prev.funding, [key]: value },
      }));
    },
    []
  );

  const updateTurnout = useCallback((value: number) => {
    setParameters((prev) => ({
      ...prev,
      turnout: { ...prev.turnout, overallMultiplier: value },
    }));
  }, []);

  const updateFraming = useCallback(
    (key: 'titleSentiment' | 'summaryComplexity', value: number | string) => {
      setParameters((prev) => ({
        ...prev,
        framing: { ...prev.framing, [key]: value },
      }));
    },
    []
  );

  return (
    <Card className="border-2 border-gray-200">
      <CardHeader className="border-b border-gray-200">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-900 rounded flex items-center justify-center">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-display font-bold text-gray-900">What-If Scenario Builder</span>
          </CardTitle>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={handleReset} className="text-blue-900 hover:bg-blue-50">
              <RotateCcw className="h-4 w-4 mr-1" />
              Reset
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-6 space-y-6">
        <div className="space-y-4">
          <Input
            label="Scenario Name"
            placeholder="Enter a name for this scenario"
            value={scenarioName}
            onChange={(e) => setScenarioName(e.target.value)}
            className="border-2 border-gray-200 focus:border-blue-900"
          />

          <div>
            <label className="block text-sm font-bold text-gray-900 mb-3">
              Quick Presets
            </label>
            <div className="flex flex-wrap gap-2">
              {SCENARIO_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => handlePresetSelect(preset.id)}
                  className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-blue-900 hover:text-white border border-gray-200 rounded font-medium transition-colors"
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        <Tabs defaultValue="funding" className="w-full">
          <TabsList className="w-full bg-gray-100 border border-gray-200 p-1 rounded">
            <TabsTrigger value="funding" className="flex-1 data-[state=active]:bg-blue-900 data-[state=active]:text-white">Funding</TabsTrigger>
            <TabsTrigger value="turnout" className="flex-1 data-[state=active]:bg-blue-900 data-[state=active]:text-white">Turnout</TabsTrigger>
            <TabsTrigger value="framing" className="flex-1 data-[state=active]:bg-blue-900 data-[state=active]:text-white">Framing</TabsTrigger>
          </TabsList>

          <TabsContent value="funding" className="space-y-6 pt-4">
            <div className="p-4 bg-gray-50 rounded border border-gray-200 space-y-6">
              <Slider
                label="Support Campaign Funding"
                value={[parameters.funding.supportMultiplier]}
                onValueChange={([v]) => updateFunding('supportMultiplier', v)}
                min={0.25}
                max={4}
                step={0.25}
                showValue
                formatValue={(v) => `${v}x`}
              />
              <Slider
                label="Opposition Campaign Funding"
                value={[parameters.funding.oppositionMultiplier]}
                onValueChange={([v]) => updateFunding('oppositionMultiplier', v)}
                min={0.25}
                max={4}
                step={0.25}
                showValue
                formatValue={(v) => `${v}x`}
              />

              {/* Estimated Impact Display */}
              <div className="p-4 bg-white border-2 border-gray-200 rounded">
                <p className="text-sm font-bold text-gray-900 mb-2">Estimated Impact</p>
                <div className="text-sm">
                  {(() => {
                    const supportRatio = parameters.funding.supportMultiplier /
                      (parameters.funding.supportMultiplier + parameters.funding.oppositionMultiplier);
                    const baseRatio = 0.5;
                    const delta = (supportRatio - baseRatio) * 0.8 * 0.30; // 0.8 scaling, 30% weight
                    const sign = delta >= 0 ? '+' : '';
                    return (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">
                          Support ratio: {(supportRatio * 100).toFixed(0)}%
                        </span>
                        <span className={`font-bold ${delta >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                          {sign}{(delta * 100).toFixed(1)}% probability
                        </span>
                      </div>
                    );
                  })()}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Formula: (Support% - 50%) × 0.8 × 30% weight
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="turnout" className="space-y-6 pt-4">
            <div className="p-4 bg-gray-50 rounded border border-gray-200 space-y-6">
              <Slider
                label="Overall Voter Turnout"
                value={[parameters.turnout.overallMultiplier]}
                onValueChange={([v]) => updateTurnout(v)}
                min={0.5}
                max={1.5}
                step={0.05}
                showValue
                formatValue={(v) => `${(v * 100).toFixed(0)}%`}
              />
              <div className="grid grid-cols-3 gap-4 text-center text-sm">
                <div>
                  <Badge className="bg-red-700 text-white border-0">Low</Badge>
                  <p className="text-gray-600 mt-1 font-medium">Special Election</p>
                </div>
                <div>
                  <Badge className="bg-blue-600 text-white border-0">Normal</Badge>
                  <p className="text-gray-600 mt-1 font-medium">Midterm</p>
                </div>
                <div>
                  <Badge className="bg-green-700 text-white border-0">High</Badge>
                  <p className="text-gray-600 mt-1 font-medium">Presidential</p>
                </div>
              </div>

              {/* Estimated Impact Display */}
              <div className="p-4 bg-white border-2 border-gray-200 rounded">
                <p className="text-sm font-bold text-gray-900 mb-2">Estimated Impact</p>
                <div className="text-sm">
                  {(() => {
                    const multiplier = parameters.turnout.overallMultiplier;
                    let delta = 0;
                    if (multiplier > 1.0) {
                      delta = (multiplier - 1.0) * 0.15 * 0.15; // 15% scaling, 15% weight
                    } else {
                      delta = -(1.0 - multiplier) * 0.1 * 0.15;
                    }
                    const sign = delta >= 0 ? '+' : '';
                    return (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">
                          Turnout: {(multiplier * 100).toFixed(0)}% of baseline
                        </span>
                        <span className={`font-bold ${delta >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                          {sign}{(delta * 100).toFixed(1)}% probability
                        </span>
                      </div>
                    );
                  })()}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Formula: (Turnout - 100%) × 15% scaling × 15% weight
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="framing" className="space-y-6 pt-4">
            <div className="p-4 bg-gray-50 rounded border border-gray-200 space-y-6">
              <Slider
                label="Title Sentiment"
                value={[parameters.framing.titleSentiment]}
                onValueChange={([v]) => updateFraming('titleSentiment', v)}
                min={-1}
                max={1}
                step={0.1}
                showValue
                formatValue={(v) => (v > 0 ? `+${v.toFixed(1)}` : v.toFixed(1))}
              />
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Summary Complexity
                </label>
                <Select
                  value={parameters.framing.summaryComplexity}
                  onValueChange={(v) => updateFraming('summaryComplexity', v)}
                >
                  <SelectTrigger className="border-2 border-gray-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="simpler">Simpler Language</SelectItem>
                    <SelectItem value="unchanged">Unchanged</SelectItem>
                    <SelectItem value="complex">More Complex</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {/* Estimated Impact Display */}
              <div className="p-4 bg-white border-2 border-gray-200 rounded">
                <p className="text-sm font-bold text-gray-900 mb-2">Estimated Impact</p>
                <div className="text-sm">
                  {(() => {
                    // Sentiment impact: sentiment × 20% × 20% weight
                    let delta = parameters.framing.titleSentiment * 0.20 * 0.20;

                    // Complexity impact
                    if (parameters.framing.summaryComplexity === 'simpler') {
                      delta += 0.08 * 0.20; // +8% × 20% weight
                    } else if (parameters.framing.summaryComplexity === 'complex') {
                      delta -= 0.08 * 0.20;
                    }

                    const sign = delta >= 0 ? '+' : '';
                    const sentimentLabel = parameters.framing.titleSentiment > 0 ? 'positive' :
                                          parameters.framing.titleSentiment < 0 ? 'negative' : 'neutral';
                    return (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">
                          {sentimentLabel} framing, {parameters.framing.summaryComplexity} text
                        </span>
                        <span className={`font-bold ${delta >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                          {sign}{(delta * 100).toFixed(1)}% probability
                        </span>
                      </div>
                    );
                  })()}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Formula: (Sentiment × 20% + Complexity ±8%) × 20% weight
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex gap-3 pt-6 border-t-2 border-gray-200">
          <Button
            variant="primary"
            className="flex-1 bg-blue-900 hover:bg-blue-800 text-white font-semibold"
            onClick={handleRunScenario}
            loading={isRunning}
          >
            <Play className="h-4 w-4 mr-2" />
            Run Scenario
          </Button>
          <Button variant="outline" className="border-2 border-gray-200 text-gray-700 hover:bg-gray-50 font-semibold">
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
