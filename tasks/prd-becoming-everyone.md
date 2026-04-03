[PRD]

# PRD: Becoming Everyone - Interactive Theatre Interface

## Overview

"Becoming Everyone" is an interactive theatre piece structured as 19 files/folders displayed on a desktop-like interface. The audience sees what looks like a documentary file system - a black screen with dark folders that can be opened to reveal multimedia content (text, video, heartbeat data, dance tracking, etc.). The system supports two projected screens controlled by two operators with visible cursors, creating a multiplayer performance environment.

The interface is built as a single Next.js application with an admin mode for organizing folders across unlimited tabs and a public mode that mirrors the layout. When folders are opened during performance, a subtle yellow physarum (slime mold) pattern grows in the background, visually connecting the opened folders.

Three folders have rich interactive content for this phase: a typewriter-style text piece (Sleep), a simulated heartbeat monitor with cryptic data logging (Lift), and a camera-based dance tracking system with AI commands (Dance).

## Goals

- Deliver a performative desktop interface that feels like opening documentary evidence
- Enable two-operator multiplayer control with visible cursors via PartyKit
- Support unlimited tabs for organizing 19 folders across multiple projected screens
- Persist folder layout via server-side JSON so state survives restarts
- Open folders in dark-themed Mac OS 9 style windows showing typed content files
- Display file-type-aware icons inside folders (image, video, pdf, document, audio, executable)
- Grow subtle yellow physarum connections between opened folders in real-time
- Build 3 interactive content modules: Sleep (text), Lift (heartbeat), Dance (body tracking)
- Use Diatype Mono Variable as the primary typeface throughout (from singulars.oulipo.xyz design system)

## Quality Gates

These commands must pass for every user story:

- `npx tsc --noEmit` - TypeScript compilation with no errors
- `npx next lint` - Next.js linting passes
- Manual visual verification in browser - since this is a visual art piece, every story requires visual confirmation that the output matches the design intent

## Design System

### Typography

- **Primary font**: Diatype Mono Variable (from `https://type.cargo.site/files/Cargo-DiatypePlusVariable.woff2`) - used for all UI labels, folder names, file names, body text, interface chrome
- **Display font** (optional, for folder content headers): Terminal Grotesque (from `https://type.cargo.site/files/TerminalGrotesque.woff`)

### Colors

- **Background**: `#000000` (pure black)
- **Folder color**: `#1a1a1a` with `#2a2a2a` border (grey-black)
- **Text**: `#9ca3af` (muted grey) for labels, `#ffffff` for active/focused
- **Accent**: `#FFE600` (slime yellow - used for physarum, highlights, cursor trails)
- **Window chrome**: Dark interpretation of Mac OS 9 - `#2a2a2a` title bar, `#1a1a1a` body

### Window Aesthetic

Dark-themed Mac OS 9: horizontal lines in title bar, close/zoom boxes as small squares, subtle drop shadow. Clean and minimal but recognizably classic Mac. All rendered in the dark palette above.

## User Stories

### US-001: Project Scaffold and Clean Slate

**Description:** As a developer, I want to start fresh with a clean Next.js project structure so that the old prototype code is removed and replaced with the new architecture.

**Acceptance Criteria:**

- [ ] All existing components, modals, modules removed
- [ ] New folder structure created: `app/`, `app/admin/`, `components/`, `components/folders/`, `components/windows/`, `components/physarum/`, `components/content/`, `lib/`, `public/`, `config/`
- [ ] Diatype Mono Variable loaded via `@font-face` in `globals.css` from Cargo CDN
- [ ] Terminal Grotesque loaded as secondary display font
- [ ] Root layout applies Diatype Mono as default font family
- [ ] Tailwind config updated: colors (black bg, grey-black folders, slime yellow accent, muted grey text), font family set to Diatype Mono
- [ ] Base `globals.css` sets `background: #000000`, `color: #9ca3af`, cursor styles
- [ ] `package.json` cleaned of unused dependencies (TensorFlow, COCO-SSD, MediaPipe hands - will re-add as needed)
- [ ] PartyKit added as dependency (`partykit`, `partysocket`)
- [ ] App renders a black screen with the correct font

---

### US-002: Folder Data Model and JSON Persistence

**Description:** As an admin, I want 19 folders defined in a server-side JSON file with position, tab assignment, and content metadata so that the layout persists across sessions.

**Acceptance Criteria:**

- [ ] `config/folders.json` created with all 19 folders: `1P1-service`, `2O1-anyone`, `3R1-breaking`, `4W1-children`, `5P2-sleep`, `6O2-what`, `7P3-lift`, `8W2-move`, `9O3-win`, `10P4-dance`, `11R2-arms`, `12W3-poly`, `13P5-grieve`, `14R3-critic`, `15O4-agenda`, `16P6-arson`, `17P7-neural`, `18P8-yellow`, `19R4-found`
- [ ] Each folder has: `id`, `name`, `tabId`, `position: {x, y}`, `isOpen: boolean`, `contents: FileItem[]`
- [ ] Each `FileItem` has: `id`, `name`, `type` (image | video | pdf | document | audio | executable | html), `path` (URL or route)
- [ ] API route `GET /api/folders` returns current folder state
- [ ] API route `PUT /api/folders` updates folder state (positions, tab assignments)
- [ ] API route `PUT /api/folders/[id]/open` toggles folder open state
- [ ] JSON file is read/written on the server filesystem
- [ ] TypeScript types defined for `Folder`, `FileItem`, `Tab`, `FolderState`

---

### US-003: Admin Interface - Folder Grid and Drag-and-Drop

**Description:** As an admin, I want to see all 19 folders on a dark surface and drag them to arrange their positions so that I can control what the audience sees on each screen.

**Acceptance Criteria:**

- [ ] `/admin` route renders a dark surface (full viewport) with folder icons
- [ ] Each folder renders as a grey-black folder icon with name below in Diatype Mono
- [ ] Folders are draggable (HTML5 drag or pointer events) with position saved on drop
- [ ] Position changes are persisted to `config/folders.json` via API call
- [ ] Folder icon uses classic Mac folder shape rendered in CSS/SVG (dark themed)
- [ ] Folders snap to a loose grid (optional, can be toggled)
- [ ] Admin surface shows the current tab's folders only
- [ ] Double-clicking a folder in admin opens it (triggers window + marks as open)

---

### US-004: Tab System - Unlimited Tabs with Drag Between

**Description:** As an admin, I want to create, close, and switch between unlimited tabs and drag folders between them so that I can organize which folders appear on which projected screen.

**Acceptance Criteria:**

- [ ] Tab bar at top of admin interface showing tab names
- [ ] "+" button to create a new tab (default name: "Screen N")
- [ ] Tabs are renamable (double-click to edit name)
- [ ] Tabs are closable (folders return to first tab)
- [ ] Clicking a tab switches the visible surface to show only that tab's folders
- [ ] Dragging a folder to a different tab's label moves it to that tab
- [ ] Tab state (list of tabs with IDs and names) persisted in `config/folders.json`
- [ ] Each folder's `tabId` is updated when moved between tabs
- [ ] At least 2 tabs exist by default: "Screen 1" and "Screen 2"

---

### US-005: Public View - Mirror Admin Layout

**Description:** As an audience member, I want to see the folders arranged exactly as the admin placed them so that what I see on the projection matches the performance design.

**Acceptance Criteria:**

- [ ] `/` route renders the public view
- [ ] Public view loads folder state from `/api/folders` on mount
- [ ] Folders displayed at exact positions matching admin layout
- [ ] Public view shows the folders for a specific tab (determined by URL param `?tab=1` or defaults to first tab)
- [ ] Folders are NOT draggable in public view
- [ ] Double-clicking a folder in public view opens its window (same behavior as admin)
- [ ] Public view polls or uses PartyKit for real-time updates when admin changes layout
- [ ] Visual appearance identical to admin (same dark surface, same folder icons, same font)

---

### US-006: Multiplayer Cursors via PartyKit

**Description:** As a performer, I want both operators' cursors visible on the projected screen so that the audience sees two mice moving simultaneously.

**Acceptance Criteria:**

- [ ] PartyKit server created (`party/main.ts`) handling cursor position broadcasts
- [ ] Each connected client sends cursor position on mousemove (throttled to ~30fps)
- [ ] All clients render other users' cursors as small colored arrows/pointers on the canvas
- [ ] Cursor color differentiates users (e.g., white for operator 1, yellow for operator 2)
- [ ] Cursors have a subtle label or no label (clean, minimal)
- [ ] Cursor positions are relative to the viewport, correctly mapped across different screen sizes
- [ ] PartyKit connection established on both admin and public views
- [ ] Latency is low enough for real-time feel (<100ms)
- [ ] PartyKit also syncs folder open/close state and layout changes in real-time

---

### US-007: Mac OS 9 Dark Window for Opened Folders

**Description:** As a user (admin or audience), I want double-clicking a folder to open a dark Mac OS 9 style window showing the folder's contents so that files can be browsed and launched.

**Acceptance Criteria:**

- [ ] Double-clicking a folder opens a window component overlaid on the surface
- [ ] Window has: dark title bar with horizontal pinstripes, folder name as title, close box (small square, top-left), zoom box (top-right)
- [ ] Window body shows the folder's `contents` array as file icons in a grid
- [ ] Window is draggable by its title bar
- [ ] Window is resizable from bottom-right corner
- [ ] Close button closes the window and marks folder as closed
- [ ] Multiple windows can be open simultaneously
- [ ] Windows have z-index stacking (clicking brings to front)
- [ ] Window has subtle drop shadow on dark background
- [ ] Empty folders show "Empty Folder" text in muted grey
- [ ] All text in Diatype Mono

---

### US-008: File Type Icons Inside Folders

**Description:** As a user, I want files inside folders to display different minimalist icons based on their type so I can distinguish between images, videos, PDFs, and other content at a glance.

**Acceptance Criteria:**

- [ ] Icon set created (SVG or CSS) for types: `image`, `video`, `pdf`, `document`, `audio`, `executable`, `html`
- [ ] Each icon is minimalist, monochrome (grey with subtle type indicator), Mac OS 9 inspired
- [ ] `image` icon: document shape with small mountain/landscape glyph
- [ ] `video` icon: document shape with play triangle
- [ ] `pdf` icon: document shape with "PDF" text
- [ ] `document` icon: document shape with horizontal lines
- [ ] `audio` icon: document shape with waveform or note
- [ ] `executable` icon: document shape with terminal prompt or diamond
- [ ] `html` icon: document shape with `</>` brackets
- [ ] File name displayed below icon in Diatype Mono, truncated with ellipsis if too long
- [ ] Double-clicking a file opens it (behavior depends on type - see content stories)

---

### US-009: Physarum Mold Background Connecting Opened Folders

**Description:** As an audience member, I want a subtle yellow slime mold pattern to grow in the background connecting opened folders so that the visual narrative of the piece emerges organically.

**Acceptance Criteria:**

- [ ] Existing `PhysarumVisualization.tsx` adapted as a full-screen background canvas (z-index behind folders)
- [ ] Canvas renders nothing when no folders are open
- [ ] When a folder is opened, a small yellow organic blob appears at that folder's position
- [ ] When multiple folders are open, organic tendrils grow between them (using existing tube/connection animation logic)
- [ ] Tendrils grow slowly and organically (kelp-like, existing animation timing)
- [ ] Color is `#FFE600` (slime yellow) at very low opacity (0.05-0.15) - subtle, not distracting
- [ ] Tendrils subtly reach toward the nearest unopened folder (as if anticipating the next opening)
- [ ] Animation is smooth (requestAnimationFrame, existing pattern)
- [ ] Physarum state resets when all folders are closed
- [ ] Works on both admin and public views

---

### US-010: Content Module - 5P2-sleep (Typewriter Text)

**Description:** As a performer, I want the 5P2-sleep folder to contain an HTML file that, when opened, displays the Sleep Artist monologue line by line in a typewriter fashion so the audience can read along during the performance.

**Acceptance Criteria:**

- [ ] 5P2-sleep folder contains one file: `sleep.html` (type: `html`)
- [ ] Double-clicking `sleep.html` opens a new browser window/tab (`window.open`)
- [ ] New window has black background, centered text in Diatype Mono, white color
- [ ] Full monologue text loaded (all stanzas from the script, including quoted dialogue)
- [ ] Lines appear one at a time with a comfortable reading pace (~3-4 seconds per short line, ~5-6 seconds for longer lines)
- [ ] Each new line fades in (subtle opacity transition, 0.5s)
- [ ] Previous lines remain visible but fade to lower opacity (stacking effect, older lines dimmer)
- [ ] Quoted text (dialogue) styled slightly differently - italic or with quotation marks preserved
- [ ] Ellipsis (...) rendered with actual pause before completing
- [ ] Pauses between stanza groups are longer (~3 seconds extra)
- [ ] Text is large enough to read from audience distance (minimum 2rem, adjustable)
- [ ] Performer can pause/resume with spacebar
- [ ] Performer can skip to next line with right arrow key

---

### US-011: Content Module - 7P3-lift (Heartbeat Monitor)

**Description:** As a performer, I want the 7P3-lift folder to contain an interface showing a live heartbeat graph and a cryptic data analysis table so the audience sees what looks like a body encoding language through BPM.

**Acceptance Criteria:**

- [ ] 7P3-lift folder contains one file: `40-120.exe` (type: `executable`)
- [ ] Double-clicking `40-120.exe` opens a new browser window
- [ ] Window has black background, all text in Diatype Mono
- [ ] Left section: real-time heartbeat graph (ECG-style line)
  - [ ] X-axis: time (scrolling), Y-axis: BPM (40-120 range)
  - [ ] Normal range (60-100) marked with subtle horizontal lines and labels
  - [ ] BPM value oscillates with controlled randomness: slow drifts between 40-120, occasional sharp spikes/drops
  - [ ] Current BPM displayed as large number (4rem+)
  - [ ] Graph line in slime yellow (`#FFE600`), background grid in very dark grey
- [ ] Right section: data analysis table (cryptic/engineer-y)
  - [ ] Columns: `timestamp`, `bpm`, `delta`, `pattern`, `signal`
  - [ ] New row added every 2-3 seconds with current BPM data
  - [ ] `pattern` column shows cryptic codes (e.g., `0xA3F`, `SYN-4`, `RESP.12`) - generated algorithmically from BPM values
  - [ ] `signal` column shows classification labels (e.g., `ENCODE`, `REST`, `TRANSMIT`, `UNKNOWN`)
  - [ ] Table auto-scrolls, keeping newest entries visible
  - [ ] Older entries fade slightly
- [ ] Bottom bar: processing indicator showing fake analysis (e.g., "ANALYZING CARDIAC LEXICON... PATTERN MATCH: 23.7%")
- [ ] All data is simulated - no real sensor input
- [ ] BPM patterns are pre-scripted sequences that can loop (stored in code, not random - gives the impression of intentional communication)

---

### US-012: Content Module - 10P4-dance (Body Tracking + Commands)

**Description:** As a performer, I want the 10P4-dance folder to contain a body-tracking interface that films me in black and white, overlays skeleton tracking bars on my limbs, and displays dance commands from a chat-like panel so the audience sees the machine directing my body.

**Acceptance Criteria:**

- [ ] 10P4-dance folder contains one file: `body.exe` (type: `executable`)
- [ ] Double-clicking `body.exe` opens a new browser window
- [ ] Window splits into two sections: camera view (70% width) and command panel (30% width)
- [ ] Camera view:
  - [ ] Requests webcam access, displays feed in black and white (CSS filter or canvas processing)
  - [ ] BlazePose (MediaPipe) loads and tracks 33 body keypoints
  - [ ] Skeleton overlay drawn: bars/lines connecting keypoints for limbs (arms, legs, torso, head)
  - [ ] Overlay color: slime yellow (`#FFE600`) with slight glow
  - [ ] If BlazePose fails to load, falls back to MoveNet (TensorFlow.js) with 17 keypoints
  - [ ] Fallback noted in code comments for easy switching
- [ ] Command panel (right side, chat-like):
  - [ ] Black background, text in Diatype Mono
  - [ ] Opens with large text: "I see a body." (pause 2s) "This is now my body."
  - [ ] Then: "Dance, body."
  - [ ] Sequence of commands, each followed by 15-second music + dance period, then "Good body.":
    1. "Dance as if your bones were borrowed, and joy might make them shatter."
    2. "Dance like you are trying to convince gravity to stay a little longer, to hold you like someone who still remembers your scent."
    3. "Dance like the stage is a confession booth and your body won't stop sinning."
    4. "Dance like a machine learning heartbreak for the first time."
  - [ ] Commands appear with typing animation (character by character)
  - [ ] "Good body." appears after each 15-second dance interval
  - [ ] Text is large enough for audience to read (1.5rem minimum)
- [ ] Music playback:
  - [ ] Royalty-free dance tracks sourced (afrobeat, techno, romantic EDM) - at least 2 tracks, alternating or random
  - [ ] Music starts when a dance command appears, stops when "Good body." appears
  - [ ] Music stored in `public/dance/` directory
- [ ] Performer can advance manually (spacebar or click) if timing needs adjustment

---

## Functional Requirements

- **FR-01**: The system must serve both admin and public views from a single Next.js 14 application
- **FR-02**: The admin view at `/admin` must allow drag-and-drop repositioning of 19 folder icons on a 2D surface
- **FR-03**: The admin view must support unlimited tabs with create, rename, close, and switch operations
- **FR-04**: Folders must be draggable between tabs by dragging onto tab labels
- **FR-05**: All folder positions and tab assignments must persist to `config/folders.json` on the server
- **FR-06**: The public view at `/` must render folder positions identically to the admin view for the selected tab
- **FR-07**: PartyKit must synchronize cursor positions, folder state changes, and layout updates between all connected clients in real-time
- **FR-08**: Double-clicking a folder must open a draggable, resizable Mac OS 9 dark-themed window showing the folder's file contents
- **FR-09**: Files inside folders must display type-appropriate minimalist icons (image, video, pdf, document, audio, executable, html)
- **FR-10**: Double-clicking an `html` or `executable` type file must open a new browser window with the corresponding interactive content
- **FR-11**: A full-viewport canvas must render subtle yellow physarum tendrils connecting all currently-opened folders
- **FR-12**: The physarum visualization must begin growing from a folder's position the moment it is opened
- **FR-13**: All text throughout the application must use Diatype Mono Variable loaded from Cargo CDN
- **FR-14**: The 5P2-sleep content module must display monologue text line-by-line with fade-in timing and keyboard controls
- **FR-15**: The 7P3-lift content module must display a real-time heartbeat graph (40-120 BPM range) alongside a cryptic data analysis table
- **FR-16**: The 10P4-dance content module must capture webcam video in B&W, overlay BlazePose skeleton tracking, and display timed dance commands with music
- **FR-17**: The heartbeat BPM must follow pre-scripted oscillation patterns that appear intentional (not purely random)
- **FR-18**: The dance module must fall back from BlazePose to MoveNet if the primary tracker fails to load

## Non-Goals (Out of Scope)

- **No authentication system** - admin access is controlled physically (only the performer has the URL/device)
- **No mobile responsiveness** - projected on large screens (assume high-res / 4K projectors) from laptops
- **No content management UI** - folder contents are defined in `config/folders.json` and edited manually or via future stories
- **No recording or archival** - performances are live only
- **No real heart rate sensor integration** - BPM is simulated (can be added later)
- **No AI-generated dance commands** - commands are pre-written in the script (existing OpenAI choreographer code is removed)
- **No content for the other 16 folders** - they exist as empty shells with correct names; content will be added in future PRDs
- **No offline support** - requires network for PartyKit and font loading
- **No p5.js rewrite of physarum** - using existing canvas implementation for now (p5.js exploration tracked separately)

## Technical Considerations

- **PartyKit**: Requires a PartyKit server (`party/main.ts`). Run locally during dev (`npx partykit dev`), deploy to PartyKit cloud for production. Handles: cursor sync, folder state sync, layout change broadcasts.
- **MediaPipe BlazePose**: Load via `@mediapipe/pose` package. Heavier than MoveNet (~5MB model). Provides 33 keypoints vs MoveNet's 17. Must handle model load failure gracefully.
- **Font loading**: Diatype Mono Variable from Cargo CDN (`type.cargo.site`). Use `@font-face` with `font-display: block` to prevent FOUT on projected screens.
- **Browser windows**: `window.open()` for content modules. May be blocked by popup blockers - content modules should also work as routes (`/content/sleep`, `/content/lift`, `/content/dance`) that can be opened manually.
- **JSON file persistence**: `config/folders.json` read/written via `fs` in API routes. No concurrent write protection needed (single admin). File must be gitignored if it contains runtime state, or committed if it's the canonical config.
- **Existing code to preserve**: The organic animation patterns in `PhysarumVisualization.tsx` (multi-layered sine waves, tube connections, shoreline edges) are the foundation for US-009. The component will be refactored, not rewritten.
- **BlazePose fallback**: If `@mediapipe/pose` fails, fall back to `@tensorflow-models/movenet`. Both should be listed as dependencies. Detection code should use an adapter pattern so switching is clean.

## Success Metrics

- Admin can arrange 19 folders across 2+ tabs and the layout persists after page refresh
- Two browser windows connected to the same session show each other's cursors in real-time
- Public view matches admin layout pixel-for-pixel
- Opening folders triggers visible yellow physarum growth between them
- 5P2-sleep monologue plays through completely with readable timing
- 7P3-lift heartbeat graph runs continuously with data table populating
- 10P4-dance successfully captures webcam, overlays skeleton, and cycles through all 4 dance commands with music

## Resolved Questions

1. **Music for dance module** - Afrobeat, techno, romantic EDM. Source 2+ royalty-free tracks in these genres.
2. **PartyKit hosting** - PartyKit cloud.
3. **Folder content for remaining 16 folders** - Future PRDs. Content (PDFs, images, videos) will be uploaded into the folder structure over time.
4. **Screen resolution** - Assume high-res (1080p-4K). Size fonts generously.
5. **p5.js exploration** - Deferred. Do later as a separate exploration.

## Open Questions

1. **Music licensing** - Need to identify specific royalty-free afrobeat/techno/EDM tracks. May need to purchase or use CC-licensed tracks.
2. **PartyKit cloud plan** - Free tier supports 20 concurrent connections, which should suffice for a performance with 2 operators.

[/PRD]
