'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchBusiness } from '@/lib/axios';

export default function BusinessPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['business'],
    queryFn: fetchBusiness,
  });

  if (isLoading) return <p>Loading...</p>;

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold">{data.name}</h1>
      <p>{data.timezone}</p>
      <p>{data.currency}</p>
    </div>
  );
}
