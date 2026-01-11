'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { resetPasswordSchema, ResetPasswordInput } from '@/lib/validators/resetPasswordSchema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert } from '@/components/ui/alert';
import axios from 'axios';
import { useState } from 'react';

export default function ResetPasswordPage() {
  const params = useSearchParams();
  const token = params.get('token');
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const myForm = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
  });

  async function onSubmit(data: ResetPasswordInput) {
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/reset-password`,
        { token, password: data.password },
      );

      router.push('/login');
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
      setError(err?.response?.data?.message ?? 'Reset failed');
    }
  }

  if (!token) {
    return <Alert variant="destructive">Invalid reset link</Alert>;
  }

  return (
    <form onSubmit={myForm.handleSubmit(onSubmit)} className="space-y-4 max-w-sm">
      <Input type="password" placeholder="New password" {...myForm.register('password')} />
      <Input type="password" placeholder="Confirm password" {...myForm.register('confirmPassword')} />

      <Button className="w-full">Reset Password</Button>

      {error && <Alert variant="destructive">{error}</Alert>}
    </form>
  );
}
}