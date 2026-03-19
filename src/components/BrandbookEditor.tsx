"use client";

import { useState } from "react";
import { validateLooseBrandbook } from "@/lib/brandbookValidation";
import { BrandbookData } from "@/lib/types";

import { EditorDNA } from "./editor/EditorDNA";
import { EditorBrandStory } from "./editor/EditorBrandStory";
import { EditorPositioning } from "./editor/EditorPositioning";
import { EditorPersonas } from "./editor/EditorPersonas";
import { EditorVerbal } from "./editor/EditorVerbal";
import { EditorLogo } from "./editor/EditorLogo";
import { EditorColors } from "./editor/EditorColors";
import { EditorTypography } from "./editor/EditorTypography";
import { EditorKeyVisual } from "./editor/EditorKeyVisual";
import { EditorApplications } from "./editor/EditorApplications";
import { EditorSocial } from "./editor/EditorSocial";
import { EditorImageBriefing } from "./editor/EditorImageBriefing";

type Tab =
  | "dna"
  | "brandstory"
  | "posicionamento"
  | "personas"
  | "logo"
  | "cores"
  | "tipografia"
  | "keyvisual"
  | "verbal"
  | "aplicacoes"
  | "social"
  | "imagebriefing";

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: "dna", label: "Estrategia", icon: "🧭" },
  { id: "brandstory", label: "Brand Story", icon: "📖" },
  { id: "posicionamento", label: "Posicionamento", icon: "🎯" },
  { id: "personas", label: "Personas", icon: "👤" },
  { id: "verbal", label: "Linguagem", icon: "🗣️" },
  { id: "logo", label: "Logo", icon: "🖼️" },
  { id: "cores", label: "Cores", icon: "🎨" },
  { id: "tipografia", label: "Tipografia", icon: "🔤" },
  { id: "keyvisual", label: "Sistema Visual", icon: "✦" },
  { id: "aplicacoes", label: "Aplicacoes", icon: "🖨️" },
  { id: "social", label: "Social Media", icon: "📱" },
  { id: "imagebriefing", label: "Operacional", icon: "📋" },
];

const TAB_COMPONENTS: Record<Tab, React.ComponentType<{ data: BrandbookData; onPatch: (partial: Partial<BrandbookData>) => void }>> = {
  dna: EditorDNA,
  brandstory: EditorBrandStory,
  posicionamento: EditorPositioning,
  personas: EditorPersonas,
  verbal: EditorVerbal,
  logo: EditorLogo,
  cores: EditorColors,
  tipografia: EditorTypography,
  keyvisual: EditorKeyVisual,
  aplicacoes: EditorApplications,
  social: EditorSocial,
  imagebriefing: EditorImageBriefing,
};

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
        action: "salvar alteracoes no editor",
        subject: "Brandbook editado",
      });
      onUpdate(validated);
      setValidationError("");
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error: unknown) {
      setSaved(false);
      setValidationError(error instanceof Error ? error.message : "Brandbook invalido para salvar.");
    }
  }

  const ActiveTabComponent = TAB_COMPONENTS[activeTab];

  return (
    <div className="app-shell overflow-hidden">
      <div className="flex items-center justify-between border-b border-slate-200/80 bg-white/60 px-5 py-4">
        <div>
          <h3 className="font-bold text-gray-900">Editar Brandbook</h3>
          <p className="mt-0.5 text-xs text-gray-500">Edite os campos e salve</p>
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
            {saved ? "✓ Salvo!" : "Salvar Alteracoes"}
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
            aria-label="Selecionar secao"
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

          <ActiveTabComponent data={editForm} onPatch={patch} />

          <div className="flex justify-end border-t border-slate-200/80 pt-4">
            <button
              onClick={handleSave}
              className={saved
                ? "inline-flex items-center justify-center gap-2 rounded-2xl bg-green-600 px-6 py-2.5 text-sm font-semibold text-white transition shadow-[0_18px_38px_-24px_rgba(22,163,74,0.55)]"
                : "app-primary-button px-6 py-2.5 text-sm"
              }
            >
              {saved ? "✓ Alteracoes Salvas!" : "Salvar Alteracoes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
