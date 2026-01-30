import { useState, useEffect } from 'react';

interface FireballEvent {
  date: string; // Date and time (UT)
  energy: string; // Total radiated energy (J)
  impactE: string; // Estimated impact energy (kt)
  lat: string; // Latitude (degrees)
  latDir: string; // Latitude direction (N/S)
  lon: string; // Longitude (degrees)
  lonDir: string; // Longitude direction (E/W)
  alt: string; // Altitude (km)
  vel: string; // Velocity (km/s)
}

interface FireballData {
  signature: {
    source: string;
    version: string;
  };
  count: string;
  fields: string[];
  data: string[][];
}

export function useNASAFireballs(limit: number = 20) {
  const [fireballs, setFireballs] = useState<FireballEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  useEffect(() => {
    let mounted = true;

    const fetchFireballs = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `https://ssd-api.jpl.nasa.gov/fireball.api?limit=${limit}&req-loc=true`
        );

        if (!response.ok) {
          throw new Error(`NASA API error: ${response.status}`);
        }

        const data: FireballData = await response.json();

        if (!mounted) return;

        // Parse data arrays into objects
        const events: FireballEvent[] = data.data.map((row) => ({
          date: row[0],
          energy: row[1],
          impactE: row[2],
          lat: row[3],
          latDir: row[4],
          lon: row[5],
          lonDir: row[6],
          alt: row[7],
          vel: row[8],
        }));

        setFireballs(events);
        setLastUpdate(new Date());
        setError(null);
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Unknown error');
          console.error('NASA Fireball API error:', err);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchFireballs();

    // Refresh every 6 hours (data updates slowly)
    const interval = setInterval(fetchFireballs, 6 * 60 * 60 * 1000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [limit]);

  return { fireballs, loading, error, lastUpdate };
}
