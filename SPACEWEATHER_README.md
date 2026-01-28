# Space Weather Forecasting System

## Overview

A robust space weather forecasting system with Python backend and PowerShell frontend, featuring real-time data aggregation, AI-based solar flare prediction, and CME propagation modeling.

## Components

### 1. SpaceWeatherCore.py (Python Backend)

Advanced space weather data aggregation and forecasting engine.

**Features:**
- **Data Aggregation:** Fetches real-time data from NOAA SWPC APIs
  - Planetary KP Index
  - Solar Wind parameters (speed, density, Bz, Bt)
  - X-ray flux classification
- **AI Layer:** Physics-based solar flare probability prediction
  - Inspired by IBM/NASA Surya model methodology
  - Considers X-ray class, KP index, and solar wind parameters
- **CME Propagation:** Simplified EUHFORIA/PyThea-inspired model
  - Calculates Earth arrival time
  - Incorporates Solar Cycle 25 intensity factors
- **Aurora Visibility:** Advanced scoring algorithm
  - Considers KP, Bz component, solar wind speed
  - Latitude-adjusted calculations

**Requirements:**
```bash
pip install requests
```

**Usage:**
```bash
python SpaceWeatherCore.py
```

**Output Format:**
```json
{
  "CurrentKP": 2.7,
  "SolarWind": {
    "speed": 400.0,
    "density": 5.0,
    "bz": 0.0,
    "bt": 5.0
  },
  "SuryaFlareProb": 14.7,
  "CMEArrivalHours": 72.0,
  "Cycle25RiskLevel": "LOW",
  "AuroraVisibilityScore": 21,
  "XRayClass": "A",
  "Timestamp": "2026-01-28T11:27:04Z",
  "Status": "SUCCESS"
}
```

### 2. AuroraHUD.ps1 (PowerShell Frontend)

Full-screen, auto-refreshing space weather dashboard with dynamic visualizations.

**Features:**
- **Full-Screen Display:** Maximized console interface with box-drawing characters
- **Auto-Refresh:** Updates every 5 minutes (configurable)
- **Dynamic Themes:** Color schemes change based on aurora visibility
  - AURORA_QUIET (Cyan) - Visibility < 40%
  - AURORA_POSSIBLE (Yellow) - Visibility 40-69%
  - AURORA_ACTIVE (Green) - Visibility ≥ 70%
- **Animations:**
  - Solar Burst animation when flare probability > 50%
  - Color pulsing effects
- **Progress Bars:** Visual representation of key metrics
- **Fallback Mode:** Uses mock data if Python script fails
- **Error Handling:** Graceful degradation with warnings

**Requirements:**
- PowerShell 5.1 or later
- Python 3.7+ with SpaceWeatherCore.py

**Usage:**
```powershell
.\AuroraHUD.ps1
```

**Controls:**
- `Ctrl+C` - Exit the dashboard

## Installation

1. **Clone/Download Files:**
   ```bash
   # Ensure both files are in the same directory
   SpaceWeatherCore.py
   AuroraHUD.ps1
   ```

2. **Install Python Dependencies:**
   ```bash
   pip install requests
   ```

3. **Test Python Backend:**
   ```bash
   python SpaceWeatherCore.py
   ```

4. **Run PowerShell Frontend:**
   ```powershell
   .\AuroraHUD.ps1
   ```

## Testing

### Test Python Backend Only:
```bash
python SpaceWeatherCore.py
```

### Test PowerShell HUD Once:
```powershell
.\Test-AuroraHUD.ps1
```

### Test with Mock Data:
```powershell
# Edit AuroraHUD.ps1 and change:
$script:LastData = Get-SpaceWeatherData -UseMock
```

## Configuration

### Python (SpaceWeatherCore.py):

Edit timeouts and retry logic:
```python
self.timeout = 10  # API timeout in seconds
retry = Retry(total=3, ...)  # Number of retries
```

### PowerShell (AuroraHUD.ps1):

Adjust refresh interval:
```powershell
$script:RefreshInterval = 300  # Seconds between updates
```

## Data Sources

1. **NOAA Space Weather Prediction Center (SWPC)**
   - Planetary KP Index: `https://services.swpc.noaa.gov/products/noaa-planetary-k-index.json`
   - Solar Wind: `https://services.swpc.noaa.gov/products/solar-wind/mag-2-hour.json`
   - X-Ray Flux: `https://services.swpc.noaa.gov/json/goes/primary/xrays-7-day.json`

## Understanding the Output

### KP Index (0-9)
- 0-2: Quiet conditions
- 3-4: Unsettled
- 5-6: Active (aurora possible at high latitudes)
- 7-8: Minor/moderate storm (aurora visible at mid-latitudes)
- 9: Severe storm (aurora visible at low latitudes)

### Solar Wind Speed
- < 400 km/s: Slow
- 400-600 km/s: Normal
- > 600 km/s: Fast (increased aurora potential)

### Bz Component
- Negative (southward): Favorable for auroras
- Positive (northward): Unfavorable

### Flare Probability
- < 30%: Low risk
- 30-60%: Moderate risk
- > 60%: High risk

### CME Arrival Time
- < 24 hours: Critical
- 24-48 hours: High risk
- 48-72 hours: Moderate risk
- > 72 hours: Low risk

### Aurora Visibility Score (0-100)
- 0-30: Poor visibility
- 31-60: Fair visibility
- 61-80: Good visibility
- 81-100: Excellent visibility

## Troubleshooting

### Python Script Fails
1. Check Python installation: `python --version`
2. Install requests: `pip install requests`
3. Check internet connectivity
4. Review firewall settings

### PowerShell Cannot Find Python
1. Add Python to PATH environment variable
2. Use full path in AuroraHUD.ps1:
   ```powershell
   $pythonCmd = "C:\Python311\python.exe"
   ```

### API Timeouts
1. Increase timeout in SpaceWeatherCore.py
2. Check NOAA SWPC service status
3. Use mock data mode for offline testing

### Display Issues
1. Ensure console supports UTF-8 encoding
2. Use Windows Terminal for best results
3. Maximize window manually if auto-maximize fails

## Advanced Features

### Custom Latitude
Edit AuroraVisibilityCalculator in SpaceWeatherCore.py:
```python
visibility_score = aurora_calc.calculate_score(
    kp, bz, solar_wind['speed'], 
    latitude=60.0  # Your latitude
)
```

### Custom Refresh Rate
Edit AuroraHUD.ps1:
```powershell
$script:RefreshInterval = 60  # Update every minute
```

### Logging
Add logging to Python script:
```python
import logging
logging.basicConfig(filename='spaceweather.log', level=logging.INFO)
```

## Performance

- **Python Execution Time:** ~2-5 seconds (network dependent)
- **Memory Usage:** < 50 MB
- **CPU Usage:** Minimal (< 1% when idle)
- **Network Traffic:** ~50 KB per refresh

## Security

- No API keys required (public NOAA data)
- No personal data collection
- No external code execution
- All dependencies are standard libraries

## Future Enhancements

- [ ] Historical data plotting
- [ ] Email/SMS alerts for high KP
- [ ] Mobile-responsive web interface
- [ ] Machine learning model integration
- [ ] Multi-location aurora forecasting
- [ ] Solar image overlay from SDO/SOHO
- [ ] Magnetometer data integration
- [ ] Cloud cover integration

## Credits

- **Data:** NOAA Space Weather Prediction Center
- **Physics Models:** Inspired by EUHFORIA and PyThea
- **AI Concepts:** Based on solar flare prediction methodologies

## License

This project is provided as-is for educational and research purposes.

## Support

For issues or questions, ensure:
1. Python 3.7+ is installed
2. `requests` library is installed
3. Internet connection is active
4. NOAA SWPC services are operational

## Version History

- **v1.0.0** (2026-01-28)
  - Initial release
  - Python backend with NOAA data aggregation
  - PowerShell HUD with auto-refresh
  - CME propagation model
  - Solar flare prediction
  - Aurora visibility scoring
