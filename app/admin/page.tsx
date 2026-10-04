'use client';

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import AnalyticsCharts from '@/components/admin/AnalyticsCharts';
import Link from 'next/link';
import {
  Droplets,
  Zap,
  AlertTriangle,
  CheckCircle2,
  FileCheck2,
  Users,
  Clock,
  TrendingUp,
  PlusCircle,
  Megaphone,
  ArrowRight,
  ShieldCheck,
  MapPin,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { formatTimeAgo, formatDate, getStatusBadge } from '@/lib/utils';
import { useToast } from '@/components/ToastProvider';

export default function AdminDashboardPage() {
  const { success, error } = useToast();
  const [stats, setStats] = useState<any>(null);
  const [recentReports, setRecentReports] = useState<any[]>([]);
  const [recentOutages, setRecentOutages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [statsRes, reportsRes, outagesRes] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch('/api/reports?limit=5'),
        fetch('/api/outages?limit=5')
      ]);

      if (statsRes.ok) {
        const data = await statsRes.json();
        setStats(data);
      }

      if (reportsRes.ok) {
        const data = await reportsRes.json();
        setRecentReports(data.reports || []);
      }

      if (outagesRes.ok) {
        const data = await outagesRes.json();
        setRecentOutages(data.outages || []);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const handleQuickVerify = async (reportId: string) => {
    try {
      const res = await fetch(`/api/reports/${reportId}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ promoteToOutage: true, severity: 'MEDIUM' })
      });
      if (res.ok) {
        success('Report verified and promoted to active outage');
        fetchDashboardData();
      } else {
        error('Failed to verify report');
      }
    } catch {
      error('Network error during verification');
    }
  };

  const handleQuickReject = async (reportId: string) => {
    try {
      const res = await fetch(`/api/reports/${reportId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: 'Reviewed by dispatcher: Invalid or duplicate' })
      });
      if (res.ok) {
        success('Report rejected');
        fetchDashboardData();
      } else {
        error('Failed to reject report');
      }
    } catch {
      error('Network error during rejection');
    }
  };

  const m = stats?.metrics;

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Welcome & Quick Action Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-amber-500 uppercase tracking-wider">
              Addis Ababa Operations Overview
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
              Dispatcher Command Center
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Live utility telemetry, citizen report triage queue, and citywide incident statistics.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={fetchDashboardData}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              title="Refresh Dashboard Data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>

            <Link
              href="/admin/outages"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-700 text-white shadow-sm transition"
            >
              <PlusCircle className="w-4 h-4" /> Create Outage
            </Link>

            <Link
              href="/admin/announcements"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-sm transition"
            >
              <Megaphone className="w-4 h-4" /> Broadcast Notice
            </Link>
          </div>
        </div>

        {/* 8 Primary KPI Metric Cards (as required in Section 7) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-semibold">Total Users</span>
              <Users className="w-4 h-4 text-sky-500" />
            </div>
            <p className="text-2xl font-black text-slate-900 dark:text-white mt-2">
              {m?.totalUsers ?? '...'}
            </p>
            <span className="text-[10px] text-slate-400">Registered citizens & staff</span>
          </div>

          <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-semibold">Total Reports</span>
              <FileCheck2 className="w-4 h-4 text-blue-500" />
            </div>
            <p className="text-2xl font-black text-slate-900 dark:text-white mt-2">
              {m?.totalReports ?? '...'}
            </p>
            <span className="text-[10px] text-slate-400">Lifetime submissions</span>
          </div>

          <div className="p-5 rounded-2xl border border-sky-200 dark:border-sky-900/60 bg-sky-50/40 dark:bg-sky-950/20 shadow-sm">
            <div className="flex items-center justify-between text-sky-700 dark:text-sky-300">
              <span className="text-xs font-bold">Active Water</span>
              <Droplets className="w-4 h-4 text-sky-600" />
            </div>
            <p className="text-2xl font-black text-sky-900 dark:text-sky-100 mt-2">
              {m?.activeWaterOutages ?? '...'}
            </p>
            <span className="text-[10px] text-sky-600 font-medium">Pipe leaks / low pressure</span>
          </div>

          <div className="p-5 rounded-2xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/40 dark:bg-amber-950/20 shadow-sm">
            <div className="flex items-center justify-between text-amber-700 dark:text-amber-300">
              <span className="text-xs font-bold">Active Power</span>
              <Zap className="w-4 h-4 text-amber-600" />
            </div>
            <p className="text-2xl font-black text-amber-900 dark:text-amber-100 mt-2">
              {m?.activePowerOutages ?? '...'}
            </p>
            <span className="text-[10px] text-amber-600 font-medium">Distribution grid trips</span>
          </div>

          <div className="p-5 rounded-2xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/40 dark:bg-emerald-950/20 shadow-sm">
            <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-300">
              <span className="text-xs font-bold">Restored Services</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-2xl font-black text-emerald-900 dark:text-emerald-100 mt-2">
              {m?.restoredOutages ?? '...'}
            </p>
            <span className="text-[10px] text-emerald-600 font-medium">Successfully fixed</span>
          </div>

          <div className="p-5 rounded-2xl border border-purple-200 dark:border-purple-900/60 bg-purple-50/40 dark:bg-purple-950/20 shadow-sm">
            <div className="flex items-center justify-between text-purple-700 dark:text-purple-300">
              <span className="text-xs font-bold">Pending Triage</span>
              <AlertTriangle className="w-4 h-4 text-purple-600" />
            </div>
            <p className="text-2xl font-black text-purple-900 dark:text-purple-100 mt-2">
              {m?.pendingReports ?? '...'}
            </p>
            <span className="text-[10px] text-purple-600 font-medium">Awaiting review</span>
          </div>

          <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-semibold">Reports Today</span>
              <Clock className="w-4 h-4 text-slate-400" />
            </div>
            <p className="text-2xl font-black text-slate-900 dark:text-white mt-2">
              {m?.reportsToday ?? '...'}
            </p>
            <span className="text-[10px] text-slate-400">Past 24 hours</span>
          </div>

          <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-semibold">Reports This Week</span>
              <TrendingUp className="w-4 h-4 text-indigo-500" />
            </div>
            <p className="text-2xl font-black text-slate-900 dark:text-white mt-2">
              {m?.reportsThisWeek ?? '...'}
            </p>
            <span className="text-[10px] text-slate-400">Avg fix: {m?.avgDurationHours ?? 3.5} hrs</span>
          </div>
        </div>

        {/* Charts & Visual Analytics Section */}
        {stats?.charts && <AnalyticsCharts data={stats.charts} />}

        {/* Two-Column Activity Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Pending Citizen Reports Triage */}
          <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <FileCheck2 className="w-4 h-4 text-purple-500" />
                  Recent Citizen Reports Queue
                </h3>
                <p className="text-xs text-slate-500">Latest submissions awaiting dispatcher verification</p>
              </div>
              <Link href="/admin/reports" className="text-xs font-bold text-sky-600 hover:underline">
                View All →
              </Link>
            </div>

            <div className="space-y-3 pt-1">
              {recentReports.length === 0 ? (
                <p className="text-xs text-slate-400 italic py-4">No recent reports.</p>
              ) : (
                recentReports.map((report) => {
                  const isWater = report.serviceType === 'WATER';
                  return (
                    <div
                      key={report.id}
                      className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex flex-col justify-between gap-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className={`inline-flex items-center gap-1 text-[11px] font-bold ${
                              isWater ? 'text-sky-600' : 'text-amber-600'
                            }`}>
                              {isWater ? <Droplets className="w-3 h-3" /> : <Zap className="w-3 h-3" />}
                              {report.serviceType}
                            </span>
                            <span className="text-xs font-bold text-slate-900 dark:text-white">
                              {report.problemType}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 line-clamp-2">
                            {report.description}
                          </p>
                          <p className="text-[11px] text-slate-400 mt-1">
                            📍 {report.subCity?.name} ({report.specificLocation}) • {formatTimeAgo(report.createdAt)}
                          </p>
                        </div>

                        <span className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          report.status === 'PENDING'
                            ? 'bg-purple-100 text-purple-800'
                            : report.status === 'VERIFIED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-200 text-slate-700'
                        }`}>
                          {report.status}
                        </span>
                      </div>

                      {report.status === 'PENDING' && (
                        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                          <button
                            onClick={() => handleQuickReject(report.id)}
                            className="px-2.5 py-1 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                          >
                            Reject
                          </button>
                          <button
                            onClick={() => handleQuickVerify(report.id)}
                            className="px-3 py-1 rounded-lg text-xs font-bold bg-sky-600 hover:bg-sky-700 text-white shadow-xs"
                          >
                            Verify & Promote
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Active Outages Quick Index */}
          <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  Active Outage Management
                </h3>
                <p className="text-xs text-slate-500">Ongoing outages logged in municipal tracker</p>
              </div>
              <Link href="/admin/outages" className="text-xs font-bold text-sky-600 hover:underline">
                Manage All →
              </Link>
            </div>

            <div className="space-y-3 pt-1">
              {recentOutages.length === 0 ? (
                <p className="text-xs text-slate-400 italic py-4">No active outages logged.</p>
              ) : (
                recentOutages.map((outage) => {
                  const statusInfo = getStatusBadge(outage.status);
                  const isWater = outage.serviceType === 'WATER';
                  return (
                    <div
                      key={outage.id}
                      className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-start justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center gap-1 text-[11px] font-bold ${
                            isWater ? 'text-sky-600' : 'text-amber-600'
                          }`}>
                            {isWater ? <Droplets className="w-3 h-3" /> : <Zap className="w-3 h-3" />}
                            {outage.serviceType}
                          </span>
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${statusInfo.bg}`}>
                            {statusInfo.label}
                          </span>
                        </div>
                        <h4 className="font-bold text-xs text-slate-900 dark:text-white line-clamp-1">
                          {outage.title}
                        </h4>
                        <p className="text-[11px] text-slate-400">
                          📍 {outage.subCity?.name} • {outage.affectedReportsCount} affected • {formatTimeAgo(outage.startedAt)}
                        </p>
                      </div>

                      <Link
                        href={`/admin/outages`}
                        className="shrink-0 p-2 text-slate-400 hover:text-sky-600 transition"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
