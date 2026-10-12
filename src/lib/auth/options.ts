import type { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { db } from "@/lib/db";
import { loginSchema } from "@/validators/auth";
import { rateLimit } from "@/lib/security/rate-limit";
export const authOptions: NextAuthOptions = {
  secret: process.env.AUTH_SECRET,
  session: { strategy: "jwt", maxAge: 60 * 60 * 24 * 7 },
  pages: { signIn: "/login", error: "/login" },
  providers: [
    Credentials({
      name: "Email",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Kata sandi", type: "password" },
      },
      async authorize(credentials, request) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;
        const forwarded = request.headers?.["x-forwarded-for"];
        const ip =
          process.env.VERCEL && typeof forwarded === "string"
            ? forwarded.split(",")[0].trim()
            : "local";
        await rateLimit(`login-ip:${ip}`, 20);
        await rateLimit(`login:${parsed.data.email}`, 5);
        const user = await db.user.findUnique({
          where: { email: parsed.data.email },
        });
        // Always hash-compare, including nonexistent accounts, to reduce timing differences.
        const valid = await compare(
          parsed.data.password,
          user?.passwordHash ||
            "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxdZKgRdtVuGKFVUBaoGI6BEPd2",
        );
        if (!user || !valid || !user.emailVerified || user.disabledAt)
          return null;
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          sessionVersion: user.sessionVersion,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.userId = user.id;
        token.sessionVersion = user.sessionVersion;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = String(token.userId || "");
      session.user.sessionVersion = Number(token.sessionVersion ?? -1);
      return session;
    },
  },
};
