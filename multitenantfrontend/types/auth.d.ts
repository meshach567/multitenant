import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    accessToken: string;
    user: {
      id: string;
      role: string;
      businessId?: string;
    } & DefaultSession['user'];
  }

  interface User {
    id: string;
    role: string;
    businessId?: string;
    accessToken: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    accessToken: string;
    role: string;
    businessId?: string;
  }
}
