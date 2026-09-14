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
    // The brand logo is an SVG (public/brand/logo-midori.svg). next/image
    // blocks SVG sources by default (XSS risk from untrusted uploads); ours
    // is a trusted local asset we authored, so allow it — the CSP below still
    // stops any embedded script from executing if the file is ever opened
    // directly.
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
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
