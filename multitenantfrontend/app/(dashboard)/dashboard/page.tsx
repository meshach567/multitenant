'use client';

import Onboarding from '@/components/OnboardingPlaceholder';
import { RequireRole } from '@/components/RequireRole';
import { useBusiness } from '@/hooks/useBusiness';

export default function DashboardPage() {
  const { data: business, isLoading } = useBusiness();

  if (isLoading) return <p>Loading...</p>;

  if (!business) {
    return <Onboarding />
  }

  return (
    <RequireRole role='BUSINESS_OWNER'>
      <div>
        <h1 className='text-xl font-bold'>{business.name}</h1>
        <p>Welcome to your dashboard!</p>
      </div>
    </RequireRole>
  );
}
