import Link from "next/link"

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="mb-6 inline-flex">
          <div className="w-16 h-16 rounded-2xl bg-gray-900 flex items-center justify-center">
            <span className="text-2xl font-black text-white">B</span>
          </div>
        </div>
        <h1 className="text-6xl font-black text-gray-900 mb-2">404</h1>
        <p className="text-lg text-gray-500 mb-8">
          Essa página não existe ou foi removida.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-white px-6 py-3 rounded-xl font-semibold text-sm transition-all hover:-translate-y-0.5"
            style={{
              background: "linear-gradient(135deg, #111827 0%, #3730a3 100%)",
              boxShadow: "0 20px 40px -24px rgba(55, 48, 163, 0.6)",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            Ir para o Dashboard
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-gray-600 bg-white border border-gray-200 px-6 py-3 rounded-xl font-semibold text-sm transition-all hover:border-gray-300 hover:bg-gray-50"
          >
            Página inicial
          </Link>
        </div>
      </div>
    </div>
  )
}
