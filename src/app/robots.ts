import type { MetadataRoute } from "next";

/**
 * This is a private kiosk + admin tool — keep it out of search engines so the
 * deployment URL is not easily discovered.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", disallow: "/" },
  };
}
