import { useEffect } from 'react';
import { useUIStore } from '../lib/store';

export function useKeyboardShortcuts() {
  const {
    toggleLifeMap,
    openCreateGoal,
    openCreateAction,
    openCreateHabit,
    openJournalPrompt,
    toggleAIChat,
    openTemplateBrowser,
    closeLifeMap,
    closeJournalPrompt,
    closeCreateGoal,
    closeCreateAction,
    closeCreateHabit,
    closeAIChat,
    closeTemplateBrowser,
    isLifeMapOpen,
    isJournalPromptOpen,
    isCreateGoalOpen,
    isCreateActionOpen,
    isCreateHabitOpen,
    isAIChatOpen,
    isTemplateBrowserOpen,
  } = useUIStore();

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const meta = e.metaKey || e.ctrlKey;

      // Escape: close topmost overlay
      if (e.key === 'Escape') {
        if (isTemplateBrowserOpen) { closeTemplateBrowser(); return; }
        if (isAIChatOpen) { closeAIChat(); return; }
        if (isJournalPromptOpen) { closeJournalPrompt(); return; }
        if (isCreateGoalOpen) { closeCreateGoal(); return; }
        if (isCreateActionOpen) { closeCreateAction(); return; }
        if (isCreateHabitOpen) { closeCreateHabit(); return; }
        if (isLifeMapOpen) { closeLifeMap(); return; }
        return;
      }

      // Don't trigger shortcuts when typing in inputs
      const tag = (e.target as HTMLElement).tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

      // Cmd+L: toggle Life Map
      if (meta && e.key === 'l') {
        e.preventDefault();
        toggleLifeMap();
        return;
      }

      // Cmd+K: create goal
      if (meta && !e.shiftKey && e.key === 'k') {
        e.preventDefault();
        openCreateGoal();
        return;
      }

      // Cmd+Shift+K: create action
      if (meta && e.shiftKey && e.key === 'K') {
        e.preventDefault();
        openCreateAction();
        return;
      }

      // Cmd+H: create habit
      if (meta && e.key === 'h') {
        e.preventDefault();
        openCreateHabit();
        return;
      }

      // Cmd+T: open template browser
      if (meta && e.key === 't') {
        e.preventDefault();
        openTemplateBrowser();
        return;
      }

      // Cmd+J: toggle AI chat
      if (meta && e.key === 'j') {
        e.preventDefault();
        toggleAIChat();
        return;
      }

      // Cmd+R: open journal prompt
      if (meta && e.key === 'r') {
        e.preventDefault();
        openJournalPrompt();
        return;
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    toggleLifeMap, toggleAIChat, openTemplateBrowser, openCreateGoal, openCreateAction, openCreateHabit, openJournalPrompt,
    closeLifeMap, closeAIChat, closeTemplateBrowser, closeJournalPrompt, closeCreateGoal, closeCreateAction, closeCreateHabit,
    isLifeMapOpen, isAIChatOpen, isTemplateBrowserOpen, isJournalPromptOpen, isCreateGoalOpen, isCreateActionOpen, isCreateHabitOpen,
  ]);
}
