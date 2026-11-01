# G&E Project Management Tool — Complete Specification (A to Z)

**Version:** 0.1 (draft) · **Date:** 1 November 2026
**Source:** Handwritten notes + design discussion between the product owner and Claude
**Audience:** Anyone new to the project — product, design, engineering, and the EA who will use it

**Legend used throughout this document**

| Mark | Meaning |
|---|---|
| ✅ | Decided by the product owner (from the notes or the discussion) |
| 💡 | Suggested by Claude based on common practice — please confirm or change |
| ❓ | Open question — needs a decision before building |

---

## Table of contents

1. Introduction
2. Glossary (read this first if you are new)
3. Users and roles
4. The work item hierarchy
5. Field reference
6. Editable lists (categories, departments, priorities, etc.)
7. Status, progress and weights
8. Due dates, days left and deadline flags
9. CEO Attention
10. Follow-ups
11. Recurring tasks
12. Meetings
13. Screens: dashboard, task list, summaries and filters
14. Permissions
15. Activity log (audit trail)
16. Notifications and exports
17. Data model (tables and SQL)
18. Business rules checklist
19. Edge cases
20. Worked example: a day in the life
21. Phased roadmap
22. Open questions and assumptions

---

## 1. Introduction

### 1.1 What is this tool?

A web-based project management tool built for the **Executive Assistant (EA) to the CEO** to track the work of the **G&E department** (formerly E&E). It tracks:

- **Projects** and **tasks** (with sub-projects and sub-tasks)
- **Follow-ups** — check-ins on any item, with a log of what happened each time
- **Meetings** — weekly, monthly and other discussions — and the work that comes out of them
- Which items **need the CEO's attention**

### 1.2 Who uses it?

- ✅ **Version 1: the EA only.** The EA enters and updates everything.
- ✅ **Later: a read-only CEO view** (the CEO can see, not edit).
- ✅ **Team members** appear in the tool only as a *reference* ("who is responsible"). They do not log in during version 1.

### 1.3 What problems does it solve?

1. The CEO asks, "Where are we on X?" and the EA needs the answer in seconds.
2. Things get blocked, overdue or forgotten, and nobody notices until it is too late.
3. Follow-ups happen in chats and calls, and the outcomes are lost.
4. Work that starts in a meeting has no trace back to that meeting.
5. Progress on big projects is hard to measure fairly.

### 1.4 Design principles

1. **Fast for the EA.** Few clicks to update anything. Sensible defaults.
2. **Nothing changes silently.** Every automatic change is shown to the user and logged.
3. **History is never overwritten.** Recurring tasks create new records; follow-ups are logged, not replaced.
4. ✅ **Everything is configurable.** Categories, departments, sub-domains, priorities, statuses and more can be added and edited by users (see section 6).
5. ✅ **AD (Gregorian) calendar only.** Bikram Sambat is not used for now.

### 1.5 Scope

| In version 1 | Later 💡 |
|---|---|
| Projects, sub-projects, tasks, sub-tasks | Team members logging in |
| Dashboard, task list, filters, summaries | Read-only CEO view |
| CEO Attention flag and workflow | Email / push notifications |
| Follow-ups with log | Calendar integration |
| Recurring tasks | Dependencies between tasks |
| Meetings and "originated from" links | Time tracking |
| Weighted progress roll-up | Bikram Sambat calendar |
| Editable lists, activity log | Mobile app |

---

## 2. Glossary

| Term | Plain-English meaning |
|---|---|
| **EA** | Executive Assistant to the CEO. The main user in version 1. |
| **Work item** | The general word for anything trackable: a project, sub-project, task or sub-task. |
| **Project** | A bigger piece of work made of tasks (and optionally sub-projects). |
| **Sub-project** | A project that sits inside another project. Optional. |
| **Task** | One piece of work. It can sit inside a project or stand alone. |
| **Sub-task** | A task that sits inside another task. |
| **Leaf item** | A work item with nothing underneath it. Progress is measured at leaf level, then rolled up. |
| **Parent / child** | A parent contains children. A project is the parent of its tasks. |
| **Department** | The group a work item is *assigned to* (for example G&E, Engineering, Data, Brand). |
| **Sub-domain** (sub-department) | A smaller area inside a department (for example Topup/Admin, Remittance, Travel). Optional. |
| **Team member** | A person in a department or sub-domain. Reference only: "who is responsible". |
| **Category** | The *type of work* (for example Data Analysis, Planning, Meeting). Different from department. |
| **Priority** | Low, Medium, High or Urgent. Also controls how much an item counts in progress (the weight cap). |
| **Status** | Where the item is in its life: Not Started, In-Progress, In-Review, Blocked, Completed, Cancelled. |
| **CEO Attention** | A yes/no flag, set only by the EA, meaning "the CEO must look at this". It has its own mini-workflow. |
| **Follow-up** | A check-in on an item. Each one is logged with the date, outcome and remarks. |
| **Recurring task** | A task that repeats (daily, weekly, monthly or every X days). Each repetition is a new task. |
| **Occurrence** | One generated copy of a recurring task. |
| **Series** | The recurring rule plus all its occurrences. |
| **Meeting** | A separate record (weekly, monthly, other) that can create work and can be created by work. |
| **Originated from** | A link showing where an item or meeting came from. |
| **Weight** | How much a child counts toward its parent's progress, as a percentage. |
| **Roll-up** | Calculating a parent's progress from its children. |
| **Deadline flag** | An automatic label: Overdue, Due today, Due soon, On track or Completed. |
| **Activity log** | A permanent history of who changed what and when. |

---

## 3. Users and roles

| Role | Who | Can do | Version |
|---|---|---|---|
| **EA** | The CEO's executive assistant | Everything: create, edit, delete/archive, set CEO flag, manage lists, change settings | 1 |
| **Admin** 💡 | Usually the same person as the EA, or a second trusted person | Everything the EA can, plus manage users and system settings | 1 |
| **CEO (viewer)** | The CEO | See dashboard, items, follow-ups and meetings. Cannot edit. | Later ✅ |
| **Team member** | G&E staff | Appear as reference data only. No login. | 1 (no login) |

✅ **Only EAs can set or clear the CEO Attention flag.**
💡 Build the role field now (`ea`, `admin`, `ceo_viewer`) so the CEO view later needs no redesign.

---

## 4. The work item hierarchy

### 4.1 The four levels

```
Project
├── Sub-project (optional)
│   ├── Task
│   │   ├── Sub-task
│   │   │   └── Sub-task (deeper levels are allowed)
│   │   └── Sub-task
│   └── Task
└── Task

Task (standalone — belongs to no project)
└── Sub-task
```

Your diagram showed this deeper nesting (P1 → P11 → T111 → T1121 → T11211), so sub-tasks can contain sub-tasks.

### 4.2 Rules

1. ✅ A **project** can contain tasks. A project may be **empty at first**; it simply cannot show progress until it has tasks (it displays "No tasks yet" and progress "N/A", not 0%).
2. ✅ A **task can be standalone** (no project) or can sit inside a project or sub-project.
3. ✅ A **task can have sub-tasks.**
4. ✅ A **project can have sub-projects** (optional).
5. A project can never sit inside a task.
6. 💡 Maximum nesting depth is a setting, default 5 levels.
7. 💡 Store only two real types: `project` and `task`. "Sub-project" simply means a project whose parent is a project. "Sub-task" means a task whose parent is a task. This keeps one table and one set of fields for all four.
8. ✅ The user picks **Project** or **Task** from a selection box when creating an item.
9. 💡 Items are never hard-deleted. They are **archived** (hidden but kept), so history and links stay intact.
10. 💡 Moving an item to a new parent is allowed. Weights and progress recalculate, and the move is logged.

### 4.3 Why one table for all four levels?

Projects, sub-projects, tasks and sub-tasks share almost every field (name, status, owner, dates, priority, follow-ups). One table with a `parent_id` means every feature (filters, follow-ups, CEO flag, logs) works at every level without extra code.

---

## 5. Field reference

All fields below exist on every work item unless stated otherwise.

| Field | Required | Values / type | Notes |
|---|---|---|---|
| **Name** | Yes | Short text | ✅ |
| **Description** | No | Text | ✅ |
| **Type** | Yes | Project or Task | Chosen from a selection box ✅ |
| **Parent** | No | Another project or task | Empty = top-level / standalone |
| **Status** | Yes | From the editable status list. Default **Not Started** | ✅ See section 7 |
| **Blocked reason** | Only when Blocked | Text | 💡 So the EA knows *why* it is blocked |
| **Blocked since** | Auto | Date | 💡 Set when status becomes Blocked |
| **Priority** | Yes | From the editable priority list (Low, Medium, High, Urgent) | ✅ 💡 Default Medium |
| **Category** | Yes | From the editable category list | ✅ The type of work |
| **Department(s)** | Yes (at least one) | One or more from the department list | ✅ Who it is assigned to |
| **Sub-domain(s)** | No | One or more from the sub-domain list | ✅ Must belong to a chosen department |
| **Team member(s)** | No | One or more people | ✅ Reference only; can be blank when department or sub-domain is chosen |
| **Start date** | No | Date | ✅ Optional |
| **Due date** | See ❓ | Date | ✅ The "end date" in your notes is treated as the due date |
| **Days left** | Auto | Number | ✅ Shown in tables and on the dashboard |
| **Deadline flag** | Auto | Overdue, Due today, Due soon, On track, Completed | ✅ See section 8 |
| **Completed on** | Auto | Date | 💡 Set when status becomes Completed |
| **Progress %** | Auto (overridable) | 0–100 | See section 7 |
| **Weight mode** | Yes | Auto (default) or Manual | ✅ |
| **Manual weight %** | Only when Manual | 0–100 | ✅ |
| **Needs CEO Attention** | Yes | Yes / No (default **No**) | ✅ EA only |
| **CEO Attention status** | When flag = Yes | Pending, In-Progress, Completed (editable) | ✅ Separate from item status |
| **Next follow-up** | Auto | Date | ✅ The earliest upcoming scheduled follow-up |
| **Last updated status** | Auto | Text + date | ✅ Taken from the latest follow-up |
| **Task type** | Yes | One-time (manual) or Recurring | ✅ See section 11 |
| **Originated from** | No | Links to a meeting or work item | ✅ See section 12 |
| **Created / updated by and when** | Auto | | 💡 |

### 5.1 How assignment works (Department, Sub-domain, Team member)

Your notes describe an "owner" based on department and sub-department. In plain terms:

- **Department** says *which group* is responsible. At least one is required, and several can be chosen.
- **Sub-domain** is optional and narrows it down (for example Remittance inside Engineering).
- **Team member** is optional and reference-only: "this person is the contact".
- The user can pick just a department, or also a sub-domain, or also team members.
- Picking a sub-domain automatically includes its department. Picking a team member automatically includes their department or sub-domain.
- 💡 Children **inherit** the parent's assignment by default, and can be changed.
- ✅ Assignment works the same way for projects, sub-projects, tasks and sub-tasks.

### 5.2 Category vs Department — do not mix them up

| | Category | Department |
|---|---|---|
| Answers | "What *kind* of work is this?" | "*Who* is it assigned to?" |
| Examples | Data Analysis, Planning, Documentation, Research, Development, Discussion, Meeting | G&E, Engineering, Data, Brand |
| Editable? | ✅ Yes | ✅ Yes |

---

## 6. Editable lists (categories, departments, priorities and more)

✅ **Requirement:** every list a user chooses from can be **added to and edited by the user**. Your notes marked this on "Other" for department, category and meeting type.

### 6.1 The lists and their starting values

| List | Starting values | Extra settings per value |
|---|---|---|
| **Categories** ✅ | Data Analysis, Planning, Documentation, Research, Development, Discussion, Meeting, Others | Color 💡 |
| **Departments** ✅ | G&E, Engineering, Data, Brand, Other | Color 💡 |
| **Sub-domains** ✅ (belong to a department) | Examples from your notes: Topup/Admin, Remittance, Travel. Assign each to its department during setup. | Parent department |
| **Team members** ✅ (belong to department / sub-domain) | None at start; the EA adds them | Name, department(s), sub-domain(s) |
| **Priorities** ✅ | Low, Medium, High, Urgent | **Rank** (order) and **weight cap %** (see section 7) |
| **Statuses** ✅ | Not Started, In-Progress, In-Review, Blocked, Completed, Cancelled | **State group** and **default progress %** (see 6.3) |
| **CEO Attention statuses** ✅ | Pending, In-Progress, Completed | Order, color |
| **Follow-up statuses** 💡 | Scheduled, Done, Missed, Postponed, Cancelled | State group (see section 10) |
| **Meeting types** ✅ | Weekly, Monthly, Other (general discussion) | Color |

### 6.2 What "edit" means (same rules for every list)

| Action | What happens |
|---|---|
| **Add** | A new value appears immediately in every dropdown. 💡 Users can also add a value straight from the dropdown ("+ Add new") so they never leave the form. This replaces a literal "Other" value. |
| **Rename** | The new name shows everywhere, including on old items. History in the activity log keeps the name as it was at the time. |
| **Reorder** | Drag to change the order in dropdowns. |
| **Recolor** 💡 | Change the label color. |
| **Deactivate** | The value is hidden from new selections but stays on old items. This is the normal way to "remove" a value. |
| **Merge** 💡 | Move every item from value A to value B, then deactivate A. Useful for duplicates such as "Data" and "Data Analysis". |
| **Delete** | Allowed only if the value has **never** been used. |

💡 To avoid messy duplicates, only EA/Admin roles can edit lists, and the add-form warns when a similar name already exists.

### 6.3 Statuses and priorities are editable, with guard rails

The tool's logic (overdue, open, active, progress) depends on what a status or priority *means*. So each value carries a small, fixed meaning that the user chooses:

**Status → State group** (decides how the tool treats it)

| State group | Meaning | Starting values | Counts as open? |
|---|---|---|---|
| Not started | Not begun | Not Started | Yes |
| Active | Being worked on | In-Progress, In-Review | Yes |
| Blocked | Cannot move | Blocked | Yes |
| Done | Finished | Completed | No |
| Cancelled | Dropped | Cancelled | No |

A user can add a status such as "On Hold" and assign it to the *Blocked* group, or rename "In-Review" to "Under Review". The system still understands it.

**Priority → Rank and weight cap.** A new priority such as "Critical" needs a rank (where it sits in the order) and a cap % (see section 7).

### 6.4 Other settings users can change 💡

| Setting | Default |
|---|---|
| Working days | Monday to Friday ✅ (weekend is configurable ✅) |
| "Due soon" window | 7 days |
| Maximum nesting depth | 5 |
| Default priority for new items | Medium |
| Default progress % per status | See section 7 |
| Weight caps per priority | See section 7 |
| Time zone | Asia/Kathmandu |

---

## 7. Status, progress and weights

### 7.1 Two different "statuses" — do not confuse them

| | Item status | CEO Attention status |
|---|---|---|
| Applies to | Every project / task | Only items flagged "Needs CEO Attention" |
| Values (editable) | Not Started, In-Progress, In-Review, Blocked, Completed, Cancelled | Pending, In-Progress, Completed |
| Set by | EA | EA |
| Answers | "Where is the *work*?" | "Where is the *CEO's involvement*?" |

✅ These are two separate fields.

### 7.2 Item status

| Status | Meaning | Default progress % (leaf items) |
|---|---|---|
| **Not Started** ✅ (default) | Not begun | 0% |
| **In-Progress** | Being worked on | 50% 💡 |
| **In-Review** | Work done, being checked | 80% 💡 |
| **Blocked** ✅ | Cannot move forward. The **blocked reason** is required so the EA knows what is stuck and why. | Keeps its last value 💡 |
| **Completed** | Finished | 100% |
| **Cancelled** ✅ | Dropped. Excluded from all progress and weight calculations. | Excluded |

Each status has a **progress rule** (a fixed %, "keep last value", or "exclude"), editable in settings.

### 7.3 Progress of a leaf item (a task with no sub-tasks)

1. The progress comes from its status (table above).
2. ✅ The EA can **override** it manually (for example set 70%).
3. If the EA changes the status later, the manual override is cleared 💡 (a note tells the EA).

### 7.4 Progress of a parent (project, sub-project or task with sub-tasks)

Parent progress is the **weighted sum of its children's progress**:

```
parent progress = Σ ( weight of child × progress of child )
```

A child's **weight** is the share (as a percentage of the parent) that child counts for. Weights of all active children add up to 100%.

### 7.5 How weights are calculated (automatic mode)

✅ Your rule: **priority sets the upper limit** of a child's weight, and the **number of leaf items** under the child sets its value.

**Inputs for each child:**

- `leaves` = number of non-cancelled leaf tasks under that child. A task with no sub-tasks counts as 1. A project with no tasks (or only cancelled ones) is **excluded** from the weights (it shows N/A).
- `cap` = maximum share for its priority (editable). Defaults:

| Priority | Cap (max share of the parent) |
|---|---|
| Low | 25% |
| Medium | 50% |
| High | 75% |
| Urgent | 100% |

**Algorithm in words:**

1. Give each child a share in proportion to its leaf count.
2. Any child above its cap is **fixed at its cap**.
3. The leftover percentage is shared among the remaining children, again by leaf count.
4. Repeat until nobody is above their cap.
5. If every child is capped and the total is still below 100% (for example a lone Low-priority child), **ignore the caps** and use the plain leaf-count shares so the total is 100%.

**Algorithm in code:**

```python
def auto_weights(children, budget=100.0):
    """children: auto-mode items with .leaves and .cap (percentage points).
       budget: percentage left for them after manual weights are taken out."""
    fixed = {}
    free = list(children)
    while free:
        pool = budget - sum(fixed.values())
        total = sum(c.leaves for c in free)
        proposal = {c: pool * c.leaves / total for c in free}
        over = [c for c in free if proposal[c] > c.cap]
        if not over:
            fixed.update(proposal)
            return fixed
        for c in over:
            fixed[c] = c.cap
            free.remove(c)
    if abs(sum(fixed.values()) - budget) < 1e-9:
        return fixed
    # every child capped and budget not used up: ignore caps
    total = sum(c.leaves for c in children)
    return {c: budget * c.leaves / total for c in children}
```

### 7.6 Worked examples

**Example A — your example.** A project with two Medium tasks, one leaf each. Raw shares are 50% / 50%. Both are at (not above) the Medium cap of 50%. Result: **50% each**.

**Example B — caps in action.** Three tasks under one project:

| Task | Priority | Leaves | Raw share | Cap | Final weight |
|---|---|---|---|---|---|
| A | Medium | 3 | 30% | 50% | **50%** |
| B | High | 1 | 10% | 75% | **25%** |
| C | Low | 6 | 60% | 25% | **25%** |

Steps: C is above its cap → fixed at 25%. The remaining 75% is split 3 : 1 between A and B → A would get 56.25%, which is above its cap → A fixed at 50%. B takes the remaining 25%.

If A is 60% done, B is 0% and C is 100%:
`0.50 × 60 + 0.25 × 0 + 0.25 × 100 = 55%` project progress.

### 7.7 Manual weights (EA override)

- ✅ The EA can type a weight for any child. That child switches to **Manual** and is **frozen**: edits, new siblings, status changes or priority changes never alter it.
- ✅ The child stays frozen **until the EA switches it back to Auto** ("Reset to auto" button).
- Auto children share what is left: `100% − sum of manual weights`, using the algorithm above.
- Validation: manual weights must not total more than 100%. If they total exactly 100% while Auto siblings exist, warn that those siblings will get 0%.
- ✅ Auto weights **do** recalculate when something structural changes (a child is added, removed, cancelled, or its priority or leaf count changes). Priority changes are accepted as a cause of recalculation.
- 💡 A parent that contains any manual weight shows a small **"weights manual"** badge, so the EA knows its progress is not fully automatic.

### 7.8 Parent status vs parent progress

💡 A parent's **status** is set by the EA, not by the system. When every child is Completed or Cancelled, the tool only *suggests*: "All children are done — mark as Completed?"

---

## 8. Due dates, days left and deadline flags

### 8.1 Dates on an item

- ✅ **Start date** — optional.
- ✅ **Due date** — the end date. 💡 Items without a due date show "No due date" and are never Overdue.
- ✅ **Days left** — shown in tables and on the dashboard. 💡 Calculated in calendar days: `due date − today`. A negative number is shown as "3 days overdue".
- 💡 **Completed on** is filled automatically when the status becomes Completed.

### 8.2 Deadline flag (automatic)

| Flag | Condition |
|---|---|
| **Completed** | Status is in the Done group |
| *(no flag, shown as Cancelled)* | Status is Cancelled |
| **Overdue** | Open and due date is before today |
| **Due today** | Open and due date is today |
| **Due soon** | Open and due within the next 7 days (window is a setting) |
| **On track** | Open and due later than the window |
| *(No due date)* | No due date set 💡 |

✅ These five flags match your notes: Overdue, Due today, Completed, Due soon (7 days), On track.

### 8.3 Child due date later than parent due date

✅ When a child's due date is **later** than its parent's:

1. The user sees a **warning** before saving.
2. If they confirm, the **parent's due date is moved** to the child's due date.
3. If that makes the parent later than *its* parent, the change **cascades upward**.
4. 💡 Every automatic extension is written to the activity log, and the EA sees a notice listing which ancestors moved. This matters because an extension can change an item from Overdue to On track without anyone noticing.

### 8.4 Working days

✅ The default working week is **Monday to Friday**, and it is configurable (Nepal's weekend is Saturday, so some teams change it). Working days are used for recurring rules (section 11).

---

## 9. CEO Attention

### 9.1 Purpose

A way for the EA to mark items the CEO must look at, and to track that conversation separately from the work itself.

### 9.2 Rules

1. ✅ Field: **Needs CEO Attention** — Yes or No, **default No**. (Your notes: "either CEO / blank".)
2. ✅ **Only EAs can set or clear it.**
3. ✅ When Yes, a second field appears: **CEO Attention status** — Pending, In-Progress, Completed (editable).
4. 💡 Setting the flag to Yes starts the CEO status at Pending and records who and when.
5. 💡 Marking the CEO status Completed keeps the flag at Yes (so history remains) but removes the item from the "currently needs attention" views. Clearing the flag sets it back to No and is logged.
6. 💡 An optional short **note to CEO** ("why is this flagged?").
7. ✅ In lists, items that need CEO attention are shown **first**, then other open items, then completed ones.
8. ✅ The flag works on any level: project, sub-project, task, sub-task.

---

## 10. Follow-ups

### 10.1 What is a follow-up?

A scheduled check-in on a work item, plus a record of what happened. Example: "Follow up with Engineering on the API on 12 Nov" → on 12 Nov the EA writes "They confirmed delivery by 20 Nov" and marks it Done.

### 10.2 Rules

1. ✅ Follow-ups are **optional**, entered only when needed.
2. ✅ An item can have **many** follow-ups (project, sub-project, task, sub-task).
3. ✅ Every follow-up is **kept in a log**, so the EA can always see what happened on each one.
4. ✅ Remarks support **rich text**: bold, italic, headings and paragraphs.
5. ✅ The item shows **Next follow-up** (the earliest upcoming one) and **Last updated status** (from the latest logged follow-up).
6. ✅ Follow-ups are separate from the due date. The due date belongs to the work; follow-ups are check-ins along the way.
7. 💡 Scheduling a follow-up after the item's due date shows a warning but is allowed.

### 10.3 Follow-up fields 💡

| Field | Notes |
|---|---|
| Follow-up date | Required |
| Status | Scheduled, Done, Missed, Postponed, Cancelled |
| Remarks / outcome | Rich text, filled when the follow-up happens |
| Logged on / by | Automatic |
| Postponed from | Link to the earlier follow-up, if this one is a postponement |

### 10.4 Follow-up lifecycle

```
Scheduled ──(date arrives, EA logs outcome)──▶ Done
    │
    ├──(EA acts BEFORE the date)──▶ Postponed (new date entered)
    ├──(EA acts BEFORE the date)──▶ Cancelled
    └──(date passes, nothing logged)──▶ Missed (automatic flag)
```

- ✅ **Auto-flag:** when the follow-up date passes without an outcome, it is flagged automatically (Missed).
- ✅ **Before** the follow-up date, the user can mark it **Postponed** or **Cancelled**.
- 💡 Postponing keeps the old entry in the log (status Postponed) and creates a **new Scheduled follow-up** with the new date, linked to the old one. Nothing is overwritten.
- 💡 A Missed follow-up can still be closed later by logging its outcome (it becomes Done, with a note that it was late).

---

## 11. Recurring tasks

### 11.1 Task type

✅ Every task is either **One-time (manual)** or **Recurring**.

### 11.2 Recurrence options

✅ Daily · Weekly · Monthly · **Every X days** (the user types X).

| Option | Setup 💡 |
|---|---|
| Daily | Optional "skip non-working days" |
| Weekly | Choose weekday(s) |
| Monthly | Choose day of month. If that day does not exist (for example the 31st), use the last day of the month. |
| Every X days | Counted from the previous scheduled date |

All dates use the **AD calendar** ✅.

### 11.3 How occurrences are created ✅

1. Each repetition is a **new task**. The old one is never reset, so old data is kept.
2. The next occurrence is created **only when the previous one is Completed or Cancelled**.
3. If the previous one is **Cancelled**, it stays cancelled and the next one is created.
4. If the previous one is **not completed**, the EA must change its status (Completed or Cancelled) before the next is created.
5. When the previous one is closed, the new occurrence is created immediately. Its due date is the **next scheduled date on or after today** — missed past dates are not back-filled. 💡
6. While the previous one is still open and the next scheduled date has passed, the series shows a **"waiting on previous"** marker 💡 so the missed cycle stays visible.

### 11.4 Editing a series ✅

- Editing the **series** (title, priority, assignment, rule) affects **future occurrences only**. Past ones are never changed.
- Editing a single occurrence affects only that occurrence.
- A series can be ended with an end date or stopped by the EA 💡.

### 11.5 Behavior on non-working days ❓

💡 If a scheduled date falls on a non-working day, move it to the next working day (a setting). Please confirm.

---

## 12. Meetings

### 12.1 Meetings are a separate record ✅

A meeting is **not** a task. It has its own list and pages.

### 12.2 Meeting types ✅

- **Weekly meeting**
- **Monthly meeting**
- **Other** — "General discussion". The list of meeting types is editable, so users can add new types.

### 12.3 Meeting fields 💡

| Field | Notes |
|---|---|
| Title | Required |
| Type | From the meeting-type list |
| Date and time | |
| Attendees | Team members (reference only) |
| Agenda | Rich text |
| Notes / minutes | Rich text |
| Status | Scheduled, Held, Cancelled |
| Originated from | ✅ See below |
| Items created from this meeting | ✅ See below |

### 12.4 Connections between meetings and work ✅

A meeting can **come from** any project, sub-project, task, sub-task, or another meeting. A meeting can also **create** any of those, including another meeting. Both directions are one link between two records.

```
Task "Prepare Q4 report"  ──generated──▶  Weekly meeting 10 Nov
Weekly meeting 10 Nov     ──generated──▶  Task "Fix dashboard bug"
Weekly meeting 10 Nov     ──generated──▶  Monthly meeting (review)
```

- On any record, **Originated from** shows its source(s); **Generated items** shows what came out of it.
- 💡 On a meeting page, the EA can create a task directly ("action item") and the link is set automatically.
- ✅ **Cycle guard:** the tool refuses a link that would create a loop (A generated B generated A, or an item linked to itself). The user sees a clear message.

### 12.5 Recurring meetings ❓

💡 Weekly and monthly meetings use the same recurrence engine as tasks, but a meeting happens whether or not the previous one is "closed", so the next meeting should be created **on schedule**, not after the previous one is closed. Please confirm.

---

## 13. Screens: dashboard, task list, summaries and filters

### 13.1 Main navigation 💡

Dashboard · Tasks · Projects · Meetings (Weekly, Monthly, Other) · Follow-ups · Settings (lists and configuration)

### 13.2 Dashboard ✅

Cards (each shows a number and is **clickable** — it opens the task list with that filter applied):

| Card | Definition |
|---|---|
| **Open tasks** | Status not in the Done or Cancelled group |
| **Overdue** (already due) | Open and due date before today |
| **Due in next X days** | Open and due between today and today + X. ✅ Default 7; the user can change X and the unit (days / weeks / month) |
| **Active tasks** | Status in the Active group (In-Progress, In-Review) 💡 ❓ |
| **Needs CEO Attention** | Flag = Yes and CEO status not Completed 💡 |

💡 Also on the dashboard: the list of CEO Attention items at the top, upcoming follow-ups, and follow-ups flagged Missed.

### 13.3 Summary strip on every page ✅

Each page has a short summary row (numbers such as open, overdue, due soon). ✅ **Clicking a number filters the page.** ✅ Users can also click to filter by **department, project or task**.

### 13.4 Task list ✅

**Filter row** (as in your sketch):

`All | Open Tasks | Overdue | Due in next [__] [days/weeks/month] | Needs CEO Attention`

**Filter levels:**

| Level | Filter | Values |
|---|---|---|
| 1 | **Project / Task** selection box | Project, Task (or All) |
| 2 | Time / state | Open Task · Overdue (already due) · Due (in next X days/weeks/month) · Active Task |
| 3 | **Needs CEO Attention** | Yes / No (**default No** ✅) |
| 3a | **CEO Attention status** (when level 3 = Yes) | Pending / In-Progress / Completed |

💡 Additional filters: department, sub-domain, team member, category, priority, status, search by name.

**Default sort ✅:** (1) Needs CEO Attention first, (2) then open items, (3) then completed. 💡 Inside each group: due date soonest first (items with no due date last), then priority rank. Cancelled items last.

**Columns 💡:** Name · Type · Status · Priority · Category · Department / sub-domain · Team members · Due date · **Days left** ✅ · Deadline flag · Progress % · Next follow-up · CEO Attention · Last updated status.

### 13.5 Item detail page 💡

Header (name, type, status, priority, flags) → Description → Assignment and dates → Progress and weights (children with their weights) → Children (sub-projects, tasks, sub-tasks) → Follow-up log → Meetings and links (Originated from / Generated) → Activity log.

### 13.6 Create / edit form 💡

Order: Type → Name → Parent → Department / sub-domain / team members → Category → Priority → Start and due dates → Task type (One-time / Recurring) → Description → CEO Attention (EA). Defaults: status Not Started, priority Medium, CEO Attention No, Task type One-time.

### 13.7 Project tree view 💡

A collapsible tree with progress % and weight on each node, like your diagram (P → P11 → T111 …). A badge shows "weights manual" where it applies.

---

## 14. Permissions

| Action | EA | Admin 💡 | CEO viewer (later) | Team member |
|---|---|---|---|---|
| View dashboard, items, follow-ups, meetings | ✅ | ✅ | ✅ | No login |
| Create / edit projects, tasks, follow-ups, meetings | ✅ | ✅ | — | — |
| Archive items | ✅ | ✅ | — | — |
| **Set / clear Needs CEO Attention** | ✅ | ✅ (Admin is an EA-level role) | — | — |
| Override progress and weights | ✅ | ✅ | — | — |
| Add / edit / merge / deactivate list values (categories, departments, etc.) | ✅ | ✅ | — | — |
| Change system settings (working days, caps, windows) | — 💡 | ✅ | — | — |
| Manage users | — | ✅ | — | — |
| View activity log | ✅ | ✅ | ✅ 💡 | — |

💡 If the EA is the only user at first, give that person the Admin role as well.

---

## 15. Activity log (audit trail)

✅ Principle: "nothing changes silently". 💡 Every change is recorded permanently:

- **What:** the record (item, follow-up, meeting, list value, setting), the field, old value and new value.
- **Who:** the user, or "System" for automatic changes.
- **When:** timestamp.
- **Why** (for automatic changes): for example "Parent due date extended because child T-120 was set later" or "Follow-up flagged Missed because the date passed".

Always logged: status changes, due-date changes (including automatic parent extensions), CEO flag set/cleared, weight mode changes and manual weights, progress overrides, follow-up changes, recurring occurrences created, list edits (add, rename, merge, deactivate), parent changes (moves) and archiving.

The log cannot be edited or deleted by users.

---

## 16. Notifications, exports and non-functional needs 💡

### 16.1 Notifications (later phase)

- Daily digest to the EA: overdue items, items due today, follow-ups due today, follow-ups flagged Missed, items waiting on a previous recurring occurrence.
- Optional digest to the CEO viewer: items needing CEO Attention.
- Delivery channel (email / in-app) is to be decided.

### 16.2 Exports

- Export any filtered list to **CSV** and **PDF**.
- A one-page "CEO review" PDF: CEO Attention items with latest follow-up outcome.

### 16.3 Non-functional needs

| Area | Requirement |
|---|---|
| Time zone | Asia/Kathmandu; all "today" calculations use it |
| Calendar | AD (Gregorian) only ✅ |
| Security | Login required, role-based access, HTTPS, regular backups |
| Performance | Lists and dashboard load in under 2 seconds for thousands of items |
| Data safety | No hard deletes of work items; archive instead |
| Browser support | Current versions of Chrome, Edge, Safari and Firefox; usable on a phone |
| Accessibility | Do not rely on color alone; flags also have text labels |

---

## 17. Data model (tables and SQL)

This is a **logical design** written for PostgreSQL 💡. It can be adapted to another database. Names are suggestions.

### 17.1 Big picture

```
app_user

department ─< sub_domain
team_member ─< team_member_membership >─ department / sub_domain

category   priority   status   ceo_attention_status   followup_status   meeting_type   (editable lists)

recurrence_series ─< work_item   (occurrences)
work_item ─< work_item            (parent / child)
work_item ─< work_item_department / work_item_sub_domain / work_item_team_member
work_item ─< followup

meeting ─< meeting_attendee
item_link  (links work items and meetings in either direction)

activity_log   setting
```

### 17.2 SQL

```sql
-- ============ USERS ============
CREATE TABLE app_user (
  id          bigserial PRIMARY KEY,
  name        text NOT NULL,
  email       text NOT NULL UNIQUE,
  role        text NOT NULL CHECK (role IN ('ea','admin','ceo_viewer')),
  is_active   boolean NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- ============ EDITABLE LISTS ============
CREATE TABLE department (
  id          serial PRIMARY KEY,
  name        text NOT NULL UNIQUE,
  color       text,
  sort_order  int  NOT NULL DEFAULT 0,
  is_active   boolean NOT NULL DEFAULT true
);

CREATE TABLE sub_domain (
  id            serial PRIMARY KEY,
  department_id int  NOT NULL REFERENCES department(id),
  name          text NOT NULL,
  color         text,
  sort_order    int  NOT NULL DEFAULT 0,
  is_active     boolean NOT NULL DEFAULT true,
  UNIQUE (department_id, name)
);

CREATE TABLE team_member (
  id         serial PRIMARY KEY,
  name       text NOT NULL,
  is_active  boolean NOT NULL DEFAULT true
);

-- a person can belong to one or more departments / sub-domains
CREATE TABLE team_member_membership (
  id             serial PRIMARY KEY,
  team_member_id int NOT NULL REFERENCES team_member(id) ON DELETE CASCADE,
  department_id  int NOT NULL REFERENCES department(id),
  sub_domain_id  int REFERENCES sub_domain(id)
);
CREATE UNIQUE INDEX uq_membership
  ON team_member_membership (team_member_id, department_id, COALESCE(sub_domain_id, 0));

CREATE TABLE category (
  id          serial PRIMARY KEY,
  name        text NOT NULL UNIQUE,
  color       text,
  sort_order  int  NOT NULL DEFAULT 0,
  is_active   boolean NOT NULL DEFAULT true
);

CREATE TABLE priority (
  id          serial PRIMARY KEY,
  name        text NOT NULL UNIQUE,
  rank        int  NOT NULL,                 -- higher = more important
  weight_cap  numeric(5,2) NOT NULL CHECK (weight_cap BETWEEN 0 AND 100),
  color       text,
  is_active   boolean NOT NULL DEFAULT true
);

CREATE TABLE status (
  id             serial PRIMARY KEY,
  name           text NOT NULL UNIQUE,
  state_group    text NOT NULL CHECK (state_group IN
                   ('not_started','active','blocked','done','cancelled')),
  progress_rule  text NOT NULL CHECK (progress_rule IN ('fixed','keep_last','exclude')),
  progress_value numeric(5,2) CHECK (progress_value BETWEEN 0 AND 100),
  color          text,
  sort_order     int  NOT NULL DEFAULT 0,
  is_active      boolean NOT NULL DEFAULT true
);

CREATE TABLE ceo_attention_status (
  id          serial PRIMARY KEY,
  name        text NOT NULL UNIQUE,
  is_final    boolean NOT NULL DEFAULT false,   -- true for "Completed"
  color       text,
  sort_order  int  NOT NULL DEFAULT 0,
  is_active   boolean NOT NULL DEFAULT true
);

CREATE TABLE followup_status (
  id          serial PRIMARY KEY,
  name        text NOT NULL UNIQUE,
  state_group text NOT NULL CHECK (state_group IN
                ('scheduled','done','missed','postponed','cancelled')),
  color       text,
  is_active   boolean NOT NULL DEFAULT true
);

CREATE TABLE meeting_type (
  id          serial PRIMARY KEY,
  name        text NOT NULL UNIQUE,
  color       text,
  sort_order  int  NOT NULL DEFAULT 0,
  is_active   boolean NOT NULL DEFAULT true
);

-- ============ SETTINGS ============
CREATE TABLE setting (
  key    text PRIMARY KEY,
  value  jsonb NOT NULL
);

-- ============ RECURRING SERIES ============
CREATE TABLE recurrence_series (
  id                  bigserial PRIMARY KEY,
  kind                text NOT NULL CHECK (kind IN ('task','meeting')),
  rule_type           text NOT NULL CHECK (rule_type IN
                        ('daily','weekly','monthly','every_x_days')),
  interval_days       int,                  -- for every_x_days
  weekdays            smallint[],           -- for weekly (1=Mon ... 7=Sun)
  day_of_month        smallint,             -- for monthly
  skip_non_working    boolean NOT NULL DEFAULT true,
  start_date          date NOT NULL,
  end_date            date,
  is_active           boolean NOT NULL DEFAULT true,
  template            jsonb NOT NULL,       -- fields copied to each new occurrence
  last_scheduled_date date,
  created_by          bigint REFERENCES app_user(id),
  created_at          timestamptz NOT NULL DEFAULT now()
);

-- ============ WORK ITEMS ============
CREATE TABLE work_item (
  id                      bigserial PRIMARY KEY,
  item_type               text NOT NULL CHECK (item_type IN ('project','task')),
  parent_id               bigint REFERENCES work_item(id),
  name                    text NOT NULL,
  description             text,
  status_id               int  NOT NULL REFERENCES status(id),
  blocked_reason          text,
  blocked_since           date,
  priority_id             int  NOT NULL REFERENCES priority(id),
  category_id             int  NOT NULL REFERENCES category(id),
  start_date              date,
  due_date                date,
  completed_on            date,

  progress_override       numeric(5,2) CHECK (progress_override BETWEEN 0 AND 100),
  progress_cached         numeric(5,2),     -- NULL = N/A
  weight_mode             text NOT NULL DEFAULT 'auto'
                            CHECK (weight_mode IN ('auto','manual')),
  weight_manual           numeric(5,2) CHECK (weight_manual BETWEEN 0 AND 100),
  weight_cached           numeric(5,2),

  needs_ceo_attention     boolean NOT NULL DEFAULT false,
  ceo_attention_status_id int REFERENCES ceo_attention_status(id),
  ceo_note                text,
  ceo_flagged_by          bigint REFERENCES app_user(id),
  ceo_flagged_at          timestamptz,

  task_kind               text NOT NULL DEFAULT 'one_time'
                            CHECK (task_kind IN ('one_time','recurring')),
  series_id               bigint REFERENCES recurrence_series(id),
  occurrence_no           int,

  is_archived             boolean NOT NULL DEFAULT false,
  created_by              bigint REFERENCES app_user(id),
  created_at              timestamptz NOT NULL DEFAULT now(),
  updated_by              bigint REFERENCES app_user(id),
  updated_at              timestamptz NOT NULL DEFAULT now(),

  CHECK (start_date IS NULL OR due_date IS NULL OR start_date <= due_date),
  CHECK (weight_mode = 'auto' OR weight_manual IS NOT NULL),
  CHECK (needs_ceo_attention = false OR ceo_attention_status_id IS NOT NULL),
  CHECK (item_type = 'task' OR task_kind = 'one_time')   -- only tasks recur
);

CREATE INDEX ix_work_item_parent  ON work_item(parent_id);
CREATE INDEX ix_work_item_due     ON work_item(due_date);
CREATE INDEX ix_work_item_status  ON work_item(status_id);
CREATE INDEX ix_work_item_ceo     ON work_item(needs_ceo_attention) WHERE needs_ceo_attention;
CREATE INDEX ix_work_item_series  ON work_item(series_id);

-- Assignment (department required at the application level; sub-domain and people optional)
CREATE TABLE work_item_department (
  work_item_id  bigint NOT NULL REFERENCES work_item(id) ON DELETE CASCADE,
  department_id int    NOT NULL REFERENCES department(id),
  PRIMARY KEY (work_item_id, department_id)
);
CREATE TABLE work_item_sub_domain (
  work_item_id  bigint NOT NULL REFERENCES work_item(id) ON DELETE CASCADE,
  sub_domain_id int    NOT NULL REFERENCES sub_domain(id),
  PRIMARY KEY (work_item_id, sub_domain_id)
);
CREATE TABLE work_item_team_member (
  work_item_id   bigint NOT NULL REFERENCES work_item(id) ON DELETE CASCADE,
  team_member_id int    NOT NULL REFERENCES team_member(id),
  PRIMARY KEY (work_item_id, team_member_id)
);

-- ============ FOLLOW-UPS ============
CREATE TABLE followup (
  id                bigserial PRIMARY KEY,
  work_item_id      bigint NOT NULL REFERENCES work_item(id),
  followup_date     date   NOT NULL,
  status_id         int    NOT NULL REFERENCES followup_status(id),
  remarks           text,                    -- rich text (HTML or Markdown)
  postponed_from_id bigint REFERENCES followup(id),
  outcome_logged_at timestamptz,
  created_by        bigint REFERENCES app_user(id),
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ix_followup_item ON followup(work_item_id, followup_date);

-- ============ MEETINGS ============
CREATE TABLE meeting (
  id              bigserial PRIMARY KEY,
  title           text NOT NULL,
  meeting_type_id int  NOT NULL REFERENCES meeting_type(id),
  scheduled_at    timestamptz,
  status          text NOT NULL DEFAULT 'scheduled'
                    CHECK (status IN ('scheduled','held','cancelled')),
  agenda          text,
  notes           text,
  series_id       bigint REFERENCES recurrence_series(id),
  occurrence_no   int,
  is_archived     boolean NOT NULL DEFAULT false,
  created_by      bigint REFERENCES app_user(id),
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE meeting_attendee (
  meeting_id     bigint NOT NULL REFERENCES meeting(id) ON DELETE CASCADE,
  team_member_id int    NOT NULL REFERENCES team_member(id),
  PRIMARY KEY (meeting_id, team_member_id)
);

-- ============ LINKS ("originated from" / "generated") ============
-- Meaning: the SOURCE generated the TARGET.
-- "Originated from" on a record = the sources that point to it.
CREATE TABLE item_link (
  id          bigserial PRIMARY KEY,
  source_type text   NOT NULL CHECK (source_type IN ('work_item','meeting')),
  source_id   bigint NOT NULL,
  target_type text   NOT NULL CHECK (target_type IN ('work_item','meeting')),
  target_id   bigint NOT NULL,
  created_by  bigint REFERENCES app_user(id),
  created_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (source_type, source_id, target_type, target_id),
  CHECK (NOT (source_type = target_type AND source_id = target_id))
);
CREATE INDEX ix_link_target ON item_link(target_type, target_id);

-- ============ ACTIVITY LOG (append-only) ============
CREATE TABLE activity_log (
  id            bigserial PRIMARY KEY,
  entity_type   text   NOT NULL,
  entity_id     bigint NOT NULL,
  action        text   NOT NULL,
  field_name    text,
  old_value     jsonb,
  new_value     jsonb,
  reason        text,
  is_automatic  boolean NOT NULL DEFAULT false,
  actor_id      bigint REFERENCES app_user(id),   -- NULL = system
  created_at    timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ix_activity_entity ON activity_log(entity_type, entity_id, created_at DESC);
```

### 17.3 Starting data (seed)

```sql
INSERT INTO priority (name, rank, weight_cap) VALUES
  ('Low',1,25), ('Medium',2,50), ('High',3,75), ('Urgent',4,100);

INSERT INTO status (name, state_group, progress_rule, progress_value, sort_order) VALUES
  ('Not Started','not_started','fixed',0,1),
  ('In-Progress','active','fixed',50,2),
  ('In-Review','active','fixed',80,3),
  ('Blocked','blocked','keep_last',NULL,4),
  ('Completed','done','fixed',100,5),
  ('Cancelled','cancelled','exclude',NULL,6);

INSERT INTO ceo_attention_status (name, is_final, sort_order) VALUES
  ('Pending',false,1), ('In-Progress',false,2), ('Completed',true,3);

INSERT INTO followup_status (name, state_group) VALUES
  ('Scheduled','scheduled'), ('Done','done'), ('Missed','missed'),
  ('Postponed','postponed'), ('Cancelled','cancelled');

INSERT INTO category (name, sort_order) VALUES
  ('Data Analysis',1), ('Planning',2), ('Documentation',3), ('Research',4),
  ('Development',5), ('Discussion',6), ('Meeting',7), ('Others',8);

INSERT INTO department (name, sort_order) VALUES
  ('G&E',1), ('Engineering',2), ('Data',3), ('Brand',4), ('Other',5);

INSERT INTO meeting_type (name, sort_order) VALUES
  ('Weekly',1), ('Monthly',2), ('Other',3);

INSERT INTO setting (key, value) VALUES
  ('working_days',     '[1,2,3,4,5]'),   -- Monday to Friday
  ('due_soon_days',    '7'),
  ('max_nesting_depth','5'),
  ('timezone',         '"Asia/Kathmandu"');
```

### 17.4 Useful queries

**Days left and deadline flag (view):**

```sql
CREATE VIEW work_item_deadline AS
SELECT w.id,
       (w.due_date - current_date) AS days_left,
       CASE
         WHEN s.state_group = 'done'       THEN 'completed'
         WHEN s.state_group = 'cancelled'  THEN 'cancelled'
         WHEN w.due_date IS NULL           THEN 'no_due_date'
         WHEN w.due_date <  current_date   THEN 'overdue'
         WHEN w.due_date =  current_date   THEN 'due_today'
         WHEN w.due_date <= current_date +
              (SELECT (value #>> '{}')::int FROM setting WHERE key = 'due_soon_days')
                                           THEN 'due_soon'
         ELSE 'on_track'
       END AS deadline_flag
FROM work_item w
JOIN status s ON s.id = w.status_id
WHERE NOT w.is_archived;
```

(Run the database session in the Asia/Kathmandu time zone so `current_date` is correct.)

**Cycle guard for links.** Before inserting a link *S → T*, reject it if *S* can already be reached from *T*:

```sql
WITH RECURSIVE reach(t, i) AS (
  SELECT target_type, target_id
  FROM item_link
  WHERE source_type = :t_type AND source_id = :t_id
  UNION
  SELECT l.target_type, l.target_id
  FROM item_link l
  JOIN reach r ON l.source_type = r.t AND l.source_id = r.i
)
SELECT EXISTS (SELECT 1 FROM reach WHERE t = :s_type AND i = :s_id) AS would_create_cycle;
```

Also reject when *S* and *T* are the same record. The same idea (walk up `parent_id`) prevents a work item from being moved under its own descendant.

**Nightly job — flag missed follow-ups** (run after midnight Asia/Kathmandu):

```sql
UPDATE followup f
SET status_id = (SELECT id FROM followup_status WHERE state_group = 'missed' LIMIT 1),
    updated_at = now()
WHERE f.followup_date < current_date
  AND f.status_id IN (SELECT id FROM followup_status WHERE state_group = 'scheduled');
-- also write one activity_log row per updated follow-up (is_automatic = true)
```

**Dashboard counts:**

```sql
SELECT
  count(*) FILTER (WHERE s.state_group NOT IN ('done','cancelled'))                       AS open_items,
  count(*) FILTER (WHERE s.state_group NOT IN ('done','cancelled')
                   AND w.due_date < current_date)                                          AS overdue,
  count(*) FILTER (WHERE s.state_group NOT IN ('done','cancelled')
                   AND w.due_date BETWEEN current_date AND current_date + :x_days)         AS due_in_next_x,
  count(*) FILTER (WHERE s.state_group = 'active')                                         AS active_items,
  count(*) FILTER (WHERE w.needs_ceo_attention AND NOT cs.is_final)                        AS needs_ceo_attention
FROM work_item w
JOIN status s ON s.id = w.status_id
LEFT JOIN ceo_attention_status cs ON cs.id = w.ceo_attention_status_id
WHERE NOT w.is_archived AND w.item_type = 'task';
```

### 17.5 Where logic lives (application, not database)

| Logic | Why in the application |
|---|---|
| Weight calculation and progress roll-up (section 7) | Needs the algorithm above; results are saved in `progress_cached` and `weight_cached` and recalculated when a relevant change happens |
| Parent due-date extension and cascade (section 8.3) | Needs the warning and confirmation step, plus a log entry |
| Recurring generation (section 11) | Triggered when an occurrence is closed and by a nightly job |
| Rule: Blocked requires a reason | Form validation |
| Rule: sub-domain must belong to a chosen department | Form validation |
| Nesting depth limit and parent-cycle check | Checked on create and move |

---

## 18. Business rules checklist

| # | Rule |
|---|---|
| 1 | A project may be empty; it shows "No tasks yet" and progress N/A ✅ |
| 2 | A task may be standalone ✅ |
| 3 | Tasks can have sub-tasks; projects can have sub-projects (optional) ✅ |
| 4 | Default status is Not Started ✅ |
| 5 | Blocked requires a reason 💡 |
| 6 | Cancelled items are excluded from progress, weights and "open" counts ✅ |
| 7 | At least one department is required on every item ✅ |
| 8 | Sub-domain and team members are optional; team members are reference-only ✅ |
| 9 | Category (type of work) and department (who) are separate lists ✅ |
| 10 | Only EAs can set or clear Needs CEO Attention; default No ✅ |
| 11 | CEO Attention status is separate from item status ✅ |
| 12 | Items needing CEO Attention sort first, then open, then completed ✅ |
| 13 | Deadline flags: Overdue, Due today, Due soon (7 days), On track, Completed ✅ |
| 14 | A child due date later than its parent's: warn, then extend the parent (and ancestors) and log it ✅ |
| 15 | Follow-ups are optional, unlimited per item, and always logged ✅ |
| 16 | A follow-up whose date passes with no outcome is flagged Missed automatically ✅ |
| 17 | Before the date, a follow-up can be Postponed or Cancelled ✅ |
| 18 | Recurring: each occurrence is a new task; the next is created only after the previous is Completed or Cancelled ✅ |
| 19 | Editing a recurring series affects future occurrences only ✅ |
| 20 | Meetings are separate records and can link to / from any work item or meeting ✅ |
| 21 | Links that would form a cycle are refused ✅ |
| 22 | Weights: priority sets the cap, leaf count sets the value ✅ |
| 23 | Manual weights are frozen until switched back to Auto ✅ |
| 24 | Priority changes may change Auto weights ✅ |
| 25 | Working days default to Monday–Friday and are configurable ✅ |
| 26 | AD calendar only ✅ |
| 27 | Every list is editable by users (add, rename, reorder, deactivate, merge) ✅ |
| 28 | Every automatic change is logged with a reason 💡 |
| 29 | Items are archived, never hard-deleted 💡 |

---

## 19. Edge cases

| Situation | What the tool does 💡 |
|---|---|
| Project has no tasks | Progress N/A, shown as "No tasks yet" |
| All of a parent's children are Cancelled | Parent progress N/A; the tool suggests cancelling or reviewing the parent |
| A child is added to a parent with manual weights | Manual siblings keep their weights; Auto siblings share the remainder. If nothing remains, warn the EA |
| Manual weights total more than 100% | Block saving with a clear message |
| A lone child with a low priority cap | Caps are ignored when every child is capped; the child counts 100% |
| Item moved to a different parent | Weights and progress recalculate; the move is logged |
| Priority renamed or its cap edited | Auto weights recalculate; Manual weights do not change |
| A status is deactivated while items use it | Old items keep it; it is hidden from new selections |
| Department deactivated while items use it | Same as above |
| Child due date later than parent | Warn, extend parent and ancestors, log, show notice |
| Parent is Completed but a child is still open | Warn the EA; allow it (the EA decides) |
| Recurring task: previous still open when next date arrives | Show "waiting on previous"; create nothing until the EA closes it |
| Recurring task cancelled | Stays cancelled; the next occurrence is created |
| Monthly rule on the 31st | Use the last day of shorter months |
| Scheduled date on a non-working day ❓ | Shift to the next working day (setting) |
| Follow-up date passes | Flagged Missed automatically |
| Follow-up postponed | Old one stays in the log as Postponed; a new Scheduled one is created and linked |
| Item has Needs CEO Attention and is then Cancelled | Flag stays for history; hidden from "currently needs attention" 💡 |
| Meeting linked to a task that is archived | Link remains; the archived item is shown greyed out |
| Two people edit the same item | Last save wins, with a warning if the record changed since it was opened |

---

## 20. Worked example: a day in the life

**Setup (once).** The Admin opens Settings and checks the lists: departments (G&E, Engineering, Data, Brand), categories, priorities and statuses. She adds a sub-domain "Remittance" under Engineering and a category "Vendor Management".

**Monday, 9:00 — create a project.**
The EA taps *New → Project*, enters "Q4 Merchant Report", picks Category *Data Analysis*, Priority *High*, Department *Data*, and Due date 30 Nov. Status defaults to Not Started. The project is empty, so it shows "No tasks yet".

**Monday, 9:10 — add tasks.**
She adds three tasks inside it:

1. "Pull transaction data" — Medium, due 10 Nov, 1 leaf.
2. "Build dashboard" — High, due 20 Nov, with 3 sub-tasks.
3. "Write summary" — Low, due 25 Nov, 1 leaf.

Auto weights (leaf counts 1 : 3 : 1, raw shares 20% / 60% / 20%): Task 2 is High (cap 75%) so 60% stays; Task 1 and Task 3 stay below their caps. Result: 20 / 60 / 20.

**Monday, 10:00 — meeting.**
In the Weekly meeting on Monday the CEO asks for an extra regional breakdown. The EA opens the meeting record, adds an action item "Add regional breakdown" as a task under the project. The task is linked "Originated from: Weekly meeting 2 Nov". Its due date is 28 Nov, which is earlier than the project's 30 Nov, so nothing moves. (If it had been 5 Dec, the tool would warn her and move the project's due date to 5 Dec.) Adding a fourth task also recalculates the Auto weights of its siblings.

**Tuesday — progress.**
"Pull transaction data" is set to In-Progress (50%). The EA types a manual progress of 70%, because she knows it is nearly done. The project progress updates automatically.

**Wednesday — blocked.**
"Build dashboard" is set to Blocked. The tool asks for a reason: "Waiting for API access from Engineering". Blocked since: 4 Nov. It appears under *Blocked* on filters, and the EA flags the whole project **Needs CEO Attention = Yes** with a note "API access delay". The CEO status starts at Pending.

**Wednesday — follow-up.**
The EA schedules a follow-up on the blocked task for Friday. On Friday she logs: "**Engineering confirmed** access by Tuesday" and marks it Done. A new follow-up is scheduled for next Wednesday. The task shows *Next follow-up: Wed* and *Last updated status: Engineering confirmed access by Tuesday*.

**Friday — missed follow-up.**
She forgets another follow-up scheduled for Friday. At midnight the system flags it **Missed**; Monday's dashboard shows it. She logs the outcome late and it becomes Done.

**Following week — recurring.**
"Send weekly status update" is a recurring task (weekly, Friday). When she marks this week's one Completed, the next one appears automatically, due next Friday. If she had left it open, nothing new would appear and the series would show "waiting on previous".

**The CEO review.**
Later (CEO view, phase 3), the CEO opens the dashboard and sees the project at the top under *Needs CEO Attention*, with its Pending status, blocked reason, and the latest follow-up outcome.

---

## 21. Phased roadmap 💡

### Phase 1 — Core (minimum useful product)

- Roles (EA / Admin), login
- Work item hierarchy (project, sub-project, task, sub-task)
- All fields, editable lists and settings
- Statuses, priorities, categories, departments, sub-domains, team members
- Due dates, days left, deadline flags
- Dashboard cards and task list with filters and sorting
- Needs CEO Attention flag and status
- Follow-ups with log and Missed flagging
- Activity log

### Phase 2 — Smart behavior

- Weighted progress and manual weights
- Recurring tasks
- Meetings, links and the cycle guard
- Parent due-date auto-extension with notices
- Tree view

### Phase 3 — Reach

- Read-only CEO view
- Notifications / daily digest
- CSV and PDF exports
- Team-member logins (optional)

### Later ideas

Dependencies between tasks, time tracking, calendar integration, mobile app, Bikram Sambat calendar.

---

## 22. Open questions and assumptions

### 22.1 Open questions ❓ (please decide)

| # | Question | My suggestion |
|---|---|---|
| 1 | Is a due date required on every item, or optional? | Required for tasks, optional for projects and meetings |
| 2 | Does "Active task" mean In-Progress and In-Review only? | Yes |
| 3 | Do recurring rules move dates that fall on non-working days? | Yes, to the next working day |
| 4 | Do weekly / monthly meetings repeat on schedule regardless of whether the previous one is closed? | Yes |
| 5 | Is the "end date" in your notes the same as the due date? | Yes, one field |
| 6 | Which department does each sub-domain (Topup/Admin, Remittance, Travel) belong to? | Decide during setup |
| 7 | Default priority for new items | Medium |
| 8 | Should "days left" count calendar days or working days? | Calendar days (working days as a later option) |
| 9 | Maximum nesting depth | 5 levels |
| 10 | Should changing a status clear a manual progress override? | Yes, with a notice |
| 11 | Who may edit the lists and settings? | EA edits lists; only Admin edits settings |
| 12 | Default progress per status (In-Progress 50%, In-Review 80%) | Keep, configurable |
| 13 | What does a Blocked item show if it was never started? | 0% |
| 14 | Should the CEO see the activity log? | Yes (read-only) |

### 22.2 Assumptions made

- The tool is used in English; times are in Asia/Kathmandu.
- Dates use the AD calendar only.
- One EA uses it at first; no simultaneous heavy editing.
- Rich text in remarks is stored as HTML or Markdown.
- Item IDs are internal numbers; display codes (for example P-12, T-45) can be added later.
- Department "G&E" is an assignable department as well as the name of the owning team.

---

*End of document.*
