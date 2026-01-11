'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, RegisterInput } from '@/lib/validators/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { toast } from 'sonner';

export function RegisterForm() {
  const router = useRouter();

  const form = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  async function onSubmit(data: RegisterInput) {
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, data, {
        headers: { 'Content-Type': 'application/json' },
      });

      toast.success('Verification code sent to your email');
      router.push(`/verify-email?email=${data.email}`);
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        const message = error.response?.data?.message;

        if (status === 409) {
          toast.error(message || 'Email already exists');
        } else if (status === 403) {
          toast.error('Please verify your email before registering.');
        } else {
          toast.error('Something went wrong. Please try again.');
        }
      } else {
        toast.error('Something went wrong. Please try again.');
      }
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-w-md mx-auto">
      <Input
        autoComplete="email"
        placeholder="Email"
        {...form.register('email')}
      />
      <Input
        type="password"
        autoComplete="new-password"
        placeholder="Password"
        {...form.register('password')}
      />
      <Input
        placeholder="Business Name"
        {...form.register('businessName')}
      />
      <Input
        placeholder="Timezone"
        {...form.register('timezone')}
      />
      <Input
        placeholder="Currency"
        {...form.register('currency')}
      />
      <Button type="submit" className="w-full">
        Create Account
      </Button>
    </form>
  );
}
