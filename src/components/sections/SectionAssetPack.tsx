"use client";

import { useEffect, useMemo, useState } from "react";
import type { AssetPackFile, BrandbookData, UploadedAsset } from "@/lib/types";
import { downloadTextFile } from "@/lib/browserDownload";

interface Props {
  data: BrandbookData;
  num: number;
  uploadedAssets?: UploadedAsset[];
  generatedImages?: Record<string, string>;
  assetPackFiles?: AssetPackFile[];
  generating?: boolean;
  onGenerate?: () => void;
}

function mimeFromPath(path: string): string {
  const p = path.toLowerCase();
  if (p.endsWith(".svg")) return "image/svg+xml";
  if (p.endsWith(".json")) return "application/json";
  if (p.endsWith(".txt")) return "text/plain";
  return "application/octet-stream";
}

function sanitizeSvg(svg: string) {
  return svg
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/\son\w+\s*=\s*"[^"]*"/gi, "")
    .replace(/\son\w+\s*=\s*'[^']*'/gi, "")
    .replace(/<foreignObject[\s\S]*?>[\s\S]*?<\/foreignObject>/gi, "");
}

function isSvgPath(path: string) {
  return path.toLowerCase().endsWith(".svg");
}

function isTextPath(path: string) {
  const p = path.toLowerCase();
  return p.endsWith(".json") || p.endsWith(".txt");
}

function fileBasename(path: string) {
  return path.split("/").pop() || path;
}

function FileThumb({ file }: { file: AssetPackFile }) {
  const isSvg = isSvgPath(file.path);

  if (isSvg) {
    const safe = sanitizeSvg(file.content);
    return (
      <div
        className="w-9 h-9 bg-white border rounded-md flex items-center justify-center overflow-hidden shrink-0 [&>svg]:w-full [&>svg]:h-full"
        dangerouslySetInnerHTML={{ __html: safe }}
      />
    );
  }

  const ext = file.path.split(".").pop()?.toUpperCase() || "FILE";
  return (
    <div className="w-9 h-9 bg-white border rounded-md flex items-center justify-center shrink-0">
      <div className="text-[10px] font-extrabold text-gray-500 tracking-tight">{ext}</div>
    </div>
  );
}

export function SectionAssetPack({ data, num, uploadedAssets = [], generatedImages = {}, assetPackFiles = [], generating = false, onGenerate }: Props) {
  const [previewFile, setPreviewFile] = useState<AssetPackFile | null>(null);

  useEffect(() => {
    if (!previewFile) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPreviewFile(null);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [previewFile]);

  const byBucket = useMemo(() => {
    const icons = assetPackFiles.filter((f) => f.path.startsWith("vectors/icons/"));
    const elements = assetPackFiles.filter((f) => f.path.startsWith("vectors/elements/"));
    const patterns = assetPackFiles.filter((f) => f.path.startsWith("vectors/patterns/"));
    const motion = assetPackFiles.filter((f) => f.path.startsWith("motion/"));
    return { icons, elements, patterns, motion };
  }, [assetPackFiles]);

  const uploadedLogos = uploadedAssets.filter((a) => a.type === "logo");
  const uploadedPatterns = uploadedAssets.filter((a) => a.type === "pattern");
  const uploadedElements = uploadedAssets.filter((a) => a.type === "element");
  const uploadedMascots = uploadedAssets.filter((a) => a.type === "mascot");

  const hasLogo = !!(generatedImages["logo_primary"] || generatedImages["logo_dark_bg"] || uploadedLogos.length > 0);
  const hasPatternImage = !!(generatedImages["brand_pattern"] || uploadedPatterns.length > 0);
  const hasMascotImage = !!(generatedImages["brand_mascot"] || uploadedMascots.length > 0);

  const filledBuckets = [
    { key: "icons",    label: "Vetor — Ícones",            files: byBucket.icons,    strip: "vectors/icons/" },
    { key: "elements", label: "Vetor — Elementos Abstratos", files: byBucket.elements, strip: "vectors/elements/" },
    { key: "patterns", label: "Vetor — Padrão (Seamless)",  files: byBucket.patterns, strip: "vectors/patterns/" },
    { key: "motion",   label: "Motion — Animated SVG",      files: byBucket.motion,   strip: "motion/" },
  ].filter((b) => b.files.length > 0);

  const emptyBuckets = [
    byBucket.icons.length === 0 && "Ícones",
    byBucket.elements.length === 0 && "Elementos",
    byBucket.patterns.length === 0 && "Padrão",
    byBucket.motion.length === 0 && "Motion",
  ].filter(Boolean) as string[];

  return (
    <section className="page-break mb-6">
      <div className="flex items-center justify-between gap-4 mb-3 border-b border-gray-100 pb-2">
        <div>
          <h2 className="text-xl md:text-2xl font-extrabold tracking-tight">
            {String(num).padStart(2, "0")}. Asset Pack
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">Logo · padrões · imagens · ícones SVG · motion gerado por IA</p>
        </div>
        <button
          type="button"
          onClick={onGenerate}
          disabled={!onGenerate || generating}
          className="shrink-0 px-4 py-2 rounded-lg bg-gray-900 text-white text-sm font-bold hover:bg-gray-700 transition disabled:opacity-60"
        >
          {generating ? "Gerando..." : "Gerar Asset Pack"}
        </button>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${hasLogo ? "bg-green-50 border-green-200 text-green-700" : "bg-gray-50 border-gray-200 text-gray-500"}`}>
          Logo {hasLogo ? "✓" : "pendente"}
        </span>
        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${hasMascotImage || uploadedElements.length > 0 ? "bg-green-50 border-green-200 text-green-700" : "bg-gray-50 border-gray-200 text-gray-500"}`}>
          Mascote / Elementos {hasMascotImage || uploadedElements.length > 0 ? "✓" : "opcional"}
        </span>
        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${hasPatternImage ? "bg-green-50 border-green-200 text-green-700" : "bg-gray-50 border-gray-200 text-gray-500"}`}>
          Padrões {hasPatternImage ? "✓" : "pendente"}
        </span>
      </div>

      {filledBuckets.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
          {filledBuckets.map((bucket) => (
            <div key={bucket.key} className="bg-white border rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-gray-900 text-sm">{bucket.label}</h3>
                <span className="text-[10px] text-gray-400">{bucket.files.length} arq.</span>
              </div>
              <div className="space-y-1.5">
                {bucket.files.slice(0, 8).map((f) => (
                  <div key={f.path} className="flex items-center justify-between gap-3 border rounded-lg px-3 py-1.5 bg-gray-50">
                    <div className="min-w-0 flex items-center gap-2.5">
                      <FileThumb file={f} />
                      <button
                        type="button"
                        className="text-xs font-semibold text-gray-800 truncate text-left hover:underline"
                        onClick={() => setPreviewFile(f)}
                      >
                        {f.path.replace(bucket.strip, "")}
                      </button>
                    </div>
                    <button
                      type="button"
                      className="text-xs font-bold text-indigo-700 hover:text-indigo-900 shrink-0"
                      onClick={() => setPreviewFile(f)}
                    >
                      Baixar
                    </button>
                  </div>
                ))}
                {bucket.files.length > 8 && (
                  <div className="text-[10px] text-gray-400 pt-1">+ {bucket.files.length - 8} no pack</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {emptyBuckets.length > 0 && (
        <p className="text-xs text-gray-400 mt-3">
          Aguardando Asset Pack: {emptyBuckets.join(" · ")}
        </p>
      )}

      {previewFile && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setPreviewFile(null);
          }}
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-2xl bg-white rounded-xl shadow-xl border">
            <div className="flex items-start justify-between gap-3 p-4 border-b">
              <div className="min-w-0">
                <div className="text-sm font-extrabold text-gray-900 truncate">Pré-visualização</div>
                <div className="text-xs text-gray-500 truncate">{previewFile.path}</div>
              </div>
              <button
                type="button"
                className="px-2 py-1 text-sm font-bold text-gray-600 hover:text-gray-900"
                onClick={() => setPreviewFile(null)}
              >
                Fechar
              </button>
            </div>

            <div className="p-4">
              {isSvgPath(previewFile.path) ? (
                <div
                  className="w-full h-80 bg-gray-50 border rounded-lg flex items-center justify-center overflow-hidden p-4 [&>svg]:max-w-full [&>svg]:max-h-full"
                  dangerouslySetInnerHTML={{ __html: sanitizeSvg(previewFile.content) }}
                />
              ) : isTextPath(previewFile.path) ? (
                <pre className="w-full h-80 bg-gray-50 border rounded-lg overflow-auto p-3 text-xs text-gray-800 whitespace-pre-wrap">
                  {previewFile.content}
                </pre>
              ) : (
                <div className="w-full h-80 bg-gray-50 border rounded-lg flex items-center justify-center text-sm text-gray-600">
                  Prévia não disponível para este formato.
                </div>
              )}

              <div className="mt-4 flex items-center justify-end gap-2">
                <button
                  type="button"
                  className="px-4 py-2 rounded-lg bg-gray-100 text-gray-900 text-sm font-bold hover:bg-gray-200 transition"
                  onClick={() => setPreviewFile(null)}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className="px-4 py-2 rounded-lg bg-gray-900 text-white text-sm font-bold hover:bg-gray-700 transition"
                  onClick={() => {
                    downloadTextFile(previewFile.content, fileBasename(previewFile.path), mimeFromPath(previewFile.path));
                    setPreviewFile(null);
                  }}
                >
                  Baixar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mt-6 bg-gray-50 border rounded-xl p-5">
        <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">Notas</div>
        <div className="mt-2 text-sm text-gray-700 leading-relaxed">
          Este pack é gerado a partir do estilo descrito no brandbook ({data.brandName}). Para handoff, exporte o ZIP na aba Exportar — ele inclui estes arquivos.
        </div>
      </div>
    </section>
  );
}
