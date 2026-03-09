import { getRequestConfig } from "next-intl/server"
import { cookies } from "next/headers"

const SUPPORTED_LOCALES = ["pt-BR", "en"] as const
type SupportedLocale = (typeof SUPPORTED_LOCALES)[number]

function isSupportedLocale(locale: string | undefined): locale is SupportedLocale {
  return SUPPORTED_LOCALES.includes(locale as SupportedLocale)
}

export default getRequestConfig(async ({ requestLocale }) => {
  // Prefer the segment-based locale (from middleware / [locale] route segment)
  const segmentLocale = await requestLocale

  // Fall back to cookie preference, then default
  const cookieStore = await cookies()
  const cookieLocale = cookieStore.get("locale")?.value

  const raw = segmentLocale ?? cookieLocale
  const locale: SupportedLocale = isSupportedLocale(raw) ? raw : "pt-BR"

  const messages =
    locale === "en"
      ? (await import("./en.json")).default
      : (await import("./pt-BR.json")).default

  return {
    locale,
    messages,
  }
})
