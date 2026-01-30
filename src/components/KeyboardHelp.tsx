import { useState } from 'react';
import { Keyboard, X } from 'lucide-react';

export default function KeyboardHelp() {
  const [isOpen, setIsOpen] = useState(false);

  const shortcuts = [
    { key: 'Space', action: 'Play / Pause time animation' },
    { key: '← →', action: 'Skip backward / forward 24 hours' },
    { key: 'R', action: 'Reset camera view' },
    { key: 'N', action: 'Jump to NOW (current date/time)' },
    { key: 'S', action: 'Toggle Science Mode' },
    { key: 'T', action: 'Take snapshot' },
    { key: 'F', action: 'Toggle fullscreen' },
    { key: 'Esc', action: 'Reset view / Close dialogs' },
    { key: '?', action: 'Show this help' },
  ];

  return (
    <>
      {/* Help Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-36 right-6 z-50 p-3 bg-purple-600/30 hover:bg-purple-600/50 border-2 border-purple-400 rounded-full text-purple-300 transition-all hover:scale-110 active:scale-95 shadow-xl"
        title="Keyboard Shortcuts (press ?)"
      >
        <Keyboard className="w-5 h-5" />
      </button>

      {/* Help Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm pointer-events-auto">
          <div className="bg-black/40 backdrop-blur-md border border-white/20 rounded-xl shadow-2xl p-6 max-w-md w-full m-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-cyan-400 flex items-center gap-2">
                <Keyboard className="w-6 h-6" />
                Keyboard Shortcuts
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Shortcuts List */}
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {shortcuts.map((shortcut, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors"
                >
                  <span className="text-white font-medium">{shortcut.action}</span>
                  <kbd className="px-3 py-1 bg-slate-800 border-2 border-cyan-400 rounded text-cyan-300 font-mono font-bold text-sm shadow-lg">
                    {shortcut.key}
                  </kbd>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="mt-4 pt-4 border-t border-white/10 text-center text-sm text-gray-400">
              Press <kbd className="px-2 py-1 bg-slate-800 border border-cyan-400 rounded text-cyan-300 font-mono">Esc</kbd> to close
            </div>
          </div>
        </div>
      )}
    </>
  );
}
