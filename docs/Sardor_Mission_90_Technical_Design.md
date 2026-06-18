# Sardor Mission 90 - Technical Design Document

## 1. Project Structure
**Purpose:** Defines the high-level application pattern as a Single Page Application (SPA) built purely with Vanilla JS, HTML, and CSS, functioning entirely as an offline-first PWA.
**Inputs:** User interactions, browser events, network state changes.
**Outputs:** High-performance DOM manipulations rendering different application states natively.
**Data Structures:** Application context singleton `AppContext` holding global references.
**Dependencies:** Service Worker API for offline capabilities, Web App Manifest.

## 2. Folder Structure
**Purpose:** Organizes source code into logical domains for strict maintainability without relying on a bundler.
**Inputs:** None.
**Outputs:** Directory tree mapping to feature modules.
**Data Structures:** 
```text
/css        (variables.css, base.css, layout.css, components.css)
/js         
  /core     (app.js, router.js, state.js)
  /engines  (curriculum.js, xp.js, streak.js, progress.js)
  /views    (dashboard.js, track.js, analytics.js)
  /components(nav.js, cards.js, charts.js)
  /utils    (dom.js, date.js, format.js)
/assets     (images/, icons/, fonts/)
/data       (curriculum.json, quotes.json)
index.html
sw.js       (Service Worker)
manifest.json
```
**Dependencies:** HTTP Server for local development (to serve ES6 modules and SW).

## 3. File Responsibilities
**Purpose:** Ensure strict Separation of Concerns (SoC) where each file handles one specific domain (MVC pattern adaptation).
**Inputs:** Application initialization phase.
**Outputs:** Bound event listeners, initialized local state, rendered initial DOM.
**Data Structures:**
- `app.js`: Main entry point, bootstrapper, Service Worker registration.
- `state.js`: LocalStorage wrapper, state mutations, and event emitter.
- `router.js`: Hash-based navigation logic and view mounting.
- `dom.js`: Reusable pure helper functions for DOM traversal and manipulation.
**Dependencies:** Native ES6 Modules (`<script type="module">`).

## 4. Screen Architecture
**Purpose:** Define the distinct views of the application and their lifecycles (mount, unmount, update).
**Inputs:** Route hash changes (`window.onhashchange`), state change events.
**Outputs:** Template literal HTML string insertion into the main `#app` container, lifecycle hook execution.
**Data Structures:** 
- `ScreenObject`: `{ id: string, title: string, render(): string, afterRender(): void, destroy(): void }`
**Dependencies:** `router.js`, `state.js`.

## 5. Navigation Architecture
**Purpose:** Manage view transitions seamlessly without full page reloads using URL hash fragments.
**Inputs:** Clicks on anchor tags (`href="#/dashboard"`).
**Outputs:** Updated URL hash, triggering the router to match the route, destroy the old view, and render the new screen.
**Data Structures:**
- `RouteMap`: `Map<string, ScreenObject>` (e.g., `'#/dashboard' -> DashboardView`)
**Dependencies:** Browser History API / Location Hash (`window.location.hash`).

## 6. Component Architecture
**Purpose:** Create reusable, stateless UI elements using functional JavaScript that returns template literal strings.
**Inputs:** Component props (plain JS objects, state values).
**Outputs:** Pure HTML string representation of the component.
**Data Structures:**
- `ComponentFunction`: `(props) => string`
**Dependencies:** None (Pure vanilla JS functions).

## 7. State Management Architecture
**Purpose:** Provide a centralized store for application data that automatically syncs with LocalStorage and emits events on change.
**Inputs:** Dispatched actions/state updates from views or engines.
**Outputs:** Updated `LocalStorage`, dispatched `stateChange` custom events across the DOM.
**Data Structures:**
- `StateTree`: `{ user: {...}, progress: {...}, settings: {...} }`
- `Store`: `{ getState(), setState(path, val), subscribe(listener) }`
**Dependencies:** `window.localStorage`, `EventTarget` (Publish-Subscribe pattern).

## 8. LocalStorage Data Schema
**Purpose:** Define the exact JSON structure persisted in the browser to ensure data integrity across sessions.
**Inputs:** Validated state updates.
**Outputs:** JSON stringified data persisted securely in LocalStorage.
**Data Structures:**
- `sm90_user`: `{ name: string, startDate: ISOString, totalXp: number, currentStreak: number, maxStreak: number, level: number }`
- `sm90_progress`: `Record<missionId, { status: "completed"|"pending", completedAt: ISOString }>`
- `sm90_journal`: `Array<{ id: string, date: ISOString, mood: number, notes: string }>`
- `sm90_settings`: `{ theme: "dark"|"light", offlineMode: boolean }`
**Dependencies:** `state.js`, `JSON.stringify()`, `JSON.parse()`.

## 9. Curriculum Engine Design
**Purpose:** Load, parse, and serve the structured 90-day learning content without a backend.
**Inputs:** Current day number (1-90), requested track context (Python/English/AI).
**Outputs:** specific mission data, reading materials, and exercises mapped to the user's current day.
**Data Structures:**
- `CurriculumMap`: `Map<DayNumber, { python: Mission, english: Mission, ai: Mission }>`
- `Mission`: `{ id: string, type: "read"|"code"|"quiz", title: string, content: string, xpReward: number }`
**Dependencies:** Static JSON files fetched once via `fetch()` and cached locally via Service Worker.

## 10. Progress Engine Design
**Purpose:** Calculate, validate, and track completion percentages of the 90-day mission.
**Inputs:** Mission completion events, user's start date, current date.
**Outputs:** Daily completion flags (all 3 tasks done?), overall completion percentage (0-100%).
**Data Structures:**
- `ProgressCalculator`: `(totalMissions, completedMissions) => float`
**Dependencies:** `curriculum.js`, `state.js`.

## 11. XP Engine Design
**Purpose:** Handle gamification mechanics by awarding experience points based on task completion and bonuses.
**Inputs:** Mission completion triggers, daily trio completion (completing all 3 tracks in one day).
**Outputs:** Mutated `totalXp` in the state tree.
**Data Structures:**
- `XpTransaction`: `{ action: string, basePoints: number, streakMultiplier: number, totalAwarded: number }`
**Dependencies:** `progress.js`, `streak.js` (for calculating multipliers).

## 12. Level System Design
**Purpose:** Map accumulated total XP to a user level and title to provide long-term motivation.
**Inputs:** `totalXp` from State.
**Outputs:** Current Level (integer), Title (string), progress bar percentage to the next level.
**Data Structures:**
- `LevelThresholds`: `Array<{ level: number, xpRequired: number, title: string }>`
**Dependencies:** `xp.js`.

## 13. Streak System Design
**Purpose:** Encourage daily consistency by tracking consecutive days of activity.
**Inputs:** Current login date, last recorded active date, daily mission completion status.
**Outputs:** Updated `currentStreak` and `maxStreak`. Capable of detecting broken streaks.
**Data Structures:**
- `StreakEvaluator`: `(lastActiveDate, currentDate) => { action: 'increment' | 'reset' | 'maintain' }`
**Dependencies:** Native `Date` object parsing, `state.js`.

## 14. Analytics System Design
**Purpose:** Aggregate user data into visual formats without external charting libraries.
**Inputs:** Historical progress data (`sm90_progress`), XP logs.
**Outputs:** Rendered charts (GitHub-style contribution heatmap, simple bar charts).
**Data Structures:**
- `HeatmapData`: `Array<{ date: ISOString, level: 0|1|2|3 }>`
**Dependencies:** CSS Grid (for heatmaps) or native HTML5 `<canvas>` (for radar charts).

## 15. Motivation System Design
**Purpose:** Provide dynamic quotes, milestone celebrations, and context-aware prompts.
**Inputs:** Current streak value, level up events, time of day.
**Outputs:** UI Toast notifications, banner messages, modal dialogues for major milestones (Day 30, 60, 90).
**Data Structures:**
- `QuoteBank`: `Array<{ category: "streak" | "struggle" | "milestone", text: string, author: string }>`
**Dependencies:** `streak.js`, `level.js`.

## 16. Portfolio System Design
**Purpose:** Compile the user's completed capstone projects into a shareable, static "Proof of Work" view.
**Inputs:** Completed project flags, user level.
**Outputs:** A beautifully formatted, printable HTML view summarizing the 90-day transformation.
**Data Structures:**
- `PortfolioManifest`: `Array<{ dayCompleted: number, title: string, skills: Array<string> }>`
**Dependencies:** `progress.js`, `curriculum.js`.

## 17. Journal System Design
**Purpose:** Allow the user to reflect daily on their learning, tracking mood and notes completely offline.
**Inputs:** User text input from `<textarea>`, mood selection from UI toggles.
**Outputs:** Saved journal entry in LocalStorage, formatted chronological timeline view.
**Data Structures:**
- `JournalEntry`: `{ id: UUID, timestamp: integer, mood: string, content: string }`
**Dependencies:** `state.js`, DOM sanitization utility.

## 18. Theme System Design
**Purpose:** Support dynamic styling (Dark/Light mode, high contrast) seamlessly.
**Inputs:** User theme preference toggle, OS color scheme preference.
**Outputs:** Applied HTML `data-theme` attribute (e.g., `<html data-theme="dark">`), updating CSS custom properties instantly.
**Data Structures:**
- `ThemeState`: `"dark" | "light" | "system"`
**Dependencies:** CSS Variables (`--bg-color`, `--text-color`), `window.matchMedia('(prefers-color-scheme: dark)')`.

## 19. Mobile Responsive Strategy
**Purpose:** Ensure the PWA feels exactly like a native app on mobile devices (touch targets, safe areas).
**Inputs:** Viewport dimensions, device orientation.
**Outputs:** Adjusted layout configurations (e.g., bottom sticky tab bar on mobile, left sidebar on desktop).
**Data Structures:**
- `MediaQueries`: Defined in `variables.css` (e.g., `--bp-mobile: 768px`).
**Dependencies:** CSS Flexbox/Grid, Viewport Meta Tag, CSS `env(safe-area-inset-bottom)`.

## 20. Performance Optimization Strategy
**Purpose:** Guarantee 60fps scrolling, instant navigation, and zero layout shift.
**Inputs:** DOM render cycles, asset loading phase.
**Outputs:** Highly optimized rendering flow.
**Data Structures:** N/A
**Dependencies:** 
- Global Event Delegation (binding clicks to `body` and identifying targets).
- `DocumentFragment` for batch DOM insertions.
- `<link rel="preload">` for critical fonts and CSS.

## 21. Offline Strategy
**Purpose:** Ensure 100% functionality without an internet connection using a Service Worker.
**Inputs:** Network state (`navigator.onLine`), fetch requests interception.
**Outputs:** Cache-first strategy for static assets, local data mutation.
**Data Structures:**
- `CacheRegistry`: `{ static: 'sm90-static-v1', data: 'sm90-data-v1' }`
**Dependencies:** Service Worker API, Cache Storage API, Web App Manifest.

## 22. Error Handling Strategy
**Purpose:** Gracefully handle missing data, corrupted LocalStorage, or routing mismatches.
**Inputs:** `try/catch` block triggers around LocalStorage access and JSON parsing.
**Outputs:** Non-intrusive fallback UI states, automatic data recovery attempts, and factory reset prompts if unrecoverable.
**Data Structures:**
- `ErrorState`: `{ hasError: boolean, message: string }`
**Dependencies:** `window.onerror`, custom Error boundary logic in `router.js`.

## 23. Accessibility Strategy
**Purpose:** Ensure the application is perfectly usable by keyboard navigation and screen readers.
**Inputs:** HTML DOM structure, focus states.
**Outputs:** A WCAG compliant application interface.
**Data Structures:** N/A
**Dependencies:** Semantic HTML5 elements (`<nav>`, `<main>`, `<article>`, `<button>`), ARIA attributes (`aria-hidden`, `aria-label`), `:focus-visible` CSS rules.

## 24. Future Expansion Strategy
**Purpose:** Design the vanilla architecture so that adding a real backend (e.g., REST API or Firebase) later requires minimal refactoring.
**Inputs:** Abstracted data access layer calls.
**Outputs:** An `api.js` interface that currently resolves standard Promises wrapping LocalStorage, which can easily be swapped out for `fetch()` operations.
**Data Structures:**
- `DataAdapterInterface`: `{ async getUser(), async saveProgress(), async syncData() }`
**Dependencies:** ES6 Promises, standardized asynchronous data flow throughout components.
