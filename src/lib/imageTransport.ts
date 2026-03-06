import { buildPngDownloadName, triggerBrowserDownload } from "@/lib/browserDownload";
import { readJsonResponse } from "@/lib/http";

export async function fetchImageDataUrl(url: string): Promise<string> {
  const res = await fetch("/api/image-to-dataurl", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
  });
  const json = await readJsonResponse<{ dataUrl?: string; error?: string }>(
    res,
    "/api/image-to-dataurl"
  );
  if (!res.ok || !json.dataUrl) {
    throw new Error(json.error ?? "Erro ao converter imagem para data URL");
  }
  return json.dataUrl;
}

export async function ensureImageDownloadUrl(url: string): Promise<string> {
  if (url.startsWith("data:")) return url;
  return fetchImageDataUrl(url);
}

export async function downloadImageUrl(url: string, name: string, suffix?: string): Promise<void> {
  const downloadUrl = await ensureImageDownloadUrl(url);
  triggerBrowserDownload(downloadUrl, buildPngDownloadName(name, suffix));
}
