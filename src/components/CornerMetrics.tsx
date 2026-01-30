import { Wind, Activity, Clock, Navigation } from 'lucide-react';
import { type HUDTheme, themeColors } from './HelmetHUD';

interface CornerMetricsProps {
  theme: HUDTheme;
  currentDate: Date;
  kpValue: number;
  solarWindSpeed: number;
  focusedBody: string | null;
  isMobile?: boolean;
}

export default function CornerMetrics({
  theme,
  currentDate,
  kpValue,
  solarWindSpeed,
  focusedBody,
  isMobile = false
}: CornerMetricsProps) {
  const getStatusColor = () => {
    if (kpValue >= 7) return 'text-red-400';
    if (kpValue >= 5) return 'text-orange-400';
    if (kpValue >= 3) return 'text-yellow-400';
    return 'text-green-400';
  };

  const colors = themeColors[theme];

  return (
    <>
      {/* TOP-LEFT: System Status (Minimal) */}
      <div className={`absolute top-12 left-2 z-50 pointer-events-none ${isMobile ? 'max-w-[100px]' : 'max-w-[120px]'}`}>
        <div className="bg-black/20 backdrop-blur-sm border border-white/10 rounded-md p-2 space-y-1">
          <div className="flex items-center gap-1">
            <Activity className={colors.text} size={isMobile ? 12 : 14} />
            <span className="text-[10px] text-white/50 font-mono">STATUS</span>
          </div>
          <div className={`${isMobile ? 'text-base' : 'text-lg'} font-black ${getStatusColor()} font-mono`}>
            KP {kpValue.toFixed(1)}
          </div>
          <div className="h-0.5 bg-white/10 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-500 ${colors.bg}`}
              style={{ width: `${(kpValue / 9) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* TOP-RIGHT: (Theme selector already there, skip this corner) */}

      {/* BOTTOM-LEFT: Solar Wind (Minimal) */}
      <div className={`absolute bottom-2 left-2 z-50 pointer-events-none ${isMobile ? 'max-w-[100px]' : 'max-w-[120px]'}`}>
        <div className="bg-black/20 backdrop-blur-sm border border-white/10 rounded-md p-2 space-y-1">
          <div className="flex items-center gap-1">
            <Wind className={colors.text} size={isMobile ? 12 : 14} />
            <span className="text-[10px] text-white/50 font-mono">WIND</span>
          </div>
          <div className={`${isMobile ? 'text-sm' : 'text-base'} font-black text-white font-mono`}>
            {solarWindSpeed.toFixed(0)}
          </div>
          <div className="text-[10px] text-white/40 font-mono">km/s</div>
        </div>
      </div>

      {/* BOTTOM-RIGHT: Time & Target (Minimal) */}
      <div className={`absolute bottom-2 right-2 z-50 pointer-events-none ${isMobile ? 'max-w-[120px]' : 'max-w-[140px]'}`}>
        <div className="bg-black/20 backdrop-blur-sm border border-white/10 rounded-md p-2 space-y-1">
          <div className="flex items-center gap-1">
            <Clock className={colors.text} size={isMobile ? 12 : 14} />
            <span className="text-[10px] text-white/50 font-mono">TIME</span>
          </div>
          <div className={`${isMobile ? 'text-[10px]' : 'text-xs'} font-semibold text-white font-mono`}>
            {currentDate.toLocaleTimeString()}
          </div>
          
          {focusedBody && (
            <>
              <div className="border-t border-white/10 pt-1 mt-1">
                <div className="flex items-center gap-1">
                  <Navigation className={colors.text} size={isMobile ? 12 : 14} />
                  <span className="text-[10px] text-white/50 font-mono">TARGET</span>
                </div>
                <div className={`${isMobile ? 'text-xs' : 'text-sm'} font-semibold ${colors.text} font-mono uppercase`}>
                  {focusedBody}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
