'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  Droplets,
  Zap,
  MapPin,
  AlertTriangle,
  Bell,
  User,
  Shield,
  LogOut,
  Menu,
  X,
  CheckCheck,
  Megaphone,
  PlusCircle,
  ChevronDown
} from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const notifRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  // If in admin dashboard routes, suppress public navbar (Admin has its own specialized header)
  const isAdminRoute = pathname?.startsWith('/admin');

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user, pathname]);

  // Click outside to close dropdowns
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setNotifOpen(false);
      }
      if (userRef.current && !userRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
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
    }
  };

  const markAllRead = async () => {
    try {
      await fetch('/api/notifications', { method: 'PUT' });
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch {
      // ignore
    }
  };

  if (isAdminRoute) {
    return null;
  }

  const navLinks = [
    { href: '/', label: 'Overview' },
    { href: '/map', label: 'Outage Map' },
    { href: '/outages', label: 'Outages Feed' },
    { href: '/announcements', label: 'Announcements' },
    { href: '/about', label: 'Civic Help' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 backdrop-blur">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & City Brand */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 via-blue-600 to-amber-500 flex items-center justify-center text-white shadow-md shadow-sky-500/20 group-hover:scale-105 transition-transform">
              <div className="relative flex items-center justify-center">
                <Droplets className="w-5 h-5 text-sky-100" />
                <Zap className="w-3.5 h-3.5 text-amber-300 absolute -top-1 -right-1" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white text-base tracking-tight leading-none">
                <span>Addis</span>
                <span className="text-sky-600 dark:text-sky-400">Water</span>
                <span className="text-slate-400 dark:text-slate-600">&</span>
                <span className="text-amber-500">Power</span>
              </div>
              <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-0.5 tracking-wide uppercase">
                Utility Outage Tracker
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 font-semibold'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Action CTAs & Auth Controls */}
          <div className="flex items-center gap-3">
            {/* Quick Report Button */}
            <Link
              href="/report"
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-semibold bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-sm hover:from-red-700 hover:to-rose-700 transition shadow-rose-600/20"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Report Outage</span>
            </Link>

            {/* Notifications Bell Dropdown */}
            {user && (
              <div className="relative" ref={notifRef}>
                <button
                  onClick={() => setNotifOpen(!notifOpen)}
                  className="relative p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                  aria-label="View notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 flex items-center justify-center min-w-[18px] h-[18px] text-[10px] font-bold text-white bg-rose-500 rounded-full px-1 border-2 border-white dark:border-slate-950">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {notifOpen && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl py-2 z-50">
                    <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-2">
                        <Bell className="w-4 h-4 text-sky-600" />
                        <span className="font-semibold text-sm text-slate-900 dark:text-white">Notifications</span>
                        {unreadCount > 0 && (
                          <span className="text-xs bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300 px-2 py-0.5 rounded-full font-medium">
                            {unreadCount} new
                          </span>
                        )}
                      </div>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllRead}
                          className="text-xs text-sky-600 hover:text-sky-700 dark:text-sky-400 font-medium flex items-center gap-1"
                        >
                          <CheckCheck className="w-3.5 h-3.5" />
                          Mark read
                        </button>
                      )}
                    </div>

                    <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                      {notifications.length === 0 ? (
                        <div className="p-6 text-center text-xs text-slate-400">
                          No notifications yet. You will get alerted when outages occur in your sub-city.
                        </div>
                      ) : (
                        notifications.slice(0, 6).map((notif) => (
                          <Link
                            key={notif.id}
                            href={notif.linkUrl || '/notifications'}
                            onClick={() => setNotifOpen(false)}
                            className={`block p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition ${
                              !notif.isRead ? 'bg-sky-50/50 dark:bg-sky-950/20' : ''
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <p className={`text-xs font-semibold ${!notif.isRead ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}>
                                {notif.title}
                              </p>
                              {!notif.isRead && (
                                <span className="w-2 h-2 rounded-full bg-sky-500 shrink-0 mt-1" />
                              )}
                            </div>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                              {notif.message}
                            </p>
                          </Link>
                        ))
                      )}
                    </div>

                    <div className="px-4 py-2 border-t border-slate-100 dark:border-slate-800 text-center">
                      <Link
                        href="/notifications"
                        onClick={() => setNotifOpen(false)}
                        className="text-xs font-medium text-sky-600 hover:text-sky-700 dark:text-sky-400"
                      >
                        View all notifications →
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* User Account Controls */}
            {user ? (
              <div className="relative" ref={userRef}>
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 pl-2.5 rounded-full border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition"
                >
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 max-w-[100px] truncate">
                    {user.name.split(' ')[0]}
                  </span>
                  <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-sky-500 to-indigo-600 text-white flex items-center justify-center text-xs font-bold uppercase shadow-sm">
                    {user.name.charAt(0)}
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-2 z-50">
                    <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{user.name}</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
                      {user.subCity && (
                        <p className="text-[10px] text-sky-600 dark:text-sky-400 font-medium mt-0.5 flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> {user.subCity.name} Sub-City
                        </p>
                      )}
                    </div>

                    <div className="py-1">
                      <Link
                        href="/profile"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        <User className="w-4 h-4 text-slate-400" />
                        Profile & Settings
                      </Link>

                      {(user.role === 'ADMIN' || user.role === 'DISPATCHER') && (
                        <Link
                          href="/admin"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40"
                        >
                          <Shield className="w-4 h-4" />
                          Admin Console
                        </Link>
                      )}

                      <Link
                        href="/notifications"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        <Bell className="w-4 h-4 text-slate-400" />
                        Notifications
                      </Link>
                    </div>

                    <div className="pt-1 border-t border-slate-100 dark:border-slate-800">
                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          logout();
                        }}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-3.5 py-1.5 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  Log In
                </Link>
                <Link
                  href="/register"
                  className="px-3.5 py-1.5 rounded-lg text-sm font-semibold bg-sky-600 text-white hover:bg-sky-700 transition shadow-sm shadow-sky-600/20"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile menu hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 md:hidden rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-slate-100 dark:border-slate-800 space-y-1">
            <Link
              href="/report"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 w-full py-2.5 mb-2 rounded-xl text-sm font-semibold bg-red-600 text-white shadow-md shadow-red-500/20"
            >
              <PlusCircle className="w-4 h-4" />
              Report Outage Now
            </Link>

            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-lg text-base font-medium ${
                  pathname === link.href
                    ? 'bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300'
                    : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {link.label}
              </Link>
            ))}

            {(user?.role === 'ADMIN' || user?.role === 'DISPATCHER') && (
              <Link
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40"
              >
                Admin Console
              </Link>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
