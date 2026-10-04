'use client';

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { useToast } from '@/components/ToastProvider';
import {
  FileCheck2,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Trash2,
  Droplets,
  Zap,
  MapPin,
  Clock,
  User,
  AlertTriangle,
  ExternalLink,
  X
} from 'lucide-react';
import { formatTimeAgo, formatDate } from '@/lib/utils';
import Link from 'next/link';

export default function AdminReportsPage() {
  const { success, error } = useToast();

  const [reports, setReports] = useState<any[]>([]);
  const [subCities, setSubCities] = useState<any[]>([]);
  const [activeOutages, setActiveOutages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('ALL');
  const [serviceType, setServiceType] = useState('ALL');
  const [subCityId, setSubCityId] = useState('ALL');

  // Verify Modal
  const [verifyingReport, setVerifyingReport] = useState<any>(null);
  const [verifyMode, setVerifyMode] = useState<'NEW_OUTAGE' | 'LINK_EXISTING'>('NEW_OUTAGE');
  const [selectedExistingOutageId, setSelectedExistingOutageId] = useState('');
  const [verifySeverity, setVerifySeverity] = useState('MEDIUM');
  const [submittingVerify, setSubmittingVerify] = useState(false);

  // Reject Modal
  const [rejectingReport, setRejectingReport] = useState<any>(null);
  const [rejectionReason, setRejectionReason] = useState('Could not be confirmed by field telemetry or is duplicate.');
  const [submittingReject, setSubmittingReject] = useState(false);

  useEffect(() => {
    fetchSubCities();
    fetchActiveOutages();
    fetchReports();
  }, [status, serviceType, subCityId]);

  const fetchSubCities = async () => {
    try {
      const res = await fetch('/api/sub-cities');
      if (res.ok) {
        const data = await res.json();
        setSubCities(data.subCities || []);
      }
    } catch {
      // ignore
    }
  };

  const fetchActiveOutages = async () => {
    try {
      const res = await fetch('/api/outages?status=ACTIVE_ONLY');
      if (res.ok) {
        const data = await res.json();
        setActiveOutages(data.outages || []);
      }
    } catch {
      // ignore
    }
  };

  const fetchReports = async (querySearch?: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      const s = querySearch !== undefined ? querySearch : search;
      if (s) params.set('search', s);
      if (status !== 'ALL') params.set('status', status);
      if (serviceType !== 'ALL') params.set('serviceType', serviceType);
      if (subCityId !== 'ALL') params.set('subCityId', subCityId);

      const res = await fetch(`/api/reports?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setReports(data.reports || []);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifyingReport) return;

    setSubmittingVerify(true);
    try {
      const res = await fetch(`/api/reports/${verifyingReport.id}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          promoteToOutage: verifyMode === 'NEW_OUTAGE',
          existingOutageId: verifyMode === 'LINK_EXISTING' ? selectedExistingOutageId : null,
          severity: verifySeverity,
        })
      });

      if (res.ok) {
        success('Citizen report verified successfully');
        setVerifyingReport(null);
        fetchReports();
      } else {
        const data = await res.json();
        error(data.error || 'Failed to verify report');
      }
    } catch {
      error('Network error during report verification');
    } finally {
      setSubmittingVerify(false);
    }
  };

  const handleConfirmReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingReport) return;

    setSubmittingReject(true);
    try {
      const res = await fetch(`/api/reports/${rejectingReport.id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: rejectionReason }),
      });

      if (res.ok) {
        success('Report rejected');
        setRejectingReport(null);
        fetchReports();
      } else {
        error('Failed to reject report');
      }
    } catch {
      error('Network error during rejection');
    } finally {
      setSubmittingReject(false);
    }
  };

  const handleDeleteReport = async (id: string) => {
    if (!confirm('Permanently delete this report?')) return;
    try {
      const res = await fetch(`/api/reports/${id}`, { method: 'DELETE' });
      if (res.ok) {
        success('Report deleted');
        setReports((prev) => prev.filter((r) => r.id !== id));
      } else {
        error('Failed to delete report');
      }
    } catch {
      error('Network error deleting report');
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">
            Manage Citizen Reports
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Review incoming public reports, filter spam, verify and link to outages.
          </p>
        </div>

        {/* Filter Bar */}
        <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search reporter, location, description..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchReports()}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:ring-2 focus:ring-sky-500 outline-none"
              />
            </div>

            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium"
            >
              <option value="ALL">All Statuses</option>
              <option value="PENDING">PENDING</option>
              <option value="VERIFIED">VERIFIED</option>
              <option value="REJECTED">REJECTED</option>
            </select>

            <select
              value={serviceType}
              onChange={(e) => setServiceType(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium"
            >
              <option value="ALL">All Services</option>
              <option value="WATER">Water</option>
              <option value="ELECTRICITY">Electricity</option>
            </select>

            <select
              value={subCityId}
              onChange={(e) => setSubCityId(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium"
            >
              <option value="ALL">All Sub-Cities</option>
              {subCities.map((sc) => (
                <option key={sc.id} value={sc.id}>
                  {sc.name}
                </option>
              ))}
            </select>

            <button
              onClick={() => fetchReports()}
              className="px-3.5 py-2 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs font-semibold hover:bg-sky-600"
            >
              Filter
            </button>
          </div>
        </div>

        {/* Reports Table */}
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3.5 px-4">Service & Problem</th>
                  <th className="py-3.5 px-4">Location</th>
                  <th className="py-3.5 px-4">Reporter</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Reported</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      Loading reports queue...
                    </td>
                  </tr>
                ) : reports.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      No citizen reports found matching criteria.
                    </td>
                  </tr>
                ) : (
                  reports.map((r) => {
                    const isWater = r.serviceType === 'WATER';
                    return (
                      <tr key={r.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition">
                        <td className="py-3 px-4 max-w-xs">
                          <div className="flex items-center gap-1.5 font-bold mb-0.5">
                            {isWater ? (
                              <Droplets className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                            ) : (
                              <Zap className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                            )}
                            <span className="truncate text-slate-900 dark:text-white">{r.problemType}</span>
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                            {r.description}
                          </p>
                        </td>

                        <td className="py-3 px-4 whitespace-nowrap">
                          <div className="font-semibold text-slate-800 dark:text-slate-200">
                            {r.subCity?.name}
                          </div>
                          <span className="text-[10px] text-slate-400 truncate max-w-[140px] block">
                            {r.specificLocation}
                          </span>
                        </td>

                        <td className="py-3 px-4 whitespace-nowrap">
                          <div className="text-slate-800 dark:text-slate-200">
                            {r.reporterName || 'Anonymous'}
                          </div>
                          <span className="text-[10px] text-slate-400">
                            {r.reporterPhone || r.reporterEmail || 'No contact'}
                          </span>
                        </td>

                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            r.status === 'VERIFIED'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : r.status === 'REJECTED'
                              ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                              : 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                          }`}>
                            {r.status}
                          </span>
                        </td>

                        <td className="py-3 px-4 whitespace-nowrap text-slate-400 text-[11px]">
                          {formatTimeAgo(r.createdAt)}
                        </td>

                        <td className="py-3 px-4 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {r.status === 'PENDING' && (
                              <>
                                <button
                                  onClick={() => setVerifyingReport(r)}
                                  className="px-2.5 py-1 rounded-lg text-xs font-bold bg-sky-600 hover:bg-sky-700 text-white shadow-xs"
                                >
                                  Verify
                                </button>
                                <button
                                  onClick={() => setRejectingReport(r)}
                                  className="px-2.5 py-1 rounded-lg text-xs font-semibold border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                                >
                                  Reject
                                </button>
                              </>
                            )}

                            <button
                              onClick={() => handleDeleteReport(r.id)}
                              className="p-1.5 rounded-lg border border-red-200 dark:border-red-900 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal: Verify Report */}
        {verifyingReport && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  Verify Citizen Report
                </h3>
                <button
                  onClick={() => setVerifyingReport(null)}
                  className="p-1 text-slate-400 hover:text-slate-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl text-xs space-y-1">
                <p className="font-bold text-slate-900 dark:text-white">
                  {verifyingReport.problemType} ({verifyingReport.serviceType})
                </p>
                <p className="text-slate-600 dark:text-slate-400">
                  📍 {verifyingReport.subCity?.name} • {verifyingReport.specificLocation}
                </p>
                <p className="text-slate-500 italic mt-1">"{verifyingReport.description}"</p>
              </div>

              <form onSubmit={handleConfirmVerify} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Verification Action
                  </label>
                  <div className="space-y-1.5">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="verifyMode"
                        checked={verifyMode === 'NEW_OUTAGE'}
                        onChange={() => setVerifyMode('NEW_OUTAGE')}
                      />
                      <span>Promote to Brand New Active Outage</span>
                    </label>

                    {activeOutages.length > 0 && (
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="verifyMode"
                          checked={verifyMode === 'LINK_EXISTING'}
                          onChange={() => setVerifyMode('LINK_EXISTING')}
                        />
                        <span>Merge/Link into Existing Outage Incident</span>
                      </label>
                    )}
                  </div>
                </div>

                {verifyMode === 'LINK_EXISTING' ? (
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Select Existing Incident
                    </label>
                    <select
                      value={selectedExistingOutageId}
                      onChange={(e) => setSelectedExistingOutageId(e.target.value)}
                      required
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                    >
                      <option value="">Select Incident to attach report to</option>
                      {activeOutages.map((o) => (
                        <option key={o.id} value={o.id}>
                          {o.subCity.name} - {o.title}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Assigned Severity
                    </label>
                    <select
                      value={verifySeverity}
                      onChange={(e) => setVerifySeverity(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                    >
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                      <option value="CRITICAL">Critical</option>
                    </select>
                  </div>
                )}

                <div className="flex items-center justify-end gap-2 pt-3">
                  <button
                    type="button"
                    onClick={() => setVerifyingReport(null)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingVerify}
                    className="px-5 py-2.5 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-700 text-white transition"
                  >
                    {submittingVerify ? 'Verifying...' : 'Confirm Verification'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Reject Report */}
        {rejectingReport && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  Reject Outage Report
                </h3>
                <button
                  onClick={() => setRejectingReport(null)}
                  className="p-1 text-slate-400 hover:text-slate-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleConfirmReject} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Rejection Reason
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    This reason will be recorded and provided in the citizen's notification history.
                  </p>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3">
                  <button
                    type="button"
                    onClick={() => setRejectingReport(null)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingReject}
                    className="px-5 py-2.5 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white transition"
                  >
                    {submittingReject ? 'Rejecting...' : 'Reject Report'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
