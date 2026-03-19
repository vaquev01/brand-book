"use client";

import { useEffect, useRef, useState } from "react";
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
  projectId?: string | null;
  /** Called before sharing — should sync all images to the server and return true on success */
  onForceSyncImages?: () => Promise<boolean>;
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

export function ExportPanel({ brandbook, viewerElementId, projectId, onForceSyncImages }: Props) {
  const mountedRef = useRef(true)
  useEffect(() => { return () => { mountedRef.current = false } }, [])

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
    if (!lintReport) {
      setS(key, "error");
      setErr(key, "Aguarde a verificação de qualidade ser concluída antes de exportar.");
      setTimeout(() => { if (mountedRef.current) setS(key, "idle") }, 4000);
      return false;
    }
    const guard = getProtectedExportGuard(intent, lintReport);
    if (guard.allowed) return true;
    setS(key, "error");
    setErr(key, guard.reason ?? "Export bloqueado pelo quality gate.");
    setTimeout(() => { if (mountedRef.current) setS(key, "idle") }, 4000);
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
      setTimeout(() => { if (mountedRef.current) setS("css", "idle") }, 3000);
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
      setTimeout(() => { if (mountedRef.current) setS("tokens", "idle") }, 3000);
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
      setTimeout(() => { if (mountedRef.current) setS("tailwind", "idle") }, 3000);
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
      setTimeout(() => { if (mountedRef.current) setS("pdf", "idle") }, 3000);
    } catch (err: unknown) {
      console.error(err);
      setS("pdf", "error");
      setErr("pdf", err instanceof Error ? err.message : "Falha ao exportar PDF.");
      setTimeout(() => { if (mountedRef.current) setS("pdf", "idle") }, 4000);
    }
  }

  async function handleShare() {
    setS("share", "loading");
    setErr("share", "");
    setShareMsg("");
    try {
      // Prefer DB-based share link (includes images) when projectId is available
      if (projectId) {
        // 1. Force sync all images to server first
        if (onForceSyncImages) {
          setShareMsg("Sincronizando imagens...");
          await onForceSyncImages();
        }

        // 2. Create share link via API
        setShareMsg("Gerando link...");
        const res = await fetch("/api/share", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ projectId, expiresInDays: 30 }),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({})) as { error?: string };
          throw new Error(err.error ?? "Falha ao criar link de compartilhamento");
        }
        const { data } = await res.json() as { data: { url: string; token: string } };

        // 3. Copy to clipboard
        let copied = false;
        try {
          await navigator.clipboard.writeText(data.url);
          copied = true;
        } catch {
          copied = false;
        }

        if (!copied) {
          window.prompt("Copie o link manualmente:", data.url);
          setShareMsg("Link gerado com imagens. Copie manualmente.");
        } else {
          setShareMsg("Link copiado! Inclui todas as imagens geradas.");
        }
      } else {
        // Fallback: URL-compressed share (no images, but works without project)
        const result = await copyShareUrl(brandbook);
        if (!result) throw new Error("Falha ao comprimir dados");
        const sizeLabel = result.sizeKB > 100 ? ` (${result.sizeKB}KB — URL longa)` : "";
        if (!result.copied) {
          window.prompt("Clipboard bloqueado. Copie o link manualmente:", result.url);
          setShareMsg(`Link gerado (sem imagens).${sizeLabel}`);
        } else {
          setShareMsg(`URL copiada (sem imagens).${sizeLabel}`);
        }
      }
      setS("share", "done");
      setTimeout(() => { if (mountedRef.current) { setS("share", "idle"); setShareMsg(""); } }, 5000);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro ao gerar link.";
      setShareMsg(message);
      setS("share", "error");
      setErr("share", message);
      setTimeout(() => { if (mountedRef.current) { setS("share", "idle"); setShareMsg(""); } }, 4000);
    }
  }

  function btnClass(s: ExportStatus) {
    if (s === "done") return "border-green-300 bg-green-50 text-green-800 ring-2 ring-green-100";
    if (s === "loading") return "cursor-not-allowed border-slate-200 bg-white/90 opacity-70";
    if (s === "error") return "border-red-300 bg-red-50 text-red-700";
    return "text-gray-800";
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
      desc: "Design system pronto para desenvolvimento",
      items: [
        {
          key: "css" as const,
          Icon: Code2,
          label: "CSS Custom Properties",
          sub: "Variáveis CSS prontas para usar",
          loadingLabel: "Gerando CSS...",
          onClick: handleCSS,
        },
        {
          key: "tokens" as const,
          Icon: Coins,
          label: "Design Tokens (JSON)",
          sub: "Cores, tipografia e espaçamento — Style Dictionary / Figma Tokens",
          loadingLabel: "Gerando tokens...",
          onClick: handleW3C,
        },
        {
          key: "tailwind" as const,
          Icon: Wind,
          label: "Tailwind Config",
          sub: "Cores e fontes da marca para tailwind.config.js",
          loadingLabel: "Gerando config...",
          onClick: handleTailwind,
        },
      ],
    },
    {
      title: "Exportação Visual",
      desc: "Brandbook em PDF para apresentação",
      items: [
        {
          key: "pdf" as const,
          Icon: FileText,
          label: "PDF — Brandbook Completo",
          sub: "PDF multi-página em alta resolução",
          loadingLabel: "Gerando PDF...",
          onClick: handlePDF,
        },
      ],
    },
    {
      title: "Compartilhar",
      desc: "Envie para seu time ou cliente",
      items: [
        {
          key: "share" as const,
          Icon: Link2,
          label: "Copiar link de compartilhamento",
          sub: shareMsg || (projectId ? "Link com imagens — sincroniza antes de compartilhar" : "URL comprimida do brandbook (sem imagens)"),
          loadingLabel: "Sincronizando e gerando link...",
          onClick: handleShare,
        },
      ],
    },
  ];

  return (
    <div className="space-y-8">
      <div className={`app-surface-soft p-4 ${gateClass}`}>
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
        <div key={section.title} className="app-surface-soft p-5 sm:p-6">
          <div className="mb-4 border-b border-slate-200/80 pb-3">
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
                  className={`app-card-button group flex w-full items-center gap-4 p-4 text-left ${btnClass(s)}`}
                >
                  <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl border border-slate-100 bg-slate-50 transition-colors group-hover:border-indigo-100 group-hover:bg-indigo-50">
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
