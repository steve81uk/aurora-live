import pandas as pd
import numpy as np
import tensorflow as tf
from sklearn.preprocessing import MinMaxScaler
import os

# 1. Load the cleaned OMNI/Historical set
data_path = 'data-mining/historical/training_set_v1.csv'
if not os.path.exists(data_path):
    print("🚨 Error: training_set_v1.csv not found. Run process_omniweb.py first.")
    exit()

df = pd.read_csv(data_path)

# 2. Feature Selection & Normalisation
# Normalising ensures wind speed (800km/s) doesn't "bully" density (5n/cc) in the neural layers.
features = ['speed', 'density', 'bt', 'bz', 'newell_coupling', 'alfven_velocity']
scaler = MinMaxScaler()
scaled_data = scaler.fit_transform(df[features])

# 3. Time-Series Windowing (Lookback 24h -> Predict 12h)
def create_sequences(data, lookback=24, horizon=12):
    X, y = [], []
    for i in range(len(data) - lookback - horizon):
        X.append(data[i:i + lookback])
        y.append(data[i + lookback + horizon, 0]) # Target: Future Wind/Psi
    return np.array(X), np.array(y)

X, y = create_sequences(scaled_data)
split = int(0.7 * len(X))
X_train, X_test = X[:split], X[split:]
y_train, y_test = y[:split], y[split:]

# 4. LSTM Architecture (2-Layer Neural Brain)
model = tf.keras.Sequential([
    tf.keras.layers.LSTM(64, return_sequences=True, input_shape=(24, len(features))),
    tf.keras.layers.Dropout(0.2),
    tf.keras.layers.LSTM(32),
    tf.keras.layers.Dense(1) # Output: Predicted Fatigue Coefficient (Ψ)
])

model.compile(optimizer='adam', loss='mse')
print("🚀 Launching Neural Training Loop...")
model.fit(X_train, y_train, epochs=10, batch_size=32, validation_data=(X_test, y_test))

# 5. Export to TensorFlow.js for the HUD
import tensorflowjs as tfjs
tfjs.converters.save_keras_model(model, 'public/ml-models/skoll-lstm-v1')
print("✅ Mission Success: Neural weights exported to /public/ml-models/")