import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return "N/A";
  const d = typeof date === "string" ? new Date(date) : date;
  return format(d, "MMM d, yyyy h:mm a");
}

export function formatTimeAgo(date: string | Date | null | undefined): string {
  if (!date) return "N/A";
  const d = typeof date === "string" ? new Date(date) : date;
  return formatDistanceToNow(d, { addSuffix: true });
}

export function getStatusBadge(status: string) {
  switch (status.toUpperCase()) {
    case 'ACTIVE':
      return {
        bg: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-900',
        dot: 'bg-red-500 animate-pulse',
        label: 'Active Outage',
      };
    case 'INVESTIGATING':
      return {
        bg: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900',
        dot: 'bg-amber-500',
        label: 'Investigating',
      };
    case 'VERIFIED':
      return {
        bg: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-900',
        dot: 'bg-blue-500',
        label: 'Verified',
      };
    case 'RESTORED':
      return {
        bg: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900',
        dot: 'bg-emerald-500',
        label: 'Restored',
      };
    case 'PENDING':
      return {
        bg: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-400 dark:border-purple-900',
        dot: 'bg-purple-500',
        label: 'Pending Verification',
      };
    case 'REJECTED':
      return {
        bg: 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-400',
        dot: 'bg-slate-400',
        label: 'Rejected',
      };
    default:
      return {
        bg: 'bg-slate-100 text-slate-700 border-slate-200',
        dot: 'bg-slate-400',
        label: status,
      };
  }
}

export function getServiceDetails(service: string) {
  if (service.toUpperCase() === 'WATER') {
    return {
      name: 'Water Outage',
      shortName: 'Water',
      color: 'water',
      iconClass: 'text-sky-600',
      badgeClass: 'bg-sky-100 text-sky-800 border-sky-200 dark:bg-sky-950 dark:text-sky-300',
      dotColor: '#0284c7',
      bgGrad: 'from-sky-500 to-cyan-600',
    };
  } else if (service.toUpperCase() === 'ELECTRICITY') {
    return {
      name: 'Electricity Outage',
      shortName: 'Electricity',
      color: 'power',
      iconClass: 'text-amber-600',
      badgeClass: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950 dark:text-amber-300',
      dotColor: '#f59e0b',
      bgGrad: 'from-amber-500 to-orange-600',
    };
  } else {
    return {
      name: 'Dual Utility Outage',
      shortName: 'Water & Power',
      color: 'civic',
      iconClass: 'text-indigo-600',
      badgeClass: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      dotColor: '#6366f1',
      bgGrad: 'from-indigo-600 to-blue-700',
    };
  }
}

// Haversine formula to compute distance in km between two GPS coordinates
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Radius of earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
