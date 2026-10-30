import { requireAdminApi } from "@/lib/auth";
import { normalizeUrl, parsePsi, psiEndpoint, psiError, type PsiResponse } from "@/lib/audit";

export const runtime = "nodejs";
export const maxDuration = 120;

// Respaldo: análisis desde el servidor con tu clave de Google (PAGESPEED_API_KEY).
// Sin clave, el panel consulta a Google directamente desde tu navegador.
export async function POST(req: Request) {
  const denied = await requireAdminApi();
  if (denied) return denied;
  const key = process.env.PAGESPEED_API_KEY;
  if (!key) return Response.json({ error: "Sin PAGESPEED_API_KEY" }, { status: 501 });

  const body = (await req.json().catch(() => ({}))) as { url?: string };
  const target = normalizeUrl(body.url ?? "");
  if (!target) return Response.json({ error: "Escribe una dirección válida, por ejemplo https://minegocio.es" }, { status: 400 });

  try {
    const res = await fetch(psiEndpoint(target, key), { signal: AbortSignal.timeout(110_000), cache: "no-store" });
    const data = (await res.json().catch(() => null)) as PsiResponse | null;
    if (!res.ok || !data?.lighthouseResult) return Response.json({ error: psiError(res.status, data) }, { status: 502 });
    return Response.json(parsePsi(data, target));
  } catch {
    return Response.json({ error: "El análisis ha tardado demasiado. Vuelve a intentarlo." }, { status: 504 });
  }
}
