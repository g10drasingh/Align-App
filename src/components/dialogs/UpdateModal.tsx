/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Download,
  ExternalLink,
  Laptop,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  X,
} from 'lucide-react';
import {
  UpdateInfo,
  createPreUpdateBackup,
  saveUpdateSettings,
  loadUpdateSettings,
  UpdateFrequency,
} from '../../services/updateService';
import { useApp } from '../../context/AppContext';

interface UpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  updateInfo: UpdateInfo | null;
  onCheckAgain?: () => void;
  isChecking?: boolean;
}

export const UpdateModal: React.FC<UpdateModalProps> = ({
  isOpen,
  onClose,
  updateInfo,
  onCheckAgain,
  isChecking = false,
}) => {
  const { workItems, meetings, followups, users, departments, subDomains, teamMembers, categories, priorities, statuses, ceoAttentionStatuses, itemLinks, activityLogs, settings } = useApp();

  const [backupStatus, setBackupStatus] = useState<string | null>(null);
  const [selectedFrequency, setSelectedFrequency] = useState<UpdateFrequency>(() => {
    return loadUpdateSettings().frequency;
  });

  if (!isOpen) return null;

  const handleFrequencyChange = (freq: UpdateFrequency) => {
    setSelectedFrequency(freq);
    const curr = loadUpdateSettings();
    saveUpdateSettings({ ...curr, frequency: freq });
  };

  const handleCreateManualBackup = () => {
    const fullSnapshot = {
      workItems,
      meetings,
      followups,
      users,
      departments,
      subDomains,
      teamMembers,
      categories,
      priorities,
      statuses,
      ceoAttentionStatuses,
      itemLinks,
      activityLogs,
      settings,
    };

    const res = createPreUpdateBackup(fullSnapshot);
    if (res.success) {
      setBackupStatus(`Database backup created & downloaded: ${res.filename}`);
      setTimeout(() => setBackupStatus(null), 5000);
    }
  };

  const handleDownloadAndApply = (url?: string) => {
    // 1. Always create the pre-update automated snapshot first!
    handleCreateManualBackup();

    // 2. Open download target URL or asset
    const targetUrl = url || updateInfo?.matchedAsset?.browserDownloadUrl || updateInfo?.htmlUrl;
    if (targetUrl) {
      window.open(targetUrl, '_blank');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 select-none">
      <div className="w-full max-w-lg rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-2xl text-[var(--text)] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[var(--border)] bg-[var(--surface-2)] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-[var(--brand-subtle)] text-[var(--brand-600)] border border-[var(--brand-border)]">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[var(--text)]">Align Software Updates</h2>
              <p className="text-[11px] text-[var(--text-3)]">
                Automated version sync from GitHub release repository
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-[var(--text-3)] hover:text-[var(--text)] hover:bg-[var(--surface-3)] cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 overflow-y-auto">
          {/* Version Status Box */}
          <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-2)] p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Laptop className="h-4 w-4 text-[var(--brand-600)]" />
                <span className="text-xs font-semibold text-[var(--text)]">
                  {updateInfo?.platformInfo.platformLabel || 'Detected Platform'}
                </span>
              </div>
              <span className="rounded bg-[var(--surface-3)] px-2 py-0.5 text-[10px] font-mono text-[var(--text-2)] font-semibold">
                Arch: {updateInfo?.platformInfo.architecture || 'x64'}
              </span>
            </div>

            <div className="flex items-center justify-between border-t border-[var(--border)] pt-3 text-xs">
              <div>
                <span className="text-[var(--text-3)] block text-[10px] uppercase font-bold">Current Version</span>
                <span className="font-mono font-bold text-[var(--text)]">v{updateInfo?.currentVersion || '0.1.0'}</span>
              </div>
              <ArrowRight className="h-4 w-4 text-[var(--text-3)]" />
              <div>
                <span className="text-[var(--text-3)] block text-[10px] uppercase font-bold">Latest Release</span>
                <span className="font-mono font-bold text-[var(--brand-600)]">
                  v{updateInfo?.latestVersion || '0.1.0'}
                </span>
              </div>
              <div>
                <span className="text-[var(--text-3)] block text-[10px] uppercase font-bold">Status</span>
                {updateInfo?.isAvailable ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    Update Ready
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[var(--text-3)]">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                    Up to date
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Zero Data Loss Guarantee Callout */}
          <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-xs space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-emerald-700 dark:text-emerald-300">
              <ShieldCheck className="h-4 w-4 shrink-0" />
              <span>Zero Data Loss Protection</span>
            </div>
            <p className="text-[11px] text-emerald-900/90 dark:text-emerald-200/90 leading-relaxed">
              Align stores all projects, follow-ups, and meetings in your persistent encrypted local storage.
              Whenever you update, an automated backup snapshot is created and downloaded before the new installer runs, ensuring your data remains 100% safe.
            </p>
          </div>

          {backupStatus && (
            <div className="p-2.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs font-medium flex items-center gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
              <span>{backupStatus}</span>
            </div>
          )}

          {/* Release Notes if update available */}
          {updateInfo?.isAvailable && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[var(--text)]">Release Notes ({updateInfo.releaseName})</span>
                <span className="text-[10px] text-[var(--text-3)]">
                  Published {new Date(updateInfo.publishedAt).toLocaleDateString()}
                </span>
              </div>
              <div className="max-h-36 overflow-y-auto rounded border border-[var(--border)] bg-[var(--surface-2)] p-3 text-xs text-[var(--text-2)] whitespace-pre-line leading-relaxed font-sans">
                {updateInfo.releaseNotes}
              </div>
            </div>
          )}

          {/* Update frequency selector */}
          <div className="rounded border border-[var(--border)] p-3 bg-[var(--surface)] space-y-1.5">
            <label className="block text-xs font-semibold text-[var(--text)]">
              Automatic Update Check Frequency
            </label>
            <select
              value={selectedFrequency}
              onChange={(e) => handleFrequencyChange(e.target.value as UpdateFrequency)}
              className="w-full rounded border border-[var(--border-strong)] bg-[var(--surface-2)] px-2.5 py-1.5 text-xs text-[var(--text)] focus:border-[var(--brand-600)] focus:outline-none"
            >
              <option value="on_open">Automatically on every app open (Default - Recommended)</option>
              <option value="daily">Every day</option>
              <option value="weekly">Every 7 days</option>
              <option value="biweekly">Every 15 days</option>
              <option value="monthly">Every 1 month</option>
              <option value="manual">Manual check only</option>
            </select>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3.5 border-t border-[var(--border)] bg-[var(--surface-2)] flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={handleCreateManualBackup}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[var(--text-2)] hover:text-[var(--text)] hover:bg-[var(--surface-3)] rounded border border-[var(--border)] cursor-pointer"
              title="Download an encrypted JSON backup file now"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Backup Database (.json)</span>
            </button>
            {onCheckAgain && (
              <button
                disabled={isChecking}
                onClick={onCheckAgain}
                className="p-1.5 text-[var(--text-3)] hover:text-[var(--text)] hover:bg-[var(--surface-3)] rounded border border-[var(--border)] cursor-pointer disabled:opacity-50"
                title="Check GitHub for updates now"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isChecking ? 'animate-spin' : ''}`} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-medium text-[var(--text-2)] hover:bg-[var(--surface-3)] rounded cursor-pointer"
            >
              {updateInfo?.isAvailable ? 'Remind Me Later' : 'Close'}
            </button>
            {updateInfo?.isAvailable && (
              <button
                onClick={() => handleDownloadAndApply()}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-white bg-[var(--brand-600)] hover:bg-[var(--brand-700)] rounded shadow-2xs cursor-pointer"
              >
                <Download className="h-3.5 w-3.5" />
                <span>
                  {updateInfo.matchedAsset
                    ? `Download ${updateInfo.matchedAsset.name}`
                    : 'Download Update'}
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
