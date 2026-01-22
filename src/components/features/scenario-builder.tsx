'use client';

import { useState, useCallback } from 'react';
import {
  Scenario,
  ScenarioParameters,
  ScenarioPreset,
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
import { scenarioService } from '@/services';
import { Play, Save, RotateCcw, Zap } from 'lucide-react';

interface ScenarioBuilderProps {
  proposition: PropositionWithDetails;
  onScenarioRun: (scenario: Scenario) => void;
  initialScenario?: Scenario;
}

export function ScenarioBuilder({
  proposition,
  onScenarioRun,
  initialScenario,
}: ScenarioBuilderProps) {
  const [scenarioName, setScenarioName] = useState(initialScenario?.name || '');
  const [parameters, setParameters] = useState<ScenarioParameters>(
    initialScenario?.parameters || scenarioService.getDefaultParameters()
  );
  const [isRunning, setIsRunning] = useState(false);

  const handlePresetSelect = useCallback(async (presetId: string) => {
    const preset = SCENARIO_PRESETS.find((p) => p.id === presetId);
    if (preset) {
      setParameters({
        ...scenarioService.getDefaultParameters(),
        ...preset.parameters,
      } as ScenarioParameters);
      setScenarioName(preset.name);
    }
  }, []);

  const handleReset = useCallback(() => {
    setParameters(scenarioService.getDefaultParameters());
    setScenarioName('');
  }, []);

  const handleRunScenario = useCallback(async () => {
    setIsRunning(true);
    try {
      const scenario = await scenarioService.create(
        proposition.id,
        parameters,
        scenarioName || undefined
      );
      await scenarioService.run(scenario, proposition);
      onScenarioRun(scenario);
    } finally {
      setIsRunning(false);
    }
  }, [proposition, parameters, scenarioName, onScenarioRun]);

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
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-california-gold" />
            What-If Scenario Builder
          </CardTitle>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={handleReset}>
              <RotateCcw className="h-4 w-4 mr-1" />
              Reset
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="space-y-4">
          <Input
            label="Scenario Name"
            placeholder="Enter a name for this scenario"
            value={scenarioName}
            onChange={(e) => setScenarioName(e.target.value)}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quick Presets
            </label>
            <div className="flex flex-wrap gap-2">
              {SCENARIO_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => handlePresetSelect(preset.id)}
                  className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        <Tabs defaultValue="funding" className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="funding" className="flex-1">Funding</TabsTrigger>
            <TabsTrigger value="turnout" className="flex-1">Turnout</TabsTrigger>
            <TabsTrigger value="framing" className="flex-1">Framing</TabsTrigger>
          </TabsList>

          <TabsContent value="funding" className="space-y-6">
            <div className="p-4 bg-gray-50 rounded-lg space-y-6">
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
              <div className="text-sm text-gray-500">
                Adjust funding multipliers relative to current campaign spending levels.
                1x = current levels, 2x = doubled spending.
              </div>
            </div>
          </TabsContent>

          <TabsContent value="turnout" className="space-y-6">
            <div className="p-4 bg-gray-50 rounded-lg space-y-6">
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
                  <Badge variant="danger">Low</Badge>
                  <p className="text-gray-500 mt-1">Special Election</p>
                </div>
                <div>
                  <Badge variant="warning">Normal</Badge>
                  <p className="text-gray-500 mt-1">Midterm</p>
                </div>
                <div>
                  <Badge variant="success">High</Badge>
                  <p className="text-gray-500 mt-1">Presidential</p>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="framing" className="space-y-6">
            <div className="p-4 bg-gray-50 rounded-lg space-y-6">
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Summary Complexity
                </label>
                <Select
                  value={parameters.framing.summaryComplexity}
                  onValueChange={(v) => updateFraming('summaryComplexity', v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="simpler">Simpler Language</SelectItem>
                    <SelectItem value="unchanged">Unchanged</SelectItem>
                    <SelectItem value="complex">More Complex</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="text-sm text-gray-500">
                Simpler ballot language typically increases voter understanding and support
                for well-intentioned measures.
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex gap-3 pt-4 border-t">
          <Button
            variant="primary"
            className="flex-1"
            onClick={handleRunScenario}
            loading={isRunning}
          >
            <Play className="h-4 w-4 mr-2" />
            Run Scenario
          </Button>
          <Button variant="outline">
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
