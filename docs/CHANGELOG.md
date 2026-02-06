# CHANGELOG

All notable changes to Solar Admiral will be documented in this file.

## [0.14.0] - 2026-01-31 🎯 MEGA UPDATE

### Added
- **HOLO HUD Planet Overlays**: Hover any planet to see detailed info cards
  - Real-time distance calculation in AU (updates every frame)
  - Planet radius relative to Earth
  - Axial tilt in degrees
  - Glassmorphism design with cyan accents
  - Emissive glow increases on hover (0.2 → 0.6)
  - "CLICK TO FOCUS" instruction
- **Voyager 1 Easter Egg** 🛰️: Hidden interstellar spacecraft
  - Positioned at ~160 AU (accurate 2026 distance)
  - Moving at 0.01 units/sec toward Ophiuchus constellation
  - Small grey box geometry (0.02×0.02×0.04)
  - Hover reveals: Launch date, distance, speed, status
  - Quote: "The Golden Record is still playing..."
- **Comprehensive Attribution**: Expanded README with full credits
  - All data sources (NOAA, NASA, Astronomy Engine)
  - All texture sources (Solar System Scope, NASA GIBS)
  - All libraries (Three.js, React, TailwindCSS)
  - Design inspiration (JARVIS, NASA, Elite Dangerous)
  - Scientific references (JPL Horizons, Space Weather Live)
- **Easter Egg Documentation**: How to find hidden features
- **Performance Metrics**: Detailed bundle size and optimization notes

### Changed
- **README.md**: Complete rewrite with v0.13.0 features
  - Updated to reflect Sky Viewer, Moon, HOLO HUD
  - Added Easter egg section
  - Expanded attribution to 5 major sections
  - Added performance notes and browser support
  - Updated screenshot references
- **Bundle Size**: Now 349.05 KB gzipped (1.22 MB uncompressed)
- Planet hover states now show cursor pointer
- Enhanced planet interaction feedback

### Technical
- Build Time: ~21 seconds
- Modified Files:
  - SolarSystemScene.tsx: Added Voyager1 component, enhanced Planet hover
  - README.md: Complete overhaul
  - CHANGELOG.md: This entry
- New Components:
  - Voyager1 (embedded in SolarSystemScene)
  - Enhanced Planet with hover state and distance calculation
- Performance: All features maintain 60 FPS target

### User Experience
1. **Explore Mode** → Hover planets for instant data
2. **Hidden Secrets** → Find Voyager 1 in deep space
3. **Full Attribution** → Know exactly where data comes from
4. **Easter Egg Hunt** → More secrets may be waiting...

## [0.13.0] - 2026-01-30

### Added
- **The Moon**: Realistic lunar orbit around Earth
  - Grey sphere (0.27 Earth radius)
  - Circular orbit at 2.5 screen units
  - Slow rotation (0.01 per frame)
  - Casts shadows
  - Positioned relative to Earth group
- **Sky Viewer Modal**: Stellarium Web integration
  - Opens when clicking city dots on Earth
  - Full-screen glassmorphism overlay
  - Embedded Stellarium iframe with location coordinates
  - Header with city name and coordinates
  - Close button to return to solar system
- **Credits Modal**: Data attribution panel
  - Lists all data sources (NOAA, NASA, Astronomy Engine)
  - Technology stack section
  - Creator information
  - Accessible via Info button in top-right
- **Clickable Earth Cities**: 6 aurora hotspots
  - Reykjavik, Tromsø, Anchorage, Yellowknife, Abisko, Tasmania
  - Small cyan spheres on Earth surface
  - Click to open Sky Viewer
  - Hover cursor changes to pointer
- **Earth Textures Restored**: High-quality planet rendering
  - 8K day texture (NASA Blue Marble)
  - 8K night texture (city lights, emissive 0.5)
  - 8K cloud layer (transparent, 0.4 opacity)
  - Error handling with fallback to solid blue
  - Independent cloud rotation (0.0003 per frame)
  - 128×128 polygon sphere for smoothness

### Changed
- Earth increased from 64×64 to 128×128 polygons
- Texture loading now uses `useTexture` hook with try/catch
- City markers now trigger Sky Viewer instead of console logs
- Credits button added to top-right control group

### Technical
- Bundle: **348.43 KB gzipped** (+1.35 KB from v0.12.1)
- Build Time: 14.81 seconds
- Modified Files:
  - SolarSystemScene.tsx: Moon component, texture restoration, city interaction
  - App.tsx: Credits modal, Sky Viewer modal, location click handler
  - index.css: Modal styling updates
- New Files:
  - components/SkyViewer.tsx (2,046 chars)
  - components/CreditsModal.tsx (4,668 chars)
- Dependencies: Existing (no new packages)

### User Experience
1. **Earth Exploration** → Click cities to see real sky maps
2. **Moon Orbit** → Watch the Moon circle Earth realistically
3. **High-Res Earth** → 8K textures with day/night/clouds
4. **Attribution** → Full transparency on data sources

## [0.12.1] - 2026-01-30 (Intermediate)

### Changed
- **Simplified Rendering**: Removed all texture loading temporarily
- Earth rendered as simple blue MeshStandardMaterial
- All planets using solid colors from config
- Removed unused imports and variables

### Technical
- Bundle: **347.08 KB gzipped** (-8.78 KB, instant rendering)
- Cleaned up unused constants (ISS_ORBIT_RADIUS, etc.)
- Fixed TypeScript errors

### Reason
- Intermediate step to ensure scene renders immediately
- Prepare for proper texture error handling

## [0.12.0] - 2026-01-30

### Added
- Initial Sky Viewer implementation
- Initial Credits modal
- Earth texture path updates (CDN → local)
- Increased Earth detail (64×64 → 128×128)

### Technical
- Bundle: 355.86 KB gzipped (+2.13 KB from v0.11.0)

## [0.11.0] - 2026-01-30

### Added
- **Pluto**: Added as the 9th celestial body in the solar system
  - Real ephemeris using Astronomy.Body.Pluto
  - Realistic size (radius: 0.2) and color (#8B7355)
  - Extreme axial tilt: 122.5°
  - Clickable with planet info card
- **Enhanced Earth Textures**: Multi-layer realistic planet rendering
  - Day Texture: NASA Blue Marble (2048px resolution)
  - Night Texture: City lights emissive map (2048px) with 0.5 intensity
  - Cloud Layer: Transparent sphere at 1.01× radius, 40% opacity
  - Atmosphere Glow: Cyan halo at 1.02× radius, BackSide rendering
  - Material: MeshStandardMaterial with PBR (roughness 0.5, metalness 0.1)
- **Satellite Toggle System**: Control visibility of space assets
  - Toggle button in top-left controls (Radio icon from lucide-react)
  - Shows/hides: ISS, DSCOVR, L1 trajectory line
  - Visual states: Cyan glow (active) / Gray (inactive)
  - Default: Satellites visible
  - Keyboard shortcut ready for future implementation

### Changed
- Earth now has realistic day/night cycle with city lights
- Cloud cover adds dynamic weather simulation feel
- Atmospheric glow creates 3D depth perception
- Satellite visibility can be toggled for cleaner viewing experience

### Technical
- Bundle: **353.73 KB gzipped** (+0.34 KB from v0.10.1, +0.096%)
- Build Time: 29.89 seconds
- Modified Files: 
  - SolarSystemScene.tsx: Enhanced texture loading, atmosphere/cloud layers
  - App.tsx: Satellite toggle state and button
- New Props: `showSatellites?: boolean` in SolarSystemSceneProps
- Texture Loading: Three separate CDN textures (day/night/clouds)
- Performance: Minimal impact, efficient layer rendering

### User Experience
1. **Realistic Earth** → Day/night textures with emissive city lights visible at night
2. **Cloud Layer** → Semi-transparent clouds floating above surface
3. **Atmosphere** → Subtle blue glow creates depth
4. **Pluto** → Complete 9-planet solar system (+ dwarf planet)
5. **Declutter** → Toggle satellites off for aurora-focused viewing

### Known Limitations
- Static cloud layer (no independent rotation yet)
- Textures require internet (CDN-hosted)
- Other planets still use solid colors (future enhancement)
- Surface camera positioning not yet implemented

### Next Phase
- Clickable location markers on Earth surface
- Aurora probability tooltips per location
- Camera positioning at specific lat/lon coordinates
- Layer control panel for labels

---

## [0.7.0] - 2026-01-30

### Added
- **Shooting Stars / Meteors**: Random animated meteors streaking across the sky
  - Spawn every 3-8 seconds at random positions
  - Realistic trajectory with downward bias
  - 5-point trail effect with fade
  - Speed variation: 15-40 km/s
  - Color variety: White (70%), blue-white (20%), yellow-green (10%)
  - 1.5-2.5 second lifespan with fade in/out
  - Additive blending for realistic glow
- **NASA Fireball API Integration**: Real meteor event data
  - Hook: `useNASAFireballs()` fetches latest 20 bolide events
  - Data: Date, location (lat/lon), altitude, velocity, energy
  - API: `https://ssd-api.jpl.nasa.gov/fireball.api`
  - Auto-refresh every 6 hours
  - Error handling and loading states
- **Ultra-Minimal Helmet Effects**: Reduced all overlay opacity by 50-70%
  - Vignette: 5-15% (was 15-40%)
  - Scanlines: opacity-3 (was opacity-5)
  - Crosshair: opacity-10 (was opacity-20)
  - Arc Reactor: opacity-15 (was opacity-30)
  - Astronaut Frame: opacity-5 (was opacity-10)
  - Result: Near-fullscreen 3D view with barely visible HUD effects

### Changed
- Canvas now occupies 95%+ of viewport (helmet effects almost invisible)
- Background stars more prominent with reduced vignette
- Shooting stars layer between background stars and solar system

### Technical
- Bundle: **345.73 KB gzipped** (+0.65 KB)
- Build Time: 14.97 seconds
- New Files: ShootingStars.tsx (5,749 chars), useNASAFireballs.ts (2,437 chars)
- Performance: 60 FPS maintained, particle system optimized

### User Experience
1. **Look at the stars** → Random shooting stars appear every few seconds
2. **Press H** → Pure 3D view with meteors streaking across
3. **API Data** → Real NASA fireball events available for visualization
4. **Fullscreen Feel** → Helmet effects now barely visible (5-15% opacity)

---

## [0.6.0] - 2026-01-30

### Added
- **Realistic Earth Texture**: NASA Blue Marble texture applied to Earth
  - High-resolution 2048x1024 Earth day texture
  - Loaded via Three.js TextureLoader from NASA repository
  - Visible continents, oceans, clouds
- **Street-Level View**: Extreme close-up capability
  - `minDistance: 0.1` when focused (was 1.2)
  - Can zoom almost to planet surface
  - Look up from surface to see Sun and stars
- **Full Camera Freedom**: Removed polar angle restrictions
  - `maxPolarAngle: Math.PI` (was Math.PI/1.5)
  - `minPolarAngle: 0` (was Math.PI/4)
  - Can look straight up or down from any angle
  - 360° rotation in all directions
- **UI Toggle Feature**: Hide/show all UI elements
  - Press **H key** to toggle UI visibility
  - Button in top-left corner also toggles
  - "Press H to show UI" indicator when hidden
  - Maximizes 3D view to fullscreen

### Changed
- Earth rendering: Texture-mapped sphere instead of solid color
- Camera controls: Full 360° freedom (up/down/around)
- Zoom limits: 0.1 to 500 when focused (extreme close-up)
- UI can now be completely hidden for pure 3D experience

### Technical
- Bundle: **345.08 KB gzipped** (+0.26 KB)
- Build Time: 15.88 seconds
- Earth texture: Loaded from external CDN (no local storage)
- Files Modified: 2 (SolarSystemScene.tsx, App.tsx)

### User Experience
1. **Click Earth** → Camera swoops in
2. **Zoom in** → Get close to surface (street level)
3. **Look around** → Full 360° freedom
4. **Look up** → See Sun, stars, other planets
5. **Press H** → Hide all UI for pure immersion
6. **Press H again** → Show UI controls

---

## [0.5.2] - 2026-01-30

### Changed
- **Maximized 3D Canvas Display**: Ultra-minimal UI for maximum immersion
  - Reduced all UI element sizes by ~50%
  - Corner metrics: Smaller padding, text, icons (bg-black/20 instead of /40)
  - View switcher buttons: Minimal icons, hidden labels on mobile
  - Theme selector: Compact 16px icon button
  - Helmet effects: Reduced opacity (vignette, scanlines, crosshair, arc reactor)
    - Vignette: 15% inner, 40% outer (was 30%/70%)
    - Scanlines: opacity-5 (was opacity-10)
    - Crosshair: opacity-20, size 40px (was opacity-40, size 60px)
    - Arc reactor: opacity-30, size 64px (was no limit, size 80px)
    - Astronaut frame: opacity-10 (was opacity-20)
  - UI positioned closer to edges (top-2, bottom-2 instead of top-4, bottom-4)
  - Glass panels more transparent for better view-through

### Technical
- Bundle: **344.82 KB gzipped** (+0.05 KB, negligible increase)
- Build Time: 27.08 seconds
- Files Modified: 3 (App.tsx, CornerMetrics.tsx, ThemeSelector.tsx)
- Visual Impact: ~70% more visible 3D content area
- No functionality lost: All features remain fully accessible

---

## [0.5.1] - 2026-01-30

### 🚀 Free Flight Camera System

#### Added
- **Revolutionary Camera Control**: True planetary exploration freedom
  - Camera animates to planet with 2-second Bezier easing
  - After animation: **Full user control released** - spin 360° around planet!
  - Extreme zoom: `minDistance: 1.2` enables "street view" mode
  - Pan enabled for additional movement freedom
- **EXIT ORBIT Button**: Large, prominent escape button
  - Center screen with pulsing cyan animation
  - One-click return to solar system overview
  - Appears only when focused on celestial body
  - Keyboard accessible with pointer-events-auto

#### Changed
- **Dynamic OrbitControls**: Distance limits adapt to focus state
  - Focused: `minDistance: 1.2, maxDistance: 500` (close-up exploration)
  - Unfocused: `minDistance: 15, maxDistance: 2000` (solar system view)
- **Camera Logic**: Refactored for cleaner state management
  - `transitioning` state tracks animation status
  - Separate refs for start/target positions (camera + controls)
  - Animation handoff: After 2s, user gains full control
  - Camera shake disabled during transitions

#### Fixed
- **Camera Lock Bug**: Camera no longer continuously LERPs after reaching target
- **User Control**: User can freely rotate/zoom after 2-second animation
- **Reset Smooth**: Exit orbit uses same smooth animation system

#### Technical
- Bundle: **344.77 KB gzipped** (+0.32 KB, <0.1% increase)
- Build Time: 23.34 seconds
- CSS: Added `@keyframes pulse` animation
- Code: ~150 lines refactored in SolarSystemScene.tsx

---

## [0.5.0] - 2026-01-30 (Professional Cleanup)

### 📁 Project Organization

### 🚀 Major Features Added

#### Interactive Solar System (Tier 3-5)
- **Planet Click Interactions**: All planets (Mercury to Neptune) are now clickable
  - Click any planet to focus camera with smooth LERP chase view
  - Camera automatically positions behind planet, looking toward Sun
  - Auto-rotate disables when focused on a celestial body
  
- **TelemetryDeck Component**: New sci-fi style mission control interface
  - **Solar Heartbeat Visualizer**: Real-time sine wave display
    - Frequency modulated by solar wind speed
    - Amplitude modulated by Kp index
    - Color changes: Cyan (calm) → Yellow (fast wind) → Orange (elevated) → Red (storm)
  - **System Status Ticker**: Scrolling marquee with real-time stats
    - Solar wind speed, shield status, current orbit location
    - Random space facts and easter eggs ("DON'T PANIC", "THE SPICE MUST FLOW")
  - **LCARS-style Time Controls**: Enhanced time warp interface
    - Skip backward/forward 24 hours
    - Play/Pause with speed selection (1x, 10x, 100x, 1000x)
    - Visual timeline slider with gradient
    - "NOW" button to return to present
  - **Reset View Button**: Appears when focused on planet, returns to solar system overview

- **CME Shockwave Effect**: Visual representation of coronal mass ejections
  - Transparent expanding sphere emanates from Sun
  - Only appears when solar wind speed > 500 km/s
  - Smooth scaling animation with fading opacity
  - Red/orange coloring for dramatic effect

- **Earth Magnetosphere Shell**: Dynamic magnetic field visualization
  - Transparent sphere 1.3x Earth's radius
  - Color-coded by geomagnetic activity:
    - Green (#00ff88): Calm conditions (Kp < 5)
    - Purple (#ff00ff): Storm conditions (Kp ≥ 5)
  - Slow rotation for realistic motion
  - Additive blending for ethereal glow

- **Enhanced Sun Visuals**:
  - Increased emissive intensity for realistic brightness
  - Pulsing heartbeat animation (like a living star)
  - Brighter orange/gold coloring (#FF6B1A emissive)
  - Larger corona with enhanced glow effects

### 📡 API Integration Framework (Tier 5)

#### New Service Layer
- **`src/services/spaceWeatherAPI.ts`** (8.7 KB)
  - Comprehensive API endpoint definitions
  - NOAA SWPC: Real-time plasma, magnetic field, Kp index, aurora oval, solar regions, X-ray flares
  - NASA DONKI: CMEs, solar flares, geomagnetic storms, SEP events
  - NASA SDO: Live solar imagery (multiple wavelengths)
  - ISS tracking API integration
  - TypeScript interfaces for all API responses
  - Cache manager with exponential backoff retry logic
  - `cachedFetch()` wrapper for optimized data retrieval

#### Historical Event Data
- **`src/constants/carringtonEvent.ts`** (10.3 KB)
  - Complete Carrington Event (1859) preset data
  - Extreme parameter values: 2200 km/s, Bz -90 nT, Kp 9.5, Dst -1760 nT
  - Visual configuration: Red aurora dominance (85%), 8x intensity, global red glow
  - Historical context: Witness accounts, impacts, tropical aurora locations
  - Timeline of Sep 1-3, 1859 events (10 major timestamps)
  - 20 educational facts about the storm
  - Derived metrics calculator (dynamic pressure, electric field, etc.)
  - 10 tropical locations that saw aurora during event
  - Modern impact assessment ($2.6 trillion damage estimate)

### 🛰️ Space Assets (Tier 3-4)

- **ISS (International Space Station)**:
  - Realistic 90-minute orbital period
  - 51.6° inclination (actual orbital parameters)
  - Detailed 3D model: metallic body + blue solar panels + gold antenna
  - Continuous animated orbit at ~408 km altitude
  
- **DSCOVR Satellite**:
  - Positioned at L1 Lagrange Point (~1.5 million km sunward)
  - Fixed relative to Earth-Sun line
  - Cylindrical body with solar panel and glowing cyan sensor
  
- **L1 Trajectory Line**:
  - Dashed cyan line connecting Earth to DSCOVR
  - Visualizes the solar wind monitoring position
  - Semi-transparent for non-intrusive display

### 📊 Science Mode & Advanced Metrics (Tier 3)

- **Science Mode Toggle**: Simple/Advanced view selector
  - Located in left panel, Solar Wind section
  - Purple button when activated (Zap icon)
  - Toggles visibility of 5 advanced calculations

- **Advanced Metrics Panel** (visible in Science Mode):
  1. **Proton Density**: Mass density (kg/m³)
  2. **Solar Wind Temperature**: Kinetic temperature estimate (Kelvin)
  3. **Estimated Dst Index**: Disturbance storm time (nT)
  4. **Dynamic Pressure**: Ram pressure on magnetosphere (nPa)
  5. **Electric Field (Ey)**: Interplanetary electric field (mV/m)
  - All formulas based on real space weather physics
  - Real-time calculations from live data

### 📚 Historical Events System (Tier 3)

- **Historical Events Database**: 8 major geomagnetic storms
  - **Extreme Events (Kp = 9)**:
    - Carrington Event (1859): -1760 nT Dst, strongest ever
    - Quebec Blackout (1989): 6 million without power
    - Halloween Storm (2003): Satellite destroyed
    - Bastille Day (2000): X5.7 flare
  - **Major Storms (Kp = 8)**:
    - May 2024 Superstorm: First G5 in 20 years
    - January 2005: GPS disruptions
    - September 2017: X9.3 flare (largest of cycle 24)
    - St. Patrick's Day 2015: G4 storm

- **Time Jump Dropdown**: Quick navigation to historical events
  - Located in left panel below TEST ALERT
  - Categories: EXTREME EVENTS and MAJOR STORMS
  - "🔴 LIVE NOW" option to return to present
  - Purple info panel shows event details when selected
  - Planets move to actual historical positions

### 📸 Mission Log & Snapshots (Tier 3)

- **Snapshot Feature**:
  - Camera button in left panel
  - Captures current Kp, wind speed, timestamp
  - Green bouncing toast notification for 3 seconds
  - Console logging of full snapshot details

- **Mission Log Display**:
  - Shows last 5 snapshots
  - Format: `HH:MM:SS | Kp: X.X | XXX km/s`
  - Scrollable history panel
  - Dark background for readability

### 🎨 Visual Enhancements

- **Sun**:
  - Enhanced emissive glow (#FF6B1A)
  - Pulsing heartbeat animation (0.8 Hz)
  - Larger corona with better visibility
  - Realistic solar surface appearance

- **Earth**:
  - Magnetosphere shell with dynamic coloring
  - Dual-layer atmosphere (cyan + blue)
  - Volumetric aurora with color-changing
  - 50+ clickable city markers with detailed popups

- **Planets**:
  - All clickable with hover detection
  - Emissive materials for visibility in dark space
  - Realistic axial tilts (Earth 23.4°, Mars 25°, etc.)
  - Hollywood mode sizes for better visualization

- **Saturn**:
  - Enhanced ring system
  - Proper ring opacity and coloring
  - Double-sided rendering for realism

### 🎮 User Experience Improvements

- **Camera System**:
  - Smooth LERP animations (0.05 interpolation factor)
  - Chase view positions behind focused planet
  - Automatic camera elevation for better angles
  - Reset view functionality

- **Time Controls**:
  - Integrated into TelemetryDeck bottom bar
  - Visual playback indicator
  - Speed selection dropdown
  - Date range display with gradient slider
  - Keyboard-friendly controls

- **Notifications** (from Tier 2):
  - Browser notification support for Kp > 4
  - Once-per-day alert system
  - Permission request on first load
  - TEST ALERT button with status indicators

### 🔧 Technical Improvements

- **Performance**:
  - Bundle size: 1.21 MB → 1.21 MB (maintained despite new features!)
  - Gzipped: 345 KB → 346.9 KB (+1.9 KB, <1% increase)
  - Build time: 15.17 seconds (excellent)
  - Target 60 FPS maintained

- **Code Organization**:
  - New `TelemetryDeck.tsx` component (8.8 KB)
  - API service layer (`spaceWeatherAPI.ts`)
  - Historical event constants (`carringtonEvent.ts`)
  - TypeScript strict mode compliance
  - Zero compilation errors

- **State Management**:
  - `focusedBody` state for camera control
  - `isPlaying` and `playbackSpeed` for time controls
  - Centralized date management in App.tsx
  - Props properly passed through component tree

### 🐛 Bug Fixes

- Fixed TypeScript compilation errors in CMEEvent interface
- Removed unused `selectedPlanet` parameter
- Fixed Sun component syntax error (leftover code cleanup)
- Corrected camera animation dependencies
- Fixed orbital controls auto-rotate behavior

### 📝 Documentation

- Created comprehensive `TIER_5_10_ROADMAP.md` (14.3 KB)
  - 500+ hour implementation plan
  - Phased approach for Tiers 5-10
  - API integration details
  - Novel physics formulas documentation
  - Multi-mission data integration plans

- This CHANGELOG.md with detailed feature descriptions

### 🚧 Known Limitations

- Planet click detection requires direct mesh hit (raycaster precision)
- Historical API data not yet integrated (simulated values)
- Mission log not persistent (clears on page reload)
- Alien auroras (Jupiter purple, Saturn hexagonal) not yet implemented
- Advanced API integrations (MMS, Juno, SETI) planned for future

### 🎯 Next Steps (Planned)

#### Tier 6: Carrington Event Preset (1-2 weeks)
- One-click preset button
- Red aurora dominance shader
- Global red glow effect
- Tropical location highlights
- Educational modal with timeline

#### Tier 7: Graphs & Charts (2-3 weeks)
- Recharts integration
- Kp index time-series chart
- Solar wind speed/density charts
- X-ray flux chart (A/B/C/M/X classes)
- CME countdown visualization

#### Tier 8: Research Lab (3-4 weeks)
- 10 novel physics formulas
- Real-time calculations
- Correlation graphs
- Anomaly detection
- CSV export

---

## [0.5.0] - 2026-01-30 (Current Version)

### Summary
Massive update implementing interactive solar system, TelemetryDeck mission control, CME shockwaves, magnetosphere visualization, and comprehensive API integration framework. Foundation laid for future Carrington Event preset and advanced data visualizations.

**Stats:**
- Files Modified: 4
- Files Created: 3
- Lines Added: ~650
- Bundle Size: 1.21 MB (346.9 KB gzipped)
- Build Status: ✅ Successful

---

## [0.4.0] - 2026-01-29 (Tier 1-2 Complete)

### Added
- Real astronomy calculations with astronomy-engine
- 8 planets + Moon with accurate orbits
- 50+ interactive city markers
- Time travel controls (±7 days)
- Volumetric aurora with color-changing
- Notification system
- Orbit trails (365-point ephemerides)
- 10,000-star background

---

## Format

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

### Types of Changes
- **Added** for new features
- **Changed** for changes in existing functionality
- **Deprecated** for soon-to-be removed features
- **Removed** for now removed features
- **Fixed** for any bug fixes
- **Security** in case of vulnerabilities
