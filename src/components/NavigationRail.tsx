/**
 * Navigation Rail Component
 * Vertical glass navigation bar for switching between Aetheris modules
 */

import { Globe, Activity, MapPin, Rocket, Clock } from 'lucide-react';

type Module = 'BRIDGE' | 'ORACLE' | 'OBSERVA' | 'HANGAR' | 'CHRONOS';

interface NavigationRailProps {
  activeModule: Module;
  setActiveModule: (module: Module) => void;
}

interface NavButtonProps {
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
}

function NavButton({ icon, label, isActive, onClick }: NavButtonProps) {
  return (
    <div className="group relative pointer-events-auto">
      <button
        onClick={onClick}
        className={`
          w-14 h-14 rounded-xl
          flex items-center justify-center
          backdrop-blur-md border-2 transition-all duration-300
          ${isActive 
            ? 'bg-cyan-500/20 border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.6)]' 
            : 'bg-black/40 border-gray-600 hover:border-cyan-500 hover:bg-cyan-500/10'
          }
        `}
        aria-label={label}
      >
        <div className={`${isActive ? 'text-cyan-400' : 'text-gray-400 group-hover:text-cyan-300'} transition-colors`}>
          {icon}
        </div>
      </button>
      
      {/* Tooltip */}
      <div 
        className="absolute left-full ml-4 top-1/2 -translate-y-1/2 
                   opacity-0 group-hover:opacity-100 transition-opacity duration-200
                   pointer-events-none whitespace-nowrap"
      >
        <div className="bg-black/95 backdrop-blur-xl border border-cyan-400 rounded-lg px-4 py-2 
                        shadow-[0_0_20px_rgba(6,182,212,0.4)]">
          <span className="text-cyan-300 font-mono text-sm font-bold tracking-widest">
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
      
      {/* Navigation Buttons */}
      <div className="relative flex flex-col gap-3">
        <NavButton
          icon={<Globe size={24} />}
          label="THE BRIDGE"
          isActive={activeModule === 'BRIDGE'}
          onClick={() => setActiveModule('BRIDGE')}
        />
        
        <NavButton
          icon={<Activity size={24} />}
          label="THE ORACLE"
          isActive={activeModule === 'ORACLE'}
          onClick={() => setActiveModule('ORACLE')}
        />
        
        <NavButton
          icon={<MapPin size={24} />}
          label="THE OBSERVA"
          isActive={activeModule === 'OBSERVA'}
          onClick={() => setActiveModule('OBSERVA')}
        />
        
        <NavButton
          icon={<Rocket size={24} />}
          label="THE HANGAR"
          isActive={activeModule === 'HANGAR'}
          onClick={() => setActiveModule('HANGAR')}
        />
        
        <NavButton
          icon={<Clock size={24} />}
          label="THE CHRONOS"
          isActive={activeModule === 'CHRONOS'}
          onClick={() => setActiveModule('CHRONOS')}
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
               'calc(1rem + 272px)'
             }` 
           }}
      />
    </div>
  );
}
