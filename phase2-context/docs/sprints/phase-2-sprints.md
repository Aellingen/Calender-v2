# Phase 2 Sprint A: AI Backend + Chat Panel

## Context Files to Read First
- `context/ai/ai-system.md`
- `context/components/ai-chat-panel.md`
- `context/hooks/all-hooks.md`
- `context/styles/design-system.md`

## Goal
AI chat works end-to-end: user types, Claude responds, structured proposals render as approval cards, approving creates entities.

## Tasks
1. **ai_threads table**: Run migration to create ai_threads table (see ai-system.md for schema).
2. **Edge Function /api/ai/chat**: Accepts messages + context. Loads user pillars/goals for system prompt. Calls Claude Sonnet. Parses structured JSON from response. Stores thread. Returns message + proposals.
3. **Edge Function /api/ai/approve**: Receives GoalProposal JSON. Batch-creates goal + actions + habits in single transaction. Returns created IDs.
4. **useAIChat hook**: manages thread state, sends messages, receives responses, handles proposal approval.
5. **AI Chat Panel component**: slide-over (right, 420px). Message list with scroll. User input at bottom. Renders assistant text + GoalProposal approval cards.
6. **GoalProposalCard component**: displays proposed goal name, pillar, deadline, list of actions and habits. Edit button (inline field editing). Approve button (calls /api/ai/approve). Reject button (sends "I don't want this" to chat).
7. **Wire into header**: AI button (sparkle icon) next to Life Map button. Cmd+J shortcut.
8. **UI store**: add aiChatPanel state (isOpen, contextType, contextId).
9. **Goal context mode**: in GoalDetailModal, add "Ask AI about this goal" button that opens AI chat with goal context pre-loaded.

## Environment Variables
- Add ANTHROPIC_API_KEY to Supabase Edge Function secrets (NOT in .env, NOT client-side)

## Acceptance Criteria
- [ ] Cmd+J opens AI chat panel
- [ ] Can type "I want to learn Spanish before September" and get a structured proposal
- [ ] Proposal shows goal + actions + habits as editable cards
- [ ] Approving creates all entities in database
- [ ] Thread history persists (close and reopen, messages still there)
- [ ] Can open AI chat from a goal detail modal with goal context


# Phase 2 Sprint B: Natural Language Quick-Add + Coaching

## Context Files to Read First
- `context/ai/ai-system.md`
- `context/components/today-view.md`

## Goal
QuickAddBar parses natural language. Daily coaching nudge appears in Today View.

## Tasks
1. **Edge Function /api/ai/quick-parse**: Accepts input string + user context (pillars, goals). Calls Claude Haiku. Returns structured JSON (action, habit, goal, or unclear).
2. **Upgrade QuickAddBar**: Replace simple "Add action" button with text input. On submit: call /api/ai/quick-parse. If action → create action directly (toast confirmation). If habit → create habit directly. If goal → open AI chat with the input as first message. If unclear → show AI's clarification message in a tooltip/popover.
3. **Edge Function /api/ai/nudge**: Aggregates user data (pillar stats, today's actions/habits, streaks, recent journal if AI access enabled). Calls Haiku. Returns coaching text.
4. **useAINudge hook**: fetches nudge once per day, caches in React Query with 24hr stale time.
5. **Nudge card in Today View**: Collapsible card between habit strip and action list. Shows AI coaching text. "Dismiss" button hides for the day. Pillar color accent if nudge references a specific pillar.
6. **Loading states**: QuickAddBar shows spinner while parsing. Nudge shows skeleton while loading.

## Acceptance Criteria
- [ ] Type "Meditate every morning" in QuickAddBar → creates daily habit
- [ ] Type "Finish report by Friday" → creates action with Friday deadline
- [ ] Type "I want to get promoted" → opens AI chat for decomposition
- [ ] Daily nudge appears in Today View referencing real user data
- [ ] Nudge only loads once per day (cached)


# Phase 2 Sprint C: Template Library

## Context Files to Read First
- `context/ai/templates.md`
- `context/ai/ai-system.md`
- `context/components/ai-chat-panel.md`

## Goal
Template browser works. Users can create goals from templates with or without AI customization.

## Tasks
1. **Template data file**: Create `src/data/templates.ts` with all 25 templates as typed constants.
2. **TemplateBrowser component**: Modal/overlay. Search bar. Pillar category filter tabs. Grid of TemplateCards.
3. **TemplateCard component**: Icon, name, duration, action/habit count, pillar color accent.
4. **TemplatePreview component**: Expanded view of template. Full description, action list, habit list. Two buttons: "Use with AI" (opens AI chat) and "Use as-is" (creates directly).
5. **AI template customization**: When "Use with AI" clicked, open AI chat with context_type='template_customization' and template blueprint in system prompt. AI asks 2-3 questions, then proposes customized version.
6. **Non-AI template flow**: "Use as-is" creates goal from blueprint directly. Opens CreateGoalModal pre-filled with template data. After goal creation, auto-creates actions and habits from blueprint.
7. **Template triggers**: Add "Browse templates" button to: Goals View empty state, CreateGoalModal, AI chat (AI can suggest templates). Cmd+T shortcut.
8. **Template origin badge**: Goals created from templates show small "From template" badge in GoalCard (subtle, informational).

## Acceptance Criteria
- [ ] Cmd+T opens template browser
- [ ] Can filter templates by pillar category
- [ ] Search works across template names
- [ ] "Use with AI" opens AI chat, AI asks customization questions, proposal is personalized
- [ ] "Use as-is" creates goal + actions + habits from blueprint directly
- [ ] Template browser accessible from empty states and CreateGoalModal


# Phase 2 Sprint D: AI Review Analysis + Polish

## Context Files to Read First
- `context/ai/ai-system.md`
- `docs/product/features.md` (Reviews section, AI section)

## Goal
Reviews include AI-generated summaries. All Phase 2 features polished and integrated.

## Tasks
1. **Edge Function /api/ai/review-summary**: Accepts review period data (per-pillar stats, habit streaks, action completion, journal entries if AI access enabled). Calls Sonnet. Returns analytical summary text.
2. **Review AI integration**: During weekly review flow, after user seals values, call /api/ai/review-summary. Display AI summary in review results. Store in reviews.ai_summary field.
3. **AI references journal entries**: If journal_ai_access is enabled, include recent journal entries (paraphrased, not quoted) in review summary context. AI identifies patterns: "You mentioned feeling overwhelmed on days with 6+ actions."
4. **Pillar balance in reviews**: AI summary includes per-pillar analysis. "Health was your strongest pillar this week (95% completion). Knowledge stalled — consider rescheduling Thursday study sessions."
5. **Rate limiting**: Implement free tier limit (10 AI interactions/day). Count each /api/ai/chat, /api/ai/quick-parse call. /api/ai/nudge doesn't count (it's passive). Show remaining count in AI chat panel header. When limit hit: show upgrade prompt, disable AI input, QuickAddBar falls back to simple mode.
6. **Error handling**: AI API timeouts (show "AI is thinking..." then retry). API errors (show "AI unavailable, try again"). Network errors (graceful fallback).
7. **AI chat keyboard shortcuts**: Enter to send. Shift+Enter for newline. Escape to close panel.
8. **Integration test**: Full flow: user opens app → nudge appears → types in QuickAddBar → creates habit → opens template → customizes with AI → approves → reviews week → AI summary generated.

## Acceptance Criteria
- [ ] Weekly review includes AI-generated summary
- [ ] AI summary references journal entries when enabled
- [ ] AI summary includes per-pillar analysis
- [ ] Free tier shows AI usage count and limit
- [ ] Hitting limit disables AI features gracefully (app still works)
- [ ] AI errors don't crash the app
- [ ] Full user flow works end-to-end without errors
