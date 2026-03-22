import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import {
  fetchHabits,
  fetchTodayCompletions,
  createHabit,
  updateHabit,
  toggleHabitCompletion,
  retireHabit,
  deleteHabit,
} from '../lib/api';
import type { CreateHabitInput, UpdateHabitInput } from '../lib/api';
import type { Habit, HabitCompletion } from '../lib/types';

const HABITS_KEY = ['habits'] as const;
const COMPLETIONS_TODAY_KEY = ['habit-completions', 'today'] as const;

export function useHabits() {
  return useQuery({
    queryKey: HABITS_KEY,
    queryFn: fetchHabits,
    select: (data: Habit[]) => data.filter((h) => h.is_active),
  });
}

export function useTodayHabits() {
  return useQuery({
    queryKey: [...HABITS_KEY, 'today'],
    queryFn: fetchHabits,
    select: (data: Habit[]) => {
      const now = new Date();
      const day = now.getDay(); // 0=Sun
      const isoDay = day === 0 ? 7 : day; // 1=Mon..7=Sun

      return data
        .filter((h) => h.is_active)
        .filter((h) => {
          switch (h.frequency) {
            case 'daily':
              return true;
            case 'weekdays':
              return isoDay >= 1 && isoDay <= 5;
            case 'weekends':
              return isoDay === 6 || isoDay === 7;
            case 'custom':
              return h.custom_days?.includes(isoDay) ?? false;
            default:
              return true;
          }
        });
    },
  });
}

export function useHabitsByPillar(pillarId: string) {
  return useQuery({
    queryKey: [...HABITS_KEY, 'pillar', pillarId],
    queryFn: fetchHabits,
    select: (data: Habit[]) => data.filter((h) => h.is_active && h.pillar_id === pillarId),
    enabled: !!pillarId,
  });
}

export function useHabitsByGoal(goalId: string) {
  return useQuery({
    queryKey: [...HABITS_KEY, 'goal', goalId],
    queryFn: fetchHabits,
    select: (data: Habit[]) => data.filter((h) => h.is_active && h.goal_id === goalId),
    enabled: !!goalId,
  });
}

/** Single query for ALL of today's completions — avoids N+1 */
export function useTodayCompletions() {
  const today = format(new Date(), 'yyyy-MM-dd');
  return useQuery({
    queryKey: [...COMPLETIONS_TODAY_KEY, today],
    queryFn: () => fetchTodayCompletions(today),
  });
}

export function useCreateHabit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateHabitInput) => createHabit(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: HABITS_KEY });
    },
  });
}

export function useUpdateHabit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateHabitInput }) =>
      updateHabit(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: HABITS_KEY });
    },
  });
}

export function useToggleHabitCompletion() {
  const queryClient = useQueryClient();
  const today = format(new Date(), 'yyyy-MM-dd');

  return useMutation({
    mutationFn: ({ habitId, date }: { habitId: string; date: string }) =>
      toggleHabitCompletion(habitId, date),
    onMutate: async ({ habitId }) => {
      await queryClient.cancelQueries({ queryKey: COMPLETIONS_TODAY_KEY });
      const previous = queryClient.getQueryData<HabitCompletion[]>([...COMPLETIONS_TODAY_KEY, today]);

      // Optimistic: toggle completion
      queryClient.setQueryData<HabitCompletion[]>(
        [...COMPLETIONS_TODAY_KEY, today],
        (old) => {
          if (!old) return old;
          const exists = old.find((c) => c.habit_id === habitId);
          if (exists) {
            return old.filter((c) => c.habit_id !== habitId);
          }
          return [
            ...old,
            {
              id: `optimistic-${habitId}`,
              habit_id: habitId,
              completed_date: today,
              completed_at: new Date().toISOString(),
            },
          ];
        },
      );

      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData([...COMPLETIONS_TODAY_KEY, today], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: COMPLETIONS_TODAY_KEY });
      queryClient.invalidateQueries({ queryKey: HABITS_KEY });
    },
  });
}

export function useRetireHabit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => retireHabit(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: HABITS_KEY });
    },
  });
}

export function useDeleteHabit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteHabit(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: HABITS_KEY });
    },
  });
}
