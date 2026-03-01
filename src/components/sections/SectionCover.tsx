"use client";
import { BrandbookData } from "@/lib/types";

export function SectionCover({ data }: { data: BrandbookData }) {
  return (
    <section className="min-h-[80vh] flex flex-col justify-center items-center text-center page-break mb-16">
      <h1 className="text-6xl font-extrabold mb-4 tracking-tight">{data.brandName}</h1>
      <p className="text-xl text-gray-500 mb-12 uppercase tracking-[0.3em]">{data.industry}</p>
      <div className="w-full max-w-4xl bg-gray-100 rounded-2xl p-12 flex justify-center shadow-sm">
        <img src={data.logo.primary} alt={`${data.brandName} Logo`} className="max-h-64 object-contain" />
      </div>
      <p className="mt-8 text-sm text-gray-400 uppercase tracking-widest">Manual de Identidade Visual</p>
    </section>
  );
}
