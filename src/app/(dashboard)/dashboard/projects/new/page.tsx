"use client"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function NewProjectPage() {
  const router = useRouter()

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Link href="/dashboard" className="text-sm text-gray-400 hover:text-gray-600">
          ← Dashboard
        </Link>
      </div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Novo Brandbook</h1>
      <p className="text-gray-500 mb-8">
        Gere uma identidade visual completa com IA em minutos.
      </p>

      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => router.push("/?tab=generate")}
          className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm hover:border-violet-300 hover:shadow-md transition-all text-left group"
        >
          <div className="text-3xl mb-3">✦</div>
          <h3 className="font-semibold text-gray-900 group-hover:text-violet-700 transition-colors">
            Gerar com IA
          </h3>
          <p className="text-sm text-gray-400 mt-1">
            Descreva sua marca e a IA cria tudo automaticamente
          </p>
        </button>

        <button
          onClick={() => router.push("/?tab=examples")}
          className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm hover:border-violet-300 hover:shadow-md transition-all text-left group"
        >
          <div className="text-3xl mb-3">📋</div>
          <h3 className="font-semibold text-gray-900 group-hover:text-violet-700 transition-colors">
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
