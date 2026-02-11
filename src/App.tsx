import { useState, useRef, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { LOCATIONS } from './data/locations';
import { useAuroraData } from './hooks/useAuroraData';
import SolarSystemScene from './components/SolarSystemScene';
import { QuickNav } from './components/QuickNav';
import TelemetryDeck from './components/TelemetryDeck';
import { SkyViewer } from './components/SkyViewer';
import { PLANETS, CITIES } from './components/SolarSystemScene';

export default function App() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [focusedBody, setFocusedBody] = useState<string | null>(null);
  const [viewingLocation, setViewingLocation] = useState<{lat: number, lon: number, name: string} | null>(null);
  
  const controlsRef = useRef<any>(null);
  const { data } = useAuroraData(LOCATIONS[0]);

  // Handle Focus & Travel
  const handleBodyFocus = (bodyName: string | null) => {
    setFocusedBody(bodyName);
  };

  const handleTravel = (targetName: string, location?: any) => {
    if (targetName === 'Earth' && location) {
       setFocusedBody('Earth');
       setTimeout(() => setViewingLocation(location), 1000);
    } else {
       setFocusedBody(targetName);
    }
  };

  return (
    <div className="relative w-screen h-screen bg-black overflow-hidden select-none">
      
      {/* LAYER 0: The 3D Universe */}
      <div className="absolute inset-0 z-0">
        <Canvas
          camera={{ position: [0, 20, 45], fov: 45, far: 20000 }}
          gl={{ antialias: true }}
          shadows
          className="w-full h-full"
        >
          <Suspense fallback={null}>
             {/* If UniverseBackground crashes, comment it out temporarily */}
             {/* <UniverseBackground /> */}
             
             <SolarSystemScene 
                kpValue={data.kpIndex?.kpValue || 3}
                currentDate={currentDate}
                focusedBody={focusedBody}
                onBodyFocus={handleBodyFocus}
                onLocationClick={setViewingLocation}
                controlsRef={controlsRef}
             />
          </Suspense>
          <OrbitControls 
             ref={controlsRef} 
             enablePan={true} 
             enableZoom={true} 
             makeDefault
          />
        </Canvas>
      </div>

      {/* LAYER 1: The HUD (Floating on top) */}
      <div className="absolute inset-0 z-10 pointer-events-none flex flex-col justify-between p-4">
        
        {/* TOP BAR */}
        <div className="flex justify-between items-start w-full pointer-events-auto">
           {/* Navigation Dropdown */}
           <QuickNav onTravel={handleTravel} planets={PLANETS} cities={CITIES} />
           
           {/* Simple Status Display - Replace with proper HUDOverlay later */}
           <div className="bg-black/80 border border-cyan-500/50 rounded p-3 text-cyan-400 font-mono text-sm">
             <div>Kp: {data.kpIndex?.kpValue?.toFixed(1) || '--'}</div>
             <div>Wind: {data.solarWind?.speed?.toFixed(0) || '--'} km/s</div>
           </div>
        </div>

        {/* BOTTOM BAR - Centered Data Deck */}
        <div className="pointer-events-auto mx-auto w-full max-w-4xl">
           <TelemetryDeck 
              currentDate={currentDate}
              onDateChange={setCurrentDate}
              solarWindSpeed={data.solarWind?.speed || 0}
              kpValue={data.kpIndex?.kpValue || 0}
              focusedBody={focusedBody}
              onResetView={() => setFocusedBody(null)}
              isPlaying={false}
              setIsPlaying={() => {}}
              playbackSpeed={1}
              setPlaybackSpeed={() => {}}
           />
        </div>
      </div>

      {/* LAYER 2: Modals (Teleport Window) */}
      {viewingLocation && (
        <SkyViewer 
          lat={viewingLocation.lat} 
          lon={viewingLocation.lon} 
          locationName={viewingLocation.name} 
          onClose={() => setViewingLocation(null)} 
        />
      )}
    </div>
  );
}