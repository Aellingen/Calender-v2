# JournalPrompt — Component Spec

## Trigger
- "Reflect" button in TodayView footer (visible after 8 PM)
- Cmd+R keyboard shortcut

## Flow (target: <30 seconds)
1. Modal opens with textarea. Placeholder: "Anything worth remembering about today?"
2. Below textarea: mood selector — 5 icons in a row (😫 😕 😐 🙂 😊 or abstract faces). Tap one.
3. Below mood: pillar tag chips. Small colored pills for each active pillar. Tap 0–3 to associate.
4. Submit button. One tap. Entry saved. Modal closes.
5. If entry already exists for today: loads existing content for editing.

## Data
```typescript
interface JournalEntry {
  id: string;
  user_id: string;
  entry_date: string; // YYYY-MM-DD
  content: string | null;
  mood: 1 | 2 | 3 | 4 | 5 | null;
  pillar_ids: string[];
  created_at: string;
}
```

## Mutation
`useCreateOrUpdateJournal()` — upserts on (user_id, entry_date)

---

# OnboardingView — Component Spec

## Route
`/onboarding` — shown when `user_settings.has_completed_onboarding === false`

## Steps
### Step 1: Pillar Selection
- "What areas of your life matter most?"
- 6 default pillar cards in a grid (Health, Career, Knowledge, Relationships, Finance, Creative)
- Each card: icon, name, color swatch
- Tap to select/deselect. Require 3–6 selections.
- Visual: selected cards get a thick border and check overlay

### Step 2: Customize (optional)
- For each selected pillar: editable name field, one-line description placeholder
- "In one sentence, what does success look like here?"
- Skip button available

### Step 3: Confirmation
- "You're set. Let's build your first goal."
- Creates pillars in Supabase
- Sets `has_completed_onboarding = true`
- Redirects to `/today`

---

# AppShell — Component Spec

## Always visible wrapper for authenticated routes

## Layout
```
┌─────────────────────────────────────────────────┐
│ Header                                           │
│ [Logo] [Today] [Goals]    [LifeMap] [Review] [☰] │
├─────────────────────────┬───────────────────────┤
│ Main Content            │ Calendar Sidebar       │
│ (TodayView or          │ (ported from existing) │
│  GoalsView)            │                        │
│                        │                        │
└─────────────────────────┴───────────────────────┘
```

## Header
- Left: logo mark (existing star icon) + app name
- Center: tab navigation (Today / Goals) — active tab has accent underline
- Right: Life Map button, Review button, date display, UserMenu dropdown

## Calendar Sidebar
- 280px width, right side
- Ported from existing CalendarPanel
- Shows dots on dates with scheduled actions
- Click date → filters Today View to that date
- Collapsible on tablet, hidden on mobile
