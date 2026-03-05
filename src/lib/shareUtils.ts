export async function compressBrandbook(data: object): Promise<string | null> {
  try {
    const json = JSON.stringify(data);
    const stream = new CompressionStream("gzip");
    const writer = stream.writable.getWriter();
    const reader = stream.readable.getReader();
    writer.write(new TextEncoder().encode(json));
    writer.close();
    const chunks: Uint8Array[] = [];
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) chunks.push(value);
    }
    const total = chunks.reduce((n, c) => n + c.length, 0);
    const buf = new Uint8Array(total);
    let offset = 0;
    for (const chunk of chunks) { buf.set(chunk, offset); offset += chunk.length; }
    const binary = Array.from(buf).map((b) => String.fromCharCode(b)).join("");
    return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
  } catch {
    return null;
  }
}

export async function decompressBrandbook(encoded: string): Promise<object | null> {
  try {
    const padded = encoded.replace(/-/g, "+").replace(/_/g, "/");
    const pad = padded.length % 4 ? "=".repeat(4 - (padded.length % 4)) : "";
    const binary = atob(padded + pad);
    const buf = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) buf[i] = binary.charCodeAt(i);
    const stream = new DecompressionStream("gzip");
    const writer = stream.writable.getWriter();
    const reader = stream.readable.getReader();
    writer.write(buf);
    writer.close();
    const chunks: Uint8Array[] = [];
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) chunks.push(value);
    }
    const total = chunks.reduce((n, c) => n + c.length, 0);
    const result = new Uint8Array(total);
    let offset = 0;
    for (const chunk of chunks) { result.set(chunk, offset); offset += chunk.length; }
    return JSON.parse(new TextDecoder().decode(result));
  } catch {
    return null;
  }
}

export function buildShareUrl(compressed: string): string {
  const base = typeof window !== "undefined" ? window.location.origin : "";
  return `${base}/?bb=${compressed}`;
}

function legacyCopyText(text: string): boolean {
  if (typeof document === "undefined") return false;
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "true");
    ta.style.position = "fixed";
    ta.style.left = "-9999px";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}

export async function copyShareUrl(data: object): Promise<{ url: string; sizeKB: number; copied: boolean } | null> {
  const compressed = await compressBrandbook(data);
  if (!compressed) return null;
  const url = buildShareUrl(compressed);
  const sizeKB = Math.round(url.length / 1024);

  let copied = false;
  try {
    if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(url);
      copied = true;
    }
  } catch {
    copied = false;
  }

  if (!copied) {
    copied = legacyCopyText(url);
  }

  return { url, sizeKB, copied };
}
