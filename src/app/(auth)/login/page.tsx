"use client"

import { signIn } from "next-auth/react"
import { useEffect, useState } from "react"

export default function LoginPage() {
  const [error, setError] = useState(false)

  useEffect(() => {
    // Auto sign-in with mock credentials
    signIn("credentials", { callbackUrl: "/dashboard" }).catch(() => setError(true))
  }, [])

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-sm text-red-400">Erro ao autenticar. Tente novamente.</p>
        <button
          onClick={() => signIn("credentials", { callbackUrl: "/dashboard" })}
          className="text-sm font-bold text-white bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl transition"
        >
          Tentar novamente
        </button>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-white/[0.08] border border-white/[0.06] flex items-center justify-center animate-pulse">
          <span className="text-sm font-black text-white/60">B</span>
        </div>
        <p className="text-xs text-white/30">Entrando...</p>
      </div>
    </div>
  )
}
