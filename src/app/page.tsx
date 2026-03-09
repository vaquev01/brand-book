"use client"

import { signIn, useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"

/* ─── Typing animation hook ─── */
function useTypingEffect(words: string[], speed = 80, pause = 2200) {
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
  { name: "Kairo", industry: "Fintech", colors: ["#0f172a", "#6366f1", "#a5b4fc", "#f1f5f9"] },
  { name: "Soleil", industry: "Cosmetics", colors: ["#78350f", "#f59e0b", "#fbbf24", "#fffbeb"] },
  { name: "Vertex", industry: "Tech", colors: ["#0c0a09", "#ef4444", "#fca5a5", "#fef2f2"] },
  { name: "Flora", industry: "Wellness", colors: ["#14532d", "#22c55e", "#86efac", "#f0fdf4"] },
]

export default function LandingPage() {
  const [loading, setLoading] = useState(false)
  const [activeBrand, setActiveBrand] = useState(0)
  const typedWord = useTypingEffect(TYPING_WORDS)
  const { data: session, status } = useSession()
  const router = useRouter()

  // If already logged in, redirect to dashboard
  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/dashboard")
    }
  }, [status, router])

  useEffect(() => {
    const i = setInterval(() => setActiveBrand((v) => (v + 1) % SHOWCASE_BRANDS.length), 3000)
    return () => clearInterval(i)
  }, [])

  async function handleAccess() {
    setLoading(true)
    await signIn("credentials", { callbackUrl: "/dashboard" })
  }

  const brand = SHOWCASE_BRANDS[activeBrand]

  // Show nothing while checking auth
  if (status === "loading" || status === "authenticated") {
    return (
      <div className="min-h-screen bg-[#08090c] flex items-center justify-center">
        <div className="w-8 h-8 rounded-xl bg-white/[0.08] border border-white/[0.06] flex items-center justify-center animate-pulse">
          <span className="text-sm font-black text-white/60">B</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#08090c] text-white overflow-x-hidden">
      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-[-20%] left-[-10%] w-[70vw] h-[70vw] rounded-full opacity-[0.07]"
          style={{ background: `radial-gradient(circle, ${brand.colors[1]}, transparent 70%)`, transition: "background 1.5s ease" }} />
        <div className="absolute bottom-[-10%] right-[-15%] w-[50vw] h-[50vw] rounded-full opacity-[0.05]"
          style={{ background: `radial-gradient(circle, ${brand.colors[2]}, transparent 70%)`, transition: "background 1.5s ease" }} />
        {/* Grid */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)", backgroundSize: "64px 64px" }} />
      </div>

      {/* ─── Nav ─── */}
      <nav className="relative z-10 flex items-center justify-between px-6 sm:px-10 lg:px-16 py-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-white/[0.08] border border-white/[0.06] flex items-center justify-center">
            <span className="text-sm font-black bg-gradient-to-br from-white to-white/60 bg-clip-text text-transparent">B</span>
          </div>
          <span className="text-sm font-bold tracking-tight text-white/80">brandbook</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="hidden sm:flex items-center gap-2 text-xs text-white/30">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            AI Engines Online
          </span>
        </div>
      </nav>

      {/* ─── Hero ─── */}
      <section className="relative z-10 px-6 sm:px-10 lg:px-16 pt-12 sm:pt-20 lg:pt-28 pb-16 sm:pb-24">
        <div className="max-w-[76rem] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-12 lg:gap-16 items-center">
            {/* Left — Copy */}
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.06] bg-white/[0.03] px-4 py-1.5 mb-8">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">Gerador IA de Manual de Marca</span>
              </div>

              <h1 className="text-[clamp(2.4rem,5.2vw,4.8rem)] font-black leading-[0.95] tracking-[-0.04em] mb-6">
                <span className="block text-white">Manuais de marca</span>
                <span className="block text-white">que impressionam</span>
                <span className="block mt-1 h-[1.15em] overflow-hidden">
                  <span className="text-white/25">para </span>
                  <span className="bg-gradient-to-r from-white via-white/90 to-white/40 bg-clip-text text-transparent">
                    {typedWord}
                    <span className="inline-block w-[2px] h-[0.85em] bg-white/50 ml-0.5 animate-pulse align-middle" />
                  </span>
                </span>
              </h1>

              <p className="text-base sm:text-lg text-white/40 max-w-xl leading-relaxed mb-10">
                Do briefing ao brandbook completo em minutos. IA com Art Director integrado que pensa
                como os melhores designers do mundo.
              </p>

              {/* CTA group */}
              <div className="flex flex-col sm:flex-row items-start gap-4 mb-12">
                <button
                  onClick={handleAccess}
                  disabled={loading}
                  className="group relative flex items-center gap-3 bg-white text-black px-7 py-4 rounded-2xl font-bold text-base transition-all duration-300 hover:shadow-[0_20px_60px_rgba(255,255,255,0.12)] hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-60 disabled:cursor-wait"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="32" strokeLinecap="round" />
                      </svg>
                      Entrando...
                    </>
                  ) : (
                    <>
                      Criar Brandbook Grátis
                      <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                      </svg>
                    </>
                  )}
                </button>
                <span className="text-xs text-white/20 self-center">Sem cadastro. Acesso direto.</span>
              </div>

              {/* Tech badges */}
              <div className="flex flex-wrap gap-2">
                {["GPT-4o", "Gemini", "DALL-E 3", "Stability AI", "Ideogram", "Imagen 3"].map((t) => (
                  <span key={t} className="text-[10px] font-semibold text-white/25 border border-white/[0.06] rounded-lg px-2.5 py-1">
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* Right — Brand Preview Card */}
            <div className="relative">
              <div className="absolute -inset-8 rounded-3xl opacity-20 blur-3xl"
                style={{ background: brand.colors[1], transition: "background 1.5s ease" }} />

              <div className="relative rounded-3xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl overflow-hidden">
                <div className="px-6 pt-6 pb-4 border-b border-white/[0.06]">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ background: brand.colors[1] }} />
                      <span className="text-xs font-bold text-white/50">Brand Preview</span>
                    </div>
                    <span className="text-[10px] text-white/20 font-mono">{brand.industry}</span>
                  </div>
                  <h3 className="text-3xl sm:text-4xl font-black tracking-tight text-white"
                    style={{ transition: "all 0.5s ease" }}>
                    {brand.name}
                  </h3>
                </div>

                <div className="flex">
                  {brand.colors.map((c, i) => (
                    <div key={i} className="flex-1 h-16 transition-all duration-700" style={{ background: c }} />
                  ))}
                </div>

                <div className="p-6 space-y-3">
                  {["DNA & Estratégia", "Identidade Visual", "Tipografia", "Aplicações", "Social Media"].map((s, i) => (
                    <div key={s} className="flex items-center gap-3 py-2 border-b border-white/[0.04] last:border-0">
                      <span className="text-[10px] font-bold text-white/15 tabular-nums w-6">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="text-sm text-white/40 font-medium">{s}</span>
                      <div className="ml-auto w-8 h-1 rounded-full bg-white/[0.06]">
                        <div className="h-full rounded-full transition-all duration-1000"
                          style={{ width: `${70 + i * 6}%`, background: brand.colors[1], opacity: 0.5 }} />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="px-6 pb-5 flex items-center justify-center gap-2">
                  {SHOWCASE_BRANDS.map((b, i) => (
                    <button
                      key={b.name}
                      onClick={() => setActiveBrand(i)}
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${i === activeBrand ? "w-6 opacity-100" : "opacity-30 hover:opacity-60"}`}
                      style={{ background: b.colors[1] }}
                      aria-label={b.name}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Stats bar ─── */}
      <section className="relative z-10 border-y border-white/[0.04] bg-white/[0.015]">
        <div className="max-w-[76rem] mx-auto px-6 sm:px-10 lg:px-16 py-10 grid grid-cols-2 sm:grid-cols-4 gap-8">
          {[
            { value: "24", label: "Seções no Manual", sub: "DNA, cores, tipografia, logos..." },
            { value: "6", label: "Motores de IA", sub: "Text + Image generation" },
            { value: "28", label: "Assets Gerados", sub: "Business cards, social, packaging" },
            { value: "<2min", label: "Tempo de Geração", sub: "Do briefing ao manual completo" },
          ].map((s) => (
            <div key={s.label} className="group">
              <div className="text-2xl sm:text-3xl font-black text-white/90 mb-1 tabular-nums">{s.value}</div>
              <div className="text-xs font-bold text-white/40 mb-0.5">{s.label}</div>
              <div className="text-[11px] text-white/15">{s.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Features ─── */}
      <section className="relative z-10 px-6 sm:px-10 lg:px-16 py-20 sm:py-28">
        <div className="max-w-[76rem] mx-auto">
          <div className="mb-14">
            <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/20 mb-3">Capacidades</div>
            <h2 className="text-2xl sm:text-3xl font-black text-white/90 tracking-tight">
              Tudo que um brandbook profissional precisa.
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { title: "Art Director IA", desc: "O sistema pensa como Paula Scher, Sagmeister e David Carson. Cada prompt avaliado com scorecard de coerência.", accent: "#6366f1" },
              { title: "Modo Imersivo", desc: "O brandbook se veste da marca: cores, tipografia, texturas e linguagem em primeira pessoa.", accent: "#f59e0b" },
              { title: "Apresentação Cinematográfica", desc: "Modo fullscreen com transições suaves para apresentar ao cliente como um keynote.", accent: "#ef4444" },
              { title: "24 Seções Editoriais", desc: "DNA, posicionamento, personas, verbal identity, logo, cores, tipografia, aplicações e mais.", accent: "#22c55e" },
              { title: "Multi-Provider", desc: "DALL-E 3, Stability AI, Ideogram e Imagen 3 geram assets visuais coerentes com a proposta.", accent: "#3b82f6" },
              { title: "Exportação Pro", desc: "PDF multi-página, ZIP com assets, Design Tokens (CSS/W3C/Tailwind) e share link.", accent: "#a855f7" },
            ].map((f) => (
              <div
                key={f.title}
                className="group relative rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 transition-all duration-300 hover:bg-white/[0.04] hover:border-white/[0.10]"
              >
                <div className="w-1 h-8 rounded-full mb-4 transition-all duration-300 group-hover:h-10"
                  style={{ background: f.accent }} />
                <h3 className="text-base font-bold text-white/80 mb-2">{f.title}</h3>
                <p className="text-sm text-white/30 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Process ─── */}
      <section className="relative z-10 px-6 sm:px-10 lg:px-16 pb-20 sm:pb-28">
        <div className="max-w-[76rem] mx-auto">
          <div className="rounded-3xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
            <div className="p-8 sm:p-12">
              <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/20 mb-3">Processo</div>
              <h2 className="text-2xl sm:text-3xl font-black text-white/90 tracking-tight mb-10">
                3 passos. Resultado profissional.
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-12">
                {[
                  { n: "01", title: "Briefing", desc: "Nome, setor, descrição e referências. A IA extrai os fundamentos da identidade." },
                  { n: "02", title: "Geração IA", desc: "O Art Director cria cores, tipografia, logos, aplicações e 24 seções completas." },
                  { n: "03", title: "Refine & Exporte", desc: "Edite cada campo inline. Gere assets visuais. Exporte PDF ou compartilhe link." },
                ].map((step) => (
                  <div key={step.n}>
                    <div className="text-4xl font-black text-white/[0.06] mb-4">{step.n}</div>
                    <h3 className="text-lg font-bold text-white/80 mb-2">{step.title}</h3>
                    <p className="text-sm text-white/30 leading-relaxed">{step.desc}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="h-1 bg-gradient-to-r from-violet-600 via-blue-500 to-emerald-400 opacity-40" />
          </div>
        </div>
      </section>

      {/* ─── Final CTA ─── */}
      <section className="relative z-10 px-6 sm:px-10 lg:px-16 pb-20">
        <div className="max-w-[76rem] mx-auto text-center">
          <h2 className="text-2xl sm:text-4xl font-black text-white/90 tracking-tight mb-4">
            Pronto para criar seu brandbook?
          </h2>
          <p className="text-sm text-white/30 mb-8 max-w-md mx-auto">
            Acesso direto. Sem cadastro. Seu manual de marca profissional em minutos.
          </p>
          <button
            onClick={handleAccess}
            disabled={loading}
            className="inline-flex items-center gap-3 bg-white text-black px-8 py-4 rounded-2xl font-bold transition-all duration-300 hover:shadow-[0_20px_60px_rgba(255,255,255,0.12)] hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-60"
          >
            {loading ? "Entrando..." : "Começar Agora"}
            {!loading && (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            )}
          </button>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="relative z-10 border-t border-white/[0.04] px-6 sm:px-10 lg:px-16 py-6">
        <div className="max-w-[76rem] mx-auto flex items-center justify-between">
          <span className="text-xs text-white/15">brandbook &copy; {new Date().getFullYear()}</span>
          <span className="text-xs text-white/10">Powered by AI</span>
        </div>
      </footer>
    </div>
  )
}
