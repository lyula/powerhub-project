import React, { useEffect, useState } from 'react';

function isMobile() {
  return /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(navigator.userAgent);
}

export default function PWABanner() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    if (!isMobile()) return;
    // Check if app is already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
    if (isStandalone) {
      setShowBanner(false);
      return;
    }
    let handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowBanner(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    // Always show banner if not installed and prompt is available
    if (deferredPrompt) setShowBanner(true);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, [deferredPrompt]);

  // Hide banner if app is installed
  useEffect(() => {
    const checkInstalled = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
      if (isStandalone) setShowBanner(false);
    };
    window.addEventListener('appinstalled', checkInstalled);
    return () => window.removeEventListener('appinstalled', checkInstalled);
  }, []);

  const handleInstall = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then(() => {
        // Banner will hide automatically if app is installed
      });
    }
  };

  if (!showBanner) return null;
  return (
    <div className="fixed bottom-0 left-0 w-full bg-blue-600 text-white p-4 flex justify-between items-center z-50">
      <span>Install PowerHub for a better mobile experience!</span>
      <button onClick={handleInstall} className="bg-white text-blue-600 px-4 py-2 rounded font-bold">Install</button>
    </div>
  );
}
