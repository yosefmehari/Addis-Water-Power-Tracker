'use client';

import dynamic from 'next/dynamic';
import React from 'react';

const DynamicMap = dynamic(() => import('./map/LeafletMapInner'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[560px] rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center gap-3 text-slate-500 animate-pulse">
      <div className="w-10 h-10 rounded-full border-4 border-sky-500 border-t-transparent animate-spin" />
      <p className="text-sm font-semibold">Loading Addis Ababa Interactive Outage Map...</p>
    </div>
  ),
});

export default function OutageMap(props: React.ComponentProps<typeof DynamicMap>) {
  return <DynamicMap {...props} />;
}
