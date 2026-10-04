'use client';

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { useToast } from '@/components/ToastProvider';
import {
  Megaphone,
  PlusCircle,
  Trash2,
  Calendar,
  MapPin,
  Clock,
  Eye,
  EyeOff,
  AlertTriangle,
  X
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default function AdminAnnouncementsPage() {
  const { success, error } = useToast();

  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [subCities, setSubCities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Create Announcement Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [serviceType, setServiceType] = useState('BOTH');
  const [priority, setPriority] = useState('MEDIUM');
  const [subCityId, setSubCityId] = useState('');
  const [scheduledStart, setScheduledStart] = useState('');
  const [scheduledEnd, setScheduledEnd] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchSubCities();
    fetchAnnouncements();
  }, []);

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

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/announcements?includeInactive=true');
      if (res.ok) {
        const data = await res.json();
        setAnnouncements(data.announcements || []);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) {
      error('Title and content are required.');
      return;
    }

    setCreating(true);
    try {
      const res = await fetch('/api/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          content,
          serviceType,
          priority,
          subCityId: subCityId || null,
          scheduledStart: scheduledStart ? scheduledStart : null,
          scheduledEnd: scheduledEnd ? scheduledEnd : null,
        }),
      });

      if (res.ok) {
        success('Announcement published and broadcast to residents');
        setShowCreateModal(false);
        setTitle('');
        setContent('');
        fetchAnnouncements();
      } else {
        const data = await res.json();
        error(data.error || 'Failed to create announcement');
      }
    } catch {
      error('Network error creating announcement');
    } finally {
      setCreating(false);
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/announcements/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus }),
      });
      if (res.ok) {
        success(`Notice ${!currentStatus ? 'activated' : 'archived'}`);
        setAnnouncements((prev) =>
          prev.map((a) => (a.id === id ? { ...a, isActive: !currentStatus } : a))
        );
      } else {
        error('Failed to update notice');
      }
    } catch {
      error('Network error');
    }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    if (!confirm('Permanently delete this announcement?')) return;
    try {
      const res = await fetch(`/api/announcements/${id}`, { method: 'DELETE' });
      if (res.ok) {
        success('Announcement deleted');
        setAnnouncements((prev) => prev.filter((a) => a.id !== id));
      } else {
        error('Failed to delete announcement');
      }
    } catch {
      error('Network error deleting announcement');
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">
              Public Utility Announcements
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Post scheduled maintenance bulletins, reservoir flushes, and emergency alerts.
            </p>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-bold text-xs bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-sm transition self-start sm:self-auto"
          >
            <PlusCircle className="w-4 h-4" /> New Announcement
          </button>
        </div>

        {/* Announcements List */}
        <div className="space-y-4">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-28 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 animate-pulse" />
              ))}
            </div>
          ) : announcements.length === 0 ? (
            <div className="p-12 text-center rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 text-xs">
              No announcements published yet.
            </div>
          ) : (
            announcements.map((item) => (
              <div
                key={item.id}
                className="p-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-3 flex flex-col justify-between"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                      {item.priority} PRIORITY
                    </span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {item.serviceType}
                    </span>
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {item.subCity?.name || 'Citywide (All Addis Ababa)'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      item.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
                    }`}>
                      {item.isActive ? 'Published / Active' : 'Archived'}
                    </span>

                    <button
                      onClick={() => handleToggleActive(item.id, item.isActive)}
                      className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                      title={item.isActive ? 'Unpublish' : 'Publish'}
                    >
                      {item.isActive ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>

                    <button
                      onClick={() => handleDeleteAnnouncement(item.id)}
                      className="p-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 whitespace-pre-line leading-relaxed">
                    {item.content}
                  </p>
                </div>

                {(item.scheduledStart || item.scheduledEnd) && (
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 flex flex-wrap items-center gap-3">
                    <Clock className="w-3.5 h-3.5 text-amber-500" />
                    {item.scheduledStart && <span>Start: {formatDate(item.scheduledStart)}</span>}
                    {item.scheduledEnd && <span>End: {formatDate(item.scheduledEnd)}</span>}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Modal: Create Announcement */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  Publish Utility Announcement
                </h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-1 text-slate-400 hover:text-slate-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateAnnouncement} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Announcement Headline *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Power maintenance in Bole (10:00 AM - 2:00 PM)"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Service
                    </label>
                    <select
                      value={serviceType}
                      onChange={(e) => setServiceType(e.target.value)}
                      className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                    >
                      <option value="BOTH">Water & Power</option>
                      <option value="WATER">Water Only</option>
                      <option value="ELECTRICITY">Electricity Only</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Priority
                    </label>
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value)}
                      className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                    >
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                      <option value="URGENT">Urgent</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Target Area
                    </label>
                    <select
                      value={subCityId}
                      onChange={(e) => setSubCityId(e.target.value)}
                      className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                    >
                      <option value="">Citywide</option>
                      {subCities.map((sc) => (
                        <option key={sc.id} value={sc.id}>
                          {sc.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Announcement Body *
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Provide details: reason for maintenance, affected streets, preparation guidelines..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Expected Start Time
                    </label>
                    <input
                      type="datetime-local"
                      value={scheduledStart}
                      onChange={(e) => setScheduledStart(e.target.value)}
                      className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Expected End / Restoration
                    </label>
                    <input
                      type="datetime-local"
                      value={scheduledEnd}
                      onChange={(e) => setScheduledEnd(e.target.value)}
                      className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creating}
                    className="px-5 py-2.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition"
                  >
                    {creating ? 'Broadcasting...' : 'Publish Announcement'}
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
