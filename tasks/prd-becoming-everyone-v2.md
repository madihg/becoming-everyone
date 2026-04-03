# PRD #2: Becoming Everyone - Amendments

## Overview

Amendments to the original PRD based on first visual testing session. Covers four changes: heartbeat graph fix, sleep typewriter UX, public/admin screen behavior, and admin split-view.

## Quality Gates

These commands must pass for every user story:

- `npx tsc --noEmit` - No TypeScript errors
- `npx next lint` - ESLint passes
- `npm run dev` + visual verification in browser

## User Stories

### US-013: Fix Heartbeat ECG Line Rendering

**Description:** As an audience member watching the lift screen, I want to see a visible moving ECG line on the graph so that the heartbeat visualization is compelling and readable.

**Acceptance Criteria:**

- [x] Canvas animation loop never breaks (no early returns that skip requestAnimationFrame)
- [x] Yellow BPM line draws from left to right based on bpmHistoryRef data
- [x] Current position shown with a dot at the latest BPM value
- [x] Grid lines and range markers (40/60/100/120) visible behind the line
- [x] Line updates in real-time as simulated BPM changes

**Status:** Complete

### US-014: Center-Anchored Sleep Typewriter

**Description:** As an audience member watching the sleep screen, I want each new line to appear centered on screen with older lines receding upward, so the reading experience feels meditative and focused.

**Acceptance Criteria:**

- [x] New lines always appear at vertical center of the viewport
- [x] Older lines scroll upward as new lines are added (translateY-based animation)
- [x] Lines fade in over 1.5s with ease-in-out timing (not sudden)
- [x] Two-step visibility: mount at opacity 0, then transition to target opacity after 50ms delay
- [x] Older lines fade proportionally (opacity decreasing with age)
- [x] Stanza breaks add 3s extra delay before next line

**Status:** Complete

### US-015: Unified Public View (All Folders Default)

**Description:** As an audience member viewing the projected screen, I want to see all folders on a single view by default, with tab-based filtering only when the admin explicitly organizes folders into separate screens.

**Acceptance Criteria:**

- [x] `localhost:3000/` shows ALL folders regardless of tab assignment
- [x] Only `/?tab=tab-id` filters to a specific tab's folders
- [x] Public view has no tab bar or tab UI - just folders on black
- [x] Admin and audience screens share the same visual aesthetic

**Status:** Complete

### US-016: Admin Split-View (Side-by-Side Tabs)

**Description:** As the show operator, I want to see all tabs displayed side by side in the admin interface so I can see exactly what each projected screen shows simultaneously.

**Acceptance Criteria:**

- [x] Admin shows all tabs as equal-width columns, side by side
- [x] Each tab surface has its own physarum background (scoped to that tab's open folders)
- [x] Each tab surface shows a subtle label (tab name) in the top-left corner
- [x] Folders can be dragged within their tab surface
- [x] Folders can be dropped on TabBar labels to reassign between tabs
- [x] Tab management (create, rename, close) remains in the TabBar
- [x] A thin border separates adjacent tab surfaces
- [x] With one tab, the surface takes full width; with two, each takes 50%

**Status:** Complete

## Functional Requirements

- FR-1: The public page renders all folders from all tabs when no `?tab=` query parameter is present
- FR-2: The public page filters to a single tab's folders when `?tab=tab-id` is provided
- FR-3: The admin page renders each tab as a flex column taking equal width
- FR-4: Each admin tab column has its own PhysarumBackground instance scoped to that tab's open folders
- FR-5: The heartbeat canvas animation loop must always schedule the next frame via requestAnimationFrame, regardless of data state
- FR-6: Sleep lines use a center-anchored layout with translateY offset based on current line index

## Non-Goals

- No changes to the dance module in this iteration
- No PartyKit multiplayer changes
- No changes to folder data model or persistence

## Technical Considerations

- Admin split-view uses CSS flexbox with `flex-1` for equal distribution
- Each tab surface gets its own PhysarumBackground canvas (multiple canvases on admin page)
- The public page Suspense boundary wraps useSearchParams() for Next.js compatibility
- Sleep typewriter translateY uses rem units (3.2rem per line) for consistent spacing
