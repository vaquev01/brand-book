import { auth } from "@/app/auth"
import { redirect } from "next/navigation"
import { Sidebar } from "@/components/Sidebar"
import { DashboardShell } from "@/components/DashboardShell"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const buildTs = process.env.NEXT_PUBLIC_BUILD_TIMESTAMP;

  return (
    <div className="flex h-screen bg-[#f8f9fb] overflow-hidden">
      {/* Sidebar hidden on mobile, visible on md+ */}
      <div className="hidden md:block">
        <Sidebar user={session.user} />
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
