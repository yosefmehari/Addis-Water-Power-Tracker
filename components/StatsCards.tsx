'use client';

import React from 'react';
import Link from 'next/link';
import { Droplets, Zap, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';

interface StatsProps {
  metrics?: {
    activeWaterOutages: number;
    activePowerOutages: number;
    activeOutages: number;
    restoredOutages: number;
    totalReports?: number;
    pendingReports?: number;
  };
  loading?: boolean;
}

export default function StatsCards({ metrics, loading }: StatsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 rounded-2xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: 'Water Disruptions',
      count: metrics?.activeWaterOutages ?? 0,
      label: 'Active areas',
      icon: Droplets,
      href: '/outages?serviceType=WATER',
      gradient: 'from-sky-500/10 to-blue-500/5',
      border: 'border-sky-200 dark:border-sky-900/50',
      iconBg: 'bg-sky-500 text-white',
      badgeClass: 'text-sky-700 bg-sky-100 dark:bg-sky-950 dark:text-sky-300',
    },
    {
      title: 'Power Outages',
      count: metrics?.activePowerOutages ?? 0,
      label: 'Active grids',
      icon: Zap,
      href: '/outages?serviceType=ELECTRICITY',
      gradient: 'from-amber-500/10 to-orange-500/5',
      border: 'border-amber-200 dark:border-amber-900/50',
      iconBg: 'bg-amber-500 text-white',
      badgeClass: 'text-amber-700 bg-amber-100 dark:bg-amber-950 dark:text-amber-300',
    },
    {
      title: 'Total Active Outages',
      count: metrics?.activeOutages ?? 0,
      label: 'Ongoing repairs',
      icon: AlertCircle,
      href: '/outages?status=ACTIVE_ONLY',
      gradient: 'from-rose-500/10 to-red-500/5',
      border: 'border-rose-200 dark:border-rose-900/50',
      iconBg: 'bg-rose-500 text-white',
      badgeClass: 'text-rose-700 bg-rose-100 dark:bg-rose-950 dark:text-rose-300',
    },
    {
      title: 'Restored Services',
      count: metrics?.restoredOutages ?? 0,
      label: 'Recently restored',
      icon: CheckCircle2,
      href: '/outages?status=RESTORED',
      gradient: 'from-emerald-500/10 to-teal-500/5',
      border: 'border-emerald-200 dark:border-emerald-900/50',
      iconBg: 'bg-emerald-500 text-white',
      badgeClass: 'text-emerald-700 bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Link
            key={card.title}
            href={card.href}
            className={`group relative overflow-hidden rounded-2xl p-5 border bg-white dark:bg-slate-900 ${card.border} bg-gradient-to-br ${card.gradient} hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  {card.title}
                </p>
                <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1.5 tracking-tight">
                  {card.count}
                </h3>
              </div>
              <div className={`w-11 h-11 rounded-xl ${card.iconBg} flex items-center justify-center shadow-md`}>
                <Icon className="w-6 h-6" />
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800/80 text-xs">
              <span className={`px-2 py-0.5 rounded-full font-medium ${card.badgeClass}`}>
                {card.label}
              </span>
              <span className="text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200 font-medium inline-flex items-center gap-0.5 transition">
                View <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-0.5 transition" />
              </span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
