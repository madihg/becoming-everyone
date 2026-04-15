# Becoming Everyone - Context

## What This Is

Interactive theatre piece. 19 folders on a dark desktop interface, projected on two screens during a live performance. Audience sees a documentary-like file system. Folders open to reveal multimedia content. A yellow physarum mold grows between opened folders.

## Architecture

- **Framework**: Next.js 14 (App Router, "use client")
- **Main page**: `/` - admin interface behind AdminAuth screen. Everyone gets full control.
- **Multiplayer**: PartyKit (cloud) - shared cursors + collaborative text editing
- **Persistence**: `config/folders.json` - server-side JSON file
- **Design**: Diatype Mono Variable, black bg, #FFE600 yellow accent
- **Window aesthetic**: Dark Mac OS 9 (horizontal pinstripes, close/zoom boxes)
- **Deployment**: Vercel (Git-triggered), media on Vercel Blob Storage
- **No animation libraries** - vanilla CSS keyframes + canvas + requestAnimationFrame

## Landing Page Overhaul - COMPLETED (April 10, 2026)

All 5 workstreams implemented and building clean.

**1. Route Consolidation** - DONE. `app/page.tsx` is now the admin page. `app/admin/page.tsx` redirects to `/`.

**2. Text Fixes** - DONE. "be" changed to "become" in all 3 locations. Spaces render as `\u00a0`.

**3. Autonomous Cursor** - DONE. `components/cursor/AutonomousCursor.tsx` - glowing yellow dot, 15s wander, types "every", spacebar skips.

**4. Visual Markers** - DONE. `components/markers/FloatingMarkers.tsx` - 7 markers (dumbbell, drone, flame PNGs + heart, physarum, candle SVGs + "(650)" text). B&W grainy filter, slow hover animation.

**5. PartyKit Multiplayer** - CODE DONE, DEPLOY PENDING.

- `party/main.ts` - server (cursor_move, text_update, cursor_leave)
- `partykit.json` - config
- `components/multiplayer/MultiplayerProvider.tsx` - context + WebSocket
- `components/multiplayer/RemoteCursors.tsx` - render remote glowing dots
- **Next step**: Run `npx partykit deploy` (needs GitHub OAuth login)
- Default host: `becoming-everyone.halim.partykit.dev` (env: `NEXT_PUBLIC_PARTYKIT_HOST`)

### Key Decisions

- Everyone gets full admin control - password protection later
- Cursor style: glowing yellow dot (12px, #FFE600, soft glow shadow)
- Autonomous cursor: landing page only for now
- Text: "i've always wanted to become [input]one"
- Multiplayer: last-write-wins for text, normalized cursor positions (0-1 range)

## Previously Completed

- Candle-drop camera page, Omar B&W grainy video, external window system
- Physarum persistent lines (0.5 opacity), PDF pages as pre-rendered images
- Army press briefing camera, video autoplay disabled, spacebar pause fixed
- All media paths on Vercel Blob Storage
- 19 folders across two screens with Mac OS 9 windows
- Sleep typewriter, heartbeat monitor, dance body tracking modules

## Folder Page Overhaul - COMPLETED (April 10, 2026)

All 6 workstreams implemented and building clean.

**1. Folder Icons** - DONE. `FolderIcon.tsx` rewritten with symbolic icons per folder:

- "(650)" text for 1P1-service
- Webcam PNG for O-type folders (2O1, 6O2, 9O3, 15O4)
- NBN SVG (nbn-3) for R/W-type folders (3R1, 4W1, 8W2, 11R2, 12W3, 14R3, 19R4)
- Candle SVG for 5P2-sleep, Dumbbell PNG for 7P3-lift
- Body silhouette SVG for 10P4-dance, Node network SVG for 13P5-grieve
- Drone PNG for 16P6-arson, Heart SVG for 17P7-neural, Physarum SVG for 18P8-yellow
- 100x80px icons (up from 64x52), B&W grain filter: `grayscale(100%) contrast(1.3)`

**2. NBN Logo** - DONE. 5 SVG variations in `public/markers/nbn/nbn-1.svg` through `nbn-5.svg`. Using nbn-3 (diagonal stripe band, 45deg). Added to: news ticker badges/watermarks, landing page marker (#8).

**3. Text Contrast** - DONE. `--text` changed from `#9ca3af` to `#d1d5db`.

**4. Autonomous Cursor on Folders** - DONE. `FolderGuideCursor.tsx` - orbiting yellow dot using requestAnimationFrame. Targets first unopened folder in FOLDER_SEQUENCE.

**5. Sequential Physarum** - DONE. `PhysarumBackground.tsx` rewritten - sequential pairs instead of all-pairs. Traveling yellow dots on latest edge. New props: folderSequence, sequenceProgress.

**6. Viewer Fixes** - DONE. Removed video loop, shrunk nav arrows (60x200px), hidden arrows for workout folder (7P3-lift).

## Spacebar Advance - COMPLETED (April 14, 2026)

Pressing spacebar during live performance advances through FOLDER_SEQUENCE:

1. Yellow guide dot stops orbiting, darts toward next folder (lerp 0.12 vs 0.03)
2. On arrival: folder opens, all files auto-open (viewer for first media file, external windows for HTML/executables)
3. Broadcasts `open_folder` via PartyKit - all connected clients run same sequence
4. Spacebar debounced during animation (blocked while `navigatingToFolder` is set)

**Files modified:**

- `party/main.ts` - added `open_folder` message broadcast handler
- `components/multiplayer/MultiplayerProvider.tsx` - added `sendMessage()` + `lastEvent` to context
- `components/cursor/FolderGuideCursor.tsx` - added `navigating` + `onArrived` props (fast dart mode)
- `app/page.tsx` - `SpacebarController` component (keydown + remote events), `openFolderAndFiles`, `handleDotArrived`

**Architecture note:** `SpacebarController` is a renderless component inside `<MultiplayerProvider room="folders">` so it can call `useMultiplayer()`. The parent `Home` component sits above the provider, so it can't use the hook directly.

## Performance Polish - COMPLETED (April 14, 2026)

8 workstreams implemented and building clean.

**1. Capitalize "I"** - DONE. "I've" capitalized in AdminAuth.tsx (3 locations: canvas, input phase, color transition).

**2. Auto-Close External Windows** - DONE. `openWindowRefs` tracks all `window.open()` refs. `closeAllExternalWindows()` called before each spacebar advance. Previous folder's FolderWindow also closes.

**3. Updated folders.json** - DONE. Complete rewrite reflecting CH/HM file naming. CH files excluded from display. HM files with local paths. New slides for grieve (34 JPEGs). 12W3-poly now has content.

**4. Smart Window Sizing** - DONE. `openExternalWindowSized(url, windowCount, windowIndex)` tiles windows: 1=full screen, 2=half, 3=third, etc. Pre-computed from folder contents (1 viewer + N HTML + N executables).

**5. Organic Folder Scatter** - DONE. `handleAutoArrange` rewritten with seeded random + collision avoidance (120x100px spacing, 40px margins). Places in FOLDER_SEQUENCE order.

**6. Dance Page Overhaul** - DONE. Text direction reversed (top to bottom). 2 prompts changed "Dance" to "Move". "Press space to begin" changed to "override". Visible countdown for long commands (numbers turn yellow).

**7. Sleep Verification** - No changes needed (text already centered).

**8. Credits After Folder 19** - DONE. `handleAllComplete` closes all windows, shows credits overlay: "Thank you / CultureHub LA / Stacy / Josephine Made / Geo Morjan Jihad / Bina Senator / Prop 46". Fade-in animation (2s).

## UX Polish - COMPLETED (April 14, 2026)

3 changes implemented and building clean.

**1. Smart Sizing for Manual Opens** - DONE. `handleFileDoubleClick` now uses `getWindowLayout` + `openExternalWindowSized` so manual file double-clicks tile windows identically to the spacebar flow.

**2. Persist Progress via localStorage** - DONE. `everOpenedIds` saved to `localStorage` on change, restored on page load. Refreshing the page resumes the spacebar sequence where you left off.

**3. Reset Button** - DONE. Round arrow SVG button next to "Arrange" in lower left. `handleReset` closes all external windows, closes all folders, clears `everOpenedIds` (state + localStorage), resets guide dot to folder 1, hides credits.

## Visual Polish + Projector Fixes - COMPLETED (April 15, 2026)

10 workstreams implemented and building clean.

**1. Smaller Markers** - DONE. All landing page markers 25% smaller, NBN 50% smaller. Repositioned to prevent overlaps.

**2. Reset Button SVG** - DONE. Cleaner circular arrow using proper arc path.

**3. Back Arrow Button** - DONE. Left chevron button between Arrange and Reset. `handleGoBack` removes last folder from `everOpenedIds`, opens previous folder's files. Guide dot naturally moves back.

**4. Breaking News Borders 3x** - DONE. `py-2` -> `py-6` on top banner and bottom ticker for 3r1-breaking and 19r4-found.

**5. Arms Camo Pattern** - DONE. Replaced flat `#556B2F` with repeating-linear-gradient camo (dark green, olive, brown, tan, black). 3x border height.

**6. Window Insets 15%** - DONE. `openExternalWindowSized` and `openExternalWindow` now use 15% inset on all sides. Effective area = 70% of screen, centered. For projector edge cropping.

**7. Dance Text** - DONE. All text sizes +30% (intro 4xl, feedback 2xl, regular 3xl). History text brighter (50% opacity). Panel starts 100px from top.

**8. Grieve Slides Bigger** - DONE. Viewer images changed from `max-w-full max-h-full` to `w-full h-full` so slides scale up to fill the window.

**9. NBN Logo Update** - DONE. New PNGs: black text on camera/viewer pages, white text on landing/folder pages. Removed `opacity-20` - now fully visible with transparent backgrounds.

**10. Omar Damma** - DONE. All `[LAST NAME]` replaced with `DAMMA` in 3r1-breaking and 19r4-found ticker text.

## Key Files

- `config/folders.json` - 19 folders config
- `config/folder-sequence.ts` - fixed 19-folder performance sequence
- `app/page.tsx` - admin page with MultiplayerProvider + AdminAuth + FolderGuideCursor
- `app/admin/page.tsx` - redirect to `/`
- `components/auth/AdminAuth.tsx` - auth screen with typing, markers, cursor, multiplayer
- `components/cursor/AutonomousCursor.tsx` - autonomous glowing dot (auth screen)
- `components/cursor/FolderGuideCursor.tsx` - orbiting cursor (folder page)
- `components/folders/FolderIcon.tsx` - symbolic per-folder icons with B&W grain
- `components/markers/FloatingMarkers.tsx` - 8 B&W floating markers (incl. NBN)
- `components/multiplayer/MultiplayerProvider.tsx` - PartyKit WebSocket context
- `components/multiplayer/RemoteCursors.tsx` - remote cursor rendering
- `party/main.ts` - PartyKit server
- `components/physarum/PhysarumBackground.tsx` - sequential yellow mold + traveling dots
- `app/globals.css` - fonts, colors, animations
- `public/markers/` - dumbbell.png, drone.png, flame.png, webcam.png
- `public/markers/nbn/` - 5 NBN logo SVG variations
- `app/camera/3r1-breaking/page.tsx` - news page with NBN watermark + badge
- `app/camera/11r2-arms/page.tsx` - press briefing with NBN watermark + badge
- `app/camera/19r4-found/page.tsx` - found news with NBN watermark + badge
- `app/content/viewer/page.tsx` - media viewer (no loop, smaller arrows)
