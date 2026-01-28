import type { ViewingRecommendation } from '../utils/predictions';

interface RecommendationDisplayProps {
  recommendation: ViewingRecommendation;
}

export function RecommendationDisplay({ recommendation }: RecommendationDisplayProps) {
  const getRatingColor = () => {
    switch (recommendation.rating) {
      case 'EXCEPTIONAL': return 'from-purple-500 to-pink-500';
      case 'EXCELLENT': return 'from-green-500 to-emerald-500';
      case 'GOOD': return 'from-blue-500 to-cyan-500';
      case 'FAIR': return 'from-yellow-500 to-orange-500';
      case 'POOR': return 'from-gray-500 to-gray-600';
    }
  };

  const getRatingIcon = () => {
    switch (recommendation.rating) {
      case 'EXCEPTIONAL': return '🌟';
      case 'EXCELLENT': return '✨';
      case 'GOOD': return '👍';
      case 'FAIR': return '🤔';
      case 'POOR': return '😴';
    }
  };

  return (
    <div className="space-y-4">
      {/* Score Card */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-black/80 to-black/60 border border-white/20 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-sm text-gray-400 mb-1">VIEWING SCORE</div>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-black text-white">{recommendation.score}</span>
              <span className="text-2xl text-gray-500">/100</span>
            </div>
          </div>
          <div className={`px-6 py-3 rounded-xl bg-gradient-to-r ${getRatingColor()} shadow-lg`}>
            <div className="text-center">
              <div className="text-3xl mb-1">{getRatingIcon()}</div>
              <div className="text-sm font-black text-white">{recommendation.rating}</div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-3 bg-black/60 rounded-full overflow-hidden">
          <div
            className={`h-full bg-gradient-to-r ${getRatingColor()} transition-all duration-1000`}
            style={{ width: `${recommendation.score}%` }}
          />
        </div>

        {/* Confidence */}
        <div className="mt-3 text-xs text-gray-400">
          Confidence: {recommendation.confidence}%
        </div>
      </div>

      {/* Best Time */}
      <div className="bg-black/60 border border-cyan-400/30 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></div>
          <div className="text-xs text-gray-400">OPTIMAL VIEWING TIME</div>
        </div>
        <div className="text-xl font-bold text-cyan-400">{recommendation.bestTime}</div>
      </div>

      {/* Reasons */}
      <div className="space-y-2">
        <div className="text-xs text-gray-400 font-bold">ANALYSIS FACTORS</div>
        {recommendation.reasons.map((reason, idx) => (
          <div
            key={idx}
            className="flex items-start gap-3 p-3 bg-black/40 border border-white/10 rounded-lg text-sm text-gray-300"
          >
            <span className="flex-1">{reason}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
