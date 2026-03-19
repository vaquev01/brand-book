import { auth } from "@/app/auth"
import { prisma } from "@/lib/prisma"
import { PricingTable } from "@/components/PricingTable"
import { getPlanLimits } from "@/lib/planLimits"
import { BillingActions } from "@/components/BillingActions"

export const metadata = {
  title: "Plano & Cobranca — brandbook",
}

export default async function BillingPage({
  searchParams,
}: {
  searchParams: { success?: string; canceled?: string }
}) {
  const session = await auth()
  const user = session?.user
  const params = searchParams

  const dbUser = await prisma.user.findUnique({
    where: { id: user!.id },
    select: {
      subscriptionTier: true,
      email: true,
      name: true,
      stripeCustomerId: true,
      _count: {
        select: { projects: true, generationJobs: true },
      },
    },
  })

  const currentPlan: string = dbUser?.subscriptionTier ?? "free"
  const limits = getPlanLimits(currentPlan)
  const hasStripeCustomer = !!dbUser?.stripeCustomerId

  // Usage stats
  const projectCount = dbUser?._count?.projects ?? 0

  // Count generations today
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)
  const generationsToday = await prisma.generationJob.count({
    where: {
      requestedById: user!.id,
      createdAt: { gte: todayStart },
    },
  })

  const planLabel: Record<string, string> = {
    free: "Free",
    pro: "Pro",
    team: "Team",
    agency: "Agency",
    enterprise: "Enterprise",
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Success/Cancel banners */}
      {params.success === "true" && (
        <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-6 py-4 shadow-sm">
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 text-emerald-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
            <div>
              <p className="font-semibold text-emerald-800">Assinatura ativada com sucesso!</p>
              <p className="text-sm text-emerald-600 mt-0.5">Seu plano foi atualizado. Aproveite todos os recursos.</p>
            </div>
          </div>
        </div>
      )}

      {params.canceled === "true" && (
        <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-6 py-4 shadow-sm">
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 text-amber-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
            </svg>
            <div>
              <p className="font-semibold text-amber-800">Checkout cancelado</p>
              <p className="text-sm text-amber-600 mt-0.5">Nenhuma cobranca foi feita. Voce pode tentar novamente quando quiser.</p>
            </div>
          </div>
        </div>
      )}

      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Plano &amp; Cobranca</h1>
        <p className="text-gray-500 mt-1">
          Plano atual:{" "}
          <span className="font-semibold capitalize text-violet-600">
            {planLabel[currentPlan] ?? currentPlan}
          </span>
        </p>
      </div>

      {/* Current plan summary */}
      <div className="mb-10 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-gray-900">Resumo do plano atual</h2>
          {hasStripeCustomer && currentPlan !== "free" && (
            <BillingActions action="portal" />
          )}
        </div>

        {/* Usage stats */}
        <div className="mb-6 rounded-xl border border-violet-100 bg-violet-50/50 p-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-violet-600 mb-3">Uso atual</h3>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <UsageStat
              label="Projetos"
              current={projectCount}
              max={limits.maxProjects}
            />
            <UsageStat
              label="Geracoes hoje"
              current={generationsToday}
              max={limits.maxGenerationsPerDay}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          <SummaryItem
            label="Projetos"
            value={limits.maxProjects === -1 ? "Ilimitados" : `ate ${limits.maxProjects}`}
          />
          <SummaryItem
            label="Geracoes / dia"
            value={limits.maxGenerationsPerDay === -1 ? "Ilimitadas" : `${limits.maxGenerationsPerDay}`}
          />
          <SummaryItem
            label="Imagens / projeto"
            value={limits.maxImagesPerProject === -1 ? "Ilimitadas" : `ate ${limits.maxImagesPerProject}`}
          />
          <SummaryItem
            label="Export PDF"
            value={limits.exportPdf ? (limits.pdfWatermark ? "Com marca d'agua" : "Sem marca d'agua") : "Nao incluido"}
            highlight={limits.exportPdf && !limits.pdfWatermark}
          />
          <SummaryItem
            label="Design Tokens"
            value={limits.exportTokens ? "Incluido" : "Nao incluido"}
            highlight={limits.exportTokens}
          />
          <SummaryItem
            label="Colaboracao"
            value={limits.collaboration ? "Incluida" : "Nao incluida"}
            highlight={limits.collaboration}
          />
          <SummaryItem
            label="Acesso a API"
            value={limits.apiAccess ? "Incluido" : "Nao incluido"}
            highlight={limits.apiAccess}
          />
          <SummaryItem
            label="White-label"
            value={limits.whiteLabel ? "Incluido" : "Nao incluido"}
            highlight={limits.whiteLabel}
          />
        </div>
      </div>

      {/* Pricing table */}
      <PricingTable currentPlan={currentPlan} />
    </div>
  )
}

// ---- UsageStat ----

interface UsageStatProps {
  label: string
  current: number
  max: number
}

function UsageStat({ label, current, max }: UsageStatProps) {
  const isUnlimited = max === -1
  const percentage = isUnlimited ? 0 : max > 0 ? Math.min((current / max) * 100, 100) : 0
  const isNearLimit = !isUnlimited && percentage >= 80
  const isAtLimit = !isUnlimited && percentage >= 100

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-gray-600">{label}</span>
        <span className={`text-xs font-bold ${isAtLimit ? "text-red-600" : isNearLimit ? "text-amber-600" : "text-gray-900"}`}>
          {current} / {isUnlimited ? "ilimitado" : max}
        </span>
      </div>
      {!isUnlimited && (
        <div className="h-1.5 w-full rounded-full bg-gray-200 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${
              isAtLimit ? "bg-red-500" : isNearLimit ? "bg-amber-500" : "bg-violet-500"
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      )}
    </div>
  )
}

// ---- SummaryItem ----

interface SummaryItemProps {
  label: string
  value: string
  highlight?: boolean
}

function SummaryItem({ label, value, highlight = false }: SummaryItemProps) {
  return (
    <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
      <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">{label}</p>
      <p
        className={
          highlight
            ? "mt-0.5 text-sm font-semibold text-violet-700"
            : "mt-0.5 text-sm font-medium text-gray-700"
        }
      >
        {value}
      </p>
    </div>
  )
}
