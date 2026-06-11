'use client';

import { useState, useEffect } from 'react';

interface PWAInstallButtonProps {
  isCollapsed?: boolean;
}

export function PWAInstallButton({ isCollapsed = false }: PWAInstallButtonProps) {
  const [canInstall, setCanInstall] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  useEffect(() => {
    // Check if already installed (standalone mode)
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;

    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    // Check if prompt is already cached
    if ((window as any).__pwaInstallPrompt) {
      setCanInstall(true);
    }

    // Listen for the install prompt event
    const handleInstallReady = () => setCanInstall(true);
    const handleInstalled = () => {
      setIsInstalled(true);
      setCanInstall(false);
    };

    window.addEventListener('pwaInstallReady', handleInstallReady);
    window.addEventListener('pwaInstalled', handleInstalled);

    return () => {
      window.removeEventListener('pwaInstallReady', handleInstallReady);
      window.removeEventListener('pwaInstalled', handleInstalled);
    };
  }, []);

  const handleInstall = async () => {
    const prompt = (window as any).__pwaInstallPrompt;
    if (!prompt) return;

    setIsInstalling(true);
    try {
      await prompt.prompt();
      const { outcome } = await prompt.userChoice;
      if (outcome === 'accepted') {
        (window as any).__pwaInstallPrompt = null;
        setCanInstall(false);
        setIsInstalled(true);
      }
    } catch {
      // User dismissed or error
    } finally {
      setIsInstalling(false);
    }
  };

  // Don't show if already installed or can't install
  if (isInstalled || !canInstall) return null;

  if (isCollapsed) {
    return (
      <button
        onClick={handleInstall}
        disabled={isInstalling}
        title="Install VoiceIt App"
        className="flex items-center justify-center p-3 rounded-xl text-primary bg-primary/10 hover:bg-primary/20 transition-all duration-200 w-12 mx-auto disabled:opacity-60"
      >
        <span
          className="material-symbols-outlined text-[20px]"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          install_mobile
        </span>
      </button>
    );
  }

  return (
    <button
      id="pwa-install-btn"
      onClick={handleInstall}
      disabled={isInstalling}
      className="flex items-center gap-3 px-4 py-2.5 rounded-xl font-label-md text-label-md text-primary bg-primary/8 hover:bg-primary/15 border border-primary/20 transition-all duration-200 w-full disabled:opacity-60"
    >
      <span
        className="material-symbols-outlined text-[20px] shrink-0"
        style={{ fontVariationSettings: "'FILL' 1" }}
      >
        install_mobile
      </span>
      <span className="flex-1 text-left text-[13px] font-semibold">
        {isInstalling ? 'Installing…' : 'Install App'}
      </span>
      {!isInstalling && (
        <span className="text-[10px] bg-primary text-white px-1.5 py-0.5 rounded-full font-bold">
          NEW
        </span>
      )}
    </button>
  );
}
