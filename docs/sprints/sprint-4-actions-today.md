# Sprint 4: Actions + Today View

## Context Files to Read First
- `context/components/today-view.md`
- `context/hooks/all-hooks.md` (useActions section)
- `context/api/routes.md` (actions section)

## Goal
Today View renders scheduled actions. Action CRUD with new fields.

## Tasks
1. **useActions hook**: TypeScript. useTodayActions() query (scheduled_date = today). Mutations.
2. **Action API routes**: Port + new fields (scheduled_date, scheduled_time, estimated_minutes, priority).
3. **ActionCard**: Row layout for Today View. Time, name, goal label, pillar dot, duration badge, completion toggle.
4. **TodayView**: Placeholder for habit strip (Sprint 5). Action list. QuickAddBar. Journal placeholder.
5. **QuickAddBar**: Simple "Add action" button → opens CreateActionModal with today pre-filled. (NLP in Phase 2.)
6. **CreateActionModal**: Port + scheduled date/time, estimated minutes, priority.
7. **Calendar sidebar**: Port CalendarPanel. Dots on dates with actions. Click date → filter.

## Acceptance Criteria
- [ ] Can create actions with scheduled date/time
- [ ] Today View shows today's actions sorted by time then priority
- [ ] Can complete actions (checkbox)
- [ ] Calendar sidebar shows action density dots
- [ ] Quick add opens creation modal with today pre-filled
