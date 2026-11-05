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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 select-none">
      <div
        className={`w-full max-w-sm bg-[var(--surface)] border border-[var(--border)] rounded-2xl shadow-2xl p-7 text-center relative text-[var(--text)] transition-transform ${
          isShaking ? 'animate-shake' : ''
        }`}
      >
        {/* Header Icon */}
        <div className="mx-auto w-14 h-14 rounded-2xl bg-[var(--brand-subtle)] border border-[var(--brand-border)] flex items-center justify-center text-[var(--brand-600)] mb-4 shadow-xs">
          {!hasPinConfigured ? <KeyRound className="w-7 h-7" /> : <Lock className="w-7 h-7" />}
        </div>

        {/* User identification */}
        <div className="mb-2">
          <div className="text-xs font-semibold text-[var(--brand-600)] uppercase tracking-wider mb-0.5">
            {!hasPinConfigured ? 'Security Setup' : 'Session Locked'}
          </div>
          <h2 className="text-xl font-bold text-[var(--text)] tracking-tight">
            {!hasPinConfigured
              ? setupStep === 'create'
                ? 'Create 6-Digit PIN'
                : 'Confirm 6-Digit PIN'
              : 'Enter 6-Digit PIN'}
          </h2>
          <p className="text-xs text-[var(--text-2)] mt-1">
            {!hasPinConfigured
              ? setupStep === 'create'
                ? 'Choose a memorable 6-digit code to lock and secure this device.'
                : 'Re-enter your 6-digit PIN to confirm.'
              : `Logged in as ${currentUser.name}`}
          </p>
        </div>

        {/* Error message */}
        <div className="h-5 mb-3 flex items-center justify-center">
          {error && <span className="text-xs font-semibold text-[var(--danger-fg)]">{error}</span>}
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
                    ? 'bg-[var(--brand-600)] scale-110 shadow-xs'
                    : 'bg-[var(--surface-3)] border border-[var(--border-strong)]'
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
              className="h-14 rounded-xl bg-[var(--surface-2)] hover:bg-[var(--surface-3)] active:bg-[var(--brand-subtle)] border border-[var(--border)] text-xl font-semibold text-[var(--text)] transition-all cursor-pointer flex items-center justify-center hover:scale-[1.03] active:scale-95"
            >
              {digit}
            </button>
          ))}
          <button
            type="button"
            onClick={handleClear}
            className="h-14 rounded-xl bg-[var(--surface-2)]/60 hover:bg-[var(--surface-3)] border border-[var(--border)] text-xs font-medium text-[var(--text-3)] hover:text-[var(--text)] transition-all cursor-pointer flex items-center justify-center"
            title="Clear"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={() => handleDigit('0')}
            className="h-14 rounded-xl bg-[var(--surface-2)] hover:bg-[var(--surface-3)] active:bg-[var(--brand-subtle)] border border-[var(--border)] text-xl font-semibold text-[var(--text)] transition-all cursor-pointer flex items-center justify-center hover:scale-[1.03] active:scale-95"
          >
            0
          </button>
          <button
            type="button"
            onClick={handleBackspace}
            className="h-14 rounded-xl bg-[var(--surface-2)]/60 hover:bg-[var(--surface-3)] border border-[var(--border)] text-[var(--text-2)] hover:text-[var(--danger-fg)] transition-all cursor-pointer flex items-center justify-center"
            title="Backspace"
          >
            <Delete className="w-5 h-5" />
          </button>
        </div>

        {/* Footer actions */}
        <div className="pt-4 border-t border-[var(--border)] flex items-center justify-between text-xs text-[var(--text-3)]">
          <button
            type="button"
            onClick={logout}
            className="flex items-center gap-1.5 text-[var(--text-3)] hover:text-[var(--danger-fg)] transition-colors cursor-pointer"
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
              className="text-[var(--brand-600)] hover:underline cursor-pointer font-medium"
            >
              Start over
            </button>
          ) : (
            <span className="text-[11px] text-[var(--text-3)]">Keyboard 0-9 supported</span>
          )}
        </div>
      </div>
    </div>
  );
};
