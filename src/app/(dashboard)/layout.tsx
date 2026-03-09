import { auth } from "@/app/auth"
import { redirect } from "next/navigation"
import { Sidebar } from "@/components/Sidebar"

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
        {/* Mobile header */}
        <header className="md:hidden flex items-center justify-between bg-white/90 backdrop-blur-xl px-4 py-3 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gray-900 flex items-center justify-center">
              <span className="text-[10px] font-black text-white">B</span>
            </div>
            <span className="text-sm font-bold text-gray-800">brandbook</span>
          </div>
          <div className="flex items-center gap-2">
            {session.user.image ? (
              <img src={session.user.image} alt="" className="w-7 h-7 rounded-full ring-2 ring-gray-100" />
            ) : (
              <div className="w-7 h-7 rounded-full bg-gray-900 flex items-center justify-center text-[10px] font-bold text-white">
                {session.user.name?.[0]?.toUpperCase() ?? "U"}
              </div>
            )}
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
