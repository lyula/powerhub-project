import React, { useEffect, useState } from 'react';

function isMobile() {
  return /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(navigator.userAgent);
}

export default function PWABanner() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    if (!isMobile()) return;
    // Check if app is already installed
    const checkStandalone = () => {
      const standalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
      setIsInstalled(!!standalone);
    };
    checkStandalone();
    window.addEventListener('appinstalled', checkStandalone);
    return () => window.removeEventListener('appinstalled', checkStandalone);
  }, []);

  useEffect(() => {
    if (!isMobile()) return;
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsSupported(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then(() => {
        // Banner will hide automatically if app is installed
      });
    }
  };

  // Always show the link for mobile users if not installed
  if (!isMobile() || isInstalled) return null;
  return (
    <div className="w-full flex justify-center items-center mt-4">
      <button
        onClick={handleInstall}
        className="text-blue-600 underline font-semibold bg-transparent border-none cursor-pointer"
        disabled={!isSupported}
        title={isSupported ? '' : 'PWA installation is not supported on this browser/device.'}
      >
        Get the mobile app experience
      </button>
    </div>
  );
}
