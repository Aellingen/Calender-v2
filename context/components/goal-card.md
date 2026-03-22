# GoalCard — Component Spec

## Ported from existing codebase. Modifications noted.

## Props
```typescript
interface GoalCardProps {
  goal: Goal;
  pillar: Pillar; // NEW: needed for color accent
  actions: Action[];
  habitCount: number; // NEW: count of habits linked to this goal
  onClick: () => void;
  dragHandleListeners?: DragHandleListeners;
  dragHandleAttributes?: DragHandleAttributes;
}
```

## Layout (3 zones, 220px fixed height — keep from existing)

### Zone 1: Header
- Goal name (font-display, 16px, clamp 2 lines)
- Description (12.5px, muted, single line truncated)
- ProgressRing (52px, top right) — keep existing component
- Progress bar below (5px height)
- **NEW**: Pillar color left border (5px solid `pillar.color`)
- **NEW**: PillarBadge tag below description (small colored chip)

### Zone 2: Content (flex fill)
- Action preview pills (up to 4, then "+N" overflow)
- Complete actions get checkmark prefix and success styling
- Empty state: dashed border "Add an action" CTA
- **NEW**: If `habitCount > 0`, show small badge: "⟳ 3 habits" in muted text

### Zone 3: Footer
- MomentumDots (keep existing component)
- Momentum label ("3 of 5 active")
- Progress label ("4 / 10 done")
- Drag handle (dots icon, right side)

## Interactions
- Click → opens GoalDetailModal
- Hover → border color transitions to `var(--accent-light)`, translateY(-3px), shadow
- Drag handle → reorder in grid

## Pillar Color Application
```tsx
style={{
  borderLeft: `5px solid ${pillar.color}`,
  background: `linear-gradient(135deg, ${pillar.color}10 0%, transparent 60%), var(--card)`,
}}
```
