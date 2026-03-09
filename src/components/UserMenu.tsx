"use client"
import { signOut } from "next-auth/react"
import { useState } from "react"

interface UserMenuProps {
  user: { name?: string | null; email?: string | null; image?: string | null }
}

export function UserMenu({ user }: UserMenuProps) {
  const [open, setOpen] = useState(false)

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-full focus:outline-none"
      >
        {user.image ? (
          <img
            src={user.image}
            alt=""
            className="w-8 h-8 rounded-full ring-2 ring-violet-200"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center text-white text-xs font-bold">
            {user.name?.[0]?.toUpperCase() ?? "U"}
          </div>
        )}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
          <div className="px-4 py-2 border-b border-gray-100">
            <p className="text-sm font-medium text-gray-900">{user.name}</p>
            <p className="text-xs text-gray-400">{user.email}</p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
          >
            Sair
          </button>
        </div>
      )}
    </div>
  )
}
