export async function readJsonResponse<T>(
  res: Response,
  endpointLabel = "A API"
): Promise<T> {
  const raw = await res.text();
  if (!raw) return {} as T;
  try {
    return JSON.parse(raw) as T;
  } catch {
    const trimmed = raw.trim().toLowerCase();
    const looksMarkup = trimmed.startsWith("<") || trimmed.startsWith("<?xml");
    if (looksMarkup) {
      throw new Error(`${endpointLabel} retornou XML/HTML em vez de JSON.`);
    }
    throw new Error(`${endpointLabel} retornou JSON inválido.`);
  }
}
