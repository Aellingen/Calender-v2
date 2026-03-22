# UX Views Architecture

## View Hierarchy

```
AppShell (always visible: header + calendar sidebar)
├── /today — TodayView (primary home)
│   ├── HabitStrip (top, fixed)
│   ├── ActionList (scrollable)
│   ├── QuickAddBar (bottom, fixed)
│   └── JournalPrompt (modal, triggered after 8 PM)
├── /goals — GoalsView (secondary)
│   ├── FilterBar (pillar + status filters)
│   └── GoalCardGrid (drag-and-drop sortable)
├── /login — LoginView (no AppShell)
└── /onboarding — OnboardingView (no AppShell)

Overlays (not routes, summon over current view):
├── LifeMapOverlay — Cmd+L or header button. Right slide-over, 60-70% width.
├── ReviewPanel — existing pattern. Right slide-over.
├── GoalDetailModal — click goal card
├── CreateGoalModal — Cmd+K
├── CreateActionModal — Cmd+Shift+K
├── CreateHabitModal — Cmd+H
├── ActionEditModal
└── HabitDetailPopover — long-press/hover on HabitCircle
```

## Navigation
- Header has two tabs: "Today" and "Goals"
- Header also has: Life Map button (globe/compass icon), Review button, User menu
- Calendar sidebar is always visible on right (desktop), hidden on mobile
- All overlays close with Escape or backdrop click

## Keyboard Shortcuts
- Cmd+K: create goal
- Cmd+Shift+K: create action
- Cmd+H: create habit
- Cmd+L: toggle Life Map overlay
- Cmd+R: open journal prompt (Phase 1; becomes AI chat in Phase 2 at Cmd+J)
- Escape: close topmost overlay/modal

## Responsive Behavior
- Desktop (>1024px): full layout with calendar sidebar
- Tablet (768–1024px): calendar sidebar collapsible
- Mobile (<768px): single column, calendar hidden, Life Map goes full-screen, habit strip scrollable
