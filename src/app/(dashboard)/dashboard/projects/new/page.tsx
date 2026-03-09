"use client"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function NewProjectPage() {
  const router = useRouter()

  return (
    <div className="max-w-2xl mx-auto animate-page-enter">
      <div className="mb-6">
        <Link href="/dashboard" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
          &larr; Dashboard
        </Link>
      </div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Novo Brandbook</h1>
      <p className="text-gray-500 mb-8">
        Gere uma identidade visual completa com IA em minutos.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          onClick={() => router.push("/dashboard/editor?tab=generate")}
          className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm hover:border-gray-300 hover:shadow-md transition-all text-left group"
        >
          <div className="w-10 h-10 rounded-xl bg-gray-900 flex items-center justify-center mb-4">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
            </svg>
          </div>
          <h3 className="font-semibold text-gray-900 group-hover:text-gray-700 transition-colors">
            Gerar com IA
          </h3>
          <p className="text-sm text-gray-400 mt-1">
            Descreva sua marca e a IA cria tudo automaticamente
          </p>
        </button>

        <button
          onClick={() => router.push("/dashboard/editor?tab=examples")}
          className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm hover:border-gray-300 hover:shadow-md transition-all text-left group"
        >
          <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center mb-4">
            <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
            </svg>
          </div>
          <h3 className="font-semibold text-gray-900 group-hover:text-gray-700 transition-colors">
            Usar exemplo
          </h3>
          <p className="text-sm text-gray-400 mt-1">
            Comece a partir de um brandbook existente
          </p>
        </button>
      </div>
    </div>
  )
}
