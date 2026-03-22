# API Routes Specification

All routes require auth (Bearer token from Supabase). All inputs validated with Zod.

## Pillars
| Method | Path | Body | Returns |
|--------|------|------|---------|
| GET | /api/pillars | — | Pillar[] (active, sorted) |
| POST | /api/pillars | { name, color, icon, description? } | Pillar |
| PATCH | /api/pillars/:id | Partial<Pillar> | Pillar |
| PATCH | /api/pillars/reorder | { ids: string[] } | void |
| DELETE | /api/pillars/:id | — | void (fails if has active goals/habits) |

## Goals
| Method | Path | Body | Returns |
|--------|------|------|---------|
| GET | /api/goals?status=active | — | Goal[] (sorted) |
| GET | /api/goals/:id | — | Goal |
| POST | /api/goals | { name, pillar_id, ...rest } | Goal |
| PATCH | /api/goals/:id | Partial<Goal> | Goal |
| PATCH | /api/goals/reorder | { ids: string[] } | void |
| DELETE | /api/goals/:id | — | void (cascades actions, unlinks habits) |

## Actions
| Method | Path | Body | Returns |
|--------|------|------|---------|
| GET | /api/actions?goal_id=X | — | Action[] |
| GET | /api/actions/today | — | Action[] (scheduled_date = today) |
| POST | /api/actions | { name, goal_id, ...rest } | Action |
| PATCH | /api/actions/:id | Partial<Action> | Action |
| POST | /api/actions/:id/complete | — | Action (status → complete) |
| DELETE | /api/actions/:id | — | void |

## Habits
| Method | Path | Body | Returns |
|--------|------|------|---------|
| GET | /api/habits | — | Habit[] (active) |
| GET | /api/habits/today | — | Habit[] (filtered by frequency) |
| POST | /api/habits | { name, pillar_id, frequency, ...rest } | Habit |
| PATCH | /api/habits/:id | Partial<Habit> | Habit |
| POST | /api/habits/:id/toggle | { date: string } | { completed: boolean, streak: number } |
| DELETE | /api/habits/:id | — | void (cascades completions) |

### Habit Toggle Logic (server-side)
```
1. Check if habit_completion exists for (habit_id, date)
2. If exists: DELETE it (un-complete)
3. If not exists: INSERT it
4. Recalculate streaks:
   a. Query completions ordered by date DESC
   b. Walk backwards from today counting consecutive SCHEDULED days with completions
   c. Grace period: completion before 4 AM counts for previous day
   d. Update habit.current_streak
   e. If current_streak > longest_streak, update longest_streak
5. Return { completed: boolean, streak: number }
```

## Habit Completions
| Method | Path | Body | Returns |
|--------|------|------|---------|
| GET | /api/habits/completions/today | — | HabitCompletion[] (all habits, today) |
| GET | /api/habits/:id/completions?days=30 | — | HabitCompletion[] |

## Journal
| Method | Path | Body | Returns |
|--------|------|------|---------|
| GET | /api/journal/today | — | JournalEntry \| null |
| GET | /api/journal?limit=30 | — | JournalEntry[] |
| POST | /api/journal | { content?, mood?, pillar_ids? } | JournalEntry (upsert on today) |

## Reviews
| Method | Path | Body | Returns |
|--------|------|------|---------|
| GET | /api/reviews?type=weekly | — | Review[] |
| GET | /api/reviews/pending | — | PendingReview[] |
| POST | /api/reviews | { review_type, period_start, period_end, note, snapshots[] } | Review |

## User Settings
| Method | Path | Body | Returns |
|--------|------|------|---------|
| GET | /api/settings | — | UserSettings |
| PATCH | /api/settings | Partial<UserSettings> | UserSettings |
