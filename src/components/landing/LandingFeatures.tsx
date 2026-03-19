"use client"

import { motion } from "framer-motion"
import {
  Sparkles,
  Eye,
  BookOpen,
  LayoutGrid,
  Monitor,
  Download,
} from "lucide-react"
import { SectionWrapper, fadeInUp, staggerContainer } from "./LandingShared"

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

export function LandingFeatures() {
  return (
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
  )
}
