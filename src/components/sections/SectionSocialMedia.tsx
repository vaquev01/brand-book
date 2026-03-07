"use client";
import { EditableField } from "@/components/EditableField";
import { BrandbookData } from "@/lib/types";

const PLATFORM_ICONS: Record<string, string> = {
  instagram: "📸",
  linkedin: "💼",
  tiktok: "🎵",
  whatsapp: "💬",
  facebook: "👥",
  twitter: "🐦",
  x: "🐦",
  youtube: "▶️",
  pinterest: "📌",
  email: "✉️",
  site: "🌐",
  atendimento: "🎧",
};

function platformIcon(name: string): string {
  return PLATFORM_ICONS[name.toLowerCase()] ?? "📱";
}

const PILLAR_COLORS = [
  "bg-blue-50 border-blue-200 text-blue-800",
  "bg-purple-50 border-purple-200 text-purple-800",
  "bg-green-50 border-green-200 text-green-800",
  "bg-amber-50 border-amber-200 text-amber-800",
  "bg-rose-50 border-rose-200 text-rose-800",
];

export function SectionSocialMedia({ data, num, onUpdateData }: { data: BrandbookData; num: number; onUpdateData?: (updater: (prev: BrandbookData) => BrandbookData) => void }) {
  if (!data.socialMediaGuidelines) return null;

  const sg = data.socialMediaGuidelines;

  return (
    <section className="page-break mb-6">
      <h2 className="text-xl md:text-2xl font-extrabold tracking-tight mb-4 border-b border-gray-100 pb-2">
        {String(num).padStart(2, "0")}. Guia de Redes Sociais
      </h2>

      <div className="flex items-center justify-between gap-3 mb-6">
        <div />
        {onUpdateData && (
          <button
            type="button"
            onClick={() => onUpdateData(prev => prev.socialMediaGuidelines ? {
              ...prev,
              socialMediaGuidelines: {
                ...prev.socialMediaGuidelines,
                platforms: [
                  ...prev.socialMediaGuidelines.platforms,
                  {
                    platform: "Novo Canal",
                    primaryFormats: "Formato principal",
                    tone: "Descreva o tom",
                    contentPillars: [],
                    doList: [],
                    dontList: []
                  }
                ]
              }
            } : prev)}
            className="no-print text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg transition"
          >
            + Canal
          </button>
        )}
      </div>

      {(sg.brandVoiceAdaptation || sg.globalHashtagStrategy || onUpdateData) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {(sg.brandVoiceAdaptation || onUpdateData) && (
            <div className="bg-gray-50 border rounded-xl p-4">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Adaptação de Voz por Canal</h3>
              <EditableField value={sg.brandVoiceAdaptation || ""} onSave={(val) => onUpdateData?.(prev => prev.socialMediaGuidelines ? { ...prev, socialMediaGuidelines: { ...prev.socialMediaGuidelines, brandVoiceAdaptation: val || undefined } } : prev)} className="text-gray-700 text-sm leading-relaxed" readOnly={!onUpdateData} multiline />
            </div>
          )}
          {(sg.globalHashtagStrategy || onUpdateData) && (
            <div className="bg-gray-50 border rounded-xl p-4">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Estratégia Global de Hashtags</h3>
              <EditableField value={sg.globalHashtagStrategy || ""} onSave={(val) => onUpdateData?.(prev => prev.socialMediaGuidelines ? { ...prev, socialMediaGuidelines: { ...prev.socialMediaGuidelines, globalHashtagStrategy: val || undefined } } : prev)} className="text-gray-700 text-sm leading-relaxed" readOnly={!onUpdateData} multiline />
            </div>
          )}
        </div>
      )}

      <div className="space-y-5">
        {sg.platforms.map((platform, i) => (
          <div key={i} className="bg-white border rounded-2xl overflow-hidden shadow-sm relative group/platform">
            {onUpdateData && (
              <button
                type="button"
                onClick={() => onUpdateData(prev => prev.socialMediaGuidelines ? { ...prev, socialMediaGuidelines: { ...prev.socialMediaGuidelines, platforms: prev.socialMediaGuidelines.platforms.filter((_, idx) => idx !== i) } } : prev)}
                className="absolute top-3 right-3 no-print z-10 w-6 h-6 bg-white border rounded-full text-red-400 hover:text-red-600 hover:bg-red-50 opacity-0 group-hover/platform:opacity-100 transition flex items-center justify-center"
                title="Excluir canal"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
              </button>
            )}
            <div className="px-5 py-4 bg-gray-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{platformIcon(platform.platform)}</span>
                <div>
                  <h3 className="font-bold text-lg"><EditableField value={platform.platform} onSave={(val) => onUpdateData?.(prev => prev.socialMediaGuidelines ? { ...prev, socialMediaGuidelines: { ...prev.socialMediaGuidelines, platforms: prev.socialMediaGuidelines.platforms.map((item, idx) => idx === i ? { ...item, platform: val } : item) } } : prev)} readOnly={!onUpdateData} /></h3>
                  <EditableField value={platform.primaryFormats} onSave={(val) => onUpdateData?.(prev => prev.socialMediaGuidelines ? { ...prev, socialMediaGuidelines: { ...prev.socialMediaGuidelines, platforms: prev.socialMediaGuidelines.platforms.map((item, idx) => idx === i ? { ...item, primaryFormats: val } : item) } } : prev)} className="text-gray-400 text-xs mt-0.5" readOnly={!onUpdateData} />
                </div>
              </div>
              {(platform.frequency || onUpdateData) && (
                <span className="bg-white/10 text-white text-xs font-semibold px-3 py-1.5 rounded-full">
                  <EditableField value={platform.frequency || ""} onSave={(val) => onUpdateData?.(prev => prev.socialMediaGuidelines ? { ...prev, socialMediaGuidelines: { ...prev.socialMediaGuidelines, platforms: prev.socialMediaGuidelines.platforms.map((item, idx) => idx === i ? { ...item, frequency: val || undefined } : item) } } : prev)} readOnly={!onUpdateData} />
                </span>
              )}
            </div>

            <div className="p-4 grid grid-cols-1 lg:grid-cols-3 gap-5">
              <div className="lg:col-span-2 space-y-5">
                <div>
                  <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Tom neste canal</div>
                  <EditableField value={platform.tone} onSave={(val) => onUpdateData?.(prev => prev.socialMediaGuidelines ? { ...prev, socialMediaGuidelines: { ...prev.socialMediaGuidelines, platforms: prev.socialMediaGuidelines.platforms.map((item, idx) => idx === i ? { ...item, tone: val } : item) } } : prev)} className="text-gray-700 text-sm leading-relaxed" readOnly={!onUpdateData} multiline />
                </div>

                {(platform.contentPillars && platform.contentPillars.length > 0) || onUpdateData ? (
                  <div>
                    <div className="flex items-center justify-between gap-3 mb-3">
                      <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Pilares de Conteúdo</div>
                      {onUpdateData && <button type="button" onClick={() => onUpdateData(prev => prev.socialMediaGuidelines ? { ...prev, socialMediaGuidelines: { ...prev.socialMediaGuidelines, platforms: prev.socialMediaGuidelines.platforms.map((item, idx) => idx === i ? { ...item, contentPillars: [...item.contentPillars, "Novo pilar"] } : item) } } : prev)} className="no-print text-[10px] font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded transition">+ Adicionar</button>}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {platform.contentPillars.map((pillar, j) => (
                        <span key={j} className={`text-xs font-semibold px-3 py-1.5 rounded-full border ${PILLAR_COLORS[j % PILLAR_COLORS.length]}`}>
                          <EditableField value={pillar} onSave={(val) => onUpdateData?.(prev => prev.socialMediaGuidelines ? { ...prev, socialMediaGuidelines: { ...prev.socialMediaGuidelines, platforms: prev.socialMediaGuidelines.platforms.map((item, idx) => idx === i ? { ...item, contentPillars: item.contentPillars.map((entry, entryIdx) => entryIdx === j ? val : entry) } : item) } } : prev)} onDelete={onUpdateData ? () => onUpdateData?.(prev => prev.socialMediaGuidelines ? { ...prev, socialMediaGuidelines: { ...prev.socialMediaGuidelines, platforms: prev.socialMediaGuidelines.platforms.map((item, idx) => idx === i ? { ...item, contentPillars: item.contentPillars.filter((_, entryIdx) => entryIdx !== j) } : item) } } : prev) : undefined} readOnly={!onUpdateData} />
                        </span>
                      ))}
                    </div>
                  </div>
                ) : null}

                {(platform.examplePost || onUpdateData) && (
                  <div>
                    <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Exemplo de Post</div>
                    <div className="bg-gray-50 border rounded-xl p-4 text-sm text-gray-700 leading-relaxed italic">
                      <span>&ldquo;</span><EditableField value={platform.examplePost || ""} onSave={(val) => onUpdateData?.(prev => prev.socialMediaGuidelines ? { ...prev, socialMediaGuidelines: { ...prev.socialMediaGuidelines, platforms: prev.socialMediaGuidelines.platforms.map((item, idx) => idx === i ? { ...item, examplePost: val || undefined } : item) } } : prev)} className="inline" readOnly={!onUpdateData} multiline /><span>&rdquo;</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                {(platform.doList && platform.doList.length > 0) || onUpdateData ? (
                  <div>
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <div className="text-xs font-bold text-green-700 uppercase tracking-wider">Do</div>
                      {onUpdateData && <button type="button" onClick={() => onUpdateData(prev => prev.socialMediaGuidelines ? { ...prev, socialMediaGuidelines: { ...prev.socialMediaGuidelines, platforms: prev.socialMediaGuidelines.platforms.map((item, idx) => idx === i ? { ...item, doList: [...item.doList, "Novo do"] } : item) } } : prev)} className="no-print text-[10px] font-bold text-green-700 bg-green-50 hover:bg-green-100 px-2 py-1 rounded transition">+ Adicionar</button>}
                    </div>
                    <ul className="space-y-1.5">
                      {platform.doList.map((item, j) => (
                        <li key={j} className="flex items-start gap-2 text-sm text-gray-700 group/item">
                          <span className="text-green-500 shrink-0 mt-0.5 font-bold">✓</span>
                          <EditableField value={item} onSave={(val) => onUpdateData?.(prev => prev.socialMediaGuidelines ? { ...prev, socialMediaGuidelines: { ...prev.socialMediaGuidelines, platforms: prev.socialMediaGuidelines.platforms.map((entry, idx) => idx === i ? { ...entry, doList: entry.doList.map((listItem, listIdx) => listIdx === j ? val : listItem) } : entry) } } : prev)} onDelete={onUpdateData ? () => onUpdateData?.(prev => prev.socialMediaGuidelines ? { ...prev, socialMediaGuidelines: { ...prev.socialMediaGuidelines, platforms: prev.socialMediaGuidelines.platforms.map((entry, idx) => idx === i ? { ...entry, doList: entry.doList.filter((_, listIdx) => listIdx !== j) } : entry) } } : prev) : undefined} className="flex-1" readOnly={!onUpdateData} multiline />
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                {(platform.dontList && platform.dontList.length > 0) || onUpdateData ? (
                  <div>
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <div className="text-xs font-bold text-red-700 uppercase tracking-wider">Don&apos;t</div>
                      {onUpdateData && <button type="button" onClick={() => onUpdateData(prev => prev.socialMediaGuidelines ? { ...prev, socialMediaGuidelines: { ...prev.socialMediaGuidelines, platforms: prev.socialMediaGuidelines.platforms.map((item, idx) => idx === i ? { ...item, dontList: [...item.dontList, "Novo don't"] } : item) } } : prev)} className="no-print text-[10px] font-bold text-red-700 bg-red-50 hover:bg-red-100 px-2 py-1 rounded transition">+ Adicionar</button>}
                    </div>
                    <ul className="space-y-1.5">
                      {platform.dontList.map((item, j) => (
                        <li key={j} className="flex items-start gap-2 text-sm text-gray-700 group/item">
                          <span className="text-red-500 shrink-0 mt-0.5 font-bold">✕</span>
                          <EditableField value={item} onSave={(val) => onUpdateData?.(prev => prev.socialMediaGuidelines ? { ...prev, socialMediaGuidelines: { ...prev.socialMediaGuidelines, platforms: prev.socialMediaGuidelines.platforms.map((entry, idx) => idx === i ? { ...entry, dontList: entry.dontList.map((listItem, listIdx) => listIdx === j ? val : listItem) } : entry) } } : prev)} onDelete={onUpdateData ? () => onUpdateData?.(prev => prev.socialMediaGuidelines ? { ...prev, socialMediaGuidelines: { ...prev.socialMediaGuidelines, platforms: prev.socialMediaGuidelines.platforms.map((entry, idx) => idx === i ? { ...entry, dontList: entry.dontList.filter((_, listIdx) => listIdx !== j) } : entry) } } : prev) : undefined} className="flex-1" readOnly={!onUpdateData} multiline />
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
