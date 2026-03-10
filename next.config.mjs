// Ensure AUTH_TRUST_HOST is set at build time for NextAuth middleware
process.env.AUTH_TRUST_HOST = "true";

/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_BUILD_TIMESTAMP: new Date().toISOString(),
  },
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
