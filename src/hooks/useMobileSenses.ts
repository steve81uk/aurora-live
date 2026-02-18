/**
 * Mobile Wolf-Senses Hook
 * Gyroscope navigation, proximity detection, battery sync
 */

import { useEffect, useState } from 'react';
import { useThree } from '@react-three/fiber';

interface MobileSensesState {
  gyroEnabled: boolean;
  proximityActive: boolean;
  batteryLevel: number;
  isCharging: boolean;
}

export function useMobileSenses() {
  const { camera } = useThree();
  const [state, setState] = useState<MobileSensesState>({
    gyroEnabled: false,
    proximityActive: false,
    batteryLevel: 1.0,
    isCharging: false
  });

  useEffect(() => {
    // === GYROSCOPE NAVIGATION ===
    const handleOrientation = (event: DeviceOrientationEvent) => {
      if (!event.beta || !event.gamma) return;

      // Dead zone to prevent jitter
      const DEAD_ZONE = 5;
      
      let beta = event.beta; // X-axis (tilt forward/back): -180 to 180
      let gamma = event.gamma; // Y-axis (tilt left/right): -90 to 90

      // Apply dead zone
      if (Math.abs(beta) < DEAD_ZONE) beta = 0;
      if (Math.abs(gamma) < DEAD_ZONE) gamma = 0;

      // Map to camera rotation (smoother than direct assignment)
      const targetX = (beta / 90) * (Math.PI / 4); // Max 45° up/down
      const targetY = (gamma / 90) * (Math.PI / 4); // Max 45° left/right

      // Lerp for smoothness
      camera.rotation.x += (targetX - camera.rotation.x) * 0.1;
      camera.rotation.y += (targetY - camera.rotation.y) * 0.1;
    };

    // Request gyroscope permission (iOS 13+)
    const enableGyro = async () => {
      if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
        try {
          const permission = await (DeviceOrientationEvent as any).requestPermission();
          if (permission === 'granted') {
            window.addEventListener('deviceorientation', handleOrientation);
            setState(prev => ({ ...prev, gyroEnabled: true }));
          }
        } catch (error) {
          console.warn('Gyroscope permission denied:', error);
        }
      } else if ('DeviceOrientationEvent' in window) {
        // Android or older iOS
        window.addEventListener('deviceorientation', handleOrientation);
        setState(prev => ({ ...prev, gyroEnabled: true }));
      }
    };

    enableGyro();

    // === PROXIMITY SENSOR (Experimental) ===
    // When phone held to face, trigger high-contrast mode
    if ('ProximitySensor' in window) {
      const proximitySensor = new (window as any).ProximitySensor();
      proximitySensor.addEventListener('reading', () => {
        const isNear = proximitySensor.near;
        setState(prev => ({ ...prev, proximityActive: isNear }));
        
        // Optional: Mute ambient audio when near face
        if (isNear) {
          console.log('Wolf-Helmet mode: ACTIVE');
        }
      });
      proximitySensor.start();
    }

    // === BATTERY API ===
    const updateBattery = async () => {
      if ('getBattery' in navigator) {
        const battery = await (navigator as any).getBattery();
        
        const updateBatteryState = () => {
          setState(prev => ({
            ...prev,
            batteryLevel: battery.level,
            isCharging: battery.charging
          }));
        };

        updateBatteryState();
        battery.addEventListener('levelchange', updateBatteryState);
        battery.addEventListener('chargingchange', updateBatteryState);
      }
    };

    updateBattery();

    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, [camera]);

  return state;
}

/**
 * Request Gyroscope Permission (Call from user interaction)
 */
export async function requestGyroPermission(): Promise<boolean> {
  if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
    try {
      const permission = await (DeviceOrientationEvent as any).requestPermission();
      return permission === 'granted';
    } catch (error) {
      console.error('Gyro permission error:', error);
      return false;
    }
  }
  return true; // Assume granted on Android
}
