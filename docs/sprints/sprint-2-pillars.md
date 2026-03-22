# Sprint 2: Life Pillars + Onboarding

## Context Files to Read First
- `context/components/app-shell.md` (onboarding section)
- `context/hooks/all-hooks.md` (usePillars section)
- `context/api/routes.md` (pillars section)
- `docs/product/features.md` (Life Pillars section)

## Goal
New users go through pillar selection. Pillars stored and retrievable.

## Tasks
1. **usePillars hook**: CRUD via React Query. List active sorted, create, update, reorder, archive.
2. **Pillar API routes**: GET, POST /api/pillars. PATCH, DELETE /api/pillars/:id. Zod validation.
3. **OnboardingView**: Step 1: pillar card grid (6 defaults). Select 3–6. Step 2: optional rename/description. Step 3: confirm + redirect.
4. **PillarSelector**: Reusable grid component. Used in onboarding and goal creation.
5. **PillarBadge**: Small colored tag. Props: name, color. Used on goal cards.
6. **Default pillar data**: Constants file with 6 defaults (name, color, icon).

## Acceptance Criteria
- [ ] New user sees onboarding flow
- [ ] Can select 3–6 pillars
- [ ] Pillars created in database on confirmation
- [ ] Redirect to /today after onboarding
- [ ] Existing users (has_completed_onboarding=true) skip onboarding
