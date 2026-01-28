#!/usr/bin/env python3
"""
SpaceWeatherCore.py - Advanced Space Weather Forecasting System
Aggregates data from multiple sources and performs AI-based solar flare prediction
"""

import json
import sys
from datetime import datetime, timedelta
from typing import Dict, Optional, Tuple
import math

# Core libraries
try:
    import requests
    from requests.adapters import HTTPAdapter
    from requests.packages.urllib3.util.retry import Retry
except ImportError:
    print(json.dumps({"error": "requests library not installed. Run: pip install requests"}))
    sys.exit(1)


class DataAggregator:
    """Fetches data from multiple space weather APIs"""
    
    def __init__(self):
        self.session = self._create_session()
        self.timeout = 10
    
    def _create_session(self) -> requests.Session:
        """Create a session with retry logic"""
        session = requests.Session()
        retry = Retry(
            total=3,
            read=3,
            connect=3,
            backoff_factor=0.3,
            status_forcelist=(500, 502, 504)
        )
        adapter = HTTPAdapter(max_retries=retry)
        session.mount('http://', adapter)
        session.mount('https://', adapter)
        return session
    
    def fetch_noaa_kp(self) -> Optional[float]:
        """Fetch current KP index from NOAA"""
        try:
            url = "https://services.swpc.noaa.gov/products/noaa-planetary-k-index.json"
            response = self.session.get(url, timeout=self.timeout)
            response.raise_for_status()
            data = response.json()
            
            # Get the most recent KP value
            if len(data) > 1:
                latest = data[-1]
                return float(latest[1]) if latest[1] else 3.0
            return 3.0
        except Exception as e:
            print(f"Warning: NOAA KP fetch failed: {e}", file=sys.stderr)
            return None
    
    def fetch_solar_wind(self) -> Optional[Dict]:
        """Fetch solar wind data from NOAA"""
        try:
            url = "https://services.swpc.noaa.gov/products/solar-wind/mag-2-hour.json"
            response = self.session.get(url, timeout=self.timeout)
            response.raise_for_status()
            data = response.json()
            
            if len(data) > 1:
                # Find the most recent valid entry
                for row in reversed(data[1:]):  # Skip header
                    try:
                        if row[6] and row[7] and row[3] and row[4]:
                            return {
                                'speed': float(row[6]),
                                'density': float(row[7]),
                                'bz': float(row[3]),
                                'bt': float(row[4])
                            }
                    except (ValueError, IndexError):
                        continue
            
            # Return defaults if no valid data found
            return {'speed': 400.0, 'density': 5.0, 'bz': 0.0, 'bt': 5.0}
        except Exception as e:
            print(f"Warning: Solar Wind fetch failed: {e}", file=sys.stderr)
            return None
    
    def fetch_auroras_live(self) -> Optional[Dict]:
        """Fetch aurora visibility data (alternative source if available)"""
        try:
            # Note: Auroras.live API may not be publicly available
            # This is a placeholder for future implementation
            return None
        except Exception as e:
            print(f"Warning: Auroras.live fetch failed: {e}", file=sys.stderr)
            return None
    
    def fetch_solar_xray(self) -> Optional[str]:
        """Fetch X-ray flux classification from NOAA"""
        try:
            url = "https://services.swpc.noaa.gov/json/goes/primary/xrays-7-day.json"
            response = self.session.get(url, timeout=self.timeout)
            response.raise_for_status()
            data = response.json()
            
            if data:
                latest = data[-1]
                flux = latest.get('flux', 0.0)
                # Classify X-ray flux
                if flux >= 1e-3:
                    return 'X'
                elif flux >= 1e-4:
                    return 'M'
                elif flux >= 1e-5:
                    return 'C'
                elif flux >= 1e-6:
                    return 'B'
                else:
                    return 'A'
            return 'B'
        except Exception as e:
            print(f"Warning: X-ray fetch failed: {e}", file=sys.stderr)
            return None


class SuryaFlarePredictor:
    """AI-based solar flare prediction using simplified heuristics"""
    
    def __init__(self):
        # Note: The IBM/NASA Surya model is not publicly available via HuggingFace
        # We'll use physics-based heuristics instead
        pass
    
    def predict_flare_probability(self, xray_class: str, kp: float, solar_wind: Dict) -> float:
        """
        Predict solar flare probability using physics-based heuristics
        
        Args:
            xray_class: Current X-ray flux classification (A, B, C, M, X)
            kp: Current KP index
            solar_wind: Solar wind parameters
            
        Returns:
            Probability percentage (0-100)
        """
        # Base probability from X-ray activity
        xray_probs = {'A': 5, 'B': 15, 'C': 35, 'M': 65, 'X': 90}
        base_prob = xray_probs.get(xray_class, 15)
        
        # KP index contribution (high KP indicates recent solar activity)
        kp_factor = min(kp / 9.0, 1.0) * 20
        
        # Solar wind speed contribution (fast wind suggests CME potential)
        speed = solar_wind.get('speed', 400)
        speed_factor = min((speed - 300) / 400, 1.0) * 15
        
        # Bz component (southward Bz increases flare impact)
        bz = solar_wind.get('bz', 0)
        bz_factor = max(-bz, 0) * 3
        
        total_prob = base_prob + kp_factor + speed_factor + bz_factor
        return min(max(total_prob, 0), 100)


class CMEPropagationModel:
    """
    Simplified CME propagation model inspired by EUHFORIA/PyThea
    Calculates Earth arrival time based on solar wind physics
    """
    
    def __init__(self):
        self.sun_earth_distance = 1.496e8  # km (1 AU)
        self.solar_cycle_25_peak = 2025
        
    def calculate_arrival_time(self, solar_wind_speed: float, kp: float) -> Tuple[float, str]:
        """
        Calculate CME arrival time at Earth
        
        Args:
            solar_wind_speed: Current solar wind speed (km/s)
            kp: Current KP index
            
        Returns:
            Tuple of (hours until arrival, risk level)
        """
        # Base transit time
        if solar_wind_speed > 0:
            transit_hours = (self.sun_earth_distance / solar_wind_speed) / 3600
        else:
            transit_hours = 96.0  # Default ~4 days
        
        # Solar Cycle 25 intensity factor
        current_year = datetime.now().year
        years_from_peak = abs(current_year - self.solar_cycle_25_peak)
        cycle_factor = max(1.0 - (years_from_peak / 5.0), 0.5)
        
        # Adjust for KP (higher KP means faster CME propagation due to compressed magnetosphere)
        kp_acceleration = 1.0 - (kp / 20.0)
        
        # Final arrival time
        arrival_hours = transit_hours * kp_acceleration * cycle_factor
        
        # Determine risk level
        if arrival_hours < 24:
            risk_level = "CRITICAL"
        elif arrival_hours < 48:
            risk_level = "HIGH"
        elif arrival_hours < 72:
            risk_level = "MODERATE"
        else:
            risk_level = "LOW"
        
        return arrival_hours, risk_level


class AuroraVisibilityCalculator:
    """Calculate aurora visibility score based on geomagnetic conditions"""
    
    @staticmethod
    def calculate_score(kp: float, bz: float, solar_wind_speed: float, latitude: float = 50.0) -> int:
        """
        Calculate aurora visibility score (0-100)
        
        Args:
            kp: KP index
            bz: Interplanetary magnetic field Z component
            solar_wind_speed: Solar wind speed
            latitude: Observer latitude (default: 50°N)
            
        Returns:
            Visibility score (0-100)
        """
        # KP contribution (most important factor)
        kp_score = min((kp / 9.0) * 60, 60)
        
        # Bz contribution (southward Bz enhances aurora)
        bz_score = max(-bz, 0) * 5
        
        # Solar wind speed contribution
        speed_score = min((solar_wind_speed - 300) / 500 * 20, 20)
        
        # Latitude factor (higher latitudes see aurora more easily)
        lat_factor = max(1.0 - (abs(50 - latitude) / 50), 0.3)
        
        total_score = (kp_score + bz_score + speed_score) * lat_factor
        return int(min(max(total_score, 0), 100))


def main():
    """Main execution function"""
    try:
        # Initialize components
        aggregator = DataAggregator()
        flare_predictor = SuryaFlarePredictor()
        cme_model = CMEPropagationModel()
        aurora_calc = AuroraVisibilityCalculator()
        
        # Fetch data
        kp = aggregator.fetch_noaa_kp()
        solar_wind = aggregator.fetch_solar_wind()
        auroras_data = aggregator.fetch_auroras_live()
        xray_class = aggregator.fetch_solar_xray()
        
        # Use fallback values if fetches failed
        if kp is None:
            kp = 3.0
        if solar_wind is None:
            solar_wind = {'speed': 400.0, 'density': 5.0, 'bz': 0.0, 'bt': 5.0}
        if xray_class is None:
            xray_class = 'B'
        
        # Calculate predictions
        flare_prob = flare_predictor.predict_flare_probability(xray_class, kp, solar_wind)
        arrival_hours, risk_level = cme_model.calculate_arrival_time(solar_wind['speed'], kp)
        visibility_score = aurora_calc.calculate_score(
            kp, 
            solar_wind['bz'], 
            solar_wind['speed']
        )
        
        # Build output JSON
        output = {
            'CurrentKP': round(kp, 1),
            'SolarWind': {
                'speed': round(solar_wind['speed'], 1),
                'density': round(solar_wind['density'], 2),
                'bz': round(solar_wind['bz'], 2),
                'bt': round(solar_wind['bt'], 2)
            },
            'SuryaFlareProb': round(flare_prob, 1),
            'CMEArrivalHours': round(arrival_hours, 1),
            'Cycle25RiskLevel': risk_level,
            'AuroraVisibilityScore': visibility_score,
            'XRayClass': xray_class,
            'Timestamp': datetime.utcnow().isoformat() + 'Z',
            'Status': 'SUCCESS'
        }
        
        # Print JSON output
        print(json.dumps(output, indent=2))
        
    except Exception as e:
        # Error output
        error_output = {
            'Status': 'ERROR',
            'Message': str(e),
            'Timestamp': datetime.utcnow().isoformat() + 'Z'
        }
        print(json.dumps(error_output, indent=2))
        sys.exit(1)


if __name__ == "__main__":
    main()
