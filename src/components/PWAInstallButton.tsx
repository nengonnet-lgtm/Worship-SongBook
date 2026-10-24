import React, { useState } from 'react';
import { Download, Smartphone, Share2, PlusSquare, X, CheckCircle2 } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface Props {
  variant?: 'compact' | 'full';
  className?: string;
}

export const PWAInstallButton: React.FC<Props> = ({ variant = 'compact', className = '' }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  // If already running as an installed PWA, do not render
  if (isInstalled) {
    return null;
  }

  const handleInstallClick = async () => {
    try {
      setIsInstalling(true);
      await install();
    } finally {
      setIsInstalling(false);
    }
  };

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    if (variant === 'full') {
      return (
        <button
          onClick={handleInstallClick}
          disabled={isInstalling}
          className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-amber-600/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/30 hover:border-amber-400 transition-all font-medium text-xs cursor-pointer shadow-sm ${className}`}
        >
          <div className="flex items-center gap-2.5">
            <Download className="w-4 h-4 text-amber-400 animate-bounce" />
            <div className="text-left">
              <span className="block font-bold text-amber-200">Install Worship App</span>
              <span className="block text-[10px] text-amber-400/80">Works offline & full screen</span>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded bg-amber-400 text-neutral-950 font-bold text-[10px]">
            Install
          </span>
        </button>
      );
    }

    return (
      <button
        onClick={handleInstallClick}
        disabled={isInstalling}
        title="Install Worship SongBook to home screen"
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-400/10 hover:bg-amber-400/20 border border-amber-400/30 text-amber-300 hover:text-amber-200 text-xs font-semibold transition-all cursor-pointer shadow-xs ${className}`}
      >
        <Download className="w-3.5 h-3.5 text-amber-400" />
        <span className="hidden sm:inline">Install App</span>
        <span className="sm:hidden">Install</span>
      </button>
    );
  }

  // iOS Safari flow (beforeinstallprompt is not fired on WebKit)
  if (isIOS) {
    return (
      <>
        {variant === 'full' ? (
          <button
            onClick={() => setShowIOSGuide(true)}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-neutral-800/80 hover:bg-neutral-800 border border-neutral-700 text-neutral-200 transition-all text-xs font-medium cursor-pointer ${className}`}
          >
            <div className="flex items-center gap-2.5">
              <Smartphone className="w-4 h-4 text-amber-400" />
              <div className="text-left">
                <span className="block font-bold text-neutral-100">Install on iPhone / iPad</span>
                <span className="block text-[10px] text-neutral-400">Offline stage access</span>
              </div>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded bg-neutral-700 text-neutral-200">
              Guide
            </span>
          </button>
        ) : (
          <button
            onClick={() => setShowIOSGuide(true)}
            title="Install on iPhone / iPad"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-800/80 hover:bg-neutral-800 border border-neutral-700 text-neutral-300 hover:text-neutral-100 text-xs font-medium transition-all cursor-pointer ${className}`}
          >
            <Smartphone className="w-3.5 h-3.5 text-amber-400" />
            <span>Install on iOS</span>
          </button>
        )}

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
            <div className="w-full max-w-sm rounded-2xl bg-neutral-900 border border-neutral-700 p-6 shadow-2xl text-neutral-100">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-amber-400" />
                  <h3 className="text-base font-bold text-white">Install on iPhone / iPad</h3>
                </div>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-4 space-y-3.5 text-xs text-neutral-300">
                <div className="flex items-start gap-3 p-2.5 rounded-xl bg-neutral-950/60 border border-neutral-800">
                  <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                    <Share2 className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-semibold text-white block">Step 1: Tap Share</span>
                    <p className="text-neutral-400 mt-0.5">
                      Tap the <strong>Share</strong> button at the bottom of Safari (or top right on iPad).
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-2.5 rounded-xl bg-neutral-950/60 border border-neutral-800">
                  <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                    <PlusSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-semibold text-white block">Step 2: Add to Home Screen</span>
                    <p className="text-neutral-400 mt-0.5">
                      Scroll down the options list and tap <strong>Add to Home Screen</strong>.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-2.5 rounded-xl bg-neutral-950/60 border border-neutral-800">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-semibold text-white block">Step 3: Launch Offline</span>
                    <p className="text-neutral-400 mt-0.5">
                      Open <strong>SongBook</strong> from your home screen for full-screen offline performance without browser address bars.
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full rounded-xl bg-amber-400 hover:bg-amber-300 py-2.5 text-xs font-bold text-neutral-950 transition-colors cursor-pointer"
              >
                Got it
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
