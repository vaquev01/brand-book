"use client"

import { BrandbookViewer } from "@/components/BrandbookViewer"
import type { BrandbookData } from "@/lib/types"
import { useMemo } from "react"

interface Props {
  brandbook: BrandbookData
  generatedImages: Record<string, string>
  projectName: string
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const m = hex.replace("#", "").match(/^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i)
  if (!m) return null
  return { r: parseInt(m[1], 16), g: parseInt(m[2], 16), b: parseInt(m[3], 16) }
}

function luminance(hex: string): number {
  const rgb = hexToRgb(hex)
  if (!rgb) return 0
  const sRGB = [rgb.r, rgb.g, rgb.b].map((c) => {
    const s = c / 255
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * sRGB[0] + 0.7152 * sRGB[1] + 0.0722 * sRGB[2]
}

export function ShareBrandbookClient({ brandbook, generatedImages, projectName }: Props) {
  const primaryHex = brandbook.colors?.primary?.[0]?.hex ?? "#111111"
  const accentHex = brandbook.colors?.primary?.[1]?.hex ?? brandbook.colors?.secondary?.[0]?.hex ?? "#6366f1"
  const isDark = luminance(primaryHex) < 0.35

  const allColors = useMemo(() => {
    return [
      ...(brandbook.colors?.primary?.map((c) => c.hex) ?? []),
      ...(brandbook.colors?.secondary?.map((c) => c.hex) ?? []),
    ].filter(Boolean).slice(0, 6)
  }, [brandbook.colors])

  return (
    <div className="min-h-screen" style={{ background: "#fafafa" }}>
      {/* ─── Premium header ─── */}
      <header className="sticky top-0 z-50 backdrop-blur-2xl border-b"
        style={{
          background: "rgba(255,255,255,0.88)",
          borderColor: "rgba(0,0,0,0.05)",
        }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-4">
              {/* Brand color dot */}
              <div className="w-3 h-3 rounded-full shadow-sm" style={{ background: primaryHex }} />
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-gray-900 truncate max-w-[200px]">
                  {brandbook.brandName ?? projectName}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-300 hidden sm:block">
                  Brand Identity
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* Mini color palette */}
              <div className="hidden sm:flex items-center gap-1">
                {allColors.slice(0, 5).map((c, i) => (
                  <div key={i} className="w-4 h-4 rounded-full border border-gray-100" style={{ background: c }} />
                ))}
              </div>
              <div className="h-4 w-px bg-gray-200 hidden sm:block" />
              <span className="text-[10px] font-bold text-gray-300 hidden sm:block">
                {new Date().getFullYear()}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* ─── Content ─── */}
      <main className="max-w-7xl mx-auto py-8 px-3 sm:px-6 lg:px-8">
        <BrandbookViewer
          data={brandbook}
          generatedImages={generatedImages}
        />
      </main>

      {/* ─── Footer ─── */}
      <footer className="border-t" style={{ borderColor: "rgba(0,0,0,0.04)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {/* Brand identity mini */}
              <div className="flex items-center gap-1.5">
                {allColors.slice(0, 4).map((c, i) => (
                  <div key={i} className="w-2.5 h-2.5 rounded-full" style={{ background: c }} />
                ))}
              </div>
              <div className="text-xs text-gray-400">
                <span className="font-semibold text-gray-500">{brandbook.brandName ?? projectName}</span>
                {" "}&mdash; Manual de Identidade Visual
              </div>
            </div>
            <a
              href="/login"
              className="text-xs font-bold transition-colors rounded-lg px-3 py-1.5 border"
              style={{
                color: primaryHex,
                borderColor: `${primaryHex}20`,
                background: `${primaryHex}08`,
              }}
            >
              Criar seu brandbook
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
