"use client";

import { useState, useEffect, useCallback } from "react";

interface Comment {
  id: string;
  section?: string | null;
  text: string;
  status: "open" | "resolved";
  createdAt: string;
  user: { name: string | null; image: string | null };
}

interface SectionApproval {
  status: string;
  approver: string;
  feedback?: string;
  date: string;
}

interface ApprovalData {
  versionId: string;
  versionNumber: number;
  projectName: string;
  sectionApprovals: Record<string, SectionApproval>;
  comments: Comment[];
  overallStatus: string;
}

interface Props {
  shareToken: string;
  sections: string[];
  sectionLabels: Record<string, string>;
}

const STATUS_CONFIG = {
  approved: { label: "Aprovado", color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200", icon: "✓" },
  rejected: { label: "Rejeitado", color: "text-red-600", bg: "bg-red-50", border: "border-red-200", icon: "✕" },
  needs_changes: { label: "Precisa de Ajustes", color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200", icon: "⟳" },
  pending: { label: "Pendente", color: "text-gray-400", bg: "bg-gray-50", border: "border-gray-200", icon: "○" },
} as const;

const OVERALL_STATUS = {
  approved: { label: "Aprovado", color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-300" },
  rejected: { label: "Rejeitado", color: "text-red-700", bg: "bg-red-50", border: "border-red-300" },
  needs_changes: { label: "Ajustes Solicitados", color: "text-amber-700", bg: "bg-amber-50", border: "border-amber-300" },
  in_review: { label: "Em Revisão", color: "text-blue-700", bg: "bg-blue-50", border: "border-blue-300" },
  pending: { label: "Aguardando Revisão", color: "text-gray-500", bg: "bg-gray-50", border: "border-gray-200" },
} as const;

export function ClientPortal({ shareToken, sections, sectionLabels }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [approvalData, setApprovalData] = useState<ApprovalData | null>(null);
  const [loading, setLoading] = useState(false);
  const [approverName, setApproverName] = useState("");
  const [approverEmail, setApproverEmail] = useState("");
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [feedbackText, setFeedbackText] = useState("");
  const [commentText, setCommentText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [identified, setIdentified] = useState(false);

  const fetchApprovalData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/approval?shareToken=${shareToken}`);
      if (res.ok) {
        const json = await res.json();
        setApprovalData(json.data);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [shareToken]);

  useEffect(() => {
    if (isOpen && !approvalData) {
      fetchApprovalData();
    }
  }, [isOpen, approvalData, fetchApprovalData]);

  async function submitApproval(section: string, status: "approved" | "rejected" | "needs_changes") {
    if (!approverName.trim()) return;
    setSubmitting(true);
    try {
      await fetch("/api/approval", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shareToken,
          section,
          status,
          approverName: approverName.trim(),
          approverEmail: approverEmail.trim() || undefined,
          feedback: feedbackText.trim() || undefined,
        }),
      });
      setFeedbackText("");
      setActiveSection(null);
      await fetchApprovalData();
    } catch {
      // silent
    } finally {
      setSubmitting(false);
    }
  }

  async function submitComment() {
    if (!approverName.trim() || !commentText.trim() || !approvalData) return;
    setSubmitting(true);
    try {
      await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          versionId: approvalData.versionId,
          text: commentText.trim(),
          authorName: approverName.trim(),
          authorEmail: approverEmail.trim() || undefined,
          shareToken,
        }),
      });
      setCommentText("");
      await fetchApprovalData();
    } catch {
      // silent
    } finally {
      setSubmitting(false);
    }
  }

  const approvedCount = approvalData
    ? Object.values(approvalData.sectionApprovals).filter((a) => a.status === "approved").length
    : 0;
  const totalSections = sections.length;
  const progress = totalSections > 0 ? Math.round((approvedCount / totalSections) * 100) : 0;

  const overall = (approvalData?.overallStatus ?? "pending") as keyof typeof OVERALL_STATUS;
  const overallConfig = OVERALL_STATUS[overall] ?? OVERALL_STATUS.pending;

  return (
    <>
      {/* Floating review button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-5 py-3 rounded-2xl bg-gray-900 text-white shadow-2xl shadow-gray-900/30 hover:bg-gray-800 transition-all duration-200 hover:-translate-y-0.5 group"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
        </svg>
        <span className="text-[13px] font-semibold">Revisar & Aprovar</span>
        {approvedCount > 0 && (
          <span className="text-[10px] font-bold bg-emerald-500 text-white px-1.5 py-0.5 rounded-full">
            {approvedCount}/{totalSections}
          </span>
        )}
      </button>

      {/* Review panel slide-over */}
      {isOpen && (
        <div className="fixed inset-0 z-[60]">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setIsOpen(false)} />

          {/* Panel */}
          <div className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="px-6 py-5 border-b border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-bold text-gray-900">Revisão do Brandbook</h2>
                <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6 6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Overall status */}
              <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border ${overallConfig.bg} ${overallConfig.border}`}>
                <span className={`text-[11px] font-bold ${overallConfig.color}`}>{overallConfig.label}</span>
              </div>

              {/* Progress bar */}
              {totalSections > 0 && (
                <div className="mt-3">
                  <div className="flex items-center justify-between text-[11px] text-gray-400 mb-1.5">
                    <span>Progresso de aprovação</span>
                    <span className="font-bold">{progress}%</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Identification (if not set) */}
            {!identified && (
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-100">
                <p className="text-[12px] text-gray-500 mb-3 font-medium">Identifique-se para revisar:</p>
                <div className="space-y-2">
                  <input
                    type="text"
                    value={approverName}
                    onChange={(e) => setApproverName(e.target.value)}
                    placeholder="Seu nome"
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900/10"
                  />
                  <input
                    type="email"
                    value={approverEmail}
                    onChange={(e) => setApproverEmail(e.target.value)}
                    placeholder="Seu e-mail (opcional)"
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900/10"
                  />
                  <button
                    onClick={() => approverName.trim() && setIdentified(true)}
                    disabled={!approverName.trim()}
                    className="w-full px-4 py-2 text-sm font-semibold bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-40"
                  >
                    Continuar
                  </button>
                </div>
              </div>
            )}

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="w-6 h-6 border-2 border-gray-200 border-t-gray-900 rounded-full animate-spin" />
                </div>
              ) : identified ? (
                <div className="divide-y divide-gray-50">
                  {/* Section approval cards */}
                  <div className="px-6 py-4">
                    <h3 className="text-[11px] font-bold uppercase tracking-[0.15em] text-gray-300 mb-3">Seções</h3>
                    <div className="space-y-2">
                      {sections.map((sectionId) => {
                        const approval = approvalData?.sectionApprovals[sectionId];
                        const statusKey = (approval?.status ?? "pending") as keyof typeof STATUS_CONFIG;
                        const config = STATUS_CONFIG[statusKey] ?? STATUS_CONFIG.pending;
                        const isActive = activeSection === sectionId;

                        return (
                          <div key={sectionId} className={`rounded-xl border transition-all ${isActive ? "border-gray-300 shadow-sm" : "border-gray-100"}`}>
                            <button
                              onClick={() => setActiveSection(isActive ? null : sectionId)}
                              className="w-full flex items-center justify-between px-4 py-3 text-left"
                            >
                              <div className="flex items-center gap-3">
                                <span className={`text-sm font-bold ${config.color}`}>{config.icon}</span>
                                <span className="text-[13px] font-medium text-gray-700">
                                  {sectionLabels[sectionId] ?? sectionId}
                                </span>
                              </div>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${config.bg} ${config.color} ${config.border} border`}>
                                {config.label}
                              </span>
                            </button>

                            {isActive && (
                              <div className="px-4 pb-4 space-y-3">
                                {approval?.feedback && (
                                  <div className="text-[12px] text-gray-500 bg-gray-50 rounded-lg p-3">
                                    <span className="font-semibold text-gray-600">{approval.approver}:</span> {approval.feedback}
                                  </div>
                                )}

                                <textarea
                                  value={feedbackText}
                                  onChange={(e) => setFeedbackText(e.target.value)}
                                  placeholder="Feedback (opcional)..."
                                  rows={2}
                                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-gray-900/10"
                                />

                                <div className="flex gap-2">
                                  <button
                                    onClick={() => submitApproval(sectionId, "approved")}
                                    disabled={submitting}
                                    className="flex-1 px-3 py-2 text-[12px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl hover:bg-emerald-100 transition-colors disabled:opacity-40"
                                  >
                                    ✓ Aprovar
                                  </button>
                                  <button
                                    onClick={() => submitApproval(sectionId, "needs_changes")}
                                    disabled={submitting}
                                    className="flex-1 px-3 py-2 text-[12px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 rounded-xl hover:bg-amber-100 transition-colors disabled:opacity-40"
                                  >
                                    ⟳ Ajustes
                                  </button>
                                  <button
                                    onClick={() => submitApproval(sectionId, "rejected")}
                                    disabled={submitting}
                                    className="flex-1 px-3 py-2 text-[12px] font-semibold bg-red-50 text-red-700 border border-red-200 rounded-xl hover:bg-red-100 transition-colors disabled:opacity-40"
                                  >
                                    ✕ Rejeitar
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Comments section */}
                  <div className="px-6 py-4">
                    <h3 className="text-[11px] font-bold uppercase tracking-[0.15em] text-gray-300 mb-3">Comentários Gerais</h3>

                    {/* Comment list */}
                    {approvalData?.comments && approvalData.comments.length > 0 && (
                      <div className="space-y-3 mb-4">
                        {approvalData.comments.map((comment) => (
                          <div key={comment.id} className="bg-gray-50 rounded-xl p-3">
                            <div className="flex items-center gap-2 mb-1.5">
                              {comment.user.image ? (
                                <img src={comment.user.image} alt="" className="w-5 h-5 rounded-full" />
                              ) : (
                                <div className="w-5 h-5 rounded-full bg-gray-300 flex items-center justify-center text-[8px] font-bold text-white">
                                  {comment.user.name?.[0]?.toUpperCase() ?? "?"}
                                </div>
                              )}
                              <span className="text-[12px] font-semibold text-gray-700">{comment.user.name ?? "Anônimo"}</span>
                              <span className="text-[10px] text-gray-300">
                                {new Date(comment.createdAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
                              </span>
                            </div>
                            <p className="text-[13px] text-gray-600 leading-relaxed">{comment.text}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* New comment */}
                    <div className="flex gap-2">
                      <textarea
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder="Escreva um comentário..."
                        rows={2}
                        className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-gray-900/10"
                      />
                      <button
                        onClick={submitComment}
                        disabled={submitting || !commentText.trim()}
                        className="px-4 py-2 text-sm font-semibold bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-40 self-end"
                      >
                        Enviar
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center py-20 text-sm text-gray-400">
                  Identifique-se acima para começar a revisão
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
