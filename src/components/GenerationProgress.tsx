"use client";

interface Props {
  phase: string;
  pct: number;
}

const PHASE_ICONS: Record<string, string> = {
  "Analisando": "🔍",
  "Preparando": "⚙️",
  "Definindo DNA": "🧬",
  "Criando posicionamento": "🧭",
  "Desenvolvendo identidade verbal": "✍️",
  "Construindo identidade visual": "🎨",
  "Criando design system": "🔧",
  "Finalizando aplicações": "📐",
  "Compondo briefing": "🖼️",
  "Validando": "✅",
  "Corrigindo": "🔄",
  "Refinando": "✨",
  "Brandbook pronto": "🎉",
  "Iniciando": "🚀",
  "Gerando": "⚡",
};

function getIcon(phase: string): string {
  for (const [key, icon] of Object.entries(PHASE_ICONS)) {
    if (phase.toLowerCase().includes(key.toLowerCase())) return icon;
  }
  return "⚡";
}

export function GenerationProgress({ phase, pct }: Props) {
  const icon = getIcon(phase);
  const isDone = pct >= 100;

  return (
    <div className="flex flex-col items-center gap-6 py-12 px-6 max-w-sm mx-auto text-center">
      <div
        className={`text-5xl transition-transform duration-500 ${isDone ? "scale-125" : "animate-pulse"}`}
        role="img"
        aria-label={phase}
      >
        {icon}
      </div>

      <div className="w-full space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600 font-medium truncate pr-2">{phase}</span>
          <span className="text-gray-400 font-mono text-xs flex-shrink-0">{pct}%</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ease-out ${
              isDone ? "bg-green-500" : "bg-gray-900"
            }`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {!isDone && (
        <p className="text-xs text-gray-400">
          A IA está construindo seu brandbook em tempo real — aguarde...
        </p>
      )}
    </div>
  );
}
