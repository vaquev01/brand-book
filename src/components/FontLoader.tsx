"use client";

import { useEffect } from "react";
import type { BrandbookData } from "@/lib/types";

interface Props {
  data: BrandbookData;
}

function toGoogleFontParam(name: string): string {
  return name.trim().replace(/\s+/g, "+");
}

export function FontLoader({ data }: Props) {
  useEffect(() => {
    const names = new Set<string>();
    if (data.typography?.marketing?.name) names.add(data.typography.marketing.name);
    if (data.typography?.ui?.name) names.add(data.typography.ui.name);
    if (data.typography?.monospace?.name) names.add(data.typography.monospace.name);
    if (data.typography?.primary?.name) names.add(data.typography.primary.name);
    if (data.typography?.secondary?.name) names.add(data.typography.secondary.name);

    if (names.size === 0) return;

    const families = Array.from(names)
      .map((n) => `family=${toGoogleFontParam(n)}:wght@100;200;300;400;500;600;700;800;900`)
      .join("&");

    const id = "bb-google-fonts";
    const href = `https://fonts.googleapis.com/css2?${families}&display=swap`;
    let link = document.getElementById(id) as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement("link");
      link.id = id;
      link.rel = "stylesheet";
      document.head.appendChild(link);
    }
    link.href = href;
  }, [data]);

  return null;
}
