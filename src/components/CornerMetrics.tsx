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
  const textSize = isMobile ? 'text-xs' : 'text-sm';
  const iconSize = isMobile ? 16 : 20;

  return (
    <>
      {/* TOP-LEFT: System Status */}
      <div className={`absolute top-4 left-4 z-50 pointer-events-none ${isMobile ? 'max-w-[140px]' : ''}`}>
        <div className="bg-black/40 backdrop-blur-md border border-white/20 rounded-lg p-3 space-y-2">
          <div className="flex items-center gap-2">
            <Activity className={colors.text} size={iconSize} />
            <span className={`${textSize} text-white/70 font-mono`}>STATUS</span>
          </div>
          <div className={`${isMobile ? 'text-xl' : 'text-2xl'} font-black ${getStatusColor()} font-mono [text-shadow:_0_0_10px_currentColor]`}>
            KP {kpValue.toFixed(1)}
          </div>
          <div className="h-1 bg-white/10 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-500 ${colors.bg}`}
              style={{ width: `${(kpValue / 9) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* TOP-RIGHT: (Theme selector already there, skip this corner) */}

      {/* BOTTOM-LEFT: Solar Wind */}
      <div className={`absolute bottom-4 left-4 z-50 pointer-events-none ${isMobile ? 'max-w-[140px]' : ''}`}>
        <div className="bg-black/40 backdrop-blur-md border border-white/20 rounded-lg p-3 space-y-2">
          <div className="flex items-center gap-2">
            <Wind className={colors.text} size={iconSize} />
            <span className={`${textSize} text-white/70 font-mono`}>WIND</span>
          </div>
          <div className={`${isMobile ? 'text-lg' : 'text-xl'} font-black text-white font-mono [text-shadow:_0_0_10px_rgba(255,255,255,0.5)]`}>
            {solarWindSpeed.toFixed(0)}
          </div>
          <div className={`${textSize} text-white/50 font-mono`}>km/s</div>
        </div>
      </div>

      {/* BOTTOM-RIGHT: Time & Target */}
      <div className={`absolute bottom-4 right-4 z-50 pointer-events-none ${isMobile ? 'max-w-[160px]' : ''}`}>
        <div className="bg-black/40 backdrop-blur-md border border-white/20 rounded-lg p-3 space-y-2">
          <div className="flex items-center gap-2">
            <Clock className={colors.text} size={iconSize} />
            <span className={`${textSize} text-white/70 font-mono`}>TIME</span>
          </div>
          <div className={`${isMobile ? 'text-xs' : 'text-sm'} font-bold text-white font-mono`}>
            {currentDate.toLocaleTimeString()}
          </div>
          
          {focusedBody && (
            <>
              <div className="border-t border-white/10 pt-2 mt-2">
                <div className="flex items-center gap-2">
                  <Navigation className={colors.text} size={iconSize} />
                  <span className={`${textSize} text-white/70 font-mono`}>TARGET</span>
                </div>
                <div className={`${isMobile ? 'text-sm' : 'text-base'} font-bold ${colors.text} font-mono uppercase`}>
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
