'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ToastProvider';
import {
  Bell,
  CheckCheck,
  Droplets,
  Zap,
  Megaphone,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Inbox
} from 'lucide-react';
import { formatTimeAgo } from '@/lib/utils';

export default function NotificationsPage() {
  const { user } = useAuth();
  const { success, error } = useToast();

  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications');
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const markAllRead = async () => {
    try {
      const res = await fetch('/api/notifications', { method: 'PUT' });
      if (res.ok) {
        setUnreadCount(0);
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        success('All notifications marked as read');
      }
    } catch {
      error('Failed to update notifications');
    }
  };

  const markSingleRead = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}/read`, { method: 'PUT' });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch {
      // ignore
    }
  };

  const getIconForType = (type: string) => {
    switch (type) {
      case 'SERVICE_RESTORED':
        return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
      case 'OUTAGE_VERIFIED':
        return <ShieldCheck className="w-5 h-5 text-blue-500" />;
      case 'ANNOUNCEMENT':
        return <Megaphone className="w-5 h-5 text-amber-500" />;
      case 'OUTAGE_NEARBY':
        return <Droplets className="w-5 h-5 text-sky-500" />;
      default:
        return <Bell className="w-5 h-5 text-slate-500" />;
    }
  };

  if (!user && !loading) {
    return (
      <div className="max-w-md mx-auto w-full px-4 py-20 text-center space-y-4">
        <Bell className="w-12 h-12 text-slate-400 mx-auto" />
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Sign In for Notifications</h2>
        <p className="text-xs text-slate-500">
          Log in or register your account to receive alerts when water or electricity disruptions affect your sub-city.
        </p>
        <Link
          href="/login"
          className="inline-block px-5 py-2.5 rounded-xl bg-sky-600 text-white font-semibold text-xs mt-2"
        >
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sky-600 dark:text-sky-400 text-xs font-bold uppercase tracking-wider">
            <Bell className="w-4 h-4" />
            <span>Civic Alerts Center</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
            Notifications & Updates
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Stay notified about incidents in your sub-city, verified reports, and utility restorations.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition self-start sm:self-auto"
          >
            <CheckCheck className="w-4 h-4 text-sky-600" />
            <span>Mark All as Read</span>
          </button>
        )}
      </div>

      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-16 text-center text-slate-500 space-y-2">
            <Inbox className="w-10 h-10 mx-auto text-slate-300" />
            <h3 className="font-bold text-sm text-slate-700 dark:text-slate-300">No Notifications</h3>
            <p className="text-xs text-slate-400">You will receive notifications when outages occur in your registered sub-city.</p>
          </div>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif.id}
              className={`p-5 flex items-start gap-4 transition hover:bg-slate-50/60 dark:hover:bg-slate-800/40 ${
                !notif.isRead ? 'bg-sky-50/40 dark:bg-sky-950/20' : ''
              }`}
            >
              <div className="p-2.5 rounded-2xl bg-white dark:bg-slate-800 shadow-sm shrink-0 border border-slate-100 dark:border-slate-700">
                {getIconForType(notif.type)}
              </div>

              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <h4 className={`text-sm ${!notif.isRead ? 'font-bold text-slate-900 dark:text-white' : 'font-semibold text-slate-700 dark:text-slate-300'}`}>
                    {notif.title}
                  </h4>
                  <span className="text-[11px] text-slate-400 shrink-0">
                    {formatTimeAgo(notif.createdAt)}
                  </span>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {notif.message}
                </p>

                <div className="flex items-center gap-3 pt-1 text-xs">
                  {notif.linkUrl && (
                    <Link
                      href={notif.linkUrl}
                      onClick={() => !notif.isRead && markSingleRead(notif.id)}
                      className="font-semibold text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1"
                    >
                      View Incident <ArrowRight className="w-3 h-3" />
                    </Link>
                  )}

                  {!notif.isRead && (
                    <button
                      onClick={() => markSingleRead(notif.id)}
                      className="text-[11px] text-slate-400 hover:text-slate-600 underline"
                    >
                      Mark read
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
