export async function blobToDataUrl(blob: Blob): Promise<string> {
  return await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Falha ao ler arquivo"));
    reader.readAsDataURL(blob);
  });
}

export async function rasterFileToOptimizedDataUrl(
  file: File,
  maxSide: number,
  mimeType: string,
  quality: number
): Promise<string> {
  const objectUrl = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.decoding = "async";
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error("Falha ao carregar imagem"));
      el.src = objectUrl;
    });

    const maxDim = Math.max(img.naturalWidth || 1, img.naturalHeight || 1);
    const scale = Math.min(1, maxSide / maxDim);
    const width = Math.max(1, Math.round((img.naturalWidth || 1) * scale));
    const height = Math.max(1, Math.round((img.naturalHeight || 1) * scale));

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return await blobToDataUrl(file);
    ctx.drawImage(img, 0, 0, width, height);

    const outBlob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Falha ao converter imagem"))), mimeType, quality);
    });

    return await blobToDataUrl(outBlob);
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}
