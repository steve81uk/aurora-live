import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import type { AppTheme } from '../types/mythic';
import { THEME_CONFIGS } from '../types/mythic';

interface MythicThemeSelectorProps {
  theme: AppTheme;
  onThemeChange: (theme: AppTheme) => void;
}

export function MythicThemeSelector({ theme, onThemeChange }: MythicThemeSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const currentConfig = THEME_CONFIGS[theme];

  return (
    <div className="relative">
      {/* Theme Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 bg-black/30 backdrop-blur-md border border-white/20 rounded-lg hover:bg-black/50 transition-all duration-200 group"
        title="Mythic Theme"
        style={{
          borderColor: currentConfig.primaryColor + '40',
        }}
      >
        <Sparkles
          className="w-4 h-4 transition-transform duration-300 group-hover:rotate-180"
          style={{ color: currentConfig.primaryColor }}
        />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Theme Menu */}
          <div className="absolute right-0 top-12 z-50 bg-black/95 backdrop-blur-xl border border-white/20 rounded-lg overflow-hidden shadow-2xl min-w-[240px]">
            <div className="p-2">
              <div className="text-xs text-white/50 font-semibold px-2 py-1 mb-1">
                MYTHIC THEME
              </div>

              {/* SCI_FI Theme */}
              <button
                onClick={() => {
                  onThemeChange('SCI_FI');
                  setIsOpen(false);
                }}
                className={`w-full text-left px-3 py-2 rounded transition-all duration-200 ${
                  theme === 'SCI_FI'
                    ? 'bg-cyan-500/20 border border-cyan-500/40'
                    : 'hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded flex items-center justify-center text-lg"
                    style={{
                      background: `linear-gradient(135deg, ${THEME_CONFIGS.SCI_FI.primaryColor}40, ${THEME_CONFIGS.SCI_FI.secondaryColor}40)`,
                    }}
                  >
                    🚀
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">
                      Scientific
                    </div>
                    <div className="text-xs text-white/50">
                      Standard Space Weather
                    </div>
                  </div>
                  {theme === 'SCI_FI' && (
                    <div className="ml-auto text-cyan-400">✓</div>
                  )}
                </div>
              </button>

              {/* NORSE Theme */}
              <button
                onClick={() => {
                  onThemeChange('NORSE');
                  setIsOpen(false);
                }}
                className={`w-full text-left px-3 py-2 rounded transition-all duration-200 mt-1 ${
                  theme === 'NORSE'
                    ? 'bg-orange-500/20 border border-orange-500/40'
                    : 'hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded flex items-center justify-center text-lg"
                    style={{
                      background: `linear-gradient(135deg, ${THEME_CONFIGS.NORSE.primaryColor}40, ${THEME_CONFIGS.NORSE.secondaryColor}40)`,
                    }}
                  >
                    ⚔️
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">
                      Norse Mythology
                    </div>
                    <div className="text-xs text-white/50">
                      Heimdall · Bifröst · Yggdrasil
                    </div>
                  </div>
                  {theme === 'NORSE' && (
                    <div className="ml-auto text-orange-400">✓</div>
                  )}
                </div>
              </button>

              {/* SHEIKAH Theme */}
              <button
                onClick={() => {
                  onThemeChange('SHEIKAH');
                  setIsOpen(false);
                }}
                className={`w-full text-left px-3 py-2 rounded transition-all duration-200 mt-1 ${
                  theme === 'SHEIKAH'
                    ? 'bg-teal-500/20 border border-teal-500/40'
                    : 'hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded flex items-center justify-center text-lg"
                    style={{
                      background: `linear-gradient(135deg, ${THEME_CONFIGS.SHEIKAH.primaryColor}40, ${THEME_CONFIGS.SHEIKAH.secondaryColor}40)`,
                    }}
                  >
                    🔷
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">
                      Ancient Sheikah
                    </div>
                    <div className="text-xs text-white/50">
                      Zelda · Guardians · Shrines
                    </div>
                  </div>
                  {theme === 'SHEIKAH' && (
                    <div className="ml-auto text-teal-400">✓</div>
                  )}
                </div>
              </button>
            </div>

            {/* Footer */}
            <div className="border-t border-white/10 p-2 text-xs text-white/40 text-center">
              Theme affects warnings, visuals & audio
            </div>
          </div>
        </>
      )}
    </div>
  );
}
