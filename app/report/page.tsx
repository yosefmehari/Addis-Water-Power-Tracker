'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ToastProvider';
import {
  Droplets,
  Zap,
  MapPin,
  Clock,
  Camera,
  User,
  Phone,
  Mail,
  CheckCircle2,
  AlertCircle,
  FileText,
  ShieldCheck,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';

export default function ReportPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { success, error, info } = useToast();

  const [subCities, setSubCities] = useState<any[]>([]);
  const [woredas, setWoredas] = useState<any[]>([]);
  const [areas, setAreas] = useState<any[]>([]);
  const [loadingLocations, setLoadingLocations] = useState(true);

  // Form State
  const [serviceType, setServiceType] = useState<'WATER' | 'ELECTRICITY'>('WATER');
  const [problemType, setProblemType] = useState('');
  const [description, setDescription] = useState('');
  const [subCityId, setSubCityId] = useState('');
  const [woredaId, setWoredaId] = useState('');
  const [areaId, setAreaId] = useState('');
  const [specificLocation, setSpecificLocation] = useState('');
  const [address, setAddress] = useState('');
  const [startedAt, setStartedAt] = useState(
    new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16)
  );
  const [photoUrl, setPhotoUrl] = useState('');
  const [reporterName, setReporterName] = useState('');
  const [reporterPhone, setReporterPhone] = useState('');
  const [reporterEmail, setReporterEmail] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState<any>(null);

  // Pre-fill user details
  useEffect(() => {
    if (user) {
      if (!reporterName) setReporterName(user.name);
      if (!reporterEmail) setReporterEmail(user.email);
      if (!reporterPhone && user.phone) setReporterPhone(user.phone);
      if (!subCityId && user.subCityId) setSubCityId(user.subCityId);
      if (!woredaId && user.woredaId) setWoredaId(user.woredaId);
    }
  }, [user]);

  // Fetch hierarchical locations
  useEffect(() => {
    async function loadLocations() {
      try {
        const res = await fetch('/api/locations');
        if (res.ok) {
          const data = await res.json();
          setSubCities(data.subCities || []);
          if (data.subCities && data.subCities.length > 0 && !subCityId) {
            setSubCityId(data.subCities[0].id);
          }
        }
      } catch {
        error('Failed to load locations');
      } finally {
        setLoadingLocations(false);
      }
    }
    loadLocations();
  }, []);

  // Update woredas when subCityId changes
  useEffect(() => {
    if (subCityId && subCities.length > 0) {
      const selected = subCities.find((s) => s.id === subCityId);
      if (selected && selected.woredas) {
        setWoredas(selected.woredas);
        if (selected.woredas.length > 0) {
          setWoredaId(selected.woredas[0].id);
        } else {
          setWoredaId('');
        }
      }
    }
  }, [subCityId, subCities]);

  // Update areas when woredaId changes
  useEffect(() => {
    if (woredaId && woredas.length > 0) {
      const selected = woredas.find((w) => w.id === woredaId);
      if (selected && selected.areas) {
        setAreas(selected.areas);
        if (selected.areas.length > 0) {
          setAreaId(selected.areas[0].id);
        } else {
          setAreaId('');
        }
      }
    }
  }, [woredaId, woredas]);

  // Common Problem Types for Quick Selection
  const waterProblemTypes = [
    'Pipe Burst / Main Line Rupture',
    'Total Water Supply Cutoff',
    'Extremely Low Water Pressure',
    'Discolored / Murky Water',
    'Underground Leakage',
    'Booster Pump Station Failure',
  ];

  const powerProblemTypes = [
    'Complete Area Blackout',
    'Blown / Sparking Transformer',
    'Downed / Broken Power Wire',
    'Severe Voltage Fluctuations',
    'Phase Drop (Partial Power)',
    'Substation Tripping',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!problemType.trim()) {
      error('Please select or describe the problem type.');
      return;
    }

    if (!description.trim() || description.trim().length < 10) {
      error('Please provide a detailed description (at least 10 characters).');
      return;
    }

    if (!subCityId || !specificLocation.trim()) {
      error('Sub-City and specific location/landmark are required.');
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceType,
          problemType,
          description,
          subCityId,
          woredaId: woredaId || null,
          areaId: areaId || null,
          specificLocation,
          address,
          startedAt,
          photoUrl: photoUrl || null,
          reporterName,
          reporterPhone,
          reporterEmail,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setSubmissionSuccess(data);
        success('Report submitted successfully. Status: Pending verification');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        error(data.error || 'Failed to submit outage report');
      }
    } catch {
      error('Network error during report submission');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400">
          <AlertCircle className="w-3.5 h-3.5" />
          <span>Citizen Reporting Portal</span>
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
          Report a Utility Outage
        </h1>
        <p className="text-sm text-slate-500">
          Submit details about water disruption or power cuts in your neighborhood. Reports are immediately reviewed by dispatchers and alerted to nearby residents.
        </p>
      </div>

      {/* Success Notification Box */}
      {submissionSuccess ? (
        <div className="p-8 rounded-3xl border border-emerald-200 dark:border-emerald-800 bg-white dark:bg-slate-900 shadow-xl space-y-6 text-center animate-in zoom-in-95 duration-200">
          <div className="w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">
              Report Submitted Successfully
            </h2>
            <div className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
              Status: Pending verification
            </div>
            <p className="text-xs text-slate-500 max-w-md mx-auto pt-1">
              Thank you for keeping Addis Ababa informed. Your report has been dispatched to utility technicians and logged in the municipal review queue.
            </p>
          </div>

          {submissionSuccess.isDuplicateWarning && (
            <div className="p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 rounded-xl text-xs text-blue-700 dark:text-blue-300 max-w-md mx-auto">
              ℹ️ Similar reports were recently filed in this vicinity. Your report has reinforced the incident priority.
            </div>
          )}

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              href="/outages"
              className="px-5 py-2.5 rounded-xl font-bold text-xs bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:bg-sky-600 dark:hover:bg-sky-400 hover:text-white transition"
            >
              View Active Outages Feed
            </Link>
            <button
              onClick={() => {
                setSubmissionSuccess(null);
                setDescription('');
                setSpecificLocation('');
                setProblemType('');
              }}
              className="px-5 py-2.5 rounded-xl font-semibold text-xs border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              Report Another Incident
            </button>
          </div>
        </div>
      ) : (
        /* Report Form Card */
        <form
          onSubmit={handleSubmit}
          className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-10 shadow-sm space-y-8"
        >
          {/* Step 1: Service Type Selection */}
          <div className="space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
              1. Select Affected Utility Service <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => {
                  setServiceType('WATER');
                  setProblemType('');
                }}
                className={`p-5 rounded-2xl border text-left flex items-start gap-4 transition-all ${
                  serviceType === 'WATER'
                    ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/40 ring-2 ring-sky-500 shadow-md'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 bg-slate-50/50 dark:bg-slate-800/30'
                }`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                  serviceType === 'WATER' ? 'bg-sky-500 text-white shadow-md' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                }`}>
                  <Droplets className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">Water Service</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Pipe burst, zero pressure, contamination</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setServiceType('ELECTRICITY');
                  setProblemType('');
                }}
                className={`p-5 rounded-2xl border text-left flex items-start gap-4 transition-all ${
                  serviceType === 'ELECTRICITY'
                    ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/40 ring-2 ring-amber-500 shadow-md'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 bg-slate-50/50 dark:bg-slate-800/30'
                }`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                  serviceType === 'ELECTRICITY' ? 'bg-amber-500 text-white shadow-md' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                }`}>
                  <Zap className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">Electricity / Power</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Blackout, blown transformer, downed wire</p>
                </div>
              </button>
            </div>
          </div>

          {/* Step 2: Problem Type Quick Selection */}
          <div className="space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
              2. Specific Problem Type <span className="text-rose-500">*</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {(serviceType === 'WATER' ? waterProblemTypes : powerProblemTypes).map((pt) => (
                <button
                  type="button"
                  key={pt}
                  onClick={() => setProblemType(pt)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition ${
                    problemType === pt
                      ? serviceType === 'WATER'
                        ? 'bg-sky-600 text-white shadow-sm'
                        : 'bg-amber-500 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  {pt}
                </button>
              ))}
            </div>

            <input
              type="text"
              placeholder="Or write custom problem type..."
              value={problemType}
              onChange={(e) => setProblemType(e.target.value)}
              className="w-full mt-2 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:ring-2 focus:ring-sky-500 outline-none"
            />
          </div>

          {/* Step 3: Location Details (Hierarchical) */}
          <div className="space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
              3. Addis Ababa Location <span className="text-rose-500">*</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <span className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Sub-City
                </span>
                <select
                  value={subCityId}
                  onChange={(e) => setSubCityId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium"
                >
                  {subCities.map((sc) => (
                    <option key={sc.id} value={sc.id}>
                      {sc.name} ({sc.amharicName})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <span className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Woreda
                </span>
                <select
                  value={woredaId}
                  onChange={(e) => setWoredaId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium"
                >
                  {woredas.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <span className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Known Area / Zone
                </span>
                <select
                  value={areaId}
                  onChange={(e) => setAreaId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium"
                >
                  <option value="">Select or leave general</option>
                  {areas.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <span className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Specific Street / Landmark / Neighborhood <span className="text-rose-500">*</span>
                </span>
                <input
                  type="text"
                  placeholder="e.g., Near Atlas Hotel, Street 3, Block 14"
                  value={specificLocation}
                  onChange={(e) => setSpecificLocation(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:ring-2 focus:ring-sky-500 outline-none"
                />
              </div>

              <div>
                <span className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Optional Compound or House Address
                </span>
                <input
                  type="text"
                  placeholder="e.g., House No. 402, Sunshine Condominiums"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:ring-2 focus:ring-sky-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Step 4: Outage Timing & Description */}
          <div className="space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
              4. Outage Timing & Detailed Description <span className="text-rose-500">*</span>
            </label>

            <div>
              <span className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                When did the outage start?
              </span>
              <input
                type="datetime-local"
                value={startedAt}
                onChange={(e) => setStartedAt(e.target.value)}
                className="w-full sm:w-72 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium"
              />
            </div>

            <div>
              <span className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Describe the situation in detail <span className="text-rose-500">*</span>
              </span>
              <textarea
                rows={4}
                placeholder="Provide helpful context: Is water leaking onto the street? Did you hear a transformer explosion? Are other surrounding compounds dark?..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                className="w-full p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs leading-relaxed focus:ring-2 focus:ring-sky-500 outline-none"
              />
            </div>

            <div>
              <span className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Optional Photo URL or Image Link
              </span>
              <div className="relative">
                <Camera className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="url"
                  placeholder="https://... (Optional image showing pipe leak or damaged pole)"
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:ring-2 focus:ring-sky-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Step 5: Contact Information */}
          <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
              5. Reporter Contact Information
            </label>
            <p className="text-[11px] text-slate-400">
              Kept confidential. Only used by dispatchers if clarification on the site location is needed.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <span className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Full Name
                </span>
                <input
                  type="text"
                  placeholder="Your Name"
                  value={reporterName}
                  onChange={(e) => setReporterName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:ring-2 focus:ring-sky-500 outline-none"
                />
              </div>

              <div>
                <span className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Phone Number
                </span>
                <input
                  type="tel"
                  placeholder="+251 9..."
                  value={reporterPhone}
                  onChange={(e) => setReporterPhone(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:ring-2 focus:ring-sky-500 outline-none"
                />
              </div>

              <div>
                <span className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Email Address
                </span>
                <input
                  type="email"
                  placeholder="your.email@example.com"
                  value={reporterEmail}
                  onChange={(e) => setReporterEmail(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:ring-2 focus:ring-sky-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 rounded-2xl font-bold text-sm bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white shadow-xl shadow-rose-600/25 transition transform hover:-translate-y-0.5 disabled:opacity-50"
            >
              {submitting ? 'Submitting Report...' : 'Submit Outage Report'}
            </button>
            <p className="text-[11px] text-slate-400 text-center mt-2.5">
              Spam submissions and fraudulent reports are automatically filtered and recorded.
            </p>
          </div>
        </form>
      )}
    </div>
  );
}
