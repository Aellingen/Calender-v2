import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchGoals,
  fetchGoal,
  createGoal,
  updateGoal,
  deleteGoal,
  reorderGoals,
} from '../lib/api';
import type { CreateGoalInput, UpdateGoalInput } from '../lib/api';
import type { Goal } from '../lib/types';

const GOALS_KEY = ['goals'] as const;

export function useGoals(status?: Goal['status']) {
  return useQuery({
    queryKey: status ? [...GOALS_KEY, { status }] : GOALS_KEY,
    queryFn: () => fetchGoals(status),
  });
}

export function useGoal(id: string) {
  return useQuery({
    queryKey: [...GOALS_KEY, id],
    queryFn: () => fetchGoal(id),
    enabled: !!id,
  });
}

export function useGoalsByPillar(pillarId: string) {
  return useQuery({
    queryKey: [...GOALS_KEY, 'pillar', pillarId],
    queryFn: () => fetchGoals(),
    select: (data: Goal[]) => data.filter((g) => g.pillar_id === pillarId),
    enabled: !!pillarId,
  });
}

export function useCreateGoal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateGoalInput) => createGoal(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: GOALS_KEY });
    },
  });
}

export function useUpdateGoal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateGoalInput }) =>
      updateGoal(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: GOALS_KEY });
    },
  });
}

export function useDeleteGoal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteGoal(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: GOALS_KEY });
    },
  });
}

export function useReorderGoals() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) => reorderGoals(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: GOALS_KEY });
    },
  });
}
