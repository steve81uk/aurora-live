import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

interface GameState {
  xp: number;
  level: number;
  visitedBodies: Set<string>;
  unlockedBadges: string[];
  achievements: Achievement[];
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  xp: number;
  icon: string;
  unlocked: boolean;
}

interface GameContextType extends GameState {
  addXP: (amount: number, reason?: string) => void;
  visitBody: (bodyName: string) => void;
  unlockAchievement: (id: string) => void;
  checkAchievements: (data: any) => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

const ACHIEVEMENTS: Achievement[] = [
  { id: 'first_planet', name: 'Explorer', description: 'Visit your first planet', xp: 50, icon: '🚀', unlocked: false },
  { id: 'all_planets', name: 'Solar Navigator', description: 'Visit all 8 planets', xp: 500, icon: '🌌', unlocked: false },
  { id: 'tesla_found', name: 'Starman Fan', description: 'Find the Tesla Roadster', xp: 500, icon: '🚗', unlocked: false },
  { id: 'ufo_found', name: 'First Contact', description: 'Discover the hidden UFO', xp: 1000, icon: '👽', unlocked: false },
  { id: 'aurora_hunter', name: 'Aurora Hunter', description: 'View Earth during Kp > 5', xp: 100, icon: '🌠', unlocked: false },
  { id: 'moon_visit', name: 'Lunar Explorer', description: 'Visit the Moon', xp: 100, icon: '🌙', unlocked: false },
  { id: 'space_madness', name: 'Space Madness', description: 'Spin camera 360° rapidly 5 times', xp: 250, icon: '🤪', unlocked: false },
  { id: 'time_traveler', name: 'Time Traveler', description: 'Use time controls', xp: 150, icon: '⏰', unlocked: false },
  { id: 'board_iss', name: 'Astronaut', description: 'Board the ISS', xp: 200, icon: '🛰️', unlocked: false },
  { id: 'surface_landing', name: 'Ground Control', description: 'Land on a planetary surface', xp: 300, icon: '🏔️', unlocked: false },
];

export function GameProvider({ children }: { children: ReactNode }) {
  const [gameState, setGameState] = useState<GameState>(() => {
    // Load from localStorage
    const saved = localStorage.getItem('aurora-live-game-state');
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        ...parsed,
        visitedBodies: new Set(parsed.visitedBodies || []),
        achievements: ACHIEVEMENTS.map(a => ({
          ...a,
          unlocked: parsed.unlockedBadges?.includes(a.id) || false
        }))
      };
    }
    
    return {
      xp: 0,
      level: 1,
      visitedBodies: new Set<string>(),
      unlockedBadges: [],
      achievements: ACHIEVEMENTS,
    };
  });

  // Save to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('aurora-live-game-state', JSON.stringify({
      xp: gameState.xp,
      level: gameState.level,
      visitedBodies: Array.from(gameState.visitedBodies),
      unlockedBadges: gameState.unlockedBadges,
    }));
  }, [gameState]);

  // Calculate level from XP
  useEffect(() => {
    const newLevel = Math.floor(gameState.xp / 1000) + 1;
    if (newLevel !== gameState.level) {
      setGameState(prev => ({ ...prev, level: newLevel }));
      showNotification(`🎉 LEVEL UP! You are now Level ${newLevel}!`, 'success');
    }
  }, [gameState.xp, gameState.level]);

  const addXP = (amount: number, reason?: string) => {
    setGameState(prev => ({ ...prev, xp: prev.xp + amount }));
    if (reason) {
      showNotification(`+${amount} XP: ${reason}`, 'info');
    }
  };

  const visitBody = (bodyName: string) => {
    setGameState(prev => {
      if (prev.visitedBodies.has(bodyName)) return prev; // Already visited
      
      const newVisited = new Set(prev.visitedBodies);
      newVisited.add(bodyName);
      
      // Award XP
      addXP(50, `Visited ${bodyName}`);
      
      // Check achievements
      if (newVisited.size === 1) {
        unlockAchievement('first_planet');
      }
      
      const planets = ['Mercury', 'Venus', 'Earth', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune'];
      if (planets.every(p => newVisited.has(p))) {
        unlockAchievement('all_planets');
      }
      
      if (bodyName === 'Moon') unlockAchievement('moon_visit');
      if (bodyName === 'Tesla Roadster' || bodyName === 'Starman') unlockAchievement('tesla_found');
      if (bodyName === 'UFO') unlockAchievement('ufo_found');
      
      return { ...prev, visitedBodies: newVisited };
    });
  };

  const unlockAchievement = (id: string) => {
    setGameState(prev => {
      if (prev.unlockedBadges.includes(id)) return prev; // Already unlocked
      
      const achievement = ACHIEVEMENTS.find(a => a.id === id);
      if (!achievement) return prev;
      
      const newBadges = [...prev.unlockedBadges, id];
      const newAchievements = prev.achievements.map(a => 
        a.id === id ? { ...a, unlocked: true } : a
      );
      
      addXP(achievement.xp, `Achievement: ${achievement.name}`);
      showNotification(`🏆 ${achievement.icon} ${achievement.name}: ${achievement.description}`, 'achievement');
      
      return {
        ...prev,
        unlockedBadges: newBadges,
        achievements: newAchievements,
      };
    });
  };

  const checkAchievements = (data: any) => {
    // Check for aurora hunter
    if (data.kpValue > 5 && data.focusedBody === 'Earth') {
      unlockAchievement('aurora_hunter');
    }
    
    // Check for boarding
    if (data.boardedVehicle === 'ISS') {
      unlockAchievement('board_iss');
    }
    
    // Check for surface mode
    if (data.surfaceMode) {
      unlockAchievement('surface_landing');
    }
  };

  return (
    <GameContext.Provider value={{
      ...gameState,
      addXP,
      visitBody,
      unlockAchievement,
      checkAchievements,
    }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) throw new Error('useGame must be used within GameProvider');
  return context;
}

// Notification system
function showNotification(message: string, type: 'info' | 'success' | 'achievement') {
  const colors = {
    info: 'bg-cyan-500',
    success: 'bg-green-500',
    achievement: 'bg-yellow-500',
  };
  
  const notification = document.createElement('div');
  notification.className = `fixed top-20 right-4 z-[9999] ${colors[type]} text-white px-4 py-3 rounded-lg shadow-lg font-mono text-sm animate-slide-in-right max-w-xs`;
  notification.textContent = message;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.classList.add('animate-fade-out');
    setTimeout(() => notification.remove(), 500);
  }, 3000);
}
