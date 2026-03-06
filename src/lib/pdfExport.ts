import type { BrandbookData } from "./types";
import { fetchImageDataUrl } from "./imageTransport";

function cssUrlToRawUrl(v: string): string | null {
  const s = (v ?? "").trim();
  if (!s || s === "none") return null;
  const m = s.match(/^url\((.*)\)$/i);
  if (!m) return null;
  const inner = m[1].trim();
  return inner.replace(/^['"]/, "").replace(/['"]$/, "");
}

function extractCssUrls(v: string): string[] {
  const out: string[] = [];
  const s = (v ?? "").trim();
  if (!s || s === "none") return out;
  const re = /url\(([^)]+)\)/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(s)) !== null) {
    const raw = (m[1] ?? "").trim().replace(/^['"]/, "").replace(/['"]$/, "");
    if (raw) out.push(raw);
  }
  return out;
}

function replaceCssUrls(v: string, map: Map<string, string>): string {
  if (!v || v === "none") return v;
  return v.replace(/url\(([^)]+)\)/gi, (full, inner: string) => {
    const raw = (inner ?? "").trim().replace(/^['"]/, "").replace(/['"]$/, "");
    const next = map.get(raw);
    if (!next) return full;
    return `url(${JSON.stringify(next)})`;
  });
}

async function toDataUrlViaProxy(url: string): Promise<string> {
  return fetchImageDataUrl(url);
}

export async function exportBrandbookPDF(
  elementId: string,
  brandName: string
): Promise<void> {
  const { default: html2canvas } = await import("html2canvas");
  const { jsPDF } = await import("jspdf");

  const element = document.getElementById(elementId);
  if (!element) throw new Error("Elemento não encontrado para exportar PDF.");

  const isImmersive = element.classList.contains("bb-immersive");
  const originalBg = element.style.background;
  if (!isImmersive) element.style.background = "#ffffff";

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    allowTaint: false,
    backgroundColor: "#ffffff",
    logging: false,
    windowWidth: element.scrollWidth,
    windowHeight: element.scrollHeight,
  });

  element.style.background = originalBg;

  const imgData = canvas.toDataURL("image/jpeg", 0.92);
  const pdf = new jsPDF({
    orientation: canvas.width > canvas.height ? "landscape" : "portrait",
    unit: "px",
    format: [canvas.width / 2, canvas.height / 2],
    compress: true,
  });

  pdf.addImage(imgData, "JPEG", 0, 0, canvas.width / 2, canvas.height / 2);
  pdf.save(`${brandName.toLowerCase().replace(/\s+/g, "-")}-brandbook.pdf`);
}

export async function exportBrandbookPDFMultiPage(
  elementId: string,
  data: BrandbookData
): Promise<void> {
  const { default: html2canvas } = await import("html2canvas");
  const { jsPDF } = await import("jspdf");

  const element = document.getElementById(elementId);
  if (!element) throw new Error("Elemento não encontrado para exportar PDF.");

  const isImmersive = element.classList.contains("bb-immersive");
  const varsToInline: Array<
    "--bb-pattern-url" | "--bb-atmosphere-url" | "--bb-watermark-url"
  > = ["--bb-pattern-url", "--bb-atmosphere-url", "--bb-watermark-url"];

  const computed = isImmersive ? getComputedStyle(element) : null;
  const rawUrls = isImmersive
    ? Object.fromEntries(
        varsToInline.map((k) => [k, cssUrlToRawUrl(computed!.getPropertyValue(k))])
      )
    : ({} as Record<string, string | null>);

  const inlineVarMap = new Map<string, string>();
  const externalAssetMap = new Map<string, string>();
  let hadConversionFailure = false;

  const externalUrls = new Set<string>();

  const originalNodes = [element, ...Array.from(element.querySelectorAll("*"))] as HTMLElement[];
  for (const node of originalNodes) {
    const bg = getComputedStyle(node).backgroundImage;
    for (const bgUrl of extractCssUrls(bg)) {
      if (!bgUrl.startsWith("data:") && /^https?:\/\//i.test(bgUrl)) {
        externalUrls.add(bgUrl);
      }
    }
    if (node.tagName.toLowerCase() === "img") {
      const img = node as HTMLImageElement;
      const candidates = [img.currentSrc, img.src, img.getAttribute("src") ?? ""];
      for (const src of candidates) {
        if (src && !src.startsWith("data:") && /^https?:\/\//i.test(src)) {
          externalUrls.add(src);
        }
      }
    }
  }

  if (isImmersive) {
    for (const k of varsToInline) {
      const raw = rawUrls[k];
      if (!raw) continue;
      if (raw.startsWith("data:")) {
        inlineVarMap.set(k, `url(${JSON.stringify(raw)})`);
        continue;
      }
      try {
        const dataUrl = await toDataUrlViaProxy(raw);
        inlineVarMap.set(k, `url(${JSON.stringify(dataUrl)})`);
      } catch {
        hadConversionFailure = true;
      }
    }
  }

  for (const url of externalUrls) {
    try {
      const dataUrl = await toDataUrlViaProxy(url);
      externalAssetMap.set(url, dataUrl);
    } catch {
      hadConversionFailure = true;
    }
  }

  const A4_W = 595;
  const A4_H = 842;
  const pdf = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    allowTaint: false,
    backgroundColor: "#ffffff",
    logging: false,
    windowWidth: element.scrollWidth,
    windowHeight: element.scrollHeight,
    onclone: (doc) => {
      const el = doc.getElementById(elementId);
      if (!el) return;
      const h = el as HTMLElement;
      if (hadConversionFailure) h.setAttribute("data-exporting", "1");

      const cloneNodes = [h, ...Array.from(h.querySelectorAll("*"))] as HTMLElement[];
      for (const n of cloneNodes) {
        if (n.tagName.toLowerCase() === "img") {
          const img = n as HTMLImageElement;
          const candidates = [img.currentSrc, img.src, img.getAttribute("src") ?? ""];
          for (const src of candidates) {
            const mapped = externalAssetMap.get(src);
            if (mapped) {
              img.src = mapped;
              break;
            }
          }
        }

        const view = doc.defaultView;
        if (view) {
          const bg = view.getComputedStyle(n).backgroundImage;
          const replaced = replaceCssUrls(bg, externalAssetMap);
          if (replaced && replaced !== "none" && replaced !== bg) {
            n.style.backgroundImage = replaced;
          }
        }
      }

      if (!isImmersive) return;
      for (const [k, v] of inlineVarMap.entries()) {
        h.style.setProperty(k, v);
      }
    },
  });

  const imgData = canvas.toDataURL("image/jpeg", 0.90);
  const imgW = A4_W;
  const imgH = (canvas.height * A4_W) / canvas.width;

  let posY = 0;
  let pageCount = 0;

  while (posY < imgH) {
    if (pageCount > 0) pdf.addPage();
    pdf.addImage(imgData, "JPEG", 0, -posY, imgW, imgH);
    posY += A4_H;
    pageCount++;
  }

  const slug = data.brandName.toLowerCase().replace(/\s+/g, "-");
  pdf.save(`${slug}-brandbook.pdf`);
}
