"use client";

import { Color } from "@/lib/types";
import { ColorEditor, type EditorTabProps } from "./EditorFields";

export function EditorColors({ data, onPatch }: EditorTabProps) {
  function addColor(palette: "primary" | "secondary") {
    const newColor: Color = { name: "Nova Cor", hex: "#000000", rgb: "0, 0, 0", cmyk: "0, 0, 0, 100" };
    onPatch({ colors: { ...data.colors, [palette]: [...data.colors[palette], newColor] } });
  }

  return (
    <>
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h4 className="text-sm font-bold text-gray-700">Cores Primarias</h4>
          <button type="button" onClick={() => addColor("primary")} className="app-secondary-button px-3 py-1.5 text-xs">+ Adicionar</button>
        </div>
        <div className="space-y-3">
          {data.colors.primary.map((c, i) => (
            <ColorEditor
              key={i}
              color={c}
              onChange={(nc) => {
                const next = [...data.colors.primary];
                next[i] = nc;
                onPatch({ colors: { ...data.colors, primary: next } });
              }}
              onRemove={() => onPatch({ colors: { ...data.colors, primary: data.colors.primary.filter((_, j) => j !== i) } })}
            />
          ))}
        </div>
      </div>
      <div className="border-t border-slate-200/80 pt-4">
        <div className="mb-3 flex items-center justify-between">
          <h4 className="text-sm font-bold text-gray-700">Cores Secundarias</h4>
          <button type="button" onClick={() => addColor("secondary")} className="app-secondary-button px-3 py-1.5 text-xs">+ Adicionar</button>
        </div>
        <div className="space-y-3">
          {data.colors.secondary.map((c, i) => (
            <ColorEditor
              key={i}
              color={c}
              onChange={(nc) => {
                const next = [...data.colors.secondary];
                next[i] = nc;
                onPatch({ colors: { ...data.colors, secondary: next } });
              }}
              onRemove={() => onPatch({ colors: { ...data.colors, secondary: data.colors.secondary.filter((_, j) => j !== i) } })}
            />
          ))}
        </div>
      </div>
      {data.colors.semantic && (
        <div className="border-t border-slate-200/80 pt-4">
          <h4 className="mb-3 text-sm font-bold text-gray-700">Cores Semanticas</h4>
          <div className="space-y-3">
            {(["success", "error", "warning", "info"] as const).map((key) => (
              <div key={key}>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-gray-400">{key}</label>
                <ColorEditor
                  color={data.colors.semantic![key]}
                  onChange={(nc) => onPatch({ colors: { ...data.colors, semantic: { ...data.colors.semantic!, [key]: nc } } })}
                  onRemove={() => {}}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
