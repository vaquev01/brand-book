"use client";
import { BrandbookData } from "@/lib/types";

export function SectionTokensA11y({ data, num }: { data: BrandbookData; num: number }) {
  if (!data.designTokens || !data.accessibility) return null;

  return (
    <section className="page-break mb-10">
      <h2 className="text-xl md:text-2xl font-extrabold tracking-tight mb-4 border-b border-gray-100 pb-2">
        {String(num).padStart(2, "0")}. Design Tokens &amp; Acessibilidade
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h3 className="text-base font-bold mb-3">Acessibilidade (WCAG 2.2)</h3>
          <div className="space-y-4">
            <div className="bg-white p-4 rounded border-l-4 border-indigo-500 shadow-sm">
              <h4 className="font-bold text-sm text-indigo-900 mb-1">Contraste Rigoroso</h4>
              <p className="text-sm text-gray-700">{data.accessibility.contrastRules}</p>
            </div>
            <div className="bg-white p-4 rounded border-l-4 border-indigo-500 shadow-sm">
              <h4 className="font-bold text-sm text-indigo-900 mb-1">Navegação por Teclado (Focus)</h4>
              <p className="text-sm text-gray-700">{data.accessibility.focusStates}</p>
            </div>
            <div className="bg-white p-4 rounded border-l-4 border-indigo-500 shadow-sm">
              <h4 className="font-bold text-sm text-indigo-900 mb-1">Independência de Cor</h4>
              <p className="text-sm text-gray-700">{data.accessibility.colorIndependence}</p>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-base font-bold mb-3">Design Tokens</h3>
          <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm space-y-4">
            <div>
              <span className="text-blue-400 block mb-2">{"// Spacing Tokens"}</span>
              <ul className="space-y-1">
                {data.designTokens.spacing.map((t, i) => <li key={i}>{t}</li>)}
              </ul>
            </div>
            <div>
              <span className="text-blue-400 block mb-2">{"// Border Radius Tokens"}</span>
              <ul className="space-y-1">
                {data.designTokens.borderRadii.map((t, i) => <li key={i}>{t}</li>)}
              </ul>
            </div>
            {data.designTokens.shadows && data.designTokens.shadows.length > 0 && (
              <div>
                <span className="text-purple-400 block mb-2">{"// Shadow Tokens"}</span>
                <ul className="space-y-1">
                  {data.designTokens.shadows.map((t, i) => <li key={i}>{t}</li>)}
                </ul>
              </div>
            )}
            {data.designTokens.breakpoints && data.designTokens.breakpoints.length > 0 && (
              <div>
                <span className="text-green-400 block mb-2">{"// Breakpoints"}</span>
                <ul className="space-y-1">
                  {data.designTokens.breakpoints.map((t, i) => <li key={i}>{t}</li>)}
                </ul>
              </div>
            )}
            {data.designTokens.grid && (
              <div>
                <span className="text-yellow-400 block mb-2">{"// Grid System"}</span>
                <p className="text-gray-300">{data.designTokens.grid}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
