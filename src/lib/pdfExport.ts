import type { BrandbookData } from "./types";

function cssUrlToRawUrl(v: string): string | null {
  const s = (v ?? "").trim();
  if (!s || s === "none") return null;
  const m = s.match(/^url\((.*)\)$/i);
  if (!m) return null;
  const inner = m[1].trim();
  return inner.replace(/^['"]/, "").replace(/['"]$/, "");
}

async function toDataUrlViaProxy(url: string): Promise<string> {
  const res = await fetch("/api/image-to-dataurl", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ url }),
  });
  const json = (await res.json()) as { dataUrl?: string; error?: string };
  if (!res.ok || !json.dataUrl) {
    throw new Error(json.error ?? "Falha ao converter imagem para data URL");
  }
  return json.dataUrl;
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
    allowTaint: true,
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
  let hadConversionFailure = false;

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

  const A4_W = 595;
  const A4_H = 842;
  const pdf = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    allowTaint: true,
    backgroundColor: "#ffffff",
    logging: false,
    onclone: (doc) => {
      if (!isImmersive) return;
      const el = doc.getElementById(elementId);
      if (!el) return;
      const h = el as HTMLElement;
      if (hadConversionFailure) h.setAttribute("data-exporting", "1");
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
