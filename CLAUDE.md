# CLAUDE.md — Project Instructions for Claude Code

## Project Overview
Momentum is an AI-native goal tracking app. B2C, freemium. Full cross-platform (web first, then Tauri desktop, then React Native mobile).

Phase 1 (current): Web app with Pillars, Habits, Today View, Goals View, Life Map overlay, Micro-journal, Reviews.

## Tech Stack
- **Framework**: React 19 + TypeScript (strict mode)
- **Build**: Vite 7
- **Styling**: Tailwind CSS 4 + CSS custom properties (see `context/styles/design-system.md`)
- **State**: Zustand 5 (UI state) + TanStack React Query 5 (server state)
- **Routing**: React Router DOM 7
- **Backend**: Supabase (Postgres, Auth, Realtime, Edge Functions)
- **Validation**: Zod 4
- **Dates**: date-fns 4
- **DnD**: @dnd-kit (core + sortable)
- **Linting**: Biome

## Quality Standards
- Run `npx tsc --noEmit` after every file change. Zero type errors at all times.
- No `any` types. No `// @ts-ignore`. No `as unknown as`.
- Every component handles: loading state, error state, empty state.
- Every mutation has optimistic updates where appropriate and error rollback.
- Every API call has try/catch with user-facing error toast.
- Test each feature manually in the browser after building it.
- If something doesn't work, fix it before moving to the next task.


## Code Conventions

### TypeScript
- Strict mode. No `any` except in explicit escape hatches marked with `// eslint-disable-next-line`.
- All component props defined as named interfaces: `interface GoalCardProps { ... }`
- All database entities defined in `src/lib/types.ts`
- Use `as const` for literal unions instead of enums

### Components
- Functional components only. No class components.
- Named exports (not default) for all components except view-level pages.
- Co-locate component-specific types in the component file.
- Use Tailwind utilities for layout, spacing, sizing. Use CSS variables for colors, shadows, radii.
- Pattern: `className="flex items-center gap-3"` + `style={{ color: 'var(--accent)' }}`

### File Naming
- Components: PascalCase.tsx (`GoalCard.tsx`)
- Hooks: camelCase.ts (`useGoals.ts`)
- Utils/lib: camelCase.ts (`dates.ts`)
- Types: collected in `lib/types.ts`, not scattered

### Hooks (React Query)
- One file per entity: `useGoals.ts`, `useHabits.ts`, etc.
- Export named query hooks: `useGoals()`, `useGoal(id)`, `useTodayActions()`
- Export named mutation hooks: `useCreateGoal()`, `useUpdateGoal()`, `useDeleteGoal()`
- All mutations invalidate relevant queries on success
- Optimistic updates for completion toggles (habits, actions)

### API Layer
- Thin wrapper in `lib/api.ts` with typed fetch functions
- All API calls go through this wrapper (not raw supabase client in components)
- Zod validation on all API inputs
- Auth middleware on all routes

### State Management
- Zustand for UI-only state: which modals/panels are open, active overlays, drag state
- React Query for all server data: goals, actions, habits, pillars, journal, reviews
- Never duplicate server data in Zustand

## Database
- All tables have RLS enabled with `user_id = auth.uid()` policies
- See `context/schema/full-schema.sql` for the complete migration
- See individual schema context files for column explanations

## Key Architecture Rules
1. Every Goal must have a pillar_id (NOT NULL)
2. Every Habit must have a pillar_id (NOT NULL), goal_id is optional
3. Every Action must have a goal_id (NOT NULL)
4. Habits are a separate entity from Actions — different table, different hooks, different components
5. Life Map is an overlay panel, not a route/tab
6. Today View is the primary home (`/today`), Goals View is secondary (`/goals`)
7. Streaks are calculated server-side on each habit completion
8. Journal entries are AI-visible by default (global opt-out in user_settings)

## Design System
- Fonts: Nunito (body), Bricolage Grotesque (display/headings)
- Primary accent: #7C3AED (violet)
- Warm accent: #F97316 (streaks, energy)
- Success: #10B981
- Background: #F6F4F0 (warm off-white)
- Cards: #FFFFFF with subtle shadows
- Border radius: generous (10-28px range)
- Animations: ease-out cubic-bezier(0.16, 1, 0.3, 1)
- See `context/styles/design-system.md` for full token list

## When Building a Feature
1. Read the relevant sprint doc in `docs/sprints/`
2. Read all context files referenced at the top of that sprint doc
3. Start with the database migration (if new tables)
4. Build the hook (React Query)
5. Build the API route
6. Build the component
7. Wire into the view
8. Test against acceptance criteria in the sprint doc
