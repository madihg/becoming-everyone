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

## PRDs

- PRD #1: `tasks/prd-becoming-everyone.md` - 12 user stories (US-001 to US-012)
- PRD #2: `tasks/prd-becoming-everyone-v2.md` - 4 amendment stories (US-013 to US-016)

## Implementation Status

**US-001 through US-016: COMPLETE**

### Phases completed:

- Phase 1: Scaffold + data model (clean slate, types, folders.json, API routes)
- Phase 2: Admin interface (folder drag-drop, unlimited tabs, tab bar)
- Phase 3: Public view (mirrors admin, polls for updates)
- Phase 4: Windows + physarum + icons (Mac OS 9 windows, 8 file type icons, mold background)
- Phase 5: Content modules (sleep typewriter, heartbeat monitor, dance body tracking)
- Phase 6: Amendments (ECG line fix, sleep centering, unified public view, admin side-by-side tabs)

### Not yet built:

- **US-006: PartyKit multiplayer cursors** - deps installed, server file not yet created
- **Music tracks** for dance module - need royalty-free afrobeat/techno/EDM in public/dance/

### Design review issues (from ui-ux-pro-max):

Must fix before performance:

- T-1: Bump text sizes from 9-11px to 12px+ for projection readability
- A-5: Self-host BlazePose ML models instead of CDN loading
- LM-1: ECG canvas resolution mismatch (use ResizeObserver)

Should fix:

- A-3: PhysarumBackground restarts on every render (useMemo the openFolders array)
- P-1: Mold connects folders sequentially not by proximity (use spatial distance)
- P-2: PhysarumBackground canvas size wrong in admin split view
- C-3: Lift module green/red not in design system

### Key files:

- `config/folders.json` - 19 folders with positions, tabs, file contents
- `app/admin/page.tsx` - admin with drag-drop, side-by-side tab surfaces, physarum
- `app/page.tsx` - public view, all folders by default, physarum
- `components/windows/FolderWindow.tsx` - Mac OS 9 dark window
- `components/physarum/PhysarumBackground.tsx` - adapted mold canvas
- `components/icons/FileIcon.tsx` - 8 file type icons
- `app/content/sleep/page.tsx` - typewriter monologue (center-anchored)
- `app/content/lift/page.tsx` - heartbeat ECG + cryptic data table
- `app/content/dance/page.tsx` - BlazePose body tracking + commands

## Session State

- **Status**: Camera integration and admin authentication deployed ✅
- **Last commit**: 05423a2 (camera feeds + admin auth, videos via Vercel Blob)
- **Deployed features**:
  - Admin authentication screen with password "every" - full-screen takeover before admin access
  - 5-second animation: 2.5s white-to-yellow text transition + 2.5s pixelated TV static dissolve
  - Camera routes for 3R1-breaking and 19R4-found - open in new browser tabs
  - Breaking news overlays with red banners and scrolling tickers
  - 3R1-breaking ticker: Rapid Personality Shuffle outbreak narrative
  - 19R4-found ticker: Omar found narrative with [SIGNAL GLITCH] markers
  - Yellow color (#FFE600) already consistent across all components
  - Both admin and public views open camera tabs on folder double-click
- **Files added**:
  - `components/auth/AdminAuth.tsx` - authentication wrapper with animated password reveal
  - `app/camera/3r1-breaking/page.tsx` - camera feed with 2046 outbreak news ticker
  - `app/camera/19r4-found/page.tsx` - camera feed with "found" narrative ticker
  - `tasks/prd-camera-auth.md` - PRD for this feature (6 user stories)
  - `BLOB_UPLOAD_INSTRUCTIONS.md` - guide for uploading videos to Vercel Blob
- **Video hosting**:
  - All .mp4/.mov files now gitignored (695MB total)
  - Videos need to be uploaded to Vercel Blob storage
  - 9 videos to upload - see BLOB_UPLOAD_INSTRUCTIONS.md
  - After upload, update config/folders.json with blob URLs
- **Next steps**: Upload videos to Vercel Blob. Fix projection-critical issues (text sizes, self-host BlazePose, ECG canvas resolution). PartyKit server.
- **Decisions**: ESLint 8 pinned (Next 14 compat), BlazePose via @mediapipe/tasks-vision, admin shows all tabs side-by-side, videos hosted on Vercel Blob (not in git)
- **Open**: Video upload to Blob, p5.js physarum exploration (deferred)
