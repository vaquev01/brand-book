import type { UploadedAsset } from "@/lib/types";
import { rasterFileToOptimizedDataUrl } from "@/lib/imageDataUrl";

const MAX_LOGO_FILE_SIZE = 12 * 1024 * 1024;
const MAX_LOGO_DATA_URL_CHARS = 3_500_000;

export type LogoUploadResult =
  | { error: string; logoImage?: undefined }
  | { error?: undefined; logoImage: UploadedAsset };

export async function prepareLogoUpload(file: File): Promise<LogoUploadResult> {
  if (!file.type.startsWith("image/")) {
    return { error: "Envie um arquivo de imagem (PNG, SVG, JPG, etc)." };
  }

  if (file.size > MAX_LOGO_FILE_SIZE) {
    return { error: "Arquivo muito grande. Tente um logo menor (máx. 12MB)." };
  }

  try {
    const isSvg = file.type === "image/svg+xml" || file.name.toLowerCase().endsWith(".svg");
    const dataUrl = isSvg
      ? await rasterFileToOptimizedDataUrl(file, 1024, "image/png", 0.92)
      : await rasterFileToOptimizedDataUrl(file, 1024, "image/webp", 0.9);

    if (dataUrl.length > MAX_LOGO_DATA_URL_CHARS) {
      return { error: "Logo muito pesado para enviar. Tente uma versão menor ou em PNG/SVG simplificado." };
    }

    return {
      logoImage: {
        id: `logo-${Date.now()}`,
        name: file.name,
        dataUrl,
        type: "logo",
      },
    };
  } catch {
    return { error: "Falha ao processar o logo. Tente PNG/JPG." };
  }
}
