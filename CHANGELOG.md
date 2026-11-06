# Changelog

All notable changes to the Align application are documented in this file.

## [v0.0.3] - 2026-11-06

### 🚀 What's New & Major Features

- **In-App Multiplatform Update System**:
  - Direct integration with GitHub Releases (`g10drasingh/Align-App`).
  - Automatic detection of client operating system (`Windows x64`, `macOS Apple Silicon/Intel`, `Linux x64`, or `Web`) and automated matching to target package installers (`.msi`/`.exe`, `.dmg`, `.AppImage`/`.deb`).
  - Configurable update frequency settings: Every app launch (recommended default), daily (24h), weekly (7 days), bi-weekly (15 days), monthly (30 days), or manual check only.
  - Interactive Software Update Dialog with release notes, current/latest version diff, and download links.
  - Pulsing indicator in the TopBar and user profile dropdown when a new release is available.

- **Zero Data Loss Guarantee & Database Vault**:
  - Automated pre-update snapshot backup (`align_app_backup_pre_update`) triggered before any software update download or application.
  - Hardware-accelerated local database encryption at rest using AES-GCM (256-bit) with device-bound PBKDF2 salt via the Web Crypto API.
  - Manual database export and instant file restore (`.json`) capabilities in **Settings > Updates & Vault**.

- **Production Security Hardening**:
  - Removed all default mock accounts (`ea@esewa.com.np`, `admin@esewa.com.np`, etc.).
  - Configured single default production administrator (`admin@admin.com` / `admin`).
  - Mandatory, non-dismissible password change modal on first login (`mustChangePassword: true`).
  - Salted SHA-256 password hashing; zero plaintext credentials stored.
  - Brute-force account protection: 30-second lockout after 5 consecutive failed login attempts.

- **Theme & Brand Consistency**:
  - Removed bluish Tailwind `slate` utility classes from Login, Password Change, and PIN Screen views.
  - Unified color scheme with eSewa Green (`#419B2A`) and semantic neutral surface tokens.

- **Display Density & Layout Controls**:
  - Enhanced Display Density toggle in TopBar with active highlight, green status dot, tooltip, and toast confirmation.
  - Bound `data-density="compact"` to root DOM with global CSS scaling for row heights, table cell padding, and card spacing.

- **Hierarchy & Workflow Refinements**:
  - Replaced ambiguous "child/children" labels with specific "Subtask" and "Sub-project" terminology.
  - Direct creation actions: create Subtasks directly from Task pages, Sub-projects or Tasks from Project pages.
  - Full edit and delete controls across all work items, meetings, and follow-ups.
  - Rich text formatting support for descriptions.

---

## [v0.0.2] - 2026-11-03

- Initial desktop scaffolding and icon generation.
- Core ledger logic: priority-weighted progress rollups and CEO attention flagging.

## [v0.0.1] - 2026-11-01

- Initial release of Align executive management system.
