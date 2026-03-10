import { auth } from "@/app/auth"
import { redirect } from "next/navigation"
import { Sidebar } from "@/components/Sidebar"
import { DashboardShell } from "@/components/DashboardShell"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user) redirect("/login")

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
    </div>
  )
}
