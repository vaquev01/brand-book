import type { NextAuthConfig } from "next-auth"
import Credentials from "next-auth/providers/credentials"

// Edge-safe config: no Prisma/pg imports — used by middleware
export const authConfig = {
  providers: [
    Credentials({
      name: "Acesso Direto",
      credentials: {},
      async authorize() {
        // Mock auth — always authorize. Real user upsert happens in auth.ts
        return { id: "mock", email: "demo@brandbook.app", name: "Demo" }
      },
    }),
  ],
  pages: {
    signIn: "/login",
    error: "/login",
  },
} satisfies NextAuthConfig
