import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/axios';

export function useInviteStaff() {
  return useMutation({
    mutationFn: (email: string) =>
      api.post('/staff/invite', { email }),
  });
}
