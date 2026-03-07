"use client";

import { useEffect, useState } from "react";
import type { BrandbookData } from "@/lib/types";
import type { BrandbookLintReport } from "@/lib/brandbookLinter";
import { fetchBrandbookLintReport } from "@/lib/brandbookLintClient";
import { getProfessionalExportGateSummary, getProtectedExportGuard, type ProtectedExportIntent } from "@/lib/brandbookQualityGate";
import { exportCSSTokens, exportW3CTokens, exportTailwindConfig, downloadTextFile } from "@/lib/exportUtils";
import { copyShareUrl } from "@/lib/shareUtils";
import { exportBrandbookPDFMultiPage } from "@/lib/pdfExport";
import { Code2, Coins, Wind, FileText, Link2, Download, Check, AlertCircle, Loader2, ShieldCheck, ShieldAlert, ShieldQuestion } from "lucide-react";

interface Props {
  brandbook: BrandbookData;
  viewerElementId: string;
}

type ExportStatus = "idle" | "loading" | "done" | "error";

interface ExportState {
  css: ExportStatus;
  tokens: ExportStatus;
  tailwind: ExportStatus;
  pdf: ExportStatus;
  share: ExportStatus;
}

type ExportKey = keyof ExportState;

type ExportErrors = Partial<Record<ExportKey, string>>;

export function ExportPanel({ brandbook, viewerElementId }: Props) {
  const [status, setStatus] = useState<ExportState>({
    css: "idle", tokens: "idle", tailwind: "idle", pdf: "idle", share: "idle",
  });
  const [shareMsg, setShareMsg] = useState("");
  const [errors, setErrors] = useState<ExportErrors>({});
  const [lintLoading, setLintLoading] = useState(false);
  const [lintError, setLintError] = useState("");
  const [lintReport, setLintReport] = useState<BrandbookLintReport | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function refreshLint() {
      setLintLoading(true);
      setLintError("");
      try {
        const report = await fetchBrandbookLintReport(brandbook);
        if (!cancelled) setLintReport(report);
      } catch (err: unknown) {
        if (!cancelled) {
          setLintError(err instanceof Error ? err.message : "Erro ao verificar prontidão de export.");
          setLintReport(null);
        }
      } finally {
        if (!cancelled) setLintLoading(false);
      }
    }

    void refreshLint();
    return () => {
      cancelled = true;
    };
  }, [brandbook]);

  function setS(key: keyof ExportState, val: ExportStatus) {
    setStatus((p) => ({ ...p, [key]: val }));
  }

  function setErr(key: ExportKey, msg = "") {
    setErrors((p) => ({ ...p, [key]: msg }));
  }

  function guardProtectedExport(intent: ProtectedExportIntent, key: ExportKey): boolean {
    if (!lintReport) return true;
    const guard = getProtectedExportGuard(intent, lintReport);
    if (guard.allowed) return true;
    setS(key, "error");
    setErr(key, guard.reason ?? "Export bloqueado pelo quality gate.");
    setTimeout(() => setS(key, "idle"), 4000);
    return false;
  }

  async function handleCSS() {
    setS("css", "loading");
    setErr("css", "");
    if (!guardProtectedExport("css", "css")) return;
    try {
      const content = exportCSSTokens(brandbook);
      const slug = brandbook.brandName.toLowerCase().replace(/\s+/g, "-");
      downloadTextFile(content, `${slug}-tokens.css`, "text/css");
      setS("css", "done");
      setTimeout(() => setS("css", "idle"), 3000);
    } catch (err: unknown) {
      setS("css", "error");
      setErr("css", err instanceof Error ? err.message : "Falha ao exportar CSS.");
    }
  }

  async function handleW3C() {
    setS("tokens", "loading");
    setErr("tokens", "");
    if (!guardProtectedExport("tokens", "tokens")) return;
    try {
      const content = exportW3CTokens(brandbook);
      const slug = brandbook.brandName.toLowerCase().replace(/\s+/g, "-");
      downloadTextFile(content, `${slug}-tokens.json`, "application/json");
      setS("tokens", "done");
      setTimeout(() => setS("tokens", "idle"), 3000);
    } catch (err: unknown) {
      setS("tokens", "error");
      setErr("tokens", err instanceof Error ? err.message : "Falha ao exportar tokens.");
    }
  }

  async function handleTailwind() {
    setS("tailwind", "loading");
    setErr("tailwind", "");
    if (!guardProtectedExport("tailwind", "tailwind")) return;
    try {
      const content = exportTailwindConfig(brandbook);
      const slug = brandbook.brandName.toLowerCase().replace(/\s+/g, "-");
      downloadTextFile(content, `${slug}-tailwind.config.js`, "text/javascript");
      setS("tailwind", "done");
      setTimeout(() => setS("tailwind", "idle"), 3000);
    } catch (err: unknown) {
      setS("tailwind", "error");
      setErr("tailwind", err instanceof Error ? err.message : "Falha ao exportar Tailwind config.");
    }
  }

  async function handlePDF() {
    setS("pdf", "loading");
    setErr("pdf", "");
    if (!guardProtectedExport("pdf", "pdf")) return;
    try {
      await exportBrandbookPDFMultiPage(viewerElementId, brandbook);
      setS("pdf", "done");
      setTimeout(() => setS("pdf", "idle"), 3000);
    } catch (err: unknown) {
      console.error(err);
      setS("pdf", "error");
      setErr("pdf", err instanceof Error ? err.message : "Falha ao exportar PDF.");
      setTimeout(() => setS("pdf", "idle"), 4000);
    }
  }

  async function handleShare() {
    setS("share", "loading");
    setErr("share", "");
    setShareMsg("");
    try {
      const result = await copyShareUrl(brandbook);
      if (!result) throw new Error("Falha ao comprimir dados");
      const sizeLabel = result.sizeKB > 100 ? ` (${result.sizeKB}KB — URL longa)` : "";
      if (!result.copied) {
        window.prompt("Clipboard bloqueado. Copie o link manualmente:", result.url);
        setShareMsg(`Link gerado. Copie manualmente.${sizeLabel}`);
      } else {
        setShareMsg(`URL copiada para o clipboard!${sizeLabel}`);
      }
      setS("share", "done");
      setTimeout(() => { setS("share", "idle"); setShareMsg(""); }, 5000);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro ao gerar link.";
      setShareMsg(message);
      setS("share", "error");
      setErr("share", message);
      setTimeout(() => { setS("share", "idle"); setShareMsg(""); }, 4000);
    }
  }

  function btnClass(s: ExportStatus) {
    if (s === "done") return "bg-green-50 border-green-400 text-green-800 ring-2 ring-green-100";
    if (s === "loading") return "opacity-70 cursor-not-allowed bg-white border-gray-200";
    if (s === "error") return "bg-red-50 border-red-300 text-red-700";
    return "bg-white border-gray-200 text-gray-800 hover:border-indigo-300 hover:ring-4 hover:ring-indigo-50 hover:shadow-sm group";
  }

  function btnTrailing(s: ExportStatus) {
    if (s === "loading") return <Loader2 className="w-4 h-4 animate-spin text-gray-500" />;
    if (s === "done") return <Check className="w-4 h-4 text-green-600" />;
    if (s === "error") return <AlertCircle className="w-4 h-4 text-red-500" />;
    return <Download className="w-4 h-4 text-gray-400 group-hover:text-indigo-500 transition-colors" />;
  }

  function btnStatusText(s: ExportStatus, loadingLabel: string) {
    if (s === "loading") return <span className="text-xs text-gray-500">{loadingLabel}</span>;
    if (s === "done") return <span className="text-xs font-bold text-green-700">Pronto!</span>;
    if (s === "error") return <span className="text-xs font-bold text-red-600">Erro</span>;
    return null;
  }

  const gate = getProfessionalExportGateSummary(lintReport);
  const GateIcon = lintLoading ? Loader2 : gate.tone === "red" ? ShieldAlert : gate.tone === "green" ? ShieldCheck : ShieldQuestion;
  const gateClass = gate.tone === "red"
    ? "bg-red-50 border-red-200 text-red-800"
    : gate.tone === "green"
      ? "bg-green-50 border-green-200 text-green-800"
      : gate.tone === "amber"
        ? "bg-amber-50 border-amber-200 text-amber-800"
        : "bg-gray-50 border-gray-200 text-gray-700";

  const sections = [
    {
      title: "Código & Design Tokens",
      desc: "Exporte o design system em formatos prontos para desenvolvimento",
      items: [
        {
          key: "css" as const,
          Icon: Code2,
          label: "CSS Custom Properties",
          sub: "Variáveis CSS prontas para colar no seu projeto",
          loadingLabel: "Gerando CSS...",
          onClick: handleCSS,
        },
        {
          key: "tokens" as const,
          Icon: Coins,
          label: "Design Tokens (JSON)",
          sub: "Tokens de cores, tipografia e espaçamento — compatível com Style Dictionary e Figma Tokens",
          loadingLabel: "Gerando tokens...",
          onClick: handleW3C,
        },
        {
          key: "tailwind" as const,
          Icon: Wind,
          label: "Tailwind Config",
          sub: "Extenda seu tailwind.config.js com as cores e fontes da marca",
          loadingLabel: "Gerando config...",
          onClick: handleTailwind,
        },
      ],
    },
    {
      title: "Exportação Visual",
      desc: "Exporte o brandbook como PDF para apresentação",
      items: [
        {
          key: "pdf" as const,
          Icon: FileText,
          label: "PDF — Brandbook Completo",
          sub: "Captura o viewer como PDF multi-página de alta resolução",
          loadingLabel: "Gerando PDF...",
          onClick: handlePDF,
        },
      ],
    },
    {
      title: "Compartilhar",
      desc: "Compartilhe o brandbook com seu time ou cliente",
      items: [
        {
          key: "share" as const,
          Icon: Link2,
          label: "Copiar link de compartilhamento",
          sub: shareMsg || "Gera uma URL com o brandbook comprimido para compartilhar",
          loadingLabel: "Comprimindo...",
          onClick: handleShare,
        },
      ],
    },
  ];

  return (
    <div className="space-y-8">
      <div className={`border rounded-2xl p-4 ${gateClass}`}>
        <div className="flex items-start gap-3">
          <GateIcon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${lintLoading ? "animate-spin" : ""}`} />
          <div className="min-w-0 flex-1">
            <div className="font-bold text-sm">{gate.title}</div>
            <div className="text-xs mt-1 leading-relaxed opacity-90">{gate.description}</div>
            {lintReport && (
              <div className="flex gap-2 mt-3 flex-wrap text-[11px]">
                <span className="px-2 py-1 rounded-full bg-white/70 border border-current/10 font-medium">score {lintReport.score}</span>
                <span className="px-2 py-1 rounded-full bg-white/70 border border-current/10 font-medium">{lintReport.stats.critical} crítico(s)</span>
                <span className="px-2 py-1 rounded-full bg-white/70 border border-current/10 font-medium">{lintReport.stats.warning} aviso(s)</span>
                <span className="px-2 py-1 rounded-full bg-white/70 border border-current/10 font-medium">{lintReport.stats.suggestion} sugestão(ões)</span>
              </div>
            )}
            {lintError && <div className="text-xs mt-2 text-red-700">{lintError}</div>}
          </div>
        </div>
      </div>
      {sections.map((section) => (
        <div key={section.title}>
          <div className="mb-4 pb-3 border-b border-gray-100">
            <h3 className="font-bold text-gray-900">{section.title}</h3>
            <p className="text-xs text-gray-500 mt-0.5">{section.desc}</p>
          </div>
          <div className="space-y-2.5">
            {section.items.map((item) => {
              const s = status[item.key];
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={item.onClick}
                  disabled={s === "loading"}
                  className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left ${btnClass(s)}`}
                >
                  <div className="w-11 h-11 bg-gray-50 group-hover:bg-indigo-50 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors border border-gray-100 group-hover:border-indigo-100">
                    <item.Icon className="w-5 h-5 text-gray-500 group-hover:text-indigo-600 transition-colors" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-sm text-gray-900 group-hover:text-indigo-900 transition-colors">{item.label}</div>
                    <div className="text-xs text-gray-500 mt-0.5 leading-relaxed">{item.sub}</div>
                    {s === "error" && errors[item.key] && (
                      <div className="text-[11px] text-red-600 mt-1 line-clamp-2">{errors[item.key]}</div>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    {btnTrailing(s)}
                    {btnStatusText(s, item.loadingLabel)}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
