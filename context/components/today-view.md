# TodayView — Component Spec

## Route
`/today` — primary home, default after login

## Layout
```
┌─────────────────────────────────────┐
│ HabitStrip (fixed top)              │
│ ○ ○ ● ○ ● ○                        │
├─────────────────────────────────────┤
│ Today's Actions (scrollable)        │
│ ┌─────────────────────────────┐     │
│ │ 9:00  Finish sales deck  ◈  │     │
│ │       Career → Q2 Deal      │     │
│ ├─────────────────────────────┤     │
│ │ 14:00 Pimsleur lesson    ◈  │     │
│ │       Knowledge → Spanish   │     │
│ ├─────────────────────────────┤     │
│ │ —     Review pipeline     ◈  │     │
│ │       Career → Q2 Deal      │     │
│ └─────────────────────────────┘     │
│                                     │
│ [After 8 PM: "Reflect" button]      │
├─────────────────────────────────────┤
│ QuickAddBar (fixed bottom)          │
│ [+ Add an action for today...]      │
└─────────────────────────────────────┘
```

## Dependencies
- `useHabits()` — habits due today
- `useTodayActions()` — actions where scheduled_date = today
- `useJournal()` — today's entry (to show/hide reflect button)
- UI store: journal prompt modal state

## Action List Sort Order
1. Scheduled time (ascending, nulls last)
2. Priority (descending)
3. Completed items move to bottom with reduced opacity

## Action Row Fields
- Time (if scheduled_time set, else dash)
- Action name
- Parent goal name (small, muted text)
- Pillar color dot (from goal → pillar)
- Estimated duration badge (if set)
- Completion toggle (checkbox or swipe)

## Empty State
"No actions scheduled for today. Create one or move an action to today."
Button: "Schedule an action" → opens CreateActionModal with today pre-filled.

## Journal Trigger
- After 8 PM local time: show "Reflect" button in footer area
- If today's journal entry already exists: button text → "Edit reflection"
- Click → opens JournalPrompt modal
