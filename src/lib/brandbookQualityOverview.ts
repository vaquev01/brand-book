import type { BrandbookLintReport } from "@/lib/brandbookLinter";

export type QualityIssueSeverity = "critical" | "warning" | "suggestion";

export type QualityOverviewAiReport = {
  score: number;
  issues: Array<{ severity: QualityIssueSeverity }>;
};

export type QualityOverviewSystemReport = {
  ok: boolean;
  issues: Array<{ severity: QualityIssueSeverity }>;
};

export type BrandbookQualityOverview = {
  score: number | null;
  tone: "green" | "amber" | "red" | "gray";
  title: string;
  summary: string;
  coverage: {
    ai: boolean;
    lint: boolean;
    system: boolean;
  };
  totals: {
    critical: number;
    warning: number;
    suggestion: number;
  };
};

export type BuildBrandbookQualityOverviewInput = {
  aiReport?: QualityOverviewAiReport | null;
  lintReport?: BrandbookLintReport | null;
  systemReport?: QualityOverviewSystemReport | null;
};

function countIssues(issues: Array<{ severity: QualityIssueSeverity }>) {
  return issues.reduce(
    (acc, issue) => {
      acc[issue.severity] += 1;
      return acc;
    },
    { critical: 0, warning: 0, suggestion: 0 }
  );
}

function buildSystemScore(systemReport: QualityOverviewSystemReport): number {
  const counts = countIssues(systemReport.issues);
  const penalty = counts.critical * 30 + counts.warning * 10 + counts.suggestion * 4;
  return Math.max(0, Math.min(100, 100 - penalty));
}

export function buildBrandbookQualityOverview(
  input: BuildBrandbookQualityOverviewInput
): BrandbookQualityOverview {
  const coverage = {
    ai: !!input.aiReport,
    lint: !!input.lintReport,
    system: !!input.systemReport,
  };

  const aiCounts = input.aiReport ? countIssues(input.aiReport.issues) : { critical: 0, warning: 0, suggestion: 0 };
  const lintCounts = input.lintReport?.stats ?? { critical: 0, warning: 0, suggestion: 0 };
  const systemCounts = input.systemReport ? countIssues(input.systemReport.issues) : { critical: 0, warning: 0, suggestion: 0 };

  const totals = {
    critical: aiCounts.critical + lintCounts.critical + systemCounts.critical,
    warning: aiCounts.warning + lintCounts.warning + systemCounts.warning,
    suggestion: aiCounts.suggestion + lintCounts.suggestion + systemCounts.suggestion,
  };

  const weightedScores: Array<{ value: number; weight: number }> = [];
  if (input.aiReport) weightedScores.push({ value: input.aiReport.score, weight: 0.5 });
  if (input.lintReport) weightedScores.push({ value: input.lintReport.score, weight: 0.35 });
  if (input.systemReport) weightedScores.push({ value: buildSystemScore(input.systemReport), weight: 0.15 });

  const totalWeight = weightedScores.reduce((acc, item) => acc + item.weight, 0);
  const score = totalWeight > 0
    ? Math.round(weightedScores.reduce((acc, item) => acc + item.value * item.weight, 0) / totalWeight)
    : null;

  if (!coverage.ai && !coverage.lint && !coverage.system) {
    return {
      score: null,
      tone: "gray",
      title: "Qualidade geral ainda não calculada",
      summary: "Rode o lint, a saúde do sistema e a auditoria por IA para ter uma visão consolidada da prontidão do brandbook.",
      coverage,
      totals,
    };
  }

  if (totals.critical > 0) {
    return {
      score,
      tone: "red",
      title: "Qualidade geral em risco",
      summary: `Há ${totals.critical} item(ns) crítico(s) somando IA, lint e saúde do sistema. Corrija esses bloqueios antes do handoff final.`,
      coverage,
      totals,
    };
  }

  if ((score ?? 0) >= 90 && totals.warning === 0) {
    return {
      score,
      tone: "green",
      title: "Qualidade geral forte",
      summary: "Os sinais automatizados apontam boa coerência, boa prontidão operacional e ausência de bloqueios críticos.",
      coverage,
      totals,
    };
  }

  return {
    score,
    tone: "amber",
    title: "Qualidade geral boa, com ressalvas",
    summary: `O brandbook está em bom caminho, mas ainda há ${totals.warning} aviso(s) e ${totals.suggestion} sugestão(ões) para elevar a qualidade final.`,
    coverage,
    totals,
  };
}
