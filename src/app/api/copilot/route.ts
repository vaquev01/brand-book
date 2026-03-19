import { NextRequest } from "next/server"
import OpenAI from "openai"
import { GoogleGenAI } from "@google/genai"
import { withGoogleTextModelFallback } from "@/lib/googleTextFallback"

export const runtime = "nodejs"

interface CopilotRequest {
  message: string
  brandbook: Record<string, unknown>
  section?: string
  openaiKey?: string
  googleKey?: string
  provider?: "openai" | "gemini"
  openaiModel?: string
  googleModel?: string
}

const SYSTEM_PROMPT = `Voce e um Co-piloto de Brand Design de elite. O usuario te enviara um brandbook completo em JSON e uma instrucao em linguagem natural.

Voce deve:
1. Entender a intencao do usuario
2. Explicar brevemente o que sera mudado (em portugues, 2-3 frases)
3. Retornar as mudancas no brandbook

Sua resposta DEVE ser um JSON valido com esta estrutura:
{
  "explanation": "Explicacao curta do que foi alterado e por que",
  "changes": { /* partial BrandbookData — SOMENTE os campos que mudaram */ }
}

Regras:
- Em "changes", inclua SOMENTE os campos modificados, com a estrutura completa daquele campo
- Se o usuario pedir algo sobre cores, inclua o objeto "colors" completo com a mudanca
- Se pedir sobre tipografia, inclua "typography" completo
- Se pedir sobre tom de voz, inclua "brandConcept" e/ou "verbalIdentity"
- Mantenha coerencia com o restante da marca
- Responda SEMPRE em portugues
- Retorne SOMENTE o JSON, sem markdown, sem texto extra`

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as CopilotRequest

    const { message, brandbook, section, provider = "openai" } = body

    if (!message || !brandbook) {
      return new Response(JSON.stringify({ error: "message e brandbook sao obrigatorios." }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    const sectionContext = section ? `\nFoco na secao: ${section}` : ""

    const userPrompt = `Brandbook atual (JSON):
${JSON.stringify(brandbook, null, 2)}

Instrucao do usuario: "${message}"${sectionContext}

Retorne SOMENTE o JSON com "explanation" e "changes".`

    // Stream the response
    const encoder = new TextEncoder()

    if (provider === "gemini") {
      const apiKey = body.googleKey?.trim() || process.env.GOOGLE_API_KEY
      if (!apiKey) {
        return new Response(JSON.stringify({ error: "GOOGLE_API_KEY nao configurada." }), {
          status: 500,
          headers: { "Content-Type": "application/json" },
        })
      }

      const ai = new GoogleGenAI({ apiKey })

      const { value: resp } = await withGoogleTextModelFallback({
        apiKey,
        preferredModel: body.googleModel,
        run: (model) =>
          ai.models.generateContent({
            model,
            contents: userPrompt,
            config: {
              systemInstruction: SYSTEM_PROMPT,
              responseMimeType: "application/json",
              temperature: 0.7,
              maxOutputTokens: 8192,
            },
          }),
      })

      const text = resp.text ?? ""

      // For Gemini, return as a streamed response chunk by chunk
      const stream = new ReadableStream({
        start(controller) {
          const chunkSize = 80
          let offset = 0
          function pushNext() {
            if (offset >= text.length) {
              controller.close()
              return
            }
            const chunk = text.slice(offset, offset + chunkSize)
            controller.enqueue(encoder.encode(chunk))
            offset += chunkSize
            setTimeout(pushNext, 10)
          }
          pushNext()
        },
      })

      return new Response(stream, {
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Transfer-Encoding": "chunked",
          "Cache-Control": "no-cache",
        },
      })
    }

    // OpenAI streaming
    const apiKey = body.openaiKey?.trim() || process.env.OPENAI_API_KEY
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "OPENAI_API_KEY nao configurada." }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      })
    }

    const openai = new OpenAI({ apiKey })

    const completion = await openai.chat.completions.create({
      model: body.openaiModel?.trim() || "gpt-4o",
      temperature: 0.7,
      max_tokens: 8192,
      stream: true,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
    })

    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of completion) {
            const content = chunk.choices[0]?.delta?.content
            if (content) {
              controller.enqueue(encoder.encode(content))
            }
          }
          controller.close()
        } catch (err) {
          controller.error(err)
        }
      },
    })

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
        "Cache-Control": "no-cache",
      },
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erro desconhecido"
    console.error("[copilot] Error:", message)
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
