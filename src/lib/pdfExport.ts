import type { BrandbookData } from "./types";

export async function exportBrandbookPDF(
  elementId: string,
  brandName: string
): Promise<void> {
  const { default: html2canvas } = await import("html2canvas");
  const { jsPDF } = await import("jspdf");

  const element = document.getElementById(elementId);
  if (!element) throw new Error("Elemento não encontrado para exportar PDF.");

  const originalBg = element.style.background;
  element.style.background = "#ffffff";

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

  const A4_W = 595;
  const A4_H = 842;
  const pdf = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    allowTaint: true,
    backgroundColor: "#ffffff",
    logging: false,
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
