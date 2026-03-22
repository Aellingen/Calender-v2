# Sprint 1: Foundation

## Context Files to Read First
- `context/styles/design-system.md`
- `context/schema/full-schema.sql`
- `context/views/routing.md`
- `context/components/app-shell.md`

## Goal
Empty app renders with routing, auth, and design system. Supabase schema deployed.

## Tasks
1. **Project init**: `npm create vite@latest momentum -- --template react-ts`. Install: zustand, @tanstack/react-query, react-router-dom, @supabase/supabase-js, date-fns, zod, @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities, biome
2. **Tailwind**: Install and configure. Extend theme with CSS variable references for colors.
3. **Port globals.css**: Copy from design system context. All CSS variables, animations, fonts.
4. **Types**: Create `src/lib/types.ts` with all interfaces: Pillar, Goal, Action, Habit, HabitCompletion, JournalEntry, UserSettings, Review, ReviewSnapshot.
5. **Supabase schema**: Run `context/schema/full-schema.sql` in Supabase SQL editor.
6. **Supabase client**: `src/lib/supabase.ts` with typed client.
7. **Auth**: `useAuth` hook. LoginView with email/password form.
8. **AppShell**: Header with nav tabs (Today / Goals), Life Map trigger, user menu. Main area. Calendar sidebar slot (empty).
9. **Routing**: Per `context/views/routing.md`. Auth guard + onboarding guard.
10. **API wrapper**: `src/lib/api.ts` with typed fetch function.

## Acceptance Criteria
- [ ] App loads at localhost:5173
- [ ] User can sign up and log in
- [ ] Authenticated user sees AppShell with two tabs
- [ ] Unauthenticated user redirected to /login
- [ ] All database tables exist with RLS policies
- [ ] TypeScript strict mode, no errors
