import NextAuth, { type DefaultSession } from "next-auth";
import Google from "next-auth/providers/google";
import { eq } from "drizzle-orm";
import { db } from "./db/index";
import { users } from "./db/schema";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      fullName: string;
    } & DefaultSession["user"];
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  trustHost: true,
  pages: {
    signIn: "/",
  },
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID ?? process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET ?? process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async signIn({ account, profile, user }) {
      if (account?.provider !== "google") return true;

      const email = profile?.email?.toLowerCase();
      const isVerified = profile?.email_verified !== false;
      if (!email || !isVerified) return false;

      let [u] = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

      if (!u || !u.isActive) return false;

      user.id = String(u.id);
      user.email = u.email;
      user.name = u.fullName;
      // @ts-ignore
      user.role = u.role;
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        // @ts-ignore
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
});
