"use client"

import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"
import { SectionWrapper, fadeInUp, scaleIn } from "./LandingShared"

interface Props {
  loading: boolean
  onAccess: () => void
}

export function LandingFooter({ loading, onAccess }: Props) {
  return (
    <>
      {/* Philosophy / Quote */}
      <SectionWrapper className="py-16 sm:py-20">
        <motion.div variants={fadeInUp} className="max-w-3xl mx-auto text-center">
          <blockquote className="text-xl sm:text-2xl lg:text-[1.75rem] font-bold text-white/50 leading-[1.5] tracking-tight">
            &ldquo;Um bom manual de marca nao e um documento. E a{" "}
            <span className="text-white/90">traducao visual da alma</span> de um negocio.&rdquo;
          </blockquote>
        </motion.div>
      </SectionWrapper>

      {/* Final CTA */}
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
                  onClick={onAccess}
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

      {/* Footer */}
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
    </>
  )
}
