"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"

const SECTORS = [
  { id: "Startup & Tecnologia", icon: "🚀", label: "Startup & Tech" },
  { id: "Moda & Lifestyle", icon: "👗", label: "Moda & Lifestyle" },
  { id: "Alimentação & Restaurantes", icon: "🍔", label: "Alimentação" },
  { id: "Saúde & Wellness", icon: "💊", label: "Saúde & Wellness" },
  { id: "B2B & SaaS", icon: "💼", label: "B2B & SaaS" },
  { id: "E-commerce & Varejo", icon: "🛒", label: "E-commerce" },
  { id: "Finanças & Fintech", icon: "💰", label: "Finanças" },
  { id: "Educação & EdTech", icon: "🎓", label: "Educação" },
]

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [name, setName] = useState("")
  const [sector, setSector] = useState("")
  const [briefing, setBriefing] = useState("")

  function goNext() {
    if (step === 2) {
      const params = new URLSearchParams({
        tab: "generate",
        name,
        industry: sector,
        briefing,
      })
      router.push(`/dashboard/editor?${params.toString()}`)
      return
    }
    setStep(s => s + 1)
  }

  const steps = ["Nome da marca", "Setor", "Briefing"]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Progress dots */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {steps.map((s, i) => (
            <div
              key={i}
              className={`transition-all duration-300 rounded-full ${
                i === step
                  ? "w-8 h-2 bg-violet-500"
                  : i < step
                    ? "w-2 h-2 bg-violet-400"
                    : "w-2 h-2 bg-slate-700"
              }`}
            />
          ))}
        </div>

        <div className="bg-slate-800/50 backdrop-blur rounded-2xl border border-slate-700 p-8">
          {step === 0 && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Qual é o nome da sua marca?</h2>
              <p className="text-slate-400 mb-6">Projeto existente ou nova ideia</p>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="ex. Minha Marca Incrível"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 text-lg"
                autoFocus
                onKeyDown={e => e.key === "Enter" && name ? goNext() : undefined}
              />
            </div>
          )}

          {step === 1 && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Qual é o setor da marca?</h2>
              <p className="text-slate-400 mb-6">Personaliza o resultado da IA</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {SECTORS.map(s => (
                  <button
                    key={s.id}
                    onClick={() => setSector(s.id)}
                    className={`p-3 rounded-xl border text-center transition-all ${
                      sector === s.id
                        ? "border-violet-500 bg-violet-500/20 text-white"
                        : "border-slate-700 bg-slate-900 text-slate-300 hover:border-slate-600"
                    }`}
                  >
                    <div className="text-2xl mb-1">{s.icon}</div>
                    <div className="text-xs font-medium">{s.label}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Descreva sua marca</h2>
              <p className="text-slate-400 mb-6">Mais detalhes = melhor resultado</p>
              <textarea
                value={briefing}
                onChange={e => setBriefing(e.target.value)}
                placeholder={`Essência de "${name}": valores, público, personalidade, diferenciais...`}
                rows={5}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 resize-none"
                autoFocus
              />
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between mt-6">
            <button
              onClick={() => (step === 0 ? router.push("/dashboard") : setStep(s => s - 1))}
              className="text-slate-400 hover:text-white transition-colors text-sm"
            >
              {step === 0 ? "← Dashboard" : "← Voltar"}
            </button>
            <button
              onClick={goNext}
              disabled={(step === 0 && !name) || (step === 1 && !sector)}
              className="bg-violet-600 hover:bg-violet-700 disabled:opacity-40 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-xl font-semibold transition-colors"
            >
              {step === 2 ? "✦ Gerar Brandbook" : "Continuar →"}
            </button>
          </div>
        </div>

        <p className="text-center text-slate-500 text-xs mt-4">
          ✦ brandbook — powered by AI
        </p>
      </div>
    </div>
  )
}
