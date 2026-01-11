'use client';

import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, LoginInput } from '@/lib/validators/loginSchema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert } from '@/components/ui/alert';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export function LoginForm() {
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(data: LoginInput) {
    setError(null);

    const res = await signIn('credentials', {
      email: data.email,
      password: data.password,
      redirect: false,
      callbackUrl: "/dashboard"
    });

    if (res?.error) {
      setError(res.error);
      return;
    }

    // success → dashboard
    router.push('/dashboard');
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <Input
        placeholder="Email"
        {...form.register('email')}
      />

      <Input autoComplete='current-email'
        type="password"
        placeholder="Password"
        {...form.register('password')}
      />

      <Button type="submit" className="w-full">
        Login
      </Button>

      {/* 🔴 ERROR MAPPING GOES HERE */}
      {error === 'EMAIL_NOT_VERIFIED' && (
        <Alert variant="destructive">
          Please verify your email before logging in.
          <Link
            href="/verify-email"
            className="underline ml-2"
          >
            Verify now
          </Link>
        </Alert>
      )}

      {error === 'INVALID_CREDENTIALS' && (
        <Alert variant="destructive">
          Invalid email or password
        </Alert>
      )}

      {error && !['EMAIL_NOT_VERIFIED', 'INVALID_CREDENTIALS'].includes(error) && (
        <Alert variant="destructive">
          Something went wrong. Please try again.
        </Alert>
      )}

      <div className="text-sm text-center">
        <Link href="/forgot-password" className="underline">
          Forgot password?
        </Link>
      </div>
    </form>
  );
}
