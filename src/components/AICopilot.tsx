"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { MessageCircle, X, Send, Sparkles, Check, Loader2 } from "lucide-react"
import type { BrandbookData, AiTextProvider } from "@/lib/types"
import type { ApiKeys } from "./ApiKeyConfig"

// ---- Types ----

interface CopilotMessage {
  id: string
  role: "user" | "assistant"
  content: string
  changes?: Partial<BrandbookData>
  applied?: boolean
}

interface CopilotResponse {
  explanation: string
  changes: Partial<BrandbookData>
}

interface AICopilotProps {
  brandbook: BrandbookData
  apiKeys: ApiKeys
  strategyProvider: AiTextProvider
  onApplyChanges: (changes: Partial<BrandbookData>) => void
}

// ---- Suggestions ----

const QUICK_SUGGESTIONS = [
  "Torne o tom mais premium",
  "Mude as cores para tons mais quentes",
  "Refine a tagline",
  "Torne a tipografia mais moderna",
  "Adicione mais personalidade ao tom de voz",
  "Fortaleca o posicionamento competitivo",
]

// ---- Component ----

export function AICopilot({ brandbook, apiKeys, strategyProvider, onApplyChanges }: AICopilotProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<CopilotMessage[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [streamText, setStreamText] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, streamText, scrollToBottom])

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  function generateId() {
    return `msg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
  }

  async function handleSend(text?: string) {
    const messageText = text || input.trim()
    if (!messageText || loading) return

    setInput("")

    const userMsg: CopilotMessage = {
      id: generateId(),
      role: "user",
      content: messageText,
    }

    setMessages((prev) => [...prev, userMsg])
    setLoading(true)
    setStreamText("")

    try {
      const res = await fetch("/api/copilot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: messageText,
          brandbook,
          provider: strategyProvider,
          openaiKey: apiKeys.openai || undefined,
          googleKey: apiKeys.google || undefined,
          openaiModel: strategyProvider === "openai" ? apiKeys.openaiTextModel || undefined : undefined,
          googleModel: strategyProvider === "gemini" ? apiKeys.googleTextModel || undefined : undefined,
        }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Erro ao processar")
      }

      // Read stream
      const reader = res.body?.getReader()
      if (!reader) throw new Error("No response body")

      const decoder = new TextDecoder()
      let fullText = ""

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        fullText += chunk
        setStreamText(fullText)
      }

      // Parse the complete response
      let parsed: CopilotResponse
      try {
        parsed = JSON.parse(fullText) as CopilotResponse
      } catch {
        // Try to extract JSON from the text
        const jsonMatch = fullText.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          parsed = JSON.parse(jsonMatch[0]) as CopilotResponse
        } else {
          throw new Error("Resposta da IA nao e um JSON valido")
        }
      }

      const assistantMsg: CopilotMessage = {
        id: generateId(),
        role: "assistant",
        content: parsed.explanation || "Mudancas prontas para aplicar.",
        changes: parsed.changes,
        applied: false,
      }

      setMessages((prev) => [...prev, assistantMsg])
      setStreamText("")
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "Erro desconhecido"
      const errorAssistantMsg: CopilotMessage = {
        id: generateId(),
        role: "assistant",
        content: `Erro: ${errMsg}`,
      }
      setMessages((prev) => [...prev, errorAssistantMsg])
      setStreamText("")
    } finally {
      setLoading(false)
    }
  }

  function handleApplyChanges(msgId: string) {
    const msg = messages.find((m) => m.id === msgId)
    if (!msg?.changes) return

    onApplyChanges(msg.changes)

    setMessages((prev) =>
      prev.map((m) => (m.id === msgId ? { ...m, applied: true } : m))
    )
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <>
      {/* Floating button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-violet-600 text-white shadow-lg shadow-violet-200 transition-all hover:bg-violet-700 hover:scale-105 active:scale-95"
          title="AI Co-pilot"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      )}

      {/* Slide-over panel */}
      {isOpen && (
        <div className="fixed inset-y-0 right-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />

          {/* Panel */}
          <div className="relative ml-auto flex h-full w-full max-w-md flex-col bg-white shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-100">
                  <Sparkles className="w-4 h-4 text-violet-600" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-gray-900">AI Co-pilot</h2>
                  <p className="text-[11px] text-gray-400">Refine seu brandbook com linguagem natural</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
              {messages.length === 0 && !loading && (
                <div className="space-y-4">
                  <div className="rounded-xl bg-violet-50 p-4">
                    <p className="text-sm text-violet-800 font-medium mb-1">
                      Ola! Sou seu co-piloto de marca.
                    </p>
                    <p className="text-xs text-violet-600">
                      Me diga o que quer mudar no brandbook e eu vou sugerir as alteracoes. Voce decide se aplica ou nao.
                    </p>
                  </div>

                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-2">
                      Sugestoes rapidas
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {QUICK_SUGGESTIONS.map((s) => (
                        <button
                          key={s}
                          onClick={() => handleSend(s)}
                          className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-600 transition-colors hover:border-violet-300 hover:bg-violet-50 hover:text-violet-700"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                      msg.role === "user"
                        ? "bg-violet-600 text-white"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>

                    {/* Apply changes button */}
                    {msg.role === "assistant" && msg.changes && (
                      <div className="mt-3 pt-3 border-t border-gray-200/50">
                        {msg.applied ? (
                          <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
                            <Check className="w-3.5 h-3.5" />
                            Mudancas aplicadas
                          </div>
                        ) : (
                          <button
                            onClick={() => handleApplyChanges(msg.id)}
                            className="flex items-center gap-1.5 rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-violet-700"
                          >
                            <Sparkles className="w-3 h-3" />
                            Aplicar mudancas
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Streaming indicator */}
              {loading && (
                <div className="flex justify-start">
                  <div className="max-w-[85%] rounded-2xl bg-gray-100 px-4 py-3">
                    {streamText ? (
                      <p className="text-sm text-gray-600 whitespace-pre-wrap">
                        {(() => {
                          try {
                            const partial = JSON.parse(streamText) as CopilotResponse
                            return partial.explanation || "Processando..."
                          } catch {
                            // Show a thinking indicator while JSON is being streamed
                            return (
                              <span className="flex items-center gap-2 text-gray-500">
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                Pensando...
                              </span>
                            )
                          }
                        })()}
                      </p>
                    ) : (
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Analisando seu brandbook...
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="border-t border-gray-100 px-5 py-4">
              <div className="flex items-end gap-2">
                <div className="flex-1 relative">
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Descreva a mudanca..."
                    rows={1}
                    disabled={loading}
                    className="w-full resize-none rounded-xl border border-gray-200 px-4 py-3 pr-12 text-sm outline-none transition-colors focus:border-violet-500 focus:ring-1 focus:ring-violet-500 disabled:opacity-50 disabled:bg-gray-50"
                    style={{ minHeight: "44px", maxHeight: "120px" }}
                    onInput={(e) => {
                      const target = e.target as HTMLTextAreaElement
                      target.style.height = "auto"
                      target.style.height = Math.min(target.scrollHeight, 120) + "px"
                    }}
                  />
                </div>
                <button
                  onClick={() => handleSend()}
                  disabled={loading || !input.trim()}
                  className="flex h-[44px] w-[44px] flex-shrink-0 items-center justify-center rounded-xl bg-violet-600 text-white transition-colors hover:bg-violet-700 disabled:opacity-40 disabled:hover:bg-violet-600"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
              <p className="mt-2 text-[10px] text-gray-400 text-center">
                Shift+Enter para nova linha. Enter para enviar.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
