# Progress Tracker - React Native + Expo

A production-ready mobile application for personal performance tracking. Track fitness, learning, and personal development with an offline-first architecture designed for future cloud sync and social features.

## Overview

Progress Tracker is designed as a personal performance operating system that helps users:

- **Track Multiple Task Types**: Binary tasks (complete/not complete), counter tasks (numerical progress), and health-sync tasks (automatic data from Android Health Connect)
- **Daily Performance Scoring**: Intelligent scoring system based on weighted task completion
- **Streak Tracking**: Monitor current and longest streaks for motivation
- **Analytics & Insights**: Daily, weekly, monthly, and yearly analytics with visual trends
- **Offline-First**: Complete offline functionality with future cloud sync capability

## Tech Stack

- **React Native** - Cross-platform mobile development
- **Expo** - Managed React Native framework
- **TypeScript** - Strong typing for production code
- **Expo Router** - File-based routing
- **Zustand** - Lightweight state management
- **Expo SQLite** - Local database persistence
- **TanStack Query** - Server state management (for future cloud features)
- **NativeWind** - Tailwind CSS for React Native
- **React Hook Form** - Form management
- **Zod** - Schema validation
- **React Native Reanimated** - Smooth animations
- **React Native Chart Kit** - Data visualization

## Project Structure

```
├── app/                       # Expo Router screens
│   ├── (tabs)/               # Tab navigation screens
│   │   ├── index.tsx        # Dashboard
│   │   ├── projects.tsx     # Projects list
│   │   ├── analytics.tsx    # Analytics
│   │   └── profile.tsx      # Profile/Settings
│   ├── _layout.tsx          # Root layout
│   └── [other screens]      # Stack screens
│
├── src/
│   ├── components/          # Reusable components
│   │   ├── common/         # Generic components
│   │   ├── task/           # Task-related components
│   │   ├── project/        # Project-related components
│   │   └── analytics/      # Analytics components
│   │
│   ├── screens/            # Full screen implementations
│   │   ├── projects/
│   │   ├── tasks/
│   │   └── analytics/
│   │
│   ├── services/           # Data access & business logic
│   │   ├── projectRepository.ts
│   │   ├── taskRepository.ts
│   │   ├── progressLogRepository.ts
│   │   ├── dailyEntryRepository.ts
│   │   └── scoringEngine.ts
│   │
│   ├── stores/             # Zustand state management
│   │   ├── projectTaskStore.ts
│   │   └── progressStore.ts
│   │
│   ├── hooks/              # Custom hooks
│   ├── types/              # TypeScript types
│   ├── constants/          # App constants
│   ├── utils/              # Utility functions
│   └── lib/                # Library configurations
│       └── database.ts     # Database setup
│
├── assets/                 # Images, icons, etc.
├── app.json               # Expo config
├── tsconfig.json          # TypeScript config
├── tailwind.config.js     # Tailwind config
└── package.json           # Dependencies
```

## Getting Started

### Prerequisites

- Node.js 16+ and npm 7+
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (macOS) or Android Emulator

### Installation

1. **Clone or navigate to the project directory**
   ```bash
   cd progress-tracker
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Run on device/simulator**
   - **iOS**: Press `i` (requires macOS with Xcode)
   - **Android**: Press `a` (requires Android Emulator or connected device)
   - **Web**: Press `w` (for testing UI only)

### Available Scripts

```bash
npm start          # Start development server
npm run android    # Run on Android
npm run ios        # Run on iOS
npm run web        # Run on web
npm run lint       # Run ESLint
npm run format     # Format code with Prettier
npm run type-check # TypeScript type checking
npm run test       # Run tests (if configured)
```

## Architecture

### Data Flow

```
UI Components
    ↓
Zustand Stores (State Management)
    ↓
Repository Layer (Data Access)
    ↓
SQLite Database (Persistence)
```

### Key Services

**Repositories**: Handle all database operations
- `projectRepository` - Project CRUD operations
- `taskRepository` - Task CRUD operations
- `progressLogRepository` - Immutable progress logging
- `dailyEntryRepository` - Daily aggregated data

**Scoring Engine**: Core business logic
- Calculates daily performance scores
- Analyzes trends and statistics
- Generates weekly insights

**Stores**: Zustand stores for state management
- `useProjectStore` - Project and task management
- `useProgressStore` - Progress tracking and daily score
- `useSettingsStore` - User preferences

## Features

### Phase 1: Foundation ✅
- [x] Project structure and dependencies
- [x] Navigation setup (Expo Router)
- [x] Database layer (Expo SQLite)
- [x] State management (Zustand)
- [x] TypeScript types and models

### Phase 2: Projects & Tasks 🚀
- [ ] Create/list/edit projects
- [ ] Create/list/edit tasks
- [ ] Task type implementations
- [ ] Progress tracking UI
- [ ] Progress updates

### Phase 3: Dashboard & Scoring 📊
- [ ] Dashboard screen
- [ ] Scoring engine integration
- [ ] Streak system
- [ ] Daily score calculation
- [ ] Visual performance indicators

### Phase 4: Analytics 📈
- [ ] Daily analytics view
- [ ] Weekly review system
- [ ] Monthly trends
- [ ] Charts and visualizations
- [ ] Analytics screens

### Phase 5: Health & Notifications 💪
- [ ] Health Connect integration
- [ ] Notification system
- [ ] Advanced settings
- [ ] Theme support
- [ ] Data export

## Data Model

### Projects
- `id` (UUID)
- `name` (string)
- `description` (string, optional)
- `color` (hex color)
- `icon` (emoji or icon identifier)
- `createdAt` (timestamp)
- `updatedAt` (timestamp)

### Tasks
- `id` (UUID)
- `projectId` (foreign key)
- `name` (string)
- `taskType` (binary, counter, health_sync)
- `targetValue` (number)
- `unit` (string, e.g., "pushups", "pages")
- `weight` (for scoring calculation)
- Health sync configuration
- Notification settings

### Progress Logs (Immutable)
- `id` (UUID)
- `taskId` (foreign key)
- `timestamp` (when update occurred)
- `incrementValue` (amount added)
- `source` (manual or health_connect)

### Daily Entries
- `id` (UUID)
- `taskId` (foreign key)
- `date` (normalized to day)
- `achievedValue` (total for day)
- `completionPercentage` (0-100)
- `isCompleted` (reached 100%)

## Scoring System

### Formula
Daily Score = Σ(Task Completion % × Task Weight) / Total Weight × 100

### Example
- Pushups: 100% × 30 weight = 30
- Pullups: 50% × 20 weight = 10
- Steps: 80% × 30 weight = 24
- Reading: 100% × 20 weight = 20

**Daily Score = (30 + 10 + 24 + 20) / 100 × 100 = 84%**

## Performance Considerations

### Database
- Indexed foreign keys for efficient queries
- Immutable progress logs prevent data inconsistencies
- Aggregated daily entries reduce query complexity
- Transaction support for atomic operations

### UI
- React.memo for component optimization
- Reanimated for 60fps animations
- Lazy loading for heavy screens
- Efficient list rendering with FlatList

## Future Features

The architecture is designed to support:
- Cloud synchronization (Supabase/Firebase)
- User authentication
- Shared project templates
- Social features (challenges, leaderboards)
- Multi-device sync
- Advanced AI insights
- Integration with popular apps (Apple Health, Google Fit)

## Contributing

1. Follow the project structure
2. Use TypeScript for all new code
3. Run `npm run format` before committing
4. Keep components small and focused
5. Document complex business logic

## License

MIT

## Support

For issues or feature requests, please refer to the project documentation or create an issue in the repository.
