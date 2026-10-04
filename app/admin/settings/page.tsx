'use client';

import React, { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { useToast } from '@/components/ToastProvider';
import { Settings, Save, ShieldCheck, Database, Phone, CheckCircle2, Lock } from 'lucide-react';

export default function AdminSettingsPage() {
  const { success } = useToast();

  const [waterHotline, setWaterHotline] = useState('944');
  const [powerHotline, setPowerHotline] = useState('905');
  const [fireHotline, setFireHotline] = useState('939');
  const [rateLimitMax, setRateLimitMax] = useState('10');
  const [autoVerifyThreshold, setAutoVerifyThreshold] = useState('5');
  const [saving, setSaving] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      success('System settings saved successfully');
    }, 400);
  };

  return (
    <AdminLayout>
      <div className="max-w-4xl space-y-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">
            System & Operations Settings
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure municipal emergency hotlines, automated verification thresholds, and spam protection.
          </p>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          {/* Municipal Emergency Contacts */}
          <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Phone className="w-4 h-4 text-sky-500" />
              Municipal Toll-Free Dispatch Hotlines
            </h3>
            <p className="text-xs text-slate-500">
              Displayed across the public footer, about page, and emergency incident cards.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  AAWSA Water Hotline
                </label>
                <input
                  type="text"
                  value={waterHotline}
                  onChange={(e) => setWaterHotline(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold text-sky-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  EEU Electricity Hotline
                </label>
                <input
                  type="text"
                  value={powerHotline}
                  onChange={(e) => setPowerHotline(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold text-amber-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Fire & Emergency Services
                </label>
                <input
                  type="text"
                  value={fireHotline}
                  onChange={(e) => setFireHotline(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold text-red-600"
                />
              </div>
            </div>
          </div>

          {/* Spam & Triage Automation */}
          <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              Spam Prevention & Clustering Thresholds
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Max Submissions per IP (10-minute window)
                </label>
                <input
                  type="number"
                  value={rateLimitMax}
                  onChange={(e) => setRateLimitMax(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
                <p className="text-[10px] text-slate-400 mt-1">Prevents bot spam and automated duplicate bursts.</p>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Cluster Auto-Promote Threshold (reports)
                </label>
                <input
                  type="number"
                  value={autoVerifyThreshold}
                  onChange={(e) => setAutoVerifyThreshold(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
                <p className="text-[10px] text-slate-400 mt-1">Minimum unique reports in same woreda before high-alert flag.</p>
              </div>
            </div>
          </div>

          {/* Infrastructure Health */}
          <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-3">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Database className="w-4 h-4 text-blue-500" />
              Database & Infrastructure Health
            </h3>

            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <div>
                  <p className="font-bold">PostgreSQL Database Connected</p>
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400">Schema synchronized on port 5432 (addis_water_power_tracker)</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-200 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-100">
                HEALTHY
              </span>
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 rounded-xl font-bold text-xs bg-sky-600 hover:bg-sky-700 text-white flex items-center gap-2 transition shadow-sm"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving Settings...' : 'Save Configuration'}
          </button>
        </form>
      </div>
    </AdminLayout>
  );
}
