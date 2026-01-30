import { useState, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import { Monitor, Satellite, Maximize } from 'lucide-react';
import { LOCATIONS } from './data/locations';
import { SURFACE_LOCATIONS, type SurfaceLocation } from './data/surfaceLocations';
import { useAuroraData } from './hooks/useAuroraData';
import { useSoundFX } from './hooks/useSoundFX';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { SolarSystemScene } from './components';
import { ShootingStars } from './components/ShootingStars';
import { HeimdallProtocol } from './components/HeimdallProtocol';
import { MythicThemeSelector } from './components/MythicThemeSelector';
import { SurfaceViewControls } from './components/SurfaceViewControls';
import { DataStream } from './components/DataStream';
import ThemeSelector from './components/ThemeSelector';
import { type HUDTheme } from './components/HelmetHUD';
import CornerMetrics from './components/CornerMetrics';
import MobileDataPanel from './components/MobileDataPanel';
import MissionControlView from './components/MissionControlView';
import KeyboardHelp from './components/KeyboardHelp';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import type { AppTheme } from './types/mythic';

type ViewMode = 'explorer' | 'analyst';

export default function App() {
  const [selectedLocation] = useState(LOCATIONS[0]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [focusedBody, setFocusedBody] = useState<string | null>(null);
  const [surfaceMode, setSurfaceMode] = useState(false);
  const [surfaceLocation, setSurfaceLocation] = useState<SurfaceLocation | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hudTheme, setHudTheme] = useState<HUDTheme>('fighter');
  const [mythicTheme, setMythicTheme] = useState<AppTheme>('SCI_FI');
  const [isMobile, setIsMobile] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('explorer');
  const [uiVisible, setUiVisible] = useState(true);
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const { data } = useAuroraData(selectedLocation);
  const { checkKpIncrease } = useSoundFX();

  // Load preferences
  useEffect(() => {
    const savedView = localStorage.getItem('viewMode');
    if (savedView === 'explorer' || savedView === 'analyst') {
      setViewMode(savedView);
    }
    const savedTheme = localStorage.getItem('mythicTheme');
    if (savedTheme === 'SCI_FI' || savedTheme === 'NORSE' || savedTheme === 'SHEIKAH') {
      setMythicTheme(savedTheme);
    }
  }, []);

  // Save view preference
  const handleViewChange = (mode: ViewMode) => {
    setViewMode(mode);
    localStorage.setItem('viewMode', mode);
  };
  
  // Save theme preference
  const handleThemeChange = (theme: AppTheme) => {
    setMythicTheme(theme);
    localStorage.setItem('mythicTheme', theme);
  };
  
  // Handle body focus (enter surface mode if locations available)
  const handleBodyFocus = (bodyName: string | null) => {
    setFocusedBody(bodyName);
    
    if (bodyName && SURFACE_LOCATIONS[bodyName]) {
      // Enter surface mode with first location
      setSurfaceMode(true);
      setSurfaceLocation(SURFACE_LOCATIONS[bodyName][0]);
    } else {
      // Exit surface mode
      setSurfaceMode(false);
      setSurfaceLocation(null);
    }
  };
  
  // Handle surface location change
  const handleSurfaceLocationChange = (location: SurfaceLocation) => {
    setSurfaceLocation(location);
  };
  
  // Exit surface mode
  const handleExitSurface = () => {
    setSurfaceMode(false);
    setSurfaceLocation(null);
    setFocusedBody(null);
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
    onResetView: () => {
      handleExitSurface();
      setFocusedBody(null);
    },
    onJumpToNow: () => setCurrentDate(new Date()),
  });

  // UI Toggle with H key
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'h' || e.key === 'H') {
        setUiVisible(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

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
          
          {/* Shooting Stars / Meteors */}
          <ShootingStars />
          
          <SolarSystemScene
            kpValue={data.kpIndex?.kpValue || 3}
            solarWindSpeed={data.solarWind?.speed || 400}
            currentDate={currentDate}
            focusedBody={focusedBody}
            onBodyFocus={handleBodyFocus}
            controlsRef={controlsRef}
            surfaceMode={surfaceMode}
            surfaceLocation={surfaceLocation}
            mythicTheme={mythicTheme}
          />
          
          <OrbitControls
            ref={controlsRef}
            makeDefault
            enableZoom={true}
            autoRotate={!focusedBody}
            autoRotateSpeed={0.3}
            minDistance={focusedBody && focusedBody !== 'reset' ? 0.1 : 15}
            maxDistance={focusedBody && focusedBody !== 'reset' ? 500 : 2000}
            maxPolarAngle={Math.PI} // Allow full 360° up/down (removed restriction)
            minPolarAngle={0} // Allow looking straight up
            target={[0, 0, 0]}
            enableDamping={true}
            dampingFactor={0.05}
            enablePan={true}
          />
        </Canvas>
      </div>

      {/* ========== LAYER 1: THE UI OVERLAY ========== */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        
        {/* Heimdall Protocol / Mythic Warning System */}
        <HeimdallProtocol
          theme={mythicTheme}
          kpIndex={data.kpIndex?.kpValue || 3}
          windSpeed={data.solarWind?.speed || 400}
          bz={data.solarWind?.bz}
        />
        
        {/* Helmet Visor Effects (Ultra Minimal) */}
        {/* Vignette Effect (Helmet Edge Darkness) - BARELY VISIBLE */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at center, transparent 60%, rgba(0,0,0,0.05) 85%, rgba(0,0,0,0.15) 100%)',
            mixBlendMode: 'multiply'
          }}
        />

        {/* Scanlines (Fighter & Commander Themes) - BARELY VISIBLE */}
        {(hudTheme === 'fighter' || hudTheme === 'commander') && (
          <div 
            className="absolute inset-0 opacity-3 pointer-events-none animate-pulse"
            style={{
              background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,255,255,0.05) 2px, rgba(0,255,255,0.05) 4px)',
              animationDuration: '3s'
            }}
          />
        )}

        {/* Center Crosshair (Fighter & Commander Themes) - BARELY VISIBLE */}
        {(hudTheme === 'fighter' || hudTheme === 'commander') && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
            <svg width="40" height="40" viewBox="0 0 60 60" className="opacity-10">
              <circle cx="30" cy="30" r="28" fill="none" stroke="cyan" strokeWidth="0.5" />
              <line x1="30" y1="5" x2="30" y2="18" stroke="cyan" strokeWidth="0.8" />
              <line x1="30" y1="42" x2="30" y2="55" stroke="cyan" strokeWidth="0.8" />
              <line x1="5" y1="30" x2="18" y2="30" stroke="cyan" strokeWidth="0.8" />
              <line x1="42" y1="30" x2="55" y2="30" stroke="cyan" strokeWidth="0.8" />
              <circle cx="30" cy="30" r="1.5" fill="cyan" />
            </svg>
          </div>
        )}

        {/* Arc Reactor Center (Iron Man Theme) - BARELY VISIBLE */}
        {hudTheme === 'ironman' && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
            <div className="relative w-16 h-16 animate-pulse">
              <div className="absolute inset-0 rounded-full bg-cyan-400/5 blur-lg" />
              <svg width="64" height="64" viewBox="0 0 80 80" className="opacity-15">
                <circle cx="40" cy="40" r="35" fill="none" stroke="url(#arcGradient)" strokeWidth="1" />
                <circle cx="40" cy="40" r="28" fill="none" stroke="cyan" strokeWidth="0.5" opacity="0.3" />
                <circle cx="40" cy="40" r="20" fill="none" stroke="cyan" strokeWidth="0.8" opacity="0.5" />
                <circle cx="40" cy="40" r="2" fill="cyan" />
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

        {/* NASA-style Circular Frame (Astronaut Theme) - BARELY VISIBLE */}
        {hudTheme === 'astronaut' && (
          <div className="absolute inset-0 pointer-events-none">
            <svg className="w-full h-full opacity-5" viewBox="0 0 100 100" preserveAspectRatio="none">
              <ellipse cx="50" cy="50" rx="48" ry="45" fill="none" stroke="white" strokeWidth="0.15" />
              <ellipse cx="50" cy="50" rx="46" ry="43" fill="none" stroke="white" strokeWidth="0.08" />
            </svg>
          </div>
        )}

        {/* UI Elements (Toggle with H key) */}
        {uiVisible && (
          <>
            {/* View Switcher & Controls - Top-Left (Minimal) */}
            <div className="absolute top-2 left-2 flex gap-1 pointer-events-auto">
              <button
                onClick={() => handleViewChange('analyst')}
                className="flex items-center gap-1 px-2 py-1.5 bg-purple-600/20 backdrop-blur-md border border-purple-400/30 rounded-md hover:bg-purple-600/40 transition-all duration-200 text-xs"
                title="Switch to Mission Control"
              >
                <Monitor className="w-3 h-3 text-purple-300" />
                <span className="font-semibold text-purple-300 hidden md:inline">MISSION CONTROL</span>
              </button>

              <button
                onClick={toggleFullscreen}
                className="p-1.5 bg-black/20 backdrop-blur-md border border-white/10 rounded-md hover:bg-white/10 transition-all duration-200"
                title="Toggle Fullscreen (F key)"
              >
                <Maximize className="w-3 h-3 text-white" />
              </button>
              
              <button
                onClick={() => setUiVisible(false)}
                className="p-1.5 bg-black/20 backdrop-blur-md border border-white/10 rounded-md hover:bg-white/10 transition-all duration-200"
                title="Hide UI (H key)"
              >
                <span className="text-[10px] text-white font-mono">H</span>
              </button>
            </div>

            {/* Theme Selector - Top-Right (Minimal) */}
            <div className="absolute top-2 right-2 flex gap-1 pointer-events-auto">
              <MythicThemeSelector theme={mythicTheme} onThemeChange={handleThemeChange} />
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
          </>
        )}
        
        {/* Surface View Controls */}
        {surfaceMode && focusedBody && (
          <SurfaceViewControls
            planetName={focusedBody}
            currentLocation={surfaceLocation}
            onLocationChange={handleSurfaceLocationChange}
            onExit={handleExitSurface}
            mythicTheme={mythicTheme}
          />
        )}
        
        {/* Neural Data Stream - Bottom */}
        {uiVisible && !surfaceMode && (
          <div className="absolute bottom-2 left-2 right-2 pointer-events-auto">
            <DataStream mythicTheme={mythicTheme} />
          </div>
        )}
        
        {/* UI Hidden Indicator (Press H to show) */}
        {!uiVisible && (
          <div className="absolute top-2 left-1/2 -translate-x-1/2 pointer-events-auto">
            <button
              onClick={() => setUiVisible(true)}
              className="px-3 py-1.5 bg-black/40 backdrop-blur-md border border-white/20 rounded-full hover:bg-black/60 transition-all duration-200 text-xs font-mono text-white/70 hover:text-white animate-pulse"
            >
              Press H to show UI
            </button>
          </div>
        )}

        {/* Keyboard Help */}
        <KeyboardHelp />
      </div>
    </div>
  );
}
