/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { Delete, KeyRound, Lock, LogOut, ShieldCheck, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const LockScreenView: React.FC = () => {
  const {
    currentUser,
    hasPinConfigured,
    unlockApp,
    setupPin,
    logout,
  } = useApp();

  // Mode: if no PIN configured, setup flow (first pin -> confirm pin)
  const [setupStep, setSetupStep] = useState<'create' | 'confirm'>('create');
  const [firstPin, setFirstPin] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isShaking, setIsShaking] = useState(false);

  const triggerShake = (msg: string) => {
    setError(msg);
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 500);
    setPin('');
  };

  const handleDigit = (digit: string) => {
    if (pin.length >= 6) return;
    const nextPin = pin + digit;
    setPin(nextPin);
    setError(null);

    // If 6th digit entered, auto evaluate
    if (nextPin.length === 6) {
      if (!hasPinConfigured) {
        if (setupStep === 'create') {
          setFirstPin(nextPin);
          setPin('');
          setSetupStep('confirm');
        } else {
          // Confirm step
          if (nextPin === firstPin) {
            setupPin(nextPin);
          } else {
            triggerShake('PINs do not match. Please start over.');
            setFirstPin('');
            setSetupStep('create');
          }
        }
      } else {
        // Unlock flow
        const success = unlockApp(nextPin);
        if (!success) {
          triggerShake('Incorrect 6-digit PIN.');
        }
      }
    }
  };

  const handleBackspace = () => {
    setPin((prev) => prev.slice(0, -1));
    setError(null);
  };

  const handleClear = () => {
    setPin('');
    setError(null);
  };

  // Physical keyboard support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') {
        handleDigit(e.key);
      } else if (e.key === 'Backspace') {
        handleBackspace();
      } else if (e.key === 'Escape') {
        handleClear();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-xl p-4 select-none">
      <div
        className={`w-full max-w-sm bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-7 text-center relative text-slate-100 transition-transform ${
          isShaking ? 'animate-shake' : ''
        }`}
      >
        {/* Header Icon */}
        <div className="mx-auto w-14 h-14 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-4 shadow-lg shadow-emerald-950/50">
          {!hasPinConfigured ? <KeyRound className="w-7 h-7" /> : <Lock className="w-7 h-7" />}
        </div>

        {/* User identification */}
        <div className="mb-2">
          <div className="text-xs font-medium text-emerald-400 uppercase tracking-wider mb-0.5">
            {!hasPinConfigured ? 'Security Setup' : 'Session Locked'}
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            {!hasPinConfigured
              ? setupStep === 'create'
                ? 'Create 6-Digit PIN'
                : 'Confirm 6-Digit PIN'
              : 'Enter 6-Digit PIN'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {!hasPinConfigured
              ? setupStep === 'create'
                ? 'Choose a memorable 6-digit code to lock and secure this device.'
                : 'Re-enter your 6-digit PIN to confirm.'
              : `Logged in as ${currentUser.name}`}
          </p>
        </div>

        {/* Error message */}
        <div className="h-5 mb-3 flex items-center justify-center">
          {error && <span className="text-xs font-medium text-rose-400">{error}</span>}
        </div>

        {/* 6 Dots Indicator */}
        <div className="flex justify-center items-center gap-3.5 mb-7">
          {[0, 1, 2, 3, 4, 5].map((index) => {
            const isFilled = index < pin.length;
            return (
              <div
                key={index}
                className={`w-3.5 h-3.5 rounded-full transition-all duration-200 ${
                  isFilled
                    ? 'bg-emerald-400 scale-110 shadow-[0_0_10px_rgba(52,211,153,0.6)]'
                    : 'bg-slate-700 border border-slate-600'
                }`}
              />
            );
          })}
        </div>

        {/* Keypad */}
        <div className="grid grid-cols-3 gap-3 max-w-[260px] mx-auto mb-6">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              type="button"
              onClick={() => handleDigit(digit)}
              className="h-14 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 active:bg-emerald-600/30 border border-slate-700/60 text-xl font-semibold text-white transition-all cursor-pointer flex items-center justify-center hover:scale-[1.03] active:scale-95"
            >
              {digit}
            </button>
          ))}
          <button
            type="button"
            onClick={handleClear}
            className="h-14 rounded-xl bg-slate-800/40 hover:bg-slate-800 border border-slate-700/40 text-xs font-medium text-slate-400 hover:text-slate-200 transition-all cursor-pointer flex items-center justify-center"
            title="Clear"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={() => handleDigit('0')}
            className="h-14 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 active:bg-emerald-600/30 border border-slate-700/60 text-xl font-semibold text-white transition-all cursor-pointer flex items-center justify-center hover:scale-[1.03] active:scale-95"
          >
            0
          </button>
          <button
            type="button"
            onClick={handleBackspace}
            className="h-14 rounded-xl bg-slate-800/40 hover:bg-slate-800 border border-slate-700/40 text-slate-300 hover:text-rose-300 transition-all cursor-pointer flex items-center justify-center"
            title="Backspace"
          >
            <Delete className="w-5 h-5" />
          </button>
        </div>

        {/* Footer actions */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <button
            type="button"
            onClick={logout}
            className="flex items-center gap-1.5 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>

          {!hasPinConfigured && setupStep === 'confirm' ? (
            <button
              type="button"
              onClick={() => {
                setSetupStep('create');
                setFirstPin('');
                setPin('');
                setError(null);
              }}
              className="text-emerald-400 hover:underline cursor-pointer"
            >
              Start over
            </button>
          ) : (
            <span className="text-[11px] text-slate-500">Keyboard 0-9 supported</span>
          )}
        </div>
      </div>
    </div>
  );
};
