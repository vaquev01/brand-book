"use client"

import { signIn, useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"

import { LandingHero, SHOWCASE_BRANDS } from "@/components/landing/LandingHero"
import { LandingShowcase } from "@/components/landing/LandingShowcase"
import { LandingFeatures } from "@/components/landing/LandingFeatures"
import { LandingPricing } from "@/components/landing/LandingPricing"
import { LandingSocialProof } from "@/components/landing/LandingSocialProof"
import { LandingFAQ } from "@/components/landing/LandingFAQ"
import { LandingFooter } from "@/components/landing/LandingFooter"

/* ═══════════════════════════════════════════════════════════════════════════════
   TYPING EFFECT HOOK
   ═══════════════════════════════════════════════════════════════════════════════ */

const TYPING_WORDS = [
  "restaurantes",
  "startups",
  "escritorios",
  "e-commerces",
  "clinicas",
  "agencias",
  "marcas pessoais",
  "cafeterias",
]

function useTypingEffect(words: string[], speed = 70, pause = 2400) {
  const [text, setText] = useState("")
  const [wordIdx, setWordIdx] = useState(0)
  const [charIdx, setCharIdx] = useState(0)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const word = words[wordIdx]
    const timeout = deleting ? speed / 2 : speed

    if (!deleting && charIdx === word.length) {
      const t = setTimeout(() => setDeleting(true), pause)
      return () => clearTimeout(t)
    }
    if (deleting && charIdx === 0) {
      setDeleting(false)
      setWordIdx((i) => (i + 1) % words.length)
      return
    }

    const t = setTimeout(() => {
      setText(word.substring(0, deleting ? charIdx - 1 : charIdx + 1))
      setCharIdx((c) => (deleting ? c - 1 : c + 1))
    }, timeout)
    return () => clearTimeout(t)
  }, [charIdx, deleting, wordIdx, words, speed, pause])

  return text
}

/* ═══════════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════════════════════ */

export function LandingClient() {
  const [loading, setLoading] = useState(false)
  const [activeBrand, setActiveBrand] = useState(0)
  const [scrollY, setScrollY] = useState(0)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const typedWord = useTypingEffect(TYPING_WORDS)
  const { status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "authenticated") router.replace("/dashboard")
  }, [status, router])

  useEffect(() => {
    const i = setInterval(() => setActiveBrand((v) => (v + 1) % SHOWCASE_BRANDS.length), 4000)
    return () => clearInterval(i)
  }, [])

  useEffect(() => {
    function onScroll() {
      setScrollY(window.scrollY)
    }
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  const handleAccess = useCallback(async () => {
    setLoading(true)
    await signIn("credentials", { callbackUrl: "/dashboard" })
  }, [])

  const handlePlanCta = useCallback(
    (href: string) => {
      router.push(href)
    },
    [router]
  )

  const scrollToSection = useCallback((id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" })
  }, [])

  const brand = SHOWCASE_BRANDS[activeBrand]

  if (status === "loading" || status === "authenticated") {
    return (
      <div className="min-h-screen bg-[#07080b] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-12 h-12 rounded-2xl bg-white/[0.06] border border-white/[0.04] flex items-center justify-center"
        >
          <span className="text-sm font-black text-white/40 animate-pulse">B</span>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#07080b] text-white overflow-x-hidden selection:bg-violet-500/20">
      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none" aria-hidden="true">
        <div
          className="absolute top-[-30%] left-[-15%] w-[80vw] h-[80vw] rounded-full opacity-[0.06]"
          style={{
            background: `radial-gradient(circle, ${brand.colors[1]}, transparent 65%)`,
            transition: "background 2s ease",
          }}
        />
        <div
          className="absolute bottom-[-20%] right-[-20%] w-[60vw] h-[60vw] rounded-full opacity-[0.04]"
          style={{
            background: `radial-gradient(circle, ${brand.colors[2]}, transparent 65%)`,
            transition: "background 2s ease",
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
            backgroundSize: "72px 72px",
          }}
        />
      </div>

      {/* NAV */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
        style={{
          background: scrollY > 60 ? "rgba(7,8,11,0.85)" : "transparent",
          backdropFilter: scrollY > 60 ? "blur(20px) saturate(1.4)" : "none",
          borderBottom: scrollY > 60 ? "1px solid rgba(255,255,255,0.04)" : "1px solid transparent",
        }}
      >
        <div className="max-w-[80rem] mx-auto px-6 sm:px-10 lg:px-16 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/[0.07] border border-white/[0.06] flex items-center justify-center">
              <span className="text-sm font-black bg-gradient-to-br from-white to-white/50 bg-clip-text text-transparent">
                B
              </span>
            </div>
            <span className="text-[15px] font-bold tracking-tight text-white/70">brandbook</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <button onClick={() => scrollToSection("showcase")} className="text-[13px] text-white/35 hover:text-white/70 transition-colors">
              Demo
            </button>
            <button onClick={() => scrollToSection("features")} className="text-[13px] text-white/35 hover:text-white/70 transition-colors">
              Features
            </button>
            <button onClick={() => scrollToSection("pricing")} className="text-[13px] text-white/35 hover:text-white/70 transition-colors">
              Precos
            </button>
            <button onClick={() => scrollToSection("faq")} className="text-[13px] text-white/35 hover:text-white/70 transition-colors">
              FAQ
            </button>
          </div>
          <div className="flex items-center gap-5">
            <span className="hidden sm:flex items-center gap-2 text-[11px] text-white/25 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Online
            </span>
            <button
              onClick={handleAccess}
              disabled={loading}
              className="hidden sm:block text-[13px] font-semibold text-white/70 hover:text-white bg-white/[0.06] hover:bg-white/[0.10] border border-white/[0.08] px-5 py-2 rounded-xl transition-all duration-200 disabled:opacity-50"
            >
              {loading ? "Entrando..." : "Entrar"}
            </button>
            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden relative w-10 h-10 flex items-center justify-center rounded-xl border border-white/10 hover:bg-white/5 transition-colors"
              aria-label="Menu"
            >
              <div className="flex flex-col gap-1.5">
                <span className={`block w-5 h-0.5 bg-white/70 transition-all duration-300 ${mobileMenuOpen ? 'rotate-45 translate-y-[4px]' : ''}`} />
                <span className={`block w-5 h-0.5 bg-white/70 transition-all duration-300 ${mobileMenuOpen ? 'opacity-0' : ''}`} />
                <span className={`block w-5 h-0.5 bg-white/70 transition-all duration-300 ${mobileMenuOpen ? '-rotate-45 -translate-y-[4px]' : ''}`} />
              </div>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-x-0 top-[64px] z-[90] md:hidden"
          >
            <div className="mx-4 mt-2 rounded-2xl border border-white/10 bg-black/95 backdrop-blur-2xl shadow-2xl p-6">
              <nav className="flex flex-col gap-4">
                {["Demo", "Features", "Pricing", "FAQ"].map((item) => (
                  <a
                    key={item}
                    href={`#${item.toLowerCase()}`}
                    onClick={(e) => {
                      e.preventDefault()
                      setMobileMenuOpen(false)
                      scrollToSection(
                        item === "Demo" ? "showcase" :
                        item === "Features" ? "features" :
                        item === "Pricing" ? "pricing" :
                        "faq"
                      )
                    }}
                    className="text-sm font-medium text-white/70 hover:text-white transition-colors py-2 border-b border-white/5 last:border-0"
                  >
                    {item === "Pricing" ? "Precos" : item === "Features" ? "Recursos" : item}
                  </a>
                ))}
                <button
                  onClick={() => { setMobileMenuOpen(false); handleAccess(); }}
                  className="mt-2 w-full py-3 rounded-xl text-sm font-semibold text-white transition-all"
                  style={{
                    background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                    boxShadow: "0 12px 24px -8px rgba(99, 102, 241, 0.4)",
                  }}
                >
                  Criar Brandbook Gratis
                </button>
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SECTIONS */}
      <LandingHero
        loading={loading}
        typedWord={typedWord}
        brand={brand}
        activeBrand={activeBrand}
        onAccess={handleAccess}
        onScrollToSection={scrollToSection}
        onSetActiveBrand={setActiveBrand}
      />

      <LandingShowcase />

      <LandingFeatures />

      <LandingPricing onPlanCta={handlePlanCta} />

      <LandingSocialProof />

      <LandingFAQ />

      <LandingFooter loading={loading} onAccess={handleAccess} />
    </div>
  )
}
