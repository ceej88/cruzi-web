import { useState, useEffect, useCallback } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface PWAInstallState {
  isInstalled: boolean;
  isInstallable: boolean;
  platform: 'ios' | 'android' | 'desktop' | 'unknown';
  installApp: () => Promise<boolean>;
  dismissPrompt: () => void;
  shouldShowPrompt: boolean;
}

const DISMISS_KEY = 'cruzi_pwa_dismissed';
const DISMISS_DAYS = 7;

export const usePWAInstall = (): PWAInstallState => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [shouldShowPrompt, setShouldShowPrompt] = useState(false);

  // Detect platform
  const platform = (() => {
    if (typeof window === 'undefined') return 'unknown';
    const ua = window.navigator.userAgent;
    if (/iPhone|iPad|iPod/.test(ua)) return 'ios';
    if (/Android/.test(ua)) return 'android';
    if (/Windows|Macintosh|Linux/.test(ua)) return 'desktop';
    return 'unknown';
  })() as 'ios' | 'android' | 'desktop' | 'unknown';

  // Check if already installed (standalone mode)
  useEffect(() => {
    const isStandalone = 
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;
    
    setIsInstalled(isStandalone);
  }, []);

  // Capture beforeinstallprompt event (Chrome/Android)
  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  // Determine if we should show the prompt
  useEffect(() => {
    if (isInstalled) {
      setShouldShowPrompt(false);
      return;
    }

    // Check if user dismissed recently
    const dismissedAt = localStorage.getItem(DISMISS_KEY);
    if (dismissedAt) {
      const dismissedDate = new Date(dismissedAt);
      const now = new Date();
      const daysSinceDismiss = (now.getTime() - dismissedDate.getTime()) / (1000 * 60 * 60 * 24);
      
      if (daysSinceDismiss < DISMISS_DAYS) {
        setShouldShowPrompt(false);
        return;
      }
    }

    // Show prompt after delay
    const timer = setTimeout(() => {
      setShouldShowPrompt(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, [isInstalled]);

  // Install function (for Android/Chrome)
  const installApp = useCallback(async (): Promise<boolean> => {
    if (!deferredPrompt) return false;

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        setIsInstalled(true);
        setShouldShowPrompt(false);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('PWA install failed:', error);
      return false;
    } finally {
      setDeferredPrompt(null);
    }
  }, [deferredPrompt]);

  // Dismiss prompt
  const dismissPrompt = useCallback(() => {
    localStorage.setItem(DISMISS_KEY, new Date().toISOString());
    setShouldShowPrompt(false);
  }, []);

  return {
    isInstalled,
    isInstallable: !!deferredPrompt || platform === 'ios',
    platform,
    installApp,
    dismissPrompt,
    shouldShowPrompt,
  };
};
