/**
 * AWARD-SITE-CLEAN LAYOUT INTEGRATION GUIDE
 * 
 * This file demonstrates how to integrate the new award-site layout
 * with your existing Three.js scene.
 * 
 * KEY CHANGES:
 * 1. AppShell wraps the entire app
 * 2. AppHeader provides top navigation
 * 3. SceneContainer holds the Canvas (automatically sized)
 * 4. AwardHudOverlay provides metrics/controls overlay
 * 5. InfoPanel provides right-side mission info
 * 
 * MIGRATION STEPS:
 * 1. Import all new components
 * 2. Replace root div with AppShell
 * 3. Add AppHeader at top
 * 4. Wrap Canvas in SceneContainer
 * 5. Add AwardHudOverlay and InfoPanel
 * 6. Import award-layout.css in index.css
 */

import { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { AppShell } from './AppShell';
import { AppHeader } from './AppHeader';
import { SceneContainer } from './SceneContainer';
import { AwardHudOverlay } from './AwardHudOverlay';
import { InfoPanel } from './InfoPanel';

// Import your existing scene components
// import SolarSystemScene from './components/SolarSystemScene';
// import { UniverseBackground } from './components/UniverseBackground';
// etc...

export function AwardLayoutExample() {
  const [activeControl, setActiveControl] = useState('auto');
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);
  
  // Example metrics (replace with your real data)
  const metrics = {
    altitude: '412',
    velocity: '7.66',
    kpIndex: 4.3,
    solarWind: '450',
  };
  
  return (
    <AppShell>
      {/* Header */}
      <AppHeader 
        onHelpClick={() => setShowKeyboardHelp(!showKeyboardHelp)}
        onThemeToggle={() => console.log('Theme toggle')}
      />
      
      {/* Main content area */}
      <main className="app-main">
        
        {/* Left: 3D Scene with HUD */}
        <SceneContainer>
          {/* Your existing Canvas */}
          <Canvas
            camera={{ position: [0, 20, 45], fov: 45, near: 0.1, far: 100000 }}
            gl={{ antialias: true }}
            shadows
          >
            {/* Your existing scene content goes here */}
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} />
            
            {/* Example: Your SolarSystemScene component */}
            {/* <SolarSystemScene 
              kpValue={metrics.kpIndex}
              currentDate={new Date()}
              focusedBody={null}
              onBodyFocus={() => {}}
            /> */}
            
            {/* Example: Background */}
            {/* <UniverseBackground /> */}
          </Canvas>
          
          {/* HUD Overlay on top of Canvas */}
          <AwardHudOverlay
            metrics={metrics}
            timelineLabel="System nominal"
            activeControl={activeControl}
            onControlChange={setActiveControl}
          >
            {/* Optional center content (crosshair, etc.) */}
            <div className="w-8 h-8 border-2 border-cyan-400 rounded-full opacity-50" />
          </AwardHudOverlay>
        </SceneContainer>
        
        {/* Right: Info Panel */}
        <InfoPanel
          title="Current Mission"
          description="Explore live space weather metrics and solar system trajectories."
          onStartClick={() => console.log('Start exploring')}
          onViewMissionsClick={() => console.log('View all missions')}
        />
        
      </main>
    </AppShell>
  );
}

/**
 * INTEGRATION WITH YOUR EXISTING APP.TSX:
 * 
 * Option 1: Replace entire App component with award layout
 * Option 2: Add a toggle to switch between layouts
 * Option 3: Use award layout for specific modules (e.g., BRIDGE)
 * 
 * Example Option 2 (Toggle):
 * 
 * function App() {
 *   const [useAwardLayout, setUseAwardLayout] = useState(false);
 *   
 *   if (useAwardLayout) {
 *     return <AwardLayoutVersion />;
 *   }
 *   
 *   return <OriginalLayout />;
 * }
 * 
 * Example Option 3 (Module-specific):
 * 
 * {activeModule === 'BRIDGE' && (
 *   <AwardLayoutExample />
 * )}
 * 
 * {activeModule === 'ORACLE' && (
 *   <OracleModule />
 * )}
 */
