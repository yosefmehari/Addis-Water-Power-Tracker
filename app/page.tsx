import React from 'react';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import StatsCards from '@/components/StatsCards';
import OutageCard from '@/components/OutageCard';
import OutageMap from '@/components/OutageMap';
import {
  Droplets,
  Zap,
  PlusCircle,
  MapPin,
  Megaphone,
  ArrowRight,
  ShieldCheck,
  Activity,
  Layers,
  Clock,
  Phone
} from 'lucide-react';
import { startOfDay } from 'date-fns';

export const revalidate = 0; // dynamic on request

export default async function HomePage() {
  const now = new Date();
  const todayStart = startOfDay(now);

  // Fetch stats and active outages
  const [
    activeWaterCount,
    activePowerCount,
    restoredCount,
    totalReports,
    pendingReports,
    announcements,
    subCities,
    recentOutages,
    allActiveForMap,
  ] = await Promise.all([
    prisma.outage.count({
      where: { serviceType: 'WATER', status: { in: ['ACTIVE', 'INVESTIGATING', 'VERIFIED'] } }
    }),
    prisma.outage.count({
      where: { serviceType: 'ELECTRICITY', status: { in: ['ACTIVE', 'INVESTIGATING', 'VERIFIED'] } }
    }),
    prisma.outage.count({
      where: { status: 'RESTORED' }
    }),
    prisma.outageReport.count(),
    prisma.outageReport.count({
      where: { status: 'PENDING' }
    }),
    prisma.announcement.findMany({
      where: { isActive: true },
      orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
      take: 2,
      include: { subCity: true }
    }),
    prisma.subCity.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: {
            outages: {
              where: { status: { in: ['ACTIVE', 'INVESTIGATING', 'VERIFIED'] } }
            }
          }
        }
      }
    }),
    prisma.outage.findMany({
      take: 6,
      orderBy: [{ status: 'asc' }, { startedAt: 'desc' }],
      include: {
        subCity: true,
        woreda: true,
        area: true,
      }
    }),
    prisma.outage.findMany({
      take: 50,
      orderBy: { startedAt: 'desc' },
      include: {
        subCity: true,
        woreda: true,
        area: true,
      }
    })
  ]);

  const metrics = {
    activeWaterOutages: activeWaterCount,
    activePowerOutages: activePowerCount,
    activeOutages: activeWaterCount + activePowerCount,
    restoredOutages: restoredCount,
    totalReports,
    pendingReports,
  };

  return (
    <div className="flex flex-col gap-10 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-sky-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-950 dark:to-slate-950 border-b border-slate-200 dark:border-slate-800 pt-10 pb-14 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Top Live Ticker Badge */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-xs font-semibold text-slate-700 dark:text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span>Addis Ababa Live Utility Radar</span>
              <span className="text-slate-400">|</span>
              <span className="text-sky-600 dark:text-sky-400 font-bold">{metrics.activeOutages} Active Alerts</span>
            </div>

            <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1 font-medium">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                Updated in Real-Time
              </span>
              <span>•</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> 11 Sub-Cities Covered
              </span>
            </div>
          </div>

          {/* Announcement Alert (if active) */}
          {announcements.length > 0 && (
            <div className="mb-8 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 mt-0.5">
                  <Megaphone className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/60 px-2 py-0.5 rounded-full">
                      Utility Notice
                    </span>
                    {announcements[0].subCity && (
                      <span className="text-xs font-medium text-amber-700 dark:text-amber-300">
                        {announcements[0].subCity.name}
                      </span>
                    )}
                  </div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white mt-1">
                    {announcements[0].title}
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 line-clamp-1">
                    {announcements[0].content}
                  </p>
                </div>
              </div>
              <Link
                href="/announcements"
                className="shrink-0 text-xs font-semibold px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white transition shadow-sm"
              >
                Read Notices
              </Link>
            </div>
          )}

          {/* Hero Content */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-4">
              <h1 className="text-3xl sm:text-5xl font-black text-slate-950 dark:text-white tracking-tight leading-tight">
                Addis Ababa Water & <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-600 via-blue-600 to-amber-500">
                  Power Outage Tracker
                </span>
              </h1>
              <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
                Stay informed with verified, real-time reports on water shortages and electrical blackouts across Bole, Yeka, Kirkos, Piassa, and all 11 sub-cities.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  href="/report"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white shadow-lg shadow-rose-600/25 transition transform hover:-translate-y-0.5"
                >
                  <PlusCircle className="w-5 h-5" />
                  <span>Report an Outage Now</span>
                </Link>

                <Link
                  href="/map"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 shadow-sm transition"
                >
                  <MapPin className="w-4 h-4 text-sky-600" />
                  <span>Explore Live Map</span>
                </Link>

                <Link
                  href="/outages"
                  className="inline-flex items-center gap-2 px-4 py-3 rounded-xl font-semibold text-sm text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition"
                >
                  <span>View All Feeds</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Quick Municipal Callout Card */}
            <div className="lg:col-span-4 p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <span className="font-bold text-xs uppercase tracking-wider text-slate-500">Addis Hotlines</span>
                <span className="px-2 py-0.5 rounded-full text-[11px] bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-semibold">
                  24/7 Available
                </span>
              </div>

              <div className="space-y-2.5">
                <div className="flex items-center justify-between p-3 rounded-2xl bg-sky-50 dark:bg-sky-950/40 border border-sky-100 dark:border-sky-900">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-sky-500 text-white flex items-center justify-center">
                      <Droplets className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">Water Authority (AAWSA)</p>
                      <p className="text-[11px] text-slate-500">Pipe leaks & pressure issues</p>
                    </div>
                  </div>
                  <a href="tel:944" className="font-extrabold text-sm text-sky-600 dark:text-sky-400 bg-white dark:bg-slate-900 px-3 py-1 rounded-xl shadow-sm">
                    944
                  </a>
                </div>

                <div className="flex items-center justify-between p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-900">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center">
                      <Zap className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">Electric Utility (EEU)</p>
                      <p className="text-[11px] text-slate-500">Blackouts & fallen wires</p>
                    </div>
                  </div>
                  <a href="tel:905" className="font-extrabold text-sm text-amber-600 dark:text-amber-400 bg-white dark:bg-slate-900 px-3 py-1 rounded-xl shadow-sm">
                    905
                  </a>
                </div>
              </div>

              <p className="text-[11px] text-slate-400 text-center leading-normal">
                Municipal toll-free numbers. For live tracking & updates, use our web platform.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Cards Section */}
      <section className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 -mt-6">
        <StatsCards metrics={metrics} />
      </section>

      {/* Interactive Map Preview Section */}
      <section className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2 text-sky-600 dark:text-sky-400 text-xs font-bold uppercase tracking-wider">
              <Activity className="w-4 h-4" />
              <span>Geographic Distribution</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
              Addis Ababa Outage Map
            </h2>
          </div>

          <Link
            href="/map"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-600 dark:text-sky-400 hover:underline"
          >
            Open Full Screen Map <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <OutageMap outages={allActiveForMap as any} subCities={subCities} height="520px" />
      </section>

      {/* Recent Outages Feed */}
      <section className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <div className="flex items-center gap-2 text-rose-600 text-xs font-bold uppercase tracking-wider">
              <Layers className="w-4 h-4" />
              <span>Live Outage Feed</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
              Recent Utility Reports & Statuses
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/outages"
              className="px-4 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
            >
              Browse All ({totalReports} reports)
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {recentOutages.map((outage) => (
            <OutageCard key={outage.id} outage={outage as any} />
          ))}
        </div>
      </section>

      {/* Sub-Cities Status Overview Grid */}
      <section className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8">
        <div className="p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                Sub-Cities Grid Overview
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Active service interruptions across the 11 chartered sub-cities of Addis Ababa
              </p>
            </div>
            <Link
              href="/outages"
              className="text-xs font-semibold text-sky-600 dark:text-sky-400 hover:underline"
            >
              Filter by Sub-City →
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {subCities.map((sc) => {
              const activeCount = sc._count.outages;
              const hasOutages = activeCount > 0;
              return (
                <Link
                  key={sc.id}
                  href={`/outages?subCityId=${sc.id}`}
                  className={`p-3.5 rounded-2xl border transition-all text-center group ${
                    hasOutages
                      ? 'border-amber-200 dark:border-amber-900/60 bg-amber-50/40 dark:bg-amber-950/20 hover:border-amber-400'
                      : 'border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 hover:border-slate-300'
                  }`}
                >
                  <p className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-400 transition truncate">
                    {sc.name}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{sc.amharicName}</p>
                  <div className="mt-2 inline-flex items-center gap-1">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        hasOutages ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'
                      }`}
                    />
                    <span
                      className={`text-[11px] font-semibold ${
                        hasOutages ? 'text-amber-700 dark:text-amber-400' : 'text-emerald-700 dark:text-emerald-400'
                      }`}
                    >
                      {hasOutages ? `${activeCount} active` : 'Normal'}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Bottom Civic Report Call-to-action */}
      <section className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-sky-900 via-slate-900 to-slate-950 text-white p-8 sm:p-12 shadow-xl border border-sky-800/40">
          <div className="relative z-10 max-w-2xl space-y-4">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white/10 text-sky-300 border border-white/15">
              Empowering Citizens
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Notice a pipe burst or electrical outage near you?
            </h2>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Every citizen report helps AAWSA technicians and EEU grid operators identify faults faster, dispatch repair teams, and notify your neighbors.
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <Link
                href="/report"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white shadow-lg transition"
              >
                <PlusCircle className="w-5 h-5" />
                <span>Submit an Outage Report</span>
              </Link>
              <Link
                href="/about"
                className="px-5 py-3.5 rounded-xl font-semibold text-sm bg-white/10 hover:bg-white/20 text-white transition border border-white/10"
              >
                Learn How Verification Works
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
