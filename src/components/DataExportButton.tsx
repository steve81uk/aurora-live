/**
 * DataExportButton - Universal export component for all data panels
 * Exports data to JSON/CSV across 7 configurable time ranges
 * Zero audio. Citizen-science first.
 */

import { useState } from 'react';
import { WolfIcon } from './WolfIcon';

type TimeRange = 'today' | '38h' | '7d' | '2w' | '1m' | '6m' | '1y';

const TIME_RANGE_LABELS: Record<TimeRange, string> = {
  today:  'Today',
  '38h':  'Last 38 Hours',
  '7d':   'Last 7 Days',
  '2w':   'Last 2 Weeks',
  '1m':   'Last Month',
  '6m':   'Last 6 Months',
  '1y':   'Last Year',
};

// Returns an array of data sliced/annotated for the chosen range.
// If the source is already an array of timestamped objects it filters by date;
// otherwise it wraps the snapshot with range metadata.
function applyTimeRange(data: any, range: TimeRange): any {
  const now = Date.now();
  const hoursMap: Record<TimeRange, number> = {
    today: 24, '38h': 38, '7d': 168, '2w': 336, '1m': 720, '6m': 4380, '1y': 8760,
  };
  const cutoff = now - hoursMap[range] * 3600000;

  if (Array.isArray(data)) {
    const filtered = data.filter((row: any) => {
      const ts = row.timestamp ? new Date(row.timestamp).getTime() : row.time ? new Date(row.time).getTime() : now;
      return ts >= cutoff;
    });
    return filtered.length > 0 ? filtered : data; // fallback: return all if none match
  }

  // Single snapshot — wrap with range metadata
  return {
    exportedAt: new Date().toISOString(),
    timeRange: TIME_RANGE_LABELS[range],
    rangeStartISO: new Date(cutoff).toISOString(),
    rangeEndISO: new Date(now).toISOString(),
    snapshot: data,
  };
}

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
  const [showMenu, setShowMenu] = useState(false);
  const [selectedRange, setSelectedRange] = useState<TimeRange>('today');
  const [hasDonated, setHasDonated] = useState(() => {
    return localStorage.getItem('wolf_fuel_token') === 'donated';
  });

  const exportJSON = () => {
    const payload = applyTimeRange(data, selectedRange);
    const rangeSlug = selectedRange;
    const jsonStr = JSON.stringify(payload, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}_${rangeSlug}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportCSV = () => {
    const payload = applyTimeRange(data, selectedRange);
    const rangeSlug = selectedRange;
    let csvContent = '';

    const flat = Array.isArray(payload) ? payload : [payload];
    if (flat.length > 0) {
      const headers = Object.keys(flat[0]);
      csvContent = headers.join(',') + '\n';
      flat.forEach((row: any) => {
        csvContent += headers.map(h => {
          const v = row[h];
          return typeof v === 'string' && v.includes(',') ? `"${v}"` : v;
        }).join(',') + '\n';
      });
    }

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}_${rangeSlug}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExport = (exportFormat: 'json' | 'csv') => {
    if (requireDonation && !hasDonated) {
      setShowDonationPrompt(true);
      return;
    }
    if (exportFormat === 'json') {
      exportJSON();
    } else {
      exportCSV();
    }
    setShowMenu(false);
    if (onExport) onExport();
  };

  const markDonated = () => {
    localStorage.setItem('wolf_fuel_token', 'donated');
    setHasDonated(true);
    setShowDonationPrompt(false);
  };

  const formatsToShow = format === 'csv' ? ['csv'] : format === 'json' ? ['json'] : ['json', 'csv'];

  return (
    <>
      <div className="relative">
        {/* Export Button */}
        <button
          onClick={() => setShowMenu(v => !v)}
          className="flex items-center gap-1.5 px-2 py-1 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 rounded text-cyan-400 text-[10px] font-mono transition-all hover:scale-105 hover:shadow-[0_0_8px_rgba(34,211,238,0.3)]"
          title="Export data"
        >
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          {requireDonation && !hasDonated && (
            <WolfIcon variant="head" className="w-3 h-3 text-orange-400" />
          )}
          {label ?? 'EXPORT'}
        </button>

        {/* Dropdown: Time Range + Format */}
        {showMenu && (
          <div className="absolute top-full left-0 mt-1 bg-black/95 backdrop-blur-lg border border-cyan-500/30 rounded overflow-hidden z-50 min-w-[180px] shadow-[0_0_20px_rgba(34,211,238,0.15)]">
            <div className="px-3 py-1.5 text-[9px] text-cyan-500/70 font-mono uppercase tracking-wider border-b border-cyan-500/20">
              Time Range
            </div>
            {(Object.keys(TIME_RANGE_LABELS) as TimeRange[]).map(range => (
              <button
                key={range}
                onClick={() => setSelectedRange(range)}
                className={`block w-full px-3 py-1.5 text-left text-[10px] font-mono transition-colors ${
                  selectedRange === range
                    ? 'bg-cyan-500/20 text-cyan-300'
                    : 'text-cyan-400 hover:bg-cyan-500/10'
                }`}
              >
                {selectedRange === range ? '▶ ' : '  '}{TIME_RANGE_LABELS[range]}
              </button>
            ))}
            <div className="border-t border-cyan-500/20 px-3 py-1.5 text-[9px] text-cyan-500/70 font-mono uppercase tracking-wider">
              Format
            </div>
            {formatsToShow.map(fmt => (
              <button
                key={fmt}
                onClick={() => handleExport(fmt as 'json' | 'csv')}
                className="block w-full px-3 py-1.5 text-left text-[10px] text-white bg-cyan-600/30 hover:bg-cyan-600/50 font-mono transition-colors"
              >
                ⬇ Export {fmt.toUpperCase()}
              </button>
            ))}
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
