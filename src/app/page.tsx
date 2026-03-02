"use client";

import { useState, useEffect } from "react";
import { BrandbookViewer } from "@/components/BrandbookViewer";
import { ImageGenPanel } from "@/components/ImageGenPanel";
import { ApiKeyConfig, ApiKeyStatusBadge, loadApiKeys, EMPTY_KEYS, type ApiKeys } from "@/components/ApiKeyConfig";
import { BrandbookEditor } from "@/components/BrandbookEditor";
import { UploadedAssetsPanel } from "@/components/UploadedAssetsPanel";
import { GenerateBriefingForm, type GenerateBriefingData } from "@/components/GenerateBriefingForm";
import { GenerationProgress } from "@/components/GenerationProgress";
import { RefinePanel } from "@/components/RefinePanel";
import { ConsistencyPanel } from "@/components/ConsistencyPanel";
import { ExportPanel } from "@/components/ExportPanel";
import { RegenerateSectionsPanel } from "@/components/RegenerateSectionsPanel";
import { LogoConceptPanel } from "@/components/LogoConceptPanel";
import { BrandbookData, GeneratedAsset, UploadedAsset } from "@/lib/types";
import { saasExample, barExample, sushiExample } from "@/lib/examples";
import { generateProductionManifest } from "@/lib/productionExport";
import { BrandbookSchemaLoose, BrandbookSchemaV2, formatZodIssues } from "@/lib/brandbookSchema";
import { migrateBrandbook } from "@/lib/brandbookMigration";
import { decompressBrandbook } from "@/lib/shareUtils";
import type { AssetKey } from "@/lib/imagePrompts";

type Tab = "generate" | "examples" | "viewer";
type ViewerTab = "preview" | "images" | "json" | "sections" | "edit" | "assets" | "refine" | "consistency" | "export";

const GENERATED_ASSETS_LS_PREFIX = "bb_generated_assets::";
const BRAND_ASSETS_LS_PREFIX = "bb_brand_assets::";

function slugifyForStorage(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-");
}

function loadCachedGeneratedAssets(slug: string): Record<string, GeneratedAsset> {
  if (typeof window === "undefined") return {};
  if (!slug) return {};
  try {
    const raw = localStorage.getItem(GENERATED_ASSETS_LS_PREFIX + slug);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") return {};
    return parsed as Record<string, GeneratedAsset>;
  } catch {
    return {};
  }
}

function saveCachedGeneratedAssets(slug: string, assets: Record<string, GeneratedAsset>) {
  if (typeof window === "undefined") return;
  if (!slug) return;
  localStorage.setItem(GENERATED_ASSETS_LS_PREFIX + slug, JSON.stringify(assets));
}

function clearCachedGeneratedAssets(slug: string) {
  if (typeof window === "undefined") return;
  if (!slug) return;
  localStorage.removeItem(GENERATED_ASSETS_LS_PREFIX + slug);
}

function loadCachedBrandAssets(slug: string): UploadedAsset[] {
  if (typeof window === "undefined") return [];
  if (!slug) return [];
  try {
    const raw = localStorage.getItem(BRAND_ASSETS_LS_PREFIX + slug);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed as UploadedAsset[];
  } catch {
    return [];
  }
}

function saveCachedBrandAssets(slug: string, assets: UploadedAsset[]) {
  if (typeof window === "undefined") return;
  if (!slug) return;
  try {
    localStorage.setItem(BRAND_ASSETS_LS_PREFIX + slug, JSON.stringify(assets));
  } catch {
    // ignore quota errors for large asset collections
  }
}

export default function Home() {
  const [tab, setTab] = useState<Tab>("examples");
  const [loading, setLoading] = useState(false);
  const [generationPhase, setGenerationPhase] = useState("");
  const [generationPct, setGenerationPct] = useState(0);
  const [error, setError] = useState("");
  const [brandbookData, setBrandbookData] = useState<BrandbookData | null>(null);
  const [jsonText, setJsonText] = useState("");
  const [viewerTab, setViewerTab] = useState<ViewerTab>("preview");
  const [generatedAssets, setGeneratedAssets] = useState<Record<string, GeneratedAsset>>({});
  const [uploadedBrandAssets, setUploadedBrandAssets] = useState<UploadedAsset[]>([]);
  const [apiKeys, setApiKeys] = useState<ApiKeys>({ ...EMPTY_KEYS });
  const [textProvider, setTextProvider] = useState<"openai" | "gemini">("openai");
  const [showApiConfig, setShowApiConfig] = useState(false);
  const [exportingPack, setExportingPack] = useState(false);

  useEffect(() => {
    const keys = loadApiKeys();
    setApiKeys(keys);
    if (!keys.openai && keys.google) setTextProvider("gemini");
    else if (keys.openai) setTextProvider("openai");

    // Load shared brandbook from URL
    const params = new URLSearchParams(window.location.search);
    const bbParam = params.get("bb");
    if (bbParam) {
      decompressBrandbook(bbParam).then((raw) => {
        if (!raw) return;
        try {
          const migrated = migrateBrandbook(raw);
          const validated = BrandbookSchemaLoose.safeParse(migrated);
          if (validated.success) {
            setBrandbookData(migrated as BrandbookData);
            const slug = slugifyForStorage((migrated as BrandbookData).brandName);
            setGeneratedAssets(loadCachedGeneratedAssets(slug));
            setUploadedBrandAssets(loadCachedBrandAssets(slug));
            setTab("viewer");
            window.history.replaceState({}, "", window.location.pathname);
          }
        } catch {
          // invalid share URL, ignore
        }
      });
    }
  }, []);


  async function handleGenerate(formData: GenerateBriefingData) {
    setLoading(true);
    setError("");
    setBrandbookData(null);
    setGenerationPhase("Preparando geração...");
    setGenerationPct(0);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brandName: formData.brandName,
          industry: formData.industry,
          briefing: formData.briefing,
          provider: textProvider,
          openaiKey: apiKeys.openai || undefined,
          googleKey: apiKeys.google || undefined,
          openaiModel: apiKeys.openaiTextModel || undefined,
          googleModel: apiKeys.googleTextModel || undefined,
          referenceImages: formData.referenceImages.length > 0
            ? formData.referenceImages.map((img) => img.dataUrl)
            : undefined,
          logoImage: formData.logoImage?.dataUrl ?? undefined,
          scope: formData.scope,
          creativityLevel: formData.creativityLevel,
          intentionality: formData.intentionality,
        }),
      });

      if (!res.body) throw new Error("Streaming não suportado pelo servidor.");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith("data: ")) continue;
          try {
            const event = JSON.parse(trimmed.slice(6)) as {
              type: string;
              phase?: string;
              pct?: number;
              data?: BrandbookData;
              error?: string;
            };

            if (event.type === "progress") {
              setGenerationPhase(event.phase ?? "");
              setGenerationPct(event.pct ?? 0);
            } else if (event.type === "complete" && event.data) {
              const migrated = migrateBrandbook(event.data);
              const strict = BrandbookSchemaV2.safeParse(migrated);
              const nextBrandbook = (strict.success ? strict.data : migrated) as unknown as BrandbookData;
              const slug = slugifyForStorage(nextBrandbook.brandName);
              setBrandbookData(nextBrandbook);
              setGeneratedAssets(loadCachedGeneratedAssets(slug));
              setUploadedBrandAssets(loadCachedBrandAssets(slug));
              setTab("viewer");
            } else if (event.type === "error") {
              throw new Error(event.error ?? "Erro desconhecido");
            }
          } catch (parseErr) {
            if (parseErr instanceof SyntaxError) continue;
            throw parseErr;
          }
        }
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro desconhecido";
      setError(message);
    } finally {
      setLoading(false);
      setGenerationPhase("");
      setGenerationPct(0);
    }
  }

  function handleLoadExample(example: BrandbookData) {
    try {
      const migrated = migrateBrandbook(example);
      setBrandbookData(migrated);
      const slug = slugifyForStorage(migrated.brandName);
      setGeneratedAssets(loadCachedGeneratedAssets(slug));
      setUploadedBrandAssets(loadCachedBrandAssets(slug));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Erro ao carregar exemplo");
      return;
    }
    setViewerTab("preview");
    setTab("viewer");
  }

  async function handleExportPack() {
    if (!brandbookData) return;
    setExportingPack(true);
    setError("");
    try {
      const res = await fetch("/api/export-pack", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brandbookData,
          generatedAssets: Object.values(generatedAssets),
        }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error((j as { error?: string }).error ?? "Erro ao exportar pack");
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const slug = brandbookData.brandName.replace(/\s+/g, "-").toLowerCase();
      a.download = `${slug}-brandbook-pack.zip`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Erro ao exportar pack");
    } finally {
      setExportingPack(false);
    }
  }

  function downloadJson(data: unknown, filename: string) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleExportBrandbook() {
    if (!brandbookData) return;
    const slug = brandbookData.brandName.replace(/\s+/g, "-").toLowerCase();
    downloadJson(brandbookData, `${slug}-brandbook.json`);
  }

  function handleExportProduction() {
    if (!brandbookData) return;
    const manifest = generateProductionManifest(brandbookData);
    const slug = brandbookData.brandName.replace(/\s+/g, "-").toLowerCase();
    downloadJson(manifest, `${slug}-production-manifest.json`);
  }

  function handleImportJson() {
    try {
      const parsed = JSON.parse(jsonText);
      const migrated = migrateBrandbook(parsed);
      const base = BrandbookSchemaLoose.safeParse(migrated);
      if (!base.success) {
        setError("JSON inválido:\n" + formatZodIssues(base.error.issues));
        return;
      }
      setBrandbookData(migrated);
      const slug = slugifyForStorage(migrated.brandName);
      setGeneratedAssets(loadCachedGeneratedAssets(slug));
      setTab("viewer");
      setError("");
    } catch {
      setError("JSON inválido. Verifique a formatação.");
    }
  }

  useEffect(() => {
    if (!brandbookData) return;
    const slug = slugifyForStorage(brandbookData.brandName);
    saveCachedGeneratedAssets(slug, generatedAssets);
  }, [generatedAssets, brandbookData]);

  useEffect(() => {
    if (!brandbookData) return;
    const slug = slugifyForStorage(brandbookData.brandName);
    saveCachedBrandAssets(slug, uploadedBrandAssets);
  }, [uploadedBrandAssets, brandbookData]);

  function handleClearImageCache() {
    if (!brandbookData) return;
    const slug = slugifyForStorage(brandbookData.brandName);
    const ok = window.confirm("Remover imagens geradas salvas (cache) para este brandbook?");
    if (!ok) return;
    clearCachedGeneratedAssets(slug);
    setGeneratedAssets({});
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">B</span>
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Brandbook Builder</h1>
              <p className="text-xs text-gray-500">Gerador de Manual de Marca com IA</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <ApiKeyStatusBadge keys={apiKeys} />
            <button
              onClick={() => setShowApiConfig(true)}
              className="flex items-center gap-1.5 bg-gray-900 text-white text-sm font-medium px-3 py-2 rounded-lg hover:bg-gray-700 transition"
              title="Configurar chaves de API"
            >
              <span>⚙</span>
              <span className="hidden sm:inline">APIs</span>
            </button>
            <nav className="flex gap-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setTab("generate")}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${tab === "generate" ? "bg-white shadow text-gray-900" : "text-gray-600 hover:text-gray-900"}`}
            >
              Gerar com IA
            </button>
            <button
              onClick={() => setTab("examples")}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${tab === "examples" ? "bg-white shadow text-gray-900" : "text-gray-600 hover:text-gray-900"}`}
            >
              Exemplos
            </button>
            {brandbookData && (
              <button
                onClick={() => setTab("viewer")}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${tab === "viewer" ? "bg-white shadow text-gray-900" : "text-gray-600 hover:text-gray-900"}`}
              >
                Visualizar
              </button>
            )}
          </nav>
          </div>
        </div>
      </header>

      <ApiKeyConfig
        isOpen={showApiConfig}
        onClose={() => setShowApiConfig(false)}
        onSave={(keys) => {
          setApiKeys(keys);
          setShowApiConfig(false);
        }}
      />

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Error Banner */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-center justify-between">
            <span className="text-sm">{error}</span>
            <button onClick={() => setError("")} className="text-red-600 hover:text-red-800 font-bold text-lg leading-none">&times;</button>
          </div>
        )}

        {/* Tab: Generate */}
        {tab === "generate" && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white border rounded-xl p-8 shadow-sm">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h2 className="text-2xl font-bold">Gerar Brandbook com IA</h2>
                  <p className="text-gray-500 text-sm mt-1">Configure o briefing, escopo e criatividade — a IA cria sua identidade completa.</p>
                </div>
              </div>

              {/* API Provider selector */}
              <div className="mt-5 mb-7 p-3 bg-gray-50 border rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Modelo de IA</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setTextProvider("openai")}
                    className={`p-2.5 rounded-lg border-2 text-left transition-all ${
                      textProvider === "openai"
                        ? "border-gray-900 bg-gray-900 text-white"
                        : apiKeys.openai ? "border-gray-200 bg-white hover:border-gray-400" : "border-red-200 bg-red-50"
                    }`}
                  >
                    <div className="font-bold text-sm">{apiKeys.openaiTextModel || "GPT-4o"}</div>
                    <div className={`text-xs mt-0.5 ${textProvider === "openai" ? "text-gray-300" : apiKeys.openai ? "text-gray-500" : "text-red-500"}`}>
                      {apiKeys.openai ? "✓ OpenAI configurado" : "⚠ Chave ausente"}
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setTextProvider("gemini")}
                    className={`p-2.5 rounded-lg border-2 text-left transition-all ${
                      textProvider === "gemini"
                        ? "border-blue-600 bg-blue-600 text-white"
                        : apiKeys.google ? "border-gray-200 bg-white hover:border-gray-400" : "border-red-200 bg-red-50"
                    }`}
                  >
                    <div className="font-bold text-sm">{apiKeys.googleTextModel || "Gemini 2.0 Flash"}</div>
                    <div className={`text-xs mt-0.5 ${textProvider === "gemini" ? "text-blue-100" : apiKeys.google ? "text-gray-500" : "text-red-500"}`}>
                      {apiKeys.google ? "✓ Google AI configurado" : "⚠ Chave ausente"}
                    </div>
                  </button>
                </div>
                {((textProvider === "openai" && !apiKeys.openai) || (textProvider === "gemini" && !apiKeys.google)) && (
                  <p className="mt-2 text-xs text-red-600">
                    ⚠ Configure a chave em <strong>⚙ APIs</strong> antes de gerar.
                  </p>
                )}
              </div>

              {loading && generationPhase ? (
                <GenerationProgress phase={generationPhase} pct={generationPct} />
              ) : (
                <GenerateBriefingForm
                  onSubmit={handleGenerate}
                  loading={loading}
                  error={error}
                />
              )}

              <div className="mt-8 pt-8 border-t">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Ou importe um JSON existente</h3>
                <textarea
                  rows={4}
                  value={jsonText}
                  onChange={(e) => setJsonText(e.target.value)}
                  placeholder="Cole aqui o JSON do brandbook..."
                  className="w-full px-4 py-3 border rounded-lg font-mono text-xs focus:ring-2 focus:ring-gray-900 focus:border-gray-900 outline-none transition resize-none"
                  aria-label="JSON do brandbook para importar"
                />
                <button
                  onClick={handleImportJson}
                  disabled={!jsonText.trim()}
                  className="mt-3 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg text-sm font-medium hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  Importar JSON
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab: Examples */}
        {tab === "examples" && (
          <div>
            <h2 className="text-2xl font-bold mb-2">Exemplos de Brandbooks</h2>
            <p className="text-gray-500 mb-8">Clique em um exemplo para visualizar o manual de marca completo.</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <ExampleCard
                title="CloudFlow"
                subtitle="SaaS / B2B Software"
                description="Brandbook avançado com Design Tokens, A11y, Microcopy, Motion e UX Patterns."
                badge="Avançado"
                color="blue"
                onClick={() => handleLoadExample(saasExample)}
              />
              <ExampleCard
                title="Neon Tokyo Bar"
                subtitle="Nightlife & Bar"
                description="Identidade visual cyberpunk com neon, tipografia bold e fotografia noturna."
                color="pink"
                onClick={() => handleLoadExample(barExample)}
              />
              <ExampleCard
                title="Kansai Sushi"
                subtitle="Restaurante Japonês"
                description="Manual tradicional japonês com Sumi-e, Washi e tipografia Noto Serif JP."
                color="red"
                onClick={() => handleLoadExample(sushiExample)}
              />
            </div>
          </div>
        )}

        {/* Tab: Viewer */}
        {tab === "viewer" && brandbookData && (
          <div>
            {/* Viewer Header */}
            <div className="no-print flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-bold">{brandbookData.brandName}</h2>
                <p className="text-gray-500 text-sm">{brandbookData.industry}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={handleClearImageCache}
                  disabled={Object.keys(generatedAssets).length === 0}
                  className="bg-gray-100 text-gray-700 py-2 px-4 rounded-lg text-sm font-medium hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  title="Remove as imagens geradas salvas (cache) para este brandbook"
                >
                  Limpar cache
                </button>
                <button
                  onClick={handleExportBrandbook}
                  className="bg-gray-100 text-gray-700 py-2 px-4 rounded-lg text-sm font-medium hover:bg-gray-200 transition"
                  title="JSON simples do brandbook"
                >
                  ↓ Brandbook JSON
                </button>
                <button
                  onClick={handleExportProduction}
                  className="bg-indigo-600 text-white py-2 px-4 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition"
                  title="JSON detalhado de produção com specs completas, CSS vars, tokens e peças"
                >
                  ↓ Production Manifest
                </button>
                <button
                  onClick={handleExportPack}
                  disabled={exportingPack}
                  className="bg-gray-900 text-white py-2 px-4 rounded-lg text-sm font-semibold hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  title="Baixa um .zip com JSONs, tokens e imagens geradas (quando existirem)"
                >
                  {exportingPack ? "Preparando ZIP..." : "↓ Pack (.zip)"}
                </button>
                <button
                  onClick={() => window.print()}
                  className="bg-gray-900 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-gray-800 transition"
                >
                  Imprimir / PDF
                </button>
              </div>
            </div>

            {/* Viewer Sub-tabs */}
            <div className="no-print sticky top-16 z-40 bg-gray-50 pt-2 pb-3 -mx-6 px-6">
            <div className="flex flex-wrap gap-1 bg-gray-100 rounded-xl p-1 w-fit">
              <button
                onClick={() => setViewerTab("preview")}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition ${
                  viewerTab === "preview" ? "bg-white shadow text-gray-900" : "text-gray-500 hover:text-gray-800"
                }`}
              >
                Brandbook
              </button>
              <button
                onClick={() => setViewerTab("edit")}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition ${
                  viewerTab === "edit" ? "bg-white shadow text-gray-900" : "text-gray-500 hover:text-gray-800"
                }`}
              >
                ✏ Editar
              </button>
              <button
                onClick={() => setViewerTab("assets")}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition ${
                  viewerTab === "assets" ? "bg-white shadow text-gray-900" : "text-gray-500 hover:text-gray-800"
                }`}
              >
                🖼️ Assets
                {uploadedBrandAssets.length > 0 && (
                  <span className="ml-1.5 bg-indigo-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                    {uploadedBrandAssets.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setViewerTab("images")}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition ${
                  viewerTab === "images" ? "bg-white shadow text-gray-900" : "text-gray-500 hover:text-gray-800"
                }`}
              >
                Gerar Imagens
                {Object.keys(generatedAssets).length > 0 && (
                  <span className="ml-1.5 bg-green-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                    {Object.keys(generatedAssets).length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setViewerTab("json")}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition ${
                  viewerTab === "json" ? "bg-white shadow text-gray-900" : "text-gray-500 hover:text-gray-800"
                }`}
              >
                JSON Produção
              </button>
              <button
                onClick={() => setViewerTab("sections")}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition ${
                  viewerTab === "sections" ? "bg-white shadow text-gray-900" : "text-gray-500 hover:text-gray-800"
                }`}
              >
                JSON por Seção
              </button>
              <button
                onClick={() => setViewerTab("refine")}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition ${
                  viewerTab === "refine" ? "bg-white shadow text-gray-900" : "text-gray-500 hover:text-gray-800"
                }`}
              >
                ✨ Refinar
              </button>
              <button
                onClick={() => setViewerTab("consistency")}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition ${
                  viewerTab === "consistency" ? "bg-white shadow text-gray-900" : "text-gray-500 hover:text-gray-800"
                }`}
              >
                🔍 Consistência
              </button>
              <button
                onClick={() => setViewerTab("export")}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition ${
                  viewerTab === "export" ? "bg-white shadow text-gray-900" : "text-gray-500 hover:text-gray-800"
                }`}
              >
                📤 Exportar
              </button>
            </div>
            </div>

            {/* Sub-tab: Brandbook Preview */}
            {viewerTab === "preview" && (
              <BrandbookViewer
                data={brandbookData}
                generatedImages={Object.fromEntries(
                  Object.entries(generatedAssets).map(([k, v]) => [k, v.url])
                )}
                uploadedAssets={uploadedBrandAssets}
                onGoToImages={() => setViewerTab("images")}
                onUpdateApplicationImageKey={(index: number, imageKey: AssetKey | undefined) => {
                  setBrandbookData((prev) => {
                    if (!prev) return prev;
                    const nextApplications = prev.applications.map((a, i) =>
                      i === index ? { ...a, imageKey } : a
                    );
                    return { ...prev, applications: nextApplications };
                  });
                }}
              />
            )}

            {/* Sub-tab: Edit Brandbook */}
            {viewerTab === "edit" && (
              <BrandbookEditor
                data={brandbookData}
                onUpdate={(updated) => {
                  setBrandbookData(updated);
                }}
                onCancel={() => setViewerTab("preview")}
              />
            )}

            {/* Sub-tab: Brand Assets */}
            {viewerTab === "assets" && (
              <div>
                <div className="mb-4 bg-blue-50 border border-blue-100 rounded-xl px-5 py-4">
                  <h3 className="font-bold text-blue-900 mb-1">Ativos de Marca</h3>
                  <p className="text-sm text-blue-700">
                    Faça upload de logos, mascotes, elementos gráficos e padrões. Eles aparecem automaticamente
                    nas seções correspondentes do brandbook e são salvos localmente.
                  </p>
                </div>
                <UploadedAssetsPanel
                  assets={uploadedBrandAssets}
                  onChange={setUploadedBrandAssets}
                />
              </div>
            )}

            {/* Sub-tab: Image Generation */}
            {viewerTab === "images" && (
              <div className="space-y-6">
                <div className="bg-white border rounded-xl p-6 shadow-sm">
                  <ImageGenPanel
                    data={brandbookData}
                    generatedAssets={generatedAssets}
                    apiKeys={apiKeys}
                    onAssetGenerated={(key, asset) =>
                      setGeneratedAssets((prev) => ({ ...prev, [key]: asset }))
                    }
                  />
                </div>
                <div className="bg-white border rounded-xl p-6 shadow-sm">
                  <LogoConceptPanel
                    brandbook={brandbookData}
                    apiKeys={apiKeys}
                  />
                </div>
              </div>
            )}

            {/* Sub-tab: Production JSON Preview */}
            {viewerTab === "json" && (() => {
              const manifest = generateProductionManifest(brandbookData);
              return (
                <div className="space-y-6">
                  <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-5">
                    <h3 className="font-bold text-indigo-900 mb-1">Production Manifest</h3>
                    <p className="text-sm text-indigo-700 mb-3">
                      JSON detalhado para produção das peças de marca. Inclui CSS variables, SCSS vars,
                      tokens Tailwind, especificações de logo, peças de impressão, digital, social e e-mail.
                    </p>
                    <button
                      onClick={handleExportProduction}
                      className="bg-indigo-600 text-white py-2 px-5 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition"
                    >
                      ↓ Download Production Manifest JSON
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-900 text-gray-100 rounded-xl p-5 overflow-auto">
                      <div className="text-xs text-gray-400 mb-2 font-bold uppercase tracking-wider">CSS Variables</div>
                      <pre className="text-xs leading-relaxed whitespace-pre-wrap">{manifest.colorSystem.cssVariables}</pre>
                    </div>
                    <div className="bg-gray-900 text-gray-100 rounded-xl p-5 overflow-auto">
                      <div className="text-xs text-gray-400 mb-2 font-bold uppercase tracking-wider">SCSS Variables</div>
                      <pre className="text-xs leading-relaxed whitespace-pre-wrap">{manifest.colorSystem.scssVariables}</pre>
                    </div>
                  </div>

                  <div className="bg-white border rounded-xl p-5">
                    <h4 className="font-bold mb-3">Google Fonts URL</h4>
                    <a
                      href={manifest.typographySystem.googleFontsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline text-sm break-all font-mono"
                    >
                      {manifest.typographySystem.googleFontsUrl}
                    </a>
                  </div>

                  <div className="bg-white border rounded-xl p-5">
                    <h4 className="font-bold mb-3">Tailwind Config Extend</h4>
                    <pre className="bg-gray-50 rounded-lg p-4 text-xs overflow-auto">
                      {JSON.stringify({ theme: { extend: manifest.designTokens.tailwindExtend } }, null, 2)}
                    </pre>
                  </div>

                  {([
                    { title: "Peças de Impressão", items: manifest.assets.print },
                    { title: "Ativos Digitais", items: manifest.assets.digital },
                    { title: "Redes Sociais", items: manifest.assets.social },
                    { title: "E-mail", items: manifest.assets.email },
                  ] as const).map(({ title, items }) => (
                    <div key={title} className="bg-white border rounded-xl overflow-hidden">
                      <div className="px-5 py-4 bg-gray-50 border-b">
                        <h4 className="font-bold">{title}</h4>
                        <p className="text-xs text-gray-500">{items.length} peças especificadas</p>
                      </div>
                      <div className="divide-y">
                        {items.map((item, i) => (
                          <div key={i} className="px-5 py-3 flex flex-col md:flex-row md:items-start gap-2">
                            <div className="flex-1">
                              <div className="font-medium text-sm">{item.name}</div>
                              <div className="text-xs text-gray-500 mt-0.5">{item.notes}</div>
                            </div>
                            <div className="flex gap-3 text-xs text-gray-400 shrink-0">
                              <span className="bg-gray-100 px-2 py-0.5 rounded">{item.dimensions}</span>
                              <span className="bg-gray-100 px-2 py-0.5 rounded">{item.format}</span>
                              <span className="bg-gray-100 px-2 py-0.5 rounded">{item.colorProfile}</span>
                              {item.resolution && <span className="bg-gray-100 px-2 py-0.5 rounded">{item.resolution}</span>}
                              {item.bleed && <span className="bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded">sangria {item.bleed}</span>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}

            {/* Sub-tab: JSON por Seção */}
            {viewerTab === "sections" && (
              <JsonBySectionPanel data={brandbookData} onDownload={downloadJson} />
            )}

            {/* Sub-tab: Refinar */}
            {viewerTab === "refine" && (
              <div className="max-w-2xl mx-auto space-y-6">
                <div className="bg-white border rounded-xl p-8 shadow-sm">
                  <RefinePanel
                    brandbook={brandbookData}
                    apiKeys={apiKeys}
                    textProvider={textProvider}
                    onRefined={(updated) => {
                      setBrandbookData(updated);
                      setViewerTab("preview");
                    }}
                  />
                </div>
                <div className="bg-white border rounded-xl p-8 shadow-sm">
                  <RegenerateSectionsPanel
                    brandbook={brandbookData}
                    apiKeys={apiKeys}
                    textProvider={textProvider}
                    onUpdated={(updated) => setBrandbookData(updated)}
                  />
                </div>
              </div>
            )}

            {/* Sub-tab: Consistência */}
            {viewerTab === "consistency" && (
              <div className="max-w-2xl mx-auto bg-white border rounded-xl p-8 shadow-sm">
                <ConsistencyPanel
                  brandbook={brandbookData}
                  apiKeys={apiKeys}
                  textProvider={textProvider}
                />
              </div>
            )}

            {/* Sub-tab: Exportar */}
            {viewerTab === "export" && (
              <div className="max-w-2xl mx-auto bg-white border rounded-xl p-8 shadow-sm">
                <ExportPanel
                  brandbook={brandbookData}
                  viewerElementId="brandbook-content"
                />
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

function ExampleCard({
  title,
  subtitle,
  description,
  badge,
  color,
  onClick,
}: {
  title: string;
  subtitle: string;
  description: string;
  badge?: string;
  color: "blue" | "pink" | "red";
  onClick: () => void;
}) {
  const colorMap = {
    blue: "from-blue-600 to-blue-900",
    pink: "from-pink-500 to-purple-900",
    red: "from-red-800 to-red-950",
  };

  return (
    <button
      onClick={onClick}
      className="text-left bg-white border rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all group"
    >
      <div className={`h-32 bg-gradient-to-br ${colorMap[color]} flex items-center justify-center relative`}>
        <span className="text-white text-3xl font-extrabold tracking-tight opacity-80 group-hover:opacity-100 transition-opacity">
          {title}
        </span>
        {badge && (
          <span className="absolute top-3 right-3 bg-white/20 text-white text-[10px] font-bold uppercase px-2 py-1 rounded-full backdrop-blur-sm">
            {badge}
          </span>
        )}
      </div>
      <div className="p-5">
        <h3 className="font-bold text-lg">{title}</h3>
        <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">{subtitle}</p>
        <p className="text-gray-600 text-sm">{description}</p>
      </div>
    </button>
  );
}

function JsonBySectionPanel({
  data,
  onDownload,
}: {
  data: BrandbookData;
  onDownload: (data: unknown, filename: string) => void;
}) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [copied, setCopied] = useState<Record<string, boolean>>({});

  const slug = data.brandName.replace(/\s+/g, "-").toLowerCase();

  const sections: { id: string; icon: string; title: string; description: string; data: unknown }[] = [
    {
      id: "identity",
      icon: "🪪",
      title: "Identidade (Base)",
      description: "brandName, industry, brandConcept",
      data: {
        brandName: data.brandName,
        industry: data.industry,
        brandConcept: data.brandConcept,
      },
    },

    ...(data.positioning ? [{
      id: "positioning",
      icon: "🧭",
      title: "Posicionamento",
      description: "positioning — categoria, statement, diferenciais, concorrentes, RTBs",
      data: { positioning: data.positioning },
    }] : []),

    ...(data.audiencePersonas ? [{
      id: "audience",
      icon: "🧑‍💼",
      title: "Público-alvo (Personas)",
      description: "audiencePersonas — objetivos, dores, objeções, canais",
      data: { audiencePersonas: data.audiencePersonas },
    }] : []),

    ...(data.verbalIdentity ? [{
      id: "verbal",
      icon: "🗣️",
      title: "Identidade Verbal & Mensagens",
      description: "verbalIdentity — tagline, pillars, do/don't, vocabulário, CTAs",
      data: { verbalIdentity: data.verbalIdentity },
    }] : []),
    {
      id: "logo",
      icon: "🖼️",
      title: "Logo & Identidade Visual",
      description: "logo — primary, secondary, favicon, clearSpace, minSize, incorrectUsages",
      data: { logo: data.logo },
    },

    ...(data.logoVariants ? [{
      id: "logoVariants",
      icon: "🧩",
      title: "Variações de Logo",
      description: "logoVariants — horizontal, stacked, mono, negative, mark/word",
      data: { logoVariants: data.logoVariants },
    }] : []),
    {
      id: "colors",
      icon: "🎨",
      title: "Sistema de Cores",
      description: "colors — primary, secondary, semantic, dataViz",
      data: { colors: data.colors },
    },
    {
      id: "typography",
      icon: "🔤",
      title: "Tipografia",
      description: "typography — marketing/primary, ui/secondary, monospace",
      data: { typography: data.typography },
    },

    ...(data.typographyScale ? [{
      id: "typographyScale",
      icon: "📏",
      title: "Escala Tipográfica",
      description: "typographyScale — estilos H1/H2/body/caption etc",
      data: { typographyScale: data.typographyScale },
    }] : []),

    ...(data.uiGuidelines ? [{
      id: "uiGuidelines",
      icon: "🧱",
      title: "Guidelines de UI",
      description: "uiGuidelines — grid, densidade, componentes, estados, a11y",
      data: { uiGuidelines: data.uiGuidelines },
    }] : []),
    {
      id: "keyvisual",
      icon: "🔮",
      title: "Key Visual & Linguagem Gráfica",
      description: "keyVisual — elements, photographyStyle, iconography, illustrations, marketingArchitecture",
      data: { keyVisual: data.keyVisual },
    },
    ...(data.designTokens || data.accessibility ? [{
      id: "tokens",
      icon: "📐",
      title: "Design Tokens & Acessibilidade",
      description: "designTokens, accessibility — spacing, radii, shadows, WCAG rules",
      data: {
        ...(data.designTokens && { designTokens: data.designTokens }),
        ...(data.accessibility && { accessibility: data.accessibility }),
      },
    }] : []),
    ...(data.uxPatterns || data.microcopy || data.motion ? [{
      id: "ux",
      icon: "💬",
      title: "UX Patterns, Microcopy & Motion",
      description: "uxPatterns, microcopy, motion — onboarding, empty states, transitions",
      data: {
        ...(data.uxPatterns && { uxPatterns: data.uxPatterns }),
        ...(data.microcopy && { microcopy: data.microcopy }),
        ...(data.motion && { motion: data.motion }),
      },
    }] : []),
    {
      id: "applications",
      icon: "🖨️",
      title: "Aplicações de Marca",
      description: "applications — type, description, imagePlaceholder para cada peça",
      data: { applications: data.applications },
    },

    ...(data.productionGuidelines ? [{
      id: "production",
      icon: "📦",
      title: "Produção & Handoff",
      description: "productionGuidelines — specs de impressão/digital, checklist, entregáveis",
      data: { productionGuidelines: data.productionGuidelines },
    }] : []),
    ...(data.imageGenerationBriefing ? [{
      id: "imagegen",
      icon: "🤖",
      title: "Briefing de Geração de Imagens",
      description: "imageGenerationBriefing — prompts para DALL-E 3, Stability AI, Ideogram",
      data: { imageGenerationBriefing: data.imageGenerationBriefing },
    }] : []),
  ];

  function toggleExpand(id: string) {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  async function copySection(id: string, sectionData: unknown) {
    await navigator.clipboard.writeText(JSON.stringify(sectionData, null, 2));
    setCopied((prev) => ({ ...prev, [id]: true }));
    setTimeout(() => setCopied((prev) => ({ ...prev, [id]: false })), 2000);
  }

  return (
    <div className="space-y-3">
      <div className="bg-gray-50 border rounded-xl px-5 py-4 flex items-start justify-between gap-4">
        <div>
          <h3 className="font-bold text-gray-900 mb-1">JSON por Seção</h3>
          <p className="text-sm text-gray-500">
            Exporte ou copie cada bloco do brandbook individualmente — identidade, cores, tipografia, tokens, UX e aplicações.
          </p>
        </div>
        <button
          onClick={() => onDownload(data, `${slug}-brandbook-completo.json`)}
          className="shrink-0 bg-gray-900 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-800 transition"
        >
          ↓ Tudo em JSON
        </button>
      </div>

      {sections.map((section) => {
        const isOpen = expanded[section.id];
        const isCopied = copied[section.id];
        const jsonStr = JSON.stringify(section.data, null, 2);

        return (
          <div key={section.id} className="bg-white border rounded-xl overflow-hidden">
            <button
              onClick={() => toggleExpand(section.id)}
              className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition text-left"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl leading-none">{section.icon}</span>
                <div>
                  <div className="font-semibold text-sm text-gray-900">{section.title}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{section.description}</div>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0 ml-4">
                <span
                  onClick={(e) => { e.stopPropagation(); copySection(section.id, section.data); }}
                  className="cursor-pointer text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2.5 py-1.5 rounded-lg font-medium transition"
                >
                  {isCopied ? "✓ Copiado" : "Copiar"}
                </span>
                <span
                  onClick={(e) => { e.stopPropagation(); onDownload(section.data, `${slug}-${section.id}.json`); }}
                  className="cursor-pointer text-xs bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-2.5 py-1.5 rounded-lg font-medium transition"
                >
                  ↓ JSON
                </span>
                <span className={`text-gray-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}>▼</span>
              </div>
            </button>

            {isOpen && (
              <div className="border-t">
                <div className="bg-gray-900 p-4 overflow-auto max-h-96">
                  <pre className="text-xs text-gray-200 leading-relaxed whitespace-pre-wrap">{jsonStr}</pre>
                </div>
                <div className="px-5 py-3 bg-gray-50 flex items-center justify-between border-t">
                  <span className="text-xs text-gray-400">
                    {jsonStr.split("\n").length} linhas · {Math.round(jsonStr.length / 1024 * 10) / 10} KB
                  </span>
                  <button
                    onClick={() => copySection(section.id, section.data)}
                    className="text-xs bg-gray-900 text-white px-4 py-1.5 rounded-lg font-medium hover:bg-gray-700 transition"
                  >
                    {isCopied ? "✓ Copiado!" : "Copiar JSON"}
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
