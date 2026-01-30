# 🚀 QUICK START GUIDE - Solar Admiral

**Interactive 3D Space Weather & Solar System Visualization**

## ⚡ 30-Second Setup (Web App)

### 1. Prerequisites Check
```bash
# Check Node.js (18+ required)
node --version

# Check npm (9+ required)
npm --version
```

### 2. Install & Run
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open browser to http://localhost:5173
```

### 3. Production Build (Optional)
```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

---

## 📦 Alternative: PowerShell Version

### For command-line enthusiasts:
```powershell
# Check Python
python --version
# Expected: Python 3.7 or higher

# Check requests library
pip show requests
# If not installed: pip install requests

# Run PowerShell dashboard
.\AuroraHUD.ps1

# OR: One-time data fetch
python SpaceWeatherCore.py

# OR: Test without loop
.\Test-AuroraHUD.ps1
```

---

## 🎮 Web App Features (v0.5.0 - NEW!)

### Interactive Solar System
- **Click any planet** → Smooth camera chase view
- **Click "RESET VIEW"** → Return to overview
- **Scroll wheel** → Zoom in/out
- **Click + drag** → Rotate view

### TelemetryDeck Mission Control (Bottom Bar)
- **⏪ Skip Back** → Jump 24 hours into past
- **⏸️ Play/Pause** → Toggle time animation
- **⏩ Skip Forward** → Jump 24 hours into future
- **NOW** → Return to present
- **Speed Selector** → 1x, 10x, 100x, 1000x playback
- **Timeline Slider** → Drag to any date (±7 days)
- **Solar Heartbeat Visualizer** → Live sine wave (color changes with activity)
- **System Ticker** → Scrolling status updates

### Left Panel Controls
| Feature | What It Does |
|---------|--------------|
| **TEST ALERT** | Test browser notifications |
| **TIME JUMP** | Navigate to historical storms (Carrington 1859, Quebec 1989, etc.) |
| **Science Mode** | Toggle Simple/Advanced metrics (5 extra calculations) |
| **SNAPSHOT** | Capture current conditions |
| **Mission Log** | View last 5 snapshots |

### Historical Events Available
**Extreme Events (Kp = 9):**
- Carrington Event (1859) - Strongest ever
- Quebec Blackout (1989) - 6M without power
- Halloween Storm (2003) - Satellite destroyed
- Bastille Day (2000) - X5.7 flare

**Major Storms (Kp = 8):**
- May 2024 Superstorm - First G5 in 20 years
- Sept 2017 - X9.3 flare
- Jan 2005 - GPS disruptions
- St. Patrick's Day 2015 - G4 storm

### Visual Effects
- **CME Shockwave**: Expanding red sphere when solar wind > 500 km/s
- **Magnetosphere Shell**: Green (calm) or Purple (storm) around Earth
- **Sun Pulsing**: Heartbeat animation
- **Volumetric Aurora**: Color-changing curtains
- **ISS & DSCOVR**: Satellites with realistic orbits

---

## 📊 PowerShell Dashboard (Classic)

```
╔═══════════════════════════════════════════════════════════╗
║      AURORA COMMAND - SPACE WEATHER HUD                   ║
╠═══════════════════════════════════════════════════════════╣
║  GEOMAGNETIC ACTIVITY (KP INDEX)                          ║
║  Current: 2.7 / 9.0                                       ║
║  [█████████░░░░░░░░░░░░░░░░░░░░░]                        ║
║                                                            ║
║  SOLAR WIND PARAMETERS                                     ║
║  Speed:    400.0 km/s                                     ║
║  Density:   5.00 p/cm³                                    ║
║                                                            ║
║  SOLAR FLARE PREDICTION (SURYA AI)                        ║
║  Probability: 14.7%  |  X-Ray Class: A                    ║
║                                                            ║
║  CME PROPAGATION MODEL (EUHFORIA)                         ║
║  Earth Arrival: 72.0 hours  (3.0 days)                   ║
║                                                            ║
║  AURORA VISIBILITY FORECAST                                ║
║  Visibility Score: 21/100                                 ║
╚═══════════════════════════════════════════════════════════╝
```

---

## 🎯 Understanding the Data

### KP Index (0-9)
- **0-3:** Quiet → Aurora unlikely
- **4-6:** Active → Aurora at high latitudes
- **7-9:** Storm → Aurora visible at mid/low latitudes

### Flare Probability
- **<30%:** Low risk
- **30-60%:** Moderate - monitor
- **>60%:** High risk - expect events

### Aurora Visibility Score (0-100)
- **0-30:** Poor - unlikely to see
- **31-60:** Fair - possible
- **61-100:** Good/Excellent - GO OUTSIDE!

### CME Arrival
- **<24h:** Critical - immediate impact expected
- **24-72h:** High alert
- **>72h:** Monitor situation

---

## 🎨 Special Features

### Automatic Themes
The HUD changes colors based on aurora activity:
- **Cyan (QUIET):** Low activity
- **Yellow (POSSIBLE):** Moderate activity
- **Green (ACTIVE):** High activity - excellent viewing!

### Animations
- **Solar Burst:** Flashing alert when flare probability > 50%
- **Progress Bars:** Visual representation of all metrics

---

## ⌨️ Controls

- **Ctrl+C:** Exit the dashboard
- **Wait:** Auto-refreshes every 5 minutes
- **Minimize:** Safe to minimize window

---

## 🔧 Troubleshooting

### "Python not found"
```powershell
# Find Python
where python

# If not found, download from:
# https://www.python.org/downloads/
```

### "requests not installed"
```bash
pip install requests
```

### "No data"
- Check internet connection
- Verify NOAA SWPC is accessible
- System will use mock data if APIs fail

---

## 📱 Mobile Version

Currently desktop only. PowerShell dashboard requires:
- Windows 10/11
- PowerShell 5.1+
- Terminal access

---

## 🌍 Best Viewing Locations

Aurora typically visible at:
- **Always:** 60-70°N latitude (Alaska, Iceland, Norway)
- **KP 5+:** 50-60°N (Canada, Scotland, Sweden)
- **KP 7+:** 40-50°N (Northern US, Central Europe)
- **KP 9:** Even lower latitudes possible!

---

## 📞 Need Help?

1. Run diagnostics: `.\Verify-SpaceWeatherSystem.ps1`
2. Read full docs: `SPACEWEATHER_README.md`
3. Check report: `FINAL_VERIFICATION_REPORT.md`

---

## 🎓 Learn More

**Space Weather Basics:**
- KP Index: https://www.swpc.noaa.gov/products/planetary-k-index
- Solar Wind: https://www.swpc.noaa.gov/products/ace-real-time-solar-wind
- Forecasts: https://www.swpc.noaa.gov/products/3-day-forecast

**Aurora Photography Tips:**
- Dark location away from light pollution
- Clear northern horizon
- DSLR camera with manual mode
- Wide-angle lens (14-24mm)
- Tripod essential
- ISO 1600-3200, 15-30s exposure

---

## ✅ Quick Checklist

- [ ] Python 3.7+ installed
- [ ] requests library installed  
- [ ] Both files in same directory
- [ ] Internet connection active
- [ ] PowerShell window maximized
- [ ] UTF-8 encoding enabled (automatic)
- [ ] Ready to monitor space weather!

---

## 🎉 You're Ready!

Just run:
```powershell
.\AuroraHUD.ps1
```

And watch the space weather in real-time!

**Pro Tip:** Leave it running in a maximized window for continuous monitoring. Perfect for aurora hunters!

---

*Aurora Command - Making space weather accessible to everyone*
