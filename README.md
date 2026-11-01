# Align — Executive Project Management System

> **A high-density executive ledger built for the Executive Assistant (EA) to the CEO to track projects, follow-ups, meetings, and high-stakes executive attention across the G&E department.**

Designed in an **Emerald Green Palette** (`#419B2A` / `#60BB46`) with a single reserved **executive plum** (`#8E2A78`) reserved exclusively for **Needs CEO Attention**.

---

## 🌟 Executive Overview & Purpose

Align solves five critical problems in executive office workflows:
1. **Instant Clarity**: Answers the CEO's question *"Where are we on X?"* in seconds with precision leaf-counted roll-up metrics.
2. **Never Slip**: Proactive automatic detection for Overdue tasks, Blocked items (mandatory reason tracking), and Missed follow-ups.
3. **Structured Follow-ups**: Preserves a tamper-evident audit trail of every check-in, outcome, and postponement instead of lost chat threads.
4. **Meeting-to-Execution Lineage**: Bi-directional trace linking meetings to generated action items with automated loop/cycle guards.
5. **Fair Mathematical Progress**: Priority-capped weighted roll-up algorithm that prevents low-effort tasks from distorting project milestones.

---

## 📐 Architecture & Data Model

### 1. Unified Work Item Hierarchy
Projects and Tasks share a unified recursive structure supporting up to 5 levels of nesting:
```
Project
├── Sub-project
│   ├── Task
│   │   ├── Sub-task (deeper levels supported)
│   │   └── Sub-task
│   └── Task
└── Task (standalone tasks supported)
```

### 2. Weighted Progress Roll-up Algorithm
Progress rolls up from leaf tasks using non-cancelled child leaf counts bounded by priority caps:
* **Low**: capped at 25%
* **Medium**: capped at 50%
* **High**: capped at 75%
* **Urgent**: capped at 100%

When an EA locks a child's weight manually, that value is frozen, and auto siblings equitably distribute the remaining budget `(100% - Σ manual_weights)`.

### 3. Database Schema Overview (PostgreSQL / Relational Store)
- `app_user`: Multi-role access (`ea`, `admin`, `ceo_viewer`)
- `work_item`: Projects and tasks with cached progress, deadline flags, blocked reasons, recurrence links, and CEO attention flags
- `department`, `sub_domain`, `team_member`: Multi-tenant assignment & contact directory
- `category`, `priority`, `status`: Fully customizable taxonomy with state group mappings (`not_started`, `active`, `blocked`, `done`, `cancelled`)
- `followup`: Chronological check-ins with automatic `missed` status detection
- `meeting` & `item_link`: Bi-directional lineage between discussions and deliverables
- `activity_log`: Immutable append-only audit trail with `System` annotations for automatic parent cascades

---

## 🔐 User Authentication & Role Architecture

Align incorporates role-based access control (RBAC):
- **Executive Assistant (`ea`)**: Complete operational authority. Can create, edit, inline-update, log follow-ups, and toggle the **Needs CEO Attention** flag.
- **Administrator (`admin`)**: Inherits all EA capabilities plus system settings management (working days, nesting depth, due-soon thresholds) and list governance.
- **CEO Viewer (`ceo_viewer`)**: Executive read-only mode highlighting the prioritized **Needs CEO Attention** queue, project health, and latest check-in outcomes with zero edit affordances.

---

## 🎨 Design System &  Palette

- **Brand Primary**: Emerald Green (`#419B2A` / `#60BB46` / Dark: `#66BB6A`)
- **Executive Signal**: Attention Plum (`#8E2A78` / Dark: `#F08FD4`) — strictly reserved for CEO Attention
- **Typography**: IBM Plex Sans + Noto Sans Devanagari fallback with tabular numerals (`tabular-nums`)
- **Density**: Comfortable (44px rows) and Compact (36px rows) modes

---

## 🚀 Getting Started

### Local Development
```bash
# Clone the repository
git clone https://github.com/your-username/Align-App.git
cd Align-App

# Install dependencies
npm install

# Run unit tests (testing pure engine algorithms)
npx tsx --test src/utils/engine.test.ts

# Start the development server
npm run dev
```

### Pushing to GitHub
```bash
git remote add origin https://github.com/<your-github-username>/Align-App.git
git branch -M main
git push -u origin main
```
