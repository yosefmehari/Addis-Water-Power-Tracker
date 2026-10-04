'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useToast } from '@/components/ToastProvider';
import { Mail, ArrowRight, ArrowLeft, KeyRound, CheckCircle2 } from 'lucide-react';

export default function ForgotPasswordPage() {
  const { success, error } = useToast();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatedToken, setGeneratedToken] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        success('Password reset instructions generated.');
        setGeneratedToken(data.resetToken || data.demoResetToken || 'DEMO-TOKEN');
      } else {
        error(data.error || 'Failed to process request');
      }
    } catch {
      error('Network error during forgot password request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 flex items-center justify-center mx-auto shadow-md">
            <KeyRound className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Reset Your Password
          </h1>
          <p className="text-xs text-slate-500">
            Enter your registered email address and we'll generate password recovery instructions.
          </p>
        </div>

        <div className="p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl space-y-5">
          {generatedToken ? (
            <div className="space-y-4 text-center">
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs">
                <CheckCircle2 className="w-6 h-6 mx-auto mb-2 text-emerald-600" />
                <p className="font-bold">Reset Token Ready</p>
                <p className="mt-1 text-[11px]">For development testing, click below to proceed directly to reset password:</p>
                <div className="font-mono bg-white dark:bg-slate-900 px-3 py-1.5 rounded-lg border border-emerald-300 dark:border-emerald-700 text-slate-900 dark:text-white my-2 select-all text-xs">
                  {generatedToken}
                </div>
              </div>

              <Link
                href={`/reset-password?token=${generatedToken}`}
                className="w-full py-3 rounded-xl font-bold text-xs bg-sky-600 hover:bg-sky-700 text-white transition shadow-sm flex items-center justify-center gap-1.5"
              >
                Set New Password <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
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

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl font-bold text-xs bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:bg-sky-600 dark:hover:bg-sky-400 hover:text-white transition shadow-sm disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                {loading ? 'Submitting...' : 'Send Reset Link'} <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
            <Link
              href="/login"
              className="text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Log In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
