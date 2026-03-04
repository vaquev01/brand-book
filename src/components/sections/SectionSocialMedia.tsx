"use client";
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

export function SectionSocialMedia({ data, num }: { data: BrandbookData; num: number }) {
  if (!data.socialMediaGuidelines) return null;

  const sg = data.socialMediaGuidelines;

  return (
    <section className="page-break mb-16">
      <h2 className="text-3xl font-bold mb-8 border-b pb-4">{String(num).padStart(2, "0")}. Guia de Redes Sociais</h2>

      {(sg.brandVoiceAdaptation || sg.globalHashtagStrategy) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          {sg.brandVoiceAdaptation && (
            <div className="bg-gray-50 border rounded-xl p-6">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Adaptação de Voz por Canal</h3>
              <p className="text-gray-700 text-sm leading-relaxed">{sg.brandVoiceAdaptation}</p>
            </div>
          )}
          {sg.globalHashtagStrategy && (
            <div className="bg-gray-50 border rounded-xl p-6">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Estratégia Global de Hashtags</h3>
              <p className="text-gray-700 text-sm leading-relaxed">{sg.globalHashtagStrategy}</p>
            </div>
          )}
        </div>
      )}

      <div className="space-y-8">
        {sg.platforms.map((platform, i) => (
          <div key={i} className="bg-white border rounded-2xl overflow-hidden shadow-sm">
            <div className="px-6 py-5 bg-gray-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{platformIcon(platform.platform)}</span>
                <div>
                  <h3 className="font-bold text-lg">{platform.platform}</h3>
                  <p className="text-gray-400 text-xs mt-0.5">{platform.primaryFormats}</p>
                </div>
              </div>
              {platform.frequency && (
                <span className="bg-white/10 text-white text-xs font-semibold px-3 py-1.5 rounded-full">
                  {platform.frequency}
                </span>
              )}
            </div>

            <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-5">
                <div>
                  <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Tom neste canal</div>
                  <p className="text-gray-700 text-sm leading-relaxed">{platform.tone}</p>
                </div>

                {platform.contentPillars && platform.contentPillars.length > 0 && (
                  <div>
                    <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Pilares de Conteúdo</div>
                    <div className="flex flex-wrap gap-2">
                      {platform.contentPillars.map((pillar, j) => (
                        <span key={j} className={`text-xs font-semibold px-3 py-1.5 rounded-full border ${PILLAR_COLORS[j % PILLAR_COLORS.length]}`}>
                          {pillar}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {platform.examplePost && (
                  <div>
                    <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Exemplo de Post</div>
                    <div className="bg-gray-50 border rounded-xl p-4 text-sm text-gray-700 leading-relaxed italic">
                      &ldquo;{platform.examplePost}&rdquo;
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                {platform.doList && platform.doList.length > 0 && (
                  <div>
                    <div className="text-xs font-bold text-green-700 uppercase tracking-wider mb-2">Do</div>
                    <ul className="space-y-1.5">
                      {platform.doList.map((item, j) => (
                        <li key={j} className="flex items-start gap-2 text-sm text-gray-700">
                          <span className="text-green-500 shrink-0 mt-0.5 font-bold">✓</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {platform.dontList && platform.dontList.length > 0 && (
                  <div>
                    <div className="text-xs font-bold text-red-700 uppercase tracking-wider mb-2">Don&apos;t</div>
                    <ul className="space-y-1.5">
                      {platform.dontList.map((item, j) => (
                        <li key={j} className="flex items-start gap-2 text-sm text-gray-700">
                          <span className="text-red-500 shrink-0 mt-0.5 font-bold">✕</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
