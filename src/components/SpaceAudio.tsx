import { useEffect, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

export default function SpaceAudio() {
  const [isMuted, setIsMuted] = useState(true);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [oscillator, setOscillator] = useState<OscillatorNode | null>(null);
  const [gain, setGain] = useState<GainNode | null>(null);

  useEffect(() => {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.value = 60;
    gainNode.gain.value = 0;
    
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    setAudioContext(ctx);
    setOscillator(osc);
    setGain(gainNode);

    return () => {
      try { osc.stop(); } catch (e) {}
      ctx.close();
    };
  }, []);

  const toggle = async () => {
    if (!audioContext || !oscillator || !gain) return;

    if (isMuted) {
      if (audioContext.state === 'suspended') await audioContext.resume();
      try { oscillator.start(); } catch (e) {}
      gain.gain.linearRampToValueAtTime(0.03, audioContext.currentTime + 0.5);
      setIsMuted(false);
    } else {
      gain.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.3);
      setIsMuted(true);
    }
  };

  return (
    <div className="fixed bottom-4 left-4 z-50">
      <button
        onClick={toggle}
        className="bg-black/60 backdrop-blur-md border border-cyan-500/30 hover:border-cyan-500 rounded-lg p-3 transition-all hover:scale-110"
        title={isMuted ? "Enable Audio" : "Disable Audio"}
      >
        {isMuted ? <VolumeX className="w-5 h-5 text-gray-400" /> : <Volume2 className="w-5 h-5 text-cyan-400 animate-pulse" />}
      </button>
    </div>
  );
}