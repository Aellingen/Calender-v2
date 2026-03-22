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
}));
