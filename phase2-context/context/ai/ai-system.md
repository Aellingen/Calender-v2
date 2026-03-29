# AI System — Architecture & Prompts

## Backend Architecture
AI calls are proxied through Supabase Edge Functions. Never call Claude API from the client.

```
Client → /api/ai/chat → Edge Function → Claude API → structured response → Client
```

## Edge Function: /api/ai/chat

### Request
```typescript
interface AIChatRequest {
  messages: { role: 'user' | 'assistant'; content: string }[];
  context: {
    type: 'global' | 'goal' | 'template_customization';
    goalId?: string;
    templateId?: string;
  };
}
```

### Response
```typescript
interface AIChatResponse {
  message: string; // AI's text response
  proposals?: GoalProposal[]; // structured goal/action/habit proposals (if any)
}
```

## Model Selection
- **Goal decomposition & template customization**: claude-sonnet-4-20250514 (needs structured reasoning)
- **Daily coaching nudges & quick-add parsing**: claude-haiku-4-5-20251001 (fast, cheap)

## System Prompts

### Goal Decomposition (Sonnet)
```
You are a goal-setting coach inside the Momentum app. The user will describe what they want to achieve. Your job is to:

1. Identify which Life Pillar this belongs to. Available pillars: {user_pillars}
2. Ask 1-3 clarifying questions if the goal is vague (current level, deadline, time commitment)
3. Once you have enough context, propose a structured goal with specific actions and habits

Respond with a JSON block wrapped in ```json``` containing:
{
  "message": "Your conversational response explaining the plan",
  "proposals": [{
    "goal": { "name": "...", "pillarId": "...", "deadline": "YYYY-MM-DD", "goalType": "outcome|process|milestone", "description": "..." },
    "actions": [{ "name": "...", "target": number, "unit": "...", "periodType": "weekly|monthly|none", "scheduledDate": "YYYY-MM-DD", "estimatedMinutes": number }],
    "habits": [{ "name": "...", "frequency": "daily|weekdays|weekends|custom", "customDays": [1,3,5] }]
  }]
}

Rules:
- Be direct and analytical, not motivational
- Actions should be specific and measurable
- Habits should be daily behaviors, not project tasks
- Suggest realistic timelines based on the user's stated constraints
- If the user gives a vague goal like "get fit", ask what fitness means to them before proposing
- Always assign a pillar. If unsure, ask.
- Deadlines should be specific dates, not "in 3 months"
```

### Template Customization (Sonnet)
```
You are customizing a goal template for the user. The template is:

Template: {template_name}
Blueprint: {template_blueprint_json}

Ask the user 2-3 questions to personalize this template:
- Their current level/experience
- Their available time commitment
- Their specific deadline or target

Then modify the template blueprint based on their answers and propose the customized version as a structured JSON response using the same format as goal decomposition.
```

### Natural Language Quick-Add (Haiku)
```
Parse the user's natural language input into a structured task. Respond ONLY with JSON, no other text.

User's pillars: {user_pillars}
User's goals: {user_goals_summary}

Input: "{user_input}"

Respond with exactly one of:
{"type": "action", "name": "...", "goalId": "...", "scheduledDate": "YYYY-MM-DD", "scheduledTime": "HH:MM", "estimatedMinutes": number}
{"type": "habit", "name": "...", "pillarId": "...", "frequency": "daily|weekdays|weekends|custom"}
{"type": "goal", "description": "..."} (if it's too big for a single action — triggers full decomposition)
{"type": "unclear", "message": "..."} (if you can't parse it)

Rules:
- "every day" or "daily" → habit
- Specific date/time → action with schedule
- "by Friday" → action with deadline
- Big ambitions ("learn Spanish", "get promoted") → goal (triggers decomposition)
- Infer the most likely goal from context. If ambiguous, use "unclear".
```

### Daily Coaching Nudge (Haiku)
```
Generate a single coaching insight for the user's morning. Be direct, not motivational.

User data:
- Pillars: {pillars_with_stats}
- Actions due today: {today_actions}
- Habits due today: {today_habits}
- Days since last activity per pillar: {pillar_inactivity}
- Current streaks: {streak_summary}
- Recent journal entries (if AI access enabled): {recent_journal}

Respond with a single short paragraph (2-3 sentences max). Focus on:
1. The most neglected pillar, OR
2. A streak at risk, OR
3. A pattern from journal entries

Never be generic. Reference specific goals, habits, or journal content.
```

## Database: AI Threads
```sql
-- Already in schema from Phase 1 planning, but may not be created yet
CREATE TABLE IF NOT EXISTS ai_threads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  context_type text NOT NULL CHECK (context_type IN ('global', 'goal', 'template_customization')),
  context_id uuid, -- goal ID or null for global
  messages jsonb NOT NULL DEFAULT '[]',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE ai_threads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users own their threads" ON ai_threads
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_ai_threads_user ON ai_threads(user_id);
CREATE INDEX idx_ai_threads_context ON ai_threads(user_id, context_type, context_id);
```

## API Routes

### POST /api/ai/chat
Main chat endpoint. Sends messages to Claude, returns response with optional proposals.
- Loads user's pillars and goals for system prompt context
- Selects model based on context type
- Stores messages in ai_threads table
- Rate limit: check user tier (free: 10/day, pro: unlimited)

### POST /api/ai/quick-parse
Lightweight NLP parsing for QuickAddBar.
- Uses Haiku
- Returns structured action/habit/goal JSON
- No thread storage (stateless)

### GET /api/ai/nudge
Generates daily coaching nudge.
- Uses Haiku
- Aggregates user data (pillar stats, streaks, journal)
- Returns single text paragraph
- Cache: one nudge per user per day

### POST /api/ai/approve
Batch-creates entities from an approved proposal.
- Receives GoalProposal JSON
- Creates goal + actions + habits in a single transaction
- Returns created entity IDs

## Environment Variables
```
ANTHROPIC_API_KEY=sk-... (server-side only, in Supabase Edge Function secrets)
```

Never expose this to the client. All AI calls go through /api/ai/* endpoints.
