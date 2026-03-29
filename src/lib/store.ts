import { create } from 'zustand';

interface UIState {
  // Life Map overlay
  isLifeMapOpen: boolean;
  openLifeMap: () => void;
  closeLifeMap: () => void;
  toggleLifeMap: () => void;

  // Journal prompt modal
  isJournalPromptOpen: boolean;
  openJournalPrompt: () => void;
  closeJournalPrompt: () => void;

  // Create modals
  isCreateGoalOpen: boolean;
  openCreateGoal: () => void;
  closeCreateGoal: () => void;

  isCreateActionOpen: boolean;
  openCreateAction: () => void;
  closeCreateAction: () => void;

  isCreateHabitOpen: boolean;
  openCreateHabit: () => void;
  closeCreateHabit: () => void;

  // Template browser
  isTemplateBrowserOpen: boolean;
  openTemplateBrowser: () => void;
  closeTemplateBrowser: () => void;

  // AI Chat panel
  isAIChatOpen: boolean;
  openAIChat: () => void;
  closeAIChat: () => void;
  toggleAIChat: () => void;
  aiChatContext: { type?: string; id?: string; initialMessage?: string } | null;
  openAIChatWithContext: (context: { type?: string; id?: string; initialMessage?: string }) => void;
}

export const useUIStore = create<UIState>((set) => ({
  isLifeMapOpen: false,
  openLifeMap: () => set({ isLifeMapOpen: true }),
  closeLifeMap: () => set({ isLifeMapOpen: false }),
  toggleLifeMap: () => set((s) => ({ isLifeMapOpen: !s.isLifeMapOpen })),

  isJournalPromptOpen: false,
  openJournalPrompt: () => set({ isJournalPromptOpen: true }),
  closeJournalPrompt: () => set({ isJournalPromptOpen: false }),

  isCreateGoalOpen: false,
  openCreateGoal: () => set({ isCreateGoalOpen: true }),
  closeCreateGoal: () => set({ isCreateGoalOpen: false }),

  isCreateActionOpen: false,
  openCreateAction: () => set({ isCreateActionOpen: true }),
  closeCreateAction: () => set({ isCreateActionOpen: false }),

  isCreateHabitOpen: false,
  openCreateHabit: () => set({ isCreateHabitOpen: true }),
  closeCreateHabit: () => set({ isCreateHabitOpen: false }),

  isTemplateBrowserOpen: false,
  openTemplateBrowser: () => set({ isTemplateBrowserOpen: true }),
  closeTemplateBrowser: () => set({ isTemplateBrowserOpen: false }),

  isAIChatOpen: false,
  openAIChat: () => set({ isAIChatOpen: true }),
  closeAIChat: () => set({ isAIChatOpen: false, aiChatContext: null }),
  toggleAIChat: () => set((s) => ({ isAIChatOpen: !s.isAIChatOpen })),
  aiChatContext: null,
  openAIChatWithContext: (context) => set({ isAIChatOpen: true, aiChatContext: context }),
}));
