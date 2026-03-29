import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthGuard } from './components/AuthGuard';
import { OnboardingGuard } from './components/OnboardingGuard';
import { AppShell } from './components/AppShell';
import { JournalPrompt } from './components/JournalPrompt';
import { CreateGoalModal } from './components/CreateGoalModal';
import { CreateActionModal } from './components/CreateActionModal';
import { CreateHabitModal } from './components/CreateHabitModal';
import { ToastContainer } from './components/Toast';
import { AIChatPanel } from './components/AIChatPanel';
import { TemplateBrowser } from './components/TemplateBrowser';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useUIStore } from './lib/store';
import LoginView from './views/LoginView';
import OnboardingView from './views/OnboardingView';
import TodayView from './views/TodayView';
import GoalsView from './views/GoalsView';
import SettingsView from './views/SettingsView';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2,
      retry: 1,
    },
  },
});

function GlobalModals() {
  const {
    isCreateGoalOpen, closeCreateGoal,
    isCreateActionOpen, closeCreateAction,
    isCreateHabitOpen, closeCreateHabit,
    isTemplateBrowserOpen, closeTemplateBrowser,
  } = useUIStore();

  return (
    <>
      <JournalPrompt />
      {isCreateGoalOpen && <CreateGoalModal onClose={closeCreateGoal} />}
      {isCreateActionOpen && <CreateActionModal onClose={closeCreateAction} />}
      {isCreateHabitOpen && <CreateHabitModal onClose={closeCreateHabit} />}
      {isTemplateBrowserOpen && <TemplateBrowser onClose={closeTemplateBrowser} />}
    </>
  );
}

function ShortcutsProvider({ children }: { children: React.ReactNode }) {
  useKeyboardShortcuts();
  return <>{children}</>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ShortcutsProvider>
          <Routes>
            <Route path="/login" element={<LoginView />} />
            <Route element={<AuthGuard />}>
              <Route path="/onboarding" element={<OnboardingView />} />
              <Route element={<OnboardingGuard />}>
                <Route element={<AppShell />}>
                  <Route path="/today" element={<TodayView />} />
                  <Route path="/goals" element={<GoalsView />} />
                  <Route path="/settings" element={<SettingsView />} />
                </Route>
              </Route>
            </Route>
            <Route path="*" element={<Navigate to="/today" replace />} />
          </Routes>
          <GlobalModals />
          <AIChatPanel />
          <ToastContainer />
        </ShortcutsProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
