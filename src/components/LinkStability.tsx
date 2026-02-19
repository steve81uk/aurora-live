<div className="flex items-center gap-2 px-3 py-1 bg-cyan-500/10 border border-cyan-500/30 rounded-full">
  <div className={`w-2 h-2 rounded-full ${modelLoaded ? 'bg-cyan-400 animate-pulse shadow-[0_0_8px_#00ffff]' : 'bg-red-500'}`} />
  <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-tighter">
    {modelLoaded ? 'Neural Brain: Active' : 'Neural Brain: Offline'}
  </span>
</div>