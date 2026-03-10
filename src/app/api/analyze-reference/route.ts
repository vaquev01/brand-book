import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import OpenAI from "openai";

export const runtime = "nodejs";

/**
 * POST /api/analyze-reference
 *
 * Analyzes a reference image using vision (Gemini or OpenAI) and returns
 * a structured description that can be injected into the image generation
 * prompt. This ensures ALL providers (DALL-E, Stability, Ideogram, Imagen)
 * benefit from reference image understanding — not just Imagen.
 *
 * Input:  { imageDataUrl: string, appType?: string, appDescription?: string, provider: "google" | "openai", googleKey?: string, openaiKey?: string }
 * Output: { analysis: string }
 */

const VISION_SYSTEM = `You are a visual analysis expert for brand design applications.
Analyze the reference image and return a STRUCTURED description that an image generation AI can use to replicate the subject and style.

Your response must include ALL of the following (be specific, not vague):

1. SUBJECT: What is the main object/product/item shown? (e.g., "açaí bowl in a branded paper pot with purple lid", "kraft paper shopping bag with handles")
2. SHAPE & FORM: Exact shape, proportions, structure (e.g., "round 16oz paper bowl, slightly tapered, flat lid with pull tab")
3. MATERIALS: What materials are visible? (e.g., "matte kraft cardboard, glossy lid, waxed interior")
4. COLORS: Exact colors visible (e.g., "deep purple lid #6B2D8B, kraft brown body, white interior")
5. BRANDING: Any visible logos, patterns, typography, or design elements (e.g., "centered white logo on lid, wave pattern on body, sans-serif typography")
6. PHOTOGRAPHY: Camera angle, lighting, background, depth of field (e.g., "45° overhead shot, soft natural light from left, white marble surface, shallow DOF")
7. MOOD: Overall aesthetic and feeling (e.g., "premium artisanal, clean, instagram-worthy")
8. CONTEXT: Any environmental elements, props, or styling (e.g., "granola topping visible, wooden spoon, tropical leaves as props")

Format: Return as a single paragraph, no bullet points, no markdown. Be concise but precise. Max 300 words.
Start directly with the description, no preamble.`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      imageDataUrl,
      appType,
      appDescription,
      provider,
      googleKey,
      openaiKey,
    } = body as {
      imageDataUrl: string;
      appType?: string;
      appDescription?: string;
      provider: "google" | "openai";
      googleKey?: string;
      openaiKey?: string;
    };

    if (!imageDataUrl || !provider) {
      return NextResponse.json(
        { error: "imageDataUrl and provider are required" },
        { status: 400 }
      );
    }

    const contextHint = [appType, appDescription].filter(Boolean).join(" — ");
    const userPrompt = contextHint
      ? `Analyze this reference image. The user wants to create: "${contextHint}". Describe what you see so an image generator can replicate it with their brand identity applied.`
      : `Analyze this reference image for brand application design. Describe everything an image generator needs to replicate this.`;

    if (provider === "google") {
      const apiKey = googleKey?.trim() || process.env.GOOGLE_API_KEY;
      if (!apiKey) {
        return NextResponse.json({ error: "Google API key required" }, { status: 400 });
      }

      const ai = new GoogleGenAI({ apiKey });
      const match = imageDataUrl.match(/^data:(image\/[a-z+]+);base64,(.+)$/);
      if (!match) {
        return NextResponse.json({ error: "Invalid image data URL" }, { status: 400 });
      }

      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: [
          { text: VISION_SYSTEM + "\n\n" + userPrompt },
          { inlineData: { mimeType: match[1], data: match[2] } },
        ],
      });

      const text = response.candidates?.[0]?.content?.parts
        ?.map((p) => p.text)
        .filter(Boolean)
        .join(" ")
        ?.trim();

      if (!text) {
        return NextResponse.json({ error: "Vision model returned no analysis" }, { status: 500 });
      }

      return NextResponse.json({ analysis: text });
    }

    if (provider === "openai") {
      const apiKey = openaiKey?.trim() || process.env.OPENAI_API_KEY;
      if (!apiKey) {
        return NextResponse.json({ error: "OpenAI API key required" }, { status: 400 });
      }

      const openai = new OpenAI({ apiKey });
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: VISION_SYSTEM },
          {
            role: "user",
            content: [
              { type: "text", text: userPrompt },
              { type: "image_url", image_url: { url: imageDataUrl } },
            ],
          },
        ],
        max_tokens: 500,
        temperature: 0.3,
      });

      const text = response.choices[0]?.message?.content?.trim();
      if (!text) {
        return NextResponse.json({ error: "Vision model returned no analysis" }, { status: 500 });
      }

      return NextResponse.json({ analysis: text });
    }

    return NextResponse.json({ error: "Invalid provider" }, { status: 400 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
