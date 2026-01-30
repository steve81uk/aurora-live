import type { ReactNode } from 'react';
import { useState } from 'react';
import { Crosshair, Target, Radar, Layers } from 'lucide-react';

export type HUDTheme = 'fighter' | 'astronaut' | 'ironman' | 'commander';

interface HelmetHUDProps {
  children: ReactNode;
  theme: HUDTheme;
  onThemeChange: (theme: HUDTheme) => void;
}

const themeColors = {
  fighter: { text: 'text-cyan-300', bg: 'bg-cyan-600/40', border: 'border-cyan-400', glow: 'shadow-cyan-500/50' },
  astronaut: { text: 'text-blue-300', bg: 'bg-blue-600/40', border: 'border-blue-400', glow: 'shadow-blue-500/50' },
  ironman: { text: 'text-purple-300', bg: 'bg-purple-600/40', border: 'border-purple-400', glow: 'shadow-purple-500/50' },
  commander: { text: 'text-green-300', bg: 'bg-green-600/40', border: 'border-green-400', glow: 'shadow-green-500/50' }
};

export default function HelmetHUD({ children, theme, onThemeChange }: HelmetHUDProps) {
  const [showThemeSelector, setShowThemeSelector] = useState(false);

  const themes = [
    { id: 'fighter' as HUDTheme, name: 'Fighter Jet', icon: Crosshair },
    { id: 'astronaut' as HUDTheme, name: 'Astronaut', icon: Target },
    { id: 'ironman' as HUDTheme, name: 'Iron Man', icon: Radar },
    { id: 'commander' as HUDTheme, name: 'Commander', icon: Layers }
  ];

  const currentTheme = themes.find(t => t.id === theme);
  const colors = themeColors[theme];

  return (
    <div className="relative w-screen h-screen overflow-hidden">
      {/* Main 3D Scene */}
      <div className="absolute inset-0 z-0">
        {children}
      </div>

      {/* Helmet Visor Frame Overlay */}
      <div className="absolute inset-0 z-40 pointer-events-none">
        {/* Vignette Effect (Helmet Edge Darkness) */}
        <div 
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.3) 70%, rgba(0,0,0,0.7) 100%)',
            mixBlendMode: 'multiply'
          }}
        />

        {/* Scanlines (Subtle) */}
        {(theme === 'fighter' || theme === 'commander') && (
          <div 
            className="absolute inset-0 opacity-10"
            style={{
              background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,255,255,0.1) 2px, rgba(0,255,255,0.1) 4px)'
            }}
          />
        )}

        {/* Center Crosshair (Fighter & Commander Themes) */}
        {(theme === 'fighter' || theme === 'commander') && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <svg width="60" height="60" viewBox="0 0 60 60" className="opacity-40">
              {/* Outer circle */}
              <circle cx="30" cy="30" r="28" fill="none" stroke="cyan" strokeWidth="1" />
              {/* Inner crosshair */}
              <line x1="30" y1="5" x2="30" y2="18" stroke="cyan" strokeWidth="1.5" />
              <line x1="30" y1="42" x2="30" y2="55" stroke="cyan" strokeWidth="1.5" />
              <line x1="5" y1="30" x2="18" y2="30" stroke="cyan" strokeWidth="1.5" />
              <line x1="42" y1="30" x2="55" y2="30" stroke="cyan" strokeWidth="1.5" />
              {/* Center dot */}
              <circle cx="30" cy="30" r="2" fill="cyan" />
            </svg>
          </div>
        )}

        {/* Arc Reactor Center (Iron Man Theme) */}
        {theme === 'ironman' && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="relative w-20 h-20 animate-pulse">
              <div className="absolute inset-0 rounded-full bg-cyan-400/20 blur-xl" />
              <svg width="80" height="80" viewBox="0 0 80 80">
                <circle cx="40" cy="40" r="35" fill="none" stroke="url(#arcGradient)" strokeWidth="2" />
                <circle cx="40" cy="40" r="28" fill="none" stroke="cyan" strokeWidth="1" opacity="0.5" />
                <circle cx="40" cy="40" r="20" fill="none" stroke="cyan" strokeWidth="1.5" opacity="0.8" />
                <circle cx="40" cy="40" r="3" fill="cyan" />
                <defs>
                  <radialGradient id="arcGradient">
                    <stop offset="0%" stopColor="cyan" />
                    <stop offset="100%" stopColor="purple" />
                  </radialGradient>
                </defs>
              </svg>
            </div>
          </div>
        )}

        {/* NASA-style Circular Frame (Astronaut Theme) */}
        {theme === 'astronaut' && (
          <div className="absolute inset-0">
            <svg className="w-full h-full opacity-20" viewBox="0 0 100 100" preserveAspectRatio="none">
              <ellipse cx="50" cy="50" rx="48" ry="45" fill="none" stroke="white" strokeWidth="0.2" />
              <ellipse cx="50" cy="50" rx="46" ry="43" fill="none" stroke="white" strokeWidth="0.1" />
            </svg>
          </div>
        )}
      </div>

      {/* Theme Selector Button (Top-Right Corner) */}
      <div className="absolute top-4 right-4 z-50 pointer-events-auto">
        <button
          onClick={() => setShowThemeSelector(!showThemeSelector)}
          className={`p-3 rounded-lg border-2 transition-all duration-200 hover:scale-110 active:scale-95 ${
            showThemeSelector 
              ? `${colors.bg} ${colors.border} ${colors.glow} shadow-lg` 
              : 'bg-black/30 border-white/20 hover:bg-black/50'
          }`}
          title="Change HUD Theme"
        >
          {currentTheme && <currentTheme.icon className={colors.text} size={24} />}
        </button>

        {/* Theme Dropdown */}
        {showThemeSelector && (
          <div className="absolute right-0 top-16 bg-black/90 backdrop-blur-xl border border-white/30 rounded-lg p-2 min-w-[200px] shadow-2xl">
            <div className="text-xs text-cyan-300 font-bold mb-2 px-2">HUD THEME</div>
            {themes.map(t => {
              const tColors = themeColors[t.id];
              return (
                <button
                  key={t.id}
                  onClick={() => {
                    onThemeChange(t.id);
                    setShowThemeSelector(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded transition-all duration-200 ${
                    theme === t.id 
                      ? `${tColors.bg} ${tColors.text}` 
                      : 'text-white/70 hover:bg-white/10'
                  }`}
                >
                  <t.icon className="w-5 h-5" />
                  <span className="text-sm font-semibold">{t.name}</span>
                  {theme === t.id && (
                    <div className="ml-auto w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export { themeColors };
