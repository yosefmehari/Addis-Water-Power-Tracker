'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ToastProvider';
import { Droplets, Zap, Lock, Mail, ArrowRight, ShieldCheck, UserCheck } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const { success, error } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const res = await login(email, password);
    setLoading(false);

    if (res.success) {
      success('Logged in successfully!');
      if (res.user?.role === 'ADMIN' || res.user?.role === 'DISPATCHER') {
        router.push('/admin');
      } else {
        router.push('/');
      }
    } else {
      error(res.error || 'Login failed');
    }
  };

  const handleDemoFill = async (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setLoading(true);
    const res = await login(demoEmail, demoPass);
    setLoading(false);
    if (res.success) {
      success(`Logged in as ${res.user?.role}!`);
      if (res.user?.role === 'ADMIN' || res.user?.role === 'DISPATCHER') {
        router.push('/admin');
      } else {
        router.push('/');
      }
    } else {
      error(res.error || 'Login failed');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-600 via-blue-600 to-amber-500 flex items-center justify-center text-white mx-auto shadow-md">
            <Droplets className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Welcome Back to Addis Tracker
          </h1>
          <p className="text-xs text-slate-500">
            Sign in to track utility outages in your sub-city and manage reports
          </p>
        </div>

        {/* Demo Accounts Quick-Login Strip */}
        <div className="p-4 rounded-2xl bg-sky-50/70 dark:bg-sky-950/40 border border-sky-100 dark:border-sky-900 space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-sky-900 dark:text-sky-300 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-sky-600" /> 1-Click Demo Accounts
            </span>
            <span className="text-[10px] text-sky-600 font-medium">Click to test instantly</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => handleDemoFill('admin@addistracker.et', 'AdminPassword123!')}
              className="px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-sky-200 dark:border-sky-800 text-sky-900 dark:text-sky-200 font-bold hover:bg-sky-100 dark:hover:bg-sky-900 transition flex items-center justify-center gap-1 shadow-xs"
            >
              👑 Admin Dispatcher
            </button>

            <button
              type="button"
              onClick={() => handleDemoFill('yosef@example.com', 'UserPassword123!')}
              className="px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-sky-200 dark:border-sky-800 text-slate-900 dark:text-slate-200 font-bold hover:bg-sky-100 dark:hover:bg-sky-900 transition flex items-center justify-center gap-1 shadow-xs"
            >
              👤 Resident User
            </button>
          </div>
        </div>

        {/* Form Card */}
        <div className="p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl space-y-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:ring-2 focus:ring-sky-500 outline-none"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-[11px] text-sky-600 hover:text-sky-700 font-medium"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:ring-2 focus:ring-sky-500 outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-bold text-xs bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:bg-sky-600 dark:hover:bg-sky-400 hover:text-white transition shadow-sm disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
              {loading ? 'Signing in...' : 'Sign In'} <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-center text-xs text-slate-500">
            Don't have an account yet?{' '}
            <Link href="/register" className="font-bold text-sky-600 dark:text-sky-400 hover:underline">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
