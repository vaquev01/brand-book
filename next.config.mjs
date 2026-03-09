/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "oaidalleapiprodscus.blob.core.windows.net" },
      { protocol: "https", hostname: "*.openai.com" },
      { protocol: "https", hostname: "ideogram.ai" },
      { protocol: "https", hostname: "*.ideogram.ai" },
      { protocol: "https", hostname: "placehold.co" },
      { protocol: "https", hostname: "images.stability.ai" },
      // Cloudflare R2 / custom CDN asset domains
      { protocol: "https", hostname: "*.r2.dev" },
      { protocol: "https", hostname: "*.cloudflarestorage.com" },
      // Allow any custom STORAGE_PUBLIC_URL hostname (set via env)
      ...(process.env.STORAGE_PUBLIC_URL
        ? [{ protocol: "https", hostname: new URL(process.env.STORAGE_PUBLIC_URL).hostname }]
        : []),
    ],
    dangerouslyAllowSVG: true,
  },
};

export default nextConfig;
