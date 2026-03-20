"use client"

import { useState, useEffect, useCallback } from "react"

// ---- Types ----

interface WorkspaceMemberUser {
  id: string
  name: string | null
  email: string
  image: string | null
}

interface WorkspaceMember {
  id: string
  workspaceId: string
  userId: string
  role: "owner" | "admin" | "editor" | "viewer"
  createdAt: string
  user: WorkspaceMemberUser
}

interface Workspace {
  id: string
  name: string
  slug: string
  plan: string
  logoUrl: string | null
  primaryColor: string | null
  customDomain: string | null
  members: WorkspaceMember[]
}

const ROLE_LABELS: Record<string, string> = {
  owner: "Proprietario",
  admin: "Administrador",
  editor: "Editor",
  viewer: "Visualizador",
}

const ROLE_COLORS: Record<string, string> = {
  owner: "bg-violet-100 text-violet-700",
  admin: "bg-blue-100 text-blue-700",
  editor: "bg-emerald-100 text-emerald-700",
  viewer: "bg-gray-100 text-gray-600",
}

export default function WorkspacePage() {
  const [workspace, setWorkspace] = useState<Workspace | null>(null)
  const [userRole, setUserRole] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  // Create workspace form
  const [createName, setCreateName] = useState("")
  const [creating, setCreating] = useState(false)

  // Settings form
  const [settingsName, setSettingsName] = useState("")
  const [settingsLogo, setSettingsLogo] = useState("")
  const [settingsColor, setSettingsColor] = useState("")
  const [settingsDomain, setSettingsDomain] = useState("")
  const [savingSettings, setSavingSettings] = useState(false)

  // Invite form
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteRole, setInviteRole] = useState<"admin" | "editor" | "viewer">("editor")
  const [inviting, setInviting] = useState(false)

  // Removing member
  const [removingId, setRemovingId] = useState<string | null>(null)

  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const fetchWorkspace = useCallback(async () => {
    try {
      const res = await fetch("/api/workspace")
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setWorkspace(data.workspace)
      setUserRole(data.role || "")
      if (data.workspace) {
        setSettingsName(data.workspace.name)
        setSettingsLogo(data.workspace.logoUrl || "")
        setSettingsColor(data.workspace.primaryColor || "")
        setSettingsDomain(data.workspace.customDomain || "")
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro ao carregar workspace")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchWorkspace()
  }, [fetchWorkspace])

  function showMessage(type: "success" | "error", text: string) {
    setMessage({ type, text })
    setTimeout(() => setMessage(null), 4000)
  }

  async function handleCreate() {
    if (!createName.trim()) return
    setCreating(true)
    try {
      const res = await fetch("/api/workspace", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: createName.trim() }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setWorkspace(data.workspace)
      setUserRole("owner")
      setSettingsName(data.workspace.name)
      setCreateName("")
      showMessage("success", "Workspace criado com sucesso!")
    } catch (err: unknown) {
      showMessage("error", err instanceof Error ? err.message : "Erro ao criar workspace")
    } finally {
      setCreating(false)
    }
  }

  async function handleSaveSettings() {
    if (!workspace) return
    setSavingSettings(true)
    try {
      const res = await fetch("/api/workspace", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspaceId: workspace.id,
          name: settingsName,
          logoUrl: settingsLogo,
          primaryColor: settingsColor,
          customDomain: settingsDomain,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setWorkspace(data.workspace)
      showMessage("success", "Configuracoes salvas!")
    } catch (err: unknown) {
      showMessage("error", err instanceof Error ? err.message : "Erro ao salvar")
    } finally {
      setSavingSettings(false)
    }
  }

  async function handleInvite() {
    if (!workspace || !inviteEmail.trim()) return
    setInviting(true)
    try {
      const res = await fetch("/api/workspace/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspaceId: workspace.id,
          email: inviteEmail.trim(),
          role: inviteRole,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      // Refresh workspace to show new member
      await fetchWorkspace()
      setInviteEmail("")
      showMessage("success", "Membro convidado com sucesso!")
    } catch (err: unknown) {
      showMessage("error", err instanceof Error ? err.message : "Erro ao convidar")
    } finally {
      setInviting(false)
    }
  }

  async function handleRemoveMember(memberId: string) {
    if (!workspace) return
    if (!confirm("Tem certeza que deseja remover este membro?")) return
    setRemovingId(memberId)
    try {
      const res = await fetch("/api/workspace/members", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspaceId: workspace.id,
          memberId,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      await fetchWorkspace()
      showMessage("success", "Membro removido.")
    } catch (err: unknown) {
      showMessage("error", err instanceof Error ? err.message : "Erro ao remover")
    } finally {
      setRemovingId(null)
    }
  }

  const isAdmin = userRole === "owner" || userRole === "admin"

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto animate-pulse">
        <div className="mb-8">
          <div className="h-8 w-40 bg-gray-200 rounded-lg mb-2" />
          <div className="h-4 w-64 bg-gray-100 rounded-lg" />
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm mb-6">
          <div className="h-5 w-32 bg-gray-200 rounded mb-4" />
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="h-10 bg-gray-100 rounded-xl" />
            <div className="h-10 bg-gray-100 rounded-xl" />
          </div>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="h-5 w-28 bg-gray-200 rounded mb-4" />
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gray-200" />
                <div className="flex-1">
                  <div className="h-4 w-32 bg-gray-200 rounded mb-1" />
                  <div className="h-3 w-48 bg-gray-100 rounded" />
                </div>
                <div className="h-6 w-20 bg-gray-100 rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error && !workspace) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    )
  }

  // No workspace yet -- show create form
  if (!workspace) {
    return (
      <div className="max-w-xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Workspace</h1>
          <p className="text-gray-500 mt-1">Crie um workspace para colaborar com sua equipe.</p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center">
              <svg className="w-5 h-5 text-violet-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 0h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Z" />
              </svg>
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-900">Criar Workspace</h2>
              <p className="text-sm text-gray-500">Requer plano Team ou superior.</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome do workspace</label>
              <input
                type="text"
                value={createName}
                onChange={(e) => setCreateName(e.target.value)}
                placeholder="Ex: Minha Agencia"
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none"
              />
            </div>
            <button
              onClick={handleCreate}
              disabled={creating || !createName.trim()}
              className="w-full rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-700 transition-colors disabled:opacity-50"
            >
              {creating ? "Criando..." : "Criar Workspace"}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Message banner */}
      {message && (
        <div
          className={`mb-6 rounded-2xl border px-6 py-4 shadow-sm ${
            message.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-red-200 bg-red-50 text-red-800"
          }`}
        >
          <p className="text-sm font-medium">{message.text}</p>
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Workspace</h1>
        <p className="text-gray-500 mt-1">
          {workspace.name} &middot; <span className="capitalize">{workspace.plan}</span>
        </p>
      </div>

      {/* Settings */}
      {isAdmin && (
        <div className="mb-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Configuracoes</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
              <input
                type="text"
                value={settingsName}
                onChange={(e) => setSettingsName(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Logo URL</label>
              <input
                type="url"
                value={settingsLogo}
                onChange={(e) => setSettingsLogo(e.target.value)}
                placeholder="https://..."
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cor primaria</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={settingsColor || "#7c3aed"}
                  onChange={(e) => setSettingsColor(e.target.value)}
                  className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer"
                />
                <input
                  type="text"
                  value={settingsColor}
                  onChange={(e) => setSettingsColor(e.target.value)}
                  placeholder="#7c3aed"
                  className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Dominio personalizado</label>
              <input
                type="text"
                value={settingsDomain}
                onChange={(e) => setSettingsDomain(e.target.value)}
                placeholder="brand.suaempresa.com"
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none"
              />
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <button
              onClick={handleSaveSettings}
              disabled={savingSettings}
              className="rounded-xl bg-gray-900 px-5 py-2 text-sm font-semibold text-white hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              {savingSettings ? "Salvando..." : "Salvar configuracoes"}
            </button>
          </div>
        </div>
      )}

      {/* Members */}
      <div className="mb-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-gray-900">
            Membros ({workspace.members.length})
          </h2>
        </div>

        {/* Member list */}
        <div className="divide-y divide-gray-100">
          {workspace.members.map((member) => (
            <div key={member.id} className="flex items-center gap-3 py-3">
              {/* Avatar */}
              {member.user.image ? (
                <img
                  src={member.user.image}
                  alt=""
                  className="w-9 h-9 rounded-full ring-2 ring-gray-100"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-gray-900 flex items-center justify-center text-xs font-bold text-white">
                  {member.user.name?.[0]?.toUpperCase() ?? member.user.email[0]?.toUpperCase()}
                </div>
              )}

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {member.user.name || member.user.email}
                </p>
                <p className="text-xs text-gray-400 truncate">{member.user.email}</p>
              </div>

              {/* Role badge */}
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                  ROLE_COLORS[member.role] || ROLE_COLORS.viewer
                }`}
              >
                {ROLE_LABELS[member.role] || member.role}
              </span>

              {/* Remove button */}
              {isAdmin && member.role !== "owner" && (
                <button
                  onClick={() => handleRemoveMember(member.id)}
                  disabled={removingId === member.id}
                  className="text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50 p-1"
                  title="Remover membro"
                >
                  {removingId === member.id ? (
                    <span className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin block" />
                  ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                    </svg>
                  )}
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Invite form */}
        {isAdmin && (
          <div className="mt-6 pt-6 border-t border-gray-100">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Convidar membro</h3>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="email@exemplo.com"
                className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none"
              />
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value as "admin" | "editor" | "viewer")}
                className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none bg-white"
              >
                <option value="admin">Administrador</option>
                <option value="editor">Editor</option>
                <option value="viewer">Visualizador</option>
              </select>
              <button
                onClick={handleInvite}
                disabled={inviting || !inviteEmail.trim()}
                className="rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-violet-700 transition-colors disabled:opacity-50 whitespace-nowrap"
              >
                {inviting ? "Convidando..." : "Convidar"}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* White-label preview */}
      {(settingsLogo || settingsColor) && (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Preview White-label</h2>
          <div
            className="rounded-xl border border-gray-100 p-6"
            style={{ borderLeftWidth: 4, borderLeftColor: settingsColor || "#7c3aed" }}
          >
            <div className="flex items-center gap-3">
              {settingsLogo ? (
                <img
                  src={settingsLogo}
                  alt="Logo"
                  className="w-10 h-10 rounded-lg object-contain"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }}
                />
              ) : (
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-sm font-bold"
                  style={{ backgroundColor: settingsColor || "#7c3aed" }}
                >
                  {workspace.name[0]?.toUpperCase()}
                </div>
              )}
              <div>
                <p className="font-semibold text-gray-900">{settingsName || workspace.name}</p>
                {settingsDomain && (
                  <p className="text-xs text-gray-400">{settingsDomain}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
