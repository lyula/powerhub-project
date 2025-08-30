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

  // Instead of a banner, render a link/button for install
  if (!deferredPrompt || !showBanner) return null;
  return (
    <div className="w-full flex justify-center items-center mt-4">
      <button onClick={handleInstall} className="text-blue-600 underline font-semibold bg-transparent border-none cursor-pointer">
        Get the mobile app experience
      </button>
    </div>
  );
}
