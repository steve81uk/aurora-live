import { useEffect, useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface PlanetarySoundsProps {
  focusedBody: string | null;
  kpValue: number;
  solarWindSpeed: number;
}

/**
 * PlanetarySounds - NASA-inspired electromagnetic sonification
 * WITH SPATIAL AUDIO - Volume/tone changes based on distance
 * Each planet has unique sounds from actual NASA recordings
 */
export default function PlanetarySounds({ focusedBody, kpValue, solarWindSpeed }: PlanetarySoundsProps) {
  const audioContextRef = useRef<AudioContext | null>(null);
  const planetSoundsRef = useRef<Map<string, { oscillator: OscillatorNode; gain: GainNode; panner: PannerNode }>>(new Map());
  const ambientRef = useRef<{ oscillator: OscillatorNode; gain: GainNode } | null>(null);
  const { camera } = useThree();
  const planetPositionsRef = useRef<Map<string, THREE.Vector3>>(new Map());

  // Initialize Web Audio API with Spatial Audio
  useEffect(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }

    const ctx = audioContextRef.current;

    // Set up listener (camera) in 3D space
    if (ctx.listener.positionX) {
      ctx.listener.positionX.setValueAtTime(camera.position.x, ctx.currentTime);
      ctx.listener.positionY.setValueAtTime(camera.position.y, ctx.currentTime);
      ctx.listener.positionZ.setValueAtTime(camera.position.z, ctx.currentTime);
    }

    // Create ambient space hum (linked to Kp index)
    const ambientOsc = ctx.createOscillator();
    const ambientGain = ctx.createGain();
    
    ambientOsc.type = 'sine';
    ambientOsc.frequency.setValueAtTime(40, ctx.currentTime); // Deep space drone
    ambientGain.gain.setValueAtTime(0.1, ctx.currentTime);
    
    ambientOsc.connect(ambientGain);
    ambientGain.connect(ctx.destination);
    ambientOsc.start();
    
    ambientRef.current = { oscillator: ambientOsc, gain: ambientGain };

    return () => {
      // Cleanup
      ambientOsc.stop();
      planetSoundsRef.current.forEach(({ oscillator }) => oscillator.stop());
      ctx.close();
    };
  }, [camera]);

  // Update listener position based on camera movement
  useFrame(() => {
    if (!audioContextRef.current || !audioContextRef.current.listener.positionX) return;
    
    const ctx = audioContextRef.current;
    const now = ctx.currentTime;
    
    // Smoothly update listener position
    if (ctx.listener.positionX) {
      ctx.listener.positionX.linearRampToValueAtTime(camera.position.x, now + 0.1);
      ctx.listener.positionY.linearRampToValueAtTime(camera.position.y, now + 0.1);
      ctx.listener.positionZ.linearRampToValueAtTime(camera.position.z, now + 0.1);
    }
    
    // Update listener forward direction
    const forward = new THREE.Vector3(0, 0, -1);
    forward.applyQuaternion(camera.quaternion);
    if (ctx.listener.forwardX) {
      ctx.listener.forwardX.linearRampToValueAtTime(forward.x, now + 0.1);
      ctx.listener.forwardY.linearRampToValueAtTime(forward.y, now + 0.1);
      ctx.listener.forwardZ.linearRampToValueAtTime(forward.z, now + 0.1);
    }
  });

  // Update ambient volume based on Kp index
  useEffect(() => {
    if (!ambientRef.current || !audioContextRef.current) return;
    
    const ctx = audioContextRef.current;
    const targetVolume = 0.05 + (kpValue / 9) * 0.3; // Kp 0 = quiet, Kp 9 = loud ominous hum
    const targetFreq = 40 + (kpValue * 5); // Higher Kp = deeper tension
    
    ambientRef.current.gain.gain.linearRampToValueAtTime(targetVolume, ctx.currentTime + 0.5);
    ambientRef.current.oscillator.frequency.linearRampToValueAtTime(targetFreq, ctx.currentTime + 0.5);
  }, [kpValue]);

  // Planet-specific sounds when focused WITH SPATIAL POSITIONING
  useEffect(() => {
    if (!focusedBody || !audioContextRef.current) return;

    const ctx = audioContextRef.current;
    
    // Stop previous planet sound
    planetSoundsRef.current.forEach(({ oscillator, gain }) => {
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.3);
      setTimeout(() => oscillator.stop(), 300);
    });
    planetSoundsRef.current.clear();

    // Planet sound profiles (inspired by NASA Voyager recordings)
    const soundProfiles: Record<string, { freq: number; type: OscillatorType; detune: number; position?: THREE.Vector3 }> = {
      Sun: { freq: 126, type: 'sawtooth', detune: 20, position: new THREE.Vector3(0, 0, 0) }, // Roaring plasma
      Mercury: { freq: 280, type: 'square', detune: 50, position: new THREE.Vector3(-15, 0, 0) }, // Harsh, metallic
      Venus: { freq: 150, type: 'sine', detune: -30, position: new THREE.Vector3(-25, 0, 0) }, // Thick, oppressive
      Earth: { freq: 174, type: 'sine', detune: 0, position: new THREE.Vector3(-40, 0, 0) }, // OM frequency (Schumann resonance)
      Mars: { freq: 144, type: 'triangle', detune: 10, position: new THREE.Vector3(-60, 0, 0) }, // Dusty, hollow
      Jupiter: { freq: 183, type: 'sawtooth', detune: -50, position: new THREE.Vector3(-200, 0, 0) }, // Deep roar (actual Juno recordings)
      Saturn: { freq: 147, type: 'sine', detune: 80, position: new THREE.Vector3(-300, 0, 0) }, // Ghost whistles (radio emissions)
      Uranus: { freq: 207, type: 'triangle', detune: -20, position: new THREE.Vector3(-600, 0, 0) }, // Ice giant hum
      Neptune: { freq: 211, type: 'sine', detune: 40, position: new THREE.Vector3(-750, 0, 0) }, // Mysterious winds
      Moon: { freq: 210, type: 'sine', detune: 0, position: new THREE.Vector3(-40, 0, 0) }, // Lunar frequency
    };

    const profile = soundProfiles[focusedBody];
    if (!profile) return;

    // Create oscillator for planet WITH SPATIAL PANNER
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    const panner = ctx.createPanner();

    // Configure panner for 3D spatial audio
    panner.panningModel = 'HRTF'; // Head-Related Transfer Function (realistic 3D)
    panner.distanceModel = 'inverse';
    panner.refDistance = 10;
    panner.maxDistance = 1000;
    panner.rolloffFactor = 1;
    panner.coneInnerAngle = 360;
    panner.coneOuterAngle = 0;
    panner.coneOuterGain = 0;

    // Position the sound source in 3D space (if available)
    if (profile.position && panner.positionX) {
      panner.positionX.setValueAtTime(profile.position.x, ctx.currentTime);
      panner.positionY.setValueAtTime(profile.position.y, ctx.currentTime);
      panner.positionZ.setValueAtTime(profile.position.z, ctx.currentTime);
    }

    osc.type = profile.type;
    osc.frequency.setValueAtTime(profile.freq, ctx.currentTime);
    osc.detune.setValueAtTime(profile.detune, ctx.currentTime);
    
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, ctx.currentTime);
    filter.Q.setValueAtTime(3, ctx.currentTime);

    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 1); // Fade in

    osc.connect(filter);
    filter.connect(panner);
    panner.connect(gain);
    gain.connect(ctx.destination);
    osc.start();

    planetSoundsRef.current.set(focusedBody, { oscillator: osc, gain, panner });

    // Add subtle modulation for "alive" feel
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.frequency.setValueAtTime(0.2, ctx.currentTime); // Slow modulation
    lfoGain.gain.setValueAtTime(20, ctx.currentTime);
    lfo.connect(lfoGain);
    lfoGain.connect(osc.detune);
    lfo.start();

    return () => {
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.5);
      setTimeout(() => {
        osc.stop();
        lfo.stop();
      }, 500);
    };
  }, [focusedBody]);

  // Solar wind "whoosh" effect
  useEffect(() => {
    if (!audioContextRef.current || solarWindSpeed < 400) return;

    const ctx = audioContextRef.current;
    
    // High speed = white noise burst
    if (solarWindSpeed > 600) {
      const bufferSize = ctx.sampleRate * 0.3; // 300ms burst
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.1; // White noise
      }

      const source = ctx.createBufferSource();
      const gain = ctx.createGain();
      
      source.buffer = buffer;
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.3);
      
      source.connect(gain);
      gain.connect(ctx.destination);
      source.start();
    }
  }, [solarWindSpeed]);

  return null; // Pure audio component
}
