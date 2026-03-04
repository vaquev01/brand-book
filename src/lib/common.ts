export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-");
}

export function fnv1a32(input: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

export function isPrivateHostname(hostname: string): boolean {
  const h = (hostname || "").toLowerCase();
  if (h === "localhost" || h === "0.0.0.0" || h === "127.0.0.1" || h === "::1") return true;
  if (h.startsWith("127.")) return true;
  if (h.startsWith("10.")) return true;
  if (h.startsWith("192.168.")) return true;
  if (/^172\.(1[6-9]|2\d|3[0-1])\./.test(h)) return true;
  if (h.startsWith("169.254.")) return true;
  return false;
}

export function bytesToBase64(bytes: unknown): string {
  if (typeof bytes === "string") return bytes;
  if (bytes instanceof ArrayBuffer) bytes = new Uint8Array(bytes);
  if (bytes instanceof Uint8Array) {
    return Buffer.from(bytes).toString("base64");
  }
  throw new Error("Não foi possível converter bytes da imagem para base64");
}
