"use client";

import { useState } from "react";
import { validateLooseBrandbook } from "@/lib/brandbookValidation";
import { BrandbookData, Color, Mascot, Typography } from "@/lib/types";

type Tab =
  | "dna"
  | "logo"
  | "cores"
  | "tipografia"
  | "keyvisual"
  | "estrategia"
  | "verbal"
  | "aplicacoes"
  | "imagebriefing";

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: "dna", label: "Essência da Marca", icon: "🧬" },
  { id: "estrategia", label: "Público-Alvo", icon: "🎯" },
  { id: "verbal", label: "Identidade Verbal", icon: "🗣️" },
  { id: "logo", label: "Identidade Visual", icon: "🖼️" },
  { id: "cores", label: "Paleta de Cores", icon: "🎨" },
  { id: "tipografia", label: "Tipografia", icon: "🔤" },
  { id: "keyvisual", label: "Sistema Visual", icon: "✦" },
  { id: "aplicacoes", label: "Aplicações da Marca", icon: "🖨️" },
  { id: "imagebriefing", label: "Diretrizes de Uso", icon: "📋" },
];

interface FieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
  rows?: number;
  placeholder?: string;
}

function Field({ label, value, onChange, multiline = false, rows = 3, placeholder }: FieldProps) {
  return (
    <div>
      <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-gray-500">{label}</label>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={rows}
          placeholder={placeholder}
          className="app-textarea text-sm"
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="app-input text-sm"
        />
      )}
    </div>
  );
}

interface ArrayEditorProps {
  label: string;
  items: string[];
  onChange: (items: string[]) => void;
  addLabel?: string;
}

function ArrayEditor({ label, items, onChange, addLabel = "Adicionar" }: ArrayEditorProps) {
  const [draft, setDraft] = useState("");

  function addItem() {
    if (!draft.trim()) return;
    onChange([...items, draft.trim()]);
    setDraft("");
  }

  return (
    <div>
      <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-500">{label}</label>
      <div className="mb-2 space-y-1.5">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              type="text"
              value={item}
              onChange={(e) => {
                const next = [...items];
                next[i] = e.target.value;
                onChange(next);
              }}
              className="app-input flex-1 px-3 py-2 text-sm"
            />
            <button
              type="button"
              onClick={() => onChange(items.filter((_, j) => j !== i))}
              className="w-6 shrink-0 text-lg leading-none text-gray-400 transition hover:text-red-500"
              aria-label="Remover item"
              title="Remover"
            >
              ×
            </button>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addItem()}
          placeholder={`+ ${addLabel}...`}
          className="app-input flex-1 border-dashed px-3 py-2 text-sm"
        />
        <button
          type="button"
          onClick={addItem}
          disabled={!draft.trim()}
          className="app-primary-button px-3 py-2 text-xs"
        >
          Add
        </button>
      </div>
    </div>
  );
}

interface ColorEditorProps {
  color: Color;
  onChange: (c: Color) => void;
  onRemove: () => void;
}

function ColorEditor({ color, onChange, onRemove }: ColorEditorProps) {
  return (
    <div className="app-surface-soft space-y-2 p-3">
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={color.hex.startsWith("#") ? color.hex : "#000000"}
          onChange={(e) => onChange({ ...color, hex: e.target.value })}
          className="h-10 w-10 shrink-0 cursor-pointer rounded border"
          title="Escolher cor"
        />
        <input
          type="text"
          value={color.name}
          onChange={(e) => onChange({ ...color, name: e.target.value })}
          placeholder="Nome da cor"
          className="app-input flex-1 px-3 py-2 text-sm"
        />
        <button
          type="button"
          onClick={onRemove}
          className="w-6 shrink-0 text-lg leading-none text-gray-400 transition hover:text-red-500"
          aria-label="Remover cor"
          title="Remover"
        >
          ×
        </button>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <input
          type="text"
          value={color.hex}
          onChange={(e) => onChange({ ...color, hex: e.target.value })}
          placeholder="HEX"
          className="app-input px-3 py-2 text-xs font-mono"
        />
        <input
          type="text"
          value={color.rgb}
          onChange={(e) => onChange({ ...color, rgb: e.target.value })}
          placeholder="RGB"
          className="app-input px-3 py-2 text-xs font-mono"
        />
        <input
          type="text"
          value={color.cmyk}
          onChange={(e) => onChange({ ...color, cmyk: e.target.value })}
          placeholder="CMYK"
          className="app-input px-3 py-2 text-xs font-mono"
        />
      </div>
    </div>
  );
}

interface TypographyEditorProps {
  label: string;
  value: Typography | undefined;
  onChange: (t: Typography) => void;
}

function TypographyEditor({ label, value, onChange }: TypographyEditorProps) {
  const t = value ?? { name: "", usage: "", weights: [] };
  return (
    <div className="app-surface-soft space-y-3 p-4">
      <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">{label}</h4>
      <Field label="Família" value={t.name} onChange={(v) => onChange({ ...t, name: v })} placeholder="Ex: Inter, Playfair Display..." />
      <Field label="Uso" value={t.usage} onChange={(v) => onChange({ ...t, usage: v })} placeholder="Ex: Headlines, corpo de texto..." />
      <ArrayEditor label="Pesos" items={t.weights} onChange={(w) => onChange({ ...t, weights: w })} addLabel="Peso (ex: 400, 700, Bold)" />
    </div>
  );
}

interface MascotEditorProps {
  mascot: Mascot;
  index: number;
  onChange: (m: Mascot) => void;
  onRemove: () => void;
}

function MascotEditorCard({ mascot, index, onChange, onRemove }: MascotEditorProps) {
  return (
    <div className="app-surface-soft space-y-3 p-4">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">Mascote {index + 1}</h4>
        <button onClick={onRemove} className="text-xs font-medium text-gray-400 transition hover:text-red-500">Remover</button>
      </div>
      <Field label="Nome" value={mascot.name} onChange={(v) => onChange({ ...mascot, name: v })} placeholder="Ex: Flux, Bolinha, Kana..." />
      <Field label="Descrição Visual" value={mascot.description} onChange={(v) => onChange({ ...mascot, description: v })} multiline rows={3} placeholder="Aparência, cores, traços, estilo de ilustração..." />
      <Field label="Personalidade" value={mascot.personality} onChange={(v) => onChange({ ...mascot, personality: v })} multiline rows={2} placeholder="Como se comporta, voz, valores do personagem..." />
      <ArrayEditor label="Diretrizes de Uso" items={mascot.usageGuidelines} onChange={(g) => onChange({ ...mascot, usageGuidelines: g })} addLabel="Diretriz de uso" />
    </div>
  );
}

interface Props {
  data: BrandbookData;
  onUpdate: (data: BrandbookData) => void;
  onCancel: () => void;
}

export function BrandbookEditor({ data, onUpdate, onCancel }: Props) {
  const [editForm, setEditForm] = useState<BrandbookData>(() => JSON.parse(JSON.stringify(data)));
  const [activeTab, setActiveTab] = useState<Tab>("dna");
  const [saved, setSaved] = useState(false);
  const [validationError, setValidationError] = useState("");

  function patch(partial: Partial<BrandbookData>) {
    setEditForm((prev) => ({ ...prev, ...partial }));
    setSaved(false);
    setValidationError("");
  }

  function handleSave() {
    try {
      const validated = validateLooseBrandbook(editForm, {
        action: "salvar alterações no editor",
        subject: "Brandbook editado",
      });
      onUpdate(validated);
      setValidationError("");
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error: unknown) {
      setSaved(false);
      setValidationError(error instanceof Error ? error.message : "Brandbook inválido para salvar.");
    }
  }

  function addNewMascot() {
    const newMascot: Mascot = {
      name: "Novo Mascote",
      description: "",
      personality: "",
      usageGuidelines: [],
    };
    patch({
      keyVisual: {
        ...editForm.keyVisual,
        mascots: [...(editForm.keyVisual.mascots ?? []), newMascot],
      },
    });
  }

  function addColor(palette: "primary" | "secondary") {
    const newColor: Color = { name: "Nova Cor", hex: "#000000", rgb: "0, 0, 0", cmyk: "0, 0, 0, 100" };
    patch({ colors: { ...editForm.colors, [palette]: [...editForm.colors[palette], newColor] } });
  }

  return (
    <div className="app-shell overflow-hidden">
      <div className="flex items-center justify-between border-b border-slate-200/80 bg-white/60 px-5 py-4">
        <div>
          <h3 className="font-bold text-gray-900">Editar Brandbook</h3>
          <p className="mt-0.5 text-xs text-gray-500">Edite qualquer campo abaixo e clique em Salvar</p>
        </div>
        <div className="flex gap-2">
          <button onClick={onCancel} className="app-secondary-button px-4 py-2 text-sm">Cancelar</button>
          <button
            onClick={handleSave}
            className={saved
              ? "inline-flex items-center justify-center gap-2 rounded-2xl bg-green-600 px-5 py-2 text-sm font-semibold text-white transition shadow-[0_18px_38px_-24px_rgba(22,163,74,0.55)]"
              : "app-primary-button px-5 py-2 text-sm"
            }
          >
            {saved ? "✓ Salvo!" : "Salvar Alterações"}
          </button>
        </div>
      </div>

      <div className="flex">
        <div className="hidden w-56 shrink-0 border-r border-slate-200/80 bg-white/45 py-3 md:block">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`mx-2 flex w-[calc(100%-1rem)] items-center gap-2.5 rounded-2xl px-4 py-2.5 text-left text-sm font-medium transition ${
                activeTab === t.id ? "bg-white text-gray-900 shadow-sm ring-1 ring-slate-200" : "text-gray-500 hover:bg-white/70 hover:text-gray-900"
              }`}
            >
              <span>{t.icon}</span>
              <span>{t.label}</span>
            </button>
          ))}
        </div>

        <div className="w-full border-b border-slate-200/80 px-4 py-3 md:hidden">
          <select
            value={activeTab}
            onChange={(e) => setActiveTab(e.target.value as Tab)}
            className="app-select text-sm"
            aria-label="Selecionar seção"
          >
            {TABS.map((t) => <option key={t.id} value={t.id}>{t.icon} {t.label}</option>)}
          </select>
        </div>

        <div className="max-h-[72vh] flex-1 space-y-6 overflow-y-auto p-5 sm:p-6">
          {validationError && (
            <div className="app-surface-soft whitespace-pre-line border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              {validationError}
            </div>
          )}

          {activeTab === "dna" && (
            <>
              <Field label="Nome da Marca" value={editForm.brandName} onChange={(v) => patch({ brandName: v })} />
              <Field label="Indústria / Nicho" value={editForm.industry} onChange={(v) => patch({ industry: v })} />
              <div className="border-t border-slate-200/80 pt-4">
                <h4 className="mb-4 text-sm font-bold text-gray-700">Brand Concept</h4>
                <div className="space-y-4">
                  <Field label="Propósito" value={editForm.brandConcept.purpose} onChange={(v) => patch({ brandConcept: { ...editForm.brandConcept, purpose: v } })} multiline rows={2} />
                  <Field label="Missão" value={editForm.brandConcept.mission} onChange={(v) => patch({ brandConcept: { ...editForm.brandConcept, mission: v } })} multiline rows={2} />
                  <Field label="Visão" value={editForm.brandConcept.vision} onChange={(v) => patch({ brandConcept: { ...editForm.brandConcept, vision: v } })} multiline rows={2} />
                  <Field label="Proposta Única de Valor (UVP)" value={editForm.brandConcept.uniqueValueProposition ?? ""} onChange={(v) => patch({ brandConcept: { ...editForm.brandConcept, uniqueValueProposition: v } })} multiline rows={2} />
                  <Field label="Tom de Voz" value={editForm.brandConcept.toneOfVoice} onChange={(v) => patch({ brandConcept: { ...editForm.brandConcept, toneOfVoice: v } })} multiline rows={2} />
                  <Field label="Psicografia do Usuário" value={editForm.brandConcept.userPsychographics ?? ""} onChange={(v) => patch({ brandConcept: { ...editForm.brandConcept, userPsychographics: v } })} multiline rows={2} />
                  <ArrayEditor label="Valores" items={editForm.brandConcept.values} onChange={(v) => patch({ brandConcept: { ...editForm.brandConcept, values: v } })} addLabel="Valor" />
                  <ArrayEditor label="Personalidade" items={editForm.brandConcept.personality} onChange={(v) => patch({ brandConcept: { ...editForm.brandConcept, personality: v } })} addLabel="Traço de personalidade" />
                  <ArrayEditor label="Reasons to Believe" items={editForm.brandConcept.reasonsToBelieve ?? []} onChange={(v) => patch({ brandConcept: { ...editForm.brandConcept, reasonsToBelieve: v } })} addLabel="RTB" />
                </div>
              </div>
            </>
          )}

          {activeTab === "logo" && (
            <>
              <Field label="Logo Primário (URL)" value={editForm.logo.primary} onChange={(v) => patch({ logo: { ...editForm.logo, primary: v } })} placeholder="https://placehold.co/800x200/..." />
              <Field label="Logo Secundário (URL)" value={editForm.logo.secondary} onChange={(v) => patch({ logo: { ...editForm.logo, secondary: v } })} placeholder="https://placehold.co/..." />
              <Field label="Símbolo / Ícone (URL)" value={editForm.logo.symbol} onChange={(v) => patch({ logo: { ...editForm.logo, symbol: v } })} placeholder="https://placehold.co/..." />
              <Field label="Favicon / App Icon" value={editForm.logo.favicon ?? ""} onChange={(v) => patch({ logo: { ...editForm.logo, favicon: v } })} />
              <Field label="Clear Space" value={editForm.logo.clearSpace} onChange={(v) => patch({ logo: { ...editForm.logo, clearSpace: v } })} />
              <Field label="Tamanho Mínimo" value={editForm.logo.minimumSize} onChange={(v) => patch({ logo: { ...editForm.logo, minimumSize: v } })} />
              <ArrayEditor label="Usos Incorretos" items={editForm.logo.incorrectUsages} onChange={(v) => patch({ logo: { ...editForm.logo, incorrectUsages: v } })} addLabel="Uso incorreto" />
              {editForm.logoVariants && (
                <div className="border-t border-slate-200/80 pt-4">
                  <h4 className="mb-4 text-sm font-bold text-gray-700">Variações de Logo (URLs)</h4>
                  <div className="space-y-3">
                    {(["horizontal", "stacked", "mono", "negative", "markOnly", "wordmarkOnly"] as const).map((key) => (
                      <Field key={key} label={key} value={editForm.logoVariants?.[key] ?? ""} onChange={(v) => patch({ logoVariants: { ...editForm.logoVariants, [key]: v } })} placeholder="https://placehold.co/..." />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {activeTab === "cores" && (
            <>
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <h4 className="text-sm font-bold text-gray-700">Cores Primárias</h4>
                  <button type="button" onClick={() => addColor("primary")} className="app-secondary-button px-3 py-1.5 text-xs">+ Adicionar</button>
                </div>
                <div className="space-y-3">
                  {editForm.colors.primary.map((c, i) => (
                    <ColorEditor
                      key={i}
                      color={c}
                      onChange={(nc) => {
                        const next = [...editForm.colors.primary];
                        next[i] = nc;
                        patch({ colors: { ...editForm.colors, primary: next } });
                      }}
                      onRemove={() => patch({ colors: { ...editForm.colors, primary: editForm.colors.primary.filter((_, j) => j !== i) } })}
                    />
                  ))}
                </div>
              </div>
              <div className="border-t border-slate-200/80 pt-4">
                <div className="mb-3 flex items-center justify-between">
                  <h4 className="text-sm font-bold text-gray-700">Cores Secundárias</h4>
                  <button type="button" onClick={() => addColor("secondary")} className="app-secondary-button px-3 py-1.5 text-xs">+ Adicionar</button>
                </div>
                <div className="space-y-3">
                  {editForm.colors.secondary.map((c, i) => (
                    <ColorEditor
                      key={i}
                      color={c}
                      onChange={(nc) => {
                        const next = [...editForm.colors.secondary];
                        next[i] = nc;
                        patch({ colors: { ...editForm.colors, secondary: next } });
                      }}
                      onRemove={() => patch({ colors: { ...editForm.colors, secondary: editForm.colors.secondary.filter((_, j) => j !== i) } })}
                    />
                  ))}
                </div>
              </div>
              {editForm.colors.semantic && (
                <div className="border-t border-slate-200/80 pt-4">
                  <h4 className="mb-3 text-sm font-bold text-gray-700">Cores Semânticas</h4>
                  <div className="space-y-3">
                    {(["success", "error", "warning", "info"] as const).map((key) => (
                      <div key={key}>
                        <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-gray-400">{key}</label>
                        <ColorEditor
                          color={editForm.colors.semantic![key]}
                          onChange={(nc) => patch({ colors: { ...editForm.colors, semantic: { ...editForm.colors.semantic!, [key]: nc } } })}
                          onRemove={() => {}}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {activeTab === "tipografia" && (
            <>
              {(["marketing", "ui", "monospace", "primary", "secondary"] as const).map((key) => (
                editForm.typography[key] !== undefined && (
                  <TypographyEditor
                    key={key}
                    label={key === "marketing" ? "Marketing / Display" : key === "ui" ? "UI / Interface" : key === "monospace" ? "Monospace / Código" : key === "primary" ? "Primária" : "Secundária"}
                    value={editForm.typography[key]}
                    onChange={(t) => patch({ typography: { ...editForm.typography, [key]: t } })}
                  />
                )
              ))}
            </>
          )}

          {activeTab === "keyvisual" && (
            <>
              <ArrayEditor label="Elementos Gráficos" items={editForm.keyVisual.elements} onChange={(v) => patch({ keyVisual: { ...editForm.keyVisual, elements: v } })} addLabel="Elemento gráfico" />
              <Field label="Estilo Fotográfico" value={editForm.keyVisual.photographyStyle} onChange={(v) => patch({ keyVisual: { ...editForm.keyVisual, photographyStyle: v } })} multiline rows={2} />
              <Field label="Iconografia" value={editForm.keyVisual.iconography ?? ""} onChange={(v) => patch({ keyVisual: { ...editForm.keyVisual, iconography: v } })} multiline rows={2} />
              <Field label="Ilustrações" value={editForm.keyVisual.illustrations ?? ""} onChange={(v) => patch({ keyVisual: { ...editForm.keyVisual, illustrations: v } })} multiline rows={2} />
              <Field label="Arquitetura de Marketing" value={editForm.keyVisual.marketingArchitecture ?? ""} onChange={(v) => patch({ keyVisual: { ...editForm.keyVisual, marketingArchitecture: v } })} multiline rows={2} />
              <ArrayEditor label="Símbolos Identitários" items={editForm.keyVisual.symbols ?? []} onChange={(v) => patch({ keyVisual: { ...editForm.keyVisual, symbols: v } })} addLabel="Símbolo" />
              <ArrayEditor label="Padrões Gráficos" items={editForm.keyVisual.patterns ?? []} onChange={(v) => patch({ keyVisual: { ...editForm.keyVisual, patterns: v } })} addLabel="Padrão gráfico" />

              <div className="border-t border-slate-200/80 pt-4">
                <div className="mb-4 flex items-center justify-between">
                  <h4 className="text-sm font-bold text-gray-700">Mascotes &amp; Personagens</h4>
                  <button type="button" onClick={addNewMascot} className="app-primary-button px-3 py-2 text-xs">
                    + Novo Mascote
                  </button>
                </div>
                {(editForm.keyVisual.mascots ?? []).length === 0 && (
                  <div className="app-surface-soft border-2 border-dashed border-slate-200 py-8 text-center text-gray-400">
                    <div className="mb-2 text-3xl">🐾</div>
                    <p className="text-sm font-medium">Nenhum mascote definido</p>
                    <p className="mt-1 text-xs">Clique em &quot;+ Novo Mascote&quot; para adicionar um personagem à marca</p>
                  </div>
                )}
                <div className="space-y-4">
                  {(editForm.keyVisual.mascots ?? []).map((mascot, i) => (
                    <MascotEditorCard
                      key={i}
                      mascot={mascot}
                      index={i}
                      onChange={(m) => {
                        const next = [...(editForm.keyVisual.mascots ?? [])];
                        next[i] = m;
                        patch({ keyVisual: { ...editForm.keyVisual, mascots: next } });
                      }}
                      onRemove={() => {
                        const next = (editForm.keyVisual.mascots ?? []).filter((_, j) => j !== i);
                        patch({ keyVisual: { ...editForm.keyVisual, mascots: next } });
                      }}
                    />
                  ))}
                </div>
              </div>
            </>
          )}

          {activeTab === "estrategia" && editForm.positioning && (
            <>
              <Field label="Categoria" value={editForm.positioning.category} onChange={(v) => patch({ positioning: { ...editForm.positioning!, category: v } })} />
              <Field label="Mercado-alvo" value={editForm.positioning.targetMarket} onChange={(v) => patch({ positioning: { ...editForm.positioning!, targetMarket: v } })} multiline />
              <Field label="Positioning Statement" value={editForm.positioning.positioningStatement} onChange={(v) => patch({ positioning: { ...editForm.positioning!, positioningStatement: v } })} multiline rows={3} />
              <ArrayEditor label="Diferenciais Primários" items={editForm.positioning.primaryDifferentiators} onChange={(v) => patch({ positioning: { ...editForm.positioning!, primaryDifferentiators: v } })} addLabel="Diferencial" />
              <ArrayEditor label="Alternativas Competitivas" items={editForm.positioning.competitiveAlternatives} onChange={(v) => patch({ positioning: { ...editForm.positioning!, competitiveAlternatives: v } })} addLabel="Concorrente / alternativa" />
              <ArrayEditor label="Reasons to Believe" items={editForm.positioning.reasonsToBelieve} onChange={(v) => patch({ positioning: { ...editForm.positioning!, reasonsToBelieve: v } })} addLabel="RTB" />
            </>
          )}

          {activeTab === "verbal" && editForm.verbalIdentity && (
            <>
              <Field label="Tagline" value={editForm.verbalIdentity.tagline} onChange={(v) => patch({ verbalIdentity: { ...editForm.verbalIdentity!, tagline: v } })} />
              <Field label="One-liner" value={editForm.verbalIdentity.oneLiner} onChange={(v) => patch({ verbalIdentity: { ...editForm.verbalIdentity!, oneLiner: v } })} multiline rows={2} />
              <ArrayEditor label="Traços de Voz" items={editForm.verbalIdentity.brandVoiceTraits} onChange={(v) => patch({ verbalIdentity: { ...editForm.verbalIdentity!, brandVoiceTraits: v } })} addLabel="Traço de voz" />
              <ArrayEditor label="Headlines de Exemplo" items={editForm.verbalIdentity.sampleHeadlines} onChange={(v) => patch({ verbalIdentity: { ...editForm.verbalIdentity!, sampleHeadlines: v } })} addLabel="Headline" />
              <ArrayEditor label="CTAs de Exemplo" items={editForm.verbalIdentity.sampleCTAs} onChange={(v) => patch({ verbalIdentity: { ...editForm.verbalIdentity!, sampleCTAs: v } })} addLabel="CTA" />
              <div className="grid gap-4 md:grid-cols-2">
                <ArrayEditor label="Vocabulário Preferido" items={editForm.verbalIdentity.vocabulary.preferred} onChange={(v) => patch({ verbalIdentity: { ...editForm.verbalIdentity!, vocabulary: { ...editForm.verbalIdentity!.vocabulary, preferred: v } } })} addLabel="Palavra preferida" />
                <ArrayEditor label="Vocabulário a Evitar" items={editForm.verbalIdentity.vocabulary.avoid} onChange={(v) => patch({ verbalIdentity: { ...editForm.verbalIdentity!, vocabulary: { ...editForm.verbalIdentity!.vocabulary, avoid: v } } })} addLabel="Palavra a evitar" />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <ArrayEditor label="Do (Faça)" items={editForm.verbalIdentity.doDont.do} onChange={(v) => patch({ verbalIdentity: { ...editForm.verbalIdentity!, doDont: { ...editForm.verbalIdentity!.doDont, do: v } } })} addLabel="Do" />
                <ArrayEditor label="Don't (Não faça)" items={editForm.verbalIdentity.doDont.dont} onChange={(v) => patch({ verbalIdentity: { ...editForm.verbalIdentity!, doDont: { ...editForm.verbalIdentity!.doDont, dont: v } } })} addLabel="Don't" />
              </div>
            </>
          )}

          {activeTab === "aplicacoes" && (
            <div className="space-y-4">
              {editForm.applications.map((app, i) => (
                <div key={i} className="app-surface-soft space-y-3 p-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">Aplicação {i + 1}</h4>
                    <button
                      type="button"
                      onClick={() => patch({ applications: editForm.applications.filter((_, j) => j !== i) })}
                      className="text-xs font-medium text-gray-400 transition hover:text-red-500"
                    >
                      Remover
                    </button>
                  </div>
                  <Field label="Tipo" value={app.type} onChange={(v) => {
                    const next = [...editForm.applications];
                    next[i] = { ...next[i], type: v };
                    patch({ applications: next });
                  }} placeholder="Ex: Cartão de Visita, Post Instagram..." />
                  <Field label="Descrição" value={app.description} onChange={(v) => {
                    const next = [...editForm.applications];
                    next[i] = { ...next[i], description: v };
                    patch({ applications: next });
                  }} multiline rows={2} />
                  <Field label="Image Placeholder URL" value={app.imagePlaceholder} onChange={(v) => {
                    const next = [...editForm.applications];
                    next[i] = { ...next[i], imagePlaceholder: v };
                    patch({ applications: next });
                  }} />
                </div>
              ))}
              <button
                type="button"
                onClick={() => patch({ applications: [...editForm.applications, { type: "Nova Aplicação", description: "", imagePlaceholder: "https://placehold.co/800x600/cccccc/666666?text=Nova+Aplicação" }] })}
                className="app-surface-soft w-full border-2 border-dashed border-slate-300 py-3 text-sm font-medium text-gray-500 transition hover:border-slate-500 hover:text-gray-700"
              >
                + Adicionar Aplicação
              </button>
            </div>
          )}

          {activeTab === "imagebriefing" && editForm.imageGenerationBriefing && (
            <>
              <Field label="Estilo Visual" value={editForm.imageGenerationBriefing.visualStyle} onChange={(v) => patch({ imageGenerationBriefing: { ...editForm.imageGenerationBriefing!, visualStyle: v } })} multiline rows={2} />
              <Field label="Mood de Cores" value={editForm.imageGenerationBriefing.colorMood} onChange={(v) => patch({ imageGenerationBriefing: { ...editForm.imageGenerationBriefing!, colorMood: v } })} multiline rows={2} />
              <Field label="Notas de Composição" value={editForm.imageGenerationBriefing.compositionNotes} onChange={(v) => patch({ imageGenerationBriefing: { ...editForm.imageGenerationBriefing!, compositionNotes: v } })} multiline rows={2} />
              <ArrayEditor label="Keywords de Mood" items={editForm.imageGenerationBriefing.moodKeywords} onChange={(v) => patch({ imageGenerationBriefing: { ...editForm.imageGenerationBriefing!, moodKeywords: v } })} addLabel="Keyword" />
              <Field label="Referências Artísticas" value={editForm.imageGenerationBriefing.artisticReferences} onChange={(v) => patch({ imageGenerationBriefing: { ...editForm.imageGenerationBriefing!, artisticReferences: v } })} multiline rows={2} />
              <Field label="Elementos a Evitar" value={editForm.imageGenerationBriefing.avoidElements} onChange={(v) => patch({ imageGenerationBriefing: { ...editForm.imageGenerationBriefing!, avoidElements: v } })} multiline rows={2} />
              <Field label="Guia de Estilo do Logo" value={editForm.imageGenerationBriefing.logoStyleGuide} onChange={(v) => patch({ imageGenerationBriefing: { ...editForm.imageGenerationBriefing!, logoStyleGuide: v } })} multiline rows={2} />
              <Field label="Mood Fotográfico" value={editForm.imageGenerationBriefing.photographyMood} onChange={(v) => patch({ imageGenerationBriefing: { ...editForm.imageGenerationBriefing!, photographyMood: v } })} multiline rows={2} />
              <Field label="Estilo de Padrão" value={editForm.imageGenerationBriefing.patternStyle} onChange={(v) => patch({ imageGenerationBriefing: { ...editForm.imageGenerationBriefing!, patternStyle: v } })} multiline rows={2} />
              <Field label="Linguagem Visual de Marketing" value={editForm.imageGenerationBriefing.marketingVisualLanguage} onChange={(v) => patch({ imageGenerationBriefing: { ...editForm.imageGenerationBriefing!, marketingVisualLanguage: v } })} multiline rows={2} />
              <Field label="🧬 Emotional Core" value={editForm.imageGenerationBriefing.emotionalCore ?? ""} onChange={(v) => patch({ imageGenerationBriefing: { ...editForm.imageGenerationBriefing!, emotionalCore: v || undefined } })} multiline rows={2} />
              <Field label="🪨 Linguagem de Texturas" value={editForm.imageGenerationBriefing.textureLanguage ?? ""} onChange={(v) => patch({ imageGenerationBriefing: { ...editForm.imageGenerationBriefing!, textureLanguage: v || undefined } })} multiline rows={2} />
              <Field label="💡 Assinatura de Iluminação" value={editForm.imageGenerationBriefing.lightingSignature ?? ""} onChange={(v) => patch({ imageGenerationBriefing: { ...editForm.imageGenerationBriefing!, lightingSignature: v || undefined } })} multiline rows={2} />
              <Field label="📷 Assinatura de Câmera" value={editForm.imageGenerationBriefing.cameraSignature ?? ""} onChange={(v) => patch({ imageGenerationBriefing: { ...editForm.imageGenerationBriefing!, cameraSignature: v || undefined } })} multiline rows={2} />
              <Field label="🎭 Arquétipo da Marca" value={editForm.imageGenerationBriefing.brandArchetype ?? ""} onChange={(v) => patch({ imageGenerationBriefing: { ...editForm.imageGenerationBriefing!, brandArchetype: v || undefined } })} multiline rows={2} />
              <Field label="🌊 Perfil Sensorial" value={editForm.imageGenerationBriefing.sensoryProfile ?? ""} onChange={(v) => patch({ imageGenerationBriefing: { ...editForm.imageGenerationBriefing!, sensoryProfile: v || undefined } })} multiline rows={2} />
              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-red-500">Negative Prompt (global)</label>
                <textarea
                  value={editForm.imageGenerationBriefing.negativePrompt}
                  onChange={(e) => patch({ imageGenerationBriefing: { ...editForm.imageGenerationBriefing!, negativePrompt: e.target.value } })}
                  rows={3}
                  className="app-textarea border-red-200 text-sm"
                />
              </div>
            </>
          )}

          <div className="flex justify-end border-t border-slate-200/80 pt-4">
            <button
              onClick={handleSave}
              className={saved
                ? "inline-flex items-center justify-center gap-2 rounded-2xl bg-green-600 px-6 py-2.5 text-sm font-semibold text-white transition shadow-[0_18px_38px_-24px_rgba(22,163,74,0.55)]"
                : "app-primary-button px-6 py-2.5 text-sm"
              }
            >
              {saved ? "✓ Alterações Salvas!" : "Salvar Alterações"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
