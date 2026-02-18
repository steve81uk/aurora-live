

export function QuickNav({ onTravel, planets, cities }: any) {
  // Sample spacecraft for TRACK section
  const spacecraft = [
    { name: 'ISS', label: 'ISS' },
    { name: 'JWST', label: 'JWST' },
    { name: 'Hubble', label: 'Hubble' },
    { name: 'Voyager 1', label: 'Voyager 1' }
  ];

  return (
    <div className="absolute top-20 left-4 z-30 pointer-events-auto obsidian-glass rounded-lg border border-cyan-500/20 p-4 backdrop-blur-lg">
      {/* WARP Section */}
      <div className="mb-4">
        <h3 className="text-xs font-mono text-cyan-400/70 mb-2 tracking-widest">WARP</h3>
        <div className="grid grid-cols-2 gap-2">
          {planets.map((p: any) => (
            <button
              key={p.name}
              onClick={() => onTravel(p.name)}
              className="w-full px-3 py-2 text-xs font-mono text-cyan-400 bg-black/40 hover:bg-cyan-500/20 border border-cyan-500/30 rounded transition-all hover:shadow-[0_0_10px_rgba(6,182,212,0.5)] backdrop-blur-sm"
            >
              {p.name.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* LAND Section */}
      <div className="mb-4">
        <h3 className="text-xs font-mono text-cyan-400/70 mb-2 tracking-widest">LAND</h3>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => onTravel('Earth')}
            className="w-full px-3 py-2 text-xs font-mono text-cyan-400 bg-black/40 hover:bg-cyan-500/20 border border-cyan-500/30 rounded transition-all hover:shadow-[0_0_10px_rgba(6,182,212,0.5)] backdrop-blur-sm"
          >
            EARTH
          </button>
          <button
            onClick={() => onTravel('Moon')}
            className="w-full px-3 py-2 text-xs font-mono text-cyan-400 bg-black/40 hover:bg-cyan-500/20 border border-cyan-500/30 rounded transition-all hover:shadow-[0_0_10px_rgba(6,182,212,0.5)] backdrop-blur-sm"
          >
            MOON
          </button>
          {cities.map((c: any) => (
            <button
              key={c.name}
              onClick={() => onTravel('Earth', c)}
              className="w-full px-3 py-2 text-xs font-mono text-cyan-400 bg-black/40 hover:bg-cyan-500/20 border border-cyan-500/30 rounded transition-all hover:shadow-[0_0_10px_rgba(6,182,212,0.5)] backdrop-blur-sm"
            >
              {c.name.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* TRACK Section */}
      <div>
        <h3 className="text-xs font-mono text-cyan-400/70 mb-2 tracking-widest">TRACK</h3>
        <div className="grid grid-cols-2 gap-2">
          {spacecraft.map((sc) => (
            <button
              key={sc.name}
              onClick={() => onTravel(sc.name)}
              className="w-full px-3 py-2 text-xs font-mono text-cyan-400 bg-black/40 hover:bg-cyan-500/20 border border-cyan-500/30 rounded transition-all hover:shadow-[0_0_10px_rgba(6,182,212,0.5)] backdrop-blur-sm"
            >
              {sc.label.toUpperCase()}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}