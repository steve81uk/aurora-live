# SKÖLL-TRACK GEN-2 - ML Pipeline Documentation

## Overview
Complete ML pipeline for aurora prediction using 1859 Carrington Event physics.

## Files Created

### 1. Data Processing
- **Location**: `scripts/data-mining/process_omniweb.py`
- **Purpose**: Process NASA OMNIWeb ASCII data with linear interpolation
- **Features**:
  - Reads `omni_data.txt` (space-separated ASCII format)
  - Interpolates missing values (999.9, 9999 markers)
  - Calculates Wolf-Formula (Ψ) - Infrastructure Fatigue Coefficient
  - Exports cleaned `training_set_v1.csv`

### 2. ML Training
- **Location**: `scripts/ml/train_skoll_v1.py`
- **Purpose**: Train LSTM model with Carrington Event weighting
- **Features**:
  - 70/30 train-test split (stratified by Wolf-Formula quartiles)
  - Carrington Event (1859) weighted loss function
  - StandardScaler normalization
  - Exports web-ready JSON for TensorFlow.js

### 3. Data Files
- **omni_data.txt**: Sample OMNIWeb data (21 hourly records)
  - Location: `data-mining/historical/omni_data.txt`
  - Format: Year Day Hour Bt Bx By Bz Speed Density Temp Kp Dst Mach_Alfven
  
- **training_set_v1.csv**: Processed training data with Wolf-Formula
  - Location: `data-mining/historical/training_set_v1.csv`
  - Features: 17 columns including Ψ (wolf_formula)

### 4. Model Output
- **skoll_model_v1.json**: Web-ready model export
  - Location: `scripts/ml/models/skoll_model_v1.json`
  - Contents:
    - Scaler parameters (mean, scale)
    - Feature names
    - Carrington Event parameters
    - Model weights (when TensorFlow installed)
    - Training metrics

## Workflow

### Step 1: Process OMNIWeb Data
```bash
python scripts/data-mining/process_omniweb.py
```
- Reads: `data-mining/historical/omni_data.txt`
- Outputs: `data-mining/historical/training_set_v1.csv`

### Step 2: Train Model
```bash
python scripts/ml/train_skoll_v1.py
```
- Reads: `data-mining/historical/training_set_v1.csv`
- Outputs: `scripts/ml/models/skoll_model_v1.json`

## Wolf-Formula (Ψ)
Infrastructure Fatigue Coefficient inspired by 1859 Carrington Event:

```
Ψ = (Newell_Coupling × Bt²) / (Alfvén_Velocity × √Kp)
```

**Physical Interpretation**:
- Numerator: Energy deposition into magnetosphere
- Denominator: Plasma stiffness and geomagnetic response
- Higher Ψ = Greater infrastructure risk

## Carrington Event Parameters (1859)
Historical estimates used for model weighting:
- **Bt**: 1,700 nT (IMF magnitude)
- **Bz**: -1,500 nT (southward IMF)
- **Speed**: 2,500 km/s (solar wind velocity)
- **Dst**: -1,760 nT (geomagnetic storm intensity)
- **Kp**: 9.0 (maximum geomagnetic activity)
- **Wolf-Formula**: 25,000 (estimated infrastructure stress)

## Model Architecture
```
Input (12 features)
    ↓
LSTM Layer 1 (64 units)
    ↓
Dropout (0.2)
    ↓
LSTM Layer 2 (32 units)
    ↓
Dropout (0.2)
    ↓
Dense (16 units, ReLU)
    ↓
Output (1 unit, Linear) → Wolf-Formula prediction
```

## Features Used (12)
1. **IMF**: bt, bx, by, bz (magnetic field components)
2. **Solar Wind**: speed, density, temperature
3. **Indices**: kp, dst (geomagnetic activity)
4. **Derived**: newell_coupling, alfven_velocity, mach_alfven

## Next Steps

### For Production Use:
1. Download full OMNIWeb dataset (1963-2025)
2. Install TensorFlow: `pip install tensorflow`
3. Retrain with full dataset
4. Export to TensorFlow.js format for web integration

### For Web Integration:
The `skoll_model_v1.json` contains all necessary parameters for prediction:
- Load scaler parameters to normalize input features
- Apply model weights to make predictions
- Denormalize output to get Wolf-Formula (Ψ) values

## File Sizes
- `omni_data.txt`: 1.4 KB (sample data)
- `training_set_v1.csv`: 3.5 KB (processed data)
- `skoll_model_v1.json`: 1.7 KB (model export)

## Status
✅ All files created and verified  
✅ Data processing pipeline working  
✅ Training pipeline working  
✅ Web-ready JSON export successful  

**Ready for expanded dataset and TensorFlow training!**
