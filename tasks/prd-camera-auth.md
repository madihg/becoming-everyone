# PRD: Camera Integration & Admin Authentication

## Overview

Add camera functionality to folders 19R4-found and 3R1-breaking that opens in separate browser tabs with theatrical breaking news overlays. Implement admin authentication with an animated password reveal sequence. Ensure consistent use of #FFE600 yellow across all existing yellow accents in the application.

This feature supports the interactive theatre piece "Becoming Everyone" by adding immersive camera-based content windows and securing admin access with a thematic authentication experience.

## Goals

- Open webcam feed in new browser tabs from specific folders (19R4-found, 3R1-breaking)
- Create distinct breaking news overlays inspired by the play's 2046 New Beirut narrative
- Implement admin authentication requiring the password "every" with animated reveal
- Enforce consistent yellow color (#FFE600) across all UI components
- Support the theatrical performance with camera-based interactive elements

## Quality Gates

These commands must pass for every user story:

- `pnpm typecheck` (or `npm run typecheck`) - TypeScript type checking
- `pnpm lint` (or `npm run lint`) - ESLint validation

## User Stories

### US-001: Consistent Yellow Color Audit

**Description:** As a designer, I want all yellow accents across the site to use #FFE600 so that the visual identity is consistent.

**Acceptance Criteria:**

- [ ] Audit all components for yellow color usage (search for yellow, #, accent color references)
- [ ] Replace all yellow hex codes with #FFE600
- [ ] Keep black/gray colors unchanged (#000000, #1a1a1a, #2a2a2a, #9ca3af)
- [ ] Update any CSS variables or theme files to use #FFE600 as the accent color
- [ ] Visually verify yellow consistency across admin and public views

### US-002: Admin Authentication Screen

**Description:** As an admin, I want to authenticate with a password before accessing the admin panel so that the interface is protected.

**Acceptance Criteria:**

- [ ] On `/admin` route load, show full-screen authentication before any admin content
- [ ] Display text: "i've always wanted to be ... one" with animated cursor at "..."
- [ ] Accept text input at cursor position (replace "...")
- [ ] If input is anything other than "every", do not proceed (clear input, reset)
- [ ] If input is "every", trigger 5-second animation sequence:
  - [ ] 2.5 seconds: All text gradually transitions from white to yellow (#FFE600)
  - [ ] 2.5 seconds: Text dissolves into random pixel blocks (TV static effect), then vanishes
- [ ] After animation completes, reveal the admin panel
- [ ] Visually verify the color transition is smooth (white → #FFE600)
- [ ] Visually verify the pixelated dissolve effect resembles old TV static

### US-003: Camera Window for 3R1-breaking Folder

**Description:** As a user, I want to open a camera feed from the 3R1-breaking folder so that I can view live breaking news content.

**Acceptance Criteria:**

- [ ] Clicking 3R1-breaking folder opens a new browser tab
- [ ] New tab requests webcam permission on load
- [ ] If permission denied, show error message "Camera access required" with retry button
- [ ] If permission granted, display live camera feed fullscreen in the tab
- [ ] Camera feed continues until tab is closed
- [ ] Visually verify camera feed displays correctly in new tab

### US-004: Camera Window for 19R4-found Folder

**Description:** As a user, I want to open a camera feed from the 19R4-found folder so that I can view live found footage content.

**Acceptance Criteria:**

- [ ] Clicking 19R4-found folder opens a new browser tab
- [ ] New tab requests webcam permission on load
- [ ] If permission denied, show error message "Camera access required" with retry button
- [ ] If permission granted, display live camera feed fullscreen in the tab
- [ ] Camera feed continues until tab is closed
- [ ] Visually verify camera feed displays correctly in new tab

### US-005: Breaking News Overlay for 3R1-breaking

**Description:** As a viewer, I want to see a breaking news overlay on the 3R1-breaking camera feed so that it feels like live news coverage.

**Acceptance Criteria:**

- [ ] Display classic TV news aesthetic with red banner containing "BREAKING NEWS"
- [ ] Show scrolling news ticker at bottom of video feed
- [ ] Ticker text includes: "BREAKING NEWS • LIVE FROM NEW BEIRUT 2046 • RAPID PERSONALITY SHUFFLE OUTBREAK • OVER 100 QUARANTINED AT NATIONAL HEALTH INSTITUTE • DR. OMAR [LAST NAME] PATIENT ZERO CONFIRMED • WITNESSES REPORT IDENTITY GLITCHING PHENOMENA • TECH TYCOON JOINS QUEER LIBERATION RALLY • BARISTAS RECOMMEND ASHWAGANDHA OVER CAFFEINE • BODYBUILDERS REQUEST CUDDLES • NHI REPORTS NO MENTAL HEALTH HISTORY • FOLKS FLIPPING PERSONAS EVERY TEN MINUTES"
- [ ] Ticker scrolls continuously left-to-right (loops seamlessly)
- [ ] Camera feed is visible behind/underneath the overlay elements
- [ ] Use Diatype Mono Variable font (or Terminal Grotesque if appropriate for news aesthetic)
- [ ] Visually verify ticker is readable and scrolls smoothly
- [ ] Visually verify overlay does not obscure too much of camera feed

### US-006: Breaking News Overlay for 19R4-found

**Description:** As a viewer, I want to see a breaking news overlay on the 19R4-found camera feed so that it shows the "found" narrative.

**Acceptance Criteria:**

- [ ] Display classic TV news aesthetic with red banner containing "BREAKING NEWS"
- [ ] Show scrolling news ticker at bottom of video feed
- [ ] Ticker text includes: "BREAKING NEWS • NEW BEIRUT 2046 • OMAR [LAST NAME] FOUND IN NORTH NEW BEIRUT • [SIGNAL GLITCH] FOUND WANTING • [SIGNAL GLITCH] FOUND BLOOMING • [SIGNAL GLITCH] FOUND GUILTY • [SIGNAL GLITCH] FOUND RISING • BEGGING FOR A DANCE • SHAKING LEGS LIKE A LOCUST • RAISING AN ARMY • IN THIS STORY GOD DOES NOT SHOW UP AT THE END • ME MATE ME MATE"
- [ ] Include visual "[SIGNAL GLITCH]" markers in ticker (could be brief static/distortion effect or just bracketed text)
- [ ] Ticker scrolls continuously left-to-right (loops seamlessly)
- [ ] Camera feed is visible behind/underneath the overlay elements
- [ ] Use Diatype Mono Variable font (or Terminal Grotesque if appropriate for news aesthetic)
- [ ] Visually verify ticker is readable and scrolls smoothly
- [ ] Visually verify glitch markers are visible and thematic

## Functional Requirements

**FR-1:** The system must audit all existing components and replace yellow color codes with #FFE600 while preserving black/gray colors.

**FR-2:** The `/admin` route must display an authentication screen before rendering any admin interface content.

**FR-3:** The authentication screen must display "i've always wanted to be ... one" with a text cursor at "..." that accepts keyboard input.

**FR-4:** The authentication screen must only accept "every" as the password; any other input must be rejected and cleared.

**FR-5:** Upon entering "every", the system must execute a 5-second animation:

- 0-2.5s: All text transitions from white (#FFFFFF) to yellow (#FFE600)
- 2.5-5s: Text dissolves into random pixel blocks resembling TV static, then vanishes

**FR-6:** After the 5-second animation completes, the system must reveal the full admin panel interface.

**FR-7:** Clicking the 3R1-breaking folder must open a new browser tab that requests webcam access.

**FR-8:** Clicking the 19R4-found folder must open a new browser tab that requests webcam access.

**FR-9:** If webcam permission is denied, the tab must display "Camera access required" with a retry button.

**FR-10:** If webcam permission is granted, the tab must display the live camera feed fullscreen.

**FR-11:** The 3R1-breaking camera tab must overlay a breaking news banner with "BREAKING NEWS" in red.

**FR-12:** The 3R1-breaking camera tab must display a scrolling ticker with text about the Rapid Personality Shuffle outbreak, quarantines, and glitching phenomena in New Beirut 2046.

**FR-13:** The 19R4-found camera tab must overlay a breaking news banner with "BREAKING NEWS" in red.

**FR-14:** The 19R4-found camera tab must display a scrolling ticker with text about Omar being "found" with glitching signal markers.

**FR-15:** Both tickers must scroll continuously left-to-right and loop seamlessly.

**FR-16:** Camera feeds must continue running until the user closes the tab.

## Non-Goals (Out of Scope)

- Camera recording or snapshot capture functionality (future enhancement)
- Different functionality between the two camera feeds beyond the ticker text
- Customizable ticker text via UI (hardcoded for now, can be edited in code later)
- Audio from camera feed
- PartyKit multiplayer integration for camera feeds
- Mobile/touch optimization for camera tabs
- Admin authentication timeout or session management
- Password recovery or alternative authentication methods
- Multiple admin password support

## Technical Considerations

- **Browser APIs:** Use `navigator.mediaDevices.getUserMedia()` for webcam access
- **New tab implementation:** Use `window.open()` or create separate routes (e.g., `/camera/3r1-breaking`, `/camera/19r4-found`) that can be opened in new tabs
- **Pixel dissolve effect:** Use Canvas API or CSS filter animations with increasing pixelation
- **Color transition:** CSS transitions or keyframe animations for smooth white → yellow gradient
- **Ticker implementation:** CSS animations with `transform: translateX()` for continuous scrolling
- **Fonts:** Use existing Diatype Mono Variable from Cargo CDN
- **Responsive design:** Camera tabs should be fullscreen regardless of viewport size
- **Performance:** Camera feed should run smoothly without blocking main thread
- **Accessibility:** Ensure keyboard input works for authentication; consider ARIA labels for camera error states

## Success Metrics

- Admin authentication works on first attempt with correct password "every"
- Animation sequence completes smoothly in 5 seconds (2.5s + 2.5s)
- Camera tabs open successfully in all modern browsers (Chrome, Firefox, Safari, Edge)
- Breaking news overlays are visually distinct between 3R1-breaking and 19R4-found
- No yellow color inconsistencies across the application after audit
- Zero TypeScript or ESLint errors

## Open Questions

- Should the admin authentication persist across sessions (localStorage) or require password on every visit? (Assume: require every visit for now)
- Should the camera tabs have a close button or rely on browser tab close? (Assume: browser tab close)
- Should there be a "dismiss" or "skip" option for authentication during development? (Assume: no, password is required)
- What should happen if the user navigates away from /admin and comes back? (Assume: require authentication again)
- Should the ticker speed be configurable? (Assume: hardcoded reasonable speed for now)
