import { requireAdminApi } from "@/lib/auth";
import type { Metrics } from "@/lib/audit";

export const runtime = "nodejs";
export const maxDuration = 60;

type Audit = { score: number | null; numericValue?: number };
type Psi = {
  lighthouseResult?: {
    finalUrl?: string;
    categories?: Record<string, { score: number | null }>;
    audits?: Record<string, Audit>;
  };
  error?: { message?: string };
};

// Analiza una web con Google PageSpeed Insights (gratis; con PAGESPEED_API_KEY tienes más cupo)
export async function POST(req: Request) {
  const denied = await requireAdminApi();
  if (denied) return denied;

  const body = (await req.json().catch(() => ({}))) as { url?: string };
  let target: URL;
  try {
    target = new URL(/^https?:\/\//i.test(body.url ?? "") ? body.url! : `https://${body.url}`);
    if (!["http:", "https:"].includes(target.protocol) || !target.hostname.includes(".")) throw new Error();
  } catch {
    return Response.json({ error: "Escribe una dirección válida, por ejemplo https://minegocio.es" }, { status: 400 });
  }

  const api = new URL("https://www.googleapis.com/pagespeedonline/v5/runPagespeed");
  api.searchParams.set("url", target.toString());
  api.searchParams.set("strategy", "mobile");
  api.searchParams.set("locale", "es");
  for (const c of ["performance", "seo", "accessibility", "best-practices"]) api.searchParams.append("category", c);
  if (process.env.PAGESPEED_API_KEY) api.searchParams.set("key", process.env.PAGESPEED_API_KEY);

  let data: Psi;
  try {
    const res = await fetch(api, { signal: AbortSignal.timeout(55_000), cache: "no-store" });
    data = (await res.json()) as Psi;
    if (!res.ok) {
      const quota = res.status === 429;
      return Response.json({ error: quota ? "Google ha limitado las consultas. Añade PAGESPEED_API_KEY o prueba en un rato." : "Google no ha podido analizar esa web. ¿Está online?" }, { status: 502 });
    }
  } catch {
    return Response.json({ error: "El análisis ha tardado demasiado. Vuelve a intentarlo." }, { status: 504 });
  }

  const lh = data.lighthouseResult;
  const cat = (k: string) => {
    const s = lh?.categories?.[k]?.score;
    return typeof s === "number" ? Math.round(s * 100) : null;
  };
  const pass = (k: string) => {
    const s = lh?.audits?.[k]?.score;
    return typeof s === "number" ? s >= 0.9 : undefined;
  };
  const lcpMs = lh?.audits?.["largest-contentful-paint"]?.numericValue;

  const metrics: Metrics = {
    performance: cat("performance"),
    seo: cat("seo"),
    accessibility: cat("accessibility"),
    bestPractices: cat("best-practices"),
    lcp: typeof lcpMs === "number" ? Math.round(lcpMs / 100) / 10 : null,
  };
  const finalUrl = lh?.finalUrl ?? target.toString();
  const checks = {
    https: finalUrl.startsWith("https://") && pass("is-on-https") !== false,
    viewport: pass("viewport"),
    title: pass("document-title"),
    meta: pass("meta-description"),
  };
  return Response.json({ metrics, checks, finalUrl });
}
