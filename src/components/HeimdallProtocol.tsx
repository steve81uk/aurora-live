import { useEffect, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { translateToMythic } from '../utils/mythicTranslator';
import type { AppTheme } from '../types/mythic';

interface HeimdallProtocolProps {
  theme: AppTheme;
  kpIndex: number;
  windSpeed: number;
  bz?: number;
  dst?: number;
}

export function HeimdallProtocol({
  theme,
  kpIndex,
  windSpeed,
  bz = 0,
  dst = 0,
}: HeimdallProtocolProps) {
  const [show, setShow] = useState(false);
  const [flashCount, setFlashCount] = useState(0);

  const mythicData = translateToMythic(theme, { kpIndex, windSpeed, bz, dst });

  useEffect(() => {
    // Show warning for severe conditions
    if (windSpeed > 600 || kpIndex >= 7) {
      setShow(true);
      setFlashCount(0);

      // Flash animation
      const flashInterval = setInterval(() => {
        setFlashCount((prev) => {
          if (prev >= 6) {
            clearInterval(flashInterval);
            // Auto-hide after 10 seconds
            setTimeout(() => setShow(false), 10000);
            return prev;
          }
          return prev + 1;
        });
      }, 500);

      return () => clearInterval(flashInterval);
    } else {
      setShow(false);
    }
  }, [windSpeed, kpIndex]);

  if (!show) return null;

  const isFlashing = flashCount % 2 === 0 && flashCount < 6;
  const borderColor = mythicData.color || '#ff0000';

  return (
    <div
      className={`fixed top-20 left-1/2 -translate-x-1/2 z-50 pointer-events-auto transition-all duration-300 ${
        isFlashing ? 'scale-110' : 'scale-100'
      }`}
    >
      <div
        className={`relative bg-black/90 backdrop-blur-xl rounded-lg border-2 shadow-2xl p-4 min-w-[400px] max-w-[600px] ${
          isFlashing ? 'animate-pulse' : ''
        }`}
        style={{
          borderColor: isFlashing ? borderColor : 'rgba(255,255,255,0.2)',
          boxShadow: isFlashing
            ? `0 0 30px ${borderColor}, 0 0 60px ${borderColor}40`
            : '0 0 20px rgba(0,0,0,0.5)',
        }}
      >
        {/* Close button */}
        <button
          onClick={() => setShow(false)}
          className="absolute top-2 right-2 text-white/50 hover:text-white transition-colors"
        >
          ✕
        </button>

        {/* Icon & Title */}
        <div className="flex items-center gap-3 mb-3">
          {theme === 'NORSE' && windSpeed > 700 && (
            <div className="text-4xl animate-bounce">🎺</div>
          )}
          {theme === 'NORSE' && windSpeed > 700 && (
            <div className="text-4xl animate-spin" style={{ animationDuration: '2s' }}>
              🔴
            </div>
          )}
          {theme === 'SCI_FI' && (
            <AlertTriangle
              className="w-8 h-8 text-red-500"
              style={{ color: borderColor }}
            />
          )}

          <div className="flex-1">
            <h3
              className="text-lg font-bold tracking-wide"
              style={{ color: borderColor }}
            >
              {mythicData.title}
            </h3>
          </div>
        </div>

        {/* Message */}
        <p className="text-white/90 text-sm leading-relaxed mb-3">
          {mythicData.message}
        </p>

        {/* Data Display */}
        <div className="flex gap-4 text-xs text-white/60 border-t border-white/10 pt-2 mt-2">
          <div>
            <span className="text-white/40">Wind:</span>{' '}
            <span className="text-white font-mono">{windSpeed} km/s</span>
          </div>
          <div>
            <span className="text-white/40">Kp:</span>{' '}
            <span className="text-white font-mono">{kpIndex}</span>
          </div>
          {bz !== 0 && (
            <div>
              <span className="text-white/40">Bz:</span>{' '}
              <span className="text-white font-mono">{bz.toFixed(1)} nT</span>
            </div>
          )}
        </div>

        {/* Progress bar (auto-hide countdown) */}
        <div className="mt-3 h-1 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r transition-all duration-[10000ms] ease-linear"
            style={{
              width: show ? '0%' : '100%',
              backgroundImage: `linear-gradient(to right, ${borderColor}, ${borderColor}80)`,
            }}
          />
        </div>
      </div>
    </div>
  );
}
