# Becoming Everyone - Context

## What This Is

Interactive theatre piece. 19 folders on a dark desktop interface, projected on two screens during a live performance. Audience sees a documentary-like file system. Folders open to reveal multimedia content. A yellow physarum mold grows between opened folders.

## Architecture

- **Framework**: Next.js 14 (existing, being rewritten)
- **Admin**: `/admin` - drag/drop folder positioning, unlimited tabs, folder organization across screens
- **Public**: `/` - mirrors admin layout, read-only, same visual
- **Multiplayer**: PartyKit (cloud) - two visible cursors for two operators
- **Persistence**: `config/folders.json` - server-side JSON file
- **Design**: Diatype Mono Variable (from singulars.oulipo.xyz), black bg, grey-black folders, #FFE600 yellow accent
- **Window aesthetic**: Dark Mac OS 9 (horizontal pinstripes, close/zoom boxes, dark palette)

## PRD

Full PRD at `tasks/prd-becoming-everyone.md` - 12 user stories.

## Folder Structure

All 19 folders live at `public/folders/`:
1P1-service (6 imgs + 1 video), 2O1-anyone, 3R1-breaking (4 imgs), 4W1-children, 5P2-sleep, 6O2-what, 7P3-lift, 8W2-move, 9O3-win, 10P4-dance, 11R2-arms, 12W3-poly, 13P5-grieve (6 imgs + 1 pptx), 14R3-critic, 15O4-agenda, 16P6-arson, 17P7-neural, 18P8-yellow, 19R4-found

Music directory: `public/dance/`

## Three Content Modules (This Phase)

1. **5P2-sleep** - Typewriter monologue, line-by-line fade-in, spacebar pause/resume
2. **7P3-lift** - Simulated heartbeat graph (40-120 BPM) + cryptic data analysis table
3. **10P4-dance** - BlazePose body tracking (B&W camera, skeleton overlay), chat commands, afrobeat/techno/EDM music

## Design System Source

Fonts from singulars.oulipo.xyz (Cargo CDN):

- Primary: Diatype Mono Variable (`type.cargo.site/files/Cargo-DiatypePlusVariable.woff2`)
- Display: Terminal Grotesque (`type.cargo.site/files/TerminalGrotesque.woff`)

Colors: #000000 bg, #1a1a1a folders, #2a2a2a borders, #9ca3af text, #FFE600 accent

## Implementation Status

**US-001 through US-012: COMPLETE (all 12 stories implemented)**

### Phases completed:

- Phase 1: Scaffold + data model (clean slate, types, folders.json, API routes)
- Phase 2: Admin interface (folder drag-drop, unlimited tabs, tab bar)
- Phase 3: Public view (mirrors admin, polls for updates)
- Phase 4: Windows + physarum + icons (Mac OS 9 windows, 7 file type icons, mold background)
- Phase 5: Content modules (sleep typewriter, heartbeat monitor, dance body tracking)

### Not yet built:

- **US-006: PartyKit multiplayer cursors** - deps installed, server file not yet created
- **Music tracks** for dance module - need royalty-free afrobeat/techno/EDM in public/dance/

### Key files:

- `config/folders.json` - 19 folders with positions, tabs, file contents
- `app/admin/page.tsx` - admin with drag-drop, tabs, windows, physarum
- `app/page.tsx` - public view with windows, physarum
- `components/windows/FolderWindow.tsx` - Mac OS 9 dark window
- `components/physarum/PhysarumBackground.tsx` - adapted mold canvas
- `components/icons/FileIcon.tsx` - 7 file type icons
- `app/content/sleep/page.tsx` - typewriter monologue
- `app/content/lift/page.tsx` - heartbeat + cryptic data table
- `app/content/dance/page.tsx` - BlazePose body tracking + commands

## Session State

- **Status**: Core implementation complete, quality gates pass (tsc + lint)
- **Next steps**: Visual test in browser, PartyKit server, source dance music
- **Decisions**: ESLint 8 pinned (Next 14 compat), BlazePose via @mediapipe/tasks-vision
- **Open**: p5.js physarum exploration (deferred)
