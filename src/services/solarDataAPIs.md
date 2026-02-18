# NASA & NOAA Solar Data API Reference

## Real-Time Data Sources (Currently Used)

### 1. NOAA SWPC - Space Weather Alerts ✅
**URL:** `https://services.swpc.noaa.gov/json/alerts.json`
**Update:** Real-time
**Data:** Solar flares, CMEs, geomagnetic storms, radiation events
**Status:** INTEGRATED

### 2. NOAA SWPC - Planetary K-index ✅
**URL:** `https://services.swpc.noaa.gov/json/planetary_k_index_1m.json`
**Update:** 1-minute
**Data:** Kp index, A-index, geomagnetic activity
**Status:** INTEGRATED

### 3. NOAA SWPC - Solar Wind ✅
**URL:** `https://services.swpc.noaa.gov/json/rtsw/rtsw_mag_1m.json`
**Update:** 1-minute
**Data:** IMF Bz, Bt, solar wind magnetic field
**Status:** INTEGRATED

## Additional Available APIs (Not Yet Integrated)

### 4. NASA SDO (Solar Dynamics Observatory)
**URL:** `https://sdo.gsfc.nasa.gov/data/`
**Data:** Real-time solar images in multiple wavelengths
**Wavelengths:**
- 171 Å (1 million K) - Corona loops
- 304 Å (60,000 K) - Chromosphere, prominences
- 193 Å (1.5 million K) - Active regions
- 211 Å (2 million K) - Active region atmosphere
- 335 Å (2.5 million K) - Hot active regions
**Use Case:** Texture mapping for realistic Sun surface

### 5. NASA DONKI (Space Weather Database)
**URL:** `https://api.nasa.gov/DONKI/`
**Endpoints:**
- `/CME` - Coronal Mass Ejections
- `/FLR` - Solar Flares
- `/SEP` - Solar Energetic Particles
- `/GST` - Geomagnetic Storms
**API Key:** Required (free from nasa.gov)
**Use Case:** Historical event data for Chronos module

### 6. NOAA SWPC - Solar X-Ray Flux
**URL:** `https://services.swpc.noaa.gov/json/goes/primary/xray-flares-latest.json`
**Data:** Real-time X-ray flux (A, B, C, M, X class flares)
**Update:** 1-minute
**Use Case:** Flare intensity for shader effects

### 7. NOAA SWPC - Sunspot Number
**URL:** `https://services.swpc.noaa.gov/json/solar-cycle/observed-solar-cycle-indices.json`
**Data:** Daily sunspot numbers, F10.7 radio flux
**Use Case:** Sun surface detail density

### 8. NOAA SWPC - Aurora Forecast
**URL:** `https://services.swpc.noaa.gov/json/ovation_aurora_latest.json`
**Data:** Aurora probability by lat/long
**Use Case:** SurfaceView aurora intensity mapping

### 9. NASA SOHO (Solar and Heliospheric Observatory)
**URL:** `https://soho.nascom.nasa.gov/data/realtime/`
**Data:** Real-time LASCO coronagraph images
**Use Case:** Corona/CME visualization

### 10. Space Weather Prediction Center - Forecast
**URL:** `https://services.swpc.noaa.gov/text/3-day-forecast.txt`
**Data:** 3-day geomagnetic activity forecast
**Use Case:** Predictive modeling input

## Proposed Integration Priority

### High Priority (Immediate Impact):
1. **X-Ray Flux** - Real-time flare intensity for shader
2. **Sunspot Number** - Dynamic sun surface detail
3. **Aurora Forecast** - Surface view enhancement

### Medium Priority (Enhanced Features):
4. **NASA DONKI** - Historical events for Chronos
5. **SDO Images** - Texture mapping (if performance allows)

### Low Priority (Future ML/AI):
6. **3-Day Forecast** - Prediction model training
7. **SOHO Coronagraph** - Advanced corona visualization
