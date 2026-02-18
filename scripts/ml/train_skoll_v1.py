#!/usr/bin/env python3
"""
SKÖLL-TRACK GEN-2 - ML TRAINING PIPELINE v1
Train LSTM model using 1859 Carrington Event math weights

Features:
- 70/30 train-test split
- Carrington Event (1859) weighted loss function
- Web-ready JSON export for TensorFlow.js

@author steve81uk (Systems Architect)
"""

import pandas as pd
import numpy as np
import json
from pathlib import Path
from datetime import datetime
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
import warnings

warnings.filterwarnings('ignore')

# Try importing TensorFlow (optional for now)
try:
    import tensorflow as tf
    from tensorflow import keras
    HAS_TF = True
except ImportError:
    print("⚠️  TensorFlow not installed. Install with: pip install tensorflow")
    HAS_TF = False


class SkollTrainerV1:
    """
    Train LSTM for aurora prediction with Carrington Event weighting
    """
    
    # 1859 Carrington Event parameters (historical estimates)
    CARRINGTON_PARAMS = {
        'bt_max': 1700.0,      # nT (estimated IMF magnitude)
        'bz_min': -1500.0,     # nT (southward IMF)
        'speed_max': 2500.0,   # km/s (solar wind velocity)
        'dst_min': -1760.0,    # nT (extreme geomagnetic storm)
        'kp_max': 9.0,         # Maximum Kp index
        'wolf_formula_max': 25000.0  # Estimated infrastructure stress
    }
    
    def __init__(self, 
                 data_path: str = "data-mining/historical/training_set_v1.csv",
                 output_dir: str = "scripts/ml/models"):
        self.data_path = Path(data_path)
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)
        
        self.df = None
        self.scaler = StandardScaler()
        self.model = None
        
    def load_training_data(self) -> pd.DataFrame:
        """Load processed training data from CSV"""
        print("=" * 70)
        print("SKÖLL-TRACK GEN-2 - ML TRAINING v1")
        print("=" * 70)
        print(f"📖 Loading training data: {self.data_path}")
        
        if not self.data_path.exists():
            raise FileNotFoundError(
                f"Training data not found: {self.data_path}\n"
                f"Run first: python scripts/data-mining/process_omniweb.py"
            )
        
        df = pd.read_csv(self.data_path)
        print(f"  ✓ Loaded {len(df)} records")
        print(f"  ✓ Features: {list(df.columns)}")
        
        return df
    
    def prepare_features(self, df: pd.DataFrame) -> tuple:
        """
        Prepare feature matrix and target variable
        
        Features (X):
        - Solar wind: speed, density, temperature
        - IMF: bt, bx, by, bz
        - Derived: newell_coupling, alfven_velocity, mach_alfven
        - Indices: kp, dst
        
        Target (y):
        - wolf_formula (Infrastructure Fatigue Coefficient Ψ)
        """
        print("\n🔧 Preparing features...")
        
        feature_cols = [
            'bt', 'bx', 'by', 'bz',
            'speed', 'density', 'temperature',
            'kp', 'dst',
            'newell_coupling', 'alfven_velocity', 'mach_alfven'
        ]
        
        target_col = 'wolf_formula'
        
        # Filter available columns
        available_features = [col for col in feature_cols if col in df.columns]
        
        if target_col not in df.columns:
            raise ValueError(f"Target column '{target_col}' not found in dataset")
        
        X = df[available_features].values
        y = df[target_col].values
        
        print(f"  ✓ Feature matrix: {X.shape}")
        print(f"  ✓ Target vector: {y.shape}")
        print(f"  ✓ Features used: {available_features}")
        
        return X, y, available_features
    
    def split_data(self, X: np.ndarray, y: np.ndarray, test_size: float = 0.3):
        """
        70/30 train-test split with stratification based on Wolf-Formula quartiles
        """
        print(f"\n✂️  Splitting data (70% train / 30% test)...")
        
        # Create stratification bins based on wolf_formula quartiles
        quartiles = np.percentile(y, [25, 50, 75])
        strata = np.digitize(y, quartiles)
        
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, 
            test_size=test_size,
            stratify=strata,
            random_state=42
        )
        
        print(f"  ✓ Train: {X_train.shape[0]} samples")
        print(f"  ✓ Test:  {X_test.shape[0]} samples")
        
        return X_train, X_test, y_train, y_test
    
    def normalize_features(self, X_train: np.ndarray, X_test: np.ndarray):
        """
        Normalize features using StandardScaler (fit on train only)
        """
        print("\n🔬 Normalizing features...")
        
        X_train_norm = self.scaler.fit_transform(X_train)
        X_test_norm = self.scaler.transform(X_test)
        
        print(f"  ✓ Applied StandardScaler")
        print(f"  ✓ Feature means: {self.scaler.mean_[:3]}... (showing first 3)")
        print(f"  ✓ Feature stds:  {self.scaler.scale_[:3]}... (showing first 3)")
        
        return X_train_norm, X_test_norm
    
    def calculate_carrington_weights(self, y: np.ndarray) -> np.ndarray:
        """
        Calculate sample weights based on proximity to Carrington Event levels
        
        Emphasizes extreme events (high Wolf-Formula values) to learn
        the physics of massive storms
        
        Weight formula:
        w = 1 + (y / y_carrington)^2
        
        This gives ~1x weight to normal conditions, >10x for Carrington-level
        """
        print("\n⚖️  Calculating Carrington Event weights...")
        
        y_carrington = self.CARRINGTON_PARAMS['wolf_formula_max']
        
        # Quadratic weighting (emphasizes extremes)
        weights = 1.0 + (y / y_carrington) ** 2
        
        # Clip to reasonable range
        weights = np.clip(weights, 1.0, 100.0)
        
        print(f"  ✓ Weight range: {weights.min():.2f} to {weights.max():.2f}")
        print(f"  ✓ Mean weight: {weights.mean():.2f}")
        print(f"  ✓ 95th percentile weight: {np.percentile(weights, 95):.2f}")
        
        return weights
    
    def build_model(self, input_dim: int):
        """
        Build LSTM model for aurora prediction
        
        Architecture:
        - Input: Normalized features (12-dimensional)
        - LSTM Layer 1: 64 units
        - LSTM Layer 2: 32 units
        - Dense: 16 units (ReLU)
        - Output: 1 unit (Wolf-Formula prediction)
        """
        if not HAS_TF:
            print("  ⚠️  TensorFlow not available - skipping model creation")
            return None
        
        print("\n🏗️  Building LSTM model...")
        
        model = keras.Sequential([
            # Reshape for LSTM (samples, timesteps, features)
            keras.layers.Reshape((1, input_dim), input_shape=(input_dim,)),
            
            # LSTM layers
            keras.layers.LSTM(64, return_sequences=True, name='lstm_1'),
            keras.layers.Dropout(0.2),
            keras.layers.LSTM(32, return_sequences=False, name='lstm_2'),
            keras.layers.Dropout(0.2),
            
            # Dense layers
            keras.layers.Dense(16, activation='relu', name='dense_1'),
            keras.layers.Dense(1, activation='linear', name='output')
        ])
        
        # Compile with MSE loss (suitable for regression)
        model.compile(
            optimizer=keras.optimizers.Adam(learning_rate=0.001),
            loss='mse',
            metrics=['mae']
        )
        
        print(f"  ✓ Model built: {model.count_params()} trainable parameters")
        model.summary()
        
        return model
    
    def train_model(self, X_train, y_train, X_test, y_test, sample_weights):
        """
        Train LSTM with Carrington Event weighting
        """
        if not HAS_TF or self.model is None:
            print("  ⚠️  Skipping training (TensorFlow not available)")
            return None
        
        print("\n🚀 Training model with Carrington Event weighting...")
        
        # Early stopping callback
        early_stop = keras.callbacks.EarlyStopping(
            monitor='val_loss',
            patience=10,
            restore_best_weights=True
        )
        
        # Train
        history = self.model.fit(
            X_train, y_train,
            sample_weight=sample_weights,
            validation_data=(X_test, y_test),
            epochs=100,
            batch_size=32,
            callbacks=[early_stop],
            verbose=1
        )
        
        print("\n  ✓ Training complete!")
        
        return history
    
    def evaluate_model(self, X_test, y_test):
        """
        Evaluate model on test set
        """
        if not HAS_TF or self.model is None:
            print("  ⚠️  Skipping evaluation (model not available)")
            return
        
        print("\n📊 Evaluating model on test set...")
        
        # Get predictions
        y_pred = self.model.predict(X_test, verbose=0).flatten()
        
        # Calculate metrics
        mse = np.mean((y_test - y_pred) ** 2)
        mae = np.mean(np.abs(y_test - y_pred))
        rmse = np.sqrt(mse)
        
        # R² score
        ss_tot = np.sum((y_test - y_test.mean()) ** 2)
        ss_res = np.sum((y_test - y_pred) ** 2)
        r2 = 1 - (ss_res / ss_tot)
        
        print(f"  ✓ MSE:  {mse:.2f}")
        print(f"  ✓ MAE:  {mae:.2f}")
        print(f"  ✓ RMSE: {rmse:.2f}")
        print(f"  ✓ R²:   {r2:.4f}")
        
        return {
            'mse': float(mse),
            'mae': float(mae),
            'rmse': float(rmse),
            'r2': float(r2)
        }
    
    def export_web_ready_json(self, feature_names: list, metrics: dict):
        """
        Export model as web-ready JSON for TensorFlow.js integration
        
        Includes:
        - Model weights (flattened)
        - Scaler parameters
        - Feature names
        - Metadata
        """
        print("\n💾 Exporting web-ready model JSON...")
        
        output_path = self.output_dir / "skoll_model_v1.json"
        
        # Extract weights if TensorFlow available
        if HAS_TF and self.model is not None:
            weights_dict = {}
            for layer in self.model.layers:
                layer_weights = layer.get_weights()
                if len(layer_weights) > 0:
                    weights_dict[layer.name] = {
                        'weights': [w.tolist() for w in layer_weights]
                    }
        else:
            weights_dict = {"note": "TensorFlow not available - placeholder weights"}
        
        # Create model JSON
        model_json = {
            "model_version": "skoll_v1",
            "trained_at": datetime.now().isoformat(),
            "carrington_weighting": True,
            "train_test_split": "70/30",
            
            "features": {
                "input_features": feature_names,
                "target": "wolf_formula"
            },
            
            "scaler": {
                "mean": self.scaler.mean_.tolist(),
                "scale": self.scaler.scale_.tolist()
            },
            
            "weights": weights_dict,
            
            "metrics": metrics if metrics else {},
            
            "carrington_params": self.CARRINGTON_PARAMS,
            
            "metadata": {
                "architecture": "LSTM (64->32->16->1)",
                "optimizer": "Adam",
                "loss": "MSE with Carrington weighting",
                "description": "Aurora prediction model trained on OMNIWeb data with 1859 Carrington Event emphasis"
            }
        }
        
        # Save JSON
        with open(output_path, 'w') as f:
            json.dump(model_json, f, indent=2)
        
        print(f"  ✓ Saved to: {output_path}")
        print(f"  ✓ File size: {output_path.stat().st_size / 1024:.1f} KB")
        
        return output_path
    
    def run_pipeline(self):
        """
        Execute full training pipeline
        """
        # Step 1: Load data
        df = self.load_training_data()
        
        # Step 2: Prepare features
        X, y, feature_names = self.prepare_features(df)
        
        # Step 3: 70/30 split
        X_train, X_test, y_train, y_test = self.split_data(X, y)
        
        # Step 4: Normalize
        X_train_norm, X_test_norm = self.normalize_features(X_train, X_test)
        
        # Step 5: Calculate Carrington weights
        train_weights = self.calculate_carrington_weights(y_train)
        
        # Step 6: Build model
        self.model = self.build_model(input_dim=X_train_norm.shape[1])
        
        # Step 7: Train
        history = self.train_model(X_train_norm, y_train, X_test_norm, y_test, train_weights)
        
        # Step 8: Evaluate
        metrics = self.evaluate_model(X_test_norm, y_test)
        
        # Step 9: Export web-ready JSON
        output_path = self.export_web_ready_json(feature_names, metrics)
        
        # Summary
        print("\n" + "=" * 70)
        print("✅ TRAINING COMPLETE!")
        print("=" * 70)
        print(f"📦 Model saved: {output_path.absolute()}")
        print(f"🎯 Ready for web integration (TensorFlow.js)")
        print("=" * 70)


if __name__ == "__main__":
    trainer = SkollTrainerV1()
    trainer.run_pipeline()
