'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import AdminSidebar from './AdminSidebar';
import { Shield, Bell, ExternalLink, Menu, X } from 'lucide-react';
import Link from 'next/link';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/admin/login');
      } else if (user.role !== 'ADMIN' && user.role !== 'DISPATCHER') {
        router.push('/');
      } else {
        fetchPendingCount();
      }
    }
  }, [user, loading, router]);

  const fetchPendingCount = async () => {
    try {
      const res = await fetch('/api/admin/stats');
      if (res.ok) {
        const data = await res.json();
        setPendingCount(data.metrics?.pendingReports || 0);
      }
    } catch {
      // ignore
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white space-y-3">
        <div className="w-10 h-10 rounded-full border-4 border-amber-500 border-t-transparent animate-spin" />
        <p className="text-xs font-semibold text-slate-400">Verifying Dispatcher Security Credentials...</p>
      </div>
    );
  }

  if (!user || (user.role !== 'ADMIN' && user.role !== 'DISPATCHER')) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="flex min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <AdminSidebar pendingReportsCount={pendingCount} />
      </div>

      {/* Mobile Drawer */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="relative z-10 w-64 bg-slate-900 shadow-2xl">
            <AdminSidebar pendingReportsCount={pendingCount} />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header */}
        <header className="sticky top-0 z-20 h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 sm:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {mobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                Live Operations Center
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              target="_blank"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <ExternalLink className="w-3.5 h-3.5" /> View Public Site
            </Link>

            <div className="flex items-center gap-2 pl-3 border-l border-slate-200 dark:border-slate-800 text-xs">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-orange-600 text-white flex items-center justify-center font-bold text-xs uppercase shadow-sm">
                {user.name.charAt(0)}
              </div>
              <div className="hidden sm:block text-left">
                <p className="font-bold text-slate-900 dark:text-white truncate max-w-[120px]">{user.name}</p>
                <p className="text-[10px] text-amber-500 font-semibold">{user.role}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Content Body */}
        <main className="p-4 sm:p-8 flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
