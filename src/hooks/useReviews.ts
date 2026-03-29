import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchReviewsByType, submitReview } from '../lib/api';
import type { SubmitReviewInput } from '../lib/api';
import { toast } from '../components/Toast';

const REVIEWS_KEY = ['reviews'] as const;

export function useReviews(type?: string) {
  return useQuery({
    queryKey: type ? [...REVIEWS_KEY, type] : REVIEWS_KEY,
    queryFn: () => fetchReviewsByType(type),
  });
}

export function useSubmitReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: SubmitReviewInput) => submitReview(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: REVIEWS_KEY });
    },
    onError: (error: Error) => {
      toast(error.message || 'Failed to save review', 'error');
    },
  });
}
