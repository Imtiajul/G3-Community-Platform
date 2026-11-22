import { z } from "zod";

const envSchema = z.object({
  NEXT_PUBLIC_API_URL: z.string().url().default("http://localhost:8000/api/v1"),
  DJANGO_INTERNAL_API_URL: z.string().url().default("http://localhost:8000/api/v1"),
  NEXTJS_REVALIDATE_SECRET: z.string().min(1).default("dev-revalidation-secret-key-bangla-community-2026"),
  NEXT_PUBLIC_SITE_URL: z.string().url().default("http://localhost:3000"),
  NEXT_PUBLIC_GOOGLE_CLIENT_ID: z.string().optional(),
});

export const env = envSchema.parse({
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1",
  DJANGO_INTERNAL_API_URL: process.env.DJANGO_INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1",
  NEXTJS_REVALIDATE_SECRET: process.env.NEXTJS_REVALIDATE_SECRET || "dev-revalidation-secret-key-bangla-community-2026",
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  NEXT_PUBLIC_GOOGLE_CLIENT_ID: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
});
