'use client';

import { useSession } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { api } from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function StaffPage() {
  const { data: session, status } = useSession();
  const form = useForm<{ email: string }>();

  if (status === 'loading') {
    return <p>Loading...</p>;
  }

  if (!["BUSINESS_OWNER", "STAFF_ADMIN"].includes(session?.user.role as string)) {
    return <p>Not authorized</p>;
  }

  async function onSubmit(data: { email: string }) {
    await api.post('/staff/invite', data);
    alert('Invitation sent');
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <Input placeholder="Staff email" {...form.register('email')} />
      <Button>Invite staff</Button>
    </form>
  );
}
