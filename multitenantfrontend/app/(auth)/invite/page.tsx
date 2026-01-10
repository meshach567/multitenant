'use client';

import { useSession } from 'next-auth/react';

export default function InviteStaffPage() {
  const { data: session, status } = useSession();

  if (status === 'loading') return null;

  if (session?.user.role !== 'BUSINESS_OWNER') {
    return <div>You are not authorized to view this page.</div>;
  }

  return <div>Invite Staff Form</div>;
}
