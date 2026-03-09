"use client"

export default function AuthError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 to-slate-900 p-4">
      <div className="w-full max-w-md text-center">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
          <div className="mb-6 inline-flex items-center justify-center rounded-2xl bg-red-500/20 p-3">
            <span className="text-2xl">⚠</span>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Erro de autenticação</h2>
          <p className="text-sm text-slate-400 mb-6">
            {error.message || "Não foi possível completar a autenticação."}
          </p>
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-colors"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    </div>
  )
}
