# Routing & Guards

## Routes
```
/login          → LoginView (public, no AppShell)
/onboarding     → OnboardingView (auth required, no AppShell)
/today          → TodayView (auth + onboarding required, AppShell)
/goals          → GoalsView (auth + onboarding required, AppShell)
/*              → redirect to /today
```

## Guards
```typescript
// AuthGuard: wraps all routes except /login
// If not authenticated → redirect to /login
function AuthGuard({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <Spinner />;
  if (!isAuthenticated) return <Navigate to="/login" />;
  return children;
}

// OnboardingGuard: wraps /today and /goals
// If has_completed_onboarding === false → redirect to /onboarding
function OnboardingGuard({ children }) {
  const { data: settings, isLoading } = useSettings();
  if (isLoading) return <Spinner />;
  if (!settings?.has_completed_onboarding) return <Navigate to="/onboarding" />;
  return children;
}
```

## Route Structure
```tsx
<Routes>
  <Route path="/login" element={<LoginView />} />
  <Route element={<AuthGuard><Outlet /></AuthGuard>}>
    <Route path="/onboarding" element={<OnboardingView />} />
    <Route element={<OnboardingGuard><AppShell><Outlet /></AppShell></OnboardingGuard>}>
      <Route path="/today" element={<TodayView />} />
      <Route path="/goals" element={<GoalsView />} />
    </Route>
  </Route>
  <Route path="*" element={<Navigate to="/today" />} />
</Routes>
```
