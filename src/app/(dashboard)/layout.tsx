import { auth } from "@/app/auth"
import { redirect } from "next/navigation"
import { Sidebar } from "@/components/Sidebar"
import { CommandPalette } from "@/components/CommandPalette"
import { DashboardShell } from "@/components/DashboardShell"
import { prisma } from "@/lib/prisma"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user) redirect("/login")

  // Fetch user's plan for conditional sidebar items
  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { subscriptionTier: true },
  })
  const plan = dbUser?.subscriptionTier ?? "free"

  const buildTs = process.env.NEXT_PUBLIC_BUILD_TIMESTAMP;

  return (
    <div className="flex h-screen bg-[#f8f9fb] overflow-hidden">
      <CommandPalette />
      {/* Sidebar hidden on mobile, visible on md+ */}
      <div className="hidden md:flex h-full">
        <Sidebar user={session.user} plan={plan} />
      </div>
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardShell user={session.user}>
          {children}
        </DashboardShell>
      </div>
      {buildTs && (
        <div className="fixed bottom-2 right-3 text-[9px] font-mono text-gray-300 select-all z-50 pointer-events-none">
          build {new Date(buildTs).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo", day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
        </div>
      )}
    </div>
  )
}
