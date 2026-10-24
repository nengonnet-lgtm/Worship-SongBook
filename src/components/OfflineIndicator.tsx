import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <aside
      role="status"
      aria-live="polite"
      className="fixed bottom-4 left-4 z-50 flex items-center gap-2.5 rounded-xl bg-neutral-900/95 border border-amber-500/40 px-3.5 py-2 text-xs font-medium text-amber-200 shadow-xl backdrop-blur-md animate-fade-in"
    >
      <div className="relative flex items-center justify-center">
        <WifiOff className="w-4 h-4 text-amber-400" />
        <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-amber-400 animate-ping" />
      </div>
      <div>
        <span className="font-semibold block text-amber-100">Offline Mode</span>
        <span className="text-[11px] text-neutral-400">SongBook is running from local storage cache</span>
      </div>
    </aside>
  );
};
