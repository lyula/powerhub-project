import React, { useEffect, useState } from 'react';

function isMobile() {
  return /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(navigator.userAgent);
}

export default function PWABanner() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    if (!isMobile()) return;
    let handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowBanner(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then(() => setShowBanner(false));
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
