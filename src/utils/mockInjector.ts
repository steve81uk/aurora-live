import { FeatureVector } from '../ml/types';

export const generateXClassMock = (): FeatureVector => ({
  solarWindSpeed: Array(24).fill(1200), // Extreme speed
  solarWindDensity: Array(24).fill(60), // High density
  magneticFieldBt: Array(24).fill(80),  // Strong field
  magneticFieldBz: Array(24).fill(-75), // Deeply Southward
  kpIndex: Array(24).fill(8.5),         // Current high activity
  newellCouplingHistory: Array(24).fill(50000),
  alfvenVelocityHistory: Array(24).fill(200),
  syzygyIndex: 0.9,
  jupiterSaturnAngle: 0.1,
  solarRotationPhase: 0.5,
  solarCyclePhase: 0.8,
  timeOfYear: 0.2
});