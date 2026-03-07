"use client";

import { useQuery } from "@tanstack/react-query";
import { ShieldAlert, ShieldCheck, ShieldQuestion } from "lucide-react";
import { fetchSystemHealth } from "@/lib/systemHealthClient";
import { cn } from "@/lib/utils";

export function SystemHealthBadge() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["system-health"],
    queryFn: fetchSystemHealth,
    staleTime: 60_000,
  });

  const criticalCount = data?.issues.filter((issue) => issue.severity === "critical").length ?? 0;
  const warningCount = data?.issues.filter((issue) => issue.severity === "warning").length ?? 0;

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold",
        isError && "border-amber-200 bg-amber-50 text-amber-800",
        isLoading && "border-gray-200 bg-gray-50 text-gray-600",
        !isLoading && !isError && data?.ok && "border-emerald-200 bg-emerald-50 text-emerald-700",
        !isLoading && !isError && !data?.ok && "border-red-200 bg-red-50 text-red-700"
      )}
      title={data?.summary ?? "Estado estrutural do sistema"}
    >
      {isLoading ? (
        <ShieldQuestion className="h-4 w-4" />
      ) : isError ? (
        <ShieldAlert className="h-4 w-4" />
      ) : data?.ok ? (
        <ShieldCheck className="h-4 w-4" />
      ) : (
        <ShieldAlert className="h-4 w-4" />
      )}
      <span>
        {isLoading
          ? "Auditando sistema"
          : isError
            ? "Health indisponível"
            : data?.ok
              ? "Saúde estrutural ok"
              : `${criticalCount} crítico(s) · ${warningCount} aviso(s)`}
      </span>
    </div>
  );
}
