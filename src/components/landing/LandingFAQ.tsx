"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown } from "lucide-react"
import { SectionWrapper, fadeInUp, staggerContainer } from "./LandingShared"

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

export function LandingFAQ() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  return (
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
  )
}
