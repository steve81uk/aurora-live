# Changelog

All notable changes to Aurora Live will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [3.0.0-mega] - 2024-02-12 🚀 COMPLETE v3.0 - AETHERIS RELEASE

### 🎬 NEW: Cinematic Experience
- **CinematicSplash**: Diamond ring eclipse effect with GSAP camera zoom
- **Aurora Wave Loading**: 3-layer animated aurora with pulsing Earth
- **AETHERIS Branding**: Wide-tracked Rajdhani font, NASA-quality aesthetics
- **BEGIN MISSION Button**: Smooth transition with sparkle particles
- **100+ Twinkling Stars**: Animated starfield background

### 📱 Progressive Web App (PWA)
- **vite-plugin-pwa**: Full PWA support with offline caching
- **Service Worker**: 5MB asset precaching with NOAA API runtime caching
- **Install Prompt**: Add to home screen on mobile/desktop
- **Standalone Mode**: Fullscreen app experience
- **Theme Color**: #000000 deep space black

### 🌐 Week 1: Live NOAA/SWPC APIs
- **Live Data Service**: 60-second auto-refresh from 4 NOAA APIs
- **Data Quality Scoring**: Excellent/Good/Degraded/Fallback monitoring
- **LiveDataPanel UI**: Professional expandable telemetry display
- **Real-time Metrics**: KP, Solar Wind, IMF Bz/Bt, Solar Activity, Alerts
- **Error Boundary**: Comprehensive error catching and display

### 📊 Week 2: Data Visualization & ML
- **KpTrendChart**: 24-hour live SVG chart with storm thresholds
- **MLAuroraForecast**: TensorFlow.js LSTM model for 6h predictions
- **Accuracy Metrics**: Live MAE-based accuracy display (60-80%)
- **Confidence Intervals**: Decreasing confidence over forecast horizon
- **Auto-Retraining**: Model updates with new data every refresh

### 🌊 Week 3: Particle Physics & Events
- **CMEParticleSystem**: 5000 particles simulating Sun-to-Earth travel
- **Real Physics**: Solar wind speed scaling with additive blending
- **MeteorShowerSystem**: Live meteor streaks with 3D trails
- **NASA Fireball API**: Real-time meteor data integration
- **Dynamic Spawning**: Continuous particle and meteor generation

### 🔔 Week 4: Community Features
- **NotificationSystem**: Browser push notifications for storms
- **Smart Alerts**: KP>5, X-class flares, active space weather warnings
- **Permission Flow**: Clean UX for notification permissions
- **Sound Effects**: Optional audio on storm detection
- **Floating Toggle**: Bottom-right notification control

### 🏆 Competitive Advantages
- **4-8x Faster**: 60s refresh vs competitors' 5-15 min
- **UNIQUE ML**: Only aurora app with TensorFlow forecasting
- **UNIQUE Physics**: Only app with CME particle simulation
- **UNIQUE Notifications**: First with real-time push alerts
- **Data Quality**: Only app monitoring API reliability

### 📦 Technical Improvements
- **11 New Components**: 1,595 lines of production code
- **TensorFlow.js**: LSTM model with sequence learning
- **Three.js Particles**: 5000+ particles with velocity-based physics
- **Error Handling**: Comprehensive boundary with stack traces
- **Type Safety**: Full TypeScript strict mode compliance

---

## [3.0.0-week1] - 2026-02-12 🛰️ LIVE DATA INTEGRATION

### 🌐 Real-Time NOAA/SWPC APIs
- **Live Data Service**: Unified fetching from 4 NOAA APIs with 60-second auto-refresh
  - Planetary Kp Index (1-minute resolution)
  - Real-time Solar Wind (speed, density, temperature, IMF Bz/Bt)
  - Solar Activity (F10.7 flux, sunspot number, X-ray flare class)
  - Active Space Weather Alerts (CME, flare, storm, radiation)
- **Data Quality Scoring**: Excellent/Good/Degraded/Fallback indicators
- **Error Handling**: Graceful degradation with parallel API fetching
- **Advanced Calculations**: DST index estimation, storm level classification

### 🎨 Live Data Panel UI
- **Expandable Telemetry Display**: Top-right professional HUD overlay
- **Quick Stats**: Always-visible KP Index + Solar Wind Speed
- **Detailed Metrics**: 4 expandable panels (Geomagnetic, Solar Wind, Solar Activity, Alerts)
- **Auto-Update Counter**: Real-time "Updated Xs ago" with manual refresh
- **Color-Coded Severity**: Green (quiet) → Red (severe storm)
- **Conditional Visibility**: Auto-hides in special view modes

### 🔧 Technical Improvements
- **React Hook**: `useLiveSpaceWeather()` with auto-start/stop and cleanup
- **Singleton Pattern**: Prevents duplicate API requests across components
- **Pub/Sub System**: Multiple subscribers share single data stream
- **Priority System**: Simulation > Live Data > Legacy cached data
- **Build**: 22.29s compile time, 1.34 MB bundle (375 KB gzipped)

### 📊 Competitive Advantage
- **4x Faster Refresh**: 60s vs competitors' 5-15 min updates
- **Multi-Source Fusion**: Only app combining KP + Wind + Solar + Alerts
- **Data Quality Unique**: First aurora app with quality indicators
- **Professional Telemetry**: NASA-style HUD not found in consumer apps

---

## [2.0.0] - 2026-02-12 🚀 MAJOR VISUAL & COMPONENT OVERHAUL

### 🚀 Visual Improvements

#### Sprite Upgrades ✅
- **ISS**: Replaced 3D mesh with hi-res Wikipedia icon sprite
- **Hubble**: Replaced 3D mesh with PNG image sprite  
- **JWST**: Replaced 3D mesh with sprite
- **Voyager 1**: Replaced 3D mesh with Wikipedia model sprite
- All sprites scaled to [2, 2, 2] for distance visibility

#### Camera & Rendering ✅
- Camera clipping fixed: `near={0.1}` `far={100000}` prevents object vanishing
- OrbitControls `minDistance={1.1}` allows near-surface zoom
- Aurora glow now KP-reactive: red (`#ff2255`) when KP>5, green (`#4ade80`) otherwise
- Aurora opacity scales dynamically: `Math.min(kpValue * 0.05, 0.4)`
- Aurora resolution increased: 32x32 → 64x64 segments for smoother glow

#### Magnetosphere Enhancements ✅
- Opacity reduced: 0.2 → 0.05 for "ghost-like" magnetic field lines
- Animation refined: Pulsing reduced from ±0.05 to ±0.02
- All meshes now non-blocking (raycast pass-through)

### 🎮 New Components (11 Total)
1. **HelmetHUD** - 4 immersive themes (fighter, astronaut, ironman, commander)
2. **CornerMetrics** - Real-time stats in all 4 corners
3. **MissionControlView** - Advanced analytics dashboard (Press 'M')
4. **FastTravelDropdown** - Instant jump to planets, hotspots, historic storms
5. **DataDashboard** - Compact 6-panel visualization
6. **SkyViewer** - Stellarium Web integration for live star maps
7. **ConstellationLines** - 3D constellation overlay (Toggle 'C')
8. **HeimdallProtocol** - Storm warning system (auto-triggers KP≥7)
9. **CreditsModal** - Data sources & attribution
10. **MobileDataPanel** - Touch-friendly collapsible interface
11. **MythicThemeSelector** - 3 themes (Scientific, Norse, Sheikah)

### 🐛 Bug Fixes
- Fixed ISS/Hubble/JWST/Tiangong null parameter issues
- Fixed ConstellationLines Three.js geometry syntax
- Fixed SolarWindParticles & UniverseBackground bufferAttribute args  
- Fixed GameContext ReactNode import type
- Fixed TelemetryDeck icon title attributes
- Cleaned up incomplete sprite conversions

### ⌨️ Keyboard Shortcuts
- **H** - Toggle keyboard help
- **M** - Toggle Mission Control
- **F** - Toggle free camera
- **C** - Toggle constellations
- **ESC** - Close modals/modes

### 📊 Build Stats
- Build time: 20.37s
- Modules: 2,320 transformed
- Bundle: 1.32 MB (372 KB gzipped)
- Status: ✅ SUCCESS

### 🎯 Next Steps
See `docs/roadmap.md` for v3.0 targets (AI/ML, VR/AR, NASA integration)

---

## [Unreleased]

### Planned
- More space objects (Parker Probe sprite, Tiangong sprite)
- NASA DONKI API integration (CMEs, solar flares)
- ML forecasting (Prophet/scikit-learn 24h predictions)
- Plotly charts (KP trends, correlations)
- VR/AR mode (A-Frame, WebXR)
- Citizen science portal (magnetometer uploads)

---

## [0.16.2] - 2026-02-11

### Added
- **Moon Texture**: Realistic 2k lunar surface texture showing craters and maria
- **51 Global Cities**: Comprehensive city database imported from constants/cities.ts
  - Aurora hotspots: Fairbanks, Tromsø, Yellowknife, Kiruna, Abisko, etc.
  - Southern hemisphere: Ushuaia, Hobart, Dunedin, Christchurch
  - Major capitals: London, Tokyo, Moscow, Beijing, Sydney, New York, etc.
  - Each city includes: lat/lon, timezone, population, aurora frequency data
- **Larger Hover Text**: Significantly improved readability
  - Planet names: 2xl font size (was lg)
  - Info text: base/sm sizes (was 10px/9px)
  - Distance factor reduced from 20 to 12 for closer cards
  - Better visual hierarchy and spacing

### Changed
- City markers now use individual colors from database (not uniform cyan)
- Hover cards have enhanced styling with better borders and shadows

### Technical
- TypeScript: 0 errors
- Bundle size: ~340 KB gzipped

---

## [0.16.1] - 2026-02-11

### Fixed
- **Earth Rotation Accuracy**: Synchronized with real UTC time (±1 second precision)
  - Greenwich (0° longitude) now correctly faces Sun at 12:00 UTC (solar noon)
  - UK correctly shows daylight at 12:42 UTC (user-reported bug fixed)
  - Rotation accounts for Earth's orbital position around Sun
  - Calculation: 15° per hour, accurate to the second

### Added
- **Earth Axial Tilt**: Properly applied 23.4° tilt
  - Affects seasonal day/night patterns
  - Correct aurora zone positioning
- **Cloud Synchronization**: Clouds now rotate with Earth (with slight atmospheric drift)

### Technical
- Real-time rotation algorithm using UTC hours, minutes, seconds
- Orbital angle compensation using atan2(z, x)
- Clouds offset by 0.1 radians for wind effect

---

## [0.16.0] - 2026-01-30

### Added
- **Real-Time Simulation System**: Planets move at actual orbital speeds
  - Created `useTimeSimulation` hook with 1-second update interval
  - Play/pause functionality (defaults to playing)
  - Playback speed multiplier support
  - "LIVE" mode detection (within 5 seconds of current time)

- **Time Travel Controls**: Full temporal navigation in TelemetryDeck
  - Play/Pause button with icons
  - Skip backward/forward (1 hour, 24 hours)
  - "Jump to NOW" button with green LIVE indicator
  - datetime-local input for manual date/time selection
  - "TIME TRAVEL MODE" label when not at current time
  - Speed indicator display

- **Saturn's Rings**: Beautiful ring system rendered
  - Uses 2k_saturn_ring_alpha.png texture
  - RingGeometry with inner radius 1.2x, outer 2.2x planet radius
  - Tilted to Saturn's 26.7° axial tilt
  - Semi-transparent, double-sided material
  - Receives shadows from Saturn

- **UFO Easter Egg**: Hidden alien spacecraft
  - Flying saucer design with glowing green lights
  - Always positioned behind Mercury (opposite side from Earth)
  - Dynamically calculated using vector math
  - Clickable with "👽 UFO DETECTED" popup
  - Achievement badge when discovered
  - Integrated into astronomy.ts position calculator

### Changed
- App.tsx now uses `useTimeSimulation` hook instead of static date
- Time updates every second when playing (real-time simulation)
- TelemetryDeck completely overhauled with functional time controls

### Technical
- Created `src/hooks/useTimeSimulation.ts` (60 lines)
- Created `src/components/UFO.tsx` (150 lines)
- Modified 4 files, 351 insertions, 10 deletions
- TypeScript: 0 errors
- Commit: edbcd7d

---

## [0.15.5] - 2026-01-29

### Fixed
- Click detection issues with Sun and planets
- Reduced hitbox sizes for more precise clicking
- Added smooth camera animation (1.5s with ease-out cubic)

### Added
- Phase A: Universal click-to-center system
  - All bodies (Sun, planets, Moon, Parker Probe) clickable
  - Smooth camera transitions
  - Optimal viewing distances per body type

- Phase B: Distance metrics system
  - Hover over planet while another is focused → Shows distance
  - Displays: km, miles, AU
  - Light travel time calculations
  - Probe travel time estimates (Parker/Voyager/Standard)
  - Fun facts (comparisons to Earth-Moon distance, etc.)

- Phase C-INT (partial): Component integration
  - ISS real-time tracking from wheretheiss.at API
  - Updates every 5 seconds
  - Clickable with camera focus
  - Loading screen with aurora animation

### Technical
- Created `src/utils/astronomy.ts` - Position calculator
- Created `src/utils/distance.ts` - Distance calculations
- 3 commits pushed (8afffe9, 693b5ec, 75dcc67)

---

## [0.15.4] - 2026-01-28

### Added
- **Realistic Sun**: Multi-layer sun with corona effects
  - Inner core with emissive glow
  - Corona with AdditiveBlending
  - Outer glow atmosphere
  - Larger, more realistic appearance

---

## [0.15.3] - 2026-01-27

### Changed
- Comprehensive audit and optimization
- Bundle size reduced to 335 KB
- Code cleanup and path fixes
- Removed unused imports and variables

---

## [0.14.0] - 2026-01-26

### Added
- HOLO HUD planet overlays
- Voyager 1 Easter egg
- Comprehensive documentation
- Theme selector improvements

---

## [0.13.0] - 2026-01-25

### Added
- Mythic theme system (Norse, Sheikah, Sci-Fi)
- Sky Viewer integration (Stellarium)
- Neural Data Stream with 9 metrics
- Mission Control view mode
- 8 clickable city locations

---

## [0.12.0] - 2026-01-20

### Added
- Interactive Earth with day/night textures
- Moon orbit system
- Cloud layer animation
- Aurora shell (Kp-reactive)

---

## [0.11.0] - 2026-01-15

### Added
- Real planetary orbits using astronomy-engine
- 9 planets with textures
- Orbit trails visualization
- Star field background

---

## [0.10.0] - 2026-01-10

### Initial Release
- Basic 3D solar system
- Simple planet spheres
- Manual orbital paths
- Basic camera controls

---

## Version History Summary

- **v0.16.x**: Real-time simulation, time travel, accuracy fixes
- **v0.15.x**: Click-to-center, distance metrics, ISS tracking, realistic Sun
- **v0.14.x**: HOLO HUD, Easter eggs, documentation
- **v0.13.x**: Mythic themes, Sky Viewer, Neural Data Stream
- **v0.12.x**: Interactive Earth, Moon, clouds, aurora
- **v0.11.x**: Real astronomy, textures, orbit trails
- **v0.10.x**: Initial 3D solar system

---

## Upcoming Features

### v0.17.0 (Next)
- More space objects (Hubble, JWST, Tiangong)
- Meteor showers from API data
- Enhanced loading screen
- Visible planet rotation
- Keyboard shortcuts overlay

### v0.18.0
- Surface landing mode
- Enhanced HUD with live graphs
- Historical data caching
- NASA DONKI event markers

### v1.0.0 (Production)
- Full API documentation
- User accounts & favorites
- Social sharing
- Multi-language support

---

**Note**: Dates are approximate. This project uses rapid iteration with AI assistance.
