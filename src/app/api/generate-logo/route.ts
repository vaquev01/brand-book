import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import type { BrandbookData } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const { brandbook, style, openaiKey } = await request.json() as {
      brandbook: BrandbookData;
      style?: string;
      openaiKey?: string;
    };

    if (!brandbook) {
      return NextResponse.json({ error: "brandbook é obrigatório." }, { status: 400 });
    }

    const apiKey = openaiKey?.trim() || process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "OPENAI_API_KEY não configurada." }, { status: 500 });
    }

    const primaryColor = brandbook.colors?.primary?.[0]?.hex ?? "#000000";
    const secondaryColor = brandbook.colors?.primary?.[1]?.hex ?? brandbook.colors?.secondary?.[0]?.hex ?? "#ffffff";
    const logoPrimary = brandbook.logo?.primary ?? "";
    const logoSymbol = brandbook.logo?.symbol ?? "";
    const personality = brandbook.brandConcept?.personality?.join(", ") ?? "";
    const keywords = brandbook.brandConcept?.uniqueValueProposition ?? brandbook.brandConcept?.purpose ?? "";
    const marketingFont = brandbook.typography?.marketing?.name ?? "sans-serif";
    const industry = brandbook.industry ?? "";
    const brandName = brandbook.brandName ?? "";

    const styleGuide = style || "moderno e minimalista";

    const prompt = [
      `Professional logo design for "${brandName}", a ${industry} brand.`,
      `Brand personality: ${personality}.`,
      logoPrimary ? `Logo primary variant: ${logoPrimary}.` : "",
      logoSymbol ? `Logo symbol: ${logoSymbol}.` : "",
      `Primary color: ${primaryColor}, accent: ${secondaryColor}.`,
      `Typography style: ${marketingFont}.`,
      keywords ? `Brand essence: ${keywords}.` : "",
      `Design style: ${styleGuide}.`,
      "Clean white or transparent background.",
      "Professional vector-quality logo mark.",
      "Show logomark and wordmark together.",
      "Single centered composition.",
      "No people, no photographs, graphic design only.",
    ].filter(Boolean).join(" ");

    const openai = new OpenAI({ apiKey });

    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt,
      n: 1,
      size: "1024x1024",
      quality: "hd",
      response_format: "url",
    });

    const imageUrl = response.data?.[0]?.url;
    if (!imageUrl) {
      return NextResponse.json({ error: "DALL-E não retornou imagem." }, { status: 500 });
    }

    return NextResponse.json({ url: imageUrl, prompt });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
