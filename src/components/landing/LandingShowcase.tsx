"use client"

import { useState } from "react"
import { motion, AnimatePresence, type Variants } from "framer-motion"
import { ChevronRight, Sparkles, MessageSquare, Send } from "lucide-react"
import { SHOWCASE_BRANDS } from "./LandingHero"
import { SectionWrapper, GlassCard, fadeInUp, staggerContainer } from "./LandingShared"

export function LandingShowcase() {
  const [expandedBrand, setExpandedBrand] = useState<number | null>(null)

  return (
    <>
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
                          {b.sections.map((s) => (
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

      {/* How It Works */}
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
                ].map((step) => (
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
    </>
  )
}
