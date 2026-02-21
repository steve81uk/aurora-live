/**
 * AlertClassificationService — NOAA-grade tiered alert system
 *
 * Mirrors the real NOAA Space Weather Operations Centre (SWOC) classification:
 *   - G1–G5 Geomagnetic storms
 *   - S1–S5 Solar radiation storms
 *   - R1–R5 Radio blackouts
 *   - Flare classification (A/B/C/M/X)
 *   - CME impact predictions with countdown
 *
 * Used by HeimdallHUD, OperatorConsole, and NotificationSystem
 */

export type StormClass = 'G0' | 'G1' | 'G2' | 'G3' | 'G4' | 'G5';
export type RadiationClass = 'S0' | 'S1' | 'S2' | 'S3' | 'S4' | 'S5';
export type BlackoutClass = 'R0' | 'R1' | 'R2' | 'R3' | 'R4' | 'R5';
export type FlareClass = 'A' | 'B' | 'C' | 'M' | 'X';

export interface AlertEvent {
  id: string;
  type: 'GEOMAGNETIC' | 'RADIATION' | 'BLACKOUT' | 'FLARE' | 'CME_IMPACT' | 'ANOMALY';
  level: StormClass | RadiationClass | BlackoutClass | string;
  severity: 1 | 2 | 3 | 4 | 5;
  title: string;
  description: string;
  timestamp: Date;
  expiresAt?: Date;
  countdown?: number;   // seconds until impact / expiry
  probability?: number; // 0–100
  source: string;
  color: string;
  icon: string;
}

export interface AlertStack {
  events: AlertEvent[];
  maxSeverity: number;
  dominantClass: string;
  lastUpdated: Date;
}

// ─── CLASSIFICATION FUNCTIONS ────────────────────────────────────────────────

export function classifyGeomagnetic(kp: number): StormClass {
  if (kp >= 9)  return 'G5';
  if (kp >= 8)  return 'G4';
  if (kp >= 7)  return 'G3';
  if (kp >= 6)  return 'G2';
  if (kp >= 5)  return 'G1';
  return 'G0';
}

export function classifyFlare(flux: number): { class: FlareClass; label: string } {
  if (flux >= 1e-4) return { class: 'X', label: `X${(flux / 1e-4).toFixed(1)}` };
  if (flux >= 1e-5) return { class: 'M', label: `M${(flux / 1e-5).toFixed(1)}` };
  if (flux >= 1e-6) return { class: 'C', label: `C${(flux / 1e-6).toFixed(1)}` };
  if (flux >= 1e-7) return { class: 'B', label: `B${(flux / 1e-7).toFixed(1)}` };
  return { class: 'A', label: `A${(flux / 1e-8).toFixed(1)}` };
}

import type { CMEArrival } from './SWPCDataService';

export interface ClassifiedInput {
  kp: number;
  kpForecast?: number[];
  xrayFlux?: number;
  protonFlux10MeV?: number;
  radioBlackoutActive?: boolean;
  cmeArrivals?: CMEArrival[];
  anomalyActive?: boolean;
  bzNT?: number;
}

/** Build a live alert stack from current space weather readings */
export function buildAlertStack(input: ClassifiedInput): AlertStack {
  const events: AlertEvent[] = [];
  const now = new Date();

  // 1. Geomagnetic storm
  const gLevel = classifyGeomagnetic(input.kp);
  if (input.kp >= 4) {
    const severity = Math.min(5, Math.max(1, input.kp - 3)) as 1 | 2 | 3 | 4 | 5;
    events.push({
      id:          `geo-${now.getTime()}`,
      type:        'GEOMAGNETIC',
      level:       gLevel,
      severity,
      title:       `${gLevel} Geomagnetic Storm`,
      description: `Kp=${input.kp.toFixed(1)}. ${
        input.bzNT && input.bzNT < -10
          ? `Strongly southward Bz (${input.bzNT.toFixed(1)} nT) driving enhanced coupling.`
          : input.kp >= 7 ? 'Power grid fluctuations possible. HF comms degraded.'
          : 'Aurora visible at high latitudes.'
      }`,
      timestamp: now,
      expiresAt: new Date(now.getTime() + 3 * 60 * 60 * 1000),
      probability: Math.min(99, input.kp * 11),
      source: 'NOAA SWPC / DSCOVR',
      color: severity >= 4 ? '#ef4444' : severity === 3 ? '#f97316' : '#facc15',
      icon: '🌐',
    });
  }

  // 2. Solar flare / radio blackout
  if (input.xrayFlux && input.xrayFlux >= 1e-6) {
    const flare = classifyFlare(input.xrayFlux);
    const severity = (flare.class === 'X' ? 5 : flare.class === 'M' ? 4 : flare.class === 'C' ? 3 : 2) as 1|2|3|4|5;
    events.push({
      id:          `xray-${now.getTime()}`,
      type:        'FLARE',
      level:       flare.label,
      severity,
      title:       `${flare.label} Solar Flare — ${input.radioBlackoutActive ? 'R3 Radio Blackout' : 'Active'}`,
      description: flare.class === 'X'
        ? 'Extreme X-ray flux. HF radio blackout on dayside hemisphere. Potential proton storm.'
        : `Moderate ${flare.label} event. ${input.radioBlackoutActive ? 'HF radio disrupted on sunlit hemisphere.' : 'Monitoring for proton event.'}`,
      timestamp: now,
      expiresAt: new Date(now.getTime() + 2 * 60 * 60 * 1000),
      probability: severity >= 4 ? 90 : 70,
      source: 'GOES-18 X-Ray Imager',
      color: severity >= 5 ? '#dc2626' : severity >= 4 ? '#f97316' : '#fbbf24',
      icon: '☀️',
    });
  }

  // 3. Radiation storm
  if (input.protonFlux10MeV && input.protonFlux10MeV >= 10) {
    const s = input.protonFlux10MeV >= 100000 ? 5 :
              input.protonFlux10MeV >= 10000  ? 4 :
              input.protonFlux10MeV >= 1000   ? 3 :
              input.protonFlux10MeV >= 100    ? 2 : 1;
    events.push({
      id:          `proton-${now.getTime()}`,
      type:        'RADIATION',
      level:       `S${s}`,
      severity:    s as 1|2|3|4|5,
      title:       `S${s} Radiation Storm`,
      description: `Proton flux ${input.protonFlux10MeV.toExponential(1)} p·cm⁻²·s⁻¹·sr⁻¹ (≥10 MeV). ${
        s >= 3 ? 'Satellite charging hazard. Polar aviation rerouting advised.' : 'Minor radiation storm. Polar HF impacted.'
      }`,
      timestamp: now,
      probability: 95,
      source: 'GOES-18 Particle Detector',
      color: s >= 4 ? '#ef4444' : '#f97316',
      icon: '⚛️',
    });
  }

  // 4. CME impact countdown
  if (input.cmeArrivals) {
    for (const cme of input.cmeArrivals) {
      const arrivalDate = new Date(cme.estimatedArrival);
      const secondsUntil = Math.round((arrivalDate.getTime() - now.getTime()) / 1000);
      if (secondsUntil > -7200 && secondsUntil < 72 * 3600) { // within 72h window
        const severity = Math.min(5, Math.max(1, Math.round(cme.predictedKpMax - 3))) as 1|2|3|4|5;
        events.push({
          id:          `cme-${cme.cmeId}`,
          type:        'CME_IMPACT',
          level:       `${Math.round(cme.predictedKpMax)}-${classifyGeomagnetic(cme.predictedKpMax)}`,
          severity,
          title:       secondsUntil < 0 ? 'CME Sheath Passage Active' : `CME Impact in ${formatCountdown(secondsUntil)}`,
          description: `${cme.model}: ${cme.speed_km_s} km/s CME launched ${cme.launchTime}. ${
            cme.impactProbability}% Earth impact probability. Predicted Kpmax ${cme.predictedKpMax.toFixed(0)}.`,
          timestamp:  new Date(cme.launchTime),
          expiresAt:  new Date(arrivalDate.getTime() + 24 * 60 * 60 * 1000),
          countdown:  Math.max(0, secondsUntil),
          probability: cme.impactProbability,
          source: 'NASA DONKI / WSA-Enlil',
          color: severity >= 4 ? '#ef4444' : severity >= 3 ? '#f97316' : '#facc15',
          icon: '☄️',
        });
      }
    }
  }

  // 5. LSTM anomaly
  if (input.anomalyActive) {
    events.push({
      id:          `anomaly-${now.getTime()}`,
      type:        'ANOMALY',
      level:       'ANOMALY',
      severity:    3,
      title:       'LSTM Anomaly Detected',
      description: 'Neural engine reconstruction error exceeds 2σ baseline. Non-typical solar wind pattern. Monitoring for rapid Kp escalation.',
      timestamp:   now,
      probability: 60,
      source:      'SKÖLL Neural Engine',
      color:       '#a78bfa',
      icon:        '🧠',
    });
  }

  // Sort by severity desc, then timestamp desc
  events.sort((a, b) => b.severity - a.severity || b.timestamp.getTime() - a.timestamp.getTime());

  const maxSeverity = events.reduce((m, e) => Math.max(m, e.severity), 0);
  const dominant = events[0];

  return {
    events,
    maxSeverity,
    dominantClass: dominant?.level ?? 'G0',
    lastUpdated: now,
  };
}

function formatCountdown(seconds: number): string {
  if (seconds < 3600)   return `${Math.round(seconds / 60)}m`;
  if (seconds < 86400)  return `${Math.floor(seconds / 3600)}h ${Math.round((seconds % 3600) / 60)}m`;
  return `${Math.floor(seconds / 86400)}d ${Math.floor((seconds % 86400) / 3600)}h`;
}
