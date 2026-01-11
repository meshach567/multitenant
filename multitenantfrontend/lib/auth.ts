import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

import axios from "axios";
export const { auth, handlers, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { type: "email" },
        password: { type: "password" },
      },
      async authorize(credentials) {
        try {
          const res = await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
            credentials
          );
          return {
            id: res.data.userId,
            role: res.data.role,
            businessId: res.data.businessId,
            accessToken: res.data.accessToken,
          };
        } catch (error: unknown) {
          if (axios.isAxiosError(error)) {
            const status = error.response?.status;

            if (status === 403) {
              throw new Error("EMAIL_NOT_VERIFIED");
            }

            if (status === 401) {
              throw new Error("INVALID_CREDENTIALS");
            }
          }

          throw new Error("LOGIN_FAILED");
        }
      },
    }),
  ],

  session: {
    strategy: "jwt",
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = user.accessToken;
        token.role = user.role;
        token.businessId = user.businessId;
        token.sub = user.id;
      }
      return token;
    },

    async session({ session, token }) {
      session.user.id = token.sub!;
      session.user.role = token.role as string;
      session.user.businessId = token.businessId as string | undefined;
      session.accessToken = token.accessToken as string;
      return session;
    },
  },

  pages: {
    signIn: "/login",
  },
});
