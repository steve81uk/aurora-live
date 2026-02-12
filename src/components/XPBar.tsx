import { useGame } from '../context/GameContext';

/**
 * XPBar - Experience points and level display (inline in nav bar)
 */
export default function XPBar() {
  const { xp, level, achievements } = useGame();
  
  const xpInCurrentLevel = xp % 1000;
  const progress = (xpInCurrentLevel / 1000) * 100;
  
  const unlockedCount = achievements.filter(a => a.unlocked).length;
  
  return (
    <div className="bg-black/80 backdrop-blur-md border border-cyan-500/50 rounded-lg p-2 min-w-[180px]">
      {/* Level Display */}
      <div className="flex items-center justify-between mb-1">
        <div className="text-cyan-400 font-bold text-sm">
          LV {level}
        </div>
        <div className="text-cyan-300 text-[10px]">
          {xp.toLocaleString()} XP
        </div>
      </div>
      
      {/* XP Progress Bar */}
      <div className="w-full h-1.5 bg-gray-700 rounded-full overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
      
      <div className="text-gray-400 text-[8px] mt-0.5 text-center">
        {xpInCurrentLevel}/1000 to LV {level + 1}
      </div>
      
      {/* Achievements Count */}
      <div className="mt-1 pt-1 border-t border-cyan-500/30 flex items-center justify-between text-[9px]">
        <span className="text-gray-400">Badges:</span>
        <span className="text-yellow-400 font-bold">
          {unlockedCount}/{achievements.length}
        </span>
      </div>
      
      {/* Recent Badges (show last 3) */}
      {unlockedCount > 0 && (
        <div className="mt-1 flex gap-0.5 justify-center">
          {achievements
            .filter(a => a.unlocked)
            .slice(-3)
            .map(a => (
              <div 
                key={a.id} 
                className="text-base"
                title={`${a.name}: ${a.description}`}
              >
                {a.icon}
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
