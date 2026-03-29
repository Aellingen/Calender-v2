# Template Library — Component & Data Spec

## Template Data Structure
```typescript
interface GoalTemplate {
  id: string;
  name: string;
  pillarCategory: string; // suggested pillar: "health", "career", etc.
  description: string;
  icon: string;
  goalBlueprint: {
    goalName: string;
    goalMode: 'checked' | 'counted';
    goalType: 'outcome' | 'process' | 'milestone';
    suggestedDurationWeeks: number;
    actions: {
      name: string;
      target?: number;
      unit?: string;
      periodType: 'weekly' | 'monthly' | 'none';
      estimatedMinutes?: number;
    }[];
    habits: {
      name: string;
      frequency: 'daily' | 'weekdays' | 'weekends' | 'custom';
      customDays?: number[];
    }[];
  };
  aiCustomizationPrompt: string; // fed to AI when customizing
  popularity: number; // usage count, for sorting
}
```

## Storage
Templates are static JSON stored in the codebase at `src/data/templates.ts`. Not in the database.
Export as `const GOAL_TEMPLATES: GoalTemplate[]`.

## Launch Templates (25 total)

### Health (5)
1. **Get Fit** — 12 weeks. Actions: gym 3x/week, meal prep weekly. Habits: daily stretching, track calories.
2. **Run a 5K** — 8 weeks. Actions: Couch-to-5K progression, buy shoes, register race. Habits: run 3x/week.
3. **Lose Weight** — 16 weeks. Actions: set calorie target, weekly weigh-in. Habits: track meals, daily walk.
4. **Improve Sleep** — 4 weeks. Actions: set sleep schedule, optimize bedroom. Habits: no screens after 9pm, wind-down routine.
5. **Build a Morning Routine** — 4 weeks. Actions: define routine steps. Habits: wake at target time, meditate, exercise.

### Career (5)
6. **Get a Promotion** — 26 weeks. Actions: identify requirements, schedule manager 1:1, complete training. Habits: daily learning, weekly networking.
7. **Switch Careers** — 20 weeks. Actions: research target roles, update resume, apply weekly. Habits: daily skill practice, networking outreach.
8. **Launch a Side Project** — 12 weeks. Actions: define MVP, build landing page, launch. Habits: daily coding/creating, weekly progress review.
9. **Build Your Network** — 12 weeks. Actions: join 2 communities, attend 4 events. Habits: weekly outreach, daily LinkedIn engagement.
10. **Become a Better Leader** — 16 weeks. Actions: read leadership book, get 360 feedback. Habits: daily journaling, weekly team check-ins.

### Knowledge (5)
11. **Learn a Language** — 26 weeks. Actions: choose course, complete levels, take assessment. Habits: daily study (Duolingo/Anki), weekly conversation practice.
12. **Read 24 Books** — 52 weeks. Actions: build reading list, complete each book. Habits: read 30 min daily.
13. **Complete an Online Course** — 8 weeks. Actions: enroll, complete modules, final project. Habits: daily study sessions.
14. **Start Writing** — 12 weeks. Actions: choose platform, publish first piece, build to weekly. Habits: daily writing practice.
15. **Learn to Code** — 16 weeks. Actions: pick language, complete course, build project. Habits: daily coding practice.

### Finance (4)
16. **Build Emergency Fund** — 26 weeks. Actions: calculate target, set up auto-transfer. Habits: weekly spending review, no-spend days.
17. **Pay Off Debt** — 52 weeks. Actions: list debts, snowball plan, negotiate rates. Habits: daily spending log.
18. **Start Investing** — 8 weeks. Actions: open brokerage, research strategy, first investment. Habits: weekly market reading.
19. **Track Spending** — 4 weeks. Actions: choose tool, categorize expenses, set budget. Habits: log every purchase daily.

### Relationships (3)
20. **Strengthen Friendships** — ongoing. Actions: plan 4 hangouts, reconnect with 3 old friends. Habits: weekly reach-out.
21. **Be a Better Partner** — ongoing. Actions: plan monthly dates, discuss goals together. Habits: daily check-in, weekly quality time.
22. **Expand Social Circle** — 12 weeks. Actions: join 2 groups, attend 8 events. Habits: weekly new conversation.

### Creative (3)
23. **Start a Blog** — 8 weeks. Actions: set up site, write 8 posts, promote. Habits: daily writing, weekly publishing.
24. **Learn an Instrument** — 26 weeks. Actions: get instrument, find teacher, learn 10 songs. Habits: daily practice 30 min.
25. **Build a Portfolio** — 8 weeks. Actions: select 6 projects, write case studies, design site. Habits: daily creative work.

## Template Browser Component

### Trigger
- "Use a template" button in Goals View empty state
- "Browse templates" option in CreateGoalModal
- Cmd+T keyboard shortcut
- AI can suggest templates: "Try the 'Track Spending' template"

### Layout
```
┌──────────────────────────────────────┐
│ Goal Templates                  [X]  │
├──────────────────────────────────────┤
│ [Search...]                          │
│                                      │
│ [All] [Health] [Career] [Knowledge]  │
│ [Finance] [Relationships] [Creative] │
│                                      │
│ ┌────────────┐ ┌────────────┐       │
│ │ 🏃 Run a 5K │ │ 💪 Get Fit  │       │
│ │ 8 weeks    │ │ 12 weeks   │       │
│ │ 3 actions  │ │ 2 actions  │       │
│ │ 1 habit    │ │ 2 habits   │       │
│ └────────────┘ └────────────┘       │
│ ┌────────────┐ ┌────────────┐       │
│ │ 📚 Read 24 │ │ 🗣️ Learn a  │       │
│ │ Books      │ │ Language   │       │
│ │ ...        │ │ ...        │       │
│ └────────────┘ └────────────┘       │
└──────────────────────────────────────┘
```

### Template Card
- Icon + name
- Duration (X weeks)
- Action count + habit count
- Pillar color accent
- Click → opens template preview

### Template Preview
- Full name, description
- List of included actions and habits
- "Use this template" button → two paths:
  - **With AI (Pro)**: opens AI Chat with template context, AI asks customization questions
  - **Without AI (Free)**: opens CreateGoalModal pre-filled with template blueprint

## Non-AI Template Flow
For free users or users who prefer not to use AI:
1. Select template → preview
2. Click "Use without AI"
3. CreateGoalModal opens with:
   - Goal name pre-filled from template
   - Pillar pre-selected based on template category
   - After goal creation: actions and habits auto-created from blueprint
4. User can rename/edit after creation
