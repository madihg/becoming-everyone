[PRD]

# PRD: Media Viewer & Admin UX Improvements

## Overview

The Becoming Everyone interface needs a dedicated media viewer for opening images, videos, and PDFs from folder windows. Currently, double-clicking a file opens the raw URL in a new browser tab - this breaks the performance aesthetic and provides no navigation between files.

The media viewer opens in a separate clean browser window (no toolbar/controls) sized to match the source screen panel. It displays media full-screen on a black background with arrow key navigation between files in the folder. Videos play inline with click/spacebar pause. PDFs render page-by-page as slides.

Additionally, the admin screen labels need better visibility (tab-like UI with borders) and an auto-arrange button to grid-layout folders numerically within each screen.

## Goals

- Replace raw file URL opening with a dedicated projection-quality media viewer
- Enable seamless arrow-key navigation through a folder's files (images, videos, PDFs)
- Render PDFs as slides (one page at a time, arrow keys to navigate pages)
- Improve admin screen label visibility with tab-like styling
- Add one-click auto-arrange to grid-layout folders numerically within a screen

## Quality Gates

These commands must pass for every user story:

- `npx tsc --noEmit` - TypeScript compilation with no errors
- `npx next lint` - Next.js linting passes
- `npm run build` - Production build succeeds
- Manual visual verification in browser - this is a visual art piece projected on large screens

## User Stories

### US-017: Media Viewer Route

**Description:** As a performer, I want double-clicking an image or video file in a folder window to open a clean browser window showing the media full-screen so that the audience sees a projection-quality display instead of a raw browser tab.

**Acceptance Criteria:**

- [ ] New route at `/content/viewer` accepts query params `folder` (folder ID) and `index` (0-based file index)
- [ ] Route renders on a pure black background, full viewport
- [ ] `window.open()` call uses features string to hide toolbar, menubar, location bar, status bar
- [ ] Window size matches the bounding rect of the source screen panel (the `data-tab-panel` element)
- [ ] Image files render centered, `object-fit: contain`, filling the viewport
- [ ] Video files render centered, `object-fit: contain`, autoplay on open
- [ ] All text uses Diatype Mono Variable
- [ ] Viewer loads the folder's contents array from `/api/folders` and filters to viewable types (image, video, pdf)
- [ ] Files are sorted by filename naturally (numeric sort: 1, 2, 3... 10, 11)
- [ ] Current file index shown as subtle counter bottom-center (e.g., "3 / 7") in text-muted at low opacity
- [ ] Replaces current behavior where image/video files open raw URLs in new tabs

---

### US-018: Arrow Key Navigation in Media Viewer

**Description:** As a performer, I want to press left/right arrow keys to navigate between files in the viewer so that I can step through a folder's contents during the performance.

**Acceptance Criteria:**

- [ ] Right arrow key advances to the next file in the sorted order
- [ ] Left arrow key goes to the previous file
- [ ] At the last file, right arrow does nothing (no wrap/loop)
- [ ] At the first file, left arrow does nothing (no wrap/loop)
- [ ] Transition between files is instant (no animation delay)
- [ ] Subtle left/right arrow indicators appear on hover near the edges (10% opacity, fade in/out)
- [ ] Clicking the left/right edge zones also navigates (not just keyboard)
- [ ] Navigation works the same for images and videos
- [ ] When navigating away from a playing video, the video stops
- [ ] When navigating to a video, it autoplays

---

### US-019: Video Controls in Media Viewer

**Description:** As a performer, I want minimal video controls in the viewer so that I can pause and resume playback during the performance.

**Acceptance Criteria:**

- [ ] Clicking anywhere on a video toggles play/pause
- [ ] Spacebar toggles play/pause on the current video
- [ ] No native browser video controls shown (no `controls` attribute)
- [ ] A subtle play/pause icon appears briefly (0.5s fade) in the center when toggling
- [ ] Video plays from the beginning each time it's navigated to
- [ ] Spacebar does NOT conflict with arrow key navigation
- [ ] Videos play with audio (performer controls volume via system)

---

### US-020: PDF Slide Viewer

**Description:** As a performer, I want PDF files to render as slides in the viewer (one page at a time) so that presentations display like a slideshow on the projected screen.

**Acceptance Criteria:**

- [ ] PDF files are detected by type "pdf" in the folder contents
- [ ] PDFs render using a client-side PDF library (pdf.js or similar)
- [ ] One page displayed at a time, centered, `object-fit: contain` on black background
- [ ] Arrow keys navigate between PDF pages (not between files) while viewing a PDF
- [ ] A way to exit the PDF back to the folder file list (Escape key)
- [ ] Page counter shows current page (e.g., "Page 3 / 12") bottom-center
- [ ] PDF pages render at high resolution suitable for projection (at least 2x device pixel ratio)
- [ ] If pdf.js fails to load, show filename with "PDF" label as fallback

---

### US-021: Admin Screen Labels - Tab Styling

**Description:** As an admin, I want the screen labels to look like proper tabs with visible borders so that I can clearly see which screens exist and manage them.

**Acceptance Criteria:**

- [ ] Screen labels styled as tab-like rectangles with a visible border
- [ ] Text color is brighter (text-muted at ~70% opacity, not 30-50%)
- [ ] Each tab has a thin border (1px, #444 or similar) forming a rounded rectangle
- [ ] Active/current screen tab slightly brighter or has a bottom highlight
- [ ] Close "x" button visible inside the tab rectangle (not hidden until hover)
- [ ] "+" button styled consistently, positioned after the last tab
- [ ] Tabs are positioned top-left of their respective screen panels
- [ ] A thin underline/separator runs below the tab extending the width of the panel
- [ ] Double-click to rename still works
- [ ] Visual style inspired by VS Code tab bar (minimal, dark, clear delineation)

---

### US-022: Admin Auto-Arrange Button

**Description:** As an admin, I want a button that automatically arranges all folders in a screen into a neat grid sorted by their number prefix so that I can quickly organize the layout.

**Acceptance Criteria:**

- [ ] Small button in the lower-right corner of each screen panel
- [ ] Button label: "Arrange" or grid icon, styled subtly (low opacity, visible on hover)
- [ ] Clicking sorts all folders in that screen by their numeric prefix (1, 2, 3... 19)
- [ ] Sorted folders are placed in a grid layout starting from top-left
- [ ] Grid uses consistent spacing (e.g., 100px horizontal, 90px vertical gap)
- [ ] Grid starts below the tab label area (y >= 40)
- [ ] Grid wraps to next row when reaching panel width minus padding
- [ ] Positions are persisted to `config/folders.json` via the existing API
- [ ] Operation is instant (no animation needed)
- [ ] Does not affect folders in other screens

---

## Functional Requirements

- **FR-01**: Double-clicking an image or video file in a FolderWindow must open the media viewer route in a new browser window via `window.open()`
- **FR-02**: The viewer window must be sized to match the source screen panel dimensions
- **FR-03**: The viewer must load the folder's file list from the API and sort by filename naturally
- **FR-04**: Arrow keys must navigate between files; at boundaries, navigation stops (no loop)
- **FR-05**: Videos must autoplay when navigated to and stop when navigated away from
- **FR-06**: Click and spacebar must toggle video play/pause
- **FR-07**: PDFs must render one page at a time using pdf.js with arrow key page navigation
- **FR-08**: Escape key exits PDF view back to folder file navigation
- **FR-09**: Admin screen labels must render as visible tab-like elements with borders and close buttons
- **FR-10**: Auto-arrange button must sort folders numerically and place them in a grid within the panel

## Non-Goals (Out of Scope)

- **No fullscreen API** - the window.open approach is sufficient; no F11-style fullscreen
- **No zoom/pan** on images - full viewport, object-fit contain is enough
- **No video scrubbing** - click/spacebar pause only, no timeline
- **No drag-reorder** of files within the viewer - order is determined by filename
- **No PDF annotation or text selection** - view-only slide display
- **No thumbnails or filmstrip** - navigation is purely sequential via arrow keys
- **No presentation file conversion** - only native PDFs supported, not .pptx

## Technical Considerations

- **window.open features**: Use `toolbar=no,menubar=no,location=no,status=no` to minimize chrome. Not all browsers respect all flags, but it provides the cleanest result.
- **PDF rendering**: `pdfjs-dist` is the standard library. Render to canvas at 2x DPR for projection quality. Bundle size is ~300KB gzipped.
- **File sorting**: Natural sort (numeric-aware) so "2.png" comes before "10.png". Use `localeCompare` with `{ numeric: true }`.
- **Video autoplay**: Browsers may block autoplay with audio. Videos should attempt autoplay; if blocked, show a "click to play" indicator.
- **Panel size detection**: Read `getBoundingClientRect()` from the `data-tab-panel` element before calling `window.open()`.

## Success Metrics

- Double-clicking any image/video in a folder opens the viewer in a clean window at correct size
- Arrow keys navigate through all files in order without wrapping
- Videos play/pause with click and spacebar
- PDFs display page-by-page with arrow navigation
- Admin screen labels are clearly visible with tab-like borders
- Auto-arrange creates a clean numeric grid in one click
- All quality gates pass

## Open Questions

1. **Browser popup blocking** - `window.open()` may be blocked if not triggered by a direct user gesture. The current double-click trigger should satisfy this, but needs testing across browsers.
2. **PDF library choice** - `pdfjs-dist` is the standard but adds ~300KB. Alternative: render PDFs server-side to images. Decision: use pdfjs-dist for simplicity.
3. **Presentation files (.pptx)** - Currently out of scope. If needed later, could convert to PDF server-side or use a viewer library.

[/PRD]
