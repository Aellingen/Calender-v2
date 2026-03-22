# Entity Hierarchy

## The Four Levels

```
Level 1 — Identity:   Life Pillar    (Health, Career, Knowledge, ...)
Level 2 — Outcome:    Goal           ("Reach Spanish B2 by September")
Level 3 — Execution:  Action         ("Complete Pimsleur lesson" — scheduled, target-based)
Level 3 — Execution:  Habit          ("30 min Anki vocab" — daily, streak-tracked)
```

## Visibility by View

| Entity | Today View | Goals View | Life Map | Reviews |
|--------|-----------|------------|----------|---------|
| Pillar | Color dots on actions | Color border on cards, filter bar | Full cards with nesting | Per-pillar breakdown |
| Goal | Parent label on actions | Card grid | Nested under pillar | Action review cards |
| Action | Main list (sorted by time) | Preview pills on goal card | — | Slider review cards |
| Habit | Strip at top | Count badge on goal card | Nested under pillar | Streak summary |

## Design Principle
The hierarchy is **felt, not navigated**. Users never see a "Level 1 → Level 2 → Level 3" breadcrumb. Instead:
- Pillar colors permeate every view (accents, dots, fills)
- Goals are the primary interactive unit
- Actions and habits are the daily touchpoints
- Life Map is the rare "zoom out" moment
