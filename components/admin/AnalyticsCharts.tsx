'use client';

import React, { useEffect, useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area,
  CartesianGrid,
} from 'recharts';

interface AnalyticsChartsProps {
  data: {
    outagesBySubCity: { name: string; outages: number; reports: number }[];
    reportsPerDay: { date: string; water: number; electricity: number; total: number }[];
    serviceDistribution: { name: string; value: number; color: string }[];
    statusBreakdown: { name: string; count: number; color: string }[];
  };
}

export default function AnalyticsCharts({ data }: AnalyticsChartsProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-pulse">
        <div className="h-72 bg-slate-200 dark:bg-slate-800 rounded-3xl" />
        <div className="h-72 bg-slate-200 dark:bg-slate-800 rounded-3xl" />
        <div className="h-72 bg-slate-200 dark:bg-slate-800 rounded-3xl" />
        <div className="h-72 bg-slate-200 dark:bg-slate-800 rounded-3xl" />
      </div>
    );
  }

  const COLORS = ['#0284c7', '#f59e0b', '#ef4444', '#10b981', '#8b5cf6'];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* 1. Reports Trend Past 7 Days (Area Chart) */}
      <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
        <div>
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">
            Daily Citizen Reports (Past 7 Days)
          </h3>
          <p className="text-[11px] text-slate-400">Trend of incoming water and electricity outage submissions</p>
        </div>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.reportsPerDay} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorWater" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0284c7" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#0284c7" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorPower" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '11px',
                }}
              />
              <Area type="monotone" dataKey="water" name="Water Reports" stroke="#0284c7" fillOpacity={1} fill="url(#colorWater)" />
              <Area type="monotone" dataKey="electricity" name="Electricity Reports" stroke="#f59e0b" fillOpacity={1} fill="url(#colorPower)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2. Outages by Sub-City (Bar Chart) */}
      <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
        <div>
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">
            Incidents Distribution by Sub-City
          </h3>
          <p className="text-[11px] text-slate-400">Total verified outages across Addis Ababa sub-cities</p>
        </div>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.outagesBySubCity} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-25} textAnchor="end" height={45} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '11px',
                }}
              />
              <Bar dataKey="outages" name="Outages" fill="#0284c7" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 3. Service Type Split (Donut / Pie Chart) */}
      <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
        <div>
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">
            Active Outages by Utility Service
          </h3>
          <p className="text-[11px] text-slate-400">Water distribution vs Electricity grid interruptions</p>
        </div>
        <div className="h-64 w-full flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data.serviceDistribution}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {data.serviceDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '11px',
                }}
              />
              <Legend verticalAlign="bottom" height={36} iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 4. Incident Status Comparison (Bar Chart) */}
      <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
        <div>
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">
            Status Breakdown & Resolution Progress
          </h3>
          <p className="text-[11px] text-slate-400">Active vs Restored vs Pending Triage</p>
        </div>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.statusBreakdown} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '11px',
                }}
              />
              <Bar dataKey="count" name="Count" radius={[6, 6, 0, 0]}>
                {data.statusBreakdown.map((entry, index) => (
                  <Cell key={`status-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
