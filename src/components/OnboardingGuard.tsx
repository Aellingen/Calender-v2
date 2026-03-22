import { Navigate, Outlet } from 'react-router-dom';
import { useSettings } from '../hooks/useSettings';
import { Spinner } from './Spinner';

export function OnboardingGuard() {
  const { data: settings, isLoading } = useSettings();

  if (isLoading) return <Spinner />;
  if (!settings?.has_completed_onboarding) return <Navigate to="/onboarding" replace />;

  return <Outlet />;
}
