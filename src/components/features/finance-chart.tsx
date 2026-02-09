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
    { name: 'Support', value: finance.totalSupport, color: '#15803d' },
    { name: 'Opposition', value: finance.totalOpposition, color: '#b91c1c' },
  ];

  const topDonorsData = finance.topDonors.slice(0, 10).map((donor) => ({
    name: donor.name.length > 20 ? donor.name.substring(0, 20) + '...' : donor.name,
    amount: donor.amount,
    position: donor.position,
  }));

  return (
    <div className="space-y-6">
      <Card className="border-2 border-gray-200">
        <CardHeader className="border-b border-gray-200">
          <CardTitle className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-700 rounded flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-display font-bold text-gray-900">Campaign Finance Overview</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-5 bg-green-50 rounded border border-green-200">
              <p className="text-sm text-green-700 font-medium mb-2">Support</p>
              <p className="text-3xl font-display font-bold text-green-700">
                {formatCurrency(finance.totalSupport, true)}
              </p>
              <p className="text-sm text-green-600 mt-2">
                {finance.supportCommittees.length} committees
              </p>
            </div>

            <div className="text-center p-5 bg-gray-50 rounded border border-gray-200">
              <p className="text-sm text-gray-600 font-medium mb-2">Total Raised</p>
              <p className="text-3xl font-display font-bold text-gray-900">
                {formatCurrency(total, true)}
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Updated {formatDate(finance.lastUpdated, { month: 'short', day: 'numeric' })}
              </p>
            </div>

            <div className="text-center p-5 bg-red-50 rounded border border-red-200">
              <p className="text-sm text-red-700 font-medium mb-2">Opposition</p>
              <p className="text-3xl font-display font-bold text-red-700">
                {formatCurrency(finance.totalOpposition, true)}
              </p>
              <p className="text-sm text-red-600 mt-2">
                {finance.oppositionCommittees.length} committees
              </p>
            </div>
          </div>

          <div className="mt-6">
            <p className="text-sm text-gray-700 font-medium mb-3">Funding Balance</p>
            <div className="flex h-8 rounded overflow-hidden border border-gray-200">
              <div
                className="bg-green-700 flex items-center justify-center text-white text-sm font-bold transition-all"
                style={{ width: `${supportPercent}%` }}
              >
                {supportPercent >= 10 && `${supportPercent.toFixed(0)}%`}
              </div>
              <div
                className="bg-red-700 flex items-center justify-center text-white text-sm font-bold transition-all"
                style={{ width: `${100 - supportPercent}%` }}
              >
                {100 - supportPercent >= 10 && `${(100 - supportPercent).toFixed(0)}%`}
              </div>
            </div>
            <div className="flex justify-between text-xs text-gray-600 font-medium mt-2">
              <span>Support</span>
              <span>Opposition</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-2 border-gray-200">
          <CardHeader className="border-b border-gray-200">
            <CardTitle className="text-lg font-display font-bold text-gray-900">Funding Distribution</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
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
                      border: '2px solid #e5e7eb',
                      borderRadius: '4px',
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-gray-200">
          <CardHeader className="border-b border-gray-200">
            <CardTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-900" />
              Top Donors
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topDonorsData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
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
                      border: '2px solid #e5e7eb',
                      borderRadius: '4px',
                    }}
                  />
                  <Bar
                    dataKey="amount"
                    fill="#1e3a8a"
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-2 border-gray-200">
        <CardHeader className="border-b border-gray-200">
          <CardTitle className="text-lg font-display font-bold text-gray-900">Campaign Committees</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-bold text-green-700 mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Support Committees
              </h4>
              <div className="space-y-3">
                {finance.supportCommittees.map((committee) => (
                  <div
                    key={committee.id}
                    className="p-4 bg-green-50 rounded border border-green-200"
                  >
                    <p className="font-bold text-sm text-gray-900">{committee.name}</p>
                    <div className="flex justify-between text-xs text-gray-600 mt-2">
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
              <h4 className="font-bold text-red-700 mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 rotate-180" />
                Opposition Committees
              </h4>
              <div className="space-y-3">
                {finance.oppositionCommittees.map((committee) => (
                  <div
                    key={committee.id}
                    className="p-4 bg-red-50 rounded border border-red-200"
                  >
                    <p className="font-bold text-sm text-gray-900">{committee.name}</p>
                    <div className="flex justify-between text-xs text-gray-600 mt-2">
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
