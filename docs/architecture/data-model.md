# Data Model

## Entity Hierarchy

```
Life Pillar (identity layer)
├── Goal (outcome layer)
│   ├── Action (execution — scheduled, target-based)
│   └── Habit (execution — recurring, streak-based) [optional goal link]
└── Habit (execution — standalone, pillar-only)
```

## Relationship Rules
1. Every Goal belongs to exactly ONE Pillar (required FK)
2. Every Action belongs to exactly ONE Goal (required FK)
3. Every Habit belongs to exactly ONE Pillar (required FK)
4. A Habit MAY link to a Goal (optional FK)
5. Standalone habits (pillar-only, no goal) are valid
6. Journal entries belong to the user globally, with optional pillar tags (array)
7. Reviews reference all entities for snapshot data

## Habit vs Action

| Attribute | Habit | Action |
|-----------|-------|--------|
| Recurrence | Always recurring | One-off or recurring with target |
| Tracking | Binary: done/not done. Streak. | Numeric progress toward target |
| Check-in | Single tap in habit strip | Slider, input, or checkbox |
| Parent required | Pillar (required). Goal (optional) | Goal (required) |
| End condition | Indefinite. User retires manually | Reaches target or deadline |
| Example | "Meditate 10 min" (daily) | "Read 12 books" (target: 12, yearly) |

## Key Constraints
- Pillar cannot be deleted if it has active goals or habits (must archive)
- Archiving a pillar hides it but retains all data
- Deleting a goal unlinks its habits (habits keep pillar, lose goal_id)
- habit_completions has UNIQUE(habit_id, completed_date) — one completion per day
- journal_entries has UNIQUE(user_id, entry_date) — one entry per day
