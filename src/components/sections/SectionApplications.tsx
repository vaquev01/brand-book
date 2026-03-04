"use client";
import { BrandbookData } from "@/lib/types";
import { ASSET_CATALOG, type AssetKey } from "@/lib/imagePrompts";

interface Props {
  data: BrandbookData;
  num: number;
  generatedImages?: Record<string, string>;
  onGoToImages?: () => void;
  onUpdateApplicationImageKey?: (index: number, imageKey: AssetKey | undefined) => void;
}

const KEYWORD_MAP: [string[], string][] = [
  [["card", "cartão", "visita", "business", "vista"], "business_card"],
  [["app", "mobile", "interface", "tela", "screen", "dashboard"], "app_mockup"],
  [["billboard", "outdoor", "placa", "fachada", "totem"], "outdoor_billboard"],
  [["social", "instagram", "post", "feed", "redes"], "social_post_square"],
  [["story", "stories", "vertical", "reels"], "app_mockup"],
  [["cover", "capa", "facebook", "linkedin", "perfil"], "social_cover"],
  [["email", "newsletter", "e-mail", "mailing"], "email_header"],
  [["menu", "cardápio", "folder", "brochure", "material", "coaster", "bolacha", "papelaria"], "brand_collateral"],
  [["lifestyle", "fotos", "photo", "editorial"], "hero_lifestyle"],
  [["hero", "banner", "header", "site", "web", "landing"], "hero_visual"],
  [["pattern", "padrão", "textura", "texture", "estampa"], "brand_pattern"],
  [["logo", "logotipo", "marca", "símbolo"], "logo_primary"],
];

function findImage(app: BrandbookData["applications"][number], generatedImages: Record<string, string>): string | null {
  if (app.imageKey && generatedImages[app.imageKey]) return generatedImages[app.imageKey];
  const lc = app.type.toLowerCase();
  for (const [keywords, key] of KEYWORD_MAP) {
    if (keywords.some((kw) => lc.includes(kw)) && generatedImages[key]) {
      return generatedImages[key];
    }
  }
  return null;
}

export function SectionApplications({ data, num, generatedImages = {}, onGoToImages, onUpdateApplicationImageKey }: Props) {
  const totalGenerated = Object.keys(generatedImages).length;

  return (
    <section className="page-break mb-16">
      <div className="flex items-center justify-between mb-8 border-b pb-4">
        <h2 className="text-3xl font-bold">{String(num).padStart(2, "0")}. Aplicações</h2>
        {onGoToImages && (
          <button
            onClick={onGoToImages}
            className="no-print flex items-center gap-2 bg-indigo-600 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
          >
            {totalGenerated > 0 ? (
              <span className="bg-white text-indigo-700 text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">{totalGenerated}</span>
            ) : (
              <span>✦</span>
            )}
            Gerar Imagens com IA
          </button>
        )}
      </div>

      {totalGenerated > 0 && (
        <div className="no-print mb-6 bg-green-50 border border-green-200 text-green-800 rounded-xl px-4 py-3 text-sm flex items-center gap-2">
          <span className="text-green-600 font-bold">✓</span>
          <span>{totalGenerated} {totalGenerated === 1 ? "imagem gerada" : "imagens geradas"} com IA — substituindo os mockups abaixo automaticamente.</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {data.applications.map((app, i) => {
          const aiImage = findImage(app, generatedImages);
          const selectId = `application-image-key-${i}`;
          return (
            <div key={i} className="bg-white border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group relative">
              <div className="aspect-video bg-gray-900 overflow-hidden relative">
                {aiImage ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={aiImage} alt={app.type} className="w-full h-full object-cover" />
                    <span className="absolute top-2 right-2 bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow">
                      IA
                    </span>
                  </>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-3 px-4">
                    <span className="text-white/20 text-5xl font-black tracking-tighter select-none">{app.type.slice(0, 2).toUpperCase()}</span>
                    <span className="text-white/40 text-xs text-center font-medium">{app.type}</span>
                    {onGoToImages && (
                      <button
                        onClick={onGoToImages}
                        className="no-print mt-1 text-[11px] bg-white/10 hover:bg-white/20 text-white/70 px-3 py-1 rounded-full transition"
                      >
                        + Gerar imagem
                      </button>
                    )}
                  </div>
                )}
              </div>
              <div className="p-5">
                <h3 className="font-bold text-lg mb-2">{app.type}</h3>
                <p className="text-gray-600 text-sm mb-3">{app.description}</p>
                {(app.dimensions || app.materialSpecs || app.layoutGuidelines || app.typographyHierarchy || app.artDirection || app.substrates) && (
                  <div className="space-y-2 mb-3 border-t pt-3">
                    {app.dimensions && (
                      <div className="text-xs"><span className="font-semibold text-gray-700">Dimensões:</span> <span className="text-gray-600 font-mono">{app.dimensions}</span></div>
                    )}
                    {app.materialSpecs && (
                      <div className="text-xs"><span className="font-semibold text-gray-700">Material:</span> <span className="text-gray-600">{app.materialSpecs}</span></div>
                    )}
                    {app.layoutGuidelines && (
                      <div className="text-xs"><span className="font-semibold text-gray-700">Layout:</span> <span className="text-gray-600">{app.layoutGuidelines}</span></div>
                    )}
                    {app.typographyHierarchy && (
                      <div className="text-xs"><span className="font-semibold text-gray-700">Tipografia:</span> <span className="text-gray-600">{app.typographyHierarchy}</span></div>
                    )}
                    {app.artDirection && (
                      <div className="text-xs"><span className="font-semibold text-gray-700">Direção de Arte:</span> <span className="text-gray-600">{app.artDirection}</span></div>
                    )}
                    {app.substrates && app.substrates.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {app.substrates.map((s, j) => (
                          <span key={j} className="bg-gray-100 text-gray-600 text-[10px] px-2 py-0.5 rounded">{s}</span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                {onUpdateApplicationImageKey && totalGenerated > 0 && (
                  <div className="no-print mt-4 border-t pt-4">
                    <label
                      htmlFor={selectId}
                      className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2"
                    >
                      {aiImage ? "Imagem vinculada" : "Vincular imagem gerada"}
                    </label>
                    <select
                      id={selectId}
                      aria-label="Escolher qual imagem gerada usar nesta aplicação"
                      name={selectId}
                      title="Escolher qual imagem gerada usar nesta aplicação"
                      value={app.imageKey ?? ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        onUpdateApplicationImageKey(i, (val ? (val as AssetKey) : undefined));
                      }}
                      className="w-full bg-gray-50 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10"
                    >
                      <option value="">Automático</option>
                      {ASSET_CATALOG.filter((a) => !!generatedImages[a.key]).map((a) => (
                        <option key={a.key} value={a.key}>
                          {a.label}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
