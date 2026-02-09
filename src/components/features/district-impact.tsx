'use client';

import { useState } from 'react';
import {
  PropositionImpact,
  DistrictImpactDetail,
  DistrictType,
  ImpactSummary,
} from '@/types';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Badge,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui';
import { formatPercentage } from '@/lib/utils';
import { MapPin, TrendingUp, TrendingDown, Minus, Filter, Target, BarChart3 } from 'lucide-react';

interface DistrictImpactProps {
  impact: PropositionImpact;
}

export function DistrictImpactDisplay({ impact }: DistrictImpactProps) {
  const [districtTypeFilter, setDistrictTypeFilter] = useState<DistrictType | 'all'>('all');
  const [sortBy, setSortBy] = useState<'impact' | 'name'>('impact');

  const filteredDistricts = impact.districts
    .filter((d) => districtTypeFilter === 'all' || d.districtType === districtTypeFilter)
    .sort((a, b) => {
      if (sortBy === 'impact') {
        return Math.abs(b.change.balanceShift) - Math.abs(a.change.balanceShift);
      }
      return a.districtName.localeCompare(b.districtName);
    });

  return (
    <div className="space-y-6">
      <Card className="border-2 border-gray-200">
        <CardHeader className="border-b border-gray-200">
          <CardTitle className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-900 rounded flex items-center justify-center">
              <MapPin className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-display font-bold text-gray-900">District Impact Analysis</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <ImpactSummaryDisplay summary={impact.summary} />
        </CardContent>
      </Card>

      <Card className="border-2 border-gray-200">
        <CardHeader className="border-b border-gray-200">
          <CardTitle className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-900 rounded flex items-center justify-center">
              <Target className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-display font-bold text-gray-900">Statewide Impact</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              label="Affected Districts"
              value={impact.statewide.totalAffectedDistricts.toString()}
              subtext={`of ${impact.districts.length} total`}
            />
            <StatCard
              label="Avg. Balance Shift"
              value={`${impact.statewide.averageBalanceShift > 0 ? '+' : ''}${impact.statewide.averageBalanceShift.toFixed(2)}%`}
              subtext={impact.statewide.netDirection}
              variant={
                impact.statewide.netDirection === 'democratic'
                  ? 'info'
                  : impact.statewide.netDirection === 'republican'
                    ? 'danger'
                    : 'default'
              }
            />
            <StatCard
              label="Competitiveness"
              value={`${impact.statewide.competitivenessChange > 0 ? '+' : ''}${(impact.statewide.competitivenessChange * 100).toFixed(1)}%`}
              subtext={
                impact.statewide.competitivenessChange > 0
                  ? 'More competitive'
                  : 'Less competitive'
              }
            />
            <StatCard
              label="Net Direction"
              value={impact.statewide.netDirection}
              variant={
                impact.statewide.netDirection === 'democratic'
                  ? 'info'
                  : impact.statewide.netDirection === 'republican'
                    ? 'danger'
                    : 'default'
              }
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-2 border-gray-200">
        <CardHeader className="border-b border-gray-200">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-900 rounded flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-display font-bold text-gray-900">District Details</span>
            </CardTitle>
            <div className="flex gap-2">
              <Select
                value={districtTypeFilter}
                onValueChange={(v) => setDistrictTypeFilter(v as DistrictType | 'all')}
              >
                <SelectTrigger className="w-44 border-2 border-gray-200">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="congressional">Congressional</SelectItem>
                  <SelectItem value="state_senate">State Senate</SelectItem>
                  <SelectItem value="state_assembly">State Assembly</SelectItem>
                  <SelectItem value="county">County</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={(v) => setSortBy(v as 'impact' | 'name')}>
                <SelectTrigger className="w-36 border-2 border-gray-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="impact">By Impact</SelectItem>
                  <SelectItem value="name">By Name</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-3">
            {filteredDistricts.slice(0, 20).map((district) => (
              <DistrictRow key={district.districtId} district={district} />
            ))}
            {filteredDistricts.length > 20 && (
              <p className="text-center text-sm text-gray-600 py-3 font-medium border-t border-gray-200">
                Showing 20 of {filteredDistricts.length} districts
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ImpactSummaryDisplay({ summary }: { summary: ImpactSummary }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <div className="p-5 bg-red-50 rounded-lg text-center border-2 border-red-200">
          <p className="text-3xl font-display font-bold text-red-700">
            {summary.impactedDistricts.significant}
          </p>
          <p className="text-sm text-red-700 font-semibold mt-1">Significant Impact</p>
        </div>
        <div className="p-5 bg-amber-50 rounded-lg text-center border-2 border-amber-200">
          <p className="text-3xl font-display font-bold text-amber-600">
            {summary.impactedDistricts.moderate}
          </p>
          <p className="text-sm text-amber-700 font-semibold mt-1">Moderate Impact</p>
        </div>
        <div className="p-5 bg-gray-50 rounded-lg text-center border-2 border-gray-200">
          <p className="text-3xl font-display font-bold text-gray-600">
            {summary.impactedDistricts.minimal}
          </p>
          <p className="text-sm text-gray-700 font-semibold mt-1">Minimal Impact</p>
        </div>
      </div>

      <div>
        <h4 className="font-bold text-gray-900 mb-3">Shift Distribution</h4>
        <div className="flex h-10 rounded-lg overflow-hidden border-2 border-gray-200">
          <div
            className="bg-blue-900 flex items-center justify-center text-white text-xs font-bold"
            style={{
              width: `${(summary.shiftDistribution.democratic / summary.totalDistricts) * 100}%`,
            }}
          >
            {summary.shiftDistribution.democratic > 0 && `D: ${summary.shiftDistribution.democratic}`}
          </div>
          <div
            className="bg-gray-300 flex items-center justify-center text-gray-700 text-xs font-bold"
            style={{
              width: `${(summary.shiftDistribution.unchanged / summary.totalDistricts) * 100}%`,
            }}
          >
            {summary.shiftDistribution.unchanged > 0 && summary.shiftDistribution.unchanged}
          </div>
          <div
            className="bg-red-700 flex items-center justify-center text-white text-xs font-bold"
            style={{
              width: `${(summary.shiftDistribution.republican / summary.totalDistricts) * 100}%`,
            }}
          >
            {summary.shiftDistribution.republican > 0 && `R: ${summary.shiftDistribution.republican}`}
          </div>
        </div>
        <div className="flex justify-between text-xs text-gray-600 mt-2 font-medium">
          <span>Democratic</span>
          <span>Unchanged</span>
          <span>Republican</span>
        </div>
      </div>

      <div className="p-4 bg-gray-50 rounded-lg border-2 border-gray-200">
        <p className="text-sm text-gray-700 leading-relaxed">{summary.representationImpact}</p>
      </div>
    </div>
  );
}

function DistrictRow({ district }: { district: DistrictImpactDetail }) {
  const ShiftIcon =
    district.change.direction === 'democratic'
      ? TrendingUp
      : district.change.direction === 'republican'
        ? TrendingDown
        : Minus;

  const shiftColor =
    district.change.direction === 'democratic'
      ? 'text-blue-900'
      : district.change.direction === 'republican'
        ? 'text-red-700'
        : 'text-gray-500';

  const shiftBg =
    district.change.direction === 'democratic'
      ? 'bg-blue-50'
      : district.change.direction === 'republican'
        ? 'bg-red-50'
        : 'bg-gray-50';

  return (
    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border-2 border-gray-200 hover:border-gray-300 transition-colors">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-bold text-gray-900 truncate">{district.districtName}</p>
          <Badge className="bg-gray-200 text-gray-700 border-0 text-xs font-semibold">
            {district.districtType.replace('_', ' ')}
          </Badge>
        </div>
        <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
          <span className="font-medium">
            Current: <span className={district.currentPartisan.democraticAdvantage > 0 ? 'text-blue-900' : 'text-red-700'}>
              {district.currentPartisan.democraticAdvantage > 0 ? 'D' : 'R'}+
              {Math.abs(district.currentPartisan.democraticAdvantage).toFixed(1)}
            </span>
          </span>
          <span className="font-medium">Turnout: {formatPercentage(district.currentPartisan.voterEngagement)}</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="text-right">
          <div className={`flex items-center gap-1 ${shiftColor} ${shiftBg} px-3 py-1 rounded-lg`}>
            <ShiftIcon className="h-4 w-4" />
            <span className="font-bold">
              {district.change.balanceShift > 0 ? '+' : ''}
              {district.change.balanceShift.toFixed(2)}%
            </span>
          </div>
          <Badge
            className={`mt-2 border-0 font-semibold ${
              district.change.significance === 'significant'
                ? 'bg-red-700 text-white'
                : district.change.significance === 'moderate'
                  ? 'bg-amber-500 text-white'
                  : 'bg-gray-200 text-gray-700'
            }`}
          >
            {district.change.significance}
          </Badge>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  subtext,
  variant = 'default',
}: {
  label: string;
  value: string;
  subtext?: string;
  variant?: 'default' | 'info' | 'danger';
}) {
  const colors = {
    default: 'bg-gray-50 border-gray-200',
    info: 'bg-blue-50 border-blue-200',
    danger: 'bg-red-50 border-red-200',
  };

  const textColors = {
    default: 'text-gray-900',
    info: 'text-blue-900',
    danger: 'text-red-700',
  };

  return (
    <div className={`p-5 rounded-lg border-2 ${colors[variant]}`}>
      <p className="text-sm text-gray-600 font-medium">{label}</p>
      <p className={`text-2xl font-bold ${textColors[variant]} capitalize mt-1`}>{value}</p>
      {subtext && <p className="text-xs text-gray-500 capitalize mt-1 font-medium">{subtext}</p>}
    </div>
  );
}
