import { MetadataRoute } from "next";
import { env } from "@/lib/env";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = env.NEXT_PUBLIC_SITE_URL || "https://nijerbolarmotogolpo.com";

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/sessions", "/sessions/*"],
        disallow: ["/api/*", "/admin/*", "/feed", "/saved", "/my-notes", "/profile"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
