"use client"

import { signIn } from "next-auth/react"
import { useState } from "react"

const FEATURES = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 0 0-2.455 2.456Z" />
      </svg>
    ),
    title: "IA Generativa Premium",
    desc: "GPT-4o, Gemini, DALL-E 3, Stability, Ideogram e Imagen 3 trabalhando em conjunto",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
      </svg>
    ),
    title: "Modo Imersivo",
    desc: "Apresentação que se veste da marca — cores, tipografia e linguagem da identidade",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25a2.25 2.25 0 0 1-2.25-2.25v-2.25Z" />
      </svg>
    ),
    title: "24 Seções Completas",
    desc: "DNA, cores, tipografia, logos, mascotes, aplicações, social media e muito mais",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 7.5h-.75A2.25 2.25 0 0 0 4.5 9.75v7.5a2.25 2.25 0 0 0 2.25 2.25h7.5a2.25 2.25 0 0 0 2.25-2.25v-7.5a2.25 2.25 0 0 0-2.25-2.25h-.75m0-3-3-3m0 0-3 3m3-3v11.25m6-2.25h.75a2.25 2.25 0 0 1 2.25 2.25v7.5a2.25 2.25 0 0 1-2.25 2.25h-7.5a2.25 2.25 0 0 1-2.25-2.25v-7.5a2.25 2.25 0 0 1 2.25-2.25h.75" />
      </svg>
    ),
    title: "Exportação Profissional",
    desc: "PDF, ZIP com assets, JSON estruturado e compartilhamento por link",
  },
]

const STATS = [
  { value: "24", label: "Seções do Manual" },
  { value: "4", label: "Provedores de IA" },
  { value: "28", label: "Tipos de Asset" },
  { value: "16", label: "Indústrias" },
]

export default function LoginPage() {
  const [loading, setLoading] = useState(false)

  async function handleAccess() {
    setLoading(true)
    await signIn("credentials", { callbackUrl: "/dashboard" })
  }

  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* Hero */}
      <div className="text-center mb-16">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/20 rounded-full px-4 py-1.5 mb-8">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-xs font-medium text-violet-300">Plataforma ativa</span>
        </div>

        {/* Logo */}
        <div className="mb-6 inline-flex items-center justify-center rounded-3xl bg-gradient-to-br from-violet-500 to-blue-600 p-4 shadow-2xl shadow-violet-500/30">
          <span className="text-4xl font-bold text-white select-none">✦</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white mb-4">
          brand
          <span className="bg-gradient-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent">book</span>
        </h1>

        <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-4 leading-relaxed">
          Gere manuais de marca profissionais com inteligência artificial.
          <br className="hidden sm:block" />
          Do briefing ao brandbook completo em minutos.
        </p>

        <p className="text-sm text-slate-500 max-w-lg mx-auto mb-10">
          Sistema com Art Director IA que pensa como Paula Scher, Sagmeister e David Carson.
          Cada prompt avaliado com scorecard de coerência de marca.
        </p>

        {/* CTA */}
        <button
          onClick={handleAccess}
          disabled={loading}
          className="group relative inline-flex items-center gap-3 bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 shadow-xl shadow-violet-500/25 hover:shadow-2xl hover:shadow-violet-500/40 hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-60 disabled:cursor-wait"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="32" strokeLinecap="round" />
              </svg>
              Entrando...
            </>
          ) : (
            <>
              Acessar Plataforma
              <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </>
          )}
        </button>

        <p className="text-xs text-slate-600 mt-4">
          Acesso direto — sem cadastro necessário
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-16">
        {STATS.map((s) => (
          <div
            key={s.label}
            className="text-center p-5 rounded-2xl border border-white/5 bg-white/[0.02]"
          >
            <div className="text-3xl font-black bg-gradient-to-b from-white to-slate-400 bg-clip-text text-transparent">
              {s.value}
            </div>
            <div className="text-xs text-slate-500 mt-1 font-medium">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-16">
        {FEATURES.map((f) => (
          <div
            key={f.title}
            className="group p-6 rounded-2xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/10 transition-all duration-300"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500/20 to-blue-500/10 flex items-center justify-center text-violet-400 mb-4 group-hover:scale-110 transition-transform">
              {f.icon}
            </div>
            <h3 className="text-base font-bold text-white mb-1.5">{f.title}</h3>
            <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </div>

      {/* How it works */}
      <div className="mb-16">
        <h2 className="text-center text-sm font-black uppercase tracking-[0.2em] text-slate-500 mb-8">
          Como funciona
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            { step: "01", title: "Descreva sua marca", desc: "Nome, setor e briefing — a IA cuida do resto" },
            { step: "02", title: "Gere com IA", desc: "O sistema cria cores, tipografia, logos, aplicações e mais" },
            { step: "03", title: "Refine e exporte", desc: "Ajuste cada seção, gere imagens e exporte o manual completo" },
          ].map((s) => (
            <div key={s.step} className="text-center">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-full border border-violet-500/30 text-violet-400 text-sm font-black mb-3">
                {s.step}
              </div>
              <h3 className="text-base font-bold text-white mb-1">{s.title}</h3>
              <p className="text-sm text-slate-400">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="text-center pb-8">
        <p className="text-xs text-slate-600">
          brandbook &copy; {new Date().getFullYear()} — Powered by AI
        </p>
      </div>
    </div>
  )
}
