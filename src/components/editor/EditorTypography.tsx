"use client";

import { TypographyEditor, type EditorTabProps } from "./EditorFields";

export function EditorTypography({ data, onPatch }: EditorTabProps) {
  return (
    <>
      {(["marketing", "ui", "monospace", "primary", "secondary"] as const).map((key) => (
        data.typography[key] !== undefined && (
          <TypographyEditor
            key={key}
            label={key === "marketing" ? "Marketing / Display" : key === "ui" ? "UI / Interface" : key === "monospace" ? "Monospace / Codigo" : key === "primary" ? "Primaria" : "Secundaria"}
            value={data.typography[key]}
            onChange={(t) => onPatch({ typography: { ...data.typography, [key]: t } })}
          />
        )
      ))}
    </>
  );
}
