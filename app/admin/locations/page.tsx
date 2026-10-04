'use client';

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { useToast } from '@/components/ToastProvider';
import {
  MapPin,
  PlusCircle,
  Trash2,
  Edit2,
  FolderTree,
  ChevronRight,
  Globe,
  Layers
} from 'lucide-react';

export default function AdminLocationsPage() {
  const { success, error } = useToast();

  const [subCities, setSubCities] = useState<any[]>([]);
  const [selectedSubCity, setSelectedSubCity] = useState<any>(null);
  const [selectedWoreda, setSelectedWoreda] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // New Sub-City Form
  const [newSubCityName, setNewSubCityName] = useState('');
  const [newSubCityAmharic, setNewSubCityAmharic] = useState('');
  const [newSubCityCode, setNewSubCityCode] = useState('');
  const [newSubCityLat, setNewSubCityLat] = useState('9.0200');
  const [newSubCityLng, setNewSubCityLng] = useState('38.7500');

  // New Woreda Form
  const [newWoredaName, setNewWoredaName] = useState('');
  const [newWoredaCode, setNewWoredaCode] = useState('');

  // New Area Form
  const [newAreaName, setNewAreaName] = useState('');
  const [newAreaLandmark, setNewAreaLandmark] = useState('');

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/locations');
      if (res.ok) {
        const data = await res.json();
        const list = data.subCities || [];
        setSubCities(list);
        if (list.length > 0 && !selectedSubCity) {
          setSelectedSubCity(list[0]);
          if (list[0].woredas?.length > 0) {
            setSelectedWoreda(list[0].woredas[0]);
          }
        }
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubCity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubCityName) return;

    try {
      const res = await fetch('/api/sub-cities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newSubCityName,
          amharicName: newSubCityAmharic,
          code: newSubCityCode,
          latitude: parseFloat(newSubCityLat),
          longitude: parseFloat(newSubCityLng),
        }),
      });

      if (res.ok) {
        success(`Sub-city "${newSubCityName}" added successfully`);
        setNewSubCityName('');
        setNewSubCityAmharic('');
        setNewSubCityCode('');
        fetchLocations();
      } else {
        const data = await res.json();
        error(data.error || 'Failed to create sub-city');
      }
    } catch {
      error('Network error creating sub-city');
    }
  };

  const handleAddWoreda = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWoredaName || !selectedSubCity) return;

    try {
      const res = await fetch('/api/woredas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newWoredaName,
          code: newWoredaCode,
          subCityId: selectedSubCity.id,
        }),
      });

      if (res.ok) {
        success(`Woreda "${newWoredaName}" added to ${selectedSubCity.name}`);
        setNewWoredaName('');
        setNewWoredaCode('');
        fetchLocations();
      } else {
        const data = await res.json();
        error(data.error || 'Failed to create woreda');
      }
    } catch {
      error('Network error creating woreda');
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">
            Addis Ababa Administrative Locations
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Database-backed hierarchy of Sub-Cities, Woredas, and Neighborhood Areas.
          </p>
        </div>

        {/* 3-Column Hierarchy Explorer */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Column 1: Sub-Cities */}
          <div className="p-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Globe className="w-4 h-4 text-sky-500" />
                Sub-Cities ({subCities.length})
              </h3>
            </div>

            <div className="space-y-1.5 max-h-80 overflow-y-auto pr-1">
              {subCities.map((sc) => {
                const isSelected = selectedSubCity?.id === sc.id;
                return (
                  <button
                    key={sc.id}
                    onClick={() => {
                      setSelectedSubCity(sc);
                      setSelectedWoreda(sc.woredas?.[0] || null);
                    }}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold transition ${
                      isSelected
                        ? 'bg-sky-600 text-white shadow-sm'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="text-left truncate">
                      <p className="truncate">{sc.name}</p>
                      <span className={`text-[10px] ${isSelected ? 'text-sky-200' : 'text-slate-400'}`}>
                        {sc.amharicName} • {sc.woredas?.length || 0} woredas
                      </span>
                    </div>
                    <ChevronRight className="w-4 h-4 shrink-0" />
                  </button>
                );
              })}
            </div>

            {/* Quick Add Sub-City Form */}
            <form onSubmit={handleAddSubCity} className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2 text-xs">
              <span className="block font-bold text-slate-800 dark:text-slate-200">
                + New Sub-City
              </span>
              <input
                type="text"
                required
                placeholder="English Name (e.g., Lemi Kura)"
                value={newSubCityName}
                onChange={(e) => setNewSubCityName(e.target.value)}
                className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Amharic (e.g., ለሚ ኩራ)"
                  value={newSubCityAmharic}
                  onChange={(e) => setNewSubCityAmharic(e.target.value)}
                  className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
                <input
                  type="text"
                  placeholder="Code (e.g., AA-LEM)"
                  value={newSubCityCode}
                  onChange={(e) => setNewSubCityCode(e.target.value)}
                  className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2 rounded-xl font-bold bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:bg-sky-600 transition"
              >
                Add Sub-City
              </button>
            </form>
          </div>

          {/* Column 2: Woredas */}
          <div className="p-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-amber-500" />
                Woredas in {selectedSubCity?.name || '...'}
              </h3>
            </div>

            <div className="space-y-1.5 max-h-80 overflow-y-auto pr-1">
              {!selectedSubCity?.woredas || selectedSubCity.woredas.length === 0 ? (
                <p className="text-xs text-slate-400 italic py-4">No woredas registered yet.</p>
              ) : (
                selectedSubCity.woredas.map((w: any) => {
                  const isSelected = selectedWoreda?.id === w.id;
                  return (
                    <button
                      key={w.id}
                      onClick={() => setSelectedWoreda(w)}
                      className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold transition ${
                        isSelected
                          ? 'bg-amber-500 text-slate-950 shadow-sm'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <div className="text-left truncate">
                        <p className="truncate">{w.name}</p>
                        <span className="text-[10px] opacity-75">
                          {w.code || 'Woreda'} • {w.areas?.length || 0} areas
                        </span>
                      </div>
                      <ChevronRight className="w-4 h-4 shrink-0" />
                    </button>
                  );
                })
              )}
            </div>

            {/* Quick Add Woreda Form */}
            {selectedSubCity && (
              <form onSubmit={handleAddWoreda} className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2 text-xs">
                <span className="block font-bold text-slate-800 dark:text-slate-200">
                  + Add Woreda to {selectedSubCity.name}
                </span>
                <input
                  type="text"
                  required
                  placeholder="e.g., Woreda 04"
                  value={newWoredaName}
                  onChange={(e) => setNewWoredaName(e.target.value)}
                  className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
                <input
                  type="text"
                  placeholder="Code (optional, e.g., BOL-04)"
                  value={newWoredaCode}
                  onChange={(e) => setNewWoredaCode(e.target.value)}
                  className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
                <button
                  type="submit"
                  className="w-full py-2 rounded-xl font-bold bg-amber-500 text-slate-950 hover:bg-amber-400 transition"
                >
                  Add Woreda
                </button>
              </form>
            )}
          </div>

          {/* Column 3: Areas & Neighborhoods */}
          <div className="p-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-500" />
                Areas in {selectedWoreda?.name || '...'}
              </h3>
            </div>

            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {!selectedWoreda?.areas || selectedWoreda.areas.length === 0 ? (
                <p className="text-xs text-slate-400 italic py-4">No specific areas registered for this woreda yet.</p>
              ) : (
                selectedWoreda.areas.map((a: any) => (
                  <div
                    key={a.id}
                    className="p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-xs"
                  >
                    <p className="font-bold text-slate-900 dark:text-white">{a.name}</p>
                    {a.landmark && (
                      <span className="text-[10px] text-slate-400 block mt-0.5">{a.landmark}</span>
                    )}
                  </div>
                ))
              )}
            </div>

            <div className="p-3 rounded-2xl bg-sky-50 dark:bg-sky-950/40 border border-sky-100 dark:border-sky-900 text-[11px] text-sky-800 dark:text-sky-300">
              ℹ️ Citizens can pick any registered sub-city and woreda from dropdowns, and input their own custom neighborhood or landmark when reporting.
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
