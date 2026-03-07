import type { BrandbookLintReport } from "@/lib/brandbookLinter";

export type ProtectedExportIntent =
  | "css"
  | "tokens"
  | "tailwind"
  | "pdf"
  | "production_manifest"
  | "pack";

export type ProtectedExportGuardResult = {
  allowed: boolean;
  reason?: string;
};

export type ProfessionalExportGateSummary = {
  blocked: boolean;
  title: string;
  description: string;
  tone: "green" | "amber" | "red" | "gray";
};

const EXPORT_LABELS: Record<ProtectedExportIntent, string> = {
  css: "CSS Custom Properties",
  tokens: "Design Tokens (JSON)",
  tailwind: "Tailwind Config",
  pdf: "PDF do Brandbook",
  production_manifest: "Manifesto de Produção",
  pack: "Pack Completo (.zip)",
};

export function hasCriticalLintIssues(report: BrandbookLintReport | null | undefined): boolean {
  return (report?.stats.critical ?? 0) > 0;
}

export function getProtectedExportGuard(
  intent: ProtectedExportIntent,
  report: BrandbookLintReport
): ProtectedExportGuardResult {
  if (!hasCriticalLintIssues(report)) {
    return { allowed: true };
  }

  const label = EXPORT_LABELS[intent];
  return {
    allowed: false,
    reason: `Export bloqueado para ${label}. Corrija os ${report.stats.critical} item(ns) crítico(s) do lint antes do handoff profissional.`,
  };
}

export function getProfessionalExportGateSummary(
  report: BrandbookLintReport | null | undefined
): ProfessionalExportGateSummary {
  if (!report) {
    return {
      blocked: false,
      tone: "gray",
      title: "Prontidão de export ainda não verificada",
      description: "Rode ou atualize o lint determinístico para liberar um diagnóstico de handoff profissional.",
    };
  }

  if (report.stats.critical > 0) {
    return {
      blocked: true,
      tone: "red",
      title: "Exports profissionais bloqueados",
      description: `Há ${report.stats.critical} item(ns) crítico(s) no lint. Corrija-os antes de gerar outputs de handoff, produção ou apresentação final.`,
    };
  }

  if (report.stats.warning > 0 || report.stats.suggestion > 0) {
    return {
      blocked: false,
      tone: "amber",
      title: "Exports profissionais liberados com ressalvas",
      description: `O handoff está liberado, mas ainda existem ${report.stats.warning} aviso(s) e ${report.stats.suggestion} sugestão(ões) que podem elevar a qualidade final.`,
    };
  }

  return {
    blocked: false,
    tone: "green",
    title: "Pronto para handoff profissional",
    description: "Nenhum problema determinístico foi encontrado. Os exports profissionais estão liberados.",
  };
}
