import React, { useState, useEffect } from 'react';
import { Smartphone, Download, X, Check } from 'lucide-react';

export default function InstallAppBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    // Listen for beforeinstallprompt event (Android / Chrome / Edge)
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // Check if already in standalone PWA mode
    if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true) {
      setIsInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    } else if (isIOS) {
      alert('To install on iPhone/iPad:\n1. Tap the Share button at the bottom of Safari (square with arrow up)\n2. Scroll down and tap "Add to Home Screen"\n3. Tap "Add"');
    } else {
      alert('To install on Android:\n1. Tap the three dots (⋮) in your Chrome browser menu\n2. Tap "Install App" or "Add to Home Screen"');
    }
  };

  if (isInstalled || dismissed) return null;

  return (
    <div className="bg-gradient-to-r from-amber-600 via-rose-600 to-indigo-600 text-white px-4 py-2.5 shadow-md flex items-center justify-between gap-3 text-xs">
      <div className="flex items-center gap-2.5">
        <div className="p-1 rounded-lg bg-white/20">
          <Smartphone className="w-4 h-4" />
        </div>
        <div>
          <span className="font-bold">Use as Mobile App:</span>{' '}
          <span className="text-white/90 hidden sm:inline">Add Chirasha Art Gallery to your phone screen for instant 1-tap access!</span>
          <span className="text-white/90 sm:hidden">Add to phone home screen!</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={handleInstallClick}
          className="px-3 py-1 rounded-lg bg-white text-stone-900 font-bold hover:bg-amber-100 transition-colors flex items-center gap-1 shadow-2xs cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          Install App
        </button>

        <button
          onClick={() => setDismissed(true)}
          className="p-1 rounded-md hover:bg-white/20 text-white/80 hover:text-white transition-colors cursor-pointer"
          title="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
