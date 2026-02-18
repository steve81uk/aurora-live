/**
 * useAlerts Hook - Smart Notification System
 * Explains aurora alerts with context
 */

import { useState, useEffect } from 'react';

interface AlertConditions {
  kp: number;
  bz: number;
  cloudCover: number;
  isDark: boolean;
}

interface Alert {
  level: 'G1' | 'G2' | 'G3' | 'G4' | 'G5';
  message: string;
  explanation: string;
  timestamp: Date;
}

export function useAlerts() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [lastAlertTime, setLastAlertTime] = useState<number>(0);

  // Cooldown period (30 minutes)
  const COOLDOWN_MS = 30 * 60 * 1000;

  /**
   * Explain why an alert was triggered
   */
  const explainAlert = (conditions: AlertConditions): string => {
    const { kp, bz, cloudCover, isDark } = conditions;
    
    const parts: string[] = [];
    
    // Kp explanation
    if (kp >= 7) {
      parts.push(`🔴 KP ${kp.toFixed(1)} (SEVERE STORM)`);
    } else if (kp >= 5) {
      parts.push(`🟠 KP ${kp.toFixed(1)} (STRONG STORM)`);
    } else if (kp >= 3) {
      parts.push(`🟡 KP ${kp.toFixed(1)} (ACTIVE)`);
    } else {
      parts.push(`🟢 KP ${kp.toFixed(1)} (QUIET)`);
    }
    
    // Bz explanation (southward = good for aurora)
    if (bz < -10) {
      parts.push(`⬇️ Bz ${bz.toFixed(1)} nT (VERY FAVORABLE)`);
    } else if (bz < -5) {
      parts.push(`⬇️ Bz ${bz.toFixed(1)} nT (FAVORABLE)`);
    } else if (bz < 0) {
      parts.push(`↘️ Bz ${bz.toFixed(1)} nT (SLIGHTLY FAVORABLE)`);
    } else {
      parts.push(`⬆️ Bz ${bz.toFixed(1)} nT (UNFAVORABLE)`);
    }
    
    // Cloud cover
    if (cloudCover < 20) {
      parts.push('☀️ CLEAR SKIES');
    } else if (cloudCover < 50) {
      parts.push('⛅ PARTLY CLOUDY');
    } else if (cloudCover < 80) {
      parts.push('☁️ MOSTLY CLOUDY');
    } else {
      parts.push('🌧️ OVERCAST');
    }
    
    // Darkness
    if (isDark) {
      parts.push('🌙 DARK SKIES');
    } else {
      parts.push('☀️ DAYLIGHT');
    }
    
    return parts.join(' + ');
  };

  /**
   * Check if alert should be triggered
   */
  const checkAlert = (conditions: AlertConditions): void => {
    const { kp, cloudCover, isDark } = conditions;
    const now = Date.now();
    
    // Cooldown check (except for G3+ which bypass quiet hours)
    if (now - lastAlertTime < COOLDOWN_MS && kp < 5) {
      return;
    }
    
    // Quiet hours check (23:00 - 07:00)
    const hour = new Date().getHours();
    const isQuietHours = hour >= 23 || hour < 7;
    
    // Only G3+ (Kp 7+) can bypass quiet hours
    if (isQuietHours && kp < 7) {
      return;
    }
    
    // Main alert condition: Kp threshold + visibility
    const shouldAlert = kp >= 3 && cloudCover < 50 && isDark;
    
    if (!shouldAlert) {
      return;
    }
    
    // Determine alert level
    let level: Alert['level'];
    if (kp >= 9) level = 'G5';
    else if (kp >= 8) level = 'G4';
    else if (kp >= 7) level = 'G3';
    else if (kp >= 6) level = 'G2';
    else level = 'G1';
    
    // Create alert
    const alert: Alert = {
      level,
      message: `${level} Geomagnetic Storm`,
      explanation: explainAlert(conditions),
      timestamp: new Date()
    };
    
    // Add to alerts
    setAlerts(prev => [alert, ...prev].slice(0, 10)); // Keep last 10
    setLastAlertTime(now);
    
    // Trigger notification (browser/mobile)
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(`${alert.level} Aurora Alert`, {
        body: alert.explanation,
        icon: '/wolf-icon.png',
        tag: 'aurora-alert'
      });
    }
    
    // Haptic feedback (mobile) - separate from notification
    if ('vibrate' in navigator) {
      if (kp >= 7) {
        navigator.vibrate([200, 100, 200, 100, 200]); // Strong pattern
      } else {
        navigator.vibrate(100); // Single pulse
      }
    }
  };

  /**
   * Request notification permission
   */
  const requestPermission = async (): Promise<boolean> => {
    if (!('Notification' in window)) {
      return false;
    }
    
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  };

  return {
    alerts,
    checkAlert,
    explainAlert,
    requestPermission
  };
}
