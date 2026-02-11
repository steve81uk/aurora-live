# 🌟 Aurora Live - Galactic Positioning System

**Real-time space weather monitoring meets astronomically accurate 3D solar system visualization**

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](https://github.com/steve81uk/aurora-live)
[![Bundle Size](https://img.shields.io/badge/bundle-340%20KB%20gzipped-blue)](https://github.com/steve81uk/aurora-live)
[![React](https://img.shields.io/badge/React-19.0-blue?logo=react)](https://react.dev/)
[![Three.js](https://img.shields.io/badge/Three.js-r172-black?logo=three.js)](https://threejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-7.3-purple?logo=vite)](https://vitejs.dev/)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

![Aurora Live - Solar System Explorer](./public/screenshots/demo1.png)

---

## ✨ Current Status (v0.16.2)

**Latest Updates:**
- ✅ **Real-Time Simulation**: Earth rotates accurately with UTC time (±1 second precision)
- ✅ **51 Global Cities**: Worldwide locations with aurora frequency data
- ✅ **Moon Texture**: Realistic lunar surface (2k resolution)
- ✅ **Saturn's Rings**: Beautiful ring system with alpha transparency
- ✅ **UFO Easter Egg**: Hidden alien spacecraft behind Mercury 🛸
- ✅ **Time Travel**: Scrub through past/future with play/pause/skip controls
- ✅ **ISS Real-Time Tracking**: Live position from wheretheiss.at API
- ✅ **Distance Metrics**: See km/miles/AU + light/probe travel times
- ✅ **Universal Click-to-Center**: All bodies clickable with smooth camera animation
- ✅ **Larger Hover Text**: Easy-to-read planet info cards

---

## 🚀 Key Features

### 🌍 Astronomically Accurate Solar System

**Real Physics & Ephemeris Data:**
- Powered by `astronomy-engine` for real planetary positions
- Earth rotation synchronized with UTC time (15°/hour precision)
- 23.4° axial tilt properly applied
- Planets orbit at actual speeds (real-time simulation)
- Orbital positions accurate to current date/time

**Celestial Bodies:**
- **9 Planets**: Mercury through Neptune + **Pluto** (with textures!)
- **The Moon**: Realistic texture, clickable, orbits Earth
- **The Sun**: Multi-layer corona with realistic glow
- **ISS**: Real-time tracking (updates every 5 seconds)
- **Parker Solar Probe**: Animated heliocentric orbit
- **UFO**: Secret easter egg (hint: check behind Mercury!)

### 🗺️ Interactive Earth

**Earth Features:**
- **8K Day/Night Textures** with emissive city lights
- **Real-Time Rotation**: UK in daylight at 12:42 UTC (accurate to the second!)
- **Animated Cloud Layer**: Synchronized with Earth rotation
- **Aurora Shell**: Dynamic green/red glow based on Kp index
- **51 Global Cities**: Clickable markers worldwide
  - Aurora hotspots: Fairbanks, Tromsø, Yellowknife, Reykjavik, Kiruna, Abisko, etc.
  - Southern hemisphere: Ushuaia, Hobart, Dunedin, Christchurch, etc.
  - Major capitals: London, Tokyo, Moscow, Beijing, Sydney, New York, etc.
  - Each with: lat/lon, timezone, population, aurora frequency

### ⏰ Time Travel Controls

**Time Simulation System:**
- **Real-Time Clock**: Planets move at actual orbital speeds
- **Play/Pause**: Control time flow
- **Skip Forward/Backward**: Jump ±1 hour or ±24 hours
- **Jump to NOW**: Return to current date/time (green LIVE indicator)
- **Manual Date Picker**: Select any date/time to explore
- **TIME TRAVEL MODE**: Visual indicator when not at current time

### 🎯 Universal Click-to-Focus

**Smart Camera System:**
- Click **any** celestial body to center it
- Smooth 1.5-second animation with ease-out cubic easing
- Optimal viewing distance per body type:
  - Sun: 35 units
  - Gas Giants: 18-20 units
  - Rocky planets: 5-8 units
  - Moon/ISS/Probes: 2-3 units
  - UFO: 1 unit (get close!)

### 📏 Distance Calculations

**Inter-Body Distance Metrics:**
- Focus on one body, hover over another → See distance between them
- **Formats**: Kilometers, Miles, AU
- **Travel Times**: Light travel time + Probe travel time (Parker/Voyager/Standard)
- **Fun Facts**: Comparisons (e.g., "That's 342× Earth-Moon distance!")
- Updates in real-time as planets orbit

### 🪐 Detailed Planet Cards

**Enhanced Hover Information (Large, Readable Text):**
- Planet name (2xl bold text)
- Type: Rocky / Gas Giant / Ice Giant / Dwarf
- Temperature: Surface/atmosphere temp
- Distance from Sun: AU units
- Distance from focused body (if applicable)
- Light/probe travel times
- Fun facts about the distance

### 🎨 Visual Enhancements

- **Saturn's Rings**: Tilted ring system with transparency
- **Orbit Trails**: 365-point real ephemeris paths
- **10,000-Star Background**: 3-layer parallax depth
- **Aurora Shell**: Kp-reactive atmospheric glow
- **Loading Screen**: Aurora ring animation with progress stages

---

## 🛠️ Technology Stack

**Core:**
- **React 19** - UI framework
- **TypeScript 5.7** - Type safety
- **Vite 7.3** - Lightning-fast build tool
- **Three.js r172** - 3D graphics
- **@react-three/fiber** - React renderer for Three.js
- **@react-three/drei** - Three.js helpers

**Astronomical Accuracy:**
- **astronomy-engine** - Real planetary ephemerides
- **wheretheiss.at API** - Real-time ISS position

**Data Sources:**
- NOAA Space Weather Prediction Center (Kp index, solar wind)
- NASA APIs (future: DONKI events)
- wheretheiss.at (ISS tracking)

**Styling:**
- **Tailwind CSS** - Utility-first styling
- **Lucide React** - Icon system

---
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


