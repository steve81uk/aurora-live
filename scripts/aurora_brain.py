# scripts/aurora_brain.py
import json
import random
import datetime

# Mocking SciKit-Learn for now (You can install sklearn and use real models later)
# import pandas as pd
# from sklearn.ensemble import RandomForestRegressor

print("🐺 Midna's Python Brain Initializing...")

def generate_prediction():
    # Simulate advanced calculation
    current_wind = random.randint(300, 800)
    current_bz = random.uniform(-10, 10)
    
    # "The Algo"
    aurora_prob = (current_wind / 1000) * 0.5 + (abs(current_bz) / 20) * 0.5
    
    data = {
        "timestamp": datetime.datetime.now().isoformat(),
        "ai_model_version": "v1.4.2 (Odin)",
        "prediction": {
            "kp_next_hour": round(random.uniform(2, 8), 1),
            "aurora_probability": round(aurora_prob * 100, 1),
            "best_viewing_location": random.choice(["Tromsø", "Fairbanks", "Reykjavik"])
        },
        "solar_stats": {
            "flare_risk": "Moderate",
            "wind_speed_trend": "Increasing"
        }
    }
    return data

# Generate and Save
data = generate_prediction()
output_path = "../public/scikit_data.json" # Saves directly to your frontend public folder
with open(output_path, "w") as f:
    json.dump(data, f, indent=2)

print(f"✅ Neural Link Established. Data saved to {output_path}")