import React from 'react';
import prisma from '@/lib/prisma';
import OutageMap from '@/components/OutageMap';
import Link from 'next/link';
import { MapPin, Droplets, Zap, PlusCircle, ArrowRight } from 'lucide-react';
import { formatTimeAgo, getStatusBadge } from '@/lib/utils';

export const revalidate = 0;

export default async function MapPage() {
  const fetchMapData = async () => {
    return await Promise.all([
      prisma.outage.findMany({
        orderBy: [{ status: 'asc' }, { startedAt: 'desc' }],
        include: {
          subCity: true,
          woreda: true,
          area: true,
        }
      }),
      prisma.subCity.findMany({
        orderBy: { name: 'asc' },
      })
    ]);
  };

  let outages: any[] = [];
  let subCities: any[] = [];

  try {
    const res = await fetchMapData();
    outages = res[0];
    subCities = res[1];
  } catch (err: any) {
    console.warn('Initial map data query timed out or failed, retrying after delay...', err?.message);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      const res = await fetchMapData();
      outages = res[0];
      subCities = res[1];
    } catch (retryErr) {
      console.error('Map data query failed after retry:', retryErr);
      outages = [];
      subCities = [];
    }
  }

  const activeOutages = outages.filter(o => ['ACTIVE', 'INVESTIGATING', 'VERIFIED'].includes(o.status));

  return (
    <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sky-600 dark:text-sky-400 text-xs font-bold uppercase tracking-wider">
            <MapPin className="w-4 h-4" />
            <span>Interactive Geographic Tracking</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
            Addis Ababa Outage Map
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Live geospatial distribution of water pipeline leaks, pressure disruptions, and electricity grid outages.
          </p>
        </div>

        <Link
          href="/report"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-600/20 transition self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Report Outage in Your Area</span>
        </Link>
      </div>

      {/* Main Map */}
      <div className="w-full">
        <OutageMap outages={outages as any} subCities={subCities} height="620px" showFilters={true} />
      </div>

      {/* Outage Index List alongside Map */}
      <div className="pt-4 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Active Incidents on Map ({activeOutages.length})
          </h2>
          <Link href="/outages" className="text-xs font-semibold text-sky-600 dark:text-sky-400 hover:underline">
            View full table →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {activeOutages.map((outage) => {
            const statusInfo = getStatusBadge(outage.status);
            const isWater = outage.serviceType === 'WATER';
            return (
              <div
                key={outage.id}
                className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      isWater ? 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300' : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                    }`}>
                      {isWater ? <Droplets className="w-3 h-3" /> : <Zap className="w-3 h-3" />}
                      {outage.serviceType}
                    </span>

                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${statusInfo.bg}`}>
                      {statusInfo.label}
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-1">
                    {outage.title}
                  </h3>

                  <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                    <span className="font-medium text-slate-700 dark:text-slate-300">{outage.subCity.name}</span>
                    {outage.specificLocation && <span className="truncate">({outage.specificLocation})</span>}
                  </p>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-400">
                    {formatTimeAgo(outage.startedAt)} • {outage.affectedReportsCount} reports
                  </span>
                  <Link
                    href={`/outages/${outage.id}`}
                    className="text-xs font-semibold text-sky-600 hover:text-sky-700 flex items-center gap-0.5"
                  >
                    View <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
