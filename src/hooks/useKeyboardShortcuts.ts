import { useEffect } from 'react';

interface KeyboardShortcutsProps {
  onTogglePlay: () => void;
  onSkipBackward: () => void;
  onSkipForward: () => void;
  onResetView: () => void;
  onJumpToNow: () => void;
  onToggleScienceMode?: () => void;
  onSnapshot?: () => void;
}

export function useKeyboardShortcuts({
  onTogglePlay,
  onSkipBackward,
  onSkipForward,
  onResetView,
  onJumpToNow,
  onToggleScienceMode,
  onSnapshot
}: KeyboardShortcutsProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.key.toLowerCase()) {
        case ' ': // Space - Play/Pause
          e.preventDefault();
          onTogglePlay();
          break;
        case 'arrowleft': // Left Arrow - Skip Backward
          e.preventDefault();
          onSkipBackward();
          break;
        case 'arrowright': // Right Arrow - Skip Forward
          e.preventDefault();
          onSkipForward();
          break;
        case 'r': // R - Reset View
          e.preventDefault();
          onResetView();
          break;
        case 'n': // N - Jump to Now
          e.preventDefault();
          onJumpToNow();
          break;
        case 's': // S - Toggle Science Mode
          if (onToggleScienceMode) {
            e.preventDefault();
            onToggleScienceMode();
          }
          break;
        case 't': // T - Take Snapshot
          if (onSnapshot) {
            e.preventDefault();
            onSnapshot();
          }
          break;
        case 'escape': // Escape - Reset View
          e.preventDefault();
          onResetView();
          break;
        case 'f': // F - Fullscreen
          if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
          } else {
            document.exitFullscreen();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onTogglePlay, onSkipBackward, onSkipForward, onResetView, onJumpToNow, onToggleScienceMode, onSnapshot]);
}
