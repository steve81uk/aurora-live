/**
 * Navigation Rail Component
 * Vertical glass navigation bar for switching between SKÖLL-TRACK modules
 */

import { WolfIcon } from './WolfIcon';

type Module = 'BRIDGE' | 'ORACLE' | 'OBSERVA' | 'HANGAR' | 'CHRONOS' | 'DATA_LAB' | 'APPENDIX';

interface NavigationRailProps {
  activeModule: Module;
  setActiveModule: (module: Module) => void;
}

interface NavButtonProps {
  wolfVariant: 'head' | 'eye' | 'paw' | 'howl' | 'running';
  label: string;
  isActive: boolean;
  onClick: () => void;
}

function NavButton({ wolfVariant, label, isActive, onClick }: NavButtonProps) {
  return (
    <div className="group relative pointer-events-auto">
      <button
        onClick={onClick}
        className={`
          w-14 h-14 rounded-xl
          flex items-center justify-center
          backdrop-blur-md border-2 transition-all duration-300
          ${isActive 
            ? 'bg-cyan-500/20 border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.6)] wolf-border active' 
            : 'bg-black/40 border-gray-600 hover:border-cyan-500 hover:bg-cyan-500/10 wolf-border'
          }
        `}
        aria-label={label}
      >
        <div className={`${isActive ? 'text-cyan-400' : 'text-gray-400 group-hover:text-cyan-300'} transition-colors`}>
          <WolfIcon 
            variant={wolfVariant} 
            size={28} 
            glowing={isActive}
            animated={isActive}
          />
        </div>
      </button>
      
      {/* Tooltip */}
      <div 
        className="absolute left-full ml-4 top-1/2 -translate-y-1/2 
                   opacity-0 group-hover:opacity-100 transition-opacity duration-200
                   pointer-events-none whitespace-nowrap z-50"
      >
        <div className="bg-black/95 backdrop-blur-xl border border-cyan-400 rounded-lg px-4 py-2 
                        shadow-[0_0_20px_rgba(6,182,212,0.4)] norse-notch">
          <span className="text-cyan-300 font-mono text-sm font-bold tracking-widest rune-text">
            {label}
          </span>
        </div>
      </div>
    </div>
  );
}

export function NavigationRail({ activeModule, setActiveModule }: NavigationRailProps) {
  return (
    <div 
      className="fixed left-0 top-1/2 -translate-y-1/2 z-[100] 
                 flex flex-col gap-4 p-4 pointer-events-none"
    >
      {/* Background glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-transparent 
                      blur-xl pointer-events-none" />
      
      {/* Wolf howl divider at top */}
      <div className="pointer-events-auto mb-2">
        <WolfIcon variant="howl" size={20} glowing className="text-cyan-400 opacity-40" />
      </div>
      
      {/* Navigation Buttons */}
      <div className="relative flex flex-col gap-3">
        <NavButton
          wolfVariant="head"
          label="THE BRIDGE"
          isActive={activeModule === 'BRIDGE'}
          onClick={() => setActiveModule('BRIDGE')}
        />
        
        <NavButton
          wolfVariant="eye"
          label="THE ORACLE"
          isActive={activeModule === 'ORACLE'}
          onClick={() => setActiveModule('ORACLE')}
        />
        
        <NavButton
          wolfVariant="paw"
          label="THE OBSERVA"
          isActive={activeModule === 'OBSERVA'}
          onClick={() => setActiveModule('OBSERVA')}
        />
        
        <NavButton
          wolfVariant="running"
          label="THE HANGAR"
          isActive={activeModule === 'HANGAR'}
          onClick={() => setActiveModule('HANGAR')}
        />
        
        <NavButton
          wolfVariant="howl"
          label="THE CHRONOS"
          isActive={activeModule === 'CHRONOS'}
          onClick={() => setActiveModule('CHRONOS')}
        />
        
        <NavButton
          wolfVariant="eye"
          label="DATA LAB"
          isActive={activeModule === 'DATA_LAB'}
          onClick={() => setActiveModule('DATA_LAB')}
        />
        
        <NavButton
          wolfVariant="head"
          label="ASTRO APPENDIX"
          isActive={activeModule === 'APPENDIX'}
          onClick={() => setActiveModule('APPENDIX')}
        />
      </div>
      
      {/* Module indicator line */}
      <div className="absolute left-0 w-1 h-14 bg-cyan-400 rounded-r-full 
                      shadow-[0_0_20px_rgba(6,182,212,0.8)] transition-all duration-300"
           style={{ 
             top: `${
               activeModule === 'BRIDGE' ? '1rem' :
               activeModule === 'ORACLE' ? 'calc(1rem + 68px)' :
               activeModule === 'OBSERVA' ? 'calc(1rem + 136px)' :
               activeModule === 'HANGAR' ? 'calc(1rem + 204px)' :
               activeModule === 'CHRONOS' ? 'calc(1rem + 272px)' :
               activeModule === 'DATA_LAB' ? 'calc(1rem + 340px)' :
               'calc(1rem + 408px)'
             }` 
           }}
      />
    </div>
  );
}
