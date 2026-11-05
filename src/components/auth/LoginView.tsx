/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AlertCircle, Eye, EyeOff, Lock, LogIn, Shield } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const LoginView: React.FC = () => {
  const { login } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Brute force protection
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutTimer, setLockoutTimer] = useState<number | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (lockoutTimer && Date.now() < lockoutTimer) {
      const remainingSecs = Math.ceil((lockoutTimer - Date.now()) / 1000);
      setError(`Too many failed attempts. Login locked for ${remainingSecs} seconds.`);
      return;
    }

    if (!email.trim() || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setIsSubmitting(true);
    const result = await login(email, password);
    setIsSubmitting(false);

    if (!result.success) {
      const nextAttempts = failedAttempts + 1;
      setFailedAttempts(nextAttempts);

      if (nextAttempts >= 5) {
        const lockoutUntil = Date.now() + 30000; // 30 seconds lockout
        setLockoutTimer(lockoutUntil);
        setError('Too many failed attempts. Temporary lockout for 30 seconds.');
      } else {
        setError(result.error || 'Authentication failed. Please verify credentials.');
      }
    } else {
      setFailedAttempts(0);
      setLockoutTimer(null);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[var(--bg)] flex flex-col justify-center items-center p-4 relative overflow-hidden select-none">
      {/* Background subtle neutral ambiance */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-500/5 via-transparent to-transparent pointer-events-none" />
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-[var(--brand-600)]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-[var(--brand-600)]/5 rounded-full blur-3xl pointer-events-none" />

      {/* Main card */}
      <div className="w-full max-w-md bg-[var(--surface)] border border-[var(--border)] rounded-xl shadow-lg p-8 relative z-10 text-[var(--text)]">
        {/* Brand header */}
        <div className="flex items-center gap-3 mb-6 pb-5 border-b border-[var(--border)]">
          <div className="w-11 h-11 rounded-lg bg-[var(--brand-600)] flex items-center justify-center text-white font-bold text-xl shadow-xs tracking-wider">
            A
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-[var(--text)]">Align</h1>
              <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded bg-[var(--brand-subtle)] text-[var(--brand-600)] border border-[var(--brand-border)]">
                Production
              </span>
            </div>
            <p className="text-xs text-[var(--text-3)] mt-0.5">Executive Workspace & Portfolio Tracking</p>
          </div>
        </div>

        {/* Title */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-[var(--text)]">Sign in to your account</h2>
          <p className="text-xs text-[var(--text-2)] mt-1">
            Access executive follow-ups, agendas, meetings, and project tracking.
          </p>
        </div>

        {/* Error notification */}
        {error && (
          <div className="mb-5 p-3 rounded-lg bg-[var(--danger-bg)] border border-[var(--danger-fg)]/25 text-[var(--danger-fg)] text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="leading-relaxed font-medium">{error}</div>
          </div>
        )}

        {/* Login form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[var(--text-2)] mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@admin.com"
              required
              className="w-full px-3.5 py-2.5 rounded-lg bg-[var(--surface-2)] border border-[var(--border-strong)] text-[var(--text)] text-sm placeholder-[var(--text-3)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-600)] focus:border-transparent transition-all"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-[var(--text-2)]">
                Password
              </label>
              <span className="text-[11px] text-[var(--text-3)]">
                Default: <code className="text-[var(--brand-600)] font-mono font-bold">admin</code>
              </span>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                required
                className="w-full pl-3.5 pr-10 py-2.5 rounded-lg bg-[var(--surface-2)] border border-[var(--border-strong)] text-[var(--text)] text-sm placeholder-[var(--text-3)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-600)] focus:border-transparent transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-3)] hover:text-[var(--text)] transition-colors p-0.5 cursor-pointer"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || (lockoutTimer !== null && Date.now() < lockoutTimer)}
            className="w-full mt-2 py-2.5 px-4 rounded-lg bg-[var(--brand-600)] hover:bg-[var(--brand-700)] text-white font-semibold text-sm transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <LogIn className="w-4 h-4" />
            <span>Sign In</span>
          </button>
        </form>

        {/* Production Credentials Hint & Offline Info */}
        <div className="mt-6 pt-4 border-t border-[var(--border)] text-center space-y-2">
          <div className="rounded-lg bg-[var(--surface-2)] p-3 border border-[var(--border)] text-[11px] text-[var(--text-2)] text-left">
            <div className="font-semibold text-[var(--text)] mb-0.5 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-[var(--brand-600)]" />
              <span>Production Admin Account:</span>
            </div>
            <div className="font-mono text-[var(--text-3)] pl-5">
              Email: <span className="text-[var(--text)] font-semibold">admin@admin.com</span> | Pass: <span className="text-[var(--text)] font-semibold">admin</span>
            </div>
            <div className="text-[10px] text-amber-600 dark:text-amber-400 pl-5 mt-0.5">
              * Password change will be required upon first login.
            </div>
          </div>

          <p className="text-[11px] text-[var(--text-3)] flex items-center justify-center gap-1.5 pt-1">
            <span>Encrypted local database (AES-256) • Offline-first</span>
          </p>
        </div>
      </div>
    </div>
  );
};
