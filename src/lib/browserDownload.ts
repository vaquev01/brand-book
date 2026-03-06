import { slugify } from "./common";

type TriggerDownloadOptions = {
  rel?: string;
  revokeDelayMs?: number;
  target?: string;
};

export function triggerBrowserDownload(
  url: string,
  filename: string,
  options: TriggerDownloadOptions = {}
): void {
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  if (options.rel) a.rel = options.rel;
  if (options.target) a.target = options.target;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  if (url.startsWith("blob:")) {
    window.setTimeout(() => URL.revokeObjectURL(url), options.revokeDelayMs ?? 1200);
  }
}

export function downloadBlob(blob: Blob, filename: string, options: Omit<TriggerDownloadOptions, "revokeDelayMs"> & { revokeDelayMs?: number } = {}): void {
  const url = URL.createObjectURL(blob);
  triggerBrowserDownload(url, filename, options);
}

export function downloadJsonFile(data: unknown, filename: string): void {
  downloadBlob(new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }), filename, { rel: "noopener" });
}

export function downloadTextFile(content: string, filename: string, mimeType = "text/plain"): void {
  downloadBlob(new Blob([content], { type: mimeType }), filename, { rel: "noopener" });
}

export function buildPngDownloadName(name: string, suffix?: string): string {
  const base = slugify(name) || "brandbook";
  const end = suffix ? `-${slugify(suffix) || suffix.toLowerCase()}` : "";
  return `${base}${end}.png`;
}
