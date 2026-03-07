export type SystemHealthIssue = {
  severity: "critical" | "warning" | "suggestion";
  area: string;
  issue: string;
  fix: string;
};

export type SystemHealthReport = {
  ok: boolean;
  summary: string;
  meta: {
    version: string;
    generatedAt: string;
    entries: number;
  };
  stats: {
    assets: number;
    categories: Record<string, number>;
    aspectRatios: Record<string, number>;
  };
  issues: SystemHealthIssue[];
};

export async function fetchSystemHealth(): Promise<SystemHealthReport> {
  const response = await fetch("/api/system-health", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const fallback = await response.text().catch(() => "");
    throw new Error(fallback || "Não foi possível carregar a saúde do sistema.");
  }

  return response.json() as Promise<SystemHealthReport>;
}
