import { useState, useEffect } from 'react';

/**
 * Hook for managing time simulation with real-time updates and time travel
 * @param initialDate - Starting date (defaults to now)
 * @param speed - Time multiplier (1 = real-time, 0 = paused)
 * @returns Object with currentDate, setDate, speed controls
 */
export function useTimeSimulation(initialDate: Date = new Date(), speed: number = 1) {
  const [currentDate, setCurrentDate] = useState(initialDate);
  const [isPlaying, setIsPlaying] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState(speed);

  // Real-time clock that advances currentDate
  useEffect(() => {
    if (!isPlaying || playbackSpeed === 0) return;

    const interval = setInterval(() => {
      setCurrentDate(prevDate => {
        const newDate = new Date(prevDate);
        newDate.setSeconds(newDate.getSeconds() + playbackSpeed);
        return newDate;
      });
    }, 1000); // Update every second

    return () => clearInterval(interval);
  }, [isPlaying, playbackSpeed]);

  const jumpTo = (date: Date) => {
    setCurrentDate(date);
  };

  const jumpToNow = () => {
    setCurrentDate(new Date());
  };

  const skipHours = (hours: number) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setHours(newDate.getHours() + hours);
      return newDate;
    });
  };

  const skipDays = (days: number) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setDate(newDate.getDate() + days);
      return newDate;
    });
  };

  return {
    currentDate,
    setCurrentDate,
    isPlaying,
    setIsPlaying,
    playbackSpeed,
    setPlaybackSpeed,
    jumpTo,
    jumpToNow,
    skipHours,
    skipDays,
  };
}
