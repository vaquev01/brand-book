import { auth } from "@/app/auth"
import { redirect } from "next/navigation"
import { Sidebar } from "@/components/Sidebar"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user) redirect("/login")

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar user={session.user} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
