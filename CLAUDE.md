# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

**Package Manager**: Use `bun` instead of npm/yarn (see `.cursor/rules/`)

- `bun install` - Install dependencies
- `bun dev` - Start development server with Turbopack
- `bun run build` - Build for production
- `bun run start` - Start production server
- `bun run lint` - Run ESLint

**Database Operations**:

- `bunx drizzle-kit generate` - Generate migrations
- `bunx drizzle-kit migrate` - Run migrations
- `bunx drizzle-kit studio` - Open Drizzle Studio

## Architecture Overview

**Tech Stack**:

- Next.js 15 with App Router and Turbopack
- TypeScript with strict mode
- Tailwind CSS with custom sci-fi themes
- PostgreSQL with Drizzle ORM
- Better Auth for authentication
- Zustand for client state management

**Project Structure**:

- `/src/app/` - Next.js App Router (pages, API routes, server actions)
- `/src/components/` - React components with server/client separation
- `/src/db/` - Database configuration and schema
- `/src/lib/` - Utilities, auth config, analytics
- `/src/store/` - Zustand state management
- `/src/types/` - TypeScript type definitions
- `/drizzle/` - Database migrations and schema files

**Key Design Patterns**:

1. **Server/Client Component Split**: Components are organized into `/server/` and client-side directories. Server components handle data fetching, client components handle interactivity.

2. **Optimistic Updates**: The Zustand store (`command-ops-store.ts`) implements optimistic updates with server sync and error rollback for all CRUD operations.

3. **Progressive Hydration**: Uses `StoreInitializer` component to initialize client state with server data, preventing hydration mismatches.

4. **Error Boundaries**: Dedicated error components in `/error-states/` with type-safe error handling.

5. **Skeleton Loading**: Matching skeleton components in `/skeletons/` for each data component.

**Database Schema**:

- **Users**: Authentication with onboarding status
- **Missions**: Top-level project containers
- **Quests**: Individual tasks that can belong to missions
- **Standing Orders**: Recurring task templates
- Relations: User -> Missions -> Quests hierarchy

**Authentication Flow**:

- Better Auth with Google OAuth and email/password
- Onboarding redirect logic in middleware
- User state stored in database, commander stats in Zustand

**State Management**:

- Server state: React Server Components + Server Actions
- Client state: Zustand with optimistic updates
- UI state: Local component state + Zustand for global UI
- Theme state: next-themes with custom sci-fi themes

**Theming System**:
Three custom themes with CSS variables:

- `default` - Standard dark mode
- `nightops` - Military night operations
- `cscz` - Counter-Strike inspired

Fonts: Roboto Mono (primary), Silkscreen (headers)

**Testing Strategy**:
Currently no test framework configured. When adding tests, prefer Bun's built-in test runner (`bun test`).
