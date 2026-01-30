# Solar Admiral Roadmap

This document outlines the development roadmap for Solar Admiral, organized into implementation tiers. Each tier builds upon the previous, creating a comprehensive space weather platform.

## 🎯 Current Status (v0.5.0)

**✅ Completed:**
- Tier 1: Real-time planetary physics with astronomy-engine
- Tier 2: Interactive Earth, 50+ cities, volumetric aurora, notifications
- Tier 3-5: Planet interactions, TelemetryDeck, CME shockwaves, magnetosphere
- Dual-View System: Explorer (3D) + Mission Control (Analyst Dashboard)
- Space Helmet HUD: 4 theme modes (Fighter, Astronaut, Iron Man, Commander)
- 5 Novel Formulas: Momentum Index, Flux Compression, Aurora Predictor, Stability, CME Probability

**🚧 In Progress:**
- Project organization and documentation cleanup
- Professional README and deployment preparation

---

## Tier 6: Carrington Event Preset (1-2 weeks)

**Goal**: One-click time travel to the most powerful solar storm in recorded history.

### Features
- **Preset Button**: "⚡ Carrington Event (1859)" in historical dropdown
- **Extreme Parameters**: Pre-loaded values
  - Solar wind: 2200 km/s, Density: 50 particles/cm³
  - Bz: -90 nT, Kp: 9.5, Dst: -1760 nT
- **Visual Overhaul**:
  - Red aurora dominance (85% red vs 15% green)
  - 8× aurora intensity multiplier
  - Global red glow effect on Earth
  - Tropical location highlights (Caribbean, India, Hawaii)
- **Educational Modal**:
  - Timeline: September 1-3, 1859 events
  - Witness accounts and impacts
  - Modern damage estimates ($2.6 trillion)
  - 20 educational facts
- **Tropical Aurora Markers**: Show 10 locations that witnessed aurora
- **Camera Cinematic**: Auto-focus Earth, pan to show global scale

**Technical**:
- Expand `carringtonEvent.ts` with shader configurations
- Create `RedAuroraShader.tsx` component
- Implement global atmosphere tint
- Add educational overlay component

---

## Tier 7: Graphs & Charts (2-3 weeks)

**Goal**: Professional data visualization for space weather trends.

### Charts
1. **Kp Index Time-Series** (7-day history)
   - Line chart with storm threshold bands (G1-G5)
   - Annotations for historical events
2. **Solar Wind Multi-Line** (Speed, Density, Bz on same axes)
   - Dual Y-axes for different scales
   - Color-coded traces
3. **X-ray Flux Chart** (GOES satellite data)
   - Log-scale Y-axis (A, B, C, M, X classes)
   - Background zones for flare classifications
4. **CME Countdown Visualization**
   - Radial progress bar showing arrival time
   - Impact probability percentage
5. **Aurora Visibility Heatmap**
   - World map with probability gradient
   - Real-time OVATION model overlay

### Implementation
- Install `recharts` or `visx` library
- Create `ChartsPanel.tsx` component
- Integrate NOAA SWPC JSON endpoints
- Add "Show Charts" toggle in Mission Control view
- Export chart data as PNG/CSV

---

## Tier 8: Research Lab (3-4 weeks)

**Goal**: Novel physics formulas that provide unique insights into space weather.

### 10 Novel Formulas
1. **Plasma Beta** (β = nkT / [B²/2μ₀])
2. **Alfvén Mach Number** (M_A = V_sw / V_alfven)
3. **Magnetopause Standoff Distance** (R_mp = [B_sw² / (2μ₀ × P_sw)]^(1/6))
4. **Ring Current Energy** (E_rc = ∫ P dV)
5. **Auroral Power** (P_aurora = ε × coupling function)
6. **GIC Risk Index** (dB/dt × ground conductivity)
7. **Reconnection Rate** (R = V_in / L × η)
8. **Wavelet Power Spectrum** (Time-frequency analysis of Bz)
9. **Entropy Generation** (ΔS = k_B × ln(Ω))
10. **Turbulence Index** (Kolmogorov cascade analysis)

### Features
- Collapsible "Research Lab" panel
- Real-time calculations with sparklines
- Correlation graphs (e.g., Epsilon vs Kp)
- Anomaly detection: Alert when formulas hit rare values
- CSV export: Full dataset download
- Tooltips explaining each formula's significance

---

## Tier 9: Live Data Integration (4-6 weeks)

**Goal**: Replace simulated data with real-time feeds.

### APIs to Integrate
- **NOAA SWPC**: Plasma, magnetic field, Kp index (update every 1 min)
- **NASA DONKI**: CME events, flare alerts
- **NOAA OVATION**: Aurora probability maps
- **GOES Satellites**: X-ray flux
- **ACE/DSCOVR**: L1 solar wind monitoring
- **THEMIS ASI**: All-sky camera images
- **INTERMAGNET**: Ground magnetometer network

### IndexedDB Caching
- Store last 30 days of 1-minute data
- Time-series compression (delta encoding)
- Pre-fetch forecast data every 6 hours
- Offline mode: Use cached data when API unavailable
- "Clear Cache" button showing storage used

### WebSocket Support
- Real-time push notifications for alerts
- Live telemetry streaming
- Multiplayer: See other users' camera positions (future)

---

## Tier 10: Advanced Features (6-12 weeks)

### Satellite Tracking
- **ISS** (already implemented, enhance with live TLE data)
- **Starlink Constellation**: Sample 100 satellites
- **Parker Solar Probe**: Near-sun trajectory
- **Solar Orbiter**: Heliocentric orbit
- **STEREO A/B**: 3D coronal mass ejection tracking
- Satellite health indicators (green/yellow/red)
- Communication impact warnings

### Magnetometer Network
- 20+ ground stations worldwide (INTERMAGNET)
- Live H-component plots as sparklines
- Color-code by disturbance: <50nT (green), 50-200nT (yellow), >200nT (red)
- Click station → Full 3-axis data (X, Y, Z)
- Citizen science: "Add your magnetometer" form

### Solar Imagery Integration
- Embed latest SDO images (update every 15 min)
  - 193Å (corona), 304Å (chromosphere), HMI magnetogram
- Highlight active regions (sunspots)
- Coronal hole detection: Dark regions = fast wind sources
- Time-lapse mode: Watch Sun rotate over 27 days

### Power Grid Impact Visualization
- GIC (Geomagnetically Induced Currents) risk map
- High-latitude power grid overlays
- Transformer heating calculations based on dB/dt
- Aviation radiation exposure at 35,000 ft
- GPS accuracy degradation estimates
- Radio blackout zones (HF communication)

---

## Future Exploration (12+ weeks)

### Community & Social Features
- **User Profiles**: Save favorite locations, alert thresholds
- **Aurora Sighting Journal**: Upload photos, track storms
- **Friend System**: Follow users, see sightings
- **Achievement Badges**: "Caught G5", "7-day streak", "Night Owl"
- **Leaderboard**: Top photographers, most storms tracked
- **Community Feed**: Live photo stream from worldwide users

### Educational Content
- **Interactive Tutorials**: "What is Solar Wind?", "Aurora Science 101"
- **Guided Tours**: "Journey of a CME" cinematic mode
- **Famous Storms Section**: Carrington, Quebec, Halloween 2003, May 2024
- **Glossary**: Hover terms for definitions
- **Voice Narration**: TTS for Narrative Mode (future)

### Developer Tools
- **API Playground**: Interactive endpoint explorer
- **Code Generator**: Copy as Python/cURL/JavaScript
- **Rate Limit Display**: "47/100 calls remaining"
- **Full API Documentation**: OpenAPI spec
- **Webhook Integration**: Discord/Telegram/Slack alerts

### Mobile App
- **PWA Conversion**: Installable app
- **Offline Mode**: Full functionality without internet
- **Push Notifications**: Background alerts even when app closed
- **AR Mode**: Point phone at sky, see real-time aurora predictions
- **Camera Integration**: Overlay aurora probability on camera view

### Monetization (Optional)
- **Free Tier**: Real-time data, 7-day history
- **Pro Tier** ($5/month): 30-day history, advanced alerts, no ads
- **API Tier** ($20/month): 1000 calls/day for developers
- **Enterprise**: Custom white-label for planetariums/universities

---

## Development Principles

1. **Performance First**: Maintain <350 KB gzipped, 60 FPS target
2. **Scientific Accuracy**: Cite sources, validate ranges, test edge cases
3. **Accessibility**: WCAG 2.1 AA compliance, keyboard navigation, screen readers
4. **Mobile-Friendly**: Touch controls, responsive layouts, 360px minimum
5. **Offline Support**: Progressive enhancement with IndexedDB
6. **Open Source**: MIT license, encourage community contributions

---

## How to Contribute

See [CONTRIBUTING.md](./CONTRIBUTING.md) for development guidelines.

**Want to help implement a tier?** Open an issue or discussion on GitHub!

---

## Timeline Estimates

| Tier | Feature | Duration | Status |
|------|---------|----------|--------|
| 1-5 | Core + Interactive | 4-6 weeks | ✅ Complete |
| 6 | Carrington Preset | 1-2 weeks | 📋 Planned |
| 7 | Graphs & Charts | 2-3 weeks | 📋 Planned |
| 8 | Research Lab | 3-4 weeks | 📋 Planned |
| 9 | Live Data APIs | 4-6 weeks | 📋 Planned |
| 10 | Advanced Features | 6-12 weeks | 📋 Planned |

**Total estimated effort**: 400-600 hours (3-6 months full-time equivalent)

---

*Last updated: January 30, 2026*
