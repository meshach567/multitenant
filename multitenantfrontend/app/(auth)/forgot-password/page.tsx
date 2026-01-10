'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { forgotPasswordSchema, ForgotPasswordInput } from '@/lib/validators/forgotPasswordSchema';
import { useForgotPassword } from '@/hooks/useForgotPassword';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { toast } from 'sonner';

export default function ForgotPasswordPage() {
  const [ loading, setLoading ] = useState(false);
  const mutation = useForgotPassword();

  const form = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordInput) => {
    setLoading(true);
    try {
      
      await mutation.mutateAsync(data);
      toast.success('Reset link to email')
    } catch {
      toast.error('Failed to send reset email')
    } finally {
      setLoading(false)
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-w-sm">
      <Input placeholder="Email" {...form.register('email')} />
      <Button type="submit" disabled={loading}>
        Send Reset Link
      </Button>

      {mutation.isSuccess && (
        <p className="text-green-500">
          If the email exists, a reset link was sent.
        </p>
      )}
    </form>
  );
}
