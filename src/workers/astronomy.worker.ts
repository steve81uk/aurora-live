/**
 * astronomy.worker.ts — Web Worker for off-thread astronomical calculations
 *
 * Moves CPU-intensive orbital position calculations off the main thread,
 * keeping the render loop butter-smooth at 60fps.
 *
 * Messages IN:
 *   { type: 'COMPUTE_POSITIONS', date: number, bodies: string[] }
 *   { type: 'JPL_QUERY', date: number, body: string }
 *
 * Messages OUT:
 *   { type: 'POSITIONS_RESULT', positions: Record<string, [number, number, number]> }
 *   { type: 'JPL_RESULT', body: string, position: [number, number, number] }
 *   { type: 'ERROR', message: string }
 */

import * as Astronomy from 'astronomy-engine';

const AU_TO_UNITS = 40;

const BODY_MAP: Record<string, Astronomy.Body> = {
  Mercury: Astronomy.Body.Mercury,
  Venus:   Astronomy.Body.Venus,
  Earth:   Astronomy.Body.Earth,
  Mars:    Astronomy.Body.Mars,
  Jupiter: Astronomy.Body.Jupiter,
  Saturn:  Astronomy.Body.Saturn,
  Uranus:  Astronomy.Body.Uranus,
  Neptune: Astronomy.Body.Neptune,
};

function computePositions(date: number, bodies: string[]): Record<string, [number, number, number]> {
  const astroDate = new Date(date);
  const t = Astronomy.MakeTime(astroDate);

  const result: Record<string, [number, number, number]> = {};
  for (const name of bodies) {
    const body = BODY_MAP[name];
    if (!body) {
      result[name] = [0, 0, 0];
      continue;
    }
    try {
      const vec = Astronomy.HelioVector(body, t);
      // Three.js Y-up: X=ecliptic X, Y=ecliptic Z (north), Z=ecliptic Y
      result[name] = [
        vec.x * AU_TO_UNITS,
        vec.z * AU_TO_UNITS,
        vec.y * AU_TO_UNITS,
      ];
    } catch {
      result[name] = [0, 0, 0];
    }
  }
  return result;
}

self.onmessage = (event: MessageEvent) => {
  const { type } = event.data;

  if (type === 'COMPUTE_POSITIONS') {
    const { date, bodies } = event.data as { date: number; bodies: string[] };
    try {
      const positions = computePositions(date, bodies);
      self.postMessage({ type: 'POSITIONS_RESULT', positions });
    } catch (err) {
      self.postMessage({ type: 'ERROR', message: String(err) });
    }
    return;
  }

  if (type === 'COMPUTE_MOON_PHASES') {
    const { date } = event.data as { date: number };
    try {
      const t = Astronomy.MakeTime(new Date(date));
      const moonPhase = Astronomy.MoonPhase(t);
      const illumination = (1 - Math.cos((moonPhase * Math.PI) / 180)) / 2;
      self.postMessage({ type: 'MOON_PHASE_RESULT', phase: moonPhase, illumination });
    } catch (err) {
      self.postMessage({ type: 'ERROR', message: String(err) });
    }
    return;
  }

  if (type === 'COMPUTE_RISE_SET') {
    const { date, lat, lon, body } = event.data;
    try {
      const t = Astronomy.MakeTime(new Date(date));
      const observer = new Astronomy.Observer(lat, lon, 0);
      const astroBody = BODY_MAP[body];
      if (astroBody) {
        const rise = Astronomy.SearchRiseSet(astroBody, observer, +1, t, 1);
        const set  = Astronomy.SearchRiseSet(astroBody, observer, -1, t, 1);
        self.postMessage({
          type: 'RISE_SET_RESULT',
          body,
          rise: rise ? new Date(rise.date).toISOString() : null,
          set:  set  ? new Date(set.date).toISOString()  : null,
        });
      }
    } catch (err) {
      self.postMessage({ type: 'ERROR', message: String(err) });
    }
    return;
  }
};
