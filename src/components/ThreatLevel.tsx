import { useMemo } from 'react';
import { AlertTriangle, Zap, Shield, Activity } from 'lucide-react';

interface ThreatLevelProps {
  kpValue?: number;
  solarWindSpeed?: number;
  bz?: number | null;
}

/**
 * ThreatLevel - "Doomsday Monitor"
 * Real-time space weather threat assessment
 * Inspired by NOAA scales and NASA impact predictions
 */
export default function ThreatLevel({ kpValue = 0, solarWindSpeed = 400, bz = null }: ThreatLevelProps) {
  // Safety check: ensure values are numbers
  const safeKp = typeof kpValue === 'number' && !isNaN(kpValue) ? kpValue : 0;
  const safeSolarWind = typeof solarWindSpeed === 'number' && !isNaN(solarWindSpeed) ? solarWindSpeed : 400;
  const safeBz = typeof bz === 'number' && !isNaN(bz) ? bz : null;
  
  const threat = useMemo(() => {
    // Calculate composite threat score (0-100)
    let score = 0;
    
    // Kp contribution (0-50 points)
    score += (safeKp / 9) * 50;
    
    // Solar wind speed contribution (0-30 points)
    if (safeSolarWind > 800) score += 30;
    else if (safeSolarWind > 600) score += 20;
    else if (safeSolarWind > 500) score += 10;
    
    // Bz (southward IMF) contribution (0-20 points)
    if (safeBz !== null && safeBz < -10) score += 20;
    else if (safeBz !== null && safeBz < -5) score += 10;
    
    // Threat levels
    if (score >= 80) return { level: 'EXTREME', color: '#ff0000', bg: 'bg-red-900/40', border: 'border-red-500', text: 'text-red-400', icon: AlertTriangle, label: 'CRITICAL THREAT' };
    if (score >= 60) return { level: 'SEVERE', color: '#ff6600', bg: 'bg-orange-900/40', border: 'border-orange-500', text: 'text-orange-400', icon: Zap, label: 'HIGH THREAT' };
    if (score >= 40) return { level: 'MODERATE', color: '#ffcc00', bg: 'bg-yellow-900/40', border: 'border-yellow-500', text: 'text-yellow-400', icon: Activity, label: 'ELEVATED' };
    if (score >= 20) return { level: 'MINOR', color: '#00ff00', bg: 'bg-green-900/40', border: 'border-green-500', text: 'text-green-400', icon: Shield, label: 'NOMINAL' };
    return { level: 'QUIET', color: '#00ccff', bg: 'bg-cyan-900/40', border: 'border-cyan-500', text: 'text-cyan-400', icon: Shield, label: 'ALL CLEAR' };
  }, [safeKp, safeSolarWind, safeBz]);

  const impacts = useMemo(() => {
    const list: string[] = [];
    
    if (safeKp >= 7) {
      list.push('⚡ Power grid fluctuations possible');
      list.push('📡 Satellite operations affected');
      list.push('✈️ HF radio blackouts likely');
    } else if (safeKp >= 5) {
      list.push('⚡ Minor power anomalies possible');
      list.push('📡 Satellite tracking degraded');
      list.push('📻 HF radio interference');
    } else if (safeKp >= 3) {
      list.push('📡 GPS accuracy reduced');
      list.push('📻 Weak HF propagation');
    }
    
    if (safeSolarWind > 700) {
      list.push('🌪️ Extreme solar wind pressure');
    }
    
    if (safeBz !== null && safeBz < -10) {
      list.push('🧲 Strong southward IMF (geoeffective)');
    }
    
    if (list.length === 0) {
      list.push('✅ No significant impacts expected');
    }
    
    return list;
  }, [safeKp, safeSolarWind, safeBz]);

  const Icon = threat.icon;

  return (
    <div className={`${threat.bg} backdrop-blur-md border-2 ${threat.border} rounded-lg p-3 min-w-[220px] shadow-lg`}>
      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <Icon className={`w-5 h-5 ${threat.text} animate-pulse`} />
        <div>
          <div className={`text-xs ${threat.text} font-bold tracking-wider`}>THREAT LEVEL</div>
          <div className={`text-lg ${threat.text} font-bold leading-none`}>{threat.label}</div>
        </div>
      </div>

      {/* Threat Score Bar */}
      <div className="w-full h-2 bg-black/50 rounded-full overflow-hidden mb-2">
        <div 
          className={`h-full transition-all duration-1000 ease-out`}
          style={{ 
            width: `${Math.min((safeKp / 9) * 100, 100)}%`,
            backgroundColor: threat.color,
            boxShadow: `0 0 10px ${threat.color}`
          }}
        />
      </div>

      {/* Metrics */}
      <div className="space-y-1 text-[10px] text-gray-300 mb-2">
        <div className="flex justify-between">
          <span>Kp Index:</span>
          <span className={`font-bold ${threat.text}`}>{safeKp.toFixed(1)}</span>
        </div>
        <div className="flex justify-between">
          <span>Solar Wind:</span>
          <span className={`font-bold ${safeSolarWind > 600 ? 'text-red-400' : 'text-gray-400'}`}>
            {safeSolarWind.toFixed(0)} km/s
          </span>
        </div>
        {safeBz !== null && (
          <div className="flex justify-between">
            <span>IMF Bz:</span>
            <span className={`font-bold ${safeBz < -5 ? 'text-red-400' : 'text-gray-400'}`}>
              {safeBz.toFixed(1)} nT
            </span>
          </div>
        )}
      </div>

      {/* Impact List */}
      <div className={`border-t ${threat.border} pt-2 space-y-1`}>
        <div className="text-[9px] text-gray-500 font-bold mb-1">EXPECTED IMPACTS:</div>
        {impacts.slice(0, 3).map((impact, i) => (
          <div key={i} className="text-[9px] text-gray-300 leading-tight">
            {impact}
          </div>
        ))}
      </div>

      {/* Aurora Probability */}
      {safeKp >= 3 && (
        <div className={`mt-2 pt-2 border-t ${threat.border} text-center`}>
          <div className="text-[9px] text-gray-500 mb-1">AURORA PROBABILITY</div>
          <div className={`text-xl font-bold ${threat.text}`}>
            {Math.min(Math.round((safeKp / 9) * 100), 100)}%
          </div>
          <div className="text-[8px] text-gray-400">
            Visible at latitude {Math.max(40, 67 - (safeKp * 3))}°
          </div>
        </div>
      )}
    </div>
  );
}
