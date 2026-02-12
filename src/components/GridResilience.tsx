import { useMemo } from 'react';
import { Activity, Zap, TrendingUp } from 'lucide-react';

interface GridResilienceProps {
  solarWindSpeed: number; // km/s
  bz: number; // nT
  bt: number; // nT (total IMF magnitude)
}

/**
 * GridResilience - "Billion Dollar Metric"
 * Calculates power grid stress using Newell Coupling Function
 * Formula: P = v^(4/3) * B_t^(2/3) * sin^8(θ/2)
 * Where θ = arctan(|Bz|/Bt) for southward IMF
 */
export default function GridResilience({ solarWindSpeed, bz, bt }: GridResilienceProps) {
  const { score, level, history } = useMemo(() => {
    // Calculate clock angle (theta)
    const theta = bz < 0 ? Math.atan2(Math.abs(bz), bt) : 0;
    
    // Newell Coupling Function
    const v = solarWindSpeed; // km/s
    const vTerm = Math.pow(v / 1000, 4/3); // Normalize to 1000 km/s baseline
    const bTerm = Math.pow(bt, 2/3);
    const sinTerm = Math.pow(Math.sin(theta / 2), 8);
    
    const coupling = vTerm * bTerm * sinTerm;
    
    // Convert to 0-100 resilience score (inverted - low coupling = high resilience)
    const maxCoupling = 10; // Empirical max for extreme storms
    const resilienceScore = Math.max(0, Math.min(100, 100 - (coupling / maxCoupling) * 100));
    
    // Threat level
    let level: { label: string; color: string; bg: string; icon: any; impact: string };
    if (resilienceScore >= 80) {
      level = { 
        label: 'NOMINAL', 
        color: 'text-green-400', 
        bg: 'bg-green-900/40', 
        icon: Activity,
        impact: 'No significant grid impacts expected'
      };
    } else if (resilienceScore >= 50) {
      level = { 
        label: 'VOLTAGE FLUCTUATIONS', 
        color: 'text-yellow-400', 
        bg: 'bg-yellow-900/40', 
        icon: TrendingUp,
        impact: 'Minor voltage irregularities possible'
      };
    } else if (resilienceScore >= 20) {
      level = { 
        label: 'CRITICAL RISK', 
        color: 'text-orange-400', 
        bg: 'bg-orange-900/40', 
        icon: Zap,
        impact: 'Transformer stress, possible brownouts'
      };
    } else {
      level = { 
        label: 'CATASTROPHIC', 
        color: 'text-red-400', 
        bg: 'bg-red-900/40', 
        icon: Zap,
        impact: 'Grid collapse risk - Immediate action required'
      };
    }
    
    // Generate fake 24h history for sparkline (will be replaced with real data later)
    const history = Array.from({ length: 24 }, (_, i) => {
      const variation = Math.sin(i / 3) * 20 + Math.random() * 10;
      return Math.max(0, Math.min(100, resilienceScore + variation));
    });
    
    return { score: resilienceScore, level, history };
  }, [solarWindSpeed, bz, bt]);

  const Icon = level.icon;

  // Generate SVG sparkline path
  const sparklinePath = useMemo(() => {
    const width = 100;
    const height = 30;
    const points = history.map((val, i) => {
      const x = (i / (history.length - 1)) * width;
      const y = height - (val / 100) * height;
      return `${x},${y}`;
    });
    return `M${points.join(' L')}`;
  }, [history]);

  return (
    <div className={`${level.bg} backdrop-blur-md border-2 border-gray-600 rounded-lg p-3 min-w-[240px] shadow-lg`}>
      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <Icon className={`w-5 h-5 ${level.color} animate-pulse`} />
        <div>
          <div className="text-xs text-gray-400 font-bold tracking-wider">GRID RESILIENCE</div>
          <div className={`text-sm ${level.color} font-bold leading-none`}>{level.label}</div>
        </div>
      </div>

      {/* Score with Sparkline Background */}
      <div className="relative mb-2">
        {/* Sparkline SVG */}
        <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 100 30" preserveAspectRatio="none">
          <path
            d={sparklinePath}
            fill="none"
            stroke={level.color.replace('text-', '')}
            strokeWidth="2"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
        
        {/* Score */}
        <div className="relative z-10 text-center py-2">
          <div className={`text-4xl font-bold ${level.color}`}>
            {Math.round(score)}
          </div>
          <div className="text-[8px] text-gray-400">RESILIENCE INDEX</div>
        </div>
      </div>

      {/* Newell Coupling Details */}
      <div className="space-y-1 text-[9px] text-gray-300 mb-2 p-2 bg-black/30 rounded border border-gray-700">
        <div className="flex justify-between">
          <span className="text-gray-500">Solar Wind (v):</span>
          <span className="font-mono">{solarWindSpeed.toFixed(0)} km/s</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">IMF Bz:</span>
          <span className={`font-mono ${bz < -5 ? 'text-red-400' : 'text-gray-400'}`}>
            {bz.toFixed(1)} nT {bz < 0 ? '(South)' : '(North)'}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">IMF Bt:</span>
          <span className="font-mono">{bt.toFixed(1)} nT</span>
        </div>
      </div>

      {/* Impact Assessment */}
      <div className={`border-t border-gray-600 pt-2`}>
        <div className="text-[9px] text-gray-500 font-bold mb-1">INFRASTRUCTURE IMPACT:</div>
        <div className={`text-[10px] ${level.color} leading-tight`}>
          {level.impact}
        </div>
      </div>

      {/* Formula Reference */}
      <div className="mt-2 pt-2 border-t border-gray-700 text-[8px] text-gray-500 text-center">
        Newell Coupling: P = v<sup>4/3</sup> · B<sub>t</sub><sup>2/3</sup> · sin<sup>8</sup>(θ/2)
      </div>

      {/* 24h Trend Indicator */}
      <div className="mt-2 flex items-center gap-1 text-[8px] text-gray-400">
        <TrendingUp className="w-3 h-3" />
        <span>24h resilience trend</span>
      </div>
    </div>
  );
}
