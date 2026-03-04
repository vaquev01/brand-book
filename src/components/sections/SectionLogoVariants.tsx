"use client";
import { BrandbookData } from "@/lib/types";

export function SectionLogoVariants({ data, num }: { data: BrandbookData; num: number }) {
  if (!data.logoVariants) return null;

  const variants: { label: string; url?: string }[] = [
    { label: "Horizontal", url: data.logoVariants.horizontal },
    { label: "Stacked (Vertical)", url: data.logoVariants.stacked },
    { label: "Monocromático", url: data.logoVariants.mono },
    { label: "Negativo", url: data.logoVariants.negative },
    { label: "Símbolo (Mark Only)", url: data.logoVariants.markOnly },
    { label: "Wordmark Only", url: data.logoVariants.wordmarkOnly },
  ].filter((v) => !!v.url);

  if (variants.length === 0) return null;

  return (
    <section className="page-break mb-16">
      <h2 className="text-3xl font-bold mb-8 border-b pb-4">{String(num).padStart(2, "0")}. Variações de Logo</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {variants.map((v, i) => (
          <div key={i} className="bg-white border rounded-xl overflow-hidden shadow-sm">
            <div className="px-5 py-4 bg-gray-50 border-b">
              <h3 className="font-bold">{v.label}</h3>
            </div>
            <div className="bg-gray-100 p-8 flex items-center justify-center h-64">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={v.url!} alt={v.label} className="max-h-full object-contain" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
