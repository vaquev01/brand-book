import { ImageResponse } from "next/og"
import { prisma } from "@/lib/prisma"

export const runtime = "nodejs"
export const alt = "Brandbook"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default async function Image({ params }: { params: Promise<{ token: string }> | { token: string } }) {
  const { token } = await Promise.resolve(params)

  let brandName = "Brandbook"
  let industry = ""
  let tagline = ""
  let colors: string[] = ["#6366f1", "#8b5cf6", "#a78bfa", "#c4b5fd", "#ede9fe"]

  try {
    const shareLink = await prisma.shareLink.findUnique({
      where: { token },
      include: {
        project: {
          include: {
            brandbookVersions: { orderBy: { createdAt: "desc" }, take: 1 },
          },
        },
      },
    })

    if (shareLink?.project) {
      brandName = shareLink.project.name
      const bb = shareLink.project.brandbookVersions[0]?.brandbookJson as any
      if (bb) {
        industry = bb.industry ?? ""
        tagline = bb.verbalIdentity?.tagline ?? bb.brandConcept?.mission ?? ""
        const primaryColors = (bb.colors?.primary ?? []).map((c: any) => c.hex).filter(Boolean)
        const secondaryColors = (bb.colors?.secondary ?? []).map((c: any) => c.hex).filter(Boolean)
        if (primaryColors.length > 0 || secondaryColors.length > 0) {
          colors = [...primaryColors, ...secondaryColors].slice(0, 6)
        }
      }
    }
  } catch {
    // Fall through with defaults
  }

  const primaryColor = colors[0] ?? "#6366f1"
  const accentColor = colors[1] ?? "#8b5cf6"

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          background: `linear-gradient(135deg, ${primaryColor} 0%, #0a0a0a 50%, ${accentColor} 100%)`,
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* Color palette strip */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "40px" }}>
          {colors.slice(0, 5).map((c, i) => (
            <div
              key={i}
              style={{
                width: "24px",
                height: "24px",
                borderRadius: "50%",
                background: c,
                border: "2px solid rgba(255,255,255,0.2)",
              }}
            />
          ))}
        </div>

        {/* Brand name */}
        <div
          style={{
            fontSize: "72px",
            fontWeight: 900,
            color: "#ffffff",
            letterSpacing: "-0.03em",
            lineHeight: 1,
            textAlign: "center",
            maxWidth: "900px",
          }}
        >
          {brandName}
        </div>

        {/* Tagline */}
        {tagline && (
          <div
            style={{
              fontSize: "24px",
              color: "rgba(255,255,255,0.5)",
              marginTop: "16px",
              textAlign: "center",
              maxWidth: "700px",
            }}
          >
            {tagline}
          </div>
        )}

        {/* Industry + attribution */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginTop: "40px",
          }}
        >
          {industry && (
            <div
              style={{
                fontSize: "14px",
                fontWeight: 700,
                color: "rgba(255,255,255,0.3)",
                textTransform: "uppercase",
                letterSpacing: "0.15em",
                padding: "6px 16px",
                borderRadius: "100px",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              {industry}
            </div>
          )}
          <div
            style={{
              fontSize: "14px",
              fontWeight: 700,
              color: "rgba(255,255,255,0.25)",
              textTransform: "uppercase",
              letterSpacing: "0.15em",
            }}
          >
            Brand Identity
          </div>
        </div>

        {/* Watermark */}
        <div
          style={{
            position: "absolute",
            bottom: "24px",
            right: "32px",
            fontSize: "12px",
            fontWeight: 600,
            color: "rgba(255,255,255,0.15)",
          }}
        >
          brandbook.app
        </div>
      </div>
    ),
    { ...size }
  )
}
