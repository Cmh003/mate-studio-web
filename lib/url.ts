import { site } from "./site";

// Dirección pública de la web. Prioridad:
// 1. NEXT_PUBLIC_SITE_URL (si la defines en Vercel)
// 2. La dirección de producción que da Vercel (mientras no tengas dominio propio)
// 3. site.url
export function baseUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  return site.url;
}
