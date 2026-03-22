# Sprint 3: Goals View (Rebuilt)

## Context Files to Read First
- `context/components/goal-card.md`
- `context/hooks/all-hooks.md` (useGoals section)
- `context/api/routes.md` (goals section)

## Goal
Full goal CRUD with pillar integration. Goal cards show pillar accents.

## Tasks
1. **useGoals hook**: TypeScript. pillar_id in all queries. Mutations include pillar assignment.
2. **Goal API routes**: Port and extend. pillar_id required. Zod schemas.
3. **GoalCard**: Port from existing. Tailwind. Pillar color left border. PillarBadge. Habit count badge.
4. **GoalsView**: Card grid. Filter bar (pillar + status). "New Goal" button.
5. **CreateGoalModal**: Port + pillar picker (required), deadline, goal type.
6. **GoalDetailModal**: Port + pillar badge, deadline, habits section placeholder.
7. **ProgressRing**: Port directly as TypeScript component.
8. **MomentumDots**: Port directly.
9. **DnD reordering**: Port dnd-kit setup.

## Acceptance Criteria
- [ ] Can create goals assigned to pillars
- [ ] Goal cards show pillar color accent
- [ ] Can filter goals by pillar
- [ ] Can drag to reorder goals
- [ ] Goal detail modal shows all fields
