"use client"

import { BrandbookViewer } from "@/components/BrandbookViewer"
import type { BrandbookData } from "@/lib/types"
import { useMemo, useState, useEffect } from "react"

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

function hexWithAlpha(hex: string, alpha: number): string {
  const rgb = hexToRgb(hex)
  if (!rgb) return hex
  return `rgba(${rgb.r},${rgb.g},${rgb.b},${alpha})`
}

export function ShareBrandbookClient({ brandbook, generatedImages, projectName }: Props) {
  const [showIntro, setShowIntro] = useState(true)
  const [introPhase, setIntroPhase] = useState(0) // 0=brand, 1=tagline, 2=fade-out

  const primaryHex = brandbook.colors?.primary?.[0]?.hex ?? "#111111"
  const accentHex = brandbook.colors?.primary?.[1]?.hex ?? brandbook.colors?.secondary?.[0]?.hex ?? "#6366f1"
  const isDark = luminance(primaryHex) < 0.35

  const allColors = useMemo(() => {
    return [
      ...(brandbook.colors?.primary?.map((c) => c.hex) ?? []),
      ...(brandbook.colors?.secondary?.map((c) => c.hex) ?? []),
    ].filter(Boolean).slice(0, 6)
  }, [brandbook.colors])

  const brandName = brandbook.brandName ?? projectName
  const tagline = brandbook.verbalIdentity?.tagline ?? brandbook.brandConcept?.mission ?? ""
  const industry = brandbook.industry ?? ""

  // Cinematic intro sequence
  useEffect(() => {
    const t1 = setTimeout(() => setIntroPhase(1), 800)
    const t2 = setTimeout(() => setIntroPhase(2), 2400)
    const t3 = setTimeout(() => setShowIntro(false), 3200)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [])

  return (
    <>
      {/* ─── Cinematic Intro Splash ─── */}
      {showIntro && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center"
          style={{
            background: isDark
              ? `linear-gradient(135deg, ${primaryHex} 0%, #0a0a0a 100%)`
              : `linear-gradient(135deg, ${primaryHex} 0%, #fafafa 100%)`,
            opacity: introPhase === 2 ? 0 : 1,
            transition: "opacity 0.8s cubic-bezier(0.22, 1, 0.36, 1)",
          }}
        >
          {/* Ambient glow */}
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] rounded-full pointer-events-none"
            style={{
              background: `radial-gradient(circle, ${hexWithAlpha(accentHex, 0.15)}, transparent 60%)`,
            }}
          />

          <div className="relative text-center px-6">
            {/* Color strip */}
            <div
              className="flex items-center justify-center gap-2 mb-8"
              style={{
                opacity: introPhase >= 0 ? 1 : 0,
                transform: introPhase >= 0 ? "translateY(0)" : "translateY(10px)",
                transition: "all 0.6s cubic-bezier(0.22, 1, 0.36, 1)",
              }}
            >
              {allColors.slice(0, 5).map((c, i) => (
                <div
                  key={i}
                  className="w-3 h-3 rounded-full"
                  style={{
                    background: c,
                    opacity: introPhase >= 0 ? 1 : 0,
                    transform: introPhase >= 0 ? "scale(1)" : "scale(0)",
                    transition: `all 0.4s cubic-bezier(0.22, 1, 0.36, 1) ${i * 0.08}s`,
                  }}
                />
              ))}
            </div>

            {/* Brand name */}
            <h1
              className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-tight"
              style={{
                color: isDark ? "#ffffff" : primaryHex,
                opacity: introPhase >= 0 ? 1 : 0,
                transform: introPhase >= 0 ? "translateY(0)" : "translateY(20px)",
                transition: "all 0.8s cubic-bezier(0.22, 1, 0.36, 1)",
              }}
            >
              {brandName}
            </h1>

            {/* Tagline */}
            {tagline && (
              <p
                className="mt-4 text-lg sm:text-xl font-medium max-w-md mx-auto"
                style={{
                  color: isDark ? "rgba(255,255,255,0.45)" : hexWithAlpha(primaryHex, 0.4),
                  opacity: introPhase >= 1 ? 1 : 0,
                  transform: introPhase >= 1 ? "translateY(0)" : "translateY(12px)",
                  transition: "all 0.6s cubic-bezier(0.22, 1, 0.36, 1)",
                }}
              >
                {tagline}
              </p>
            )}

            {/* Industry badge */}
            {industry && (
              <div
                className="mt-6"
                style={{
                  opacity: introPhase >= 1 ? 1 : 0,
                  transition: "opacity 0.5s ease 0.2s",
                }}
              >
                <span
                  className="text-[10px] font-bold uppercase tracking-[0.2em] px-3 py-1.5 rounded-full border"
                  style={{
                    color: isDark ? "rgba(255,255,255,0.3)" : hexWithAlpha(primaryHex, 0.3),
                    borderColor: isDark ? "rgba(255,255,255,0.08)" : hexWithAlpha(primaryHex, 0.1),
                  }}
                >
                  {industry}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── Main Immersive Experience ─── */}
      <div
        className="min-h-screen"
        style={{
          background: "#fafafa",
          opacity: showIntro ? 0 : 1,
          transition: "opacity 0.5s ease",
        }}
      >
        {/* ─── Ambient brand glow (top of page) ─── */}
        <div className="pointer-events-none" aria-hidden="true">
          <div
            className="absolute top-0 left-0 right-0 h-[50vh]"
            style={{
              background: `linear-gradient(180deg, ${hexWithAlpha(primaryHex, 0.04)} 0%, transparent 100%)`,
            }}
          />
          <div
            className="absolute top-0 right-0 w-[40vw] h-[40vw] rounded-full opacity-[0.03]"
            style={{
              background: `radial-gradient(circle, ${accentHex}, transparent 60%)`,
            }}
          />
        </div>

        {/* ─── Premium header ─── */}
        <header
          className="sticky top-0 z-50 backdrop-blur-2xl border-b"
          style={{
            background: "rgba(255,255,255,0.90)",
            borderColor: "rgba(0,0,0,0.04)",
          }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-4">
                {/* Brand color dot with pulse */}
                <div className="relative">
                  <div className="w-3.5 h-3.5 rounded-full shadow-sm" style={{ background: primaryHex }} />
                  <div
                    className="absolute inset-0 rounded-full animate-ping"
                    style={{ background: primaryHex, opacity: 0.15 }}
                  />
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[15px] font-bold text-gray-900 truncate max-w-[200px]">
                    {brandName}
                  </span>
                  <div className="hidden sm:block h-4 w-px bg-gray-200" />
                  <span className="hidden sm:block text-[10px] font-bold uppercase tracking-[0.15em] text-gray-300">
                    Brand Identity
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                {/* Color palette strip */}
                <div className="hidden sm:flex items-center gap-1.5">
                  {allColors.slice(0, 5).map((c, i) => (
                    <div
                      key={i}
                      className="w-5 h-5 rounded-full border-2 border-white shadow-sm transition-transform duration-200 hover:scale-110"
                      style={{ background: c }}
                      title={c}
                    />
                  ))}
                </div>
                <div className="hidden sm:block h-5 w-px bg-gray-100" />
                <span className="text-[10px] font-bold text-gray-300 tabular-nums hidden sm:block">
                  {new Date().getFullYear()}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* ─── Brand Hero Section ─── */}
        <div
          className="relative overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${primaryHex} 0%, ${hexWithAlpha(primaryHex, 0.85)} 50%, ${accentHex} 100%)`,
          }}
        >
          {/* Subtle texture overlay */}
          <div className="absolute inset-0 opacity-[0.04]" style={{
            backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)",
            backgroundSize: "24px 24px",
          }} />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 relative">
            <div className="text-center">
              {/* Color dots */}
              <div className="flex items-center justify-center gap-2 mb-6">
                {allColors.slice(0, 5).map((c, i) => (
                  <div key={i} className="w-2.5 h-2.5 rounded-full border border-white/20" style={{ background: c }} />
                ))}
              </div>

              <h1
                className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight mb-4"
                style={{ color: isDark ? "#ffffff" : "#ffffff" }}
              >
                {brandName}
              </h1>

              {tagline && (
                <p className="text-base sm:text-lg font-medium max-w-lg mx-auto mb-6" style={{ color: "rgba(255,255,255,0.55)" }}>
                  {tagline}
                </p>
              )}

              <div className="flex items-center justify-center gap-3">
                {industry && (
                  <span
                    className="text-[10px] font-bold uppercase tracking-[0.2em] px-3 py-1.5 rounded-full border border-white/15"
                    style={{ color: "rgba(255,255,255,0.5)" }}
                  >
                    {industry}
                  </span>
                )}
                <span
                  className="text-[10px] font-bold uppercase tracking-[0.2em] px-3 py-1.5 rounded-full border border-white/15"
                  style={{ color: "rgba(255,255,255,0.5)" }}
                >
                  Manual de Identidade
                </span>
              </div>
            </div>
          </div>

          {/* Bottom gradient fade into content */}
          <div className="h-16 bg-gradient-to-b from-transparent to-[#fafafa]" />
        </div>

        {/* ─── Content ─── */}
        <main className="max-w-7xl mx-auto py-8 px-3 sm:px-6 lg:px-8 relative">
          <BrandbookViewer
            data={brandbook}
            generatedImages={generatedImages}
          />
        </main>

        {/* ─── Premium Footer ─── */}
        <footer className="relative overflow-hidden" style={{ background: primaryHex }}>
          {/* Texture */}
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)",
            backgroundSize: "20px 20px",
          }} />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 relative">
            <div className="flex flex-col items-center text-center">
              {/* Color strip */}
              <div className="flex items-center gap-1.5 mb-6">
                {allColors.slice(0, 5).map((c, i) => (
                  <div key={i} className="w-3 h-3 rounded-full border border-white/10" style={{ background: c }} />
                ))}
              </div>

              <h3
                className="text-2xl sm:text-3xl font-black tracking-tight mb-2"
                style={{ color: isDark ? "#ffffff" : "rgba(255,255,255,0.95)" }}
              >
                {brandName}
              </h3>

              {tagline && (
                <p className="text-sm mb-6" style={{ color: "rgba(255,255,255,0.35)" }}>
                  {tagline}
                </p>
              )}

              <div className="w-12 h-px bg-white/10 mb-6" />

              <p className="text-[11px] mb-6" style={{ color: "rgba(255,255,255,0.2)" }}>
                Manual de Identidade Visual &middot; {new Date().getFullYear()}
              </p>

              <a
                href="/login"
                className="inline-flex items-center gap-2 text-[12px] font-bold px-5 py-2.5 rounded-xl border transition-all duration-200 hover:-translate-y-0.5"
                style={{
                  color: "rgba(255,255,255,0.6)",
                  borderColor: "rgba(255,255,255,0.12)",
                  background: "rgba(255,255,255,0.05)",
                }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/>
                </svg>
                Criar seu brandbook com IA
              </a>
            </div>
          </div>
        </footer>
      </div>
    </>
  )
}
