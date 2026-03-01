"use client";
import { BrandbookData } from "@/lib/types";

export function SectionLogo({ data, num }: { data: BrandbookData; num: number }) {
  return (
    <section className="page-break mb-16">
      <h2 className="text-3xl font-bold mb-8 border-b pb-4">{String(num).padStart(2, "0")}. Identidade Visual UI-First</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        <div>
          <h3 className="text-lg font-semibold mb-4">Logo Secundário</h3>
          <div className="bg-gray-100 p-8 rounded-lg flex justify-center items-center h-64">
            <img src={data.logo.secondary} alt="Logo Secundário" className="max-h-full object-contain" />
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-4">Símbolo / Ícone</h3>
          <div className="bg-gray-100 p-8 rounded-lg flex justify-center items-center h-64">
            <img src={data.logo.symbol} alt="Símbolo" className="max-h-full object-contain" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
        <div className="bg-gray-50 p-6 rounded border">
          <h3 className="font-bold mb-2">Clear Space</h3>
          <p className="text-gray-600 text-sm">{data.logo.clearSpace}</p>
        </div>
        <div className="bg-gray-50 p-6 rounded border">
          <h3 className="font-bold mb-2">Tamanho Mínimo</h3>
          <p className="text-gray-600 text-sm">{data.logo.minimumSize}</p>
        </div>
        {data.logo.favicon && (
          <div className="bg-gray-50 p-6 rounded border">
            <h3 className="font-bold mb-2">Favicon / App Icon</h3>
            <p className="text-gray-600 text-sm">{data.logo.favicon}</p>
          </div>
        )}
      </div>

      <div className="bg-red-50 border border-red-100 p-6 rounded-lg">
        <h3 className="font-bold text-red-800 mb-4">Usos Incorretos</h3>
        <ul className="list-disc pl-5 text-red-700 space-y-1">
          {data.logo.incorrectUsages.map((u, i) => <li key={i}>{u}</li>)}
        </ul>
      </div>
    </section>
  );
}
