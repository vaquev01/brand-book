"use client";

import { useState } from "react";
import type { BrandbookData } from "@/lib/types";
import { exportCSSTokens, exportW3CTokens, exportTailwindConfig, downloadTextFile } from "@/lib/exportUtils";
import { copyShareUrl } from "@/lib/shareUtils";
import { exportBrandbookPDFMultiPage } from "@/lib/pdfExport";

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

  function btnClass(s: ExportStatus, base = "") {
    if (s === "done") return `${base} bg-green-600 text-white border-green-600`;
    if (s === "loading") return `${base} opacity-60 cursor-not-allowed`;
    if (s === "error") return `${base} bg-red-50 border-red-300 text-red-700`;
    return `${base} bg-white border-gray-200 text-gray-800 hover:border-gray-400 hover:shadow-sm`;
  }

  function btnLabel(s: ExportStatus, idle: string, loading: string) {
    if (s === "loading") return <span className="flex items-center gap-2"><span className="w-3.5 h-3.5 border-2 border-current/30 border-t-current rounded-full animate-spin" />{loading}</span>;
    if (s === "done") return "✓ Pronto!";
    if (s === "error") return "✗ Erro";
    return idle;
  }

  const sections = [
    {
      title: "Código & Design Tokens",
      desc: "Exporte o design system em formatos prontos para desenvolvimento",
      items: [
        {
          key: "css" as const,
          icon: "🎨",
          label: "CSS Custom Properties",
          sub: "Variáveis CSS prontas para colar no seu projeto",
          onClick: handleCSS,
        },
        {
          key: "tokens" as const,
          icon: "🪙",
          label: "W3C Design Tokens (JSON)",
          sub: "Formato padrão de mercado, compatível com Style Dictionary",
          onClick: handleW3C,
        },
        {
          key: "tailwind" as const,
          icon: "💨",
          label: "Tailwind Config",
          sub: "Extenda seu tailwind.config.js com as cores e fontes da marca",
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
          icon: "📄",
          label: "PDF — Brandbook Completo",
          sub: "Captura o viewer como PDF multi-página de alta resolução",
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
          icon: "🔗",
          label: "Copiar link de compartilhamento",
          sub: shareMsg || "Gera uma URL com o brandbook comprimido para compartilhar",
          onClick: handleShare,
        },
      ],
    },
  ];

  return (
    <div className="space-y-8">
      {sections.map((section) => (
        <div key={section.title}>
          <div className="mb-3">
            <h3 className="font-bold text-sm">{section.title}</h3>
            <p className="text-xs text-gray-500">{section.desc}</p>
          </div>
          <div className="space-y-2">
            {section.items.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={item.onClick}
                disabled={status[item.key] === "loading"}
                className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition text-left ${btnClass(status[item.key])}`}
              >
                <span className="text-2xl flex-shrink-0">{item.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm">{item.label}</div>
                  <div className="text-xs text-gray-500 mt-0.5 leading-snug truncate">{item.sub}</div>
                </div>
                <div className="flex-shrink-0 text-sm font-medium">
                  {btnLabel(status[item.key], "↓ Exportar", "Gerando...")}
                </div>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
