"use client";
import { EditableField } from "@/components/EditableField";
import { BrandbookData } from "@/lib/types";

function MotionLiveDemo({ data }: { data: BrandbookData }) {
  const primary = data.colors.primary[0]?.hex ?? "#6366f1";
  const accent = data.colors.primary[1]?.hex ?? data.colors.secondary[0]?.hex ?? "#a78bfa";
  const uid = `motion-${primary.replace("#", "")}`;

  return (
    <div className="mt-8 rounded-[1.4rem] border overflow-hidden shadow-sm no-print">
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes ${uid}-spin { to { transform: rotate(360deg); } }
        @keyframes ${uid}-ping { 0%,100%{transform:scale(1);opacity:1} 75%{transform:scale(1.8);opacity:0} }
        @keyframes ${uid}-fadein { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        @keyframes ${uid}-progress { from{width:0%} to{width:72%} }
        @keyframes ${uid}-shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
        .${uid}-btn:hover { background: ${primary} !important; color: white !important; transform: translateY(-2px); box-shadow: 0 8px 20px ${primary}44; }
        .${uid}-btn { transition: all 0.22s cubic-bezier(0.34,1.56,0.64,1); }
        .${uid}-spin { animation: ${uid}-spin 0.9s linear infinite; }
        .${uid}-ping { animation: ${uid}-ping 1.4s cubic-bezier(0,0,0.2,1) infinite; }
        .${uid}-fadein { animation: ${uid}-fadein 0.5s ease both; }
        .${uid}-fadein-2 { animation: ${uid}-fadein 0.5s 0.15s ease both; }
        .${uid}-fadein-3 { animation: ${uid}-fadein 0.5s 0.3s ease both; }
        .${uid}-progress { animation: ${uid}-progress 2.2s cubic-bezier(0.4,0,0.2,1) 0.3s both; }
        .${uid}-shimmer {
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: ${uid}-shimmer 1.5s infinite;
        }
      ` }} />
      <div className="px-5 py-4 bg-gray-50 border-b">
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Motion Ao Vivo</h3>
        <p className="text-[11px] text-gray-400 mt-0.5">Animações CSS aplicadas com as cores da marca</p>
      </div>
      <div className="p-5 bg-white grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Hover transition */}
        <div className="flex flex-col items-center gap-3">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Hover Transition</p>
          <button
            className={`${uid}-btn px-5 py-2.5 rounded-xl border-2 font-bold text-sm`}
            style={{ borderColor: primary, color: primary, background: "transparent" }}
          >
            Clique em mim
          </button>
          <p className="text-[10px] text-gray-400 text-center">spring cubic-bezier(0.34,1.56,0.64,1)</p>
        </div>

        {/* Loading spinner */}
        <div className="flex flex-col items-center gap-3">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Loading Spinner</p>
          <div className="relative flex items-center justify-center w-12 h-12">
            <div
              className={`${uid}-spin w-10 h-10 rounded-full border-4 border-t-transparent`}
              style={{ borderColor: `${primary}33`, borderTopColor: primary }}
            />
          </div>
          <p className="text-[10px] text-gray-400 text-center">0.9s linear infinite</p>
        </div>

        {/* Pulse ping (notification) */}
        <div className="flex flex-col items-center gap-3">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Pulse Ping</p>
          <div className="relative flex items-center justify-center w-12 h-12">
            <div
              className={`${uid}-ping absolute w-8 h-8 rounded-full opacity-60`}
              style={{ background: accent }}
            />
            <div className="w-5 h-5 rounded-full" style={{ background: primary }} />
          </div>
          <p className="text-[10px] text-gray-400 text-center">1.4s ping infinito</p>
        </div>

        {/* Progress bar */}
        <div className="flex flex-col items-center gap-3">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Progress Bar</p>
          <div className="w-full space-y-2">
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className={`${uid}-progress h-full rounded-full`} style={{ background: primary }} />
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className={`${uid}-shimmer h-full rounded-full`} />
            </div>
          </div>
          <p className="text-[10px] text-gray-400 text-center">ease-out + shimmer skeleton</p>
        </div>
      </div>

      {/* Staggered fade-in */}
      <div className="px-5 pb-5 bg-white border-t pt-4">
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">Staggered Fade-in</p>
        <div className="grid grid-cols-3 gap-2">
          {["Missão", "Visão", "Valores"].map((label, i) => (
            <div
              key={i}
              className={`${uid}-fadein${i > 0 ? `-${i + 1}` : ""} rounded-xl p-3 text-center`}
              style={{ background: `${primary}12`, color: primary }}
            >
              <span className="text-xs font-bold">{label}</span>
            </div>
          ))}
        </div>
        <p className="text-[10px] text-gray-400 mt-2">0.5s ease · delay 0 / 150ms / 300ms</p>
      </div>
    </div>
  );
}

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
      <MotionLiveDemo data={data} />
    </section>
  );
}
