/**
 * Navigation Bar Component
 * Horizontal aurora-obsidian top bar for SKÖLL-TRACK modules
 */

import { WolfIcon } from './WolfIcon';
import { Activity, Eye, MapPin, Rocket, Clock } from 'lucide-react';

type Module = 'BRIDGE' | 'ORACLE' | 'OBSERVA' | 'HANGAR' | 'CHRONOS' | 'DATA_LAB' | 'APPENDIX';

interface NavigationBarProps {
  activeModule: Module;
  setActiveModule: (module: Module) => void;
  currentDate?: Date;
  showSpaceTraffic?: boolean;
  onToggleTraffic?: () => void;
  showConstellations?: boolean;
  onToggleConstellations?: () => void;
}

interface ModuleButtonProps {
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
}

function ModuleButton({ icon, label, isActive, onClick }: ModuleButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`
        relative px-6 py-3 rounded-lg font-bold text-sm tracking-widest uppercase
        transition-all duration-300 group
        ${isActive 
          ? 'text-cyan-400 bg-cyan-500/10' 
          : 'text-gray-400 hover:text-cyan-300 hover:bg-white/5'
        }
      `}
    >
      <div className="flex items-center gap-2">
        {icon}
        <span className="hidden md:inline">{label}</span>
      </div>
      
      {/* Active Glow Underline */}
      {isActive && (
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-pulse" />
      )}
      
      {/* Hover Glow Effect */}
      <div className={`
        absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity
        bg-gradient-to-r from-cyan-500/0 via-cyan-500/5 to-purple-500/0
      `} />
    </button>
  );
}

export function NavigationBar({ 
  activeModule, 
  setActiveModule, 
  currentDate = new Date(),
  showSpaceTraffic = true,
  onToggleTraffic,
  showConstellations = false,
  onToggleConstellations
}: NavigationBarProps) {
  
  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0].replace(/-/g, '.');
  };

  const formatTime = (date: Date) => {
    return date.toTimeString().split(' ')[0];
  };

  return (
    <nav className="fixed top-0 left-0 w-full h-16 z-[100] flex justify-between items-center px-6 bg-black/80 backdrop-blur-md border-b border-cyan-500/20 pointer-events-auto">
      
      {/* LEFT: Logo + Version */}
      <div className="flex items-center gap-4">
        <WolfIcon variant="head" size={32} glowing className="animate-pulse" />
        <div className="font-mono">
          <div className="text-amber-400 font-bold text-lg tracking-wider flex items-center gap-2">
            SKÖLL-TRACK 
            <span className="text-xs text-amber-400/60 font-normal">// V1.0</span>
          </div>
          <div className="text-[10px] text-cyan-400/60 tracking-widest">
            TRACK THE SUN'S FURY
          </div>
        </div>
      </div>

      {/* CENTER: Module Navigation */}
      <div className="flex gap-2">
        <ModuleButton
          icon={<Activity size={18} />}
          label="BRIDGE"
          isActive={activeModule === 'BRIDGE'}
          onClick={() => setActiveModule('BRIDGE')}
        />
        <ModuleButton
          icon={<Eye size={18} />}
          label="ORACLE"
          isActive={activeModule === 'ORACLE'}
          onClick={() => setActiveModule('ORACLE')}
        />
        <ModuleButton
          icon={<MapPin size={18} />}
          label="OBSERVA"
          isActive={activeModule === 'OBSERVA'}
          onClick={() => setActiveModule('OBSERVA')}
        />
        <ModuleButton
          icon={<Rocket size={18} />}
          label="HANGAR"
          isActive={activeModule === 'HANGAR'}
          onClick={() => setActiveModule('HANGAR')}
        />
        <ModuleButton
          icon={<Clock size={18} />}
          label="CHRONOS"
          isActive={activeModule === 'CHRONOS'}
          onClick={() => setActiveModule('CHRONOS')}
        />
        <ModuleButton
          icon={<Activity size={18} className="text-purple-400" />}
          label="DATA LAB"
          isActive={activeModule === 'DATA_LAB'}
          onClick={() => setActiveModule('DATA_LAB')}
        />
        <ModuleButton
          icon={<WolfIcon variant="eye" size={18} />}
          label="APPENDIX"
          isActive={activeModule === 'APPENDIX'}
          onClick={() => setActiveModule('APPENDIX')}
        />
      </div>

      {/* RIGHT: System Status */}
      <div className="flex items-center gap-6">
        
        {/* Space Traffic Toggle */}
        {onToggleTraffic && (
          <button
            onClick={onToggleTraffic}
            className={`
              p-2 rounded-lg transition-all
              ${showSpaceTraffic 
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40' 
                : 'bg-gray-800/40 text-gray-500 border border-gray-700'
              }
              hover:scale-110
            `}
            title={showSpaceTraffic ? "Hide Space Traffic" : "Show Space Traffic"}
          >
            <WolfIcon variant="running" size={18} />
          </button>
        )}

        {/* Constellation Toggle */}
        {onToggleConstellations && (
          <button
            onClick={onToggleConstellations}
            className={`p-2 rounded-lg transition-all ${
              showConstellations
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50'
                : 'bg-black/40 text-gray-500 border border-gray-500/20 hover:bg-cyan-500/10'
            }`}
            title={showConstellations ? "Hide Constellations" : "Show Constellations"}
          >
            <span className="text-xs font-mono font-bold tracking-widest">ZODIAC</span>
          </button>
        )}

        {/* System Clock */}
        <div className="text-right font-mono">
          <div className="text-cyan-400 text-sm font-bold tracking-wider">
            {formatDate(currentDate)}
          </div>
          <div className="text-gray-400 text-xs tracking-wider">
            {formatTime(currentDate)}
          </div>
        </div>

        {/* LIVE Indicator */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/30">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.8)]" />
          <span className="text-green-400 text-xs font-bold tracking-widest">LIVE</span>
        </div>
      </div>
    </nav>
  );
}

// Exports
export default NavigationBar;
export { NavigationBar as NavigationRail };
