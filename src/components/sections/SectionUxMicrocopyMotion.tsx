"use client";
import { BrandbookData } from "@/lib/types";

export function SectionUxMicrocopyMotion({ data, num }: { data: BrandbookData; num: number }) {
  if (!data.uxPatterns || !data.microcopy || !data.motion) return null;

  return (
    <section className="page-break mb-10">
      <h2 className="text-2xl font-bold mb-5 border-b pb-3">{String(num).padStart(2, "0")}. UX, Microcopy &amp; Motion</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div>
          <h3 className="text-base font-bold mb-3 flex items-center gap-2">
            <span className="w-7 h-7 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-sm font-bold">UX</span>
            Padrões UX
          </h3>
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded border border-blue-100">
              <h4 className="font-bold text-sm text-blue-900 mb-1">Onboarding</h4>
              <p className="text-sm text-gray-700">{data.uxPatterns.onboarding}</p>
            </div>
            <div className="bg-blue-50 p-4 rounded border border-blue-100">
              <h4 className="font-bold text-sm text-blue-900 mb-1">Empty States</h4>
              <p className="text-sm text-gray-700">{data.uxPatterns.emptyStates}</p>
            </div>
            <div className="bg-blue-50 p-4 rounded border border-blue-100">
              <h4 className="font-bold text-sm text-blue-900 mb-1">Dashboard Layout</h4>
              <p className="text-sm text-gray-700">{data.uxPatterns.dashboardLayout}</p>
            </div>
            <div className="bg-blue-50 p-4 rounded border border-blue-100">
              <h4 className="font-bold text-sm text-blue-900 mb-1">Modais &amp; Drawers</h4>
              <p className="text-sm text-gray-700">{data.uxPatterns.modalsAndDrawers}</p>
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
              <p className="text-sm text-gray-700">{data.microcopy.buttonRules}</p>
            </div>
            <div className="bg-green-50 p-4 rounded border border-green-100">
              <h4 className="font-bold text-sm text-green-900 mb-1">Mensagens de Erro</h4>
              <p className="text-sm text-gray-700">{data.microcopy.errorMessages}</p>
            </div>
            <div className="bg-green-50 p-4 rounded border border-green-100">
              <h4 className="font-bold text-sm text-green-900 mb-1">Copy de Empty States</h4>
              <p className="text-sm text-gray-700">{data.microcopy.emptyStateCopy}</p>
            </div>
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
              <p className="text-sm text-gray-700">{data.motion.transitions}</p>
            </div>
            <div className="bg-purple-50 p-4 rounded border border-purple-100">
              <h4 className="font-bold text-sm text-purple-900 mb-1">Microinterações</h4>
              <p className="text-sm text-gray-700">{data.motion.microinteractions}</p>
            </div>
            <div className="bg-purple-50 p-4 rounded border border-purple-100">
              <h4 className="font-bold text-sm text-purple-900 mb-1">Loading States</h4>
              <p className="text-sm text-gray-700">{data.motion.loadingStates}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
