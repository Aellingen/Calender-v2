import { useQuery } from '@tanstack/react-query';
import { fetchAINudge } from '../lib/api';

export function useAINudge() {
  return useQuery({
    queryKey: ['ai-nudge'],
    queryFn: fetchAINudge,
    staleTime: 1000 * 60 * 60 * 24, // Cache 24 hours
    retry: false, // Don't retry AI calls
    refetchOnWindowFocus: false,
  });
}
