import { useState, useRef, Suspense, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { Html, OrbitControls } from '@react-three/drei';
import { LOCATIONS } from './data/locations';
import { useAuroraData } from './hooks/useAuroraData';
import { useTimeSimulation } from './hooks/useTimeSimulation';
import * as THREE from 'three';
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
import SpaceAudio from './components/SpaceAudio';
import VehicleView from './components/VehicleView';
import SurfaceView from './components/SurfaceView';
import FreeCameraControls from './components/FreeCameraControls';
import { GameProvider, useGame } from './context/GameContext';
import XPBar from './components/XPBar';
import PlanetarySounds from './components/PlanetarySounds';
import SolarWindParticles from './components/SolarWindParticles';
import ThreatLevel from './components/ThreatLevel';
import StormDesigner from './components/StormDesigner';
import GridResilience from './components/GridResilience';

// NEW COMPONENTS
import HelmetHUD, { type HUDTheme } from './components/HelmetHUD';
import CornerMetrics from './components/CornerMetrics';
import MissionControlView from './components/MissionControlView';
import { CreditsModal } from './components/CreditsModal';
import { FastTravelDropdown } from './components/FastTravelDropdown';
import { SkyViewer } from './components/SkyViewer';
import ConstellationLines from './components/ConstellationLines';
import { HeimdallProtocol } from './components/HeimdallProtocol';
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

// v3.0 CINEMATIC SPLASH
import { CinematicSplash } from './components/CinematicSplash';

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
  const [focusedBodyPosition, setFocusedBodyPosition] = useState<THREE.Vector3 | null>(null);
  const [viewingLocation, setViewingLocation] = useState<{lat: number, lon: number, name: string} | null>(null);
  const [boardedVehicle, setBoardedVehicle] = useState<string | null>(null);
  const [surfaceMode, setSurfaceMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);
  const [freeCameraMode, setFreeCameraMode] = useState(false);
  
  // NEW: Cinematic splash state
  const [showSplash, setShowSplash] = useState(true);
  
  // Simulation Lab state
  const [simulationMode, setSimulationMode] = useState(false);
  const [simulatedParams, setSimulatedParams] = useState<{ kp: number; solarWindSpeed: number; bz: number } | null>(null);
  
  // NEW: HUD and Theme states
  const [hudTheme, setHudTheme] = useState<HUDTheme>('fighter');
  const [appTheme, setAppTheme] = useState<AppTheme>('SCI_FI');
  const [showMissionControl, setShowMissionControl] = useState(false);
  const [showDataDashboard, setShowDataDashboard] = useState(false);
  const [showSkyViewer, setShowSkyViewer] = useState(false);
  const [showCredits, setShowCredits] = useState(false);
  const [showConstellations, setShowConstellations] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  
  // v3.0: Advanced features state
  const [showMLForecast, setShowMLForecast] = useState(true);
  const [showKpTrend, setShowKpTrend] = useState(true);
  const [showCMEParticles, setShowCMEParticles] = useState(false);
  const [showMeteors, setShowMeteors] = useState(true);
  
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
  }, [surfaceMode, showSkyViewer, showCredits, showMissionControl, showDataDashboard]);

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
      {/* CINEMATIC SPLASH SCREEN */}
      {showSplash && (
        <CinematicSplash onComplete={() => setShowSplash(false)} />
      )}
      
      {/* MAIN APP */}
      {!showSplash && (
        <HelmetHUD theme={hudTheme} onThemeChange={setHudTheme}>
          <div className="relative w-screen h-screen bg-black overflow-hidden select-none">
        
        {/* MISSION CONTROL MODE (Full screen overlay) */}
        {showMissionControl && (
          <MissionControlView
            kpData={data.kpIndex || undefined}
            solarWind={data.solarWind || undefined}
            currentDate={currentDate}
          />
        )}
        
        {/* LAYER 0: 3D Scene */}
        {!showMissionControl && (
          <div className="absolute inset-0 z-0">
            <Canvas
              camera={{ position: [0, 20, 45], fov: 45, near: 0.1, far: 100000 }}
              gl={{ antialias: true }}
              shadows
              className="w-full h-full"
            >
              {/* 1. Background (Independent Suspense) */}
              <Suspense fallback={null}>
                 <UniverseBackground />
                 <ShootingStars />
                 
                 {/* Constellation Lines */}
                 {showConstellations && <ConstellationLines />}
                 
                 {/* Solar Wind Particles - Color changes with speed */}
                 <SolarWindParticles 
                   solarWindSpeed={effectiveSolarWind}
                   kpValue={effectiveKp}
                 />
              </Suspense>

              {/* 2. Main Scene Content */}
              <Suspense fallback={<Loader />}>
            {surfaceMode ? (
              /* Surface View (First-Person) */
              <SurfaceView
                location={viewingLocation || undefined}
                kpValue={data.kpIndex?.kpValue || 3}
                currentDate={currentDate}
                onExit={() => {
                  setSurfaceMode(false);
                  setViewingLocation(null);
                }}
              />
            ) : (
              /* Space View (Orbital) */
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
                
                {/* Planetary Audio Sonification */}
                <PlanetarySounds 
                  focusedBody={focusedBody}
                  kpValue={effectiveKp}
                  solarWindSpeed={effectiveSolarWind}
                />
                
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
          </Suspense>
        </Canvas>
      </div>
      )}
        
        {/* Corner Metrics (always visible in space view) */}
        {!surfaceMode && !boardedVehicle && !showMissionControl && (
          <CornerMetrics
            theme={hudTheme}
            currentDate={currentDate}
            kpValue={effectiveKp}
            solarWindSpeed={effectiveSolarWind}
            focusedBody={focusedBody}
            isMobile={isMobile}
          />
        )}

        {/* LAYER 1: UI Overlay (Only in Space Mode) */}
        {!surfaceMode && !boardedVehicle && !showMissionControl && (
          <div className="absolute inset-0 z-10 pointer-events-none flex flex-col justify-between p-4">
            
            {/* Top Bar */}
            <div className="flex justify-between items-start w-full pointer-events-auto gap-2 flex-wrap">
               {!isMobile && <QuickNav onTravel={handleTravel} planets={PLANETS} cities={CITIES} />}
               
               {/* Fast Travel Dropdown */}
               <FastTravelDropdown
                 onTravelToPlanet={(planet) => handleTravel(planet)}
                 onTravelToDate={(date) => setCurrentDate(date)}
                 onTravelToLocation={(loc) => {
                   handleTravel('Earth', loc);
                 }}
               />
               
               <HUDOverlay kpValue={data.kpIndex?.kpValue} windSpeed={data.solarWind?.speed} currentDate={currentDate} />
               
               {/* Mode Toggles */}
               {!isMobile && (
                 <>
                   <button
                     onClick={() => setShowMissionControl(!showMissionControl)}
                     className={`px-3 py-2 border rounded-lg text-sm transition-all ${
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
                     className={`px-3 py-2 border rounded-lg text-sm transition-all ${
                       showDataDashboard 
                         ? 'bg-blue-600 border-blue-500 text-white' 
                         : 'bg-black/60 border-blue-500/30 text-blue-400 hover:bg-black/80 hover:border-blue-500'
                     }`}
                   >
                     📊 Dashboard
                   </button>
                   
                   <button
                     onClick={() => setShowConstellations(!showConstellations)}
                     className={`px-3 py-2 border rounded-lg text-sm transition-all ${
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
                   className={`px-3 py-2 border rounded-lg text-sm transition-all ${
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
               <MythicThemeSelector
                 theme={appTheme}
                 onThemeChange={setAppTheme}
               />
               
               {/* Keyboard Help Toggle */}
               <button
                 onClick={() => setShowKeyboardHelp(!showKeyboardHelp)}
                 className="px-3 py-2 bg-black/60 hover:bg-black/80 border border-cyan-500/30 hover:border-cyan-500 rounded-lg text-cyan-400 text-sm transition-all"
               >
                 {showKeyboardHelp ? 'Hide Help' : 'Help (H)'}
               </button>
               
               {/* Credits Button */}
               <button
                 onClick={() => setShowCredits(!showCredits)}
                 className="px-3 py-2 bg-black/60 hover:bg-black/80 border border-green-500/30 hover:border-green-500 rounded-lg text-green-400 text-sm transition-all"
               >
                 ℹ️ About
               </button>
            </div>

            {/* Bottom Bar */}
            {!isMobile && (
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
            )}
          </div>
        )}
        
        {/* Mobile Data Panel */}
        {isMobile && !surfaceMode && !boardedVehicle && !showMissionControl && (
          <MobileDataPanel
            theme={hudTheme}
            kpData={data.kpIndex || undefined}
            solarWind={data.solarWind || undefined}
            selectedLocation={LOCATIONS[0]}
            isMobile={isMobile}
          />
        )}

        {/* Keyboard Help (Toggle with H key) */}
        {showKeyboardHelp && !boardedVehicle && <KeyboardHelp />}
        
        {/* Heimdall Protocol Warning */}
        <HeimdallProtocol
          theme={appTheme}
          kpIndex={effectiveKp}
          windSpeed={effectiveSolarWind}
          bz={effectiveBz}
        />
        
        {/* Sky Viewer Modal */}
        {showSkyViewer && viewingLocation && (
          <SkyViewer
            lat={viewingLocation.lat}
            lon={viewingLocation.lon}
            locationName={viewingLocation.name}
            onClose={() => setShowSkyViewer(false)}
          />
        )}
        
        {/* Credits Modal */}
        {showCredits && <CreditsModal onClose={() => setShowCredits(false)} />}
        
        {/* VEHICLE VIEW (ISS, Parker, UFO) */}
        {boardedVehicle && (
          <VehicleView 
            vehicle={boardedVehicle as any}
            onExit={() => {
              setBoardedVehicle(null);
              setFocusedBody(null);
            }}
          />
        )}
        
        {/* Space Audio (ambient sounds + mute toggle) */}
        <SpaceAudio />
        
        {/* Storm Designer Panel */}
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
        
        {/* v3.0: Live Data Panel (60s auto-refresh) */}
        {!showMissionControl && !showDataDashboard && !boardedVehicle && !surfaceMode && (
          <LiveDataPanel />
        )}
        
        {/* v3.0: ML Aurora Forecast Panel (left side) */}
        {showMLForecast && !showMissionControl && !showDataDashboard && !boardedVehicle && !surfaceMode && (
          <div className="absolute top-4 left-4 max-w-md">
            <MLAuroraForecast />
          </div>
        )}
        
        {/* v3.0: KP Trend Chart (bottom center) */}
        {showKpTrend && !showMissionControl && !showDataDashboard && !boardedVehicle && !surfaceMode && (
          <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2">
            <KpTrendChart />
          </div>
        )}
        
        {/* v3.0: Notification System */}
        <NotificationSystem />
        
        {/* LAYER 3: Loading Screen */}
        <LoadingScreen isLoading={isLoading} progress={loadingProgress} />
      </div>
    </HelmetHUD>
      )}
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