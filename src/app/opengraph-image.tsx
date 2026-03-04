import { ImageResponse } from "next/og";

export const runtime = "edge";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #111827 0%, #4f46e5 55%, #22c55e 100%)",
          color: "white",
          fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial",
          padding: 72,
        }}
      >
        <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ fontSize: 64, fontWeight: 900, letterSpacing: -1 }}>Brandbook Builder</div>
          <div style={{ fontSize: 26, opacity: 0.92, maxWidth: 900, lineHeight: 1.25 }}>
            Gere manuais de marca completos e profissionais para qualquer tipo de negócio usando IA.
          </div>
          <div style={{ marginTop: 20, display: "flex", gap: 10, alignItems: "center" }}>
            <div style={{ background: "rgba(255,255,255,0.16)", padding: "10px 14px", borderRadius: 14, fontSize: 18, fontWeight: 700 }}>
              Next.js
            </div>
            <div style={{ background: "rgba(255,255,255,0.16)", padding: "10px 14px", borderRadius: 14, fontSize: 18, fontWeight: 700 }}>
              Design Tokens
            </div>
            <div style={{ background: "rgba(255,255,255,0.16)", padding: "10px 14px", borderRadius: 14, fontSize: 18, fontWeight: 700 }}>
              PDF + ZIP Export
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
