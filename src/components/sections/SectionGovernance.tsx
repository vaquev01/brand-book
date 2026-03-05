"use client";
import { BrandbookData } from "@/lib/types";

export function SectionGovernance({ data, num }: { data: BrandbookData; num: number }) {
  if (!data.governance) return null;

  const g = data.governance;

  const items: { label: string; value: string; icon: string; color: string }[] = [
    { label: "Ferramentas de Design", value: g.designTools, icon: "Fg", color: "bg-blue-100 text-blue-700" },
    { label: "Documentação", value: g.documentationPlatform, icon: "Dc", color: "bg-green-100 text-green-700" },
    { label: "Biblioteca de Componentes", value: g.componentLibrary, icon: "Sb", color: "bg-purple-100 text-purple-700" },
    { label: "Versionamento", value: g.versioningStrategy, icon: "Vs", color: "bg-orange-100 text-orange-700" },
    { label: "Processo de Atualização", value: g.updateProcess, icon: "Up", color: "bg-pink-100 text-pink-700" },
    { label: "Ownership & Papéis", value: g.ownershipRoles, icon: "Ow", color: "bg-indigo-100 text-indigo-700" },
  ];

  return (
    <section className="page-break mb-6">
      <h2 className="text-xl md:text-2xl font-extrabold tracking-tight mb-4 border-b border-gray-100 pb-2">
        {String(num).padStart(2, "0")}. Governança do Design System
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-start">
        {items.map((item, i) => (
          <div key={i} className="bg-white border rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2.5 mb-3">
              <span className={`w-8 h-8 ${item.color} rounded-lg flex items-center justify-center text-xs font-extrabold`}>
                {item.icon}
              </span>
              <h3 className="text-sm font-bold text-gray-900">{item.label}</h3>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed">{item.value}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
