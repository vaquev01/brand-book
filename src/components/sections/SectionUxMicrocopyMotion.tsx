"use client";
import { EditableField } from "@/components/EditableField";
import { BrandbookData } from "@/lib/types";

export function SectionUxMicrocopyMotion({ data, num, onUpdateData }: { data: BrandbookData; num: number; onUpdateData?: (updater: (prev: BrandbookData) => BrandbookData) => void }) {
  if (!data.uxPatterns || !data.microcopy || !data.motion) return null;

  return (
    <section className="page-break mb-6">
      <h2 className="text-xl md:text-2xl font-extrabold tracking-tight mb-4 border-b border-gray-100 pb-2">
        {String(num).padStart(2, "0")}. UX, Microcopy &amp; Motion
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div>
          <h3 className="text-base font-bold mb-3 flex items-center gap-2">
            <span className="w-7 h-7 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-sm font-bold">UX</span>
            Padrões UX
          </h3>
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded border border-blue-100">
              <h4 className="font-bold text-sm text-blue-900 mb-1">Onboarding</h4>
              <EditableField value={data.uxPatterns.onboarding} onSave={(val) => onUpdateData?.(prev => prev.uxPatterns ? { ...prev, uxPatterns: { ...prev.uxPatterns, onboarding: val } } : prev)} className="text-sm text-gray-700" readOnly={!onUpdateData} multiline />
            </div>
            <div className="bg-blue-50 p-4 rounded border border-blue-100">
              <h4 className="font-bold text-sm text-blue-900 mb-1">Empty States</h4>
              <EditableField value={data.uxPatterns.emptyStates} onSave={(val) => onUpdateData?.(prev => prev.uxPatterns ? { ...prev, uxPatterns: { ...prev.uxPatterns, emptyStates: val } } : prev)} className="text-sm text-gray-700" readOnly={!onUpdateData} multiline />
            </div>
            <div className="bg-blue-50 p-4 rounded border border-blue-100">
              <h4 className="font-bold text-sm text-blue-900 mb-1">Dashboard Layout</h4>
              <EditableField value={data.uxPatterns.dashboardLayout} onSave={(val) => onUpdateData?.(prev => prev.uxPatterns ? { ...prev, uxPatterns: { ...prev.uxPatterns, dashboardLayout: val } } : prev)} className="text-sm text-gray-700" readOnly={!onUpdateData} multiline />
            </div>
            <div className="bg-blue-50 p-4 rounded border border-blue-100">
              <h4 className="font-bold text-sm text-blue-900 mb-1">Modais &amp; Drawers</h4>
              <EditableField value={data.uxPatterns.modalsAndDrawers} onSave={(val) => onUpdateData?.(prev => prev.uxPatterns ? { ...prev, uxPatterns: { ...prev.uxPatterns, modalsAndDrawers: val } } : prev)} className="text-sm text-gray-700" readOnly={!onUpdateData} multiline />
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-base font-bold mb-3 flex items-center gap-2">
            <span className="w-7 h-7 bg-green-100 text-green-700 rounded-full flex items-center justify-center text-sm font-bold">Mc</span>
            Microcopy (UX Writing)
          </h3>
          <div className="space-y-4">
            <div className="bg-green-50 p-4 rounded border border-green-100">
              <h4 className="font-bold text-sm text-green-900 mb-1">Regras de Botão</h4>
              <EditableField value={data.microcopy.buttonRules} onSave={(val) => onUpdateData?.(prev => prev.microcopy ? { ...prev, microcopy: { ...prev.microcopy, buttonRules: val } } : prev)} className="text-sm text-gray-700" readOnly={!onUpdateData} multiline />
            </div>
            <div className="bg-green-50 p-4 rounded border border-green-100">
              <h4 className="font-bold text-sm text-green-900 mb-1">Mensagens de Erro</h4>
              <EditableField value={data.microcopy.errorMessages} onSave={(val) => onUpdateData?.(prev => prev.microcopy ? { ...prev, microcopy: { ...prev.microcopy, errorMessages: val } } : prev)} className="text-sm text-gray-700" readOnly={!onUpdateData} multiline />
            </div>
            <div className="bg-green-50 p-4 rounded border border-green-100">
              <h4 className="font-bold text-sm text-green-900 mb-1">Copy de Empty States</h4>
              <EditableField value={data.microcopy.emptyStateCopy} onSave={(val) => onUpdateData?.(prev => prev.microcopy ? { ...prev, microcopy: { ...prev.microcopy, emptyStateCopy: val } } : prev)} className="text-sm text-gray-700" readOnly={!onUpdateData} multiline />
            </div>
            {data.microcopy.writingConventions && (
              <div className="bg-green-50 p-4 rounded border border-green-100">
                <h4 className="font-bold text-sm text-green-900 mb-1">Convenções de Escrita</h4>
                <EditableField value={data.microcopy.writingConventions} onSave={(val) => onUpdateData?.(prev => prev.microcopy ? { ...prev, microcopy: { ...prev.microcopy, writingConventions: val } } : prev)} className="text-sm text-gray-700 whitespace-pre-line" readOnly={!onUpdateData} multiline />
              </div>
            )}
          </div>
        </div>

        <div>
          <h3 className="text-base font-bold mb-3 flex items-center gap-2">
            <span className="w-7 h-7 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center text-sm font-bold">Mo</span>
            Motion Design
          </h3>
          <div className="space-y-4">
            <div className="bg-purple-50 p-4 rounded border border-purple-100">
              <h4 className="font-bold text-sm text-purple-900 mb-1">Transições</h4>
              <EditableField value={data.motion.transitions} onSave={(val) => onUpdateData?.(prev => prev.motion ? { ...prev, motion: { ...prev.motion, transitions: val } } : prev)} className="text-sm text-gray-700" readOnly={!onUpdateData} multiline />
            </div>
            <div className="bg-purple-50 p-4 rounded border border-purple-100">
              <h4 className="font-bold text-sm text-purple-900 mb-1">Microinterações</h4>
              <EditableField value={data.motion.microinteractions} onSave={(val) => onUpdateData?.(prev => prev.motion ? { ...prev, motion: { ...prev.motion, microinteractions: val } } : prev)} className="text-sm text-gray-700" readOnly={!onUpdateData} multiline />
            </div>
            <div className="bg-purple-50 p-4 rounded border border-purple-100">
              <h4 className="font-bold text-sm text-purple-900 mb-1">Loading States</h4>
              <EditableField value={data.motion.loadingStates} onSave={(val) => onUpdateData?.(prev => prev.motion ? { ...prev, motion: { ...prev.motion, loadingStates: val } } : prev)} className="text-sm text-gray-700" readOnly={!onUpdateData} multiline />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
