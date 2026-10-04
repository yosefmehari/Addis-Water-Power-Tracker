'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Droplets, Zap, MapPin, Clock, Users, CheckCircle, ArrowRight, AlertTriangle } from 'lucide-react';
import { getStatusBadge, getServiceDetails, formatTimeAgo } from '@/lib/utils';
import { useToast } from '@/components/ToastProvider';

interface OutageCardProps {
  outage: {
    id: string;
    title: string;
    serviceType: string;
    problemType: string;
    status: string;
    severity?: string;
    description: string;
    specificLocation?: string | null;
    startedAt: string | Date;
    estimatedRestoration?: string | Date | null;
    restoredAt?: string | Date | null;
    affectedReportsCount: number;
    restoredVotesCount?: number;
    subCity: { name: string };
    woreda?: { name: string } | null;
    area?: { name: string } | null;
    _count?: {
      reports?: number;
      confirmations?: number;
      updates?: number;
    };
  };
  onConfirmed?: () => void;
}

export default function OutageCard({ outage, onConfirmed }: OutageCardProps) {
  const { success, error } = useToast();
  const [confirming, setConfirming] = useState(false);
  const [affectedCount, setAffectedCount] = useState(outage.affectedReportsCount);

  const statusInfo = getStatusBadge(outage.status);
  const serviceInfo = getServiceDetails(outage.serviceType);

  const handleQuickConfirm = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setConfirming(true);
    try {
      const res = await fetch(`/api/outages/${outage.id}/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ comment: 'Confirmed from outage feed' }),
      });
      const data = await res.json();
      if (res.ok) {
        success('Your confirmation was recorded!');
        setAffectedCount(data.affectedCount || (affectedCount + 1));
        if (onConfirmed) onConfirmed();
      } else {
        error(data.error || 'Failed to record confirmation');
      }
    } catch {
      error('Network error confirming outage');
    } finally {
      setConfirming(false);
    }
  };

  return (
    <div className="group relative rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm hover:shadow-md transition-all duration-200 hover:border-slate-300 dark:hover:border-slate-700 flex flex-col justify-between">
      <div>
        {/* Top Badges */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${serviceInfo.badgeClass}`}>
              {outage.serviceType === 'WATER' ? (
                <Droplets className="w-3.5 h-3.5" />
              ) : (
                <Zap className="w-3.5 h-3.5" />
              )}
              {serviceInfo.shortName}
            </span>

            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md truncate max-w-[130px]">
              {outage.problemType}
            </span>
          </div>

          <div className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusInfo.bg}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dot}`} />
            {statusInfo.label}
          </div>
        </div>

        {/* Title */}
        <Link href={`/outages/${outage.id}`}>
          <h3 className="font-bold text-slate-900 dark:text-white text-base group-hover:text-sky-600 dark:group-hover:text-sky-400 transition line-clamp-2">
            {outage.title}
          </h3>
        </Link>

        {/* Location info */}
        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-2">
          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="font-semibold text-slate-700 dark:text-slate-300">
            {outage.subCity?.name} Sub-City
          </span>
          {outage.woreda && <span>• {outage.woreda.name}</span>}
          {outage.specificLocation && (
            <span className="truncate text-slate-400">({outage.specificLocation})</span>
          )}
        </div>

        {/* Description snippet */}
        <p className="text-xs text-slate-600 dark:text-slate-300 mt-2.5 line-clamp-2 leading-relaxed">
          {outage.description}
        </p>
      </div>

      {/* Footer Info & Actions */}
      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3 text-slate-500">
          <span className="flex items-center gap-1" title="Reported start time">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            {formatTimeAgo(outage.startedAt)}
          </span>

          <span className="flex items-center gap-1 font-medium text-slate-600 dark:text-slate-400" title="Confirmed reports">
            <Users className="w-3.5 h-3.5 text-slate-400" />
            {affectedCount} affected
          </span>
        </div>

        <div className="flex items-center gap-2">
          {outage.status !== 'RESTORED' && (
            <button
              onClick={handleQuickConfirm}
              disabled={confirming}
              className="px-2.5 py-1 text-[11px] font-medium rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title="Click if you are also experiencing this outage"
            >
              {confirming ? '...' : '+ Affected'}
            </button>
          )}

          <Link
            href={`/outages/${outage.id}`}
            className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:bg-sky-600 dark:hover:bg-sky-400 hover:text-white dark:hover:text-slate-950 transition"
          >
            Details <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}
