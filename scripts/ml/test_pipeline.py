#!/usr/bin/env python3
"""
End-to-end pipeline test - runs both scripts and verifies output
"""
import subprocess
import sys
from pathlib import Path

def run_command(cmd, description):
    """Run a command and report status"""
    print(f"\n{'='*70}")
    print(f"🚀 {description}")
    print(f"{'='*70}")
    result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
    print(result.stdout)
    if result.stderr:
        print(result.stderr)
    return result.returncode == 0

def main():
    print("╔" + "="*68 + "╗")
    print("║" + " "*15 + "SKÖLL-TRACK END-TO-END TEST" + " "*26 + "║")
    print("╚" + "="*68 + "╝")
    
    # Test 1: Process OMNIWeb data
    success1 = run_command(
        "python scripts/data-mining/process_omniweb.py",
        "Step 1: Processing OMNIWeb Data"
    )
    
    # Test 2: Train model
    success2 = run_command(
        "python scripts/ml/train_skoll_v1.py",
        "Step 2: Training ML Model"
    )
    
    # Test 3: Verify outputs
    success3 = run_command(
        "python scripts/ml/verify_pipeline.py",
        "Step 3: Verifying Pipeline"
    )
    
    # Summary
    print(f"\n{'='*70}")
    print("📊 TEST SUMMARY")
    print(f"{'='*70}")
    
    results = [
        ("Data Processing", success1),
        ("Model Training", success2),
        ("Pipeline Verification", success3)
    ]
    
    for name, success in results:
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"  {status} - {name}")
    
    all_passed = all(s for _, s in results)
    
    print(f"{'='*70}")
    if all_passed:
        print("✅ ALL TESTS PASSED - Pipeline fully operational!")
    else:
        print("⚠️  Some tests failed - check output above")
    print(f"{'='*70}\n")
    
    return 0 if all_passed else 1

if __name__ == "__main__":
    sys.exit(main())
