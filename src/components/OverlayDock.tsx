/**
 * OverlayDock — Left-side command bar (Heimdall Protocol)
 * NASA-grade space weather HUD with QuickNav + live telemetry
 */

import React, { useState } from 'react';
import { Navigation2, Gauge, Radio } from 'lucide-react';
import { QuickNav } from './QuickNav';
import { HeimdallHUD } from './HeimdallHUD';
import { KpTrendChart } from './KpTrendChart';

type Panel = 'nav' | 'hud' | 'trend';

export default function OverlayDock({
  onTravel,
  planets,
  cities,
  kpValue,
  windSpeed,
  currentDate,
}: any) {
  const [activePanel, setActivePanel] = useState<Panel>('hud');

  const tabs = [
    { id: 'hud'   as Panel, icon: <Radio size={14} />,       label: 'HEIMDALL' },
    { id: 'nav'   as Panel, icon: <Navigation2 size={14} />, label: 'NAV' },
    { id: 'trend' as Panel, icon: <Gauge size={14} />,       label: 'KP TREND' },
  ];

  return (
    <div className="absolute top-4 left-4 z-60 pointer-events-auto w-80 max-h-[92vh] flex flex-col">
      <div
        className="flex flex-col overflow-hidden rounded-xl"
        style={{
          background: 'rgba(0,0,0,0.82)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(6,182,212,0.2)',
          boxShadow: '0 0 60px rgba(6,182,212,0.06), 0 25px 50px rgba(0,0,0,0.7)'
        }}
      >
        {/* Tab strip */}
        <div className="flex border-b border-cyan-500/10 bg-black/50">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActivePanel(tab.id)}
              className={`
                flex-1 flex items-center justify-center gap-1.5 py-2.5 font-mono text-[10px]
                transition-all border-b-2
                ${activePanel === tab.id
                  ? 'border-cyan-400 text-cyan-400 bg-cyan-500/5'
                  : 'border-transparent text-gray-600 hover:text-cyan-500/70'
                }
              `}
            >
              {tab.icon}
              <span className="tracking-widest">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Panel content — scrollable */}
        <div className="overflow-y-auto wolf-scroll" style={{ maxHeight: 'calc(92vh - 44px)' }}>
          {activePanel === 'hud' && (
            <HeimdallHUD />
          )}

          {activePanel === 'nav' && (
            <div className="p-3">
              <QuickNav onTravel={onTravel} planets={planets} cities={cities} />
            </div>
          )}

          {activePanel === 'trend' && (
            <div className="p-3">
              <KpTrendChart />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
