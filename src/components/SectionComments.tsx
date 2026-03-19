"use client"

import { useState, useEffect, useCallback } from "react"
import { AnimatePresence, motion } from "framer-motion"

interface Comment {
  id: string
  text: string
  section: string | null
  status: "open" | "resolved"
  createdAt: string
  user: { name: string | null; image?: string | null }
}

interface Props {
  shareToken: string
  section: string
  sectionLabel: string
}

export function SectionComments({ shareToken, section, sectionLabel }: Props) {
  const [open, setOpen] = useState(false)
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(false)
  const [newComment, setNewComment] = useState("")
  const [authorName, setAuthorName] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [identified, setIdentified] = useState(false)

  // Persist author name in sessionStorage
  useEffect(() => {
    const saved = sessionStorage.getItem("bb-comment-author")
    if (saved) {
      setAuthorName(saved)
      setIdentified(true)
    }
  }, [])

  const fetchComments = useCallback(async () => {
    if (!shareToken) return
    setLoading(true)
    try {
      const res = await fetch(`/api/comments?shareToken=${encodeURIComponent(shareToken)}&section=${encodeURIComponent(section)}`)
      if (res.ok) {
        const data = await res.json()
        setComments(data.data ?? [])
      }
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }, [shareToken, section])

  useEffect(() => {
    if (open) fetchComments()
  }, [open, fetchComments])

  function handleIdentify() {
    if (!authorName.trim()) return
    sessionStorage.setItem("bb-comment-author", authorName.trim())
    setIdentified(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!newComment.trim() || submitting || !authorName.trim()) return
    setSubmitting(true)
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shareToken,
          section,
          text: newComment.trim(),
          authorName: authorName.trim(),
        }),
      })
      if (res.ok) {
        setNewComment("")
        fetchComments()
      }
    } catch {
      // silent
    } finally {
      setSubmitting(false)
    }
  }

  const openCount = comments.filter(c => c.status === "open").length

  return (
    <div className="relative inline-block">
      {/* Comment trigger button */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          setOpen(!open)
        }}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
          open
            ? "bg-violet-100 text-violet-700 shadow-sm"
            : openCount > 0
              ? "bg-amber-50 text-amber-600 hover:bg-amber-100"
              : "bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
        }`}
        title={`Comentarios em ${sectionLabel}`}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>
        </svg>
        {openCount > 0 && <span>{openCount}</span>}
      </button>

      {/* Comments panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl border border-gray-200 shadow-xl z-50 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
              <span className="text-xs font-bold text-gray-700 truncate mr-2">{sectionLabel}</span>
              <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600 flex-shrink-0">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </div>

            {/* Comments list */}
            <div className="max-h-64 overflow-y-auto p-3 space-y-3">
              {loading && (
                <div className="text-center py-4">
                  <div className="w-5 h-5 border-2 border-gray-200 border-t-violet-500 rounded-full animate-spin mx-auto" />
                </div>
              )}
              {!loading && comments.length === 0 && (
                <p className="text-xs text-gray-400 text-center py-4">
                  Nenhum comentario nesta secao
                </p>
              )}
              {comments.map((comment) => (
                <div key={comment.id} className="flex gap-2">
                  <div className="w-6 h-6 rounded-full bg-violet-100 flex items-center justify-center shrink-0">
                    {comment.user.image ? (
                      <img src={comment.user.image} alt="" className="w-6 h-6 rounded-full" />
                    ) : (
                      <span className="text-[9px] font-bold text-violet-600">
                        {comment.user.name?.[0]?.toUpperCase() ?? "?"}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-semibold text-gray-700">{comment.user.name ?? "Anonimo"}</span>
                      <span className="text-[9px] text-gray-300">
                        {new Date(comment.createdAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">{comment.text}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Identify or comment form */}
            {!identified ? (
              <div className="p-3 border-t border-gray-100">
                <p className="text-[10px] text-gray-400 mb-2">Identifique-se para comentar:</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    placeholder="Seu nome"
                    className="flex-1 text-xs px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-violet-200 focus:border-violet-300"
                    onKeyDown={(e) => e.key === "Enter" && handleIdentify()}
                  />
                  <button
                    onClick={handleIdentify}
                    disabled={!authorName.trim()}
                    className="px-3 py-2 rounded-lg text-xs font-semibold text-white bg-violet-600 hover:bg-violet-700 disabled:opacity-40 transition-colors"
                  >
                    OK
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-3 border-t border-gray-100">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Adicionar comentario..."
                    className="flex-1 text-xs px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-violet-200 focus:border-violet-300"
                  />
                  <button
                    type="submit"
                    disabled={!newComment.trim() || submitting}
                    className="px-3 py-2 rounded-lg text-xs font-semibold text-white bg-violet-600 hover:bg-violet-700 disabled:opacity-40 transition-colors"
                  >
                    {submitting ? "..." : "Enviar"}
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
