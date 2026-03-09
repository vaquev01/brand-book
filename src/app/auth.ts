import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma as never),
  providers: [
    Credentials({
      name: "Acesso Direto",
      credentials: {},
      async authorize() {
        // Upsert a demo user for mock access
        const user = await prisma.user.upsert({
          where: { email: "demo@brandbook.app" },
          update: { updatedAt: new Date() },
          create: {
            email: "demo@brandbook.app",
            name: "Brandbook User",
            role: "editor",
            subscriptionTier: "pro",
          },
        })
        return { id: user.id, email: user.email, name: user.name }
      },
    }),
  ],
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    jwt({ token, user }) {
      if (user) token.id = user.id
      return token
    },
    session({ session, token }) {
      if (token.id) session.user.id = token.id as string
      return session
    },
  },
})
