'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  Droplets,
  Zap,
  MapPin,
  Clock,
  Users,
  CheckCircle,
  Share2,
  ArrowLeft,
  AlertTriangle,
  Send,
  MessageSquare,
  ShieldCheck,
  Calendar,
  ThumbsUp,
  RefreshCw
} from 'lucide-react';
import { getStatusBadge, getServiceDetails, formatTimeAgo, formatDate } from '@/lib/utils';
import { useToast } from '@/components/ToastProvider';
import { useAuth } from '@/contexts/AuthContext';
import OutageMap from '@/components/OutageMap';

export default function OutageDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const { user } = useAuth();
  const { success, error, info } = useToast();

  const [outage, setOutage] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [commentInput, setCommentInput] = useState('');
  const [restorationNote, setRestorationNote] = useState('');
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [submittingAction, setSubmittingAction] = useState(false);

  useEffect(() => {
    if (id) {
      fetchOutage();
    }
  }, [id]);

  const fetchOutage = async () => {
    try {
      const res = await fetch(`/api/outages/${id}`);
      if (res.ok) {
        const data = await res.json();
        setOutage(data.outage);
      } else {
        setOutage(null);
      }
    } catch {
      setOutage(null);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmAffected = async () => {
    setSubmittingAction(true);
    try {
      const res = await fetch(`/api/outages/${id}/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ comment: commentInput || 'User confirmed experiencing this outage' }),
      });
      const data = await res.json();
      if (res.ok) {
        success('Thank you! Your confirmation and status have been updated.');
        setCommentInput('');
        fetchOutage();
      } else {
        error(data.error || 'Failed to submit confirmation');
      }
    } catch {
      error('Network error submitting confirmation');
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleReportRestored = async () => {
    setSubmittingAction(true);
    try {
      const res = await fetch(`/api/outages/${id}/restore`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note: restorationNote }),
      });
      const data = await res.json();
      if (res.ok) {
        success('Restoration report recorded! Dispatchers will verify full recovery.');
        setShowRestoreModal(false);
        setRestorationNote('');
        fetchOutage();
      } else {
        error(data.error || 'Failed to report restoration');
      }
    } catch {
      error('Network error reporting restoration');
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      info('Outage link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto w-full px-4 py-12 space-y-6 animate-pulse">
        <div className="h-6 w-32 bg-slate-200 dark:bg-slate-800 rounded-lg" />
        <div className="h-40 bg-slate-200 dark:bg-slate-800 rounded-3xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 h-72 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
          <div className="h-72 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!outage) {
    return (
      <div className="max-w-xl mx-auto w-full px-4 py-20 text-center space-y-4">
        <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Outage Not Found</h2>
        <p className="text-sm text-slate-500">
          The requested utility outage incident record could not be found or may have been deleted.
        </p>
        <Link
          href="/outages"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-semibold text-xs mt-2"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Outages Feed
        </Link>
      </div>
    );
  }

  const statusBadge = getStatusBadge(outage.status);
  const serviceInfo = getServiceDetails(outage.serviceType);
  const isWater = outage.serviceType === 'WATER';

  return (
    <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Navigation Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          href="/outages"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Outages Feed
        </Link>

        <button
          onClick={handleShare}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
        >
          <Share2 className="w-3.5 h-3.5" /> Share Incident
        </button>
      </div>

      {/* Main Incident Hero Card */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${serviceInfo.badgeClass}`}>
                {isWater ? <Droplets className="w-4 h-4" /> : <Zap className="w-4 h-4" />}
                {serviceInfo.name}
              </span>

              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${statusBadge.bg}`}>
                <span className={`w-2 h-2 rounded-full ${statusBadge.dot}`} />
                {statusBadge.label}
              </span>

              <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full">
                {outage.problemType}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950 dark:text-white tracking-tight">
              {outage.title}
            </h1>

            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 pt-1">
              <span className="flex items-center gap-1 font-semibold text-slate-800 dark:text-slate-200">
                <MapPin className="w-4 h-4 text-sky-600" />
                {outage.subCity.name} Sub-City {outage.woreda ? `• ${outage.woreda.name}` : ''}
              </span>
              {outage.specificLocation && (
                <span>({outage.specificLocation})</span>
              )}
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                Started {formatTimeAgo(outage.startedAt)} ({formatDate(outage.startedAt)})
              </span>
            </div>
          </div>

          {/* Quick Counter */}
          <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 shrink-0">
            <span className="text-xs font-medium text-slate-500">Affected Reports</span>
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {outage.affectedReportsCount}
            </span>
            {outage.restoredVotesCount > 0 && (
              <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 mt-1">
                {outage.restoredVotesCount} residents voted restored
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons Row */}
        <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={handleConfirmAffected}
            disabled={submittingAction}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:bg-sky-600 dark:hover:bg-sky-400 hover:text-white transition shadow-sm"
          >
            <Users className="w-4 h-4" />
            <span>I Am Also Affected</span>
          </button>

          {outage.status !== 'RESTORED' && (
            <button
              onClick={() => setShowRestoreModal(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white transition shadow-sm"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Report Service Returned</span>
            </button>
          )}

          {outage.estimatedRestoration && (
            <div className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-sky-50 dark:bg-sky-950/40 text-sky-800 dark:text-sky-300 text-xs font-medium border border-sky-100 dark:border-sky-900">
              <Calendar className="w-3.5 h-3.5" />
              <span>Est. Restoration: {formatDate(outage.estimatedRestoration)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Grid: Details, Timeline, Confirmations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Description, Updates Timeline, Confirmations */}
        <div className="lg:col-span-2 space-y-6">
          {/* Detailed Description */}
          <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              Incident Overview & Causes
            </h3>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
              {outage.description}
            </p>

            {outage.verifiedBy && (
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2 text-xs text-slate-500">
                <ShieldCheck className="w-4 h-4 text-sky-600" />
                <span>Verified by Municipal Dispatcher: <strong>{outage.verifiedBy.name}</strong></span>
              </div>
            )}
          </div>

          {/* Official Updates Timeline */}
          <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                <Clock className="w-4 h-4 text-sky-600" />
                Official Maintenance & Progress Timeline
              </h3>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                {outage.updates?.length || 0} updates
              </span>
            </div>

            {outage.updates && outage.updates.length > 0 ? (
              <div className="relative pl-6 space-y-6 border-l-2 border-sky-200 dark:border-sky-900 my-2">
                {outage.updates.map((up: any) => (
                  <div key={up.id} className="relative group">
                    <span className="absolute -left-[31px] top-1.5 w-3.5 h-3.5 rounded-full bg-sky-500 border-2 border-white dark:border-slate-900" />
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                          {up.title}
                        </h4>
                        <span className="text-[11px] text-slate-400">
                          {formatTimeAgo(up.createdAt)}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                        {up.message}
                      </p>
                      {up.author && (
                        <p className="text-[10px] text-slate-400 mt-1">
                          Posted by {up.author.name}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic py-2">
                No official crew updates logged yet. Technicians have been alerted.
              </p>
            )}
          </div>

          {/* Resident Confirmations & Community Notes */}
          <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-amber-500" />
              Resident Confirmations & Field Notes
            </h3>

            {/* Quick Comment submission box */}
            <div className="space-y-2">
              <textarea
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                placeholder="Add additional information (e.g., 'Street 4 also affected', 'Low pressure at building 12')..."
                rows={2}
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:ring-2 focus:ring-sky-500 outline-none"
              />
              <button
                onClick={handleConfirmAffected}
                disabled={submittingAction || !commentInput.trim()}
                className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white font-semibold text-xs flex items-center gap-1.5 transition ml-auto"
              >
                <Send className="w-3.5 h-3.5" /> Submit Confirmation
              </button>
            </div>

            {/* Confirmations List */}
            <div className="space-y-3 pt-2 divide-y divide-slate-100 dark:divide-slate-800">
              {outage.confirmations && outage.confirmations.length > 0 ? (
                outage.confirmations.map((conf: any) => (
                  <div key={conf.id} className="pt-3 first:pt-0">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {conf.user?.name || 'Local Resident'}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {formatTimeAgo(conf.createdAt)}
                      </span>
                    </div>
                    {conf.comment && (
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                        "{conf.comment}"
                      </p>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 py-2">
                  No comments yet. Be the first to confirm this outage.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Right Column (1 Col): Location Map & Technical Info */}
        <div className="space-y-6">
          {/* Map Preview */}
          <div className="p-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
              <MapPin className="w-4 h-4 text-sky-600" />
              Incident Location
            </h3>

            <div className="h-64 w-full rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
              <OutageMap outages={[outage]} height="256px" showFilters={false} />
            </div>

            <div className="text-xs space-y-1 text-slate-500 pt-1">
              <div><strong>Sub-City:</strong> {outage.subCity.name}</div>
              {outage.woreda && <div><strong>Woreda:</strong> {outage.woreda.name}</div>}
              {outage.area && <div><strong>Area:</strong> {outage.area.name}</div>}
              {outage.specificLocation && <div><strong>Address:</strong> {outage.specificLocation}</div>}
              <div><strong>Coordinates:</strong> {outage.latitude.toFixed(4)}, {outage.longitude.toFixed(4)}</div>
            </div>
          </div>

          {/* Municipal Emergency Hotlines */}
          <div className="p-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">
              Need Direct Assistance?
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              If this incident poses imminent safety hazards (electrical sparks, high-pressure flooding), contact municipal emergency responders directly:
            </p>

            <div className="space-y-2 pt-1 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-100 dark:border-sky-900">
                <span className="font-bold text-sky-900 dark:text-sky-300">AAWSA Water Line</span>
                <a href="tel:944" className="font-extrabold text-sky-600">944</a>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-900">
                <span className="font-bold text-amber-900 dark:text-amber-300">EEU Power Emergency</span>
                <a href="tel:905" className="font-extrabold text-amber-600">905</a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Restoration Report Modal Dialog */}
      {showRestoreModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <CheckCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  Report Service Restored
                </h3>
                <p className="text-xs text-slate-500">
                  Has utility service returned to your premises?
                </p>
              </div>
            </div>

            <textarea
              value={restorationNote}
              onChange={(e) => setRestorationNote(e.target.value)}
              placeholder="Optional: Mention tap pressure, electrical stability, or your specific street..."
              rows={3}
              className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
            />

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowRestoreModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={handleReportRestored}
                disabled={submittingAction}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition"
              >
                {submittingAction ? 'Submitting...' : 'Confirm Restored'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
