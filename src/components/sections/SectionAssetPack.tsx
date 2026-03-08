"use client";

import { useEffect, useMemo, useState } from "react";
import type { AssetPackFile, AssetPackQualityStatus, AssetPackState, BrandbookData, UploadedAsset } from "@/lib/types";
import { downloadTextFile } from "@/lib/browserDownload";

interface Props {
  data: BrandbookData;
  num: number;
  uploadedAssets?: UploadedAsset[];
  generatedImages?: Record<string, string>;
  assetPack?: AssetPackState;
  generating?: boolean;
  onGenerate?: () => void;
}

const EXPECTED_BUCKET_COUNTS = {
  icons: 16,
  elements: 8,
  patterns: 1,
  motion: 2,
} as const;

function getStatusTone(status: AssetPackQualityStatus) {
  if (status === "pass") {
    return {
      badge: "bg-green-50 border-green-200 text-green-700",
      panel: "bg-green-50 border-green-200",
      accent: "text-green-700",
    };
  }

  if (status === "warn") {
    return {
      badge: "bg-amber-50 border-amber-200 text-amber-700",
      panel: "bg-amber-50 border-amber-200",
      accent: "text-amber-700",
    };
  }

  return {
    badge: "bg-red-50 border-red-200 text-red-700",
    panel: "bg-red-50 border-red-200",
    accent: "text-red-700",
  };
}

function statusLabel(status: AssetPackQualityStatus) {
  if (status === "pass") return "Aprovado";
  if (status === "warn") return "Atenção";
  return "Bloqueado";
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

export function SectionAssetPack({ data, num, uploadedAssets = [], generatedImages = {}, assetPack = { files: [] }, generating = false, onGenerate }: Props) {
  const [previewFile, setPreviewFile] = useState<AssetPackFile | null>(null);
  const assetPackFiles = assetPack.files;

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

  const emptyBuckets = [
    byBucket.icons.length === 0 && "Ícones",
    byBucket.elements.length === 0 && "Elementos",
    byBucket.patterns.length === 0 && "Padrão",
    byBucket.motion.length === 0 && "Motion",
  ].filter(Boolean) as string[];

  const coverage = assetPack.coverage;
  const quality = assetPack.quality;
  const plan = assetPack.plan;
  const overallTone = getStatusTone(quality?.status ?? "warn");
  const bucketQualityMap = new Map((quality?.buckets ?? []).map((bucket) => [bucket.bucket, bucket]));

  const bucketCards = [
    { key: "icons", label: "Vetor — Ícones", files: byBucket.icons, strip: "vectors/icons/", expected: EXPECTED_BUCKET_COUNTS.icons, covered: coverage?.icons ?? byBucket.icons.length },
    { key: "elements", label: "Vetor — Elementos Abstratos", files: byBucket.elements, strip: "vectors/elements/", expected: EXPECTED_BUCKET_COUNTS.elements, covered: coverage?.elements ?? byBucket.elements.length },
    { key: "patterns", label: "Vetor — Padrão (Seamless)", files: byBucket.patterns, strip: "vectors/patterns/", expected: EXPECTED_BUCKET_COUNTS.patterns, covered: coverage?.patterns ?? byBucket.patterns.length },
    { key: "motion", label: "Motion — Animated SVG", files: byBucket.motion, strip: "motion/", expected: EXPECTED_BUCKET_COUNTS.motion, covered: coverage?.motion ?? byBucket.motion.length },
  ] as const;

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

      {quality && (
        <div className={`mb-4 rounded-xl border p-4 ${overallTone.panel}`}>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${overallTone.badge}`}>
                  Quality Gate · {statusLabel(quality.status)}
                </span>
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full border bg-white/80 border-white text-gray-700">
                  Score {quality.score}/100
                </span>
                {coverage && (
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full border bg-white/80 border-white text-gray-700">
                    Cobertura {coverage.total}/{coverage.expectedTotal}
                  </span>
                )}
              </div>
              <div className="mt-2 text-sm font-semibold text-gray-900">{quality.summary}</div>
              {quality.status === "fail" && (
                <div className={`mt-2 text-xs font-semibold ${overallTone.accent}`}>
                  O pack foi gerado, mas a avaliação semântica indica que ele ainda precisa de correções para handoff profissional.
                </div>
              )}
            </div>
            {quality.strengths.length > 0 && (
              <div className="lg:max-w-xs">
                <div className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Pontos fortes</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {quality.strengths.slice(0, 4).map((strength) => (
                    <span key={strength} className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-white/80 border border-white text-gray-700">
                      {strength}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {(quality.warnings.length > 0 || quality.issues.length > 0) && (
            <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-2">
              {quality.warnings.length > 0 && (
                <div className="rounded-lg border border-white bg-white/70 p-3">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Warnings</div>
                  <div className="mt-2 space-y-1">
                    {quality.warnings.slice(0, 4).map((warning) => (
                      <div key={warning} className="text-xs text-gray-700">{warning}</div>
                    ))}
                  </div>
                </div>
              )}
              {quality.issues.length > 0 && (
                <div className="rounded-lg border border-white bg-white/70 p-3">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Issues críticos</div>
                  <div className="mt-2 space-y-1">
                    {quality.issues.slice(0, 4).map((issue) => (
                      <div key={issue} className="text-xs text-gray-700">{issue}</div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {plan && (
        <div className="mb-4 rounded-xl border bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0 lg:max-w-2xl">
              <div className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Plano criativo</div>
              <div className="mt-2 text-sm font-semibold text-gray-900">{plan.creativeThesis}</div>
              <div className="mt-3 flex flex-wrap gap-2">
                {plan.shapeLanguage.slice(0, 5).map((item) => (
                  <span key={item} className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-gray-50 border text-gray-700">
                    {item}
                  </span>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:w-[26rem]">
              <div className="rounded-lg border bg-gray-50 p-3">
                <div className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Motivos centrais</div>
                <div className="mt-2 space-y-1">
                  {plan.coreMotifs.slice(0, 4).map((item) => (
                    <div key={item} className="text-xs text-gray-700">{item}</div>
                  ))}
                </div>
              </div>
              <div className="rounded-lg border bg-gray-50 p-3">
                <div className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Evitar</div>
                <div className="mt-2 space-y-1">
                  {plan.avoidMotifs.slice(0, 4).map((item) => (
                    <div key={item} className="text-xs text-gray-700">{item}</div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-2">
            <div className="rounded-lg border bg-gray-50 p-3">
              <div className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Diretriz de ícones</div>
              <div className="mt-2 text-xs text-gray-700 leading-relaxed">{plan.bucketDirectives.icons}</div>
            </div>
            <div className="rounded-lg border bg-gray-50 p-3">
              <div className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Diretriz de elementos e motion</div>
              <div className="mt-2 text-xs text-gray-700 leading-relaxed">
                {plan.bucketDirectives.elements}
                <div className="mt-2">{plan.bucketDirectives.motion}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {bucketCards.some((bucket) => bucket.files.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
          {bucketCards.filter((bucket) => bucket.files.length > 0).map((bucket) => {
            const bucketQuality = bucketQualityMap.get(bucket.key);
            const bucketTone = getStatusTone(bucketQuality?.status ?? "warn");

            return (
            <div key={bucket.key} className="bg-white border rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-bold text-gray-900 text-sm">{bucket.label}</h3>
                  <div className="mt-1 flex flex-wrap gap-2">
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${bucketTone.badge}`}>
                      {statusLabel(bucketQuality?.status ?? "warn")}
                    </span>
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full border bg-gray-50 border-gray-200 text-gray-600">
                      Cobertura {bucket.covered}/{bucket.expected}
                    </span>
                    {bucketQuality && (
                      <span className="text-[10px] font-bold px-2.5 py-1 rounded-full border bg-gray-50 border-gray-200 text-gray-600">
                        Score {bucketQuality.score}
                      </span>
                    )}
                  </div>
                </div>
                <span className="text-[10px] text-gray-400">{bucket.files.length} arq.</span>
              </div>

              {bucketQuality && (
                <div className={`mb-3 rounded-lg border p-3 ${bucketTone.panel}`}>
                  {bucketQuality.strengths.length > 0 && (
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Fortes</div>
                      <div className="mt-1 flex flex-wrap gap-2">
                        {bucketQuality.strengths.slice(0, 3).map((strength) => (
                          <span key={strength} className="text-[11px] font-semibold px-2 py-1 rounded-full bg-white/80 border border-white text-gray-700">
                            {strength}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {bucketQuality.issues.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {bucketQuality.issues.slice(0, 3).map((issue) => (
                        <div key={issue} className="text-xs text-gray-700">{issue}</div>
                      ))}
                    </div>
                  )}
                </div>
              )}

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
            );
          })}
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
