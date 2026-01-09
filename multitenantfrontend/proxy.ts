import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from '@/lib/auth'; // your Auth.js v5 config

export async function proxy(req: NextRequest) {
  const session = await auth();

  const { pathname } = req.nextUrl;

  // 🔒 Protect dashboard routes
  if (pathname.startsWith('/dashboard')) {
    if (!session) {
      return NextResponse.redirect(new URL('/login', req.url));
    }

    // 🧑 Role-based access
    if (
      pathname.startsWith('/dashboard/admin') &&
      session.user.role !== 'BUSINESS_OWNER'
    ) {
      return NextResponse.redirect(new URL('/not-authorized', req.url));
    }

    // 🏢 Tenant isolation
    // Example: /dashboard/[businessId]
    const segments = pathname.split('/');
    const businessIdFromUrl = segments[2];

    if (
      businessIdFromUrl &&
      session.user.businessId &&
      businessIdFromUrl !== session.user.businessId
    ) {
      return NextResponse.redirect(new URL('/not-authorized', req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*'],
};
