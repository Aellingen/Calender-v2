import { useQuery } from '@tanstack/react-query';
import { fetchAIUsageToday } from '../lib/api';

export function useAIUsage() {
  return useQuery({
    queryKey: ['ai-usage-today'],
    queryFn: fetchAIUsageToday,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });
}
