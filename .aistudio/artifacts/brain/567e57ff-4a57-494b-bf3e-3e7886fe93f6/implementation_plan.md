# Login, Logout & 6-Digit App Lock with Auto-Lock Security

Implement a full client-side authentication gate (Login/Logout) using existing workspace credentials with password verification, paired with a dedicated 6-digit PIN App Lock security screen that prompts for initial setup, provides instant quick-lock, and supports configurable auto-lock inactivity intervals.

> [!IMPORTANT]
> **Confirmed Specifications from Clarification**:
> - **Authentication Method**: Email and password entry using existing user profiles (`ea@esewa.com.np`, `admin@esewa.com.np`, and custom users) with seeded default passwords (`align@2026`) and credentials quick-fill hints.
> - **App Lock PIN Configuration**: Prompts the user to create and confirm their custom 6-digit PIN on the first lock attempt, stored securely with PIN change/reset controls in Settings.
> - **Auto-Lock Inactivity Intervals**: Supports 1 min, 5 min, 15 min, 30 min, and Never, plus an instant lock toggle when switching tabs or minimizing the application window.

---

### 1. Overview & Core Concept

- **What It Does**:
  - **Login / Logout Screen**: A secure, executive authentication gateway styled in eSewa green (`#419B2A`) and dark/light system theme. Users enter their registered email and password to start a session. When logged in, a visible Logout button in the top navigation and profile menus ends the session and returns to the login screen.
  - **6-Digit App Lock Screen**: A financial/executive PIN keypad interface. When locked, it protects confidential work items, CEO attention flags, and meeting minutes behind a 6-digit PIN with dot feedback, vibration/shake on error, and lock-out prevention.
  - **Auto-Lock Engine**: Background inactivity timer that resets on user interaction (clicks, keystrokes, touches). Inactivity expiry triggers the lock overlay without destroying session data or unsaved draft state. Also optionally locks immediately upon window blur or tab visibility change.
  - **Security Settings Panel**: Integrated within the existing Settings page for managing passwords, resetting the 6-digit PIN, toggling auto-lock duration, and enabling instant tab blur locking.

- **Target Persona**:
  - Executive Assistants (EA), Administrators, and Department Heads at eSewa who manage high-stakes tasks, confidential projects, and executive meeting notes and need data confidentiality on shared laptops or when stepping away from their desks.

- **Key Value**:
  - Zero server dependency (100% offline-ready and free), robust executive privacy, seamless user switching through real credential authentication, and frictionless PIN unlocking.

---

### 2. User Experience & Visual Design

#### Key User Flows

1. **Authentication Flow (Login & Logout)**:
   - When no session exists (`isAuthenticated = false`), the app renders an executive, card-centered Login screen with the Align eA logo, eSewa green accenting, email field, password field with show/hide toggle, and a "Demo Credentials" quick-fill dropdown for instant testing (`ea@esewa.com.np` or `admin@esewa.com.np` with default password `align@2026`).
   - Logging in validates the credentials against the user directory, sets the active user, and transitions smoothly into the Dashboard.
   - Clicking "Sign Out" in the TopBar or Sidebar user menu confirms logout, wipes active session tokens, and returns to the Login screen.

2. **App Lock Flow & PIN Setup**:
   - Users can lock the screen at any time via a quick "Lock Now" button in the TopBar (or keyboard shortcut `Alt + L`).
   - **First-time Lock**: If no 6-digit PIN has been configured yet, a setup modal guides the user: "Set your 6-digit Security PIN" $\rightarrow$ enter 6 digits $\rightarrow$ "Confirm 6-digit PIN".
   - **Subsequent Locks**: The app renders an elegant full-screen lock veil featuring a 6-digit dot tracker, an on-screen numpad (for touch/mouse), keyboard digit input support, and an "Enter PIN to Unlock" prompt with a "Switch Account / Log Out" fallback option.

3. **Auto-Lock Inactivity & Tab Blur**:
   - While idle, an inactivity detector monitors user events (`mousemove`, `keydown`, `touchstart`, `pointerdown`).
   - If idle duration exceeds the configured interval (1 min, 5 min, 15 min, 30 min), the app smoothly activates the lock screen.
   - If "Lock immediately when leaving the app" is enabled, switching tabs or minimizing the browser window (`visibilitychange` / `window.onblur`) triggers the PIN lock veil immediately.

#### Visual Theme & Palette

- **Brand Token**: eSewa Green (`#419B2A`, dark: `#4ade80`).
- **Surface**: High-contrast, dark-mode conscious executive background (`#0B0F17` in dark, `#F8FAFC` in light).
- **PIN Keypad**: Clean circular touch buttons with subtle borders, haptic visual feedback, smooth scale micro-animations, and animated shake effect on invalid PIN.
- **Zero-Pill Compliance**: Clean unboxed typography for status messages, time indicators, and user emails.

---

### 3. Key Product Decisions & Trade-Offs

- **Decision 1: Storage & Credential Model**:
  - *Chosen Approach*: Store hashed/salted passwords and PIN in local offline storage (`align_app_security`), initialized with sensible default passwords for existing users.
  - *Why*: Meets the strict user requirement for zero cloud cost, 100% offline capability, and persistence across page refreshes.
  - *Alternatives Considered*: Cloud database auth (requires network and cloud provisioning; rejected per offline constraint).

- **Decision 2: App Lock vs. Logout Separation**:
  - *Chosen Approach*: Treat "App Lock" as an active session lock veil that preserves in-memory filter states, open draft modals, and view positions, whereas "Logout" terminates the user session entirely.
  - *Why*: Allows EAs and Admins to quickly step away for a meeting and return with a 2-second 6-digit PIN tap without having to re-authenticate or lose context.

- **Decision 3: Fail-Safe Recovery**:
  - *Chosen Approach*: Provide a "Forgot PIN / Log Out" option on the lock screen that allows the user to log out and re-authenticate with their primary email and password if the 6-digit PIN is forgotten.
  - *Why*: Prevents lock-out scenarios while preserving security.

---

### 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                              App.tsx Root                              │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
               ┌────────────────────┴────────────────────┐
               ▼                                         ▼
   ┌───────────────────────┐                 ┌───────────────────────┐
   │  Not Authenticated    │                 │     Authenticated     │
   │      LoginView        │                 │   (Active Session)    │
   │  - Email + Password   │                 └───────────┬───────────┘
   │  - Demo Quick-Select  │                             │
   │  - Validation error   │              ┌──────────────┴──────────────┐
   └───────────────────────┘              ▼                             ▼
                                ┌───────────────────┐         ┌───────────────────┐
                                │   Is App Locked   │         │    App Unlocked   │
                                │   LockScreenView  │         │   Layout & Views  │
                                │ - 6-Digit Keypad  │         │ - TopBar & Nav    │
                                │ - PIN Dot Tracker │         │ - Inactivity Hook │
                                │ - First Setup Flow│         │ - Settings Security│
                                └───────────────────┘         └───────────────────┘
```

#### State & Storage Additions

1. **`SecuritySettings` in `src/types/index.ts`**:
   - `isAppLocked: boolean` (runtime lock state).
   - `hasPinConfigured: boolean` (whether 6-digit PIN is set).
   - `autoLockMinutes: number` (0 for never, 1, 5, 15, 30).
   - `lockOnTabBlur: boolean` (lock when leaving browser tab).
   - `lastActiveTimestamp: number`.

2. **User Credential Schema**:
   - `passwordHash: string` for each user in `AppUser`.
   - Default seed: `align@2026` for default accounts `ea@esewa.com.np` and `admin@esewa.com.np`.

3. **Components to Create & Update**:
   - `src/components/auth/LoginView.tsx`: Full-screen authentication portal.
   - `src/components/auth/LockScreenView.tsx`: 6-digit PIN keypad and setup modal.
   - `src/hooks/useAutoLock.ts`: Clean listener hook for user activity, timer interval, and visibility changes.
   - `src/components/settings/SecuritySettingsTab.tsx` (or integrated in `SettingsView.tsx`): PIN reset, auto-lock timeouts, password change.
   - `src/components/layout/TopBar.tsx`: "Lock App" quick-action icon and user logout action.
