import { useEffect, useRef, useState } from 'react';
import { useSpaceState } from '../services/DataBridge';

/**
 * BzGauge — prominent Bz display with history sparkline and southward timer
 */
export function BzGauge() {
  const { spaceState } = useSpaceState();
  const [history, setHistory] = useState<number[]>([]);
  const [southwardMinutes, setSouthwardMinutes] = useState(0);

  useEffect(() => {
    const tick = () => {
      const bz = spaceState?.solar?.solarWind?.bz ?? 0;
      setHistory(h => {
        const next = [...h.slice(-59), bz];
        return next;
      });
      // recompute southward duration
      setSouthwardMinutes(prev => bz < 0 ? prev + 1 : 0);
    };
    // update once per minute
    const iv = setInterval(tick, 60_000);
    tick();
    return () => clearInterval(iv);
  }, [spaceState]);

  // sparkline path
  const svgRef = useRef<SVGPathElement>(null);
  useEffect(() => {
    if (!svgRef.current) return;
    const pts = history;
    const w = 100, h = 30;
    if (pts.length === 0) {
      svgRef.current.setAttribute('d', '');
      return;
    }
    const max = Math.max(...pts.map(v => Math.abs(v), 0)) || 10;
    let d = '';
    pts.forEach((v, i) => {
      const x = (i / (pts.length - 1)) * w;
      const y = h / 2 - (v / max) * (h / 2);
      d += i === 0 ? `M${x},${y}` : ` L${x},${y}`;
    });
    svgRef.current.setAttribute('d', d);
  }, [history]);

  const current = history[history.length - 1] ?? 0;
  const color = current < -5 ? '#ef4444' : current < 0 ? '#f97316' : '#22d3ee';

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="text-[9px] font-mono text-gray-400 uppercase tracking-widest">IMF Bz</div>
      <div className="relative">
        <svg width={100} height={30} className="block">
          <path ref={svgRef} stroke={color} strokeWidth={1.5} fill="none" />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="text-xs font-mono" style={{ color }}>{current.toFixed(1)} nT</span>
        </div>
      </div>
      {southwardMinutes > 0 && (
        <div className="text-[8px] font-mono" style={{ color }}>
          {southwardMinutes}m southward
        </div>
      )}
    </div>
  );
}
