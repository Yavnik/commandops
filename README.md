# Command Ops - Life Management System

Transform your daily productivity into an engaging sci-fi command ops experience. This app gamifies task management with a futuristic military/gaming interface.

## Features

- **Quest System**: Tasks are "Quests" with sub-tasks as "Objectives"
- **XP & Leveling**: Gain experience and rank up as you complete quests
- **Priority Levels**: Critical, High, Standard, and Low priority missions
- **Performance Tracking**: Monitor your success rate and weekly stats
- **Immersive Theme**: Dark sci-fi UI with glowing elements and animations
- **Database**: PostgreSQL with Drizzle ORM for persistent data storage

## Getting Started

### Installation

```bash
# Clone the repository
git clone https://github.com/Yavnik/commandops.git
cd commandops

# Install dependencies
bun install

# Set up environment variables
cp .env.example .env
# Edit .env with your database credentials and other settings

# Set up the database
bunx drizzle-kit push

# Run the development server
bun dev
```

Open [http://localhost:3000](http://localhost:3000) to access the Command Ops.

## Usage

1. **Deploy New Quest**: Click the "DEPLOY NEW QUEST" button to create a new mission
2. **Add Objectives**: Break down your quest into smaller, actionable objectives
3. **Set Priority**: Choose between Critical, High, Standard, or Low priority
4. **Track Progress**: Check off objectives as you complete them
5. **Complete Missions**: Mark quests as complete to gain XP and level up

## Tech Stack

- **Framework**: Next.js 15 with App Router and Turbopack
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Better Auth with Google OAuth
- **Styling**: Tailwind CSS with custom sci-fi themes
- **UI Components**: Shadcn/ui (customized for sci-fi theme)
- **State Management**: Zustand for client state
- **TypeScript**: Full type safety with strict mode

## Future Features

- AI-powered quest decomposition
- Daily briefings
- Voice assistant integration
- Achievements and badges
- Theme customization (Quartermaster)
- Campaign system for grouping related quests

## Development

### Database Management

```bash
# Generate new migrations after schema changes
bunx drizzle-kit generate

# Apply migrations to database
bunx drizzle-kit migrate

# Open Drizzle Studio for database inspection
bunx drizzle-kit studio
```

### Code Structure

The app follows Next.js 15 App Router conventions with a clear separation between server and client components:

- **Server Components**: Handle data fetching and server-side logic
- **Client Components**: Handle user interactions and client-side state
- **Server Actions**: Handle form submissions and mutations
- **Optimistic Updates**: Zustand store implements optimistic UI updates with server sync

### Key Patterns

- **Progressive Hydration**: `StoreInitializer` prevents hydration mismatches
- **Error Boundaries**: Comprehensive error handling with recovery options
- **Type Safety**: Strict TypeScript with proper type definitions
- **Theme System**: Custom CSS variables for three sci-fi themes