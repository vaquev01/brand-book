"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="pt-BR">
      <body style={{ fontFamily: "system-ui, sans-serif", padding: "2rem", background: "#fafafa" }}>
        <h2 style={{ color: "#c00", marginBottom: "1rem" }}>Erro na aplicação</h2>
        <pre style={{ background: "#fee", padding: "1rem", borderRadius: "8px", overflow: "auto", fontSize: "13px", whiteSpace: "pre-wrap" }}>
          {error?.message || "Erro desconhecido"}
          {"\n\n"}
          {error?.stack || ""}
        </pre>
        {error?.digest && (
          <p style={{ color: "#666", marginTop: "0.5rem", fontSize: "12px" }}>Digest: {error.digest}</p>
        )}
        <button
          onClick={reset}
          style={{ marginTop: "1rem", padding: "0.5rem 1rem", cursor: "pointer" }}
        >
          Tentar novamente
        </button>
      </body>
    </html>
  );
}
