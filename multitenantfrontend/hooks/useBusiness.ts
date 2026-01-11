import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import axios from 'axios';

export function useBusiness() {
  return useQuery({
    queryKey: ['business'],
    queryFn: async () => {
      try {
        const { data } = await api.get('/business/me');
        return data;
      } catch (error) {
        if (
          axios.isAxiosError(error) &&
          error.response?.status === 403
        ) {
          return null; // 👈 means "no business yet"
        }
        throw error;
      }
    },
    retry: false, // 👈 important
  });
}
