import { auth } from "@/app/auth"
import { redirect } from "next/navigation"

export async function getServerUser() {
  const session = await auth()
  return session?.user ?? null
}

export async function requireAuth() {
  const user = await getServerUser()
  if (!user) redirect("/login")
  return user
}

export async function getOptionalAuth() {
  const session = await auth()
  return session?.user ?? null
}
