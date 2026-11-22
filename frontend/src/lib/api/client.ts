import createClient from "openapi-fetch";
import type { paths } from "./schema";
import { env } from "@/lib/env";

/**
 * Direct typed API client connecting to Django backend.
 * Used exclusively server-side.
 */
export const apiClient = createClient<paths>({
  baseUrl: env.DJANGO_INTERNAL_API_URL,
});
