import { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import { LOCATIONS } from './data/locations';
import { useAuroraData } from './hooks/useAuroraData';
import { useSoundFX } from './hooks/useSoundFX';
import { SolarSystemScene, HUDOverlay } from './components';

export default function App() {
  const [selectedLocation, setSelectedLocation] = useState(LOCATIONS[0]);
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

  return (
    <div className="relative w-screen h-screen bg-black overflow-hidden">
      <div className="absolute inset-0 z-0">
        <Canvas
          camera={{ position: [0, 2, 8], fov: 50 }}
          gl={{ antialias: true }}
          shadows
        >
          <Stars
            radius={100}
            depth={50}
            count={5000}
            factor={4}
            saturation={0}
            fade
            speed={1}
          />
          
          <SolarSystemScene
            kpValue={data.kpIndex?.kpValue || 3}
            solarWindSpeed={data.solarWind?.speed || 400}
          />
          
          <OrbitControls
            enableZoom={true}
            autoRotate={true}
            autoRotateSpeed={0.2}
            minDistance={3}
            maxDistance={20}
            maxPolarAngle={Math.PI}
            minPolarAngle={0}
          />
        </Canvas>
      </div>

      <div className="absolute inset-0 z-50">
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
        />
      </div>
    </div>
  );
}
