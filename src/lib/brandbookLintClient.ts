import type { BrandbookData } from "@/lib/types";
import type { BrandbookLintReport } from "@/lib/brandbookLinter";
import { readJsonResponse } from "@/lib/http";

export async function fetchBrandbookLintReport(brandbook: BrandbookData): Promise<BrandbookLintReport> {
  const res = await fetch("/api/brandbook-lint", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ brandbook }),
  });

  const data = await readJsonResponse<BrandbookLintReport | { error?: string }>(res, "/api/brandbook-lint");
  if (!res.ok) {
    throw new Error((data as { error?: string }).error ?? "Erro ao executar lint do brandbook");
  }

  return data as BrandbookLintReport;
}
