import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import type { BrandbookData, Color } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;

const BodySchema = z.object({
  projectId: z.string().optional(),
  brandbook: z.any().optional(),
  format: z.enum(["summary", "full"]).default("full"),
});

/**
 * Server-side PDF generation using pure HTML/CSS → PDF.
 * No browser required. Generates a clean, professional brand manual.
 *
 * This creates an HTML document that can be converted to PDF via
 * the browser's print-to-PDF or a headless renderer.
 *
 * For now, returns high-quality HTML that the client can use with
 * window.print() for native PDF generation (much better than html2canvas).
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = BodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid body" }, { status: 400 });
    }

    let data: BrandbookData;

    if (parsed.data.projectId) {
      const project = await prisma.project.findFirst({
        where: { id: parsed.data.projectId, ownerId: session.user.id },
        include: {
          brandbookVersions: { orderBy: { createdAt: "desc" }, take: 1 },
          assets: true,
        },
      });
      if (!project) {
        return NextResponse.json({ error: "Project not found" }, { status: 404 });
      }
      data = project.brandbookVersions[0]?.brandbookJson as unknown as BrandbookData;
      if (!data) {
        return NextResponse.json({ error: "No brandbook data" }, { status: 404 });
      }
    } else if (parsed.data.brandbook) {
      data = parsed.data.brandbook as BrandbookData;
    } else {
      return NextResponse.json({ error: "projectId or brandbook required" }, { status: 400 });
    }

    const html = generatePrintableHTML(data);

    return new NextResponse(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Content-Disposition": `inline; filename="${data.brandName.toLowerCase().replace(/\s+/g, "-")}-brandbook.html"`,
      },
    });
  } catch (err) {
    console.error("[export-pdf] Error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

function colorSwatch(color: Color): string {
  return `
    <div class="color-swatch">
      <div class="swatch-preview" style="background: ${color.hex}"></div>
      <div class="swatch-info">
        <strong>${color.name}</strong>
        <span class="mono">${color.hex}</span>
        <span class="mono">${color.rgb}</span>
        ${color.cmyk ? `<span class="mono">${color.cmyk}</span>` : ""}
        ${color.pantone ? `<span class="mono">${color.pantone}</span>` : ""}
      </div>
    </div>`;
}

function generatePrintableHTML(data: BrandbookData): string {
  const primary = data.colors.primary[0]?.hex ?? "#1a1a1a";
  const accent = data.colors.primary[1]?.hex ?? data.colors.secondary[0]?.hex ?? "#6366f1";
  const displayFont = data.typography?.marketing?.name ?? data.typography?.primary?.name ?? "system-ui";
  const bodyFont = data.typography?.ui?.name ?? data.typography?.secondary?.name ?? "system-ui";

  const googleFonts = [...new Set([displayFont, bodyFont])]
    .filter((f) => f !== "system-ui")
    .map((f) => `family=${f.replace(/ /g, "+")}:wght@300;400;500;600;700;800;900`)
    .join("&");

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${data.brandName} — Manual de Identidade</title>
  ${googleFonts ? `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?${googleFonts}&display=swap">` : ""}
  <style>
    @page { size: A4; margin: 0; }
    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      font-family: '${bodyFont}', system-ui, sans-serif;
      color: #1a1a1a;
      background: #ffffff;
      font-size: 11pt;
      line-height: 1.6;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    .page {
      width: 210mm;
      min-height: 297mm;
      padding: 20mm 25mm;
      page-break-after: always;
      position: relative;
    }

    .page:last-child { page-break-after: auto; }

    /* Cover page */
    .cover {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      text-align: center;
      background: ${primary};
      color: white;
      padding: 40mm;
    }

    .cover h1 {
      font-family: '${displayFont}', system-ui, sans-serif;
      font-size: 48pt;
      font-weight: 900;
      letter-spacing: -0.03em;
      line-height: 1;
      margin-bottom: 16pt;
    }

    .cover .tagline {
      font-size: 14pt;
      opacity: 0.6;
      max-width: 300pt;
      font-weight: 400;
    }

    .cover .badge {
      margin-top: 40pt;
      font-size: 8pt;
      text-transform: uppercase;
      letter-spacing: 0.2em;
      opacity: 0.35;
      font-weight: 600;
    }

    .cover .color-strip {
      display: flex;
      gap: 6pt;
      margin-top: 24pt;
    }

    .cover .color-dot {
      width: 12pt;
      height: 12pt;
      border-radius: 50%;
      border: 1.5pt solid rgba(255,255,255,0.2);
    }

    /* Section headers */
    .section-header {
      font-family: '${displayFont}', system-ui, sans-serif;
      font-size: 24pt;
      font-weight: 800;
      color: ${primary};
      margin-bottom: 8pt;
      letter-spacing: -0.02em;
    }

    .section-subtitle {
      font-size: 10pt;
      color: #999;
      text-transform: uppercase;
      letter-spacing: 0.15em;
      font-weight: 600;
      margin-bottom: 20pt;
    }

    .section-divider {
      width: 40pt;
      height: 3pt;
      background: ${accent};
      border-radius: 2pt;
      margin-bottom: 20pt;
    }

    /* Content blocks */
    .content-block {
      margin-bottom: 16pt;
    }

    .content-block h3 {
      font-size: 11pt;
      font-weight: 700;
      color: #333;
      margin-bottom: 4pt;
    }

    .content-block p {
      font-size: 10pt;
      color: #555;
      line-height: 1.7;
    }

    /* Tags/pills */
    .tag-list {
      display: flex;
      flex-wrap: wrap;
      gap: 6pt;
      margin-top: 8pt;
    }

    .tag {
      font-size: 8pt;
      font-weight: 600;
      padding: 3pt 10pt;
      border-radius: 12pt;
      background: ${primary}10;
      color: ${primary};
      border: 0.5pt solid ${primary}25;
    }

    /* Color system */
    .color-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12pt;
    }

    .color-swatch {
      display: flex;
      flex-direction: column;
    }

    .swatch-preview {
      width: 100%;
      height: 50pt;
      border-radius: 6pt;
      margin-bottom: 6pt;
    }

    .swatch-info {
      display: flex;
      flex-direction: column;
      gap: 1pt;
    }

    .swatch-info strong {
      font-size: 9pt;
      color: #333;
    }

    .swatch-info .mono {
      font-size: 7pt;
      font-family: 'SF Mono', 'Fira Code', monospace;
      color: #888;
    }

    /* Typography showcase */
    .type-sample {
      margin-bottom: 16pt;
      padding: 12pt 16pt;
      background: #fafafa;
      border-radius: 8pt;
      border: 0.5pt solid #eee;
    }

    .type-sample .font-name {
      font-size: 9pt;
      font-weight: 700;
      color: ${primary};
      text-transform: uppercase;
      letter-spacing: 0.1em;
      margin-bottom: 6pt;
    }

    .type-sample .font-preview {
      font-size: 22pt;
      font-weight: 700;
      color: #1a1a1a;
      line-height: 1.2;
    }

    .type-sample .font-meta {
      font-size: 8pt;
      color: #999;
      margin-top: 6pt;
    }

    /* Two column layout */
    .two-col {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20pt;
    }

    /* Do/Don't */
    .do-dont {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12pt;
    }

    .do-list, .dont-list {
      padding: 12pt;
      border-radius: 8pt;
      font-size: 9pt;
    }

    .do-list {
      background: #f0fdf4;
      border: 0.5pt solid #bbf7d0;
    }

    .dont-list {
      background: #fef2f2;
      border: 0.5pt solid #fecaca;
    }

    .do-list h4 { color: #16a34a; }
    .dont-list h4 { color: #dc2626; }

    .do-list li, .dont-list li {
      margin-left: 14pt;
      margin-top: 4pt;
      line-height: 1.5;
      color: #555;
    }

    /* Footer */
    .page-footer {
      position: absolute;
      bottom: 12mm;
      left: 25mm;
      right: 25mm;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 7pt;
      color: #ccc;
      border-top: 0.5pt solid #eee;
      padding-top: 8pt;
    }

    /* Applications */
    .app-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12pt;
    }

    .app-card {
      padding: 12pt;
      background: #fafafa;
      border-radius: 8pt;
      border: 0.5pt solid #eee;
    }

    .app-card h4 {
      font-size: 10pt;
      font-weight: 700;
      color: #333;
      margin-bottom: 4pt;
    }

    .app-card p {
      font-size: 8pt;
      color: #777;
      line-height: 1.5;
    }

    @media print {
      body { background: white; }
      .page { box-shadow: none; }
      .no-print { display: none !important; }
    }

    @media screen {
      body { background: #e5e5e5; }
      .page {
        margin: 20px auto;
        box-shadow: 0 4px 20px rgba(0,0,0,0.1);
        background: white;
      }
    }
  </style>
</head>
<body>
  <!-- COVER -->
  <div class="page cover">
    <div class="color-strip">
      ${[...data.colors.primary, ...data.colors.secondary].slice(0, 6).map((c) =>
        `<div class="color-dot" style="background: ${c.hex}"></div>`
      ).join("")}
    </div>
    <h1>${data.brandName}</h1>
    ${data.verbalIdentity?.tagline ? `<p class="tagline">${data.verbalIdentity.tagline}</p>` : ""}
    <p class="badge">Manual de Identidade Visual · ${data.industry} · ${new Date().getFullYear()}</p>
  </div>

  <!-- DNA / BRAND CONCEPT -->
  <div class="page">
    <div class="section-subtitle">01 — Estratégia</div>
    <h2 class="section-header">DNA da Marca</h2>
    <div class="section-divider"></div>

    <div class="two-col">
      <div>
        <div class="content-block">
          <h3>Propósito</h3>
          <p>${data.brandConcept.purpose}</p>
        </div>
        <div class="content-block">
          <h3>Missão</h3>
          <p>${data.brandConcept.mission}</p>
        </div>
        <div class="content-block">
          <h3>Visão</h3>
          <p>${data.brandConcept.vision}</p>
        </div>
      </div>
      <div>
        <div class="content-block">
          <h3>Tom de Voz</h3>
          <p>${data.brandConcept.toneOfVoice}</p>
        </div>
        ${data.brandConcept.brandArchetype ? `<div class="content-block"><h3>Arquétipo</h3><p>${data.brandConcept.brandArchetype}</p></div>` : ""}
        <div class="content-block">
          <h3>Valores</h3>
          <div class="tag-list">
            ${data.brandConcept.values.map((v) => `<span class="tag">${v}</span>`).join("")}
          </div>
        </div>
        <div class="content-block">
          <h3>Personalidade</h3>
          <div class="tag-list">
            ${data.brandConcept.personality.map((p) => `<span class="tag">${p}</span>`).join("")}
          </div>
        </div>
      </div>
    </div>

    <div class="page-footer">
      <span>${data.brandName} · Manual de Identidade</span>
      <span>Confidencial</span>
    </div>
  </div>

  ${data.brandStory ? `
  <!-- BRAND STORY -->
  <div class="page">
    <div class="section-subtitle">02 — Narrativa</div>
    <h2 class="section-header">Brand Story</h2>
    <div class="section-divider"></div>

    <div class="content-block">
      <h3>Manifesto</h3>
      <p style="font-size: 12pt; line-height: 1.8; font-style: italic; color: #333;">${data.brandStory.manifesto}</p>
    </div>

    <div class="two-col" style="margin-top: 20pt;">
      <div class="content-block">
        <h3>Promessa da Marca</h3>
        <p>${data.brandStory.brandPromise}</p>
      </div>
      <div class="content-block">
        <h3>História de Origem</h3>
        <p>${data.brandStory.originStory}</p>
      </div>
    </div>

    <div class="page-footer">
      <span>${data.brandName} · Manual de Identidade</span>
      <span>Confidencial</span>
    </div>
  </div>` : ""}

  <!-- COLORS -->
  <div class="page">
    <div class="section-subtitle">03 — Identidade Visual</div>
    <h2 class="section-header">Paleta de Cores</h2>
    <div class="section-divider"></div>

    <h3 style="margin-bottom: 12pt; font-size: 10pt; color: #999; text-transform: uppercase; letter-spacing: 0.1em;">Cores Primárias</h3>
    <div class="color-grid">
      ${data.colors.primary.map(colorSwatch).join("")}
    </div>

    <h3 style="margin-top: 24pt; margin-bottom: 12pt; font-size: 10pt; color: #999; text-transform: uppercase; letter-spacing: 0.1em;">Cores Secundárias</h3>
    <div class="color-grid">
      ${data.colors.secondary.map(colorSwatch).join("")}
    </div>

    <div class="page-footer">
      <span>${data.brandName} · Manual de Identidade</span>
      <span>Confidencial</span>
    </div>
  </div>

  <!-- TYPOGRAPHY -->
  <div class="page">
    <div class="section-subtitle">04 — Tipografia</div>
    <h2 class="section-header">Sistema Tipográfico</h2>
    <div class="section-divider"></div>

    ${data.typography?.marketing ? `
    <div class="type-sample">
      <div class="font-name">Display · Marketing</div>
      <div class="font-preview" style="font-family: '${data.typography.marketing.name}', sans-serif;">
        ${data.brandName}
      </div>
      <div class="font-meta">
        ${data.typography.marketing.name} · ${data.typography.marketing.weights?.join(", ") ?? "Regular"} · ${data.typography.marketing.usage}
      </div>
    </div>` : ""}

    ${data.typography?.primary ? `
    <div class="type-sample">
      <div class="font-name">Primária</div>
      <div class="font-preview" style="font-family: '${data.typography.primary.name}', sans-serif;">
        ${data.brandName}
      </div>
      <div class="font-meta">
        ${data.typography.primary.name} · ${data.typography.primary.weights?.join(", ") ?? "Regular"} · ${data.typography.primary.usage}
      </div>
    </div>` : ""}

    ${data.typography?.ui ? `
    <div class="type-sample">
      <div class="font-name">Interface · UI</div>
      <div class="font-preview" style="font-family: '${data.typography.ui.name}', sans-serif; font-size: 16pt;">
        A interface reflete o compromisso com clareza e funcionalidade.
      </div>
      <div class="font-meta">
        ${data.typography.ui.name} · ${data.typography.ui.weights?.join(", ") ?? "Regular"} · ${data.typography.ui.usage}
      </div>
    </div>` : ""}

    ${data.typography?.secondary ? `
    <div class="type-sample">
      <div class="font-name">Secundária</div>
      <div class="font-preview" style="font-family: '${data.typography.secondary.name}', sans-serif; font-size: 16pt;">
        Textos complementares e corpo de conteúdo.
      </div>
      <div class="font-meta">
        ${data.typography.secondary.name} · ${data.typography.secondary.weights?.join(", ") ?? "Regular"} · ${data.typography.secondary.usage}
      </div>
    </div>` : ""}

    <div class="page-footer">
      <span>${data.brandName} · Manual de Identidade</span>
      <span>Confidencial</span>
    </div>
  </div>

  ${data.verbalIdentity ? `
  <!-- VERBAL IDENTITY -->
  <div class="page">
    <div class="section-subtitle">05 — Linguagem</div>
    <h2 class="section-header">Identidade Verbal</h2>
    <div class="section-divider"></div>

    <div class="two-col">
      <div>
        <div class="content-block">
          <h3>Tagline</h3>
          <p style="font-size: 16pt; font-weight: 700; color: ${primary}; font-family: '${displayFont}', sans-serif;">"${data.verbalIdentity.tagline}"</p>
        </div>
        <div class="content-block">
          <h3>One-Liner</h3>
          <p>${data.verbalIdentity.oneLiner}</p>
        </div>
        <div class="content-block">
          <h3>Traços de Voz</h3>
          <div class="tag-list">
            ${data.verbalIdentity.brandVoiceTraits.map((t) => `<span class="tag">${t}</span>`).join("")}
          </div>
        </div>
      </div>
      <div>
        <div class="content-block">
          <h3>Headlines de Exemplo</h3>
          ${data.verbalIdentity.sampleHeadlines.map((h) => `<p style="font-style: italic; margin-bottom: 4pt;">"${h}"</p>`).join("")}
        </div>
        <div class="content-block">
          <h3>CTAs de Exemplo</h3>
          <div class="tag-list">
            ${data.verbalIdentity.sampleCTAs.map((c) => `<span class="tag">${c}</span>`).join("")}
          </div>
        </div>
      </div>
    </div>

    <div class="do-dont" style="margin-top: 16pt;">
      <div class="do-list">
        <h4 style="font-size: 9pt; font-weight: 700; margin-bottom: 6pt;">✓ Vocabulário Preferido</h4>
        <ul>
          ${data.verbalIdentity.vocabulary.preferred.map((w) => `<li>${w}</li>`).join("")}
        </ul>
      </div>
      <div class="dont-list">
        <h4 style="font-size: 9pt; font-weight: 700; margin-bottom: 6pt;">✕ Vocabulário a Evitar</h4>
        <ul>
          ${data.verbalIdentity.vocabulary.avoid.map((w) => `<li>${w}</li>`).join("")}
        </ul>
      </div>
    </div>

    <div class="page-footer">
      <span>${data.brandName} · Manual de Identidade</span>
      <span>Confidencial</span>
    </div>
  </div>` : ""}

  <!-- APPLICATIONS -->
  <div class="page">
    <div class="section-subtitle">06 — Aplicações</div>
    <h2 class="section-header">Aplicações da Marca</h2>
    <div class="section-divider"></div>

    <div class="app-grid">
      ${data.applications.slice(0, 8).map((app) => `
        <div class="app-card">
          <h4>${app.type}</h4>
          <p>${app.description}</p>
          ${app.dimensions ? `<p style="margin-top: 4pt; font-size: 7pt; color: #aaa;">${app.dimensions}</p>` : ""}
        </div>
      `).join("")}
    </div>

    <div class="page-footer">
      <span>${data.brandName} · Manual de Identidade</span>
      <span>Confidencial</span>
    </div>
  </div>

  <!-- Print button (screen only) -->
  <div class="no-print" style="position: fixed; bottom: 20px; right: 20px; z-index: 100;">
    <button onclick="window.print()" style="
      padding: 12px 24px;
      background: ${primary};
      color: white;
      border: none;
      border-radius: 12px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      font-family: system-ui;
    ">
      Exportar PDF
    </button>
  </div>
</body>
</html>`;
}
