import { useState, useRef, Suspense, useEffect, lazy } from 'react';
import { Canvas } from '@react-three/fiber';
import { Html, OrbitControls } from '@react-three/drei';
import { LOCATIONS } from './data/locations';
import { useAuroraData } from './hooks/useAuroraData';
import { useTimeSimulation } from './hooks/useTimeSimulation';
import { Vector3 } from 'three';
import { getBodyPosition, getOptimalViewDistance, calculateCameraPosition } from './utils/astronomy';

// IMPORTS MUST MATCH EXPORTS
import SolarSystemScene from './components/SolarSystemScene';
import { CITIES, PLANETS } from './data/celestial';
import { UniverseBackground } from './components/UniverseBackground';
import { QuickNav } from './components/QuickNav';
import { TelemetryDeck } from './components/TelemetryDeck'; 
import { HUDOverlay } from './components/HUDOverlay';
import LoadingScreen from './components/LoadingScreen';
import KeyboardHelp from './components/KeyboardHelp';
import { ShootingStars } from './components/ShootingStars';
// AUDIO REMOVED: Too overwhelming, replaced with Spotify embed in GoldenRecord
// import SpaceAudio from './components/SpaceAudio';
// import PlanetarySounds from './components/PlanetarySounds';
import VehicleView from './components/VehicleView';
import SurfaceView from './components/SurfaceView';
import FreeCameraControls from './components/FreeCameraControls';
import { GameProvider, useGame } from './context/GameContext';
import XPBar from './components/XPBar';
import SolarWindParticles from './components/SolarWindParticles';
import ThreatLevel from './components/ThreatLevel';
import StormDesigner from './components/StormDesigner';
import GridResilience from './components/GridResilience';

// NEW COMPONENTS
import CornerMetrics from './components/CornerMetrics';
import MissionControlView from './components/MissionControlView';
import { CreditsModal } from './components/CreditsModal';
import { FastTravelDropdown } from './components/FastTravelDropdown';
import { SkyViewer } from './components/SkyViewer';
import ConstellationLines from './components/ConstellationLines';
import { HeimdallProtocol } from './components/HeimdallProtocol';
import { TimeSliderOverlay } from './components/TimeSliderOverlay';
import MobileDataPanel from './components/MobileDataPanel';
import { DataDashboard } from './components/DataDashboard';
import { MythicThemeSelector } from './components/MythicThemeSelector';
import type { AppTheme } from './types/mythic';

// v3.0 LIVE DATA
import { LiveDataPanel } from './components/LiveDataPanel';
import { useLiveSpaceWeather } from './hooks/useLiveSpaceWeather';

// v3.0 WEEK 2+ NEW FEATURES
import { KpTrendChart } from './components/KpTrendChart';
import { MLAuroraForecast } from './components/MLAuroraForecast';
import { CMEParticleSystem } from './components/CMEParticleSystem';
import { MeteorShowerSystem } from './components/MeteorShowerSystem';
import { NotificationSystem } from './components/NotificationSystem';

// v3.4 DONATION & FEATURES
import { FuelCell } from './components/FuelCell';
import { CinematicSplashAlpha } from './components/CinematicSplashAlpha';

// v3.6 COMM-ARRAY & NEURAL LINK
import { CommArray } from './components/CommArray';
import { RadialMenu } from './components/RadialMenu';
import { NeuralLink } from './components/NeuralLink';
import { RadialWarp } from './components/RadialWarp';
import { AuroraOval } from './components/AuroraOval';
import { WeatherHUD } from './components/WeatherHUD';

// v3.8 ADVANCED PHYSICS & SYSTEMS
import { RadioBlackoutOverlay } from './components/RadioBlackoutOverlay';
import { DeepSpaceTracker } from './components/DeepSpaceTracker';

// v3.6 HOOKS
import { useAlerts } from './hooks/useAlerts';

// v3.1 NAVIGATION SYSTEM - LAZY LOADED MODULES
import { NavigationBar as NavigationRail } from './components/NavigationBar';
const OracleModule = lazy(() => import('./components/OracleModule').then(m => ({ default: m.OracleModule })));
const HangarModule = lazy(() => import('./components/HangarModule').then(m => ({ default: m.HangarModule })));
const ChronosModule = lazy(() => import('./components/ChronosModule').then(m => ({ default: m.ChronosModule })));
const DataScienceLab = lazy(() => import('./components/DataScienceLab').then(m => ({ default: m.DataScienceLab })));
const AstroAppendix = lazy(() => import('./components/AstroAppendix').then(m => ({ default: m.AstroAppendix })));
import { MissionHUD } from './components/MissionHUD';
import { BridgeModule } from './components/BridgeModule';

type Module = 'BRIDGE' | 'ORACLE' | 'OBSERVA' | 'HANGAR' | 'CHRONOS' | 'DATA_LAB' | 'APPENDIX';

// Loading fallback for lazy-loaded modules
function ModuleLoader() {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-cyan-400 font-mono text-xl animate-pulse">
        LOADING MODULE...
      </div>
    </div>
  );
}

function Loader() {
  return <Html center><div className="text-cyan-500 font-mono animate-pulse">INITIALIZING SYSTEM...</div></Html>;
}

// Inner component that uses GameContext
function AppInner() {
  const { visitBody, checkAchievements } = useGame();
  // Use time simulation hook for real-time updates
  const timeSimulation = useTimeSimulation(new Date(), 1); // 1 = real-time speed
  const { currentDate, setCurrentDate, isPlaying, setIsPlaying, playbackSpeed, setPlaybackSpeed, jumpToNow, skipHours, skipDays } = timeSimulation;
  
  const [focusedBody, setFocusedBody] = useState<string | null>(null);
  const [focusedBodyPosition, setFocusedBodyPosition] = useState<Vector3 | null>(null);
  const [viewingLocation, setViewingLocation] = useState<{lat: number, lon: number, name: string} | null>(null);
  const [boardedVehicle, setBoardedVehicle] = useState<string | null>(null);
  const [surfaceMode, setSurfaceMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);
  const [freeCameraMode, setFreeCameraMode] = useState(false);
  
  // NEW: Cinematic splash state
  const [showSplash, setShowSplash] = useState(true);
  
  // NEW: Navigation module state
  const [activeModule, setActiveModule] = useState<Module>('BRIDGE');
  
  // Simulation Lab state
  const [simulationMode, setSimulationMode] = useState(false);
  const [simulatedParams, setSimulatedParams] = useState<{ kp: number; solarWindSpeed: number; bz: number } | null>(null);
  
  // NEW: Theme and traffic state
  const [appTheme, setAppTheme] = useState<AppTheme>('SCI_FI');
  const [showSpaceTraffic, setShowSpaceTraffic] = useState(true);
  const [showMissionControl, setShowMissionControl] = useState(false);
  const [showDataDashboard, setShowDataDashboard] = useState(false);
  const [showSkyViewer, setShowSkyViewer] = useState(false);
  const [showCredits, setShowCredits] = useState(false);
  const [showConstellations, setShowConstellations] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  // v3.0: Advanced features state
  const [showMLForecast, setShowMLForecast] = useState(true);
  const [showKpTrend, setShowKpTrend] = useState(true);
  const [showCMEParticles, setShowCMEParticles] = useState(false);
  const [showMeteors, setShowMeteors] = useState(true);
  
  // v3.6: Navigation state
  const [showRadialMenu, setShowRadialMenu] = useState(false);
  const [showRadialWarp, setShowRadialWarp] = useState(false);
  const [showWeatherHUD, setShowWeatherHUD] = useState(false);
  const [selectedCity, setSelectedCity] = useState<{lat: number; lon: number; name: string} | null>(null);
  
  // v3.8: Advanced systems state
  const [showDeepSpace, setShowDeepSpace] = useState(false);
  const [deepSpaceLogScale, setDeepSpaceLogScale] = useState(true);
  
  const controlsRef = useRef<any>(null);
  const { data } = useAuroraData(LOCATIONS[0]);
  
  // v3.0: Live space weather data with 60s auto-refresh
  const liveData = useLiveSpaceWeather();
  
  // Detect mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  // Use live data if available, otherwise fall back to old data
  // Priority: simulation > live > old aurora data
  const effectiveKp = simulationMode && simulatedParams 
    ? simulatedParams.kp 
    : (liveData.data?.kpIndex || data.kpIndex?.kpValue || 3);
  const effectiveSolarWind = simulationMode && simulatedParams 
    ? simulatedParams.solarWindSpeed 
    : (liveData.data?.solarWind.speed || data.solarWind?.speed || 400);
  const effectiveBz = simulationMode && simulatedParams 
    ? simulatedParams.bz 
    : (liveData.data?.solarWind.bz || data.solarWind?.bz || 0);

  // v3.6: Smart Alerts Integration
  const alerts = useAlerts();

  // Simulated loading progress
  useEffect(() => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 15 + 5;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setTimeout(() => setIsLoading(false), 500); // Short delay before hiding
      }
      setLoadingProgress(progress);
    }, 200);
    return () => clearInterval(interval);
  }, []);

  const handleTravel = (targetName: string, location?: any) => {
    // Track visit for gamification
    visitBody(targetName);
    
    if (targetName === 'Earth' && location) {
       setFocusedBody('Earth');
       // Switch to surface mode instead of modal
       setTimeout(() => {
         setSurfaceMode(true);
         setViewingLocation(location);
       }, 1500);
    } else {
       setFocusedBody(targetName);
       setSurfaceMode(false);
    }
  };

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'h' || e.key === 'H') {
        setShowKeyboardHelp(prev => !prev);
      }
      if (e.key === 'Escape') {
        if (surfaceMode) setSurfaceMode(false);
        if (showSkyViewer) setShowSkyViewer(false);
        if (showCredits) setShowCredits(false);
        if (showMissionControl) setShowMissionControl(false);
        if (showDataDashboard) setShowDataDashboard(false);
        if (showRadialMenu) setShowRadialMenu(false);
        if (showRadialWarp) setShowRadialWarp(false);
      }
      if (e.key === 'f' || e.key === 'F') {
        setFreeCameraMode(prev => !prev);
      }
      if (e.key === 'm' || e.key === 'M') {
        setShowMissionControl(prev => !prev);
      }
      if (e.key === 'c' || e.key === 'C') {
        setShowConstellations(prev => !prev);
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [surfaceMode, showSkyViewer, showCredits, showMissionControl, showDataDashboard, showRadialMenu, showRadialWarp]);

  // Right-click to open radial menu
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      setShowRadialMenu(true);
    };

    window.addEventListener('contextmenu', handleContextMenu);
    return () => window.removeEventListener('contextmenu', handleContextMenu);
  }, []);

  // AUTO-FOCUS CAMERA when focusedBody changes (positions camera but allows free rotation)
  useEffect(() => {
    if (!controlsRef.current || !focusedBody) {
      setFocusedBodyPosition(null);
      return;
    }
    
    const controls = controlsRef.current;
    const camera = controls.object;
    
    // Get body position and optimal viewing distance
    const bodyPosition = getBodyPosition(focusedBody, currentDate);
    setFocusedBodyPosition(bodyPosition); // Store for distance calculations
    
    const viewDistance = getOptimalViewDistance(focusedBody);
    const targetCameraPos = calculateCameraPosition(bodyPosition, viewDistance);
    
    // Smooth animation
    const duration = 1500; // ms
    const startPos = camera.position.clone();
    const startLookAt = controls.target.clone();
    const startTime = Date.now();
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // Ease out cubic
      
      camera.position.lerpVectors(startPos, targetCameraPos, eased);
      controls.target.lerpVectors(startLookAt, bodyPosition, eased);
      controls.update();
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        // After animation completes, set target but allow free rotation
        controls.target.copy(bodyPosition);
        controls.update();
      }
    };
    
    // Check for achievements
    checkAchievements({ 
      focusedBody, 
      kpValue: data?.kpIndex?.kpValue || 0,
      boardedVehicle,
      surfaceMode 
    });
    
    animate();
  }, [focusedBody, checkAchievements, data, boardedVehicle, surfaceMode]); // Add dependencies

  return (
    <>
      {/* ALPHA WOLF SPLASH SCREEN */}
      {showSplash && (
        <CinematicSplashAlpha onComplete={() => setShowSplash(false)} />
      )}
      
      {/* MAIN APP */}
      {!showSplash && (
        <div className="relative w-screen h-screen overflow-hidden">
          
          {/* LAYER 0: Canvas with conditional 3D scenes */}
          <Canvas
            camera={{ position: [0, 20, 45], fov: 45, near: 0.1, far: 100000 }}
            gl={{ antialias: true }}
            shadows
            className="absolute inset-0 z-0"
          >
            {/* Background Elements */}
            <Suspense fallback={null}>
              <UniverseBackground />
              <ShootingStars />
              
              {/* Constellation Lines */}
              {showConstellations && <ConstellationLines />}
              
              {/* Solar Wind Particles */}
              <SolarWindParticles 
                solarWindSpeed={effectiveSolarWind}
                kpValue={effectiveKp}
              />
            </Suspense>

            {/* Conditional Scene Rendering based on activeModule */}
            <Suspense fallback={<Loader />}>
              {/* ALWAYS SHOW SOLAR SYSTEM (except in OBSERVA) */}
              {(activeModule === 'BRIDGE' || activeModule === 'CHRONOS') && !surfaceMode && (
                <>
                  <SolarSystemScene 
                    kpValue={effectiveKp}
                    currentDate={currentDate}
                    focusedBody={focusedBody}
                    focusedBodyPosition={focusedBodyPosition}
                    onBodyFocus={setFocusedBody}
                    onLocationClick={(city: any) => {
                      setSurfaceMode(true);
                      setViewingLocation(city);
                    }}
                    onVehicleBoard={setBoardedVehicle}
                    controlsRef={controlsRef}
                    showConstellations={showConstellations}
                  />
                  
                  {/* v3.0 NEW: CME Particle System */}
                  {showCMEParticles && effectiveKp >= 4 && (
                    <CMEParticleSystem 
                      active={true}
                      solarWindSpeed={effectiveSolarWind}
                    />
                  )}
                  
                  {/* v3.0 NEW: Meteor Showers */}
                  {showMeteors && <MeteorShowerSystem />}
                  
                  {/* AUDIO REMOVED: PlanetarySounds - Too overwhelming */}
                  {/* Replaced with Spotify embed in GoldenRecord component */}
                  
                  {/* Orbit Controls (only in space view, disabled if free camera) */}
                  {!freeCameraMode && (
                    <OrbitControls 
                      ref={controlsRef} 
                      enablePan={true} 
                      enableZoom={true}
                      enableDamping={true}
                      dampingFactor={0.05}
                      rotateSpeed={0.5}
                      zoomSpeed={1.2}
                      panSpeed={0.8}
                      minDistance={1.1}
                      maxDistance={8000}
                      makeDefault
                    />
                  )}
                  
                  {/* Free Camera Controls (WASD/Arrow keys) */}
                  <FreeCameraControls enabled={freeCameraMode} speed={2} />
                </>
              )}

              {activeModule === 'OBSERVA' && surfaceMode && viewingLocation && (
                <SurfaceView
                  location={viewingLocation}
                  auroraData={data}
                  onReturnToBridge={() => {
                    setSurfaceMode(false);
                    setViewingLocation(null);
                    setActiveModule('BRIDGE');
                  }}
                />
              )}
            </Suspense>
          </Canvas>

          {/* LAYER 1: UI Overlay */}
          <div className="absolute inset-0 z-10 pointer-events-none flex flex-col justify-between">
            
            {/* Navigation Rail - Always visible */}
            <div className="pointer-events-auto">
              <NavigationRail 
                activeModule={activeModule} 
                setActiveModule={(module) => setActiveModule(module)}
                currentDate={currentDate}
                showSpaceTraffic={showSpaceTraffic}
                onToggleTraffic={() => setShowSpaceTraffic(!showSpaceTraffic)}
                showConstellations={showConstellations}
                onToggleConstellations={() => setShowConstellations(!showConstellations)}
              />
            </div>

            {/* NASA Eyes Scan-line Effects */}
            <div className="scanline-overlay pointer-events-none" />
            <div className="scanline-sweep pointer-events-none" />

            {/* Mission HUD - Mission/Camera/System Info (BRIDGE only) */}
            {activeModule === 'BRIDGE' && !showMissionControl && (
              <>
                <div className="pointer-events-none">
                  <MissionHUD
                    focusedBody={focusedBody}
                    currentDate={currentDate}
                    activeModule={activeModule}
                  />
                </div>
                
                {/* Bridge Control Panel */}
                <BridgeModule
                  focusedBody={focusedBody}
                  kpValue={effectiveKp}
                  solarWindSpeed={effectiveSolarWind}
                  density={liveData.data?.solarWind.density || 5}
                  currentDate={currentDate}
                  onBodyFocus={setFocusedBody}
                  cameraDistance={focusedBodyPosition ? 
                    Math.sqrt(
                      focusedBodyPosition.x ** 2 + 
                      focusedBodyPosition.y ** 2 + 
                      focusedBodyPosition.z ** 2
                    ) : 0
                  }
                />
                
                {/* Time Slider Overlay - Historical playback control */}
                <TimeSliderOverlay
                  currentDate={currentDate}
                  setCurrentDate={setCurrentDate}
                  isPlaying={isPlaying}
                  setIsPlaying={setIsPlaying}
                  playbackSpeed={playbackSpeed}
                  setPlaybackSpeed={setPlaybackSpeed}
                  onJumpToNow={jumpToNow}
                  onSkipHours={skipHours}
                  onSkipDays={skipDays}
                />
              </>
            )}

            {/* Module-specific UI overlays */}
            {activeModule === 'ORACLE' && (
              <Suspense fallback={<ModuleLoader />}>
                <div className="pointer-events-auto w-full h-full">
                  <OracleModule />
                </div>
              </Suspense>
            )}

            {activeModule === 'HANGAR' && (
              <Suspense fallback={<ModuleLoader />}>
                <div className="pointer-events-auto w-full h-full">
                  <HangarModule 
                    initialVehicle={boardedVehicle}
                    onExit={() => setBoardedVehicle(null)}
                  />
                </div>
              </Suspense>
            )}

            {activeModule === 'CHRONOS' && (
              <Suspense fallback={<ModuleLoader />}>
                <div className="pointer-events-auto w-full h-full">
                  <ChronosModule />
                </div>
              </Suspense>
            )}

            {activeModule === 'DATA_LAB' && (
              <Suspense fallback={<ModuleLoader />}>
                <div className="pointer-events-auto w-full h-full">
                  <DataScienceLab />
                </div>
              </Suspense>
            )}

            {activeModule === 'APPENDIX' && (
              <Suspense fallback={<ModuleLoader />}>
                <div className="pointer-events-auto w-full h-full">
                  <AstroAppendix onClose={() => setActiveModule('BRIDGE')} />
                </div>
              </Suspense>
            )}

            {activeModule === 'OBSERVA' && !surfaceMode && (
              <div className="w-full h-full bg-slate-950 flex items-center justify-center pointer-events-auto">
                <div className="text-center">
                  <h2 className="text-2xl text-cyan-400 font-mono mb-4">OBSERVA // SURFACE MODE</h2>
                  <p className="text-gray-400 mb-6">Click a city on Earth to land</p>
                  <button
                    onClick={() => setActiveModule('BRIDGE')}
                    className="px-6 py-3 bg-cyan-600 hover:bg-cyan-500 border-2 border-cyan-400 rounded-lg text-white font-bold"
                  >
                    RETURN TO BRIDGE
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* LAYER 2: BRIDGE Module UI Elements */}
          {activeModule === 'BRIDGE' && (
            <>
              {/* MISSION CONTROL MODE (Full screen overlay) */}
              {showMissionControl && (
                <div className="absolute inset-0 z-50 pointer-events-auto">
                  <MissionControlView
                    kpData={data.kpIndex || undefined}
                    solarWind={data.solarWind || undefined}
                    currentDate={currentDate}
                  />
                </div>
              )}

              {/* Corner Metrics (always visible in space view) */}
              {!surfaceMode && !boardedVehicle && !showMissionControl && (
                <CornerMetrics
                  theme="fighter"
                  currentDate={currentDate}
                  kpValue={effectiveKp}
                  solarWindSpeed={effectiveSolarWind}
                  focusedBody={focusedBody}
                  isMobile={isMobile}
                />
              )}

              {/* Top Bar UI Controls */}
              {!surfaceMode && !boardedVehicle && !showMissionControl && (
                <div className="absolute top-0 left-0 right-0 z-50 pointer-events-none p-4">
                  <div className="flex justify-between items-start w-full gap-2 flex-wrap">
                    {!isMobile && (
                      <div className="pointer-events-auto">
                        <QuickNav onTravel={handleTravel} planets={PLANETS} cities={CITIES} />
                      </div>
                    )}
                    
                    {/* Fast Travel Dropdown */}
                    <div className="pointer-events-auto">
                      <FastTravelDropdown
                        onTravelToPlanet={(planet) => handleTravel(planet)}
                        onTravelToDate={(date) => setCurrentDate(date)}
                        onTravelToLocation={(loc) => {
                          handleTravel('Earth', loc);
                        }}
                      />
                    </div>
                    
                    <div className="pointer-events-auto">
                      <HUDOverlay kpValue={data.kpIndex?.kpValue} windSpeed={data.solarWind?.speed} currentDate={currentDate} />
                    </div>
                    
                    {/* Mode Toggles */}
                    {!isMobile && (
                      <>
                        <button
                          onClick={() => setShowMissionControl(!showMissionControl)}
                          className={`pointer-events-auto px-3 py-2 border rounded-lg text-sm transition-all ${
                            showMissionControl 
                              ? 'bg-purple-600 border-purple-500 text-white' 
                              : 'bg-black/60 border-purple-500/30 text-purple-400 hover:bg-black/80 hover:border-purple-500'
                          }`}
                          title="Toggle Mission Control (M key)"
                        >
                          🎮 Mission Control
                        </button>
                        
                        <button
                          onClick={() => setShowDataDashboard(!showDataDashboard)}
                          className={`pointer-events-auto px-3 py-2 border rounded-lg text-sm transition-all ${
                            showDataDashboard 
                              ? 'bg-blue-600 border-blue-500 text-white' 
                              : 'bg-black/60 border-blue-500/30 text-blue-400 hover:bg-black/80 hover:border-blue-500'
                          }`}
                        >
                          📊 Dashboard
                        </button>
                        
                        <button
                          onClick={() => setShowConstellations(!showConstellations)}
                          className={`pointer-events-auto px-3 py-2 border rounded-lg text-sm transition-all ${
                            showConstellations 
                              ? 'bg-yellow-600 border-yellow-500 text-white' 
                              : 'bg-black/60 border-yellow-500/30 text-yellow-400 hover:bg-black/80 hover:border-yellow-500'
                          }`}
                          title="Toggle Constellations (C key)"
                        >
                          ⭐ Constellations
                        </button>
                      </>
                    )}
                    
                    {/* Free Camera Toggle */}
                    {!isMobile && (
                      <button
                        onClick={() => setFreeCameraMode(!freeCameraMode)}
                        className={`pointer-events-auto px-3 py-2 border rounded-lg text-sm transition-all ${
                          freeCameraMode 
                            ? 'bg-cyan-600 border-cyan-500 text-white' 
                            : 'bg-black/60 border-cyan-500/30 text-cyan-400 hover:bg-black/80 hover:border-cyan-500'
                        }`}
                        title="Toggle Free Camera (F key)"
                      >
                        {freeCameraMode ? '🚀 Free Cam ON' : '🎮 Free Cam (F)'}
                      </button>
                    )}
                    
                    {/* Theme Selector */}
                    <div className="pointer-events-auto">
                      <MythicThemeSelector
                        theme={appTheme}
                        onThemeChange={setAppTheme}
                      />
                    </div>
                    
                    {/* Keyboard Help Toggle */}
                    <button
                      onClick={() => setShowKeyboardHelp(!showKeyboardHelp)}
                      className="pointer-events-auto px-3 py-2 bg-black/60 hover:bg-black/80 border border-cyan-500/30 hover:border-cyan-500 rounded-lg text-cyan-400 text-sm transition-all"
                    >
                      {showKeyboardHelp ? 'Hide Help' : 'Help (H)'}
                    </button>
                    
                    {/* Credits Button */}
                    <button
                      onClick={() => setShowCredits(!showCredits)}
                      className="pointer-events-auto px-3 py-2 bg-black/60 hover:bg-black/80 border border-green-500/30 hover:border-green-500 rounded-lg text-green-400 text-sm transition-all"
                    >
                      ℹ️ About
                    </button>
                  </div>
                </div>
              )}

              {/* Bottom Bar UI Controls */}
              {!surfaceMode && !boardedVehicle && !showMissionControl && !isMobile && (
                <div className="absolute bottom-0 left-0 right-0 z-50 pointer-events-none p-4">
                  <div className="pointer-events-auto mx-auto w-full max-w-4xl">
                    {showDataDashboard ? (
                      <DataDashboard 
                        kpData={data.kpIndex || undefined}
                      />
                    ) : (
                      <TelemetryDeck
                        data={data}
                        currentDate={currentDate}
                        setDate={setCurrentDate}
                        isPlaying={isPlaying}
                        setIsPlaying={setIsPlaying}
                        playbackSpeed={playbackSpeed}
                        setPlaybackSpeed={setPlaybackSpeed}
                        onJumpToNow={jumpToNow}
                        onSkipHours={skipHours}
                        onSkipDays={skipDays}
                      />
                    )}
                  </div>
                </div>
              )}
            </>
          )}

          {/* LAYER 3: Persistent UI Elements (all modules) */}
          <div className="absolute inset-0 z-50 pointer-events-none">
            {/* XP Bar */}
            <div className="absolute top-4 right-4 pointer-events-auto">
              <XPBar />
            </div>
            
            {/* Threat Level */}
            <div className="absolute top-20 right-4 pointer-events-auto">
              <ThreatLevel 
                kpValue={effectiveKp}
                solarWindSpeed={effectiveSolarWind}
                bz={data.solarWind?.bz || null}
              />
            </div>
            
            {/* Grid Resilience */}
            <div className="absolute top-36 right-4 pointer-events-auto">
              <GridResilience 
                solarWindSpeed={effectiveSolarWind}
                bz={data.solarWind?.bz || 0}
              />
            </div>
          </div>
          
          {/* Mobile Data Panel */}
          {isMobile && !surfaceMode && !boardedVehicle && !showMissionControl && activeModule === 'BRIDGE' && (
            <div className="absolute inset-0 z-50 pointer-events-none">
              <div className="pointer-events-auto">
                <MobileDataPanel
                  theme="fighter"
                  kpData={data.kpIndex || undefined}
                  solarWind={data.solarWind || undefined}
                  selectedLocation={LOCATIONS[0]}
                  isMobile={isMobile}
                />
              </div>
            </div>
          )}

          {/* Keyboard Help (Toggle with H key) */}
          {showKeyboardHelp && !boardedVehicle && (
            <div className="absolute inset-0 z-[60] pointer-events-none flex items-center justify-center">
              <div className="pointer-events-auto">
                <KeyboardHelp />
              </div>
            </div>
          )}
          
          {/* Heimdall Protocol Warning */}
          <div className="absolute inset-0 z-50 pointer-events-none">
            <div className="pointer-events-auto">
              <HeimdallProtocol
                theme={appTheme}
                kpIndex={effectiveKp}
                windSpeed={effectiveSolarWind}
                bz={effectiveBz}
              />
            </div>
          </div>
          
          {/* Sky Viewer Modal */}
          {showSkyViewer && viewingLocation && (
            <div className="absolute inset-0 z-[70] pointer-events-none flex items-center justify-center">
              <div className="pointer-events-auto">
                <SkyViewer
                  lat={viewingLocation.lat}
                  lon={viewingLocation.lon}
                  locationName={viewingLocation.name}
                  onClose={() => setShowSkyViewer(false)}
                />
              </div>
            </div>
          )}
          
          {/* Credits Modal */}
          {showCredits && (
            <div className="absolute inset-0 z-[70] pointer-events-none flex items-center justify-center">
              <div className="pointer-events-auto">
                <CreditsModal onClose={() => setShowCredits(false)} />
              </div>
            </div>
          )}
          
          {/* VEHICLE VIEW (ISS, Parker, UFO) */}
          {boardedVehicle && (
            <div className="absolute inset-0 z-[60]">
              <VehicleView 
                vehicle={boardedVehicle as any}
                onExit={() => {
                  setBoardedVehicle(null);
                  setFocusedBody(null);
                }}
              />
            </div>
          )}
          
          {/* AUDIO REMOVED: SpaceAudio - Too overwhelming */}
          {/* Replaced with Spotify Lo-fi Orbital Beats in GoldenRecord (Hangar) */}
          
          {/* Storm Designer Panel */}
          {activeModule === 'BRIDGE' && (
            <div className="absolute top-1/2 -translate-y-1/2 right-4 z-50 pointer-events-none">
              <div className="pointer-events-auto">
                <StormDesigner
                  isActive={simulationMode}
                  onApply={(params) => {
                    setSimulationMode(true);
                    setSimulatedParams(params);
                  }}
                  onReset={() => {
                    setSimulationMode(false);
                    setSimulatedParams(null);
                  }}
                />
              </div>
            </div>
          )}
          
          {/* v3.0: Live Data Panel (60s auto-refresh) */}
          {activeModule === 'BRIDGE' && !showMissionControl && !showDataDashboard && !boardedVehicle && !surfaceMode && (
            <div className="absolute top-4 left-4 z-50 pointer-events-auto">
              <LiveDataPanel />
            </div>
          )}
          
          {/* v3.0: ML Aurora Forecast Panel (left side) */}
          {showMLForecast && activeModule === 'BRIDGE' && !showMissionControl && !showDataDashboard && !boardedVehicle && !surfaceMode && (
            <div className="absolute top-4 left-4 max-w-md z-50 pointer-events-auto">
              <MLAuroraForecast />
            </div>
          )}
          
          {/* v3.0: KP Trend Chart (bottom center) */}
          {showKpTrend && activeModule === 'BRIDGE' && !showMissionControl && !showDataDashboard && !boardedVehicle && !surfaceMode && (
            <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 z-50 pointer-events-auto">
              <KpTrendChart />
            </div>
          )}
          
          {/* v3.0: Notification System */}
          <div className="absolute top-4 right-4 z-[60] pointer-events-auto">
            <NotificationSystem />
          </div>
          
          {/* v3.6: CommArray (Social Links Portal) - Top Right */}
          {!showMissionControl && (
            <div className="absolute top-4 right-20 z-[900] pointer-events-auto">
              <CommArray />
            </div>
          )}
          
          {/* v3.6: NeuralLink (Search Bar) - Top Center */}
          {!showMissionControl && (
            <NeuralLink
              planets={PLANETS}
              cities={CITIES}
              onSelect={(item, type) => {
                if (type === 'planet') {
                  handleTravel(item.name);
                } else {
                  handleTravel('Earth', item);
                }
              }}
            />
          )}
          
          {/* v3.6: RadialMenu (Right-Click Navigation) */}
          {showRadialMenu && (
            <RadialMenu
              isOpen={showRadialMenu}
              onClose={() => setShowRadialMenu(false)}
              planets={PLANETS.map(p => ({ name: p.name, color: 'text-cyan-400' }))}
              cities={CITIES}
              currentLocation={focusedBody || undefined}
              onPlanetSelect={(planet: any) => {
                handleTravel(planet.name);
                setShowRadialMenu(false);
              }}
              onCitySelect={(city: any) => {
                handleTravel('Earth', city);
                setShowRadialMenu(false);
              }}
            />
          )}
          
          {/* v3.6: RadialWarp (Fast Travel Interface) */}
          {showRadialWarp && (
            <RadialWarp
              isOpen={showRadialWarp}
              onClose={() => setShowRadialWarp(false)}
              onWarp={(location) => {
                if (location.type === 'planet') {
                  handleTravel(location.id);
                } else {
                  handleTravel('Earth', { 
                    name: location.name, 
                    lat: location.coordinates?.lat || 0, 
                    lon: location.coordinates?.lon || 0 
                  });
                  setSelectedCity({
                    name: location.name,
                    lat: location.coordinates?.lat || 0,
                    lon: location.coordinates?.lon || 0
                  });
                  setShowWeatherHUD(true);
                }
              }}
              currentLocation={focusedBody || undefined}
            />
          )}
          
          {/* v3.6: WeatherHUD (Local Visibility) */}
          {showWeatherHUD && selectedCity && activeModule === 'BRIDGE' && !showMissionControl && (
            <div className="absolute bottom-24 right-4 z-[800] pointer-events-auto">
              <WeatherHUD
                lat={selectedCity.lat}
                lon={selectedCity.lon}
                locationName={selectedCity.name}
                kpValue={effectiveKp}
              />
              <button
                onClick={() => setShowWeatherHUD(false)}
                className="mt-2 w-full px-3 py-2 text-xs font-mono text-cyan-400 hover:text-amber-400 backdrop-blur-lg bg-black/40 border border-cyan-500/50 rounded"
              >
                CLOSE WEATHER
              </button>
            </div>
          )}
          
          {/* LAYER Z-999: Loading Screen (Highest z-index) */}
          <div className="absolute inset-0 z-[999] pointer-events-none">
            <LoadingScreen isLoading={isLoading} progress={loadingProgress} />
          </div>
        </div>
      )}

      {/* FUEL CELL DONATION BUTTON (Always visible, persistent across all modules) */}
      {!showSplash && <FuelCell donationLink="https://ko-fi.com/steve81uk" />}
    </>
  );
}

// Main export wraps with GameProvider
export default function App() {
  return (
    <GameProvider>
      <AppInner />
    </GameProvider>
  );
}