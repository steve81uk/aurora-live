/**
 * Browser Notification System
 * Sends push notifications for space weather alerts
 */

import { useEffect, useState } from 'react';
import { useLiveSpaceWeather } from '../hooks/useLiveSpaceWeather';
import { Bell, BellOff } from 'lucide-react';

export function NotificationSystem() {
  const { data } = useLiveSpaceWeather();
  const [enabled, setEnabled] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [lastNotifiedKp, setLastNotifiedKp] = useState(0);
  
  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);
  
  // Request permission
  async function requestPermission() {
    if (!('Notification' in window)) {
      alert('This browser does not support notifications');
      return;
    }
    
    const result = await Notification.requestPermission();
    setPermission(result);
    
    if (result === 'granted') {
      setEnabled(true);
      new Notification('Aurora Live Notifications', {
        body: 'You will now receive alerts for Kp > 5 storms!',
        icon: '/favicon.ico',
        tag: 'aurora-welcome'
      });
    }
  }
  
  // Send notifications for significant events
  useEffect(() => {
    if (!enabled || !data || permission !== 'granted') return;
    
    const kp = data.kpIndex;
    
    // Notify for Kp > 5 (geomagnetic storm)
    if (kp >= 5 && lastNotifiedKp < 5) {
      new Notification('⚠️ Geomagnetic Storm Alert!', {
        body: `KP Index: ${kp.toFixed(1)} - Aurora may be visible at lower latitudes!`,
        icon: '/favicon.ico',
        tag: 'aurora-storm',
        requireInteraction: true
      });
      
      setLastNotifiedKp(kp);
      
      // Play alert sound
      const audio = new Audio('/alert.mp3');
      audio.volume = 0.5;
      audio.play().catch(e => console.log('Audio playback failed:', e));
    }
    
    // Notify for X-class solar flares
    if (data.solar.xrayFlux.startsWith('X')) {
      new Notification('☀️ X-Class Solar Flare Detected!', {
        body: `Current: ${data.solar.xrayFlux} - Potential radio blackouts and aurora activity`,
        icon: '/favicon.ico',
        tag: 'solar-flare'
      });
    }
    
    // Notify for new alerts
    if (data.alerts.length > 0) {
      data.alerts.forEach(alert => {
        if (alert.severity === 'warning' || alert.severity === 'alert') {
          new Notification(`🚨 Space Weather ${alert.type.toUpperCase()}`, {
            body: alert.message.slice(0, 100),
            icon: '/favicon.ico',
            tag: `alert-${alert.id}`
          });
        }
      });
    }
    
  }, [data, enabled, permission, lastNotifiedKp]);
  
  return (
    <button
      onClick={() => enabled ? setEnabled(false) : requestPermission()}
      className={`fixed bottom-4 right-4 p-3 rounded-full shadow-lg transition-all z-50 ${
        enabled 
          ? 'bg-cyan-600 hover:bg-cyan-500 text-white' 
          : 'bg-gray-800 hover:bg-gray-700 text-gray-400'
      }`}
      title={enabled ? 'Notifications enabled' : 'Enable notifications'}
    >
      {enabled ? <Bell className="w-5 h-5 animate-pulse" /> : <BellOff className="w-5 h-5" />}
    </button>
  );
}
