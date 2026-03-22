# HabitStrip — Component Spec

## Location
Fixed at top of TodayView. Horizontal scrollable row.

## Data
`useHabits()` filtered to habits due today:
- `frequency === 'daily'` → always shown
- `frequency === 'weekdays'` → shown Mon–Fri
- `frequency === 'weekends'` → shown Sat–Sun
- `frequency === 'custom'` → shown if today's ISO day number is in `custom_days[]`

Also needs: `useTodayCompletions()` — all habit_completions where completed_date = today

## Rendering
- Map habits to `<HabitCircle>` components
- Sort: incomplete first, then by `sort_order`
- Completed habits move to end of strip with reduced opacity
- Scrollable horizontally if > 6–7 habits
- Use `overflow-x-auto` with hidden scrollbar (`no-scrollbar` class)

## HabitCircle Props
```typescript
interface HabitCircleProps {
  habit: Habit;
  isCompleted: boolean;
  onToggle: () => void;
  onLongPress: () => void;
}
```

## HabitCircle Rendering
- Circle: 48–52px diameter
- Fill: pillar color when completed, outline only when incomplete
- Center: icon (or first letter of name)
- Below circle: streak count (small text, font-display)
- Incomplete state: subtle pulse animation (CSS keyframe)
- Complete state: filled + check mark overlay, scale-in animation
- Click: toggle completion (optimistic update)
- Long-press/hover: show HabitDetailPopover

## Streak Display
- Show `current_streak` below each circle
- Use `--warm` color when streak ≥ 7 (momentum indicator)
- Use `--success` color when streak ≥ 30
