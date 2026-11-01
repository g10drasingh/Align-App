/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 left-5 z-50 flex flex-col gap-2 max-w-sm pointer-events-none select-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto flex items-center justify-between gap-3 rounded-md border border-[var(--border)] bg-[var(--surface)] p-3 text-xs text-[var(--text)] shadow-lg animate-in slide-in-from-bottom-2 transition-all"
        >
          <div className="flex items-center gap-2">
            {toast.type === 'danger' ? (
              <AlertCircle className="h-4 w-4 text-[var(--danger-fg)] shrink-0" />
            ) : toast.type === 'warning' ? (
              <AlertCircle className="h-4 w-4 text-amber-500 shrink-0" />
            ) : toast.type === 'success' ? (
              <CheckCircle2 className="h-4 w-4 text-[var(--brand-600)] shrink-0" />
            ) : (
              <Info className="h-4 w-4 text-[var(--brand-600)] shrink-0" />
            )}
            <span className="font-medium">{toast.message}</span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {toast.undoAction && (
              <button
                onClick={() => {
                  toast.undoAction?.();
                  removeToast(toast.id);
                }}
                className="text-xs font-semibold text-[var(--brand-600)] hover:underline cursor-pointer"
              >
                Undo
              </button>
            )}
            <button
              onClick={() => removeToast(toast.id)}
              className="text-[var(--text-3)] hover:text-[var(--text)] cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
