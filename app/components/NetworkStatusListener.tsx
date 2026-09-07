"use client";

import React, { useState, useEffect } from 'react';
import { WifiOff, Wifi, RefreshCw, X } from 'lucide-react';

export default function NetworkStatusListener() {
  const [isOffline, setIsOffline] = useState(false);
  const [showReconnected, setShowReconnected] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Initial check
    if (typeof window !== 'undefined') {
      setIsOffline(!navigator.onLine);
    }

    const handleOffline = () => {
      setIsOffline(true);
      setShowReconnected(false);
      setIsDismissed(false);
    };

    const handleOnline = () => {
      setIsOffline(false);
      setShowReconnected(true);

      const timer = setTimeout(() => {
        setShowReconnected(false);
      }, 3500);

      return () => clearTimeout(timer);
    };

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  const handleRetry = () => {
    if (typeof window !== 'undefined' && navigator.onLine) {
      setIsOffline(false);
      setShowReconnected(true);
      setTimeout(() => setShowReconnected(false), 3500);
    } else {
      fetch('/api/notifications/unread-count', { method: 'HEAD' })
        .then(() => {
          setIsOffline(false);
          setShowReconnected(true);
          setTimeout(() => setShowReconnected(false), 3500);
        })
        .catch(() => {
          setIsOffline(true);
        });
    }
  };

  // 🟢 Reconnected Notification Toast
  if (showReconnected && !isOffline) {
    return (
      <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[99999] animate-in fade-in slide-in-from-top-4 duration-300 pointer-events-none">
        <div className="bg-emerald-700 text-white px-5 py-3 rounded-none shadow-2xl flex items-center gap-3 border border-emerald-500/40 backdrop-blur-md">
          <div className="w-8 h-8 rounded-none bg-emerald-500/30 flex items-center justify-center shrink-0">
            <Wifi size={18} className="text-white" />
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-wider">Back Online</p>
            <p className="text-xs text-emerald-100 font-medium">Your internet connection has been restored.</p>
          </div>
        </div>
      </div>
    );
  }

  // 🔴 Offline Alert Banner
  if (isOffline && !isDismissed) {
    return (
      <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-[99999] w-[92%] max-w-lg animate-in fade-in slide-in-from-bottom-5 duration-300">
        <div className="bg-[#111111] text-white p-4 sm:p-5 rounded-none shadow-2xl border border-rose-500/40 flex items-center justify-between gap-4 backdrop-blur-md">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-none bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0 border border-rose-500/30">
              <WifiOff size={20} />
            </div>
            <div className="space-y-0.5">
              <p className="text-xs sm:text-sm font-extrabold text-white flex items-center gap-2">
                No Internet Connection
                <span className="w-2.5 h-2.5 rounded-none bg-rose-500 animate-ping inline-block" />
              </p>
              <p className="text-[11px] sm:text-xs text-gray-300 font-medium leading-tight">
                You are currently offline. Check your network connection.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleRetry}
              className="px-3 py-1.5 bg-[#f6c947] hover:bg-[#e5ba3b] text-[#111111] rounded-none text-xs font-bold transition-all flex items-center gap-1.5 shadow-md cursor-pointer"
            >
              <RefreshCw size={13} />
              Retry
            </button>
            <button
              onClick={() => setIsDismissed(true)}
              className="p-1 text-gray-400 hover:text-white rounded-none transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
