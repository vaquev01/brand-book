"use client"

export default function EditorError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center h-full py-20 px-4">
      <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mb-6">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-red-500">
          <circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/>
        </svg>
      </div>
      <h2 className="text-lg font-bold text-gray-900 mb-2">Algo deu errado no editor</h2>
      <p className="text-sm text-gray-400 mb-6 max-w-md text-center">
        {error.message || "Ocorreu um erro inesperado. Seus dados foram salvos automaticamente."}
      </p>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:-translate-y-0.5"
          style={{ background: "linear-gradient(135deg, #111827 0%, #3730a3 100%)", boxShadow: "0 12px 24px -8px rgba(55, 48, 163, 0.4)" }}
        >
          Tentar novamente
        </button>
        <a href="/dashboard" className="px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-600 bg-white border border-gray-200 hover:border-gray-300 transition-all">
          Voltar ao Dashboard
        </a>
      </div>
    </div>
  )
}
