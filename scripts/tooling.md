# Tooling & Workflow — How to 10x Development Speed

## When to Use What

### Claude Code (primary build tool)
Use for **every sprint execution task**. Claude Code is the builder.

**How to use it per sprint:**
```bash
# Start each sprint by feeding context
claude "Read these files then implement Sprint 2:
- docs/sprints/sprint-2-pillars.md
- context/hooks/all-hooks.md
- context/api/routes.md
- context/components/app-shell.md
- context/schema/full-schema.sql
- CLAUDE.md"
```

**Best for:**
- Implementing entire components from context specs
- Writing hooks, API routes, Zod schemas
- Porting components from old codebase (feed it the old file + new spec)
- Database migrations
- Bug fixes with full repo context
- Refactoring (e.g., converting inline styles to Tailwind)

**Tips:**
- Always feed CLAUDE.md first — it contains all conventions
- Feed the sprint doc + all referenced context files in one prompt
- Ask it to build bottom-up: types → schema → hook → API → component → view
- For porting: give it the old component file AND the new spec file simultaneously
- After each sprint: ask Claude Code to run `npx tsc --noEmit` and fix all type errors

### Claude Projects (planning, decisions, debugging)
Use for **thinking, not building**. Projects is the architect.

**Setup:** Create a project called "Momentum" and upload the entire `/docs` folder as project knowledge.

**Best for:**
- Sprint planning and priority adjustments
- Architectural decisions ("should habits support sub-habits?")
- Debugging complex integration issues (paste error + context)
- Writing new context files for Phase 2 features
- Reviewing PRs or design choices
- Competitive analysis updates
- Freemium model tuning

**Don't use Projects for:** Writing code. That's Claude Code's job.

---

## Recommended Automations

### 1. Supabase Type Generation
Auto-generate TypeScript types from your Supabase schema. Eliminates manual type maintenance.

```bash
# Install
npm install -D supabase

# Generate types (run after any schema change)
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/lib/database.types.ts
```

Add to package.json:
```json
"scripts": {
  "types": "supabase gen types typescript --project-id $SUPABASE_PROJECT_ID > src/lib/database.types.ts"
}
```

**Impact:** Every schema change automatically produces typed queries. No manual types.ts maintenance for database entities.

### 2. Biome for Formatting + Linting
Already in your devDeps. Configure once, never think about formatting again.

```json
// biome.json
{
  "formatter": { "indentStyle": "space", "indentWidth": 2 },
  "linter": {
    "rules": {
      "recommended": true,
      "suspicious": { "noExplicitAny": "error" }
    }
  }
}
```

```json
"scripts": {
  "lint": "biome check .",
  "fix": "biome check --write ."
}
```

### 3. Git Hooks (pre-commit)
Catch errors before they land.

```bash
npm install -D husky lint-staged
npx husky init
```

`.husky/pre-commit`:
```bash
npx lint-staged
```

`package.json`:
```json
"lint-staged": {
  "*.{ts,tsx}": ["biome check --write", "bash -c 'npx tsc --noEmit'"]
}
```

### 4. Supabase Local Development
Run Supabase locally for fast iteration without hitting the cloud.

```bash
npx supabase init
npx supabase start
# Local Postgres at localhost:54322
# Local Auth at localhost:54321
```

Migrations become version-controlled SQL files in `/supabase/migrations/`.

**Impact:** No cloud round-trips during development. Migrations are repeatable. CI can run tests against local Supabase.

### 5. Seed Script
Create a script that populates a fresh database with test data for development.

```bash
# scripts/seed.ts
# Creates: 1 user, 5 pillars, 8 goals, 20 actions, 6 habits with completions, 10 journal entries
```

Ask Claude Code to generate this after Sprint 5 (when all entities exist). Run it on each fresh local Supabase instance.

---

## Development Workflow Per Sprint

```
1. Read sprint doc + context files
2. Feed them to Claude Code with CLAUDE.md
3. Claude Code builds: types → migration → hook → API → component → view
4. You review the output, test in browser
5. Fix issues by feeding errors back to Claude Code
6. Run: npx tsc --noEmit (type check)
7. Run: npx biome check . (lint)
8. Test against acceptance criteria in sprint doc
9. Commit: git commit -m "feat(sprint-N): description"
10. Update sprint doc: check off acceptance criteria
```

---

## Speed Multipliers

### Feed Claude Code the old codebase for porting
For Sprints 3–4 (goals, actions), the existing components are 70% reusable. Don't rewrite from scratch:

```bash
claude "Here is the old GoalCard component [paste file].
Here is the new spec [paste context/components/goal-card.md].
Convert to TypeScript, replace inline styles with Tailwind, add pillar integration per spec."
```

This is 3x faster than describing what you want from zero.

### Use Supabase Dashboard for quick schema validation
Before writing migrations, prototype tables in the Supabase Dashboard UI. Verify column types, constraints, and RLS policies visually. Then export as SQL.

### Batch related features in single Claude Code sessions
Claude Code retains context within a session. Don't open a new session for each file:

```
Session 1 (Sprint 2): "Build usePillars hook, then pillar API routes, then PillarSelector component, then OnboardingView. Here are all the specs..."
```

One session, four files, full context continuity. Much faster than four separate sessions.

### Use the context files as a contract
When Claude Code produces something that doesn't match the spec, paste the relevant context file and say "this doesn't match the spec." The context files are unambiguous enough that Claude Code can self-correct.

---

## Tools to Install

| Tool | Purpose | Install |
|------|---------|---------|
| Supabase CLI | Local dev, type gen, migrations | `npm i -D supabase` |
| Biome | Lint + format (replaces ESLint + Prettier) | `npm i -D @biomejs/biome` |
| Husky | Git hooks | `npm i -D husky` |
| lint-staged | Pre-commit checks | `npm i -D lint-staged` |

## Tools NOT to install
- ESLint (Biome replaces it)
- Prettier (Biome replaces it)
- Storybook (overhead for a solo dev; test in-app)
- Jest/Vitest (add in Phase 3 when app stabilizes; manual testing is faster for Phase 1)

---

## Phase 2 Acceleration (Preview)

When you reach Phase 2 (AI + Templates), these context files will need to be created:
- `context/ai/goal-decomposition.md` — structured output schema for AI proposals
- `context/ai/coaching-prompts.md` — system prompts for daily coaching
- `context/ai/template-customization.md` — how AI modifies template blueprints
- `context/components/ai-chat-panel.md` — slide-over chat UI spec
- `templates/*.json` — 20–30 template blueprint files

Use Claude Projects to draft these specs. Then feed them to Claude Code for implementation.
