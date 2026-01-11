// mutations/useForgotPassword.ts
import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { ForgotPasswordInput } from '@/lib/validators/forgotPasswordSchema';

export function useForgotPassword() {
  return useMutation({
    mutationFn: (data: ForgotPasswordInput) =>
      api.post('/auth/forgot-password', data),
  });
}
