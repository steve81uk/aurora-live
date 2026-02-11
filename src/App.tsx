import { useState, useRef, Suspense, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { Html, OrbitControls } from '@react-three/drei';
import { LOCATIONS } from './data/locations';
import { useAuroraData } from './hooks/useAuroraData';
import { useTimeSimulation } from './hooks/useTimeSimulation';
import * as THREE from 'three';
import { getBodyPosition, getOptimalViewDistance, calculateCameraPosition } from './utils/astronomy';

// IMPORTS MUST MATCH EXPORTS
import SolarSystemScene, { PLANETS, CITIES } from './components/SolarSystemScene';
import { UniverseBackground } from './components/UniverseBackground';
import { QuickNav } from './components/QuickNav';
import { TelemetryDeck } from './components/TelemetryDeck'; 
import { SkyViewer } from './components/SkyViewer';
import { HUDOverlay } from './components/HUDOverlay';
import LoadingScreen from './components/LoadingScreen';

function Loader() {
  return <Html center><div className="text-cyan-500 font-mono animate-pulse">INITIALIZING SYSTEM...</div></Html>;
}

export default function App() {
  // Use time simulation hook for real-time updates
  const timeSimulation = useTimeSimulation(new Date(), 1); // 1 = real-time speed
  const { currentDate, setCurrentDate, isPlaying, setIsPlaying, playbackSpeed, setPlaybackSpeed, jumpToNow, skipHours, skipDays } = timeSimulation;
  
  const [focusedBody, setFocusedBody] = useState<string | null>(null);
  const [focusedBodyPosition, setFocusedBodyPosition] = useState<THREE.Vector3 | null>(null);
  const [viewingLocation, setViewingLocation] = useState<{lat: number, lon: number, name: string} | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  
  const controlsRef = useRef<any>(null);
  const { data } = useAuroraData(LOCATIONS[0]);

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
    if (targetName === 'Earth' && location) {
       setFocusedBody('Earth');
       setTimeout(() => setViewingLocation(location), 1000);
    } else {
       setFocusedBody(targetName);
    }
  };

  // AUTO-FOCUS CAMERA when focusedBody changes (ALL BODIES)
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
      
      if (progress < 1) requestAnimationFrame(animate);
    };
    animate();
  }, [focusedBody, currentDate]);

  return (
    <div className="relative w-screen h-screen bg-black overflow-hidden select-none">
      
      {/* LAYER 0: 3D Scene */}
      <div className="absolute inset-0 z-0">
        <Canvas
          camera={{ position: [0, 20, 45], fov: 45, far: 1000000 }}
          gl={{ antialias: true }}
          shadows
          className="w-full h-full"
        >
          {/* Debug Box - If you see this red cube, the 3D engine is working */}
          <mesh position={[0, 10, 0]}>
             <boxGeometry args={[1, 1, 1]} />
             <meshBasicMaterial color="red" wireframe />
          </mesh>

          {/* 1. Background (Independent Suspense) */}
          <Suspense fallback={null}>
             <UniverseBackground />
          </Suspense>

          {/* 2. Solar System (Independent Suspense) */}
          <Suspense fallback={<Loader />}>
             <SolarSystemScene 
                kpValue={data.kpIndex?.kpValue || 3}
                currentDate={currentDate}
                focusedBody={focusedBody}
                focusedBodyPosition={focusedBodyPosition}
                onBodyFocus={setFocusedBody}
                onLocationClick={setViewingLocation}
                controlsRef={controlsRef}
             />
          </Suspense>

          <OrbitControls 
             ref={controlsRef} 
             enablePan={true} 
             enableZoom={true} 
             makeDefault
             maxDistance={100000} // Allow huge zoom out
          />
        </Canvas>
      </div>

      {/* LAYER 1: UI Overlay (Pointer Events Managed) */}
      <div className="absolute inset-0 z-10 pointer-events-none flex flex-col justify-between p-4">
        
        {/* Top Bar */}
        <div className="flex justify-between items-start w-full pointer-events-auto">
           <QuickNav onTravel={handleTravel} planets={PLANETS} cities={CITIES} />
           <HUDOverlay kpValue={data.kpIndex?.kpValue} windSpeed={data.solarWind?.speed} currentDate={currentDate} />
        </div>

        {/* Bottom Bar */}
        <div className="pointer-events-auto mx-auto w-full max-w-4xl">
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
        </div>
      </div>

      {/* LAYER 2: Modals */}
      {viewingLocation && (
        <div className="absolute inset-0 z-50 pointer-events-auto bg-black/90 flex items-center justify-center">
          <SkyViewer 
            lat={viewingLocation.lat} 
            lon={viewingLocation.lon} 
            locationName={viewingLocation.name} 
            onClose={() => setViewingLocation(null)} 
          />
        </div>
      )}
      
      {/* LAYER 3: Loading Screen */}
      <LoadingScreen isLoading={isLoading} progress={loadingProgress} />
    </div>
  );
}