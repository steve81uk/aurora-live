#!/usr/bin/env python3
"""
SKÖLL-TRACK GEN-2 - OMNIWEB DATA PROCESSOR
Processes NASA OMNIWeb ASCII data with linear interpolation and Wolf-Formula calculation

Reads: omni_data.txt (ASCII format from OMNIWeb)
Outputs: training_set_v1.csv (cleaned data with Ψ column)

Missing value markers (replaced via linear interpolation):
- 999.9 (missing IMF/plasma data)
- 9999 (missing indices)

Wolf-Formula (Ψ): Infrastructure Fatigue Coefficient
Ψ = (Newell Coupling × Bt²) / (Alfvén Velocity × √Kp)

@author steve81uk (Systems Architect)
"""

import pandas as pd
import numpy as np
from pathlib import Path
from datetime import datetime


class OmniWebProcessor:
    """Process OMNIWeb ASCII data with physics-based feature engineering"""
    
    # NASA OMNIWeb missing value markers
    MISSING_MARKERS = [999.9, 9999, 9999.0, 99999, 99999.0]
    
    # Physical constants
    MU0 = 1.256637e-6  # Vacuum permeability (H/m)
    PROTON_MASS = 1.67e-27  # kg
    
    def __init__(self, input_file: str = "data-mining/historical/omni_data.txt"):
        self.input_file = Path(input_file)
        self.output_file = Path("data-mining/historical/training_set_v1.csv")
        self.df = None
        
    def load_omni_ascii(self) -> pd.DataFrame:
        """
        Load OMNIWeb ASCII format data
        
        Expected columns (space-separated):
        Year Day Hour Bt Bx By Bz V n T Kp Dst Mach_Alfven
        """
        print(f"📖 Reading OMNIWeb data from: {self.input_file}")
        
        if not self.input_file.exists():
            raise FileNotFoundError(
                f"OMNIWeb data file not found: {self.input_file}\n"
                f"Download from: https://omniweb.gsfc.nasa.gov/form/dx1.html\n"
                f"Select: OMNI2 hourly, Parameters: Bt, Bx, By, Bz, V, n, T, Kp, Dst"
            )
        
        # Read space-separated ASCII file
        # OMNIWeb format varies, but typically space-delimited
        try:
            df = pd.read_csv(
                self.input_file,
                delim_whitespace=True,
                names=[
                    'year', 'day', 'hour',
                    'bt', 'bx', 'by', 'bz',
                    'speed', 'density', 'temperature',
                    'kp', 'dst', 'mach_alfven'
                ],
                header=None,
                comment='#'
            )
            
            print(f"  ✓ Loaded {len(df)} records")
            return df
            
        except Exception as e:
            print(f"  ✗ Error loading file: {e}")
            raise
    
    def create_timestamp(self, row) -> datetime:
        """Convert Year/Day/Hour to timestamp"""
        try:
            # Day of year to datetime
            year = int(row['year'])
            day = int(row['day'])
            hour = int(row['hour'])
            
            dt = datetime(year, 1, 1) + pd.Timedelta(days=day-1, hours=hour)
            return dt
        except:
            return pd.NaT
    
    def interpolate_missing_values(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Linear interpolation for missing values (999.9, 9999)
        
        Strategy:
        1. Replace all missing markers with NaN
        2. Use pandas interpolate with linear method
        3. Forward-fill edges if needed
        """
        print("🔧 Interpolating missing values...")
        
        # Columns that need interpolation
        physics_columns = ['bt', 'bx', 'by', 'bz', 'speed', 'density', 
                          'temperature', 'kp', 'dst', 'mach_alfven']
        
        missing_counts = {}
        
        for col in physics_columns:
            if col not in df.columns:
                continue
                
            # Count missing before
            missing_mask = df[col].isin(self.MISSING_MARKERS)
            missing_count = missing_mask.sum()
            missing_counts[col] = missing_count
            
            if missing_count > 0:
                # Replace markers with NaN
                df.loc[missing_mask, col] = np.nan
                
                # Linear interpolation
                df[col] = df[col].interpolate(method='linear', limit_direction='both')
                
                # Forward/backward fill any remaining NaN at edges
                df[col] = df[col].fillna(method='ffill').fillna(method='bfill')
        
        # Report interpolation results
        total_interpolated = sum(missing_counts.values())
        print(f"  ✓ Interpolated {total_interpolated} missing values across {len(missing_counts)} columns")
        
        for col, count in missing_counts.items():
            if count > 0:
                print(f"    - {col}: {count} values")
        
        return df
    
    def calculate_newell_coupling(self, row) -> float:
        """
        Newell Coupling Function - Energy transfer from solar wind to magnetosphere
        
        Formula: dΦ/dt = v^(4/3) × Bt^(2/3) × sin^4(θ/2)
        
        Where θ is the IMF clock angle (approximated from Bz/Bt ratio)
        """
        try:
            v = row['speed']
            bt = row['bt']
            bz = row['bz']
            
            # Clock angle approximation
            theta = np.arctan2(abs(bz), bt + 0.001)
            sin_half_theta = np.sin(theta / 2)
            
            # Newell coupling in arbitrary units (scales with energy transfer)
            newell = (v ** (4/3)) * (bt ** (2/3)) * (sin_half_theta ** 4)
            
            return newell
            
        except:
            return 0.0
    
    def calculate_alfven_velocity(self, row) -> float:
        """
        Alfvén Velocity - Speed of MHD waves in solar wind plasma
        
        Formula: v_A = B / √(μ₀ × ρ)
        
        Where:
        - B = magnetic field strength (T)
        - ρ = mass density (kg/m³)
        - μ₀ = vacuum permeability
        """
        try:
            bt = row['bt'] * 1e-9  # nT to Tesla
            n = row['density'] * 1e6  # particles/cm³ to particles/m³
            
            # Mass density (assume pure protons)
            rho = n * self.PROTON_MASS  # kg/m³
            
            if rho > 0:
                v_alfven = bt / np.sqrt(self.MU0 * rho) / 1000  # m/s to km/s
                return v_alfven
            else:
                return 0.0
                
        except:
            return 0.0
    
    def calculate_wolf_formula(self, row) -> float:
        """
        Wolf-Formula (Ψ) - Infrastructure Fatigue Coefficient
        
        Carrington Event (1859) inspired metric for power grid stress
        
        Formula: Ψ = (Newell × Bt²) / (v_A × √Kp)
        
        Physical interpretation:
        - Numerator: Energy deposition into magnetosphere
        - Denominator: Plasma stiffness and geomagnetic response
        
        Higher Ψ = Greater infrastructure risk
        """
        try:
            newell = row['newell_coupling']
            bt = row['bt']
            v_alfven = row['alfven_velocity']
            kp = row['kp']
            
            # Avoid division by zero
            if v_alfven > 0 and kp > 0:
                psi = (newell * bt * bt) / (v_alfven * np.sqrt(kp))
            else:
                psi = newell  # Fallback to Newell if incomplete
            
            return psi
            
        except:
            return 0.0
    
    def engineer_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """Add derived physics features and Wolf-Formula"""
        print("⚗️  Engineering physics features...")
        
        # Create timestamp column
        df['timestamp'] = df.apply(self.create_timestamp, axis=1)
        
        # Newell Coupling (energy transfer)
        df['newell_coupling'] = df.apply(self.calculate_newell_coupling, axis=1)
        
        # Alfvén Velocity (plasma wave speed)
        df['alfven_velocity'] = df.apply(self.calculate_alfven_velocity, axis=1)
        
        # Wolf-Formula (Ψ - Infrastructure Fatigue)
        df['wolf_formula'] = df.apply(self.calculate_wolf_formula, axis=1)
        
        print(f"  ✓ Added: newell_coupling, alfven_velocity, wolf_formula (Ψ)")
        
        return df
    
    def export_training_set(self, df: pd.DataFrame):
        """Export cleaned CSV for ML training"""
        print(f"💾 Exporting training set to: {self.output_file}")
        
        # Ensure output directory exists
        self.output_file.parent.mkdir(parents=True, exist_ok=True)
        
        # Select and order columns for training
        output_columns = [
            'timestamp',
            'year', 'day', 'hour',
            'bt', 'bx', 'by', 'bz',
            'speed', 'density', 'temperature',
            'kp', 'dst',
            'newell_coupling',
            'alfven_velocity',
            'mach_alfven',
            'wolf_formula'
        ]
        
        # Only keep columns that exist
        available_columns = [col for col in output_columns if col in df.columns]
        
        df_export = df[available_columns].copy()
        
        # Save to CSV
        df_export.to_csv(self.output_file, index=False, float_format='%.6f')
        
        print(f"  ✓ Exported {len(df_export)} records with {len(available_columns)} features")
        print(f"  ✓ Wolf-Formula (Ψ) column included for Carrington-level storm detection")
    
    def run_pipeline(self):
        """Execute full processing pipeline"""
        print("=" * 70)
        print("SKÖLL-TRACK GEN-2 - OMNIWEB DATA PROCESSOR")
        print("=" * 70)
        
        # Step 1: Load raw OMNIWeb data
        df = self.load_omni_ascii()
        
        # Step 2: Interpolate missing values (999.9, 9999)
        df = self.interpolate_missing_values(df)
        
        # Step 3: Engineer physics features + Wolf-Formula
        df = self.engineer_features(df)
        
        # Step 4: Export cleaned training set
        self.export_training_set(df)
        
        # Summary statistics
        print("\n" + "=" * 70)
        print("SUMMARY STATISTICS")
        print("=" * 70)
        print(f"Time Range: {df['timestamp'].min()} to {df['timestamp'].max()}")
        print(f"Total Records: {len(df):,}")
        print(f"\nWolf-Formula (Ψ) Statistics:")
        print(f"  Mean: {df['wolf_formula'].mean():.2f}")
        print(f"  Std:  {df['wolf_formula'].std():.2f}")
        print(f"  Max:  {df['wolf_formula'].max():.2f} (Carrington-level indicator)")
        print(f"  95th Percentile: {df['wolf_formula'].quantile(0.95):.2f}")
        print("=" * 70)
        print("✅ Processing complete! Ready for ML training.")
        print(f"📦 Training data: {self.output_file.absolute()}")


if __name__ == "__main__":
    processor = OmniWebProcessor()
    processor.run_pipeline()
    
    print("\n" + "=" * 70)
    print("NEXT STEP:")
    print("  python src/ml/train_skoll_v1.py")
    print("=" * 70)
