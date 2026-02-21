import { useSWPC } from '../services/SWPCDataService';
import { useSpaceState } from '../services/DataBridge';

export function DataStatusBanner() {
  const { error: spaceError } = useSpaceState();
  const { error: swpcError } = useSWPC();

  const msgs: string[] = [];
  if (!navigator.onLine) msgs.push('OFFLINE - USING CACHED DATA');
  if (spaceError) msgs.push('SPACE STATE UNAVAILABLE');
  if (swpcError) msgs.push('SWPC STREAM ERROR');
  if (msgs.length === 0) return null;

  return (
    <div className="fixed top-0 left-0 right-0 bg-amber-600 text-black text-xs font-mono text-center py-1 z-50">
      {msgs.join(' • ')} — showing last known values, retrying...
    </div>
  );
}
