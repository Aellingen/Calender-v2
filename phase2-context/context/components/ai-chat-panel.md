# AI Chat Panel — Component Spec

## Trigger
- Cmd+J keyboard shortcut
- Header button (sparkle/AI icon)
- QuickAddBar "Ask AI" mode toggle

## Behavior
- Slides in from right, 420px width (same slot as ReviewPanel, Life Map — only one open at a time)
- Backdrop: semi-transparent click-to-close
- Escape to close
- On mobile (<768px): full-screen

## UI Store State
```typescript
aiChatPanel: {
  isOpen: boolean;
  contextType: 'global' | 'goal' | 'template_customization';
  contextId: string | null; // goal ID or template ID
};
openAIChat: (context?: { type: string; id: string }) => void;
closeAIChat: () => void;
```

## Layout
```
┌──────────────────────────────┐
│ AI Assistant           [X]   │
│ Context: [Global ▼]         │
├──────────────────────────────┤
│                              │
│ Messages scroll area         │
│                              │
│ ┌──────────────────────────┐ │
│ │ User: I want to learn    │ │
│ │ Spanish before my trip   │ │
│ └──────────────────────────┘ │
│                              │
│ ┌──────────────────────────┐ │
│ │ AI: Here's what I'd      │ │
│ │ suggest:                  │ │
│ │                           │ │
│ │ ┌─ Approval Card ──────┐ │ │
│ │ │ Goal: Reach Spanish   │ │ │
│ │ │ B2 by September       │ │ │
│ │ │ Pillar: Knowledge     │ │ │
│ │ │ Deadline: Sep 1, 2026 │ │ │
│ │ │ [Edit] [Approve]      │ │ │
│ │ └──────────────────────┘ │ │
│ │                           │ │
│ │ ┌─ Action Card ────────┐ │ │
│ │ │ ✦ Pimsleur 5x/week   │ │ │
│ │ │ ✦ Anki vocab daily    │ │ │
│ │ │ ✦ italki 1x/week      │ │ │
│ │ │ [Edit All] [Approve]  │ │ │
│ │ └──────────────────────┘ │ │
│ └──────────────────────────┘ │
│                              │
├──────────────────────────────┤
│ [Type a message...]   [Send] │
└──────────────────────────────┘
```

## Message Types
```typescript
type ChatMessage =
  | { role: 'user'; content: string }
  | { role: 'assistant'; content: string; proposals?: GoalProposal[] }

interface GoalProposal {
  goal: {
    name: string;
    pillarId: string;
    deadline?: string;
    goalType: 'outcome' | 'process' | 'milestone';
    description?: string;
  };
  actions: {
    name: string;
    target?: number;
    unit?: string;
    periodType?: string;
    scheduledDate?: string;
    estimatedMinutes?: number;
  }[];
  habits: {
    name: string;
    frequency: 'daily' | 'weekdays' | 'weekends' | 'custom';
    customDays?: number[];
  }[];
  status: 'pending' | 'approved' | 'edited' | 'rejected';
}
```

## Approval Flow
1. AI proposes structured goal + actions + habits as approval cards
2. User can:
   - **Approve**: creates all entities in one batch
   - **Edit**: inline edit fields on the card, then approve
   - **Reject**: removes the proposal, AI asks what to change
3. After approval: toast "Goal created with X actions and Y habits"
4. Proposal cards are non-editable after approval (shown grayed with checkmark)

## Context Modes
- **Global**: general coaching, new goal creation from scratch
- **Goal**: opened from a specific goal's detail modal. AI has context about that goal's progress, actions, habits.
- **Template customization**: opened after user selects a template. AI asks customization questions.
