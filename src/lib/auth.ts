import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { User } from "@/db/schema";
import { eq } from "drizzle-orm";

// In-memory rate limiter for login attempts
const rateLimitMap = new Map<string, { count: number; lastAttempt: number }>();
const MAX_ATTEMPTS = 5;
const LOCKOUT_TIME = 15 * 60 * 1000; // 15 minutes

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          throw new Error("Username dan password harus diisi");
        }

        const username = credentials.username;
        const now = Date.now();
        const rateLimit = rateLimitMap.get(username);

        if (rateLimit) {
          if (rateLimit.count >= MAX_ATTEMPTS && now - rateLimit.lastAttempt < LOCKOUT_TIME) {
            const remainingTime = Math.ceil((LOCKOUT_TIME - (now - rateLimit.lastAttempt)) / 60000);
            throw new Error(`Terlalu banyak percobaan. Coba lagi dalam ${remainingTime} menit.`);
          }
          if (now - rateLimit.lastAttempt >= LOCKOUT_TIME) {
            // Reset if lockout time has passed
            rateLimitMap.delete(username);
          }
        }

        let users;
        try {
          users = await db.select().from(User).where(eq(User.username, credentials.username)).limit(1);
        } catch (error: any) {
          console.error("Database Error:", error);
          if (error.cause) console.error("Database Error Cause:", error.cause);
          throw new Error("Gagal mengambil data pengguna dari database. Silakan hubungi administrator.");
        }
        const user = users.length > 0 ? users[0] : null;

        if (!user) {
          throw new Error("Username tidak ditemukan");
        }

        if (!user.isActive) {
          throw new Error("Akun ini telah dinonaktifkan");
        }

        const isValid = await bcrypt.compare(credentials.password, user.password);

        if (!isValid) {
          const currentLimit = rateLimitMap.get(username) || { count: 0, lastAttempt: now };
          rateLimitMap.set(username, { count: currentLimit.count + 1, lastAttempt: now });
          throw new Error("Password salah");
        }

        // Reset rate limit on success
        rateLimitMap.delete(username);

        return {
          id: String(user.id),
          name: user.name,
          username: user.username,
          role: user.role,
          unit: user.unit,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.unit = (user as any).unit;
        token.username = (user as any).username;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        (session.user as any).unit = token.unit;
        (session.user as any).username = token.username;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 2 * 60 * 60, // 2 hours
  },
  secret: process.env.NEXTAUTH_SECRET,
};
