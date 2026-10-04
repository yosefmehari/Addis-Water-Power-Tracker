import React from 'react';
import Link from 'next/link';
import {
  Droplets,
  Zap,
  Phone,
  ShieldCheck,
  Users,
  MapPin,
  CheckCircle2,
  Clock,
  HelpCircle,
  PlusCircle
} from 'lucide-react';

export default function AboutPage() {
  const faqs = [
    {
      q: 'How does an outage report get verified?',
      a: 'When residents report an outage through this platform, our system clusters nearby reports within the same sub-city and woreda. Municipal utility dispatchers and verified operations officers check the reports against telemetry data, call center tickets, and field dispatches to verify and promote the incident to Active status.'
    },
    {
      q: 'Can I report without creating an account?',
      a: 'Yes! Anyone can submit an outage report immediately by providing the location and description. However, registered users receive real-time notifications when their sub-city is affected and when services in their area are restored.'
    },
    {
      q: 'What should I do in life-threatening utility emergencies?',
      a: 'For fallen high-voltage electrical cables, active wire sparking, or major pressurized water main flooding that threatens infrastructure, immediately contact EEU directly at 905 or AAWSA at 944, or call Addis Ababa Fire & Emergency Services at 939.'
    },
    {
      q: 'Are all 11 sub-cities of Addis Ababa covered?',
      a: 'Yes. The platform provides full coverage for Bole, Yeka, Kirkos, Arada, Lideta, Addis Ketema, Nifas Silk-Lafto, Kolfe Keranio, Gullele, Akaky Kaliti, and Lemi Kura.'
    }
  ];

  return (
    <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Hero */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300">
          <ShieldCheck className="w-4 h-4" />
          <span>Civic Infrastructure Platform</span>
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
          About Addis Water & Power Tracker
        </h1>
        <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed">
          A modern civic technology initiative designed to bring real-time transparency, accountability, and citizen empowerment to public utility management in Addis Ababa.
        </p>
      </div>

      {/* 3 Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-sky-100 dark:bg-sky-950/60 text-sky-600 flex items-center justify-center font-bold text-xl">
            💧
          </div>
          <h3 className="font-bold text-lg text-slate-900 dark:text-white">Water Grid Monitoring</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Tracking supply interruptions, burst distribution mains, contamination reports, and planned reservoir sedimentation cleans across AAWSA branches.
          </p>
        </div>

        <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center font-bold text-xl">
            ⚡
          </div>
          <h3 className="font-bold text-lg text-slate-900 dark:text-white">Electric Grid Tracking</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Mapping medium-voltage distribution feeder trips, blown neighborhood transformers, and scheduled substation upgrades across Ethiopian Electric Utility zones.
          </p>
        </div>

        <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center font-bold text-xl">
            🤝
          </div>
          <h3 className="font-bold text-lg text-slate-900 dark:text-white">Citizen & Dispatcher Synergy</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Crowdsourced outage confirmation enables rapid cluster detection while dispatchers publish verified progress updates and estimated restoration windows.
          </p>
        </div>
      </div>

      {/* Emergency Hotline Directory */}
      <div className="p-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Official Municipal Utility Hotlines
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            24/7 emergency toll-free contact numbers for Addis Ababa public utilities
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-sky-50 dark:bg-sky-950/40 border border-sky-100 dark:border-sky-900 flex flex-col justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-sky-800 dark:text-sky-300">
                Water & Sewerage
              </span>
              <h4 className="font-bold text-base text-slate-900 dark:text-white mt-1">
                AAWSA Dispatch
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                Water pipe rupture, water tankers, sewage blockages
              </p>
            </div>
            <a
              href="tel:944"
              className="mt-4 inline-flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-sky-600 text-white font-extrabold text-sm shadow-sm"
            >
              <Phone className="w-4 h-4" /> Call 944
            </a>
          </div>

          <div className="p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-900 flex flex-col justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300">
                Electricity
              </span>
              <h4 className="font-bold text-base text-slate-900 dark:text-white mt-1">
                EEU Call Center
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                Power failure, blown transformers, fallen cables
              </p>
            </div>
            <a
              href="tel:905"
              className="mt-4 inline-flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-amber-500 text-white font-extrabold text-sm shadow-sm"
            >
              <Phone className="w-4 h-4" /> Call 905
            </a>
          </div>

          <div className="p-5 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-100 dark:border-red-900 flex flex-col justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-red-800 dark:text-red-300">
                Rescue & Disaster
              </span>
              <h4 className="font-bold text-base text-slate-900 dark:text-white mt-1">
                Fire & Emergency
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                Electrical fires, massive structural flooding
              </p>
            </div>
            <a
              href="tel:939"
              className="mt-4 inline-flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-red-600 text-white font-extrabold text-sm shadow-sm"
            >
              <Phone className="w-4 h-4" /> Call 939
            </a>
          </div>
        </div>
      </div>

      {/* Frequently Asked Questions */}
      <div className="p-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-6">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <HelpCircle className="w-6 h-6 text-sky-600" />
          Frequently Asked Questions
        </h2>

        <div className="space-y-4 divide-y divide-slate-100 dark:divide-slate-800">
          {faqs.map((faq, i) => (
            <div key={i} className="pt-4 first:pt-0 space-y-1.5">
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                {faq.q}
              </h4>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="text-center space-y-4 pt-4">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white">
          Help Build a More Resilient Addis Ababa
        </h3>
        <div className="flex justify-center gap-3">
          <Link
            href="/report"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-xs bg-red-600 hover:bg-red-700 text-white shadow-md transition"
          >
            <PlusCircle className="w-4 h-4" /> Report an Outage Now
          </Link>
          <Link
            href="/map"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-xs border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            View Live Outage Map
          </Link>
        </div>
      </div>
    </div>
  );
}
