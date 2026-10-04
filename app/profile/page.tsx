'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ToastProvider';
import {
  User,
  MapPin,
  Phone,
  Mail,
  FileText,
  ShieldCheck,
  Save,
  Plus,
  Trash2,
  Clock,
  Droplets,
  Zap,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { formatTimeAgo, formatDate, getStatusBadge } from '@/lib/utils';
import Link from 'next/link';

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const { success, error } = useToast();

  const [subCities, setSubCities] = useState<any[]>([]);
  const [woredas, setWoredas] = useState<any[]>([]);

  // Profile Form state
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [subCityId, setSubCityId] = useState('');
  const [woredaId, setWoredaId] = useState('');
  const [address, setAddress] = useState('');
  const [bio, setBio] = useState('');
  const [updating, setUpdating] = useState(false);

  // User Reports and Saved Locations
  const [userReports, setUserReports] = useState<any[]>([]);
  const [savedLocations, setSavedLocations] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  // New Location modal state
  const [newLocLabel, setNewLocLabel] = useState('');
  const [newLocSubCityId, setNewLocSubCityId] = useState('');
  const [newLocAddress, setNewLocAddress] = useState('');
  const [savingLocation, setSavingLocation] = useState(false);

  useEffect(() => {
    fetchLocations();
    if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
      setSubCityId(user.subCityId || '');
      setWoredaId(user.woredaId || '');
      setAddress(user.address || '');
      setBio(user.bio || '');
      fetchUserHistory();
    }
  }, [user]);

  const fetchLocations = async () => {
    try {
      const res = await fetch('/api/locations');
      if (res.ok) {
        const data = await res.json();
        setSubCities(data.subCities || []);
        if (data.subCities?.length > 0 && !newLocSubCityId) {
          setNewLocSubCityId(data.subCities[0].id);
        }
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    if (subCityId && subCities.length > 0) {
      const sc = subCities.find((s) => s.id === subCityId);
      setWoredas(sc?.woredas || []);
    }
  }, [subCityId, subCities]);

  const fetchUserHistory = async () => {
    try {
      const [reportsRes, locsRes] = await Promise.all([
        fetch('/api/reports?limit=50'),
        fetch('/api/user-locations')
      ]);

      if (reportsRes.ok) {
        const data = await reportsRes.json();
        // Filter reports belonging to current user
        if (user) {
          const mine = (data.reports || []).filter(
            (r: any) => r.userId === user.id || r.reporterEmail === user.email
          );
          setUserReports(mine);
        }
      }

      if (locsRes.ok) {
        const data = await locsRes.json();
        setSavedLocations(data.locations || []);
      }
    } catch {
      // ignore
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    try {
      const res = await fetch('/api/auth/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          phone,
          subCityId: subCityId || null,
          woredaId: woredaId || null,
          address,
          bio,
        }),
      });

      if (res.ok) {
        success('Profile updated successfully');
        refreshUser();
      } else {
        const data = await res.json();
        error(data.error || 'Failed to update profile');
      }
    } catch {
      error('Network error updating profile');
    } finally {
      setUpdating(false);
    }
  };

  const handleAddLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLocLabel.trim() || !newLocSubCityId) {
      error('Please provide a label and sub-city');
      return;
    }

    setSavingLocation(true);
    try {
      const res = await fetch('/api/user-locations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          label: newLocLabel,
          subCityId: newLocSubCityId,
          address: newLocAddress,
        }),
      });

      if (res.ok) {
        success('Location added to your watch list');
        setNewLocLabel('');
        setNewLocAddress('');
        fetchUserHistory();
      } else {
        const data = await res.json();
        error(data.error || 'Failed to add location');
      }
    } catch {
      error('Network error adding location');
    } finally {
      setSavingLocation(false);
    }
  };

  const handleDeleteLocation = async (id: string) => {
    try {
      const res = await fetch(`/api/user-locations?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setSavedLocations((prev) => prev.filter((l) => l.id !== id));
        success('Location removed');
      }
    } catch {
      error('Failed to remove location');
    }
  };

  if (!user) {
    return (
      <div className="max-w-md mx-auto w-full px-4 py-20 text-center space-y-4">
        <User className="w-12 h-12 text-slate-400 mx-auto" />
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Sign In to View Profile</h2>
        <p className="text-xs text-slate-500">
          Sign in to customize your sub-city alerts, view your submitted outage reports, and manage favorite locations.
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
    <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sky-600 dark:text-sky-400 text-xs font-bold uppercase tracking-wider">
            <User className="w-4 h-4" />
            <span>Citizen Profile</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
            Account & Location Settings
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage your personal contact details, primary Addis residence, and watch locations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300">
            Role: {user.role}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2 Cols): Edit Profile Form */}
        <div className="lg:col-span-2 space-y-6">
          <form
            onSubmit={handleUpdateProfile}
            className="p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-5"
          >
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              Personal Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:ring-2 focus:ring-sky-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={user.email}
                  disabled
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/50 text-slate-400 text-xs cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  placeholder="+251 9..."
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:ring-2 focus:ring-sky-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Primary Sub-City
                </label>
                <select
                  value={subCityId}
                  onChange={(e) => setSubCityId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium focus:ring-2 focus:ring-sky-500 outline-none"
                >
                  <option value="">Select Sub-City</option>
                  {subCities.map((sc) => (
                    <option key={sc.id} value={sc.id}>
                      {sc.name} ({sc.amharicName})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Woreda
                </label>
                <select
                  value={woredaId}
                  onChange={(e) => setWoredaId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium focus:ring-2 focus:ring-sky-500 outline-none"
                >
                  <option value="">Select Woreda</option>
                  {woredas.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Street / Compound Address
                </label>
                <input
                  type="text"
                  placeholder="e.g., Near Atlas Hotel, Street 3"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:ring-2 focus:ring-sky-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Bio / Civic Notes
              </label>
              <textarea
                rows={2}
                placeholder="Brief information about your neighborhood utility observations..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:ring-2 focus:ring-sky-500 outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={updating}
              className="px-5 py-2.5 rounded-xl font-bold text-xs bg-sky-600 hover:bg-sky-700 text-white flex items-center gap-1.5 transition shadow-sm"
            >
              <Save className="w-4 h-4" />
              {updating ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </form>

          {/* User Submitted Reports History */}
          <div className="p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center justify-between">
              <span>My Submitted Outage Reports</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600">
                {userReports.length} reports
              </span>
            </h3>

            {loadingHistory ? (
              <div className="space-y-2">
                {[1, 2].map((i) => (
                  <div key={i} className="h-16 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : userReports.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-4">
                You haven't submitted any outage reports yet.
              </p>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {userReports.map((report) => {
                  const isWater = report.serviceType === 'WATER';
                  return (
                    <div key={report.id} className="py-3.5 flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center gap-1 text-[11px] font-bold ${isWater ? 'text-sky-600' : 'text-amber-600'}`}>
                            {isWater ? <Droplets className="w-3.5 h-3.5" /> : <Zap className="w-3.5 h-3.5" />}
                            {report.serviceType}
                          </span>
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                            {report.problemType}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                          {report.description}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-1">
                          📍 {report.subCity?.name} • {report.specificLocation} • {formatTimeAgo(report.createdAt)}
                        </p>
                      </div>

                      <div className="shrink-0 text-right">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          report.status === 'VERIFIED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : report.status === 'REJECTED'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {report.status}
                        </span>
                        {report.outageId && (
                          <div className="mt-1">
                            <Link href={`/outages/${report.outageId}`} className="text-[11px] text-sky-600 hover:underline">
                              View Outage →
                            </Link>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Saved Locations Watchlist */}
        <div className="space-y-6">
          <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">
              Saved Locations Watchlist
            </h3>
            <p className="text-xs text-slate-500">
              Save key places (e.g., Home, Office, Parents) to prioritize notifications when disruptions hit those areas.
            </p>

            {/* Existing Locations */}
            <div className="space-y-2">
              {savedLocations.map((loc) => (
                <div
                  key={loc.id}
                  className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 flex items-center justify-between"
                >
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">{loc.label}</p>
                    <p className="text-[11px] text-slate-500">
                      📍 {loc.subCity?.name} {loc.address ? `(${loc.address})` : ''}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeleteLocation(loc.id)}
                    className="p-1.5 text-slate-400 hover:text-red-500 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add New Location Form */}
            <form onSubmit={handleAddLocation} className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2.5">
              <span className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                + Add Watch Location
              </span>

              <input
                type="text"
                placeholder="Label (e.g., Office, Parents, Gym)"
                value={newLocLabel}
                onChange={(e) => setNewLocLabel(e.target.value)}
                required
                className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:ring-2 focus:ring-sky-500 outline-none"
              />

              <select
                value={newLocSubCityId}
                onChange={(e) => setNewLocSubCityId(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium"
              >
                {subCities.map((sc) => (
                  <option key={sc.id} value={sc.id}>
                    {sc.name}
                  </option>
                ))}
              </select>

              <input
                type="text"
                placeholder="Specific Street or Landmark"
                value={newLocAddress}
                onChange={(e) => setNewLocAddress(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:ring-2 focus:ring-sky-500 outline-none"
              />

              <button
                type="submit"
                disabled={savingLocation}
                className="w-full py-2 rounded-xl text-xs font-bold bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:bg-sky-600 dark:hover:bg-sky-400 transition"
              >
                {savingLocation ? 'Saving...' : 'Save Watch Location'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
