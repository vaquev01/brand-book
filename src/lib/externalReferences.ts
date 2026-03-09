import { isPrivateHostname } from "@/lib/common";
import dns from "node:dns/promises";
import net from "node:net";

export type ExternalReference = {
  url: string;
  finalUrl?: string;
  ok: boolean;
  status?: number;
  title?: string;
  description?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  textExcerpt?: string;
  error?: string;
};

function isPrivateIp(ip: string): boolean {
  const v = net.isIP(ip);
  if (v === 4) {
    if (ip === "0.0.0.0") return true;
    if (ip.startsWith("127.")) return true;
    if (ip.startsWith("10.")) return true;
    if (ip.startsWith("192.168.")) return true;
    if (ip.startsWith("169.254.")) return true;
    if (/^172\.(1[6-9]|2\d|3[0-1])\./.test(ip)) return true;
    return false;
  }
  if (v === 6) {
    const n = ip.toLowerCase();
    if (n === "::" || n === "::1") return true;
    if (n.startsWith("fc") || n.startsWith("fd")) return true;
    if (n.startsWith("fe80:")) return true;
    return false;
  }
  return true;
}

async function assertSafeHostname(hostname: string): Promise<void> {
  if (!hostname) throw new Error("Hostname vazio");
  if (isPrivateHostname(hostname)) throw new Error("Hostname privado não permitido");

  if (net.isIP(hostname)) {
    if (isPrivateIp(hostname)) throw new Error("IP privado não permitido");
    return;
  }

  const records = await dns.lookup(hostname, { all: true, verbatim: true });
  if (!records || records.length === 0) throw new Error("DNS lookup falhou");
  for (const r of records) {
    if (isPrivateIp(r.address)) throw new Error("Hostname resolve para IP privado");
  }
}

function decodeEntities(input: string): string {
  return input
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function extractMeta(html: string): Pick<ExternalReference, "title" | "description" | "ogTitle" | "ogDescription" | "ogImage"> {
  const out: Pick<ExternalReference, "title" | "description" | "ogTitle" | "ogDescription" | "ogImage"> = {};

  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  if (titleMatch) out.title = decodeEntities(titleMatch[1].trim()).slice(0, 180);

  const descMatch = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([\s\S]*?)["'][^>]*>/i);
  if (descMatch) out.description = decodeEntities(descMatch[1].trim()).slice(0, 240);

  const ogTitleMatch = html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([\s\S]*?)["'][^>]*>/i);
  if (ogTitleMatch) out.ogTitle = decodeEntities(ogTitleMatch[1].trim()).slice(0, 180);

  const ogDescMatch = html.match(/<meta[^>]+property=["']og:description["'][^>]+content=["']([\s\S]*?)["'][^>]*>/i);
  if (ogDescMatch) out.ogDescription = decodeEntities(ogDescMatch[1].trim()).slice(0, 280);

  const ogImgMatch = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([\s\S]*?)["'][^>]*>/i);
  if (ogImgMatch) out.ogImage = decodeEntities(ogImgMatch[1].trim()).slice(0, 400);

  return out;
}

function extractTextExcerpt(html: string, maxLen = 1600): string {
  let x = html;
  x = x.replace(/<script[\s\S]*?<\/script>/gi, " ");
  x = x.replace(/<style[\s\S]*?<\/style>/gi, " ");
  x = x.replace(/<noscript[\s\S]*?<\/noscript>/gi, " ");
  x = x.replace(/<svg[\s\S]*?<\/svg>/gi, " ");
  x = x.replace(/<[^>]+>/g, " ");
  x = decodeEntities(x);
  x = x.replace(/\s+/g, " ").trim();
  return x.slice(0, maxLen);
}

function toUrlList(input: unknown): string[] {
  if (Array.isArray(input)) return input.filter((x) => typeof x === "string").map((s) => s.trim()).filter(Boolean);
  if (typeof input === "string") {
    return input
      .split(/[\n,\s]+/g)
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [];
}

async function safeFetchWithRedirects(url: string, maxRedirects = 3): Promise<Response> {
  let current = url;
  for (let i = 0; i <= maxRedirects; i++) {
    const u = new URL(current);
    if (!/^https?:$/.test(u.protocol)) throw new Error("Apenas http/https é permitido");
    if (u.username || u.password) throw new Error("Credenciais na URL não são permitidas");

    await assertSafeHostname(u.hostname);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12_000);
    const res = await fetch(current, {
      method: "GET",
      redirect: "manual",
      signal: controller.signal,
      headers: {
        "user-agent": "BrandbookBuilderBot/1.0 (+https://brand-book-production.up.railway.app)",
        "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
    }).finally(() => clearTimeout(timeout));

    if (res.status >= 300 && res.status < 400) {
      const loc = res.headers.get("location");
      if (!loc) throw new Error("Redirect sem Location");
      const next = new URL(loc, current).toString();
      current = next;
      continue;
    }

    return res;
  }
  throw new Error("Redirects demais");
}

export async function fetchExternalReference(rawUrl: string): Promise<ExternalReference> {
  const url = rawUrl.trim();
  if (!url) return { url, ok: false, error: "URL vazia" };

  try {
    const res = await safeFetchWithRedirects(url);
    const ct = res.headers.get("content-type") || "";
    const status = res.status;

    if (!ct.toLowerCase().includes("text/html") && !ct.toLowerCase().includes("application/xhtml")) {
      return { url, finalUrl: res.url || url, ok: false, status, error: `Conteúdo não-HTML (${ct || "unknown"})` };
    }

    const html = (await res.text()).slice(0, 1_200_000);
    const meta = extractMeta(html);
    const textExcerpt = extractTextExcerpt(html);

    return {
      url,
      finalUrl: res.url || url,
      ok: res.ok,
      status,
      ...meta,
      textExcerpt,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erro desconhecido";
    return { url, ok: false, error: message };
  }
}

export async function fetchExternalReferences(input: unknown, maxUrls = 4): Promise<ExternalReference[]> {
  const urls = toUrlList(input).slice(0, maxUrls);
  if (urls.length === 0) return [];

  const results: ExternalReference[] = [];
  for (const u of urls) {
    results.push(await fetchExternalReference(u));
  }
  return results;
}

export function formatExternalReferencesForPrompt(refs: ExternalReference[], maxExcerptChars = 1200): string {
  if (!refs || refs.length === 0) return "";

  const lines: string[] = [];
  lines.push("\n\n════════════════════════════════════════");
  lines.push("REFERÊNCIAS EXTERNAS (EXTRATOS EXTRAÍDOS PELO SISTEMA)");
  lines.push("════════════════════════════════════════");
  lines.push("Use APENAS estes extratos como base. Não diga que você navegou na internet.");
  lines.push("Para cada extrato, aplique o Protocolo de Mineração Profunda descrito acima.");

  refs.forEach((r, idx) => {
    const finalUrl = r.finalUrl || r.url;
    const head = `\n[${idx + 1}] ${finalUrl}`;
    lines.push(head);

    // Detect platform type for contextual hints
    const urlLower = finalUrl.toLowerCase();
    if (urlLower.includes("instagram.com")) {
      lines.push("Plataforma: Instagram — extraia bio, categoria, estilo de feed, hashtags, linguagem visual");
    } else if (urlLower.includes("linkedin.com")) {
      lines.push("Plataforma: LinkedIn — extraia posicionamento profissional, setor, tom corporativo, headline");
    } else if (urlLower.includes("tiktok.com")) {
      lines.push("Plataforma: TikTok — extraia tom de vídeo, público jovem, tendências, estilo informal");
    } else if (urlLower.includes("facebook.com")) {
      lines.push("Plataforma: Facebook — extraia categoria, reviews, público, eventos, comunidade");
    }

    if (!r.ok) {
      lines.push(`Status: ${r.status ?? "?"} (falha) — ${r.error ?? "Erro"}`);
      lines.push("INFERÊNCIA: Mesmo sem acesso ao conteúdo, o domínio/URL indica plataforma e tipo de presença. Use como pista contextual.");
      return;
    }
    if (r.ogTitle || r.title) lines.push(`Título: ${r.ogTitle || r.title}`);
    if (r.ogDescription || r.description) lines.push(`Descrição: ${r.ogDescription || r.description}`);
    if (r.ogImage) lines.push(`OG Image: ${r.ogImage}`);
    if (r.textExcerpt) lines.push(`Trecho de conteúdo: ${r.textExcerpt.slice(0, maxExcerptChars)}`);
  });

  return lines.join("\n");
}
