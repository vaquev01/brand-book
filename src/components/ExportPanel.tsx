"use client";

import { useState } from "react";
import type { BrandbookData } from "@/lib/types";
import { exportCSSTokens, exportW3CTokens, exportTailwindConfig, downloadTextFile } from "@/lib/exportUtils";
import { copyShareUrl } from "@/lib/shareUtils";
import { exportBrandbookPDFMultiPage } from "@/lib/pdfExport";
import { Code2, Coins, Wind, FileText, Link2, Download, Check, AlertCircle, Loader2 } from "lucide-react";

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

export function ExportPanel({ brandbook, viewerElementId }: Props) {
  const [status, setStatus] = useState<ExportState>({
    css: "idle", tokens: "idle", tailwind: "idle", pdf: "idle", share: "idle",
  });
  const [shareMsg, setShareMsg] = useState("");

  function setS(key: keyof ExportState, val: ExportStatus) {
    setStatus((p) => ({ ...p, [key]: val }));
  }

  async function handleCSS() {
    setS("css", "loading");
    try {
      const content = exportCSSTokens(brandbook);
      const slug = brandbook.brandName.toLowerCase().replace(/\s+/g, "-");
      downloadTextFile(content, `${slug}-tokens.css`, "text/css");
      setS("css", "done");
      setTimeout(() => setS("css", "idle"), 3000);
    } catch { setS("css", "error"); }
  }

  async function handleW3C() {
    setS("tokens", "loading");
    try {
      const content = exportW3CTokens(brandbook);
      const slug = brandbook.brandName.toLowerCase().replace(/\s+/g, "-");
      downloadTextFile(content, `${slug}-tokens.json`, "application/json");
      setS("tokens", "done");
      setTimeout(() => setS("tokens", "idle"), 3000);
    } catch { setS("tokens", "error"); }
  }

  async function handleTailwind() {
    setS("tailwind", "loading");
    try {
      const content = exportTailwindConfig(brandbook);
      const slug = brandbook.brandName.toLowerCase().replace(/\s+/g, "-");
      downloadTextFile(content, `${slug}-tailwind.config.js`, "text/javascript");
      setS("tailwind", "done");
      setTimeout(() => setS("tailwind", "idle"), 3000);
    } catch { setS("tailwind", "error"); }
  }

  async function handlePDF() {
    setS("pdf", "loading");
    try {
      await exportBrandbookPDFMultiPage(viewerElementId, brandbook);
      setS("pdf", "done");
      setTimeout(() => setS("pdf", "idle"), 3000);
    } catch (err) {
      console.error(err);
      setS("pdf", "error");
      setTimeout(() => setS("pdf", "idle"), 4000);
    }
  }

  async function handleShare() {
    setS("share", "loading");
    setShareMsg("");
    try {
      const result = await copyShareUrl(brandbook);
      if (!result) throw new Error("Falha ao comprimir dados");
      const sizeLabel = result.sizeKB > 100 ? ` (${result.sizeKB}KB — URL longa)` : "";
      setShareMsg(`URL copiada para o clipboard!${sizeLabel}`);
      setS("share", "done");
      setTimeout(() => { setS("share", "idle"); setShareMsg(""); }, 5000);
    } catch {
      setShareMsg("Erro ao gerar link. Tente exportar o JSON.");
      setS("share", "error");
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
