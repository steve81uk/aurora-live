import { useState, useRef, Suspense, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { Html, OrbitControls } from '@react-three/drei';
import { LOCATIONS } from './data/locations';
import { useAuroraData } from './hooks/useAuroraData';
import * as THREE from 'three';

// IMPORTS MUST MATCH EXPORTS
import SolarSystemScene, { PLANETS, CITIES } from './components/SolarSystemScene';
import { UniverseBackground } from './components/UniverseBackground';
import { QuickNav } from './components/QuickNav';
import { TelemetryDeck } from './components/TelemetryDeck'; 
import { SkyViewer } from './components/SkyViewer';
import { HUDOverlay } from './components/HUDOverlay';

function Loader() {
  return <Html center><div className="text-cyan-500 font-mono animate-pulse">INITIALIZING SYSTEM...</div></Html>;
}

export default function App() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [focusedBody, setFocusedBody] = useState<string | null>(null);
  const [viewingLocation, setViewingLocation] = useState<{lat: number, lon: number, name: string} | null>(null);
  
  const controlsRef = useRef<any>(null);
  const { data } = useAuroraData(LOCATIONS[0]);

  const handleTravel = (targetName: string, location?: any) => {
    if (targetName === 'Earth' && location) {
       setFocusedBody('Earth');
       setTimeout(() => setViewingLocation(location), 1000);
    } else {
       setFocusedBody(targetName);
    }
  };

  // AUTO-FOCUS CAMERA when focusedBody changes
  useEffect(() => {
    if (!controlsRef.current || !focusedBody) return;
    
    const controls = controlsRef.current;
    const camera = controls.object;
    
    // Focal distances for each body (in screen units)
    const distances: any = {
      'Sun': { distance: 35, target: [0, 0, 0] },
      'Mercury': { distance: 3, target: null }, // Will calculate
      'Venus': { distance: 5, target: null },
      'Earth': { distance: 8, target: null },
      'Mars': { distance: 5, target: null },
      'Jupiter': { distance: 15, target: null },
      'Saturn': { distance: 15, target: null },
      'Uranus': { distance: 10, target: null },
      'Neptune': { distance: 10, target: null },
      'Pluto': { distance: 3, target: null }
    };
    
    const config = distances[focusedBody];
    if (!config) return;
    
    // If target is Sun, just move camera
    if (focusedBody === 'Sun') {
      const targetPos = new THREE.Vector3(0, 10, config.distance);
      const targetLookAt = new THREE.Vector3(0, 0, 0);
      
      // Smooth animation
      const duration = 1500; // ms
      const startPos = camera.position.clone();
      const startLookAt = controls.target.clone();
      const startTime = Date.now();
      
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3); // Ease out cubic
        
        camera.position.lerpVectors(startPos, targetPos, eased);
        controls.target.lerpVectors(startLookAt, targetLookAt, eased);
        controls.update();
        
        if (progress < 1) requestAnimationFrame(animate);
      };
      animate();
    }
  }, [focusedBody]);

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
    </div>
  );
}