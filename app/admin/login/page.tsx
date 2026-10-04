'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ToastProvider';
import { Shield, Lock, Mail, ArrowRight, ArrowLeft, KeyRound, AlertTriangle } from 'lucide-react';

export default function AdminLoginPage() {
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
      if (res.user?.role === 'ADMIN' || res.user?.role === 'DISPATCHER') {
        success('Welcome to Addis Dispatch Control Panel');
        router.push('/admin');
      } else {
        error('Access denied. Administrator or Dispatcher privileges required.');
      }
    } else {
      error(res.error || 'Authentication failed');
    }
  };

  const handleDemoFill = async (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('AdminPassword123!');
    setLoading(true);
    const res = await login(demoEmail, 'AdminPassword123!');
    setLoading(false);
    if (res.success && (res.user?.role === 'ADMIN' || res.user?.role === 'DISPATCHER')) {
      success('Logged in as Dispatcher Staff');
      router.push('/admin');
    } else {
      error(res.error || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 py-12 text-slate-100">
      <div className="max-w-md w-full space-y-6">
        {/* Brand */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center text-slate-950 mx-auto shadow-xl shadow-amber-500/10">
            <Shield className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Municipal Dispatch Portal
          </h1>
          <p className="text-xs text-slate-400">
            Authorized utility officers, AAWSA & EEU dispatch personnel only
          </p>
        </div>

        {/* Demo Fast Buttons */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-amber-400 flex items-center gap-1.5">
              <KeyRound className="w-4 h-4" /> 1-Click Dispatch Credentials
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => handleDemoFill('admin@addistracker.et')}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold transition flex items-center justify-center gap-1 border border-slate-700"
            >
              👑 Chief Dispatcher
            </button>
            <button
              type="button"
              onClick={() => handleDemoFill('dispatcher@addistracker.et')}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold transition flex items-center justify-center gap-1 border border-slate-700"
            >
              🛠️ Field Dispatcher
            </button>
          </div>
        </div>

        {/* Form Card */}
        <div className="p-6 sm:p-8 rounded-3xl border border-slate-800 bg-slate-900/90 shadow-2xl space-y-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Official Staff Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  placeholder="admin@addistracker.et"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-white text-xs focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-white text-xs focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-bold text-xs bg-amber-500 hover:bg-amber-400 text-slate-950 transition shadow-lg shadow-amber-500/20 disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
              {loading ? 'Authenticating...' : 'Enter Dispatch Console'} <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="pt-4 border-t border-slate-800 text-center">
            <Link
              href="/"
              className="text-xs font-semibold text-slate-400 hover:text-white flex items-center justify-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Return to Public Portal
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
