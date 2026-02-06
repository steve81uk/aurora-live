# 🌟 Solar Admiral - Galactic Positioning System

**Real-time space weather monitoring meets immersive 3D solar system visualization with mythic themes**

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](https://github.com/steve81uk/aurora-live)
[![Bundle Size](https://img.shields.io/badge/bundle-349%20KB%20gzipped-blue)](https://github.com/steve81uk/aurora-live)
[![React](https://img.shields.io/badge/React-19.0-blue?logo=react)](https://react.dev/)
[![Three.js](https://img.shields.io/badge/Three.js-r172-black?logo=three.js)](https://threejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-7.3-purple?logo=vite)](https://vitejs.dev/)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

![Solar Admiral - Explorer View](./public/screenshots/demo1.png)

---

## ✨ Current Status (v0.13.0)

- ✅ **3D Physics Engine**: Real planetary orbits with astronomy-engine
- ✅ **Interactive Solar System**: 9 planets (including Pluto!) + Moon with realistic orbits
- ✅ **Dual-View System**: Explorer (3D) + Mission Control (analyst dashboard)
- ✅ **Mythic Theme System**: Norse, Sheikah, and Sci-Fi themes
- ✅ **Sky Viewer Integration**: Click cities to see Stellarium sky maps
- ✅ **HOLO HUD Planet Info**: Hover any planet for detailed data overlay
- ✅ **Neural Data Stream**: 9 real-time metrics with confidence scores
- ✅ **Easter Egg**: 🛰️ Voyager 1 probe (find it!)
- 🚧 **Real-Time API Integration**: Partially implemented
- 📋 **Historical Data**: Planned (NASA DONKI integration)

---

## 🚀 Features

### 🎭 Dual-View Experience

**Explorer Mode** - Immersive 3D solar system
- Navigate through real-time planetary positions
- **HOLO HUD Overlays**: Hover planets to see distance, radius, axial tilt
- 3 mythic themes: Norse (Bifröst), Sheikah (Ancient Tech), Sci-Fi (Standard)
- Corner metrics showing KP status, solar wind, time, and target
- Mobile-optimized with expandable data panels

**Mission Control Mode** - Advanced analyst dashboard
- Neural data stream with live metrics
- Heimdall Protocol storm warnings
- Real-time telemetry
- Grid-based analytical interface

### 🪐 Interactive Solar System

**Planets & Celestial Bodies:**
- **9 Planets**: Mercury, Venus, Earth (with textures!), Mars, Jupiter, Saturn, Uranus, Neptune, **Pluto**
- **The Moon**: Realistic orbit around Earth (visible, animated)
- **Earth Features**:
  - 8K day/night textures with city lights
  - Animated cloud layer (slow rotation)
  - 6 clickable city locations (Reykjavik, Tromsø, Anchorage, Yellowknife, Abisko, Tasmania)
  - Click cities → Opens Stellarium sky viewer!
  - Aurora shell (green/red based on Kp index)

**Camera & Navigation:**
- **Free Flight Camera**: Click planets → 2s smooth animation → Full 360° control
- **HOLO HUD Info**: Hover any planet to see real-time data
- **Street-Level Zoom**: Get as close as 0.1× planet radius
- **Orbit Trails**: 365-point ephemeris data visualized
- **10,000-Star Background**: 3-layer parallax depth
- **Shooting Stars**: Random meteors (every 3-8s)

**Easter Eggs:**
- 🛰️ **Voyager 1**: Find the tiny probe leaving the solar system!
- More secrets to discover...

### ⚡ Space Weather Monitoring

**Neural Data Stream** (9 metrics with AI confidence):
- Kp Index (NOAA real-time)
- Solar Wind Speed
- IMF Bz (critical for auroras)
- Proton Density
- **Novel Metrics**:
  - Sköll Velocity (mythic solar wind)

  - Helheim Flux (magnetic disturbance)
  - Ratatosk Coherence (space weather stability)

**Mythic Theme System:**
- **Norse Theme**: Bifröst-inspired colors, Heimdall warnings, Yggdrasil references
- **Sheikah Theme**: Ancient tech blue/gold, Guardian aesthetics
- **Sci-Fi Theme**: Classic cyan/orange NASA palette

### 🕰️ Time Travel
- **Historical Mode**: Travel through time with planetary motion
- **Time Scrubbing**: ±7 days with playback speeds (1x to 1000x)
- **Planet Positions**: Accurate ephemerides from astronomy-engine
- **Historical Simulation**: View past space weather events

### ⌨️ Keyboard Shortcuts
- **Space**: Play/Pause time
- **← / →**: Skip 24 hours backward/forward
- **R**: Reset camera view
- **N**: Jump to NOW
- **H**: Hide/show UI for fullscreen 3D view
- **T**: Toggle theme selector
- **V**: Toggle view mode (Explorer/Mission Control)
- **F**: Fullscreen toggle
- **Esc**: Cancel/Close modals
- **?**: Show keyboard help

### 🎨 Special Features
- **Sky Viewer**: Click any city dot on Earth → Opens Stellarium web interface
- **Clickable Everything**: All planets, the Sun, Moon, satellites
- **Dynamic Auroras**: Colors change with Kp index (green → red during storms)
- **Mission Log**: Snapshot feature for capturing moments
- **Credits Modal**: Full attribution for all data sources

---

## 🛠️ Tech Stack

- **Frontend**: React 19.0, TypeScript 5.7
- **3D Graphics**: Three.js r172 via @react-three/fiber 9.0
- **Astronomy**: astronomy-engine (NASA NOVAS calculations)
- **Styling**: TailwindCSS 4.1 with custom glassmorphism
- **Build Tool**: Vite 7.3 (12-24s production builds)
- **Bundle**: 349 KB gzipped (optimized for performance)

---

## 🏃 Quick Start

```bash
# Clone repository
git clone https://github.com/steve81uk/aurora-live.git
cd aurora-live

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

The app will be available at `http://localhost:5173`

---

## 📂 Project Structure

```
aurora-live/
├── src/
│   ├── components/           # React components
│   │   ├── SolarSystemScene.tsx      # Main 3D scene
│   │   ├── Earth.tsx                 # Earth with textures + cities
│   │   ├── Moon.tsx                  # Moon orbit component
│   │   ├── SkyViewer.tsx             # Stellarium integration
│   │   ├── CreditsModal.tsx          # Attribution modal
│   │   ├── DataStream.tsx            # Neural data metrics
│   │   ├── TelemetryDeck.tsx         # Bottom control panel
│   │   └── ...
│   ├── hooks/                # Custom React hooks
│   ├── data/                 # Static data (cities, locations)
│   ├── types/                # TypeScript definitions
│   └── App.tsx               # Main application
├── public/
│   ├── textures/             # Planet & Earth textures
│   │   ├── 8k_earth_daymap.jpg
│   │   ├── 8k_earth_nightmap.jpg
│   │   ├── 8k_earth_clouds.jpg
│   │   └── 2k_*.jpg          # Other planets
│   └── screenshots/          # Demo images
├── scripts/                  # Utility scripts (Python/PowerShell)
├── docs/                     # Documentation
│   ├── CHANGELOG.md          # Version history
│   └── checkpoints/          # Development checkpoints
└── package.json
```

**Note**: The `/scripts` directory contains experimental Python and PowerShell prototypes. The main app is pure React/TypeScript.

---

## 🖼️ Screenshots

### Explorer View with Mythic Theme
![Explorer View](./public/screenshots/demo1.png)

### Mission Control Dashboard
![Mission Control](./public/screenshots/demo2.png)

### Earth Close-Up with Cities
*Click city dots to open Stellarium sky viewer!*

### Planet HOLO HUD Overlay
*Hover any planet to see detailed info card*

---

## 🎯 Easter Eggs

Can you find these hidden features?

1. **Voyager 1**: A tiny grey box ~160 AU from the Sun, moving toward Ophiuchus
   - Hover it to see "The Golden Record is still playing..."
   - It's moving at 0.01 units/sec (17 km/s in reality)

2. **More secrets**: Keep exploring! There may be more...

*Hint: Try hovering over distant objects, checking unusual coordinates, or looking beyond Neptune.*

---

## 🛠️ Tech Stack

- **Frontend**: React 19.0, TypeScript 5.7
- **3D Graphics**: Three.js r172 via @react-three/fiber 9.0
- **Physics**: astronomy-engine for planetary calculations
- **Styling**: TailwindCSS 4.1 with custom glass morphism
- **Build Tool**: Vite 7.3 (12-24s production builds)
- **Bundle**: 345 KB gzipped (optimized for performance)

---

## 🏃 Quick Start

```bash
# Clone repository
git clone https://github.com/steve81uk/aurora-live.git
cd aurora-live

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

---

## 📂 Project Structure

```
aurora-live/
├── src/
│   ├── components/           # React components
│   │   ├── SolarSystemScene.tsx      # Main 3D scene
│   │   ├── MissionControlView.tsx    # Analyst dashboard
│   │   ├── CornerMetrics.tsx         # HUD corner displays
│   │   ├── ThemeSelector.tsx         # Helmet theme switcher
│   │   └── ...
│   ├── hooks/                # Custom React hooks
│   ├── data/                 # Static data (cities, locations)
│   ├── types/                # TypeScript definitions
│   └── App.tsx               # Main application
├── scripts/                  # Utility scripts
│   ├── AuroraHUD.ps1         # PowerShell HUD prototype
│   ├── SpaceWeatherCore.py  # Python data analysis
│   └── ...
├── docs/                     # Documentation
│   ├── CHANGELOG.md          # Version history
│   ├── ROADMAP.md            # Future development
│   ├── CONTRIBUTING.md       # Contribution guidelines
│   └── ...
├── public/
│   └── screenshots/          # Demo images
└── package.json
```

**Note**: The `/scripts` directory contains Python and PowerShell prototypes for backend data processing and standalone HUD experiments. These are separate from the main React/Three.js application and demonstrate various approaches to space weather visualization.

---

## 🖼️ Screenshots

### Explorer View with Fighter Jet Theme
![Explorer View](./public/screenshots/demo1.png)

### Mission Control Dashboard
![Mission Control](./public/screenshots/demo2.png)

### Mobile View
![Mobile](./public/screenshots/demo3.png)

### Theme Selector
![Themes](./public/screenshots/demo4.png)

---

## 🤝 Contributing

We welcome contributions from developers, scientists, and space enthusiasts! See [docs/CONTRIBUTING.md](./docs/CONTRIBUTING.md) for:
- Development setup
- Code style guidelines
- How to add novel physics formulas
- Pull request process

**Areas we'd love help with:**
- Additional Easter eggs (safe, no copyright issues!)
- Novel space weather analysis methods
- Performance optimizations
- Mobile UX improvements
- Accessibility enhancements
- Documentation and tutorials
- Texture improvements (higher resolution planet maps)

---

## 🗺️ Roadmap

**Current Version: v0.13.0** ✅

**Next Up (v0.14.0):**
- [ ] Comprehensive error checking
- [ ] Konami code Easter egg
- [ ] Complete HOLO HUD system
- [ ] Performance profiling
- [ ] Extended attribution system

**Future Tiers:**
- **Tier 7**: Advanced charts (Kp time-series, X-ray flux, CME countdown)
- **Tier 8**: Research Lab with 10 novel formulas
- **Tier 9**: Full NASA DONKI API integration
- **Tier 10**: Satellite tracking, magnetometer network, power grid impact

See [docs/ROADMAP.md](./docs/ROADMAP.md) for the full development plan.

---

## 🧪 AI-Assisted Development

This project was built using an **AI-Human Pair Programming workflow**, demonstrating rapid prototyping of complex 3D visualizations and physics calculations. The combination of human domain knowledge (space weather) and AI coding assistance (GitHub Copilot CLI) enabled:
- Fast iteration on novel visualization techniques (6 major versions in days)
- Rapid integration of scientific formulas and real astronomy
- Comprehensive documentation generation
- Architecture refactoring with minimal errors
- Creative problem-solving (mythic themes, Easter eggs, HOLO HUD)

This approach showcases how AI tools can accelerate development of scientifically complex applications while maintaining code quality and performance.

---

## 📜 License

MIT License - see [LICENSE](LICENSE) for details.

Free to use for personal, educational, and commercial projects.

---

## 🙏 Credits & Attribution

### Data Sources
- **[NOAA Space Weather Prediction Center (SWPC)](https://www.swpc.noaa.gov/)** - Real-time space weather data, Kp index, solar wind metrics
- **[NASA DONKI (Database Of Notifications, Knowledge, Information)](https://kauai.ccmc.gsfc.nasa.gov/DONKI/)** - Coronal mass ejections (CME), solar flares, geomagnetic storms
- **[NASA GIBS (Global Imagery Browse Services)](https://earthdata.nasa.gov/gibs)** - Earth imagery and scientific visualizations
- **[Astronomy Engine](https://github.com/cosinekitty/astronomy)** by Don Cross - Planetary ephemeris calculations (NASA NOVAS algorithms)
- **[Stellarium Web](https://stellarium-web.org/)** - Sky map integration for location viewers

### Textures & Imagery
- **[Solar System Scope](https://www.solarsystemscope.com/textures/)** - High-resolution planet textures (2K/8K)
- **NASA Blue Marble** - Earth day texture (public domain)
- **NASA Earth Observatory** - Earth night lights, cloud maps
- **Planet Pixel Emporium** - Additional celestial body textures

### Libraries & Frameworks
- **[Three.js](https://threejs.org/)** by Ricardo Cabello (mrdoob) - 3D graphics rendering
- **[React Three Fiber](https://docs.pmnd.rs/react-three-fiber/)** by Poimandres - React integration for Three.js
- **[React Three Drei](https://github.com/pmndrs/drei)** - Useful helpers for R3F
- **[TailwindCSS](https://tailwindcss.com/)** - Utility-first styling framework
- **[Vite](https://vitejs.dev/)** - Lightning-fast build tool
- **[Lucide React](https://lucide.dev/)** - Beautiful icon library
- **[date-fns](https://date-fns.org/)** - Date manipulation utilities

### Inspiration & Design
- **Iron Man's JARVIS** - HUD aesthetics and glassmorphism
- **NASA Mission Control** - Telemetry dashboard design
- **Elite Dangerous** - Space navigation and planetary approach
- **The Legend of Zelda: Breath of the Wild** - Sheikah theme inspiration
- **Norse Mythology** - Bifröst, Heimdall, Yggdrasil references
- **Fighter Jet HUDs** - Tactical display elements

### Scientific References
- **[NASA JPL Horizons System](https://ssd.jpl.nasa.gov/horizons/)** - Orbital mechanics validation
- **[World Data Center for Geomagnetism](http://wdc.kugi.kyoto-u.ac.jp/)** - Historical geomagnetic data
- **[NOAA Ovation Aurora Model](https://www.swpc.noaa.gov/products/aurora-30-minute-forecast)** - Aurora forecasting algorithms
- **[Space Weather Live](https://www.spaceweatherlive.com/)** - Community space weather portal

### Special Thanks
- **GitHub Copilot Team** - For the AI pair programming tools that made this possible
- **Open Source Community** - For the incredible libraries and frameworks
- **Space Weather Enthusiasts** - For feedback and encouragement
- **You** - For exploring the cosmos with us! 🌌

---

## 📞 Contact & Support

- **Issues**: [GitHub Issues](https://github.com/steve81uk/aurora-live/issues)
- **Discussions**: [GitHub Discussions](https://github.com/steve81uk/aurora-live/discussions)
- **Repository**: [github.com/steve81uk/aurora-live](https://github.com/steve81uk/aurora-live)
- **Creator**: Stephen Edwards

---

## ⭐ Star History

If you find this project useful, please consider giving it a star! ⭐

It helps others discover the project and motivates continued development.

---

## 🚀 Performance Notes

- **Bundle Size**: 349 KB gzipped (1.22 MB uncompressed)
- **Build Time**: ~20 seconds
- **Target FPS**: 60 (optimized for modern browsers)
- **Texture Loading**: Progressive (Earth textures ~30MB, other planets pending)
- **Browser Support**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+

**Optimization Tips:**
- Textures load asynchronously - solid colors shown during loading
- Orbit trails are pre-calculated and cached
- Star field uses instanced rendering
- LOD (Level of Detail) planned for distant objects

---

**Built with 💙 for space weather enthusiasts and 3D visualization lovers**

*Last updated: January 31, 2026*


