import { BrandbookData, ProductionManifest, ProductionColorSpec } from "./types";

function hexToRgbValues(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex.trim());
  return result
    ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) }
    : null;
}

function rgbToHsl(r: number, g: number, b: number): string {
  const nr = r / 255, ng = g / 255, nb = b / 255;
  const max = Math.max(nr, ng, nb), min = Math.min(nr, ng, nb);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === nr) h = ((ng - nb) / d + (ng < nb ? 6 : 0)) / 6;
    else if (max === ng) h = ((nb - nr) / d + 2) / 6;
    else h = ((nr - ng) / d + 4) / 6;
  }
  return `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;
}

function toVarName(name: string): string {
  return name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

export function generateProductionManifest(data: BrandbookData): ProductionManifest {
  const now = new Date().toISOString();

  const allColors = [
    ...data.colors.primary.map((c) => ({ ...c, role: "primary" })),
    ...data.colors.secondary.map((c) => ({ ...c, role: "secondary" })),
    ...(data.colors.semantic
      ? [
          { ...data.colors.semantic.success, role: "semantic-success" },
          { ...data.colors.semantic.error, role: "semantic-error" },
          { ...data.colors.semantic.warning, role: "semantic-warning" },
          { ...data.colors.semantic.info, role: "semantic-info" },
        ]
      : []),
    ...(data.colors.dataViz ?? []).map((c) => ({ ...c, role: "dataviz" })),
  ];

  const colorSpecs: ProductionColorSpec[] = allColors.map((c) => {
    const rgb = hexToRgbValues(c.hex);
    const hsl = rgb ? rgbToHsl(rgb.r, rgb.g, rgb.b) : "";
    const varName = toVarName(c.name);
    return {
      role: c.role,
      name: c.name,
      hex: c.hex,
      rgb: c.rgb || (rgb ? `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})` : ""),
      cmyk: c.cmyk || "",
      hsl,
      cssVar: `--color-${varName}`,
      scssVar: `$color-${varName}`,
    };
  });

  const fontPairs = [
    { role: "marketing", font: data.typography.marketing },
    { role: "ui", font: data.typography.ui },
    { role: "mono", font: data.typography.monospace },
    { role: "primary", font: data.typography.primary },
    { role: "secondary", font: data.typography.secondary },
  ].filter((p): p is { role: string; font: NonNullable<typeof p.font> } => Boolean(p.font));

  const colorCssVars = colorSpecs.map((c) => `  ${c.cssVar}: ${c.hex};`).join("\n");
  const fontCssVars = fontPairs
    .map((p) => `  --font-${p.role}: '${p.font.name}', sans-serif;`)
    .join("\n");

  let tokensCssVars = "";
  if (data.designTokens) {
    const sv = data.designTokens.spacing.map((s, i) => `  --space-${i + 1}: ${s};`).join("\n");
    const rv = data.designTokens.borderRadii.map((r, i) => `  --radius-${i + 1}: ${r};`).join("\n");
    tokensCssVars = `\n${sv}\n${rv}`;
  }

  const cssVariables = `:root {\n  /* === Colors === */\n${colorCssVars}\n\n  /* === Typography === */\n${fontCssVars}${tokensCssVars}\n}`;

  const colorScssVars = colorSpecs.map((c) => `${c.scssVar}: ${c.hex};`).join("\n");
  const fontScssVars = fontPairs
    .map((p) => `$font-${p.role}: '${p.font.name}', sans-serif;`)
    .join("\n");
  const scssVariables = `// ===== ${data.brandName} Design System =====\n\n// Colors\n${colorScssVars}\n\n// Typography\n${fontScssVars}`;

  const uniqueFonts = [...new Set(fontPairs.map((p) => p.font.name))];
  const googleFontsUrl = `https://fonts.googleapis.com/css2?${uniqueFonts
    .map((f) => `family=${f.replace(/ /g, "+")}:wght@300;400;500;600;700;800`)
    .join("&")}&display=swap`;

  const tailwindExtend: Record<string, unknown> = {
    colors: Object.fromEntries(colorSpecs.map((c) => [toVarName(c.name), c.hex])),
    fontFamily: Object.fromEntries(
      fontPairs.map((p) => [p.role, [`'${p.font.name}'`, "sans-serif"]])
    ),
  };

  if (data.designTokens) {
    tailwindExtend.spacing = Object.fromEntries(
      data.designTokens.spacing.map((s, i) => [`brand-${i + 1}`, s])
    );
    tailwindExtend.borderRadius = Object.fromEntries(
      data.designTokens.borderRadii.map((r, i) => [`brand-${i + 1}`, r])
    );
  }

  const tokenJson: Record<string, unknown> = {
    colors: Object.fromEntries(colorSpecs.map((c) => [c.cssVar.replace("--", ""), c.hex])),
    fonts: Object.fromEntries(fontPairs.map((p) => [`font-${p.role}`, p.font.name])),
    ...(data.designTokens
      ? {
          spacing: Object.fromEntries(data.designTokens.spacing.map((s, i) => [`space-${i + 1}`, s])),
          borderRadius: Object.fromEntries(
            data.designTokens.borderRadii.map((r, i) => [`radius-${i + 1}`, r])
          ),
        }
      : {}),
  };

  const print = [
    { name: "Cartão de Visitas (Frente)", type: "print" as const, dimensions: "85 × 55 mm", format: "PDF/X-1a · AI · EPS", colorProfile: "CMYK", resolution: "300 dpi", bleed: "3 mm", notes: "Fontes convertidas em curvas. Margem de segurança interna 3mm." },
    { name: "Cartão de Visitas (Verso)", type: "print" as const, dimensions: "85 × 55 mm", format: "PDF/X-1a · AI", colorProfile: "CMYK", resolution: "300 dpi", bleed: "3 mm", notes: "Versão com dados de contato e QR code opcional." },
    { name: "Papel Timbrado A4", type: "print" as const, dimensions: "210 × 297 mm", format: "PDF/X-1a · INDD", colorProfile: "CMYK", resolution: "300 dpi", bleed: "3 mm", notes: "Versão editável Word/Google Docs. Campos dinâmicos para dados." },
    { name: "Envelope Carta (DL)", type: "print" as const, dimensions: "220 × 110 mm", format: "PDF/X-1a", colorProfile: "CMYK", resolution: "300 dpi", bleed: "3 mm", notes: "Endereço de retorno no verso. Logo no canto superior esquerdo." },
    { name: "Envelope Ofício (C4)", type: "print" as const, dimensions: "229 × 324 mm", format: "PDF/X-1a", colorProfile: "CMYK", resolution: "300 dpi", bleed: "3 mm", notes: "Para folha A4 dobrada." },
    { name: "Pasta Corporativa", type: "print" as const, dimensions: "310 × 240 mm (aberto: 620 × 240 mm)", format: "AI · PDF/X-1a", colorProfile: "CMYK + Pantone Spot", resolution: "300 dpi", bleed: "5 mm", notes: "Considere acabamentos: verniz UV, hot stamping." },
    { name: "Bloco de Anotações", type: "print" as const, dimensions: "148 × 210 mm (A5)", format: "PDF/X-1a", colorProfile: "CMYK", resolution: "300 dpi", bleed: "3 mm", notes: "Capa e contracapa. Miolo com header/rodapé de marca." },
    { name: "Banner/Roll-up", type: "print" as const, dimensions: "800 × 2000 mm", format: "PDF · AI", colorProfile: "CMYK", resolution: "150 dpi", bleed: "10 mm", notes: "Área de rolamento inferior: 100mm. Salvo em baixo DPI por tamanho." },
  ];

  const digital = [
    { name: "Favicon (multi-size)", type: "digital" as const, dimensions: "16×16 · 32×32 · 48×48 · 180×180 px", format: "ICO · PNG", colorProfile: "sRGB", notes: "Versão símbolo/ícone do logo. Testado em fundo claro e escuro." },
    { name: "Logo SVG (otimizado)", type: "digital" as const, dimensions: "Vetorial", format: "SVG", colorProfile: "sRGB", notes: "Camadas nomeadas, sem texto (outlined), comprimido com SVGO." },
    { name: "Logo PNG Transparente", type: "digital" as const, dimensions: "500 · 1000 · 2000 px (quadrado)", format: "PNG-24", colorProfile: "sRGB", notes: "Sem fundo. Margem interna 5% para respiração." },
    { name: "Logo PNG Fundo Branco", type: "digital" as const, dimensions: "500 · 1000 px", format: "PNG · JPG", colorProfile: "sRGB", notes: "Para plataformas que não suportam transparência." },
    { name: "Logo Negativo (branco)", type: "digital" as const, dimensions: "500 · 1000 px", format: "PNG-24 · SVG", colorProfile: "sRGB", notes: "Versão branca para fundos escuros e coloridos da marca." },
    { name: "App Icon (iOS/Android)", type: "digital" as const, dimensions: "1024×1024 px", format: "PNG", colorProfile: "sRGB", notes: "Sem cantos arredondados (o OS aplica). Cores vivas, reconhecível em 60px." },
    { name: "OG Image (Open Graph)", type: "digital" as const, dimensions: "1200 × 630 px", format: "JPG · PNG", colorProfile: "sRGB", notes: "Para compartilhamento em redes sociais e WhatsApp. Max 8MB." },
    { name: "Email Signature Banner", type: "digital" as const, dimensions: "600 × 150 px", format: "PNG · JPG", colorProfile: "sRGB", notes: "Max 100KB. Hospedado em URL pública (CDN). Link clicável." },
  ];

  const social = [
    { name: "Foto de Perfil Universal", type: "social" as const, dimensions: "1080 × 1080 px", format: "PNG · JPG", colorProfile: "sRGB", notes: "Área segura central: 800×800px. Testado em circulo e quadrado." },
    { name: "Cover Facebook", type: "social" as const, dimensions: "1640 × 624 px", format: "JPG · PNG", colorProfile: "sRGB", notes: "Área segura excluindo lados: 640×624px. Sem texto nas bordas." },
    { name: "Cover LinkedIn", type: "social" as const, dimensions: "1584 × 396 px", format: "JPG · PNG", colorProfile: "sRGB", notes: "Área segura central. Texto evitado nas extremidades." },
    { name: "Cover Twitter/X", type: "social" as const, dimensions: "1500 × 500 px", format: "JPG · PNG", colorProfile: "sRGB", notes: "Área segura: 1263×421px (exclui foto de perfil sobrepostos)." },
    { name: "Post Quadrado (Instagram/LinkedIn)", type: "social" as const, dimensions: "1080 × 1080 px", format: "PNG · JPG · MP4", colorProfile: "sRGB", notes: "Template editável (Figma/Canva). Versão com e sem texto." },
    { name: "Stories / Reels (Vertical)", type: "social" as const, dimensions: "1080 × 1920 px", format: "PNG · JPG · MP4", colorProfile: "sRGB", notes: "Área segura: evitar 250px topo e 325px base (botões UI). " },
    { name: "Post Horizontal (LinkedIn Feed / Twitter)", type: "social" as const, dimensions: "1200 × 628 px", format: "JPG · PNG", colorProfile: "sRGB", notes: "Ideal para artigos e links compartilhados." },
    { name: "YouTube Thumbnail", type: "social" as const, dimensions: "1280 × 720 px", format: "JPG", colorProfile: "sRGB", notes: "Min 2MB. Legível em miniatura 120×68px. Texto grande e contrastante." },
    { name: "YouTube Channel Art", type: "social" as const, dimensions: "2560 × 1440 px", format: "JPG · PNG", colorProfile: "sRGB", notes: "Área segura (visível em todos devices): 1546 × 423 px centralizado." },
    { name: "Pinterest Pin", type: "social" as const, dimensions: "1000 × 1500 px", format: "JPG · PNG", colorProfile: "sRGB", notes: "Proporção 2:3. Título e marca no rodapé. CTA visível." },
  ];

  const email = [
    { name: "Template E-mail Marketing", type: "email" as const, dimensions: "600 px (largura fixa)", format: "HTML + CSS inline", colorProfile: "sRGB", notes: "Inline CSS obrigatório. Testado Outlook 2016/2019, Gmail, Apple Mail, iOS." },
    { name: "Header Banner E-mail", type: "email" as const, dimensions: "600 × 200 px", format: "JPG · PNG", colorProfile: "sRGB", notes: "Max 150KB. Alt text descritivo para leitores que bloqueiam imagens." },
    { name: "Assinatura de E-mail HTML", type: "email" as const, dimensions: "600 × 120 px (total)", format: "HTML + PNG", colorProfile: "sRGB", notes: "Logo hospedado em CDN. Links para LinkedIn, site e telefone. Sem tabela aninhada." },
    { name: "Newsletter Header", type: "email" as const, dimensions: "600 × 180 px", format: "PNG · JPG", colorProfile: "sRGB", notes: "Inclui logo + nome da newsletter + tagline. Versão dark mode." },
  ];

  return {
    meta: { brandName: data.brandName, industry: data.industry, generatedAt: now, version: "1.0.0" },
    brandIdentity: data,
    colorSystem: { colors: colorSpecs, cssVariables, scssVariables: scssVariables },
    typographySystem: {
      googleFontsUrl,
      cssVariables: `:root {\n${fontCssVars}\n}`,
      scssVariables: fontScssVars,
    },
    designTokens: { css: cssVariables, scss: scssVariables, tailwindExtend, json: tokenJson },
    logoProductionSpecs: {
      requiredFormats: [
        "SVG (vetorial web — obrigatório)",
        "AI (Adobe Illustrator — master)",
        "EPS (impressão — compatibilidade)",
        "PDF (uso universal)",
        "PNG 2000×2000px transparente (digital)",
        "PNG 500×500px transparente (social/thumbnail)",
        "JPG 1000×1000px fundo branco (plataformas sem transparência)",
      ],
      colorVersions: [
        "Full Color — fundo branco",
        "Full Color — fundo colorido primário",
        "Monocromático preto — usos especiais",
        "Monocromático branco (negativo) — fundos escuros",
      ],
      minimumSize: data.logo.minimumSize || "24px digital / 8mm impresso",
      clearSpace: data.logo.clearSpace || "Espaço equivalente a 1x altura do logo em todos os lados",
      incorrectUsages: data.logo.incorrectUsages || [],
    },
    assets: { print, digital, social, email },
  };
}
