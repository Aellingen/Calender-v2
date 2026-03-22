import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchUserSettings, updateUserSettings } from '../lib/api';

export function useSettings() {
  return useQuery({
    queryKey: ['user-settings'],
    queryFn: fetchUserSettings,
  });
}

export function useUpdateSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateUserSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-settings'] });
    },
  });
}
