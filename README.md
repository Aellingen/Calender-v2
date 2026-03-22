# Momentum — Master Plan

## What is this repo?

This is the **knowledge base and implementation scaffold** for Momentum, an AI-native goal tracking app. Every file here is designed to be consumed by Claude Code or Claude Projects to accelerate development.

## How to use this

### For Claude Code (building features)
Point Claude Code at the relevant context files before asking it to build anything:

```bash
# Example: building the habit system
claude "Read context/schema/habits.md and context/components/habit-strip.md and context/hooks/use-habits.md, then implement the habit system"
```

### For Claude Projects (planning, decisions, debugging)
Upload the `/docs` folder as project knowledge. Use for architectural discussions, debugging complex integration issues, and sprint planning.

---

## Directory Map

```
momentum-master/
├── README.md                    ← You are here
├── CLAUDE.md                    ← Claude Code project instructions
├── docs/                        ← Human-readable strategy & plans
│   ├── product/
│   │   ├── positioning.md       ← One-liner, target user, anti-targets
│   │   ├── competitive-landscape.md
│   │   ├── features.md          ← All features with specs
│   │   └── freemium.md          ← Pricing tiers and gate strategy
│   ├── architecture/
│   │   ├── data-model.md        ← Full entity relationships
│   │   ├── hierarchy.md         ← Pillar → Goal → Action/Habit
│   │   ├── ux-views.md          ← All views, overlays, modals
│   │   └── tech-stack.md        ← Vite, Supabase, Tauri plan
│   ├── sprints/
│   │   ├── sprint-1-foundation.md
│   │   ├── sprint-2-pillars.md
│   │   ├── sprint-3-goals.md
│   │   ├── sprint-4-actions-today.md
│   │   ├── sprint-5-habits.md
│   │   ├── sprint-6-lifemap.md
│   │   ├── sprint-7-journal-reviews.md
│   │   └── sprint-8-polish.md
│   └── decisions/
│       └── technical-decisions.md
├── context/                     ← Machine-readable build specs for Claude Code
│   ├── schema/
│   │   ├── full-schema.sql      ← Complete Supabase migration
│   │   ├── pillars.md
│   │   ├── goals.md
│   │   ├── actions.md
│   │   ├── habits.md
│   │   ├── journal.md
│   │   └── user-settings.md
│   ├── components/
│   │   ├── app-shell.md
│   │   ├── goal-card.md
│   │   ├── habit-strip.md
│   │   ├── habit-circle.md
│   │   ├── life-map-overlay.md
│   │   ├── pillar-card.md
│   │   ├── journal-prompt.md
│   │   ├── today-view.md
│   │   ├── goals-view.md
│   │   ├── onboarding.md
│   │   ├── review-panel.md
│   │   └── quick-add-bar.md
│   ├── hooks/
│   │   ├── use-pillars.md
│   │   ├── use-goals.md
│   │   ├── use-actions.md
│   │   ├── use-habits.md
│   │   ├── use-journal.md
│   │   └── use-reviews.md
│   ├── api/
│   │   └── routes.md            ← All API endpoints spec
│   ├── views/
│   │   └── routing.md           ← Route structure and guards
│   └── styles/
│       └── design-system.md     ← CSS variables, fonts, Tailwind config
├── templates/                   ← Goal template blueprints (JSON)
│   └── template-schema.md
├── scripts/
│   └── tooling.md               ← Recommended dev tools and automations
└── .claude/
    └── settings.json            ← Claude Code project config (future)
```

## Sprint Execution Protocol

For each sprint:
1. Read the sprint doc in `docs/sprints/sprint-N-*.md`
2. Read all referenced context files listed at the top of each sprint doc
3. Build in the order specified
4. Test against the acceptance criteria listed at the bottom of each sprint doc
5. Commit with conventional commits: `feat(pillars): implement onboarding flow`
