"use client"

import { signIn, useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useState, useEffect, useRef, useCallback } from "react"
import { motion, AnimatePresence, useInView } from "framer-motion"
import {
  Sparkles,
  Eye,
  BookOpen,
  LayoutGrid,
  Monitor,
  Download,
  Layers,
  ChevronDown,
  ChevronRight,
  ArrowRight,
  Check,
  X,
  Star,
  Zap,
  MessageSquare,
  Send,
} from "lucide-react"

/* ═══════════════════════════════════════════════════════════════════════════════
   CONSTANTS
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

const FEATURES = [
  {
    title: "Art Director IA",
    desc: "Cada decisao visual fundamentada em semiotica e estrategia de marca.",
    icon: Sparkles,
    accent: "#6366f1",
  },
  {
    title: "Imersao Total",
    desc: "O brandbook se veste da marca — cores, tipografia e voz propria.",
    icon: Eye,
    accent: "#f59e0b",
  },
  {
    title: "24 Secoes Completas",
    desc: "DNA, personas, verbal, logo, cores, tipo, aplicacoes e social media.",
    icon: BookOpen,
    accent: "#22c55e",
  },
  {
    title: "6 Motores de IA",
    desc: "GPT-4o, Gemini, DALL-E 3, Stability, Ideogram e Imagen 3.",
    icon: LayoutGrid,
    accent: "#3b82f6",
  },
  {
    title: "Apresentacao Cinematic",
    desc: "Fullscreen com transicoes e ambientacao. Um keynote para o cliente.",
    icon: Monitor,
    accent: "#ef4444",
  },
  {
    title: "Exportacao Pro",
    desc: "PDF, Design Tokens (CSS/W3C/Tailwind) e link publico.",
    icon: Download,
    accent: "#a855f7",
  },
]

const PLANS = [
  {
    id: "free",
    name: "Free",
    price: "R$ 0",
    period: "/mes",
    description: "Para projetos pessoais",
    badge: null,
    highlighted: false,
    features: [
      { label: "1 projeto", included: true },
      { label: "3 geracoes por dia", included: true },
      { label: "Export PDF", included: true },
      { label: "PDF sem marca d'agua", included: false },
      { label: "Design Tokens", included: false },
      { label: "Analise de saude", included: false },
      { label: "Suporte comunidade", included: true },
    ],
    cta: "Comecar gratis",
    href: "/login",
  },
  {
    id: "pro",
    name: "Pro",
    price: "R$ 49",
    period: "/mes",
    description: "Para designers e freelancers",
    badge: "Mais popular",
    highlighted: true,
    features: [
      { label: "5 projetos", included: true },
      { label: "25 geracoes por dia", included: true },
      { label: "Export PDF", included: true },
      { label: "PDF sem marca d'agua", included: true },
      { label: "Design Tokens", included: true },
      { label: "Analise de saude", included: true },
      { label: "Suporte prioritario", included: true },
    ],
    cta: "Assinar Pro",
    href: "/login?plan=pro",
  },
  {
    id: "team",
    name: "Team",
    price: "R$ 149",
    period: "/mes",
    description: "Para equipes de branding",
    badge: null,
    highlighted: false,
    features: [
      { label: "20 projetos", included: true },
      { label: "100 geracoes por dia", included: true },
      { label: "Tudo do Pro", included: true },
      { label: "Colaboracao em equipe", included: true },
      { label: "Dominio personalizado", included: true },
      { label: "Webhooks", included: true },
      { label: "Suporte prioritario", included: true },
    ],
    cta: "Assinar Team",
    href: "/login?plan=team",
  },
  {
    id: "agency",
    name: "Agency",
    price: "R$ 399",
    period: "/mes",
    description: "Para agencias com multiplos clientes",
    badge: null,
    highlighted: false,
    features: [
      { label: "Projetos ilimitados", included: true },
      { label: "Geracoes ilimitadas", included: true },
      { label: "Tudo do Team", included: true },
      { label: "Acesso a API", included: true },
      { label: "White-label", included: true },
      { label: "Export ZIP em massa", included: true },
      { label: "Suporte dedicado", included: true },
    ],
    cta: "Assinar Agency",
    href: "/login?plan=agency",
  },
]

const TESTIMONIALS = [
  {
    name: "Marina Oliveira",
    role: "Diretora Criativa, Studio Nomo",
    text: "Fiz o brandbook de um cliente em 10 minutos e ele achou que foi uma equipe de 3 designers. Ja usei em 12 projetos.",
    avatar: "MO",
    rating: 5,
  },
  {
    name: "Rafael Costa",
    role: "Founder, Vertex Labs",
    text: "Precisava de uma identidade visual para o lancamento. Em vez de esperar 3 semanas de uma agencia, tive tudo pronto na mesma tarde.",
    avatar: "RC",
    rating: 5,
  },
  {
    name: "Camila Andrade",
    role: "Brand Strategist, Ogilvy",
    text: "Uso como ponto de partida para projetos grandes. A qualidade estrategica do DNA e surpreendente para algo gerado por IA.",
    avatar: "CA",
    rating: 5,
  },
]

const FAQ_ITEMS = [
  {
    q: "Quanto tempo leva para gerar um brandbook completo?",
    a: "Entre 2 a 5 minutos, dependendo da complexidade. O briefing inteligente guia voce em menos de 1 minuto, e a IA faz o resto.",
  },
  {
    q: "Posso editar o brandbook depois de gerado?",
    a: "Sim! Todas as secoes sao editaveis inline. Voce pode ajustar textos, trocar cores, modificar tipografia e regenerar secoes individuais.",
  },
  {
    q: "Quais IAs sao usadas na geracao?",
    a: "Usamos 6 motores especializados: GPT-4o para estrategia e verbal, Gemini para analise, DALL-E 3 e Stability AI para imagens, Ideogram para logos, e Imagen 3 para aplicacoes.",
  },
  {
    q: "O resultado parece generico ou e unico para cada marca?",
    a: "Cada brandbook e unico. A IA analisa o briefing, setor, publico-alvo e posicionamento para criar uma identidade visual coerente e original.",
  },
  {
    q: "Posso exportar para usar em outros softwares?",
    a: "Sim. Exportamos PDF profissional, Design Tokens em CSS/JSON/Tailwind (compativel com Figma e qualquer framework), e link de compartilhamento.",
  },
  {
    q: "Preciso saber design para usar?",
    a: "Nao. O briefing inteligente faz perguntas simples sobre seu negocio. A IA cuida de todas as decisoes de design com fundamento tecnico.",
  },
  {
    q: "Posso cancelar a assinatura quando quiser?",
    a: "Sim, todos os planos sao mensais sem fidelidade. Cancele quando quiser e seus brandbooks continuam acessiveis.",
  },
  {
    q: "Meus dados e marcas ficam seguros?",
    a: "Sim. Usamos criptografia em transito e em repouso. Seus brandbooks sao privados por padrao e so voce decide se compartilha.",
  },
]

/* ═══════════════════════════════════════════════════════════════════════════════
   HOOKS
   ═══════════════════════════════════════════════════════════════════════════════ */

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

function useCountUp(end: number, duration = 2000, startOnView = true) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const hasStarted = useRef(false)

  useEffect(() => {
    if (!startOnView) return
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasStarted.current) {
          hasStarted.current = true
          const startTime = Date.now()
          const animate = () => {
            const elapsed = Date.now() - startTime
            const progress = Math.min(elapsed / duration, 1)
            const eased = 1 - Math.pow(1 - progress, 3)
            setCount(Math.floor(eased * end))
            if (progress < 1) requestAnimationFrame(animate)
          }
          requestAnimationFrame(animate)
        }
      },
      { threshold: 0.3 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [end, duration, startOnView])

  return { count, ref }
}

/* ═══════════════════════════════════════════════════════════════════════════════
   ANIMATION VARIANTS
   ═══════════════════════════════════════════════════════════════════════════════ */

// Framer Motion Variants — typed as Record to satisfy strict variant checking
const fadeInUp: Record<string, unknown> = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
}

const fadeIn: Record<string, unknown> = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5 } },
}

const staggerContainer: Record<string, unknown> = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
}

const scaleIn: Record<string, unknown> = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
}

/* ═══════════════════════════════════════════════════════════════════════════════
   SUB-COMPONENTS
   ═══════════════════════════════════════════════════════════════════════════════ */

function SectionWrapper({
  children,
  className = "",
  id,
}: {
  children: React.ReactNode
  className?: string
  id?: string
}) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-80px" })

  return (
    <motion.section
      ref={ref}
      id={id}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={staggerContainer}
      className={`relative z-10 px-6 sm:px-10 lg:px-16 ${className}`}
    >
      {children}
    </motion.section>
  )
}

function GlassCard({
  children,
  className = "",
  hoverGlow,
}: {
  children: React.ReactNode
  className?: string
  hoverGlow?: string
}) {
  return (
    <motion.div
      variants={fadeInUp}
      className={`group relative rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-xl overflow-hidden transition-all duration-500 hover:border-white/[0.12] hover:bg-white/[0.04] ${className}`}
      style={
        hoverGlow
          ? {
              background: `linear-gradient(135deg, ${hoverGlow}08, transparent 60%)`,
            }
          : undefined
      }
    >
      {/* Gradient border effect */}
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background: `linear-gradient(135deg, ${hoverGlow || "#6366f1"}15, transparent 50%)`,
        }}
      />
      <div className="relative z-10">{children}</div>
    </motion.div>
  )
}

function FAQItem({ item, isOpen, onClick }: { item: typeof FAQ_ITEMS[0]; isOpen: boolean; onClick: () => void }) {
  return (
    <motion.div variants={fadeInUp} className="border-b border-white/[0.05] last:border-0">
      <button
        onClick={onClick}
        className="w-full flex items-center justify-between py-5 text-left group"
      >
        <span className="text-[15px] font-semibold text-white/80 group-hover:text-white transition-colors pr-8">
          {item.q}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
          className="shrink-0"
        >
          <ChevronDown className="w-5 h-5 text-white/30" />
        </motion.div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <p className="text-[14px] text-white/40 leading-[1.8] pb-5">{item.a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════════════════════ */

export function LandingClient() {
  const [loading, setLoading] = useState(false)
  const [activeBrand, setActiveBrand] = useState(0)
  const [expandedBrand, setExpandedBrand] = useState<number | null>(null)
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [scrollY, setScrollY] = useState(0)
  const typedWord = useTypingEffect(TYPING_WORDS)
  const { status } = useSession()
  const router = useRouter()

  const brandsCreated = useCountUp(2847, 2500)
  const sectionsGenerated = useCountUp(68328, 2500)
  const hoursShaved = useCountUp(14200, 2500)

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
      {/* ─── Ambient background ─── */}
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

      {/* ═══════════════════════════════════════════════════════════════
          NAV
          ═══════════════════════════════════════════════════════════════ */}
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
              className="text-[13px] font-semibold text-white/70 hover:text-white bg-white/[0.06] hover:bg-white/[0.10] border border-white/[0.08] px-5 py-2 rounded-xl transition-all duration-200 disabled:opacity-50"
            >
              {loading ? "Entrando..." : "Entrar"}
            </button>
          </div>
        </div>
      </nav>

      {/* ═══════════════════════════════════════════════════════════════
          HERO
          ═══════════════════════════════════════════════════════════════ */}
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
                  onClick={handleAccess}
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
                  onClick={() => scrollToSection("showcase")}
                  className="flex items-center gap-2 text-[14px] font-semibold text-white/40 hover:text-white/70 px-6 py-[18px] rounded-2xl border border-white/[0.06] hover:border-white/[0.12] bg-white/[0.02] hover:bg-white/[0.04] transition-all duration-300"
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
                      onClick={() => setActiveBrand(i)}
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

      {/* ═══════════════════════════════════════════════════════════════
          SHOWCASE / DEMO
          ═══════════════════════════════════════════════════════════════ */}
      <SectionWrapper id="showcase" className="py-20 sm:py-28">
        <div className="max-w-[80rem] mx-auto">
          <motion.div variants={fadeInUp} className="mb-14 text-center">
            <h2 className="text-3xl sm:text-4xl font-black text-white/90 tracking-tight mb-4">
              Veja o que a IA cria
            </h2>
            <p className="text-[15px] text-white/30 max-w-lg mx-auto">
              Cada brandbook e unico. Clique em uma marca para explorar as secoes geradas.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {SHOWCASE_BRANDS.map((b, i) => (
              <GlassCard key={b.name} hoverGlow={b.colors[1]} className="cursor-pointer">
                <button
                  onClick={() => setExpandedBrand(expandedBrand === i ? null : i)}
                  className="w-full text-left p-6"
                >
                  {/* Color strip */}
                  <div className="flex rounded-lg overflow-hidden mb-5 h-3">
                    {b.colors.map((c, ci) => (
                      <div key={ci} className="flex-1" style={{ background: c }} />
                    ))}
                  </div>

                  {/* Brand info */}
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-bold text-white/90">{b.name}</h3>
                      <p className="text-[11px] text-white/25 uppercase tracking-wider font-semibold">
                        {b.industry}
                      </p>
                    </div>
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: `${b.colors[1]}20` }}
                    >
                      <motion.div animate={{ rotate: expandedBrand === i ? 90 : 0 }} transition={{ duration: 0.2 }}>
                        <ChevronRight className="w-4 h-4" style={{ color: b.colors[1] }} />
                      </motion.div>
                    </div>
                  </div>

                  <p className="text-[13px] text-white/30 mb-3">{b.tagline}</p>
                  <p className="text-[11px] text-white/15 font-mono">{b.typography}</p>

                  {/* Expanded sections */}
                  <AnimatePresence>
                    {expandedBrand === i && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="pt-4 mt-4 border-t border-white/[0.06] space-y-2">
                          {b.sections.map((s, si) => (
                            <div key={s} className="flex items-center gap-2">
                              <div
                                className="w-1.5 h-1.5 rounded-full"
                                style={{ background: b.colors[1], opacity: 0.6 }}
                              />
                              <span className="text-[12px] text-white/40">{s}</span>
                            </div>
                          ))}
                          <div className="pt-2">
                            <span className="text-[11px] font-semibold" style={{ color: b.colors[1] }}>
                              + 19 secoes
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </button>
              </GlassCard>
            ))}
          </div>
        </div>
      </SectionWrapper>

      {/* ═══════════════════════════════════════════════════════════════
          HOW IT WORKS
          ═══════════════════════════════════════════════════════════════ */}
      <SectionWrapper id="how-it-works" className="pb-20 sm:pb-28">
        <div className="max-w-[80rem] mx-auto">
          <motion.div
            variants={fadeInUp}
            className="rounded-[1.5rem] border border-white/[0.05] bg-white/[0.015] overflow-hidden"
          >
            <div className="p-8 sm:p-14">
              <motion.h2 variants={fadeInUp} className="text-3xl sm:text-4xl font-black text-white/90 tracking-tight mb-4">
                Como funciona
              </motion.h2>
              <motion.p variants={fadeInUp} className="text-[15px] text-white/30 mb-14 max-w-lg">
                3 passos simples para um resultado de agencia profissional.
              </motion.p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 sm:gap-8 relative">
                {/* Connecting line (desktop) */}
                <div className="hidden sm:block absolute top-12 left-[20%] right-[20%] h-[1px] bg-gradient-to-r from-violet-500/30 via-indigo-500/30 to-purple-500/30" />

                {[
                  {
                    n: "01",
                    icon: MessageSquare,
                    title: "Briefing inteligente",
                    desc: "Responda algumas perguntas ou cole seu briefing livre. A IA extrai os fundamentos da identidade.",
                    color: "#6366f1",
                  },
                  {
                    n: "02",
                    icon: Sparkles,
                    title: "IA gera seu brandbook",
                    desc: "6 motores trabalham juntos: estrategia, visual, verbal. 24 secoes com coerencia semiotica.",
                    color: "#7c3aed",
                  },
                  {
                    n: "03",
                    icon: Send,
                    title: "Exporte e apresente",
                    desc: "PDF profissional, Design Tokens, link de compartilhamento. Tudo pronto em minutos.",
                    color: "#a855f7",
                  },
                ].map((step, i) => (
                  <motion.div key={step.n} variants={fadeInUp} className="relative text-center sm:text-left">
                    {/* Step circle */}
                    <div className="flex sm:justify-start justify-center mb-6">
                      <div
                        className="relative w-16 h-16 rounded-2xl flex items-center justify-center"
                        style={{ background: `${step.color}15` }}
                      >
                        <step.icon className="w-7 h-7" style={{ color: step.color }} />
                        <div
                          className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-[#07080b] border border-white/[0.08] flex items-center justify-center"
                        >
                          <span className="text-[10px] font-black text-white/40">{step.n}</span>
                        </div>
                      </div>
                    </div>
                    <h3 className="text-lg font-bold text-white/85 mb-3">{step.title}</h3>
                    <p className="text-[13px] text-white/30 leading-[1.7] max-w-xs mx-auto sm:mx-0">{step.desc}</p>
                  </motion.div>
                ))}
              </div>
            </div>
            <div className="h-[2px] bg-gradient-to-r from-violet-600/60 via-indigo-500/40 to-purple-400/60" />
          </motion.div>
        </div>
      </SectionWrapper>

      {/* ═══════════════════════════════════════════════════════════════
          FEATURES GRID
          ═══════════════════════════════════════════════════════════════ */}
      <SectionWrapper id="features" className="py-20 sm:py-28">
        <div className="max-w-[80rem] mx-auto">
          <motion.div variants={fadeInUp} className="mb-14">
            <h2 className="text-3xl sm:text-4xl font-black text-white/90 tracking-tight max-w-xl">
              Cada detalhe pensado.
              <br />
              <span className="text-white/40">Nada e generico.</span>
            </h2>
          </motion.div>
          <motion.div variants={staggerContainer} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map((f) => (
              <motion.div
                key={f.title}
                variants={fadeInUp}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="group relative rounded-2xl border border-white/[0.05] bg-white/[0.015] p-7 transition-all duration-300 hover:bg-white/[0.035] hover:border-white/[0.10] overflow-hidden"
              >
                {/* Subtle gradient border on hover */}
                <div
                  className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                  style={{
                    background: `linear-gradient(135deg, ${f.accent}12, transparent 60%)`,
                  }}
                />
                <div className="relative z-10">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center mb-5 transition-all duration-300 group-hover:scale-110"
                    style={{ background: `${f.accent}15`, color: f.accent }}
                  >
                    <f.icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-[15px] font-bold text-white/80 mb-2 group-hover:text-white/95 transition-colors">
                    {f.title}
                  </h3>
                  <p className="text-[13px] text-white/25 leading-[1.7] group-hover:text-white/35 transition-colors">
                    {f.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </SectionWrapper>

      {/* ═══════════════════════════════════════════════════════════════
          PRICING
          ═══════════════════════════════════════════════════════════════ */}
      <SectionWrapper id="pricing" className="py-20 sm:py-28">
        <div className="max-w-[80rem] mx-auto">
          <motion.div variants={fadeInUp} className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-black text-white/90 tracking-tight mb-4">
              Planos para cada tamanho de sonho
            </h2>
            <p className="text-[15px] text-white/30 max-w-md mx-auto">
              Comece gratis. Faca upgrade conforme sua marca cresce.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {PLANS.map((plan) => (
              <motion.div
                key={plan.id}
                variants={fadeInUp}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                className={`relative rounded-2xl border p-6 transition-all duration-300 ${
                  plan.highlighted
                    ? "border-violet-500/40 bg-violet-500/[0.06] shadow-[0_0_60px_rgba(99,102,241,0.08)]"
                    : "border-white/[0.06] bg-white/[0.02] hover:border-white/[0.10]"
                }`}
              >
                {/* Badge */}
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-600 px-3 py-1 text-[11px] font-bold text-white shadow-lg shadow-violet-600/20">
                      <Star className="w-3 h-3" />
                      {plan.badge}
                    </span>
                  </div>
                )}

                {/* Header */}
                <div className="mb-5 pt-1">
                  <h3
                    className={`text-lg font-bold ${
                      plan.highlighted ? "text-violet-300" : "text-white/80"
                    }`}
                  >
                    {plan.name}
                  </h3>
                  <p className="text-[12px] text-white/25 mt-1">{plan.description}</p>
                </div>

                {/* Price */}
                <div className="flex items-end gap-1 mb-6">
                  <span
                    className={`text-3xl font-black tracking-tight ${
                      plan.highlighted ? "text-white" : "text-white/85"
                    }`}
                  >
                    {plan.price}
                  </span>
                  <span className="text-[13px] text-white/25 mb-1">{plan.period}</span>
                </div>

                {/* CTA */}
                <button
                  onClick={() => handlePlanCta(plan.href)}
                  className={`w-full py-3 rounded-xl text-[13px] font-bold transition-all duration-300 mb-6 ${
                    plan.highlighted
                      ? "bg-white text-[#07080b] hover:shadow-[0_16px_48px_rgba(255,255,255,0.12)] hover:-translate-y-0.5"
                      : "bg-white/[0.06] text-white/70 hover:bg-white/[0.10] hover:text-white border border-white/[0.08]"
                  }`}
                >
                  {plan.cta}
                </button>

                {/* Features */}
                <ul className="space-y-2.5">
                  {plan.features.map((feature) => (
                    <li key={feature.label} className="flex items-center gap-2.5 text-[13px]">
                      {feature.included ? (
                        <Check
                          className={`w-4 h-4 shrink-0 ${
                            plan.highlighted ? "text-violet-400" : "text-emerald-400/70"
                          }`}
                        />
                      ) : (
                        <X className="w-4 h-4 shrink-0 text-white/10" />
                      )}
                      <span className={feature.included ? "text-white/50" : "text-white/15 line-through"}>
                        {feature.label}
                      </span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>

          <motion.p variants={fadeIn} className="mt-10 text-center text-[12px] text-white/15">
            Todos os planos incluem 14 dias de teste gratis. Cancele quando quiser. Pagamentos via Stripe.
          </motion.p>
        </div>
      </SectionWrapper>

      {/* ═══════════════════════════════════════════════════════════════
          SOCIAL PROOF
          ═══════════════════════════════════════════════════════════════ */}
      <SectionWrapper id="social-proof" className="py-20 sm:py-28">
        <div className="max-w-[80rem] mx-auto">
          {/* Stats bar */}
          <motion.div
            variants={fadeInUp}
            className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-8 sm:p-10 mb-16"
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
              <div>
                <span ref={brandsCreated.ref} className="text-4xl sm:text-5xl font-black bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
                  {brandsCreated.count.toLocaleString("pt-BR")}+
                </span>
                <p className="text-[13px] text-white/30 mt-2">Marcas criadas</p>
              </div>
              <div>
                <span ref={sectionsGenerated.ref} className="text-4xl sm:text-5xl font-black bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                  {sectionsGenerated.count.toLocaleString("pt-BR")}+
                </span>
                <p className="text-[13px] text-white/30 mt-2">Secoes geradas</p>
              </div>
              <div>
                <span ref={hoursShaved.ref} className="text-4xl sm:text-5xl font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  {hoursShaved.count.toLocaleString("pt-BR")}h
                </span>
                <p className="text-[13px] text-white/30 mt-2">De trabalho economizadas</p>
              </div>
            </div>
          </motion.div>

          {/* Testimonials */}
          <motion.div variants={fadeInUp} className="mb-6 text-center">
            <h2 className="text-2xl sm:text-3xl font-black text-white/90 tracking-tight mb-4">
              O que dizem nossos usuarios
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {TESTIMONIALS.map((t, i) => (
              <GlassCard key={t.name} hoverGlow="#6366f1" className="p-6">
                <div className="flex items-center gap-1 mb-4">
                  {Array.from({ length: t.rating }).map((_, si) => (
                    <Star key={si} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-[14px] text-white/45 leading-[1.75] mb-5">
                  &ldquo;{t.text}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500/30 to-indigo-500/30 flex items-center justify-center">
                    <span className="text-[11px] font-bold text-white/60">{t.avatar}</span>
                  </div>
                  <div>
                    <p className="text-[13px] font-semibold text-white/70">{t.name}</p>
                    <p className="text-[11px] text-white/25">{t.role}</p>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>

          {/* Industry logos placeholder */}
          <motion.div
            variants={fadeIn}
            className="mt-14 flex flex-wrap items-center justify-center gap-8 opacity-[0.15]"
          >
            {["Restaurantes", "Startups", "E-commerce", "Saude", "Educacao", "Moda", "Tecnologia", "Servicos"].map(
              (ind) => (
                <span key={ind} className="text-[12px] font-bold tracking-wider uppercase text-white">
                  {ind}
                </span>
              )
            )}
          </motion.div>
        </div>
      </SectionWrapper>

      {/* ═══════════════════════════════════════════════════════════════
          FAQ
          ═══════════════════════════════════════════════════════════════ */}
      <SectionWrapper id="faq" className="py-20 sm:py-28">
        <div className="max-w-3xl mx-auto">
          <motion.div variants={fadeInUp} className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-black text-white/90 tracking-tight mb-4">
              Perguntas frequentes
            </h2>
            <p className="text-[15px] text-white/30">
              Tudo o que voce precisa saber para comecar.
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            className="rounded-2xl border border-white/[0.06] bg-white/[0.02] px-6 sm:px-8"
          >
            {FAQ_ITEMS.map((item, i) => (
              <FAQItem
                key={i}
                item={item}
                isOpen={openFaq === i}
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
              />
            ))}
          </motion.div>
        </div>
      </SectionWrapper>

      {/* ═══════════════════════════════════════════════════════════════
          PHILOSOPHY / QUOTE
          ═══════════════════════════════════════════════════════════════ */}
      <SectionWrapper className="py-16 sm:py-20">
        <motion.div variants={fadeInUp} className="max-w-3xl mx-auto text-center">
          <blockquote className="text-xl sm:text-2xl lg:text-[1.75rem] font-bold text-white/50 leading-[1.5] tracking-tight">
            &ldquo;Um bom manual de marca nao e um documento. E a{" "}
            <span className="text-white/90">traducao visual da alma</span> de um negocio.&rdquo;
          </blockquote>
        </motion.div>
      </SectionWrapper>

      {/* ═══════════════════════════════════════════════════════════════
          FINAL CTA
          ═══════════════════════════════════════════════════════════════ */}
      <SectionWrapper className="pb-20 sm:pb-28">
        <div className="max-w-[80rem] mx-auto">
          <motion.div
            variants={scaleIn}
            className="relative rounded-[1.5rem] border border-white/[0.06] overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-violet-900/20 via-transparent to-indigo-900/10" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.08),transparent_70%)]" />
            <div className="relative text-center py-14 sm:py-20 px-6">
              <motion.h2
                variants={fadeInUp}
                className="text-3xl sm:text-4xl font-black text-white/90 tracking-tight mb-5 max-w-xl mx-auto leading-[1.1]"
              >
                Pronto para criar sua marca?
              </motion.h2>
              <motion.p variants={fadeInUp} className="text-[14px] text-white/30 mb-8 max-w-sm mx-auto">
                Acesso direto. Manual profissional em menos de 2 minutos. Sem cadastro.
              </motion.p>
              <motion.div variants={fadeInUp}>
                <button
                  onClick={handleAccess}
                  disabled={loading}
                  className="group inline-flex items-center gap-3 bg-white text-[#07080b] px-9 py-[18px] rounded-2xl font-bold text-[15px] transition-all duration-300 hover:shadow-[0_24px_80px_rgba(99,102,241,0.25)] hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-50"
                >
                  {loading ? "Entrando..." : "Comecar Agora"}
                  {!loading && (
                    <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
                  )}
                </button>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </SectionWrapper>

      {/* ═══════════════════════════════════════════════════════════════
          FOOTER
          ═══════════════════════════════════════════════════════════════ */}
      <footer className="relative z-10 border-t border-white/[0.04] px-6 sm:px-10 lg:px-16 py-12 sm:py-16">
        <div className="max-w-[80rem] mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-xl bg-white/[0.07] border border-white/[0.06] flex items-center justify-center">
                  <span className="text-sm font-black bg-gradient-to-br from-white to-white/50 bg-clip-text text-transparent">
                    B
                  </span>
                </div>
                <span className="text-[15px] font-bold tracking-tight text-white/70">brandbook</span>
              </div>
              <p className="text-[13px] text-white/25 leading-[1.7] max-w-xs">
                Manuais de marca profissionais gerados por IA. Do briefing ao brandbook completo em minutos.
              </p>
            </div>

            {/* Produto */}
            <div>
              <h4 className="text-[12px] font-bold text-white/50 uppercase tracking-wider mb-4">Produto</h4>
              <ul className="space-y-2.5">
                {[
                  { label: "Features", href: "#features" },
                  { label: "Precos", href: "#pricing" },
                  { label: "Demo", href: "#showcase" },
                  { label: "FAQ", href: "#faq" },
                ].map((link) => (
                  <li key={link.label}>
                    <a href={link.href} className="text-[13px] text-white/25 hover:text-white/60 transition-colors">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Recursos */}
            <div>
              <h4 className="text-[12px] font-bold text-white/50 uppercase tracking-wider mb-4">Recursos</h4>
              <ul className="space-y-2.5">
                {[
                  { label: "Blog", href: "#" },
                  { label: "Guia de Branding", href: "#" },
                  { label: "Templates", href: "#" },
                  { label: "API Docs", href: "#" },
                ].map((link) => (
                  <li key={link.label}>
                    <a href={link.href} className="text-[13px] text-white/25 hover:text-white/60 transition-colors">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="text-[12px] font-bold text-white/50 uppercase tracking-wider mb-4">Legal</h4>
              <ul className="space-y-2.5">
                {[
                  { label: "Termos de Uso", href: "#" },
                  { label: "Privacidade", href: "#" },
                  { label: "Cookies", href: "#" },
                  { label: "Contato", href: "#" },
                ].map((link) => (
                  <li key={link.label}>
                    <a href={link.href} className="text-[13px] text-white/25 hover:text-white/60 transition-colors">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="pt-8 border-t border-white/[0.04] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-[12px] text-white/15 font-medium">
                brandbook &copy; {new Date().getFullYear()}
              </span>
            </div>
            <span className="text-[12px] text-white/10">
              Feito com <span className="text-red-400/40">&hearts;</span> e IA no Brasil
            </span>
            {/* Social links */}
            <div className="flex items-center gap-4">
              {[
                { label: "Twitter", icon: "X" },
                { label: "LinkedIn", icon: "in" },
                { label: "Instagram", icon: "ig" },
              ].map((social) => (
                <a
                  key={social.label}
                  href="#"
                  className="w-8 h-8 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.04] flex items-center justify-center transition-all duration-200"
                  aria-label={social.label}
                >
                  <span className="text-[10px] font-bold text-white/25">{social.icon}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
