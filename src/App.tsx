import { useState, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import { LOCATIONS } from './data/locations';
import { useAuroraData } from './hooks/useAuroraData';
import { useSoundFX } from './hooks/useSoundFX';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { SolarSystemScene } from './components';
import HelmetHUD, { type HUDTheme } from './components/HelmetHUD';
import CornerMetrics from './components/CornerMetrics';
import MobileDataPanel from './components/MobileDataPanel';
import KeyboardHelp from './components/KeyboardHelp';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';

export default function App() {
  const [selectedLocation] = useState(LOCATIONS[0]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [focusedBody, setFocusedBody] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hudTheme, setHudTheme] = useState<HUDTheme>('fighter');
  const [isMobile, setIsMobile] = useState(false);
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const { data } = useAuroraData(selectedLocation);
  const { checkKpIncrease } = useSoundFX();

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

  return (
    <HelmetHUD theme={hudTheme} onThemeChange={setHudTheme}>
      {/* Fullscreen 3D Canvas */}
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
          controlsRef={controlsRef}
        />
        
        <OrbitControls
          ref={controlsRef}
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

      {/* Corner Metrics Overlay */}
      <CornerMetrics
        theme={hudTheme}
        currentDate={currentDate}
        kpValue={data.kpIndex?.kpValue || 3}
        solarWindSpeed={data.solarWind?.speed || 400}
        focusedBody={focusedBody}
        isMobile={isMobile}
      />

      {/* Mobile Expandable Data Panel */}
      <MobileDataPanel
        theme={hudTheme}
        kpData={data.kpIndex || undefined}
        solarWind={data.solarWind || undefined}
        selectedLocation={selectedLocation}
        isMobile={isMobile}
      />

      {/* Keyboard Help (Bottom-Left Icon) */}
      <KeyboardHelp />
    </HelmetHUD>
  );
}
