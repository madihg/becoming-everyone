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

## Key Files

- `config/folders.json` - 19 folders config
- `app/page.tsx` - admin page (landing) wrapped in MultiplayerProvider + AdminAuth
- `app/admin/page.tsx` - redirect to `/`
- `components/auth/AdminAuth.tsx` - auth screen with typing, markers, cursor, multiplayer
- `components/cursor/AutonomousCursor.tsx` - autonomous glowing dot
- `components/markers/FloatingMarkers.tsx` - 7 B&W floating markers
- `components/multiplayer/MultiplayerProvider.tsx` - PartyKit WebSocket context
- `components/multiplayer/RemoteCursors.tsx` - remote cursor rendering
- `party/main.ts` - PartyKit server
- `components/physarum/PhysarumBackground.tsx` - yellow mold animation
- `app/globals.css` - fonts, colors, animations (marker-hover, admin-auth-char)
- `public/markers/` - dumbbell.png, drone.png, flame.png
