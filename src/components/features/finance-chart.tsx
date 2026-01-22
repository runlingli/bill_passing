'use client';

import { PropositionFinance } from '@/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { formatCurrency, formatDate } from '@/lib/utils';
import { DollarSign, TrendingUp, Users } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

interface FinanceChartProps {
  finance: PropositionFinance;
}

export function FinanceChart({ finance }: FinanceChartProps) {
  const total = finance.totalSupport + finance.totalOpposition;
  const supportPercent = total > 0 ? (finance.totalSupport / total) * 100 : 50;

  const pieData = [
    { name: 'Support', value: finance.totalSupport, color: '#22c55e' },
    { name: 'Opposition', value: finance.totalOpposition, color: '#ef4444' },
  ];

  const topDonorsData = finance.topDonors.slice(0, 10).map((donor) => ({
    name: donor.name.length > 20 ? donor.name.substring(0, 20) + '...' : donor.name,
    amount: donor.amount,
    position: donor.position,
  }));

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-california-gold" />
            Campaign Finance Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-green-700 mb-1">Support</p>
              <p className="text-3xl font-bold text-green-600">
                {formatCurrency(finance.totalSupport, true)}
              </p>
              <p className="text-sm text-green-600 mt-1">
                {finance.supportCommittees.length} committees
              </p>
            </div>

            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Total Raised</p>
              <p className="text-3xl font-bold text-gray-900">
                {formatCurrency(total, true)}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Updated {formatDate(finance.lastUpdated, { month: 'short', day: 'numeric' })}
              </p>
            </div>

            <div className="text-center p-4 bg-red-50 rounded-lg">
              <p className="text-sm text-red-700 mb-1">Opposition</p>
              <p className="text-3xl font-bold text-red-600">
                {formatCurrency(finance.totalOpposition, true)}
              </p>
              <p className="text-sm text-red-600 mt-1">
                {finance.oppositionCommittees.length} committees
              </p>
            </div>
          </div>

          <div className="mt-6">
            <p className="text-sm text-gray-500 mb-2">Funding Balance</p>
            <div className="flex h-8 rounded-lg overflow-hidden">
              <div
                className="bg-green-500 flex items-center justify-center text-white text-sm font-medium transition-all"
                style={{ width: `${supportPercent}%` }}
              >
                {supportPercent >= 10 && `${supportPercent.toFixed(0)}%`}
              </div>
              <div
                className="bg-red-500 flex items-center justify-center text-white text-sm font-medium transition-all"
                style={{ width: `${100 - supportPercent}%` }}
              >
                {100 - supportPercent >= 10 && `${(100 - supportPercent).toFixed(0)}%`}
              </div>
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Support</span>
              <span>Opposition</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Funding Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4" />
              Top Donors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topDonorsData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    type="number"
                    tickFormatter={(v) => formatCurrency(v, true)}
                    fontSize={12}
                  />
                  <YAxis
                    dataKey="name"
                    type="category"
                    width={100}
                    fontSize={11}
                    tickLine={false}
                  />
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar
                    dataKey="amount"
                    fill="#3b82f6"
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Campaign Committees</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-green-700 mb-3 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Support Committees
              </h4>
              <div className="space-y-2">
                {finance.supportCommittees.map((committee) => (
                  <div
                    key={committee.id}
                    className="p-3 bg-green-50 rounded-lg"
                  >
                    <p className="font-medium text-sm">{committee.name}</p>
                    <div className="flex justify-between text-xs text-gray-600 mt-1">
                      <span>Raised: {formatCurrency(committee.totalRaised, true)}</span>
                      <span>Spent: {formatCurrency(committee.totalSpent, true)}</span>
                    </div>
                  </div>
                ))}
                {finance.supportCommittees.length === 0 && (
                  <p className="text-sm text-gray-500">No support committees registered</p>
                )}
              </div>
            </div>

            <div>
              <h4 className="font-medium text-red-700 mb-3 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 rotate-180" />
                Opposition Committees
              </h4>
              <div className="space-y-2">
                {finance.oppositionCommittees.map((committee) => (
                  <div
                    key={committee.id}
                    className="p-3 bg-red-50 rounded-lg"
                  >
                    <p className="font-medium text-sm">{committee.name}</p>
                    <div className="flex justify-between text-xs text-gray-600 mt-1">
                      <span>Raised: {formatCurrency(committee.totalRaised, true)}</span>
                      <span>Spent: {formatCurrency(committee.totalSpent, true)}</span>
                    </div>
                  </div>
                ))}
                {finance.oppositionCommittees.length === 0 && (
                  <p className="text-sm text-gray-500">No opposition committees registered</p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
