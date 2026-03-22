import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import {
  fetchActions,
  fetchTodayActions,
  fetchAction,
  createAction,
  updateAction,
  completeAction,
  deleteAction,
} from '../lib/api';
import type { CreateActionInput, UpdateActionInput } from '../lib/api';
import type { Action } from '../lib/types';

const ACTIONS_KEY = ['actions'] as const;
const TODAY_ACTIONS_KEY = ['actions', 'today'] as const;

export function useActions(goalId?: string) {
  return useQuery({
    queryKey: goalId ? [...ACTIONS_KEY, goalId] : ACTIONS_KEY,
    queryFn: () => fetchActions(goalId),
  });
}

export function useTodayActions(date?: string) {
  const today = date ?? format(new Date(), 'yyyy-MM-dd');
  return useQuery({
    queryKey: [...TODAY_ACTIONS_KEY, today],
    queryFn: () => fetchTodayActions(today),
  });
}

export function useAction(id: string) {
  return useQuery({
    queryKey: [...ACTIONS_KEY, id],
    queryFn: () => fetchAction(id),
    enabled: !!id,
  });
}

export function useCreateAction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateActionInput) => createAction(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ACTIONS_KEY });
    },
  });
}

export function useUpdateAction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateActionInput }) =>
      updateAction(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ACTIONS_KEY });
    },
  });
}

export function useCompleteAction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => completeAction(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ACTIONS_KEY });
      const previousToday = queryClient.getQueryData<Action[]>(TODAY_ACTIONS_KEY);

      // Optimistic update
      queryClient.setQueriesData<Action[]>(
        { queryKey: ACTIONS_KEY },
        (old) => old?.map((a) => (a.id === id ? { ...a, status: 'complete' as const } : a)),
      );

      return { previousToday };
    },
    onError: (_err, _id, context) => {
      if (context?.previousToday) {
        queryClient.setQueryData(TODAY_ACTIONS_KEY, context.previousToday);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ACTIONS_KEY });
    },
  });
}

export function useUncompleteAction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { id: string }) =>
      updateAction(id, { status: 'active' }),
    onMutate: async ({ id }) => {
      await queryClient.cancelQueries({ queryKey: ACTIONS_KEY });
      queryClient.setQueriesData<Action[]>(
        { queryKey: ACTIONS_KEY },
        (old) => old?.map((a) => (a.id === id ? { ...a, status: 'active' as const } : a)),
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ACTIONS_KEY });
    },
  });
}

export function useDeleteAction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteAction(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ACTIONS_KEY });
    },
  });
}
