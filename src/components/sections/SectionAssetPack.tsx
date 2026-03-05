"use client";

import { useEffect, useMemo, useState } from "react";
import type { AssetPackFile, BrandbookData, UploadedAsset } from "@/lib/types";

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

function downloadTextFile(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
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

  return (
    <section className="page-break mb-10">
      <h2 className="text-xl md:text-2xl font-extrabold tracking-tight mb-4 border-b border-gray-100 pb-2">
        {String(num).padStart(2, "0")}. Entrega — Asset Pack (Arquivos Prontos)
      </h2>

      <div className="bg-white border rounded-xl p-5 shadow-sm mb-5">
        <div className="flex items-start justify-between gap-4 flex-col md:flex-row">
          <div>
            <h3 className="font-bold text-gray-900">O que você recebe</h3>
            <p className="text-sm text-gray-600 mt-1 leading-relaxed">
              Além do manual, esta entrega inclui arquivos prontos para uso (logo/padrões/imagens quando existirem) e um pacote vetorial
              (ícones, elementos, padrão vetorial e motion) gerado por IA.
            </p>
          </div>
          <button
            type="button"
            onClick={onGenerate}
            disabled={!onGenerate || generating}
            className="px-4 py-2 rounded-lg bg-gray-900 text-white text-sm font-bold hover:bg-gray-700 transition disabled:opacity-60"
          >
            {generating ? "Gerando..." : "Gerar Asset Pack"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-50 border rounded-xl p-5">
          <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">Logo</div>
          <div className="mt-1 text-sm font-semibold text-gray-900">{hasLogo ? "OK" : "Pendente"}</div>
          <div className="mt-2 text-xs text-gray-600">Uploads: {uploadedLogos.length} • Gerado: {(generatedImages["logo_primary"] || generatedImages["logo_dark_bg"]) ? "sim" : "não"}</div>
        </div>
        <div className="bg-gray-50 border rounded-xl p-5">
          <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">Mascote / Elementos</div>
          <div className="mt-1 text-sm font-semibold text-gray-900">{hasMascotImage || uploadedElements.length > 0 ? "OK" : "Opcional"}</div>
          <div className="mt-2 text-xs text-gray-600">Mascotes: {uploadedMascots.length} • Elementos: {uploadedElements.length}</div>
        </div>
        <div className="bg-gray-50 border rounded-xl p-5">
          <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">Padrões</div>
          <div className="mt-1 text-sm font-semibold text-gray-900">{hasPatternImage ? "OK" : "Pendente"}</div>
          <div className="mt-2 text-xs text-gray-600">Uploads: {uploadedPatterns.length} • Gerado: {generatedImages["brand_pattern"] ? "sim" : "não"}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white border rounded-xl p-5 shadow-sm">
          <h3 className="font-bold text-gray-900">Vetor — Ícones</h3>
          <p className="text-xs text-gray-500 mt-1">{byBucket.icons.length} arquivos</p>
          <div className="mt-4 space-y-2">
            {byBucket.icons.length === 0 ? (
              <div className="text-sm text-gray-500">Gere o Asset Pack para criar os ícones SVG.</div>
            ) : (
              byBucket.icons.slice(0, 8).map((f) => (
                <div key={f.path} className="flex items-center justify-between gap-3 border rounded-lg px-3 py-2 bg-gray-50">
                  <div className="min-w-0 flex items-center gap-3">
                    <FileThumb file={f} />
                    <button
                      type="button"
                      className="text-xs font-semibold text-gray-800 truncate text-left hover:underline"
                      onClick={() => setPreviewFile(f)}
                    >
                      {f.path.replace("vectors/icons/", "")}
                    </button>
                  </div>
                  <button
                    type="button"
                    className="text-xs font-bold text-indigo-700 hover:text-indigo-900"
                    onClick={() => setPreviewFile(f)}
                  >
                    Baixar
                  </button>
                </div>
              ))
            )}
            {byBucket.icons.length > 8 && (
              <div className="text-xs text-gray-500">+ {byBucket.icons.length - 8} arquivos no pack</div>
            )}
          </div>
        </div>

        <div className="bg-white border rounded-xl p-5 shadow-sm">
          <h3 className="font-bold text-gray-900">Vetor — Elementos Abstratos</h3>
          <p className="text-xs text-gray-500 mt-1">{byBucket.elements.length} arquivos</p>
          <div className="mt-4 space-y-2">
            {byBucket.elements.length === 0 ? (
              <div className="text-sm text-gray-500">Gere o Asset Pack para criar os elementos SVG.</div>
            ) : (
              byBucket.elements.slice(0, 8).map((f) => (
                <div key={f.path} className="flex items-center justify-between gap-3 border rounded-lg px-3 py-2 bg-gray-50">
                  <div className="min-w-0 flex items-center gap-3">
                    <FileThumb file={f} />
                    <button
                      type="button"
                      className="text-xs font-semibold text-gray-800 truncate text-left hover:underline"
                      onClick={() => setPreviewFile(f)}
                    >
                      {f.path.replace("vectors/elements/", "")}
                    </button>
                  </div>
                  <button
                    type="button"
                    className="text-xs font-bold text-indigo-700 hover:text-indigo-900"
                    onClick={() => setPreviewFile(f)}
                  >
                    Baixar
                  </button>
                </div>
              ))
            )}
            {byBucket.elements.length > 8 && (
              <div className="text-xs text-gray-500">+ {byBucket.elements.length - 8} arquivos no pack</div>
            )}
          </div>
        </div>

        <div className="bg-white border rounded-xl p-5 shadow-sm">
          <h3 className="font-bold text-gray-900">Vetor — Padrão (Seamless)</h3>
          <p className="text-xs text-gray-500 mt-1">{byBucket.patterns.length} arquivo(s)</p>
          <div className="mt-4 space-y-2">
            {byBucket.patterns.length === 0 ? (
              <div className="text-sm text-gray-500">Gere o Asset Pack para criar o padrão vetorial.</div>
            ) : (
              byBucket.patterns.map((f) => (
                <div key={f.path} className="flex items-center justify-between gap-3 border rounded-lg px-3 py-2 bg-gray-50">
                  <div className="min-w-0 flex items-center gap-3">
                    <FileThumb file={f} />
                    <button
                      type="button"
                      className="text-xs font-semibold text-gray-800 truncate text-left hover:underline"
                      onClick={() => setPreviewFile(f)}
                    >
                      {f.path.replace("vectors/patterns/", "")}
                    </button>
                  </div>
                  <button
                    type="button"
                    className="text-xs font-bold text-indigo-700 hover:text-indigo-900"
                    onClick={() => setPreviewFile(f)}
                  >
                    Baixar
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white border rounded-xl p-5 shadow-sm">
          <h3 className="font-bold text-gray-900">Motion — Animated SVG</h3>
          <p className="text-xs text-gray-500 mt-1">{byBucket.motion.length} arquivo(s)</p>
          <div className="mt-4 space-y-2">
            {byBucket.motion.length === 0 ? (
              <div className="text-sm text-gray-500">Gere o Asset Pack para criar os motions (SVG animado).</div>
            ) : (
              byBucket.motion.map((f) => (
                <div key={f.path} className="flex items-center justify-between gap-3 border rounded-lg px-3 py-2 bg-gray-50">
                  <div className="min-w-0 flex items-center gap-3">
                    <FileThumb file={f} />
                    <button
                      type="button"
                      className="text-xs font-semibold text-gray-800 truncate text-left hover:underline"
                      onClick={() => setPreviewFile(f)}
                    >
                      {f.path.replace("motion/", "")}
                    </button>
                  </div>
                  <button
                    type="button"
                    className="text-xs font-bold text-indigo-700 hover:text-indigo-900"
                    onClick={() => setPreviewFile(f)}
                  >
                    Baixar
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

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
                    downloadTextFile(fileBasename(previewFile.path), previewFile.content, mimeFromPath(previewFile.path));
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
