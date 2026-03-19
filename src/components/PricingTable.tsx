"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"

// ─── Types ────────────────────────────────────────────────────────────────────

interface PlanFeature {
  label: string
  included: boolean
}

interface PricingPlan {
  id: string
  name: string
  description: string
  price: string
  priceNote?: string
  badge?: string
  features: PlanFeature[]
  ctaLabel: string
  ctaHref: string
  highlighted?: boolean
}

interface PricingTableProps {
  currentPlan?: string
}

// ─── Plan definitions ─────────────────────────────────────────────────────────

const ALL_FEATURES = [
  "Projetos",
  "Gerações de brandbook por dia",
  "Export PDF",
  "PDF sem marca d'água",
  "Design Tokens (CSS/JSON)",
  "Export ZIP",
  "Análise de saúde da marca",
  "Colaboração em equipe",
  "Domínio personalizado",
  "Acesso à API",
  "White-label",
  "Webhooks",
  "Suporte prioritário",
]

const PLANS: PricingPlan[] = [
  {
    id: "free",
    name: "Free",
    description: "Para projetos pessoais e exploração",
    price: "R$ 0",
    priceNote: "/ mês",
    features: [
      { label: "1 projeto", included: true },
      { label: "3 gerações por dia", included: true },
      { label: "Export PDF", included: true },
      { label: "PDF sem marca d'água", included: false },
      { label: "Design Tokens (CSS/JSON)", included: false },
      { label: "Export ZIP", included: false },
      { label: "Análise de saúde da marca", included: false },
      { label: "Colaboração em equipe", included: false },
      { label: "Domínio personalizado", included: false },
      { label: "Acesso à API", included: false },
      { label: "White-label", included: false },
      { label: "Webhooks", included: false },
      { label: "Suporte da comunidade", included: true },
    ],
    ctaLabel: "Começar grátis",
    ctaHref: "/login",
  },
  {
    id: "pro",
    name: "Pro",
    description: "Para designers e profissionais de marca",
    price: "R$ 149",
    priceNote: "/ mês",
    badge: "Mais popular",
    highlighted: true,
    features: [
      { label: "5 projetos", included: true },
      { label: "25 gerações por dia", included: true },
      { label: "Export PDF", included: true },
      { label: "PDF sem marca d'água", included: true },
      { label: "Design Tokens (CSS/JSON)", included: true },
      { label: "Export ZIP", included: true },
      { label: "Análise de saúde da marca", included: true },
      { label: "Colaboração em equipe", included: false },
      { label: "Domínio personalizado", included: false },
      { label: "Acesso à API", included: false },
      { label: "White-label", included: false },
      { label: "Webhooks", included: false },
      { label: "Suporte prioritário", included: true },
    ],
    ctaLabel: "Assinar Pro",
    ctaHref: "/billing/checkout?plan=pro",
  },
  {
    id: "team",
    name: "Team",
    description: "Para equipes de design e branding",
    price: "R$ 499",
    priceNote: "/ mês",
    features: [
      { label: "20 projetos", included: true },
      { label: "100 gerações por dia", included: true },
      { label: "Export PDF", included: true },
      { label: "PDF sem marca d'água", included: true },
      { label: "Design Tokens (CSS/JSON)", included: true },
      { label: "Export ZIP", included: true },
      { label: "Análise de saúde da marca", included: true },
      { label: "Colaboração em equipe", included: true },
      { label: "Domínio personalizado", included: true },
      { label: "Acesso à API", included: false },
      { label: "White-label", included: false },
      { label: "Webhooks", included: true },
      { label: "Suporte prioritário", included: true },
    ],
    ctaLabel: "Assinar Team",
    ctaHref: "/billing/checkout?plan=team",
  },
  {
    id: "agency",
    name: "Agency",
    description: "Para agências com múltiplos clientes",
    price: "R$ 1.499",
    priceNote: "/ mês",
    features: [
      { label: "Projetos ilimitados", included: true },
      { label: "Gerações ilimitadas", included: true },
      { label: "Export PDF", included: true },
      { label: "PDF sem marca d'água", included: true },
      { label: "Design Tokens (CSS/JSON)", included: true },
      { label: "Export ZIP", included: true },
      { label: "Análise de saúde da marca", included: true },
      { label: "Colaboração em equipe", included: true },
      { label: "Domínio personalizado", included: true },
      { label: "Acesso à API", included: true },
      { label: "White-label", included: true },
      { label: "Webhooks", included: true },
      { label: "Suporte dedicado", included: true },
    ],
    ctaLabel: "Assinar Agency",
    ctaHref: "/billing/checkout?plan=agency",
  },
]

// ─── Sub-components ───────────────────────────────────────────────────────────

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      className={cn("h-4 w-4 shrink-0", className)}
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="8" cy="8" r="8" className="fill-current opacity-15" />
      <path
        d="M5 8l2 2 4-4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg
      className={cn("h-4 w-4 shrink-0", className)}
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M5 5l6 6M11 5l-6 6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  )
}

// ─── PlanCard ─────────────────────────────────────────────────────────────────

interface PlanCardProps {
  plan: PricingPlan
  isCurrent: boolean
}

function PlanCard({ plan, isCurrent }: PlanCardProps) {
  const isHighlighted = plan.highlighted
  const [loading, setLoading] = useState(false)

  async function handleCheckout() {
    if (isCurrent || plan.id === "free") return
    setLoading(true)
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: plan.id }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Erro ao iniciar checkout")
      if (data.url) window.location.href = data.url
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Erro desconhecido")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className={cn(
        "relative flex flex-col rounded-2xl border bg-white p-6 shadow-sm transition-shadow hover:shadow-md",
        isHighlighted
          ? "border-violet-500 ring-2 ring-violet-500/30 shadow-violet-100"
          : "border-gray-200",
        isCurrent && "ring-2 ring-emerald-400/40 border-emerald-400"
      )}
    >
      {/* Popular badge */}
      {plan.badge && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="inline-flex items-center gap-1 rounded-full bg-violet-600 px-3 py-0.5 text-xs font-semibold text-white shadow-sm">
            <svg className="h-3 w-3" viewBox="0 0 12 12" fill="currentColor" aria-hidden="true">
              <path d="M6 0l1.5 4.5H12L8.25 7.5 9.75 12 6 9 2.25 12l1.5-4.5L0 4.5h4.5z" />
            </svg>
            {plan.badge}
          </span>
        </div>
      )}

      {/* Current plan badge */}
      {isCurrent && (
        <div className="absolute -top-3 right-4">
          <span className="inline-flex items-center rounded-full bg-emerald-500 px-3 py-0.5 text-xs font-semibold text-white shadow-sm">
            Plano atual
          </span>
        </div>
      )}

      {/* Header */}
      <div className="mb-5">
        <h3
          className={cn(
            "text-lg font-bold",
            isHighlighted ? "text-violet-700" : "text-gray-900"
          )}
        >
          {plan.name}
        </h3>
        <p className="mt-1 text-sm text-gray-500">{plan.description}</p>
      </div>

      {/* Price */}
      <div className="mb-6 flex items-end gap-1">
        <span
          className={cn(
            "text-4xl font-extrabold tracking-tight",
            isHighlighted ? "text-violet-700" : "text-gray-900"
          )}
        >
          {plan.price}
        </span>
        {plan.priceNote && (
          <span className="mb-1 text-sm text-gray-400">{plan.priceNote}</span>
        )}
      </div>

      {/* CTA Button */}
      <button
        onClick={handleCheckout}
        disabled={isCurrent || loading || plan.id === "free"}
        className={cn(
          "mb-6 block w-full rounded-xl py-2.5 text-center text-sm font-semibold transition-colors",
          isCurrent
            ? "cursor-default bg-gray-100 text-gray-400"
            : isHighlighted
            ? "bg-violet-600 text-white hover:bg-violet-700 shadow-sm disabled:opacity-50"
            : "bg-gray-900 text-white hover:bg-gray-800 disabled:opacity-50"
        )}
      >
        {loading ? (
          <span className="inline-flex items-center gap-2">
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Redirecionando...
          </span>
        ) : isCurrent ? (
          "Plano atual"
        ) : (
          plan.ctaLabel
        )}
      </button>

      {/* Feature list */}
      <ul className="space-y-2.5">
        {plan.features.map((feature) => (
          <li key={feature.label} className="flex items-center gap-2.5 text-sm">
            {feature.included ? (
              <CheckIcon
                className={isHighlighted ? "text-violet-600" : "text-emerald-500"}
              />
            ) : (
              <XIcon className="text-gray-300" />
            )}
            <span
              className={cn(
                feature.included ? "text-gray-700" : "text-gray-400 line-through"
              )}
            >
              {feature.label}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

// ─── PricingTable ─────────────────────────────────────────────────────────────

export function PricingTable({ currentPlan = "free" }: PricingTableProps) {
  return (
    <section aria-labelledby="pricing-heading">
      <div className="mb-8 text-center">
        <h2
          id="pricing-heading"
          className="text-3xl font-extrabold tracking-tight text-gray-900"
        >
          Escolha seu plano
        </h2>
        <p className="mt-2 text-gray-500">
          Comece grátis. Faça upgrade conforme sua marca cresce.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {PLANS.map((plan) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            isCurrent={currentPlan === plan.id}
          />
        ))}
      </div>

      <p className="mt-8 text-center text-xs text-gray-400">
        Todos os planos incluem 14 dias de teste grátis. Cancele quando quiser.
        Pagamentos processados com segurança via Stripe.
      </p>
    </section>
  )
}

export default PricingTable
