import requests
import json
import time
import os
import random
from datetime import datetime

OUTPUT_FILE = "public/live_data.json"

# History for sparklines
history_buffer = []

def fetch_real_noaa_data():
    print(f"[{datetime.now().strftime('%H:%M:%S')}] 📡 Scanning Solar System...")
    
    data = {
        "CurrentKP": 2.5,
        "SolarWind": {"speed": 400.0, "density": 5.0, "bz": -2.5, "bt": 6.0}, # Default safe values
        "Status": "OFFLINE_MODE",
        "Trends": {"KP": "STABLE", "Wind": "STABLE"},
        "History": []
    }
    
    try:
        # Mocking REALISTIC values (since we aren't parsing the complex NOAA file yet)
        # Solar Wind: Random between 350 and 550 km/s (NOT 10 km/s!)
        real_speed = random.uniform(350.0, 550.0)
        real_density = random.uniform(1.0, 10.0)
        real_kp = random.choice([2.0, 2.33, 2.66, 3.0, 3.33]) # Realistic KP steps

        data["CurrentKP"] = real_kp
        data["SolarWind"]["speed"] = real_speed
        data["SolarWind"]["density"] = real_density
        data["Status"] = "LIVE_SIMULATION"

        # PHYSICS FIX: CME Arrival Time
        # Distance (150M km) / Speed (km/s) = Seconds
        # Seconds / 3600 = Hours
        # Hours / 24 = Days
        transit_seconds = 149600000 / real_speed
        transit_days = (transit_seconds / 3600) / 24
        data["CMEArrivalHours"] = round(transit_days, 1) # Sending DAYS not hours now

        # Update History
        snapshot = {
            "time": datetime.now().strftime("%H:%M"),
            "kp": data["CurrentKP"],
            "speed": data["SolarWind"]["speed"]
        }
        history_buffer.append(snapshot)
        if len(history_buffer) > 10: history_buffer.pop(0)
        data["History"] = history_buffer

    except Exception as e:
        print(f"⚠️ Physics Error: {e}")
        
    return data

def save_to_react(data):
    try:
        os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)
        with open(OUTPUT_FILE, "w") as f:
            json.dump(data, f, indent=2)
        print(f"✅ Data Link Active | Wind: {data['SolarWind']['speed']:.1f} km/s | CME ETA: {data['CMEArrivalHours']} days")
    except Exception as e:
        print(f"❌ Link Failed: {e}")

if __name__ == "__main__":
    print("--- 🚀 SOLAR ADMIRAL PHYSICS ENGINE 2.0 ---")
    while True:
        data = fetch_real_noaa_data()
        save_to_react(data)
        time.sleep(5)