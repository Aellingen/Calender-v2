import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import {
  fetchJournalEntry,
  fetchJournalHistory,
  upsertJournal,
} from '../lib/api';
import type { UpsertJournalInput } from '../lib/api';
import { toast } from '../components/Toast';

const JOURNAL_KEY = ['journal'] as const;

export function useTodayJournal() {
  const today = format(new Date(), 'yyyy-MM-dd');
  return useQuery({
    queryKey: [...JOURNAL_KEY, 'today', today],
    queryFn: () => fetchJournalEntry(today),
  });
}

export function useJournalHistory(limit = 30) {
  return useQuery({
    queryKey: [...JOURNAL_KEY, 'history', limit],
    queryFn: () => fetchJournalHistory(limit),
  });
}

export function useUpsertJournal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpsertJournalInput) => upsertJournal(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: JOURNAL_KEY });
    },
    onError: (error: Error) => {
      toast(error.message || 'Failed to save journal entry', 'error');
    },
  });
}
