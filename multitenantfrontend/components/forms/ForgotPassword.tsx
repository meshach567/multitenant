'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { forgotPasswordSchema, ForgotPasswordInput } from '@/lib/validators/forgotPasswordSchema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import axios from 'axios';
import { useState } from 'react';

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);

  const form = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  async function onSubmit(data: ForgotPasswordInput) {
    await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/auth/forgot-password`,
      data,
    );
    setSent(true);
  }

  if (sent) {
    return <p>Check your email for a reset link.</p>;
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-w-sm">
      <Input placeholder="Email" {...form.register('email')} />
      <Button className="w-full">Send reset link</Button>
    </form>
  );
}
