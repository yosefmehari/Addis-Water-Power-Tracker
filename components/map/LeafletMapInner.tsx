'use client';

import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Link from 'next/link';
import { formatTimeAgo, formatDate, getStatusBadge } from '@/lib/utils';
import { Droplets, Zap, Filter, MapPin, RefreshCw } from 'lucide-react';

interface MapOutage {
  id: string;
  title: string;
  serviceType: string;
  problemType: string;
  status: string;
  severity: string;
  description: string;
  specificLocation?: string | null;
  latitude: number;
  longitude: number;
  startedAt: string | Date;
  updatedAt: string | Date;
  affectedReportsCount: number;
  subCity: { id: string; name: string };
  woreda?: { id: string; name: string } | null;
}

interface MapProps {
  outages: MapOutage[];
  subCities?: { id: string; name: string }[];
  height?: string;
  initialServiceFilter?: string;
  initialStatusFilter?: string;
  initialSubCity?: string;
  showFilters?: boolean;
}

export default function LeafletMapInner({
  outages,
  subCities = [],
  height = '560px',
  initialServiceFilter = 'ALL',
  initialStatusFilter = 'ALL',
  initialSubCity = 'ALL',
  showFilters = true,
}: MapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  const [serviceFilter, setServiceFilter] = useState(initialServiceFilter);
  const [statusFilter, setStatusFilter] = useState(initialStatusFilter);
  const [subCityFilter, setSubCityFilter] = useState(initialSubCity);

  // Addis Ababa coordinates
  const ADDIS_CENTER: [number, number] = [9.0200, 38.7500];

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: ADDIS_CENTER,
      zoom: 12,
      minZoom: 10,
      maxZoom: 18,
    });

    // Clean OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | Addis Water & Power',
      maxZoom: 19,
    }).addTo(map);

    markersLayerRef.current = L.layerGroup().addTo(map);
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Markers when outages or filters change
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;

    const markersGroup = markersLayerRef.current;
    markersGroup.clearLayers();

    const filtered = outages.filter((o) => {
      if (serviceFilter !== 'ALL' && o.serviceType !== serviceFilter) return false;
      if (statusFilter !== 'ALL') {
        if (statusFilter === 'ACTIVE' && !['ACTIVE', 'INVESTIGATING', 'VERIFIED'].includes(o.status)) {
          return false;
        }
        if (statusFilter === 'RESTORED' && o.status !== 'RESTORED') {
          return false;
        }
      }
      if (subCityFilter !== 'ALL' && o.subCity.id !== subCityFilter && o.subCity.name !== subCityFilter) {
        return false;
      }
      return true;
    });

    filtered.forEach((outage) => {
      const isRestored = outage.status === 'RESTORED';
      const isCritical = outage.severity === 'CRITICAL' || outage.severity === 'HIGH';
      const isWater = outage.serviceType === 'WATER';

      // Pick marker color and icon
      let markerColor = '#0284c7'; // Water blue
      let iconHtml = '💧';
      let pinClass = 'bg-sky-500';

      if (isRestored) {
        markerColor = '#10b981'; // Emerald
        iconHtml = '✓';
        pinClass = 'bg-emerald-500';
      } else if (isWater) {
        markerColor = isCritical ? '#0284c7' : '#38bdf8';
        iconHtml = '💧';
        pinClass = isCritical ? 'bg-sky-600 ring-2 ring-red-500 pulsing-marker' : 'bg-sky-500';
      } else {
        // Electricity
        markerColor = isCritical ? '#f59e0b' : '#fbbf24';
        iconHtml = '⚡';
        pinClass = isCritical ? 'bg-amber-500 ring-2 ring-red-500 pulsing-marker' : 'bg-amber-500';
      }

      const customIcon = L.divIcon({
        className: 'custom-outage-marker',
        html: `
          <div class="relative flex items-center justify-center">
            <div class="w-8 h-8 rounded-full ${pinClass} text-white flex items-center justify-center font-bold text-sm shadow-lg border-2 border-white cursor-pointer transform hover:scale-110 transition-transform">
              ${iconHtml}
            </div>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        popupAnchor: [0, -18],
      });

      const marker = L.marker([outage.latitude, outage.longitude], { icon: customIcon });

      const statusBadge = getStatusBadge(outage.status);

      const popupContent = `
        <div style="font-family: inherit; min-width: 240px; max-width: 280px; padding: 2px;">
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 6px;">
            <span style="font-size: 11px; font-weight: bold; text-transform: uppercase; color: ${isWater ? '#0284c7' : '#d97706'};">
              ${outage.serviceType === 'WATER' ? '💧 Water' : '⚡ Electricity'}
            </span>
            <span style="font-size: 10px; font-weight: 600; padding: 2px 6px; border-radius: 9999px; background: ${isRestored ? '#ecfdf5' : '#fef2f2'}; color: ${isRestored ? '#059669' : '#dc2626'};">
              ${outage.status}
            </span>
          </div>

          <h4 style="font-weight: 700; font-size: 13px; color: #0f172a; margin: 0 0 4px 0; line-height: 1.3;">
            ${outage.title}
          </h4>

          <div style="font-size: 11px; color: #64748b; margin-bottom: 6px;">
            📍 <strong>${outage.subCity.name}</strong> ${outage.specificLocation ? `• ${outage.specificLocation}` : ''}
          </div>

          <p style="font-size: 11px; color: #334155; line-height: 1.4; margin: 0 0 8px 0;">
            ${outage.description.length > 90 ? outage.description.substring(0, 87) + '...' : outage.description}
          </p>

          <div style="font-size: 10px; color: #64748b; margin-bottom: 8px; border-top: 1px solid #f1f5f9; padding-top: 6px;">
            <div>🕒 Started: ${formatTimeAgo(outage.startedAt)}</div>
            <div>👥 ${outage.affectedReportsCount} citizen reports</div>
            <div>🔄 Updated: ${formatTimeAgo(outage.updatedAt)}</div>
          </div>

          <a href="/outages/${outage.id}" style="display: block; text-align: center; background: #0f172a; color: white; padding: 6px 10px; border-radius: 8px; text-decoration: none; font-size: 11px; font-weight: 600;">
            View Full Outage Details →
          </a>
        </div>
      `;

      marker.bindPopup(popupContent, { maxWidth: 300 });
      markersGroup.addLayer(marker);
    });

    // If we have markers, auto-fit view slightly if user filtered
    if (filtered.length > 0 && (serviceFilter !== 'ALL' || statusFilter !== 'ALL' || subCityFilter !== 'ALL')) {
      const group = L.featureGroup(markersGroup.getLayers());
      if (group.getBounds().isValid()) {
        mapInstanceRef.current.fitBounds(group.getBounds(), { padding: [40, 40], maxZoom: 15 });
      }
    }
  }, [outages, serviceFilter, statusFilter, subCityFilter]);

  const resetView = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView(ADDIS_CENTER, 12);
      setServiceFilter('ALL');
      setStatusFilter('ALL');
      setSubCityFilter('ALL');
    }
  };

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-md bg-white dark:bg-slate-900">
      {/* Map Control Filters Bar */}
      {showFilters && (
        <div className="p-3 bg-white/95 dark:bg-slate-900/95 backdrop-blur border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2.5 z-10 text-xs">
          {/* Service Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              onClick={() => setServiceFilter('ALL')}
              className={`px-3 py-1 rounded-lg font-medium transition ${
                serviceFilter === 'ALL'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              All Utilities
            </button>
            <button
              onClick={() => setServiceFilter('WATER')}
              className={`flex items-center gap-1 px-3 py-1 rounded-lg font-medium transition ${
                serviceFilter === 'WATER'
                  ? 'bg-sky-500 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-sky-600'
              }`}
            >
              <Droplets className="w-3.5 h-3.5" /> Water
            </button>
            <button
              onClick={() => setServiceFilter('ELECTRICITY')}
              className={`flex items-center gap-1 px-3 py-1 rounded-lg font-medium transition ${
                serviceFilter === 'ELECTRICITY'
                  ? 'bg-amber-500 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-amber-600'
              }`}
            >
              <Zap className="w-3.5 h-3.5" /> Electricity
            </button>
          </div>

          {/* Status Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`px-3 py-1 rounded-lg font-medium transition ${
                statusFilter === 'ALL'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              All Statuses
            </button>
            <button
              onClick={() => setStatusFilter('ACTIVE')}
              className={`px-3 py-1 rounded-lg font-medium transition ${
                statusFilter === 'ACTIVE'
                  ? 'bg-red-500 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-red-500'
              }`}
            >
              🔴 Active Outages
            </button>
            <button
              onClick={() => setStatusFilter('RESTORED')}
              className={`px-3 py-1 rounded-lg font-medium transition ${
                statusFilter === 'RESTORED'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-emerald-500'
              }`}
            >
              🟢 Restored
            </button>
          </div>

          {/* Sub-City Filter */}
          <div className="flex items-center gap-2">
            <select
              value={subCityFilter}
              onChange={(e) => setSubCityFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium text-xs focus:ring-2 focus:ring-sky-500 outline-none"
            >
              <option value="ALL">All 11 Sub-Cities</option>
              {subCities.map((sc) => (
                <option key={sc.id} value={sc.name}>
                  {sc.name}
                </option>
              ))}
            </select>

            <button
              onClick={resetView}
              title="Reset Map to Addis Ababa Center"
              className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Map Container */}
      <div ref={mapContainerRef} style={{ height, width: '100%' }} className="z-0" />

      {/* Map Legend Floating Overlay */}
      <div className="absolute bottom-4 left-4 z-[400] bg-white/90 dark:bg-slate-900/90 backdrop-blur px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 shadow-md text-[11px] space-y-1">
        <div className="font-bold text-slate-800 dark:text-slate-200 mb-1">Addis Map Legend</div>
        <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
          <span className="w-3 h-3 rounded-full bg-sky-500 inline-block" />
          <span>💧 Water Outage</span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
          <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
          <span>⚡ Power Outage</span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
          <span className="w-3 h-3 rounded-full bg-red-600 pulsing-marker inline-block" />
          <span>🚨 Major / Critical</span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
          <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
          <span>✓ Service Restored</span>
        </div>
      </div>
    </div>
  );
}
