# Technical Decisions Log

| Decision | Rationale |
|----------|-----------|
| **TypeScript from day one** | Existing JS has no type safety. Adding TS incrementally is painful. Fresh start with strict mode catches pillar_id/goal_id reference errors at compile time. |
| **Keep CSS variables + add Tailwind utilities** | CSS variables enable runtime theming (future dark mode, pillar color overrides). Tailwind replaces inline styles for layout/spacing. Both coexist. |
| **Habits as separate table** | Habits have fundamentally different behavior: binary vs numeric, indefinite vs deadline-bound, streak-tracked. Sharing with actions requires too many nullable columns. |
| **habit_completions as separate table** | Array column causes write conflicts. Junction table with UNIQUE(habit_id, completed_date) is correct relational design and enables efficient streak queries. |
| **Server-side streak calculation** | Streaks must be consistent across devices. Client would drift. API computes on each completion, stores current/longest on habit row for fast reads. |
| **No monorepo yet** | Single web app, single developer. Flat project is faster. Convert when adding Tauri/RN. |
| **pillar_ids[] array on journal_entries** | Journal tags 0–3 pillars. Junction table is over-engineering. Array column works for small cardinality; Postgres supports array queries. |
| **No AI in Phase 1** | Phase 1 validates architecture, UX, data model. AI is additive. QuickAddBar is a button in Phase 1, NLP in Phase 2. journal_ai_access toggle exists but is non-functional. |
| **Fresh build over refactor** | Existing code: no TypeScript, inline styles everywhere, monolithic Dashboard.jsx, schema doesn't account for pillars/habits/journal. Gutting it is more work than starting clean and porting the design system + 6 reusable components. |
| **Supabase Edge Functions for AI (Phase 2)** | Keeps API keys server-side. Allows rate limiting per user. Claude Haiku for coaching, Sonnet for decomposition. |
