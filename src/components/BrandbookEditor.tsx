"use client";

import { useState } from "react";
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
  { id: "dna", label: "DNA & Identidade", icon: "🧬" },
  { id: "logo", label: "Logo", icon: "🖼️" },
  { id: "cores", label: "Cores", icon: "🎨" },
  { id: "tipografia", label: "Tipografia", icon: "🔤" },
  { id: "keyvisual", label: "Key Visual & Mascotes", icon: "✦" },
  { id: "estrategia", label: "Posicionamento", icon: "🧭" },
  { id: "verbal", label: "Identidade Verbal", icon: "🗣️" },
  { id: "aplicacoes", label: "Aplicações", icon: "🖨️" },
  { id: "imagebriefing", label: "Briefing de Imagens", icon: "🤖" },
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
      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">{label}</label>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={rows}
          placeholder={placeholder}
          className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-gray-900 focus:border-gray-900 outline-none resize-none transition"
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-gray-900 focus:border-gray-900 outline-none transition"
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
      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{label}</label>
      <div className="space-y-1.5 mb-2">
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
              className="flex-1 px-2.5 py-1.5 border rounded-lg text-sm focus:ring-1 focus:ring-gray-900 outline-none transition"
            />
            <button
              type="button"
              onClick={() => onChange(items.filter((_, j) => j !== i))}
              className="text-gray-400 hover:text-red-500 transition text-lg leading-none w-6 shrink-0"
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
          className="flex-1 px-2.5 py-1.5 border border-dashed rounded-lg text-sm focus:ring-1 focus:ring-gray-900 outline-none transition"
        />
        <button
          onClick={addItem}
          disabled={!draft.trim()}
          className="px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg font-semibold hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
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
    <div className="border rounded-lg p-3 bg-gray-50 space-y-2">
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={color.hex.startsWith("#") ? color.hex : "#000000"}
          onChange={(e) => onChange({ ...color, hex: e.target.value })}
          className="w-10 h-10 rounded border cursor-pointer shrink-0"
          title="Escolher cor"
        />
        <input
          type="text"
          value={color.name}
          onChange={(e) => onChange({ ...color, name: e.target.value })}
          placeholder="Nome da cor"
          className="flex-1 px-2 py-1.5 border rounded text-sm focus:ring-1 focus:ring-gray-900 outline-none"
        />
        <button
          type="button"
          onClick={onRemove}
          className="text-gray-400 hover:text-red-500 transition text-lg leading-none w-6 shrink-0"
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
          className="px-2 py-1 border rounded text-xs focus:ring-1 focus:ring-gray-900 outline-none font-mono"
        />
        <input
          type="text"
          value={color.rgb}
          onChange={(e) => onChange({ ...color, rgb: e.target.value })}
          placeholder="RGB"
          className="px-2 py-1 border rounded text-xs focus:ring-1 focus:ring-gray-900 outline-none font-mono"
        />
        <input
          type="text"
          value={color.cmyk}
          onChange={(e) => onChange({ ...color, cmyk: e.target.value })}
          placeholder="CMYK"
          className="px-2 py-1 border rounded text-xs focus:ring-1 focus:ring-gray-900 outline-none font-mono"
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
    <div className="border rounded-lg p-4 bg-gray-50 space-y-3">
      <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">{label}</h4>
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
    <div className="border rounded-lg p-4 bg-gray-50 space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Mascote {index + 1}</h4>
        <button onClick={onRemove} className="text-gray-400 hover:text-red-500 transition text-xs font-medium">Remover</button>
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

  function patch(partial: Partial<BrandbookData>) {
    setEditForm((prev) => ({ ...prev, ...partial }));
    setSaved(false);
  }

  function handleSave() {
    onUpdate(editForm);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
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
    <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 bg-gray-50 border-b">
        <div>
          <h3 className="font-bold text-gray-900">Editar Brandbook</h3>
          <p className="text-xs text-gray-500 mt-0.5">Edite qualquer campo abaixo e clique em Salvar</p>
        </div>
        <div className="flex gap-2">
          <button onClick={onCancel} className="px-4 py-2 text-sm text-gray-600 border rounded-lg hover:bg-gray-100 transition">Cancelar</button>
          <button
            onClick={handleSave}
            className={`px-5 py-2 text-sm font-semibold rounded-lg transition ${
              saved ? "bg-green-600 text-white" : "bg-gray-900 text-white hover:bg-gray-700"
            }`}
          >
            {saved ? "✓ Salvo!" : "Salvar Alterações"}
          </button>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className="w-52 shrink-0 border-r bg-gray-50 py-3 hidden md:block">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`w-full text-left px-4 py-2.5 text-sm font-medium transition flex items-center gap-2.5 ${
                activeTab === t.id ? "bg-white border-r-2 border-gray-900 text-gray-900" : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
              }`}
            >
              <span>{t.icon}</span>
              <span>{t.label}</span>
            </button>
          ))}
        </div>

        {/* Mobile tab selector */}
        <div className="md:hidden w-full px-4 py-3 border-b">
          <select
            value={activeTab}
            onChange={(e) => setActiveTab(e.target.value as Tab)}
            className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-gray-900 outline-none"
            aria-label="Selecionar seção"
          >
            {TABS.map((t) => <option key={t.id} value={t.id}>{t.icon} {t.label}</option>)}
          </select>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 overflow-y-auto max-h-[70vh] space-y-6">

          {/* DNA & Identidade */}
          {activeTab === "dna" && (
            <>
              <Field label="Nome da Marca" value={editForm.brandName} onChange={(v) => patch({ brandName: v })} />
              <Field label="Indústria / Nicho" value={editForm.industry} onChange={(v) => patch({ industry: v })} />
              <div className="border-t pt-4">
                <h4 className="font-bold text-sm text-gray-700 mb-4">Brand Concept</h4>
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

          {/* Logo */}
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
                <div className="border-t pt-4">
                  <h4 className="font-bold text-sm text-gray-700 mb-4">Variações de Logo (URLs)</h4>
                  <div className="space-y-3">
                    {(["horizontal", "stacked", "mono", "negative", "markOnly", "wordmarkOnly"] as const).map((key) => (
                      <Field key={key} label={key} value={editForm.logoVariants?.[key] ?? ""} onChange={(v) => patch({ logoVariants: { ...editForm.logoVariants, [key]: v } })} placeholder="https://placehold.co/..." />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Cores */}
          {activeTab === "cores" && (
            <>
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-bold text-sm text-gray-700">Cores Primárias</h4>
                  <button onClick={() => addColor("primary")} className="text-xs bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded font-medium transition">+ Adicionar</button>
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
              <div className="border-t pt-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-bold text-sm text-gray-700">Cores Secundárias</h4>
                  <button onClick={() => addColor("secondary")} className="text-xs bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded font-medium transition">+ Adicionar</button>
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
                <div className="border-t pt-4">
                  <h4 className="font-bold text-sm text-gray-700 mb-3">Cores Semânticas</h4>
                  <div className="space-y-3">
                    {(["success", "error", "warning", "info"] as const).map((key) => (
                      <div key={key}>
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 block">{key}</label>
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

          {/* Tipografia */}
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

          {/* Key Visual & Mascotes */}
          {activeTab === "keyvisual" && (
            <>
              <ArrayEditor label="Elementos Gráficos" items={editForm.keyVisual.elements} onChange={(v) => patch({ keyVisual: { ...editForm.keyVisual, elements: v } })} addLabel="Elemento gráfico" />
              <Field label="Estilo Fotográfico" value={editForm.keyVisual.photographyStyle} onChange={(v) => patch({ keyVisual: { ...editForm.keyVisual, photographyStyle: v } })} multiline rows={2} />
              <Field label="Iconografia" value={editForm.keyVisual.iconography ?? ""} onChange={(v) => patch({ keyVisual: { ...editForm.keyVisual, iconography: v } })} multiline rows={2} />
              <Field label="Ilustrações" value={editForm.keyVisual.illustrations ?? ""} onChange={(v) => patch({ keyVisual: { ...editForm.keyVisual, illustrations: v } })} multiline rows={2} />
              <Field label="Arquitetura de Marketing" value={editForm.keyVisual.marketingArchitecture ?? ""} onChange={(v) => patch({ keyVisual: { ...editForm.keyVisual, marketingArchitecture: v } })} multiline rows={2} />
              <ArrayEditor label="Símbolos Identitários" items={editForm.keyVisual.symbols ?? []} onChange={(v) => patch({ keyVisual: { ...editForm.keyVisual, symbols: v } })} addLabel="Símbolo" />
              <ArrayEditor label="Padrões Gráficos" items={editForm.keyVisual.patterns ?? []} onChange={(v) => patch({ keyVisual: { ...editForm.keyVisual, patterns: v } })} addLabel="Padrão gráfico" />

              <div className="border-t pt-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-bold text-sm text-gray-700">Mascotes &amp; Personagens</h4>
                  <button
                    onClick={addNewMascot}
                    className="text-xs bg-gray-900 text-white px-3 py-1.5 rounded font-semibold hover:bg-gray-700 transition"
                  >
                    + Novo Mascote
                  </button>
                </div>
                {(editForm.keyVisual.mascots ?? []).length === 0 && (
                  <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg text-gray-400">
                    <div className="text-3xl mb-2">🐾</div>
                    <p className="text-sm font-medium">Nenhum mascote definido</p>
                    <p className="text-xs mt-1">Clique em &quot;+ Novo Mascote&quot; para adicionar um personagem à marca</p>
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

          {/* Posicionamento */}
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

          {/* Identidade Verbal */}
          {activeTab === "verbal" && editForm.verbalIdentity && (
            <>
              <Field label="Tagline" value={editForm.verbalIdentity.tagline} onChange={(v) => patch({ verbalIdentity: { ...editForm.verbalIdentity!, tagline: v } })} />
              <Field label="One-liner" value={editForm.verbalIdentity.oneLiner} onChange={(v) => patch({ verbalIdentity: { ...editForm.verbalIdentity!, oneLiner: v } })} multiline rows={2} />
              <ArrayEditor label="Traços de Voz" items={editForm.verbalIdentity.brandVoiceTraits} onChange={(v) => patch({ verbalIdentity: { ...editForm.verbalIdentity!, brandVoiceTraits: v } })} addLabel="Traço de voz" />
              <ArrayEditor label="Headlines de Exemplo" items={editForm.verbalIdentity.sampleHeadlines} onChange={(v) => patch({ verbalIdentity: { ...editForm.verbalIdentity!, sampleHeadlines: v } })} addLabel="Headline" />
              <ArrayEditor label="CTAs de Exemplo" items={editForm.verbalIdentity.sampleCTAs} onChange={(v) => patch({ verbalIdentity: { ...editForm.verbalIdentity!, sampleCTAs: v } })} addLabel="CTA" />
              <div className="grid grid-cols-2 gap-4">
                <ArrayEditor label="Vocabulário Preferido" items={editForm.verbalIdentity.vocabulary.preferred} onChange={(v) => patch({ verbalIdentity: { ...editForm.verbalIdentity!, vocabulary: { ...editForm.verbalIdentity!.vocabulary, preferred: v } } })} addLabel="Palavra preferida" />
                <ArrayEditor label="Vocabulário a Evitar" items={editForm.verbalIdentity.vocabulary.avoid} onChange={(v) => patch({ verbalIdentity: { ...editForm.verbalIdentity!, vocabulary: { ...editForm.verbalIdentity!.vocabulary, avoid: v } } })} addLabel="Palavra a evitar" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <ArrayEditor label="Do (Faça)" items={editForm.verbalIdentity.doDont.do} onChange={(v) => patch({ verbalIdentity: { ...editForm.verbalIdentity!, doDont: { ...editForm.verbalIdentity!.doDont, do: v } } })} addLabel="Do" />
                <ArrayEditor label="Don't (Não faça)" items={editForm.verbalIdentity.doDont.dont} onChange={(v) => patch({ verbalIdentity: { ...editForm.verbalIdentity!, doDont: { ...editForm.verbalIdentity!.doDont, dont: v } } })} addLabel="Don't" />
              </div>
            </>
          )}

          {/* Aplicações */}
          {activeTab === "aplicacoes" && (
            <div className="space-y-4">
              {editForm.applications.map((app, i) => (
                <div key={i} className="border rounded-lg p-4 bg-gray-50 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Aplicação {i + 1}</h4>
                    <button
                      onClick={() => patch({ applications: editForm.applications.filter((_, j) => j !== i) })}
                      className="text-xs text-gray-400 hover:text-red-500 font-medium transition"
                    >Remover</button>
                  </div>
                  <Field label="Tipo" value={app.type} onChange={(v) => {
                    const next = [...editForm.applications]; next[i] = { ...next[i], type: v }; patch({ applications: next });
                  }} placeholder="Ex: Cartão de Visita, Post Instagram..." />
                  <Field label="Descrição" value={app.description} onChange={(v) => {
                    const next = [...editForm.applications]; next[i] = { ...next[i], description: v }; patch({ applications: next });
                  }} multiline rows={2} />
                  <Field label="Image Placeholder URL" value={app.imagePlaceholder} onChange={(v) => {
                    const next = [...editForm.applications]; next[i] = { ...next[i], imagePlaceholder: v }; patch({ applications: next });
                  }} />
                </div>
              ))}
              <button
                onClick={() => patch({ applications: [...editForm.applications, { type: "Nova Aplicação", description: "", imagePlaceholder: "https://placehold.co/800x600/cccccc/666666?text=Nova+Aplicação" }] })}
                className="w-full border-2 border-dashed border-gray-300 rounded-lg py-3 text-sm font-medium text-gray-500 hover:border-gray-500 hover:text-gray-700 transition"
              >
                + Adicionar Aplicação
              </button>
            </div>
          )}

          {/* Briefing de Imagens */}
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
              <div>
                <label className="block text-xs font-bold text-red-500 uppercase tracking-wider mb-1">Negative Prompt (global)</label>
                <textarea
                  value={editForm.imageGenerationBriefing.negativePrompt}
                  onChange={(e) => patch({ imageGenerationBriefing: { ...editForm.imageGenerationBriefing!, negativePrompt: e.target.value } })}
                  rows={3}
                  className="w-full px-3 py-2 border border-red-200 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none resize-none transition"
                />
              </div>
            </>
          )}

          {/* Bottom save */}
          <div className="border-t pt-4 flex justify-end">
            <button
              onClick={handleSave}
              className={`px-6 py-2.5 text-sm font-semibold rounded-lg transition ${
                saved ? "bg-green-600 text-white" : "bg-gray-900 text-white hover:bg-gray-700"
              }`}
            >
              {saved ? "✓ Alterações Salvas!" : "Salvar Alterações"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
