# Hooks Specification

All hooks use TanStack React Query. Typed with Zod + TypeScript.

---

## usePillars

```typescript
// Queries
usePillars(): Pillar[]              // all active pillars, sorted by sort_order
usePillar(id: string): Pillar       // single pillar

// Mutations
useCreatePillar(): (data: CreatePillarInput) => Promise<Pillar>
useUpdatePillar(): (id: string, data: UpdatePillarInput) => Promise<Pillar>
useReorderPillars(): (ids: string[]) => Promise<void>
useArchivePillar(): (id: string) => Promise<void>  // sets is_archived = true
```

Query key: `['pillars']`

---

## useGoals

```typescript
// Queries
useGoals(status?: GoalStatus): Goal[]           // filtered by status, sorted by sort_order
useGoal(id: string): Goal                        // single goal with pillar populated
useGoalsByPillar(pillarId: string): Goal[]       // for Life Map

// Mutations
useCreateGoal(): (data: CreateGoalInput) => Promise<Goal>  // pillar_id required
useUpdateGoal(): (id: string, data: UpdateGoalInput) => Promise<Goal>
useDeleteGoal(): (id: string) => Promise<void>
useReorderGoals(): (ids: string[]) => Promise<void>
```

Query key: `['goals']`, `['goals', id]`, `['goals', 'pillar', pillarId]`

---

## useActions

```typescript
// Queries
useActions(goalId?: string): Action[]           // all or filtered by goal
useTodayActions(): Action[]                      // scheduled_date = today, sorted by time/priority
useAction(id: string): Action

// Mutations
useCreateAction(): (data: CreateActionInput) => Promise<Action>  // goal_id required
useUpdateAction(): (id: string, data: UpdateActionInput) => Promise<Action>
useCompleteAction(): (id: string) => Promise<Action>  // sets status = 'complete'
useDeleteAction(): (id: string) => Promise<void>
```

Query key: `['actions']`, `['actions', goalId]`, `['actions', 'today']`

---

## useHabits

```typescript
// Queries
useHabits(): Habit[]                             // all active habits
useTodayHabits(): Habit[]                        // filtered by frequency vs current day
useHabitsByPillar(pillarId: string): Habit[]     // for Life Map
useHabitsByGoal(goalId: string): Habit[]         // for GoalDetailModal

// Completions
useTodayCompletions(): HabitCompletion[]         // all completions for today
useHabitCompletions(habitId: string, days: number): HabitCompletion[]  // history

// Mutations
useCreateHabit(): (data: CreateHabitInput) => Promise<Habit>  // pillar_id required
useUpdateHabit(): (id: string, data: UpdateHabitInput) => Promise<Habit>
useToggleHabitCompletion(): (habitId: string, date: string) => Promise<void>
  // Optimistic update: immediately show/unshow completion
  // Server: insert or delete from habit_completions + recalculate streaks
useRetireHabit(): (id: string) => Promise<void>  // sets is_active = false
```

Query key: `['habits']`, `['habits', 'today']`, `['habit-completions', 'today']`

**Critical**: `useTodayCompletions` must be a SINGLE query fetching all of today's completions, not one query per habit. Avoids N+1.

---

## useJournal

```typescript
// Queries
useTodayJournal(): JournalEntry | null           // entry for today
useJournalHistory(limit: number): JournalEntry[] // most recent N entries
useJournalByDateRange(start: string, end: string): JournalEntry[]

// Mutations
useUpsertJournal(): (data: UpsertJournalInput) => Promise<JournalEntry>
  // Creates or updates entry for today (upsert on user_id + entry_date)
```

Query key: `['journal', 'today']`, `['journal', 'history']`

---

## useReviews

```typescript
// Queries
usePendingReviews(): PendingReview[]             // computed: which reviews are due
useReviewHistory(type?: ReviewType): Review[]

// Mutations  
useSubmitReview(): (data: SubmitReviewInput) => Promise<Review>
  // Creates review + snapshots, resets action values for new period
```

Query key: `['reviews']`, `['reviews', 'pending']`
