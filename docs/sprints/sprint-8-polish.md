# Sprint 8: Polish & Integration

## Context Files to Read First
- All previous sprint docs
- `docs/architecture/ux-views.md` (keyboard shortcuts section)

## Goal
Everything works together. Edge cases handled. Ready for Phase 2.

## Tasks
1. **Keyboard shortcuts**: Cmd+K (goal), Cmd+Shift+K (action), Cmd+H (habit), Cmd+L (Life Map), Cmd+R (journal), Escape (close).
2. **Empty states**: All views. TodayView, GoalsView, Life Map, per-pillar.
3. **Loading states**: Skeleton loaders everywhere. Port existing shimmer animation.
4. **Error handling**: Toast notifications for all mutations. Port Toast component.
5. **Responsive**: 768px breakpoint tests. Life Map full-screen on mobile. Habit strip scrollable.
6. **Streak edge cases**: 3 AM completion, missed day, custom-day habits, retire/reactivate.
7. **Data integrity**: Delete pillar blocked. Archive pillar hides data. Delete goal unlinks habits.
8. **Onboarding re-entry**: 0 pillars → redirect to onboarding.
9. **Performance**: React Query stale time tuning. No N+1 on habit completions. Memo expensive computations.

## Acceptance Criteria
- [ ] All keyboard shortcuts work
- [ ] No broken empty states
- [ ] All mutations show success/error toasts
- [ ] Works at 768px width
- [ ] Streak edge cases pass
- [ ] Cannot delete pillar with active goals
- [ ] Phase 1 feature complete
