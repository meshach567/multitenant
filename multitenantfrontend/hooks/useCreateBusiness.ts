import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/axios';

export function useCreateBusiness() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      name: string;
      timezone: string;
      currency: string;
    }) => {
      const res = await api.post('/business/business', data);
      return res.data;
    },
    onSuccess: () => {
      // invalidate business query so /business/me refetches
      queryClient.invalidateQueries({ queryKey: ['business'] });
    },
  });
}
