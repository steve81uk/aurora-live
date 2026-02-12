import { useEffect, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

/**
 * SpaceAudio - Immersive Soundscape
 * HTML5 Audio with autoplay policy compliance
 */
export default function SpaceAudio() {
  const [isMuted, setIsMuted] = useState(false);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [droneOscillator, setDroneOscillator] = useState<OscillatorNode | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Create Audio Context in SUSPENDED state (browser autoplay policy compliant)
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    setAudioContext(ctx);

    // Create deep space drone but don't start yet
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(30, ctx.currentTime); // 30 Hz deep drone
    gainNode.gain.setValueAtTime(0.05, ctx.currentTime); // Very subtle
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    setDroneOscillator(oscillator);

    // Wait for user interaction before starting audio
    const resumeAudio = async () => {
      if (ctx.state === 'suspended') {
        await ctx.resume();
        oscillator.start();
        setIsReady(true);
      }
    };

    // Listen for ANY user interaction
    const handleInteraction = () => {
      resumeAudio();
      // Remove listeners after first interaction
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('keydown', handleInteraction);
      window.removeEventListener('touchstart', handleInteraction);
    };

    window.addEventListener('click', handleInteraction);
    window.addEventListener('keydown', handleInteraction);
    window.addEventListener('touchstart', handleInteraction);

    return () => {
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('keydown', handleInteraction);
      window.removeEventListener('touchstart', handleInteraction);
      if (oscillator) {
        try {
          oscillator.stop();
        } catch (e) {
          // Oscillator may not have started yet
        }
      }
      ctx.close();
    };
  }, []);

  useEffect(() => {
    if (audioContext && droneOscillator && isReady) {
      const gainNode = audioContext.createGain();
      droneOscillator.disconnect();
      droneOscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      gainNode.gain.setValueAtTime(isMuted ? 0 : 0.05, audioContext.currentTime);
    }
  }, [isMuted, audioContext, droneOscillator, isReady]);

  // UI Click Sound
  const playClickSound = () => {
    if (isMuted || !audioContext || !isReady) return;
    
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.1);
    
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
  };

  // Expose click sound globally
  useEffect(() => {
    (window as any).playSpaceClickSound = playClickSound;
  }, [audioContext, isMuted, isReady]);

  return (
    <div className="fixed bottom-4 left-4 z-50">
      <button
        onClick={() => setIsMuted(!isMuted)}
        className="bg-black/60 backdrop-blur-md border border-cyan-500/30 hover:border-cyan-500 rounded-lg p-3 transition-all hover:scale-110"
        title={isMuted ? "Unmute Audio" : "Mute Audio"}
      >
        {isMuted ? (
          <VolumeX className="w-5 h-5 text-gray-400" />
        ) : (
          <Volume2 className="w-5 h-5 text-cyan-400 animate-pulse" />
        )}
      </button>
    </div>
  );
}
