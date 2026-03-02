"use client";

import { useRef } from "react";
import { UploadedAsset } from "@/lib/types";

interface Props {
  images: UploadedAsset[];
  onChange: (images: UploadedAsset[]) => void;
}

export function BriefingImageUpload({ images, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFiles(files: FileList | null) {
    if (!files) return;
    const newAssets: UploadedAsset[] = [];
    let processed = 0;
    const total = files.length;
    if (total === 0) return;

    Array.from(files).forEach((file) => {
      if (!file.type.startsWith("image/")) {
        processed++;
        if (processed === total && newAssets.length > 0) {
          onChange([...images, ...newAssets]);
        }
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        newAssets.push({
          id: `ref_${Date.now()}_${Math.random().toString(36).slice(2)}`,
          name: file.name,
          type: "reference",
          dataUrl,
          description: "",
        });
        processed++;
        if (processed === total) {
          onChange([...images, ...newAssets]);
        }
      };
      reader.readAsDataURL(file);
    });
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  }

  function handleRemove(id: string) {
    onChange(images.filter((img) => img.id !== id));
  }

  function handleDescriptionChange(id: string, description: string) {
    onChange(images.map((img) => (img.id === id ? { ...img, description } : img)));
  }

  return (
    <div className="space-y-3">
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => inputRef.current?.click()}
        className="border-2 border-dashed border-gray-300 rounded-lg p-5 text-center cursor-pointer hover:border-gray-500 hover:bg-gray-50 transition"
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <div className="text-2xl mb-1">🖼️</div>
        <p className="text-sm font-semibold text-gray-700">Arraste imagens ou clique para selecionar</p>
        <p className="text-xs text-gray-400 mt-1">
          Logos, moodboards, referências visuais, mascotes existentes — a IA irá analisá-las como referência
        </p>
      </div>

      {images.length > 0 && (
        <div className="space-y-2">
          {images.map((img) => (
            <div key={img.id} className="flex items-start gap-3 bg-gray-50 border rounded-lg p-3">
              <img
                src={img.dataUrl}
                alt={img.name}
                className="w-16 h-16 object-cover rounded-md border shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-700 truncate mb-1">{img.name}</p>
                <input
                  type="text"
                  value={img.description || ""}
                  onChange={(e) => handleDescriptionChange(img.id, e.target.value)}
                  placeholder="Descreva esta referência (ex: 'moodboard com tons terrosos', 'mascote existente')..."
                  className="w-full text-xs px-2 py-1.5 border rounded focus:ring-1 focus:ring-gray-800 outline-none"
                />
              </div>
              <button
                type="button"
                onClick={() => handleRemove(img.id)}
                className="text-gray-400 hover:text-red-500 transition text-lg leading-none shrink-0 mt-1"
                title="Remover"
              >
                ×
              </button>
            </div>
          ))}
          <p className="text-xs text-blue-600 bg-blue-50 border border-blue-100 rounded px-3 py-2">
            ✦ {images.length} imagem{images.length > 1 ? "ns" : ""} de referência será{images.length > 1 ? "ão" : ""} enviada{images.length > 1 ? "s" : ""} para a IA analisar e replicar ao longo do brandbook.
          </p>
        </div>
      )}
    </div>
  );
}
