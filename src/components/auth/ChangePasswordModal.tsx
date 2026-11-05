/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AlertCircle, Check, Eye, EyeOff, Lock, ShieldAlert } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onSuccess?: () => void;
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ isOpen, onSuccess }) => {
  const { currentUser, changeUserPassword } = useApp();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!currentPassword) {
      setError('Please enter your current password.');
      return;
    }

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword.toLowerCase() === 'admin') {
      setError('New password cannot be "admin". Please choose a secure password.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match. Please verify.');
      return;
    }

    setIsSubmitting(true);
    const result = await changeUserPassword(currentUser.id, currentPassword, newPassword);
    setIsSubmitting(false);

    if (result.success) {
      if (onSuccess) onSuccess();
    } else {
      setError(result.error || 'Failed to update password.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 select-none">
      <div className="w-full max-w-md rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-2xl text-[var(--text)] relative">
        {/* Security Warning Icon */}
        <div className="mx-auto w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-600 dark:text-amber-400 mb-4 shadow-sm">
          <ShieldAlert className="w-6 h-6" />
        </div>

        <div className="text-center mb-5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
            Mandatory Security Requirement
          </span>
          <h2 className="text-lg font-bold text-[var(--text)] mt-2">Change Default Password</h2>
          <p className="text-xs text-[var(--text-2)] mt-1 leading-relaxed">
            You are signed in with the default credentials for <strong className="text-[var(--text)]">{currentUser.email}</strong>.
            Before accessing the production workspace, you must create a new secure password.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-[var(--danger-bg)] border border-[var(--danger-fg)]/20 text-[var(--danger-fg)] text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="leading-relaxed font-medium">{error}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-[var(--text-2)] mb-1">
              Current Default Password
            </label>
            <div className="relative">
              <input
                type={showPasswords ? 'text' : 'password'}
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password (default: admin)"
                className="w-full px-3 py-2 rounded-lg bg-[var(--surface-2)] border border-[var(--border-strong)] text-[var(--text)] text-xs focus:ring-2 focus:ring-[var(--brand-600)] focus:border-transparent focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--text-2)] mb-1">
              New Password (minimum 6 characters)
            </label>
            <input
              type={showPasswords ? 'text' : 'password'}
              required
              minLength={6}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter your new secure password"
              className="w-full px-3 py-2 rounded-lg bg-[var(--surface-2)] border border-[var(--border-strong)] text-[var(--text)] text-xs focus:ring-2 focus:ring-[var(--brand-600)] focus:border-transparent focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--text-2)] mb-1">
              Confirm New Password
            </label>
            <input
              type={showPasswords ? 'text' : 'password'}
              required
              minLength={6}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your new password"
              className="w-full px-3 py-2 rounded-lg bg-[var(--surface-2)] border border-[var(--border-strong)] text-[var(--text)] text-xs focus:ring-2 focus:ring-[var(--brand-600)] focus:border-transparent focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-1.5 text-xs text-[var(--text-3)] hover:text-[var(--text)] cursor-pointer">
              <input
                type="checkbox"
                checked={showPasswords}
                onChange={(e) => setShowPasswords(e.target.checked)}
                className="rounded border-[var(--border-strong)] text-[var(--brand-600)] focus:ring-[var(--brand-600)] cursor-pointer"
              />
              <span>Show passwords</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-3 py-2.5 px-4 rounded-lg bg-[var(--brand-600)] hover:bg-[var(--brand-700)] text-white font-semibold text-xs shadow-xs cursor-pointer transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Check className="w-4 h-4" />
            <span>Update Password & Continue</span>
          </button>
        </form>
      </div>
    </div>
  );
};
