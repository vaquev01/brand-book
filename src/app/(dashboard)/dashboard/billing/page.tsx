import { auth } from "@/app/auth"
import { prisma } from "@/lib/prisma"
import { PricingTable } from "@/components/PricingTable"
import { getPlanLimits } from "@/lib/planLimits"

export const metadata = {
  title: "Plano & Cobrança — brandbook",
}

export default async function BillingPage() {
  const session = await auth()
  const user = session?.user

  // Get current user subscription
  const dbUser = await prisma.user.findUnique({
    where: { id: user!.id },
    select: { subscriptionTier: true, email: true, name: true },
  })

  // Normalize to string so it's compatible with plan utility functions and components
  const currentPlan: string = dbUser?.subscriptionTier ?? "free"
  const limits = getPlanLimits(currentPlan)

  const planLabel: Record<string, string> = {
    free: "Free",
    pro: "Pro",
    team: "Team",
    agency: "Agency",
    enterprise: "Enterprise",
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Plano &amp; Cobrança</h1>
        <p className="text-gray-500 mt-1">
          Plano atual:{" "}
          <span className="font-semibold capitalize text-violet-600">
            {planLabel[currentPlan] ?? currentPlan}
          </span>
        </p>
      </div>

      {/* Current plan summary */}
      <div className="mb-10 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Resumo do plano atual</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          <SummaryItem
            label="Projetos"
            value={limits.maxProjects === -1 ? "Ilimitados" : `até ${limits.maxProjects}`}
          />
          <SummaryItem
            label="Gerações / dia"
            value={limits.maxGenerationsPerDay === -1 ? "Ilimitadas" : `${limits.maxGenerationsPerDay}`}
          />
          <SummaryItem
            label="Imagens / projeto"
            value={limits.maxImagesPerProject === -1 ? "Ilimitadas" : `até ${limits.maxImagesPerProject}`}
          />
          <SummaryItem
            label="Export PDF"
            value={limits.exportPdf ? (limits.pdfWatermark ? "Com marca d'água" : "Sem marca d'água") : "Não incluído"}
            highlight={limits.exportPdf && !limits.pdfWatermark}
          />
          <SummaryItem
            label="Design Tokens"
            value={limits.exportTokens ? "Incluído" : "Não incluído"}
            highlight={limits.exportTokens}
          />
          <SummaryItem
            label="Colaboração"
            value={limits.collaboration ? "Incluída" : "Não incluída"}
            highlight={limits.collaboration}
          />
          <SummaryItem
            label="Acesso à API"
            value={limits.apiAccess ? "Incluído" : "Não incluído"}
            highlight={limits.apiAccess}
          />
          <SummaryItem
            label="White-label"
            value={limits.whiteLabel ? "Incluído" : "Não incluído"}
            highlight={limits.whiteLabel}
          />
        </div>
      </div>

      {/* Pricing table */}
      <PricingTable currentPlan={currentPlan} />
    </div>
  )
}

// ─── SummaryItem ──────────────────────────────────────────────────────────────

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
