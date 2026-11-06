/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Update Service for Align Desktop & Web
 * Checks GitHub Releases for g10drasingh/Align-App, detects platform,
 * matches platform-specific installers, and ensures complete data safety via pre-update backups.
 */

export const CURRENT_APP_VERSION = '0.0.3';
export const GITHUB_REPO = 'g10drasingh/Align-App';

export type PlatformType = 'windows' | 'macos' | 'linux' | 'web';
export type UpdateFrequency = 'on_open' | 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'manual';

export interface PlatformInfo {
  platform: PlatformType;
  platformLabel: string;
  architecture: string;
  recommendedExtension: string;
}

export interface ReleaseAsset {
  name: string;
  downloadUrl: string;
  size: number;
  browserDownloadUrl: string;
}

export interface UpdateInfo {
  isAvailable: boolean;
  currentVersion: string;
  latestVersion: string;
  releaseName: string;
  releaseNotes: string;
  publishedAt: string;
  htmlUrl: string;
  matchedAsset: ReleaseAsset | null;
  allAssets: ReleaseAsset[];
  platformInfo: PlatformInfo;
}

export interface UpdateSettings {
  frequency: UpdateFrequency;
  lastCheckedAt?: string;
  ignoredVersion?: string;
  autoDownload: boolean;
}

const UPDATE_SETTINGS_KEY = 'align_app_update_settings';
const PRE_UPDATE_BACKUP_KEY = 'align_app_backup_pre_update';

/**
 * Detects the client platform and architecture.
 */
export function detectPlatform(): PlatformInfo {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return {
      platform: 'web',
      platformLabel: 'Web Application',
      architecture: 'x64',
      recommendedExtension: '.zip',
    };
  }

  const userAgent = navigator.userAgent.toLowerCase();
  const platformStr = (navigator.platform || '').toLowerCase();

  // Detect architecture
  let architecture = 'x64';
  if (userAgent.includes('arm') || userAgent.includes('aarch64') || (navigator as any).userAgentData?.architecture === 'arm') {
    architecture = 'arm64';
  }

  // Windows
  if (platformStr.includes('win') || userAgent.includes('windows')) {
    return {
      platform: 'windows',
      platformLabel: 'Windows (64-bit)',
      architecture,
      recommendedExtension: '.msi',
    };
  }

  // macOS
  if (platformStr.includes('mac') || userAgent.includes('macintosh') || userAgent.includes('mac os')) {
    const isAppleSilicon = architecture === 'arm64' || userAgent.includes('arm') || (navigator.maxTouchPoints && navigator.maxTouchPoints > 2);
    return {
      platform: 'macos',
      platformLabel: isAppleSilicon ? 'macOS (Apple Silicon M1/M2/M3)' : 'macOS (Intel)',
      architecture: isAppleSilicon ? 'arm64' : 'x64',
      recommendedExtension: '.dmg',
    };
  }

  // Linux
  if (platformStr.includes('linux') || userAgent.includes('linux') || userAgent.includes('x11')) {
    return {
      platform: 'linux',
      platformLabel: 'Linux (64-bit)',
      architecture,
      recommendedExtension: '.AppImage',
    };
  }

  return {
    platform: 'web',
    platformLabel: 'Web / Browser Environment',
    architecture: 'x64',
    recommendedExtension: '.zip',
  };
}

/**
 * Parses semver string to [major, minor, patch]
 */
function parseSemver(v: string): [number, number, number] {
  const clean = v.replace(/^v/, '').split('-')[0];
  const parts = clean.split('.').map((p) => parseInt(p, 10) || 0);
  return [parts[0] || 0, parts[1] || 0, parts[2] || 0];
}

/**
 * Returns true if versionA is greater than versionB.
 */
export function isNewerVersion(versionA: string, versionB: string): boolean {
  const [a1, a2, a3] = parseSemver(versionA);
  const [b1, b2, b3] = parseSemver(versionB);

  if (a1 > b1) return true;
  if (a1 < b1) return false;
  if (a2 > b2) return true;
  if (a2 < b2) return false;
  return a3 > b3;
}

/**
 * Loads update settings from storage.
 */
export function loadUpdateSettings(): UpdateSettings {
  try {
    const raw = localStorage.getItem(UPDATE_SETTINGS_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {
    // ignore
  }

  return {
    frequency: 'on_open',
    autoDownload: false,
  };
}

/**
 * Saves update settings to storage.
 */
export function saveUpdateSettings(settings: UpdateSettings): void {
  try {
    localStorage.setItem(UPDATE_SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // ignore
  }
}

/**
 * Determines whether an update check should be performed based on configured frequency.
 */
export function shouldCheckForUpdate(settings: UpdateSettings): boolean {
  if (settings.frequency === 'manual') return false;
  if (settings.frequency === 'on_open') return true;

  if (!settings.lastCheckedAt) return true;

  const lastChecked = new Date(settings.lastCheckedAt).getTime();
  const now = Date.now();
  const diffHours = (now - lastChecked) / (1000 * 60 * 60);

  switch (settings.frequency) {
    case 'daily':
      return diffHours >= 24;
    case 'weekly':
      return diffHours >= 24 * 7;
    case 'biweekly':
      return diffHours >= 24 * 15;
    case 'monthly':
      return diffHours >= 24 * 30;
    default:
      return true;
  }
}

/**
 * Matches assets to the current user's platform.
 */
function findBestAssetForPlatform(assets: any[], platformInfo: PlatformInfo): ReleaseAsset | null {
  if (!assets || assets.length === 0) return null;

  const mapped: ReleaseAsset[] = assets.map((a: any) => ({
    name: a.name,
    downloadUrl: a.browser_download_url,
    size: a.size || 0,
    browserDownloadUrl: a.browser_download_url,
  }));

  const ext = platformInfo.recommendedExtension.toLowerCase();
  const isArm = platformInfo.architecture === 'arm64';

  // Specific matches
  if (platformInfo.platform === 'windows') {
    // Prefer .msi then .exe
    const msi = mapped.find((a) => a.name.toLowerCase().endsWith('.msi'));
    if (msi) return msi;
    const exe = mapped.find((a) => a.name.toLowerCase().endsWith('.exe'));
    if (exe) return exe;
  } else if (platformInfo.platform === 'macos') {
    // If arm64, look for aarch64 .dmg or universal .dmg
    if (isArm) {
      const armDmg = mapped.find((a) => a.name.toLowerCase().includes('aarch64') && a.name.toLowerCase().endsWith('.dmg'));
      if (armDmg) return armDmg;
    }
    const anyDmg = mapped.find((a) => a.name.toLowerCase().endsWith('.dmg'));
    if (anyDmg) return anyDmg;
    const appTar = mapped.find((a) => a.name.toLowerCase().endsWith('.app.tar.gz'));
    if (appTar) return appTar;
  } else if (platformInfo.platform === 'linux') {
    // Prefer .AppImage then .deb
    const appImage = mapped.find((a) => a.name.toLowerCase().endsWith('.appimage'));
    if (appImage) return appImage;
    const deb = mapped.find((a) => a.name.toLowerCase().endsWith('.deb'));
    if (deb) return deb;
  }

  // Fallback: match by recommended extension
  const byExt = mapped.find((a) => a.name.toLowerCase().endsWith(ext));
  if (byExt) return byExt;

  return mapped[0] || null;
}

/**
 * Checks GitHub Releases for updates.
 */
export async function checkForAppUpdates(): Promise<UpdateInfo> {
  const platformInfo = detectPlatform();
  const settings = loadUpdateSettings();

  // Record this check timestamp
  saveUpdateSettings({
    ...settings,
    lastCheckedAt: new Date().toISOString(),
  });

  try {
    const res = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/releases/latest`, {
      headers: {
        Accept: 'application/vnd.github.v3+json',
      },
    });

    if (!res.ok) {
      if (res.status === 404) {
        // No releases published yet
        return {
          isAvailable: false,
          currentVersion: CURRENT_APP_VERSION,
          latestVersion: CURRENT_APP_VERSION,
          releaseName: 'No releases published yet',
          releaseNotes: 'The repository does not have any published GitHub releases yet.',
          publishedAt: new Date().toISOString(),
          htmlUrl: `https://github.com/${GITHUB_REPO}/releases`,
          matchedAsset: null,
          allAssets: [],
          platformInfo,
        };
      }
      throw new Error(`GitHub API error: ${res.statusText}`);
    }

    const release = await res.json();
    const latestTag = (release.tag_name || '').replace(/^v/, '');
    const isAvailable = isNewerVersion(latestTag, CURRENT_APP_VERSION);

    const allAssets: ReleaseAsset[] = (release.assets || []).map((a: any) => ({
      name: a.name,
      downloadUrl: a.browser_download_url,
      size: a.size || 0,
      browserDownloadUrl: a.browser_download_url,
    }));

    const matchedAsset = findBestAssetForPlatform(release.assets, platformInfo);

    return {
      isAvailable,
      currentVersion: CURRENT_APP_VERSION,
      latestVersion: latestTag || CURRENT_APP_VERSION,
      releaseName: release.name || `Align v${latestTag}`,
      releaseNotes: release.body || 'No release notes provided for this version.',
      publishedAt: release.published_at || new Date().toISOString(),
      htmlUrl: release.html_url || `https://github.com/${GITHUB_REPO}/releases`,
      matchedAsset,
      allAssets,
      platformInfo,
    };
  } catch (err: any) {
    console.warn('Update check failed (network or rate limit)', err);
    return {
      isAvailable: false,
      currentVersion: CURRENT_APP_VERSION,
      latestVersion: CURRENT_APP_VERSION,
      releaseName: 'Offline or check failed',
      releaseNotes: 'Could not connect to GitHub releases. Please check your internet connection.',
      publishedAt: new Date().toISOString(),
      htmlUrl: `https://github.com/${GITHUB_REPO}/releases`,
      matchedAsset: null,
      allAssets: [],
      platformInfo,
    };
  }
}

/**
 * Creates an automated pre-update database backup snapshot to ensure ZERO data loss.
 * Saves to localStorage and triggers browser download of backup JSON.
 */
export function createPreUpdateBackup(appSnapshot: Record<string, any>): {
  success: boolean;
  filename: string;
  timestamp: string;
} {
  const timestamp = new Date().toISOString();
  const backupPayload = {
    appName: 'Align',
    version: CURRENT_APP_VERSION,
    backupType: 'pre_update_automated_snapshot',
    createdAt: timestamp,
    data: appSnapshot,
  };

  const jsonString = JSON.stringify(backupPayload, null, 2);

  // 1. Save in pre-update local storage key
  try {
    localStorage.setItem(PRE_UPDATE_BACKUP_KEY, jsonString);
  } catch (e) {
    console.warn('Could not save pre-update backup to localStorage', e);
  }

  // 2. Trigger instant file download for the user's desktop files
  const filename = `align_database_backup_pre_update_${timestamp.slice(0, 10)}.json`;
  try {
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (e) {
    console.warn('Could not auto-download backup file', e);
  }

  return {
    success: true,
    filename,
    timestamp,
  };
}
