import NextAuth from "next-auth"
import { authConfig } from "@/app/auth.config"

const { auth } = NextAuth(authConfig)

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const pathname = req.nextUrl.pathname

  const protectedPaths = ["/dashboard"]
  const isProtected = protectedPaths.some((p) => pathname.startsWith(p))

  // Protected routes: redirect to landing if not logged in
  if (isProtected && !isLoggedIn) {
    return Response.redirect(new URL("/login", req.nextUrl))
  }

  // If logged in and on landing page or login, go to dashboard
  if (isLoggedIn && (pathname === "/" || pathname === "/login")) {
    return Response.redirect(new URL("/dashboard", req.nextUrl))
  }
})

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|icon|opengraph-image).*)"],
}
