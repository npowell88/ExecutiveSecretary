import { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import GoogleProvider from "next-auth/providers/google";
import AzureADProvider from "next-auth/providers/azure-ad";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: "openid email profile https://www.googleapis.com/auth/calendar",
          access_type: "offline",
          prompt: "consent",
        },
      },
    }),
    AzureADProvider({
      clientId: process.env.MICROSOFT_CLIENT_ID!,
      clientSecret: process.env.MICROSOFT_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: "openid email profile offline_access Calendars.ReadWrite",
        },
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.userId = user.id;
        token.role = (user as any).role;
        token.wardId = (user as any).wardId;
      }

      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.provider = account.provider;
      }

      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any).id = token.userId;
        (session.user as any).role = token.role;
        (session.user as any).wardId = token.wardId;
        (session as any).accessToken = token.accessToken;
        (session as any).provider = token.provider;
      }
      return session;
    },
    async signIn({ user, account, profile }) {
      // Handle first-time sign in
      // If user doesn't exist, they need to be invited first
      if (!user.id) {
        return false;
      }

      return true;
    },
  },
  debug: process.env.NODE_ENV === "development",
};
