"use client";

import { useState } from "react";
import type { BrandbookData } from "@/lib/types";
import type { ApiKeys } from "./ApiKeyConfig";
import type { ConsistencyReport, ConsistencyIssue } from "@/app/api/check-consistency/route";

interface Props {
  brandbook: BrandbookData;
  apiKeys: ApiKeys;
  textProvider: "openai" | "gemini";
}

const SEVERITY_CONFIG = {
  critical: { label: "Crítico", color: "bg-red-50 border-red-200 text-red-800", dot: "bg-red-500", icon: "🔴" },
  warning: { label: "Atenção", color: "bg-amber-50 border-amber-200 text-amber-800", dot: "bg-amber-500", icon: "🟡" },
  suggestion: { label: "Sugestão", color: "bg-blue-50 border-blue-200 text-blue-800", dot: "bg-blue-400", icon: "🔵" },
};

function ScoreRing({ score }: { score: number }) {
  const color = score >= 80 ? "#22c55e" : score >= 60 ? "#f59e0b" : "#ef4444";
  const r = 36;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  return (
    <div className="flex flex-col items-center">
      <svg width="96" height="96" viewBox="0 0 96 96">
        <circle cx="48" cy="48" r={r} fill="none" stroke="#e5e7eb" strokeWidth="8" />
        <circle
          cx="48" cy="48" r={r} fill="none"
          stroke={color} strokeWidth="8"
          strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 48 48)"
          style={{ transition: "stroke-dashoffset 1s ease" }}
        />
        <text x="48" y="48" textAnchor="middle" dominantBaseline="middle" fontSize="20" fontWeight="700" fill={color}>
          {score}
        </text>
      </svg>
      <span className="text-xs text-gray-500 mt-1">coerência da marca</span>
    </div>
  );
}

function IssueCard({ issue }: { issue: ConsistencyIssue }) {
  const [expanded, setExpanded] = useState(false);
  const cfg = SEVERITY_CONFIG[issue.severity];
  return (
    <div className={`border rounded-xl overflow-hidden ${cfg.color}`}>
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-start gap-3 p-4 text-left"
      >
        <span className="text-base mt-0.5">{cfg.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-sm">{issue.section}</span>
            <span className="text-xs px-2 py-0.5 rounded-full border border-current opacity-60">{cfg.label}</span>
          </div>
          <p className="text-sm mt-1 leading-snug">{issue.issue}</p>
        </div>
        <span className="text-xs opacity-50 flex-shrink-0 mt-1">{expanded ? "▲" : "▼"}</span>
      </button>
      {expanded && (
        <div className="px-4 pb-4 pt-0 border-t border-current/20">
          <p className="text-xs font-semibold uppercase tracking-wider opacity-60 mb-1">Como corrigir</p>
          <p className="text-sm leading-relaxed">{issue.fix}</p>
        </div>
      )}
    </div>
  );
}

export function ConsistencyPanel({ brandbook, apiKeys, textProvider }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [report, setReport] = useState<ConsistencyReport | null>(null);
  const [filter, setFilter] = useState<"all" | "critical" | "warning" | "suggestion">("all");

  async function handleCheck() {
    setLoading(true);
    setError("");
    setReport(null);

    try {
      const res = await fetch("/api/check-consistency", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brandbook,
          provider: textProvider,
          openaiKey: apiKeys.openai || undefined,
          googleKey: apiKeys.google || undefined,
          openaiModel: apiKeys.openaiTextModel || undefined,
          googleModel: apiKeys.googleTextModel || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao verificar consistência");
      setReport(data as ConsistencyReport);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  }

  const filteredIssues = report?.issues.filter(
    (i) => filter === "all" || i.severity === filter
  ) ?? [];

  const counts = report ? {
    critical: report.issues.filter((i) => i.severity === "critical").length,
    warning: report.issues.filter((i) => i.severity === "warning").length,
    suggestion: report.issues.filter((i) => i.severity === "suggestion").length,
  } : null;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-bold text-base mb-1">Auditoria de Consistência</h3>
        <p className="text-sm text-gray-500">
          A IA analisa o brandbook e identifica inconsistências, oportunidades e pontos fortes.
        </p>
      </div>

      {!report && !loading && (
        <button
          type="button"
          onClick={handleCheck}
          className="w-full bg-gray-900 text-white py-3 px-6 rounded-xl font-semibold hover:bg-gray-800 transition"
        >
          🔍 Analisar consistência do brandbook
        </button>
      )}

      {loading && (
        <div className="flex flex-col items-center gap-3 py-8">
          <div className="w-10 h-10 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin" />
          <p className="text-sm text-gray-500">Auditando brandbook... pode levar 20-30s</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-red-700 text-sm">
          {error}
        </div>
      )}

      {report && (
        <div className="space-y-6">
          <div className="flex items-center gap-6">
            <ScoreRing score={report.score} />
            <div className="flex-1">
              <p className="text-sm text-gray-700 leading-relaxed">{report.summary}</p>
              {counts && (
                <div className="flex gap-3 mt-3 flex-wrap">
                  {counts.critical > 0 && (
                    <span className="text-xs bg-red-100 text-red-700 px-2.5 py-1 rounded-full font-medium">
                      🔴 {counts.critical} crítico{counts.critical > 1 ? "s" : ""}
                    </span>
                  )}
                  {counts.warning > 0 && (
                    <span className="text-xs bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full font-medium">
                      🟡 {counts.warning} atenção
                    </span>
                  )}
                  {counts.suggestion > 0 && (
                    <span className="text-xs bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full font-medium">
                      🔵 {counts.suggestion} sugestão{counts.suggestion > 1 ? "ões" : ""}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {report.strengths.length > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <h4 className="font-semibold text-sm text-green-900 mb-2">✅ Pontos fortes</h4>
              <ul className="space-y-1">
                {report.strengths.map((s, i) => (
                  <li key={i} className="text-sm text-green-800 flex items-start gap-2">
                    <span className="opacity-50 mt-0.5">•</span> {s}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {report.issues.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Filtrar:</span>
                {(["all", "critical", "warning", "suggestion"] as const).map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setFilter(f)}
                    className={`text-xs px-3 py-1 rounded-full border transition ${
                      filter === f
                        ? "bg-gray-900 text-white border-gray-900"
                        : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
                    }`}
                  >
                    {f === "all" ? "Todos" : SEVERITY_CONFIG[f].label}
                    {f !== "all" && counts && ` (${counts[f]})`}
                  </button>
                ))}
              </div>

              <div className="space-y-2">
                {filteredIssues.map((issue, i) => (
                  <IssueCard key={i} issue={issue} />
                ))}
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={handleCheck}
            className="text-sm text-gray-500 hover:text-gray-700 underline"
          >
            Reanalisar
          </button>
        </div>
      )}
    </div>
  );
}
