import { useState, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import { Monitor, Satellite, Maximize } from 'lucide-react';
import { LOCATIONS } from './data/locations';
import { useAuroraData } from './hooks/useAuroraData';
import { useSoundFX } from './hooks/useSoundFX';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { SolarSystemScene } from './components';
import ThemeSelector from './components/ThemeSelector';
import { type HUDTheme } from './components/HelmetHUD';
import CornerMetrics from './components/CornerMetrics';
import MobileDataPanel from './components/MobileDataPanel';
import MissionControlView from './components/MissionControlView';
import KeyboardHelp from './components/KeyboardHelp';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';

type ViewMode = 'explorer' | 'analyst';

export default function App() {
  const [selectedLocation] = useState(LOCATIONS[0]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [focusedBody, setFocusedBody] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hudTheme, setHudTheme] = useState<HUDTheme>('fighter');
  const [isMobile, setIsMobile] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('explorer');
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const { data } = useAuroraData(selectedLocation);
  const { checkKpIncrease } = useSoundFX();

  // Load view preference
  useEffect(() => {
    const saved = localStorage.getItem('viewMode');
    if (saved === 'explorer' || saved === 'analyst') {
      setViewMode(saved);
    }
  }, []);

  // Save view preference
  const handleViewChange = (mode: ViewMode) => {
    setViewMode(mode);
    localStorage.setItem('viewMode', mode);
  };

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onTogglePlay: () => setIsPlaying(!isPlaying),
    onSkipBackward: () => setCurrentDate(new Date(currentDate.getTime() - 24 * 60 * 60 * 1000)),
    onSkipForward: () => setCurrentDate(new Date(currentDate.getTime() + 24 * 60 * 60 * 1000)),
    onResetView: () => setFocusedBody(null),
    onJumpToNow: () => setCurrentDate(new Date()),
  });

  useEffect(() => {
    if (data.kpIndex?.kpValue) {
      checkKpIncrease(data.kpIndex.kpValue);
    }
  }, [data.kpIndex?.kpValue, checkKpIncrease]);

  // Render Mission Control View (Analyst Mode)
  if (viewMode === 'analyst') {
    return (
      <div className="relative w-screen h-screen overflow-hidden bg-black">
        {/* Mission Control Dashboard */}
        <MissionControlView
          kpData={data.kpIndex || undefined}
          solarWind={data.solarWind || undefined}
          currentDate={currentDate}
        />

        {/* View Switcher & Fullscreen - Top-Right */}
        <div className="absolute top-4 right-4 z-50 flex gap-2 pointer-events-auto">
          <button
            onClick={toggleFullscreen}
            className="p-3 bg-black/60 backdrop-blur-lg border border-white/20 rounded-lg hover:bg-white/10 transition-all duration-200 hover:scale-105 active:scale-95"
            title="Toggle Fullscreen"
          >
            <Maximize className="w-5 h-5 text-white" />
          </button>
          
          <button
            onClick={() => handleViewChange('explorer')}
            className="flex items-center gap-2 px-4 py-3 bg-cyan-600/40 backdrop-blur-lg border border-cyan-400 rounded-lg hover:bg-cyan-600/60 transition-all duration-200 hover:scale-105 active:scale-95"
            title="Switch to Explorer Mode"
          >
            <Satellite className="w-5 h-5 text-cyan-300" />
            <span className="text-sm font-bold text-cyan-300">EXPLORER</span>
          </button>
        </div>

        {/* Keyboard Help */}
        <KeyboardHelp />
      </div>
    );
  }

  // Render Explorer View (3D Solar System) - SIMPLIFIED LAYERED ARCHITECTURE
  return (
    <div className="relative w-screen h-screen bg-black overflow-hidden">
      
      {/* ========== LAYER 0: THE UNIVERSE ========== */}
      <div className="absolute inset-0 z-0">
        <Canvas
          camera={{ position: [0, 20, 45], fov: 45, far: 5000 }}
          gl={{ antialias: true }}
          shadows
          style={{ width: '100%', height: '100%' }}
        >
          <Stars
            radius={200}
            depth={100}
            count={8000}
            factor={6}
            saturation={0}
            fade
            speed={0.5}
          />
          
          <SolarSystemScene
            kpValue={data.kpIndex?.kpValue || 3}
            solarWindSpeed={data.solarWind?.speed || 400}
            currentDate={currentDate}
            focusedBody={focusedBody}
            onBodyFocus={setFocusedBody}
            controlsRef={controlsRef}
          />
          
          <OrbitControls
            ref={controlsRef}
            makeDefault
            enableZoom={true}
            autoRotate={!focusedBody}
            autoRotateSpeed={0.3}
            minDistance={1.1}
            maxDistance={2000}
            maxPolarAngle={Math.PI / 1.5}
            minPolarAngle={Math.PI / 4}
            target={[0, 0, 0]}
            enableDamping={true}
            dampingFactor={0.05}
          />
        </Canvas>
      </div>

      {/* ========== LAYER 1: THE UI OVERLAY ========== */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        
        {/* Helmet Visor Effects */}
        {/* Vignette Effect (Helmet Edge Darkness) */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.3) 70%, rgba(0,0,0,0.7) 100%)',
            mixBlendMode: 'multiply'
          }}
        />

        {/* Scanlines (Fighter & Commander Themes) */}
        {(hudTheme === 'fighter' || hudTheme === 'commander') && (
          <div 
            className="absolute inset-0 opacity-10 pointer-events-none animate-pulse"
            style={{
              background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,255,255,0.1) 2px, rgba(0,255,255,0.1) 4px)',
              animationDuration: '3s'
            }}
          />
        )}

        {/* Center Crosshair (Fighter & Commander Themes) */}
        {(hudTheme === 'fighter' || hudTheme === 'commander') && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
            <svg width="60" height="60" viewBox="0 0 60 60" className="opacity-40">
              <circle cx="30" cy="30" r="28" fill="none" stroke="cyan" strokeWidth="1" />
              <line x1="30" y1="5" x2="30" y2="18" stroke="cyan" strokeWidth="1.5" />
              <line x1="30" y1="42" x2="30" y2="55" stroke="cyan" strokeWidth="1.5" />
              <line x1="5" y1="30" x2="18" y2="30" stroke="cyan" strokeWidth="1.5" />
              <line x1="42" y1="30" x2="55" y2="30" stroke="cyan" strokeWidth="1.5" />
              <circle cx="30" cy="30" r="2" fill="cyan" />
            </svg>
          </div>
        )}

        {/* Arc Reactor Center (Iron Man Theme) */}
        {hudTheme === 'ironman' && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
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
        {hudTheme === 'astronaut' && (
          <div className="absolute inset-0 pointer-events-none">
            <svg className="w-full h-full opacity-20" viewBox="0 0 100 100" preserveAspectRatio="none">
              <ellipse cx="50" cy="50" rx="48" ry="45" fill="none" stroke="white" strokeWidth="0.2" />
              <ellipse cx="50" cy="50" rx="46" ry="43" fill="none" stroke="white" strokeWidth="0.1" />
            </svg>
          </div>
        )}

        {/* View Switcher & Controls - Top-Left */}
        <div className="absolute top-4 left-4 flex gap-2 pointer-events-auto">
          <button
            onClick={() => handleViewChange('analyst')}
            className="flex items-center gap-2 px-4 py-3 bg-purple-600/40 backdrop-blur-lg border border-purple-400 rounded-lg hover:bg-purple-600/60 transition-all duration-200 hover:scale-105 active:scale-95"
            title="Switch to Mission Control"
          >
            <Monitor className="w-5 h-5 text-purple-300" />
            <span className="text-sm font-bold text-purple-300">MISSION CONTROL</span>
          </button>

          <button
            onClick={toggleFullscreen}
            className="p-3 bg-black/40 backdrop-blur-lg border border-white/20 rounded-lg hover:bg-white/10 transition-all duration-200 hover:scale-105 active:scale-95"
            title="Toggle Fullscreen (F key)"
          >
            <Maximize className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Theme Selector - Top-Right */}
        <div className="absolute top-4 right-4 pointer-events-auto">
          <ThemeSelector theme={hudTheme} onThemeChange={setHudTheme} />
        </div>

        {/* Corner Metrics */}
        <CornerMetrics
          theme={hudTheme}
          currentDate={currentDate}
          kpValue={data.kpIndex?.kpValue || 3}
          solarWindSpeed={data.solarWind?.speed || 400}
          focusedBody={focusedBody}
          isMobile={isMobile}
        />

        {/* Mobile Data Panel */}
        <MobileDataPanel
          theme={hudTheme}
          kpData={data.kpIndex || undefined}
          solarWind={data.solarWind || undefined}
          selectedLocation={selectedLocation}
          isMobile={isMobile}
        />

        {/* Keyboard Help */}
        <KeyboardHelp />
      </div>
    </div>
  );
}
