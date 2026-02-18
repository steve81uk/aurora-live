/**
 * DataExportButton - Universal export component for all data panels
 * Exports data to JSON/CSV with optional donation gate
 */

import { useState } from 'react';
import { WolfIcon } from './WolfIcon';

interface DataExportButtonProps {
  data: any;
  filename: string;
  format?: 'json' | 'csv' | 'both';
  requireDonation?: boolean;
  onExport?: () => void;
  label?: string;
}

export function DataExportButton({ 
  data, 
  filename, 
  format = 'json',
  requireDonation = false,
  onExport,
  label
}: DataExportButtonProps) {
  const [showDonationPrompt, setShowDonationPrompt] = useState(false);
  const [hasDonated, setHasDonated] = useState(() => {
    // Check localStorage for donation token
    return localStorage.getItem('wolf_fuel_token') === 'donated';
  });

  const exportJSON = () => {
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportCSV = () => {
    // Convert object to CSV format
    let csvContent = '';
    
    if (Array.isArray(data)) {
      // Array of objects
      const headers = Object.keys(data[0]);
      csvContent = headers.join(',') + '\n';
      data.forEach(row => {
        csvContent += headers.map(h => row[h]).join(',') + '\n';
      });
    } else {
      // Single object
      csvContent = 'Key,Value\n';
      Object.entries(data).forEach(([key, value]) => {
        csvContent += `${key},${value}\n`;
      });
    }
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExport = (exportFormat: 'json' | 'csv') => {
    // Check donation gate
    if (requireDonation && !hasDonated) {
      setShowDonationPrompt(true);
      return;
    }

    // Export data
    if (exportFormat === 'json') {
      exportJSON();
    } else {
      exportCSV();
    }

    // Callback
    if (onExport) {
      onExport();
    }

    // Play wolf chime
    try {
      const audioContext = new AudioContext();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 1200;
      oscillator.type = 'sine';
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (e) {
      // Silently fail if audio not available
    }
  };

  const markDonated = () => {
    localStorage.setItem('wolf_fuel_token', 'donated');
    setHasDonated(true);
    setShowDonationPrompt(false);
  };

  return (
    <>
      <div className="relative group">
        {/* Export Button */}
        <button
          onClick={() => {
            if (format === 'both') {
              // Show dropdown
              const btn = document.getElementById(`export-menu-${filename}`);
              btn?.classList.toggle('hidden');
            } else {
              handleExport(format);
            }
          }}
          className="flex items-center gap-1.5 px-2 py-1 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 rounded text-cyan-400 text-[10px] font-mono transition-all hover:scale-105 hover:shadow-[0_0_8px_rgba(34,211,238,0.3)]"
          title="Export data"
        >
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          {requireDonation && !hasDonated && (
            <WolfIcon variant="head" className="w-3 h-3 text-orange-400" />
          )}
          EXPORT
        </button>

        {/* Dropdown for 'both' format */}
        {format === 'both' && (
          <div 
            id={`export-menu-${filename}`}
            className="hidden absolute top-full left-0 mt-1 bg-black/90 backdrop-blur-lg border border-cyan-500/30 rounded overflow-hidden z-50"
          >
            <button
              onClick={() => handleExport('json')}
              className="block w-full px-3 py-1.5 text-left text-[10px] text-cyan-400 hover:bg-cyan-500/20 transition-colors"
            >
              Export JSON
            </button>
            <button
              onClick={() => handleExport('csv')}
              className="block w-full px-3 py-1.5 text-left text-[10px] text-cyan-400 hover:bg-cyan-500/20 transition-colors"
            >
              Export CSV
            </button>
          </div>
        )}
      </div>

      {/* Donation Prompt Modal */}
      {showDonationPrompt && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="bg-gradient-to-br from-gray-900 via-black to-cyan-900/20 border-2 border-cyan-500/50 rounded-lg p-6 max-w-md shadow-[0_0_30px_rgba(34,211,238,0.3)]">
            <div className="flex items-center gap-3 mb-4">
              <WolfIcon variant="head" className="w-8 h-8 text-cyan-400" />
              <h3 className="text-xl font-bold text-cyan-400">Fuel the Wolf Pack</h3>
            </div>
            
            <p className="text-gray-300 text-sm mb-4">
              Advanced data exports require a donation to keep the SKÖLL-TRACK mission running! 🐺
            </p>
            
            <div className="bg-black/40 border border-cyan-500/20 rounded p-3 mb-4">
              <p className="text-[11px] text-gray-400 mb-2">Support via:</p>
              <div className="flex flex-col gap-2">
                <a 
                  href="https://ko-fi.com/steve81uk" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-orange-400 hover:text-orange-300 text-xs transition-colors"
                >
                  ☕ Ko-fi - Buy me a coffee
                </a>
                <a 
                  href="https://linktr.ee/steve81uk" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 text-xs transition-colors"
                >
                  🔗 Linktree - All support options
                </a>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowDonationPrompt(false)}
                className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-white text-sm transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={markDonated}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 rounded text-white text-sm font-bold transition-all shadow-[0_0_15px_rgba(34,211,238,0.5)]"
              >
                I've Donated! 🐺
              </button>
            </div>

            <p className="text-[10px] text-gray-500 text-center mt-3">
              Honor system - thank you for supporting open source! 🌌
            </p>
          </div>
        </div>
      )}
    </>
  );
}
