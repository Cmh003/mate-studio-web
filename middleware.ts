import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, panelEnabled, verifySessionToken } from "@/lib/session";

// Primera barrera del panel privado. Cada página y ruta vuelve a comprobar la sesión por su cuenta.
export const config = { matcher: ["/panel", "/panel/:path*", "/api/panel/:path*"] };

const PUBLIC = new Set(["/panel/login", "/api/panel/login"]);

function harden(res: NextResponse) {
  res.headers.set("Cache-Control", "no-store, max-age=0");
  res.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
  res.headers.set("X-Frame-Options", "DENY");
  res.headers.set("Referrer-Policy", "no-referrer");
  res.headers.set("X-Content-Type-Options", "nosniff");
  return res;
}

export async function middleware(req: NextRequest) {
  // Si el panel no está configurado, no existe: 404 para todo el mundo
  if (!panelEnabled()) return harden(new NextResponse("Not found", { status: 404 }));

  const { pathname } = req.nextUrl;
  const isApi = pathname.startsWith("/api/");

  // Peticiones que cambian algo: solo desde tu propia web (protección CSRF)
  if (req.method !== "GET" && req.method !== "HEAD") {
    const origin = req.headers.get("origin");
    let sameOrigin = false;
    try {
      sameOrigin = !!origin && new URL(origin).host === req.headers.get("host");
    } catch {
      sameOrigin = false;
    }
    if (!sameOrigin) return harden(NextResponse.json({ error: "Origen no permitido" }, { status: 403 }));
  }

  if (PUBLIC.has(pathname)) return harden(NextResponse.next());

  const ok = await verifySessionToken(req.cookies.get(SESSION_COOKIE)?.value);
  if (!ok) {
    if (isApi) return harden(NextResponse.json({ error: "No autorizado" }, { status: 401 }));
    return harden(NextResponse.redirect(new URL("/panel/login", req.url)));
  }
  return harden(NextResponse.next());
}
