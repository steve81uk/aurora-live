# 🌟 Solar Admiral

**Real-time space weather monitoring meets immersive 3D solar system visualization**

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](https://github.com/steve81uk/aurora-live)
[![Bundle Size](https://img.shields.io/badge/bundle-344%20KB%20gzipped-blue)](https://github.com/steve81uk/aurora-live)
[![React](https://img.shields.io/badge/React-19.0-blue?logo=react)](https://react.dev/)
[![Three.js](https://img.shields.io/badge/Three.js-r172-black?logo=three.js)](https://threejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-7.3-purple?logo=vite)](https://vitejs.dev/)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

![Solar Admiral - Explorer View](./public/screenshots/demo1.png)
![Mission Control Dashboard](./public/screenshots/demo2.png)

---

## ✨ Current Status

- ✅ **3D Physics Engine**: Real planetary orbits with astronomy-engine
- ✅ **Interactive Solar System**: 8 planets + Moon, clickable with camera chase
- ✅ **Dual-View System**: Explorer (3D) + Mission Control (analyst dashboard)
- ✅ **Space Helmet HUD**: 4 theme modes (Fighter, Astronaut, Iron Man, Commander)
- ✅ **5 Novel Formulas**: Advanced space weather analysis
- 🚧 **Real-Time API Integration**: In progress (currently simulated)
- 📋 **Historical Data**: Planned (NASA DONKI integration)

---

## 🚀 Features

### 🎭 Dual-View Experience

**Explorer Mode** - Immersive 3D solar system with space helmet HUD
- Navigate through real-time planetary positions
- 4 customizable helmet themes (Fighter Jet, Astronaut, Iron Man, Commander)
- Corner metrics showing KP status, solar wind, time, and target
- Mobile-optimized with expandable data panels

**Mission Control Mode** - Advanced analyst dashboard
- 5 novel space weather formulas providing unique insights:
  1. **Solar Wind Momentum Index**: `(ρ × v²) / 1000` - Particle kinetic energy flux
  2. **Magnetic Flux Compression Ratio**: `Bz × (ρ / ρ₀)` - Magnetosphere compression
  3. **Aurora Intensity Predictor**: `Kp³ × cos(φ) × (1-c)` - Visible aurora strength (0-100)
  4. **Magnetosphere Stability Index**: `1 / (1 + Dst²)` - Magnetic field equilibrium
  5. **CME Impact Probability**: Speed/density threshold analysis (next 48h forecast)
- Real-time telemetry stream
- Grid-based analytical interface
### 🪐 Interactive Solar System
- **Real Astronomy**: Powered by `astronomy-engine` for accurate planetary positions
- **Free Flight Camera**: Click planets → 2s smooth animation → **Full 360° control unlocked!**
  - Spin freely around any planet after animation completes
  - **Street-Level Zoom**: Get as close as 0.1× planet radius (extreme close-up)
  - Full polar angle freedom: Look straight up/down from any position
  - **Realistic Earth Texture**: NASA Blue Marble with continents, oceans, clouds
  - Look up from planet surface to see Sun and other planets
  - EXIT ORBIT button for easy return to solar system view
- **Clickable Planets**: Focus camera on any celestial body with smooth Bezier easing
- **8 Planets + Moon**: Mercury through Neptune with realistic orbits and axial tilts
- **ISS & DSCOVR Satellites**: Live orbital mechanics
- **10,000-Star Parallax Background**: 3-layer depth with twinkling effect
- **Orbit Trails**: 365-point ephemeris data visualized as dashed ellipses
- **Shooting Stars**: Random meteors (every 3-8s) with NASA Fireball API data

### ⚡ Space Weather Monitoring
- **Live Solar Wind**: Speed, density, temperature, magnetic field (Bz)
- **KP Index Tracking**: Geomagnetic activity (0-9 scale) with color-coded alerts
- **Aurora Forecasting**: Real-time visibility predictions for 50+ cities worldwide
- **CME Visualization**: Expanding shockwave spheres when wind > 500 km/s
- **Dynamic Magnetosphere**: Color-changing shield (green calm → purple storm)
- **Volumetric Aurora**: Flowing curtains with realistic color gradients

### 🕰️ Time Travel
- **Historical Events**: Jump to 8 famous geomagnetic storms (1859-2024)
  - Carrington Event (1859): Kp 9.5, -1760 nT Dst
  - Quebec Blackout (1989): 6 million without power
  - Halloween Storm (2003): Satellite destroyed
  - May 2024 Superstorm: First G5 in 20 years
- **Time Scrubbing**: ±7 days with playback speeds (1x to 1000x)
- **Planet Positions**: Accurate historical ephemerides

### ⌨️ Keyboard Shortcuts
- **Space**: Play/Pause time
- **← / →**: Skip 24 hours backward/forward
- **R**: Reset camera view
- **N**: Jump to NOW
- **H**: Hide/show UI for fullscreen 3D view
- **F**: Fullscreen toggle
- **Esc**: Cancel/Close modals
- **?**: Show keyboard help

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
- Novel space weather analysis methods
- Performance optimizations
- Mobile UX improvements
- Accessibility enhancements
- Documentation and tutorials

---

## 🗺️ Roadmap

See [docs/ROADMAP.md](./docs/ROADMAP.md) for the full development plan.

**Coming Soon:**
- **Tier 6**: Carrington Event preset with red aurora dominance
- **Tier 7**: Advanced charts (Kp time-series, X-ray flux, CME countdown)
- **Tier 8**: Research Lab with 10 novel formulas
- **Tier 9**: Live API integration (NOAA SWPC, NASA DONKI, INTERMAGNET)
- **Tier 10**: Satellite tracking, magnetometer network, power grid impact

---

## 🧪 AI-Assisted Development

This project was built using an **AI-Human Pair Programming workflow**, demonstrating rapid prototyping of complex 3D visualizations and physics calculations. The combination of human domain knowledge (space weather) and AI coding assistance (GitHub Copilot) enabled:
- Fast iteration on novel visualization techniques
- Rapid integration of scientific formulas
- Comprehensive documentation generation
- Architecture refactoring with minimal errors

This approach showcases how AI tools can accelerate development of scientifically complex applications while maintaining code quality and performance.

---

## 📜 License

MIT License - see [LICENSE](LICENSE) for details.

---

## 🙏 Credits & Attribution

**Data Sources:**
- [NOAA Space Weather Prediction Center](https://www.swpc.noaa.gov/) - Real-time space weather data
- [NASA DONKI](https://kauai.ccmc.gsfc.nasa.gov/DONKI/) - Historical event data
- [Astronomy Engine](https://github.com/cosinekitty/astronomy) - Planetary calculations

**Libraries:**
- [Three.js](https://threejs.org/) - 3D graphics
- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber/) - React integration for Three.js
- [TailwindCSS](https://tailwindcss.com/) - Styling framework
- [Vite](https://vitejs.dev/) - Build tool

**Inspiration:**
- Iron Man's JARVIS interface
- Fighter jet HUDs
- NASA mission control dashboards
- Elite Dangerous, No Man's Sky, and other space games

---

## 📞 Contact & Support

- **Issues**: [GitHub Issues](https://github.com/steve81uk/aurora-live/issues)
- **Discussions**: [GitHub Discussions](https://github.com/steve81uk/aurora-live/discussions)
- **Repository**: [github.com/steve81uk/aurora-live](https://github.com/steve81uk/aurora-live)

---

## ⭐ Star History

If you find this project useful, please consider giving it a star! ⭐

---

**Built with 💙 for space weather enthusiasts and 3D visualization lovers**

*Last updated: January 30, 2026*


