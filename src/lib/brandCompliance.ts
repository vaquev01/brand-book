import { BrandbookData } from "@/lib/types"

export interface ComplianceRule {
  id: string
  name: string
  category: "colors" | "typography" | "logo" | "voice" | "spacing"
  severity: "error" | "warning" | "suggestion"
  check: (data: BrandbookData) => ComplianceIssue | null
}

export interface ComplianceIssue {
  ruleId: string
  severity: "error" | "warning" | "suggestion"
  message: string
  suggestion?: string
  section?: string
}

export interface ComplianceReport {
  score: number // 0-100
  issues: ComplianceIssue[]
  summary: string
  passed: number
  failed: number
  warnings: number
}

const RULES: ComplianceRule[] = [
  {
    id: "colors.primary-defined",
    name: "Primary color defined",
    category: "colors",
    severity: "error",
    check: (data) => {
      if (!data.colors?.primary?.length) {
        return {
          ruleId: "colors.primary-defined",
          severity: "error",
          message: "Nenhuma cor primária definida",
          suggestion: "Defina ao menos uma cor primária na paleta",
          section: "colors",
        }
      }
      return null
    },
  },
  {
    id: "colors.contrast-ratio",
    name: "Text contrast ratio",
    category: "colors",
    severity: "warning",
    check: (data) => {
      const primary = data.colors?.primary?.[0]
      if (!primary?.hex) return null
      // Basic luminance check
      const hex = primary.hex.replace("#", "")
      const r = parseInt(hex.slice(0, 2), 16) / 255
      const g = parseInt(hex.slice(2, 4), 16) / 255
      const b = parseInt(hex.slice(4, 6), 16) / 255
      const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b
      if (luminance > 0.7) {
        return {
          ruleId: "colors.contrast-ratio",
          severity: "warning",
          message: `Cor primária (${primary.hex}) muito clara — pode ter baixo contraste com texto branco`,
          suggestion: "Considere usar a cor primária em versões mais escuras para textos",
          section: "colors",
        }
      }
      return null
    },
  },
  {
    id: "typography.primary-defined",
    name: "Primary font defined",
    category: "typography",
    severity: "error",
    check: (data) => {
      const fonts = data.typography
      const primary = fonts?.primary ?? fonts?.marketing
      if (!primary?.name) {
        return {
          ruleId: "typography.primary-defined",
          severity: "error",
          message: "Nenhuma fonte principal definida",
          suggestion: "Defina a fonte principal da marca",
          section: "typography",
        }
      }
      return null
    },
  },
  {
    id: "logo.primary-defined",
    name: "Primary logo defined",
    category: "logo",
    severity: "error",
    check: (data) => {
      if (!data.logo?.primary) {
        return {
          ruleId: "logo.primary-defined",
          severity: "error",
          message: "Logo principal não definido",
          suggestion: "Gere ou faça upload do logo principal",
          section: "logo",
        }
      }
      return null
    },
  },
  {
    id: "logo.clear-space",
    name: "Logo clear space defined",
    category: "logo",
    severity: "warning",
    check: (data) => {
      if (!data.logo?.clearSpace) {
        return {
          ruleId: "logo.clear-space",
          severity: "warning",
          message: "Área de proteção do logo não definida",
          suggestion: "Defina a área mínima de respiro ao redor do logo",
          section: "logo",
        }
      }
      return null
    },
  },
  {
    id: "voice.tone-defined",
    name: "Brand voice defined",
    category: "voice",
    severity: "warning",
    check: (data) => {
      if (!data.brandConcept?.toneOfVoice?.length) {
        return {
          ruleId: "voice.tone-defined",
          severity: "warning",
          message: "Tom de voz da marca não definido",
          suggestion: "Defina o tom de voz para garantir consistência nas comunicações",
          section: "verbalIdentity",
        }
      }
      return null
    },
  },
  {
    id: "brand.mission-defined",
    name: "Mission statement defined",
    category: "voice",
    severity: "suggestion",
    check: (data) => {
      if (!data.brandConcept?.mission) {
        return {
          ruleId: "brand.mission-defined",
          severity: "suggestion",
          message: "Missão da marca não definida",
          suggestion: "Defina a missão para fortalecer o propósito da marca",
          section: "dna",
        }
      }
      return null
    },
  },
  {
    id: "colors.min-palette",
    name: "Minimum color palette",
    category: "colors",
    severity: "suggestion",
    check: (data) => {
      const total =
        (data.colors?.primary?.length ?? 0) + (data.colors?.secondary?.length ?? 0)
      if (total < 3) {
        return {
          ruleId: "colors.min-palette",
          severity: "suggestion",
          message: "Paleta com menos de 3 cores",
          suggestion: "Uma boa identidade visual tem ao menos 3-5 cores na paleta",
          section: "colors",
        }
      }
      return null
    },
  },
]

export function runComplianceCheck(data: BrandbookData): ComplianceReport {
  const issues: ComplianceIssue[] = []

  for (const rule of RULES) {
    const issue = rule.check(data)
    if (issue) issues.push(issue)
  }

  const errors = issues.filter(i => i.severity === "error").length
  const warnings = issues.filter(i => i.severity === "warning").length
  const suggestions = issues.filter(i => i.severity === "suggestion").length
  const passed = RULES.length - issues.length

  // Score: errors cost 15 pts, warnings 5 pts, suggestions 2 pts
  const rawScore = 100 - errors * 15 - warnings * 5 - suggestions * 2
  const score = Math.max(0, Math.min(100, rawScore))

  const summary =
    errors > 0
      ? `${errors} problema(s) crítico(s) encontrado(s)`
      : warnings > 0
        ? `Boa identidade, mas ${warnings} ponto(s) a melhorar`
        : score >= 90
          ? "Identidade de marca excelente! ✦"
          : "Identidade sólida, com espaço para refinamento"

  return { score, issues, summary, passed, failed: errors, warnings }
}
