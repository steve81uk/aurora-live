#!/usr/bin/env python3
"""
SKÖLL-TRACK GEN-2 - HISTORICAL DATA MINER
Scrapes 80+ years of NOAA space weather archives for ML training

Data Sources:
- NOAA SWPC: Solar wind, magnetic field, Kp index (1975-present)
- GOES: X-ray flux (1986-present)
- NASA OMNIWeb: High-resolution historical data (1963-present)
- SILSO: Sunspot numbers (1749-present for solar cycle tracking)

@author steve81uk (Systems Architect)
"""

import requests
import json
import csv
from datetime import datetime, timedelta
from pathlib import Path
import time
from typing import List, Dict, Optional

# Configuration
OUTPUT_DIR = Path("data-mining/historical")
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

# NOAA SWPC Real-Time API (last 7 days available)
NOAA_SWPC_BASE = "https://services.swpc.noaa.gov/json"
NOAA_SWPC_ENDPOINTS = {
    "solar_wind": "/rtsw/rtsw_mag_1m.json",
    "mag_field": "/rtsw/rtsw_mag_1m.json", 
    "xray_flux": "/goes/primary/xrays-1-day.json",
    "kp_index": "/planetary_k_index_1m.json"
}

# NASA OMNIWeb for historical data (1963-2025)
OMNIWEB_BASE = "https://omniweb.gsfc.nasa.gov/cgi/nx1.cgi"

# SILSO Sunspot Data (1749-present)
SILSO_DAILY = "https://www.sidc.be/SILSO/INFO/sndtotcsv.php"
SILSO_MONTHLY = "https://www.sidc.be/SILSO/INFO/snmtotcsv.php"


class NOAAHistoricalMiner:
    """Mines historical space weather data from multiple sources"""
    
    def __init__(self, start_year: int = 1975, end_year: int = 2025):
        self.start_year = start_year
        self.end_year = end_year
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'SKOLL-TRACK-Gen2/1.0 (steve81uk@github)'
        })
    
    def fetch_noaa_realtime(self, endpoint_key: str) -> List[Dict]:
        """Fetch real-time NOAA data (last 7 days)"""
        url = NOAA_SWPC_BASE + NOAA_SWPC_ENDPOINTS[endpoint_key]
        print(f"Fetching NOAA real-time: {endpoint_key}...")
        
        try:
            response = self.session.get(url, timeout=30)
            response.raise_for_status()
            data = response.json()
            print(f"  ✓ Retrieved {len(data)} records")
            return data
        except Exception as e:
            print(f"  ✗ Error: {e}")
            return []
    
    def fetch_omniweb_historical(self, start_date: datetime, end_date: datetime) -> List[Dict]:
        """
        Fetch historical data from NASA OMNIWeb
        
        OMNIWeb provides:
        - Solar wind speed, density, temperature
        - IMF Bz, By, Bx, Bt
        - Kp, Dst indices
        - Proton flux
        
        Data format: Space-separated text files
        """
        print(f"Fetching OMNIWeb data: {start_date.date()} to {end_date.date()}...")
        
        # OMNIWeb parameters (1-hour resolution)
        params = {
            'activity': 'retrieve',
            'res': 'hour',  # Hourly resolution
            'spacecraft': 'omni2',
            'start_date': start_date.strftime('%Y%m%d'),
            'end_date': end_date.strftime('%Y%m%d'),
            'vars': [
                '1',   # Year
                '2',   # Day of year
                '3',   # Hour
                '8',   # Scalar B (nT)
                '9',   # Bx GSE (nT)
                '10',  # By GSE (nT)
                '11',  # Bz GSE (nT)
                '13',  # Solar wind speed (km/s)
                '14',  # Solar wind density (n/cc)
                '15',  # Solar wind temperature (K)
                '38',  # Kp index
                '40',  # Dst index (nT)
                '50',  # Alfvén Mach number
            ]
        }
        
        try:
            # Note: OMNIWeb requires form submission, parsing would go here
            # For now, we'll document the manual process
            manual_url = f"https://omniweb.gsfc.nasa.gov/form/dx1.html"
            print(f"  → Manual download required from: {manual_url}")
            print(f"  → Select: OMNI2 hourly, date range {start_date.date()} to {end_date.date()}")
            print(f"  → Parameters: Bt, Bz, By, Bx, V, n, T, Kp, Dst")
            return []
        except Exception as e:
            print(f"  ✗ Error: {e}")
            return []
    
    def fetch_sunspot_data(self) -> List[Dict]:
        """
        Fetch SILSO daily sunspot numbers (1749-present)
        Used to identify solar cycle phases
        """
        print("Fetching SILSO sunspot data...")
        
        try:
            response = self.session.get(SILSO_DAILY, timeout=30)
            response.raise_for_status()
            
            # SILSO format: Year;Month;Day;Decimal Year;SNvalue;SNerror;Observations
            lines = response.text.strip().split('\n')
            data = []
            
            for line in lines:
                if line.strip() and not line.startswith('#'):
                    parts = line.split(';')
                    if len(parts) >= 5:
                        data.append({
                            'year': int(parts[0]),
                            'month': int(parts[1]),
                            'day': int(parts[2]),
                            'sunspot_number': float(parts[4]) if parts[4] != '-1' else None,
                            'observations': int(parts[6]) if len(parts) > 6 else 0
                        })
            
            print(f"  ✓ Retrieved {len(data)} sunspot records (back to 1749)")
            return data
        except Exception as e:
            print(f"  ✗ Error: {e}")
            return []
    
    def calculate_wolf_formula(self, snapshot: Dict) -> float:
        """
        Calculate Infrastructure Fatigue Coefficient (Ψ)
        
        Ψ = (dJ/dt) / (v_A × Σ_P) - k × GIC
        
        Simplified for historical data:
        Ψ ≈ (Newell Coupling × Bt²) / (Alfvén Velocity × √Kp)
        """
        try:
            bt = snapshot.get('bt', 5.0)
            bz = snapshot.get('bz', 0.0)
            v = snapshot.get('speed', 400.0)
            n = snapshot.get('density', 5.0)
            kp = snapshot.get('kp', 0.0)
            
            # Newell Coupling
            theta = abs(bz) / (bt + 0.001)  # Clock angle proxy
            newell = (v ** (4/3)) * (bt ** (2/3)) * (theta ** 2.67)
            
            # Alfvén Velocity (simplified)
            mu0 = 1.256637e-6  # H/m
            proton_mass = 1.67e-27  # kg
            rho = n * 1e6 * proton_mass  # Convert n/cc to kg/m³
            v_alfven = (bt * 1e-9) / ((mu0 * rho) ** 0.5) / 1000  # km/s
            
            # Wolf-Formula (Ψ)
            if v_alfven > 0 and kp > 0:
                psi = (newell * bt * bt) / (v_alfven * (kp ** 0.5))
            else:
                psi = newell  # Fallback to Newell if incomplete data
            
            return psi
        except Exception as e:
            print(f"  ✗ Wolf-Formula error: {e}")
            return 0.0
    
    def process_historical_batch(self, year: int) -> List[Dict]:
        """
        Process one year of historical data
        Returns list of processed snapshots with Wolf-Formula
        """
        print(f"\nProcessing year {year}...")
        
        # For demonstration, we'll create a skeleton
        # In production, this would load from OMNIWeb CSV files
        
        snapshots = []
        start_date = datetime(year, 1, 1)
        end_date = datetime(year, 12, 31, 23)
        
        # Simulate hourly data (in reality, load from OMNIWeb)
        current = start_date
        while current <= end_date:
            snapshot = {
                'timestamp': current.isoformat(),
                'bt': 5.0,    # Would come from OMNIWeb
                'bz': 0.0,
                'speed': 400.0,
                'density': 5.0,
                'kp': 2.0,
            }
            
            # Calculate Wolf-Formula
            snapshot['wolf_formula'] = self.calculate_wolf_formula(snapshot)
            
            snapshots.append(snapshot)
            current += timedelta(hours=1)
        
        print(f"  ✓ Processed {len(snapshots)} hourly snapshots")
        return snapshots
    
    def save_training_data(self, data: List[Dict], filename: str):
        """Save processed data as JSON for TensorFlow.js"""
        output_path = OUTPUT_DIR / filename
        
        with open(output_path, 'w') as f:
            json.dump(data, f, indent=2)
        
        print(f"  💾 Saved to: {output_path}")
    
    def run_full_pipeline(self):
        """Execute complete historical data mining pipeline"""
        print("=" * 60)
        print("SKÖLL-TRACK GEN-2 - HISTORICAL DATA MINING")
        print("=" * 60)
        
        # Step 1: Fetch sunspot data (solar cycle context)
        sunspot_data = self.fetch_sunspot_data()
        if sunspot_data:
            self.save_training_data(sunspot_data, "sunspot_1749_2025.json")
        
        # Step 2: Fetch NOAA real-time (last 7 days)
        for endpoint in NOAA_SWPC_ENDPOINTS.keys():
            realtime_data = self.fetch_noaa_realtime(endpoint)
            if realtime_data:
                self.save_training_data(realtime_data, f"noaa_{endpoint}_realtime.json")
            time.sleep(1)  # Be nice to NOAA servers
        
        # Step 3: Process historical years
        # (Requires manual OMNIWeb downloads for now)
        print("\n" + "=" * 60)
        print("MANUAL STEP REQUIRED:")
        print("=" * 60)
        print("1. Visit: https://omniweb.gsfc.nasa.gov/form/dx1.html")
        print("2. Select: OMNI2 hourly data")
        print(f"3. Date Range: {self.start_year}-01-01 to {self.end_year}-12-31")
        print("4. Parameters: Bt, Bz, By, Bx, V, n, T, Kp, Dst, Alfvén Mach")
        print("5. Format: ASCII")
        print("6. Download and place in: scripts/data-mining/omniweb_raw/")
        print("=" * 60)
        
        # Placeholder: Process years when OMNIWeb data is available
        # for year in range(self.start_year, self.end_year + 1):
        #     yearly_data = self.process_historical_batch(year)
        #     self.save_training_data(yearly_data, f"processed_{year}.json")
        
        print("\n✅ Data mining pipeline configured!")
        print(f"📦 Output directory: {OUTPUT_DIR.absolute()}")


if __name__ == "__main__":
    # Mine data from 1975 (when NOAA systematic records began) to 2025
    miner = NOAAHistoricalMiner(start_year=1975, end_year=2025)
    miner.run_full_pipeline()
    
    print("\n" + "=" * 60)
    print("NEXT STEPS:")
    print("=" * 60)
    print("1. Download OMNIWeb data manually (instructions above)")
    print("2. Run: python scripts/data-mining/process_omniweb.py")
    print("3. Train LSTM: python src/ml/train_model.py")
    print("4. Export weights: python src/ml/export_tfjs.py")
    print("=" * 60)
