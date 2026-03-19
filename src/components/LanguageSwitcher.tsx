"use client"

import { useState } from "react"

const LOCALES = [
  { code: "pt-BR", label: "PT" },
  { code: "en", label: "EN" },
]

export function LanguageSwitcher() {
  const [locale, setLocale] = useState(() => {
    if (typeof window === "undefined") return "pt-BR"
    return localStorage.getItem("bb_locale") ?? "pt-BR"
  })

  function switchLocale(code: string) {
    setLocale(code)
    localStorage.setItem("bb_locale", code)
    // Store preference. Full i18n wiring requires next-intl middleware.
    window.location.reload()
  }

  return (
    <div className="flex items-center gap-1">
      {LOCALES.map((l) => (
        <button
          key={l.code}
          onClick={() => switchLocale(l.code)}
          className={`px-2 py-1 rounded-md text-[10px] font-bold transition-colors ${
            locale === l.code
              ? "bg-gray-900 text-white"
              : "text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          }`}
          title={l.code}
        >
          {l.label}
        </button>
      ))}
    </div>
  )
}
