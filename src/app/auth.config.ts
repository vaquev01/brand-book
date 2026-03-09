import type { NextAuthConfig } from "next-auth"
import GitHub from "next-auth/providers/github"

// Edge-safe config: no Prisma/pg imports — used by middleware
export const authConfig = {
  providers: [
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
  ],
  pages: {
    signIn: "/login",
    error: "/login",
  },
} satisfies NextAuthConfig
