# Sprint 5: Habit System

## Context Files to Read First
- `context/components/habit-strip.md`
- `context/hooks/all-hooks.md` (useHabits section)
- `context/api/routes.md` (habits section)
- `docs/product/features.md` (Habits section)

## Goal
Full habit CRUD, habit strip in Today View, streak tracking.

## Tasks
1. **useHabits hook**: useTodayHabits (frequency filter), useTodayCompletions (SINGLE query, not N+1), mutations.
2. **Habit API routes**: CRUD + toggle endpoint with server-side streak calculation.
3. **Streak engine**: Server function. Walk completions backwards. Grace period (4 AM). Update current/longest streak.
4. **HabitCircle**: Pillar color fill. Icon/letter. Streak count. Pulse animation (incomplete). Check animation (complete). Tap to toggle (optimistic).
5. **HabitStrip**: Horizontal scroll row. Due-today habits. Sort: incomplete first. Fixed at top of TodayView.
6. **HabitDetailPopover**: Long-press/hover. Streak stats, pillar, goal link, frequency, "Skip today".
7. **CreateHabitModal**: Name, pillar picker (required), goal picker (optional, filtered by pillar), frequency, icon.
8. **GoalDetailModal integration**: Add habits section. Show linked habits. "Add habit" button.

## Acceptance Criteria
- [ ] Can create habits assigned to pillars
- [ ] Habit strip shows today's due habits
- [ ] Tap to complete with animation
- [ ] Streaks increment and persist
- [ ] Grace period works (3 AM completion counts for yesterday)
- [ ] Longest streak never resets
- [ ] Habits appear in GoalDetailModal if linked
