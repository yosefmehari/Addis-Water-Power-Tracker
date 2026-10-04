'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Droplets, Zap, Phone, ShieldCheck, Heart, ExternalLink } from 'lucide-react';

export default function Footer() {
  const pathname = usePathname();
  if (pathname?.startsWith('/admin')) {
    return null;
  }

  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-400 text-sm mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand info */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-sky-600 to-amber-500 flex items-center justify-center text-white">
                <Droplets className="w-4 h-4" />
              </div>
              <span className="font-bold text-slate-900 dark:text-white text-base">
                Addis Water & Power
              </span>
            </div>
            <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
              Community-driven civic utility monitor for Addis Ababa residents, municipal dispatchers, and utility engineers.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Real-time citizen reporting & verification</span>
            </div>
          </div>

          {/* Emergency Utility Hotlines */}
          <div>
            <h3 className="font-semibold text-xs tracking-wider uppercase text-slate-900 dark:text-white mb-3">
              Addis Utility Hotlines
            </h3>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center justify-between p-2 rounded-lg bg-sky-50 dark:bg-sky-950/40 border border-sky-100 dark:border-sky-900">
                <div className="flex items-center gap-2 text-sky-900 dark:text-sky-300 font-medium">
                  <Droplets className="w-3.5 h-3.5 text-sky-600" />
                  <span>AAWSA (Water)</span>
                </div>
                <a href="tel:944" className="font-bold text-sky-700 dark:text-sky-400 flex items-center gap-1">
                  <Phone className="w-3 h-3" /> 944
                </a>
              </li>

              <li className="flex items-center justify-between p-2 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-900">
                <div className="flex items-center gap-2 text-amber-900 dark:text-amber-300 font-medium">
                  <Zap className="w-3.5 h-3.5 text-amber-600" />
                  <span>EEU (Electricity)</span>
                </div>
                <a href="tel:905" className="font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1">
                  <Phone className="w-3 h-3" /> 905
                </a>
              </li>

              <li className="text-[11px] text-slate-400 pt-1">
                Toll-free 24/7 emergency dispatch centers
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-xs tracking-wider uppercase text-slate-900 dark:text-white mb-3">
              Platform
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/map" className="hover:text-sky-600 dark:hover:text-sky-400 transition">
                  Interactive Outage Map
                </Link>
              </li>
              <li>
                <Link href="/outages" className="hover:text-sky-600 dark:hover:text-sky-400 transition">
                  Live Outages Directory
                </Link>
              </li>
              <li>
                <Link href="/report" className="hover:text-sky-600 dark:hover:text-sky-400 transition">
                  Report Water or Power Outage
                </Link>
              </li>
              <li>
                <Link href="/announcements" className="hover:text-sky-600 dark:hover:text-sky-400 transition">
                  Scheduled Maintenance Notices
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-sky-600 dark:hover:text-sky-400 transition">
                  About Civic Technology Initiative
                </Link>
              </li>
            </ul>
          </div>

          {/* 11 Sub-Cities */}
          <div>
            <h3 className="font-semibold text-xs tracking-wider uppercase text-slate-900 dark:text-white mb-3">
              Covered Sub-Cities
            </h3>
            <div className="grid grid-cols-2 gap-1 text-[11px] text-slate-500">
              <span>• Bole (ቦሌ)</span>
              <span>• Yeka (የካ)</span>
              <span>• Kirkos (ቂርቆስ)</span>
              <span>• Arada (አራዳ)</span>
              <span>• Lideta (ልደታ)</span>
              <span>• Addis Ketema</span>
              <span>• Nifas Silk</span>
              <span>• Kolfe Keranio</span>
              <span>• Gullele (ጉለሌ)</span>
              <span>• Akaky Kaliti</span>
              <span>• Lemi Kura</span>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
          <p>© {new Date().getFullYear()} Addis Water & Power Tracker. Open civic public utility tool.</p>
          <div className="flex items-center gap-4">
            <Link href="/about" className="hover:underline">Privacy & Terms</Link>
            <Link href="/admin/login" className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
              Dispatcher / Staff Portal
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
