import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchPillars,
  createPillar,
  createPillars,
  updatePillar,
  reorderPillars,
  archivePillar,
} from '../lib/api';
import type { CreatePillarInput, UpdatePillarInput } from '../lib/api';
import type { Pillar } from '../lib/types';

const PILLARS_KEY = ['pillars'] as const;

export function usePillars() {
  return useQuery({
    queryKey: PILLARS_KEY,
    queryFn: fetchPillars,
    select: (data: Pillar[]) => data.filter((p) => !p.is_archived),
  });
}

export function usePillar(id: string) {
  return useQuery({
    queryKey: [...PILLARS_KEY, id],
    queryFn: fetchPillars,
    select: (data: Pillar[]) => data.find((p) => p.id === id) ?? null,
    enabled: !!id,
  });
}

export function useCreatePillar() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreatePillarInput) => createPillar(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PILLARS_KEY });
    },
  });
}

export function useCreatePillars() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreatePillarInput[]) => createPillars(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PILLARS_KEY });
    },
  });
}

export function useUpdatePillar() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePillarInput }) =>
      updatePillar(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PILLARS_KEY });
    },
  });
}

export function useReorderPillars() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) => reorderPillars(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PILLARS_KEY });
    },
  });
}

export function useArchivePillar() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => archivePillar(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PILLARS_KEY });
    },
  });
}
