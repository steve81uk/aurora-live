import { X } from 'lucide-react';

interface SkyViewerProps {
  lat: number;
  lon: number;
  locationName: string;
  onClose: () => void;
}

export function SkyViewer({ lat, lon, locationName, onClose }: SkyViewerProps) {
  // Stellarium Web embed URL
  const stellariumUrl = `https://stellarium-web.org/skysource?lat=${lat}&lng=${lon}&elev=0&date=${new Date().toISOString()}&fov=120`;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm pointer-events-auto">
      <div className="relative w-full h-full max-w-7xl max-h-[90vh] m-4 bg-gradient-to-br from-slate-900/95 to-slate-800/95 backdrop-blur-xl border border-cyan-500/30 rounded-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/80 to-transparent p-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-cyan-300">LIVE SKY FEED</h2>
            <p className="text-sm text-cyan-400/80">{locationName} ({lat.toFixed(4)}°, {lon.toFixed(4)}°)</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-red-600/20 hover:bg-red-600/40 border border-red-500/30 rounded-lg transition-all duration-200"
            title="Close Sky Viewer"
          >
            <X className="w-6 h-6 text-red-300" />
          </button>
        </div>

        {/* Stellarium Embed */}
        <iframe
          src={stellariumUrl}
          className="w-full h-full border-none"
          title={`Sky view from ${locationName}`}
          allow="geolocation"
        />

        {/* Footer Instructions */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
          <p className="text-xs text-cyan-400/60 text-center">
            🌟 Drag to look around • Scroll to zoom • Click objects for info
          </p>
        </div>
      </div>
    </div>
  );
}
