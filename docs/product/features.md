# Features Specification

## Life Pillars
Identity-level categorization layer. Represents who the user wants to become.
- 6 defaults: Health, Career, Knowledge, Relationships, Finance, Creative
- User selects 3–6 during onboarding, can add/rename/archive later
- Min 1, max 8
- Every goal MUST belong to a pillar. Every habit MUST belong to a pillar.
- Pillars appear as colored accents on goal cards, habit circles, action rows, and review breakdowns
- Life Map overlay shows all pillars with nested goals/habits
- Life Map is a slide-over panel (Cmd+L), NOT a tab/route

## Habits
Recurring behaviors tracked by consistency (streaks), not numeric targets.
- Separate entity from Actions (different table, different UI)
- Frequency: daily, weekdays, weekends, custom days
- Check-in: single tap on habit circle in Today View strip
- Streak mechanics: increments on scheduled-day completion, resets on miss, 4AM grace period
- Longest streak tracked separately (never resets)
- Milestones at 7, 30, 100 days
- Must belong to a pillar. Optionally linked to a goal.
- Standalone habits (pillar-only) are valid

## Today View (Primary Home)
Answers: "What should I do right now?"
- Section 1: Habit Strip — horizontal row of habit circles at top
- Section 2: Today's Actions — chronological list sorted by time then priority
- Section 3: Quick-add bar at bottom
- End-of-day: journal prompt after 8 PM

## Goals View (Secondary)
Goal card grid with pillar color accents, filter bar (by pillar/status), drag-and-drop reordering.

## Life Map Overlay
Slide-over panel showing all pillars as cards with nested goals and habits. Pillar reordering, edit mode, per-pillar stats.

## Micro-Journal
30-second end-of-day reflection.
- Textarea + optional mood (1–5) + optional pillar tags
- Triggered by notification (native) or button (web) after 8 PM
- AI-visible by default, global opt-out in settings
- AI never quotes entries verbatim; paraphrases indirectly

## Reviews
- Weekly: per-pillar action completion %, habit streak summary, action review cards
- Monthly (Phase 3): patterns, pillar balance analysis, AI-generated recommendations
- Sealed snapshots preserve historical data

## Templates (Phase 2)
20–30 pre-built goal blueprints. AI customizes after selection.

## AI Assistant (Phase 2)
- Conversational goal decomposition
- Template customization
- Daily coaching (morning prompt, contextual nudges)
- Review analysis with journal integration
- Natural language task/habit creation
