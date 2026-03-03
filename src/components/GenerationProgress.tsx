"use client";

import { Sparkles, Search, Settings2, Dna, Crosshair, FileText, Palette, Layers, Layout, Image, CheckCircle2, RefreshCw, Wand2, PartyPopper, Rocket, Zap } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface Props {
  phase: string;
  pct: number;
}

const PHASE_ICONS: Array<{ key: string; Icon: LucideIcon }> = [
  { key: "analisando", Icon: Search },
  { key: "preparando", Icon: Settings2 },
  { key: "definindo dna", Icon: Dna },
  { key: "posicionamento", Icon: Crosshair },
  { key: "identidade verbal", Icon: FileText },
  { key: "identidade visual", Icon: Palette },
  { key: "design system", Icon: Layers },
  { key: "aplicações", Icon: Layout },
  { key: "briefing", Icon: Image },
  { key: "validando", Icon: CheckCircle2 },
  { key: "corrigindo", Icon: RefreshCw },
  { key: "refinando", Icon: Wand2 },
  { key: "pronto", Icon: PartyPopper },
  { key: "iniciando", Icon: Rocket },
  { key: "gerando", Icon: Zap },
];

function getIcon(phase: string): LucideIcon {
  const lower = phase.toLowerCase();
  for (const { key, Icon } of PHASE_ICONS) {
    if (lower.includes(key)) return Icon;
  }
  return Sparkles;
}

export function GenerationProgress({ phase, pct }: Props) {
  const PhaseIcon = getIcon(phase);
  const isDone = pct >= 100;

  return (
    <div className="flex flex-col items-center gap-8 py-16 px-6 max-w-sm mx-auto text-center">
      <div className={`relative w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg ${
        isDone ? "bg-green-500" : "bg-gray-900"
      }`}>
        <PhaseIcon
          className={`w-9 h-9 text-white transition-all duration-500 ${
            isDone ? "scale-110" : "animate-pulse"
          }`}
          aria-label={phase}
        />
        {!isDone && (
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-indigo-500 border-2 border-white animate-ping" />
        )}
      </div>

      <div className="w-full space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-gray-800 font-semibold text-sm truncate pr-2">{phase}</span>
          <span className={`font-mono text-sm font-bold flex-shrink-0 ${
            isDone ? "text-green-600" : "text-gray-500"
          }`}>{pct}%</span>
        </div>
        <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ease-out ${
              isDone ? "bg-green-500" : "bg-indigo-600"
            }`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      <p className={`text-xs ${
        isDone ? "text-green-600 font-semibold" : "text-gray-400"
      }`}>
        {isDone
          ? "Brandbook gerado com sucesso!"
          : "A IA está construindo seu brandbook em tempo real — aguarde..."
        }
      </p>
    </div>
  );
}
