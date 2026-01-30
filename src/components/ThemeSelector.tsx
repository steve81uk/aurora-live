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
        className={`p-1.5 rounded-md border transition-all duration-200 text-xs ${
          showThemeSelector 
            ? `${colors.bg} ${colors.border} ${colors.glow} shadow-md` 
            : 'bg-black/20 border-white/10 hover:bg-black/30'
        }`}
        title="Change HUD Theme"
      >
        {currentTheme && <currentTheme.icon className={colors.text} size={16} />}
      </button>

      {/* Theme Dropdown (Minimal) */}
      {showThemeSelector && (
        <div className="absolute right-0 top-10 bg-black/80 backdrop-blur-lg border border-white/20 rounded-md p-1.5 min-w-[160px] shadow-xl">
          <div className="text-[10px] text-cyan-300 font-bold mb-1 px-2">HUD THEME</div>
          {themes.map(t => {
            const tColors = themeColors[t.id];
            return (
              <button
                key={t.id}
                onClick={() => {
                  onThemeChange(t.id);
                  setShowThemeSelector(false);
                }}
                className={`w-full flex items-center gap-2 px-2 py-1.5 rounded transition-all duration-200 ${
                  theme === t.id 
                    ? `${tColors.bg} ${tColors.text}` 
                    : 'text-white/60 hover:bg-white/10'
                }`}
              >
                <t.icon className="w-4 h-4" />
                <span className="text-xs font-semibold">{t.name}</span>
                {theme === t.id && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
