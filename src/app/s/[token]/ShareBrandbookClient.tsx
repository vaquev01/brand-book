"use client"

import { BrandbookViewer } from "@/components/BrandbookViewer"
import { ClientPortal } from "@/components/ClientPortal"
import { FontLoader } from "@/components/FontLoader"
import type { BrandbookData } from "@/lib/types"
import { useMemo, useState, useEffect, useRef } from "react"
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion"

const SECTION_IDS = [
  "dna", "brand-story", "positioning", "personas", "verbal-identity",
  "logo", "logo-variants", "colors", "typography", "typography-scale",
  "key-visual", "mascots", "applications", "social-media",
  "tokens-a11y", "ui-guidelines", "ux-microcopy-motion",
  "brand-world", "brand-health", "governance", "asset-pack",
  "production-guidelines",
]

const SECTION_LABELS: Record<string, string> = {
  "dna": "DNA da Marca",
  "brand-story": "Brand Story",
  "positioning": "Posicionamento",
  "personas": "Personas",
  "verbal-identity": "Identidade Verbal",
  "logo": "Logo",
  "logo-variants": "Variantes do Logo",
  "colors": "Paleta de Cores",
  "typography": "Tipografia",
  "typography-scale": "Escala Tipográfica",
  "key-visual": "Key Visual",
  "mascots": "Mascotes",
  "applications": "Aplicações",
  "social-media": "Social Media",
  "tokens-a11y": "Tokens & Acessibilidade",
  "ui-guidelines": "Guidelines de UI",
  "ux-microcopy-motion": "UX, Microcopy & Motion",
  "brand-world": "Brand World",
  "brand-health": "Brand Health",
  "governance": "Governança",
  "asset-pack": "Pack de Assets",
  "production-guidelines": "Guidelines de Produção",
}

interface Props {
  brandbook: BrandbookData
  generatedImages: Record<string, string>
  projectName: string
  shareToken?: string
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

export function ShareBrandbookClient({ brandbook, generatedImages, projectName, shareToken }: Props) {
  const [showIntro, setShowIntro] = useState(true)
  const [scrolled, setScrolled] = useState(false)

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

  // Scroll-linked parallax for hero section
  const heroRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  })
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 150])
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0])
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 1.05])
  const textureY = useTransform(scrollYProgress, [0, 1], [0, -50])

  // Progressive header reveal on scroll
  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 80)
    }
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <>
      {/* ─── Cinematic Intro Splash ─── */}
      <AnimatePresence>
        {showIntro && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center"
            style={{
              background: isDark
                ? `linear-gradient(135deg, ${primaryHex} 0%, #0a0a0a 100%)`
                : `linear-gradient(135deg, ${primaryHex} 0%, #fafafa 100%)`,
            }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            onAnimationComplete={(definition) => {
              // When exit animation completes, hide the intro
              if (definition && typeof definition === "object" && "opacity" in definition && definition.opacity === 0) {
                setShowIntro(false)
              }
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
              {/* Phase 0: Color palette dots — spring bounce, staggered 80ms */}
              <div className="flex items-center justify-center gap-2 mb-8">
                {allColors.slice(0, 5).map((c, i) => (
                  <motion.div
                    key={i}
                    className="w-3 h-3 rounded-full"
                    style={{ background: c }}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{
                      type: "spring",
                      stiffness: 400,
                      damping: 15,
                      delay: i * 0.08,
                    }}
                  />
                ))}
              </div>

              {/* Phase 1: Brand name — spring entrance from translateY(30) */}
              <motion.h1
                className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-tight"
                style={{ color: isDark ? "#ffffff" : primaryHex }}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 200,
                  damping: 20,
                  delay: 0.4,
                }}
              >
                {brandName}
              </motion.h1>

              {/* Phase 2: Tagline — softer spring from below */}
              {tagline && (
                <motion.p
                  className="mt-4 text-lg sm:text-xl font-medium max-w-md mx-auto"
                  style={{
                    color: isDark ? "rgba(255,255,255,0.45)" : hexWithAlpha(primaryHex, 0.4),
                  }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    type: "spring",
                    stiffness: 120,
                    damping: 20,
                    delay: 1.0,
                  }}
                >
                  {tagline}
                </motion.p>
              )}

              {/* Phase 3: Industry badge — fade in before exit */}
              {industry && (
                <motion.div
                  className="mt-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 2.2 }}
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
                </motion.div>
              )}
            </div>

            {/* Trigger the exit after Phase 3 completes */}
            <IntroTimer onComplete={() => setShowIntro(false)} />
          </motion.div>
        )}
      </AnimatePresence>

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

        {/* ─── Premium header with progressive reveal ─── */}
        <header
          className="sticky top-0 z-50 backdrop-blur-2xl border-b"
          style={{
            background: scrolled ? "rgba(255,255,255,0.90)" : "transparent",
            borderColor: scrolled ? "rgba(0,0,0,0.04)" : "transparent",
            transition: "background 0.4s ease, border-color 0.4s ease",
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
          ref={heroRef}
          className="relative overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${primaryHex} 0%, ${hexWithAlpha(primaryHex, 0.85)} 50%, ${accentHex} 100%)`,
          }}
        >
          {/* Subtle texture overlay */}
          <motion.div className="absolute inset-0 opacity-[0.04]" style={{
            backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)",
            backgroundSize: "24px 24px",
            y: textureY,
          }} />

          <motion.div
            className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 relative"
            style={{ y: heroY, opacity: heroOpacity, scale: heroScale }}
          >
            <div className="text-center">
              <h1
                className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight mb-4"
                style={{ color: "#ffffff" }}
              >
                {brandName}
              </h1>

              {tagline && (
                <p className="text-base sm:text-lg font-medium max-w-lg mx-auto mb-6" style={{ color: "rgba(255,255,255,0.55)" }}>
                  {tagline}
                </p>
              )}

              <span
                className="text-[10px] font-bold uppercase tracking-[0.2em] px-3 py-1.5 rounded-full border border-white/15"
                style={{ color: "rgba(255,255,255,0.5)" }}
              >
                Manual de Identidade{industry ? ` · ${industry}` : ""}
              </span>
            </div>
          </motion.div>

          {/* Scroll indicator */}
          <motion.div
            className="absolute bottom-20 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            <span className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: "rgba(255,255,255,0.3)" }}>
              Scroll to explore
            </span>
            <motion.svg
              width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
              style={{ color: "rgba(255,255,255,0.3)" }}
              animate={{ y: [0, 6, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <path d="M6 9l6 6 6-6" />
            </motion.svg>
          </motion.div>

          {/* Bottom gradient fade into content */}
          <div className="h-16 bg-gradient-to-b from-transparent to-[#fafafa]" />
        </div>

        {/* ─── Content with section reveal animation ─── */}
        <motion.main
          className="max-w-7xl mx-auto py-8 px-3 sm:px-6 lg:px-8 relative"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        >
          <FontLoader data={brandbook} />
          <BrandbookViewer
            data={brandbook}
            generatedImages={generatedImages}
            shareToken={shareToken}
          />
        </motion.main>

        {/* ─── Client Review Portal ─── */}
        {shareToken && (
          <ClientPortal
            shareToken={shareToken}
            sections={SECTION_IDS}
            sectionLabels={SECTION_LABELS}
          />
        )}

        {/* Powered by attribution */}
        <div className="text-center py-4 border-t" style={{ borderColor: "rgba(0,0,0,0.04)" }}>
          <a
            href="/"
            className="inline-flex items-center gap-1.5 text-[11px] font-medium transition-opacity hover:opacity-80"
            style={{ color: "rgba(0,0,0,0.25)" }}
            target="_blank"
            rel="noopener"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/>
            </svg>
            Criado com Brandbook
          </a>
        </div>

        {/* ─── Premium Footer ─── */}
        <footer className="relative overflow-hidden" style={{ background: primaryHex }}>
          {/* Texture */}
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)",
            backgroundSize: "20px 20px",
          }} />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative">
            <div className="flex flex-col items-center text-center">
              <p className="text-[11px] font-bold uppercase tracking-[0.15em] mb-4" style={{ color: "rgba(255,255,255,0.25)" }}>
                {brandName} &middot; {new Date().getFullYear()}
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

/** Small helper component that triggers intro exit after the full sequence plays */
function IntroTimer({ onComplete }: { onComplete: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onComplete, 3500) // Phase 3 ends ~3.5s
    return () => clearTimeout(timer)
  }, [onComplete])
  return null
}
