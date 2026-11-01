# Design Guidelines — G&E Project Management Tool

**Version:** 0.1 (draft) · **Date:** 1 November 2026
**Based on:** `pm-tool-specification.md` (v0.1)
**Platform:** Web app (desktop first, responsive down to phone)
**Audience:** Designers and front-end engineers building the tool

**Legend:** ✅ firm rule · 💡 recommendation (change if you have a reason) · ❓ open decision

---

## Table of contents

1. Purpose and how to use this document
2. Design direction
3. Color
4. Typography
5. Spacing, grid and layout
6. Shape, borders and elevation
7. Iconography
8. App shell and navigation
9. Tabs, filter boxes and the summary strip
10. Tables, lists and the hierarchy tree
11. Dashboard
12. Page blueprints
13. Components
14. Light and dark mode
15. Motion
16. Content and microcopy
17. Accessibility
18. Responsive behavior
19. Print and PDF export
20. Design tokens (CSS reference)
21. QA checklist
22. Open design decisions

---

## 1. Purpose and how to use this document

This document turns the product specification into a visual and interaction system: colors, type, spacing, navigation, filters, tables, the dashboard and every reusable component, in both light and dark mode.

- **Tokens first.** Never hard-code a color, size or radius. Use the tokens in section 20. This is what makes dark mode, theming and later changes cheap.
- **Stack-agnostic.** Tokens are written as CSS variables but map one-to-one to any framework's theme object.
- **Spec terms.** Names such as *Needs CEO Attention*, *Days left*, *Deadline flag* and *Originated from* come from the specification. Use them exactly.

---

## 2. Design direction

### 2.1 Who and what this is for

- **Subject:** a work-tracking tool for the Executive Assistant (EA) to the CEO of a payments company, covering projects, tasks, follow-ups and meetings.
- **Primary user (v1):** the EA, who works in it for hours a day. Later, a read-only CEO view.
- **Primary job:** answer "where are we on this?" in seconds, and make sure nothing slips: overdue, blocked, missed follow-ups, and anything the CEO must look at.

### 2.2 Direction in one line

**A calm, dense desk ledger where one color is reserved for the thing that matters most: what needs the CEO's attention.**

### 2.3 Principles

1. ✅ **The table is the product.** The EA lives in lists. Invest in row design, inline editing, density and scanning before anything decorative.
2. ✅ **One signal color.** A deep plum is used *only* for Needs CEO Attention. Nothing else is plum. That is how the CEO flag stays instantly findable (see 3.4).
3. ✅ **State is never color alone.** Every status, flag and priority has a text label and/or an icon as well as a color.
4. ✅ **Quiet by default.** Neutral surfaces, thin borders, no decorative gradients, no shadows on resting elements. Color appears only when it carries meaning.
5. ✅ **Things that can be edited look editable.** Status, priority, due date and department can be changed in place, with a hover affordance, so the EA rarely opens a form.
6. ✅ **Nothing animates unless the user acted.** No entrance animations, no ambient motion (section 15).
7. 💡 **Honest empty and automatic states.** When the tool changes something itself (for example extends a parent's due date), it says so in plain words where the user is looking.

### 2.4 What we chose, and what we avoided on purpose

| Common default | What this design does instead | Why |
|---|---|---|
| Warm cream background with a terracotta accent | Cool, slightly blue-grey neutrals with a cobalt brand color | A work tool read for hours needs low glare and a neutral stage so status colors stand out |
| Near-black dark mode with one acid accent | Slate dark mode with layered surfaces and softened semantic colors | Keeps tables readable at night without neon |
| Every block turned into an identical rounded card with the same shadow | Content sits on the page or in bordered panels; radius changes with the element's level (4 / 6 / 8 / 12) | Hierarchy is visible in the shapes |
| All-caps tracked labels above everything | Sentence-case labels only | Easier to read, and less template chrome |
| Five identical KPI cards with big numbers and gradients | One connected summary strip with five clickable segments | It reads as one instrument and each number is a filter |
| Monospace for small labels | One sans family with tabular numerals | Numbers align without a code look |

---

## 3. Color

### 3.1 Base palette (the compact version)

| Name | Light | Dark | Role |
|---|---|---|---|
| **Slate paper** | `#F6F7F9` | `#0E1116` | App background |
| **Surface** | `#FFFFFF` | `#151A22` | Panels, tables, inputs |
| **Ink** | `#14181F` | `#E8ECF2` | Primary text |
| **Cobalt** | `#2B54D9` | `#7C9BFF` | Brand, primary actions, selected state, links |
| **Attention plum** | `#8E2A78` | `#F08FD4` | **Reserved** for Needs CEO Attention |
| **Border slate** | `#DDE1E8` | `#2A323E` | Hairlines and dividers |

### 3.2 Full neutral scale

| Token | Light | Dark | Use |
|---|---|---|---|
| `--bg` | `#F6F7F9` | `#0E1116` | Page background |
| `--surface` | `#FFFFFF` | `#151A22` | Panels, table body, inputs |
| `--surface-2` | `#EEF0F4` | `#1C222C` | Table header, hover rows, secondary panels, segmented controls |
| `--surface-3` | `#E4E8EE` | `#252D39` | Pressed / selected neutrals, progress tracks |
| `--border` | `#DDE1E8` | `#2A323E` | Default borders and dividers |
| `--border-strong` | `#C3CAD5` | `#3A4452` | Input borders, emphasized dividers |
| `--text` | `#14181F` | `#E8ECF2` | Primary text |
| `--text-2` | `#4A5463` | `#A9B3C2` | Secondary text, table headers |
| `--text-3` | `#5B6676` | `#8591A3` | Captions, placeholders, disabled labels |
| `--text-inverse` | `#FFFFFF` | `#0E1116` | Text on solid brand or danger fills |

Do not use pure `#000000` or pure `#FFFFFF` for text or backgrounds (the neutrals above are tinted slightly blue on purpose). White is allowed for the light-mode surface.

### 3.3 Brand (cobalt)

| Token | Light | Dark | Use |
|---|---|---|---|
| `--brand-600` | `#2B54D9` | `#7C9BFF` | Primary buttons, links, active nav text and icon |
| `--brand-700` | `#1F3FB0` | `#A5BBFF` | Hover on primary |
| `--brand-subtle` | `#E6ECFD` | `#1B2547` | Selected nav item, active filter, In-Progress chip background |
| `--brand-border` | `#B8C7F7` | `#33427A` | Outline of active filter boxes |
| `--focus-ring` | `#2B54D9` | `#7C9BFF` | Keyboard focus ring (2 px, 2 px offset) |

💡 To match a company brand color later, change only the `--brand-*` tokens.

### 3.4 Attention plum — the one signal color ✅

| Token | Light | Dark | Use |
|---|---|---|---|
| `--attention-fg` | `#8E2A78` | `#F08FD4` | Flag icon, "Needs CEO attention" text, nav badge |
| `--attention-bg` | `#FBE9F5` | `#3A1430` | Chip background, 4% row tint |
| `--attention-border` | `#E9B4DA` | `#6B2A5A` | Chip outline |

**Rules**

1. Plum appears **only** for: the CEO flag icon, the CEO attention chip, the CEO Attention nav badge, the "Needs CEO attention" segment on the dashboard strip, and the light row tint on flagged rows.
2. Plum is never used for charts, categories, departments, buttons or decoration.
3. A flagged row always shows the flag icon in its own narrow column, so the signal also works without color.

### 3.5 Semantic colors (status of work and time)

Each state has a **foreground** (text/icon) and a **background** (chip fill). Always pair with an icon and a text label.

| Meaning | Light fg | Light bg | Dark fg | Dark bg | Icon |
|---|---|---|---|---|---|
| Danger / Overdue | `#C62828` | `#FDECEC` | `#FF8A80` | `#3A1618` | alert-circle |
| Due today | `#B8390A` | `#FFEEDD` | `#FFA666` | `#3A2410` | clock |
| Due soon | `#8F5806` | `#FEF6D8` | `#F2C94C` | `#33290F` | calendar-clock |
| On track | `#4A5463` | `#EEF0F4` | `#A9B3C2` | `#1C222C` | check (outline) |
| Completed / success | `#17713F` | `#E3F4EA` | `#5FD08F` | `#12301F` | check-circle |
| Info / In-Progress | `#2B54D9` | `#E6ECFD` | `#7C9BFF` | `#1B2547` | loader |
| In-Review | `#0D6B64` | `#DDF3F0` | `#5CCBC0` | `#0F2E2B` | eye |
| Blocked | `#B42318` | `#FDECEA` | `#FF8F85` | `#3A1816` | octagon-x |
| Cancelled | `#5B6676` | `#EEF0F4` | `#8591A3` | `#1C222C` | ban |

Notes:

- "On track" is deliberately **neutral grey, not green**, so the eye is drawn to what is wrong, not what is fine.
- Overdue and Blocked share a red family. They are told apart by their icon and label, and Blocked chips use a fine diagonal hatch in the background (💡 optional) so they are distinguishable in grayscale.
- Cancelled items show their name with a strikethrough in lists.

### 3.6 Status, priority and flag mapping

| Field | Value | Style |
|---|---|---|
| **Item status** | Not Started | Neutral grey chip, dot icon |
| | In-Progress | Info (cobalt) chip |
| | In-Review | In-Review (teal) chip |
| | Blocked | Blocked (red) chip, hatch |
| | Completed | Success (green) chip |
| | Cancelled | Cancelled (grey) chip, struck-through name |
| **Priority** | Low / Medium / High / Urgent | **Signal-bar icon** (1 to 4 bars) in `--text-2`, plus the word. Only Urgent is colored (`Danger fg`). Custom priorities use rank to choose the number of bars (1 to 4). |
| **Deadline flag** | Overdue, Due today, Due soon, On track, Completed | Semantic chips from the table above |
| **CEO Attention** | Needs attention (Yes) | Plum chip with flag icon, plus the CEO status: Pending, In-Progress, Completed shown as small text beside it |

New statuses added by users inherit the color of their **state group** (not started, active, blocked, done, cancelled). The user can pick a different color from a fixed accessible palette, never a free hex.

### 3.7 Category and department colors

- Categories and departments carry an optional color (spec section 6). It is used as a **small dot** next to the name, never as a full chip fill, so these colors never compete with status colors.
- Offer a fixed palette of 10 accessible hues (excluding plum and the status reds, greens and ambers). Default order: cobalt, teal, ochre, slate, sky, indigo, olive, rust, rose-grey, graphite.

### 3.8 Chart palette

For the few charts the product has (progress bars, department workload):

| Series | Light | Dark |
|---|---|---|
| 1 | `#2B54D9` | `#7C9BFF` |
| 2 | `#0F766E` | `#5CCBC0` |
| 3 | `#B7791F` | `#E5B454` |
| 4 | `#64748B` | `#94A3B8` |
| 5 | `#6D4ED6` | `#A99BF0` |
| 6 | `#1D8FCB` | `#6DBDE8` |

Gridlines use `--border`. Labels use `--text-2`. Never encode meaning in color alone: add direct labels or patterns.

### 3.9 Contrast targets

Text must reach **4.5:1** (normal) or **3:1** (large text of 18 px+/14 px bold+, icons, input borders). The pairs above were chosen for this and **must be verified with a contrast checker before release**, in both modes.

---

## 4. Typography

### 4.1 Typefaces

| Role | Family | Fallbacks |
|---|---|---|
| **UI and content** ✅ | **IBM Plex Sans** (400, 500, 600) | `"Noto Sans Devanagari"`, system-ui, `"Segoe UI"`, Roboto, Arial, sans-serif |
| **Code / IDs** 💡 (rare) | IBM Plex Mono (400) | ui-monospace, Menlo, monospace |

Why one family: this is a data-dense work tool. A single, sturdy family with clear numerals is calmer than a pairing. IBM Plex Sans has distinct letterforms (useful for IDs and dates) and true tabular numerals.

✅ **Nepali (Devanagari) support.** Users in Kathmandu will write Nepali in names and remarks. List `Noto Sans Devanagari` right after Plex in the font stack so mixed text renders cleanly, and:

- Give Devanagari text a line-height of at least **1.6** (matras need room).
- Never apply letter-spacing to Devanagari.
- Test every table column and the rich-text editor with Nepali content.

✅ **Numerals.** Use tabular figures for every number column and counter:
`font-variant-numeric: tabular-nums;`

### 4.2 Type scale

Base size is **14 px** (a data tool; 16 px is used for page-level reading).

| Token | Size / line height | Weight | Use |
|---|---|---|---|
| `--text-xs` | 12 / 16 | 400, 500 | Captions, chip text, table meta, timestamps |
| `--text-sm` | 13 / 18 | 400, 500 | **Table cells**, filter boxes, secondary text |
| `--text-base` | 14 / 20 | 400, 500 | Body, inputs, buttons, nav items |
| `--text-md` | 16 / 24 | 500, 600 | Panel titles, section headings, drawer title |
| `--text-lg` | 20 / 28 | 600 | Page title |
| `--text-xl` | 24 / 32 | 600 | Large page title (detail page, dashboard greeting) |
| `--text-num` | 32 / 36 | 500 | Numbers in the dashboard summary strip |

Weights: **400** body, **500** labels, buttons and emphasized values, **600** headings. Do not use 700+.

Letter-spacing: normal. Use `-0.01em` only on `--text-num`.

### 4.3 Text rules

1. ✅ **Sentence case everywhere**: buttons, tabs, headings, table headers, filter labels. No all-caps labels.
2. ✅ **Line length** for descriptions, remarks and meeting notes: maximum **72 characters** (`max-width: 72ch`).
3. ✅ Table cells never wrap by default. They truncate with an ellipsis and show the full text in a tooltip. The **Name** column may wrap to two lines in comfortable density.
4. Links are `--brand-600`, underlined on hover and always on focus.
5. Do not accent a single word in a heading by color or italics.
6. Rich text (follow-up remarks, descriptions, meeting notes) supports bold, italic, headings and paragraphs (spec section 10). Heading sizes inside rich text are `--text-md` and `--text-base` (600), never larger than the page title.

### 4.4 Dates and numbers

| Item | Format | Example |
|---|---|---|
| Date | `D MMM YYYY` (AD) | 5 Nov 2026 |
| Date in the current year (dense tables) 💡 | `D MMM` | 5 Nov |
| Date and time | `D MMM YYYY, h:mm a` | 5 Nov 2026, 3:30 pm |
| Days left | Number with words | 3 days left · Due today · 3 days overdue |
| Progress | Integer percent | 55% |
| Weight | Integer percent, one decimal only if needed | 25% · 56.3% |
| Counts | Plain number, thousands separator | 1,248 |

Dates always use the AD calendar and the Asia/Kathmandu time zone ✅. Hovering a relative date ("in 3 days") shows the exact date.

---

## 5. Spacing, grid and layout

### 5.1 Spacing scale (4 px base) ✅

`--space-1: 4px` · `--space-2: 8px` · `--space-3: 12px` · `--space-4: 16px` · `--space-5: 20px` · `--space-6: 24px` · `--space-8: 32px` · `--space-10: 40px` · `--space-12: 48px` · `--space-16: 64px`

Guidelines:

| Context | Spacing |
|---|---|
| Between an icon and its label | 8 |
| Inside chips (horizontal) | 8 |
| Inside buttons (horizontal) | 12 (small) · 16 (default) |
| Between form fields | 16 |
| Between a label and its field | 6 (use 4 or 8 only if the grid forces it) |
| Panel inner padding | 16 (dense) · 20 (default) |
| Between panels | 16 |
| Page horizontal padding | 24 desktop · 16 tablet and phone |
| Between page header and content | 16 |
| Between sections inside a page | 32 |

### 5.2 App shell dimensions ✅

| Element | Size |
|---|---|
| Top bar height | 56 px |
| Sidebar width, expanded | 248 px |
| Sidebar width, collapsed (icon rail) | 64 px |
| Page header (title + actions) | min 64 px |
| Tab bar height | 44 px |
| Filter bar height | 48 px (boxes are 32 px high) |
| Table row height | 44 px comfortable · 36 px compact |
| Table header height | 36 px |
| Detail drawer width | 560 px (wide variant 720 px) |
| Modal width | 480 px (confirm) · 640 px (forms) |
| Content max width | Lists and dashboard: fluid. Detail page and settings forms: 1,120 px, centered |

### 5.3 Grid

- 12-column grid for dashboard and detail pages, **24 px** gutters (16 px below 1024).
- Table pages are full-width fluid.
- Align content to the left. Do not center body content; only empty states and the login card are centered.

### 5.4 Density ✅

A **Comfortable / Compact** toggle sits in the list toolbar and is remembered per user. Compact reduces row height to 36 px, panel padding to 12 px and chip height to 20 px.

---

## 6. Shape, borders and elevation

### 6.1 Radius by hierarchy ✅

Radius grows with the importance and size of the element. Do not apply one radius to everything.

| Token | Value | Applies to |
|---|---|---|
| `--radius-xs` | 4 px | Chips, tags, badges, checkboxes, table row focus |
| `--radius-sm` | 6 px | Buttons, inputs, selects, filter boxes, tabs (segmented), menus items |
| `--radius-md` | 8 px | Panels, popovers, dropdown menus, toasts |
| `--radius-lg` | 12 px | Modals, drawers (outer edge), command palette |
| `--radius-full` | 999 px | Avatars, progress-bar ends, switch tracks |

### 6.2 Borders ✅

Resting elements are separated by a **1 px border** (`--border`), not by shadows. Inputs use `--border-strong`. Table rows are separated by a 1 px `--border` bottom line; no zebra striping.

### 6.3 Elevation (floating layers only) ✅

| Token | Light | Dark | Use |
|---|---|---|---|
| `--shadow-sm` | `0 1px 2px rgba(16,24,40,.06)` | `0 1px 2px rgba(0,0,0,.4)` | Sticky table header on scroll, toasts |
| `--shadow-md` | `0 4px 12px rgba(16,24,40,.10)` | `0 4px 12px rgba(0,0,0,.5)` | Dropdowns, popovers, filter menus |
| `--shadow-lg` | `0 12px 32px rgba(16,24,40,.16)` | `0 12px 32px rgba(0,0,0,.6)` | Modals, drawers, command palette |

In dark mode, elevation also comes from **lighter surfaces** (`--surface` → `--surface-2` → `--surface-3`) plus a 1 px `--border`, because shadows are hard to see on dark backgrounds.

### 6.4 Z-index scale

`10` sticky table header · `20` sticky filter bar · `30` top bar and sidebar · `40` dropdowns and popovers · `50` drawer · `60` modal · `70` toast · `80` command palette.

---

## 7. Iconography

- ✅ **Set:** one outline icon set only. 💡 Lucide (stroke 1.5 px, rounded caps) or an equivalent.
- ✅ **Sizes:** 16 px in tables, chips and buttons · 20 px in navigation and headers · 24 px in empty states.
- ✅ **Color:** icons inherit `currentColor`. Icons that carry state use the semantic foreground color.
- ✅ **Labels:** icon-only buttons need an `aria-label` and a tooltip.

| Concept | Icon (Lucide name) |
|---|---|
| Dashboard | layout-dashboard |
| Tasks | list-checks |
| Projects | folder-tree |
| Needs CEO Attention | flag |
| Follow-ups | message-square-text |
| Meetings | calendar-days |
| Settings | settings |
| Activity log | history |
| Search | search |
| Add | plus |
| Filter | list-filter |
| Sort | arrow-up-down |
| Expand / collapse tree | chevron-right / chevron-down |
| Recurring | repeat |
| Blocked | octagon-x |
| Overdue | alert-circle |
| Due today | clock |
| Due soon | calendar-clock |
| Completed | check-circle |
| Originated from / link | link-2 |
| Manual weight | lock |
| Archive | archive |
| Light / dark / system theme | sun / moon / monitor |

---

## 8. App shell and navigation

### 8.1 Layout ✅

A fixed **left sidebar**, a fixed **top bar**, and a scrolling content area. The page header, tabs, filter bar and summary strip stay at the top of the content area; the table scrolls beneath them.

```
┌────────────────────────────────────────────────────────────────────────────────────┐
│ ≡  Tasks › Q4 merchant report      [ Search or jump to…        Ctrl K ]  [+ New ▾]  ☾  (EA) │ 56
├──────────────┬─────────────────────────────────────────────────────────────────────┤
│ [Product]    │ Tasks                                         [Export]  [+ New task] │
│              │ ─────────────────────────────────────────────────────────────────── │
│ Work         │ All 312 │ Open 214 │ Overdue 9 │ Due in next 7 days 21 │ ⚑ CEO 5     │ tabs 44
│  Dashboard   │ ─────────────────────────────────────────────────────────────────── │
│  Tasks    ●  │ [All│Projects│Tasks] [Department▾] [Category▾] [Priority▾] [Status▾] │ filters 48
│  Projects    │ [Due date▾] [CEO attention▾]  More filters▾   Clear all   ▤ Columns  │
│  CEO attn  5 │ ─────────────────────────────────────────────────────────────────── │
│              │ ⚑ Name                    Status   Priority  Dept   Due     Days left│ header 36
│ Check-ins    │ ─────────────────────────────────────────────────────────────────── │
│  Follow-ups 2│ ⚑ ▸ Q4 merchant report    ● In-prog ▮▮▮▯ High  Data  30 Nov  25 left │
│  Meetings    │      ▸ Build dashboard    ⛔ Blocked ▮▮▮▯ High  Eng   20 Nov  19 left │
│              │        Write summary      ○ Not st  ▮▯▯▯ Low   Data  25 Nov  24 left │
│ ──────────── │                                                                      │
│ Settings     │                                         Showing 1–50 of 312   Compact│
│ [‹] collapse │                                                                      │
└──────────────┴─────────────────────────────────────────────────────────────────────┘
   248 px                                        fluid
```

### 8.2 Sidebar ✅

**Contents (in order)**

| Group | Item | Notes |
|---|---|---|
| Work | **Dashboard** | Landing page after login |
| | **Tasks** | Flat list of all work items (spec 13.4) |
| | **Projects** | Hierarchy tree view |
| | **CEO attention** | Count badge in plum when above 0 |
| Check-ins | **Follow-ups** | Count badge in red for follow-ups flagged Missed, when above 0 |
| | **Meetings** | One item; Weekly / Monthly / Other are tabs on the page |
| *(bottom, separated)* | **Settings** | Opens Settings with its own sub-navigation: Lists, General, Activity log, Users (Admin only) |
| | Collapse control, theme and user menu | |

Group labels ("Work", "Check-ins") are sentence case, `--text-xs` / 500, `--text-3`.

**Item specification**

| Property | Value |
|---|---|
| Height | 36 px |
| Padding | 8 px 12 px; 8 px gap between icon and label |
| Radius | `--radius-sm` (6 px) |
| Icon / text | 20 px icon · `--text-base` 500 |
| Default | `--text-2` text and icon |
| Hover | `--surface-2` background, `--text` color |
| **Active** | `--brand-subtle` background, `--brand-600` text and icon. No left stripe |
| Focus | 2 px `--focus-ring`, 2 px offset |
| Badge | `--text-xs` 500, min width 20 px, height 20 px, radius 999. Plum badge for CEO attention, red badge for missed follow-ups. **No other badges** exist in the sidebar |

**Behavior**

1. ✅ The sidebar **collapses** to a 64 px icon rail with the toggle at its bottom. State is remembered per user.
2. Collapsed: labels are hidden, each icon gets a tooltip on hover and focus, badges become a 8 px dot.
3. Below 1,024 px the sidebar starts collapsed. Below 768 px it becomes an off-canvas drawer opened by the menu button (section 18).
4. The sidebar uses `--surface` with a 1 px right border (`--border`). It does not scroll with the page.

### 8.3 Top bar ✅

Left to right:

1. **Menu button** (shown when the sidebar is collapsed or off-canvas).
2. **Breadcrumb.** Shows the place and, inside the hierarchy, the full path: `Projects › Q4 merchant report › Build dashboard`. Each part is a link. Long paths shorten in the middle with an ellipsis. The current page is plain text.
3. **Global search** (centered, max width 480 px). Searches work items, meetings and follow-up remarks. `Ctrl+K` / `⌘K` opens the **command palette** (below).
4. **+ New** button (primary, small). Menu: Project, Task, Meeting, Follow-up.
5. **Theme menu**: Light, Dark, System.
6. **User menu**: name, role, sign out.

The top bar uses `--surface` with a 1 px bottom border.

### 8.4 Command palette 💡

Opens with `Ctrl+K` / `⌘K`. A 560 px modal (`--radius-lg`, `--shadow-lg`) with one input.

- Results are grouped: **Items**, **Meetings**, **Go to**, **Create**.
- "Go to" includes shortcuts such as "Overdue tasks" and "Needs CEO attention".
- Arrow keys move, `Enter` opens, `Esc` closes.

### 8.5 Keyboard shortcuts 💡

| Keys | Action |
|---|---|
| `Ctrl/⌘ + K` | Command palette |
| `N` then `T` / `P` / `M` | New task / project / meeting |
| `/` | Focus the list search |
| `G` then `D` / `T` / `P` | Go to dashboard / tasks / projects |
| `J` / `K` | Move row selection down / up |
| `Enter` | Open the selected row |
| `E` | Edit the selected row's status |
| `Esc` | Close drawer, menu or modal |

Shortcuts are listed in a help dialog opened with `?`.

---

## 9. Tabs, filter boxes and the summary strip

### 9.1 Page tabs ✅

Used for the main list filters (spec 13.4), and for sections inside detail pages and Meetings.

| Property | Value |
|---|---|
| Style | Underline tabs |
| Height | 44 px, with a 1 px bottom border (`--border`) across the page width |
| Label | `--text-base` 500, `--text-2` |
| Count | A small number after the label, `--text-xs`, `--text-3`, tabular |
| Hover | `--text` |
| **Active** | `--text`, 2 px underline in `--brand-600` |
| Spacing | 24 px between tabs |
| Focus | Focus ring on the tab, arrow keys move between tabs (`role="tablist"`) |

**Tasks page tabs** (from your sketch):

`All` · `Open` · `Overdue` · `Due in next [ 7 ] [ days ▾ ]` · `Needs CEO attention`

- The **Overdue** count turns `--danger` red when above 0.
- The **Needs CEO attention** tab shows a flag icon and its count in plum when above 0.
- **Due in next** is a tab with an inline control. When active, the number is an editable field (width 44 px) and the unit is a small select (days, weeks, months). When inactive it reads "Due in next 7 days". The chosen values are remembered per user.

### 9.2 Segmented control (Level 1: Project / Task) ✅

A compact control to the left of the filter boxes: `All | Projects | Tasks`.

| Property | Value |
|---|---|
| Container | `--surface-2` background, 1 px `--border`, `--radius-sm`, 32 px high, 2 px inner padding |
| Selected segment | `--surface` background, `--text`, 1 px `--border`, `--shadow-sm` |
| Unselected | transparent, `--text-2` |

Page tabs navigate between *sets of items*. The segmented control narrows the *type* of item. Do not use one in place of the other.

### 9.3 Horizontal filter boxes ✅

A single horizontal row under the tabs. Filters apply **instantly** (no Apply button).

**Order (left to right)**

`Scope (All/Projects/Tasks)` · `List search` · `Department` · `Sub-domain` · `Team member` · `Category` · `Priority` · `Status` · `Due date` · `CEO attention` · `More filters` · `Clear all` · *(right side)* `Saved views` · `Columns` · `Density` · `Export`

If the row is too narrow, lower-priority boxes move into **More filters** (a popover), keeping the order above.

**Filter box specification**

| Property | Value |
|---|---|
| Height | 32 px |
| Padding | 0 10 px, 6 px gap, chevron icon at the end |
| Radius / border | `--radius-sm`, 1 px `--border-strong` |
| Background | `--surface` |
| Label | `--text-sm` 500, `--text-2`: "Department" |
| Hover | `--surface-2` |
| **Active (has a value)** | `--brand-subtle` background, `--brand-border` border, label becomes "Department: Data" for one value or "Department: 2" for several, with a small × to clear that filter |
| Open | Popover below, `--radius-md`, `--shadow-md`, min width 240 px, max height 320 px |

**Popover contents**

- A search field (when the list has more than 8 values).
- A checklist with the list's color dots. Multi-select by default.
- "Select all" and "Clear" links at the top.
- **No "Add new" inside filters.** Adding values happens in forms and Settings.

**Specific boxes**

| Box | Behavior |
|---|---|
| **Sub-domain** | Shows only the sub-domains of the selected department(s). Disabled with a tooltip ("Choose a department first") if no department is chosen. 💡 May also be used alone to search all sub-domains. |
| **Team member** | Searchable list with initials avatars |
| **Status** | Grouped by state group: Not started, Active, Blocked, Done, Cancelled |
| **Priority** | Signal-bar icons and names |
| **Due date** | Presets: Today · This week · Next 7 days · This month · Overdue · No due date · Custom range |
| **CEO attention** | `Any` (default for the filter) · `Yes` · `No`. When `Yes` is chosen, a second box **CEO status** appears next to it with Pending · In-progress · Completed. |
| **More filters** | Category, Recurring, Has follow-up, Blocked, Created by |

The item field "Needs CEO Attention" defaults to **No** (spec 9.2); the *filter* defaults to **Any** so the list is not narrowed on arrival. 💡

**Active filters** are also reflected in the URL, so a filtered list can be bookmarked or shared. A "Clear all" link appears only when at least one filter is active.

### 9.4 Saved views 💡

A **Saved views** menu on the right of the filter row. A view stores tab, filters, sort, columns and density. Examples: "Overdue for Engineering", "CEO review this week".

### 9.5 Summary strip ✅

Shown at the top of **every list page** (spec 13.3). It is **one** bordered bar divided into segments, not separate cards.

```
┌────────────────┬────────────────┬──────────────────────────┬────────────────┬──────────────────────┐
│ Open           │ Overdue        │ Due in next [7 days ▾]   │ Active         │ ⚑ Needs CEO attention │
│ 214            │ 9              │ 21                       │ 46             │ 5                     │
└────────────────┴────────────────┴──────────────────────────┴────────────────┴──────────────────────┘
```

| Property | Value |
|---|---|
| Container | `--surface`, 1 px `--border`, `--radius-md`, segments separated by 1 px `--border` |
| Segment padding | 12 px 16 px |
| Label | `--text-sm` 500, `--text-2` |
| Number | `--text-lg` (20/28) on list pages · `--text-num` (32/36) on the dashboard, 500, tabular |
| Zero | Number in `--text-3` |
| Overdue above 0 | Number in `--danger-fg` |
| Needs CEO attention above 0 | Flag icon and number in `--attention-fg` |
| Hover | `--surface-2` |
| **Selected** (filter active) | `--brand-subtle` background; clicking again clears the filter |
| Click | Applies that filter to the list and updates the tab and URL ✅ |

Counts respect the **other** active filters (department, project, and so on) so they always describe what the user is looking at, except the segment's own dimension.

Where a page groups results by department or project, the group headings are clickable and apply that department or project as a filter ✅.

---

## 10. Tables, lists and the hierarchy tree

The table is the most important component. Build it first and build it well.

### 10.1 Anatomy ✅

| Part | Rule |
|---|---|
| Header | 36 px, `--surface-2`, `--text-xs` 600 `--text-2`, sentence case. Sticky under the filter bar. Sortable columns show an arrow on hover and when sorted |
| Row | 44 px (compact 36 px). 1 px `--border` bottom line. No zebra striping |
| Cell text | `--text-sm`; one line, ellipsis, full text in a tooltip |
| Number columns | Right-aligned, tabular figures |
| Text and chip columns | Left-aligned |
| Sticky columns | Checkbox, flag and Name stay pinned when scrolling horizontally |
| Footer | "Showing 1–50 of 312", rows-per-page control, loads more on scroll 💡 |

### 10.2 Default columns

| Column | Width | Content |
|---|---|---|
| Select | 40 | Checkbox (appears on hover or when any row is selected) |
| CEO flag | 32 | Plum flag icon if Needs CEO Attention; empty otherwise |
| **Name** | 280–min, flexible | Tree chevron, type icon (project / task), name, recurring icon if recurring, link icon if it has "Originated from". Parent path in `--text-3` below the name in comfortable density |
| Status | 120 | Status chip |
| Priority | 100 | Signal-bar icon and name |
| Department | 140 | Color dot and name, "+2" if more |
| Team members | 120 | Stacked initials avatars (max 3, "+n") |
| Due date | 100 | `D MMM` |
| **Days left** | 110 | Text and icon per deadline flag |
| Progress | 140 | Bar and percentage |
| Next follow-up | 120 | Date, or a red "Missed" chip |
| Last updated status | flexible, optional | One-line truncated text |
| CEO status | 110 | Pending / In-progress / Completed (only if flagged) |
| Category | 130 | Color dot and name (optional column) |

Users can show, hide, reorder and resize columns (**Columns** button). The choice is remembered per user and saved in Saved views.

### 10.3 Default sort ✅

Per spec 13.4: (1) Needs CEO Attention first, (2) open items, (3) completed items. 💡 Within each group: due date soonest first (no due date last), then priority rank. Cancelled items last.

When the user picks a column to sort by, the grouping rule is replaced by that sort and a small "Sorted by Due date" label appears with a reset control.

### 10.4 Hierarchy rows (tree) ✅

For **Projects** (tree by default) and optionally **Tasks** (flat by default; toggle **Tree / Flat** in the toolbar).

- Indent **20 px** per level. A chevron (16 px) before the name expands or collapses children. Items without children show a 16 px spacer so names align.
- Parent rows show roll-up values: progress from children, and the earliest and latest due dates of children are shown in the detail view, not in the row.
- A parent shows **"n tasks"** in `--text-3` after its name, counting direct children.
- **Expand all / Collapse all** controls in the toolbar. Expansion state is remembered per project.
- Maximum nesting depth follows the setting (default 5); beyond about four levels the Name column scrolls its indent, and a tooltip shows the full breadcrumb.
- Filtering a tree keeps the **ancestors** of matching rows visible (in `--text-3`) so context is not lost.

### 10.5 Progress cell ✅

| Part | Style |
|---|---|
| Bar | 6 px high, `--radius-full`, track `--surface-3` |
| Fill | `--brand-600` below 100%, `--success-fg` at 100% |
| Number | `--text-sm` tabular, right of the bar |
| N/A (empty project) | The text "No tasks yet" in `--text-3`, no bar |
| Parent with any manual weight | A small lock icon after the percentage with tooltip "Weights set manually" (spec 7.7) |
| Blocked item | Bar fill stays brand colored; the Blocked chip carries the warning |

### 10.6 Days left cell ✅

| Flag | Text | Style |
|---|---|---|
| Overdue | "3 days overdue" | `--danger-fg`, alert icon, weight 500 |
| Due today | "Due today" | `--due-today-fg`, clock icon, weight 500 |
| Due soon | "3 days left" | `--due-soon-fg`, calendar-clock icon |
| On track | "25 days left" | `--text-2`, no icon |
| Completed | "Completed 2 Nov" | `--success-fg`, check icon |
| No due date | "—" | `--text-3` |
| Cancelled | "—" | `--text-3` |

Do not tint the whole row red for overdue. Only the cell text and icon change.

### 10.7 Row states

| State | Style |
|---|---|
| Hover | `--surface-2` background; the checkbox and quick actions appear |
| Selected | `--brand-subtle` background |
| Keyboard focus | 2 px `--focus-ring` inside the row |
| **Needs CEO attention** | Flag icon in the flag column, plus a 5% `--attention-fg` tint on the row |
| Cancelled | Name struck through, text `--text-3` |
| Archived | Hidden by default; when shown, 60% opacity and an "Archived" chip |
| Loading | Skeleton rows (grey bars, no shimmer animation unless reduced motion is off) |

### 10.8 Inline editing ✅

The EA should rarely need to open a form.

| Cell | Interaction |
|---|---|
| Status | Click the chip → menu grouped by state group. Choosing **Blocked** opens a small popover asking for the **blocked reason** (required) |
| Priority | Click → menu |
| Due date | Click → date picker. If the date is later than the parent's, show the warning dialog (section 13.12) |
| Department / team members | Click → multi-select popover |
| CEO flag | Click the flag column → toggle with a confirm popover that lets the EA add a note to the CEO (EA role only) |
| Name | Double-click or `F2` to edit |

Rules: `Enter` saves, `Esc` cancels. A saved cell briefly shows a check mark (no color flash). Read-only users (CEO viewer) see no hover affordance.

### 10.9 Bulk actions ✅

Selecting one or more rows shows a bar pinned to the bottom of the content area (`--surface`, `--shadow-lg`, `--radius-md`):

`3 selected · Change status · Change priority · Assign · Flag for CEO attention · Archive · Clear selection`

### 10.10 Empty and filtered-empty states

| Situation | Message |
|---|---|
| No items at all | "No tasks yet" · "Add your first task to start tracking work." · button **New task** |
| Filters return nothing | "No tasks match these filters" · "Clear filters to see all tasks." · link **Clear all filters** |
| Empty project | "No tasks yet" · "Add a task so this project can show progress." · button **Add task** |

---

## 11. Dashboard

### 11.1 Purpose

In under 10 seconds the EA can see: what needs the CEO, what is overdue or blocked, which follow-ups are due or missed, and how the main projects are going.

### 11.2 Layout ✅

12-column grid, 24 px gutters (16 px on small screens). The page header shows the title **Dashboard** and today's date ("Sunday, 1 November 2026") in `--text-3`. There is no greeting banner.

```
Dashboard                                         Sunday, 1 November 2026        [+ New ▾]

┌───────────────┬───────────────┬───────────────────────────┬───────────────┬──────────────────────┐
│ Open          │ Overdue       │ Due in next [7 days ▾]    │ Active        │ ⚑ Needs CEO attention │
│ 214           │ 9             │ 21                        │ 46            │ 5                     │
└───────────────┴───────────────┴───────────────────────────┴───────────────┴──────────────────────┘

┌─ Needs CEO attention · 5 ───────────────── View all ┐  ┌─ Follow-ups ──────────────────────────┐
│ ⚑ Q4 merchant report      Pending     Next 6 Nov    │  │ Today (2) │ Upcoming (6) │ Missed (2) │
│   Projects › Data                      25 days left │  │ 10:00  Pull transaction data           │
│ ⚑ Vendor API access       In-progress No follow-up  │  │        [Log outcome] [Postpone]        │
│   Engineering                          3 days over  │  │ ...                                    │
│ ⚑ …                                                 │  │                                        │
└─────────────────────────────────────────────────────┘  └────────────────────────────────────────┘
        8 columns                                                  4 columns

┌─ Overdue · 9 ──────────────────────────── View all ┐  ┌─ Blocked · 4 ─────────────────────────┐
│ Build dashboard        Engineering     3 days over │  │ Build dashboard   Waiting for API     │
│ …                                                  │  │                   access · 5 days     │
└────────────────────────────────────────────────────┘  └───────────────────────────────────────┘

┌─ Due in next 7 days · 21 ─────────────── View all ┐  ┌─ Open items by department ────────────┐
│ Today                                              │  │ Engineering   ████████████ 58         │
│   Write summary                          Data      │  │ Data          ████████ 41             │
│ Tomorrow                                           │  │ Brand         ████ 22                 │
│   …                                                │  │                                       │
└────────────────────────────────────────────────────┘  └───────────────────────────────────────┘

┌─ Projects ───────────────────────────────────────────────────────────────────── View all ┐
│ ⚑ Q4 merchant report     ████████████░░░░░░░░ 55%   12 of 20 tasks    30 Nov · 25 days left │
│   Partner onboarding     ██████░░░░░░░░░░░░░░ 30% 🔒  6 of 20 tasks    15 Dec · 44 days left │
└──────────────────────────────────────────────────────────────────────────────────────────────┘
```

### 11.3 Summary strip ✅

Same component as section 9.5, with `--text-num` (32/36) numbers. Each segment is clickable and opens **Tasks** with that filter applied. The "Due in next" segment has the inline number and unit control; the chosen value is shared with the Tasks tab and the Due in next panel.

### 11.4 Panels

**Panel anatomy:** `--surface`, 1 px `--border`, `--radius-md`, 20 px padding. Header: title (`--text-md` 600) + count (`--text-3`) on the left, a **View all** text link on the right. Show **5 rows** maximum, then a "Show 12 more" row that opens the filtered list. Rows are 52 px (two lines: name, then meta).

| Panel | Columns | Order | Notes |
|---|---|---|---|
| **Needs CEO attention** ✅ (top-left, 8 cols) | Flag, name with parent path, CEO status, next follow-up, days left chip | CEO status (Pending, then In-progress), then due date | This is the first panel and the largest. In the CEO view it stays first |
| **Follow-ups** (4 cols) | Time or date, item, status | Today · Upcoming · Missed, as inner tabs | Row quick actions (EA only): **Log outcome**, **Postpone**, **Cancel**. Missed has a red count |
| **Overdue** (8 cols) | Name, department, days overdue | Most overdue first | Red days-overdue text only |
| **Blocked** (4 cols) | Name, blocked reason (one line), blocked since | Longest blocked first | Shows the required reason from spec 7.2 |
| **Due in next X days** (8 cols) | Name, department, priority | Grouped by day ("Today", "Tomorrow", "Wed 4 Nov"), then priority | Day headings are `--text-sm` 600. Follows the X value in the strip |
| **Open items by department** (4 cols) | Horizontal bars | Largest first | The only chart. Bars use the category palette; each bar is clickable and filters Tasks by that department ✅ |
| **Projects** (12 cols) | Flag, name, progress bar and %, tasks done, due date and days left | Needs CEO attention first, then due date | Lock icon if the project has manual weights. Click opens the project |

### 11.5 States

- **Loading:** each panel shows 3 skeleton rows. Panels load independently.
- **Empty (positive):** "Nothing overdue." with a check icon in `--text-3`. Empty panels stay in place so the layout does not jump.
- **Error:** "Couldn't load overdue items." and a **Try again** button inside the panel; the rest of the dashboard keeps working.

### 11.6 CEO viewer (later) 💡

Same dashboard without quick actions, inline editing or New buttons. The **Needs CEO attention** panel spans the full width on top, with the latest follow-up outcome shown under each item.

---

## 12. Page blueprints

### 12.1 Tasks

Page header (title **Tasks**, actions **Export** and **New task**) → page tabs (9.1) → scope control and filter boxes (9.2, 9.3) → summary strip (9.5) → table (section 10). Wireframe: section 8.1.

💡 Order inside the page: tabs, then filters, then summary strip. Keep the strip *below* the filters so it reads as the result of the filters.

### 12.2 Projects

Same structure as Tasks, with scope fixed to Projects and the table in **tree** mode. There is no Board (Kanban) view in version 1, because the specification does not include one.

### 12.3 Item detail (project, sub-project, task, sub-task)

Two ways to open an item:

| Way | When | Behavior |
|---|---|---|
| **Drawer** (560 px, slides in from the right over the list) | Click a row | Quick look and edit without losing list position. `Esc` closes |
| **Full page** (max width 1,120 px) | "Open full page" link, or direct URL | For long sessions, follow-up writing and reviewing the activity log |

**Layout**

```
Projects › Q4 merchant report › Build dashboard                       [Archive] [⋯]
┌─────────────────────────────────────────────────────────────────────────────────┐
│ ⚑  Build dashboard                                          ● Blocked  ▮▮▮▯ High  │
│    Task · Category: Development · Created 2 Nov by EA                             │
├───────────────────────────────────────────────────┬─────────────────────────────┤
│ Overview │ Children 3 │ Follow-ups 4 │ Links 2 │ Activity                        │
├───────────────────────────────────────────────────┬─────────────────────────────┤
│ Description (rich text, max 72ch)                 │ Properties                  │
│ …                                                 │  Status        ● Blocked    │
│                                                   │  Blocked since 4 Nov        │
│ Blocked reason                                    │  Reason        Waiting for  │
│ Waiting for API access from Engineering           │                API access   │
│                                                   │  Priority      High         │
│ Children (3)                          [+ Add]     │  Category      Development  │
│  ▸ Wire up charts      ○ Not started   20%        │  Department    ● Engineering│
│  ▸ Connect API         ⛔ Blocked      40%        │  Sub-domain    Remittance   │
│  ▸ Design layout       ● In-progress   40%        │  Team members  (SR) (AK)    │
│                                                   │  Start         2 Nov        │
│ Follow-ups                         [+ Schedule]   │  Due           20 Nov       │
│  Wed 11 Nov   Scheduled                           │  Days left     19 days left │
│  Fri 6 Nov    Done                                │  Progress      40%          │
│    Engineering confirmed access by Tuesday        │  Weight        25% (auto)   │
│                                                   │  CEO attention ⚑ Pending    │
│                                                   │  Task type     One-time     │
│                                                   │  Originated    ⛓ Weekly 2 Nov│
└───────────────────────────────────────────────────┴─────────────────────────────┘
```

**Rules**

1. Title is `--text-xl`, editable in place. The flag, status chip and priority sit on the right of the title row.
2. The properties column is 320 px, `--surface`, with label (`--text-sm`, `--text-2`) and value rows 36 px high. Every value is editable in place (EA role).
3. **Weight** shows `25% (auto)` or `25% (manual)` with a lock icon and a **Reset to auto** link when manual (spec 7.7).
4. **Children** is a small tree table (section 10.4) with a column for weight.
5. **Follow-ups** is a vertical log (section 13.9), newest first, with **Schedule follow-up** at the top.
6. **Links** shows **Originated from** and **Generated items** as link chips: icon, type, title, date.
7. **Activity** is the audit trail (spec section 15) with a **System** badge for automatic changes.
8. The CEO viewer sees the same page with no edit affordances.

### 12.4 CEO attention page

The Tasks layout with the **Needs CEO attention** tab preselected and the table grouped by **CEO status** (Pending, In-progress, Completed). Group headers are collapsible, have a count, and are clickable to filter. Each row also shows the latest follow-up outcome in one line.

### 12.5 Follow-ups

Tabs: `Scheduled` · `Missed` · `Done` · `All`. Table columns: Date, Item (with path), Status chip, Remarks (one-line preview), Logged by, Postponed from (link, if any). Row click opens the follow-up in a drawer with the rich-text outcome editor.

### 12.6 Meetings

- Tabs are generated from the **meeting types** list (default **Weekly**, **Monthly**, **Other**) plus **All**. Because the list is editable (spec 6), new types appear as new tabs automatically.
- Table columns: Date, Title, Type, Status (Scheduled, Held, Cancelled), Attendees, Items created.
- **Meeting detail** (full page): header, then Agenda (rich text), Notes (rich text), Attendees, **Originated from** chips, and **Items created from this meeting** (table) with an **Add action item** button that creates a task already linked back to the meeting.

### 12.7 Settings → Lists

All editable lists from spec section 6 live here.

```
Settings › Lists
┌──────────────────┬──────────────────────────────────────────────────────────────┐
│ Categories       │ Departments                                   [+ Add department] │
│ Departments  ●   │ ────────────────────────────────────────────────────────────── │
│ Sub-domains      │ ⋮⋮  ● G&E            Used by 74 items    Active ◉     ⋯           │
│ Team members     │ ⋮⋮  ● Engineering    Used by 112 items   Active ◉     ⋯           │
│ Priorities       │ ⋮⋮  ● Data           Used by 58 items    Active ◉     ⋯           │
│ Statuses         │ ⋮⋮  ● Brand          Used by 31 items    Active ◉     ⋯           │
│ CEO attention    │ ⋮⋮  ● Other          Used by 4 items     Active ◉     ⋯           │
│ statuses         │                                                                │
│ Follow-up        │  ⋯ menu:  Rename · Change color · Merge into… · Deactivate ·   │
│ statuses         │           Delete (only if never used)                          │
│ Meeting types    │                                                                │
└──────────────────┴──────────────────────────────────────────────────────────────┘
```

**Rules ✅ (match spec 6.2)**

1. Every list supports **Add**, **Rename**, **Reorder** (drag the handle), **Recolor**, **Deactivate**, **Merge** and **Delete** (only if never used).
2. Each row shows **how many items use it**, so the user knows the impact of a change.
3. **Add** opens an inline row at the top of the list (name field, color picker, **Save** / **Cancel**). If a similar name exists, show "A similar value exists: Data analysis. Use it instead?" before saving.
4. **Merge** opens a modal: choose the value to merge into, shows "42 items will move to Data", confirm with **Merge values**. Logged in the activity log.
5. Deactivated values are shown in a collapsed "Inactive" group at the bottom, with **Reactivate**.
6. **Priorities** add two columns: **Rank** (drag order) and **Weight cap %** (numeric, 0 to 100) with a helper "Largest share an item of this priority can take of its parent's progress".
7. **Statuses** add: **State group** (select: Not started, Active, Blocked, Done, Cancelled) and **Progress rule** (Fixed % / Keep last / Exclude, with a % field for Fixed). A helper explains: "The state group decides how the tool treats this status in counts and flags."
8. **Sub-domains** show their **Department** as a column and are grouped by department; **Team members** show department and sub-domain memberships.
9. In-form dropdowns also offer **+ Add new** at the bottom (EA and Admin), which opens a small modal with just the name, so adding a value never forces the user to leave the form ✅.

### 12.8 Settings → General (Admin)

A single column form, max width 640 px:

| Setting | Control |
|---|---|
| Working days | Seven day checkboxes (default Monday to Friday) |
| Due soon window | Number input and "days" |
| Maximum nesting depth | Number input (default 5) |
| Default priority | Select |
| Time zone | Select (default Asia/Kathmandu) |
| Default theme | Light · Dark · System |

### 12.9 Activity log

Filters: record type, user (or **System**), date range, field. Columns: When, Who, Record (link), Change (`Status: Not started → Blocked`), Reason (for automatic changes). Automatic entries carry a **System** chip. The log is read-only.

### 12.10 Sign in

A centered card (400 px, `--radius-lg`, `--shadow-md`) on `--bg`: product name, email, password, **Sign in** button. Errors say what to do ("Email or password is incorrect. Try again or reset your password.").

---

## 13. Components

Sizes use the tokens from sections 3 to 6. Every interactive component has these states: default, hover, focus (2 px `--focus-ring`, 2 px offset), pressed, disabled, and (for inputs) error.

### 13.1 Buttons

| Variant | Use | Light | Dark |
|---|---|---|---|
| **Primary** | The single main action in a view | `--brand-600` fill, `--text-inverse` | Same tokens (inverse text is dark) |
| **Secondary** | Other actions | `--surface` fill, 1 px `--border-strong`, `--text` | Same tokens |
| **Ghost** | Toolbar and low-emphasis actions | Transparent, `--text-2`, hover `--surface-2` | Same tokens |
| **Danger** (confirm dialogs only) | Irreversible or high-impact action | `#C62828` fill, white text | `#FF8A80` fill, `#14181F` text |
| **Link** | Inline navigation ("View all") | `--brand-600` text, underline on hover | Same tokens |

| Size | Height | Horizontal padding | Text |
|---|---|---|---|
| Small | 32 px | 12 px | 13 / 500 |
| Default | 36 px | 16 px | 14 / 500 |
| Large | 40 px | 20 px | 14 / 500 |

- Radius `--radius-sm`. Icon and label gap 8 px. Icon-only buttons are square (32 or 36 px) with a tooltip and `aria-label`.
- ✅ **One primary button per view.** Hover darkens to `--brand-700`. Disabled uses `--surface-3` fill and `--text-3` text, and explains why in a tooltip when possible.
- Labels are a **verb and an object**: "New task", "Save changes", "Log outcome". No arrows in labels.

### 13.2 Text inputs and text areas

| Property | Value |
|---|---|
| Height | 36 px (32 px in filter bars and dense forms); text areas min 96 px |
| Border | 1 px `--border-strong`, `--radius-sm` |
| Padding | 0 12 px |
| Placeholder | `--text-3`, only as an example, never as the label |
| Hover | Border `--text-3` |
| Focus | Border `--brand-600` plus the focus ring |
| Error | Border `--danger-fg`, helper text below in `--danger-fg` with an alert icon |
| Disabled | `--surface-2` fill, `--text-3` |
| Label | Above the field, `--text-sm` 500, 6 px gap |
| Optional fields | Label ends with "(optional)" in `--text-3`. Required fields carry no marker |
| Helper text | `--text-xs`, `--text-3`, below the field |

### 13.3 Select and multi-select

- Same box as an input, with a chevron. Menu uses `--radius-md`, `--shadow-md`, rows 32 px.
- **Multi-select** (departments, sub-domains, team members) shows chosen values as chips inside the field. A search field appears when there are more than 8 values.
- ✅ Editable lists end with **+ Add new** (EA and Admin roles). It opens a small modal with a name field and saves straight into the field.
- Sub-domain choices are filtered by the selected department(s). Picking a sub-domain adds its department automatically, and picking a team member adds their department or sub-domain, with a small note: "Engineering added from Remittance" (spec 5.1).

### 13.4 Date picker

- AD calendar only ✅. Input accepts typing in `D MMM YYYY` and opens a calendar popover.
- Popover presets: **Today** · **Tomorrow** · **Next working day** · **In 1 week** · **End of month**.
- Non-working days (from Settings) are shown in `--text-3`. First day of the week follows Settings ❓.
- Date range (filters, recurring end date) uses two inputs in one popover.
- Selecting a due date later than the parent's triggers the dialog in 13.12.

### 13.5 Chips and tags

| Property | Value |
|---|---|
| Height | 22 px (20 px compact) |
| Padding | 0 8 px, `--radius-xs` |
| Text | `--text-xs` 500 |
| Fill | Semantic **bg**, text and icon in the semantic **fg** (section 3.5). No border |
| Icon | 14 px, 4 px gap |
| Types | Status, deadline flag, CEO attention, "Missed", "Waiting on previous", "Archived", "System" |
| Department and category | Not a chip: a 8 px color dot followed by plain text |

The **CEO attention chip**: `--attention-bg` fill, `--attention-fg` text, flag icon, label "Needs CEO attention", followed by the CEO status as plain text ("Pending").

The **Blocked chip** uses the octagon-x icon and a faint diagonal hatch (`repeating-linear-gradient(135deg, transparent 0 4px, rgba(180,35,24,.10) 4px 5px)`).

### 13.6 Progress bar

See 10.5. Heights: 6 px in tables, 8 px in detail pages and panels. Always shown with the number. In dark mode the track is `--surface-3`.

### 13.7 Avatars

- Initials only, 24 px circle (20 px compact), `--surface-3` fill, `--text-2` text 11 px / 500. Team-member avatars are **neutral on purpose** so they do not compete with status colors.
- Stack: overlap 6 px with a 2 px `--surface` ring; show 3, then "+n".
- Team members are reference-only (spec 1.2): they have no login, so avatars have no presence dot or status.

### 13.8 Rich-text editor

Used for follow-up remarks, descriptions, meeting agenda and notes (spec 10.2).

| Part | Spec |
|---|---|
| Toolbar | 36 px high, `--surface-2`, ghost icon buttons (16 px): **Bold** · **Italic** · **Heading** · **Subheading** · **Bulleted list** 💡 · **Numbered list** 💡 · **Link** 💡 |
| Area | `--surface`, 1 px `--border-strong`, `--radius-sm`, min height 120 px, grows with content, text area max width 72ch |
| Shortcuts | `Ctrl/⌘+B`, `Ctrl/⌘+I`, `Ctrl/⌘+Alt+1/2` |
| Paste | Strips colors and fonts, keeps bold, italic, headings, lists |
| Language | Accepts Nepali (Devanagari) input and renders it with the font stack in 4.1 |
| Saved text | Rendered with the same styles: `--text-base` body, headings `--text-md` / `--text-base` 600 |

### 13.9 Follow-up log (vertical timeline)

Newest first. Each entry:

```
●  Fri 6 Nov          Done                      Logged 6 Nov by EA
│  Engineering confirmed access by Tuesday.
│
○  Wed 11 Nov         Scheduled                 [Log outcome] [Postpone] [Cancel]
│
✕  Mon 2 Nov          Missed                    [Log outcome]
│  (no outcome logged)
│
◐  Fri 30 Oct         Postponed to 6 Nov
```

- Left rail: 1 px `--border` line with a 12 px status marker (filled = done, hollow = scheduled, ✕ = missed, half = postponed, dashed = cancelled).
- Date is `--text-base` 500; status is a chip; "Logged … by …" is `--text-xs` `--text-3`.
- Remarks render as rich text (13.8), max width 72ch.
- **Scheduled** entries (before their date) show **Log outcome**, **Postpone** and **Cancel**. **Missed** entries show **Log outcome** only ✅ (spec 10.4). Postponing asks for a new date, keeps the old entry in the log, and creates a new Scheduled entry linked to it.
- **Last updated status** shown in lists is the first line of the latest logged outcome.
- The log is append-only: no delete button. Corrections are made by editing remarks, and the edit is recorded in the activity log.

### 13.10 Link chips (Originated from / Generated items)

Height 24 px, 1 px `--border`, `--radius-xs`, `--surface`. Contents: link icon, type icon (meeting / project / task), title (max 200 px, ellipsis), date in `--text-3`. Hover `--surface-2`. A link that would create a loop is refused with the message in 16.4.

### 13.11 Panels

`--surface`, 1 px `--border`, `--radius-md`, padding 20 px (16 px compact). Header row: title (`--text-md` 600), optional count, optional right-aligned action. Panels are separated by 16 px. Do not nest panels inside panels; use a divider or spacing instead.

### 13.12 Dialogs (modals) ✅

480 px (confirm) or 640 px (form), `--radius-lg`, `--shadow-lg`, scrim `rgba(20,24,31,.45)` light / `rgba(0,0,0,.6)` dark. Focus moves into the dialog, is trapped, and returns to the trigger on close. `Esc` closes. Buttons are right-aligned: secondary on the left, primary on the right.

**Required dialogs**

| Dialog | Content |
|---|---|
| **Parent due date will move** (spec 8.3) | Title: "Move the parent due dates?" Body: "'Build dashboard' is due 5 Dec, after its project's due date of 30 Nov. If you continue, these items move to 5 Dec:" followed by a list of affected ancestors with their current dates. Buttons: **Cancel** · **Move due dates and save** |
| **Blocked reason** | A small popover with a required text field "Why is this blocked?" and **Save** / **Cancel** |
| **Flag for CEO attention** | Popover with optional note to CEO and **Flag item** |
| **Archive** | "Archive 'Build dashboard'? It's hidden from lists but kept in history. You can restore it from Archived." Buttons: **Cancel** · **Archive** |
| **Merge values** | "Merge 'Data' into 'Data analysis'? 42 items will move. This can't be undone." Buttons: **Cancel** · **Merge values** (danger) |
| **Recurring: edit series or occurrence** | "Apply changes to: This task only · This and future tasks" (never past ones, spec 11.4) |
| **Unsaved changes** | "Leave without saving? Your changes will be lost." **Keep editing** · **Discard changes** |

After the due-date move, show the notice in 13.14 so the automatic change is visible, not silent ✅ (spec 8.3 and 15).

### 13.13 Drawer

560 px from the right (720 px for the wide variant), full height, `--surface`, `--radius-lg` on the outer edge, `--shadow-lg`. Header: 56 px with title and a close button. Body scrolls. **Sticky footer** (64 px) with **Save changes** and **Cancel** for forms. Scrim as in dialogs; clicking the scrim closes the drawer unless there are unsaved changes. Opens in 200 ms (see section 15).

### 13.14 Banners and toasts

**Inline banner** (inside a page or panel): 1 px border in the semantic color, semantic bg, 16 px icon, text `--text-sm`, optional text action on the right, dismissible only if non-critical.

| Use | Type | Example |
|---|---|---|
| Automatic change | Info | "Due date moved to 5 Dec because 'Build dashboard' is due later. View in activity log" |
| Manual weights | Warning | "Manual weights total 110%. Reduce them to 100% or less." |
| Recurring task waiting | Neutral | "Next occurrence is waiting. Complete or cancel this task to create it." |
| Concurrency | Warning | "This item changed after you opened it. Reload to see the latest version." |

**Toast:** bottom-left of the content area, 360 px wide, `--surface`, `--radius-md`, `--shadow-sm`, 1 px `--border`. Max 3 stacked. Auto-dismiss after 4 s (6 s when there is an action such as **Undo**). Errors stay until dismissed. `role="status"` (`role="alert"` for errors). The text repeats the action's name: the **Archive** button produces "Task archived" with **Undo**.

### 13.15 Tooltips and popovers

- **Tooltip:** `--text` background with `--bg` text (inverted), `--text-xs`, `--radius-xs`, 500 ms delay, appears on hover and focus. Never the only place for essential information.
- **Popover:** `--surface`, `--radius-md`, `--shadow-md`, 1 px `--border`, closes on `Esc` and outside click.

### 13.16 Weight editor (children table in the detail page) ✅

| Child | Priority | Leaves | Weight | |
|---|---|---|---|---|
| Pull transaction data | Medium | 1 | **20%** auto | |
| Build dashboard | High | 3 | **60%** auto | |
| Write summary | Low | 1 | **20%** 🔒 manual | Reset to auto |
| | | | **Total 100%** | |

- Auto weights are plain numbers with a small "auto" label in `--text-3`.
- Clicking a weight makes it editable; saving a value switches the child to **manual** (lock icon) ✅ and freezes it (spec 7.7).
- A footer row shows the **total**. If manual weights exceed 100%, the total turns `--danger-fg` and the inline error from 16.4 appears; saving is blocked.
- If manual weights equal 100% while auto siblings exist, show a warning banner (those siblings get 0%).
- Priority cap is shown as a hint when hovering the weight: "Capped at 50% by Medium priority".

### 13.17 Recurrence picker

A form section titled **Repeat**:

`Repeat: [ One-time | Daily | Weekly | Monthly | Every X days ]`

| Option | Extra controls |
|---|---|
| Daily | Checkbox "Skip non-working days" |
| Weekly | Seven weekday toggle buttons (32 px square) |
| Monthly | "Day of month" number input (31 = last day when shorter) |
| Every X days | "Every [ 5 ] days" |
| All | **Start date**, optional **End date**, and a line: "Next task is created when the current one is completed or cancelled." (spec 11.3) |

A **Waiting on previous** chip (repeat icon, neutral grey) appears on the series and the open occurrence when the next scheduled date has passed.

### 13.18 Empty states and skeletons

- **Empty state:** 24 px icon in `--text-3`, title (`--text-md` 600), one sentence in `--text-2`, one action button. Centered in the panel. See copy in 10.10 and 11.5.
- **Skeleton:** flat `--surface-2` bars at the size of the content. No shimmer animation by default.

---

## 14. Light and dark mode

1. ✅ **Three choices:** Light, Dark, System (default). Stored per user and applied before the first paint, so there is no flash of the wrong theme.
2. ✅ **Tokens only.** Every color, shadow and border comes from a token, so a theme switch changes variables, never component code.
3. ✅ **Dark is not inverted light.** Dark mode uses layered slate surfaces (`--bg` → `--surface` → `--surface-2` → `--surface-3`), borders and lighter foregrounds. Do not simply flip black and white.
4. ✅ **Semantic colors are softened in dark mode** (section 3.5): lighter foregrounds on deep tinted backgrounds, to avoid glare and halation.
5. ✅ **Attention plum stays the only plum** in both modes.
6. **Elevation:** in dark mode, rely on surface lightness and 1 px borders; shadows are a supporting cue only.
7. **Imagery and logos:** provide a light and a dark logo variant. Do not place unmodified light-mode screenshots in dark mode.
8. **Hatch pattern** on Blocked chips uses the dark-mode red at about 14% alpha.
9. **Focus ring:** `#2B54D9` on light and `#7C9BFF` on dark, both at 3:1 or more against their surface.
10. **Print and PDF export** always use the light theme (section 19).
11. **Test** every screen in both modes, with real Nepali text, at 100% and 200% zoom.

---

## 15. Motion

Motion explains a result of the user's action. It never decorates.

### 15.1 Allowed ✅

| Interaction | Effect | Duration |
|---|---|---|
| Hover and focus color changes | Color transition | 100 ms |
| Dropdown, popover, tooltip | Fade in with a 4 px move toward its final position | 150 ms |
| Drawer | Slides in from the right | 200 ms |
| Modal and command palette | Fade in with a 4 px move | 200 ms |
| Tree row expand / collapse | Height change | 150 ms |
| Toast | Fade in; leaves with a fade | 150 ms |
| Inline save | Check mark fades in and out | 600 ms total |
| Progress bar changing value | Width change | 200 ms |

Easing: enter `cubic-bezier(0.2, 0, 0, 1)`, exit `cubic-bezier(0.4, 0, 1, 1)`. Nothing longer than 250 ms.

### 15.2 Not allowed ✅

Page-load entrance animations, staggered list reveals, hover lifts on rows or panels, count-up number animations, looping or ambient motion, parallax, skeleton shimmer.

### 15.3 Reduced motion ✅

When `prefers-reduced-motion: reduce` is set: drop all movement (opacity-only or instant), no width or height animation, no shimmer.

---

## 16. Content and microcopy

### 16.1 Voice

Plain, specific and brief. Sentence case. Active voice. Name things the way the EA would ("Overdue", "Blocked", "Follow-up"), not how the system stores them. No exclamation marks, no jokes, no apologies in errors.

### 16.2 One word for one action ✅

| Use | Never use |
|---|---|
| **New** (opens a create form from a list or the top bar): "New task" | Create, Add new |
| **Add** (puts something inside something that is open): "Add task" inside a project, "Add follow-up" | Insert, Attach |
| **Save changes** | Submit, OK |
| **Cancel** | Close (for forms) |
| **Archive** / **Restore** | Delete (for work items) |
| **Log outcome** (for follow-ups) | Update, Complete (for follow-ups) |
| **Postpone** | Reschedule |
| **Flag for CEO attention** / **Remove CEO attention flag** | Escalate, Mark urgent |
| **Merge values** | Combine |
| **Reset to auto** | Revert |

Use the spec's names exactly: Needs CEO attention, CEO attention status, Days left, Deadline flag, Originated from, Last updated status, Next follow-up.

### 16.3 Dates and time in words

"Due today" · "3 days left" · "3 days overdue" · "Completed 2 Nov" · "Next follow-up 6 Nov" · "Blocked for 5 days". Hover shows the exact date.

### 16.4 Messages

| Situation | Message |
|---|---|
| Due date before start date | "Due date must be on or after the start date (2 Nov). Pick a later date." |
| Blocked without reason | "Add a reason so you can see later why this is blocked." |
| Manual weights over 100% | "Manual weights total 110%. Reduce them to 100% or less." |
| Manual weights fill 100% | "Manual weights total 100%, so the other tasks get 0%. Lower a manual weight or reset it to auto." |
| Link would form a loop | "This link would create a loop: Weekly meeting → Task → Weekly meeting. Choose a different item." |
| Child due date later than parent | See dialog in 13.12 |
| Sub-domain without department | "Choose a department first. Sub-domains belong to a department." |
| Network error on save | "Couldn't save your changes. Check your connection and try again. Your edits are still here." |
| Edited by someone else | "This item changed after you opened it. Reload to see the latest version." |
| Duplicate list value | "A similar value exists: Data analysis. Use it instead?" |
| Empty project | "No tasks yet. Add a task so this project can show progress." |
| Nothing overdue | "Nothing overdue." |
| Not allowed (CEO viewer) | "You can view this item but not change it." |

### 16.5 Confirmation and result wording

The result repeats the action: **Archive** → "Task archived." **Save changes** → "Changes saved." **Log outcome** → "Follow-up logged." **Move due dates and save** → "Due dates moved."

---

## 17. Accessibility

Target: **WCAG 2.2 level AA**.

1. **Contrast:** 4.5:1 for text, 3:1 for large text, icons and input borders, in both modes (section 3.9).
2. **Not color alone:** every status, flag and priority has a text label and an icon. Charts have direct labels.
3. **Keyboard:** everything works without a mouse. Visible focus ring on every control (2 px, 2 px offset). Logical tab order. No keyboard traps; drawers and dialogs trap focus *inside* and restore it on close.
4. **Landmarks:** `header` (top bar), `nav` (sidebar), `main`, and labeled regions for panels.
5. **Tables:** real table semantics. The hierarchy tree uses `role="treegrid"` with `aria-level` and `aria-expanded`. Inline-editable cells announce "editable" and use roving focus.
6. **Tabs:** `role="tablist"`, `tab`, `tabpanel`, arrow keys to move, `aria-selected`.
7. **Forms:** every input has a visible label; errors are linked with `aria-describedby` and announced; required and optional state is conveyed in text.
8. **Live updates:** toasts use `role="status"`; errors use `role="alert"`; changing a filter announces the new result count ("21 tasks").
9. **Target size:** at least 32 × 32 px on desktop (24 px is the WCAG minimum), 44 × 44 px on touch.
10. **Zoom and reflow:** usable at 200% zoom; content reflows down to 320 CSS px without two-dimensional scrolling (tables may scroll horizontally inside their own container).
11. **Motion:** respects reduced motion (section 15.3).
12. **Language:** set `lang="en"` on the page; mark Nepali spans with `lang="ne"` 💡 so screen readers pronounce them correctly.
13. **Time-based content:** toasts with actions last at least 6 s, and errors never auto-dismiss.

---

## 18. Responsive behavior

The EA works on desktop; phone and tablet need to be usable, not identical ✅.

| Breakpoint | Width | Layout |
|---|---|---|
| **XL** | 1,440 px and above | Full layout. Detail pages centered at 1,120 px |
| **L** | 1,024–1,439 px | Full layout, sidebar expanded or collapsed per user |
| **M** | 768–1,023 px | Sidebar starts as the 64 px icon rail. Dashboard grid is 8 columns. Properties column of a detail page moves below the main content |
| **S** | below 768 px | Sidebar becomes an off-canvas drawer. See below |

**Behavior on small screens (S)**

| Area | Behavior |
|---|---|
| Top bar | Menu button, current page title, search icon (opens the command palette), + New |
| Summary strip | Two-column grid of segments, or a horizontally scrolling strip |
| Tabs | Horizontal scroll with the active tab kept in view |
| Filter bar | Horizontal scroll; **Filters** button opens a full-height sheet with all filter boxes |
| Tables | Become a **card list**: name, status chip, days-left line, progress bar, CEO flag. Tapping opens the item |
| Detail drawer | Becomes a full-screen sheet with a back button |
| Dashboard | Panels stack in one column in this order: summary, Needs CEO attention, Follow-ups, Overdue, Blocked, Due in next X days, Projects, Open items by department |
| Dialogs | Become bottom sheets |
| Touch | 44 px targets, inline editing opens a sheet instead of editing in place |

---

## 19. Print and PDF export

For the exports in spec 16.2 (CSV is data only).

- ✅ Always the **light theme**, regardless of the user's setting.
- A4 portrait for lists, 16 mm margins, IBM Plex Sans (with the Devanagari fallback).
- Header: report title, date, and a line listing the active filters ("Filters: Department Data · Due in next 7 days").
- Chips are printed with a **border and text**, with no reliance on background fills (printers and photocopies drop them).
- **CEO review one-pager** 💡: Needs CEO attention items only, each with name, path, CEO status, due date and days left, next follow-up, and the latest follow-up outcome (max 3 lines).
- Page numbers in the footer ("Page 1 of 2").

---

## 20. Design tokens (CSS reference)

Dark values are defined once and included in both the manual override and the system preference rule (use a build step or preprocessor so they are not copied by hand).

```css
:root {
  color-scheme: light dark;

  /* ---------- Neutrals ---------- */
  --bg: #F6F7F9;
  --surface: #FFFFFF;
  --surface-2: #EEF0F4;
  --surface-3: #E4E8EE;
  --border: #DDE1E8;
  --border-strong: #C3CAD5;
  --text: #14181F;
  --text-2: #4A5463;
  --text-3: #5B6676;
  --text-inverse: #FFFFFF;

  /* ---------- Brand ---------- */
  --brand-600: #2B54D9;
  --brand-700: #1F3FB0;
  --brand-subtle: #E6ECFD;
  --brand-border: #B8C7F7;
  --focus-ring: #2B54D9;

  /* ---------- Needs CEO attention (reserved) ---------- */
  --attention-fg: #8E2A78;
  --attention-bg: #FBE9F5;
  --attention-border: #E9B4DA;
  --attention-row: rgba(142, 42, 120, 0.05);

  /* ---------- Semantic pairs ---------- */
  --danger-fg: #C62828;     --danger-bg: #FDECEC;
  --due-today-fg: #B8390A;  --due-today-bg: #FFEEDD;
  --due-soon-fg: #8F5806;   --due-soon-bg: #FEF6D8;
  --ontrack-fg: #4A5463;    --ontrack-bg: #EEF0F4;
  --success-fg: #17713F;    --success-bg: #E3F4EA;
  --info-fg: #2B54D9;       --info-bg: #E6ECFD;
  --review-fg: #0D6B64;     --review-bg: #DDF3F0;
  --blocked-fg: #B42318;    --blocked-bg: #FDECEA;
  --cancelled-fg: #5B6676;  --cancelled-bg: #EEF0F4;

  --scrim: rgba(20, 24, 31, 0.45);

  /* ---------- Chart ---------- */
  --chart-1: #2B54D9; --chart-2: #0F766E; --chart-3: #B7791F;
  --chart-4: #64748B; --chart-5: #6D4ED6; --chart-6: #1D8FCB;

  /* ---------- Shadows ---------- */
  --shadow-sm: 0 1px 2px rgba(16, 24, 40, 0.06);
  --shadow-md: 0 4px 12px rgba(16, 24, 40, 0.10);
  --shadow-lg: 0 12px 32px rgba(16, 24, 40, 0.16);

  /* ---------- Type ---------- */
  --font-sans: "IBM Plex Sans", "Noto Sans Devanagari", system-ui, "Segoe UI", Roboto, Arial, sans-serif;
  --font-mono: "IBM Plex Mono", ui-monospace, Menlo, monospace;
  --text-xs: 12px/16px;   --text-sm: 13px/18px;   --text-base: 14px/20px;
  --text-md: 16px/24px;   --text-lg: 20px/28px;   --text-xl: 24px/32px;
  --text-num: 32px/36px;

  /* ---------- Spacing ---------- */
  --space-1: 4px;  --space-2: 8px;  --space-3: 12px; --space-4: 16px;
  --space-5: 20px; --space-6: 24px; --space-8: 32px; --space-10: 40px;
  --space-12: 48px; --space-16: 64px;

  /* ---------- Shape ---------- */
  --radius-xs: 4px; --radius-sm: 6px; --radius-md: 8px;
  --radius-lg: 12px; --radius-full: 999px;

  /* ---------- Layout ---------- */
  --topbar-h: 56px;
  --sidebar-w: 248px;
  --sidebar-w-collapsed: 64px;
  --row-h: 44px;           /* compact: 36px */
  --header-h: 36px;
  --drawer-w: 560px;
  --content-max: 1120px;

  /* ---------- Motion ---------- */
  --dur-fast: 100ms; --dur-base: 150ms; --dur-slow: 200ms;
  --ease-enter: cubic-bezier(0.2, 0, 0, 1);
  --ease-exit: cubic-bezier(0.4, 0, 1, 1);

  /* ---------- Z-index ---------- */
  --z-sticky: 10; --z-filter: 20; --z-chrome: 30; --z-popover: 40;
  --z-drawer: 50; --z-modal: 60; --z-toast: 70; --z-palette: 80;
}

/* Dark: manual choice */
:root[data-theme="dark"] {
  --bg: #0E1116;
  --surface: #151A22;
  --surface-2: #1C222C;
  --surface-3: #252D39;
  --border: #2A323E;
  --border-strong: #3A4452;
  --text: #E8ECF2;
  --text-2: #A9B3C2;
  --text-3: #8591A3;
  --text-inverse: #0E1116;

  --brand-600: #7C9BFF;
  --brand-700: #A5BBFF;
  --brand-subtle: #1B2547;
  --brand-border: #33427A;
  --focus-ring: #7C9BFF;

  --attention-fg: #F08FD4;
  --attention-bg: #3A1430;
  --attention-border: #6B2A5A;
  --attention-row: rgba(240, 143, 212, 0.08);

  --danger-fg: #FF8A80;     --danger-bg: #3A1618;
  --due-today-fg: #FFA666;  --due-today-bg: #3A2410;
  --due-soon-fg: #F2C94C;   --due-soon-bg: #33290F;
  --ontrack-fg: #A9B3C2;    --ontrack-bg: #1C222C;
  --success-fg: #5FD08F;    --success-bg: #12301F;
  --info-fg: #7C9BFF;       --info-bg: #1B2547;
  --review-fg: #5CCBC0;     --review-bg: #0F2E2B;
  --blocked-fg: #FF8F85;    --blocked-bg: #3A1816;
  --cancelled-fg: #8591A3;  --cancelled-bg: #1C222C;

  --scrim: rgba(0, 0, 0, 0.6);

  --chart-1: #7C9BFF; --chart-2: #5CCBC0; --chart-3: #E5B454;
  --chart-4: #94A3B8; --chart-5: #A99BF0; --chart-6: #6DBDE8;

  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.4);
  --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.5);
  --shadow-lg: 0 12px 32px rgba(0, 0, 0, 0.6);
}

/* Dark: follow the system unless the user chose Light */
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    /* same values as :root[data-theme="dark"] above */
  }
}

/* Base */
html { font-family: var(--font-sans); font-size: 14px; color: var(--text); background: var(--bg); }
body { font-variant-numeric: tabular-nums; line-height: 1.43; }
:lang(ne) { line-height: 1.6; letter-spacing: 0; }
:focus-visible { outline: 2px solid var(--focus-ring); outline-offset: 2px; }

@media (prefers-reduced-motion: reduce) {
  * { transition: none !important; animation: none !important; }
}
```

**Fonts:** self-host IBM Plex Sans (400, 500, 600) and Noto Sans Devanagari (400, 500, 600) as WOFF2 with `font-display: swap`. Self-hosting avoids an external request, which matters for an internal tool.

---

## 21. QA checklist

**Visual**
- [ ] All colors, sizes, radii and shadows use tokens (no hard-coded values)
- [ ] Plum appears **only** for Needs CEO attention
- [ ] Every status, flag and priority has a text label as well as a color
- [ ] Light and dark mode both reviewed on every screen
- [ ] Text contrast measured: 4.5:1 normal, 3:1 large and icons
- [ ] Numbers use tabular figures and are right-aligned in tables

**Navigation and structure**
- [ ] Sidebar expands, collapses, shows tooltips when collapsed, and remembers the choice
- [ ] Breadcrumb shows the full hierarchy path
- [ ] Tabs, scope control and filter boxes behave as in section 9, and filters sync with the URL
- [ ] Summary strip numbers filter the list, and counts respect the other filters

**Tables and data**
- [ ] Default sort follows spec 13.4 (CEO attention, open, completed)
- [ ] Tree rows expand, collapse and keep ancestors visible while filtering
- [ ] Inline editing works for status, priority, due date, department, team members, CEO flag
- [ ] Empty, filtered-empty, loading and error states exist for every list and panel

**Product rules**
- [ ] Blocked requires a reason
- [ ] Later child due date shows the dialog, moves ancestors, logs it and shows a banner
- [ ] Manual weight shows a lock, a total row, and the over-100% error
- [ ] Follow-ups: Postpone and Cancel only before the date; Missed shows Log outcome
- [ ] Recurring: "Waiting on previous" chip shown; edit dialog offers this task / future tasks only
- [ ] Link loops are refused with the message in 16.4
- [ ] Every list can be added to, renamed, reordered, merged, deactivated (and deleted when unused)
- [ ] CEO viewer sees no edit affordances

**Quality**
- [ ] Full keyboard operation, visible focus, correct ARIA for tabs, dialogs and the treegrid
- [ ] Works at 200% zoom and at 320 px width
- [ ] Reduced motion respected; no entrance animations
- [ ] Nepali text renders correctly in tables, editor and exports
- [ ] PDF export prints in light theme with bordered chips

---

## 22. Open design decisions

| # | Question | Suggestion |
|---|---|---|
| 1 | Product name and logo (sidebar header, favicon, sign-in) | Needed before visual review |
| 2 | Keep **cobalt** as the brand color, or use the company's brand color (change only `--brand-*`)? | Keep cobalt unless brand rules require otherwise; plum must stay unique |
| 3 | Is **IBM Plex Sans** acceptable, or must a company font be used? | Keep Plex; confirm Devanagari support if replaced |
| 4 | Default density: Comfortable or Compact? | Comfortable, with a per-user toggle |
| 5 | Is **CEO attention** a separate sidebar item (my addition) or only a tab on Tasks? | Keep it: it is the tool's reason to exist |
| 6 | Meetings: one sidebar item with tabs, or Weekly / Monthly / Other as sub-items? | One item with tabs, because meeting types are editable |
| 7 | Do we want Board (Kanban), Calendar or Gantt views later? | Not in v1; the spec has none |
| 8 | Will the EA use the tool on a phone regularly? | If yes, raise the priority of section 18 |
| 9 | **Saved views** in version 1 or later? | Phase 2 |
| 10 | First day of the week in the date picker (Sunday or Monday)? | Follow the working-days setting, default Monday |
| 11 | Should team members get colored avatars later, once they can log in? | Keep neutral to protect the status colors |

---

*End of document.*
