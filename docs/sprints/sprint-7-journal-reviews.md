# Sprint 7: Micro-Journal + Reviews

## Context Files to Read First
- `context/components/app-shell.md` (JournalPrompt section)
- `context/hooks/all-hooks.md` (useJournal, useReviews sections)
- `context/api/routes.md` (journal, reviews sections)
- `docs/product/features.md` (Micro-Journal section)

## Goal
Journal prompt works. Weekly reviews include pillar breakdown.

## Tasks
1. **useJournal hook**: useTodayJournal, useJournalHistory, useUpsertJournal.
2. **Journal API**: GET today, GET history, POST (upsert).
3. **JournalPrompt**: Modal. Textarea + mood selector (5 icons) + pillar tag chips. Submit.
4. **Journal trigger**: "Reflect" button visible after 8 PM in TodayView. Opens JournalPrompt.
5. **JournalHistory**: Scrollable list. Date, mood icon, content preview, pillar tags.
6. **Review extension**: Port ReviewPanel/ReviewForm/ReviewHub. Add pillar_breakdown (computed).
7. **User settings**: Settings page. journal_ai_access toggle (non-functional Phase 1). Prompt time picker.

## Acceptance Criteria
- [ ] "Reflect" button appears after 8 PM
- [ ] Can submit journal entry with mood and pillar tags
- [ ] Editing existing entry works (upsert)
- [ ] Journal history viewable
- [ ] Weekly review shows per-pillar stats
- [ ] Settings page exists with toggles
