import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center text-center">
      <h1 className="text-4xl font-bold">BookFlow</h1>
      <p className="mt-2 text-muted-foreground">
        Multi-tenant booking & payments platform
      </p>

      <div className="mt-6 flex gap-4">
        <Link href="/login">
          <Button>Login</Button>
        </Link>
        <Link href="/register">
          <Button variant="outline">Get started</Button>
        </Link>
      </div>
    </div>
  );
}
