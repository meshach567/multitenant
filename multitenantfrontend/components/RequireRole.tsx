'use client';

import { useSession } from 'next-auth/react';

export function RequireRole({
  role,
  children,
}: {
  role: 'BUSINESS_OWNER' | 'STAFF';
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();

  if (status === 'loading') return null;

  if (!session || session.user.role !== role) {
    return <p>Not authorized</p>;
  }

  return <>{children}</>;
}
