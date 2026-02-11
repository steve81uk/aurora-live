# Changelog

All notable changes to Aurora Live will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Planned
- More space objects (Hubble, JWST, Tiangong)
- Meteor showers from API data
- Enhanced loading screen with progress tracking
- Visible planet rotation (Mars, Jupiter spin)
- Keyboard shortcuts overlay
- Surface landing mode

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
