'use client';
import { useEffect, useState } from 'react';
import { Download, Share, X } from 'lucide-react';
import { isIos, isStandalone } from '@/lib/pwa-utils';

export default function InstallFab() {
  const [visible, setVisible] = useState(false);
  const [showIosSteps, setShowIosSteps] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    if (isStandalone()) return; // already installed — never show

    setVisible(true);

    if (isIos()) return; // no beforeinstallprompt on iOS, button still works via manual steps

    function handleBeforeInstallPrompt(e: Event) {
      e.preventDefault();
      setDeferredPrompt(e);
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // If the app gets installed while the tab is open, hide the button immediately
    function handleAppInstalled() {
      setVisible(false);
      setDeferredPrompt(null);
    }
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  async function handleClick() {
    if (isIos()) {
      setShowIosSteps(true);
      return;
    }
    if (!deferredPrompt) {
      // Browser hasn't offered the native prompt yet (e.g. Chrome heuristics) —
      // fall back to telling the person how to do it manually.
      setShowIosSteps(true);
      return;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setVisible(false);
    }
  }

  if (!visible) return null;

  return (
    <>
      <button
        onClick={handleClick}
        aria-label="Install Pulse Department app"
        className="fixed bottom-5 right-5 z-40 w-12 h-12 rounded-full bg-blue-600 text-white shadow-lg shadow-blue-300 flex items-center justify-center hover:bg-blue-700 transition-colors"
      >
        <Download className="h-5 w-5" />
      </button>

      {showIosSteps && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-6">
          <div className="bg-white rounded-2xl p-5 max-w-sm w-full relative">
            <button
              onClick={() => setShowIosSteps(false)}
              className="absolute top-3 right-3 text-slate-400 hover:text-slate-600"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
            <p className="text-sm font-semibold text-slate-900 mb-3">Add to Home Screen</p>
            <ol className="text-sm text-slate-600 space-y-2">
              <li className="flex items-center gap-1.5">
                1. Tap <Share className="h-4 w-4 inline" /> Share in your browser's toolbar
              </li>
              <li>2. Scroll down and tap "Add to Home Screen"</li>
              <li>3. Tap "Add" to confirm</li>
            </ol>
          </div>
        </div>
      )}
    </>
  );
}

