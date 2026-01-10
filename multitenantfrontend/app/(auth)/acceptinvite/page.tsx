'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { api } from '@/lib/axios';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function AcceptInvitePage() {
  const params = useSearchParams();
  const token = params.get('token');
  const router = useRouter();

  const form = useForm<{ password: string }>();

  if (!token) return <p>Invalid invite</p>;

  async function onSubmit(data: { password: string }) {
    try {
      const res = await api.post('/staff/accept-invite', {
        token,
        password: data.password,
      });

      // 🔑 AUTO LOGIN
      localStorage.setItem('accessToken', res.data.accessToken);

      toast.success('Invitation accepted');
      router.push('/dashboard');
    } catch {
      toast.error('Invalid or expired invite');
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <Input
        type="password"
        placeholder="Set password"
        {...form.register('password', { required: true })}
      />
      <Button>Accept Invitation</Button>
    </form>
  );
}
