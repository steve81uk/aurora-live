/**
 * useAstronomyWorker — React hook for off-thread planetary position calculations
 * Uses astronomy.worker.ts to keep the main render thread free.
 */

import { useRef, useEffect, useState, useCallback } from 'react';
import type * as THREE from 'three';

export interface PlanetPositions {
  [bodyName: string]: [number, number, number];
}

export function useAstronomyWorker(date: Date, bodies: string[]) {
  const workerRef = useRef<Worker | null>(null);
  const [positions, setPositions] = useState<PlanetPositions>({});
  const bodiesKey = bodies.join(',');

  useEffect(() => {
    // Create worker using Vite's ?worker syntax — bundled at build time
    const worker = new Worker(
      new URL('../workers/astronomy.worker.ts', import.meta.url),
      { type: 'module' }
    );
    workerRef.current = worker;

    worker.onmessage = (e: MessageEvent) => {
      if (e.data.type === 'POSITIONS_RESULT') {
        setPositions(e.data.positions);
      }
    };

    return () => {
      worker.terminate();
      workerRef.current = null;
    };
  }, []);

  // Send calculation request whenever date or body list changes
  useEffect(() => {
    if (!workerRef.current) return;
    workerRef.current.postMessage({
      type:   'COMPUTE_POSITIONS',
      date:   date.getTime(),
      bodies: bodies,
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date.getTime(), bodiesKey]);

  // Manual trigger for on-demand recalculation
  const recalculate = useCallback(() => {
    if (!workerRef.current) return;
    workerRef.current.postMessage({
      type:   'COMPUTE_POSITIONS',
      date:   Date.now(),
      bodies: bodies,
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bodiesKey]);

  return { positions, recalculate };
}
