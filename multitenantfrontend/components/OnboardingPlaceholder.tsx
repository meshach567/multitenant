'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  businessSchema,
  BusinessInput,
} from '@/lib/validators/businessSchema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCreateBusiness } from '@/hooks/useCreateBusiness';
import { useRouter } from 'next/navigation';

export default function Onboarding() {
  const router = useRouter();
  const mutation = useCreateBusiness();

  const form = useForm<BusinessInput>({
    resolver: zodResolver(businessSchema),
    defaultValues: {
      timezone: 'Africa/Lagos',
      currency: 'NGN',
    },
  });

  async function onSubmit(data: BusinessInput) {
    await mutation.mutateAsync(data);
    router.push('/dashboard');
  }

  return (
    <div className="max-w-md mx-auto mt-16">
      <h1 className="text-2xl font-bold mb-2">
        Create your business
      </h1>
      <p className="text-muted-foreground mb-6">
        Set up your workspace to continue
      </p>

      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4"
      >
        <Input
          placeholder="Business name"
          {...form.register('name')}
        />

        <Input
          placeholder="Timezone"
          {...form.register('timezone')}
        />

        <Input
          placeholder="Currency"
          {...form.register('currency')}
        />

        <Button
          type="submit"
          className="w-full"
          disabled={mutation.isPending}
        >
          {mutation.isPending ? 'Creating...' : 'Create business'}
        </Button>

        {mutation.isError && (
          <p className="text-red-500 text-sm">
            Something went wrong. Try again.
          </p>
        )}
      </form>
    </div>
  );
}
