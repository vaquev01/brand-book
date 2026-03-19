"use client"

import { motion, AnimatePresence } from "framer-motion"
import {
  ChevronDown,
  ChevronRight,
  ArrowRight,
  Zap,
  Layers,
  Download,
} from "lucide-react"

const SHOWCASE_BRANDS = [
  {
    name: "Kairo",
    industry: "Fintech",
    tagline: "O futuro das financas",
    colors: ["#0f172a", "#6366f1", "#a5b4fc", "#f1f5f9"],
    typography: "DM Sans",
    sections: ["DNA & Estrategia", "Paleta de Cores", "Tipografia", "Logo System", "Social Media"],
  },
  {
    name: "Soleil",
    industry: "Cosmeticos",
    tagline: "Beleza consciente",
    colors: ["#78350f", "#f59e0b", "#fbbf24", "#fffbeb"],
    typography: "Playfair Display",
    sections: ["Essencia da Marca", "Visual Identity", "Verbal", "Aplicacoes", "Packaging"],
  },
  {
    name: "Vertex",
    industry: "Tech",
    tagline: "Engenharia de ponta",
    colors: ["#0c0a09", "#ef4444", "#fca5a5", "#fef2f2"],
    typography: "Space Grotesk",
    sections: ["Manifesto", "Color System", "Typography", "Iconography", "UI Kit"],
  },
  {
    name: "Flora",
    industry: "Wellness",
    tagline: "Natureza que cuida",
    colors: ["#14532d", "#22c55e", "#86efac", "#f0fdf4"],
    typography: "Lora",
    sections: ["Brand DNA", "Cores & Natureza", "Tipo & Voz", "Logo Variations", "Print Design"],
  },
]

export { SHOWCASE_BRANDS }

interface Props {
  loading: boolean
  typedWord: string
  brand: typeof SHOWCASE_BRANDS[0]
  activeBrand: number
  onAccess: () => void
  onScrollToSection: (id: string) => void
  onSetActiveBrand: (i: number) => void
}

export function LandingHero({
  loading,
  typedWord,
  brand,
  activeBrand,
  onAccess,
  onScrollToSection,
  onSetActiveBrand,
}: Props) {
  return (
    <section className="relative z-10 px-6 sm:px-10 lg:px-16 pt-32 sm:pt-40 lg:pt-48 pb-16 sm:pb-20">
      <div className="max-w-[80rem] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-14 lg:gap-20 items-center">
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}>
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2.5 rounded-full border border-white/[0.06] bg-white/[0.03] px-4 py-2 mb-10"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/35">
                AI Brand Studio
              </span>
            </motion.div>

            {/* Headline */}
            <h1 className="text-[clamp(2.2rem,5vw,4.5rem)] font-black leading-[0.95] tracking-[-0.04em] mb-7">
              <span className="block text-white">Manuais de marca que</span>
              <span className="block bg-gradient-to-r from-violet-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
                parecem feitos por uma
              </span>
              <span className="block text-white/90">
                agencia de R$50mil
              </span>
              <span className="block mt-3 text-[clamp(1.4rem,2.8vw,2.4rem)] font-bold text-white/20">
                Para{" "}
                <span className="bg-gradient-to-r from-white via-white/90 to-white/50 bg-clip-text text-transparent">
                  {typedWord}
                  <span className="inline-block w-[2px] h-[0.75em] bg-white/40 ml-0.5 animate-pulse align-middle" />
                </span>
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-[17px] text-white/35 max-w-xl leading-[1.75] mb-10">
              IA com sensibilidade estetica gera brandbooks completos em minutos — do DNA
              estrategico aos assets prontos para uso.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-start gap-4 mb-8">
              <button
                onClick={onAccess}
                disabled={loading}
                className="group relative flex items-center gap-3 bg-white text-[#07080b] px-8 py-[18px] rounded-2xl font-bold text-[15px] transition-all duration-300 hover:shadow-[0_24px_80px_rgba(99,102,241,0.25)] hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-50 disabled:cursor-wait"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeDasharray="32"
                        strokeLinecap="round"
                      />
                    </svg>
                    Entrando...
                  </>
                ) : (
                  <>
                    Criar Brandbook Gratis
                    <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
                  </>
                )}
              </button>
              <button
                onClick={() => onScrollToSection("showcase")}
                className="flex items-center gap-2 text-[14px] font-semibold text-white/80 hover:text-white px-6 py-[18px] rounded-2xl border border-white/20 hover:border-white/30 bg-white/10 hover:bg-white/15 transition-all duration-300"
              >
                Ver Demo
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>

            {/* Trust badges */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex flex-wrap items-center gap-4 text-[12px] text-white/20"
            >
              <span className="flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-violet-400/60" />6 motores de IA
              </span>
              <span className="w-1 h-1 rounded-full bg-white/10" />
              <span className="flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-indigo-400/60" />
                24 secoes
              </span>
              <span className="w-1 h-1 rounded-full bg-white/10" />
              <span className="flex items-center gap-1.5">
                <Download className="w-3.5 h-3.5 text-purple-400/60" />
                Exporta PDF & Tokens
              </span>
            </motion.div>
          </motion.div>

          {/* Brand Preview Card */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="relative hidden lg:block"
          >
            <div
              className="absolute -inset-12 rounded-[2rem] opacity-15 blur-3xl transition-all duration-[2s]"
              style={{ background: brand.colors[1] }}
            />
            <div className="relative rounded-[1.5rem] border border-white/[0.07] bg-white/[0.025] backdrop-blur-2xl overflow-hidden shadow-2xl">
              <div className="px-7 pt-7 pb-5 border-b border-white/[0.05]">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-3.5 h-3.5 rounded-full transition-all duration-700"
                      style={{ background: brand.colors[1] }}
                    />
                    <span className="text-[11px] font-bold text-white/40">Brand Preview</span>
                  </div>
                  <span className="text-[10px] text-white/15 font-mono tracking-wider">
                    {brand.industry}
                  </span>
                </div>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={brand.name}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.4 }}
                  >
                    <h3 className="text-4xl font-black tracking-tight text-white">{brand.name}</h3>
                    <p className="text-sm text-white/25 mt-1.5">{brand.tagline}</p>
                    <p className="text-[11px] text-white/15 mt-2 font-mono">{brand.typography}</p>
                  </motion.div>
                </AnimatePresence>
              </div>
              <div className="flex">
                {brand.colors.map((c, i) => (
                  <motion.div
                    key={`${brand.name}-${i}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex-1 h-14 transition-all duration-700"
                    style={{ background: c }}
                  />
                ))}
              </div>
              <div className="p-7 space-y-1">
                {brand.sections.map((s, i) => (
                  <div key={s} className="flex items-center gap-3 py-2.5 border-b border-white/[0.03] last:border-0">
                    <span className="text-[10px] font-bold text-white/10 tabular-nums w-6">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="text-[13px] text-white/35 font-medium">{s}</span>
                    <div className="ml-auto w-10 h-1 rounded-full bg-white/[0.05] overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-1000"
                        style={{
                          width: `${65 + i * 7}%`,
                          background: brand.colors[1],
                          opacity: 0.4,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="px-7 pb-6 flex items-center justify-center gap-2">
                {SHOWCASE_BRANDS.map((b, i) => (
                  <button
                    key={b.name}
                    onClick={() => onSetActiveBrand(i)}
                    className={`rounded-full transition-all duration-300 ${
                      i === activeBrand ? "w-7 h-2.5" : "w-2.5 h-2.5 opacity-25 hover:opacity-50"
                    }`}
                    style={{ background: b.colors[1] }}
                    aria-label={`Ver marca ${b.name}`}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
