import { auth } from "@/app/auth"
import { redirect } from "next/navigation"
import { Sidebar } from "@/components/Sidebar"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user) redirect("/login")

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar hidden on mobile, visible on md+ */}
      <div className="hidden md:block">
        <Sidebar user={session.user} />
      </div>
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile header */}
        <header className="md:hidden flex items-center justify-between bg-slate-900 text-white px-4 py-3 border-b border-slate-800">
          <span className="text-lg font-black bg-gradient-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent">
            ✦ brandbook
          </span>
          <div className="flex items-center gap-2">
            {session.user.image ? (
              <img src={session.user.image} alt="" className="w-7 h-7 rounded-full" />
            ) : (
              <div className="w-7 h-7 rounded-full bg-violet-600 flex items-center justify-center text-xs font-bold">
                {session.user.name?.[0]?.toUpperCase() ?? "U"}
              </div>
            )}
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
