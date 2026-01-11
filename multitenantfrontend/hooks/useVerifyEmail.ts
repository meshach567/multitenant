// mutations/useVerifyEmail.ts
import { useMutation } from '@tanstack/react-query';
// import { api } from '@/lib/api';
import { VerifyEmailInput } from '@/lib/validators/verifyEmailSchema';
import axios from 'axios';

export function useVerifyEmail() {
  return useMutation({
    mutationFn: async(data: VerifyEmailInput) => {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/verify-email`,
        data
      );
      return res.data;
    },
  });
}
