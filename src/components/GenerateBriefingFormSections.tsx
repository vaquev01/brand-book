"use client";

import type { CreativityLevel, GenerateScope, UploadedAsset } from "@/lib/types";
import { BriefingImageUpload } from "./BriefingImageUpload";
import { CREATIVITY_OPTIONS, SCOPE_OPTIONS, type GuidedBriefing, type ProjectMode } from "./generateBriefingFormModel";

export function BasicInfoSection({
  brandName,
  industry,
  onBrandNameChange,
  onIndustryChange,
}: {
  brandName: string;
  industry: string;
  onBrandNameChange: (value: string) => void;
  onIndustryChange: (value: string) => void;
}) {
  return (
    <div className="app-shell space-y-5 p-6">
      <div className="mb-2 flex items-center gap-2 border-b border-slate-200/80 pb-4">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-building-2 text-gray-400"><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/></svg>
        <h3 className="font-bold text-gray-900">Informações Básicas</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label htmlFor="brandName" className="block text-sm font-bold text-gray-700 mb-2">
            Nome da Marca <span className="text-red-500">*</span>
          </label>
          <input
            id="brandName"
            type="text"
            required
            value={brandName}
            onChange={(e) => onBrandNameChange(e.target.value)}
            placeholder="Ex: Neon Tokyo, CloudFlow..."
            className="app-input font-medium placeholder:font-normal"
          />
        </div>
        <div>
          <label htmlFor="industry" className="block text-sm font-bold text-gray-700 mb-2">
            Indústria / Nicho <span className="text-red-500">*</span>
          </label>
          <input
            id="industry"
            type="text"
            required
            value={industry}
            onChange={(e) => onIndustryChange(e.target.value)}
            placeholder="Ex: SaaS B2B, Restaurante..."
            className="app-input font-medium placeholder:font-normal"
          />
        </div>
      </div>
    </div>
  );
}

export function ProjectModeSection({
  projectMode,
  onChange,
}: {
  projectMode: ProjectMode;
  onChange: (value: ProjectMode) => void;
}) {
  return (
    <div className="app-shell p-6">
      <div className="mb-4 flex items-center gap-2 border-b border-slate-200/80 pb-4">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-refresh-cw text-gray-400"><path d="M3 2v6h6"/><path d="M21 12A9 9 0 0 0 6 5.3L3 8"/><path d="M21 22v-6h-6"/><path d="M3 12a9 9 0 0 0 15 6.7l3-2.7"/></svg>
        <div>
          <h3 className="font-bold text-gray-900">Tipo de projeto</h3>
          <p className="text-xs text-gray-500 mt-0.5">Do zero ou preservando equity existente</p>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => onChange("new_brand")}
          className={`app-card-button p-4 text-left ${
            projectMode === "new_brand"
              ? "border-indigo-500/70 bg-indigo-50/90 shadow-[0_18px_34px_-24px_rgba(99,102,241,0.45)] ring-1 ring-indigo-500/20"
              : "bg-white/80 hover:border-indigo-300 hover:bg-white"
          }`}
        >
          <div className={`font-bold text-sm ${projectMode === "new_brand" ? "text-indigo-900" : "text-gray-900"}`}>
            Marca nova
          </div>
          <div className={`text-xs mt-1.5 leading-relaxed ${projectMode === "new_brand" ? "text-indigo-700/80" : "text-gray-500"}`}>
            Identidade criada do zero, sem equity anterior.
          </div>
        </button>
        <button
          type="button"
          onClick={() => onChange("rebrand")}
          className={`app-card-button p-4 text-left ${
            projectMode === "rebrand"
              ? "border-indigo-500/70 bg-indigo-50/90 shadow-[0_18px_34px_-24px_rgba(99,102,241,0.45)] ring-1 ring-indigo-500/20"
              : "bg-white/80 hover:border-indigo-300 hover:bg-white"
          }`}
        >
          <div className={`font-bold text-sm ${projectMode === "rebrand" ? "text-indigo-900" : "text-gray-900"}`}>
            Renovação / evolução
          </div>
          <div className={`text-xs mt-1.5 leading-relaxed ${projectMode === "rebrand" ? "text-indigo-700/80" : "text-gray-500"}`}>
            Preserva o que funciona e evolui com mais sistema e coerência.
          </div>
        </button>
      </div>
    </div>
  );
}

export function ScopeSection({ scope, onChange }: { scope: GenerateScope; onChange: (value: GenerateScope) => void }) {
  return (
    <div className="app-shell p-6">
      <div className="mb-4 flex items-center gap-2 border-b border-slate-200/80 pb-4">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-crosshair text-gray-400"><circle cx="12" cy="12" r="10"/><line x1="22" x2="18" y1="12" y2="12"/><line x1="6" x2="2" y1="12" y2="12"/><line x1="12" x2="12" y1="6" y2="2"/><line x1="12" x2="12" y1="22" y2="18"/></svg>
        <div>
          <h3 className="font-bold text-gray-900">O que gerar?</h3>
          <p className="text-xs text-gray-500 mt-0.5">Escolha o foco principal do brandbook</p>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {SCOPE_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`app-card-button p-4 text-left ${
              scope === opt.value
                ? "border-indigo-500/70 bg-indigo-50/90 shadow-[0_18px_34px_-24px_rgba(99,102,241,0.45)] ring-1 ring-indigo-500/20"
                : "bg-white/80 hover:border-indigo-300 hover:bg-white"
            }`}
          >
            <div className="text-2xl mb-2 opacity-90">{opt.icon}</div>
            <div className={`font-bold text-sm ${scope === opt.value ? "text-indigo-900" : "text-gray-900"}`}>
              {opt.label}
            </div>
            <div className={`text-xs mt-1.5 leading-relaxed ${scope === opt.value ? "text-indigo-700/80" : "text-gray-500"}`}>
              {opt.desc}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

export function CreativitySection({
  creativity,
  onChange,
}: {
  creativity: CreativityLevel;
  onChange: (value: CreativityLevel) => void;
}) {
  const selectedCreativity = CREATIVITY_OPTIONS.find((option) => option.value === creativity)!;

  return (
    <div className="app-shell p-6">
      <div className="mb-4 flex items-center gap-2 border-b border-slate-200/80 pb-4">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-palette text-gray-400"><circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/></svg>
        <div>
          <h3 className="font-bold text-gray-900">Nível de criatividade</h3>
          <p className="text-xs text-gray-500 mt-0.5">Posicionamento criativo da IA</p>
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {CREATIVITY_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`app-card-button p-3 text-center ${
              creativity === opt.value ? opt.color + " border-current shadow-sm ring-1 ring-current/10" : "bg-white/80 hover:border-gray-300 hover:bg-white"
            }`}
          >
            <div className="text-2xl mb-1">{opt.icon}</div>
            <div className="font-bold text-sm">{opt.label}</div>
            <div className="text-[11px] mt-0.5 opacity-70 leading-tight">{opt.sub}</div>
          </button>
        ))}
      </div>
      {creativity !== "balanced" && (
        <div className={`app-surface-soft mt-3 px-4 py-3 text-xs ${selectedCreativity.color}`}>
          <strong>{selectedCreativity.icon} {selectedCreativity.label}:</strong>{" "}
          {creativity === "conservative" && "Até 3 cores, formas limpas, tipografia com autoridade. Ref: IBM, Rolex."}
          {creativity === "creative" && "Cores inesperadas, tipografia expressiva. Ref: Spotify, Oatly."}
          {creativity === "experimental" && "Quebra de convenções. Cult brand. Ref: Saul Bass, Sagmeister."}
        </div>
      )}
    </div>
  );
}

/** @deprecated IntentionalityToggle is no longer used — semiotic analysis is always active */
export function IntentionalityToggle(_props: { intentionality: boolean; onToggle: () => void }) {
  return null;
}

export function GuidedField({
  label,
  hint,
  placeholder,
  value,
  onChange,
  rows = 2,
}: {
  label: string;
  hint: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
}) {
  return (
    <div>
      <div className="flex items-baseline gap-2 mb-1">
        <span className="text-sm font-medium">{label}</span>
        <span className="text-xs text-gray-400">{hint}</span>
      </div>
      <textarea
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="app-textarea text-sm"
        aria-label={label}
      />
    </div>
  );
}

export function GuidedBriefingSection({
  showGuided,
  filledGuidedCount,
  guided,
  onToggle,
  onUpdate,
}: {
  showGuided: boolean;
  filledGuidedCount: number;
  guided: GuidedBriefing;
  onToggle: () => void;
  onUpdate: (field: keyof GuidedBriefing, value: string | boolean) => void;
}) {
  return (
    <div className="app-shell overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between bg-white/50 px-6 py-5 text-left transition-colors hover:bg-indigo-50/50"
      >
        <div className="flex items-center gap-3">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-clipboard-list text-gray-500"><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M12 11h4"/><path d="M12 16h4"/><path d="M8 11h.01"/><path d="M8 16h.01"/></svg>
          <span className="font-bold text-gray-900 text-sm">Briefing Guiado</span>
          <span className="app-chip text-xs font-medium text-gray-500">
            {filledGuidedCount > 0 ? `${filledGuidedCount} preenchido${filledGuidedCount > 1 ? "s" : ""}` : "Opcional"}
          </span>
        </div>
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`text-gray-400 transition-transform duration-200 ${showGuided ? "rotate-180" : ""}`}><path d="m6 9 6 6 6-6"/></svg>
      </button>

      {showGuided && (
        <div className="space-y-4 border-t border-slate-200/80 p-5">
          <GuidedField label="O que a marca faz?" hint="Produto/serviço em 1-3 frases" placeholder="Ex: Plataforma de gestão para times remotos. Foco em simplicidade." value={guided.whatItDoes} onChange={(value) => onUpdate("whatItDoes", value)} />
          <GuidedField label="Público-alvo" hint="Idade, estilo de vida, dores, aspirações" placeholder="Ex: Profissionais 28-42, digitais, valorizam produtividade. 8-20k/mês, capitais." value={guided.targetAudience} onChange={(value) => onUpdate("targetAudience", value)} />
          <GuidedField label="Posicionamento" hint="Como quer ser percebido? O que diferencia?" placeholder='Ex: Alternativa premium ao Trello — menos features, mais foco. "O Notion para quem tem TDAH."' value={guided.positioning} onChange={(value) => onUpdate("positioning", value)} />
          <GuidedField label="Valores e crenças" hint="O que a marca defende?" placeholder="Ex: Simplicidade é sofisticação. Foco vale mais que features. Design bom é invisível." value={guided.brandValues} onChange={(value) => onUpdate("brandValues", value)} rows={3} />
          <GuidedField label="Território emocional" hint="O que devem SENTIR ao interagir?" placeholder='Ex: Alívio + confiança. Competência tranquila. "Isso funciona e eu nem percebi."' value={guided.emotionalTerritory} onChange={(value) => onUpdate("emotionalTerritory", value)} rows={3} />
          <GuidedField label="Referências de marcas" hint="Marcas que admira (estética, estratégia ou tom)" placeholder="Ex: Visual: Notion, Linear. Estratégia: Apple. Tom: Oatly. Material: Aesop." value={guided.references} onChange={(value) => onUpdate("references", value)} />
          <GuidedField label="Essência cultural" hint="Vibe, arquétipos, filmes, artistas, décadas" placeholder="Ex: Rebelde elegante. Brutalismo + luxo. Blade Runner, Dieter Rams. Anos 70 + futuro." value={guided.essenceReferences} onChange={(value) => onUpdate("essenceReferences", value)} rows={3} />
          <GuidedField label="Fraquezas da concorrência" hint="O que fazem mal? Onde está a oportunidade?" placeholder="Ex: Todos usam azul corporativo e linguagem genérica. Oportunidade: personalidade real." value={guided.competitorWeaknesses} onChange={(value) => onUpdate("competitorWeaknesses", value)} rows={3} />
          <GuidedField label="Touchpoints" hint="Digital? Físico? Redes? PDV? App?" placeholder="Ex: 80% digital (site, app, Instagram). 20% físico (eventos, adesivos)." value={guided.physicalTouchpoints} onChange={(value) => onUpdate("physicalTouchpoints", value)} rows={3} />
          <GuidedField label="O que NÃO transmitir" hint="Proibições visuais e de tom" placeholder="Ex: Corporativo, genérico, colorido demais. Nada que pareça banco ou startup genérica." value={guided.avoidances} onChange={(value) => onUpdate("avoidances", value)} />
          <GuidedField label="Preferências de cores" hint="Cores que gosta, odeia ou representam a marca" placeholder="Ex: Evitar azul corporativo. Paleta escura + acento vibrante. Ref: Figma." value={guided.colorPreferences} onChange={(value) => onUpdate("colorPreferences", value)} />
          <GuidedField label="Links oficiais" hint="Perfis e sites da marca" placeholder="Ex: https://instagram.com/suaMarca\nhttps://site.com" value={guided.instagramLinks} onChange={(value) => onUpdate("instagramLinks", value)} rows={3} />

          <div className="flex items-center gap-3">
            <button
              type="button"
              role="switch"
              aria-checked={guided.hasMascot}
              aria-label="Alternar mascote"
              onClick={() => onUpdate("hasMascot", !guided.hasMascot)}
              className={`flex-shrink-0 w-10 h-5 rounded-full transition-colors relative ${guided.hasMascot ? "bg-gray-900" : "bg-gray-300"}`}
            >
              <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${guided.hasMascot ? "translate-x-5" : "translate-x-0.5"}`} />
            </button>
            <span className="text-sm font-medium">Incluir mascote ou personagem?</span>
          </div>

          {guided.hasMascot && (
            <GuidedField label="Descreva o mascote" hint="Aparência, personalidade, referências" placeholder="Ex: Robô amigável estilo Michelin mas tech. Nerd que simplifica o complexo." value={guided.mascotDescription} onChange={(value) => onUpdate("mascotDescription", value)} />
          )}

          <GuidedField label="Contexto adicional" hint="Outras informações relevantes" placeholder="Ex: Logo não pode mudar, mas tudo mais pode evoluir." value={guided.extraContext} onChange={(value) => onUpdate("extraContext", value)} rows={3} />
        </div>
      )}
    </div>
  );
}

export function RawBriefingSection({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <div className="app-shell p-6">
      <div className="mb-4 flex items-center gap-2 border-b border-slate-200/80 pb-4">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-align-left text-gray-400"><line x1="21" x2="3" y1="6" y2="6"/><line x1="15" x2="3" y1="12" y2="12"/><line x1="17" x2="3" y1="18" y2="18"/></svg>
        <div>
          <h3 className="font-bold text-gray-900">Briefing Livre</h3>
          <p className="text-xs text-gray-500 mt-0.5">Complementa o briefing guiado</p>
        </div>
      </div>
      <textarea
        id="rawBriefing"
        rows={4}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Detalhes extras, inspirações, restrições, objetivos..."
        className="app-textarea placeholder:text-gray-400"
      />
    </div>
  );
}

export function ExternalUrlsSection({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <div className="app-shell p-6">
      <div className="mb-4 flex items-center gap-2 border-b border-slate-200/80 pb-4">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-link-2 text-gray-400"><path d="M9 17H7A5 5 0 0 1 7 7h2"/><path d="M15 7h2a5 5 0 0 1 0 10h-2"/><line x1="8" x2="16" y1="12" y2="12"/></svg>
        <div>
          <h3 className="font-bold text-gray-900">Referências Externas (URLs)</h3>
          <p className="text-xs text-gray-500 mt-0.5">Opcional — extrai metadados para contexto</p>
        </div>
      </div>
      <textarea
        id="externalUrls"
        rows={3}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Cole links (1 por linha). Ex: https://www.instagram.com/caracabaroficial/\nhttps://site.com"
        className="app-textarea placeholder:text-gray-400"
      />
      <p className="text-xs text-gray-500 mt-2 leading-relaxed">
        Alguns sites podem bloquear leitura. Nesse caso, envie screenshots.
      </p>
    </div>
  );
}

export function LogoUploadSection({
  logoDragActive,
  logoImage,
  logoUploadError,
  onDragEnter,
  onDragLeave,
  onDrop,
  onFileChange,
  onRemoveLogo,
}: {
  logoDragActive: boolean;
  logoImage: UploadedAsset | null;
  logoUploadError: string;
  onDragEnter: () => void;
  onDragLeave: () => void;
  onDrop: (event: React.DragEvent) => void;
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveLogo: () => void;
}) {
  return (
    <>
      <div
        onDrop={onDrop}
        onDragOver={(event) => event.preventDefault()}
        onDragEnter={onDragEnter}
        onDragLeave={onDragLeave}
        className={`relative overflow-hidden rounded-[1.8rem] border-2 transition-all group ${
          logoImage
            ? "border-slate-900/20 bg-white shadow-[inset_0_1px_0_rgba(255,255,255,0.85)]"
            : logoDragActive
              ? "border-indigo-500 bg-indigo-50 ring-4 ring-indigo-500/20"
              : "border-dashed border-slate-300 bg-gradient-to-br from-white to-slate-50 hover:border-slate-400"
        }`}
      >
        <label className="flex flex-col items-center justify-center cursor-pointer p-10 text-center" htmlFor="logo-upload-input">
          {logoImage ? (
            <>
              <div className="mb-4 flex h-28 w-28 items-center justify-center overflow-hidden rounded-2xl border bg-white p-2 shadow-sm">
                <img src={logoImage.dataUrl} alt="Logo" className="max-w-full max-h-full object-contain" />
              </div>
              <p className="font-bold text-gray-900 text-sm">{logoImage.name}</p>
              <p className="text-xs text-gray-500 mt-1">A IA vai construir o brandbook a partir deste logo</p>
              <button
                type="button"
                onClick={(event) => {
                  event.preventDefault();
                  onRemoveLogo();
                }}
                className="app-secondary-button mt-4 px-3 py-1.5 text-xs text-red-600 hover:text-red-700"
              >
                Remover logo
              </button>
            </>
          ) : (
            <>
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-gray-200 bg-white shadow-sm text-gray-400 transition-colors group-hover:border-indigo-200 group-hover:text-indigo-600">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-image-up"><path d="M10.3 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10l-3.1-3.1a2 2 0 0 0-2.814.014L6 21"/><path d="m14 19.5 3-3 3 3"/><path d="M17 22v-5.5"/><circle cx="9" cy="9" r="2"/></svg>
              </div>
              <p className="font-extrabold text-gray-900 text-lg">Faça upload do seu Logo</p>
              <p className="text-sm text-gray-500 mt-1 max-w-sm">Extrai cores, estilo e personalidade do logo (PNG, SVG, JPG)</p>
              <span className="app-primary-button mt-5 inline-flex px-5 py-2.5 text-sm">
                Selecionar arquivo
              </span>
              <p className="text-xs font-medium text-gray-400 mt-4 uppercase tracking-wider">
                Opcional — sem logo, a IA cria a identidade do zero
              </p>
            </>
          )}
        </label>
        <input
          id="logo-upload-input"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={onFileChange}
        />
      </div>

      {logoUploadError && (
        <div className="app-surface-soft flex items-start gap-3 border-red-200 bg-red-50 px-4 py-3">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-alert-circle text-red-600 mt-0.5"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
          <p className="text-sm text-red-800 font-semibold">{logoUploadError}</p>
        </div>
      )}

      {logoImage && (
        <div className="app-surface-soft flex gap-3 border-indigo-200 bg-indigo-50 px-5 py-4">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-sparkles text-indigo-600 flex-shrink-0 mt-0.5"><path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/><path d="M20 3v4"/><path d="M22 5h-4"/><path d="M4 17v2"/><path d="M5 18H3"/></svg>
          <div>
            <p className="text-sm text-indigo-900 font-bold">Modo &quot;Logo-First&quot; Ativado</p>
            <p className="text-xs text-indigo-800/80 mt-1 leading-relaxed">
              Análise forense do logo: cores, tipografia, geometria e mood para um brandbook coerente.
            </p>
          </div>
        </div>
      )}
    </>
  );
}

export function ReferenceImagesSection({
  images,
  onChange,
}: {
  images: UploadedAsset[];
  onChange: (value: UploadedAsset[]) => void;
}) {
  return (
    <div className="app-shell p-6">
      <div className="mb-4 flex items-center gap-2 border-b border-slate-200/80 pb-4">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-images text-gray-400"><path d="M18 22H4a2 2 0 0 1-2-2V6"/><path d="m22 13-1.296-1.296a2.41 2.41 0 0 0-3.408 0L11 18"/><circle cx="12" cy="8" r="2"/><rect width="16" height="16" x="6" y="2" rx="2"/></svg>
        <div>
          <h3 className="font-bold text-gray-900">Imagens de Referência</h3>
          <p className="text-xs text-gray-500 mt-0.5">Opcional — capturas atuais e/ou imagens aspiracionais</p>
        </div>
      </div>
      <BriefingImageUpload images={images} onChange={onChange} />
      <p className="text-xs text-gray-500 mt-3 leading-relaxed">
        Para <strong>rebrand</strong>: misture capturas atuais com referências do conceito desejado.
      </p>
    </div>
  );
}

export function ThinBriefingWarning() {
  return (
    <div className="app-surface-soft flex gap-3 border-indigo-200 bg-indigo-50/80 px-5 py-4">
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-sparkles text-indigo-600 flex-shrink-0 mt-0.5"><path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/><path d="M20 3v4"/><path d="M22 5h-4"/><path d="M4 17v2"/><path d="M5 18H3"/></svg>
      <div>
        <p className="text-sm text-indigo-900 font-bold">A IA infere o máximo do nome + indústria</p>
        <p className="text-xs text-indigo-800/70 mt-1 leading-relaxed">
          Pode gerar assim. Para mais precisão, envie um <strong>logo</strong>, <strong>imagem</strong> ou preencha o <strong>briefing guiado</strong>.
        </p>
      </div>
    </div>
  );
}

export function FormErrorMessage({ error }: { error: string }) {
  return (
    <div className="app-surface-soft whitespace-pre-line border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
      {error}
    </div>
  );
}

export function SubmitButton({ loading }: { loading: boolean }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="app-primary-button w-full px-6 py-4 text-base"
    >
      {loading ? (
        <>
          <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          Gerando...
        </>
      ) : (
        <>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-wand-2"><path d="m21.64 3.64-1.28-1.28a1.21 1.21 0 0 0-1.72 0L2.36 18.64a1.21 1.21 0 0 0 0 1.72l1.28 1.28a1.2 1.2 0 0 0 1.72 0L21.64 5.36a1.2 1.2 0 0 0 0-1.72Z"/><path d="m14 7 3 3"/><path d="M5 6v4"/><path d="M19 14v4"/><path d="M10 2v2"/><path d="M7 8H3"/><path d="M21 16h-4"/><path d="M11 3H9"/></svg>
          Gerar Brandbook
        </>
      )}
    </button>
  );
}
