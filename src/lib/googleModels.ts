export function resolveGoogleTextModel(model?: string): string {
  const DEFAULT_MODEL = "gemini-1.5-flash";
  const raw = model?.trim();
  const m = raw?.startsWith("models/") ? raw.slice("models/".length) : raw;
  if (!m) return DEFAULT_MODEL;
  const lower = m.toLowerCase();
  if (lower.startsWith("imagen")) return DEFAULT_MODEL;
  if (lower.includes("image-preview")) return DEFAULT_MODEL;
  if (lower === "gemini-2.0-flash") return DEFAULT_MODEL;
  return m;
}
