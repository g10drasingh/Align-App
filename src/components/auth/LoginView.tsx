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
    <div className="min-h-screen w-full bg-slate-900 flex flex-col justify-center items-center p-4 relative overflow-hidden select-none">
      {/* Background subtle gradients */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-950/40 via-slate-900 to-slate-950 pointer-events-none" />
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main card */}
      <div className="w-full max-w-md bg-slate-800/90 border border-slate-700/80 rounded-xl shadow-2xl backdrop-blur-xl p-8 relative z-10 text-slate-100">
        {/* Brand header */}
        <div className="flex items-center gap-3 mb-6 pb-5 border-b border-slate-700/60">
          <div className="w-11 h-11 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-xl shadow-md shadow-emerald-950 tracking-wider">
            A
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-white">Align</h1>
              <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                Production
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">Executive Workspace & Portfolio Tracking</p>
          </div>
        </div>

        {/* Title */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-slate-100">Sign in to your account</h2>
          <p className="text-xs text-slate-400 mt-1">
            Access executive follow-ups, agendas, meetings, and project tracking.
          </p>
        </div>

        {/* Error notification */}
        {error && (
          <div className="mb-5 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
            <div className="leading-relaxed">{error}</div>
          </div>
        )}

        {/* Login form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@admin.com"
              required
              className="w-full px-3.5 py-2.5 rounded-lg bg-slate-900/80 border border-slate-700 text-slate-100 text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-medium text-slate-300">
                Password
              </label>
              <span className="text-[11px] text-slate-400">
                Default: <code className="text-emerald-400 font-mono">admin</code>
              </span>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                required
                className="w-full pl-3.5 pr-10 py-2.5 rounded-lg bg-slate-900/80 border border-slate-700 text-slate-100 text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors p-0.5 cursor-pointer"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || (lockoutTimer !== null && Date.now() < lockoutTimer)}
            className="w-full mt-2 py-2.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm transition-all shadow-md shadow-emerald-950 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <LogIn className="w-4 h-4" />
            <span>Sign In</span>
          </button>
        </form>

        {/* Production Credentials Hint & Offline Info */}
        <div className="mt-6 pt-4 border-t border-slate-700/40 text-center space-y-2">
          <div className="rounded-lg bg-slate-900/60 p-2.5 border border-slate-700/50 text-[11px] text-slate-300 text-left">
            <div className="font-semibold text-slate-200 mb-0.5 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              <span>Production Admin Account:</span>
            </div>
            <div className="font-mono text-slate-400 pl-5">
              Email: <span className="text-slate-200">admin@admin.com</span> | Pass: <span className="text-slate-200">admin</span>
            </div>
            <div className="text-[10px] text-amber-400/90 pl-5 mt-0.5">
              * Password change will be required upon first login.
            </div>
          </div>

          <p className="text-[11px] text-slate-400 flex items-center justify-center gap-1.5 pt-1">
            <span>Encrypted local database (AES-256) • Offline-first</span>
          </p>
        </div>
      </div>
    </div>
  );
};
