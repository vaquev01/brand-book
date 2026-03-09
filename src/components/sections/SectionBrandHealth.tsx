"use client";
import { BrandbookData } from "@/lib/types";

interface HealthCheck {
  label: string;
  score: number;
  description: string;
}

function computeHealth(data: BrandbookData): HealthCheck[] {
  const checks: HealthCheck[] = [];

  // Brand DNA
  const dnaScore =
    (data.brandConcept.values?.length > 0 ? 25 : 0) +
    (data.brandConcept.personality?.length > 0 ? 25 : 0) +
    (data.brandConcept.brandArchetype ? 25 : 0) +
    (data.brandConcept.toneOfVoice ? 25 : 0);
  checks.push({
    label: "DNA da Marca",
    score: dnaScore,
    description: `${data.brandConcept.values?.length ?? 0} valores · ${data.brandConcept.personality?.length ?? 0} traços`,
  });

  // Brand Story
  const story = data.brandStory;
  const storyScore = story
    ? (story.manifesto ? 40 : 0) +
      (story.originStory ? 30 : 0) +
      (story.brandPromise ? 20 : 0) +
      ((story.brandBeliefs?.length ?? 0) > 0 ? 10 : 0)
    : 0;
  checks.push({
    label: "Brand Story",
    score: storyScore,
    description: story ? "Manifesto · Origem · Promessa" : "Não definida",
  });

  // Verbal Identity
  const verbal = data.verbalIdentity;
  const verbalScore = verbal
    ? (verbal.tagline ? 20 : 0) +
      ((verbal.sampleHeadlines?.length ?? 0) > 0 ? 20 : 0) +
      ((verbal.sampleCTAs?.length ?? 0) > 0 ? 20 : 0) +
      ((verbal.messagingPillars?.length ?? 0) > 0 ? 20 : 0) +
      ((verbal.tonePerChannel?.length ?? 0) > 0 ? 20 : 0)
    : 0;
  checks.push({
    label: "Identidade Verbal",
    score: verbalScore,
    description: verbal ? `Tagline · ${verbal.messagingPillars?.length ?? 0} pilares` : "Não definida",
  });

  // Logo
  const logo = data.logo;
  const logoScore =
    (logo.primary ? 30 : 0) +
    (logo.secondary ? 20 : 0) +
    (logo.symbol ? 15 : 0) +
    (logo.clearSpace ? 20 : 0) +
    (logo.minimumSize ? 15 : 0);
  checks.push({
    label: "Sistema de Logo",
    score: logoScore,
    description:
      [logo.primary && "Primário", logo.secondary && "Secundário", logo.symbol && "Símbolo"]
        .filter(Boolean)
        .join(" · ") || "Sem variantes",
  });

  // Colors
  const colorsScore =
    (data.colors.primary.length >= 2 ? 40 : data.colors.primary.length >= 1 ? 20 : 0) +
    (data.colors.secondary.length > 0 ? 30 : 0) +
    (data.colors.primary.some((c) => c.tonalScale && c.tonalScale.length > 0) ? 30 : 0);
  checks.push({
    label: "Paleta de Cores",
    score: colorsScore,
    description: `${data.colors.primary.length} primárias · ${data.colors.secondary.length} secundárias`,
  });

  // Typography
  const typo = data.typography;
  const hasMarketing = !!(typo.marketing ?? typo.primary);
  const hasUI = !!(typo.ui ?? typo.secondary);
  const hasWeights = hasMarketing && ((typo.marketing ?? typo.primary)?.weights?.length ?? 0) > 1;
  const typoScore =
    (hasMarketing ? 35 : 0) + (hasUI ? 35 : 0) + (hasWeights ? 15 : 0) + (typo.monospace ? 15 : 0);
  checks.push({
    label: "Tipografia",
    score: typoScore,
    description:
      [hasMarketing && "Fonte display", hasUI && "Fonte corpo", typo.monospace && "Monospace"]
        .filter(Boolean)
        .join(" · ") || "Sem fontes",
  });

  // Key Visual
  const kv = data.keyVisual;
  const kvScore =
    (kv.photographyStyle ? 25 : 0) +
    ((kv.elements?.length ?? 0) > 0 ? 25 : 0) +
    ((kv.mascots?.length ?? 0) > 0 ? 25 : 0) +
    ((kv.structuredPatterns?.length ?? 0) + (kv.patterns?.length ?? 0) > 0 ? 25 : 0);
  checks.push({
    label: "Key Visual",
    score: kvScore,
    description: `${kv.elements?.length ?? 0} elementos · ${kv.mascots?.length ?? 0} mascotes`,
  });

  // Applications
  const appsScore = Math.min(100, data.applications.length * 14);
  checks.push({
    label: "Aplicações",
    score: appsScore,
    description: `${data.applications.length} aplicaç${data.applications.length !== 1 ? "ões" : "ão"}`,
  });

  return checks;
}

function getStatusColor(score: number) {
  if (score >= 80) return "#16a34a";
  if (score >= 50) return "#f59e0b";
  if (score >= 25) return "#f97316";
  return "#ef4444";
}

function getStatusLabel(score: number) {
  if (score >= 80) return "Excelente";
  if (score >= 50) return "Bom";
  if (score >= 25) return "Incompleto";
  return "Crítico";
}

function ScoreBar({ score }: { score: number }) {
  const clamped = Math.max(0, Math.min(100, score));
  return (
    <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
      <div
        className="h-full rounded-full transition-all"
        style={{ width: `${clamped}%`, background: getStatusColor(score) }}
      />
    </div>
  );
}

export function SectionBrandHealth({ data, num }: { data: BrandbookData; num: number }) {
  const checks = computeHealth(data);
  const totalScore = Math.round(checks.reduce((s, c) => s + c.score, 0) / checks.length);
  const primaryHex = data.colors.primary[0]?.hex ?? "#0a0a0a";
  const circumference = 2 * Math.PI * 34;

  return (
    <section className="page-break mb-6">
      <h2 className="text-xl md:text-2xl font-extrabold tracking-tight mb-4 border-b border-gray-100 pb-2">
        {String(num).padStart(2, "0")}. Brand Health Dashboard
      </h2>

      {/* Overall Score */}
      <div className="rounded-[1.4rem] overflow-hidden shadow-sm mb-5">
        <div className="px-6 py-6 flex items-center gap-6" style={{ background: primaryHex }}>
          {/* Circular gauge */}
          <svg width="80" height="80" viewBox="0 0 80 80" className="flex-shrink-0">
            <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="8" />
            <circle
              cx="40"
              cy="40"
              r="34"
              fill="none"
              stroke={getStatusColor(totalScore)}
              strokeWidth="8"
              strokeDasharray={`${circumference * totalScore / 100} ${circumference}`}
              strokeLinecap="round"
              transform="rotate(-90 40 40)"
            />
            <text x="40" y="45" textAnchor="middle" fill="white" fontSize="17" fontWeight="900">
              {totalScore}
            </text>
          </svg>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/50 mb-1">
              Saúde do Brandbook
            </p>
            <p className="text-2xl font-black text-white">{getStatusLabel(totalScore)}</p>
            <p className="text-sm text-white/60 mt-1">
              {totalScore}/100 · {checks.filter((c) => c.score >= 80).length} áreas excelentes de {checks.length}
            </p>
          </div>
        </div>
      </div>

      {/* Score grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {checks.map((check, i) => (
          <div key={i} className="rounded-[1.1rem] border p-4 bg-white shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold text-gray-900">{check.label}</span>
              <span
                className="text-xs font-bold px-2 py-0.5 rounded-full"
                style={{ background: `${getStatusColor(check.score)}1a`, color: getStatusColor(check.score) }}
              >
                {check.score}%
              </span>
            </div>
            <ScoreBar score={check.score} />
            <p className="text-[11px] text-gray-400 mt-2">{check.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
