/**
 * DONKIService — NASA DONKI real-time event feed
 * Fetches the latest space weather events (flares, CMEs, shocks, SEPs) from
 * the public DONKI API and exposes a React hook for live updates.
 *
 * Events are used to populate a mission log and to trigger simple 3D effects.
 */

export type DONKIEventType = 'FLR' | 'CME' | 'SEP' | 'HSS' | 'RBE' | 'WSA' | 'KBC' | string;

export interface DONKIEvent {
  id: string;             // unique identifier e.g. date+type
  type: DONKIEventType;
  time: string;           // ISO timestamp
  message: string;        // human-readable summary
  details?: any;          // raw data payload
}

const DONKI_BASE = 'https://kauai.ccmc.gsfc.nasa.gov/DONKI/WS';

async function fetchEndpoint(path: string): Promise<any[]> {
  try {
    const resp = await fetch(`${DONKI_BASE}/${path}`, { cache: 'no-store', signal: AbortSignal.timeout(10000) });
    if (!resp.ok) return [];
    return await resp.json();
  } catch {
    return [];
  }
}

export async function fetchDONKIEvents(): Promise<DONKIEvent[]> {
  // We'll combine several feeds: CME, FLR (flares), SEP, HSS
  const [cmes, flrs, seps, hss] = await Promise.all([
    fetchEndpoint('get/CME'),
    fetchEndpoint('get/FLR'),
    fetchEndpoint('get/SEP'),
    fetchEndpoint('get/HSS')
  ]);

  const events: DONKIEvent[] = [];

  for (const d of cmes) {
    events.push({
      id: `CME-${d.cmeNumber}-${d.activityID || d.startTime}`,
      type: 'CME',
      time: d.startTime || d.cmeAnalyses?.[0]?.startTime || '',
      message: `CME detected ${d.cmeType || ''} speed ${d.speed || '?'} km/s`,
      details: d
    });
  }
  for (const d of flrs) {
    events.push({
      id: `FLR-${d.flrID || d.beginTime}`,
      type: 'FLR',
      time: d.beginTime || '',
      message: `${d.classType}${d.classMagnitude} flare in AR${d.sourceLocation?.split('N')[0] || ''}`,
      details: d
    });
  }
  for (const d of seps) {
    events.push({
      id: `SEP-${d.sepID || d.beginTime}`,
      type: 'SEP',
      time: d.beginTime || '',
      message: `Solar energetic particle event, peak flux ${d.peakFlux || '?'} pfu`,
      details: d
    });
  }
  for (const d of hss) {
    events.push({
      id: `HSS-${d.hssID || d.eventTime}`,
      type: 'HSS',
      time: d.eventTime || '',
      message: `High-speed stream from ${d.sourceRegion || '?'} speed ${d.speed || '?'}`,
      details: d
    });
  }

  // sort newest first
  events.sort((a,b) => new Date(b.time).getTime() - new Date(a.time).getTime());
  return events;
}

// React hook
import { useEffect, useState } from 'react';

export function useDONKI(pollIntervalMs: number = 60 * 60 * 1000) {
  const [events, setEvents] = useState<DONKIEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      const ev = await fetchDONKIEvents();
      if (!cancelled) {
        setEvents(ev);
        setLoading(false);
      }
    };
    load();
    const iv = setInterval(load, pollIntervalMs);
    return () => { cancelled = true; clearInterval(iv); };
  }, [pollIntervalMs]);

  return { events, loading };
}
