// hooks/useStaff.ts
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';

export function useStaff() {
  return useQuery({
    queryKey: ['staff'],
    queryFn: async () => {
      const { data } = await api.get('/staff');
      return data;
    },
  });
}
