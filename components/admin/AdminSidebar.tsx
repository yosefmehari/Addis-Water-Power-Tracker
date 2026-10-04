'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  LayoutDashboard,
  AlertTriangle,
  FileCheck2,
  Users,
  MapPin,
  Megaphone,
  BarChart3,
  Settings,
  ExternalLink,
  LogOut,
  Droplets,
  Zap,
  Shield
} from 'lucide-react';

interface SidebarProps {
  pendingReportsCount?: number;
}

export default function AdminSidebar({ pendingReportsCount = 0 }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const links = [
    { href: '/admin', label: 'Overview', icon: LayoutDashboard },
    { href: '/admin/outages', label: 'Manage Outages', icon: AlertTriangle },
    {
      href: '/admin/reports',
      label: 'Citizen Reports',
      icon: FileCheck2,
      badge: pendingReportsCount > 0 ? pendingReportsCount : null,
    },
    { href: '/admin/users', label: 'User Directory', icon: Users },
    { href: '/admin/locations', label: 'Addis Locations', icon: MapPin },
    { href: '/admin/announcements', label: 'Announcements', icon: Megaphone },
    { href: '/admin/analytics', label: 'Analytics & KPIs', icon: BarChart3 },
    { href: '/admin/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col h-screen sticky top-0 border-r border-slate-800 z-30 shrink-0">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800 flex items-center justify-between">
        <Link href="/admin" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 via-blue-600 to-amber-500 flex items-center justify-center text-white shadow-md">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="font-extrabold text-sm text-white tracking-tight flex items-center gap-1.5">
              <span>Addis Dispatch</span>
            </div>
            <span className="text-[10px] font-semibold text-amber-400 uppercase tracking-wider">
              Control Panel
            </span>
          </div>
        </Link>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-sky-600 text-white shadow-md shadow-sky-600/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{link.label}</span>
              </div>
              {link.badge !== null && link.badge !== undefined && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-slate-950">
                  {link.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Profile & Exit Portal */}
      <div className="p-3 border-t border-slate-800 space-y-2">
        <Link
          href="/"
          className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800/60 transition"
        >
          <span className="flex items-center gap-2">
            <ExternalLink className="w-4 h-4" /> Public Website
          </span>
          <span className="text-[10px] text-slate-500">Live</span>
        </Link>

        {user && (
          <div className="p-3 rounded-2xl bg-slate-800/40 border border-slate-800 flex items-center justify-between">
            <div className="truncate pr-2">
              <p className="text-xs font-bold text-white truncate">{user.name}</p>
              <p className="text-[10px] text-amber-400 font-semibold">{user.role}</p>
            </div>
            <button
              onClick={() => logout()}
              title="Sign Out"
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
