"use client"

import { signIn, useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useState, useEffect, useRef } from "react"

/* ─── Typing animation hook ─── */
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

/* ─── Scroll reveal ─── */
function RevealSection({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { el.classList.add("revealed"); observer.unobserve(el) } },
      { threshold: 0.15 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])
  return <div ref={ref} data-reveal className={className}>{children}</div>
}

const TYPING_WORDS = [
  "restaurantes",
  "startups",
  "escritórios",
  "e-commerces",
  "clínicas",
  "agências",
  "marcas pessoais",
  "cafeterias",
]

const SHOWCASE_BRANDS = [
  { name: "Kairo", industry: "Fintech", tagline: "O futuro das finanças", colors: ["#0f172a", "#6366f1", "#a5b4fc", "#f1f5f9"] },
  { name: "Soleil", industry: "Cosmetics", tagline: "Beleza consciente", colors: ["#78350f", "#f59e0b", "#fbbf24", "#fffbeb"] },
  { name: "Vertex", industry: "Tech", tagline: "Engenharia de ponta", colors: ["#0c0a09", "#ef4444", "#fca5a5", "#fef2f2"] },
  { name: "Flora", industry: "Wellness", tagline: "Natureza que cuida", colors: ["#14532d", "#22c55e", "#86efac", "#f0fdf4"] },
]

const FEATURES = [
  {
    title: "Art Director IA",
    desc: "Cada decisão visual fundamentada em semiótica e estratégia.",
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/></svg>,
    accent: "#6366f1",
  },
  {
    title: "Imersão Total",
    desc: "O brandbook se veste da marca — cores, tipografia, voz.",
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/></svg>,
    accent: "#f59e0b",
  },
  {
    title: "24 Seções Completas",
    desc: "DNA, personas, verbal, logo, cores, tipo, aplicações e social media.",
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20"/></svg>,
    accent: "#22c55e",
  },
  {
    title: "6 Motores de IA",
    desc: "GPT-4o, Gemini, DALL-E 3, Stability, Ideogram e Imagen 3.",
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="14" y="14" width="8" height="8" rx="2"/><rect x="2" y="2" width="8" height="8" rx="2"/><path d="M7 14v1a2 2 0 0 0 2 2h1"/><path d="M14 7h1a2 2 0 0 1 2 2v1"/></svg>,
    accent: "#3b82f6",
  },
  {
    title: "Apresentação Cinematic",
    desc: "Fullscreen com transições e ambientação. Um keynote para o cliente.",
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" x2="16" y1="21" y2="21"/><line x1="12" x2="12" y1="17" y2="21"/></svg>,
    accent: "#ef4444",
  },
  {
    title: "Exportação Pro",
    desc: "PDF, Design Tokens (CSS/W3C/Tailwind) e link público.",
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>,
    accent: "#a855f7",
  },
]

export default function LandingPage() {
  const [loading, setLoading] = useState(false)
  const [activeBrand, setActiveBrand] = useState(0)
  const typedWord = useTypingEffect(TYPING_WORDS)
  const { status } = useSession()
  const router = useRouter()
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => { if (status === "authenticated") router.replace("/dashboard") }, [status, router])
  useEffect(() => { const i = setInterval(() => setActiveBrand((v) => (v + 1) % SHOWCASE_BRANDS.length), 3500); return () => clearInterval(i) }, [])
  useEffect(() => { function onScroll() { setScrollY(window.scrollY) }; window.addEventListener("scroll", onScroll, { passive: true }); return () => window.removeEventListener("scroll", onScroll) }, [])

  async function handleAccess() { setLoading(true); await signIn("credentials", { callbackUrl: "/dashboard" }) }

  const brand = SHOWCASE_BRANDS[activeBrand]

  if (status === "loading" || status === "authenticated") {
    return (
      <div className="min-h-screen bg-[#07080b] flex items-center justify-center">
        <div className="w-10 h-10 rounded-2xl bg-white/[0.06] border border-white/[0.04] flex items-center justify-center">
          <span className="text-sm font-black text-white/40">B</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#07080b] text-white overflow-x-hidden selection:bg-violet-500/20">
      {/* Ambient */}
      <div className="fixed inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-[-30%] left-[-15%] w-[80vw] h-[80vw] rounded-full opacity-[0.06]"
          style={{ background: `radial-gradient(circle, ${brand.colors[1]}, transparent 65%)`, transition: "background 2s ease" }} />
        <div className="absolute bottom-[-20%] right-[-20%] w-[60vw] h-[60vw] rounded-full opacity-[0.04]"
          style={{ background: `radial-gradient(circle, ${brand.colors[2]}, transparent 65%)`, transition: "background 2s ease" }} />
        <div className="absolute inset-0 opacity-[0.025]"
          style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)", backgroundSize: "72px 72px" }} />
      </div>

      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
        style={{
          background: scrollY > 60 ? "rgba(7,8,11,0.85)" : "transparent",
          backdropFilter: scrollY > 60 ? "blur(20px) saturate(1.4)" : "none",
          borderBottom: scrollY > 60 ? "1px solid rgba(255,255,255,0.04)" : "1px solid transparent",
        }}>
        <div className="max-w-[80rem] mx-auto px-6 sm:px-10 lg:px-16 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/[0.07] border border-white/[0.06] flex items-center justify-center">
              <span className="text-sm font-black bg-gradient-to-br from-white to-white/50 bg-clip-text text-transparent">B</span>
            </div>
            <span className="text-[15px] font-bold tracking-tight text-white/70">brandbook</span>
          </div>
          <div className="flex items-center gap-5">
            <span className="hidden sm:flex items-center gap-2 text-[11px] text-white/25 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Online
            </span>
            <button onClick={handleAccess} disabled={loading}
              className="text-[13px] font-semibold text-white/70 hover:text-white bg-white/[0.06] hover:bg-white/[0.10] border border-white/[0.08] px-5 py-2 rounded-xl transition-all duration-200 disabled:opacity-50">
              {loading ? "Entrando..." : "Entrar"}
            </button>
          </div>
        </div>
      </nav>

      {/* ─── Hero ─── */}
      <section className="relative z-10 px-6 sm:px-10 lg:px-16 pt-32 sm:pt-40 lg:pt-48 pb-16 sm:pb-20">
        <div className="max-w-[80rem] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-14 lg:gap-20 items-center">
            <div>
              <div className="inline-flex items-center gap-2.5 rounded-full border border-white/[0.06] bg-white/[0.03] px-4 py-2 mb-10">
                <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />
                <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/35">AI Brand Studio</span>
              </div>

              <h1 className="text-[clamp(2.6rem,5.5vw,5.2rem)] font-black leading-[0.92] tracking-[-0.045em] mb-7">
                <span className="block text-white">Identidade visual</span>
                <span className="block text-white/90">com alma.</span>
                <span className="block mt-2 h-[1.15em] overflow-hidden">
                  <span className="text-white/20">Para </span>
                  <span className="bg-gradient-to-r from-white via-white/90 to-white/50 bg-clip-text text-transparent">
                    {typedWord}
                    <span className="inline-block w-[2px] h-[0.8em] bg-white/40 ml-0.5 animate-pulse align-middle" />
                  </span>
                </span>
              </h1>

              <p className="text-[17px] text-white/35 max-w-lg leading-[1.7] mb-12">
                Do briefing ao manual de marca completo em minutos. IA com sensibilidade estética e fundamento estratégico.
              </p>

              <div className="flex flex-col sm:flex-row items-start gap-4">
                <button onClick={handleAccess} disabled={loading}
                  className="group relative flex items-center gap-3 bg-white text-[#07080b] px-8 py-[18px] rounded-2xl font-bold text-[15px] transition-all duration-300 hover:shadow-[0_24px_80px_rgba(255,255,255,0.10)] hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-50 disabled:cursor-wait">
                  {loading ? (
                    <><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="32" strokeLinecap="round" /></svg>Entrando...</>
                  ) : (
                    <>Criar Brandbook Grátis<svg className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" /></svg></>
                  )}
                </button>
                <span className="text-[12px] text-white/15 self-center">Sem cadastro. Resultado em &lt;2 minutos.</span>
              </div>
            </div>

            {/* Brand Preview Card */}
            <div className="relative hidden lg:block">
              <div className="absolute -inset-12 rounded-[2rem] opacity-15 blur-3xl transition-all duration-2000" style={{ background: brand.colors[1] }} />
              <div className="relative rounded-[1.5rem] border border-white/[0.07] bg-white/[0.025] backdrop-blur-2xl overflow-hidden shadow-2xl">
                <div className="px-7 pt-7 pb-5 border-b border-white/[0.05]">
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-3.5 h-3.5 rounded-full transition-all duration-700" style={{ background: brand.colors[1] }} />
                      <span className="text-[11px] font-bold text-white/40">Brand Preview</span>
                    </div>
                    <span className="text-[10px] text-white/15 font-mono tracking-wider">{brand.industry}</span>
                  </div>
                  <h3 className="text-4xl font-black tracking-tight text-white transition-all duration-500">{brand.name}</h3>
                  <p className="text-sm text-white/25 mt-1.5 transition-all duration-500">{brand.tagline}</p>
                </div>
                <div className="flex">
                  {brand.colors.map((c, i) => (
                    <div key={i} className="flex-1 h-14 transition-all duration-700" style={{ background: c }} />
                  ))}
                </div>
                <div className="p-7 space-y-1">
                  {["DNA & Estratégia", "Identidade Visual", "Tipografia", "Aplicações", "Social Media"].map((s, i) => (
                    <div key={s} className="flex items-center gap-3 py-2.5 border-b border-white/[0.03] last:border-0">
                      <span className="text-[10px] font-bold text-white/10 tabular-nums w-6">{String(i + 1).padStart(2, "0")}</span>
                      <span className="text-[13px] text-white/35 font-medium">{s}</span>
                      <div className="ml-auto w-10 h-1 rounded-full bg-white/[0.05] overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${65 + i * 7}%`, background: brand.colors[1], opacity: 0.4 }} />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="px-7 pb-6 flex items-center justify-center gap-2">
                  {SHOWCASE_BRANDS.map((b, i) => (
                    <button key={b.name} onClick={() => setActiveBrand(i)}
                      className={`rounded-full transition-all duration-300 ${i === activeBrand ? "w-7 h-2.5" : "w-2.5 h-2.5 opacity-25 hover:opacity-50"}`}
                      style={{ background: b.colors[1] }} aria-label={`Ver marca ${b.name}`} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Features ─── */}
      <RevealSection>
        <section className="relative z-10 px-6 sm:px-10 lg:px-16 py-20 sm:py-28">
          <div className="max-w-[80rem] mx-auto">
            <div className="mb-14">
              <h2 className="text-3xl sm:text-4xl font-black text-white/90 tracking-tight max-w-xl">
                Cada detalhe pensado.<br />
                <span className="text-white/40">Nada é genérico.</span>
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {FEATURES.map((f) => (
                <div key={f.title} data-stagger
                  className="group rounded-2xl border border-white/[0.05] bg-white/[0.015] p-7 transition-all duration-300 hover:bg-white/[0.035] hover:border-white/[0.10]">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-5 transition-all duration-300 group-hover:scale-105"
                    style={{ background: `${f.accent}15`, color: f.accent }}>
                    {f.icon}
                  </div>
                  <h3 className="text-[15px] font-bold text-white/80 mb-2">{f.title}</h3>
                  <p className="text-[13px] text-white/25 leading-[1.7]">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </RevealSection>

      {/* ─── Process ─── */}
      <RevealSection>
        <section className="relative z-10 px-6 sm:px-10 lg:px-16 pb-20 sm:pb-28">
          <div className="max-w-[80rem] mx-auto">
            <div className="rounded-[1.5rem] border border-white/[0.05] bg-white/[0.015] overflow-hidden">
              <div className="p-8 sm:p-14">
                <h2 className="text-3xl sm:text-4xl font-black text-white/90 tracking-tight mb-12">
                  3 passos. Resultado de agência.
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 sm:gap-16">
                  {[
                    { n: "01", title: "Descreva", desc: "Nome, setor e briefing. A IA extrai os fundamentos da identidade." },
                    { n: "02", title: "Gere", desc: "24 seções com coerência semiótica — cores, tipo, logos e aplicações." },
                    { n: "03", title: "Apresente", desc: "Edite inline, exporte PDF e compartilhe com link imersivo." },
                  ].map((step) => (
                    <div key={step.n} data-stagger>
                      <div className="text-5xl font-black text-white/[0.04] mb-5">{step.n}</div>
                      <h3 className="text-lg font-bold text-white/80 mb-3">{step.title}</h3>
                      <p className="text-[13px] text-white/25 leading-[1.7]">{step.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="h-[2px] bg-gradient-to-r from-violet-600/60 via-blue-500/40 to-emerald-400/60" />
            </div>
          </div>
        </section>
      </RevealSection>

      {/* ─── Philosophy (compact) ─── */}
      <RevealSection>
        <section className="relative z-10 px-6 sm:px-10 lg:px-16 pb-20 sm:pb-28">
          <div className="max-w-3xl mx-auto text-center">
            <blockquote className="text-xl sm:text-2xl lg:text-[1.75rem] font-bold text-white/50 leading-[1.5] tracking-tight">
              &ldquo;Um bom manual de marca não é um documento.
              É a <span className="text-white/90">tradução visual da alma</span> de um negócio.&rdquo;
            </blockquote>
          </div>
        </section>
      </RevealSection>

      {/* ─── Final CTA ─── */}
      <RevealSection>
        <section className="relative z-10 px-6 sm:px-10 lg:px-16 pb-20 sm:pb-28">
          <div className="max-w-[80rem] mx-auto">
            <div className="relative rounded-[1.5rem] border border-white/[0.06] overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-violet-900/20 via-transparent to-blue-900/10" />
              <div className="relative text-center py-14 sm:py-20 px-6">
                <h2 className="text-3xl sm:text-4xl font-black text-white/90 tracking-tight mb-5 max-w-xl mx-auto leading-[1.1]">
                  Pronto para criar?
                </h2>
                <p className="text-[14px] text-white/30 mb-8 max-w-sm mx-auto">
                  Acesso direto. Manual profissional em &lt;2 minutos.
                </p>
                <button onClick={handleAccess} disabled={loading}
                  className="group inline-flex items-center gap-3 bg-white text-[#07080b] px-9 py-[18px] rounded-2xl font-bold text-[15px] transition-all duration-300 hover:shadow-[0_24px_80px_rgba(255,255,255,0.10)] hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-50">
                  {loading ? "Entrando..." : "Começar Agora"}
                  {!loading && <svg className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" /></svg>}
                </button>
              </div>
            </div>
          </div>
        </section>
      </RevealSection>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/[0.03] px-6 sm:px-10 lg:px-16 py-8">
        <div className="max-w-[80rem] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-lg bg-white/[0.05] border border-white/[0.04] flex items-center justify-center">
              <span className="text-[8px] font-black text-white/30">B</span>
            </div>
            <span className="text-[12px] text-white/15 font-medium">brandbook &copy; {new Date().getFullYear()}</span>
          </div>
          <span className="text-[11px] text-white/10">AI-Powered Brand Identity Studio</span>
        </div>
      </footer>
    </div>
  )
}
