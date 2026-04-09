# PRD: Omar Proximity Tracking Visualization

## Overview

Create an interactive proximity tracking visualization for the Omar character across three "O" folders (2O1-anyone, 6O2-what, 9O3-win). The system detects the performer's distance from the screen using camera tracking and displays a blue ghost/halo effect that scales and transitions based on proximity. Text dialogue appears below the figure, advancing as the performer moves closer, creating an immersive narrative experience for the theatre performance.

## Goals

- Detect performer distance from screen using camera-based body/face tracking
- Create ethereal blue ghost visualization with distance-based transitions
- Display Omar's narrative dialogue that advances with proximity
- Implement consistent floating window behavior across all interactive content
- Maintain performance quality for live theatre projection

## Quality Gates

These commands must pass for every user story:

- `npm run typecheck` - TypeScript type checking must pass with no errors
- `npm run lint` - ESLint validation must pass (warnings acceptable)
- Manual visual verification - Verify tracking accuracy, visual effects, and text display on actual hardware

## User Stories

### US-001: Proximity Detection System

**Description:** As a system, I want to detect the performer's distance from the screen so that visual effects and dialogue can respond to their proximity.

**Acceptance Criteria:**

- [ ] Implement webcam access with permission handling and error states
- [ ] Use MediaPipe Pose (BlazePose) to detect body position and size
- [ ] Calculate distance using bounding box size as primary metric (larger box = closer)
- [ ] Use MediaPipe depth estimation as secondary/refinement metric if available
- [ ] Define distance zones: Far (5-10 feet / <20% frame), Medium (3-5 feet / 20-50% frame), Close (0-3 feet / >50% frame)
- [ ] Distance detection updates in real-time (30+ FPS)
- [ ] Visually verify distance detection accuracy at 3ft, 6ft, and 10ft distances

### US-002: Blue Ghost Visual Effect

**Description:** As a performer, I want to see a blue ghost/halo representation of myself that transitions based on my distance from the screen so that the visual effect is immersive and responsive.

**Acceptance Criteria:**

- [ ] **Far distance (5-10 feet):** Display abstract blue blob with soft edges and low opacity
- [ ] **Medium distance (3-5 feet):** Display blurry black-and-white video feed with blue tint overlay
- [ ] **Close distance (0-3 feet):** Display clear blue silhouette outline with sharp edges
- [ ] Visual scales with distance: closer = larger, fills more screen (simple scaling)
- [ ] Smooth transitions between visual states (no jarring jumps)
- [ ] Blue color consistent with theme: #0080FF or similar ethereal blue
- [ ] No recognizable facial features visible in any state (maintain ghostly abstraction)
- [ ] Canvas-based rendering for performance optimization
- [ ] Visually verify smooth transitions when moving between distance zones

### US-003: 2O1-anyone Dialogue Implementation

**Description:** As a performer in the 2O1-anyone scene, I want dialogue to appear below my blue ghost figure and advance as I move closer so that the narrative unfolds with my movement.

**Acceptance Criteria:**

- [ ] Display dialogue text centered below the blue figure
- [ ] Dialogue sentences: "Anybody here?" / "What is this?" / "Anybody?" / "Do you know who I am?"
- [ ] Show one sentence at a time
- [ ] Advance to next sentence when performer moves closer (crosses distance threshold)
- [ ] Reset to first sentence when performer moves far away
- [ ] Text styling: Diatype Mono font, white color, appropriate size for projection
- [ ] [pause] markers in text create 1-2 second delays before continuing
- [ ] Visually verify text is readable from 10+ feet away (projection scale)

### US-004: 6O2-what Dialogue Implementation

**Description:** As a performer in the 6O2-what scene, I want dialogue to appear below my blue ghost figure and advance as I move closer so that Omar's struggle is communicated.

**Acceptance Criteria:**

- [ ] Display dialogue text centered below the blue figure
- [ ] Dialogue sentences: "What is happening?" / "[looks at his body] I want my body back" / "Stop taking over my body."
- [ ] Show one sentence at a time
- [ ] Advance to next sentence when performer moves closer (crosses distance threshold)
- [ ] Reset to first sentence when performer moves far away
- [ ] Text styling: Diatype Mono font, white color, appropriate size for projection
- [ ] Stage directions like "[looks at his body]" displayed in italics or lighter color
- [ ] [pause] markers create 1-2 second delays
- [ ] Visually verify text is readable from projection distance

### US-005: 9O3-win Dialogue Implementation

**Description:** As a performer in the 9O3-win scene, I want dialogue to appear below my blue ghost figure and advance as I move closer so that Omar's surrender is expressed.

**Acceptance Criteria:**

- [ ] Display dialogue text centered below the blue figure
- [ ] Dialogue sentences: "Oh man, ok, ok" / "you win, I give up"
- [ ] Show one sentence at a time
- [ ] Advance to next sentence when performer moves closer (crosses distance threshold)
- [ ] Reset to first sentence when performer moves far away
- [ ] Text styling: Diatype Mono font, white color, appropriate size for projection
- [ ] [pause] markers create 1-2 second delays
- [ ] Visually verify text is readable from projection distance

### US-006: HTML File Icons in O Folders

**Description:** As a user, I want O folders (2O1-anyone, 6O2-what, 9O3-win) to display HTML file icons when opened so that I can launch the Omar tracking visualizations.

**Acceptance Criteria:**

- [ ] Update `config/folders.json` to add HTML file entries to 2O1-anyone, 6O2-what, 9O3-win folders
- [ ] Each folder contains one HTML file icon with appropriate name (e.g., "anyone.html", "what.html", "win.html")
- [ ] HTML file type uses the existing HTML icon from FileIcon component
- [ ] Double-clicking folder opens the folder window (shows contents)
- [ ] Double-clicking HTML file icon launches the corresponding Omar tracking page
- [ ] Visually verify HTML icons display correctly in folder windows

### US-007: Floating Window System

**Description:** As a user, I want all interactive content (Omar tracking, camera feeds) to open in floating windows instead of browser tabs so that the Mac OS 9 aesthetic is maintained.

**Acceptance Criteria:**

- [ ] Create reusable FloatingWindow component or iframe-based solution
- [ ] Omar tracking pages (2O1, 6O2, 9O3) open in floating windows when HTML file is double-clicked
- [ ] Camera feeds (3R1-breaking, 19R4-found) also use HTML file icons in folders
- [ ] Update 3R1-breaking folder to contain HTML file icon (not direct camera launch)
- [ ] Update 19R4-found folder to contain HTML file icon (not direct camera launch)
- [ ] Floating windows are draggable, closable, and stay within viewport
- [ ] Floating windows have dark Mac OS 9 style chrome (consistent with FolderWindow)
- [ ] Windows open at reasonable default size (80% viewport or 1200x800px)
- [ ] Multiple windows can be open simultaneously
- [ ] Visually verify window behavior matches existing folder windows

## Functional Requirements

**FR-1:** The system must use MediaPipe Pose (BlazePose) for body tracking with bounding box size as the primary distance metric.

**FR-2:** The system must define three distance zones: Far (5-10 feet, <20% frame), Medium (3-5 feet, 20-50% frame), Close (0-3 feet, >50% frame).

**FR-3:** The visual effect must transition between three states based on distance: abstract blue blob (far) → blurry B&W video with blue tint (medium) → clear blue silhouette (close).

**FR-4:** The blue ghost effect must scale with distance: closer performers appear larger and fill more screen space.

**FR-5:** Dialogue text must display centered below the blue figure with one sentence visible at a time.

**FR-6:** Dialogue must advance to the next sentence when the performer crosses a distance threshold toward the screen.

**FR-7:** Each O folder (2O1-anyone, 6O2-what, 9O3-win) must contain an HTML file icon that launches its respective tracking page.

**FR-8:** All interactive content (Omar tracking, camera feeds) must open in floating windows, not browser tabs.

**FR-9:** Camera feed folders (3R1-breaking, 19R4-found) must be updated to contain HTML file icons instead of direct launching.

**FR-10:** Floating windows must use dark Mac OS 9 styling consistent with existing FolderWindow component.

**FR-11:** Text must use Diatype Mono font in white color at a size readable from 10+ feet (projection scale).

**FR-12:** [pause] markers in dialogue must create 1-2 second delays before continuing to the next sentence.

## Non-Goals (Out of Scope)

- Recording or saving video footage
- Audio integration or voice synthesis
- Multi-person tracking (single performer only)
- Hand gesture recognition
- Facial expression analysis
- Custom distance calibration UI (hardcoded thresholds)
- Mobile/touch optimization (performance piece for desktop projection)
- Persistence of dialogue progress across page reloads
- Background music or sound effects
- Alternative visual effects or color schemes

## Technical Considerations

- **Camera API:** Use `navigator.mediaDevices.getUserMedia()` for webcam access
- **Body Tracking:** Reuse existing BlazePose implementation from `app/content/dance/page.tsx`
- **Distance Calculation:** Primary = bounding box size (width × height), Secondary = MediaPipe z-coordinate if reliable
- **Visual Rendering:** Canvas-based for performance (60fps target), layered approach for blue effects
- **Text Display:** DOM-based text overlay on canvas for crisp rendering
- **Floating Windows:** Consider iframe-based approach or new route with `window.open()` styled as floating div
- **Window Management:** Track open windows, prevent duplicates, z-index stacking
- **Performance:** Target 30+ FPS for tracking, 60 FPS for rendering on projection hardware
- **Browser Compatibility:** Test on Chrome/Edge (primary), Safari (secondary)
- **Existing Dependencies:** `@mediapipe/tasks-vision` already installed

## Success Metrics

- Distance detection accuracy: >90% correct zone classification at test distances (3ft, 6ft, 10ft)
- Frame rate: Sustained 30+ FPS during tracking with visual effects
- Dialogue advancement: Triggers within 0.5 seconds of crossing distance threshold
- Visual quality: Blue ghost effect is ethereal and abstract (no recognizable features)
- Window behavior: All content opens in floating windows consistently
- Projection readability: Text is readable from 10+ feet away
- Zero TypeScript/ESLint errors

## Open Questions

- Should there be a "no person detected" state (e.g., fade out blue ghost when performer leaves frame)?
- Should dialogue loop back to the beginning after reaching the final sentence?
- What is the ideal threshold sensitivity for distance zone transitions (prevent flickering)?
- Should floating windows have minimize/maximize controls, or just close?
- Should we add a subtle glow/bloom effect to the blue ghost for more ethereal quality?
- What happens if multiple people are detected in frame (use largest bounding box)?
