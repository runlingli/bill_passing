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
import { MapPin, TrendingUp, TrendingDown, Minus, Filter } from 'lucide-react';

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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary-600" />
            District Impact Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ImpactSummaryDisplay summary={impact.summary} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Statewide Impact</CardTitle>
        </CardHeader>
        <CardContent>
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

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>District Details</CardTitle>
            <div className="flex gap-2">
              <Select
                value={districtTypeFilter}
                onValueChange={(v) => setDistrictTypeFilter(v as DistrictType | 'all')}
              >
                <SelectTrigger className="w-40">
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
                <SelectTrigger className="w-32">
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
        <CardContent>
          <div className="space-y-3">
            {filteredDistricts.slice(0, 20).map((district) => (
              <DistrictRow key={district.districtId} district={district} />
            ))}
            {filteredDistricts.length > 20 && (
              <p className="text-center text-sm text-gray-500 py-2">
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
        <div className="p-4 bg-red-50 rounded-lg text-center">
          <p className="text-2xl font-bold text-red-600">
            {summary.impactedDistricts.significant}
          </p>
          <p className="text-sm text-red-700">Significant Impact</p>
        </div>
        <div className="p-4 bg-yellow-50 rounded-lg text-center">
          <p className="text-2xl font-bold text-yellow-600">
            {summary.impactedDistricts.moderate}
          </p>
          <p className="text-sm text-yellow-700">Moderate Impact</p>
        </div>
        <div className="p-4 bg-gray-50 rounded-lg text-center">
          <p className="text-2xl font-bold text-gray-600">
            {summary.impactedDistricts.minimal}
          </p>
          <p className="text-sm text-gray-700">Minimal Impact</p>
        </div>
      </div>

      <div>
        <h4 className="font-medium mb-3">Shift Distribution</h4>
        <div className="flex h-8 rounded-lg overflow-hidden">
          <div
            className="bg-blue-500 flex items-center justify-center text-white text-xs font-medium"
            style={{
              width: `${(summary.shiftDistribution.democratic / summary.totalDistricts) * 100}%`,
            }}
          >
            {summary.shiftDistribution.democratic > 0 && `D: ${summary.shiftDistribution.democratic}`}
          </div>
          <div
            className="bg-gray-300 flex items-center justify-center text-gray-700 text-xs font-medium"
            style={{
              width: `${(summary.shiftDistribution.unchanged / summary.totalDistricts) * 100}%`,
            }}
          >
            {summary.shiftDistribution.unchanged > 0 && summary.shiftDistribution.unchanged}
          </div>
          <div
            className="bg-red-500 flex items-center justify-center text-white text-xs font-medium"
            style={{
              width: `${(summary.shiftDistribution.republican / summary.totalDistricts) * 100}%`,
            }}
          >
            {summary.shiftDistribution.republican > 0 && `R: ${summary.shiftDistribution.republican}`}
          </div>
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>Democratic</span>
          <span>Unchanged</span>
          <span>Republican</span>
        </div>
      </div>

      <div className="p-4 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-700">{summary.representationImpact}</p>
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
      ? 'text-blue-600'
      : district.change.direction === 'republican'
        ? 'text-red-600'
        : 'text-gray-500';

  return (
    <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-medium truncate">{district.districtName}</p>
          <Badge size="sm" variant="default">
            {district.districtType.replace('_', ' ')}
          </Badge>
        </div>
        <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
          <span>
            Current: {district.currentPartisan.democraticAdvantage > 0 ? 'D' : 'R'}+
            {Math.abs(district.currentPartisan.democraticAdvantage).toFixed(1)}
          </span>
          <span>Turnout: {formatPercentage(district.currentPartisan.voterEngagement)}</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="text-right">
          <div className={`flex items-center gap-1 ${shiftColor}`}>
            <ShiftIcon className="h-4 w-4" />
            <span className="font-medium">
              {district.change.balanceShift > 0 ? '+' : ''}
              {district.change.balanceShift.toFixed(2)}%
            </span>
          </div>
          <Badge
            size="sm"
            variant={
              district.change.significance === 'significant'
                ? 'danger'
                : district.change.significance === 'moderate'
                  ? 'warning'
                  : 'default'
            }
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
    default: 'bg-gray-50',
    info: 'bg-blue-50',
    danger: 'bg-red-50',
  };

  const textColors = {
    default: 'text-gray-900',
    info: 'text-blue-700',
    danger: 'text-red-700',
  };

  return (
    <div className={`p-4 rounded-lg ${colors[variant]}`}>
      <p className="text-sm text-gray-500">{label}</p>
      <p className={`text-2xl font-bold ${textColors[variant]} capitalize`}>{value}</p>
      {subtext && <p className="text-xs text-gray-500 capitalize">{subtext}</p>}
    </div>
  );
}
