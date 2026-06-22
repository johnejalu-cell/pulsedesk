'use client';
import { useEffect, useState } from 'react';
import { X, Smartphone, Share } from 'lucide-react';

const DISMISS_KEY = 'pd_install_dismissed';
const DISMISS_DAYS = 14;

function isIos(): boolean {
  if (typeof window === 'undefined') return false;
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent);
}

function isStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true
  );
}

function wasRecentlyDismissed(): boolean {
  if (typeof window === 'undefined') return false;
  const stored = localStorage.getItem(DISMISS_KEY);
  if (!stored) return false;
  const dismissedAt = parseInt(stored, 10);
  const daysSince = (Date.now() - dismissedAt) / (1000 * 60 * 60 * 24);
  return daysSince < DISMISS_DAYS;
}

export default function InstallPrompt() {
  const [show, setShow] = useState(false);
  const [showIosSteps, setShowIosSteps] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    if (isStandalone() || wasRecentlyDismissed()) return;

    if (isIos()) {
      // iOS never fires beforeinstallprompt — show our own banner after a short delay
      const timer = setTimeout(() => setShow(true), 2500);
      return () => clearTimeout(timer);
    }

    function handleBeforeInstallPrompt(e: Event) {
      e.preventDefault();
      setDeferredPrompt(e);
      setShow(true);
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  function dismiss() {
    localStorage.setItem(DISMISS_KEY, Date.now().toString());
    setShow(false);
    setShowIosSteps(false);
  }

  async function handleInstallClick() {
    if (isIos()) {
      setShowIosSteps(true);
      return;
    }
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted' || outcome === 'dismissed') {
      dismiss();
    }
  }

  if (!show) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:max-w-sm z-50 animate-in slide-in-from-bottom-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl p-4">
        <button
          onClick={dismiss}
          className="absolute top-3 right-3 text-slate-400 hover:text-slate-600"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>

        {!showIosSteps ? (
          <div className="flex items-start gap-3 pr-6">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center flex-shrink-0">
              <Smartphone className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-slate-900 mb-1">Add Pulse Department to your home screen</p>
              <p className="text-xs text-slate-500 mb-3">Quick access to your magazine, like an app.</p>
              <button
                onClick={handleInstallClick}
                className="text-sm bg-blue-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-blue-700 transition-colors"
              >
                Add to Home Screen
              </button>
            </div>
          </div>
        ) : (
          <div className="pr-6">
            <p className="text-sm font-semibold text-slate-900 mb-2">Add to Home Screen</p>
            <ol className="text-xs text-slate-600 space-y-1.5">
              <li className="flex items-center gap-1.5">
                1. Tap <Share className="h-3.5 w-3.5 inline" /> Share in Safari's toolbar
              </li>
              <li>2. Scroll down and tap "Add to Home Screen"</li>
              <li>3. Tap "Add" to confirm</li>
            </ol>
          </div>
        )}
      </div>
    </div>
  );
}

