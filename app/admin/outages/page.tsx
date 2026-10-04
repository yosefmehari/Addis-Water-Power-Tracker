'use client';

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { useToast } from '@/components/ToastProvider';
import {
  AlertTriangle,
  PlusCircle,
  Search,
  Filter,
  Edit2,
  Trash2,
  CheckCircle2,
  Droplets,
  Zap,
  Clock,
  MapPin,
  MessageSquarePlus,
  X,
  ExternalLink
} from 'lucide-react';
import { getStatusBadge, formatTimeAgo, formatDate } from '@/lib/utils';
import Link from 'next/link';

export default function AdminOutagesPage() {
  const { success, error } = useToast();

  const [outages, setOutages] = useState<any[]>([]);
  const [subCities, setSubCities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [serviceType, setServiceType] = useState('ALL');
  const [status, setStatus] = useState('ALL');
  const [subCityId, setSubCityId] = useState('ALL');

  // Create Outage Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formServiceType, setFormServiceType] = useState<'WATER' | 'ELECTRICITY'>('WATER');
  const [formTitle, setFormTitle] = useState('');
  const [formProblemType, setFormProblemType] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formSubCityId, setFormSubCityId] = useState('');
  const [formLocation, setFormLocation] = useState('');
  const [formSeverity, setFormSeverity] = useState('MEDIUM');
  const [formStatus, setFormStatus] = useState('ACTIVE');
  const [formEstRestoration, setFormEstRestoration] = useState('');
  const [creating, setCreating] = useState(false);

  // Edit Status / Add Update Modal State
  const [selectedOutage, setSelectedOutage] = useState<any>(null);
  const [editStatus, setEditStatus] = useState('');
  const [statusUpdateNote, setStatusUpdateNote] = useState('');
  const [savingStatus, setSavingStatus] = useState(false);

  useEffect(() => {
    fetchSubCities();
    fetchOutages();
  }, [serviceType, status, subCityId]);

  const fetchSubCities = async () => {
    try {
      const res = await fetch('/api/sub-cities');
      if (res.ok) {
        const data = await res.json();
        setSubCities(data.subCities || []);
        if (data.subCities?.length > 0 && !formSubCityId) {
          setFormSubCityId(data.subCities[0].id);
        }
      }
    } catch {
      // ignore
    }
  };

  const fetchOutages = async (querySearch?: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      const s = querySearch !== undefined ? querySearch : search;
      if (s) params.set('search', s);
      if (serviceType !== 'ALL') params.set('serviceType', serviceType);
      if (status !== 'ALL') params.set('status', status);
      if (subCityId !== 'ALL') params.set('subCityId', subCityId);

      const res = await fetch(`/api/outages?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setOutages(data.outages || []);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOutage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle || !formProblemType || !formDescription || !formSubCityId) {
      error('Please complete all required fields.');
      return;
    }

    setCreating(true);
    try {
      const res = await fetch('/api/outages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formTitle,
          serviceType: formServiceType,
          problemType: formProblemType,
          description: formDescription,
          subCityId: formSubCityId,
          specificLocation: formLocation,
          severity: formSeverity,
          status: formStatus,
          estimatedRestoration: formEstRestoration ? formEstRestoration : null,
        }),
      });

      if (res.ok) {
        success('Outage created and broadcast to sub-city residents');
        setShowCreateModal(false);
        setFormTitle('');
        setFormProblemType('');
        setFormDescription('');
        setFormLocation('');
        fetchOutages();
      } else {
        const data = await res.json();
        error(data.error || 'Failed to create outage');
      }
    } catch {
      error('Network error creating outage');
    } finally {
      setCreating(false);
    }
  };

  const handleSaveStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOutage) return;

    setSavingStatus(true);
    try {
      const res = await fetch(`/api/outages/${selectedOutage.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: editStatus,
          updateNote: statusUpdateNote || `Status updated to ${editStatus} by dispatcher`,
        }),
      });

      if (res.ok) {
        success('Outage status updated and notification dispatched');
        setSelectedOutage(null);
        setStatusUpdateNote('');
        fetchOutages();
      } else {
        const data = await res.json();
        error(data.error || 'Failed to update outage');
      }
    } catch {
      error('Network error updating outage');
    } finally {
      setSavingStatus(false);
    }
  };

  const handleDeleteOutage = async (id: string) => {
    if (!confirm('Are you sure you want to permanently delete this outage record?')) return;

    try {
      const res = await fetch(`/api/outages/${id}`, { method: 'DELETE' });
      if (res.ok) {
        success('Outage deleted');
        setOutages((prev) => prev.filter((o) => o.id !== id));
      } else {
        error('Failed to delete outage');
      }
    } catch {
      error('Network error deleting outage');
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">
              Manage Outages & Incidents
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Control active disruptions, update repair milestones, and broadcast restoration notices.
            </p>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-bold text-xs bg-sky-600 hover:bg-sky-700 text-white shadow-sm transition self-start sm:self-auto"
          >
            <PlusCircle className="w-4 h-4" /> Create New Outage
          </button>
        </div>

        {/* Filter Controls */}
        <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search outages by title or location..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchOutages()}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:ring-2 focus:ring-sky-500 outline-none"
              />
            </div>

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
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="INVESTIGATING">INVESTIGATING</option>
              <option value="VERIFIED">VERIFIED</option>
              <option value="RESTORED">RESTORED</option>
              <option value="PENDING">PENDING</option>
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
              onClick={() => fetchOutages()}
              className="px-3.5 py-2 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs font-semibold hover:bg-sky-600"
            >
              Filter
            </button>
          </div>
        </div>

        {/* Outages Table */}
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3.5 px-4">Service & Title</th>
                  <th className="py-3.5 px-4">Location</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Severity</th>
                  <th className="py-3.5 px-4">Affected</th>
                  <th className="py-3.5 px-4">Started</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      Loading outages directory...
                    </td>
                  </tr>
                ) : outages.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      No outages found.
                    </td>
                  </tr>
                ) : (
                  outages.map((o) => {
                    const statusInfo = getStatusBadge(o.status);
                    const isWater = o.serviceType === 'WATER';

                    return (
                      <tr key={o.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition">
                        <td className="py-3 px-4 max-w-xs">
                          <div className="flex items-center gap-1.5 font-bold mb-0.5">
                            {isWater ? (
                              <Droplets className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                            ) : (
                              <Zap className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                            )}
                            <span className="truncate text-slate-900 dark:text-white">{o.title}</span>
                          </div>
                          <span className="text-[10px] text-slate-400">{o.problemType}</span>
                        </td>

                        <td className="py-3 px-4 whitespace-nowrap">
                          <div className="font-semibold text-slate-800 dark:text-slate-200">
                            {o.subCity?.name}
                          </div>
                          <span className="text-[10px] text-slate-400 truncate max-w-[140px] block">
                            {o.specificLocation || 'General'}
                          </span>
                        </td>

                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${statusInfo.bg}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dot}`} />
                            {o.status}
                          </span>
                        </td>

                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                            o.severity === 'CRITICAL' ? 'bg-red-100 text-red-700' :
                            o.severity === 'HIGH' ? 'bg-amber-100 text-amber-700' :
                            'bg-slate-100 text-slate-700'
                          }`}>
                            {o.severity}
                          </span>
                        </td>

                        <td className="py-3 px-4 whitespace-nowrap font-bold text-slate-800 dark:text-slate-200">
                          {o.affectedReportsCount}
                        </td>

                        <td className="py-3 px-4 whitespace-nowrap text-slate-400 text-[11px]">
                          {formatTimeAgo(o.startedAt)}
                        </td>

                        <td className="py-3 px-4 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => {
                                setSelectedOutage(o);
                                setEditStatus(o.status);
                              }}
                              title="Update Status & Timeline"
                              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>

                            <Link
                              href={`/outages/${o.id}`}
                              target="_blank"
                              title="View Public Details"
                              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </Link>

                            <button
                              onClick={() => handleDeleteOutage(o.id)}
                              title="Delete Outage"
                              className="p-1.5 rounded-lg border border-red-200 dark:border-red-900 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40"
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

        {/* Modal: Create Outage */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  Create Official Outage Notice
                </h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateOutage} className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Service Type
                    </label>
                    <select
                      value={formServiceType}
                      onChange={(e) => setFormServiceType(e.target.value as any)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold"
                    >
                      <option value="WATER">Water Supply (AAWSA)</option>
                      <option value="ELECTRICITY">Electricity (EEU)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Severity Level
                    </label>
                    <select
                      value={formSeverity}
                      onChange={(e) => setFormSeverity(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold"
                    >
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                      <option value="CRITICAL">Critical</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Outage Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Bole Medhanialem 15kV Feeder Outage"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-sky-500 outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Sub-City *
                    </label>
                    <select
                      value={formSubCityId}
                      onChange={(e) => setFormSubCityId(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-medium"
                    >
                      {subCities.map((sc) => (
                        <option key={sc.id} value={sc.id}>
                          {sc.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Problem Classification *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., Pipe Burst, Transformer Trip"
                      value={formProblemType}
                      onChange={(e) => setFormProblemType(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Specific Location & Landmark
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Namibia Street, around Atlas Hotel"
                    value={formLocation}
                    onChange={(e) => setFormLocation(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Technical Description *
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Detailed explanation of fault causes and repair team dispatch..."
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Initial Status
                    </label>
                    <select
                      value={formStatus}
                      onChange={(e) => setFormStatus(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                    >
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="INVESTIGATING">INVESTIGATING</option>
                      <option value="VERIFIED">VERIFIED</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Estimated Restoration Time
                    </label>
                    <input
                      type="datetime-local"
                      value={formEstRestoration}
                      onChange={(e) => setFormEstRestoration(e.target.value)}
                      className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creating}
                    className="px-5 py-2.5 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-700 text-white transition shadow-sm"
                  >
                    {creating ? 'Broadcasting...' : 'Publish Outage'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Edit Status & Add Update */}
        {selectedOutage && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">
                    Update Incident Status
                  </h3>
                  <p className="text-xs text-slate-500 truncate max-w-xs">{selectedOutage.title}</p>
                </div>
                <button
                  onClick={() => setSelectedOutage(null)}
                  className="p-1 text-slate-400 hover:text-slate-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveStatus} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    New Status
                  </label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold"
                  >
                    <option value="INVESTIGATING">INVESTIGATING</option>
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="VERIFIED">VERIFIED</option>
                    <option value="RESTORED">RESTORED (Resolution complete)</option>
                    <option value="REJECTED">REJECTED (False alarm)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Progress / Crew Update Message
                  </label>
                  <textarea
                    rows={3}
                    placeholder="e.g., Replacement valve welded. Tap flow re-pressurized..."
                    value={statusUpdateNote}
                    onChange={(e) => setStatusUpdateNote(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    This note will be automatically added to the outage public timeline and sent to affected citizens.
                  </p>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3">
                  <button
                    type="button"
                    onClick={() => setSelectedOutage(null)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingStatus}
                    className="px-5 py-2.5 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-700 text-white transition"
                  >
                    {savingStatus ? 'Saving...' : 'Apply Status Update'}
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
