// mutations/useResetPassword.ts
import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/axios';

export function useResetPassword() {
  return useMutation({
    mutationFn: (data: { token: string; password: string }) =>
      api.post('/auth/reset-password', {
        token: data.token,
        newPassword: data.password,
      }),
  });
}
