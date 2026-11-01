/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';

export function useAutoLock() {
  const { isAuthenticated, isAppLocked, lockApp, autoLockMinutes, lockOnTabBlur } = useApp();
  const timerRef = useRef<number | null>(null);

  // Inactivity auto-lock
  useEffect(() => {
    if (!isAuthenticated || isAppLocked || autoLockMinutes <= 0) {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    const timeoutMs = autoLockMinutes * 60 * 1000;

    const resetTimer = () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
      }
      timerRef.current = window.setTimeout(() => {
        lockApp();
      }, timeoutMs);
    };

    const activityEvents = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'];
    const handleActivity = () => {
      resetTimer();
    };

    activityEvents.forEach((ev) => window.addEventListener(ev, handleActivity, { passive: true }));
    resetTimer();

    return () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      activityEvents.forEach((ev) => window.removeEventListener(ev, handleActivity));
    };
  }, [isAuthenticated, isAppLocked, autoLockMinutes, lockApp]);

  // Tab blur / visibility change auto-lock
  useEffect(() => {
    if (!isAuthenticated || isAppLocked || !lockOnTabBlur) {
      return;
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        lockApp();
      }
    };

    const handleWindowBlur = () => {
      lockApp();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
    };
  }, [isAuthenticated, isAppLocked, lockOnTabBlur, lockApp]);
}
