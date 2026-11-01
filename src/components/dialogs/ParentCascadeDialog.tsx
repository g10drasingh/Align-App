/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AlertCircle, Calendar } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const ParentCascadeDialog: React.FC = () => {
  const { cascadeWarning, setCascadeWarning } = useApp();

  if (!cascadeWarning) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 select-none animate-in fade-in-50">
      <div className="w-full max-w-md rounded-lg border border-[var(--border)] bg-[var(--surface)] p-6 shadow-2xl space-y-4">
        <div className="flex items-center gap-2 text-sm font-bold text-amber-600 dark:text-amber-400">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>Move the parent due dates?</span>
        </div>

        <p className="text-xs text-[var(--text-2)] leading-relaxed">
          <strong className="text-[var(--text)]">'{cascadeWarning.childName}'</strong> is due{' '}
          <strong className="text-[var(--text)]">{cascadeWarning.childDueDate}</strong>, which is later than its parent milestone.
          Per specification, if you continue, these ancestor items will automatically extend their due dates:
        </p>

        <div className="rounded-md border border-[var(--border)] bg-[var(--surface-2)] p-3 space-y-2">
          {cascadeWarning.affectedAncestors.map((ancestor) => (
            <div
              key={ancestor.id}
              className="flex items-center justify-between text-xs font-medium text-[var(--text)]"
            >
              <span className="truncate pr-2">{ancestor.name}</span>
              <span className="text-[var(--text-3)] tabular-nums shrink-0">
                {ancestor.currentDueDate || 'No date'} →{' '}
                <span className="font-bold text-[var(--brand-600)]">
                  {cascadeWarning.childDueDate}
                </span>
              </span>
            </div>
          ))}
        </div>

        <p className="text-[11px] text-[var(--text-3)]">
          All extensions are audited in the permanent activity log to prevent silent scope creep.
        </p>

        <div className="flex justify-end gap-2 pt-2 border-t border-[var(--border)]">
          <button
            onClick={() => {
              cascadeWarning.onCancel();
              setCascadeWarning(null);
            }}
            className="rounded px-3 py-1.5 text-xs font-medium text-[var(--text-2)] hover:bg-[var(--surface-2)] cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              cascadeWarning.onConfirm();
              setCascadeWarning(null);
            }}
            className="rounded bg-[var(--brand-600)] hover:bg-[var(--brand-700)] px-3.5 py-1.5 text-xs font-semibold text-white shadow-2xs cursor-pointer"
          >
            Move due dates and save
          </button>
        </div>
      </div>
    </div>
  );
};
