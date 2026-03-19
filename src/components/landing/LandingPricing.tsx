"use client"

import { motion } from "framer-motion"
import { Check, X, Star } from "lucide-react"
import { SectionWrapper, fadeInUp, fadeIn } from "./LandingShared"

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

interface Props {
  onPlanCta: (href: string) => void
}

export function LandingPricing({ onPlanCta }: Props) {
  return (
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
                onClick={() => onPlanCta(plan.href)}
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
  )
}
