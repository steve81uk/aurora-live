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

// v3.17 GEOLOCATION
import { useGeoLocation } from './hooks/useGeoLocation';

// v3.18 PEAK VIEW
import { calcAuroralPeakLocation } from './services/DataBridge';
import type { AuroralPeakLocation } from './services/DataBridge';

// v3.0 WEEK 2+ NEW FEATURES
import { NeuralForecastCard } from './components/NeuralForecastCard';
import { KpTrendChart } from './components/KpTrendChart';
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
import { WeatherHUD } from './components/WeatherHUD';

// v3.8 ADVANCED PHYSICS & SYSTEMS

// v3.16 CAMBRIDGE AUTO-ZOOM: LSTM 90% severity trigger
import { neuralForecaster } from './ml/LSTMForecaster';
import type { NeuralForecast } from './ml/types';

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

/** Minimal interface for the drei OrbitControls imperative handle */
interface ControlsHandle {
  object: { position: Vector3; clone: () => Vector3 };
  target: Vector3 & { clone: () => Vector3; lerpVectors: (a: Vector3, b: Vector3, t: number) => Vector3; copy: (v: Vector3) => Vector3 };
  update: () => void;
}

/** Shared coordinate type used for surface travel targets */
type GeoCoord = { lat: number; lon: number; name: string };

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
  const [isLoading, _setIsLoading] = useState(true);
  const [loadingProgress, _setLoadingProgress] = useState(0);
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
  
  // v3.0: Advanced features state — setters kept for future HUD toggles
  const [showMLForecast, _setShowMLForecast] = useState(true);
  const [showKpTrend, _setShowKpTrend] = useState(true);
  const [showCMEParticles, _setShowCMEParticles] = useState(false);
  const [showMeteors, _setShowMeteors] = useState(true);
  
  // v3.6: Navigation state
  const [showRadialMenu, setShowRadialMenu] = useState(false);
  const [showRadialWarp, setShowRadialWarp] = useState(false);
  const [showWeatherHUD, setShowWeatherHUD] = useState(false);
  const [selectedCity, setSelectedCity] = useState<{lat: number; lon: number; name: string} | null>(null);
  
  // v3.8: Advanced systems state — reserved for future deep-space panel

  // v3.16: Cambridge auto-zoom — fires when LSTM forecast hits 90% severity
  const [lstmForecast, setLstmForecast] = useState<NeuralForecast | null>(null);
  const [stormBannerVisible, setStormBannerVisible] = useState(false);
  const hasZoomedToCambridge = useRef(false); // Prevent repeated interruptions per threshold crossing

  // v3.17: Geolocation — resolves to GPS coords or Cambridge fallback
  const { location: geoLocation, permission: geoPermission, setManualLocation, clearManualLocation, retry: retryGeo } = useGeoLocation();
  // homeStation is the persistent "anchor" (GPS or fallback); beaconLocation is a one-off manual override
  const [beaconLocation, setBeaconLocation] = useState<GeoCoord | null>(null);
  // The effective location used for camera zoom + UserBeacon in the scene
  const homeStation: GeoCoord = beaconLocation ?? geoLocation;

  // v3.18: Auroral peak location — recalculated every time live data updates
  const [peakLocation, setPeakLocation] = useState<AuroralPeakLocation | null>(null);
  
  const controlsRef = useRef<ControlsHandle | null>(null);
  const { data } = useAuroraData(LOCATIONS[0]);
  
  // v3.0: Live space weather data with 60s auto-refresh
  const liveData = useLiveSpaceWeather();
  
  // Detect mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // v3.16: Poll LSTM forecast every 5 minutes
  useEffect(() => {
    if (!liveData.data) return;
    const buildFeatures = (d: typeof liveData.data) => {
      const gen = (v: number, variance: number) =>
        Array.from({ length: 24 }, (_, i) => v + Math.sin(i / 4) * variance * 0.3 + (Math.random() - 0.5) * variance * 0.5);
      return {
        solarWindSpeed: gen(d!.solarWind.speed, 100),
        solarWindDensity: gen(d!.solarWind.density ?? 5, 3),
        magneticFieldBz: gen(d!.solarWind.bz, 4),
        magneticFieldBt: gen(Math.abs(d!.solarWind.bz) + 3, 2),
        newellCouplingHistory: gen(0, 3000),
        alfvenVelocityHistory: gen(50, 20),
        syzygyIndex: 0.3,
        jupiterSaturnAngle: 0.5,
        solarRotationPhase: (Date.now() / (27 * 24 * 60 * 60 * 1000)) % 1,
        solarCyclePhase: 0.6,
        timeOfYear: new Date().getMonth() / 12,
      };
    };
    const run = async () => {
      try {
        const features = buildFeatures(liveData.data);
        const pred = await neuralForecaster.predict(features);
        setLstmForecast(pred);
      } catch { /* silent — model weights may be untrained */ }
    };
    run();
    const interval = setInterval(run, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [liveData.data]);

  // v3.18: Recalculate auroral peak whenever live data updates (piggybacks the 60s refresh)
  useEffect(() => {
    if (!liveData.data) return;
    const kp = liveData.data.kpIndex ?? 3;
    const bz = liveData.data.solarWind?.bz ?? 0;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPeakLocation(calcAuroralPeakLocation(kp, bz));
  }, [liveData.data]);

  // v3.16/v3.17: Auto-zoom to Home Station when LSTM confidence ≥ 90%
  useEffect(() => {
    if (!lstmForecast) return;
    const { sixHour, twelveHour, twentyFourHour } = lstmForecast.predictions;
    const maxProb = Math.max(
      sixHour.stormProbability,
      twelveHour.stormProbability,
      twentyFourHour.stormProbability
    );
    if (maxProb >= 0.9 && !hasZoomedToCambridge.current) {
      hasZoomedToCambridge.current = true;
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setActiveModule('BRIDGE');
      setFocusedBody('Earth');
      setTimeout(() => {
        setSurfaceMode(true);
        setViewingLocation(homeStation);
        setStormBannerVisible(true);
      }, 1500);
    }
    // Reset latch when probability drops below threshold so future crossings can fire again
    if (maxProb < 0.9) {
      hasZoomedToCambridge.current = false;
    }
  }, [lstmForecast, homeStation]);
  
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

  // v3.6: Smart Alerts Integration — called for its notification side-effects
  useAlerts();

  // v3.16/v3.20: Real-Time Neural Feed
  useEffect(() => {
    if (!liveData.data) return;

    const runNeuralInference = async () => {
      try {
        // Construct the 5-Pillar Feature Vector from Live OMNI Data
        // We use current values and simulate the 24h history required by the LSTM
        const d = liveData.data!;
        const genHistory = (val: number, variance: number) => 
          Array.from({ length: 24 }, (_, i) => val + Math.sin(i / 4) * variance * 0.2 + (Math.random() - 0.5) * variance * 0.3);

        const features: FeatureVector = {
          solarWindSpeed: genHistory(d.solarWind.speed, 80),
          solarWindDensity: genHistory(d.solarWind.density || 5, 2),
          magneticFieldBt: genHistory(Math.abs(d.solarWind.bz) + 3, 2),
          magneticFieldBz: genHistory(d.solarWind.bz, 5),
          kpIndex: genHistory(d.kpIndex || 3, 1),
          // Metadata for types
          newellCouplingHistory: Array(24).fill(d.calculated?.newellCoupling || 0),
          alfvenVelocityHistory: Array(24).fill(d.calculated?.alfvenVelocity || 0),
          syzygyIndex: 0.3,
          jupiterSaturnAngle: 0.5,
          solarRotationPhase: (Date.now() / (27 * 24 * 60 * 60 * 1000)) % 1,
          solarCyclePhase: 0.6,
          timeOfYear: new Date().getMonth() / 12,
        };

        const pred = await neuralForecaster.predict(features);
        setLstmForecast(pred);
      } catch (err) {
        console.warn("🧠 Neural Engine: Waiting for training lock...", err);
      }
    };

    runNeuralInference();
    const interval = setInterval(runNeuralInference, 60 * 1000); // Sync with 60s OMNI refresh
    return () => clearInterval(interval);
  }, [liveData.data]);

  const handleTravel = (targetName: string, location?: GeoCoord) => {
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
      // eslint-disable-next-line react-hooks/set-state-in-effect
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
                    onLocationClick={(city: GeoCoord) => {
                      setSurfaceMode(true);
                      setViewingLocation(city);
                    }}
                    onVehicleBoard={setBoardedVehicle}
                    controlsRef={controlsRef}
                    showConstellations={showConstellations}
                    userLocation={homeStation}
                    onEarthClick={(coords: { lat: number; lon: number }) => {
                      // Drop a Beacon: override the home station with a user-chosen point
                      const beacon = { lat: coords.lat, lon: coords.lon, name: `Beacon ${coords.lat.toFixed(1)}°N ${coords.lon.toFixed(1)}°E`, isUserLocation: true as const };
                      setBeaconLocation(beacon);
                      setManualLocation(beacon); // persist to localStorage
                      setFocusedBody('Earth');
                    }}
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

          {/* v3.16: LSTM 90% Severity Storm Banner — auto-zooms to Home Station */}
          {stormBannerVisible && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[80] pointer-events-auto">
              <div className="flex items-center gap-3 px-5 py-3 rounded-lg backdrop-blur-md bg-red-900/70 border border-red-500/70 shadow-[0_0_30px_rgba(239,68,68,0.5)] animate-pulse">
                <span className="text-red-300 text-lg">🚨</span>
                <div className="text-sm font-['Rajdhani'] text-red-200 tracking-wide">
                  <span className="font-bold text-red-100">WOLF-SIGMA ALERT</span>
                  {' — '}LSTM forecast: ≥90% storm probability. Camera locked to{' '}
                  <span className="text-red-100 font-bold">{homeStation.name}</span>.
                </div>
                <button
                  onClick={() => setStormBannerVisible(false)}
                  className="ml-2 text-red-400 hover:text-red-200 text-lg leading-none transition-colors"
                  aria-label="Dismiss alert"
                >
                  ✕
                </button>
              </div>
            </div>
          )}

          {/* v3.17: Ground Station status + Beacon info — bottom-left corner */}
          {activeModule === 'BRIDGE' && !surfaceMode && !boardedVehicle && (
            <div className="absolute bottom-20 left-4 z-[60] pointer-events-auto">
              <div className="flex flex-col gap-1.5">
                {/* Geo status pill */}
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-[11px] font-mono backdrop-blur-sm border ${geoPermission === 'granted' ? 'bg-green-900/50 border-green-500/40 text-green-300' : 'bg-amber-900/50 border-amber-500/40 text-amber-300'}`}>
                  <span>{geoPermission === 'granted' ? '📡' : '⚓'}</span>
                  <span className="uppercase tracking-wide">{homeStation.name}</span>
                  <span className="text-gray-500">{homeStation.lat.toFixed(1)}° {homeStation.lon.toFixed(1)}°</span>
                </div>
                {/* Beacon hint */}
                {beaconLocation && (
                  <div className="flex items-center gap-2 px-3 py-1 rounded-md text-[10px] font-mono bg-cyan-900/50 border border-cyan-500/30 text-cyan-400">
                    <span>⊕</span>
                    <span>Custom Beacon Active</span>
                    <button
                      onClick={() => { setBeaconLocation(null); clearManualLocation(); }}
                      className="ml-auto text-cyan-600 hover:text-cyan-300"
                      title="Clear beacon — revert to GPS / Cambridge"
                    >✕</button>
                  </div>
                )}
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
                vehicle={boardedVehicle as 'Parker Solar Probe' | 'ISS' | 'UFO'}
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
          
          {/* v3.20: Sköll-Track Gen-2 HUD */}
          {showMLForecast && activeModule === 'BRIDGE' && !showMissionControl && !showDataDashboard && !boardedVehicle && !surfaceMode && (
            <div className="absolute top-4 left-4 max-w-sm z-50 pointer-events-auto">
              <NeuralForecastCard liveData={null} />
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
          
          {/* v3.6/v3.18: NeuralLink (Search Bar + Peak View) - Top Center */}
          {!showMissionControl && (
            <NeuralLink
              planets={PLANETS}
              cities={CITIES}
              homeStation={homeStation}
              geoPermission={geoPermission}
              peakLocation={peakLocation ?? undefined}
              onGoPeak={peakLocation ? () => {
                // Teleport camera to auroral oval sweet spot
                setActiveModule('BRIDGE');
                setFocusedBody('Earth');
                setTimeout(() => {
                  setSurfaceMode(true);
                  setViewingLocation({ lat: peakLocation.lat, lon: peakLocation.lon, name: peakLocation.name });
                }, 600);
              } : undefined}
              onSetHomeStation={() => {
                // One-click: request GPS, persist to localStorage, update homeStation
                retryGeo();
                if (navigator?.geolocation) {
                  navigator.geolocation.getCurrentPosition(
                    (pos) => {
                      setManualLocation({
                        lat: pos.coords.latitude,
                        lon: pos.coords.longitude,
                        name: 'Your Location',
                        isUserLocation: true,
                      });
                    },
                    () => { /* denied — retryGeo already triggers fallback */ }
                  );
                }
              }}
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
              onPlanetSelect={(planet: { name: string; color?: string }) => {
                handleTravel(planet.name);
                setShowRadialMenu(false);
              }}
              onCitySelect={(city: GeoCoord) => {
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