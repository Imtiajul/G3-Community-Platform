import { MetadataRoute } from "next";
import { env } from "@/lib/env";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = env.NEXT_PUBLIC_SITE_URL || "https://nijerbolarmotogolpo.com";

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/sessions`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/register`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
  ];

  try {
    const res = await fetch(`${env.DJANGO_INTERNAL_API_URL}/public/sitemap/`, {
      next: { revalidate: 3600 },
    });

    if (res.ok) {
      const sessions = await res.json();
      const dynamicRoutes = (sessions || []).map((item: any) => ({
        url: `${baseUrl}/sessions/${item.slug}`,
        lastModified: item.updated_at ? new Date(item.updated_at) : new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.8,
      }));

      return [...staticRoutes, ...dynamicRoutes];
    }
  } catch {
    // If backend offline, return static routes
  }

  return staticRoutes;
}
