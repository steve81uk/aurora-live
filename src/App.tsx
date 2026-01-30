import { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import { LOCATIONS } from './data/locations';
import { useAuroraData } from './hooks/useAuroraData';
import { useSoundFX } from './hooks/useSoundFX';
import { SolarSystemScene, HUDOverlay } from './components';
import TelemetryDeck from './components/TelemetryDeck';

export default function App() {
  const [selectedLocation, setSelectedLocation] = useState(LOCATIONS[0]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [focusedBody, setFocusedBody] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const { data, loading, error, visibility, refetch } = useAuroraData(selectedLocation);
  const { playBip, checkKpIncrease } = useSoundFX();
  const isOnline = !error;

  useEffect(() => {
    if (data.kpIndex?.kpValue) {
      checkKpIncrease(data.kpIndex.kpValue);
    }
  }, [data.kpIndex?.kpValue, checkKpIncrease]);

  const handleLocationChange = (location: typeof LOCATIONS[0]) => {
    setSelectedLocation(location);
    playBip();
  };

  const handleRefresh = () => {
    refetch();
    playBip();
  };
  
  const handleResetView = () => {
    setFocusedBody(null);
    playBip();
  };

  return (
    <div className="relative w-screen h-screen bg-black overflow-hidden">
      <div className="absolute inset-0 z-0">
        <Canvas
          camera={{ position: [100, 40, 100], fov: 50, far: 5000 }}
          gl={{ antialias: true }}
          shadows
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
          />
          
          <OrbitControls
            enableZoom={true}
            autoRotate={!focusedBody} // Disable auto-rotate when focused
            autoRotateSpeed={0.3}
            minDistance={20}
            maxDistance={2000}
            maxPolarAngle={Math.PI / 1.5}
            minPolarAngle={Math.PI / 4}
            target={[0, 0, 0]}
          />
        </Canvas>
      </div>

      <div className="absolute inset-0 z-50 pointer-events-none">
        <HUDOverlay
          selectedLocation={selectedLocation}
          onLocationChange={handleLocationChange}
          kpData={data.kpIndex || undefined}
          solarWind={data.solarWind || undefined}
          forecast={data.forecast || undefined}
          visibility={visibility || undefined}
          loading={loading}
          error={error}
          onRefresh={handleRefresh}
          isOnline={isOnline}
          currentDate={currentDate}
          onDateChange={setCurrentDate}
        />
      </div>
      
      <TelemetryDeck
        currentDate={currentDate}
        onDateChange={setCurrentDate}
        solarWindSpeed={data.solarWind?.speed || 400}
        kpValue={data.kpIndex?.kpValue || 3}
        focusedBody={focusedBody}
        onResetView={handleResetView}
        isPlaying={isPlaying}
        setIsPlaying={setIsPlaying}
        playbackSpeed={playbackSpeed}
        setPlaybackSpeed={setPlaybackSpeed}
      />
    </div>
  );
}
