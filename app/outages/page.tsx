'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import OutageCard from '@/components/OutageCard';
import {
  Search,
  Filter,
  Droplets,
  Zap,
  MapPin,
  RefreshCw,
  PlusCircle,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';

function OutagesContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [outages, setOutages] = useState<any[]>([]);
  const [subCities, setSubCities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters state initialized from URL search params
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [serviceType, setServiceType] = useState(searchParams.get('serviceType') || 'ALL');
  const [status, setStatus] = useState(searchParams.get('status') || 'ALL');
  const [subCityId, setSubCityId] = useState(searchParams.get('subCityId') || 'ALL');

  useEffect(() => {
    fetchSubCities();
  }, []);

  useEffect(() => {
    fetchOutages();
  }, [serviceType, status, subCityId]);

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

  const fetchOutages = async (querySearch?: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      const s = querySearch !== undefined ? querySearch : search;
      if (s) params.set('search', s);
      if (serviceType && serviceType !== 'ALL') params.set('serviceType', serviceType);
      if (status && status !== 'ALL') params.set('status', status);
      if (subCityId && subCityId !== 'ALL') params.set('subCityId', subCityId);

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

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOutages();
  };

  const resetFilters = () => {
    setSearch('');
    setServiceType('ALL');
    setStatus('ALL');
    setSubCityId('ALL');
    router.push('/outages');
    fetchOutages('');
  };

  return (
    <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Heading */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sky-600 dark:text-sky-400 text-xs font-bold uppercase tracking-wider">
            <Filter className="w-4 h-4" />
            <span>Civic Outages Directory</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
            Water & Power Outages Feed
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Search and filter verified municipal utility interruptions across Addis Ababa.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="/report"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white shadow-sm transition"
          >
            <PlusCircle className="w-4 h-4" /> Report Outage
          </a>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            placeholder="Search by neighborhood, street, keyword (e.g., Atlas, Churchill, Pipe Burst, Blackout)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-24 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 transition"
          />
          <button
            type="submit"
            className="absolute right-2 top-2 px-3.5 py-1 text-xs font-semibold rounded-lg bg-sky-600 text-white hover:bg-sky-700 transition"
          >
            Search
          </button>
        </form>

        {/* Filter Controls Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs pt-1">
          <div className="flex flex-wrap items-center gap-2">
            {/* Service Filter */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              <button
                onClick={() => setServiceType('ALL')}
                className={`px-3 py-1 rounded-lg font-medium transition ${
                  serviceType === 'ALL'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                All Services
              </button>
              <button
                onClick={() => setServiceType('WATER')}
                className={`flex items-center gap-1 px-3 py-1 rounded-lg font-medium transition ${
                  serviceType === 'WATER'
                    ? 'bg-sky-500 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-sky-600'
                }`}
              >
                <Droplets className="w-3.5 h-3.5" /> Water
              </button>
              <button
                onClick={() => setServiceType('ELECTRICITY')}
                className={`flex items-center gap-1 px-3 py-1 rounded-lg font-medium transition ${
                  serviceType === 'ELECTRICITY'
                    ? 'bg-amber-500 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-amber-600'
                }`}
              >
                <Zap className="w-3.5 h-3.5" /> Electricity
              </button>
            </div>

            {/* Status Filter */}
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE_ONLY">Active Outages Only</option>
              <option value="ACTIVE">Active</option>
              <option value="INVESTIGATING">Investigating</option>
              <option value="VERIFIED">Verified</option>
              <option value="RESTORED">Restored</option>
            </select>

            {/* Sub-City Filter */}
            <select
              value={subCityId}
              onChange={(e) => setSubCityId(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium"
            >
              <option value="ALL">All 11 Sub-Cities</option>
              {subCities.map((sc) => (
                <option key={sc.id} value={sc.id}>
                  {sc.name} ({sc.amharicName})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-medium">
              Showing <strong>{outages.length}</strong> incidents
            </span>
            {(serviceType !== 'ALL' || status !== 'ALL' || subCityId !== 'ALL' || search) && (
              <button
                onClick={resetFilters}
                className="text-sky-600 hover:text-sky-700 font-semibold underline flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" /> Reset
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Outage Cards Feed Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-48 rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse border border-slate-200 dark:border-slate-700" />
          ))}
        </div>
      ) : outages.length === 0 ? (
        <div className="p-12 text-center rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-800 dark:text-slate-200 text-base">
            No Outages Found Matching Filters
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your search criteria, switching sub-cities, or clearing your filters.
          </p>
          <button
            onClick={resetFilters}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-900 text-white dark:bg-white dark:text-slate-900 mt-2"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {outages.map((outage) => (
            <OutageCard key={outage.id} outage={outage} onConfirmed={() => fetchOutages()} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function OutagesPage() {
  return (
    <Suspense fallback={
      <div className="max-w-7xl mx-auto w-full px-4 py-12 text-center text-xs text-slate-500 animate-pulse">
        Loading outages directory...
      </div>
    }>
      <OutagesContent />
    </Suspense>
  );
}
