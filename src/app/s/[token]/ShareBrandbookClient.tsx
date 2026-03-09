"use client"

import { BrandbookViewer } from "@/components/BrandbookViewer"
import type { BrandbookData } from "@/lib/types"

interface Props {
  brandbook: BrandbookData
  generatedImages: Record<string, string>
  projectName: string
}

export function ShareBrandbookClient({ brandbook, generatedImages, projectName }: Props) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white/80 backdrop-blur-xl border-b border-gray-100 px-4 sm:px-6 py-3 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <span className="text-lg font-black text-violet-600">✦</span>
          <span className="font-semibold text-gray-800 truncate">{brandbook.brandName ?? projectName}</span>
          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full hidden sm:inline-block">Brandbook</span>
        </div>
        <div className="text-xs text-gray-400 hidden sm:block">
          Gerado com ✦ brandbook
        </div>
      </header>
      <main className="max-w-7xl mx-auto py-6 px-2 sm:px-4 lg:px-6">
        <BrandbookViewer
          data={brandbook}
          generatedImages={generatedImages}
        />
      </main>
      <footer className="border-t border-gray-100 bg-white/60 backdrop-blur px-6 py-4 flex items-center justify-between">
        <p className="text-xs text-gray-400">Gerado com ✦ brandbook AI</p>
        <a href="/" className="text-xs font-semibold text-violet-600 hover:underline">
          Criar seu brandbook →
        </a>
      </footer>
    </div>
  )
}
