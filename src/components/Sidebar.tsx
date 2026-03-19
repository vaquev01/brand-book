"use client"
import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import { LanguageSwitcher } from "./LanguageSwitcher"

interface SidebarProps {
  user: { name?: string | null; email?: string | null; image?: string | null }
  plan?: string
}

/** Key used by Sidebar/Dashboard to signal "create new brandbook" to the editor */
export const BB_NEW_FLAG = "bb_force_new"

const navItems = [
  {
    href: "/dashboard",
    label: "Dashboard",
    exact: true,
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25a2.25 2.25 0 0 1-2.25-2.25v-2.25Z" />
      </svg>
    ),
  },
  {
    href: "/dashboard/projects",
    label: "Projetos",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z" />
      </svg>
    ),
  },
  {
    href: "/dashboard/editor",
    label: "Editor",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
      </svg>
    ),
  },
  {
    href: "/dashboard/templates",
    label: "Templates",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 8.25 20.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6Z" />
      </svg>
    ),
  },
  {
    href: "/dashboard/new-brandbook",
    label: "Novo Brandbook",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
      </svg>
    ),
  },
  {
    href: "/dashboard/analytics",
    label: "Analytics",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
      </svg>
    ),
  },
  {
    href: "/dashboard/billing",
    label: "Plano & Billing",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z" />
      </svg>
    ),
  },
]

const WORKSPACE_PLANS = ["team", "agency", "enterprise"]

export function Sidebar({ user, plan }: SidebarProps) {
  const pathname = usePathname()
  const showWorkspace = plan ? WORKSPACE_PLANS.includes(plan) : false
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside className={`${collapsed ? 'w-[72px]' : 'w-60'} transition-all duration-300 ease-out bg-white flex flex-col h-full border-r border-gray-100 shrink-0 overflow-hidden`}>
      {/* Logo */}
      <div className={`${collapsed ? 'px-3' : 'px-5'} pt-6 pb-5`}>
        <Link href="/dashboard" className="flex items-center gap-2.5" title="brandbook">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-md shrink-0" style={{ background: "linear-gradient(135deg, #111827 0%, #3730a3 100%)" }}>
            <span className="text-xs font-black text-white">B</span>
          </div>
          {!collapsed && <span className="text-sm font-bold text-gray-900 tracking-tight">brandbook</span>}
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-0.5">
        {!collapsed && <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-300 px-3 mb-2">Menu</div>}
        {collapsed && <div className="mb-2" />}
        {navItems.map((item, idx) => {
          const isExact = (item as { exact?: boolean }).exact
          const isActive = isExact
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(item.href + "/")
          const isNovoBrandbook = item.label === "Novo Brandbook"

          return (
            <div key={item.href}>
              {/* Divider between nav groups: after Templates (idx 3) and before Analytics (idx 5) */}
              {(idx === 4 || idx === 5) && <div className="mx-4 my-2 h-px bg-gray-100" />}
              {isNovoBrandbook ? (
                <Link
                  href={item.href}
                  className={`flex items-center ${collapsed ? 'justify-center' : 'gap-2.5'} px-3 py-2 rounded-xl text-[13px] font-semibold transition-all text-white shadow-sm`}
                  style={{ background: "linear-gradient(135deg, #111827 0%, #3730a3 100%)", textShadow: "0 1px 2px rgba(0,0,0,0.2)" }}
                  title={collapsed ? item.label : undefined}
                >
                  <span className="text-white shrink-0">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 0 0-2.455 2.456Z" />
                    </svg>
                  </span>
                  {!collapsed && <span className="whitespace-nowrap">{item.label}</span>}
                </Link>
              ) : (
                <Link
                  href={item.href}
                  className={`flex items-center ${collapsed ? 'justify-center' : 'gap-2.5'} px-3 py-2 rounded-xl text-[13px] font-medium transition-all ${
                    isActive
                      ? "bg-gray-900 text-white shadow-sm"
                      : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                  title={collapsed ? item.label : undefined}
                >
                  <span className={`shrink-0 ${isActive ? "text-white" : "text-gray-400"}`}>{item.icon}</span>
                  {!collapsed && <span className="whitespace-nowrap">{item.label}</span>}
                </Link>
              )}
            </div>
          )
        })}
        {showWorkspace && (() => {
          const isActive = pathname === "/dashboard/workspace" || pathname.startsWith("/dashboard/workspace/")
          return (
            <Link
              href="/dashboard/workspace"
              className={`flex items-center ${collapsed ? 'justify-center' : 'gap-2.5'} px-3 py-2 rounded-xl text-[13px] font-medium transition-all ${
                isActive
                  ? "bg-gray-900 text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
              }`}
              title={collapsed ? "Workspace" : undefined}
            >
              <span className={`shrink-0 ${isActive ? "text-white" : "text-gray-400"}`}>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 0h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Z" />
                </svg>
              </span>
              {!collapsed && <span className="whitespace-nowrap">Workspace</span>}
            </Link>
          )
        })()}
      </nav>

      {/* Search hint (Cmd+K) */}
      <div
        className={`mx-3 mb-2 flex items-center ${collapsed ? 'justify-center' : ''} gap-1.5 py-1.5 ${collapsed ? 'px-0' : 'px-2'} rounded-lg bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors`}
        onClick={() => { const e = new KeyboardEvent("keydown", { key: "k", metaKey: true, bubbles: true }); window.dispatchEvent(e) }}
        title={collapsed ? "Buscar (Cmd+K)" : undefined}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 shrink-0"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
        {!collapsed && <span className="text-[11px] text-gray-400 font-medium">Buscar</span>}
        {!collapsed && <kbd className="ml-auto text-[9px] font-bold text-gray-300 bg-white px-1 py-0.5 rounded border border-gray-200">&#8984;K</kbd>}
      </div>

      {/* Language switcher */}
      <div className={`mx-3 mb-1 flex ${collapsed ? 'justify-center' : 'justify-center'}`}>
        <LanguageSwitcher />
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="mx-auto mb-3 flex items-center justify-center w-8 h-8 rounded-lg hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600"
        title={collapsed ? "Expandir menu" : "Recolher menu"}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform ${collapsed ? 'rotate-180' : ''}`}>
          <path d="m15 18-6-6 6-6"/>
        </svg>
      </button>

      {/* User */}
      <div className="p-3 border-t border-gray-100 m-3 mt-0">
        <div className={`flex items-center ${collapsed ? 'justify-center' : 'gap-2.5'} px-2 py-2`}>
          {user.image ? (
            <Image src={user.image} alt="" className="w-7 h-7 rounded-full ring-2 ring-gray-100 shrink-0" width={28} height={28} unoptimized />
          ) : (
            <div className="w-7 h-7 rounded-full bg-gray-900 flex items-center justify-center text-[10px] font-bold text-white shrink-0">
              {user.name?.[0]?.toUpperCase() ?? "U"}
            </div>
          )}
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-medium text-gray-900 truncate">{user.name ?? "Usuario"}</p>
              <p className="text-[11px] text-gray-400 truncate">{user.email}</p>
            </div>
          )}
        </div>
        {!collapsed && (
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="w-full text-left px-3 py-1.5 text-[11px] text-gray-400 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors mt-1"
          >
            Sair da conta
          </button>
        )}
        {collapsed && (
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="w-full flex items-center justify-center py-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors mt-1"
            title="Sair da conta"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
            </svg>
          </button>
        )}
      </div>
    </aside>
  )
}
