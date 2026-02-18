/**
 * Time Converter Utility
 * Converts NOAA UTC timestamps to local time strings
 */

export interface TimeConversion {
  utc: Date;
  local: Date;
  localString: string;
  timeAgo: string;
  isRecent: boolean; // within last 24 hours
}

/**
 * Convert UTC ISO string to local time with detailed info
 */
export function convertUTCToLocal(utcString: string): TimeConversion {
  const utc = new Date(utcString);
  const local = new Date(utc.toLocaleString());
  
  const localString = local.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
  
  const timeAgo = getTimeAgo(utc);
  const isRecent = Date.now() - utc.getTime() < 24 * 60 * 60 * 1000;
  
  return {
    utc,
    local,
    localString,
    timeAgo,
    isRecent
  };
}

/**
 * Get human-readable "time ago" string
 */
export function getTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  
  if (seconds < 60) return `${seconds}s ago`;
  
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks}w ago`;
  
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

/**
 * Format date for display in different contexts
 */
export function formatForContext(date: Date, context: 'full' | 'short' | 'time-only' | 'date-only'): string {
  switch (context) {
    case 'full':
      return date.toLocaleString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    case 'short':
      return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    case 'time-only':
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    case 'date-only':
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    default:
      return date.toLocaleString();
  }
}

/**
 * Check if event is currently active (within time window)
 */
export function isEventActive(startTime: string, durationHours: number = 24): boolean {
  const start = new Date(startTime).getTime();
  const now = Date.now();
  const end = start + (durationHours * 60 * 60 * 1000);
  
  return now >= start && now <= end;
}

/**
 * Get severity color based on time elapsed
 */
export function getSeverityColor(timestamp: string): string {
  const hours = (Date.now() - new Date(timestamp).getTime()) / (1000 * 60 * 60);
  
  if (hours < 1) return '#ff4444'; // Red (very recent)
  if (hours < 6) return '#ff9500'; // Orange
  if (hours < 24) return '#ffd700'; // Yellow
  return '#00ff88'; // Cyan (older)
}
