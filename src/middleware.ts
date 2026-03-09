import NextAuth from "next-auth"
import { authConfig } from "@/app/auth.config"

const { auth } = NextAuth(authConfig)

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const pathname = req.nextUrl.pathname

  const protectedPaths = ["/dashboard"]
  const isProtected = protectedPaths.some((p) => pathname.startsWith(p))

  if (isProtected && !isLoggedIn) {
    return Response.redirect(new URL("/login", req.nextUrl))
  }
})

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
