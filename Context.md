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
