# Sardor Mission 90 - System Architecture

## 1. Product Vision
Sardor Mission 90 is an offline-first, gamified progressive web application (PWA) designed to transform the user into a proficient Python Backend Developer over 90 days. It seamlessly integrates three core pillars: Python Backend Development, English Language Mastery, and Academic AI studies. The app focuses on habit formation through XP, streaks, and offline capabilities, ensuring consistent progress even without an internet connection.

## 2. User Journey
1. **Onboarding**: User sets baseline skills in Python, English, and AI. Commits to the 90-day pledge.
2. **Daily Routine**: 
   - Morning: Review daily missions (Python, English, AI).
   - Execution: Complete offline tasks (coding exercises, vocabulary drills, reading papers).
   - Sync: App syncs progress when online.
3. **Weekly Check-in**: Review weekly analytics, unlock new modules, and adjust difficulty.
4. **Milestone Reached (Day 30/60/90)**: Unlock major achievements, portfolio generation, and comprehensive skill assessment.
5. **Graduation (Day 90)**: Final project completion, resume generation, and transition to continuous learning mode.

## 3. Information Architecture
- **Dashboard**: Central hub for daily tasks, streak, and XP summary.
- **Learning Modules**:
  - Python Backend (Django/FastAPI, Databases, APIs)
  - English (Vocabulary, Grammar, Technical Reading)
  - Academic AI (Math, ML Concepts, Paper Review)
- **Progress & Analytics**: Detailed charts, historical data, skill radar.
- **Profile & Settings**: App configuration, sync status, offline data management.

## 4. Screen Map
- `SplashScreen` -> `OnboardingFlow`
- `MainApp`:
  - `DashboardScreen` (Home)
  - `MissionScreen` (Daily Tasks)
  - `PythonTrackScreen`
  - `EnglishTrackScreen`
  - `AITrackScreen`
  - `AnalyticsScreen`
  - `SettingsScreen`

## 5. Navigation Structure
- **Bottom Tab Navigation**: Dashboard, Missions, Tracks, Analytics
- **Top Bar**: User Profile, Streak Flame, XP Counter, Sync Status Indicator
- **Drawer/Side Menu**: Settings, Export Data, Dark/Light Mode Toggle, Help

## 6. Component Tree
- `App`
  - `AuthProvider` (Local & Remote)
  - `SyncManager` (Offline Sync Engine)
  - `MainLayout`
    - `TopNav` (Streak, XP, SyncStatus)
    - `Router`
      - `Dashboard`
        - `DailyProgressCard`
        - `TrackSummaryWidget`
      - `MissionBoard`
        - `MissionCard` (Python/English/AI)
      - `Analytics`
        - `RadarChart`
        - `Heatmap`
    - `BottomNav`

## 7. Data Model
- `User`: { id, name, startDate, totalXP, currentStreak, highestStreak, settings }
- `Track`: { id, name (Python/English/AI), level, totalProgress }
- `Module`: { id, trackId, dayNumber, title, description, isCompleted, xpReward }
- `Mission`: { id, moduleId, type, content, isCompleted, dateCompleted }
- `DailyLog`: { date, completedMissions, xpEarned, mood, notes }

## 8. LocalStorage Structure
Using IndexedDB (via Dexie.js or similar) for robust offline storage:
- `users` store: User profile and settings.
- `curriculum` store: Pre-fetched 90-day content.
- `progress` store: Completed modules, XP, and daily logs.
- `syncQueue` store: Actions performed offline waiting to be pushed to the server.

## 9. Progress System Design
- **Daily Goals**: 3 micro-tasks per track daily.
- **Module Completion**: Finishing all daily tasks unlocks the next day's module.
- **Assessments**: Weekly quizzes test knowledge retention before unlocking the next week.
- **Visuals**: Circular progress rings for daily goals, linear progress bars for the 90-day journey.

## 10. XP System Design
- **Base XP**: Completing a mission = +10 XP.
- **Bonus XP**: Completing all daily missions = +50 XP.
- **Streak Multiplier**: XP earned * (1 + (streak_days * 0.05)), capped at 2.0x.
- **Levels**: XP thresholds define levels (e.g., Level 1: 0-100 XP, Level 2: 101-250 XP).

## 11. Streak System Design
- **Definition**: Completing at least one core mission daily maintains the streak.
- **Visual Feedback**: A flame icon that changes color based on streak length (e.g., 1-7 days: Orange, 8-30 days: Blue, 30+ days: Purple).
- **Streak Freezes**: User earns 1 "Streak Freeze" every 14 days of continuous streak to cover a missed day.

## 12. Analytics System Design
- **Daily Heatmap**: GitHub-style contribution graph for the 90 days.
- **Time Tracking**: Estimated time spent per track.
- **Skill Radar**: Polygon chart showing balance between Python, English, and AI.
- **Milestone Tracker**: Timeline view of major achievements.

## 13. 90-Day Learning Structure (Python Backend)
- **Days 1-15**: Python Fundamentals, Data Structures, OOP.
- **Days 16-30**: Web Frameworks (FastAPI/Django), Routing, Requests.
- **Days 31-45**: Databases (PostgreSQL, ORMs, Migrations).
- **Days 46-60**: Authentication, Authorization, Security.
- **Days 61-75**: API Design, Testing (Pytest), Docker.
- **Days 76-90**: CI/CD, Deployment, Final Capstone Project.

## 14. English Learning Structure
- **Daily Vocabulary**: 5 technical terms per day (spaced repetition).
- **Reading Practice**: Bi-weekly technical article or documentation reading.
- **Grammar/Writing**: Weekly exercise on writing clean commit messages, documentation, or emails.
- **Speaking/Listening**: Shadowing tech talks or podcast snippets.

## 15. Academic AI Structure
- **Math Foundations**: Linear Algebra, Calculus, Probability (15 mins/day).
- **ML Concepts**: Supervised/Unsupervised learning, Neural Networks basics.
- **Paper Reading**: Analyze one seminal AI paper per week (abstract and conclusion focus).
- **Implementation**: Simple numpy-based implementations of core algorithms.

## 16. Folder Structure
```
src/
├── assets/          # Images, icons, global styles
├── components/      # Reusable UI components (Buttons, Cards, Nav)
├── config/          # App configuration, constants, theme
├── context/         # React Context (Auth, Theme)
├── hooks/           # Custom React hooks (useOffline, useSync)
├── layouts/         # Page layouts (MainLayout, AuthLayout)
├── pages/           # Route components (Dashboard, Tracks)
├── services/        # API calls, LocalDB operations (IndexedDB)
├── store/           # Global state management (Zustand/Redux)
├── types/           # TypeScript definitions
└── utils/           # Helper functions (date formatting, XP calc)
```

## 17. File Structure
```
src/
├── App.tsx
├── main.tsx
├── index.css
├── services/
│   ├── localDb.ts      # IndexedDB setup
│   ├── syncEngine.ts   # Offline-to-online sync logic
│   └── api.ts          # Remote API client
├── components/
│   ├── ui/             # Generic UI components
│   └── domain/         # Domain-specific (e.g., MissionCard.tsx)
└── pages/
    ├── Dashboard/
    │   └── index.tsx
    └── Tracks/
        ├── PythonTrack.tsx
        ├── EnglishTrack.tsx
        └── AITrack.tsx
```

## 18. Development Roadmap
- **Phase 1 (Week 1-2)**: Scaffold app, set up offline storage (IndexedDB), build UI components and navigation.
- **Phase 2 (Week 3-4)**: Implement core logic (XP, Streaks), populate 90-day curriculum data locally.
- **Phase 3 (Week 5-6)**: Build dashboard, progress tracking, and analytics visuals.
- **Phase 4 (Week 7-8)**: Implement sync engine, remote backend (optional), user authentication.
- **Phase 5 (Week 9)**: Testing (offline capabilities), bug fixing, polish, PWA installation setup.

## 19. MVP Features
- Complete offline functionality (runs entirely in browser).
- Hardcoded 90-day curriculum for all three tracks.
- Local progress tracking (LocalStorage/IndexedDB).
- Basic XP and Streak system.
- Daily dashboard and simple analytics.

## 20. Premium/Future Features
- Cloud sync across multiple devices.
- AI-powered personalized curriculum adjustments.
- Social leaderboards and accountability groups.
- Integration with GitHub for actual commit tracking.
- Exportable "Proof of Work" portfolio PDF upon completion.
