# LifeMapOverlay — Component Spec

## Trigger
- Cmd+L keyboard shortcut
- Header button (globe/compass icon)

## Behavior
- Slides in from right, covers 60–70% of screen width
- Backdrop: semi-transparent click-to-close
- Escape to close
- On mobile (<768px): goes full-screen

## UI Store State
```typescript
isLifeMapOpen: boolean;
openLifeMap: () => void;
closeLifeMap: () => void;
toggleLifeMap: () => void;
```

## Data
- `usePillars()` — all active pillars, sorted by sort_order
- `useGoals('active')` — grouped by pillar_id
- `useHabits()` — grouped by pillar_id
- Computed per-pillar stats: active goal count, habit count, weekly action completion %

## Layout
```
┌──────────────────────────────────┐
│ Life Map              [Edit] [X] │
├──────────────────────────────────┤
│ ┌──────────────────────────────┐ │
│ │ ● Health                     │ │
│ │   3 goals · 4 habits · 85%  │ │
│ │   ▸ Run 5K (67%)            │ │
│ │   ▸ Lose 10 lbs (40%)       │ │
│ │   ▸ Morning routine (12 🔥)  │ │
│ │   ▸ Drink water (28 🔥)      │ │
│ └──────────────────────────────┘ │
│ ┌──────────────────────────────┐ │
│ │ ● Career                     │ │
│ │   2 goals · 1 habit · 72%   │ │
│ │   ▸ ...                      │ │
│ └──────────────────────────────┘ │
│ ...                              │
└──────────────────────────────────┘
```

## PillarCard (inside Life Map)
- Header: color bar (8px), icon, pillar name, description
- Stats row: "X active goals · Y habits · Z% weekly"
- Expandable: click header to expand/collapse nested content
- Nested goals: small progress ring + goal name. Click → GoalDetailModal.
- Nested habits: streak badge + habit name. Click → HabitDetailPopover.
- Empty pillar: "No goals or habits yet" + "Create goal" button

## Edit Mode
- Toggle button in overlay header
- When active: pillars show rename field, color picker, icon picker, archive button
- Archive requires confirmation if pillar has active goals/habits
- Drag-and-drop to reorder pillars (saves sort_order)
