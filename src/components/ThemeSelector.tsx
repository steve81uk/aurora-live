import { useState } from 'react';
import { Crosshair, Target, Radar, Layers } from 'lucide-react';
import { type HUDTheme, themeColors } from './HelmetHUD';

interface ThemeSelectorProps {
  theme: HUDTheme;
  onThemeChange: (theme: HUDTheme) => void;
}

export default function ThemeSelector({ theme, onThemeChange }: ThemeSelectorProps) {
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
    <div className="relative">
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
  );
}
