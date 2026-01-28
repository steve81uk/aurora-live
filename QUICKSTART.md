# 🚀 QUICK START GUIDE - Space Weather Forecasting System

## ⚡ 60-Second Setup

### 1. Prerequisites Check
```powershell
# Check Python
python --version
# Expected: Python 3.7 or higher

# Check requests library
pip show requests
# If not installed: pip install requests
```

### 2. File Verification
```powershell
# You should have these files:
SpaceWeatherCore.py    # Python backend
AuroraHUD.ps1          # PowerShell dashboard
```

### 3. Run the System
```powershell
# Option A: Full auto-refreshing dashboard
.\AuroraHUD.ps1

# Option B: One-time data fetch
python SpaceWeatherCore.py

# Option C: Test without loop
.\Test-AuroraHUD.ps1
```

---

## 📊 What You'll See

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
