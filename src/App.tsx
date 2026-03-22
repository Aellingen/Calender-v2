import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthGuard } from './components/AuthGuard';
import { OnboardingGuard } from './components/OnboardingGuard';
import { AppShell } from './components/AppShell';
import LoginView from './views/LoginView';
import OnboardingView from './views/OnboardingView';
import TodayView from './views/TodayView';
import GoalsView from './views/GoalsView';
import SettingsView from './views/SettingsView';
import { JournalPrompt } from './components/JournalPrompt';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
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
        <JournalPrompt />
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
