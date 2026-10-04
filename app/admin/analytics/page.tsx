'use client';

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import AnalyticsCharts from '@/components/admin/AnalyticsCharts';
import {
  BarChart3,
  TrendingUp,
  Clock,
  CheckCircle2,
  Droplets,
  Zap,
  MapPin,
  RefreshCw,
  Download
} from 'lucide-react';

export default function AdminAnalyticsPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const m = stats?.metrics;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">
              Civic Utility Analytics & Metrics
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Performance indicators, resolution turnaround duration, and sub-city outage distribution.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchStats}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Refresh
            </button>
          </div>
        </div>

        {/* Top Summary Stat Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
            <p className="text-xs font-semibold text-slate-500">Average Resolution Time</p>
            <p className="text-3xl font-extrabold text-slate-900 dark:text-white mt-2">
              {m?.avgDurationHours ?? 3.5} <span className="text-sm font-normal text-slate-400">hours</span>
            </p>
            <span className="text-[10px] text-emerald-600 font-semibold">Across all restored events</span>
          </div>

          <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
            <p className="text-xs font-semibold text-slate-500">Resolution Rate</p>
            <p className="text-3xl font-extrabold text-slate-900 dark:text-white mt-2">
              {m?.totalOutages ? Math.round((m.restoredOutages / m.totalOutages) * 100) : 0}%
            </p>
            <span className="text-[10px] text-slate-400">{m?.restoredOutages} of {m?.totalOutages} resolved</span>
          </div>

          <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
            <p className="text-xs font-semibold text-slate-500">Water Disruption Share</p>
            <p className="text-3xl font-extrabold text-sky-600 dark:text-sky-400 mt-2">
              {m?.activeOutages ? Math.round((m.activeWaterOutages / m.activeOutages) * 100) : 50}%
            </p>
            <span className="text-[10px] text-slate-400">{m?.activeWaterOutages} active pipeline faults</span>
          </div>

          <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
            <p className="text-xs font-semibold text-slate-500">Electricity Outage Share</p>
            <p className="text-3xl font-extrabold text-amber-500 mt-2">
              {m?.activeOutages ? Math.round((m.activePowerOutages / m.activeOutages) * 100) : 50}%
            </p>
            <span className="text-[10px] text-slate-400">{m?.activePowerOutages} active grid faults</span>
          </div>
        </div>

        {/* Charts Grid */}
        {stats?.charts && <AnalyticsCharts data={stats.charts} />}

        {/* Most Affected Sub-Cities Breakdown Table */}
        <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">
            Addis Ababa Sub-City Service Incident Index
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold uppercase">
                <tr>
                  <th className="py-3 px-4">Sub-City</th>
                  <th className="py-3 px-4">Active & Historical Outages</th>
                  <th className="py-3 px-4">Citizen Reports Logged</th>
                  <th className="py-3 px-4">Severity Proportion</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {stats?.charts?.outagesBySubCity?.map((sc: any, idx: number) => (
                  <tr key={sc.name} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <span className="text-slate-400 font-normal">#{idx + 1}</span>
                      <span>{sc.name}</span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">
                      {sc.outages} incidents
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                      {sc.reports} citizen reports
                    </td>
                    <td className="py-3 px-4">
                      <div className="w-full max-w-[120px] bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-sky-500 h-full rounded-full"
                          style={{
                            width: `${Math.min(100, (sc.outages / Math.max(1, stats.charts.outagesBySubCity[0]?.outages)) * 100)}%`
                          }}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
