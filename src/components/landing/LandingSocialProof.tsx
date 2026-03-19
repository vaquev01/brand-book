"use client"

import { useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"
import { Star } from "lucide-react"
import { SectionWrapper, GlassCard, fadeInUp, fadeIn } from "./LandingShared"

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

function useCountUp(end: number, duration = 2000) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const hasStarted = useRef(false)

  useEffect(() => {
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
  }, [end, duration])

  return { count, ref }
}

export function LandingSocialProof() {
  const brandsCreated = useCountUp(2847, 2500)
  const sectionsGenerated = useCountUp(68328, 2500)
  const hoursShaved = useCountUp(14200, 2500)

  return (
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
          {TESTIMONIALS.map((t) => (
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
  )
}
