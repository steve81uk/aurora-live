#!/usr/bin/env python3
"""
Quick verification script to test the complete SKÖLL-TRACK pipeline
"""
import json
from pathlib import Path

def verify_pipeline():
    print("=" * 70)
    print("SKÖLL-TRACK GEN-2 - PIPELINE VERIFICATION")
    print("=" * 70)
    
    checks = []
    
    # Check 1: Process script exists
    script1 = Path("scripts/data-mining/process_omniweb.py")
    checks.append(("Process script", script1.exists()))
    
    # Check 2: Training script exists
    script2 = Path("scripts/ml/train_skoll_v1.py")
    checks.append(("Training script", script2.exists()))
    
    # Check 3: Input data exists
    data_input = Path("data-mining/historical/omni_data.txt")
    checks.append(("Input data (omni_data.txt)", data_input.exists()))
    
    # Check 4: Processed CSV exists
    data_csv = Path("data-mining/historical/training_set_v1.csv")
    checks.append(("Processed CSV", data_csv.exists()))
    
    # Check 5: Model JSON exists
    model_json = Path("scripts/ml/models/skoll_model_v1.json")
    checks.append(("Model JSON", model_json.exists()))
    
    # Display results
    print("\n📋 FILE CHECKS:")
    for name, status in checks:
        symbol = "✅" if status else "❌"
        print(f"  {symbol} {name}")
    
    # Load and verify model JSON structure
    if model_json.exists():
        print("\n🔍 MODEL JSON STRUCTURE:")
        with open(model_json) as f:
            model_data = json.load(f)
        
        print(f"  ✓ Model version: {model_data.get('model_version')}")
        print(f"  ✓ Train/Test split: {model_data.get('train_test_split')}")
        print(f"  ✓ Carrington weighting: {model_data.get('carrington_weighting')}")
        print(f"  ✓ Input features: {len(model_data['features']['input_features'])}")
        print(f"  ✓ Target: {model_data['features']['target']}")
        
        print("\n📊 CARRINGTON EVENT PARAMETERS:")
        carrington = model_data.get('carrington_params', {})
        print(f"  - Bt max: {carrington.get('bt_max')} nT")
        print(f"  - Bz min: {carrington.get('bz_min')} nT")
        print(f"  - Speed max: {carrington.get('speed_max')} km/s")
        print(f"  - Dst min: {carrington.get('dst_min')} nT")
        print(f"  - Wolf-Formula max: {carrington.get('wolf_formula_max')}")
    
    # Load CSV stats
    if data_csv.exists():
        import pandas as pd
        df = pd.read_csv(data_csv)
        print("\n📈 TRAINING DATA STATS:")
        print(f"  ✓ Records: {len(df)}")
        print(f"  ✓ Features: {len(df.columns)}")
        print(f"  ✓ Wolf-Formula range: {df['wolf_formula'].min():.2f} to {df['wolf_formula'].max():.2f}")
        print(f"  ✓ Wolf-Formula mean: {df['wolf_formula'].mean():.2f}")
    
    # Summary
    all_passed = all(status for _, status in checks)
    print("\n" + "=" * 70)
    if all_passed:
        print("✅ ALL CHECKS PASSED - Pipeline ready!")
    else:
        print("⚠️  Some checks failed - review above")
    print("=" * 70)

if __name__ == "__main__":
    verify_pipeline()
