import React from 'react';
import prisma from '@/lib/prisma';
import { Megaphone, Droplets, Zap, Calendar, MapPin, Clock, AlertTriangle, Info } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';

export const revalidate = 0;

export default async function AnnouncementsPage() {
  let announcements: any[] = [];
  try {
    announcements = await prisma.announcement.findMany({
      where: { isActive: true },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' }
      ],
      include: {
        subCity: true,
        author: { select: { name: true } }
      }
    });
  } catch (err: any) {
    console.warn('Initial announcements query timed out or failed, retrying after delay...', err?.message);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      announcements = await prisma.announcement.findMany({
        where: { isActive: true },
        orderBy: [
          { priority: 'desc' },
          { createdAt: 'desc' }
        ],
        include: {
          subCity: true,
          author: { select: { name: true } }
        }
      });
    } catch (retryErr) {
      console.error('Announcements query failed after retry:', retryErr);
      announcements = [];
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 border-red-200';
      case 'HIGH':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-200';
      case 'MEDIUM':
        return 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300 border-sky-200';
      default:
        return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border-slate-200';
    }
  };

  return (
    <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
          <Megaphone className="w-3.5 h-3.5" />
          <span>Official Municipal Bulletins</span>
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
          Utility Announcements & Maintenance
        </h1>
        <p className="text-sm text-slate-500">
          Scheduled preventive maintenance shutdowns, reservoir flushes, and emergency alerts from AAWSA and EEU.
        </p>
      </div>

      {/* Announcements List */}
      <div className="space-y-4">
        {announcements.length === 0 ? (
          <div className="p-12 text-center rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500">
            <Info className="w-8 h-8 mx-auto text-slate-400 mb-2" />
            <p className="font-semibold text-sm">No Active Maintenance Notices</p>
            <p className="text-xs text-slate-400 mt-1">Check back later or report unexpected outages directly.</p>
          </div>
        ) : (
          announcements.map((item) => {
            const isWater = item.serviceType === 'WATER';
            const isPower = item.serviceType === 'ELECTRICITY';

            return (
              <div
                key={item.id}
                className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4 hover:border-slate-300 dark:hover:border-slate-700 transition"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${getPriorityBadge(item.priority)}`}>
                      {item.priority === 'URGENT' || item.priority === 'HIGH' ? (
                        <AlertTriangle className="w-3 h-3" />
                      ) : (
                        <Info className="w-3 h-3" />
                      )}
                      {item.priority} PRIORITY
                    </span>

                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {isWater && <Droplets className="w-3 h-3 text-sky-500" />}
                      {isPower && <Zap className="w-3 h-3 text-amber-500" />}
                      {!isWater && !isPower && 'Water & Power'}
                      {item.serviceType}
                    </span>

                    <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {item.subCity ? `${item.subCity.name} Sub-City` : 'Citywide (All Addis Ababa)'}
                    </span>
                  </div>

                  <span className="text-[11px] text-slate-400">
                    Posted {formatDate(item.createdAt)}
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 mt-2 leading-relaxed whitespace-pre-line">
                    {item.content}
                  </p>
                </div>

                {(item.scheduledStart || item.scheduledEnd) && (
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-4 text-xs text-slate-600 dark:text-slate-300">
                    <div className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-200">
                      <Calendar className="w-4 h-4 text-amber-500" />
                      <span>Scheduled Interruption Window:</span>
                    </div>
                    {item.scheduledStart && (
                      <div>
                        <strong>Start:</strong> {formatDate(item.scheduledStart)}
                      </div>
                    )}
                    {item.scheduledEnd && (
                      <div>
                        <strong>Expected Restoration:</strong> {formatDate(item.scheduledEnd)}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
