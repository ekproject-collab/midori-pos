import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Wildcarded rather than derived from NEXT_PUBLIC_SUPABASE_URL so that
    // switching Supabase projects (dev/staging/prod) never requires a
    // next.config change or a dev-server restart to keep product images
    // loading — any *.supabase.co project's public storage URLs just work.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
